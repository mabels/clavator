
VERSION=$1
mkdir -p $HOME/.docker
cat > $HOME/.docker/config.json <<RUNNER
{
  "auths": {
    "https://index.docker.io/v1/": {
      "auth": "$DOCKER_AUTH"
    }
  }
}
RUNNER
echo VERSION=$VERSION 
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=armhf


mkdir /arch
[ -f /clavator/ArchLinuxARM-armv7-latest.tar.gz ] ||
  wget --directory-prefix=/clavator \
  wget http://os.archlinuxarm.org/os/ArchLinuxARM-armv7-latest.tar.gz
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

cat > /arch/Dockerfile <<RUNNER
FROM scratch

COPY . /

CMD ["/bin/sh"]
RUNNER

echo "build"
docker build -t clavator-docker-archlinux-arm-$VERSION /arch
echo "tag"
docker tag clavator-docker-archlinux-arm-$VERSION fastandfearless/clavator:clavator-docker-archlinux-arm-$VERSION
echo "push"
[  -n "$DOCKER_AUTH" ] && \
  docker push fastandfearless/clavator:clavator-docker-archlinux-arm-$VERSION


