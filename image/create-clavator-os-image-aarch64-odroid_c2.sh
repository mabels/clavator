#!/bin/sh

mkdir -p $HOME/.docker

echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
ARCH=aarch64
#echo VERSION=$VERSION
#echo DOCKER_AUTH=$DOCKER_AUTH

ln -s /run/docker.sock.outer /run/docker.sock

rm -rf /images
mkdir -p /images
node /builder/docker-extract.js \
  ${DOCKER_REGISTRY}clavator-os-image-aarch64-odroid_c2-$VERSION \
  /images

image_name=/images/create-os-image-aarch64-odroid_c2-$VERSION.img
xz -d $image_name.xz
ls -la /images

. /builder/map-os-image-aarch64-odroid_c2.sh

. /builder/load-clavator-docker.sh

mkdir -p /mnt
mount $part1 /mnt

. /builder/load-into-docker.sh

umount $part1
losetup -d $part1

. /builder/create-os-image-docker-aarch64-odroid_c2.sh

. /builder/docker-push.sh clavator-image-aarch64-odroid_c2-$VERSION /result


