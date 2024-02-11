import { By, WebDriver } from 'selenium-webdriver';

export function formatDate(date: Date): string {
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

export async function saveCard(driver: WebDriver) {
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
