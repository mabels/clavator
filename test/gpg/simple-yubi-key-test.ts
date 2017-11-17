import { assert } from 'chai';
import { SimpleYubikey } from '../../src/ui/model/simple-yubikey';

describe('SimpleYubiKey', () => {

  const DATA = `{
    "warrents": [
      "meno"
    ],
    "common": {
      "expireDate": "2022-11-17T15:25:28.586Z",
      "approvedWarrents": [
        "meno"
      ],
      "keyParams": {
        "type": "RSA",
        "masterLen": 4096,
        "subLen": 4096
      },
      "uids": [
        {
          "name": { "value": "Meno" },
          "email": { "value": "meno@amdjdk" },
          "comment": { "value": "comment" }
        }
      ]
    },
    "passPhrase": {
      "warrents": [
        "meno"
      ],
      "joiner": " ",
      "doublePasswords": [
        "willfully",
        "stainable",
        "anew",
        "cofounder",
        "vividness",
        "presuming",
        "mulch",
        "gem"
      ]
    },
    "adminKey": {
      "warrents": [
        "meno"
      ],
      "joiner": "",
      "doublePasswords": [
        "54138926"
      ]
    },
    "userKey": {
      "warrents": [
        "meno"
      ],
      "joiner": "",
      "doublePasswords": [
        "84467679"
      ]
    }
  }`;

  it('serialize', () => {
    const inp = JSON.parse(DATA);
    const syk = SimpleYubikey.fill(inp);
    assert.deepEqual(inp, syk.toObj());
  });

});
