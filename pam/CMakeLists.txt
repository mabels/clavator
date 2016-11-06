cmake_minimum_required (VERSION 2.8.7)
#include(CTest)
project (pamClavator)
#SET(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${pamClavator_SOURCE_DIR}/${CMAKE_BUILD_TYPE}/${CMAKE_SYSTEM_NAME})
#SET(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${pamClavator_SOURCE_DIR}/${CMAKE_BUILD_TYPE}/${CMAKE_SYSTEM_NAME})
#SET(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${pamClavator_SOURCE_DIR}/${CMAKE_BUILD_TYPE}/${CMAKE_SYSTEM_NAME})
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -Wall -Wextra")

if (${CMAKE_COMPILER_IS_GNUCXX})
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pthread -g")
endif()

set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS} -g")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS} -O3 -g")

if(NOT GITBASE)
  set(GITBASE https://github.com)
endif()


#Only tested with versions 1.55 and 1.56
find_package(Boost 1.54.0 COMPONENTS system regex filesystem REQUIRED)
include_directories(${Boost_INCLUDE_DIR})

if(APPLE)
  set(CMAKE_MACOSX_RPATH 1)
  set(OPENSSL_ROOT_DIR "/usr/local/opt/openssl")
endif()

include(CMakeLists-easyloggingpp.txt)
include(CMakeLists-cascara.txt)



#set(SIMPLEWEB_INCLUDE_DIR "${CMAKE_SOURCE_DIR}/3rdparty/Simple-WebSocket-Server")
#TODO: add requirement for version 1.0.1g (can it be done in one line?)
find_package(OpenSSL REQUIRED)
#find_package(PAM REQUIRED)
include_directories(${OPENSSL_INCLUDE_DIR})
#include_directories(${SIMPLEWEB_INCLUDE_DIR})

#find_package(Threads REQUIRED)

#include_directories(.)
set(CMAKE_SHARED_LINKER_FLAGS "-lpam")
#set(CMAKE_STATIC_LINKER_FLAGS "-lpam")

#file(GLOB SOURCES "src/*.cpp")
add_library(pamClavator SHARED src/pam_clavator.cpp src/pipe_writer.cpp)
target_link_libraries(pamClavator ${Boost_LIBRARIES})

#add_library(pamClavatorStatic STATIC src/pam_clavator.cpp)
#target_link_libraries(pamClavatorStatic ${Boost_LIBRARIES})
#set_target_properties(pamClavatorStatic PROPERTIES OUTPUT_NAME pamClavator)


install(TARGETS pamClavator 
        RUNTIME DESTINATION bin
        LIBRARY DESTINATION lib
        ARCHIVE DESTINATION lib/static)
install(DIRECTORY src/ DESTINATION include/pamClavator FILES_MATCHING PATTERN "*.hpp")

enable_testing()
add_subdirectory(test)
