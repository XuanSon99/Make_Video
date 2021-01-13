const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

function getChromiumExecPath() {
    return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}

class YTBUploadVideo {
    constructor(dataRequest) {//{cookie,videoInfo}
        this.dataRequest = dataRequest;
    }

    async upload() {
        this.browser = await puppeteer.launch({headless: false, executablePath: getChromiumExecPath(),});
        try {
            this.page = await this.browser.newPage();
            let VideoName = this.dataRequest.videoInfo.videoName;

            VideoName = VideoName.substr(0, 99);
            await this.page.setCookie(...this.dataRequest.cookies);
            await this.page.goto('https://studio.youtube.com/');
            await this.page.waitForSelector('#create-icon');
            await this.page.evaluate(async () => {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                document.querySelector("#create-icon").click();
                await sleep(1000)
                document.querySelector("#text-item-0").click();
                // document.querySelector("#upload-button").click();
            });
            await this.page.waitForTimeout(3000);
            const elementHandle = await this.page.$("input[name=Filedata]");
            await elementHandle.uploadFile('./video/' + this.dataRequest.videoInfo.videoCode);
            await this.page.waitForTimeout(5000);
            await this.page.evaluate(async () => {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                while (!document.querySelector('#next-button')) {
                    await sleep(1000);
                }
                return true;
            });
            await this.page.waitForTimeout(3000);
            await this.page.waitForSelector("#textbox");
            let inputEmail = await this.page.$('#textbox');
            await inputEmail.click({clickCount: 3});
            await this.page.waitForTimeout(1000);
            // let Email = faker.internet.email();
            await inputEmail.type(VideoName);
            let checkUploadSuccess = await this.page.evaluate(async (VideoName) => {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                await sleep(1000);
                document.querySelector('[name="NOT_MADE_FOR_KIDS"]').click();
                while (document.querySelector("#dialog > div > ytcp-animatable.button-area.metadata-fade-in-section.style-scope.ytcp-uploads-dialog > div > " +
                        "div.left-button-area.style-scope.ytcp-uploads-dialog > ytcp-video-upload-progress > span").innerText != "Đã xử lý xong" &&
                        document.querySelector("#dialog > div > ytcp-animatable.button-area.metadata-fade-in-section.style-scope.ytcp-uploads-dialog > div > " +
                        "div.left-button-area.style-scope.ytcp-uploads-dialog > ytcp-video-upload-progress > span").innerText != "Finished processing"
                    ) {
                    await sleep(1000)
                }
                await sleep(1000);
                document.querySelector('#next-button').click();
                await sleep(1000);
                document.querySelector('#next-button').click();
                await sleep(1000);
                document.querySelector('[name="PUBLIC"]').click();
                await sleep(1000);
                document.querySelector('#done-button').click()
                return true;
            }, VideoName);
            if (!checkUploadSuccess) {
                await this.browser.close();
                return {status: true}
            }
            await this.page.waitForSelector("#dialog-title");
            await this.page.waitForTimeout(5000);
            await this.browser.close();
            return {status: true}
        } catch (e) {
            await this.browser.close();
            console.log(e);
            return {status: false}
        }

    }

}

module.exports = YTBUploadVideo;