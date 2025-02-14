export const inputTitle = (): any => {
  const el: any = document.getElementById('title');
  const selection: any = window.getSelection();
  const range = document.createRange();
  selection.removeAllRanges();
  range.selectNodeContents(el);
  range.collapse(false);
  selection.addRange(range);
  el.focus();
}

export const inputNode = (e: any): any => {
  const target: any = document.getElementById(`node${e}`);
  target.focus();
  const selection: any = window.getSelection();
  const range = document.createRange();
  selection.removeAllRanges();
  range.selectNodeContents(target);
  range.collapse(false);
  selection.addRange(range);
  target.focus();
}