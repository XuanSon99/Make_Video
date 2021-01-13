var videoshow = require('videoshow')
const { getAudioDurationInSeconds } = require('get-audio-duration');
class createVideo {
    constructor(dataRequest) {
        this.dataRequest = dataRequest;
        this.dataResult = [];
    }

    async createVideo() {
        let result = []
        for (let i = 0; i < this.dataRequest.listAudio.length; i++) {
            let path = this.dataRequest.listAudio[i].path;
            let name = this.dataRequest.listAudio[i].name.slice(0, this.dataRequest.listAudio[i].name.length - 4)
            let re = await this.creationProcess(name, path);
            result.push(re)
        }
        return result
    }

    async creationProcess(name, path) {
        let duration = await getAudioDurationInSeconds(path);
        var images = [
            './images/step-1.png',
            './images/step-2.png',
            './images/step-3.png',
            './images/step-4.png',
        ];
        var videoOptions = {
            fps: 25,
            loop: duration / 4, // seconds
            transition: true,
            transitionDuration: 1, // seconds
            videoBitrate: 1024,
            videoCodec: 'libx264',
            size: '640x?',
            audioBitrate: '128k',
            audioChannels: 2,
            format: 'mp4',
            pixelFormat: 'yuv420p'
        }
        return new Promise((resolve)=>{
            videoshow(images, videoOptions)
            .audio(path)
            .save("./video/" + name + '.mp4')
            .on('start', function (command) {
            })
            .on('error', function (err, stdout, stderr) {
                resolve (err)
            })
            .on('end', function (output) {
                resolve({
                    "id": new Date().toISOString(),
                    "videoName": name,
                    "videoCode": name + '.mp4',
                    "channel_id": 'this-is-id',
                    "id_upload": false,
                    "is_download": true,
                    "created_at": new Date().toISOString()
                });
            })
        })
    }

}
module.exports = createVideo;