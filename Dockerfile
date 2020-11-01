FROM node:11
RUN mkdir /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./.git
RUN yarn
COPY . .
#CMD [ "chmod", "+x", "hunkbot.sh" ]
#CMD [ "sh", "hunkbot.sh" ]
CMD chmod +x hunkbot.sh
sh hunkbot.sh
