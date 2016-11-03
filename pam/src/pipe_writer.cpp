
#include <boost/asio.hpp>
#include <boost/asio/buffer.hpp>
#include <boost/asio/placeholders.hpp>

#include "pipe_writer.hpp"
#include "during_exec.hpp"

#include <unistd.h>

#include <easylogging++.h>

PipeWriter::PipeWriter(DuringExec &de, const PipeAction &pa, const size_t bufSize)
    : de(de), pa(pa), ds(de.io_service, pa.myFd->getFd()), ofs(0), buf(bufSize) {
  // pa.myFd->nonBlocking();
}

void PipeWriter::startMother() {
  //LOG(ERROR) << "register_read:" << ds.native_handle();
  boost::asio::async_read(ds, boost::asio::buffer(buf),
    [this](boost::system::error_code ec, std::size_t bytes_transferred) {
      // LOG(INFO) << "read:" << ec << ":" << bytes_transferred << std::endl;
      LOG(DEBUG) << "Read(" << pa.myFd->getFd() << ", " << ec << ", " << bytes_transferred << ")[" << "..." << "]";
      if (ec == boost::asio::error::eof || !ec) {
        // std::string s(buf.begin(), bytes_transferred);
        //std::cout << "Hello:" << bytes_transferred << ":" << s << std::endl;
        const void *buf = static_cast<const void*>(&this->buf.front());
        this->pa.action(bytes_transferred, &buf);
        // output.write(&buf.front(), bytes_transferred);
        if (!ec) {
          startMother();
        } else {
          de.handle_completed("std...");
        }
      } else if (ec) {
        LOG(ERROR) << "register_read failed:" << ec << ":" << bytes_transferred;
        de.handle_completed("std...");
        return;
      }
    });
}

void PipeWriter::startClient() {
  const void *buf;
  auto len = pa.action(this->ofs, &buf);
  LOG(DEBUG) << "pa.action:" << len;
  if (len > 0) {
    write(buf, len);
  } else {
    ds.close();
    std::stringstream s2;
    s2 << "pipewriter:start:" << this << ":" << len << ":" << pa.myFd->getFd();
    de.handle_completed(s2.str().c_str());
  }
}

void PipeWriter::write(const void *buf, size_t len) {
  if (len <= 0) {
    LOG(DEBUG) << "write:nothing todo";
    this->startClient();
    return;
  }
  boost::asio::write(ds, boost::asio::buffer(buf, len), [this, buf, len](boost::system::error_code &ec,
      std::size_t bytes_transferred) -> bool {
      if (ec || bytes_transferred > len) {
        LOG(ERROR) << "async_write failed:" << ec;
        ds.close();
        de.handle_completed("stdin-error");
      } else {
        LOG(DEBUG) << "asio:write_callback";
        this->ofs += bytes_transferred;
        write(static_cast<const void *>(static_cast<const char *>(buf) + bytes_transferred),
              len - bytes_transferred);
      }
      return true;
  });
}
