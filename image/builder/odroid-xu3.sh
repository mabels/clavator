arch=arm

dd if=/dev/zero of=image bs=1M count=3000
losetup /dev/loop0 image
sext4=4096
echo -e "n\np\n1\n$sext4\n$eext4\nt\n83\nw" | fdisk image
losetup -o 2097152 /dev/loop1 image
mkfs.ext4 /dev/loop1
mkdir arch
mount /dev/loop1 arch
bsdtar -xpf /ArchLinuxARM-odroid-xu3-latest.tar.gz -C arch
(cd arch/boot/ && ./sd_fusing.sh /dev/loop0)

cp /usr/bin/qemu-$arch-static /arch/usr/bin
qarch=$arch

mount binfmt_misc -t binfmt_misc /proc/sys/fs/binfmt_misc
echo -1 > /proc/sys/fs/binfmt_misc/$qarch
echo ':arm:M::\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/usr/bin/qemu-arm-static:' > /proc/sys/fs/binfmt_misc/register

