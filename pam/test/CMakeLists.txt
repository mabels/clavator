cmake_minimum_required(VERSION 2.8.7)
project (pamClavatorTest)
#SET(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${pamClavatorTest_SOURCE_DIR}/${CMAKE_BUILD_TYPE}/${CMAKE_SYSTEM_NAME})
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -Wall -Wextra -DTEST -g")
if (${CMAKE_COMPILER_IS_GNUCXX})
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pthread")
endif()

set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS} -g")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS} -O3 -g")


#set(CMAKE_SHARED_LINKER_FLAGS="-lprofiler -ltcmalloc")


enable_testing()

find_package(Boost 1.54.0 COMPONENTS system regex REQUIRED)
include_directories(${Boost_INCLUDE_DIR})

find_package(Threads REQUIRED)

add_executable(test_ssh_authorized_keys test_ssh_authorized_keys.cpp)
add_test(test_ssh_authorized_keys test_ssh_authorized_keys)

add_executable(test_list_secret_keys test_list_secret_keys.cpp)
add_test(test_list_secret_keys test_list_secret_keys)
target_link_libraries(test_list_secret_keys ${Boost_LIBRARIES})

add_executable(test_gpg_card_status test_gpg_card_status.cpp)
add_test(test_gpg_card_status test_gpg_card_status)
target_link_libraries(test_gpg_card_status ${Boost_LIBRARIES})

add_executable(test_pem test_pem.cpp)
add_test(test_pem test_pem)
target_link_libraries(test_pem ${Boost_LIBRARIES})

add_executable(test_asn1 test_asn1.cpp)
add_test(test_asn1 test_asn1)
target_link_libraries(test_asn1 ${Boost_LIBRARIES})

add_executable(test_cert_match_ssh_auth test_cert_match_ssh_auth.cpp)
add_test(test_cert_match_ssh_auth test_cert_match_ssh_auth)
target_link_libraries(test_cert_match_ssh_auth ${Boost_LIBRARIES})

add_executable(test_oid test_oid.cpp)
add_test(test_oid test_oid)
target_link_libraries(test_oid ${Boost_LIBRARIES})
