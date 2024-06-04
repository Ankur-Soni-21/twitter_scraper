const { Builder, By, until } = require('selenium-webdriver');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const chrome = require('selenium-webdriver/chrome');

dotenv.config();

const options = new chrome.Options();
options.addArguments('--headless');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('--disable-gpu');
options.addArguments('--window-size=1280x800');
options.addArguments(`--proxy-server=${process.env.PROXY}`);


const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function signIn(driver) {
    const signInElement = await driver.wait(until.elementLocated(By.css("a[href='/login'][role='link']")), 10000);
    await signInElement.click();

    const inputField = await driver.wait(until.elementLocated(By.css("input[name='text']")), 10000);
    const username = process.env.TWITTER_USERNAME;
    await inputField.sendKeys(username);

    const nextButton = await driver.wait(until.elementLocated(By.css("button[role='button'][style*='background-color: rgb(239, 243, 244)']")), 10000);
    await nextButton.click();

    const passwordInput = await driver.wait(until.elementLocated(By.css("input[name='password']")), 10000);
    const password = process.env.TWITTER_PASSWORD;
    await passwordInput.sendKeys(password);

    const loginButton = await driver.wait(until.elementLocated(By.css("button[role='button'][style*='background-color: rgb(239, 243, 244)']")), 10000);
    await loginButton.click();
}

async function getTags(driver) {
    try {
        const section = await driver.wait(until.elementLocated(By.css("div[aria-label='Timeline: Trending now']")), 10000);
        await driver.sleep(10000);

        const divs = await section.findElements(By.css("[style*='color: rgb(231, 233, 234)'][dir='ltr']"));
        let tagList = [];

        for (let div of divs) {
            const spans = await div.findElements(By.css("span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3"));
            for (let span of spans) {
                const text = await span.getText();
                if (text !== "What’s happening") {
                    tagList.push(text);
                }
            }
        }

        return tagList;
    } catch (error) {
        console.error("Error getting tags: ", error);
        return [];
    }
}

async function checkForRefreshButton(driver) {
    try {
        const refreshButton = await driver.findElement(By.css("button.css-175oi2r"));
        return refreshButton;
    } catch (error) {
        return null;
    }
}

async function handleLogin(driver) {
    const refreshButton = await checkForRefreshButton(driver);
    if (refreshButton) {
        await refreshButton.click();
        await signIn(driver);
    } else {
        await signIn(driver);
    }
}

async function insertData(tagList, ipAddress) {
    const db = client.db("twitter_data");
    const collection = db.collection("twitter_trends");
    const uniqueId = uuidv4();
    const endTime = new Date().toISOString();

    const dataToInsert = {
        unique_id: uniqueId,
        trend1: tagList[0] || null,
        trend2: tagList[1] || null,
        trend3: tagList[2] || null,
        trend4: tagList[3] || null,
        trend5: tagList[4] || null,
        end_time: endTime,
        ip_address: ipAddress.trim()
    };

    await collection.insertOne(dataToInsert);
}

async function getIp() {
    const proxy = {
        http: process.env.PROXY,
        https: process.env.PROXY
    };

    try {
        const response = await axios.get('http://ipinfo.io/ip', { proxy });
        // const response = await axios.get('http://ipinfo.io/ip');
        return response.data;
    } catch (error) {
        console.error("Error getting IP: ", error);
        return '';
    }
}

(async function main() {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        await driver.get('https://www.x.com');
        await driver.manage().window().maximize();

        await client.connect();

        const isLoggedIn = await driver.findElements(By.css("a[href='/logout'][role='link']"));
        if (isLoggedIn.length > 0) {
            const tagList = await getTags(driver);
            const ipAddress = await getIp();
            await insertData(tagList, ipAddress);
            console.log('Data:', tagList);
        } else {
            await handleLogin(driver);
            const tagList = await getTags(driver);
            const ipAddress = await getIp();
            await insertData(tagList, ipAddress);
            console.log('Data:', tagList);
        }
    } finally {
        await driver.quit();
        await client.close();
    }
})();
