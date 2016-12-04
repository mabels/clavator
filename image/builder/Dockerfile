FROM base/archlinux


RUN pacman --noconfirm -Sy archlinux-keyring
RUN pacman --noconfirm -Sy ca-certificates
RUN update-ca-trust 
RUN pacman-db-upgrade
RUN pacman --noconfirm -Sy openssl
RUN pacman --noconfirm -Sy git npm gcc autoconf make wget 
RUN pacman --noconfirm -Syu
RUN wget http://archlinuxarm.org/os/ArchLinuxARM-odroid-c1-latest.tar.gz
RUN wget http://archlinuxarm.org/os/ArchLinuxARM-odroid-c2-latest.tar.gz
RUN wget http://archlinuxarm.org/os/ArchLinuxARM-rpi-2-latest.tar.gz
RUN wget http://archlinuxarm.org/os/ArchLinuxARM-odroid-xu3-latest.tar.gz
RUN pacman-db-upgrade
RUN pacman --noconfirm -Syu
RUN pacman --noconfirm -S --needed base-devel
RUN pacman --noconfirm -Sy docker arch-install-scripts dosfstools
RUN git clone https://aur.archlinux.org/qemu-user-static.git 
RUN chown -R nobody:nobody qemu-user-static
RUN cd qemu-user-static && sudo -u nobody makepkg -s
RUN pacman --noconfirm -U qemu-user-static/qemu-user-static-2.7-3-x86_64.pkg.tar.xz 

COPY builder.sh /
COPY odroid-c2.sh /
COPY odroid-xu3.sh /
COPY rpi23.sh /
#COPY odroid-c2-minimal-debian-ubuntu /root/odroid-c2-minimal-debian-ubuntu

CMD ["/bin/bash", "/builder.sh"]

