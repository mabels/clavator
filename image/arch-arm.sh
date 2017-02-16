#!/bin/sh

mkdir -p arm
cp arch-update.sh arm/
cat <<DOCKER > arm/Dockerfile
FROM build-clavator

COPY arch-update.sh /arch/
COPY build.sh /

CMD ["/bin/sh", "-x", "/build.sh"]
DOCKER

cat <<SH > arm/build.sh
#!/bin/sh

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/arm
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register

mkdir -p /arch 
wget $ARCHLINUXARM/os/ArchLinuxARM-odroid-c1-latest.tar.gz
bsdtar -xpf /ArchLinuxARM-odroid-c1-latest.tar.gz -C /arch
cp /usr/bin/qemu-arm-static /arch/usr/bin

arch-chroot /arch /usr/bin/qemu-arm-static /bin/sh /arch-update.sh
git clone https://github.com/mabels/gnupg.git -b quick-keytocard /arch/gnupg
cd /arch/gnupg && sh ./autogen.sh

arch-chroot /arch /usr/bin/qemu-arm-static /bin/sh -c \
  "cd /gnupg && ./configure --sysconfdir=/etc --enable-maintainer-mode && make"

rm -rf /arm/gnupg
cp -pr /arch/gnupg /arm
SH
docker rmi -f build-clavator-arm
docker build -t build-clavator-arm arm
docker run --privileged -ti \
  -v /var/cache/docker/build-clavator-arm:/arm \
  -t build-clavator-arm

