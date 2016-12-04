
arch=armhf

dd if=/dev/zero of=image bs=1M count=3000
losetup /dev/loop0 image
sfat=2048
fatsize=128
efat=$(expr $fatsize \* 1024 \* 1024 / 512 + $sfat - 1)
sext4=$(expr $efat + 1)
eext4=""
echo -e "n\np\n1\n$sfat\n$efat\nn\np\n2\n$sext4\n$eext4\nt\n1\n6\nt\n2\n83\nw" | fdisk image

losetup -o 1048576 /dev/loop1 image
losetup -o 135266304 /dev/loop2 image
mkfs.vfat /dev/loop1
mkfs.ext4 /dev/loop2
mkdir arch
mount /dev/loop2 arch
mkdir arch/boot
mount /dev/loop1 arch/boot
df
bsdtar -xpf /ArchLinuxARM-rpi-2-latest.tar.gz -C arch

cp /usr/bin/qemu-arm-static /arch/usr/bin
qarch=arm

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/$qarch
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register

