/*-
 */

#include <sys/param.h>

#include <pwd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <unistd.h>
#include <sys/wait.h>
#include <libgen.h>
#include <sys/stat.h>
#include <errno.h>

#include <string>
#include <vector>
#include <sstream>
#include <iostream>
#include <algorithm>
#include <chrono>
#include <iomanip>

#include "boost/filesystem/operations.hpp"
#include "boost/filesystem/path.hpp"
#include <boost/optional.hpp>
#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_io.hpp>
#include <boost/uuid/random_generator.hpp>

#include <boost/algorithm/string.hpp>
#include <boost/algorithm/string/split.hpp>

#include <boost/bind/bind.hpp>

namespace fs = boost::filesystem;

#include <easylogging++.h>

#include "pem.hpp"

#ifdef OFF
#define PAM_DEBUG
#ifdef PAM_DEBUG
#ifndef __APPLE_CC__
#define _PAM_LOGFILE "/run/pam-debug.log"
#include <security/_pam_macros.h>
#else
#  define D(x) do {                                                     \
    LOG(DEBUG) << "debug: " << __FILE__ << ":" << __LINE__ << " (" << __FUNCTION__ << "): " << x; \
  } while (0)
#endif
#endif
#endif

#ifndef __APPLE_CC__
#include <security/pam_modutil.h>
#include <security/pam_ext.h>
#endif
#include <security/pam_appl.h>
#include <security/pam_modules.h>


static std::string trim(const std::string &str,
                 const std::string &whitespace = " \t") {
  const auto strBegin = str.find_first_not_of(whitespace);
  if (strBegin == std::string::npos)
    return ""; // no content

  const auto strEnd = str.find_last_not_of(whitespace);
  const auto strRange = strEnd - strBegin + 1;

  return str.substr(strBegin, strRange);
}

std::string substPattern(const char *, const char *val, const std::string &str) {
  // boost::regex_replace(out, s.begin(), s.end(),
  //     e1, format_string, boost::match_default | boost::format_all);
  std::stringstream s2;
  s2 << val;
  s2 << "/";
  s2 << str;
  return s2.str();
}

std::string DirName(std::string source) {
    source.erase(std::find(source.rbegin(), source.rend(), '/').base(), source.end());
    return source;
}


// #include "pem_ssh.hpp"
#include "optional_password.hpp"
#include "system_cmd.hpp"
#include "run_as.hpp"
#include "matcher.hpp"
#include "ssh_authorized_keys.hpp"
#include "gpg_agent_conf.hpp"
#include "gpg_card_status.hpp"
#include "gpg_list_secret_keys.hpp"
#include "gpg_keyinfo_list.hpp"
#include "pin_entry_dispatcher.hpp"

#ifdef __APPLE_CC__
#define GPG_CONNECT_AGENT "/usr/local/bin/gpg-connect-agent"
#define GPG "/usr/local/bin/gpg2"
#define GPGSM "/usr/local/bin/gpgsm"
#else
#define GPG_CONNECT_AGENT "/usr/bin/gpg-connect-agent"
#define GPG "/usr/bin/gpg2"
#define GPGSM "/usr/bin/gpgsm"
#endif


class Config {
private:
  std::vector<BaseMatcher*> matchers;
public:
  Matcher<std::string> ssh_authorized_keys_fname;
  Matcher<std::string> password_prompt;
  Matcher<std::string> gpg_connect_agent;
  Matcher<std::string> gpg;
  Matcher<std::string> gpgsm;
  Matcher<std::string> gpg_agent_conf;
  Matcher<std::string> gpg_conf;
  Matcher<std::string> pgrep;
  Matcher<std::string> pkill;
  Matcher<std::string> pinentry_dispatcher;
  Matcher<std::string> pinentry_os_default;
  Matcher<std::string> logfile;
  Matcher<bool> reset_gpg_agent;
  Matcher<bool> try_first_pass;
  Matcher<bool> use_first_pass;
  Matcher<bool> ask_for_password;
  Matcher<bool> debug;
  Matcher<size_t> retries;

//   try_first_pass
// Before prompting the user for their password, the module first tries
// the previous stacked module's password in case that satisfies this
// module as well.
// use_first_pass
// The argument use_first_pass forces the module to use a previous stacked
// modules password and will never prompt the user - if no password is
// available or the password is not appropriate, the user will be
//  denied access.


  Config() :
    ssh_authorized_keys_fname("ssh_authorized_keys_fname=", ".ssh/authorized_keys", matchers),
    password_prompt("password_prompt=", "pincode: ", matchers),
    gpg_connect_agent("gpg_connect_agent=", GPG_CONNECT_AGENT, matchers),
    gpg("gpg=", GPG, matchers),
    gpgsm("gpgsm=", GPGSM, matchers),
    gpg_agent_conf("gpg_agent_conf=", ".gnupg/gpg-agent.conf", matchers),
    gpg_conf("gpg_conf=", ".gnupg/gpg.conf", matchers),
    pgrep("pgrep=", "/usr/bin/pgrep", matchers),
    pkill("pkill=", "/usr/bin/pkill", matchers),
    pinentry_dispatcher("pinentry_dispatcher=", ".gnupg/pinentry_dispatcher.sh", matchers),
    pinentry_os_default("pinentry_os_default", "/usr/local/MacGPG2/libexec/pinentry-mac.app/Contents/MacOS/pinentry-mac", matchers),
    logfile("logfile", ".gnupg/pam_clavator.log", matchers),
    reset_gpg_agent("reset_gpg_agent", false, matchers),
    try_first_pass("try_first_pass", false, matchers),
    use_first_pass("use_first_pass", false, matchers),
    ask_for_password("ask_for_password", false, matchers),
    debug("debug", false, matchers),
    retries("retries", 3, matchers) {
 }

  void parse_cfg(int, int argc, const char **argv) {
    for (int i = 0; i < argc; ++i) {
      for (auto &matcher : matchers) {
        if (matcher->match(argv[i])) {
          break;
        }
      }
    }
    if (debug.value) {
      for (auto &matcher : matchers) {
          matcher->dump();
      }
    }
  }
};


class RetryActor {
private:
  static bool _action(RetryActor *ra, const SystemResult &sr,
      const PamClavator::SystemCmd &sc);
public:
  pam_handle_t *pamh;
  struct passwd *pwd;
  const Config &cfg;
  OptionalPassword &op;

  RetryActor(pam_handle_t *pamh, struct passwd *pwd,
       const Config &cfg, OptionalPassword &op) :
       pamh(pamh), pwd(pwd), cfg(cfg), op(op) {}

  PamClavator::SystemCmd::RetryAction get() {
    return boost::bind(&RetryActor::_action, this, _1, _2);
  }

};

int create_gnupg_dir(pam_handle_t *pamh, const struct passwd *pwd, const Config &cfg, OptionalPassword &op) {
  auto gpgConfFile = substPattern("HOMEDIR", pwd->pw_dir, cfg.gpg_conf.value);
  fs::path dotGnupgDir(fs::path(gpgConfFile.c_str()).remove_filename());
  if (!fs::is_directory(dotGnupgDir)) {
     PamClavator::SystemCmd mkdir_p(pwd, "/bin/mkdir");
    mkdir_p.arg("-p");
    mkdir_p.arg("--mode=0700");
    mkdir_p.arg(dotGnupgDir.c_str());
    auto res = mkdir_p.run(pamh, op);
    if (res.exitCode) {
      LOG(ERROR) << res.asString();
      return PAM_AUTH_ERR;
    }
  }
  return PAM_SUCCESS;
}

int setup_gpgagent_conf(pam_handle_t *pamh, const struct passwd *pwd, const Config &cfg) {
   PamClavator::RunAs::run(pamh, pwd, [pwd, cfg]() {
    auto gpgAgentConfFname = substPattern("HOMEDIR", pwd->pw_dir, cfg.gpg_agent_conf.value);
    auto gpgAgentConf = GpgAgentConf::read(gpgAgentConfFname.c_str());
    gpgAgentConf.updateLine(GpgAgentConf::Line("enable-ssh-support", ""));
    auto pinentryDispatcher = substPattern("HOMEDIR", pwd->pw_dir, cfg.pinentry_dispatcher.value);
    // D((pinentry_dispatcher.c_str()));
    auto prev = gpgAgentConf.getByKey("pinentry-program");
    std::string prevPinentryDispatcher(cfg.pinentry_os_default.value);
    if (!prev.empty()) {
      prevPinentryDispatcher = prev.back()->getValue();
    }
    auto pinentryPrograms = gpgAgentConf.updateLine(GpgAgentConf::Line("pinentry-program", pinentryDispatcher));
    {
      std::stringstream s2;
      s2 << "pinentryPrograms:" << pinentryPrograms.empty()
        << ":"  << pinentryPrograms.size();
      if (!pinentryPrograms.empty()) {
        s2 << ":" << pinentryPrograms.back()->getValue();
        s2 << ":" << pinentryDispatcher;
        s2 << ":" << prevPinentryDispatcher;
      }
      LOG(INFO) << s2.str();
    }
    if (!pinentryPrograms.empty() && pinentryPrograms.back()->getValue() != prevPinentryDispatcher) {
      //pinentry-program /usr/local/MacGPG2/libexec/pinentry-mac.app/Contents/MacOS/pinentry-mac
      std::stringstream s2;
      s2 << "pinentry-program update:" << prevPinentryDispatcher << "!=" << pinentryDispatcher;
      LOG(INFO) << s2.str();
      PinEntryDispatcher::write(pinentryDispatcher, prevPinentryDispatcher);
    }
    gpgAgentConf.write();
    return 0;
  });
  return PAM_SUCCESS;
}

bool force_kill(RetryActor &ra, const char *name) {
  LOG(INFO) << "forced kill of " << name;
  std::stringstream uidArg;
  uidArg << "-" << ra.pwd->pw_uid;
  auto signals = { SIGTERM, SIGKILL };
  for (auto sig : signals) {
    PamClavator::SystemCmd pkill(ra.pwd, ra.cfg.pkill.value);
    std::stringstream sigArg;
    sigArg << "-" << sig;
    pkill.arg(sigArg.str()).arg("-U").arg(uidArg.str());
    pkill.arg(name);
    auto sr = pkill.run(ra.pamh, ra.op);
    if (!sr.ok) {
      LOG(ERROR) << "force_kill:failed:" << sr.asString();
      return false;
    }
  }
  // PamClavator::SystemCmd pgrep(ra.pwd, ra.cfg.pgrep.value);
  // pgrep.arg(name);
  // auto sr = pgrep.run(ra.pamh, ra.op);
  // if (sr.exitCode) {
  //   LOG(ERROR) << sr.asString();
  //   return false;
  // }
  // std::string line;
  // bool fail = false;
  // while (std::getline(sr.getSout(), line)) {
  //   char *end = 0;
  //   pid_t pid = strtoul(line.c_str(), &end, 10);
  //   // why 1 of course nobody wants to kill init
  //   if (pid <= 1) { continue; }
  //   kill(pid, SIGTERM);
  //   int err = kill(pid, SIGKILL);
  //   if (err != ESRCH) {
  //     err = kill(pid, SIGKILL);
  //     if (err != ESRCH) {
  //       LOG(ERROR) << "failed to kill:" << pid << ":" << err;
  //       fail = true;
  //     }
  //   }
  // }
  // if (fail) {
  //     LOG(ERROR) << "kill of pid:" << pid << " failed!";
  //     return false;
  // }
  return true;
}

boost::optional<int> gpgagent_start(RetryActor &ra, bool force = false) {
  if (!force && !ra.cfg.reset_gpg_agent.value) {
    return boost::none;
  }
  if (force && !force_kill(ra, "gpg-agent")) {
      return PAM_AUTH_ERR;
  }

  // gpg-connect-agent "SCD RESET" /bye
  // KILL running
  PamClavator::SystemCmd kill_gpg_connect_agent(ra.pwd, ra.cfg.gpg_connect_agent.value);
  kill_gpg_connect_agent.arg("--no-autostart");
  kill_gpg_connect_agent.arg("KILLAGENT");
  kill_gpg_connect_agent.arg("/bye");
  if (!force) {
    kill_gpg_connect_agent.checkRetry(ra.get());
  }
  auto res = kill_gpg_connect_agent.run(ra.pamh, ra.op);
  if (res.exitCode) {
    LOG(ERROR) << res.asString();
    return PAM_AUTH_ERR;
  }
  PamClavator::SystemCmd start_gpg_connect_agent(ra.pwd, ra.cfg.gpg_connect_agent.value);
  start_gpg_connect_agent.arg("/subst");
  start_gpg_connect_agent.arg("/serverpid");
  start_gpg_connect_agent.arg("/let serverpid ${get serverpid}");
  start_gpg_connect_agent.arg("/echo $serverpid");
  start_gpg_connect_agent.arg("/bye");
  if (!force) {
    start_gpg_connect_agent.checkRetry(ra.get());
  }
  res = start_gpg_connect_agent.run(ra.pamh, ra.op);
  if (res.exitCode) {
    LOG(ERROR) << res.asString();
    return PAM_AUTH_ERR;
  }
  LOG(DEBUG) << "reset_gpg_agent done";
  return PAM_SUCCESS;
}

bool RetryActor::_action(RetryActor *ra, const SystemResult &sr, const PamClavator::SystemCmd &) {
  if (sr.exitCode) {
    auto ret = gpgagent_start(*ra, true);
    if (ret != boost::none && *ret != PAM_SUCCESS) {
      return false;
    }
    return true;
  }
  return false;
}

// gpg2 --card-status --with-colon
// check does we have one card!
// extract fpr' use third fpr
// gpg2 --list-secret-keys --with-colon
// find keys from extracted fpr's
boost::optional<std::string> check_does_we_have_a_card(RetryActor &ra) {
  PamClavator::SystemCmd gpg2cardStatusCmd(ra.pwd, ra.cfg.gpg.value);
  gpg2cardStatusCmd.arg("--card-status");
  gpg2cardStatusCmd.arg("--with-colon");
  gpg2cardStatusCmd.checkRetry(ra.get());
  auto sr = gpg2cardStatusCmd.run(ra.pamh, ra.op);
  if (sr.exitCode) {
    LOG(ERROR) << sr.asString();
    return boost::none;
  }
  auto gpg2cardStatus = Gpg2CardStatus::read(sr.getSout());

  PamClavator::SystemCmd gpgConnectAgent(ra.pwd, ra.cfg.gpg_connect_agent.value);
  gpgConnectAgent.arg("keyinfo --list");
  gpgConnectAgent.arg("/bye");
  gpgConnectAgent.checkRetry(ra.get());
  sr = gpgConnectAgent.run(ra.pamh, ra.op);
  if (sr.exitCode) {
    LOG(ERROR) << sr.asString();
    return boost::none;
  }
  auto gpgKeyInfoList = GpgKeyInfo::read(sr.getSout());
  for (auto ki : gpgKeyInfoList) {
    if (ki.keyId != "OPENPGP.3") { continue; }
    for (auto cs : gpg2cardStatus) {
       if (cs.reader.cardid == ki.cardid) {
         return ki.group;
       }
    }
    LOG(ERROR) << "no card found for Group[" << ki.group << "]";
  }
  return boost::none;
}

std::string date_yyyy_mm_dd(std::chrono::time_point<std::chrono::system_clock> now) {
  auto time = std::chrono::system_clock::to_time_t(now);
  auto ltime = std::localtime(&time);
#if __GNUC__ <= 4 && !defined(__clang__)
  char buffer [80];
  strftime(buffer,sizeof(buffer),"%Y-%m-%d",ltime);
  return std::string(buffer);
#else
  std::stringstream s2;
  s2 << std::put_time(ltime, "%Y-%m-%d");
  return s2.str();
#endif
}

/*
  gpgsm -a --batch --gen-key <<EOF
  Key-Type: RSA
  Key-Length: 1024
  Key-Grip: C083EC516CCEEFE80403CCA7CC3782A017C99142
  Key-Usage: sign
  Name-DN: CN=ssh-auth
  Not-Before: 2011-11-11
  Not-After: 2106-02-06
  Subject-Key-Id: C083EC516CCEEFE80403CCA7CC3782A017C99142
  Extension: 2.5.29.19 c 30060101ff020101
  Extension: 1.3.6.1.4.1.11591.2.2.2 n 0101ff
  Signing-Key: C083EC516CCEEFE80403CCA7CC3782A017C99142
  %commit
  EOF
  gpgsm --import < pem
  gpgsm --delete-key CN=xxxx
  compare pubkeys pem und ssh
  gpgsm --verify unknown how this works
  gpgsm --import --dry-run
*/
boost::optional<Pem> create_cert_from_card(RetryActor &ra,
  const std::string& grp, const std::string &uuid) {
  PamClavator::SystemCmd gpgsmGenkey(ra.pwd, ra.cfg.gpgsm.value);
  auto now = std::chrono::system_clock::now();
  if (ra.op.some()) {
    LOG(DEBUG) << "create_cert_from_card: use predefined password";
    auto opwdPipe = Pipe::create();
    if (opwdPipe == boost::none) {
      LOG(ERROR) << "can't create password passing pipe";
      return boost::none;
    }
    auto &pwdPipe = *opwdPipe;
    gpgsmGenkey.toChildPipe(pwdPipe, pwdPipe->getWriteFd(), [&ra](size_t ofs, const void **buf) {
      if (ofs >= ra.op.getLen()) {
        return 0ul;
      }
      *buf = static_cast<const void *>(ra.op.getValue() + ofs);
      return ra.op.getLen() - ofs;
    });
    gpgsmGenkey.arg("--no-tty").arg("--batch");
    gpgsmGenkey.arg("--pinentry-mode").arg("loopback");
    gpgsmGenkey.arg("--passphrase-fd").arg(pwdPipe->getReadFd()->asString());
  }
  gpgsmGenkey.arg("-a").arg("--batch").arg("--gen-key");
  gpgsmGenkey
    .pushSin("Key-Type: RSA\n")
    .pushSin("Key-Length: 1024\n")
    .pushSin("Key-Grip: ").pushSin(grp).pushSin("\n")
    .pushSin("Key-Usage: sign\n")
    .pushSin("Serial: ").pushSin(uuid).pushSin("\n")
    .pushSin("Name-DN: CN=").pushSin(uuid).pushSin("\n")
    .pushSin("Not-Before: ").pushSin(date_yyyy_mm_dd(now)).pushSin("\n")
    .pushSin("Not-After: ").pushSin(date_yyyy_mm_dd(now + std::chrono::hours(24))).pushSin("\n")
  //  .pushSin("Subject-Key-Id: ").pushSin(grp).pushSin("\n")
  //  .pushSin("Extension: 2.5.29.19 c 30060101ff020101\n")
  //  .pushSin("Extension: 1.3.6.1.4.1.11591.2.2.2 n 0101ff\n")
  //  .pushSin("Signing-Key: ").pushSin(grp).pushSin("\n")
    .pushSin("%commit\n");
  gpgsmGenkey.checkRetry(ra.get());
  auto sr = gpgsmGenkey.run(ra.pamh, ra.op);
  if (sr.exitCode) {
    LOG(ERROR) << "GENKEY[" << sr.asString() << "][" << sr.getSout().str() <<
      "][" << sr.getSerr().str() << "]";
    return  boost::none;
  }
  //LOG(DEBUG) << "GENKEY[" << sr.getSout().str() << "][" << sr.getSerr().str() << "]";
  PamClavator::SystemCmd gpgsmImport(ra.pwd, ra.cfg.gpgsm.value);
  gpgsmImport.arg("--import").arg("--dry-run").pushSin(sr.getSout().str());
  auto srImport = gpgsmImport.run(ra.pamh, ra.op);
  if (srImport.exitCode) {
    LOG(ERROR) << srImport.asString();
    return  boost::none;
  }
  auto pem = Pem::read(sr.getSout());
  if (pem.size() != 1) {
    LOG(ERROR) << "no valid pem found";
    return boost::none;
  }
  return pem[0];
}


std::string create_challenge() {
  boost::uuids::random_generator gen;
  auto challenge = boost::uuids::to_string(gen());
  std::vector<std::string> strs;
  boost::split(strs, challenge, boost::is_any_of("-"));
  return boost::algorithm::join(strs, "");
}

boost::optional<int> ask_for_password(pam_handle_t *pamh, const Config &, OptionalPassword &password) {
  // if (!cfg.ask_for_password.value) {
  //   LOG(DEBUG) << "ask_for_password is not set";
  //   return boost::none;
  // }
  /* get password */
  const char *pass;
  int pam_err = pam_get_authtok(pamh, PAM_AUTHTOK, &pass, "Enter PIN:");
  if (pam_err != PAM_SUCCESS || pass == NULL || *pass == 0) {
    LOG(ERROR) << "ask_for_password:pam_get_item PAM_CONV";
    return pam_err;
  }
  LOG(DEBUG) << "got password from ask_for_password";
  password.own((char *)pass, false);
  //
  //
  // struct pam_conv *conv;
  // auto pam_err = pam_get_item(pamh, PAM_CONV, (const void **)&conv);
  // if (pam_err != PAM_SUCCESS) {
  //   LOG(ERROR) << "ask_for_password:pam_get_item PAM_CONV";
  //   return pam_err;
  // }
  // struct pam_message msg;
  // msg.msg_style = PAM_PROMPT_ECHO_OFF;
  // msg.msg = (char *)cfg.password_prompt.value.c_str();
  // const struct pam_message *msgp = &msg;
  //
  // struct pam_response *resp = NULL;
  // pam_err = (*conv->conv)(1, &msgp, &resp, conv->appdata_ptr);
  // if (pam_err != PAM_SUCCESS) {
  //   LOG(ERROR) << "ask_for_password:conf failed with:" << pam_err;
  //   return pam_err;
  // }
  // if (resp != NULL) {
  //   LOG(DEBUG) << "got password from ask_for_password";
  //   password.own(resp->resp);
  //   free(resp);
  // }
  return pam_err;
}

boost::optional<int> get_authtok(pam_handle_t *pamh, const Config &, OptionalPassword &password) {
  char *tmp = 0;
  auto retval = pam_get_item(pamh, PAM_AUTHTOK, (const void **)&tmp);
  if (retval != PAM_SUCCESS) {
    LOG(ERROR) << "get password returned error: " << pam_strerror (pamh, retval) << " settings";
  } else {
    if (tmp != 0) {
      LOG(DEBUG) << "use password from PAM_AUTHTOK(!free)";
      password.own(tmp, false);
    } else {
      LOG(DEBUG) << "don't got a PAM_AUTHTOK(!free)";
    }
  }
  return retval;
}


INITIALIZE_EASYLOGGINGPP

extern "C" {


PAM_EXTERN int pam_sm_authenticate(pam_handle_t *pamh, int flags, int argc,
                                   const char *argv[]) {
  const char *user;
  int pam_err;
  Config cfg;
  OptionalPassword password;

  cfg.parse_cfg(flags, argc, argv);

  /* identify user */
  pam_err = pam_get_user(pamh, &user, 0);
  if (pam_err != PAM_SUCCESS || user == 0) {
    LOG(ERROR) << "pam_sm_authenticate:pam_get_user";
    return (pam_err);
  }

  struct passwd pw_s;
  struct passwd *pwd;
  char buffer[1024];
  pam_err = getpwnam_r(user, &pw_s, buffer, sizeof(buffer), &pwd);
  if (pam_err != 0 || pwd == 0 || pwd->pw_dir == 0 || pwd->pw_dir[0] != '/') {
    LOG(ERROR) << "pam_sm_authenticate:getpwname:" << strerror(errno);
    return (PAM_USER_UNKNOWN);
  }
  el::Configurations defaultConf;
  defaultConf.setToDefault();
  defaultConf.setGlobally(el::ConfigurationType::ToStandardOutput, "false");
  defaultConf.setGlobally(el::ConfigurationType::ToFile, "true");
  auto logFname = substPattern("HOMEDIR", pwd->pw_dir, cfg.logfile.value);
  defaultConf.setGlobally(el::ConfigurationType::Filename, logFname);
  el::Loggers::reconfigureLogger("default", defaultConf);

  // use_first_pass
  if (cfg.ask_for_password.value) {
    auto ret = ask_for_password(pamh, cfg, password);
    if (ret != boost::none && *ret != PAM_SUCCESS) {
      LOG(ERROR) << "ask_for_password don't got a valid password";
      return PAM_USER_UNKNOWN;
    }
  } else {
    if (cfg.use_first_pass.value) {
      auto ret_ufp = get_authtok(pamh, cfg, password);
      if (ret_ufp == boost::none ||
          *ret_ufp != PAM_SUCCESS ||
          !password.some()) {
        LOG(ERROR) << "get_authtok don't got a valid password";
        return PAM_USER_UNKNOWN;
      }
    } else if (cfg.try_first_pass.value) {
      auto ret_ufp = get_authtok(pamh, cfg, password);
      if (ret_ufp == boost::none || *ret_ufp != PAM_SUCCESS) {
        LOG(ERROR) << "get_authtok don't got a valid password";
        return PAM_USER_UNKNOWN;
      }
      if (!password.some()) {
        auto ret = ask_for_password(pamh, cfg, password);
        if (ret == boost::none || *ret != PAM_SUCCESS) {
          LOG(ERROR) << "ask_for_password don't got a valid password";
          return pam_err;
        }
      }
    }
  }

  // if ((pam_err = create_gnupg_dir(pamh, pwd, cfg)) != PAM_SUCCESS) {
  //   return pam_err;
  // }
  // if ((pam_err = setup_gpgagent_conf(pamh, pwd, cfg)) != PAM_SUCCESS) {
  //   return pam_err;
  // }
  RetryActor ra(pamh, pwd, cfg, password);
  {
    auto ret = gpgagent_start(ra);
    if (ret != boost::none && *ret != PAM_SUCCESS) {
      return pam_err;
    }
  }

  auto grp = check_does_we_have_a_card(ra);
  if (grp == boost::none) {
    LOG(ERROR) << "pam_sm_authenticate:pam_get_item check_does_we_have_a_card";
    return (PAM_AUTH_ERR);
  }

  auto challenge = create_challenge();
  auto pem = create_cert_from_card(ra, *grp, challenge);
  if (pem == boost::none) {
    LOG(ERROR) << "pam_sm_authenticate:pam_get_item create_cert_from_card";
    return (PAM_AUTH_ERR);
  }
  auto pemPubKey = pem->pubKey();
  if (pemPubKey == boost::none) {
    LOG(ERROR) << "pam_sm_authenticate:pemPubKey faild";
    return (PAM_AUTH_ERR);
  }
  auto fname = substPattern("HOMEDIR", pwd->pw_dir, cfg.ssh_authorized_keys_fname.value);
  std::ifstream fstream(fname.c_str(), std::ios_base::in | std::ios_base::binary);
  auto sshKeys =  PamClavator::SshAuthorizedKeys::read(fstream);
  fstream.close();
  for (auto &v : sshKeys.get()) {
      if (pemPubKey->modulus == v.from_data_modulo &&
          pemPubKey->key == v.from_data_pubkey &&
          pemPubKey->serial == challenge) {
        LOG(INFO) << "found key in SshAuthorizedKeys";
        auto retval = pam_set_item(pamh, PAM_AUTHTOK, challenge.c_str());
        if (retval != PAM_SUCCESS) {
          LOG(ERROR) << "set_item returned error:" << pam_strerror(pamh, retval);
          return retval;
        }
        return (PAM_SUCCESS);
      }
  }
  LOG(INFO) << "pem Key not found in ssh_authorized_keys:" <<
    "challenge[" << pemPubKey->serial << "][" << challenge << "]";
  // D(("pem Key not found in ssh_authorized_keys"));
  return PAM_AUTH_ERR;
}

PAM_EXTERN int pam_sm_setcred(pam_handle_t *, int , int , const char *[]) {
  return (PAM_SUCCESS);
}

PAM_EXTERN int pam_sm_acct_mgmt(pam_handle_t *, int , int , const char *[]) {
  return (PAM_SUCCESS);
}

PAM_EXTERN int pam_sm_open_session(pam_handle_t *, int, int, const char *[]) {
  return (PAM_SUCCESS);
}

PAM_EXTERN int pam_sm_close_session(pam_handle_t *, int , int , const char *[]) {
  return (PAM_SUCCESS);
}

PAM_EXTERN int pam_sm_chauthtok(pam_handle_t *, int , int , const char *[]) {
  return (PAM_SERVICE_ERR);
}

#ifdef PAM_MODULE_ENTRY
PAM_MODULE_ENTRY("pam_clavator");
#endif
}
