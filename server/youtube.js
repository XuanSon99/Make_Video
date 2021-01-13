const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const options = {width: 1000, height: 600};
const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl');
const cheerio = require("cheerio");
var axios = require("axios");

function getChromiumExecPath() {
    return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}

class Youtube {
    constructor({cookie, link}) {
        this.cookie = cookie;
        this.channel_link = link;
        this.dataResult = {};
    }

    async init() {
        this.browser = await puppeteer.launch(
            {
                headless: false,
                args: [`--window-size=${options.width},${options.height}`],
                executablePath: getChromiumExecPath()
            }
        );
        this.page = (await this.browser.pages())[0];
        await this.page.setViewport(options);
        if (this.cookie) {
            await this.page.setCookie(...this.cookie);
        }

        await this.page.setRequestInterception(true);
        this.page.on('request', (req) => {
            if (req.resourceType() === 'image') {
                req.abort();
            } else {
                req.continue();
            }
        });
    }

    async checkCookie() {
        try {
            await this.page.goto("https://www.youtube.com");
            await this.page.waitForSelector("#avatar-btn", {timeout: 3000})
            return {status: true};
        } catch (error) {
            console.log({error})
            await this.browser.close();
            return {status: false};
        }
    }

    async getInfoChannelClone() {
        await this.page.goto(this.channel_link + "/videos");
        let dataInitChannel = await this.page.evaluate(() => {
            return window["ytInitialData"]
        });
        delete dataInitChannel.metadata.channelMetadataRenderer.availableCountryCodes;
        this.dataResult.info_clone = {
            metadata: dataInitChannel.metadata.channelMetadataRenderer,
            header: dataInitChannel.header.c4TabbedHeaderRenderer.banner
        };
        let mListVideo = await this.autoScroll(this.page);
        console.log({mListVideo}, mListVideo.length)
        this.dataResult.info_clone.videos = mListVideo;
        await this.browser.close();
        return this.dataResult;
        // for (let item of mListVideo) {
        //     await this.dowloadVideo("https://www.youtube.com" + item)
        // }
        // this.dataResult.banner = await this.page.evaluate(() => {
        //     return document.querySelector("ytd-c4-tabbed-header-renderer").style['cssText'].replace(")", "").replace(";", "").replace("--yt-channel-banner:url(", "");
        // })
    }

    async updateInfoMyChannel() {
        //click cài đặt
    }

    async getInfoMyChannel() {
        await this.page.goto("https://studio.youtube.com/");
    }

    async getInfoVideo(url) {
        let htmlInfoVideo = await axios.get(url);
        let $ = cheerio.load(htmlInfoVideo.data);
        let nameVideo = $('meta[name="title"]').attr("content")
        return nameVideo + " new";
        // await this.page.goto(url);
        // let info = await this.page.evaluate(() => {
        //     return document.querySelector("#scriptTag").innerText
        // });
        // info = JSON.parse(info);
        // return info;
    }

    async autoScroll(page) {
        return await page.evaluate(async () => {
            let countVideo = document.querySelectorAll("#thumbnail").length;
            var totalHeight = 0;
            var distance = 3000;

            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            async function myScroll() {
                // var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                await sleep(3000)
                let nowCountVideo = document.querySelectorAll("#thumbnail").length;
                if (countVideo < 150) {
                    countVideo = nowCountVideo;
                    return true;
                    // return await myScroll();
                } else {
                    return true;
                }
            }

            await myScroll();
            let mListVideo = [];
            // for (let i = 0; i < document.querySelectorAll("#thumbnail").length; i++) {
            for (let i = 0; i < 100; i++) {
                if (document.querySelectorAll("#thumbnail")[i] && document.querySelectorAll("#thumbnail")[i].getAttribute("href")) {
                    mListVideo.push({
                        link: document.querySelectorAll("#thumbnail")[i].getAttribute("href"),
                        name: document.querySelectorAll("#video-title")[i].getAttribute("title"),
                    })
                }

            }
            return mListVideo;
        });
    }

    async dowloadVideo(linkVideo) {
        return new Promise(async (resolve) => {
            // await this.init();
            let linkDowload = 'https://www.youtube.com' + linkVideo;
            let infoVideo = await this.getInfoVideo(linkDowload);
            // console.length({ infoVideo })
            let output = new URL(linkDowload).searchParams.get("v") + '.mp4';
            let downloaded = 0;
            if (fs.existsSync("video/" + output)) {
                // downloaded = fs.statSync(output).size;
                resolve({status: true, videoName: infoVideo, videoCode: output});
                return true;
            }
            const video = youtubedl(linkDowload,
                // Optional arguments passed to youtube-dl.
                ['--format=22'],
                // ['--format=137'],
                // start will be sent as a range header
                {start: downloaded, cwd: __dirname});
            let tagVideo = [];
            // Will be called when the download starts.
            video.on('info', function (info) {
                console.log('Download - started' + linkDowload);
                tagVideo = info.tags;
                // console.log(JSON.stringify(info.tags));
                // info.size will be the amount to download, add
                let total = info.size + downloaded;
                // console.log('size: ' + total);
                // if (downloaded > 0) {
                //     // size will be the amount already downloaded
                //     console.log('resuming from: ' + downloaded);
                //     // display the remaining bytes to download
                //     console.log('remaining bytes: ' + info.size)
                // }
            });
            if (downloaded > 0) {
                resolve({status: true})
            }

            video.pipe(fs.createWriteStream("video/" + output, {flags: 'a'}))
            video.on('complete', function complete(info) {
                'use strict';
                console.log('complete - filename: ' + info._filename + ' already downloaded.')
            });

            video.on('end', function () {
                resolve({status: true, tagVideo, linkVideo, videoName: infoVideo, videoCode: output})
            })
            video.on("error",function (error) {
                resolve({status: false, error})
            })
        })
        //     .then((state) => {
        //     // console.log("then",state)
        //     return state;
        // }).catch((error) => {
        //     console.log("catch", error);
        //     return {status: false}
        // });

        return true;
    }


}


module.exports = Youtube;
// let cookieTest = require("../cookieTest.json");
// let ouroir = new Youtube({ cookie: cookieTest, channel_link: "https://www.youtube.com/channel/UCUDKOh9so7OQg73R69_mDyA" });
// ouroir.init().then(async () => {
//     let a = await ouroir.getInfoChannelClone();
//     console.log(ouroir.dataResult);
// })