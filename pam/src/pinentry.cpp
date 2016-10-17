/*
 * just passes stdin to the socket
 * just read the socket and send to stdout
 */

// #include <ext/stdio_filebuf.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <sys/un.h>

#include <pwd.h>
#include <sys/types.h>

#include <string>
#include <thread>


#define BOOST_ASIO_DISABLE_EPOLL
#include <boost/iostreams/copy.hpp> // uuid class

#include <boost/uuid/uuid.hpp>            // uuid class
#include <boost/uuid/uuid_generators.hpp> // generators
#include <boost/uuid/uuid_io.hpp>         // streaming operators etc.

#include <boost/asio.hpp>
#include <boost/asio/local/stream_protocol.hpp>

#define ELPP_THREAD_SAFE
#include "easylogging++.h"

namespace posix = boost::asio::posix;

INITIALIZE_EASYLOGGINGPP

std::string getSockFname() {
  boost::uuids::uuid uuid = boost::uuids::random_generator()();
  struct sockaddr_un addr;
  memset(&addr, 0, sizeof(addr));
  addr.sun_family = AF_UNIX;
  struct passwd *pwd = getpwuid(getuid());
  std::stringstream socket_path;
  socket_path << "/run/pam_clavator/S." << pwd->pw_name << "/" << uuid;
  LOG(INFO) << socket_path.str();
  if (socket_path.str().length() + 1 >= sizeof(addr.sun_path)) {
    LOG(ERROR) << "socket path to long:" << socket_path.str();
    exit(-1);
  }
  return socket_path.str();
}

// static volatile bool loop = true;

void stop(boost::asio::local::stream_protocol::socket &socket) {
  socket.get_io_service().stop();
}

void toStdout(boost::asio::local::stream_protocol::socket &socket,
              posix::stream_descriptor &cout, boost::asio::streambuf &coutBuf) {
  boost::asio::async_read(
      socket, coutBuf, boost::asio::transfer_at_least(1),
      [&socket, &cout, &coutBuf](boost::system::error_code const &err,
                                 std::size_t ) {
        if (err) {
          LOG(ERROR) << "socket read failed:" << err;
          stop(socket);
          return;
        }
        boost::asio::async_write(
            cout, coutBuf,
            [&socket, &cout, &coutBuf](boost::system::error_code const &err,
                                       std::size_t ) {
              if (err) {
                LOG(ERROR) << "socket write failed:" << err;
                stop(socket);
                return;
              }
              toStdout(socket, cout, coutBuf);
            });
      });
}

void fromStdin(boost::asio::local::stream_protocol::socket &socket,
               posix::stream_descriptor &cin, boost::asio::streambuf &cinBuf) {
  boost::asio::async_read(
      cin, cinBuf, boost::asio::transfer_at_least(1),
      [&socket, &cin, &cinBuf](boost::system::error_code const &err,
                               std::size_t ) {
        if (err) {
          LOG(ERROR) << "cin read failed:" << err;
          stop(socket);
          return;
        }
        boost::asio::async_write(
            socket, cinBuf,
            [&socket, &cin, &cinBuf](boost::system::error_code const &err,
                                     std::size_t ) {
              if (err) {
                LOG(ERROR) << "socket write failed:" << err;
                stop(socket);
                return;
              }
              fromStdin(socket, cin, cinBuf);
            });
      });
}

int main(int argc, char *argv[]) {
  START_EASYLOGGINGPP(argc, argv);

  boost::system::error_code error;
  boost::asio::io_service io_service;
  boost::asio::streambuf cinBuf;
  boost::asio::streambuf coutBuf;
  posix::stream_descriptor cin(io_service);
  cin.assign(STDIN_FILENO, error);
  if (error) {
   LOG(ERROR) << "cin=" << error.message();
   return -1;
  }
  posix::stream_descriptor cout(io_service);
  cout.assign(STDOUT_FILENO, error);
  if (error) {
   LOG(ERROR) << "cout=" << error.message();
   return -1;
  }

  auto sockFname = getSockFname();

  ::unlink(sockFname.c_str()); // Remove previous binding.
  boost::asio::local::stream_protocol::endpoint ep(sockFname.c_str());
  boost::asio::local::stream_protocol::acceptor acceptor(io_service, ep);
  boost::asio::local::stream_protocol::socket socket(io_service);
  try {
    acceptor.accept(socket);
    LOG(INFO) << "accept:";
    fromStdin(socket, cin, cinBuf);
    toStdout(socket, cout, coutBuf);
    io_service.run();
  } catch (std::exception &e) {
    LOG(ERROR) << "Exception: " << e.what();
  }

  // std::thread tt([cl]() {
  //   LOG(INFO) << "cin handler started:" << cl;
  //   __gnu_cxx::stdio_filebuf<char> sockFbuf(cl, std::ios::out); // 1
  //   std::ostream socketStream(&sockFbuf); // 2
  //   __gnu_cxx::stdio_filebuf<char> cinFbuf(0, std::ios::in); // 1
  //   std::istream cinStream(&cinFbuf); // 2
  //   socketStream << "lolo" << std::endl;
  //   boost::iostreams::copy(cinStream, socketStream, 1);
  //   LOG(INFO) << "cin handler done";
  // });
  // LOG(INFO) << "cout handler started:" << cl;
  // __gnu_cxx::stdio_filebuf<char> filebuf(cl, std::ios::in); // 1
  // std::istream socketStream(&filebuf); // 2
  // //std::fstream socketStream(fdopen(cl, "r"));
  // boost::iostreams::copy(socketStream, std::cout, 1);
  // LOG(INFO) << "cout handler done";
  // tt.join();
  exit(0);
}
