
mkdir -p arm/gnupg
cp arch-update.sh arm/gnupg
cp fastmirror.sh arm/gnupg
cat <<DOCKER > arm/gnupg/Dockerfile
FROM build-clavator

COPY gnupg-builder.sh /
COPY arch-update.sh /
COPY fastmirror.sh /

CMD ["/bin/sh", "/gnupg-builder.sh"]
DOCKER

cat <<GNUPG > arm/gnupg/gnupg-builder.sh
rm -rf /clavator/arm/gnupg /clavator/arm/gnupg.done

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/arm
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register

mkdir -p /arch 
wget $ARCHLINUXARM/os/ArchLinuxARM-rpi-2-latest.tar.gz
bsdtar -xpf /ArchLinuxARM-rpi-2-latest.tar.gz -C /arch
cp /usr/bin/qemu-arm-static /arch/usr/bin
cp /fastmirror.sh /arch
#cp /etc/pacman.d/mirrorlist /arch/etc/pacman.d
arch-chroot /arch /usr/bin/qemu-arm-static /bin/sh /fastmirror.sh

git clone https://github.com/mabels/gnupg.git -b quick-keytocard /arch/gnupg
cd /arch/gnupg && git rev-parse --verify --short HEAD > VERSION
cd /arch/gnupg && sh ./autogen.sh

cp /arch-update.sh /arch
arch-chroot /arch /usr/bin/qemu-arm-static /bin/sh /arch-update.sh
arch-chroot /arch /usr/bin/qemu-x86-static /usr/bin/pacman --noconfirm -Sy imagemagick mesa-libgl librsvg fig2dev ghostscript texinfo
arch-chroot /arch /usr/bin/qemu-arm-static /bin/sh -c \
  "cd /gnupg && ./configure --sysconfdir=/etc --enable-maintainer-mode && make"

mkdir -p /clavator/arm
cp -pr /arch/gnupg /clavator/arm
touch /clavator/arm/gnupg.done
GNUPG


docker build -t build-gnupg-arm arm/gnupg
docker run -d --privileged \
  -v /var/cache/docker/clavator:/clavator \
  -t build-gnupg-arm 

