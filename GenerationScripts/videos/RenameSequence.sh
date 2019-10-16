#!/bin/bash
a=0
for i in *.ts; do
  new=$(printf "%01d.ts" "output$a") #04 pad to length of 4
  mv -- "$i" "$new"
  let a=a+1
done