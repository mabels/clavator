#ifndef __FILE_DESCRIPTOR__
#define __FILE_DESCRIPTOR__

#include <string>
#include <sstream>
#include <memory>

#include <unistd.h>
#include <fcntl.h>

#include <easylogging++.h>

class FileDescriptor {
  int fd;
  FileDescriptor(int fd) : fd(fd) {}
public:
  ~FileDescriptor() {
    // LOG(DEBUG) << "close[" << fd << "]";
    close(fd);
  }

  int getFd() const { return fd; }
  std::string asString() const {
    std::stringstream s2;
    s2 << fd;
    return s2.str();
  }
  void nonBlocking() const {
    int saved_flags = fcntl(this->fd, F_GETFL);
    fcntl(this->fd, F_SETFL, saved_flags & ~O_NONBLOCK);
  }
  bool operator==(const FileDescriptor& obj) const {
    return this->fd == obj.fd;
  }

  static std::shared_ptr<FileDescriptor> create(int fd) {
      return std::shared_ptr<FileDescriptor>(new FileDescriptor(fd));
  }

};

#endif
