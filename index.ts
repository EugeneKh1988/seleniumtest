import { Builder, Browser, By, until, WebDriver } from 'selenium-webdriver';
import Chrome from 'selenium-webdriver/chrome';
import 'dotenv/config';
import { xslxData, IRow } from './src/excel';
import promptSync from 'prompt-sync';
const prompt = promptSync();

async function start() {
  const options = new Chrome.Options();
  let driver = await new Builder()
    .setChromeOptions(options.debuggerAddress('localhost:58393'))
    .forBrowser(Browser.CHROME)
    .build();
  try {
    //await goTo(driver, process.env.url);
    // view debugger address
    let ss = await driver.getCapabilities();
    console.log(ss);

    //await login(driver, process.env.login, process.env.pass);
    //await findPerson(driver);
    saveData(driver);

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

function formatDate(date: Date): string {
  if (!date) {
    return '';
  }
  let day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
  let month =
    date.getMonth() + 1 < 10
      ? `0${date.getMonth() + 1}`
      : `${date.getMonth() + 1}`;
  let year = `${date.getFullYear()}`;
  return `${day}.${month}.${year}`;
}

async function savePersonData(driver: WebDriver, data: IRow) {
  // common
  let common = await driver.findElement(By.css('.el-tabs__nav #tab-5'));
  await common.click();
  // common data
  let inputs = await driver.findElements(
    By.css('.el-tabs__content #pane-5 .frm-row label input')
  );
  if (inputs.length == 7) {
    await inputs[0].clear();
    await inputs[0].sendKeys(data.id_code);
    await inputs[3].clear();
    await inputs[3].sendKeys(formatDate(data.birthdate));
    await inputs[4].clear();
    await inputs[4].sendKeys(data.first_name);
    await inputs[5].clear();
    await inputs[5].sendKeys(data.last_name);
    await inputs[6].clear();
    await inputs[6].sendKeys(data.father_name);

    // set sex orientation
    await inputs[1].clear();
    await inputs[1].sendKeys('m');
    // wait until loaded
    await driver.wait(
      until.elementIsVisible(driver.findElement(By.css('#el-popover-2010')))
    );
    let sex_opts = await driver.findElements(
      By.css('#el-popover-2010 div.ub-select__option')
    );
    if (sex_opts.length > 1) {
      if (data.sex == 'Жінка') {
        await sex_opts[1].click();
      }
      if (data.sex == 'Чоловік') {
        await sex_opts[0].click();
      }
    }
  }

  // address
  let address = await driver.findElement(By.css('.el-tabs__nav #tab-6'));
  await address.click();
  let addr_inputs = await driver.findElements(
    By.css('.el-tabs__content #pane-6 .frm-row label input')
  );
  if (addr_inputs.length == 3) {
    await addr_inputs[0].clear();
    data.post ? await addr_inputs[0].sendKeys(data.post) : null;
    let add_arr = data.address.split(',');
    add_arr && add_arr.length > 1 ? add_arr.shift() : null;
    await addr_inputs[1].clear();
    await addr_inputs[1].sendKeys(add_arr.join(',').trim());
    await addr_inputs[2].clear();
    await addr_inputs[2].sendKeys(data.street.trim());
  }

  //contacts
  let contacts = await driver.findElement(By.css('.el-tabs__nav #tab-7'));
  await contacts.click();
  let cont_inputs = await driver.findElements(
    By.css('.el-tabs__content #pane-7 .frm-row label input')
  );
  if (cont_inputs.length == 2) {
    await cont_inputs[0].clear();
    data.email ? await cont_inputs[0].sendKeys(data.email) : null;
    await cont_inputs[1].clear();
    data.phone ? await cont_inputs[1].sendKeys(data.phone) : null;
  }

  // document
  let document = await driver.findElement(By.css('.el-tabs__nav #tab-8'));
  await document.click();
  let doc_inputs = await driver.findElements(
    By.css('.el-tabs__content #pane-8 .frm-row label input')
  );
  if (doc_inputs.length > 7) {
    await doc_inputs[3].clear();
    data.paper_id_doc
      ? await doc_inputs[3].sendKeys(data.paper_id_doc.split(' ').at(0))
      : null;
    await doc_inputs[4].clear();
    data.paper_id_doc
      ? await doc_inputs[4].sendKeys(data.paper_id_doc.split(' ').at(1))
      : null;
    data.plastic_id_doc
      ? await doc_inputs[4].sendKeys(data.plastic_id_doc)
      : null;
    await doc_inputs[5].clear();
    data.id_date
      ? await doc_inputs[5].sendKeys(formatDate(data.id_date))
      : null;
    await doc_inputs[6].clear();
    data.id_org_receive
      ? await doc_inputs[6].sendKeys(data.id_org_receive)
      : null;
    await doc_inputs[7].clear();
    data.id_valid_date
      ? await doc_inputs[7].sendKeys(formatDate(data.id_valid_date))
      : null;
    await document.click();
    // load doc type
    await doc_inputs[1].clear();
    await doc_inputs[1].sendKeys('паспорт');

    await driver.wait(
      until.elementIsVisible(driver.findElement(By.css('#el-popover-1467')))
    );
    let options = await driver.findElements(
      By.css('#el-popover-1467 div.ub-select__option')
    );
    if (options.length > 2) {
      if (data.paper_id_doc) {
        await options[0].click();
      }
      if (data.plastic_id_doc) {
        await options[1].click();
      }
    }
  }

  //pc links
  let pc_links = await driver.findElement(By.css('.el-tabs__nav #tab-20'));
  await pc_links.click();
  console.log(doc_inputs.length);
}

async function saveData(driver: WebDriver) {
  let data: object[] = undefined;
  xslxData('data.xlsx').then((rows) => {
    if (rows && rows.rows && Array.isArray(rows.rows)) {
      rows.rows.forEach(async (row: IRow) => {
        let response: string = prompt(
          `Зберегти дані ${row.first_name} ${row.last_name} `
        );
        if (response) {
          await savePersonData(driver, row);
        }
      });
    }
  });
}

start();

export const one = 1;
