import { By, Key, WebDriver, until } from 'selenium-webdriver';
import { IRow } from './excel';
import { formatDate, saveCard } from './utilities';
import { readdirSync, unlinkSync } from 'fs';
import promptSync from 'prompt-sync';
const prompt = promptSync();
import { setTimeout } from 'timers/promises';

async function createPC(driver: WebDriver) {
  let panels = await driver.findElements(
    By.css('.x-panel-body .x-tabpanel-child')
  );
  if (panels.length > 0) {
    let last_panel = panels[panels.length - 1];
    let buttons = await last_panel.findElements(
      By.css('.u-form-layout .u-toolbar button')
    );
    console.log('tool ', buttons.length);

    if (buttons.length > 5) {
      //await driver.manage().setTimeouts({ implicit: 10000 });
      await buttons[4].click();
      await driver.wait(
        until.elementLocated(By.css('.u-modal .u-modal__footer button'))
      );
      let buttons_modal = await driver.findElements(
        By.css('.u-modal .u-modal__footer button')
      );
      if (buttons_modal.length > 2) {
        await buttons_modal[2].click();
      }
    }
  }
}

async function inputPCData(driver: WebDriver, data: IRow) {
  // wait
  await driver.wait(until.elementLocated(By.css('.el-tabs__nav #tab-2')));
  // wait
  await driver.wait(
    until.elementIsVisible(
      await driver.findElement(By.css('.el-tabs__nav #tab-2'))
    )
  );
  // common
  let common = await driver.findElement(By.css('.el-tabs__nav #tab-2'));
  await common.click();
  // common data
  let inputs = await driver.findElements(
    By.css('.el-tabs__content #pane-2 .frm-row label input')
  );
  if (inputs.length > 12) {
    await inputs[0].clear();
    await inputs[0].sendKeys(data.mainpc_num);
    await inputs[1].clear();
    await inputs[1].sendKeys(data.pc_num);
    await inputs[7].clear();
    await inputs[7].sendKeys(formatDate(data.creation_date));
    await inputs[8].clear();
    await inputs[8].sendKeys(formatDate(data.status_date));
    await inputs[9].clear();
    await inputs[9].sendKeys(formatDate(data.close_date));
    await inputs[13].clear();
    await inputs[13].sendKeys(data.spec_code);
    //await common.click();
  }
  //console.log(inputs.length);
}

export async function savePCData(driver: WebDriver, data: IRow) {
  // create pc for person
  await createPC(driver);
  await inputPCData(driver, data);
  await saveCard(driver);
}

async function savePCScan(driver: WebDriver, pc_path: string) {
  // wait
  //await driver.wait(until.elementLocated(By.css('.el-tabs__nav #tab-3')));
  // common
  await setTimeout(2000); // 2000
  let panels = await driver.findElements(
    By.css('.x-panel-body .x-tabpanel-child')
  );
  if (panels.length > 0) {
    let last_panel = panels[panels.length - 1];
    // wait
    await driver.manage().setTimeouts({ implicit: 30000 });
    //await driver.wait(until.elementLocated(By.css('.el-tabs__nav #tab-3')));
    // click
    let scan = await last_panel.findElement(By.css('.el-tabs__nav #tab-3'));
    await scan.click();
    let buttons = await last_panel.findElements(
      By.css(
        '.el-tabs__content #pane-3 .frm-row .u-file-container__toolbar button'
      )
    );

    if (buttons.length > 2) {
      //await buttons[3].click();
      await driver.actions().click(buttons[3]).perform();
      // wait untill dialog loaded
      await driver.wait(
        until.elementLocated(
          By.css("div.el-dialog[aria-label='Прикріплення файлу']")
        )
      );
      let file_inp = await driver.findElement(
        By.css('.el-dialog .u-file-container .u-file__dropzone input')
      );
      // add
      await setTimeout(1000);
      await file_inp.sendKeys(pc_path);
      console.log(pc_path);
      //await driver.actions().sendKeys()

      // wait for loading
      await driver.wait(
        until.elementLocated(
          By.css('.el-dialog .u-file-container .u-file-container__view iframe')
        )
      );
      await setTimeout(6000);
      let add_but = await driver.findElement(
        By.css('.el-dialog .el-dialog__footer button')
      );
      await add_but.click();
      // wait for load mask disappear
      await driver.wait(
        until.elementIsNotVisible(
          await driver.findElement(By.css('.el-loading-spinner'))
        )
      );
      // save pc
      await saveCard(driver);
      await setTimeout(8000); //8000
      // wait for load mask disappear
      await driver.wait(
        until.elementIsNotVisible(
          await driver.findElement(By.css('.el-loading-spinner'))
        )
      );
      await driver.manage().setTimeouts({ implicit: 20000 });
      // go to doc tab
      let doc_tab = await last_panel.findElement(
        By.css('.el-tabs__nav #tab-4')
      );
      await doc_tab.click();
    }
  }
}

// go to the list of documents
async function goToDocTab(driver: WebDriver) {
  // wait for load
  await driver.wait(until.elementLocated(By.css('.el-tabs__nav #tab-4')));
  let panels = await driver.findElements(
    By.css('.x-panel-body .x-tabpanel-child')
  );
  if (panels.length > 0) {
    let last_panel = panels[panels.length - 1];
    // go to doc tab
    let doc_tab = await last_panel.findElement(By.css('.el-tabs__nav #tab-4'));
    await doc_tab.click();
  }
}

// delete body of the document before loading new doc_file
async function deleteDocAttachment(driver: WebDriver) {
  await setTimeout(3000);
  let panels = await driver.findElements(
    By.css('.x-panel-body .x-tabpanel-child')
  );
  if (panels.length > 0) {
    let last_panel = panels[panels.length - 1];
    // go to doc tab
    let buttons = await last_panel.findElements(
      By.css('.u-file-container__toolbar button')
    );
    console.log('Button ', buttons.length);
    if (buttons.length > 5) {
      //await buttons[3].click();
      await driver.actions().click(buttons[4]).perform();
      // wait untill dialog loaded
      /* await driver.wait(
        until.elementLocated(By.css("dialog.u-modal[open='true']"))
      ); */
      await setTimeout(2000);
      let dialogs = await driver.findElements(By.css('dialog.u-modal'));
      if (dialogs.length > 0) {
        let dialog = dialogs[dialogs.length - 1];
        let dialog_buttons = await dialog.findElements(By.css('button'));
        console.log(dialog_buttons.length);
        if (dialog_buttons.length > 1) {
          await dialog_buttons[1].click();
          await setTimeout(2000);
        }
      }
    }
  }
}

export async function openExistDocument(
  driver: WebDriver,
  doc_keyword: string
) {
  await setTimeout(3000);
  // wait for view doc list
  await driver.wait(until.elementLocated(By.css('.el-tabs__nav #tab-4')));
  // wait for load mask disappear
  await driver.wait(
    until.elementIsNotVisible(
      await driver.findElement(By.css('.u-form-row__content .el-loading-mask'))
    )
  );

  let panels = await driver.findElements(
    By.css('.x-panel-body .x-tabpanel-child')
  );
  if (panels.length > 0) {
    let last_panel = panels[panels.length - 1];
    // all docs
    let doc_rows = await last_panel.findElements(
      By.css('.u-table-entity__body table tr')
    );
    console.log('Docs ', doc_rows.length);

    // loop over docs
    for (let i = 1; i < doc_rows.length; i++) {
      let row = doc_rows[i];
      let columns = await row.findElements(By.css('td'));
      //console.log('td ', columns.length);
      if (columns.length > 8) {
        let doc_name = await columns[2].getText();
        //console.log('text ', pc_col);
        if (
          doc_name
            .toLowerCase()
            .includes(keyword_to_program_names[doc_keyword].toLowerCase())
        ) {
          // scroll to row
          await driver.executeScript('arguments[0].scrollIntoView(false)', row);
          await setTimeout(3000);
          await driver.wait(until.elementIsVisible(columns[7]));
          // open
          try {
            await columns[7].findElement(By.css('button')).click();
          } catch (err) {
            console.log('Ошибка');
            await columns[7].findElement(By.css('button')).click();
          }
          return true;
        }
      }
    }
  }
  return false;
}

export async function createDocument(driver: WebDriver) {
  //<div class="el-loading-mask el-loading-fade-leave el-loading-fade-leave-active" style="">...</div>
  // wait for view doc list
  await driver.wait(
    until.elementIsVisible(
      await driver.findElement(By.css('.el-tabs__nav #tab-3'))
    )
  );
  // wait for load mask disappear
  await driver.wait(
    until.elementIsNotVisible(
      await driver.findElement(By.css('.el-loading-mask'))
    )
  );
  let buttons = await driver.findElements(
    By.css('.u-form-layout .u-toolbar button')
  );
  if (buttons.length > 10) {
    buttons[10].click();
  }
  //await driver.manage().setTimeouts({ implicit: 10000 });
  await driver.wait(
    until.elementLocated(By.css('.u-modal .u-modal__footer button'))
  );
  let buttons_modal = await driver.findElements(
    By.css('.u-modal .u-modal__footer button')
  );
  if (buttons_modal.length > 2) {
    await buttons_modal[2].click();
  }
  //await button_modal.click();
  //console.log(buttons_modal.length);
}

export async function saveAndClose(
  driver: WebDriver,
  isImage: boolean = false
) {
  if (isImage) {
    await driver.wait(
      until.elementLocated(
        By.css('#pane-4 .u-file-container .u-file-container__view img')
      )
    );
  } else {
    await driver.wait(
      until.elementLocated(
        By.css('#pane-4 .u-file-container .u-file-container__view iframe')
      )
    );
  }

  await setTimeout(4000);
  let panels = await driver.findElements(By.css('.x-tabpanel-child'));
  if (panels.length > 0) {
    let last_panel = panels[panels.length - 1];
    let buttons = await last_panel.findElements(
      By.css('.u-form-layout .u-toolbar button')
    );
    console.log('tool ', buttons.length);

    if (buttons.length > 3) {
      await driver.manage().setTimeouts({ implicit: 20000 });
      await buttons[2].click();
    }
  }
}

async function addFile(driver: WebDriver, path: string) {
  await driver.wait(until.elementLocated(By.css('#pane-4 .u-file-container')));
  let file = await driver.findElement(
    By.css('#pane-4 .u-file-container input')
  );
  await file.sendKeys(path);
}

export async function setDocType(
  driver: WebDriver,
  keyword: string,
  position: number
) {
  let file_type = await driver.findElements(
    By.css('#pane-4 .u-form-row__content .el-input input')
  );
  //console.log(file_type.length);

  if (file_type.length > 4) {
    await file_type[4].clear();
    await driver
      .actions()
      .click(file_type[4])
      .sendKeys(keyword)
      .click()
      .perform();

    //await driver.manage().setTimeouts({ implicit: 10000 });
    /* await driver.wait(
      until.elementLocated(By.css('.el-popover div.ub-select__option'))
    );
    let doc_opts = await driver.findElements(
      By.css('.el-popover div.ub-select__option')
    );
    if (doc_opts.length > position) {
      await doc_opts[position].click();
    }
    console.log(doc_opts.length); */
    await driver.wait(
      until.elementLocated(By.css("div.el-popover[aria-hidden='false']"))
    );
    let dropdowns = await driver.findElements(
      By.css("div.el-popover[aria-hidden='false']")
    );
    if (dropdowns && dropdowns.length > 0) {
      let last_dropdown = dropdowns[dropdowns.length - 1];
      let options = await last_dropdown.findElements(
        By.css('div.ub-select__option')
      );
      console.log(options.length);
      if (options.length > position) {
        await options[position].click();
      }
    }
  }
}
const keyword_to_program_names = {
  понов: 'Заява про надання (поновлення) статусу',
  'виплати доп': 'Заява про призначення (поновлення) виплати',
};
// doctypes to file names
const keyword_to_names = {
  pc: ['ПК.pdf', 'картка', 'reportCard'],
  понов: ['статус', 'Status', 'СБ'],
  'виплати доп': ['ДБ', 'виплата', 'DB'],
  план: ['план', 'Plan', 'іпп.rtf'],
  'додаток 1': [
    'додаток1',
    'додаток 1',
    'відвідув',
    'AddV4_01',
    'AddV3_01',
    'дод1',
  ], //'1.pdf',
  'додаток 2': [
    'додаток2',
    'додаток 2',
    'рішення',
    'PcPrintAdd2',
    'Add_02_Decision',
    'дод2',
  ], //'2.pdf'
  'додаток 3': [
    'додаток3',
    'додаток 3',
    'періоди',
    'AddV4_03',
    'AddV5_03',
    'дод3',
  ], //'3.rtf'
  'додаток 4': [
    'додаток4',
    'додаток 4',
    'нарахування',
    'Add_04_v4',
    'Add_04_v5',
    'дод4',
  ], //'4.pdf'
  'додаток 5': [
    'додаток5',
    'додаток 5',
    'зміни',
    'AddV4_05',
    'AddV5_05',
    'дод5',
  ], //'5.pdf'
  поважн: ['поваж'],
  висновок: ['акт'],
  ато: ['участь ато', 'учасника АТО'],
  військово: ['військовий'],
  договір: ['договір', 'ProfLearn'],
  направленн: ['направлення на навчання'],
  бойов: ['убд'],
  медико: ['мсек'],
  реабіл: ['реабіл'],
  громадс: ['громад', 'корінець направлення'],
  непраце: ['непрацезд'],
  лікарсь: ['лікарсь', 'лкк'],
  реєстрації: ['відмов', 'StatementUnreg', 'прип реєстр'],
  пенс: ['пенсію'],
  соц: ['соціальн'],
  досяг: ['дитиною', 'StatementUnrer'],
  полог: ['полог', 'довідка 147'],
  виписка: ['працевлаш', 'наказу ПОУ'],
  вагіт: ['вагітність'],
  вини: ['вина особи'],
  наказ: ['витяг з наказу'],
  бажання: ['переведення'],
  єдр: ['підприємницька'],
};

const keyword_to_position = {
  pc: -1,
  понов: 0, //1
  'виплати доп': 0,
  план: 0,
  'додаток 1': 0,
  'додаток 2': 0,
  'додаток 3': 0, //6
  'додаток 4': 0,
  'додаток 5': 0,
  поважн: 1,
  висновок: 0,
  ато: 0, //11
  військово: 0,
  договір: 1,
  направленн: 0,
  бойов: 0,
  медико: 0, //16
  реабіл: 0,
  громадс: 0,
  непраце: 0,
  лікарсь: 0, //20
  реєстрації: 0,
  пенс: 0,
  соц: 0,
  досяг: 1,
  полог: 0, //25
  виписка: 0,
  вагіт: 1,
  вини: 0,
  наказ: 1,
  бажання: 1, //30
  єдр: 0,
};
class Document {
  path: string = '';
  file_name: string;
  doc_keyword = '';
  num_pc: number = 0;

  constructor(path: string, file_name: string) {
    this.path = path;
    this.file_name = file_name;
    this.get_keyword();
    this.get_num_pc();
  }

  file_path() {
    return `${this.path}\\${this.file_name}`;
  }

  delete_file() {
    try {
      unlinkSync(this.file_path());
    } catch (err) {
      console.log(err);
    }
  }

  isImage() {
    let image_mask = ['.png', '.jpg', '.jpeg', '.bmp'];
    let image: boolean = false;
    for (let i = 0; i < image_mask.length; i++) {
      if (this.file_name.toLocaleLowerCase().endsWith(image_mask[i])) {
        image = true;
        break;
      }
    }
    return image;
  }

  get_num_pc() {
    this.num_pc = parseInt(this.file_name);
  }

  get_keyword() {
    let keywords = Object.keys(keyword_to_names);
    keywords.forEach((keyword) => {
      let names: string[] = keyword_to_names[keyword];
      names.forEach((name) => {
        if (
          this.file_name.toLocaleLowerCase().includes(name.toLocaleLowerCase())
        ) {
          this.doc_keyword = keyword;
        }
      });
    });
  }
}

export class Documents {
  files: string[] = [];
  docs: Document[] = [];
  files_path: string = '';
  driver: WebDriver;
  mode: string;
  constructor(driver: WebDriver, files_path: string, mode: string = 'add') {
    this.driver = driver;
    this.files_path = files_path;
    this.mode = mode;
    this.getFileNames();
    this.addDocs();
    this.print();
    //this.process();
  }

  docsCount() {
    return this.docs.length;
  }

  getFileNames() {
    try {
      this.files = readdirSync(this.files_path);
      console.log(this.files);
    } catch (error) {
      console.error(error);
    }
  }

  addDocs() {
    if (this.files && Array.isArray(this.files)) {
      this.files.forEach((file_name) => {
        this.docs.push(new Document(this.files_path, file_name));
      });
    }
  }

  // get docs by keyword
  find(keyword: string) {
    let filter = this.docs.filter((doc) => doc.doc_keyword === keyword);
    /* if (filter && filter.length > 0) {
      return filter[0];
    } */
    return filter;
  }

  print() {
    let keywords = Object.keys(keyword_to_names);
    keywords.forEach((keyword) => {
      let docs = this.find(keyword);
      docs.forEach((doc) =>
        console.log(`${doc.file_name} як ${doc.doc_keyword}`)
      );
    });
    //this.docs.forEach(doc => {console.log(doc.doc_keyword)});
  }

  // get num pc from file names
  get_num_pc() {
    let num_pc = 0;
    for (let i = 0; i < this.docs.length; i++) {
      let doc = this.docs[i];
      if (!isNaN(doc.num_pc) && doc.num_pc > 0) {
        num_pc = doc.num_pc;
      }
    }
    return num_pc;
  }

  async auto_process() {
    let keywords = Object.keys(keyword_to_names);
    for (let i = 0; i < keywords.length; i++) {
      let keyword = keywords[i];
      // get documents by some keyword
      let docs = this.find(keyword);
      // loop through docs with same type
      for (let j = 0; j < docs.length; j++) {
        let doc = docs[j];
        if (doc && doc.doc_keyword != 'pc') {
          console.log(
            `Внесення документа ${doc.file_name}  як ${doc.doc_keyword} `
          );
          // add doc
          if (this.mode == 'add') {
            // create new doc
            await createDocument(this.driver);
            // attach file
            await addFile(this.driver, doc.file_path());
            // set doc type
            await setDocType(
              this.driver,
              doc.doc_keyword,
              keyword_to_position[doc.doc_keyword]
            );
            // save and close doc
            await saveAndClose(this.driver, doc.isImage());
          } else {
            // change doc
            // go to the documents
            await goToDocTab(this.driver);
            // try to open
            let is_open = await openExistDocument(this.driver, doc.doc_keyword);
            if (is_open) {
              // delete image of document
              await deleteDocAttachment(this.driver);
              // attach new file
              await addFile(this.driver, doc.file_path());
              // save and close doc
              await saveAndClose(this.driver, doc.isImage());
              // delete file from disk
              doc.delete_file();
              await setTimeout(3000);
            }
          }
        }
        // for save pc scan
        if (doc && doc.doc_keyword == 'pc') {
          await savePCScan(this.driver, doc.file_path());
        }
      }
    }
    //keywords.forEach((keyword) => {});

    for (let i = 0; i < this.docs.length; i++) {
      if (this.docs[i].doc_keyword == '') {
        let resDoc: string = prompt(
          `Для документа ${this.docs[i].file_name} визначте індекс ключового слова `
        );
        let keyword_index = parseInt(resDoc.trim());
        if (keyword_index && keyword_index != 0) {
          let new_doc_keyword = '';
          if (keywords.length >= keyword_index + 1) {
            new_doc_keyword = keywords[keyword_index];
            console.log(
              `Новий ключ для документа ${this.docs[i].file_name} ${new_doc_keyword}`
            );
            // create new doc
            await createDocument(this.driver);
            await addFile(this.driver, this.docs[i].file_path());
            await setDocType(
              this.driver,
              new_doc_keyword,
              keyword_to_position[new_doc_keyword]
            );
            // save and close doc
            await saveAndClose(this.driver, this.docs[i].isImage());
          }
        }
        if (keyword_index === 0) {
          // for save pc scan
          await savePCScan(this.driver, this.docs[i].file_path());
        }
      }
    }
  }

  async process() {
    let keywords = Object.keys(keyword_to_names);
    for (let i = 0; i < keywords.length; i++) {
      let keyword = keywords[i];
      let docs = this.find(keyword);
      for (let j = 0; j < docs.length; j++) {
        let doc = docs[j];
        if (doc && doc.doc_keyword != 'pc') {
          let resDoc: string = prompt(
            `Внести документ ${doc.file_name}  як ${doc.doc_keyword} `
          );
          if (resDoc.trim() == 'y') {
            // create new doc
            await createDocument(this.driver);
            // attach file
            await addFile(this.driver, doc.file_path());
            // set doc type
            await setDocType(
              this.driver,
              doc.doc_keyword,
              keyword_to_position[doc.doc_keyword]
            );
            // save and close doc
            await saveAndClose(this.driver, doc.isImage());
          }
          let keyword_index = parseInt(resDoc.trim());
          if (keyword_index && keyword_index != 0) {
            let new_doc_keyword = '';
            if (keywords.length >= keyword_index + 1) {
              new_doc_keyword = keywords[keyword_index];
              console.log(
                `Новий ключ для документа ${doc.file_name} ${new_doc_keyword}`
              );
              // create new doc
              await createDocument(this.driver);
              await addFile(this.driver, doc.file_path());
              await setDocType(
                this.driver,
                new_doc_keyword,
                keyword_to_position[new_doc_keyword]
              );
              // save and close doc
              await saveAndClose(this.driver, doc.isImage());
            }
          }
          if (keyword_index === 0) {
            // for save pc scan
            await savePCScan(this.driver, doc.file_path());
          }
        }
        // for save pc scan
        if (doc && doc.doc_keyword == 'pc') {
          //await savePCScan(this.driver, doc.file_path());
        }
      }
    }
    //keywords.forEach((keyword) => {});

    for (let i = 0; i < this.docs.length; i++) {
      if (this.docs[i].doc_keyword == '') {
        let resDoc: string = prompt(
          `Для документа ${this.docs[i].file_name} визначте індекс ключового слова `
        );
        let keyword_index = parseInt(resDoc.trim());
        if (keyword_index && keyword_index != 0) {
          let new_doc_keyword = '';
          if (keywords.length >= keyword_index + 1) {
            new_doc_keyword = keywords[keyword_index];
            console.log(
              `Новий ключ для документа ${this.docs[i].file_name} ${new_doc_keyword}`
            );
            // create new doc
            await createDocument(this.driver);
            await addFile(this.driver, this.docs[i].file_path());
            await setDocType(
              this.driver,
              new_doc_keyword,
              keyword_to_position[new_doc_keyword]
            );
            // save and close doc
            await saveAndClose(this.driver, this.docs[i].isImage());
          }
        }
        if (keyword_index === 0) {
          //await savePCScan(this.driver, this.docs[i].file_path());
        }
      }
    }
  }
}
