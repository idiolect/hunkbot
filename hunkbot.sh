#!/usr/bin/bash
# neverending loop
# you can remove the cd command if this is always run from the same location as the hunkbot script
# hunkbot checks for new mentions every minute by default - you can set this to a lower value but you might get some doubled responses at fast speeds as hunkbot doesn't track requests/have any state
while true; cd /home/hunkbot; do node hunkbot.js; sleep 60; done
