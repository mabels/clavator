
mkdir -p $HOME/.docker
cat > $HOME/.docker/config.json <<RUNNER
{
  "auths": {
    "https://index.docker.io/v1/": {
      "auth": "$DOCKER_AUTH"
    }
  }
}
RUNNER

echo HOSTNAME="clavator" >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
echo USER="clavator"  >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
echo ROOTPASS="clavator"  >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
echo USERPASS="clavator"  >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
echo image_name="clavator" >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
echo linuxsize="600" >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
echo distro="xenial" >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
#echo arch="armhf" >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
echo _compress="" >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
cd /root/odroid-c2-minimal-debian-ubuntu && ./create_odroid_image
#cd /root/odroid-c2-minimal-debian-ubuntu && touch xenial-clavator.imgu xenial-clavator.img1 xenial-clavator.img2
pwd
ls -la

mkdir /root/odroid-c2
cd /root/odroid-c2
mv /root/odroid-c2-minimal-debian-ubuntu .

pwd
ls -la

cat > Dockerfile <<RUNNER
FROM ubuntu:xenial

COPY . /odroid-c2

CMD ["/bin/bash"]
RUNNER

docker build -t odroid-c2-$distro-$VERSION .
docker tag odroid-c2-$distro-$arch-$VERSION fastandfearless/clavator:odroid-c2-$distro-$arch-$VERSION
docker push fastandfearless/clavator:odroid-c2-$distro-$arch-$VERSION


