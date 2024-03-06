import { Builder, Browser, By, until, WebDriver } from 'selenium-webdriver';
import Chrome from 'selenium-webdriver/chrome';
import 'dotenv/config';
import { xslxData, IRow } from './src/excel';
import promptSync from 'prompt-sync';
import { goToLinks, savePerson } from './src/person';
import { Documents, savePCData, setDocType } from './src/pc';
import { readdirSync } from 'fs';
import {
  closePanels,
  createPersonCard,
  findPersonByCode,
  goToPersonList,
  openPCCard,
  openPersonCard,
} from './src/navigation';
const prompt = promptSync();

async function start() {
  const options = new Chrome.Options();
  let driver = await new Builder()
    .setChromeOptions(options.debuggerAddress('localhost:50364'))
    .forBrowser(Browser.CHROME)
    .build();
  try {
    //await goTo(driver, process.env.url);
    // view debugger address
    let ss = await driver.getCapabilities();
    console.log(ss);

    //await login(driver, process.env.login, process.env.pass);
    //await findPerson(driver);
    //await saveData(driver);

    //await findAndSaveData(driver);

    //let docs = new Documents(driver, 'C:\\chrome\\docs');
    //await docs.auto_process();

    //await personCard(driver, { navigate: true, create: false });
    await addDocuments(driver, {
      path: 'C:\\chrome\\docs',
      onePerson: false,
      navigate: true,
    });

    //await goToPersonList(driver);
    //await findPersonByCode(driver, '3621001899');
    //await openPersonCard(driver);
    //await openPCCard(driver, '210822010400003');
  } finally {
    //await driver.quit();
  }
}

async function personCard(
  driver: WebDriver,
  { navigate, create }: { navigate: boolean; create: boolean }
) {
  if (navigate) {
    let rows: IRow[] = (await xslxData('2022.xlsx')).rows as IRow[];
    var pc_num = '';
    while (true) {
      pc_num = prompt(`Input pc_num `);
      if (pc_num.trim() == 'n') {
        break;
      }
      // close panels except first
      await closePanels(driver);
      //
      await saveOrOpenPersonCard(driver, rows, pc_num, create);
    }
  } else {
    await findAndSaveData(driver);
  }
}

async function saveOrOpenPersonCard(
  driver: WebDriver,
  rows: IRow[],
  pc_num: string,
  create: boolean
) {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].pc_num == pc_num.trim()) {
      let row: IRow = rows[i] as IRow;
      // find person
      await findPersonByCode(driver, row.id_code.trim());
      // attemp to open if exists
      if (await openPersonCard(driver)) {
        console.log('Картка особи існує');
      } else {
        if (create) {
          console.log(
            `Внесення особистих даних особи ${row.first_name} ${row.last_name} - ${row.id_code} `
          );
          // create empty
          await createPersonCard(driver);
          // set data
          await savePerson(driver, row);
        } else {
          return false;
        }
      }
      //
      await goToLinks(driver);
      if (await openPCCard(driver, pc_num)) {
        console.log('ПК існує');
      } else {
        if (create) {
          console.log(
            `Внесення даних картки особи ${row.first_name} ${row.last_name} - ${row.pc_num} `
          );
          await savePCData(driver, row);
        }
      }
    }
  }
}

async function addDocuments(
  driver: WebDriver,
  {
    path,
    onePerson,
    navigate,
  }: { path: string; onePerson: boolean; navigate: boolean }
) {
  // for one person without navigation
  // pc card must be open
  if (onePerson && !navigate) {
    let docs = new Documents(driver, path);
    await docs.auto_process();
  }
  // for one person with navigation
  // person list must be open with selected id column
  if (onePerson && navigate) {
    await documentsForOnePerson(driver, path);
  }

  // for many person with navigation
  // person list must be open with selected id column
  if (!onePerson && navigate) {
    let dirs = [];
    try {
      dirs = readdirSync(path);
      console.log(dirs);
    } catch (error) {
      console.error(error);
    }
    for (let i = 0; i < dirs.length; i++) {
      // close panels except first
      await closePanels(driver);

      let dir = dirs[i];
      await documentsForOnePerson(driver, `${path}\\${dir}`);
      let cont = prompt(`Продовжувати? `);
      if (cont.trim() != 'y') {
        break;
      }
    }
    /* let cont = '';
    while (true) {
      documentsForOnePerson(driver, path);
      cont = prompt(`Continue? `);
      if (cont.trim() != 'y') {
        break;
      }
    } */
  }
}

async function documentsForOnePerson(driver: WebDriver, path: string) {
  // rows from xlx
  let rows: IRow[] = (await xslxData('2022.xlsx')).rows as IRow[];
  let docs = new Documents(driver, path);
  // get pc_num
  let pc_num = '';
  if (docs.get_num_pc()) {
    pc_num = docs.get_num_pc().toString();
  } else {
    pc_num = prompt(`Input pc_num `);
  }
  // get id_code
  let id_code = '';
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].pc_num == pc_num.trim()) {
      let row: IRow = rows[i] as IRow;
      id_code = row.id_code;
      //
      await saveOrOpenPersonCard(driver, rows, pc_num, true);
      break;
    }
  }
  // if id not found
  if (!id_code) {
    id_code = prompt(`Input id code: `);
    //
    // find person card
    await findPersonByCode(driver, id_code.trim());
    // open
    await openPersonCard(driver);
    // open person pc with some number
    await openPCCard(driver, pc_num.trim());
  }
  // add documents from path
  await docs.auto_process();
}

// go to some url
async function goTo(driver: WebDriver, url: string) {
  await driver.get(url);
}

// login
async function login(driver: WebDriver, name: string, pass: string) {
  // wait until loaded
  /* await driver.wait(
    until.elementIsVisible(
      driver.findElement(By.css('.auth-page__container input'))
    )
  ); */
  await driver.wait(
    until.elementLocated(By.css('.auth-page__container input'))
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

async function findAndSaveData(driver: WebDriver) {
  let rows: IRow[] = (await xslxData('2022.xlsx')).rows as IRow[];
  var pc_num = '';
  while (true) {
    pc_num = prompt(`Input pc_num `);
    if (pc_num.trim() == 'n') {
      break;
    }
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].pc_num == pc_num.trim()) {
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
  }
}

start();
