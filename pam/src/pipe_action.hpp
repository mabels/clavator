#ifndef __PIPE_ACTION__
#define __PIPE_ACTION__

#include <functional>

#include "pipe.hpp"

class PipeAction {
public:
  typedef const std::function<size_t(size_t, const void **buf)> Action;
  const std::shared_ptr<Pipe> pipe;
  const Action action;
  const std::shared_ptr<FileDescriptor> myFd;
  PipeAction(const std::shared_ptr<Pipe> &pipe, const std::shared_ptr<FileDescriptor> &myFd,
    PipeAction::Action action) : pipe(pipe), action(action), myFd(myFd) {}

  int childFd() const {
    if (myFd->getFd() == pipe->getRead()) {
      return pipe->getWrite();
    } else {
      return pipe->getRead();
    }
  }

};

#endif
