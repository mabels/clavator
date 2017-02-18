rm -f /run/docker.sock
docker daemon --storage-driver=overlay --graph=/mnt/var/lib/docker &
DOCKER_PID=$!
echo "daemon:"$DOCKER_PID
until docker ps
do
  sleep 1
done
echo "DOCKER DAEMON is active"
docker load < /docker/clavator-docker-$ARCH-$GNUPGVERSION-$NODEVERSION.docker
echo "load:"$?
docker images -a
kill $DOCKER_PID
echo "DOCKER DAEMON is shutdown"
while pgrep docker
do
  sleep 1
done
echo "DOCKER DAEMON is done"
ln -nfs /run/docker.sock.outer /run/docker.sock
