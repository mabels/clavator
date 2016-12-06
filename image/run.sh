#/bin/bash

echo $DOCKER_HOST
VERSION=$(git rev-parse --verify --short HEAD)
auth=$(ruby -e 'require "json"; puts JSON.parse(IO.read("#{ENV["HOME"]}/.docker/config.json"))["auths"]["https://index.docker.io/v1/"]["auth"]')
docker build -t build-clavator .
docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset
# loopback devices are not part of the cgroup
docker run -ti --privileged ubuntu /sbin/losetup -D
lo_ofs=2
for distro in odroid-xu3 #rpi23 odroid-c2 odroid-c1
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
