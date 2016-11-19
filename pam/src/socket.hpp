#ifndef __SOCKET__
#define __SOCKET__

#include <sys/un.h>

#define ELPP_THREAD_SAFE
#include <easylogging++.h>

#include <boost/optional.hpp>
#include <boost/asio/io_service.hpp>
#include <boost/asio.hpp>

class Message {
public:
  std::string data;
  // boost::optional<Message> getMsg(const char *msg) const {
  //   std::string line;
  //   auto msgLen = strlen(msg);
  //   while (std::getline(in, line)) {
  //     boost::trim(line);
  //     if (line == msg) {
  //       return Message(msg);
  //     }
  //     const char *cline = line.c_str();
  //     if (boost::starts_with(line, msg) && cline[msgLen] == ':') {
  //       Message ret(msg);
  //       msg.len = std::strtoul(cline + msgLen+1, cline + line.length(), 10);
  //       if (msg.len == 0 || msg.len >= 1024*128) {
  //         LOG(ERROR) << "msg to big:" << msg.len;
  //         return boost::none;
  //       }
  //       char c;
  //       for (auto i = 0; i < msg.len ; ++i)
  //         in.get(c);
  //         if (in.eof()) {
  //         }
  //         msg.content << c;
  //       }
  //       return ret;
  //     }
  //   }
  // };
  //
  // boost::optional<Message> sendMsg(const char *msg) {
  //   std::string dummy;
  //   return sendMsg(msg, dummy);
  // }
  // boost::optional<Message> sendMsg(const char *msg, const std::string &data) {
  //   out << msg;
  //   if (data.length) {
  //     out << ":" << data.length << std::endl;
  //     out << data;
  //   }
  // }

};

class Socket {
public:
  static const BUFSIZE = 4096;
  boost::asio::io_service &io;
  boost::asio::deadline_timer createTimer;
  std::string sockFname;
  struct sockaddr_un sockAddrLocal;
  struct sockaddr_un sockAddrRemote;
  bool isError;
  bool errNo;
  std::string errText;
  int soDesc;
  int listenSocket;
  std::unique_ptr<boost::asio::posix::stream_descriptor> asDesc;
  boost::asio::streambuf readBuf;

  typedef std::function<void(const boost::system::error_code&, const Message &msg)> MsgFunc;
  typedef std::function<void(const boost::system::error_code&)> ReadyFunc;


  bool create_socket(int &s) {
    s= socket(AF_UNIX, SOCK_STREAM, 0);
    if (s < 0) {
      isError = true;
      errNo = errno;
      errText = "can not create socket";
      return false;
    }
    return true;
  }


  bool create_local_sockaddr_un() {
    sockAddrLocal.sun_family = AF_UNIX;
    if (sockFname.length() >= sizeof(sockAddrLocal.sun_path)) {
      isError = true;
      errNo = 0;
      errText = "socket path is to long";
      return false;
    }
    strcpy(sockAddrLocal.sun_path, sockFname.c_str());
    return true;
  }

public:
  Socket(boost::asio::io_service &io) : io(io), soDesc(-1),
    listenSocket(-1), createTimer(io, boost::posix_time::milliseconds(100)),
    readBuf(4096) {
   }
  ~Socket() {
    if (soDesc >= 0) {
      close(soDesc);
    }
    if (listenSocket >= 0) {
      close(listenSocket);
    }
    memset(&sockAddrLocal, 0, sizeof(sockAddrLocal));
    memset(&sockAddrRemote, 0, sizeof(sockAddrRemote));
    for (auto i = sockFname.begin(); i != sockFname.end(); ++i) {
      *i = 'X';
    }
  }

  bool msgReceiver(MsgFunc func) {
    boost::asio::async_read_until(*asDesc, readBuf, "\r\n", func);
  }
  //   boost::asio::async_read_until(s, b, "\r\n", handler);
  //   asDesc.async_read_some(boost::asio::buffer(readBuf),
  //     [this](boost::system::error_code ec, std::size_t bytes_transferred) {
  //       // LOG(INFO) << "read:" << ec << ":" << bytes_transferred << std::endl;
  //       // LOG(DEBUG) << "Read(" << buf.size() << ":" << pa.myFd->getFd() << ", " << ec << ", " << bytes_transferred << ")[" << "..." << "]";
  //       if (ec == boost::asio::error::eof || !ec) {
  //         Message msg(readBuf.begin(), readBuf.begin()+bytes_transferred);
  //         for (auto o = readBuf.begin(); o != readBuf.begin()+bytes_transferred; ++o) {
  //             *o = 'X';
  //         }
  //         (func)(ec, msg);
  //         msgReceiver(func);
  //       } else {
  //         Message msg(readBuf.begin(), readBuf.begin());
  //         (func)(ec, msg);
  //       }
  //     });
  //   return true;
  // }

  bool sendMsg(const std::string &msg) {
    boost::asio::async_write(*asDesc, boost::asio::buffer(buf, len),
      [this, buf, len](const boost::system::error_code &ec,
        std::size_t bytes_transferred) -> bool {
    })
  }

  bool waitConnectSocketFile(const std::string &fname, ReadyFunc func, int fileMode = 0600);

  bool connectSocketFile(const std::string &fname, int fileMode = 0600) {
    // Socket socket(sockFname);
    if (!create_socket(soDesc)) {
      LOG(ERROR) << "create_socket:" << socket;
      return false;
    }
    if (!create_local_sockaddr_un()) {
      close(soDesc); soDesc = -1;
      LOG(ERROR) << "create_local_sockaddr_un:" << socket;
      return false;
    }
    int pMask = umask(~fileMode & (0x1000-1));
    if (connect(soDesc, (struct sockaddr *)&sockAddrLocal, sizeof(sockAddrLocal)) < 0) {
      close(soDesc); soDesc = -1;
      isError = true;
      errNo = errno;
      errText = "socket connect failed";
      // LOG(ERROR) << "connect:" << errno;
      return false;
    }
    chmod(sockFname.c_str(), 0600);
    umask(pMask);
    isError = false;
    errNo = 0;
    asDesc =
      std::unique_ptr<boost::asio::posix::stream_descriptor>(
        new boost::asio::posix::stream_descriptor(io, soDesc));
    return true;
  }

  bool createSocketFile(const std::string &fname, int fileMode = 0600) {
    LOG(INFO) << "createSocketFile:" << fname;
    sockFname = fname;
    if (!create_socket(listenSocket)) {
      LOG(INFO) << "create_socket:" << fname;
      return false;
    }
    if (!create_local_sockaddr_un()) {
      LOG(INFO) << "create_local_sockaddr_un:" << fname;
      close(listenSocket); listenSocket = -1;
      return false;
    }
    int pMask = umask(~fileMode & (0x1000-1));
    if (bind(listenSocket, (struct sockaddr *)&sockAddrLocal, sizeof(sockAddrLocal)) < 0) {
      LOG(INFO) << "bind:" << fname;
      close(listenSocket); listenSocket = -1;
      isError = true;
      errNo = errno;
      errText = "socket bind(listenSocket) failed";
      return false;
    }
    chmod(sockFname.c_str(), 0600);
    umask(pMask);
    if (listen(listenSocket, 1) < 0) {
      LOG(INFO) << "listen:" << fname;
      close(listenSocket); listenSocket = -1;
      isError = true;
      errNo = errno;
      errText = "socket listen failed";
      return false;
    }
    socklen_t len = sizeof(sockAddrRemote);
    soDesc = accept(listenSocket, (struct sockaddr *)&sockAddrRemote, &len);
    if (soDesc < 0) {
      LOG(INFO) << "accept:" << fname;
      close(listenSocket); listenSocket = -1;
      isError = true;
      errNo = errno;
      errText = "socket accept failed";
      return false;
    }
    close(listenSocket); listenSocket = -1;
    isError = false;
    errNo = 0;
    asDesc = std::unique_ptr<
      boost::asio::posix::stream_descriptor>(
        new boost::asio::posix::stream_descriptor(io, soDesc));
    return true;
  }


};

  std::ostream& operator<<(std::ostream &o, const Socket &socket) {
    o << "Socket{sockFname:" << socket.sockFname
      << ",isError:" << socket.isError
      << ",errNo:" << socket.errNo
      << ",errText:" << socket.errText
      << ",soDesc:" << socket.soDesc
      << ",listenSocket:" << socket.listenSocket << "}";
    return o;
  }

bool Socket::waitConnectSocketFile(const std::string &fname, ReadyFunc func, int fileMode) {
  sockFname = fname;
  createTimer.async_wait([this, &fname, func, fileMode](const boost::system::error_code& err){
    std::cout << "waitConnectSocketFile:loop:" << err << ":" << *this << std::endl;
    if (err != 0 || this->connectSocketFile(fname, fileMode)) {
      func(err);
    } else {
      this->createTimer.expires_from_now(boost::posix_time::milliseconds(100));
      this->waitConnectSocketFile(fname, func, fileMode);
    }
  });
  return true;
}


#endif
