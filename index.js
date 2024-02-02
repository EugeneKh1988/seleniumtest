const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');

async function start() {
    const options = new Chrome.Options();
  let driver = await new Builder()
    .setChromeOptions(options.debuggerAddress("localhost:63814"))
    .forBrowser(Browser.CHROME)
    .build();
  try {
    await driver.get('https://www.google.com/ncr');
    let ss = await driver.getCapabilities();
    console.log(ss);
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
    //await driver.quit();
  }
}

start();