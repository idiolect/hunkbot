const fs = require('fs')
var request = require('request')
const HUNKBOTEMAIL = process.env.HUNKBOTEMAIL
const HUNKBOTPASSWORD = process.env.HUNKBOTPASSWORD
var loginResponse
var authenticationToken
var isUnreadResponse

// 1. Login

// Login: Configure headers
var loginHeaders = {
  'Content-Type': 'application/json'
}

// Login: Request details
var loginOptions = {
  url: 'https://v1.peachapi.com/login',
  method: 'post',
  headers: loginHeaders,
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
        let isUnreadFlag = JSON.parse(isUnreadResponse).data.isUnreadActivity
        console.log(`isUnreadFlag: ${isUnreadFlag}`)
        if (isUnreadFlag === true) console.log('Unread items exist.')
        else console.log('No unread items exist.')
      }
    })
  }
})
