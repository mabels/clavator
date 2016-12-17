#!/bin/sh

VERSION=$1
mkdir -p $HOME/.docker
cat > $HOME/.docker/config.json <<RUNNER
{
  "auths": {
    "registry.clavator.com:5000": {
      "auth": "$DOCKER_AUTH"
    }
  }
}
RUNNER
echo VERSION=$VERSION
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=x86_64
image_name=/$(basename $0 .sh)-$VERSION.img

dd if=/dev/zero of=$image_name bs=1 count=1 seek=7516192767

losetup -f $image_name

hole_disk=$(losetup -l | grep $image_name | awk '{print $1}')
ln $image_name $image_name.p1
losetup -o 1048576 -f $image_name.p1
part1=$(losetup -l | grep $image_name.p1 | awk '{print $1}')

sext4=2048
echo -e "n\np\n1\n$sext4\n$eext4\nt\n83\nw" | fdisk $hole_disk

mkfs.ext4 -O '^metadata_csum,^64bit' $part1 || mkfs.ext4 $part1
ROOTID=$(blkid $part1 | awk '{print $2}')
rm -rf /arch
mkdir /arch
mount $part1 /arch


[ -f /clavator/archlinux-bootstrap-2016.12.01-x86_64.tar.gz ] ||
  wget --directory-prefix=/clavator \
  https://mirrors.kernel.org/archlinux/iso/2016.12.01/archlinux-bootstrap-2016.12.01-x86_64.tar.gz

tar xzf /clavator/archlinux-bootstrap-2016.12.01-x86_64.tar.gz -C /arch
mv /arch/root.x86_64/* /arch/

mkdir -p /arch/etc/pacman.d/
cp /etc/pacman.d/mirrorlist /arch/etc/pacman.d/
mv /arch/etc/hosts /arch/etc/hosts.orig
cp /etc/hosts /arch/etc/hosts



/bin/sh /builder/run-construqt.sh "enp0s8"

#echo 'MODULES="piix ide_disk ahci libahci"' >> /arch/etc/mkinitcpio.conf
#echo MODULES="ac acpi_cpufreq aesni_intel ahci ata_generic ata_piix atkbd battery button crc32_pclmul crc32c_intel crct10dif_pclmul e1000 evdev ext4 fjes floppy ghash_clmulni_intel i2c_piix4 i8042 input_leds intel_agp intel_cstate intel_powerclamp intel_rapl intel_rapl_perf mac_hid mousedev ohci_pci parport_pc pata_acpi pcc_cpufreq pcspkr psmouse sd_mod serio_raw sr_mod tpm_tis usbcore video"  >> /arch/etc/mkinitcpio.conf

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

cp /arch/etc/hosts.orig /arch/etc/hosts
reflector --verbose --latest 5 --sort rate --save /arch/etc/pacman.d/mirrorlist

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
rm -f $image_name.p1

mkdir -p /result/img
VBoxManage convertdd $image_name /result/img/virtual.vmdk
xz -z -9 -T 2 /result/img/virtual.vmdk

cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/virtual.vmdk.xz /

CMD ["/bin/sh"]
RUNNER

echo "build"
docker build -t clavator-os-image-x86_64-pc-$VERSION /result
echo "tag"
docker tag clavator-os-image-x86_64-pc-$VERSION registry.clavator.com:5000/clavator-os-image-x86_64-pc-$VERSION
echo "push"
docker push registry.clavator.com:5000/clavator-os-image-x86_64-pc-$VERSION

