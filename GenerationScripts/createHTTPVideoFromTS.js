const { getVideoDurationInSeconds } = require('get-video-duration')
var static = require('node-static');

var fs = require('fs');

const fileLocation = process.argv[2] || "./videos/"
const URL = process.argv[3] || "http://127.0.0.1:8080/"


try {
    fs.unlinkSync(fileLocation+'http.m3u8');
} catch (error) {
    console.log('File does not exist, creating one')
}
fs.appendFileSync(fileLocation+'http.m3u8', '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10000\n#EXT-X-MEDIA-SEQUENCE:0\n');

// Loop through all the files in the temp directory
fs.readdir(fileLocation, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }
  let promises = []
  try {
    let fileNumber = 0
    files.forEach(function (file, index) {
      if (file.includes('.ts')){
          console.log(file)
          promises.push(getVideoDurationInSeconds(fileLocation+file))
          fileNumber=fileNumber+1
      }
    });
    console.log(fileNumber + " segments found in " + fileLocation)
  } catch (error) {
    console.log('TS files not in specified directory '+ fileLocation)
    throw error
  }
  let totalDuration = 0
  let index = 0

  Promise.all(promises).then(function(values) {
    values.forEach(duration => {
        console.log(duration)
        totalDuration = totalDuration + duration
        fs.appendFileSync(fileLocation+'http.m3u8', '#EXTINF:'+duration+',\n'+URL+'/output'+index+'.ts\n');
        index++
      });
      console.log('Segment URL example: ' + URL+'/output'+index+'.ts')
      fs.readFile(fileLocation+'http.m3u8', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result = data.replace(/EXT-X-TARGETDURATION:10000/g, 'EXT-X-TARGETDURATION:'+totalDuration);
      
        fs.writeFile(fileLocation+'http.m3u8', result, 'utf8', function (err) {
           if (err) return console.log(err);
        });
      });
      fs.appendFileSync(fileLocation+'http.m3u8', '#EXT-X-ENDLIST');

      var file = new static.Server(fileLocation);
      require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            //
            // Serve files!
            //
            file.serve(request, response);
        }).resume();
      }).listen(8080);

      console.log('Finished encoding in '+fileLocation+'http.m3u8')
      console.log('Serving the packages in '+URL)
  });
});


