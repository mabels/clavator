#!/bin/sh

RELEASE=stretch RPI_MODEL=3 APT_INCLUDES="curl,git,build-essential,haveged,gnupg2,gnupg-agent,libpth20,pinentry-curses,libccid,pcscd,scdaemon,libksba8,paperkey,opensc" ./rpi23-gen-image.sh
