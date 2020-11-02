# hunkbot
Hunkbot is a very basic nodejs script that checks for mentions on the social network Peach and responds with a randomly selected picture from a location that you specify. You will need:

* A Peach account for the script to use
* A server with node.js for the hunkbot script to run on
* A folder of images to select from
* A folder of web-accessible images to serve from (can be the same as the folder above)
* Environment variables that specify image location, Peach credentials, etc. -> See environment.txt for examples

The node.js application itself does not loop, it is a one-shot operation. The included hunkbot.sh script can be used to loop hunkbot indefinitely, with a default delay of 60 seconds between checks. Change the argument provided to the sleep command in the script to adjust this.

Example usage:

* yarn install // (or npm install) install dependencies
* chmod +x hunkbot.sh // make the hunkbot script executable
* nohup ./hunkbot.sh > /dev/null 2&>1 & // run the hunkbot script in the background, detach it from the current console, and redirect stdout and stderr to /dev/null
* // optionally, create a cron job to run hunkbot.sh at boot and let it run automatically
