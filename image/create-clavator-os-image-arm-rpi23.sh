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
node /builder/docker-2-docker.js clavator-os-image-arm-rpi23-$VERSION /images.docker ${DOCKER_REGISTRY} $DOCKER_HTTP_REGISTRY
node /builder/docker-extract.js /images.docker /images


. /builder/setup_image_name.sh /images/create-os-image-arm-rpi23-$VERSION.img
xz -d $image_name.xz
ls -la /images

. /builder/map-os-image-arm-rpi23.sh

. /builder/load-clavator-docker.sh

mkdir -p /mnt
mount $root_disk /mnt


/bin/sh /builder/run-construqt.sh eth0 arm /mnt
chroot /mnt /usr/bin/qemu-arm-static /bin/sh /deployer.sh force_hostname

. /builder/load-into-docker.sh

ln -nfs /run/docker.sock.outer /run/docker.sock
umount $root_disk
sh /builder/retry_losetup.sh -d $root_disk

. /builder/create-os-image-docker-arm-rpi23.sh

. /builder/docker-push.sh clavator-image-arm-rpi23-$GNUPGVERSION-$NODEVERSION-$VERSION /result

