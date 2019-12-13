# hunkbot
Hunkbot is a very basic nodejs script that checks for mentions on the social network Peach and responds with a randomly selected picture from a location that you specify. You will need:

A Peach account
Image hosting
Environment variables that describe image hosting, Peach account

The node.js application itself does not loop, it is a one-shot operation. The included hunkbot.sh script can be used to loop hunkbot indefinitely, with a default delay of 60 seconds between checks. Change the argument provided to the sleep command in the script to adjust this.

Usage:
npm/yarn install // install dependencies
chmod +x hunkbot.sh // make the hunkbot script executable
nohup ./hunkbot.sh > /dev/null 2&>1 & // run the hunkbot script in the background, detach it from the current console, and redirect stdout and stderr to /dev/null
