FROM base/archlinux

RUN pacman-key --init
RUN pacman-key --populate archlinux
RUN pacman --noconfirm -Sy archlinux-keyring 
RUN pacman --noconfirm -Sy ca-certificates
RUN update-ca-trust 
RUN pacman-db-upgrade
RUN pacman --noconfirm -Syyu openssl
RUN pacman-db-upgrade
RUN pacman --noconfirm -Syyu base openssh openssl git npm gcc autoconf make wget base-devel docker arch-install-scripts dosfstools nodejs git npm gcc autoconf make libpng automake python2 pcsclite imagemagick mesa-libgl librsvg fig2dev ghostscript texinfo
RUN pacman-db-upgrade
#RUN pacman --noconfirm -Sy git npm gcc autoconf make wget 
#RUN pacman --noconfirm -Syu
#RUN pacman-db-upgrade
#RUN pacman --noconfirm -Syu
#RUN pacman --noconfirm -S --needed base-devel
#RUN pacman --noconfirm -Sy docker arch-install-scripts dosfstools
RUN git clone https://aur.archlinux.org/qemu-user-static.git 
RUN chown -R nobody:nobody qemu-user-static
RUN cd qemu-user-static && sudo -u nobody makepkg -s
RUN pacman --noconfirm -U qemu-user-static/qemu-user-static-2.7-3-x86_64.pkg.tar.xz 
#RUN git clone https://github.com/mabels/clavator.git clavator
#RUN cd clavator && npm install 
#RUN cd clavator && npm run build 


COPY build-gnupg-x86_64.sh /
COPY build-gnupg-arm.sh /
COPY build-gnupg-aarch64.sh /
COPY build-clavator.sh /
COPY builder.sh /
COPY arch-update.sh /
COPY x86_64.sh /
COPY odroid-c1.sh /
COPY odroid-c2.sh /
COPY odroid-xu3.sh /
COPY rpi23.sh /
COPY fastmirror.sh /
COPY /build-docker-x86_64.sh
COPY /build-docker-arm.sh
COPY /build-docker-aarch64.sh


CMD ["/bin/bash", "/builder.sh"]

