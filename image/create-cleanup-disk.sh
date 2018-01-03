
cat <<CLEANUP > /arch/cleanup.sh
pacman -Scc --noconfirm ; rm -f /var/cache/pacman/pkg/*
dd if=/dev/zero of=/dummy bs=1024k
rm -f /dummy
CLEANUP
