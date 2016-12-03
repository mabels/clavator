
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

cd /root/odroid-c2-minimal-debian-ubuntu && ./create_odroid_image

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


