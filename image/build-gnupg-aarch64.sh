

mkdir -p aarch64/gnupg
cp arch-update.sh aarch64/gnupg
cp fastmirror.sh aarch64/gnupg
cat <<DOCKER > aarch64/gnupg/Dockerfile
FROM build-clavator

COPY gnupg-builder.sh /
COPY arch-update.sh /
COPY fastmirror.sh /

CMD ["/bin/sh", "/gnupg-builder.sh"]
DOCKER

cat <<GNUPG > aarch64/gnupg/gnupg-builder.sh
rm -rf /clavator/aarch64/gnupg /clavator/aarch64/gnupg.done

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/aarch64
echo ':aarch64:M::\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\xb7\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-aarch64-static:' > /proc/sys/fs/binfmt_misc/register

mkdir -p /arch 
wget $ARCHLINUXARM/os/ArchLinuxARM-odroid-c2-latest.tar.gz
bsdtar -xpf /ArchLinuxARM-odroid-c2-latest.tar.gz -C /arch

cp /usr/bin/qemu-aarch64-static /arch/usr/bin
cp /fastmirror.sh /arch
#cp /etc/pacman.d/mirrorlist /arch/etc/pacman.d
arch-chroot /arch /usr/bin/qemu-aarch64-static /bin/sh /fastmirror.sh

git clone https://github.com/mabels/gnupg.git -b quick-keytocard /arch/gnupg
cd /arch/gnupg && git rev-parse --verify --short HEAD > VERSION
cd /arch/gnupg && sh ./autogen.sh

cp /arch-update.sh /arch
arch-chroot /arch /usr/bin/qemu-aarch64-static /bin/sh /arch-update.sh
 rch-chroot /arch /usr/bin/qemu-aarch64-static /usr/bin/pacman --noconfirm -Sy imagemagick mesa-libgl librsvg fig2dev ghostscript texinfo
arch-chroot /arch /usr/bin/qemu-aarch64-static /bin/sh -c \
  "cd /gnupg && ./configure --sysconfdir=/etc --enable-maintainer-mode && make"

mkdir -p /clavator/aarch64
cp -pr /arch/gnupg /clavator/aarch64
touch /clavator/aarch64/gnupg.done
GNUPG


docker build -t build-gnupg-aarch64 aarch64/gnupg
docker run -d --privileged \
  -v /var/cache/docker/clavator:/clavator \
  -t build-gnupg-aarch64 

