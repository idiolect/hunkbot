// IMPORTANT: imgur stuff commented out
// Using self-hosted images instead.

const lodash = require('lodash')

// hunkbot
var request = require('request-promise')
const HUNKBOTEMAIL = process.env.HUNKBOTEMAIL
const HUNKBOTPASSWORD = process.env.HUNKBOTPASSWORD
const HUNKBOTUSERNAME = process.env.HUNKBOTUSERNAME
const IMAGEPATH = process.env.IMAGEPATH
//const IMAGEPATH ="./images/"
const HOSTPATH = process.env.HOSTPATH

// local images
const fs = require('fs')
var sizeOf = require('image-size');

/*
// imgur
const IMGURCLIENTID = process.env.IMGURCLIENTID
var imgurResponse
*/

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

/*
// imgur
var imgurArray = []
*/

/*
// imgur
async function doRequests () {
  // imgur request and building a list of images with their associated widths and heights.

  var headers = {
    'Authorization': 'Client-ID 7564b7a4844b5c8'
  }

  var options = {
    url: 'https://api.imgur.com/3/album/4eArsFU',
    headers: headers
  }

  function callback (error, response, body) {
    if (!error && response.statusCode === 200) {
      imgurResponse = JSON.parse(body)
    }
  }

  await request(options, callback)

  let countOfImages = imgurResponse.data.images.length
  console.log(countOfImages)
  for (let x = 0; x < countOfImages; x++) {
    let hunkURL = imgurResponse.data.images[x].link
    let hunkWidth = imgurResponse.data.images[x].width
    let hunkHeight = imgurResponse.data.images[x].height
    imgurArray.push([hunkURL, hunkWidth, hunkHeight])
  }
  console.log(imgurArray)
  */

  // self-hosted:
  // need: filenames, image width, image height, url from filename
  imageArray = []
  console.log(IMAGEPATH);
  console.log(HOSTPATH);

  fs.readdirSync(IMAGEPATH).forEach(file => {
    var dimensions = sizeOf(`${IMAGEPATH}/${file}`);
    console.log(file);
    console.log(dimensions);
    finalPath = HOSTPATH + file;
    imageArray.push([finalPath, dimensions.width, dimensions.height]);
  });
/*
  fs.readdir(IMAGEPATH, (err, files) => {
    files.forEach(file => {
      var dimensions = sizeOf(`${IMAGEPATH}/${file}`);
      console.log(file);
      console.log(dimensions);
      finalPath = HOSTPATH + file;
      imageArray.push([finalPath, dimensions.width, dimensions.height]);
    });
  });
*/
  console.log(imageArray)

// disabling peach stuff for now
/*
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
            // console.log(myJSON.data.activityItems[0].body.authorStream.name)
            // console.log(myJSON.data.activityItems[x].body.postMessage[0].text)
            replyOptions.json.message[1].text = `@${authorName}`
            // let randomImageIndex = lodash.random(0, imageURLArray.length)
            // commenting out the next imgur-specific line
            //let randomImageIndex = lodash.random(0, imgurArray.length)
            let randomImageIndex = lodash.random(0, imageArray.length)
            // replyOptions.json.message[0].src = imageURLArray[randomImageIndex]
            replyOptions.json.message[0].src = imageArray[randomImageIndex][0]
            // imgur-specific
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
*/