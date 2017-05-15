#!/bin/sh
i=0
e=1
c=5
while [ $i -lt $c -a $e != 0 ]
do
  losetup $@
  e=$?
  if [ $e != 0 ]
  then
    echo "($i of $c) => $0 $@"
    sleep 1
  fi
  i=$(expr $i + 1)
done
