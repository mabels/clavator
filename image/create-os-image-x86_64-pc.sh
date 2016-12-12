#!/bin/sh

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
arch=x86_64
image_name=$(basename $0 .sh)-$VERSION.img

dd if=/dev/zero of=$image_name bs=1 count=1 seek=3221225471

losetup -f $image_name

hole_disk=$(losetup -l | grep $image_name | awk '{print $1}')
ln $image_name $image_name.p1
losetup -o 1048576 -f $image_name.p1
part1=$(losetup -l | grep $image_name.p1 | awk '{print $1}')

sext4=2048
echo -e "n\np\n1\n$sext4\n$eext4\nt\n83\nw" | fdisk $hole_disk
mkfs.ext4 $part1
ROOTID=$(blkid $part1 | awk '{print $2}')
rm -rf /arch
mkdir /arch
mount $part1 /arch


[ -f /clavator/archlinux-bootstrap-2016.12.01-x86_64.tar.gz ] ||
  wget --directory-prefix=/clavator \
  https://mirrors.kernel.org/archlinux/iso/2016.12.01/archlinux-bootstrap-2016.12.01-x86_64.tar.gz

tar xzf /clavator/archlinux-bootstrap-2016.12.01-x86_64.tar.gz -C /arch
mv /arch/root.x86_64/* /arch/


reflector --verbose --latest 5 --sort rate --save /arch/etc/pacman.d/mirrorlist

/bin/sh /builder/run-construqt.sh "enp0s8"

/bin/sh /builder/create-os-image-updater.sh
cat <<MMC > /arch/create-mmcblk0.sh
MMC

cat <<GRUB > /arch/grub.sh
pacman -Sy --noconfirm grub
grub-mkconfig -o /tmp/doof.cfg
sed "s/'.*UUID=.*img.p1'/clavator/g" /tmp/doof.cfg | \
sed "s/.var.lib.docker.aufs.*$VERSION.img.p1/$ROOTID/" > /boot/grub/grub.cfg
GRUB

echo $ROOTID
arch-chroot /arch /bin/sh /updater.sh
arch-chroot /arch /bin/sh /grub.sh

#grub-install --root=/arch /dev/loop0
#192  grub-bios-setup  -s --verbose     --directory='/arch/boot/grub/i386-pc' -m /arch/boot/grub/device.map  '/dev/loop0'
cat <<O > /arch/boot/grub/device.map
(hd0)   $hole_disk
O
cat /arch/boot/grub/device.map
grub-install --modules part_msdos --root=/arch $hole_disk
echo "$ROOTID / ext4 rw,relatime,data=ordered     0 0" >> /arch/etc/fstab

umount /arch
losetup -d $hole_disk
losetup -d $part1
mkdir -p /result/img
VBoxManage convertdd $image_name /result/img/virtual.vmdk


cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/virtual.vmdk /

CMD ["/bin/sh"]
RUNNER

echo "build"
docker build -t clavator-os-image-x86_64-pc-$VERSION /result
echo "tag"
docker tag clavator-os-image-x86_64-pc-$VERSION fastandfearless/clavator:clavator-os-image-x86_64-pc-$VERSION
echo "push"
[  -n "$DOCKER_AUTH" ] && \
  docker push fastandfearless/clavator:clavator-os-image-x86_64-pc-$VERSION


