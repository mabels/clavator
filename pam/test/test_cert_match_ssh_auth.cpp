



#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/pem.hpp"
#include "../src/oid.hpp"
#include "../src/asn1.hpp"
#include "../src/ssh_authorized_keys.hpp"


#include <easylogging++.h>
INITIALIZE_EASYLOGGINGPP


std::vector<Asn1> pem_cert_string() {
  std::stringstream pemCertStr;
  pemCertStr  << "-----BEGIN CERTIFICATE REQUEST-----\n";
  pemCertStr  << "MIIEdDCCAlwCAQAwDjEMMAoGA1UEAxMDV1RGMIICIjANBgkqhkiG9w0BAQEFAAOC\n";
  pemCertStr  << "Ag8AMIICCgKCAgEAyEKQtrHGlVxGjbsLauJ+lbYbdlh2MbQxSnuOCTRRLGRskI8i\n";
  pemCertStr  << "/XNqpJkEBghftoNx6yDw0wgglkNxlIlxgJUNP63+rC6nJuGDF7foYB1OVXnIlCAx\n";
  pemCertStr  << "MkginQjwuNfcBTwcOqCnXDdaS6CHVqBeC0Q3I3KyigJZHTSf6C55e9eqYi3XIQAT\n";
  pemCertStr  << "vTVxsQaZC7CRivKsN/dDtWamTHvcBAC/ZfwNf+Pb/C38xC6dP34Upol6YU1SP8zV\n";
  pemCertStr  << "SKf0CMrV80YO+MXGKQYx5NU0GR7s/x2GLFsHHJ7u72Gkw19AgqAMhLeffX/bviUO\n";
  pemCertStr  << "KFtKsiztInu2HJkepxhFuAzLD3H3aqqNlcmMuIsd1OUSNiXDm3z9LJ2MD7QHVXnn\n";
  pemCertStr  << "kXl4t3PxO2xi3gnMHRXhQXx0gPTwxsVlZcYf6AiWhO5D+3gYVzYzdORaHVXTXMyi\n";
  pemCertStr  << "OU/XrX0PVRyCxa76RERINfjk4iOfEZsI8UuU4ZaKl76/52c4SME7BA9CjVvMBOKY\n";
  pemCertStr  << "8qLQyfI2ltne6FSDHVqhNjPWdbC6gw3YR3VTBcZOh5dl36nqjtiZ7Le6s2xwDf0t\n";
  pemCertStr  << "4b0sMrIsViRHCw1RvnINSkcM+KmnwlOaB0qfGjTTpOEWaM26BY2nNe5zpnz354wv\n";
  pemCertStr  << "yy2so0pBAWfnhYvp42USwzfdpNz7x2BRAd1Emx2MyArLg3H/i+HLJV9N4O8CAwEA\n";
  pemCertStr  << "AaAhMB8GCSqGSIb3DQEJDjESMBAwDgYDVR0PAQH/BAQDAgbAMA0GCSqGSIb3DQEB\n";
  pemCertStr  << "CwUAA4ICAQAMBYYwhLHeEFiTfuc2djs6zmjczll2+MUEJ3THn+PUiRV4QkqHsZ8S\n";
  pemCertStr  << "uaVBh7fsSHvoBsrDTApCSgki22LEaCI0+K/1z1tlAvKtVKRD+LkI2auz5y+JPQ/c\n";
  pemCertStr  << "NJfRgktICyNSuvnVmNWHgtWUDMKIuYTd1l8vQJ/7Z5KJJ2RyZQRpuGxqIikDo5XN\n";
  pemCertStr  << "WO/2aW69tTrfROFa9/+hvGCdDxVesayrAooOnTfgXcreXt+8T4PDAABGUBHrrTo3\n";
  pemCertStr  << "Ap0YgWKSUKZROQ7Xmn3AkTdCSndK5khVzHYANqAdS9dOChlUTyOBDD5N2QI9AC3+\n";
  pemCertStr  << "sJCEPsKhLHe+SldDfjIMd4WL614YZc6I1k/VDu7vlFW/+ObMyIrPpl5vnkGWiVOX\n";
  pemCertStr  << "0u15TwA61LaPBErKpXBwpGBsOZHmuU3jGWwjsQPhqNV+tzsMzmBtZmjMuIt6Rrxk\n";
  pemCertStr  << "Ep2EuOiiT3ZRz3L/lzbGLGQSg9zLsZYrpQ4EC35qvzb7iFZJCCIW+JcjozVCyZVM\n";
  pemCertStr  << "iQKnQz52xXdqAYCYqQ3107/PqVCens2dcwUfvDEthdl9u3dVyfh9lxdQHuytpVjB\n";
  pemCertStr  << "xMSoarEUVB9EBrdd/YHb5sxbwz+CMS9iS3zEtF+NGm2ps07HEgT24ZT3zWuYnvzt\n";
  pemCertStr  << "aGJxaXXgFzA9uVgwrrFxqAOMVYhDn+2nWe8blghsx4GEUp8uZjmy+A==\n";
  pemCertStr  << "-----END CERTIFICATE REQUEST-----\n";
  auto pems = Pem::read(pemCertStr);
  assert.equal(pems.size(), 1);
  auto asn1s = Asn1::read(pems[0].binary.begin(), pems[0].binary.end());
  assert.equal(asn1s.size(), 1);
  return Asn1::flat(asn1s);
}

PamClavator::Key sample_authorized_keys() {
  std::stringstream myfile;
  myfile << "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDIQpC2scaVXEaNuwtq4n6Vtht2WHYxtDFKe44JNFEsZGyQjyL9c2qkmQQGCF+2g3HrIPDTCCCWQ3GUiXGAlQ0/rf6sLqcm4YMXt+hgHU5VeciUIDEySCKdCPC419wFPBw6oKdcN1pLoIdWoF4LRDcjcrKKAlkdNJ/oLnl716piLdchABO9NXGxBpkLsJGK8qw390O1ZqZMe9wEAL9l/A1/49v8LfzELp0/fhSmiXphTVI/zNVIp/QIytXzRg74xcYpBjHk1TQZHuz/HYYsWwccnu7vYaTDX0CCoAyEt599f9u+JQ4oW0qyLO0ie7YcmR6nGEW4DMsPcfdqqo2VyYy4ix3U5RI2JcObfP0snYwPtAdVeeeReXi3c/E7bGLeCcwdFeFBfHSA9PDGxWVlxh/oCJaE7kP7eBhXNjN05FodVdNczKI5T9etfQ9VHILFrvpEREg1+OTiI58RmwjxS5ThloqXvr/nZzhIwTsED0KNW8wE4pjyotDJ8jaW2d7oVIMdWqE2M9Z1sLqDDdhHdVMFxk6Hl2XfqeqO2Jnst7qzbHAN/S3hvSwysixWJEcLDVG+cg1KRwz4qafCU5oHSp8aNNOk4RZozboFjac17nOmfPfnjC/LLayjSkEBZ+eFi+njZRLDN92k3PvHYFEB3USbHYzICsuDcf+L4cslX03g7w== openpgp:0x5F1BE34D\n";
  auto skeys = PamClavator::SshAuthorizedKeys::read(myfile);
  assert.equal(skeys.get().size(), 1, "size");
  return skeys.get()[0];
}

int main() {
  describe("CertMatchSshAuth", []() {

    it("match", []() {
      auto sshkey = sample_authorized_keys();
      auto asn1s = pem_cert_string();
      for (std::vector<Asn1>::const_iterator i = asn1s.begin(); i != asn1s.end(); ++i) {
        auto const &asn1 = *i;
          if (asn1.type == 0x06) {
              auto ooid = Oid::read(asn1.data_begin, asn1.data_end);
              if (ooid.isNone()) {
                std::cerr << "oid defect" << std::endl;
                continue;
              }
              auto const &oid = ooid.unwrap();
              if (oid.toString() == "1.2.840.113549.1.1.1") {
                i = Asn1::skip(0x05, ++i, asn1s.end());
                std::cerr << oid.toString() << std::endl;
                assert.equal(i->type, ((uint8_t)3));
                Asn1::dump({ *i });
                // const char *space = "";
                // for (auto j = i->data_begin; j < i->data_end; ++j) {
                //   std::cerr << space << std::hex << (((size_t)*j)&0xff) << std::dec;
                //   space = " ";
                // }
                auto skippedNull = i->data_begin;
                for (;skippedNull != i->data_end && *skippedNull == 0; ++skippedNull) {

                }
                auto bit_string = Asn1::read(skippedNull, i->data_end);
                assert.equal(bit_string.size(), 1);
                assert.equal(bit_string[0].type, ((uint8_t)0x30));
                assert.equal(bit_string[0].contains.size(), 2);
                assert.equal(bit_string[0].contains[0].type, ((uint8_t)0x2));
                assert.equal(bit_string[0].contains[1].type, ((uint8_t)0x2));
                std::string pubKey(bit_string[0].contains[0].data_begin, bit_string[0].contains[0].data_end);
                assert.equal(pubKey.size() > 0, true);
                assert.equal(pubKey.size(), sshkey.from_data_pubkey.size());
                assert.equal(pubKey, sshkey.from_data_pubkey);
                std::string modulus(bit_string[0].contains[1].data_begin, bit_string[0].contains[1].data_end);
                assert.equal(modulus.size() > 0, true);
                assert.equal(modulus.size(), sshkey.from_data_modulo.size());
                assert.equal(modulus, sshkey.from_data_modulo);

//33:d=4  hl=2 l=   9 prim: OBJECT            :rsaEncryption
//44:d=4  hl=2 l=   0 prim: NULL
//46:d=3  hl=4 l= 527 prim: BIT STRING
              }
          }
      }

    });
  });
  return exit();
}
