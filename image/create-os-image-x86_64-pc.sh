#!/bin/sh

VERSION=$1
mkdir -p $HOME/.docker
echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo VERSION=$VERSION
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=x86_64
. /builder/setup_image_name.sh /$(basename $0 .sh)-$VERSION.img

#/usr/sbin/haveged --run 0

dd if=/dev/zero of=$image_name bs=1 count=1 seek=7516192767

hole_disk=$(sh /builder/to_loop.sh $image_name)

sext4=2048
echo -e "n\np\n1\n$sext4\n$eext4\nt\n83\nw" | fdisk $hole_disk

. /builder/map-os-image-x86_64-pc.sh

mkfs.ext4 -O '^metadata_csum,^64bit' $part1 || mkfs.ext4 $part1
ROOTID=$(blkid $part1 | awk '{print $2}')
rm -rf /arch
mkdir /arch
mount $part1 /arch


version=$(date +'%Y.%m')
[ -f /clavator/archlinux-bootstrap-$version.01-x86_64.tar.gz ] ||
  wget --directory-prefix=/clavator \
    $ARCHLINUX/iso/$version.01/archlinux-bootstrap-$version.01-x86_64.tar.gz

tar xzf /clavator/archlinux-bootstrap-$version.01-x86_64.tar.gz -C /arch
mv /arch/root.x86_64/* /arch/

mkdir -p /arch/etc/pacman.d/
cp /builder/mirrorlist.x86_64 /arch/etc/pacman.d/mirrorlist
mv /arch/etc/hosts /arch/etc/hosts.orig
cp /etc/hosts /arch/etc/hosts

#/bin/sh /builder/run-construqt.sh "enp0s3"

#echo 'MODULES="piix ide_disk ahci libahci"' >> /arch/etc/mkinitcpio.conf
#echo MODULES="ac acpi_cpufreq aesni_intel ahci ata_generic ata_piix atkbd battery button crc32_pclmul crc32c_intel crct10dif_pclmul e1000 evdev ext4 fjes floppy ghash_clmulni_intel i2c_piix4 i8042 input_leds intel_agp intel_cstate intel_powerclamp intel_rapl intel_rapl_perf mac_hid mousedev ohci_pci parport_pc pata_acpi pcc_cpufreq pcspkr psmouse sd_mod serio_raw sr_mod tpm_tis usbcore video"  >> /arch/etc/mkinitcpio.conf



#     virtualbox-guest-dkms \
/bin/sh -x /builder/create-os-image-updater.sh \
     xf86-video-fbdev \
     virtualbox-guest-modules-arch \
     virtualbox-guest-utils
cat <<MMC > /arch/create-mmcblk0.sh
MMC

mkdir -p /arch/pkg
ls -l /builder/pkg
cp -pr /builder/pkg /arch/pkg

cat <<GRUB > /arch/grub.sh
cat >> /etc/mkinitcpio.conf <<EOF
MODULES=(ahci ata_piix ata_generic libata sd_mod ehci_pci usb_storage virtio_blk virtio_pci atkbd hid_generic ohci_pci usbhid hid_logitech_dj uhci_hcd usbhid sata_dwc_460ex sata_inic162x sata_mv sata_nv sata_promise sata_qstor sata_sil sata_sil24 sata_sis sata_svw sata_sx4 sata_uli sata_via sata_vsc pata_acpi pata_ali pata_amd pata_artop pata_atiixp pata_atp867x pata_cmd640 pata_cmd64x pata_cypress pata_efar pata_hpt366 pata_hpt37x pata_hpt3x2n pata_hpt3x3 pata_it8213 pata_it821x pata_jmicron pata_legacy pata_marvell pata_mpiix pata_netcell pata_ninja32 pata_ns87410 pata_ns87415 pata_oldpiix pata_opti pata_optidma pata_pcmcia pata_pdc2027x pata_pdc202xx_old pata_piccolo pata_radisys pata_rdc pata_rz1000 pata_sch pata_serverworks pata_sil680 pata_sis pata_sl82c105 pata_triflex pata_via) 

BINARIES=(fsck fsck.ext2 fsck.ext3 fsck.ext4 e2fsck)
HOOKS=(base udev autodetect modconf block filesystems keyboard fsck)
EOF
pacman -Sy --noconfirm sed grub linux
pacman -Q linux 
pacman -Q linux | awk '{print $2}'
# echo mkinitcpio -g /boot/initramfs-linux.img $(pacman -Q linux | awk '{print $2}')-ARCH
# mkinitcpio -g /boot/initramfs-linux.img $(pacman -Q linux | awk '{print $2}')-ARCH
grub-mkconfig -o /tmp/doof.cfg
sed "s/'.*UUID=.*img.p1'/clavator/g" /tmp/doof.cfg | \
sed "s/root=.*$VERSION.img.p1/root=$ROOTID/" > /boot/grub/grub.cfg
# lsinitcpio /boot/initramfs-linux.img
pacman --noconfirm -U /pkg/*
rm -rf /pkg
pacman -Scc --noconfirm ; rm -f /var/cache/pacman/pkg/*
GRUB


echo "ROOTID=$ROOTID"
arch-chroot /arch /bin/sh -x /updater.sh
arch-chroot /arch /bin/sh -x /grub.sh

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

