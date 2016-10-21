


#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/pem.hpp"

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

int main() {
  describe('Pem', []() -> {

    it("read", []() -> {
      std::stringstream s2;
      for (size_t i = 0; i < 3; ++i) {
        s2 << "-----BEGIN CERTIFICATE-----\n";
        s2 << "MIICKDCCAZGgAwIBAgIBATANBgkqhkiG9w0BAQUFADAsMSowKAYDVQQDEyFUaGUg\n";
        s2 << "U1RFRUQgU2VsZi1TaWduaW5nIE5vbnRob3JpdHkwIBcNMTExMTExMDAwMDAwWhgP\n";
        s2 << "MjEwNjAyMDYwMDAwMDBaMCwxKjAoBgNVBAMTIVRoZSBTVEVFRCBTZWxmLVNpZ25p\n";
        s2 << "bmcgTm9udGhvcml0eTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAk2h9kqe8\n";
        s2 << "0eb8ESY7UGV6j6S5zuP5DiM4TWJ3jKG2y+D2CyA1Sl90iZ6zyN3zCB0yR1xxhpuw\n";
        s2 << "xdrwBRovRFludAbx3MeynYhzXkk0Hwn038q1oIt2YUw3Igz34s24o455ZE86JQ/6\n";
        s2 << "5dC7ppF8Z1I9KBL96NO+qZR/alVAKxYAwS8CAwEAAaNYMFYwEgYDVR0TAQH/BAgw\n";
        s2 << "BgEB/wIBATARBgorBgEEAdpHAgICBAMBAf8wHQYDVR0OBBYEFGimOJmN+rrFEOpk\n";
        s2 << "XONPloay7ffqMA4GA1UdDwEB/wQEAwIBBjANBgkqhkiG9w0BAQUFAAOBgQB3JwUn\n";
        s2 << "AbOdGv5ErojNSSP+yGZIy5av4wnkzK840Uj3jY6A5cuHroZGOD60hqLV2Hy0npox\n";
        s2 << "zte4phWEKWmZiXd8SCmd3MFNgZSieiixye0qxSmuqYft2j6NhEXD5xc/iTTjFT42\n";
        s2 << "SjGPLKAICuMBuGPnoozOEVlgqwaDqKOUph5sqw==\n";
        s2 << "-----END CERTIFICATE-----\n";
      }
      auto ret = Pem.read(s2);
      assert(ret.length, 3)
      assert(ret[0].type, "CERTIFICATE");
      .....
    });
  });

}
