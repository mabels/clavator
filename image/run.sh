#/bin/bash

echo $DOCKER_HOST
VERSION=$(git rev-parse --verify --short HEAD)
auth=$(ruby -e 'require "json"; puts JSON.parse(IO.read("#{ENV["HOME"]}/.docker/config.json"))["auths"]["$DOCKER_REGISTRY"]["auth"]')
docker build -t build-clavator .
docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset
# loopback devices are not part of the cgroup
#docker run -ti --privileged ubuntu /sbin/losetup -D

docker run -ti --privileged \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/cache/docker/clavator:/clavator \
  -t build-clavator

exit



lo_ofs=2
for arch in arm aarch64 x86_64
do
  mkdir -p $arch
  cat <<DOCKER > $arch/Dockerfile
FROM build-gnupg-$arch

RUN wget http://archlinuxarm.org/os/ArchLinuxARM-odroid-c1-latest.tar.gz
RUN mkdir -p /arch && bsdtar -xpf /ArchLinuxARM-odroid-c1-latest.tar.gz -C /arch
RUN git clone https://github.com/mabels/gnupg.git -b quick-keytocard /arch/gnupg
RUN cd /arch/gnupg && sh ./autogen.sh
RUN arch-chroot /arch /usr/bin/qemu-$arch-static /bin/sh -c "cd /gnupg && ./configure --sysconfdir=/etc --enable-maintainer-mode && make"

cp -rp /clavator /arch
DOCKER  

end

  docker bui
done
  for distro in odroid-xu3 rpi23 odroid-c1
  do
  echo "Run Builder for:"$distro":"$lo_ofs
  docker run -ti --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    --env "DOCKER_AUTH=$auth" \
    --env "VERSION=$VERSION" \
    --env "distro=$distro" \
    --env "lo_ofs=$lo_ofs" \
    -t build-clavator 
  lo_ofs=$(expr $lo_ofs + 3)
done
