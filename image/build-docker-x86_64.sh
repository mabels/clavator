
mkdir -p x86_64/docker
cp fastmirror.sh x86_64/docker
cp arch-update.sh x86_64/docker
cat <<DOCKER > x86_64/docker/Dockerfile
FROM build-clavator

COPY build-docker.sh /
COPY fastmirror.sh /
COPY arch-update.sh /

CMD ["/bin/sh", "-x", "/build-docker.sh"]
DOCKER

cat <<EOF > x86_64/docker/build-docker.sh
rm -f /clavator/x86_64/docker.done
mkdir -p /clavator/x86_64/docker
cd /clavator/x86_64/docker && \
  [ ! -f archlinux-bootstrap-2016.12.01-x86_64.tar.gz ] && \
  wget https://mirrors.kernel.org/archlinux/iso/2016.12.01/archlinux-bootstrap-2016.12.01-x86_64.tar.gz 
cd /clavator/x86_64/docker && rm -rf root.x86_64 && \
  tar xzf archlinux-bootstrap-2016.12.01-x86_64.tar.gz 

cp -r /clavator/js /clavator/x86_64/docker/root.x86_64/clavator 
cp -r /clavator/x86_64/gnupg /clavator/x86_64/docker/root.x86_64/clavator 
cp /arch-update.sh /clavator/x86_64/docker/root.x86_64/
mv /etc/pacman.d/mirrorlist.pacnew /etc/pacman.d/mirrorlist
/bin/sh /fastmirror.sh
cp /etc/resolv.conf /clavator/x86_64/docker/root.x86_64/etc/
grep iphh /etc/pacman.d/mirrorlist
cp /etc/pacman.d/mirrorlist /clavator/x86_64/docker/root.x86_64/etc/pacman.d
arch-chroot /clavator/x86_64/docker/root.x86_64 /bin/sh -x /arch-update.sh 

cat <<DOCKER > /clavator/x86_64/docker/root.x86_64/Dockerfile
COPY . /

CMD ["/bin/sh"]
DOCKER

docker build -t clavator-docker-x86_64 /clavator/x86_64/docker/root.x86_64

cat <<DOCKER > /clavator/Dockerfile-x86_64
FROM clavator-docker-x86_64
COPY js /
COPY x86_64/gnupg /
RUN  cd /gnupg && make install && rm -rf /gnupg

CMD ["/bin/sh", "-c" , "cd /js && npm start"]
DOCKER

docker build -t clavator-x86_64 -f Dockerfile-x86_64 /clavator
EOF

docker build -t build-docker-x86_64 x86_64/docker
docker run -i --privileged \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/cache/docker/clavator:/clavator \
  -t build-docker-x86_64

