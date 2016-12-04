for distro in rpi23 odroid-c2
do
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
	/usr/bin/pacman --noconfirm -Sy nodejs git npm gcc autoconf make libpng automake python2 pcsclite
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/pacman --noconfirm -Syu
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/pacman-db-upgrade
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/pacman --noconfirm -Syu

arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/usr/bin/git clone https://github.com/mabels/clavator.git /root/clavator
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/bin/sh -c "cd /root/clavator && npm install"
arch-chroot /arch /usr/bin/qemu-$qarch-static \
	/bin/sh -c "cd /root/clavator && npm run build" 

umount arch/boot
umount arch

losetup -d /dev/loop0
losetup -d /dev/loop1
losetup -d /dev/loop2

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

cat > Dockerfile <<RUNNER
FROM busybox

COPY /image /$distro.img

CMD ["/bin/bash"]
RUNNER

echo "build"
docker build -t img-$distro-$VERSION .
echo "tag"
docker tag img-$distro-$arch-$VERSION fastandfearless/clavator:img-$distro-$arch-$VERSION
echo "push"
docker push fastandfearless/clavator:img-$distro-$arch-$VERSION


done
