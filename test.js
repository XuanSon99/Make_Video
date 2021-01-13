// var axios = require("axios");
// const fs = require('fs');
// const cheerio = require("cheerio");
// axios.get("https://www.youtube.com/watch?v=bHl854oRjAA").then(htmlInfoVideo => {
//     // console.log(htmlInfoVideo.data)
//     let $ = cheerio.load(htmlInfoVideo.data);
//     console.log($('meta[name="title"]').attr("content"))
// })
//
//

const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
var cookies = require("./cookieTest")
// puppeteer usage as normal
puppeteer.launch({headless: false}).then(async browser => {
    console.log('Running tests..');
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto('https://studio.youtube.com/channel/UC_nDbBMYaEYSB-zHQPAgwtg/videos/upload?d=ud&filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D');
    await page.waitForSelector("input[name=Filedata]");
    // await  page.waitForTimeout(2000)
    // await  page.evaluate(()=>{
    //     document.querySelector("#upload-button").click();
    // });
    // await  page.waitForTimeout(3000);

    const elementHandle = await page.$("input[name=Filedata]");
    await elementHandle.uploadFile('./video/w-uQWL2k_Ac.mp4');
    await  page.waitForTimeout(5000);
    await page.evaluate(async () => {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        while (!document.querySelector('#next-button')) {
            await sleep(1000);
        }
        return true;

    });

    await page.waitForTimeout(3000);
    await page.evaluate(async () => {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        document.querySelector('[name="NOT_MADE_FOR_KIDS"]').click();
        await sleep(1000);
        document.querySelector('#next-button').click();
        await sleep(1000);
        document.querySelector('#next-button').click();
        await sleep(1000);
        document.querySelector('[name="PRIVATE"]').click();
        await sleep(1000);
        document.querySelector('#done-button').click()
    });
    await page.waitForTimeout(5000);
    await browser.close();
    console.log(`All done, check the screenshot. ✨`)
});


