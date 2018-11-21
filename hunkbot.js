// General
const fs = require('fs')
const lodash = require('lodash')

// hunkbot
var request = require('request-promise')
const HUNKBOTEMAIL = process.env.HUNKBOTEMAIL
const HUNKBOTPASSWORD = process.env.HUNKBOTPASSWORD
const HUNKBOTUSERNAME = process.env.HUNKBOTUSERNAME

// imgur
const IMGURCLIENTID = process.env.IMGURCLIENTID
var imgurResponse

var loginResponse
var authenticationToken
var isUnreadResponse
var isUnreadFlag
var activity

// S3 interaction
// It looks like we don't need these as aws-sdk pulls these from the environment
// TODO: Figure out if this has to be set via aws-cli configure
// Or if we can set these some other way. Not sure how it will work in Lambda.
// See: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html

// const ACCESSKEYID = process.env.ACCESSKEYID
// const SECRETACCESSKEY = process.env.SECRETACCESSKEY
const S3BUCKETNAME = process.env.S3BUCKETNAME
const awsPath = `https://s3.amazonaws.com/${S3BUCKETNAME}/`
const AWS = require('aws-sdk')

// console.log(HUNKBOTEMAIL)
// console.log(HUNKBOTPASSWORD)
// console.log(HUNKBOTUSERNAME)

// Defining Peach API requests

var loginOptions = {
  url: 'https://v1.peachapi.com/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  json: { 'email': HUNKBOTEMAIL, 'password': HUNKBOTPASSWORD }
}

var isUnreadOptions = {
  url: 'https://v1.peachapi.com/activity/isUnread',
  method: 'GET',
  headers: { 'Authorization': `Bearer ${authenticationToken}` }
}

var activityOptions = {
  url: 'https://v1.peachapi.com/activity',
  method: 'GET',
  headers: { 'Authorization': `Bearer ${authenticationToken}` }
}

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

var readOptions = {
  url: 'https://v1.peachapi.com/activity/read',
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${authenticationToken}` }
}

// Defining imgur API requests
var imgurOptions = {
  url: 'https://api.imgur.com/3/album/4eArsFU',
  method: 'GET',
  headers: { 'Authorization': `Client-ID ${IMGURCLIENTID}` }
}

// S3

let s3 = new AWS.S3()
let s3Params = {
  Bucket: S3BUCKETNAME,
  // "Keys" are the actual filenames, in S3 parlance.
  // The "MaxKeys" value is the maximum number of items to retrieve.
  MaxKeys: 100
}
var fileList
var imageURLArray = []

// imgur
var imgurArray = []

// Async chain

/*
// S3 request and building an image list

async function doRequests () {
  // The listObjectsV2 method allows us to retrieve up to 1000 records.
  await s3.listObjectsV2(s3Params, function (err, data) {
    if (err) console.log(`ERROR!: ${err}, ${err.stack}`)
    else {
    // Feed the results from S3 into a new variable.
      fileList = data
      console.log(fileList)
      // Find out how many images are available.
      // TODO: Some filetype checking. Right now, we have no special handling for cases where a non-image file or busted record is returned.
      let countOfImages = fileList.Contents.length
      // Opening a file for writing. imagePaths.txt will be overwritten each time this script runs.
      var logger = fs.createWriteStream('imagePaths.txt')
      // Iterate over each image
      for (let x = 0; x < countOfImages; x++) {
      // Create an image URL using each individual filename ("Key")
        let imagePath = `${awsPath}${fileList.Contents[x].Key}`
        try {
        // Attempt to write the current URL to the file, followed by a newline
          logger.write(`${imagePath}\n`)
          // Update the in-memory list of available image URLs
          imageURLArray.push(imagePath)
        } catch (err) {
        // If something goes wrong...
          console.log('Something went wrong when writing to the image paths file.')
        }
      }
      // Close the output file.
      console.log(imageURLArray)
      logger.end()
    }
  })
  */

async function doRequests () {
  // imgur request and building a list of images with their associated widths and heights.dta
  /*
  let imgurRequestResponse
  imgurResponse = await request(imgurOptions, function (err, data) {
    if (err) console.log(`ERROR!: ${err}, ${err.stack}`)
    else {
      imgurRequestResponse = data
    }
  })
  */

  // var request = require('request')

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
          // Need to change the following to check for type 'tag' instead of a mention
          // if (myJSON.data.activityItems[x].body.postMessage[0].text.includes(`@${HUNKBOTUSERNAME}`)) {
          if (myJSON.data.activityItems[x].type === 'tag' && myJSON.data.activityItems[x].body.authorStream.name !== `${HUNKBOTUSERNAME}` && myJSON.data.activityItems[x].body.postMessage[0].type === 'text' && myJSON.data.activityItems[x].body.postMessage[0].text.includes(`@${HUNKBOTUSERNAME}`)
          ) {
            replyOptions.headers.Authorization = `Bearer ${authenticationToken}`
            var authorName = myJSON.data.activityItems[0].body.authorStream.name
            // console.log(myJSON.data.activityItems[0].body.authorStream.name)
            // console.log(myJSON.data.activityItems[x].body.postMessage[0].text)
            replyOptions.json.message[1].text = `@${authorName}`
            // let randomImageIndex = lodash.random(0, imageURLArray.length)
            let randomImageIndex = lodash.random(0, imgurArray.length)
            // replyOptions.json.message[0].src = imageURLArray[randomImageIndex]
            replyOptions.json.message[0].src = imgurArray[randomImageIndex][0]
            // imgur-specific
            replyOptions.json.message[0].src = imgurArray[randomImageIndex][0]
            replyOptions.json.message[0].width = imgurArray[randomImageIndex][1]
            replyOptions.json.message[0].height = imgurArray[randomImageIndex][2]
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
    console.log('Nothing to do.')
    // process.exit()
  }
}

doRequests().catch(err => console.log(err))
// process.exit()
