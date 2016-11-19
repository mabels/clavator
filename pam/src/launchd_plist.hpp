#ifndef __LAUNCHD_PLIST__
#define __LAUNCHD_PLIST__

#include <iostream>
#include "config.hpp"

class LaunchdPlist {
  const Config &cfg;
  const std::string &user;
  const std::string &sess;
  LaunchdPlist(const Config &cfg, const std::string& user, const std::string &sess)
    : cfg(cfg), user(user), sess(sess) {
  }
  ~LaunchdPlist() {
    unload(cfg, user, sess);
  }
  bool unload() const {
    SystemCmd launchctlUnload(cfg.launchctl.value).arg("unload").arg(plistFName).run();
    unlink(fname);
  }

  std::string domainName() const {
    std::string domain("com.clavator.pam.");
    domain += user;
    domain += ".";
    domain += sess;
    return domain;
  }

  std::string plistFName() const {
    std::string plistFname(cfg.lauchd_dir.value);
    plistFname += "/";
    plistFname += plistDomain(cfg, user, sess);
    plistFname += ".plist";
    return plistFname;
  }


  bool write() const {
      std::ofstream plist;
      plist.open(plistFName(), std::ios::out | std::ios::binary);
      plist << "<?xml version="1.0" encoding="UTF-8"?>" << std::endl;
      plist << "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\"" << std::endl;
      plist << "    \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">" << std::endl;
      plist << "<plist version=\"1.0\">" << std::endl;
      plist << "<dict>" << std::endl;
      plist << "	<key>Label</key>" << std::endl;
      plist << "	<string>" << domaiName() <<< "</string>" << std::endl;
      plist << "	<key>ProgramArguments</key>" << std::endl;
      plist << "	<array>" << std::endl;
      plist << "	  <string>" << cfg.pam_clavator_agent.value << "</string>" << std::endl;
      plist << "	  <string>" << sess << "</string>" << std::endl;
      plist << "  </array>" << std::endl;
      plist << "	<key>RunAtLoad</key>" << std::endl;
      plist << "	<true/>" << std::endl;
      plist << "	<key>KeepAlive</key>" << std::endl;
      plist << "	<false/>" << std::endl;
      plist << "</dict>" << std::endl;
      plist << "</plist>" << std::endl;
      plist.close();
      return true;
    }

  bool load() const {
    if (!write()) {
      return false;
    }
    SystemCmd launchctlLoad(cfg.launchctl.value).arg("load").arg(plistFName(cfg, user, sess)).run();
  }

public:

  static boost::optional<LaunchdPlist> load(const Config &cfg, const std::string& user, const std::string &sess) {
    LaunchdPlist lpl(cfg, user, sess);
    if (!lpl.load()) {
      return boost::none;
    }
    return lpl;
  }

};

#endif
