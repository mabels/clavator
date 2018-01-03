
VERSION=$1
mkdir -p $HOME/.docker
echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo VERSION=$VERSION 
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=armhf


mkdir /arch
[ -f /clavator/ArchLinuxARM-armv7-latest.tar.gz ] ||
  wget --directory-prefix=/clavator \
    $ARCHLINUXARM/os/ArchLinuxARM-armv7-latest.tar.gz
bsdtar -xpf /clavator/ArchLinuxARM-armv7-latest.tar.gz -C /arch

qarch=arm
cp /usr/bin/qemu-$qarch-static /arch/usr/bin

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/$qarch
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register


#reflector --verbose --latest 5 --sort rate --save /arch/etc/pacman.d/mirrorlist
#/bin/sh /builder/run-construqt.sh eth0

/bin/sh /builder/create-docker-archlinux-updater.sh

arch-chroot /arch /usr/bin/qemu-$qarch-static /bin/sh /updater.sh
/bin/sh -x /builder/create-cleanup-disk.sh
arch-chroot /arch /usr/bin/qemu-$qarch-static /bin/sh -x /cleanup.sh

cat > /arch/Dockerfile <<RUNNER
FROM scratch

COPY . /

CMD ["/bin/sh"]
RUNNER

. /builder/docker-push.sh clavator-docker-archlinux-arm-$VERSION /arch

