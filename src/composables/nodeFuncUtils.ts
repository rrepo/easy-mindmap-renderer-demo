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

export const createButton = (button: any, svg: any, cssClass: any): any => {
  const svgEl = document.createElement("img");
  svgEl.src = svg;
  button.appendChild(svgEl);
  button.classList.add(cssClass);
  button.style.position = "relative";

  return button;
}

export const getDescendants = (nodes: any[], parentId: number): number[] => {
  const result: number[] = [];

  const traverse = (nodeId: number) => {
    for (const node of nodes) {
      if (Number(node.parent) === nodeId) {
        result.push(node.id);
        traverse(node.id);
      }
    }
  }

  traverse(parentId);
  return result;
}