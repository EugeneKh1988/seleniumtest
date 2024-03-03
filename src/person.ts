import { By, WebDriver, until } from 'selenium-webdriver';
import { IRow } from './excel';
import { formatDate } from './utilities';

async function saveCommonData(driver: WebDriver, data: IRow) {
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
    /* await driver.wait(
      until.elementIsVisible(driver.findElement(By.css('#el-popover-5642'))),
      15000
    ); */
    await driver.manage().setTimeouts({ implicit: 10000 });
    let sex_opts = await driver.findElements(
      By.css('.el-popover div.ub-select__option')
    );
    console.log(sex_opts);

    if (sex_opts.length > 1) {
      if (data.sex == 'Жінка') {
        await sex_opts[1].click();
      }
      if (data.sex == 'Чоловік') {
        await sex_opts[0].click();
      }
    }
  }
}

async function saveAddressData(driver: WebDriver, data: IRow) {
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
}

async function saveContactData(driver: WebDriver, data: IRow) {
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
}

async function saveDocumentData(driver: WebDriver, data: IRow) {
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

    /* await driver.wait(
      until.elementIsVisible(
        driver.findElement(By.css('div[id^=el-popover-]'))
      ),
      15000
    ); */
    await driver.manage().setTimeouts({ implicit: 10000 });
    let dropdowns = await driver.findElements(
      By.css("div.el-popover[aria-hidden='false']")
    );
    console.log('Drop', dropdowns.length);

    if (dropdowns && dropdowns.length > 0) {
      let last_dropdown = dropdowns[dropdowns.length - 1];
      let options = await last_dropdown.findElements(
        By.css('div.ub-select__option')
      );
      console.log(options.length);
      if (options.length > 2) {
        if (data.paper_id_doc) {
          await options[0].click();
        }
        if (data.plastic_id_doc) {
          await options[1].click();
        }
      }
    }
  }
}

async function savePersonCard(driver: WebDriver) {
  let panels = await driver.findElements(
    By.css('.x-panel-body .x-tabpanel-child')
  );
  if (panels.length > 0) {
    let last_panel = panels[panels.length - 1];
    let buttons = await last_panel.findElements(
      By.css('.u-form-layout .u-toolbar button')
    );
    console.log('tool ', buttons.length);

    if (buttons.length > 3) {
      //await driver.manage().setTimeouts({ implicit: 10000 });
      await buttons[1].click();
    }
  }
}

export async function goToLinks(driver: WebDriver) {
  //pc links
  let pc_links = await driver.findElement(By.css('.el-tabs__nav #tab-20'));
  await pc_links.click();
}

export async function savePerson(driver: WebDriver, data: IRow) {
  await saveCommonData(driver, data);
  await saveAddressData(driver, data);
  await saveContactData(driver, data);
  await saveDocumentData(driver, data);
  await savePersonCard(driver);
}
