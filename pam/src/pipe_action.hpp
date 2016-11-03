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
  const int translateFd;
  PipeAction(const std::shared_ptr<Pipe> &pipe, const std::shared_ptr<FileDescriptor> &myFd,
    PipeAction::Action action, int translateFd = -1) :
    pipe(pipe), action(action), myFd(myFd), translateFd(translateFd) {

    LOG(DEBUG) << "read=" << pipe->getRead() << " write=" << pipe->getWrite()
      << " my=" << myFd->getFd() << " child=" << this->childFd()
      << " trans=" << translateFd;
  }

  int childFd() const {
    if (myFd->getFd() == pipe->getRead()) {
      return pipe->getWrite();
    } else {
      return pipe->getRead();
    }
  }

};

#endif
