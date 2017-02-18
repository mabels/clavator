#!/bin/sh

VERSION=$1
mkdir -p $HOME/.docker

echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo VERSION=$VERSION
#echo DOCKER_AUTH=$DOCKER_AUTH
ARCH=x86_64

ln -s /run/docker.sock.outer /run/docker.sock

rm -rf /images
mkdir -p /images
node /builder/docker-extract.js \
  ${DOCKER_REGISTRY}clavator-os-image-x86_64-pc-$VERSION \
  /images

xz -d /images/virtual.vdi.xz
image_name=/images/virtual.raw
qemu-img convert \
  -O raw /images/virtual.vdi \
  $image_name
ls -la /images

. /builder/map-os-image-x86_64-pc.sh

. /builder/load-clavator-docker.sh

mkdir -p /mnt
mount $part1 /mnt

. /builder/load-into-docker.sh

ln -nfs /run/docker.sock.outer /run/docker.sock
umount $part1
losetup -d $part1

. /builder/create-os-image-docker-x86_64-pc.sh

. /builder/docker-push.sh clavator-image-x86_64-pc-$VERSION /result

