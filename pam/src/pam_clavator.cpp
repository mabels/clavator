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

namespace fs = boost::filesystem;

#include <easylogging++.h>

#include "pem.hpp"

#define PAM_DEBUG
#ifdef PAM_DEBUG
#ifndef __APPLE_CC__
#define _PAM_LOGFILE "/run/pam-debug.log"
#include <security/_pam_macros.h>
#else
#  define D(x) do {                                                     \
    std::cout << "debug: " << __FILE__ << ":" << __LINE__ << " (" << __FUNCTION__ << "): " << x << std::endl; \
  } while (0)
#endif
#endif

#ifndef __APPLE_CC__
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
#include "system_cmd.hpp"
#include "matcher.hpp"
#include "ssh_authorized_keys.hpp"
#include "gpg_agent_conf.hpp"
#include "gpg_card_status.hpp"
#include "gpg_list_secret_keys.hpp"
#include "pin_entry_dispatcher.hpp"

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
  Matcher<std::string> pinentry_dispatcher;
  Matcher<std::string> pinentry_os_default;
  Matcher<bool> debug;
  Config() :
    ssh_authorized_keys_fname("ssh_authorized_keys_fname=", ".ssh/authorized_keys", matchers),
    password_prompt("password_prompt=", "pincode: ", matchers),
    gpg_connect_agent("gpg_connect_agent=", "/usr/local/bin/gpg-connect-agent", matchers),
    gpg("gpg=", "/usr/local/bin/gpg2", matchers),
    gpgsm("gpgsm=", "/usr/local/bin/gpgsm", matchers),
    gpg_agent_conf("gpg_agent_conf=", ".gnupg/gpg-agent.conf", matchers),
    gpg_conf("gpg_conf=", ".gnupg/gpg.conf", matchers),
    pinentry_dispatcher("pinentry_dispatcher=", ".gnupg/pinentry_dispatcher.sh", matchers),
    pinentry_os_default("pinentry_os_default", "/usr/local/MacGPG2/libexec/pinentry-mac.app/Contents/MacOS/pinentry-mac", matchers),
    debug("debug", false, matchers) {
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

int create_gnupg_dir(pam_handle_t *pamh, const struct passwd *pwd, const Config &cfg) {
  auto gpgConfFile = substPattern("HOMEDIR", pwd->pw_dir, cfg.gpg_conf.value);
  fs::path dotGnupgDir(fs::path(gpgConfFile.c_str()).remove_filename());
  if (!fs::is_directory(dotGnupgDir)) {
     SystemCmd mkdir_p(pwd, "/bin/mkdir");
    mkdir_p.arg("-p");
    mkdir_p.arg("--mode=0700");
    mkdir_p.arg(dotGnupgDir.c_str());
    mkdir_p.run(pamh);
    if (mkdir_p.getStatus()) {
      D((mkdir_p.dump().c_str()));
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
      D((s2.str().c_str()));
    }
    if (!pinentryPrograms.empty() && pinentryPrograms.back()->getValue() != prevPinentryDispatcher) {
      //pinentry-program /usr/local/MacGPG2/libexec/pinentry-mac.app/Contents/MacOS/pinentry-mac
      std::stringstream s2;
      s2 << "pinentry-program update:" << prevPinentryDispatcher << "!=" << pinentryDispatcher;
      D((s2.str().c_str()));
      PinEntryDispatcher::write(pinentryDispatcher, prevPinentryDispatcher);
    }
    gpgAgentConf.write();
    return 0;
  });
  return PAM_SUCCESS;
}

int gpgagent_start(pam_handle_t *pamh, const struct passwd *pwd, const Config &cfg) {
     SystemCmd kill_gpg_connect_agent(pwd, cfg.gpg_connect_agent.value);
    kill_gpg_connect_agent.arg("--no-autostart");
    kill_gpg_connect_agent.arg("KILLAGENT");
    kill_gpg_connect_agent.arg("/bye");
    kill_gpg_connect_agent.run(pamh);
    if (kill_gpg_connect_agent.getStatus()) {
      D((kill_gpg_connect_agent.dump().c_str()));
      return PAM_AUTH_ERR;
    }
    return PAM_SUCCESS;
}

boost::optional<std::string> check_does_we_have_a_card(pam_handle_t *pamh, const struct passwd *pwd, const Config &cfg) {
  SystemCmd gpg2cardStatusCmd(pwd, cfg.gpg.value);
  gpg2cardStatusCmd.arg("--card-status");
  gpg2cardStatusCmd.arg("--with-colon");
  auto sr = gpg2cardStatusCmd.run(pamh);
  if (sr.exitCode) {
    D((gpg2cardStatusCmd.dump().c_str()));
    return boost::none;
  }
  auto gpg2cardStatus = Gpg2CardStatus::read(sr.getSout());

  SystemCmd gpg2listSecretKeysCmd(pwd, cfg.gpg.value);
  gpg2listSecretKeysCmd.arg("--list-secret-keys");
  gpg2listSecretKeysCmd.arg("--with-colon");
  sr = gpg2listSecretKeysCmd.run(pamh);
  if (sr.exitCode) {
    D((gpg2listSecretKeysCmd.dump().c_str()));
    return boost::none;
  }
  auto gpg2listSecretKeys = SecretKey::read(sr.getSout());
  // gpg2 --card-status --with-colon
  // check does we have one card!
  // extract fpr' use third fpr
  // gpg2 --list-secret-keys --with-colon
  // find keys from extracted fpr's
  for (auto gcs : gpg2cardStatus) {
    if (gcs.keyStates.size() < 3) {
      continue;
    }
    auto &fpr = gcs.keyStates[2].fpr;
    for (auto glsk : gpg2listSecretKeys) {
       if (glsk.key.fingerPrint.fpr == fpr) {
         return glsk.key.group.grp;
       }
       for (auto ssb : glsk.subKeys) {
         if (ssb.fingerPrint.fpr == fpr) {
           return ssb.group.grp;
         }
       }
    }
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

boost::optional<Pem> create_cert_from_card(pam_handle_t *pamh, const struct passwd *pwd, const Config &cfg, const std::string& grp) {
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
  */
  SystemCmd gpgsmGenkey(pwd, cfg.gpgsm.value);
  auto now = std::chrono::system_clock::now();
  gpgsmGenkey.arg("-a").arg("--batch").arg("--gen-key");
  gpgsmGenkey
    .pushSin("Key-Type: RSA\n")
    .pushSin("Key-Length: 1024\n")
    .pushSin("Key-Grip: ").pushSin(grp).pushSin("\n")
    .pushSin("Key-Usage: sign\n")
    .pushSin("Serial: ").pushSin("random").pushSin("\n")
    .pushSin("Name-DN: CN=ssh-").pushSin("random").pushSin("\n")
    .pushSin("Not-Before: ").pushSin(date_yyyy_mm_dd(now)).pushSin("\n")
    .pushSin("Not-After: ").pushSin(date_yyyy_mm_dd(now + std::chrono::hours(24))).pushSin("\n")
  //  .pushSin("Subject-Key-Id: ").pushSin(grp).pushSin("\n")
  //  .pushSin("Extension: 2.5.29.19 c 30060101ff020101\n")
  //  .pushSin("Extension: 1.3.6.1.4.1.11591.2.2.2 n 0101ff\n")
  //  .pushSin("Signing-Key: ").pushSin(grp).pushSin("\n")
    .pushSin("%commit\n");
  auto sr = gpgsmGenkey.run(pamh);
  if (sr.exitCode) {
    D((gpgsmGenkey.dump().c_str()));
    return  boost::none;
  }
  auto pem = Pem::read(sr.getSout());
  if (pem.size() != 1) {
    D(("no valid pem found"));
    return boost::none;
  }
  return pem[0];
}


INITIALIZE_EASYLOGGINGPP

extern "C" {


PAM_EXTERN int pam_sm_authenticate(pam_handle_t *pamh, int flags, int argc,
                                   const char *argv[]) {
  struct pam_conv *conv;
  struct pam_message msg;
  const struct pam_message *msgp;
  struct pam_response *resp;
  struct passwd *pwd;
  const char *user;
  //char *crypt_password, *password;
  int pam_err, retry;
  Config cfg;

  D(("pam_sm_authenticate"));
  START_EASYLOGGINGPP(argc, argv);
  cfg.parse_cfg(flags, argc, argv);

  /* identify user */
  if ((pam_err = pam_get_user(pamh, &user, NULL)) != PAM_SUCCESS) {
    D(("pam_sm_authenticate:pam_get_user"));
    return (pam_err);
  }
  if ((pwd = getpwnam(user)) == NULL) {
    D(("pam_sm_authenticate:getpwname"));
    return (PAM_USER_UNKNOWN);
  }

  // if ((pam_err = create_gnupg_dir(pamh, pwd, cfg)) != PAM_SUCCESS) {
  //   return pam_err;
  // }
  // if ((pam_err = setup_gpgagent_conf(pamh, pwd, cfg)) != PAM_SUCCESS) {
  //   return pam_err;
  // }
  // if ((pam_err = gpgagent_start(pamh, pwd, cfg)) != PAM_SUCCESS) {
  //   return pam_err;
  // }


  /* get password */
  pam_err = pam_get_item(pamh, PAM_CONV, (const void **)&conv);
  if (pam_err != PAM_SUCCESS) {
    D(("pam_sm_authenticate:pam_get_item PAM_CONV"));
    return (PAM_SYSTEM_ERR);
  }
  msg.msg_style = PAM_PROMPT_ECHO_OFF;
  msg.msg = (char *)cfg.password_prompt.value.c_str();
  msgp = &msg;

  std::string password;
  for (retry = 0; retry < 3; ++retry) {
    // pam_err = pam_get_authtok(pamh, PAM_AUTHTOK, (const char **)&password,
    // NULL);
    resp = NULL;
    pam_err = (*conv->conv)(1, &msgp, &resp, conv->appdata_ptr);
    if (resp != NULL) {
      if (pam_err == PAM_SUCCESS) {
        password = resp->resp;
      }
      free(resp->resp);
      free(resp);
    }
    if (pam_err == PAM_SUCCESS) {
      break;
    }
  }
  if (pam_err == PAM_CONV_ERR) {
    D(("pam_sm_authenticate:pam_get_item PAM_CONV-1"));
    return (pam_err);
  }
  if (pam_err != PAM_SUCCESS) {
    D(("pam_sm_authenticate:pam_get_item PAM_CONV-2"));
    return (PAM_AUTH_ERR);
  }

  std::string pin("PIN:");
  pin += password;
  D((pin.c_str()));

  auto grp = check_does_we_have_a_card(pamh, pwd, cfg);
  if (grp == boost::none) {
    D(("pam_sm_authenticate:pam_get_item check_does_we_have_a_card"));
    return (PAM_AUTH_ERR);
  }

  auto pem = create_cert_from_card(pamh, pwd, cfg, *grp);
  if (pem == boost::none) {
    D(("pam_sm_authenticate:pam_get_item check_does_we_have_a_card"));
    return (PAM_AUTH_ERR);
  }
  auto pemPubKeys = pem->pubKey();
  if (pemPubKeys == boost::none) {
    D(("pam_sm_authenticate:pemPubKey faild"));
    return (PAM_AUTH_ERR);
  }
  auto fname = substPattern("HOMEDIR", pwd->pw_dir, cfg.ssh_authorized_keys_fname.value);
  std::ifstream fstream(fname.c_str(), std::ios_base::in | std::ios_base::binary);
  auto sshKeys =  PamClavator::SshAuthorizedKeys::read(fstream);
  fstream.close();
  for (auto ppk : *pemPubKeys) {
    for (auto &v : sshKeys.get()) {
      if (ppk.modulus == v.from_data_modulo &&
          ppk.key == v.from_data_pubkey) {
        D(("found key in SshAuthorizedKeys"));
        return (PAM_SUCCESS);
      }
    }
  }
  D(("pem Key not found in ssh_authorized_keys"));
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
