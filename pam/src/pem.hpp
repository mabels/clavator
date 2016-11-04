#ifndef __PEM__
#define __PEM__

#include <string>
#include <vector>

#include <boost/algorithm/string.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/optional.hpp>

#include "base64.hpp"
#include "oid.hpp"
#include "asn1.hpp"

#include <easylogging++.h>

class PubKey {
public:
  std::string key;
  std::string modulus;
  std::string serial;
  bool operator==(const PubKey& obj) const {
    return this->key == obj.key && this->modulus == obj.modulus &&
           this->serial == obj.serial;
  }
};

class Pem {
public:
  std::string type;
  std::vector<std::string> base64;
  std::string binary;

  bool operator==(const Pem& obj) const {
    return this->type == obj.type &&
           std::equal(this->base64.begin(), this->base64.end(), obj.base64.begin()) &&
           this->binary == obj.binary;
  }

  boost::optional<std::vector<Asn1>::const_iterator> getCommonName(PubKey &pk, const Oid &oid,
    std::vector<Asn1>::const_iterator i, std::vector<Asn1>::const_iterator end) const {
    if (oid.toString() == "2.5.4.3") {
      if (++i == end) {
        LOG(ERROR) << "early end";
        return boost::none;
      }
      auto pstring = *i;
      //pstring.dump();
      if (pstring.type != ((uint8_t)0x13)) {
        LOG(ERROR) << "no PRINTABLESTRING:" << (size_t)(pstring.type);
        return boost::none;
      }
      pk.serial = std::string(pstring.data_begin, pstring.data_end);
    }
    return i;
  }

  boost::optional<std::vector<Asn1>::const_iterator> getSha256WithRSAEncryption(PubKey &pk, const Oid &oid,
    std::vector<Asn1>::const_iterator i, std::vector<Asn1>::const_iterator end) const {
    if (oid.toString() == "1.2.840.113549.1.1.1") {
      i = Asn1::skip(0x05, ++i, end);
      if (i->type != ((uint8_t)3)) {
        LOG(ERROR) << "illegal type";
        return boost::none;
      }
      auto skippedNull = i->data_begin;
      for (;skippedNull != i->data_end && *skippedNull == 0; ++skippedNull) {
      }
      auto bit_string = Asn1::read(skippedNull, i->data_end);
      if (bit_string.size() != 1) {
        LOG(ERROR) << "illegal bit_string size";
        return boost::none;
      }
      if (bit_string[0].type != ((uint8_t)0x30)) {
        LOG(ERROR) << "illegal type 0x30";
        return boost::none;
      }
      if (bit_string[0].contains.size() != 2) {
        LOG(ERROR) << "illegal contains size not 2";
        return boost::none;
      }
      if (bit_string[0].contains[0].type != ((uint8_t)0x2)) {
        LOG(ERROR) << "illegal contains type 0x2";
        return boost::none;
      }
      if (bit_string[0].contains[1].type != ((uint8_t)0x2)) {
        LOG(ERROR) << "illegal contains type 0x2";
        return boost::none;
      }
      std::string pubKey(bit_string[0].contains[0].data_begin, bit_string[0].contains[0].data_end);
      std::string modulus(bit_string[0].contains[1].data_begin, bit_string[0].contains[1].data_end);
      if (modulus.size() == 0 || pubKey.size() == 0) {
        LOG(ERROR) << "modulus or pubKey has size 0";
        return boost::none;
      }
      pk.key = pubKey;
      pk.modulus = modulus;
    }
    return i;
  }

  boost::optional<PubKey> pubKey() const {
    auto asn1 = Asn1::read(binary.begin(), binary.end());
    if (asn1.size() != 1) {
      return boost::none;
    }
    auto asn1s = Asn1::flat(asn1);
    PubKey pk;
    for (std::vector<Asn1>::const_iterator i = asn1s.begin(); i != asn1s.end(); ++i) {
      auto const &asn1 = *i;
        if (asn1.type == 0x06) {
            auto ooid = Oid::read(asn1.data_begin, asn1.data_end);
            if (ooid == boost::none) {
              LOG(ERROR) << "oid defect" << std::endl;
              return boost::none;
            }
            auto const &oid = *ooid;
            //LOG(INFO) << "found oid=" << oid.toString();
            auto commonName = getCommonName(pk, oid, i, asn1s.end());
            if (commonName == boost::none) {
              LOG(ERROR) << "commonName defect" << std::endl;
              return boost::none;
            }
            i = *commonName;
            auto sha1WithRSAEncryption = getSha256WithRSAEncryption(pk, oid, i, asn1s.end());
            if (sha1WithRSAEncryption == boost::none) {
              LOG(ERROR) << "sha1WithRSAEncryption defect" << std::endl;
              return boost::none;
            }
            i = *sha1WithRSAEncryption;
        }
    }
    return pk;
  }

  static std::vector<Pem> read(std::istream &istream) {
    bool inBlock = false;
    std::string endPattern;
    std::string type;
    std::vector<Pem> ret;
    std::vector<std::string> vecBase64;
    std::string line;
    while (std::getline(istream, line)) {
      boost::trim(line);
      // std::cerr << boost::starts_with(line, "-----BEGIN ") << ":"
        // << boost::ends_with(line, "-----")
        // << "[" << line << "]" << std::endl;
      if (boost::starts_with(line, "-----BEGIN ") &&
          boost::ends_with(line, "-----")) {
          type = std::string(line.begin() + (sizeof("-----BEGIN ")-1),
                              line.end()-(sizeof("-----")-1));
          endPattern = "-----END " + type + "-----";
          // std::cerr << "[" << endPattern << "]" << std::endl;
          vecBase64.clear();
          inBlock = true;
          continue;
      } else if (line == endPattern) {
        inBlock = false;
        Pem pem;
        pem.type = type;
        pem.base64 = vecBase64;
        std::string str = boost::algorithm::join(vecBase64, "");
        // std::cerr << "[" << str << "]" << std::endl;
        pem.binary = Base64::decode(str);
        ret.push_back(pem);
        continue;
      }
      if (!inBlock) {
        continue;
      }
      vecBase64.push_back(line);
    }
    return ret;
  }
};

#endif
