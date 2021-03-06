. $distro.sh


rm /arch/etc/resolv.conf
cp /etc/resolv.conf /arch/etc
#touch /arch/etc/mtab
#mount -t proc none /arch/proc
#mount --rbind /dev /arch/dev

arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/pacman --noconfirm -Sy archlinux-keyring
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/pacman --noconfirm -Sy ca-certificates
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/bin/bash /usr/bin/update-ca-trust 
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/bin/bash /usr/bin/pacman-db-upgrade
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/pacman --noconfirm -Sy openssl
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/pacman --noconfirm -Sy nodejs git npm gcc autoconf make libpng automake python2 pcsclite imagemagick mesa-libgl librsvg fig2dev ghostscript texinfo
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/pacman --noconfirm -Syu
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/pacman-db-upgrade
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/pacman --noconfirm -Syu

git clone https://github.com/mabels/gnupg.git -b quick-keytocard /gnupg
#git clone https://github.com/mabels/clavator.git /clavator
for i in gnupg 
do
  mv /$i /arch
done
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/bin/sh -c "cd /gnupg && sh ./autogen.sh"
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/bin/sh -c "cd /gnupg && ./configure --sysconfdir=/etc --enable-maintainer-mode && make && make install"

cp -rp /clavator /arch

#arch-chroot /arch /usr/bin/qemu-$qarch-static \
#	/bin/sh -c "npm install -g yarn"
#arch-chroot /arch /usr/bin/qemu-$qarch-static \
#	/bin/sh -c "cd /clavator && yarn install"
#arch-chroot /arch /usr/bin/qemu-$qarch-static \
#	/bin/sh -c "cd /clavator && npm run build" 

umount arch/boot
umount arch

for i in $(seq $lo_cnt)
do
  losetup -d $(expr $i + $lo_ofs)
done

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

mkdir -p image-builder
ln image image-builder/image
cat > image-builder/Dockerfile <<RUNNER
FROM busybox

COPY image /$distro.img

CMD ["/bin/bash"]
RUNNER

echo "build"
docker build -t img-$distro-$arch-$VERSION image-builder
echo "tag"
docker tag img-$distro-$arch-$VERSION fastandfearless/clavator:img-$distro-$arch-$VERSION
echo "push"
docker push fastandfearless/clavator:img-$distro-$arch-$VERSION

