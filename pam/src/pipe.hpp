#ifndef __PIPE__
#define __PIPE__

#include <memory>

#include <boost/optional.hpp>

#include "file_descriptor.hpp"

class Pipe {
  std::shared_ptr<FileDescriptor> read;
  std::shared_ptr<FileDescriptor> write;
  Pipe(int read, int write) :
    read(FileDescriptor::create(read)),
    write(FileDescriptor::create(write)) {
    // LOG(DEBUG) << "read=" << this->read->getFd() << " write=" << this->write->getFd();
  }
public:
  bool operator==(const Pipe& obj) const {
    return this->read == obj.read &&
           this->write == obj.write;
  }

  const std::shared_ptr<FileDescriptor> getReadFd() const {
    return read;
  }
  const std::shared_ptr<FileDescriptor> getWriteFd() const {
    return write;
  }

  int getRead() const { return read->getFd(); }
  int getWrite() const { return write->getFd(); }

  static boost::optional<std::shared_ptr<Pipe>> create() {
    int pipeFds[2];
    if (pipe(pipeFds)) {
        LOG(ERROR) << "pipe system call failed";
        return boost::none; //Err<Pipe>("Can't create the pipe");
    }
    return std::shared_ptr<Pipe>(new Pipe(pipeFds[0], pipeFds[1]));
  }

};

#endif
