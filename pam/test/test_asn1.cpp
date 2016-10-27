


#include <easylogging++.h>
INITIALIZE_EASYLOGGINGPP


#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/pem.hpp"
#include "../src/asn1.hpp"


int main() {
  describe("Asn1", []() {
    it("read", []() {
      std::stringstream s2;
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

      s2 << "-----BEGIN CERTIFICATE REQUEST-----\n";
      s2 << "MIIEdDCCAlwCAQAwDjEMMAoGA1UEAxMDV1RGMIICIjANBgkqhkiG9w0BAQEFAAOC\n";
      s2 << "Ag8AMIICCgKCAgEAyEKQtrHGlVxGjbsLauJ+lbYbdlh2MbQxSnuOCTRRLGRskI8i\n";
      s2 << "/XNqpJkEBghftoNx6yDw0wgglkNxlIlxgJUNP63+rC6nJuGDF7foYB1OVXnIlCAx\n";
      s2 << "MkginQjwuNfcBTwcOqCnXDdaS6CHVqBeC0Q3I3KyigJZHTSf6C55e9eqYi3XIQAT\n";
      s2 << "vTVxsQaZC7CRivKsN/dDtWamTHvcBAC/ZfwNf+Pb/C38xC6dP34Upol6YU1SP8zV\n";
      s2 << "SKf0CMrV80YO+MXGKQYx5NU0GR7s/x2GLFsHHJ7u72Gkw19AgqAMhLeffX/bviUO\n";
      s2 << "KFtKsiztInu2HJkepxhFuAzLD3H3aqqNlcmMuIsd1OUSNiXDm3z9LJ2MD7QHVXnn\n";
      s2 << "kXl4t3PxO2xi3gnMHRXhQXx0gPTwxsVlZcYf6AiWhO5D+3gYVzYzdORaHVXTXMyi\n";
      s2 << "OU/XrX0PVRyCxa76RERINfjk4iOfEZsI8UuU4ZaKl76/52c4SME7BA9CjVvMBOKY\n";
      s2 << "8qLQyfI2ltne6FSDHVqhNjPWdbC6gw3YR3VTBcZOh5dl36nqjtiZ7Le6s2xwDf0t\n";
      s2 << "4b0sMrIsViRHCw1RvnINSkcM+KmnwlOaB0qfGjTTpOEWaM26BY2nNe5zpnz354wv\n";
      s2 << "yy2so0pBAWfnhYvp42USwzfdpNz7x2BRAd1Emx2MyArLg3H/i+HLJV9N4O8CAwEA\n";
      s2 << "AaAhMB8GCSqGSIb3DQEJDjESMBAwDgYDVR0PAQH/BAQDAgbAMA0GCSqGSIb3DQEB\n";
      s2 << "CwUAA4ICAQAMBYYwhLHeEFiTfuc2djs6zmjczll2+MUEJ3THn+PUiRV4QkqHsZ8S\n";
      s2 << "uaVBh7fsSHvoBsrDTApCSgki22LEaCI0+K/1z1tlAvKtVKRD+LkI2auz5y+JPQ/c\n";
      s2 << "NJfRgktICyNSuvnVmNWHgtWUDMKIuYTd1l8vQJ/7Z5KJJ2RyZQRpuGxqIikDo5XN\n";
      s2 << "WO/2aW69tTrfROFa9/+hvGCdDxVesayrAooOnTfgXcreXt+8T4PDAABGUBHrrTo3\n";
      s2 << "Ap0YgWKSUKZROQ7Xmn3AkTdCSndK5khVzHYANqAdS9dOChlUTyOBDD5N2QI9AC3+\n";
      s2 << "sJCEPsKhLHe+SldDfjIMd4WL614YZc6I1k/VDu7vlFW/+ObMyIrPpl5vnkGWiVOX\n";
      s2 << "0u15TwA61LaPBErKpXBwpGBsOZHmuU3jGWwjsQPhqNV+tzsMzmBtZmjMuIt6Rrxk\n";
      s2 << "Ep2EuOiiT3ZRz3L/lzbGLGQSg9zLsZYrpQ4EC35qvzb7iFZJCCIW+JcjozVCyZVM\n";
      s2 << "iQKnQz52xXdqAYCYqQ3107/PqVCens2dcwUfvDEthdl9u3dVyfh9lxdQHuytpVjB\n";
      s2 << "xMSoarEUVB9EBrdd/YHb5sxbwz+CMS9iS3zEtF+NGm2ps07HEgT24ZT3zWuYnvzt\n";
      s2 << "aGJxaXXgFzA9uVgwrrFxqAOMVYhDn+2nWe8blghsx4GEUp8uZjmy+A==\n";
      s2 << "-----END CERTIFICATE REQUEST-----\n";

      auto ret = Pem::read(s2);
      auto asn1s = Asn1::read(ret[0].binary.begin(), ret[0].binary.end());
      // Asn1::dump(asn1s);
      assert.equal(asn1s.size(), 1);
      auto asn1 = asn1s[0];
      assert.equal(asn1.type, ((uint8_t)0x30));
      assert.equal(asn1.hlen, 4ul);
      assert.equal(asn1.len, 552ul);
      assert.equal(asn1.contains.size(), 3);
      const std::vector<size_t> ofs = {
        0, 4, 8, 10, 13, 16, 18, 29, 31,
        33, 35, 37, 42, 77, 79, 94,
        111, 113, 115, 117, 122, 157,
        160, 162, 173, 175, 319, 321,
        323, 325, 330, 333, 343, 345,
        357, 362, 364, 369, 393, 395,
        400, 403, 409, 411, 422, 424,
      };
      auto flat = Asn1::flat(asn1s);
      assert.equal(ofs.size(), flat.size());
      std::vector<size_t> flatOfs;
      for (auto &i : flat) {
        flatOfs.push_back(i.ofs);
      }
      assert.deepEqual(flatOfs, ofs);

      Asn1::dump(Asn1::read(ret[1].binary.begin(), ret[1].binary.end()));

    });
  });
  return exit();
}
