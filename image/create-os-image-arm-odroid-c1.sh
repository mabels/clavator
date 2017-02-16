
VERSION=$1
mkdir -p $HOME/.docker
echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo VERSION=$VERSION 
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=armhf
image_name=/$(basename $0 .sh)-$VERSION.img

#/usr/sbin/haveged --run 0

dd if=/dev/zero of=$image_name bs=1 count=1 seek=7516192767

losetup -f $image_name
hole_disk=$(losetup -l | grep $image_name | awk '{print $1}')
ln $image_name $image_name.p1
losetup -o 1048576 -f $image_name.p1
part1=$(losetup -l | grep $image_name.p1 | awk '{print $1}')

sext4=2048
echo -e "n\np\n1\n$sext4\n$eext4\nt\n83\nw" | fdisk $hole_disk

mkfs.ext4 -O '^metadata_csum,^64bit' $part1 || mkfs.ext4 $part1
mkdir arch
mount $part1 arch

[ -f /clavator/ArchLinuxARM-odroid-c1-latest.tar.gz ] ||
  wget --directory-prefix=/clavator \
    $ARCHLINUXARM/os/ArchLinuxARM-odroid-c1-latest.tar.gz
bsdtar -xpf /clavator/ArchLinuxARM-odroid-c1-latest.tar.gz -C /arch

mkdir -p /arch/etc/pacman.d/
mv /arch/etc/pacman.d/mirrorlist /arch/etc/pacman.d/mirrorlist.orig
echo 'Server = https://archlinux.clavator.com/archlinuxarm/$arch/$repo' > /arch/etc/pacman.d/mirrorlist
mv /arch/etc/hosts /arch/etc/hosts.orig
cp /etc/hosts /arch/etc/hosts
cat /arch/etc/hosts /arch/etc/pacman.d/mirrorlist


(cd /arch/boot/ && ./sd_fusing.sh $hole_disk)

qarch=arm
cp /usr/bin/qemu-$qarch-static /arch/usr/bin

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/$qarch
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register


#reflector --verbose --latest 5 --sort rate --save /arch/etc/pacman.d/mirrorlist
/bin/sh /builder/run-construqt.sh eth0

/bin/sh /builder/create-os-image-updater.sh

cat <<MMC > /arch/create-mmcblk0.sh
rm -f /dev/mmcblk0
ln $hole_disk /dev/mmcblk0
ls -la $hole_disk /dev/mmcblk0
MMC

arch-chroot /arch /usr/bin/qemu-$qarch-static /bin/sh /updater.sh

mv /arch/etc/pacman.d/mirrorlist.orig /arch/etc/pacman.d/mirrorlist
mv /arch/etc/hosts.orig /arch/etc/hosts

umount /arch
losetup -d $hole_disk
losetup -d $part1
rm -f $image_name.p1

mkdir -p /result/img
xz -z -T 2 -9 $image_name
ln $image_name.xz /result/img

cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/$image_name.xz /
RUN ln -s /$image_name.xz /sdcard.img.xz
RUN ln -s /$image_name.xz /odroid_c1.img.xz

CMD ["/bin/sh"]
RUNNER

. /builder/docker-push.sh clavator-os-image-odroid_c1-arm-$VERSION /result

