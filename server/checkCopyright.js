const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


let overview = []
function getChromiumExecPath() {
    return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}

class checkCopyright {
    constructor(dataRequest) {
        this.dataRequest = dataRequest;
    }

    async upload() {
        this.browser = await puppeteer.launch({ headless: false, executablePath: getChromiumExecPath(), });
        try {
            this.page = await this.browser.newPage();
            await this.page.setCookie(...this.dataRequest.cookie);
            await this.page.goto('https://studio.youtube.com/');


            await this.page.waitForSelector('#menu-item-1');
            await this.page.evaluate(async () => {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                document.querySelector("#menu-item-1").click();
                await sleep(2000)
            });

            await this.page.waitForTimeout(2000);

            overview = await this.page.evaluate(async () => {
                let a = document.querySelectorAll("#row-container.ytcp-video-row")
                let overview = [];
                let footer = document.querySelector(".page-description.style-scope.ytcp-table-footer").innerText
                let total = Number(footer.slice(footer.length - 3, footer.length));
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                for (let i = 0; i < a.length; i++) {
                    if (a[i].querySelectorAll('[role="cell"]').length > 2) {
                        overview.push({
                            "name": a[i].querySelector("#video-title").innerText,
                            "status": a[i].querySelector(".restrictions-list").innerText
                        })
                    }
                }
                for (let j = 0; j < (Math.floor(total / 30)); j++) {
                    document.querySelector("#navigate-after").click();
                    await sleep(3000)
                    a = document.querySelectorAll("#row-container.ytcp-video-row")
                    for (let i = 0; i < a.length; i++) {
                        if (a[i].querySelectorAll('[role="cell"]').length > 2) {
                            overview.push({
                                "name": a[i].querySelector("#video-title").innerText,
                                "status": a[i].querySelector(".restrictions-list").innerText
                            })
                        }
                    }
                    
                }
                return overview;
            });

            await this.page.waitForTimeout(2000);
            await this.browser.close();
            return overview;
        } catch (e) {
            await this.browser.close();
            return { status: false }
        }

    }

}

module.exports = checkCopyright;