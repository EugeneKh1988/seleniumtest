import { By, WebDriver } from 'selenium-webdriver';
import { IRow } from './excel';
import { formatDate } from './utilities';

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
