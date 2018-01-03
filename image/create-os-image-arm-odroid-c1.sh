
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

dd if=/dev/zero of=$image_name bs=1 count=1 seek=7516192767

losetup -f $image_name
hole_disk=$(losetup -l | grep $image_name | awk '{print $1}')
ln $image_name $image_name.p1
losetup -o 1048576 -f $image_name.p1
part1=$(losetup -l | grep $image_name.p1 | awk '{print $1}')

sext4=2048
echo -e "n\np\n1\n$sext4\n$eext4\nt\n83\nw" | fdisk $hole_disk

mkfs.ext4 -O ^metadata_csum,^64bit $part1
#mkfs.ext4 $part1
mkdir arch
mount $part1 arch

[ -f /clavator/ArchLinuxARM-odroid-c1-latest.tar.gz ] ||
  wget --directory-prefix=/clavator \
  wget http://archlinuxarm.org/os/ArchLinuxARM-odroid-c1-latest.tar.gz
bsdtar -xpf /clavator/ArchLinuxARM-odroid-c1-latest.tar.gz -C /arch

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
/bin/sh -x /builder/create-cleanup-disk.sh
arch-chroot /arch /usr/bin/qemu-$qarch-static /bin/sh -x /cleanup.sh

umount /arch
losetup -d $hole_disk
losetup -d $part1
rm -f $image_name.p1

mkdir -p /result/img
lbzip2 -6 -n $(nproc) $image_name
ln $image_name.bz2 /result/img
export DISK_IMAGE=/result/img/$image_name.bz2

cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/$image_name.bz2 /odroid_c1.img.bz2
RUN ln /odroid_c1.img.bz2 /sdcard.img.bz2

CMD ["/bin/sh"]
RUNNER

echo "build"
docker build -t clavator-os-image-odroid_c1-arm-$VERSION /result
echo "tag"
docker tag clavator-os-image-odroid_c1-arm-$VERSION fastandfearless/clavator:clavator-os-image-odroid_c1-arm-$VERSION
echo "push"
[  -n "$DOCKER_AUTH" ] && \
  docker push fastandfearless/clavator:clavator-os-image-odroid_c1-arm-$VERSION


