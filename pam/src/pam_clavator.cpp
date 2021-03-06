/*-
 */

#include <sys/param.h>

#include <errno.h>
#include <libgen.h>
#include <pwd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

#include <algorithm>
#include <chrono>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include <boost/exception/all.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/filesystem/path.hpp>
#include <boost/optional.hpp>
#include <boost/uuid/random_generator.hpp>
#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_io.hpp>

#include <boost/algorithm/string.hpp>
#include <boost/algorithm/string/split.hpp>

#include <boost/bind/bind.hpp>

namespace fs = boost::filesystem;

#include <easylogging++.h>

#include "pem.hpp"

#ifndef __APPLE_CC__
#include <security/pam_ext.h>
#include <security/pam_modutil.h>
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

std::string substPattern(const char *, const char *val,
                         const std::string &str) {
  // boost::regex_replace(out, s.begin(), s.end(),
  //     e1, format_string, boost::match_default | boost::format_all);
  std::stringstream s2;
  s2 << val;
  s2 << "/";
  s2 << str;
  return s2.str();
}

std::string DirName(std::string source) {
  source.erase(std::find(source.rbegin(), source.rend(), '/').base(),
               source.end());
  return source;
}

// #include "pem_ssh.hpp"
#include "gpg_agent_conf.hpp"
#include "gpg_card_status.hpp"
#include "gpg_keyinfo_list.hpp"
#include "gpg_list_secret_keys.hpp"
#include "matcher.hpp"
#include "optional_password.hpp"
#include "pin_entry_dispatcher.hpp"
#include "run_as.hpp"
#include "ssh_authorized_keys.hpp"
#include "config.hpp"
#include "system_cmd.hpp"



class RetryActor {
private:
  static bool _action(RetryActor *ra, const SystemResult &sr,
                      const PamClavator::SystemCmd &sc);

public:
  pam_handle_t *pamh;
  struct passwd *pwd;
  const Config &cfg;
  OptionalPassword &op;

  RetryActor(pam_handle_t *pamh, struct passwd *pwd, const Config &cfg,
             OptionalPassword &op)
      : pamh(pamh), pwd(pwd), cfg(cfg), op(op) {}

  PamClavator::SystemCmd::RetryAction get() {
    return boost::bind(&RetryActor::_action, this, _1, _2);
  }
};

int create_gnupg_dir(pam_handle_t *pamh, const struct passwd *pwd,
                     const Config &cfg, OptionalPassword &op) {
  auto gpgConfFile = substPattern("HOMEDIR", pwd->pw_dir, cfg.gpg_conf.value);
  fs::path dotGnupgDir(fs::path(gpgConfFile.c_str()).remove_filename());
  if (!fs::is_directory(dotGnupgDir)) {
    PamClavator::SystemCmd mkdir_p(pwd, "/bin/mkdir", cfg.launchctl.value);
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

int setup_gpgagent_conf(pam_handle_t *pamh, const struct passwd *pwd,
                        const Config &cfg) {
  PamClavator::RunAs::run(pamh, pwd, [pwd, cfg]() {
    auto gpgAgentConfFname =
        substPattern("HOMEDIR", pwd->pw_dir, cfg.gpg_agent_conf.value);
    auto gpgAgentConf = GpgAgentConf::read(gpgAgentConfFname.c_str());
    gpgAgentConf.updateLine(GpgAgentConf::Line("enable-ssh-support", ""));
    auto pinentryDispatcher =
        substPattern("HOMEDIR", pwd->pw_dir, cfg.pinentry_dispatcher.value);
    // D((pinentry_dispatcher.c_str()));
    auto prev = gpgAgentConf.getByKey("pinentry-program");
    std::string prevPinentryDispatcher(cfg.pinentry_os_default.value);
    if (!prev.empty()) {
      prevPinentryDispatcher = prev.back()->getValue();
    }
    auto pinentryPrograms = gpgAgentConf.updateLine(
        GpgAgentConf::Line("pinentry-program", pinentryDispatcher));
    {
      std::stringstream s2;
      s2 << "pinentryPrograms:" << pinentryPrograms.empty() << ":"
         << pinentryPrograms.size();
      if (!pinentryPrograms.empty()) {
        s2 << ":" << pinentryPrograms.back()->getValue();
        s2 << ":" << pinentryDispatcher;
        s2 << ":" << prevPinentryDispatcher;
      }
      LOG(INFO) << s2.str();
    }
    if (!pinentryPrograms.empty() &&
        pinentryPrograms.back()->getValue() != prevPinentryDispatcher) {
      // pinentry-program
      // /usr/local/MacGPG2/libexec/pinentry-mac.app/Contents/MacOS/pinentry-mac
      std::stringstream s2;
      s2 << "pinentry-program update:" << prevPinentryDispatcher
         << "!=" << pinentryDispatcher;
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
  uidArg << ra.pwd->pw_uid;
  auto signals = {SIGTERM, SIGKILL};
  for (auto sig : signals) {
    PamClavator::SystemCmd pkill(ra.pwd, ra.cfg.pkill.value,
      ra.cfg.launchctl.value);
    std::stringstream sigArg;
    sigArg << "-" << sig;
    pkill.arg(sigArg.str());
    if (ra.cfg.pkill_by_uid.value) {
      pkill.arg("-U").arg(uidArg.str());
    }
    pkill.arg(name);
    auto sr = pkill.run(ra.pamh, ra.op);
    if (!sr.ok) {
      LOG(ERROR) << "force_kill:failed:" << sr.asString();
      return false;
    }
    // LOG(INFO) << sr.asString();
  }
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
  PamClavator::SystemCmd kill_gpg_connect_agent(ra.pwd,
                                                ra.cfg.gpg_connect_agent.value,
                                                ra.cfg.launchctl.value);
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
  PamClavator::SystemCmd start_gpg_connect_agent(
      ra.pwd, ra.cfg.gpg_connect_agent.value, ra.cfg.launchctl.value);
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

bool RetryActor::_action(RetryActor *ra, const SystemResult &sr,
                         const PamClavator::SystemCmd &) {
  if (sr.exitCode) {
    auto ret = gpgagent_start(*ra, true);
    if (ret != boost::none && *ret != PAM_SUCCESS) {
      return false;
    }
    return true;
  }
  return false;
}


std::string
date_yyyy_mm_dd(std::chrono::time_point<std::chrono::system_clock> now) {
  auto time = std::chrono::system_clock::to_time_t(now);
  auto ltime = std::localtime(&time);
#if __GNUC__ <= 4 && !defined(__clang__)
  char buffer[80];
  strftime(buffer, sizeof(buffer), "%Y-%m-%d", ltime);
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
boost::optional<Pem> verify_pem(RetryActor &ra,
                                           const std::string &grp,
                                           const std::string &uuid) {
    // LOG(DEBUG) << "GENKEY[" << sr.getSout().str() << "][" << sr.getSerr().str()
  // << "]";
  PamClavator::SystemCmd gpgsmImport(ra.pwd, ra.cfg.gpgsm.value,
    ra.cfg.launchctl.value);
  gpgsmImport.arg("--import").arg("--dry-run").pushSin(sr.getSout().str());
  auto srImport = gpgsmImport.run(ra.pamh, ra.op);
  if (srImport.exitCode) {
    LOG(ERROR) << srImport.asString();
    return boost::none;
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

boost::optional<int> ask_for_password(pam_handle_t *pamh, const Config &,
                                      OptionalPassword &password) {
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

boost::optional<int> get_authtok(pam_handle_t *pamh, const Config &,
                                 OptionalPassword &password) {
  char *tmp = 0;
  auto retval = pam_get_item(pamh, PAM_AUTHTOK, (const void **)&tmp);
  if (retval != PAM_SUCCESS) {
    LOG(ERROR) << "get password returned error: " << pam_strerror(pamh, retval)
               << " settings";
  } else {
    if (tmp != 0) {
      LOG(DEBUG) << "use password from PAM_AUTHTOK(!free)";
      password.own(tmp, false);
    } else {
      LOG(DEBUG) << "don't found PAM_AUTHTOK";
    }
  }
  return retval;
}

INITIALIZE_NULL_EASYLOGGINGPP

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
  el::base::elStorage = new el::base::Storage(el::LogBuilderPtr(new el::base::DefaultLogBuilder()));

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
      if (ret_ufp == boost::none || *ret_ufp != PAM_SUCCESS ||
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

  std::string challenge = create_challenge();
  boost::optional<Pem> pem;

  // kill all of all users gpg-agent's
  if (cfg.reset_gpg_agent.value) {
    force_kill();
  }

  auto agent = Agent.load();

  auto sock = agent.bind(pwd, challenge);

  auto msg = sock.getMsg("CHALLENGE");
  if (msg.content.str() != challenge) {

  }
  if (sock.sendMsg("PASS", password) == boost::none) {

  }
  auto sshauth = sock.getMsg("SSHAUTHORIZEDKEYS");
  if (sshauth == boost::none) {
  }

  auto pemcert = sock.getMsg("PEMCERT");
  if (pemcert == boost::none) {
  }
  auto close = sock.getMsg("CLOSE");
  if (close == boost::none) {
  }
  sock.close();
  // create and opensocket
  // What for
  /*
    <- CHALLENGE:LEN\nbyteslen
    <- GETPASS\n
    -> PASS:LEN\nbyteslen
    <- SSHAUTHORIZEDKEYS:LEN\nbyteslen
    <- PEMCERT:LEN\nbyteslen
    <- CLOSE
  */




  auto pem = verify_pem(pemcert.content);
  // verify pem is valid gpgsm --import --dry-run
  auto pemPubKey = pem->pubKey();
  if (pemPubKey == boost::none) {
    LOG(ERROR) << "pam_sm_authenticate:pemPubKey faild";
    return (PAM_AUTH_ERR);
  }
  auto sshKeys = PamClavator::SshAuthorizedKeys::read(sshauth.content);
  for (auto &v : sshKeys.get()) {
    if (pemPubKey->modulus == v.from_data_modulo &&
        pemPubKey->key == v.from_data_pubkey &&
        pemPubKey->serial == challenge) {
      LOG(INFO) << "found key in SshAuthorizedKeys";
      return (PAM_SUCCESS);
    }
  }
  LOG(INFO) << "pem Key not found in ssh_authorized_keys:"
            << "challenge[" << pemPubKey->serial << "][" << challenge << "]";
  // D(("pem Key not found in ssh_authorized_keys"));
  return PAM_AUTH_ERR;
}

PAM_EXTERN int pam_sm_setcred(pam_handle_t *, int, int, const char *[]) {
  return (PAM_SUCCESS);
}

PAM_EXTERN int pam_sm_acct_mgmt(pam_handle_t *, int, int, const char *[]) {
  return (PAM_SUCCESS);
}

PAM_EXTERN int pam_sm_open_session(pam_handle_t *, int, int, const char *[]) {
  return (PAM_SUCCESS);
}

PAM_EXTERN int pam_sm_close_session(pam_handle_t *, int, int, const char *[]) {
  return (PAM_SUCCESS);
}

PAM_EXTERN int pam_sm_chauthtok(pam_handle_t *, int, int, const char *[]) {
  return (PAM_SERVICE_ERR);
}

#ifdef PAM_MODULE_ENTRY
PAM_MODULE_ENTRY("pam_clavator");
#endif
}
