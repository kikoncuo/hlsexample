const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
 
function callback() { console.log("Video encoding finished") }

const fileLocation = process.argv[2] || "./input.mkv"

 
// Below is FFMPEG converting MP4 to HLS with reasonable options.
// https://www.ffmpeg.org/ffmpeg-formats.html#hls-2
ffmpeg(fileLocation, { timeout: 432000 }).addOptions([
    '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
    '-level 5.0', 
    '-s 4096x2304',          // 640px width, 360px height output video dimensions
    '-start_number 0',     // start the first .ts segment at index 0
    '-hls_time 10',        // 10 second segment duration
    '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
    '-f hls'               // HLS format
  ]).output('./videos/output.m3u8').on('end', callback).run()

