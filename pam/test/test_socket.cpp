
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

int main() {
  describe("Socket", []() {
    it("PingPongStop", []() {
      auto uuid = create_challenge();
      auto id = "/tmp/pingPong."+uuid.substr(uuid.length()-6, uuid.length());
      std::thread ping([&id](){
        boost::asio::io_service io;
        Socket sPing(io);
        boost::asio::deadline_timer createTimer(io, boost::posix_time::milliseconds(500));
        createTimer.async_wait([&sPing, &id](const boost::system::error_code&){
          sPing.createSocketFile(id);
          sPing.msgReceiver([&sPing](const boost::system::error_code&, const Message &msg){
            std::cout << "sPing:" << std::endl;
            it("sPing", [&msg]() {
              assert.equal("Ping", msg.data);
            });
            sPing.sendMsg("Pong");
            sPing.io.stop();
          });
        });
        io.run();
      });
      std::thread pong([&id](){
        boost::asio::io_service io;
        Socket sPong(io);
        sPong.waitConnectSocketFile(id, [&sPong](const boost::system::error_code&) {
          sPong.msgReceiver([&sPong](const boost::system::error_code&, const Message &msg){
            std::cout << "sPong:" << std::endl;
            it("sPong", [&msg]() {
              assert.equal("Pong", msg.data);
            });
            sPong.io.stop();
          });
          sPong.sendMsg("Ping");
        });
        io.run();
      });
      ping.join();
      pong.join();
    });
  });
  exit();
}
