#/bin/bash


DOCKER_REGISTRY=$1
DOCKER_CONFIG_JSON=$(ruby docker_config_json.rb $DOCKER_REGISTRY)
VERSION=$2
if [ -z $VERSION ]
then
  VERSION=$(date "+%Y%m%d")
fi
if [ -z $DOCKER_CONFIG_JSON ]
then
  echo "Need a registry name"
  echo "- index.docker.io/v1/fastandfearless/clavator:<imgname>"
  echo "- registry.clavator.com:5000/<imgname>"
  exit 1
fi

ARCHLINUXARM=https://archlinux.clavator.com/archlinuxarm/
ARCHLINUX=https://archlinux.clavator.com/archlinux/

echo Creating OS Images for $VERSION 

docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset
docker run -ti --privileged ubuntu /sbin/losetup -D
docker run -d --name haveged --privileged storytel/haveged

#ruby construqt.rb

docker build -f Dockerfile-create-os-images -t clavator-create-os-images .

#for i in x86_64-pc # aarch64-odroid-c2
for i in aarch64-odroid_c2 arm-odroid_c1 x86_64-pc arm-rpi23 arm-odroid_xu3 
do
  echo "Run: /builder/create-os-image-$i $VERSION"
  docker ps -qa -f "name=$i-create-os-image" | xargs docker rm -f
  docker run -d --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /var/cache/docker/clavator:/clavator \
    --env "DOCKER_CONFIG_JSON=$DOCKER_CONFIG_JSON" \
    --env "DOCKER_REGISTRY=$DOCKER_REGISTRY" \
    --env "ARCHLINUXARM=$ARCHLINUXARM" \
    --env "ARCHLINUX=$ARCHLINUX" \
    --name $i-create-os-image \
    -t clavator-create-os-images \
    /bin/sh /builder/create-os-image-$i.sh $VERSION
done

#for i in #x86_64 arm aarch64
#do
#  echo "Run: /builder/create-docker-image-$i $VERSION"
#  docker run -d --privileged \
#  -v /var/run/docker.sock:/var/run/docker.sock \
#  -v /var/cache/docker/clavator:/clavator \
#  -t clavator-create-os-images \
#  /bin/sh /builder/create-docker-image-$i $VERSION
#done

