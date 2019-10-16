## Quick example

30s video link hosted on github:
https://raw.githubusercontent.com/kikoncuo/hlsexample/master/30SecVideo/httpGithub.m3u8

30s video link ipfs: 
(Same video hosted by a node in my laptop, probably not up)
https://raw.githubusercontent.com/kikoncuo/hlsexample/master/30SecVideoIPFS/ipfs.m3u8

## Scripts usage

```
npm install
```

### Create an HLS video from file
```
node createStreamFromInput ./input.mkv
```
This will create the stream in /videos folder

### Serve by http and create .m3u8 file
```
node createHTTPVideoFromTS ./videos http://127.0.0.1:8080/
```
A server in localhost 8080 serves the files, and the .m3u8 file is configured to work with the specified URL

### Serve by IPFS and create .m3u8 file
```
node createIPFSVideoFromTS ./videos http://127.0.0.1:8080/
```
Uploads the file to IPFS running on /ip4/127.0.0.1/tcp/5001 and creates a .m3u8 file that requests the files via their IPFS hash
