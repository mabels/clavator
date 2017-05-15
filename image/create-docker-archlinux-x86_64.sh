#!/bin/sh

VERSION=$1
mkdir -p $HOME/.docker
echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo VERSION=$VERSION
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=x86_64

mkdir /arch
[ -f /clavator/archlinux-bootstrap-2017.04.01-x86_64.tar.gz ] ||
  wget --directory-prefix=/clavator \
    $ARCHLINUX/iso/2017.04.01/archlinux-bootstrap-2017.04.01-x86_64.tar.gz

tar xzf /clavator/archlinux-bootstrap-2017.04.01-x86_64.tar.gz -C /arch
mv /arch/root.x86_64/* /arch/

mkdir -p /arch/etc/pacman.d/
cp /etc/pacman.d/mirrorlist /arch/etc/pacman.d/
cp /arch/etc/hosts /arch/etc/hosts.orig
#echo "172.17.0.1 archlinux.clavator.com" >> /arch/etc/hosts

/bin/sh /builder/create-docker-archlinux-updater.sh

arch-chroot /arch /bin/sh -x /updater.sh

mv /arch/etc/hosts /arch/etc/hosts.clavator
mv /arch/etc/hosts.orig /arch/etc/hosts
mv /arch/etc/pacman.d/mirrorlist /arch/etc/pacman.d/mirrorlist.clavator
mv /arch/etc/pacman.d/mirrorlist.orig /arch/etc/pacman.d/mirrorlist

reflector --verbose --latest 5 --sort rate --save /arch/etc/pacman.d/mirrorlist

cat > /arch/Dockerfile <<RUNNER
FROM scratch

COPY . /

CMD ["/bin/sh"]
RUNNER

. /builder/docker-push.sh clavator-docker-archlinux-x86_64-$VERSION /arch

