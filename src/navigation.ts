import { By, WebDriver, until } from 'selenium-webdriver';
import { setTimeout } from 'timers/promises';

export async function goToPersonList(driver: WebDriver) {
  await driver.wait(until.elementLocated(By.css('.ub-sidebar')));
  let dict = await driver.findElement(
    By.css('.ub-sidebar ul.ub-sidebar__main-menu li.el-submenu')
  );
  let dict_opened = null;
  try {
    dict_opened = await driver.findElement(
      By.css('.ub-sidebar ul.ub-sidebar__main-menu li.el-submenu.is-opened')
    );
  } catch {
    console.log('Is not opened');
  }
  if (!dict_opened) {
    await dict.click();
  }
  await driver.wait(
    until.elementIsVisible(await dict.findElement(By.css('ul li.el-menu-item')))
  );
  let personList = await dict.findElement(By.css('ul li.el-menu-item'));
  await personList.click();
}

// filter person by id code
export async function findPersonByCode(driver: WebDriver, idCode: string) {
  // filter
  let buttons = await driver.findElements(
    By.css('.u-table-entity__head button.u-button')
  );
  for (let button of buttons) {
    if ((await button.getAttribute('title')) == 'Фільтри') {
      await button.click();
    }
  }

  /* await driver.wait(
    until.elementIsVisible(
      await driver.findElement(By.css('.u-fake-table__body .u-fake-table__tr'))
    )
  ); */
  await driver.manage().setTimeouts({ implicit: 20000 });
  /* await driver.wait(
    until.elementLocated(By.css('.filter-selector .u-fake-table__body'))
  ); */
  let fields = await driver.findElements(
    By.css('.filter-selector .u-fake-table__tr input')
  );
  //console.log(fields.length);
  if (fields.length > 0) {
    let code_field = fields[fields.length - 1];
    await code_field.clear();
    await code_field.sendKeys(idCode);
    let buttons = await driver.findElements(
      By.css('.filter-selector .filter-selector__header button')
    );
    //console.log(buttons.length);
    if (buttons.length > 0) {
      let search_button = buttons[0];
      await search_button.click();
    }
  }
  //await filterColumn.click();
}

// open first person card from filtered list
export async function openPersonCard(driver: WebDriver) {
  await setTimeout(5000); // 5000
  let panels = await driver.findElements(
    By.css('.x-panel-body .x-tabpanel-child')
  );
  if (panels.length > 0) {
    let first_panel = panels[0];

    let rows = await first_panel.findElements(
      By.css('.u-table-entity__body__content tr')
    );
    //console.log(rows.length);
    // open card
    if (rows.length >= 2) {
      let card_row = rows[1];
      let selected_column = null;
      let columns = [];
      try {
        selected_column = await card_row.findElement(By.css('td.selected'));
      } catch {
        columns = await card_row.findElements(By.css('td'));
      }
      if (selected_column) {
        //await selected_column.click();
        let col_cont = await selected_column.findElement(
          By.css('.u-table__cell-container')
        );
        await col_cont.click();
        await col_cont.click();
        console.log('clicked');

        // const actions = driver.actions({ async: true });
        // await actions.move({ origin: selected_column }).click().perform();
      } else if (columns.length > 2) {
        let column = columns[1].findElement(By.css('.u-table__cell-container'));
        await column.click();
        await column.click();
        console.log('dbl clicked');
      }
      return true;
    }
    // person card is not exist
    if (rows.length == 1) {
      return false;
    }
  }
  return true;
}

export async function openPCCard(driver: WebDriver, pc_num: string) {
  //pc links
  await driver.wait(until.elementLocated(By.css('.el-tabs__nav #tab-20')));
  let pc_links = await driver.findElement(By.css('.el-tabs__nav #tab-20'));
  await pc_links.click();
  let panels = await driver.findElements(
    By.css('.x-panel-body .x-tabpanel-child')
  );
  if (panels.length > 0) {
    let last_panel = panels[panels.length - 1];
    //
    await driver.wait(
      until.elementIsNotVisible(
        await last_panel.findElement(
          By.css('.u-form-row__content .el-loading-mask')
        )
      )
    );
    let rows = await last_panel.findElements(
      By.css('.u-table-entity__body table tr')
    );
    console.log('cards ', rows.length);
    for (let i = 1; i < rows.length; i++) {
      let row = rows[i];
      let columns = await row.findElements(By.css('td'));
      //console.log('td ', columns.length);
      if (columns.length > 2) {
        let pc_col = await columns[1].getText();
        //console.log('text ', pc_col);
        if (pc_col === pc_num) {
          await columns[0].findElement(By.css('button')).click();
          return true;
        }
      }
    }
  }
  return false;
}

export async function createPersonCard(driver: WebDriver) {
  //
  await driver.wait(
    until.elementIsNotVisible(
      await driver.findElement(By.css('.u-table-entity .el-loading-mask'))
    )
  );
  // create
  let buttons = await driver.findElements(
    By.css('.u-table-entity__head button.u-button')
  );
  for (let button of buttons) {
    if ((await button.getAttribute('title')) == 'Додати (Ctrl + Ins)') {
      await button.click();
    }
  }
  //
  await driver.wait(
    until.elementLocated(
      By.css("div.el-dialog[aria-label='Створення документа']")
    )
  );
  let add_but = await driver.findElement(
    By.css('.dfx-document__document-creation-form__buttons button')
  );
  await add_but.click();
}

export async function closePanels(driver: WebDriver) {
  let buttons = await driver.findElements(
    By.css('.u-navbar .u-navbar__tab-container .u-navbar__tab-close-button')
  );
  for (let i = 1; i < buttons.length; i++) {
    let button = buttons[i];
    await button.click();
  }
}
