const ACCESSKEYID = process.env.ACCESSKEYID
const SECRETACCESSKEY = process.env.SECRETACCESSKEY
const S3BUCKETNAME = process.env.S3BUCKETNAME
const awsPath = `https://s3.amazonaws.com/${S3BUCKETNAME}/`
const AWS = require('aws-sdk')
const fs = require('fs')
let s3 = new AWS.S3()
let params = {
  Bucket: S3BUCKETNAME,
  MaxKeys: 100
}
var fileList

// naive testing
console.log(ACCESSKEYID)
console.log(SECRETACCESSKEY)
console.log(S3BUCKETNAME)
console.log(awsPath)
console.log(params)

s3.listObjectsV2(params, function (err, data) {
  if (err) console.log(`ERROR!: ${err}, ${err.stack}`)
  else {
    fileList = data
    let countOfImages = fileList.Contents.length
    // let imagePaths = []
    var logger = fs.createWriteStream('imagePaths.txt')
    for (let x = 0; x < countOfImages; x++) {
      // imagePaths.push(`${awsPath}${fileList.Contents[x].Key}`)
      let imagePath = `${awsPath}${fileList.Contents[x].Key}`
      try {
        logger.write(`${imagePath}\n`)
      } catch (err) {
        console.log('Something went wrong when writing to the image paths file.')
      }
    }
    logger.end()
    /*
    fs.writeFile('imagePaths.txt', JSON.stringify(imagePaths), (err) => {
      if (err) console.log(`ERROR!: ${err}, ${err.stack}`)
      console.log('Image paths written to imagePaths.txt.')
    })
    */
  }
})
