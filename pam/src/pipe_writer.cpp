
#include <boost/asio.hpp>
#include <boost/asio/buffer.hpp>
#include <boost/asio/placeholders.hpp>

#include "pipe_writer.hpp"
#include "during_exec.hpp"

#include <unistd.h>

#include <easylogging++.h>

PipeWriter::PipeWriter(DuringExec &de, const PipeAction &pa)
    : de(de), pa(pa), ds(de.io_service, pa.myFd->getFd()), ofs(0) {
  pa.myFd->nonBlocking();
  start();
}

void PipeWriter::start() {
  const void *buf;
  auto len = pa.action(this->ofs, &buf);
  if (len > 0) {
    write(buf, len);
  } else {
    ds.close();
    de.handle_completed("stdin");
  }
}

void PipeWriter::write(const void *buf, size_t len) {
  if (len <= 0) {
    this->start();
    return;
  }
  boost::asio::write(ds, boost::asio::buffer(buf, len), [this, buf, len](boost::system::error_code &ec,
      std::size_t bytes_transferred) -> bool {
      if (ec || bytes_transferred > len) {
        LOG(ERROR) << "async_write failed:" << ec;
        ds.close();
        de.handle_completed("stdin");
      } else {
        this->ofs += bytes_transferred;
        write(static_cast<const void *>(static_cast<const char *>(buf) + bytes_transferred),
              len - bytes_transferred);
      }
      return true;
  });
}
