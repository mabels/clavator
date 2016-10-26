#ifndef __ASN1__
#define __ASN1__

#include <string>
#include <iomanip>

#include "option.hpp"
/*
ASN.1
openssl asn1parse -inform PEM -in pem
 0x30 0x82 xx xx  -> xx length total
 0x30 0x82 yy yy  -> yy length ????
 0xa0 0x03 cons 0
 0x02 0x01 0x02 prim  integer
 0x02 0x01 0x01 prim  integer
 0x30 0x0d=len
 0x06 0x09 -> "2a", "86", "48", "86", "f7", "0d", "01", "01", "05"
              sha1WithRSAEncryption
 0x05 0x00
 0x30 0x2c seq
 0x31 0x2a set
 0x30 0x28 seq
 0x6  0x03 prim object common name
 0x13 0x21 printable string .... (CN)
 0x30 0x20
 0x17 0x0d UTCTIME 010101010Z
 0x18 0x0f GENERALIZEDTIME
 0x30 0x2c
 0x31 0x2a
 0x30 0x28
 0x6  0x03
 0x13 0x21
 */

//  enum { CONS, PRIM } Asn1SeqPrim;
//  enum {
//    SET = 0x31,
//    SEQUENCE = 0x30,
//    cont,
//    INTEGER,
//    OBJECT,
//    PRINTABLE,
//    UTCTIME,
//    GENERALIZEDTIME,
//    BIT_STRING,
//    BOOLEAN,
//    OCTET_STRING,
//    NULL
//  } Asn1Type;
//
//
// typedef struct S_Asn1Range {
//    std::string::const_iterator begin;
//    std::string::const_iterator end;
//  } Asn1Range;
//
//  class Asn1Action {
//  public:
//    const Asn1Type type;
//    const Asn1SeqPrim seqPrim;
//    typedef std::function<Asn1Range(Asn1Range &r)> Parser;
//    Parser parser;
//
//    Asn1Action(Asn1Type type, Asn1SeqPrim seqPrim, Parser parser) :
//     type(type), seqPrim(seqPrim), parser(parser) {}
//  };
//
//  class Asn1Entry {
//    const Asn1Action &action;
//    size_t len;
//    Asn1Action(const Asn1Action &action, std::string::const_iterator begin, std::string::const_iterator end) :
//     action(action), begin(begin), end(end) {}
//  };


class Asn1 {

  // static

  // static Range seq_set(const Range &r) {
  //     uint16_t len = *(r.begin+1);
  //     uint16_t ofs = 2;
  //     if (len == 0x82) {
  //       len = (*(r.begin+2)<<8) | *(r.begin+3);
  //       ofs = 4;
  //     }
  //     return Range(r.begin+ofs, r.begin+ofs+len);
  // }
  //
  // std::map<uint8_t, Asn1Item> &actors() {
  //   static std::set<Asn1Action> actors = {
  //     Asn1Item(0x30, ),
  //     Asn1Item(0x31, ),
  //     Asn1Item(0xa0, ),
  //     Asn1Item(0x02, ),
  //     Asn1Item(0x05, ),
  //     Asn1Item(0x06, ),
  //     Asn1Item(0x13, ),
  //     Asn1Item(0x17, ),
  //     Asn1Item(0x18, )
  //   }
  //   return actors;
  // }

public:
  uint8_t type;
  size_t  hlen;
  size_t  len;
  size_t  level;
  ssize_t  ofs;
  std::string::const_iterator data_begin;
  std::string::const_iterator data_end;
  std::vector<Asn1> contains;

  static Option<Asn1> parseItem(std::string::const_iterator begin, std::string::const_iterator end) {
      Asn1 ret;
      if (begin == end) { return None<Asn1>(); }
      ret.type = *begin++;
      if (begin == end) { return None<Asn1>(); }
      ret.len = ((uint8_t)(*begin++));
      ret.hlen = 2;
      if ((ret.type & 0xa0) == 0xa0) {
          ret.data_begin = begin;
          ret.data_end = begin;
          return Some(ret);
      }
      if ((ret.len & 0x80) == 0x80) {
        size_t len = ret.len & 0x7f;
        size_t bits = 8 * (len-1);
        ret.hlen += len;
        ret.len = 0;
        for (size_t i = 0; i < len; ++i) {
          if (begin == end) { return None<Asn1>(); }
          ret.len += ((uint8_t)(*begin++)) << bits;
          bits -= 8;
        }
      }
      // if (ret.len == 0x81) {
      //   ret.hlen = 3;
      //   if (begin == end) { return None<Asn1>(); }
      //   ret.len = ((uint8_t)(*begin++));
      // } else if (ret.len == 0x82) {
      //    ret.hlen = 4;
      //    if (begin == end) { return None<Asn1>(); }
      //    uint8_t high = *begin++;
      //    if (begin == end) { return None<Asn1>(); }
      //    uint8_t low = *begin++;
      //    ret.len = high<<8 | low;
      // } else if (ret.len == 0x84) {
      //    ret.hlen = 6;
      //    if (begin == end) { return None<Asn1>(); }
      //    uint8_t b24 = *begin++;
      //    if (begin == end) { return None<Asn1>(); }
      //    uint8_t b16 = *begin++;
      //    if (begin == end) { return None<Asn1>(); }
      //    uint8_t b8 = *begin++;
      //    if (begin == end) { return None<Asn1>(); }
      //    uint8_t b0 = *begin++;
      //    ret.len = b24<<24 | b16<<16 | b8<<8 | b0;
      // }
      ret.data_begin = begin;
      auto diff = end-begin;
      if (diff < 0 && ret.len > ((size_t)diff) ) {
        return None<Asn1>();
      }
      ret.data_end = begin+ret.len;
      return Some(ret);
  }
  static std::vector<Asn1> read(std::string::const_iterator begin, std::string::const_iterator end) {
    return read(begin, end, begin, 0);
  }

  static std::vector<Asn1> read(std::string::const_iterator begin, std::string::const_iterator end, std::string::const_iterator base, size_t level) {
    std::vector<Asn1> ret;
    while (true) {
      auto oasn1 = parseItem(begin, end);
      if (oasn1.isNone()) {
          break;
      }
      auto &asn1 = oasn1.unwrap();
      asn1.level = level;
      asn1.ofs = begin - base;

      // std::cerr << std::setw(5) << asn1.ofs
      //     << ":dn=" << asn1.level
      //     << "  hl=" << asn1.hlen
      //     << " l=" << std::setw(4) << asn1.len
      //     << " t=" << std::hex << ((size_t)asn1.type) << std::dec
      //     << std::endl;

      if (asn1.type == 0x30 || asn1.type == 0x31) {
           asn1.contains = read(asn1.data_begin, asn1.data_end, base, level+1);
      }
      ret.push_back(asn1);
      begin = asn1.data_end;
    }
    return ret;
  }
  typedef std::function<void(const Asn1 &)> Asn1Action;

  static std::vector<Asn1> flat(const std::vector<Asn1> &vasn1) {
    std::vector<Asn1> ret;
    walk(vasn1, [&ret](const Asn1 &asn1) {
      // std::cerr << "." << std::endl;
      ret.push_back(asn1);
    });
    return ret;
  }

  static void dump(const std::vector<Asn1> &vasn1) {
    walk(vasn1, [](const Asn1 &asn1) {
      std::cerr << std::setw(5) << asn1.ofs
          << ":dn=" << asn1.level
          << "  hl=" << asn1.hlen
          << " l=" << std::setw(4) << asn1.len
          << " t=" << std::hex << ((size_t)asn1.type) << std::dec
          << std::endl;
    });
  }

  static void walk(const std::vector<Asn1> &vasn1, Asn1Action action) {
    for (auto &asn1 : vasn1) {
      (action)(asn1);
      walk(asn1.contains, action);
    }
  }

  static std::vector<Asn1>::const_iterator skip(uint8_t type, std::vector<Asn1>::const_iterator begin, std::vector<Asn1>::const_iterator end) {
    size_t ofs;
    for (ofs = 0; (begin+ofs) != end && ((begin+ofs)->type == type); ++ofs) {
    }
    return begin + ofs;
  }


};

#endif
