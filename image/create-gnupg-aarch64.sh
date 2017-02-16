
VERSION=$1
mkdir -p $HOME/.docker
echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo VERSION=$VERSION 
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=aarch64

mkdir /arch
[ -f /clavator/ArchLinuxARM-aarch64-latest.tar.gz ] ||
  wget --directory-prefix=/clavator \
    $ARCHLINUXARM/os/ArchLinuxARM-aarch64-latest.tar.gz
bsdtar -xpf /clavator/ArchLinuxARM-aarch64-latest.tar.gz -C /arch


qarch=aarch64
cp /usr/bin/qemu-$qarch-static /arch/usr/bin

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/$qarch
echo ':aarch64:M::\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\xb7\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-aarch64-static:' > /proc/sys/fs/binfmt_misc/register


/bin/sh /builder/create-docker-archlinux-updater.sh

arch-chroot /arch /usr/bin/qemu-$qarch-static /bin/sh /updater.sh

cat > /arch/Dockerfile <<RUNNER
FROM scratch

COPY . /

CMD ["/bin/sh"]
RUNNER


. /builder/docker-push.sh clavator-docker-archlinux-aarch64-$VERSION /arch

