
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
arch=armhf
image_name=$(basename $0 .sh)-$VERSION.img

dd if=/dev/zero of=$image_name bs=1 count=1 seek=3221225471

losetup -f $image_name
hole_disk=$(losetup -l | grep $image_name | awk '{print $1}')
ln $image_name $image_name.p1
losetup -o 1048576 -f $image_name.p1
part1=$(losetup -l | grep $image_name.p1 | awk '{print $1}')
ln $image_name $image_name.p2
losetup -o 135266304 -f $image_name.p2
part2=$(losetup -l | grep $image_name.p2 | awk '{print $1}')

sfat=2048
fatsize=128
efat=$(expr $fatsize \* 1024 \* 1024 / 512 + $sfat - 1)
sext4=$(expr $efat + 1)
eext4=""
echo -e "n\np\n1\n$sfat\n$efat\nn\np\n2\n$sext4\n$eext4\nt\n1\n6\nt\n2\n83\nw" | fdisk $hole_disk

mkfs.vfat $part1
mkfs.ext4 $part2
mkdir arch
mount $part2 arch
mkdir arch/boot
mount $part1 arch/boot

[ -f /clavator/ArchLinuxARM-rpi-2-latest.tar.gz ] ||
  wget --directory-prefix=/clavator \
  wget http://archlinuxarm.org/os/ArchLinuxARM-rpi-2-latest.tar.gz
bsdtar -xpf /clavator/ArchLinuxARM-rpi-2-latest.tar.gz -C /arch

qarch=arm
cp /usr/bin/qemu-$qarch-static /arch/usr/bin

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/$qarch
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register


#reflector --verbose --latest 5 --sort rate --save /arch/etc/pacman.d/mirrorlist

/bin/sh /builder/run-construqt.sh eth0

/bin/sh /builder/create-os-image-updater.sh

cat <<MMC > /arch/create-mmcblk0.sh
ln $hole_disk /dev/mmcblk0
ls -la $hole_disk /dev/mmcblk0
MMC

arch-chroot /arch /usr/bin/qemu-$qarch-static /bin/sh /updater.sh

umount /arch/boot
umount /arch
losetup -d $hole_disk
losetup -d $part1
losetup -d $part2

mkdir -p /result/img
ln $image_name /result/img

cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/$image_name /rpi23.img

CMD ["/bin/sh"]
RUNNER

echo "build"
docker build -t clavator-os-image-rpi23-arm-$VERSION /result
echo "tag"
docker tag clavator-os-image-rpi23-arm-$VERSION fastandfearless/clavator:clavator-os-image-rpi23-arm-$VERSION
echo "push"
[  -n "$DOCKER_AUTH" ] && \
  docker push fastandfearless/clavator:clavator-os-image-rpi23-arm-$VERSION


