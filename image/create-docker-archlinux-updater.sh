cat <<UPDATER > /arch/updater.sh
pacman-key --init
pacman-key --populate archlinux
pacman -R --noconfirm linux-armv7
pacman -R --noconfirm linux-aarch64
pacman -Syyu --noconfirm openssh openssl git make nodejs npm 

ln -s /usr/share/zoneinfo/Europe/Berlin /etc/localtime
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
echo "root:root" | chpasswd

UPDATER
