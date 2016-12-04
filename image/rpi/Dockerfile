FROM ubuntu:yakkety

RUN apt-get update -y && apt-get install -y -q \
    binfmt-support \
    bc \
    bmap-tools \
    crossbuild-essential-armhf \
    debootstrap \
    debian-archive-keyring \
    dosfstools \
    git \
    qemu-user-static \
    rsync \
    whois \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/drtyhlpr/rpi23-gen-image.git

ENV RELEASE stretch
ENV RPI_MODEL 3
ENV ENABLE_WIRELESS false
ENV ENABLE_MINBASE true
ENV BUILD_KERNEL false

#USER root
WORKDIR rpi23-gen-image
CMD ["/bin/bash"]

# RUN ./rpi23-gen-image.sh
