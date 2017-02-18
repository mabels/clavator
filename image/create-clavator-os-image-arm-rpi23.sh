#!/bin/sh

VERSION=$1
mkdir -p $HOME/.docker

echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo VERSION=$VERSION
ARCH=arm
#echo DOCKER_AUTH=$DOCKER_AUTH

ln -s /run/docker.sock.outer /run/docker.sock

rm -rf /images
mkdir -p /images
node /builder/docker-extract.js \
  ${DOCKER_REGISTRY}clavator-os-image-arm-rpi23-$VERSION \
  /images

image_name=/images/create-os-image-arm-rpi23-$VERSION.img
xz -d $image_name.xz
ls -la /images

. /builder/map-os-image-arm-rpi23.sh

. /builder/load-clavator-docker.sh

mkdir -p /mnt
mount $part1 /mnt

. /builder/load-into-docker.sh

ln -nfs /run/docker.sock.outer /run/docker.sock
umount $part1
losetup -d $part1

. /builder/create-os-image-docker-arm-rpi23.sh

. /builder/docker-push.sh clavator-image-arm-rpi23-$VERSION /result

