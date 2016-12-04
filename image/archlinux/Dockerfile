FROM base/archlinux

EXPOSE 8888

RUN pacman --noconfirm -Sy archlinux-keyring
RUN pacman --noconfirm -Sy ca-certificates
RUN update-ca-trust 
RUN pacman-db-upgrade
RUN pacman --noconfirm -Sy openssl
RUN pacman --noconfirm -Sy nodejs git npm gcc autoconf make libpng
RUN pacman --noconfirm -Syu
RUN pacman-db-upgrade
RUN pacman --noconfirm -Syu

RUN git clone https://github.com/mabels/clavator.git /root/clavator
RUN cd /root/clavator && npm install
RUN cd /root/clavator && npm run build 

CMD ["/bin/bash", "-c", "cd /root/clavator && npm start"]


