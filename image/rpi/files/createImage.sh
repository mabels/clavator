#!/bin/sh

USER_NAME=clavator PASSWORD="clavator" NET_ADDRESS="10.10.10.10/24" ENABLE_DHCP=false RELEASE=stretch RPI_MODEL=3 APT_INCLUDES="curl,git,build-essential,haveged,gnupg2,gnupg-agent,libpth20,pinentry-curses,libccid,pcscd,scdaemon,libksba8,paperkey,opensc,isc-dhcp-server" ./rpi23-gen-image.sh
