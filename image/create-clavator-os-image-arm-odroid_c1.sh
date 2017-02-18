#!/bin/sh

VERSION=$1
mkdir -p $HOME/.docker

echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo VERSION=$VERSION
ARCH=arm
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=x86_64

ln -s /run/docker.sock.outer /run/docker.sock

rm -rf /images
mkdir -p /images
node /builder/docker-extract.js \
  ${DOCKER_REGISTRY}clavator-os-image-arm-odroid_c1-$VERSION \
  /images

image_name=/images/create-os-image-arm-odroid_c1-$VERSION.img
xz -d $image_name.xz
ls -la /images

. /builder/map-os-image-arm-odroid_c1.sh

. /builder/load-clavator-docker.sh

mkdir -p /mnt
mount $part1 /mnt

. /builder/load-into-docker.sh

umount $part1
losetup -d $part1

. /builder/create-os-image-docker-arm-odroid_c1.sh

. /builder/docker-push.sh clavator-image-arm-odroid_c1-$VERSION /result

