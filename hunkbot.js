// https://github.com/idiolect/hunkbot
/*
MIT License

Copyright (c) 2020 Justin Cameron

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const lodash = require('lodash')
var request = require('request-promise')

const HUNKBOTEMAIL = process.env.HUNKBOTEMAIL
const HUNKBOTPASSWORD = process.env.HUNKBOTPASSWORD
const HUNKBOTUSERNAME = process.env.HUNKBOTUSERNAME
const IMAGEPATH = process.env.IMAGEPATH
const HOSTPATH = process.env.HOSTPATH

// local images
const fs = require('fs')
var sizeOf = require('image-size');

  // self-hosted:
  // need: filenames, image width, image height, url from filename
  imageArray = []
  console.log(IMAGEPATH);
  console.log(HOSTPATH);

  fs.readdirSync(IMAGEPATH).forEach(file => {
    if (file != ".dropbox") {
      var dimensions = sizeOf(`${IMAGEPATH}/${file}`);
      //console.log(file);
      //console.log(dimensions);
      finalPath = HOSTPATH + file;
      imageArray.push([finalPath, dimensions.width, dimensions.height]);
      }
  });

// peach
var loginResponse
var authenticationToken
var isUnreadResponse
var isUnreadFlag
var activity

// peach
var loginOptions = {
  url: 'https://v1.peachapi.com/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  json: { 'email': HUNKBOTEMAIL, 'password': HUNKBOTPASSWORD }
}

// peach
var isUnreadOptions = {
  url: 'https://v1.peachapi.com/activity/isUnread',
  method: 'GET',
  headers: { 'Authorization': `Bearer ${authenticationToken}` }
}

// peach
var activityOptions = {
  url: 'https://v1.peachapi.com/activity',
  method: 'GET',
  headers: { 'Authorization': `Bearer ${authenticationToken}` }
}

// peach
var replyOptions = {
  url: 'https://v1.peachapi.com/post',
  method: 'POST',
  headers: { 'Authorization': `Bearer ${authenticationToken}` },
  json: { 'message': [{
    'type': 'image',
    'src': '',
    'height': 0,
    'width': 0
  }, { 'type': 'text',
    'text': ''
  }] }
}

// peach
var readOptions = {
  url: 'https://v1.peachapi.com/activity/read',
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${authenticationToken}` }
}

async function doRequests () {
  //console.log(imageArray)

  // Peach login request
  let response
  response = await request(loginOptions)
  loginResponse = response
  authenticationToken = loginResponse.data.streams[0].token
  console.log(authenticationToken)
  // Check isUnread
  isUnreadOptions.headers.Authorization = `Bearer ${authenticationToken}`
  response = await request(isUnreadOptions)
  isUnreadResponse = response
  isUnreadFlag = JSON.parse(isUnreadResponse).data.isUnreadActivity
  console.log(`isUnreadFlag: ${isUnreadFlag}`)
  // if there are unread items...
  if (isUnreadFlag === true) {
    activityOptions.headers.Authorization = `Bearer ${authenticationToken}`
    response = await request(activityOptions)
    activity = response
    console.log('activityOptions:')
    console.log(response)
    // Check each activity item for the unread flag, and then for the presence of a mention
    var myJSON = JSON.parse(activity)
    var myJSONLength = myJSON.data.activityItems.length
    for (var x = 0; x < myJSONLength; x++) {
      // do stuff
      if (myJSON.data.activityItems[x].isUnread === true) {
        try {
          if (myJSON.data.activityItems[x].type === 'tag' && myJSON.data.activityItems[x].type !== 'like' && myJSON.data.activityItems[x].body.authorStream.name !== `${HUNKBOTUSERNAME}` && myJSON.data.activityItems[x].body.postMessage[0].type === 'text' && myJSON.data.activityItems[x].body.postMessage[0].text.includes(`@${HUNKBOTUSERNAME}`)
          ) {
            replyOptions.headers.Authorization = `Bearer ${authenticationToken}`
            var authorName = myJSON.data.activityItems[x].body.authorStream.name
            replyOptions.json.message[1].text = `@${authorName}`
            let randomImageIndex = lodash.random(0, imageArray.length)
            replyOptions.json.message[0].src = imageArray[randomImageIndex][0]
            replyOptions.json.message[0].src = imageArray[randomImageIndex][0]
            replyOptions.json.message[0].width = imageArray[randomImageIndex][1]
            replyOptions.json.message[0].height = imageArray[randomImageIndex][2]
            console.log(replyOptions)
            response = await request(replyOptions)
            console.log(response)
          }
        } catch (error) {
          console.log('text field not found // includes undefined')
        }
      }
    }
    readOptions.headers.Authorization = `Bearer ${authenticationToken}`
    response = await request(readOptions)
    console.log(response)
  } else { // nothing to do, end script immediately }
    readOptions.headers.Authorization = `Bearer ${authenticationToken}`
    response = await request(readOptions)
    console.log(response)
    console.log('Nothing to do.')
  }
}

doRequests().catch(err => console.log(err))
