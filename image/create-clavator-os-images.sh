#/bin/bash

#sh create-clavator-os-images.sh 'index.docker.io/fastandfearless/clavator:' c108871 eaf5bb30e 20170511 /scable-1/docker-images https://archlinux.clavator.com/docker-images/

DOCKER_REGISTRY=$1
GNUPGVERSION=$2
NODEVERSION=$3
IMAGES=$4
DOCKER_HTTP_REGISTRY=$5
if [ -z $6 ]
then
  VERSION=$(date "+%Y%m%d")
else
  VERSION=$6
fi

DOCKER_CONFIG_JSON=$(ruby docker_config_json.rb $DOCKER_REGISTRY)
if [ -z $DOCKER_CONFIG_JSON ]
then
  echo "Need a registry name"
  echo "- index.docker.io/v1/fastandfearless/clavator:<imgname>"
  echo "- registry.clavator.com:5000/<imgname>"
  exit 1
fi

ARCHLINUXARM=https://archlinux.clavator.com/archlinuxarm/
ARCHLINUX=https://archlinux.clavator.com/archlinux/


echo Creating OS Images for $VERSION $GNUPGVERSION $NODEVERSION

docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset
#docker run -ti --privileged ubuntu /sbin/losetup -D

docker build -f Dockerfile-create-os-images -t clavator-create-os-images .

for i in aarch64-odroid_c2 x86_64-pc arm-odroid_c1 arm-rpi23 arm-odroid_xu3 
#for i in x86_64-pc
#for i in arm-rpi23
do
  echo "Run: /builder/create-clavator-os-image-$i.sh $VERSION"
  docker ps -qa -f "name=$i-create-clavator-os-image" | xargs docker rm -f
  docker run -d --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock.outer \
    -v /var/cache/docker/clavator:/clavator \
    -v $IMAGES:$IMAGES \
    --env "DOCKER_CONFIG_JSON=$DOCKER_CONFIG_JSON" \
    --env "DOCKER_REGISTRY=$DOCKER_REGISTRY" \
    --env "ARCHLINUXARM=$ARCHLINUXARM" \
    --env "ARCHLINUX=$ARCHLINUX" \
    --env "ARCHLINUX=$ARCHLINUX" \
    --env "GNUPGVERSION=$GNUPGVERSION" \
    --env "NODEVERSION=$NODEVERSION" \
    --env "VERSION=$VERSION" \
    --env "IMAGES=$IMAGES" \
    --env "DOCKER_HTTP_REGISTRY=$DOCKER_HTTP_REGISTRY" \
    --name $i-create-clavator-os-image \
    -t clavator-create-os-images \
    /bin/sh /builder/create-clavator-os-image-$i.sh $VERSION
done


