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
node /builder/docker-2-docker.js clavator-os-image-arm-odroid_xu3-$VERSION /images.docker ${DOCKER_REGISTRY} $DOCKER_HTTP_REGISTRY
node /builder/docker-extract.js /images.docker /images

image_name=/images/create-os-image-arm-odroid_xu3-$VERSION.img
xz -d $image_name.xz
ls -la /images

. /builder/map-os-image-arm-odroid_xu3.sh

. /builder/load-clavator-docker.sh

mkdir -p /mnt
mount $root_disk /mnt

. /builder/load-into-docker.sh

umount $root_disk
sh /builder/retry_losetup.sh -d $root_disk

. /builder/create-os-image-docker-arm-odroid_xu3.sh

. /builder/docker-push.sh clavator-image-arm-odroid_xu3-$GNUPGVERSION-$NODEVERSION-$VERSION /result

