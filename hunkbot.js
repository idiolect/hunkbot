// const fs = require('fs')
var request = require('request-promise')
const HUNKBOTEMAIL = process.env.HUNKBOTEMAIL
const HUNKBOTPASSWORD = process.env.HUNKBOTPASSWORD
var loginResponse
var authenticationToken
var isUnreadResponse
var isUnreadFlag
var activity
// mentionsArray = []

// Request specifications

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
    'type': 'text',
    'text': 'this is a reply'
  }] }
}

var readOptions = {
  url: 'https://v1.peachapi.com/activity/read',
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${authenticationToken}` }
}

// Async chain

async function doRequests () {
  let response
  // Login request
  response = await request(loginOptions)
  loginResponse = response
  authenticationToken = loginResponse.data.streams[0].token
  // console.log(authenticationToken)
  // Check isUnread
  isUnreadOptions.headers.Authorization = `Bearer ${authenticationToken}`
  response = await request(isUnreadOptions)
  isUnreadResponse = response
  isUnreadFlag = JSON.parse(isUnreadResponse).data.isUnreadActivity
  // console.log(`isUnreadFlag: ${isUnreadFlag}`)
  // if there are unread items...
  if (isUnreadFlag === true) {
    activityOptions.headers.Authorization = `Bearer ${authenticationToken}`
    response = await request(activityOptions)
    activity = response
    // console.log('activityOptions:')
    console.log(response)
    // Check each activity item for the unread flag, and then for the presence of a mention
    var myJSON = JSON.parse(activity)
    var myJSONLength = myJSON.data.activityItems.length
    for (var x = 0; x < myJSONLength; x++) {
      // do stuff
      if (myJSON.data.activityItems[x].isUnread) {
        if (myJSON.data.activityItems[x].body.postMessage[0].text.includes('@testypeach ')) {
          replyOptions.headers.Authorization = `Bearer ${authenticationToken}`
          var authorName = myJSON.data.activityItems[0].body.authorStream.name
          console.log(myJSON.data.activityItems[0].body.authorStream.name)
          console.log(myJSON.data.activityItems[x].body.postMessage[0].text)
          replyOptions.json.message[0].text = `@${authorName} this is a reply`
          response = await request(replyOptions)
        }
      }
    }
    readOptions.headers.Authorization = `Bearer ${authenticationToken}`
    response = await request(readOptions)
    console.log(response)
  } else { // nothing to do, end script immediately }
    process.exit()
  }
}

doRequests().catch(err => console.log(err))

/*
// 1. Login

// Login: Request details
var loginOptions = {
  url: 'https://v1.peachapi.com/login',
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  json: { 'email': HUNKBOTEMAIL, 'password': HUNKBOTPASSWORD }
}

// POST login request and get a response containing the authentication token we need for future API actions
request(loginOptions, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    loginResponse = body
    authenticationToken = loginResponse.data.streams[0].token
    console.log(authenticationToken)

    // 2. Get unread events

    // isUnread: Configure headers
    var isUnreadHeaders = {
      'Authorization': `Bearer ${authenticationToken}`
    }

    // isUnread: Request details
    var isUnreadOptions = {
      url: 'https://v1.peachapi.com/activity/isUnread',
      method: 'GET',
      headers: isUnreadHeaders
    }

    // Check to see if there are any unread items in our activity stream
    request(isUnreadOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        isUnreadResponse = body
        isUnreadFlag = JSON.parse(isUnreadResponse).data.isUnreadActivity
        console.log(`isUnreadFlag: ${isUnreadFlag}`)
        if (isUnreadFlag === true) console.log('Unread items exist.')
        else console.log('No unread items exist.')
      }
    })

    // 3. Retrieve activity if unread items exist (and if there are unread items, handle them here??)
    if (isUnreadFlag === true) {
      // do something in reply to each unread mention
      // activity: Configure headers
      var activityHeaders = {
        'Authorization': `Bearer ${authenticationToken}`
      }

      // activity: Request details
      var activityOptions = {
        url: 'https://v1.peachapi.com/activity',
        method: 'GET',
        headers: activityHeaders
      }

      // Check to see if there are any unread items in our activity stream
      request(activityOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          activityResponse = body
          // isUnreadFlag = JSON.parse(isUnreadResponse).data.isUnreadActivity
          console.log(`activityResponse: ${activityResponse}`)
          // if (isUnreadFlag === true) console.log('Unread items exist.')
          // else console.log('No unread items exist.')
        }
      })
    } else {
      // do something/nothing when there are no unread items
      console.log('No unread items to act on.')
    }
  }
})
*/
