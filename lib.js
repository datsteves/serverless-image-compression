const AWS = require('aws-sdk');

const fs = require('fs');
const crypto = require('crypto')
const cv = require("opencv")
const getPixels = require("get-pixels")

const imagemin = require('imagemin');
//const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');


const s3 = new AWS.S3();
const myBucket = '<REPLACE THIS WITH YOUR BUCKET>';

module.exports = function(obj) {
    const name = obj.name
    let buf = new Buffer(obj.base64, "base64")
    return imagemin.buffer(
        buf,
        { 
            plugins: [
                mozjpeg({
                    quality: getQuality(buf),
                    dcScanOpt: 2,
                    smooth: 0,
                    quantTable: 3,
                    tune: "ssim"
                }),
            ]
        }
    )
    .then(function(files){
        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        const RndHash = crypto.createHash('sha1').update(current_date + random).digest('hex');
        const params = {
            Bucket: myBucket, 
            Key: RndHash+"/"+name, 
            Body: files,
            ACL: 'public-read',
            ContentType: 'image/jpeg'
        };
        let p = new Promise(function(resolve,reject){
            s3.putObject(params, function(err, data) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    const url = "https://s3.eu-central-1.amazonaws.com/"+myBucket+"/"+RndHash+"/"+name
                    console.log("Successfully uploaded data to "+ url);
                    resolve(url)
                }
            
            });
        })
        return p
        
      
    });
}


function getQuality(buff) {
    const p = getEdgePerc(buff) * 100
    return (-2/5) * p + 80
}

function getEdgePerc(buff) {
    cv.readImage(buff, function(err, im){
        im.convertGrayscale()
        im.canny(5, 800)
        //im.houghLinesP()
        //im.save('./out.jpg');
        const buf = im.toBuffer()
        const pixel = getPixels(buf, "image/jpeg", function(err, pixels) {
            if(err) {
                console.log(err)
                console.log("Bad image path")
                return
            }
            const pixelCount = pixels.shape.slice()[0] * pixels.shape.slice()[1]
            let nonBlackPixelCount = 0
            for(let i = 0; i < pixels.data.length; i += 4) {
                if(isNonBlack(pixels.data[i],pixels.data[i+1],pixels.data[i+2],pixels.data[i+3])) {
                    nonBlackPixelCount += 1
                }
            }
            console.log("perc: ", nonBlackPixelCount / pixelCount)
        })
    })
}

function isNonBlack(r,g,b,a) {
    if(r === 0 && g === 0 && b === 0 && a === 255) {
        return false
    }
    return true
}