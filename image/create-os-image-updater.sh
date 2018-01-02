cat <<UPDATER > /arch/updater.sh
/bin/sh /create-mmcblk0.sh
pacman-key --init
pacman-key --populate archlinux
pacman -Syyu --noconfirm base openssh openssl git docker pcsclite e2fsprogs sed \
     xorg cups xfce4 chromium sudo make binutils fakeroot \
     system-config-printer splix foomatic-db gutenprint \
     foomatic-db-gutenprint-ppds xfce4-goodies \
    $@

pacman -Scc --noconfirm ; rm -f /var/cache/pacman/pkg/*
dd if=/dev/zero of=/dummy bs=1024k
rm -f /dummy

systemctl enable sshd.service
systemctl start sshd.service
systemctl enable docker.service
systemctl start docker.service

ln -s /usr/share/zoneinfo/Europe/Berlin /etc/localtime
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
echo "root:root" | chpasswd

useradd -m clavator
echo "clavator:clavator" | chpasswd

echo 'clavator ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

for i in /usr/src/tar/*.tar
do
  echo "extract \$i"
  (cd /home/clavator && tar xf \$i)
done

for i in /usr/src/aur/*
do
  echo "build \$i"
  (cd \$i && \
    chown -R clavator . && \
    sudo -u clavator makepkg -s && \
    ls -la * && \
    pacman -U --noconfirm *.pkg.tar.xz && \
    sh \$i/enable.sh)
done

cat > /home/clavator/.xinitrc <<XINITRC
exec startxfce4
XINITRC

mkdir -p /home/clavator/.config/autostart
cat > /home/clavator/.config/autostart/chromium.desktop <<DESKTOP
[Desktop Entry]
Encoding=UTF-8
Version=0.9.4
Type=Application
Name=chromium
Comment=chromium
Exec=/usr/bin/chromium --start-fullscreen http://localhost:9999
OnlyShowIn=XFCE;
StartupNotify=false
Terminal=false
Hidden=false
DESKTOP

chown -R clavator:clavator /home/clavator

#echo "CONSTRUQT ME"
#/bin/sh /deployer.sh force_hostname
UPDATER
