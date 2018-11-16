const fs = require('fs')
var request = require('request')
const HUNKBOTEMAIL = process.env.HUNKBOTEMAIL
const HUNKBOTPASSWORD = process.env.HUNKBOTPASSWORD
var loginResponse
var authenticationToken

// Login: Configure headers
var headers = {
  'Content-Type': 'application/json'
}

// Login: Request details
var options = {
  url: 'https://v1.peachapi.com/login',
  method: 'post',
  headers: headers,
  json: { 'email': HUNKBOTEMAIL, 'password': HUNKBOTPASSWORD }
}

// POST login request and get a response containing the authentication token we need for future API actions

request(options, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    loginResponse = body
    authenticationToken = loginResponse.data.streams[0].token
    console.log(authenticationToken)
  }
})
