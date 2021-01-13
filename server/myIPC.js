const {
    ADD_CHANNEL_YOUTUBE, RESULT_ADD_CHANNEL_YOUTUBE
} = require("../constant")

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const YoutubeROBOT = require("./youtube");
var YTBUpload = require("./YTBUploadVideo");
var CheckCopyright = require("./checkCopyright");
var CreateVideo = require("./createVideo");

module.exports = function (ipcMain, mainWindow, channel_window) {
    // console.log({mainWindow})
    ipcMain.on(ADD_CHANNEL_YOUTUBE, async (event, arg) => {
        try {
            // console.log({ arg })
            let newYou = new YoutubeROBOT(arg);
            await newYou.init();
            // check cookie
            let resultCheckCookie = await newYou.checkCookie();

            if (!resultCheckCookie.status) {
                event.reply(RESULT_ADD_CHANNEL_YOUTUBE, {
                    status: false, error: "cookie chết!"
                });
                return false;
            }

            let result = await newYou.getInfoChannelClone();
            // await newYou.updateInfoMyChannel();
            // return true;

            event.reply(RESULT_ADD_CHANNEL_YOUTUBE, {
                status: true, result: {
                    dataRequest: arg,
                    dataResponse: result
                }
            });
        } catch (error) {

            event.reply(RESULT_ADD_CHANNEL_YOUTUBE, {status: false, error});
            setTimeout(function () {

            }, 1000)
        }

    });

    ipcMain.on("RELOAD_LIST_CHANNEL", (event, arg) => {
        mainWindow.reload();
        mainWindow.webContents.send("RELOAD_LIST_CHANNEL", {});
    });

    ipcMain.on("TEST", async (event, arg) => {
        let mListRun = [];
        let amountItemRun = 2;
        let k = 0;
        for (let index = 0; index < arg.listVideos.length; index = index + amountItemRun) {
            mListRun[k] = [];
            for (let index2 = index; index2 < index + amountItemRun; index2++) {
                if (arg.listVideos[index2]) {
                    mListRun[k].push(arg.listVideos[index2])
                }
            }
            k++;
        }

        for (const iterator of mListRun) {
            await runDowloadVideo(iterator)
        }

        console.log("END TEST")
    });


    //
    ipcMain.on("RUN_DOWNLOAD_VIDEO_YOUTUBE", async (event, arg) => {
        console.log("RUN_DOWNLOAD_VIDEO_YOUTUBE", arg);
        try {
            let mListRun = [];
            let amountItemRun = 10;
            let k = 0;
            for (let index = 0; index < arg.listVideos.length; index = index + amountItemRun) {
                mListRun[k] = [];
                for (let index2 = index; index2 < index + amountItemRun; index2++) {
                    if (arg.listVideos[index2]) {
                        mListRun[k].push(arg.listVideos[index2])
                    }
                }
                k++;
            }
            console.log({mListRun});
            //
            let result = [];
            for (const iterator of mListRun) {
                let resultItem = await runDowloadVideo(iterator);
                // console.log({resultItem})
                result.push(resultItem)
            }
            event.reply("RESULT_DOWNLOAD_VIDEO_YOUTUBE", {status: true, result: result, channel_id: arg.channel_id});
            return false;
        } catch (error) {
            event.reply("RESULT_DOWNLOAD_VIDEO_YOUTUBE", {status: false, error: error.message});
            return false;
        }
    })


    // copy video
    ipcMain.on("RUN_COPY_VIDEO_CHANNEL", async function (event, arg) {
        console.log({arg});
        let itemYTBUpload = new YTBUpload({cookies: arg.channelInfo.cookie, videoInfo: arg.item});
        let resultUpload = await itemYTBUpload.upload();
        event.reply("RESULT_COPY_VIDEO_CHANNEL", {arg, resultUpload});
        return false;
    })

    //download v2
    ipcMain.on("RUN_DOWNLOAD_VIDEO_YOUTUBE_V2", async (event, arg) => {
        try {
            console.log("RUN_DOWNLOAD_VIDEO_YOUTUBE_V2", arg);
            let newYou = new YoutubeROBOT({});
            let result = await newYou.dowloadVideo(arg.videoCode);
            result.video_id = arg.id;
            event.reply("RESULT_DOWNLOAD_VIDEO_YOUTUBE_V2", result);
        } catch (e) {
            event.reply("RESULT_DOWNLOAD_VIDEO_YOUTUBE_V2", {status: false, error: e.message});
        }
    })

    //check copyright
    ipcMain.on("RUN_CHECK_COPYRIGHT", async function (event, arg) {
        let itemCheck = new CheckCopyright({cookie: arg.cookie});
        let resultCheck = await itemCheck.upload();
        event.reply("RESULT_CHECK_COPYRIGHT", {resultCheck});
        return false;
    })

    //create Video
    ipcMain.on("RUN_CREATE_VIDEO", async function (event, arg) {
        let create = new CreateVideo({listAudio: arg.list});
        let result = await create.createVideo();
        event.reply("RESULT_CREATE_VIDEO", {result});
        return false;
    })
};


async function runDowloadVideo(listVideo) {
    let mList = [];
    let newYou = new YoutubeROBOT({});
    for (let index = 0; index < listVideo.length; index++) {
        let item = new Promise((resolve, reject) => {
            newYou.dowloadVideo(listVideo[index]).then(data => {
                resolve(data);
            });
        });
        mList.push(item)
    }
    return new Promise((resolve) => {
        Promise.all(mList).then(values => {
            console.log({values});
            resolve({status: true, values});
        }).catch(reason => {
            resolve({status: false, reason})
        });
    })

}
