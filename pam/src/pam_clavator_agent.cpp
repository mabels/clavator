
#include <easylogging++.h>

#include "config.hpp"

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

// gpg2 --card-status --with-colon
// check does we have one card!
// extract fpr' use third fpr
// gpg2 --list-secret-keys --with-colon
// find keys from extracted fpr's
boost::optional<std::string> check_does_we_have_a_card(RetryActor &ra) {
  PamClavator::SystemCmd gpg2cardStatusCmd(ra.pwd, ra.cfg.gpg.value,
    ra.cfg.launchctl.value);
  gpg2cardStatusCmd.arg("--card-status");
  gpg2cardStatusCmd.arg("--with-colon");
  gpg2cardStatusCmd.checkRetry(ra.get());
  auto sr = gpg2cardStatusCmd.run(ra.pamh, ra.op);
  if (sr.exitCode) {
    LOG(ERROR) << sr.asString();
    return boost::none;
  }
  auto gpg2cardStatus = Gpg2CardStatus::read(sr.getSout());

  PamClavator::SystemCmd gpgConnectAgent(ra.pwd,
                                         ra.cfg.gpg_connect_agent.value,
                                         ra.cfg.launchctl.value);
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
    if (ki.keyId != "OPENPGP.3") {
      continue;
    }
    for (auto cs : gpg2cardStatus) {
      if (cs.reader.cardid == ki.cardid) {
        return ki.group;
      }
    }
    LOG(ERROR) << "no card found for Group[" << ki.group << "]";
  }
  return boost::none;
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
                                           const std::string &grp,
                                           const std::string &uuid) {
  PamClavator::SystemCmd gpgsmGenkey(ra.pwd, ra.cfg.gpgsm.value,
    ra.cfg.launchctl.value);
  auto now = std::chrono::system_clock::now();
  if (ra.op.some()) {
    LOG(DEBUG) << "create_cert_from_card: use predefined password";
    auto opwdPipe = Pipe::create();
    if (opwdPipe == boost::none) {
      LOG(ERROR) << "can't create password passing pipe";
      return boost::none;
    }
    auto &pwdPipe = *opwdPipe;
    gpgsmGenkey.toChildPipe(pwdPipe, pwdPipe->getWriteFd(),
                            [&ra](size_t ofs, const void **buf) -> size_t {
                              if (ofs >= ra.op.getLen()) {
                                return 0ul;
                              }
                              *buf = static_cast<const void *>(
                                  ra.op.getValue() + ofs);
                              return ra.op.getLen() - ofs;
                            });
    gpgsmGenkey.arg("--no-tty").arg("--batch");
    gpgsmGenkey.arg("--pinentry-mode").arg("loopback");
    gpgsmGenkey.arg("--passphrase-fd").arg(pwdPipe->getReadFd()->asString());
  }
  gpgsmGenkey.arg("-a").arg("--batch").arg("--gen-key");
  gpgsmGenkey.pushSin("Key-Type: RSA\n")
      .pushSin("Key-Length: 1024\n")
      .pushSin("Key-Grip: ")
      .pushSin(grp)
      .pushSin("\n")
      .pushSin("Key-Usage: sign\n")
      .pushSin("Serial: ")
      .pushSin(uuid)
      .pushSin("\n")
      .pushSin("Name-DN: CN=")
      .pushSin(uuid)
      .pushSin("\n")
      .pushSin("Not-Before: ")
      .pushSin(date_yyyy_mm_dd(now))
      .pushSin("\n")
      .pushSin("Not-After: ")
      .pushSin(date_yyyy_mm_dd(now + std::chrono::hours(24)))
      .pushSin("\n")
      //  .pushSin("Subject-Key-Id: ").pushSin(grp).pushSin("\n")
      //  .pushSin("Extension: 2.5.29.19 c 30060101ff020101\n")
      //  .pushSin("Extension: 1.3.6.1.4.1.11591.2.2.2 n 0101ff\n")
      //  .pushSin("Signing-Key: ").pushSin(grp).pushSin("\n")
      .pushSin("%commit\n");
  gpgsmGenkey.checkRetry(ra.get());
  auto sr = gpgsmGenkey.run(ra.pamh, ra.op);
  if (sr.exitCode) {
    LOG(ERROR) << "GENKEY[" << sr.asString() << "][" << sr.getSout().str()
               << "][" << sr.getSerr().str() << "]";
    return boost::none;
  }
  // // LOG(DEBUG) << "GENKEY[" << sr.getSout().str() << "][" << sr.getSerr().str()
  // // << "]";
  // PamClavator::SystemCmd gpgsmImport(ra.pwd, ra.cfg.gpgsm.value,
  //   ra.cfg.launchctl.value);
  // gpgsmImport.arg("--import").arg("--dry-run").pushSin(sr.getSout().str());
  // auto srImport = gpgsmImport.run(ra.pamh, ra.op);
  // if (srImport.exitCode) {
  //   LOG(ERROR) << srImport.asString();
  //   return boost::none;
  // }
  // auto pem = Pem::read(sr.getSout());
  // if (pem.size() != 1) {
  //   LOG(ERROR) << "no valid pem found";
  //   return boost::none;
  // }
  // return pem[0];
}


INITIALIZE_EASYLOGGINGPP
int main(int argc, char *argv[]) {

  Config cfg;
  cfg.parse_cfg(0, argc, argv);

  struct passwd pw_s;
  struct passwd *pwd;
  char buffer[1024];
  pam_err = getpwuid_r(getuid(), &pw_s, buffer, sizeof(buffer), &pwd);
  if (pam_err != 0 || pwd == 0 || pwd->pw_dir == 0 || pwd->pw_dir[0] != '/') {
    LOG(ERROR) << "pam_sm_authenticate:getpwname:" << strerror(errno);
    exit(3);
  }
  el::Configurations defaultConf;
  defaultConf.setToDefault();
  defaultConf.setGlobally(el::ConfigurationType::ToStandardOutput, "false");
  defaultConf.setGlobally(el::ConfigurationType::ToFile, "true");
  auto logFname = substPattern("HOMEDIR", pwd->pw_dir, cfg.logfile.value);
  defaultConf.setGlobally(el::ConfigurationType::Filename, logFname);
  el::Loggers::reconfigureLogger("default", defaultConf);


  auto sock = Agent.connect(cfg);
  if (sock == boost::none) {
    exit(2);
  }

  if (sock->sendMsg("CHALLENGE", cfg.challenge.value) == boost::none) {
    exit(3);
  }
  auto ret = sock->getMsg("PASS");
  if (ret == boost::none) {
    exit(3);
  }

  RetryActor ra(0, pwd, cfg, password);
  {
    auto ret = gpgagent_start(ra);
    if (ret != boost::none && *ret != PAM_SUCCESS) {
      return pam_err;
    }
  }

  auto grp = check_does_we_have_a_card(ra);
  if (grp == boost::none) {
    LOG(ERROR)
        << "pam_sm_authenticate:pam_get_item check_does_we_have_a_card";
    return (PAM_AUTH_ERR);
  }


  pem = create_cert_from_card(ra, *grp, challenge);
  if (pem == boost::none) {
    LOG(ERROR) << "pam_sm_authenticate:pam_get_item create_cert_from_card";
    return (PAM_AUTH_ERR);
  }

  if (sock->sendMsg("PEMCERT", sr.str()) == boost::none) {
    exit(3);
  }

  std::stringstream sshauth;
  auto fname =
      substPattern("HOMEDIR", pwd->pw_dir, cfg.ssh_authorized_keys_fname.value);
  std::ifstream fstream(fname.c_str(),
                        std::ios_base::in | std::ios_base::binary);
  auto sshsize = boost:copy(fstream, sshauth);
  if (sock->sendMsg("SSHAUTHORIZEDKEYS", sshauth.str()) == boost::none) {
    exit(3);
  }

  if (sock->sendMsg("CLOSE") == boost::none) {
    exit(3);
  }
  sock->close();

  exit(0);
}
