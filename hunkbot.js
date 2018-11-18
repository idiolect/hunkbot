// General
const fs = require('fs')
const lodash = require('lodash')

// hunkbot
var request = require('request-promise')
const HUNKBOTEMAIL = process.env.HUNKBOTEMAIL
const HUNKBOTPASSWORD = process.env.HUNKBOTPASSWORD
const HUNKBOTUSERNAME = process.env.HUNKBOTUSERNAME
var loginResponse
var authenticationToken
var isUnreadResponse
var isUnreadFlag
var activity

// S3 interaction
const ACCESSKEYID = process.env.ACCESSKEYID
const SECRETACCESSKEY = process.env.SECRETACCESSKEY
const S3BUCKETNAME = process.env.S3BUCKETNAME
const awsPath = `https://s3.amazonaws.com/${S3BUCKETNAME}/`
const AWS = require('aws-sdk')

console.log(HUNKBOTEMAIL)
console.log(HUNKBOTPASSWORD)
console.log(HUNKBOTUSERNAME)

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
    'src': ''
    // 'height': 0,
    // 'width': 0
  }, { 'type': 'text',
    'text': ''
  }] }
}

var readOptions = {
  url: 'https://v1.peachapi.com/activity/read',
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${authenticationToken}` }
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

// Async chain

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

  let response
  // Login request
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
        if (myJSON.data.activityItems[x].body.postMessage[0].text.includes(`@${HUNKBOTUSERNAME} `)) {
          replyOptions.headers.Authorization = `Bearer ${authenticationToken}`
          var authorName = myJSON.data.activityItems[0].body.authorStream.name
          // console.log(myJSON.data.activityItems[0].body.authorStream.name)
          // console.log(myJSON.data.activityItems[x].body.postMessage[0].text)
          replyOptions.json.message[1].text = `@${authorName}`
          let randomImageIndex = lodash.random(0, imageURLArray.length)
          replyOptions.json.message[0].src = imageURLArray[randomImageIndex]
          console.log(replyOptions)
          response = await request(replyOptions)
          console.log(response)
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
