const cv = require("opencv")
const getPixels = require("get-pixels")

const fs = require("fs")

const lib = require("./lib.js")

const file = fs.readFileSync("./uploads_dir/luca-bravo-24241.jpg")

lib({
    name: "test",
    base64: file.toString("base64")
})

return false
cv.readImage("./uploads_dir/luca-bravo-24241.jpg", function(err, im){
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

function isNonBlack(r,g,b,a) {
    if(r === 0 && g === 0 && b === 0 && a === 255) {
        return false
    }
    return true
}