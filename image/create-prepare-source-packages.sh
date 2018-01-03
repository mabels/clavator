
rsync -ax /builder/tar /arch/usr/src
useradd -m clavator
mkdir -p /arch/usr/src/aur
(cd /arch/usr/src/aur && \
  git clone https://aur.archlinux.org/xlogin-git.git && \
  (cd xlogin-git && \
    echo "systemctl enable xlogin@clavator" > enable.sh && \
    echo "systemctl start xlogin@clavator" >> enable.sh && \
    chown -R clavator . && \
    su -c "makepkg --allsource" clavator))
find /arch/usr/src/aur -ls
