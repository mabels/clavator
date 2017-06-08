rm -fr /builder/construqt /builder/ipaddress
git clone https://github.com/mabels/construqt.git /builder/construqt
git clone https://github.com/mabels/ipaddress.git /builder/ipaddress

(cd /builder && CONSTRUQT_PATH=/builder ruby construqt.rb $1 $2)

cp /builder/cfgs/clavator/deployer.sh $3
