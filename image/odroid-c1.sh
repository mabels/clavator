arch=armhf

hole_disk=/dev/loop$lo_ofs
part1=/dev/loop$(expr $lo_ofs + 1)
lo_cnt=2



dd if=/dev/zero of=image bs=1 count=1 seek=3221225471

#dd if=/dev/zero of=image bs=1M count=3000
losetup $hole_disk image
sext4=2048
echo -e "n\np\n1\n$sext4\n$eext4\nt\n83\nw" | fdisk image
losetup -o 1048576 $part1 image
mkfs.ext4 $part1
mkdir arch
mount $part1 arch
wget http://archlinuxarm.org/os/ArchLinuxARM-odroid-c1-latest.tar.gz
bsdtar -xpf /ArchLinuxARM-odroid-c1-latest.tar.gz -C arch
(cd arch/boot/ && ./sd_fusing.sh $hole_disk)

qarch=arm
cp /usr/bin/qemu-$qarch-static /arch/usr/bin

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/$qarch
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register

