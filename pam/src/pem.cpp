
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

 enum { CONS, PRIM } Asn1SeqPrim;
 enum {
   SET = 0x31,
   SEQUENCE = 0x30,
   cont,
   INTEGER,
   OBJECT,
   PRINTABLE,
   UTCTIME,
   GENERALIZEDTIME,
   BIT_STRING,
   BOOLEAN,
   OCTET_STRING,
   NULL
 } Asn1Type;


typedef struct S_Asn1Range {
   std::string::const_iterator begin;
   std::string::const_iterator end;
 } Asn1Range;

 class Asn1Action {
 public:
   const Asn1Type type;
   const Asn1SeqPrim seqPrim;
   typedef std::function<Asn1Range(Asn1Range &r)> Parser;
   Parser parser;

   Asn1Action(Asn1Type type, Asn1SeqPrim seqPrim, Parser parser) :
    type(type), seqPrim(seqPrim), parser(parser) {}
 };

 class Asn1Entry {
   const Asn1Action &action;
   size_t len;
   Asn1Action(const Asn1Action &action, std::string::const_iterator begin, std::string::const_iterator end) :
    action(action), begin(begin), end(end) {}
 };

class Asn1 {

  static Range seq_set(const Range &r) {
      uint16_t len = *(r.begin+1);
      uint16_t ofs = 2;
      if (len == 0x82) {
        len = (*(r.begin+2)<<8) | *(r.begin+3);
        ofs = 4;
      }
      return Range(r.begin+ofs, r.begin+ofs+len);
  }

  std::map<uint8_t, Asn1Item> &actors() {
    static std::set<Asn1Action> actors = {
      Asn1Item(0x30, ),
      Asn1Item(0x31, ),
      Asn1Item(0xa0, ),
      Asn1Item(0x02, ),
      Asn1Item(0x05, ),
      Asn1Item(0x06, ),
      Asn1Item(0x13, ),
      Asn1Item(0x17, ),
      Asn1Item(0x18, )
    }
    return actors;
  }
};



class Pem {
public:
  std::string type;
  std::string base64;
  std::string binary;
  static std::vector<Pem> read(std::istream &istr) {
    bool inBlock = false;
    std::string endPattern;
    std::stringstream base64;
    std::string type;
    std::vector<Pem> ret;
    while (std::getline(istream, line)) {
      if (boost::starts_with(line, "-----BEGIN ") &&
          boost::ends_with(line, "-----")) {
          type = std::string(line.begin() + (sizeof("-----BEGIN ")-1),
                              line.end()-(sizeof("-----")-1));
          endPattern = "-----BEGIN " + type + "-----";
          base64 = std::stringstream();
          inBlock = true;
      } else if (line == endPattern) {
        inBlock = false;
        Pem pem;
        pem.type = type;
        pem.base64 = base64.str();
        pem.binary = Base64.decode(pem.base64);
        ret.push_back(pem)
      }
      if (!inBlock) {
        continue;
      }
      base64 << str;
    }
    return ret;
  }
};
