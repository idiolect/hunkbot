const fs = require('fs')
var request = require('request-promise')

var url1 = {
  url: 'http://localhost:5000/1.txt',
  method: 'GET'
}

var url2 = {
  url: 'http://localhost:5000/2.txt',
  method: 'GET'
}

var url3 = {
  url: 'http://localhost:5000/3.txt',
  method: 'GET'
}

async function doRequests() {
  let response
  response = await request(url1)
  console.log(response)
  response = await request(url2)
  console.log(response)
  response = await request(url3)
  console.log(response)
}

doRequests().catch(err => console.log(err))
