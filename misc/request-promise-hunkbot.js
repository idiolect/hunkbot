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
request(loginOptions).then(function (body) {
  loginResponse = body
  authenticationToken = loginResponse.data.streams[0].token
  console.log(authenticationToken)
})
.catch(function (err) {
  console.log('argh')
})

// 2. Test following function. This should happen AFTER the initial request - always.
var testOptions = {
  url: 'http://localhost:5000/README.md',
  method: 'GET'
}

request(testOptions).then(function (body) {
  console.log(body)
})
.catch(function (err) {
  console.log(err, err.stack)
})

