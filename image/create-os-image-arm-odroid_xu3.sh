VERSION=$1
mkdir -p $HOME/.docker
echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo VERSION=$VERSION
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=armhf
. /builder/setup_image_name.sh /$(basename $0 .sh)-$VERSION.img

dd if=/dev/zero of=$image_name bs=1 count=1 seek=7516192767

hole_disk=$(sh /builder/to_loop.sh $image_name)

sext4=4096
echo -e "n\np\n1\n$sext4\n$eext4\nt\n83\nw" | fdisk $hole_disk





. /builder/map-os-image-arm-odroid_xu3.sh



mkfs.ext4 -O ^metadata_csum,^64bit $part1
mkdir arch


mount $part1 /arch

mkdir -p /clavator
wget --directory-prefix=/clavator \
  $ARCHLINUXARM/os/ArchLinuxARM-odroid-xu3-latest.tar.gz

bsdtar -xpf /clavator/ArchLinuxARM-odroid-xu3-latest.tar.gz -C /arch

(cd /arch/boot/ && ./sd_fusing.sh $hole_disk)

mkdir -p /arch/etc/pacman.d/
mv /arch/etc/pacman.d/mirrorlist /arch/etc/pacman.d/mirrorlist.orig
echo 'Server = https://archlinux.clavator.com/archlinuxarm/$arch/$repo' > /arch/etc/pacman.d/mirrorlist
mv /arch/etc/hosts /arch/etc/hosts.orig
cp /etc/hosts /arch/etc/hosts
cat /arch/etc/hosts /arch/etc/pacman.d/mirrorlist

qarch=arm
cp /usr/bin/qemu-$qarch-static /arch/usr/bin

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/$qarch
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register


#reflector --verbose --latest 5 --sort rate --save /arch/etc/pacman.d/mirrorlist

#/bin/sh /builder/run-construqt.sh eth0

/bin/sh /builder/create-os-image-updater.sh

/bin/sh /builder/create-prepare-source-packages.sh

cat <<MMC > /arch/create-mmcblk0.sh
ln $hole_disk /dev/mmcblk0
ls -la $hole_disk /dev/mmcblk0
MMC

arch-chroot /arch /usr/bin/qemu-$qarch-static /bin/sh /updater.sh
/bin/sh -x /builder/create-cleanup-disk.sh
arch-chroot /arch /usr/bin/qemu-$qarch-static /bin/sh -x /cleanup.sh

mv /arch/etc/pacman.d/mirrorlist.orig /arch/etc/pacman.d/mirrorlist
mv /arch/etc/hosts.orig /arch/etc/hosts
umount /arch
sh /builder/retry_losetup.sh -d $hole_disk
sh /builder/retry_losetup.sh -d $part1
rm -f $image_name.p1

. /builder/create-os-image-docker-arm-odroid_xu3.sh

. /builder/docker-push.sh clavator-os-image-arm-odroid_xu3-$VERSION /result

