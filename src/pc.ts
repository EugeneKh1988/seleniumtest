import { By, Key, WebDriver } from 'selenium-webdriver';
import { IRow } from './excel';
import { formatDate } from './utilities';
import { readdirSync } from 'fs';
import promptSync from 'prompt-sync';
const prompt = promptSync();

export async function savePCData(driver: WebDriver, data: IRow) {
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
    await common.click();
  }
  //console.log(inputs.length);
}

export async function addDocument(driver: WebDriver) {
  let buttons = await driver.findElements(
    By.css('.u-form-layout .u-toolbar button')
  );
  if (buttons.length > 10) {
    buttons[10].click();
  }
  await driver.manage().setTimeouts({ implicit: 10000 });
  let buttons_modal = await driver.findElements(
    By.css('.u-modal .u-modal__footer button')
  );
  if (buttons_modal.length > 2) {
    await buttons_modal[2].click();
  }
  //await button_modal.click();
  console.log(buttons_modal.length);
}

async function addFile(driver: WebDriver, path: string) {
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
  console.log(file_type.length);

  if (file_type.length > 4) {
    await file_type[4].clear();
    //await file_type[4].click();
    //await file_type[4].sendKeys('понов');
    await driver
      .actions()
      .click(file_type[4])
      .sendKeys(keyword)
      .click()
      .perform();

    await driver.manage().setTimeouts({ implicit: 10000 });
    let doc_opts = await driver.findElements(
      By.css('.el-popover div.ub-select__option')
    );
    if (doc_opts.length > position) {
      await doc_opts[position].click();
    }
    console.log(doc_opts.length);
  }

  /* await driver.manage().setTimeouts({ implicit: 10000 });
  let options = await driver.findElements(By.css('div.el-popover'));
  console.log(await options.length); */
}

const keyword_to_names = {
  понов: ['статус', 'Status'],
  'виплати доп': ['ДБ', 'виплата', 'DB'],
  план: ['план', 'Plan'],
  'додаток 1': ['додаток1', 'додаток 1', 'відвідув'],
  'додаток 2': ['додаток2', 'додаток 2', 'рішення'],
  'додаток 3': ['додаток3', 'додаток 3', 'періоди'],
  'додаток 4': ['додаток4', 'додаток 4', 'нарахування'],
  'додаток 5': ['додаток5', 'додаток 5', 'зміни'],
  поважна: ['поваж'],
  висновок: ['акт'],
};

const keyword_to_position = {
  понов: 0,
  'виплати доп': 0,
  план: 0,
  'додаток 1': 0,
  'додаток 2': 0,
  'додаток 3': 0,
  'додаток 4': 0,
  'додаток 5': 0,
  поважн: 1,
  висновок: 0,
};
class Document {
  path: string = '';
  file_name: string;
  doc_keyword = '';

  constructor(path: string, file_name: string) {
    this.path = path;
    this.file_name = file_name;
    this.get_keyword();
  }

  file_path() {
    return `${this.path}\\${this.file_name}`;
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
  constructor(driver: WebDriver, files_path: string) {
    this.driver = driver;
    this.files_path = files_path;
    this.getFileNames();
    this.addDocs();
    this.print();
    //this.process();
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

  find(keyword: string) {
    let filter = this.docs.filter((doc) => doc.doc_keyword === keyword);
    if (filter && filter.length > 0) {
      return filter[0];
    }
    return null;
  }

  print() {
    let keywords = Object.keys(keyword_to_names);
    keywords.forEach((keyword) => {
      let doc = this.find(keyword);
      if (doc) {
        console.log(doc.doc_keyword);
      }
    });
    //this.docs.forEach(doc => {console.log(doc.doc_keyword)});
  }

  async process() {
    let keywords = Object.keys(keyword_to_names);
    for (let i = 0; i < keywords.length; i++) {
      let keyword = keywords[i];
      let doc = this.find(keyword);
      if (doc) {
        let resDoc: string = prompt(
          `Внести документ ${doc.file_name}  як ${doc.doc_keyword} `
        );
        if (resDoc.trim() == 'y') {
          //
          await addFile(this.driver, doc.file_path());
          await setDocType(
            this.driver,
            doc.doc_keyword,
            keyword_to_position[doc.doc_keyword]
          );
        }
        let keyword_index = parseInt(resDoc.trim());
        if (keyword_index) {
          let new_doc_keyword = '';
          if (keywords.length >= keyword_index + 1) {
            new_doc_keyword = keywords[keyword_index];
            console.log(
              `Новий ключ для документа ${doc.file_name} ${new_doc_keyword}`
            );
            await addFile(this.driver, doc.file_path());
            await setDocType(
              this.driver,
              new_doc_keyword,
              keyword_to_position[new_doc_keyword]
            );
          }
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
        if (keyword_index) {
          let new_doc_keyword = '';
          if (keywords.length >= keyword_index + 1) {
            new_doc_keyword = keywords[keyword_index];
            console.log(
              `Новий ключ для документа ${this.docs[i].file_name} ${new_doc_keyword}`
            );
            await addFile(this.driver, this.docs[i].file_path());
            await setDocType(
              this.driver,
              new_doc_keyword,
              keyword_to_position[new_doc_keyword]
            );
          }
        }
      }
    }
  }
}
