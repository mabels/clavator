

class PinEntryDispatcher {
public:
  static void write(const std::string &fname, const std::string &prev) {
    std::stringstream out;
    out << "#!/bin/sh" << std::endl;
    out << "if [ ${CLAVATOR_PINENTRY} != \"\" ]" << std::endl;
    out << "then" << std::endl;
    out << " exec ${CLAVATOR_PINENTRY}" << std::endl;
    out << "fi" << std::endl;
    out << "exec " << prev << std::endl;
    std::ofstream outFile;
    outFile.open(fname);
    fs::permissions(fs::path(fname), fs::owner_exe|fs::owner_write|fs::owner_read);
    outFile << out.rdbuf();
    outFile.close();
  }
};
