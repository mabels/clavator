#!/bin/sh

mkdir -p aarch64
cp arch-update.sh aarch64/
cat <<DOCKER > aarch64/Dockerfile
FROM build-clavator

COPY arch-update.sh /arch/
COPY build.sh /

CMD ["/bin/sh", "-x", "/build.sh"]
DOCKER

cat <<SH > aarch64/build.sh
#!/bin/sh

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/aarch64
echo ':aarch64:M::\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\xb7\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-aarch64-static:' > /proc/sys/fs/binfmt_misc/register

mkdir -p /arch 
wget $ARCHLINUXARM/os/ArchLinuxARM-odroid-c2-latest.tar.gz
bsdtar -xpf /ArchLinuxARM-odroid-c2-latest.tar.gz -C /arch
cp /usr/bin/qemu-aarch64-static /arch/usr/bin

arch-chroot /arch /usr/bin/qemu-aarch64-static /bin/sh /arch-update.sh
git clone https://github.com/mabels/gnupg.git -b quick-keytocard /arch/gnupg
cd /arch/gnupg && sh ./autogen.sh

arch-chroot /arch /usr/bin/qemu-aarch64-static /bin/sh -c \
  "cd /gnupg && ./configure --sysconfdir=/etc --enable-maintainer-mode && make"

rm -rf /aarch64/gnupg
cp -pr /arch/gnupg /aarch64
SH
docker rmi -f build-clavator-aarch64
docker build -t build-clavator-aarch64 aarch64
docker run --privileged -ti \
  -v /var/cache/docker/build-clavator-aarch64:/aarch64 \
  -t build-clavator-aarch64

