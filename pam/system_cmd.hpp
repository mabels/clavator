#include "run_as.hpp"

class SystemCmd {
private:
  const struct passwd *pwd;
  std::vector<std::string> args;
  std::vector<std::string> envs;
  const std::string exec;
  int status;
public:
  SystemCmd(const struct passwd *pwd, const std::string &cmd) : pwd(pwd), exec(cmd), status(-1) {
      env("HOMEDIR", pwd->pw_dir);
      arg(exec);
  }
  SystemCmd(const struct passwd *pwd, const char *cmd) : pwd(pwd), exec(cmd), status(-1) {
      env("HOMEDIR", pwd->pw_dir);
      arg(exec);
  }

  int getStatus() {
    return status;
  }

  void env(const char *key, const char *value)  {
    std::string kv(key);
    kv += "=";
    kv += value;
    envs.push_back(kv);
  }

  void arg(const char *part) { args.push_back(part); }
  void arg(const std::string &part) { args.push_back(part); }

  std::string dump() const {
    std::stringstream ret;
    ret << getuid() << ":" << pwd->pw_uid << ":" << pwd->pw_gid << "=>";
    const char *space = "";
    for (auto &v : envs) {
        ret << space << v;
        space = " ";
    }
    ret << space << exec;
    for (auto &v : args) {
        ret << space << v;
        space = " ";
    }
    if (status >= 0) {
      ret << "=>" << status;
    }
    return ret.str();
  }
  int run(pam_handle_t *pamh) {
    status = RunAs::run(pamh, pwd, [this]() {
      char *argv[args.size()+1];
      argv[args.size()] = 0;
      for (size_t i = 0; i < args.size(); ++i) {
          argv[i] = (char *)args[i].c_str();
      }
      char *envp[envs.size()+1];
      envp[envs.size()] = 0;
      for (size_t i = 0; i < envs.size(); ++i) {
          envp[i] = (char *)envs[i].c_str();
      }
      D((dump().c_str()));
      return execve(exec.c_str(), argv, envp);
    });
    return status;
  }
};
