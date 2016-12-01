
#include <chrono>
#include <thread>

#include <boost/uuid/random_generator.hpp>
#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_io.hpp>

#include <boost/algorithm/string.hpp>

#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/socket.hpp"


#include <easylogging++.h>
INITIALIZE_EASYLOGGINGPP

std::string create_challenge() {
  boost::uuids::random_generator gen;
  auto challenge = boost::uuids::to_string(gen());
  std::vector<std::string> strs;
  boost::split(strs, challenge, boost::is_any_of("-"));
  return boost::algorithm::join(strs, "");
}


void sendBytePerByte(Socket &sPong, const std::string &strping, std::string::iterator i_strping) {
  if (strping.end() == i_strping) {
    return;
  }
  char buf[2] = { *i_strping , 0};
  sPong.sendMsg(buf, [&sPong, &strping, i_strping](const boost::system::error_code&ec, const size_t) {
    if (ec) {
      it("sPong SendMsg", [ec]() {
        assert.equal(!!ec, false);
      });
    }
    sendBytePerByte(sPong, strping, i_strping+1);
    return true;
  });
}


int main() {
  describe("Socket", []() {
    it("PingPongStop", []() {
      auto lostFd = open("/dev/null", O_RDONLY);
      close(lostFd);
      auto uuid = create_challenge();
      auto id = "/tmp/pingPong."+uuid.substr(uuid.length()-6, uuid.length());
      std::thread ping([&id](){
        boost::asio::io_service io;
        Socket sPing(io);
        int count = 0;
        boost::asio::deadline_timer createTimer(io, boost::posix_time::milliseconds(500));
        createTimer.async_wait([&sPing, &id, &count](const boost::system::error_code&){
          sPing.createSocketFile(id);
          sPing.msgReceiver([&sPing, &count](const boost::system::error_code&ec, const Message &msg){
            //LO << "sPing:" << std::endl;
            if (ec) {
              sPing.io.stop();
              return true;
            }
            if (!boost::starts_with(msg.data, "Ping")) {
              it("sPing", [&msg]() {
                assert.equal(boost::starts_with(msg.data, "Ping"), true);
              });
            }
            if (boost::starts_with(msg.data, "Ping")) {
              std::stringstream spong;
              spong << "Pong " << count++ << "\n";
              sPing.sendMsg(spong.str(), [](const boost::system::error_code&ec, const size_t) {
                if (ec) {
                  it("sPing SendMsg", [&ec]() {
                    assert.equal(!!ec, false);
                  });
                }
                return true;
              });
            }
            return true;
          });
        });
        io.run();
        it("sPing-end", [&count]() {
          assert.equal(count, 101);
        });
      });
      std::thread pong([&id](){
        boost::asio::io_service io;
        Socket sPong(io);
        int count = 100;
        std::string strping;
        sPong.waitConnectSocketFile(id, [&sPong, &count, &strping](const boost::system::error_code&) {
          // std::cout << "Wait completed" << std::endl;
          sPong.msgReceiver([&sPong, &count, &strping](const boost::system::error_code&, const Message &msg){
            //std::cout << "sPong:" << count << std::endl;
            if (!boost::starts_with(msg.data, "Pong")) {
              it("sPong", [&msg]() {
                assert.equal(boost::starts_with(msg.data, "Pong"), true);
              });
            }
            if (--count >= 0) {
              std::stringstream sping;
              sping << "Ping " << count << "\n";
              strping = sping.str();
              auto i_strping = strping.begin();
              sendBytePerByte(sPong, strping, i_strping);
            } else {
              sPong.io.stop();
            }
            return true;
          });
          std::stringstream sping;
          sping << "Ping " << count << "\n";
          strping = sping.str();
          auto i_strping = strping.begin();
          sendBytePerByte(sPong, strping, i_strping);
          // sPong.sendMsg("Ping\n");
        });
        io.run();
        it("sPong-end", [&count]() {
          assert.equal(count, -1);
        });
      });
      ping.join();
      pong.join();
      it("Lostfd", [lostFd]{
        auto tryFd = open("/dev/null", O_RDONLY);
        close(tryFd);
        assert.equal(lostFd, tryFd);
      });
    });
  });
  exit();
}
