import KeyState from './key-state';
const reCrNl = /\r?\n/;

export class Reader {
  public model: string;
  public aid: string;
  public cardid: string;
  public type: string;

  public static fill(match: string[]): Reader {
    if (!(match.length >= 5 && match[0] == 'Reader')) {
      return null;
    }
    // Reader:1050:0407:X:0:AID:D2760001240102010006046450860000:openpgp-card:
    // Reader:Yubico Yubikey 4 OTP U2F CCID:AID:D2760001240102010006041775630000:openpgp-card:
    if (match[2] == 'AID') {
      let ret: Reader = new Reader();
      ret.model = match[1];
      ret.aid = match[2];
      ret.cardid = match[3];
      ret.type = match[4];
      return ret;
    } else if (match[5] == 'AID') {
      let ret: Reader = new Reader();
      let rest = [match[1], match[2], match[3], match[4]];
      ret.model = rest.join(':');
      ret.aid = match[5];
      ret.cardid = match[6];
      ret.type = match[7];
      return ret;
    } else {
      return null;
    }
  }

  public eq(obj: Reader): boolean {
    return this.model == obj.model &&
      this.aid == obj.aid &&
      this.cardid == obj.cardid &&
      this.type == obj.type;
  }
}

interface ActionFunc {
  (gcs: Gpg2CardStatus, strs: string[]): boolean;
}

export class Gpg2CardStatus {
  /*
  Reader:Yubico Yubikey 4 OTP U2F CCID:AID:D2760001240102010006041775630000:openpgp-card:
  version:0201:
  vendor:0006:Yubico:
  serial:04177563:
  name:Meno:Abels:
  lang:en:
  sex:m:
  url::
  login:abels:
  forcepin:0:::
  keyattr:1:1:4096:
  keyattr:2:1:4096:
  keyattr:3:1:4096:
  maxpinlen:127:127:127:
  pinretry:3:0:3:
  sigcount:16:::
  cafpr::::
  fpr:F78D5B547A9BB0E8A174C0F5060FF53CB3A32992:
      B3B94966DF73077EFA734EC83D851A5DF09DEB9C:
      2D32339F24A537406437181A28E66F405F1BE34D:
  fprtime:1465218501:1465218921:1464700773:
  */
  public reader: Reader;
  public version: string;
  public vendor: string;
  public serial: string;
  public name: string;
  public lang: string;
  public sex: string;
  public url: string;
  public login: string;
  public forcepin: string;
  public keyStates: KeyState[] = [];
  public sigcount: number;
  // cafpr: number = 0;

  // typedef std::function<bool(Gpg2CardStatus &gcs, const std::vector<std::string> &strs)> GcsAction;
  public static actors(): { [id: string]: ActionFunc } {
    return {
      'Reader': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        let reader = Reader.fill(strs);
        if (!reader) {
          return false;
        }
        gcs.reader = reader;
        return true;
      },
      'version': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        gcs.version = strs[1];
        return true;
      },
      'vendor': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        gcs.vendor = strs.slice(1, strs.length).join(':');
        return true;
      },
      'serial': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        gcs.serial = strs.slice(1, strs.length).join(':');
        return true;
      },
      'name': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        gcs.name = strs.slice(1, strs.length).join(' ');
        return true;
      },
      'lang': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        gcs.lang = strs[1];
        return true;
      },
      'sex': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        gcs.sex = strs[1];
        return true;
      },
      'url': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        gcs.url = strs[1];
        return true;
      },
      'login': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        gcs.login = strs[1];
        return true;
      },
      'forcepin': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        gcs.forcepin = strs.slice(1, strs.length).join(':');
        return true;
      },
      'keyattr': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        let id = parseInt(strs[1], 10);
        let ki = gcs.allocKeyState(id - 1);
        ki.id = id;
        ki.mode = parseInt(strs[2], 10);
        ki.bits = parseInt(strs[3], 10);
        return true;
      },
      'maxpinlen': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        let i = 0;
        for (let si = 1; si < strs.length; ++si, ++i) {
          let ki = gcs.allocKeyState(i);
          ki.maxpinlen = parseInt(strs[si], 10);
        }
        return true;
      },
      'pinretry': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        let i = 0;
        for (let si = 1; si < strs.length; ++si, ++i) {
          let ki = gcs.allocKeyState(i);
          ki.pinretry = parseInt(strs[si], 10);
        }
        return true;
      },
      'sigcount': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        gcs.sigcount = parseInt(strs[1], 10);
        let i = 0;
        for (let si = 2; si < strs.length; ++si, ++i) {
          let ki = gcs.allocKeyState(i);
          ki.sigcount = parseInt(strs[si], 10);
        }
        return true;
      },
      'cafpr': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        // gcs.cafpr = parseInt(strs[1], 10);
        let i = 0;
        for (let si = 1; si < strs.length; ++si, ++i) {
          let ki = gcs.allocKeyState(i);
          ki.cafpr = parseInt(strs[si], 10) || 0;
        }
        return true;
      },
      'fpr': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        let i = 0;
        for (let si = 1; si < strs.length; ++si, ++i) {
          let ki = gcs.allocKeyState(i);
          ki.fpr = strs[si];
        }
        return true;
      },
      'fprtime': (gcs: Gpg2CardStatus, strs: string[]): boolean => {
        let i = 0;
        for (let si = 1; si < strs.length; ++si, ++i) {
          let ki = gcs.allocKeyState(i);
          ki.fprtime = parseInt(strs[si], 10);
        }
        return true;
      },
    };
  }

  public static read(str: string): Gpg2CardStatus[] {
    let gcs: Gpg2CardStatus[] = [];
    // std::vector<Gpg2CardStatus>::iterator gcsi = gcs.end();
    let actors = Gpg2CardStatus.actors();
    // let line: string;
    let gcsi: Gpg2CardStatus = null;
    str.split(reCrNl).forEach((line: string) => {
      line = line.trim();
      if (line[line.length - 1] == ':') {
        line = line.substr(0, line.length - 1);
      }
      let strs = line.split(':');
      if (strs[0] == 'Reader') {
        if (gcsi != null) {
          gcs.push(gcsi);
        }
        gcsi = new Gpg2CardStatus();
      }
      if (gcsi == null) {
        return;
      }
      // std::cerr << "ReqAction:" << strs[0] << std::endl;
      let action = actors[strs[0]];
      if (!action) {
        return;
      }
      // std::cerr << "Action:" << action->first << std::endl;
      if (!(action)(gcsi, strs)) {
        gcsi = null;
      }
    });
    if (gcsi != null) {
      gcs.push(gcsi);
    }
    return gcs;
  }

  public allocKeyState(slot: number): KeyState {
    let ret = this.keyStates[slot];
    if (!ret) {
      ret = this.keyStates[slot] = new KeyState();
    }
    return ret;
  }

}

export function run(str: string): Gpg2CardStatus[] {
  return Gpg2CardStatus.read(str);
}
