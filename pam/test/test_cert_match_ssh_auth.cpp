



#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/pem.hpp"
#include "../src/oid.hpp"
#include "../src/asn1.hpp"
#include "../src/ssh_authorized_keys.hpp"


#include <easylogging++.h>
INITIALIZE_EASYLOGGINGPP


Pem pem_cert_string() {
  std::stringstream pemCertStr;
  pemCertStr  << "-----BEGIN CERTIFICATE-----\n";
  pemCertStr  << "MIIFHzCCAwegAwIBAgIRAIEUZizidEfxtb4TkcBEgxkwDQYJKoZIhvcNAQELBQAw\n";
  pemCertStr  << "LzEtMCsGA1UEAxMkc3NoLTgxMTQ2NjJjZTI3NDQ3ZjFiNWJlMTM5MWMwNDQ4MzE5\n";
  pemCertStr  << "MB4XDTE2MTAyNzAwMDAwMFoXDTE2MTAyODAwMDAwMFowLzEtMCsGA1UEAxMkc3No\n";
  pemCertStr  << "LTgxMTQ2NjJjZTI3NDQ3ZjFiNWJlMTM5MWMwNDQ4MzE5MIICIjANBgkqhkiG9w0B\n";
  pemCertStr  << "AQEFAAOCAg8AMIICCgKCAgEAyEKQtrHGlVxGjbsLauJ+lbYbdlh2MbQxSnuOCTRR\n";
  pemCertStr  << "LGRskI8i/XNqpJkEBghftoNx6yDw0wgglkNxlIlxgJUNP63+rC6nJuGDF7foYB1O\n";
  pemCertStr  << "VXnIlCAxMkginQjwuNfcBTwcOqCnXDdaS6CHVqBeC0Q3I3KyigJZHTSf6C55e9eq\n";
  pemCertStr  << "Yi3XIQATvTVxsQaZC7CRivKsN/dDtWamTHvcBAC/ZfwNf+Pb/C38xC6dP34Upol6\n";
  pemCertStr  << "YU1SP8zVSKf0CMrV80YO+MXGKQYx5NU0GR7s/x2GLFsHHJ7u72Gkw19AgqAMhLef\n";
  pemCertStr  << "fX/bviUOKFtKsiztInu2HJkepxhFuAzLD3H3aqqNlcmMuIsd1OUSNiXDm3z9LJ2M\n";
  pemCertStr  << "D7QHVXnnkXl4t3PxO2xi3gnMHRXhQXx0gPTwxsVlZcYf6AiWhO5D+3gYVzYzdORa\n";
  pemCertStr  << "HVXTXMyiOU/XrX0PVRyCxa76RERINfjk4iOfEZsI8UuU4ZaKl76/52c4SME7BA9C\n";
  pemCertStr  << "jVvMBOKY8qLQyfI2ltne6FSDHVqhNjPWdbC6gw3YR3VTBcZOh5dl36nqjtiZ7Le6\n";
  pemCertStr  << "s2xwDf0t4b0sMrIsViRHCw1RvnINSkcM+KmnwlOaB0qfGjTTpOEWaM26BY2nNe5z\n";
  pemCertStr  << "pnz354wvyy2so0pBAWfnhYvp42USwzfdpNz7x2BRAd1Emx2MyArLg3H/i+HLJV9N\n";
  pemCertStr  << "4O8CAwEAAaM2MDQwEQYKKwYBBAHaRwICAQQDAQH/MA8GA1UdEwEB/wQFMAMBAf8w\n";
  pemCertStr  << "DgYDVR0PAQH/BAQDAgbAMA0GCSqGSIb3DQEBCwUAA4ICAQBKdEJkin6Xr+lsaCkk\n";
  pemCertStr  << "hGhYOkb7Sxl+i3qb5LIuJfL86iGaBVtkbepWb2GrSCd7VPn77NKfbbKOg0zjflGS\n";
  pemCertStr  << "uGVcz1GqHzYpazSvvBa2CSPITGhvj0+qFCfHAx8ICKCWk6I0R5tFnJUW+R2juC6E\n";
  pemCertStr  << "BPaJ+kyGLWh3VezDj1bv5EliZyBAjinXdMvAc4fAc30qpOkbviaW7rkrtAvW9irp\n";
  pemCertStr  << "fUVda7qpzUFbS4TMTYclUVNS4Nrl0qeKeOzuwpPNfeDXcRJu0Hoy3xfdU+1REg0E\n";
  pemCertStr  << "BTwi/I4/cbUa/y10dT8VNBU5c2gJcs6ZgQDzEQwVWL6wOxm5ruhXDN9y4GmBtqXY\n";
  pemCertStr  << "BnMtiDibVssKgnb7dOnf6kz4rCTOAF6ErCHQ+fOvvXyMctHAAGiHFohTwQza4lHp\n";
  pemCertStr  << "sMtsV81Swe1bhH/c3lE6/U1vZ/Je91SoasLZ335DZtzAw5gHaPyephcQ/nEB5qxL\n";
  pemCertStr  << "6/K8BWfkBV4CNoJzWBF2YN9Z4nx1jpoQaSQ85MwQx/BFnxHAVvR/dZdkUNhwoE+2\n";
  pemCertStr  << "4z99SALjCMFrP/Sphh4eZb51Rp/Zk7S7/WBZQJ3N/WMJOaBg4RbF8oUW5cFhWCUV\n";
  pemCertStr  << "T8BLAir3oSZGnwlsrdhJkqohNAR+omGPCqoyCKtvxFqE5N6iaEVWfnIVRyL476+a\n";
  pemCertStr  << "MuMCWo2Z7koef1Aka8vRYknI8g==\n";
  pemCertStr  << "-----END CERTIFICATE-----\n";
  auto pems = Pem::read(pemCertStr);
  assert.equal(pems.size(), 1, "pem read failed");
  return pems[0];
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
    it("checkpem", [](){
      auto sshkey = sample_authorized_keys();
      auto pem = pem_cert_string();
      auto pubKey = pem.pubKey();
      assert.equal(pubKey != boost::none, true, "pks is boost::none");
      // assert.equal(pks->size(), 1, "pks size mismatch");
      // auto pubKey = (*pks)[0];
      assert.equal(pubKey->key.size() > 0, true, "key size != 0");
      assert.equal(pubKey->key.size(), sshkey.from_data_pubkey.size(), "size mismatch key");
      assert.equal(pubKey->key, sshkey.from_data_pubkey);
      assert.equal(pubKey->modulus.size() > 0, true, "modules size != 0");
      assert.equal(pubKey->modulus.size(), sshkey.from_data_modulo.size(), "size mismatch modulus");
      assert.equal(pubKey->modulus, sshkey.from_data_modulo);
      assert.equal(pubKey->serial, "ssh-8114662ce27447f1b5be1391c0448319");
    });

    it("match", []() {
      auto sshkey = sample_authorized_keys();
      auto pem = pem_cert_string();
      auto asn1s = Asn1::read(pem.binary.begin(), pem.binary.end());
      assert.equal(asn1s.size(), 1);
      asn1s = Asn1::flat(asn1s);
      for (std::vector<Asn1>::const_iterator i = asn1s.begin(); i != asn1s.end(); ++i) {
        auto const &asn1 = *i;
          if (asn1.type == 0x06) {
              auto ooid = Oid::read(asn1.data_begin, asn1.data_end);
              if (ooid == boost::none) {
                std::cerr << "oid defect" << std::endl;
                continue;
              }
              auto const &oid = *ooid;
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
