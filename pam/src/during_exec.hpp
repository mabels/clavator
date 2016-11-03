#ifndef __DURING_EXEC__
#define __DURING_EXEC__

#include <vector>
#include <atomic>
#include <memory>

#include <boost/asio.hpp>

#include "pipe_action.hpp"
#include "pipe_writer.hpp"


class DuringExec {
  public:
    std::atomic<size_t> completed;
    boost::asio::io_service io_service;
    std::vector<PipeAction> pipeActions;
    std::vector<std::shared_ptr<PipeWriter>> pipeWriters;

    DuringExec() : completed(0) {}

    void handle_completed(const char *) {
      ++this->completed;
      //LOG(INFO) << "handle_completed:" << this->completed << ":" << tag;
      if (this->completed >= 1+1+1+pipeWriters.size()) {
        this->io_service.stop();
      }
    }

    void inPipe(const PipeAction &pa) {
      pipeActions.push_back(pa);
      // i->createStreamDescriptor(de.io_service, i->pipe.getWriteFd());
    }

    void startPipeActions() {
      for (auto &pa : pipeActions) {
        pipeWriters.push_back(PipeWriter::start(*this, pa));
      }
    }
};

#endif
