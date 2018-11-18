/* Script to construct a list of image URLs hunkbot can draw from.
Sensitive information such as AWS credentials are stored outside of the script in environment variables.
*/

// const ACCESSKEYID = process.env.ACCESSKEYID
// const SECRETACCESSKEY = process.env.SECRETACCESSKEY
const S3BUCKETNAME = process.env.S3BUCKETNAME
const awsPath = `https://s3.amazonaws.com/${S3BUCKETNAME}/`
const AWS = require('aws-sdk')
const fs = require('fs')
let s3 = new AWS.S3()
let params = {
  Bucket: S3BUCKETNAME,
  // "Keys" are the actual filenames, in S3 parlance.
  // The "MaxKeys" value is the maximum number of items to retrieve.
  MaxKeys: 100
}
var fileList

// The listObjectsV2 method allows us to retrieve up to 1000 records.
s3.listObjectsV2(params, function (err, data) {
  if (err) console.log(`ERROR!: ${err}, ${err.stack}`)
  else {
    // Feed the results from S3 into a new variable.
    fileList = data
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
      } catch (err) {
        // If something goes wrong...
        console.log('Something went wrong when writing to the image paths file.')
      }
    }
    // Close the output file.
    logger.end()
  }
})
