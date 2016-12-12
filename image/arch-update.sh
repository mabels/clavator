ls -la /etc/pacman.d
cat /etc/pacman.d/mirrorlist
cat /etc/resolv.conf
    pacman-key --init
    pacman-key --populate archlinux
ls -la /etc/pacman.d
    /usr/bin/pacman --noconfirm -Sy archlinux-keyring
    /usr/bin/pacman --noconfirm -Sy ca-certificates
    /bin/bash /usr/bin/update-ca-trust
    /bin/bash /usr/bin/pacman-db-upgrade
    /usr/bin/pacman --noconfirm -Syu
    /usr/bin/pacman --noconfirm -Sy openssl nodejs git npm gcc autoconf make \
      libpng automake python2 pcsclite imagemagick mesa-libgl librsvg fig2dev \
      ghostscript texinfo
    /usr/bin/pacman-db-upgrade
    /usr/bin/pacman --noconfirm -Syu
