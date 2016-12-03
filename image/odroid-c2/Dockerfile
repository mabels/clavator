FROM ubuntu:xenial

RUN apt update -y
RUN apt install -y -q vim xz-utils dosfstools debootstrap git qemu-user-static qemu-utils qemu docker.io
#RUN git clone https://github.com/mscdex/odroid-c2-minimal-debian-ubuntu.git /root/odroid-c2-minimal-debian-ubuntu

COPY builder.sh /root
COPY odroid-c2-minimal-debian-ubuntu /root/odroid-c2-minimal-debian-ubuntu

CMD ["/bin/bash", "/root/builder.sh"]

