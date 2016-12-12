

/bin/sh /build-gnupg-x86_64.sh
/bin/sh /build-gnupg-arm.sh
/bin/sh /build-gnupg-aarch64.sh

/bin/sh /build-clavator.sh

while true
do
  if [ -f /clavator/js.done -a \
       -f /clavator/x86_64/gnupg.done -a \
       !-f /clavator/x86_64/docker.done ]
  then
    /bin/sh /build-docker-x86_64.sh
  fi
  if [ -f /clavator/js.done -a \
       -f /clavator/arm/gnupg.done -a \
       !-f /clavator/arm/docker.done ]
  then
    /bin/sh /build-docker-arm.sh
  fi
  if [ -f /clavator/js.done -a \
       -f /clavator/aarch64/gnupg.done -a \
       !-f /clavator/aarch64/docker.done ]
  then
    /bin/sh /build-docker-aarch64.sh
  fi
  if [ -f /clavator/aarch64/docker.done -a \
       -f /clavator/arm/gnupg.done -a \
       -f /clavator/x86_64/docker.done ]
  then
    echo "Done"
    exit
  fi
  echo "Waiting for:" /clavator/js.done /clavator/*/*.done
  sleep 1
done

