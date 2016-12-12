#!/bin/bash
mirrorlist=$1
out_mirrorlist=$2
echo "use mirrorlist $mirrorlist write to $out_mirrorlist"

## Creates .tmp file if it doesn't exist and writes a blank line into it. (Useful if the script is cancelled before the rm function)
touch .massping.tmp
echo -n > .massping.tmp

## Collect the mirrors from /etc/pacman.d/mirrorlist, strip them and enter them into the $mirrors array
mirrors=$(cat $mirrorlist | grep "Server =" | sed 's/^.*\=//')

## Loop through the array values and query them and ping them.
rm -f .massping.tmp.*
for i in ${mirrors[@]}; do
	name=$(echo $i | awk -F '/' '{print $3}')
  ## Show &gt; symbol to indicate progress and write the URL to temporary file without a newline
  echo -n $i >> .massping.tmp.$name
  ## Ping the actual server, retrieve the average from the last line, strip it and write to the temporary file
  (ping -W 2 -fc5 $name | tail -1| awk -F '/' '{print " " $5 " ms"}' >> .massping.tmp.$name) &
done
sleep 3
cat .massping.tmp.* > .massping.tmp
#rm -f .massping.tmp.*
## Set variable $fastest by sorting the temp file based off numerical pings, removes blanks/timeouts and returns the top value.
fastest=$(sort -nk2 .massping.tmp | grep -v "repo  ms" | head -5)

## Prints to screen the fastest average ping in green and clears color formatting, ready for next output
sed 's/^.*Server/\# Server/' $mirrorlist  > $out_mirrorlist.new
for fast in $fastest
do
  echo $fast $(echo $fastest | sed 's/ .*$//')
  sed -i "s|^# Server = $fast|Server = $fast|" $out_mirrorlist.new
done

#rm .massping.tmp

mv $out_mirrorlist $out_mirrorlist.orig
mv $out_mirrorlist.new $out_mirrorlist

