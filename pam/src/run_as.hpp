#ifndef __PAM_CLAVATOR__
#define __PAM_CLAVATOR__

namespace PamClavator {
class RunAs {
public:
  static int run(pam_handle_t *, const struct passwd *pwd, const std::function<int()>&action) {
    pid_t pid = fork();
    if (pid == 0) {
      if (setuid(pwd->pw_uid) < 0) {
        return -1;
      }
      if (seteuid(pwd->pw_uid) < 0) {
        return -1;
      }
      return action();
    } else {
      int status;
      waitpid(pid, &status, 0);
      return status;
    }
  }
};

}

#endif
