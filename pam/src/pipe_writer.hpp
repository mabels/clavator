#ifndef __PIPE_WRITER__
#define __PIPE_WRITER__

#include <memory>
#include "pipe_action.hpp"

class DuringExec;

typedef struct S_Buf {
  char *ptr;
  size_t len;
} Buf;

class PipeWriter {
  DuringExec &de;
  const PipeAction &pa;
  boost::asio::posix::stream_descriptor ds;
  size_t ofs;
  std::vector<char> readBuf;
  PipeWriter(DuringExec &de, const PipeAction &pa, size_t bufSize = 0);
  void startFromMother();
  void startToClient();
  void write(const void *buf, size_t len);
public:
  static std::shared_ptr<PipeWriter> startMother(DuringExec &de, const PipeAction &pa) {
    auto pw = new PipeWriter(de, pa, 4096);
    pw->startFromMother();
    return std::shared_ptr<PipeWriter>(pw);
  }
  static std::shared_ptr<PipeWriter> startClient(DuringExec &de, const PipeAction &pa) {
    auto pw = new PipeWriter(de, pa);
    pw->startToClient();
    return std::shared_ptr<PipeWriter>(pw);
  }

};

#endif
