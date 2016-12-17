
VERSION=$1
mkdir -p $HOME/.docker
cat > $HOME/.docker/config.json <<RUNNER
{
  "auths": {
    "registry.clavator.com:5000": {
      "auth": "$DOCKER_AUTH"
    }
  }
}
RUNNER
echo VERSION=$VERSION 
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=aarch64

mkdir /arch
[ -f /clavator/ArchLinuxARM-aarch64-latest.tar.gz ] ||
  wget --directory-prefix=/clavator \
  wget http://os.archlinuxarm.org/os/ArchLinuxARM-aarch64-latest.tar.gz
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

echo "build"
docker build -t clavator-docker-archlinux-aarch64-$VERSION /arch
echo "tag"
docker tag clavator-docker-archlinux-aarch64-$VERSION registry.clavator.com:5000/clavator-docker-archlinux-aarch64-$VERSION
echo "push"
[  -n "$DOCKER_AUTH" ] && \
  docker push registry.clavator.com:5000/clavator-docker-archlinux-aarch64-$VERSION



