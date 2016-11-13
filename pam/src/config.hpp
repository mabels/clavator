#ifndef __CONFIG__
#define __CONFIG__

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
  std::vector<BaseMatcher *> matchers;

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
  Matcher<std::string> launchctl;
  Matcher<std::string> pinentry_dispatcher;
  Matcher<std::string> pinentry_os_default;
  Matcher<std::string> logfile;
  Matcher<bool> pkill_by_uid;
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

  Config()
      : ssh_authorized_keys_fname("ssh_authorized_keys_fname=",
                                  ".ssh/authorized_keys", matchers),
        password_prompt("password_prompt=", "pincode: ", matchers),
        gpg_connect_agent("gpg_connect_agent=", GPG_CONNECT_AGENT, matchers),
        gpg("gpg=", GPG, matchers), gpgsm("gpgsm=", GPGSM, matchers),
        gpg_agent_conf("gpg_agent_conf=", ".gnupg/gpg-agent.conf", matchers),
        gpg_conf("gpg_conf=", ".gnupg/gpg.conf", matchers),
        pgrep("pgrep=", "/usr/bin/pgrep", matchers),
        pkill("pkill=", "/usr/bin/pkill", matchers),
        launchctl("launchctl=", "/bin/launchctl", matchers),
        pinentry_dispatcher("pinentry_dispatcher=",
                            ".gnupg/pinentry_dispatcher.sh", matchers),
        pinentry_os_default("pinentry_os_default", "/usr/local/MacGPG2/libexec/"
                                                   "pinentry-mac.app/Contents/"
                                                   "MacOS/pinentry-mac",
                            matchers),
        logfile("logfile", ".gnupg/pam_clavator.log", matchers),
        pkill_by_uid("pkill_by_uid", false, matchers),
        reset_gpg_agent("reset_gpg_agent", false, matchers),
        try_first_pass("try_first_pass", false, matchers),
        use_first_pass("use_first_pass", false, matchers),
        ask_for_password("ask_for_password", false, matchers),
        debug("debug", false, matchers), retries("retries", 3, matchers) {}

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

#endif
