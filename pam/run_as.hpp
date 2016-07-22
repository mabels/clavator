
class RunAs {
public:
  static int run(pam_handle_t *pamh, const struct passwd *pwd, const std::function<int()>&action) {
    pid_t pid = fork();
    if (pid == 0) {
      PAM_MODUTIL_DEF_PRIVS(privs);
      int ret = pam_modutil_drop_priv(pamh, &privs, pwd);
      setuid(pwd->pw_uid);
      seteuid(pwd->pw_uid);
      return action();
    } else {
      int status;
      waitpid(pid, &status, 0);
      return status;
    }
  }
};
