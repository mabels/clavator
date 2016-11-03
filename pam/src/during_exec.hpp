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

    void handle_completed(const char *what) {
      ++this->completed;
      auto total = 1+1+1+pipeActions.size();
      LOG(DEBUG) << this->completed << "of" << total <<
        ":" << pipeWriters.size() << "[" << what << "]";
      //LOG(INFO) << "handle_completed:" << this->completed << ":" << tag;
      if (this->completed >= total) {
        LOG(DEBUG) << "handle_completed: stop";
        this->io_service.stop();
      }
    }

    void inPipe(const PipeAction &pa) {
      pipeActions.push_back(pa);
      // i->createStreamDescriptor(de.io_service, i->pipe.getWriteFd());
    }

    void startPipeActions() {
      LOG(DEBUG) << "starting:" << pipeActions.size();
      for (auto &pa : pipeActions) {
        pipeWriters.push_back(PipeWriter::start(*this, pa));
      }
    }
};

#endif
