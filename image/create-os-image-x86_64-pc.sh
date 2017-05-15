#!/bin/sh

VERSION=$1
mkdir -p $HOME/.docker
echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo VERSION=$VERSION
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=x86_64
image_name=/$(basename $0 .sh)-$VERSION.img

#/usr/sbin/haveged --run 0

dd if=/dev/zero of=$image_name bs=1 count=1 seek=7516192767

sh /builder/retry_losetup.sh -f $image_name
hole_disk=$(losetup -l | grep $image_name | awk '{print $1}')

sext4=2048
echo -e "n\np\n1\n$sext4\n$eext4\nt\n83\nw" | fdisk $hole_disk

. /builder/map-os-image-x86_64-pc.sh

mkfs.ext4 -O '^metadata_csum,^64bit' $part1 || mkfs.ext4 $part1
ROOTID=$(blkid $part1 | awk '{print $2}')
rm -rf /arch
mkdir /arch
mount $part1 /arch


[ -f /clavator/archlinux-bootstrap-2017.04.01-x86_64.tar.gz ] ||
  wget --directory-prefix=/clavator \
    $ARCHLINUX/iso/2017.04.01/archlinux-bootstrap-2017.04.01-x86_64.tar.gz

tar xzf /clavator/archlinux-bootstrap-2017.04.01-x86_64.tar.gz -C /arch
mv /arch/root.x86_64/* /arch/

mkdir -p /arch/etc/pacman.d/
cp /builder/mirrorlist.x86_64 /arch/etc/pacman.d/mirrorlist
mv /arch/etc/hosts /arch/etc/hosts.orig
cp /etc/hosts /arch/etc/hosts

/bin/sh /builder/run-construqt.sh "enp0s3"

#echo 'MODULES="piix ide_disk ahci libahci"' >> /arch/etc/mkinitcpio.conf
#echo MODULES="ac acpi_cpufreq aesni_intel ahci ata_generic ata_piix atkbd battery button crc32_pclmul crc32c_intel crct10dif_pclmul e1000 evdev ext4 fjes floppy ghash_clmulni_intel i2c_piix4 i8042 input_leds intel_agp intel_cstate intel_powerclamp intel_rapl intel_rapl_perf mac_hid mousedev ohci_pci parport_pc pata_acpi pcc_cpufreq pcspkr psmouse sd_mod serio_raw sr_mod tpm_tis usbcore video"  >> /arch/etc/mkinitcpio.conf



/bin/sh /builder/create-os-image-updater.sh
cat <<MMC > /arch/create-mmcblk0.sh
MMC

cat <<GRUB > /arch/grub.sh
cat >> /etc/mkinitcpio.conf <<EOF
MODULES+="ahci "
MODULES+="ehci_pci "
MODULES+="usb_storage "
MODULES+="virtio_blk "
MODULES+="virtio_pci "
MODULES+="atkbd "
MODULES+="hid_generic "
MODULES+="ohci_pci "
MODULES+="usbhid "
MODULES+="hid_logitech_dj uhci_hcd usbhid "

MODULES+="sata_dwc_460ex sata_inic162x sata_mv sata_nv "
MODULES+="sata_promise sata_qstor sata_sil sata_sil24 "
MODULES+="sata_sis sata_svw sata_sx4 sata_uli sata_via "
MODULES+="sata_vsc "
MODULES+="pata_acpi pata_ali pata_amd pata_artop pata_atiixp "
MODULES+="pata_atp867x pata_cmd640 pata_cmd64x pata_cypress "
MODULES+="pata_efar pata_hpt366 pata_hpt37x pata_hpt3x2n "
MODULES+="pata_hpt3x3 pata_it8213 pata_it821x pata_jmicron "
MODULES+="pata_legacy pata_marvell pata_mpiix pata_netcell "
MODULES+="pata_ninja32 pata_ns87410 pata_ns87415 pata_oldpiix "
MODULES+="pata_opti pata_optidma pata_pcmcia pata_pdc2027x "
MODULES+="pata_pdc202xx_old pata_piccolo pata_radisys pata_rdc "
MODULES+="pata_rz1000 pata_sch pata_serverworks pata_sil680 "
MODULES+="pata_sis pata_sl82c105 pata_triflex pata_via "

BINARIES="fsck fsck.ext2 fsck.ext3 fsck.ext4  e2fsck"
EOF
pacman -Sy --noconfirm grub linux
pacman -Scc --noconfirm ; rm -f /var/cache/pacman/pkg/*
grub-mkconfig -o /tmp/doof.cfg
sed "s/'.*UUID=.*img.p1'/clavator/g" /tmp/doof.cfg | \
sed "s/root=.*$VERSION.img.p1/root=$ROOTID/" > /boot/grub/grub.cfg
lsinitcpio /boot/initramfs-linux.img
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
sh /builder/retry_losetup.sh -d $hole_disk
sh /builder/retry_losetup.sh -d $part1
rm -f $image_name.p1

. /builder/create-os-image-docker-x86_64-pc.sh

. /builder/docker-push.sh clavator-os-image-x86_64-pc-$VERSION /result

