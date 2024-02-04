import { Builder, Browser, By, until, WebDriver } from 'selenium-webdriver';
import Chrome from 'selenium-webdriver/chrome';
import 'dotenv/config';
import { xslxData, IRow } from './src/excel';
import promptSync from 'prompt-sync';
import { savePerson } from './src/person';
import { savePCData } from './src/pc';
const prompt = promptSync();

async function start() {
  const options = new Chrome.Options();
  let driver = await new Builder()
    .setChromeOptions(options.debuggerAddress('localhost:53329'))
    .forBrowser(Browser.CHROME)
    .build();
  try {
    //await goTo(driver, process.env.url);
    // view debugger address
    let ss = await driver.getCapabilities();
    console.log(ss);

    //await login(driver, process.env.login, process.env.pass);
    //await findPerson(driver);
    await saveData(driver);

    //console.log(inputs);
    //await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
    //await driver.quit();
  }
}

// go to some url
async function goTo(driver: WebDriver, url: string) {
  await driver.get(url);
}

// login
async function login(driver: WebDriver, name: string, pass: string) {
  // wait until loaded
  await driver.wait(
    until.elementIsVisible(
      driver.findElement(By.css('.auth-page__container input'))
    )
  );
  let inputs = await driver.findElements(By.css('.auth-page__container input')); //.sendKeys('login');
  for (let input of inputs) {
    if ((await input.getAttribute('type')) == 'text') {
      await input.clear();
      await input.sendKeys(name);
    }
    if ((await input.getAttribute('type')) == 'password') {
      await input.clear();
      await input.sendKeys(pass);
    }
  }
  let enter = await driver.findElement(
    By.css('.auth-page__container button.el-button--primary')
  );
  await enter.click();
}

async function findPerson(driver: WebDriver) {
  await driver.wait(
    until.elementIsVisible(driver.findElement(By.css('.ub-sidebar')))
  );
  let dict = await driver.findElement(
    By.css('.ub-sidebar ul.ub-sidebar__main-menu li.el-submenu')
  );
  await dict.click();
  let personList = await dict.findElement(By.css('ul li.el-menu-item'));
  await personList.click();

  // filter
  let buttons = await driver.findElements(
    By.css('.u-table-entity__head button.u-button')
  );
  for (let button of buttons) {
    if ((await button.getAttribute('title')) == 'Фільтри') {
      await button.click();
    }
  }

  let filterColumn = await driver.findElement(
    By.css(
      '.filter-selector .u-fake-table__body .u-fake-table__body .u-fake-table__tr .el-input'
    )
  );
  await filterColumn.click();
}

async function saveData(driver: WebDriver) {
  let rows: IRow[] = (await xslxData('data.xlsx')).rows as IRow[];
  for (let i = 0; i < rows.length; i++) {
    let row: IRow = rows[i] as IRow;
    let resPerson: string = prompt(
      `Внести особисті дані особи ${row.first_name} ${row.last_name} - ${row.id_code} `
    );
    if (resPerson.trim() == 'y') {
      await savePerson(driver, row);
      console.log('Complete person');
    }
    let resPC: string = prompt(
      `Внести дані картки особи ${row.first_name} ${row.last_name} - ${row.pc_num} `
    );
    if (resPC.trim() == 'y') {
      await savePCData(driver, row);
      console.log('Complete pc');
    }
  }
}

start();

export const one = 1;
