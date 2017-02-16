
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

mkdir -p /arch/etc/pacman.d/
mv /arch/etc/pacman.d/mirrorlist /arch/etc/pacman.d/mirrorlist.orig
echo 'Server = https://archlinux.clavator.com/archlinuxarm/$arch/$repo' > /arch/etc/pacman.d/mirrorlist
cp /arch/etc/hosts /arch/etc/hosts.orig
#echo "172.17.0.1 archlinux.clavator.com" >> /arch/etc/hosts
cat /arch/etc/resolv.conf /arch/etc/hosts /arch/etc/pacman.d/mirrorlist

qarch=arm
cp /usr/bin/qemu-$qarch-static /arch/usr/bin

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/$qarch
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register


#reflector --verbose --latest 5 --sort rate --save /arch/etc/pacman.d/mirrorlist
#/bin/sh /builder/run-construqt.sh eth0

/bin/sh /builder/create-docker-archlinux-updater.sh

arch-chroot /arch /usr/bin/qemu-$qarch-static /bin/sh /updater.sh

mv /arch/etc/pacman.d/mirrorlist /arch/etc/pacman.d/mirrorlist.clavator
mv /arch/etc/pacman.d/mirrorlist.orig /arch/etc/pacman.d/mirrorlist
mv /arch/etc/hosts /arch/etc/hosts.clavator
mv /arch/etc/hosts.orig /arch/etc/hosts


cat > /arch/Dockerfile <<RUNNER
FROM scratch

COPY . /

CMD ["/bin/sh"]
RUNNER

. /builder/docker-push.sh clavator-docker-archlinux-arm-$VERSION /arch

