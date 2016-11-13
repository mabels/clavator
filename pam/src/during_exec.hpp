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
    sigset_t prev_signal_set;
    std::atomic<size_t> completed;
    boost::asio::io_service io_service;
    std::vector<PipeAction> clientActions;
    std::vector<PipeAction> motherActions;
    std::vector<std::shared_ptr<PipeWriter>> clientWriters;
    std::vector<std::shared_ptr<PipeWriter>> motherWriters;

    DuringExec() : completed(0) {}

    size_t pipes() const {
      return clientWriters.size() + motherWriters.size();
    }

    void handle_completed(const char *, bool force = false) {
      ++this->completed;
      auto total = 1 + pipes();
      // LOG(DEBUG) << this->completed << "of" << total <<
      //   ":" << pipes() << "[" << what << "]";
      // LOG(INFO) << "handle_completed:" << this << ":"
      //   << this->completed << ":"
      //   << total << ":" << tag << ":" << force;
      if (this->completed >= total || force) {
        // LOG(DEBUG) << "handle_completed: stop";
        this->io_service.stop();
      }
    }

    void toChildPipe(const PipeAction &pa) {
      clientActions.push_back(pa);
    }

    void fromMotherPipe(const PipeAction &pa) {
      motherActions.push_back(pa);
    }

    void startFromMotherPipeActions() {
      // LOG(DEBUG) << "startMotherPipeActions:" << motherActions.size();
      for (auto &pa : motherActions) {
        motherWriters.push_back(PipeWriter::startMother(*this, pa));
      }
    }

    void startToChildPipeActions() {
      // LOG(DEBUG) << "startChildPipeActions:" << clientActions.size();
      for (auto &pa : clientActions) {
        clientWriters.push_back(PipeWriter::startClient(*this, pa));
      }
    }
};

#endif
