cat <<UPDATER > /arch/updater.sh
/bin/sh /create-mmcblk0.sh
pacman-key --init
pacman-key --populate archlinux
echo "n" | \
  pacman -Syyu --noconfirm base openssh openssl git docker pcsclite
systemctl enable sshd.service
systemctl start sshd.service
systemctl enable docker.service
systemctl start docker.service

ln -s /usr/share/zoneinfo/Europe/Berlin /etc/localtime
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
echo "root:root" | chpasswd

echo "CONSTRUQT ME"
/bin/sh /deployer.sh force_hostname
UPDATER
