
git clone https://github.com/mabels/construqt.git -b service /builder/construqt
git clone https://github.com/mabels/ipaddress.git /builder/ipaddress

(cd /builder && CONSTRUQT_PATH=/builder ruby construqt.rb $1)

cp /builder/cfgs/clavator/deployer.sh /arch/
