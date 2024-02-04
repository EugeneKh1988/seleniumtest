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
