
arch=armhf

hole_disk=/dev/loop$lo_ofs
part1=/dev/loop$(expr $lo_ofs + 1)
part2=/dev/loop$(expr $lo_ofs + 2)
lo_cnt=3

dd if=/dev/zero of=image bs=1 count=1 seek=3221225471
#dd if=/dev/zero of=image bs=1M count=3000
losetup $hole_disk image
sfat=2048
fatsize=128
efat=$(expr $fatsize \* 1024 \* 1024 / 512 + $sfat - 1)
sext4=$(expr $efat + 1)
eext4=""
echo -e "n\np\n1\n$sfat\n$efat\nn\np\n2\n$sext4\n$eext4\nt\n1\n6\nt\n2\n83\nw" | fdisk image

losetup -o 1048576 $part1 image
losetup -o 135266304 $part2 image
mkfs.vfat $part1
mkfs.ext4 $part2
mkdir arch
mount $part2 arch
mkdir arch/boot
mount $part1 arch/boot

losetup -a
echo "hole_disk:"$hole_disk
echo "part1:"$part1
echo "part2:"$part2
echo "lo_cnt:"$lo_cnt
df

wget http://archlinuxarm.org/os/ArchLinuxARM-rpi-2-latest.tar.gz
bsdtar -xpf /ArchLinuxARM-rpi-2-latest.tar.gz -C arch

qarch=arm
cp /usr/bin/qemu-$qarch-static /arch/usr/bin

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/$qarch
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register

