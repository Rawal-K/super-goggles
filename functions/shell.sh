var=$(date +"%FORMAT_STRING")
now=$(date +"%m_%d_%Y")
printf "%s\n" $now
today=$(date +"%Y%m%d%H%M%S")


mongodump --host localhost:27017 --out=${today} --gzip --db cron
 

