
const Rx = require('rxjs/Rx');
const Request = require('request');

const DockerRepro = function() {
  return Rx.Observable.create(observer => {
    observer.next("index.docker.io/v1/fastandfearless/clavator");
  });
}

const ImagePath = function() {
  return Rx.Observable.create(observer => {
    observer.next("/bdog/docker-images");
  });
}

const ImageRepro = function() {
  return Rx.Observable.create(observer => {
    observer.next("https://archlinux.clavator.com/docker-images/");
  });
}

const OsVersion = function() {
  return Rx.Observable.create(observer => {
    observer.next("20170528");
  });
}

const Platforms = function() {
  return Rx.Observable.create(observer => {
    observer.next(new Map([
      ["aarch64", [ "odroid_c2" ]],
      ["arm", [ "odroid_c1", "odroid_xu3", "rpi23" ]],
      ["x86_64", ["pc"]]
    ]));
  });
}

class Platform {
  getUrl(suffix) {
    return `${this.imageRepro}clavator-os-image-${this.arch}-${this.board}-${this.osVersion}${suffix||""}`
  }
}

const Rythem = function() {
  return Rx.Observable.create(r => {
    r.next();
    setInterval(() => {
      //console.log("Interval");
      r.next();
    }, 10000);
  });
}

const ClavatorOsImageList = Rythem().map(value => {
  //console.log("ClavatorOsImageList:Rythem");
  return Rx.Observable.create(list => {
    //console.log("ClavatorOsImageList:Rythem:create");
    ImageRepro().subscribe(imageRepro => {
      OsVersion().subscribe(osVersion => {
        Platforms().subscribe(platforms => {
          //let packages = []
          for (let [arch, boards] of platforms) {
            for (let board of boards) {
              let platform = new Platform();
              platform.imageRepro = imageRepro;
              platform.osVersion = osVersion;
              platform.arch = arch;
              platform.board = board;
              platform.suffixes = new Map();
              //packages.push(platform);
              //console.log("push:", platform.getUrl());
              list.next(platform);
            }
          }
          //console.log("completed");
          list.complete();
        });
      });
    });
  });
});

function doHttpRequest(suffix) {
  return Rx.Observable.create(list => {
    //console.log(">>>:", platform.getUrl(".docker"));
    Request({
      method: 'HEAD',
      url: suffix.platform.getUrl(suffix.suffix)
    }, (error, response, body) => {
      //console.log(`doHttpRequest:${suffix.platform.getUrl(suffix.suffix)}`);
      //console.log("ERR:", platform.getUrl(), error, response.statusCode);
      suffix.request = {
        error: error,
        response: response,
        body: body
      };

      list.next(suffix);
      list.complete();
    });
  });
}

class Suffix {
}

function resolveList(iStream, suffixs) {
  return Rx.Observable.create(p => {
    iStream.mergeMap(stream => {
      console.log("stream:", stream);
      return stream.map((platform) => {
        console.log("---:", platform.getUrl(".xxx"));
        return Rx.Observable.defer(() => {
          return Rx.Observable.forkJoin.apply(null, suffixs.map((suffix) => {
            let s = new Suffix();
            platform.suffixes.set(suffix, s);
            s.platform = platform;
            s.suffix = suffix;
            //console.log("---:", platform.getUrl(suffix));
            return doHttpRequest(s);
          }));
        });
      }).combineAll();
    }).subscribe(s2 => {
        //console.log(s2);
        let platforms = new Set();
        //console.log(s2);
        for(let s of s2) {
          for (let t of s) {
            if (!platforms.has(t.platform)) {
              platforms.add(t.platform);
            }
          }
        }
        p.next(platforms);
        //p.complete();
    })//.subscribe(a => {return});
    //.concatAll()//.filter(p => p.headRequest.response.statusCode != 240)
  });
}

resolveList(ClavatorOsImageList, ['.docker', '.running']).subscribe(platforms => {
  let builds = [];
  for (let platform of platforms) {
    //for (let [key, suffix] of platform.suffixes) {
      if (platform.suffixes.has(".docker") && platform.suffixes.get(".docker").request.response.statusCode != 200 &&
          platform.suffixes.has(".running") && platform.suffixes.get(".running").request.response.statusCode == 404) {
        builds.push(platform);
        //console.log(`${suffix.request.response.statusCode}:${suffix.platform.getUrl(suffix.suffix)}`);
      }
    //}
  }
// clavator-os-image-arm-odroid_xu3-20170528.docker 
// DOCKER_REGISTRY=$1
// DOCKER_CONFIG_JSON=$(ruby docker_config_json.rb $DOCKER_REGISTRY)
// VERSION=$2
// IMAGES=$3
  DockerRepro().subscribe(dockerRepro => {  
    ImagePath().subscribe(imagePath => {  
      console.log(`create-os-images.sh ${dockerRepro} ${builds[0].osVersion} ${imagePath} '${builds.map(p => `${p.arch}-${p.board}`).join(' ')}'`);
    })
  })
});


/*
var clicksOrInterval = Rx.Observable.defer(function () {
  if (Math.random() > 0.5) {
    return Rx.Observable.fromEvent(document, 'click');
} else {
    return Rx.Observable.interval(1000);
}
});
clicksOrInterval.subscribe(x => console.log(x));

const ClavatorOsImageExistList = Rx.Observable.defer(() => {
  return ClavatorOsImageList.map(packages => {
      for (let platform of packages) {
        Request({
          method: 'HEAD',
          url: platform.getUrl(".docker")
}, (error, response, body) => {
          platform.headRequest = {
            uri: platform.getUrl(".docker"),
            error: error,
            response: response,
            body: body
};

          list.next(platform);
});
}
});
});
});

ClavatorOsImageExistList
  .filter(platform => platform.headRequest.response.statusCode != 000)
  .subscribe(platform => {
    console.log(`${platform.headRequest.response.statusCode}:${platform.getUrl()}`));

*/

/*
// build os img
create-os-image-aarch64-odroid_c2.sh
create-os-image-arm-odroid_c1.sh
create-os-image-arm-odroid_xu3.sh
create-os-image-arm-rpi23.sh
create-os-image-x86_64-pc.sh
create-os-images.sh

// build arch docker
create-docker-archlinux-aarch64.sh
create-docker-archlinux-arm.sh
create-docker-archlinux-updater.sh
create-docker-archlinux-x86_64.sh
create-docker-archlinux.sh

// build node
create-clavator-node.sh

// build gnupg
create-gnupg-aarch64.sh
create-gnupg-arm.sh
create-gnupg.sh

// build docker
create-clavator-docker-container.sh

// build image with docker
create-clavator-os-image-aarch64-odroid_c2.sh
create-clavator-os-image-arm-odroid_c1.sh
create-clavator-os-image-arm-odroid_xu3.sh
create-clavator-os-image-arm-rpi23.sh
create-clavator-os-image-x86_64-pc.sh
create-clavator-os-images.sh

*/

/*
create-clavator-docker.sh
create-clavator.sh
create-os-image-docker-aarch64-odroid_c2.sh
create-os-image-docker-arm-odroid_c1.sh
create-os-image-docker-arm-odroid_xu3.sh
create-os-image-docker-arm-rpi23.sh
create-os-image-docker-x86_64-pc.sh
create-os-image-updater.sh
*/
