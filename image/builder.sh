
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
echo linuxsize="2000" >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
echo _compress="" >> /root/odroid-c2-minimal-debian-ubuntu/params.sh
cd /root/odroid-c2-minimal-debian-ubuntu && ./create_odroid_image
#cd /root/odroid-c2-minimal-debian-ubuntu && touch xenial-clavator.imgu xenial-clavator.img1 xenial-clavator.img2
pwd
ls -la

mkdir /root/odroid-c2
cd /root/odroid-c2
mv /root/odroid-c2-minimal-debian-ubuntu/xenial-clavator.imgu .
mv /root/odroid-c2-minimal-debian-ubuntu/xenial-clavator.img1 .
mv /root/odroid-c2-minimal-debian-ubuntu/xenial-clavator.img2 .
mv /root/odroid-c2-minimal-debian-ubuntu/format_sdcard .

pwd
ls -la

cat > Dockerfile <<RUNNER
FROM ubuntu:xenial

COPY xenial-clavator.imgu /
COPY xenial-clavator.img1 /
COPY xenial-clavator.img2 /
COPY format_sdcard /

CMD ["/bin/bash"]
RUNNER

docker build -t odroid-c2-$VERSION .
docker tag odroid-c2-$VERSION fastandfearless/clavator:odroid-c2-$VERSION
docker push fastandfearless/clavator:odroid-c2-$VERSION


