const { getVideoDurationInSeconds } = require('get-video-duration')
var ipfsClient = require('ipfs-http-client')

var ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

var fs = require('fs');

const fileLocation = process.argv[2] || "./videos/"
const URL = process.argv[3] || "http://127.0.0.1:8080/"


try {
    fs.unlinkSync(fileLocation+'ipfs.m3u8');
} catch (error) {
    console.log('File does not exist, creating one')
}
fs.appendFileSync(fileLocation+'ipfs.m3u8', '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10000\n#EXT-X-MEDIA-SEQUENCE:0\n');

// Loop through all the files in the temp directory
fs.readdir(fileLocation, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }
  let promisesVideoLength = []
  let promisesIPFSAdd = []
  try {
    files.forEach(function (file, index) {
      if (file.includes('.ts')){
          console.log(file)
          promisesVideoLength.push(getVideoDurationInSeconds(fileLocation+file))
          promisesIPFSAdd.push(ipfs.add(fs.readFileSync(fileLocation+file)))
      }
    });
  } catch (error) {
    console.log('TS files not in specified directory '+ fileLocation)
  }
  let totalDuration = 0
  let index = 0

  Promise.all(promisesVideoLength).then(function(values) {
    Promise.all(promisesIPFSAdd).then(function(ipfsDoc) {
    values.forEach(duration => {
        console.log(duration)
        totalDuration = totalDuration + duration
        fs.appendFileSync(fileLocation+'ipfs.m3u8', '#EXTINF:'+duration+',\nhttp://localhost:8081/ipfs/'+ipfsDoc[index][0].hash+'\n');
        console.log('File uploaded to ipfs '+URL+ipfsDoc[index][0].hash)
        index++
      });
      fs.readFile(fileLocation+'ipfs.m3u8', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result = data.replace(/EXT-X-TARGETDURATION:10000/g, 'EXT-X-TARGETDURATION:'+totalDuration);
      
        fs.writeFile(fileLocation+'ipfs.m3u8', result, 'utf8', function (err) {
           if (err) return console.log(err);
        });
      });
      fs.appendFileSync(fileLocation+'ipfs.m3u8', '#EXT-X-ENDLIST');


      console.log('Finished encoding in '+fileLocation+'ipfs.m3u8')
      console.log('Serving the packages in IPFS')
    });
  });
});


