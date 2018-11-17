const fs = require('fs')
var request = require('request-promise')
const HUNKBOTEMAIL = process.env.HUNKBOTEMAIL
const HUNKBOTPASSWORD = process.env.HUNKBOTPASSWORD
var loginResponse
var authenticationToken
var isUnreadResponse
var isUnreadFlag
var activityResponse

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
