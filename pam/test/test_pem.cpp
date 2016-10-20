


#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/pem.hpp"


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
