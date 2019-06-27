# hunkbot
Hunkbot is a very basic nodejs script that checks for mentions on the social network Peach and responds with a randomly selected picture from an imgur album. You will need:

A Peach account
An imgur developer account
Some environment variables set with Peach and imgur account details

Right now, imgur account details are required as hunkbot assumes that a private album is in use.

The script itself does not loop, it is a one-shot operation. The included hunkbot.sh script can be used to loop hunkbot indefinitely, with a default delay of 120 seconds between checks. Change the argument provided to the sleep command in the script to adjust this.

Usage:
npm/yarn install // install dependencies
chmod +x hunkbot.sh // make the hunkbot script executable
nohup ./hunkbot.sh > /dev/null 2&>1 & // run the hunkbot script in the background, detach it from the current console, and redirect stdout and stderr to /dev/null
