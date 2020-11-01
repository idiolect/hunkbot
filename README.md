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

Copyright 2020 Justin Cameron

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
