
#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/pem.hpp"
#include "../src/oid.hpp"


#include <easylogging++.h>
INITIALIZE_EASYLOGGINGPP

int main() {
  describe("Oid", []() {
    it("read", []() {
      std::stringstream s2;
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
      {
      auto oid = Oid::read(ret[0].binary.begin()+19, ret[0].binary.begin()+22);
      assert.equal(oid != boost::none, true);
      assert.deepEqual(oid->oid, {2, 5, 4, 3});
      assert.equal(oid->toString(), "2.5.4.3");
      }
      {
      auto oid = Oid::read(ret[0].binary.begin()+35, ret[0].binary.begin()+44);
      assert.equal(oid != boost::none, true);
      assert.deepEqual(oid->oid, {1, 2, 840, 113549, 1, 1, 1});
      assert.equal(oid->toString(), "1.2.840.113549.1.1.1");
      }
    });
  });
  return exit();
}
