rm -rf /clavator/js /clavator/js.done
git clone https://github.com/mabels/clavator.git /clavator/js
cd /clavator/js && npm install 
cd /clavator/js && npm run build 
touch /clavator/js.done
