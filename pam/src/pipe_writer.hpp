#ifndef __PIPE_WRITER__
#define __PIPE_WRITER__

#include <memory>
#include "pipe_action.hpp"

class DuringExec;

class PipeWriter {
  DuringExec &de;
  const PipeAction &pa;
  boost::asio::posix::stream_descriptor ds;
  size_t ofs;
  PipeWriter(DuringExec &de, const PipeAction &pa);
  void start();
  void write(const void *buf, size_t len);
public:
  static std::shared_ptr<PipeWriter> start(DuringExec &de, const PipeAction &pa) {
    auto pw = new PipeWriter(de, pa);
    pw->start();
    return std::shared_ptr<PipeWriter>(pw);
  }

};

#endif
