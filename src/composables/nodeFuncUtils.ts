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

export const getDescendants = (nodes: any[], parentId: number): any => {

  // 削除するノードの ID をリスト化
  const idsToRemove = new Set([parentId]);

  // 再帰的に子ノードも削除対象に追加
  function collectChildren(id: any) {
    nodes.forEach(node => {
      if (node.parent == id) { // `==` で型の違いにも対応
        idsToRemove.add(node.id);
        collectChildren(node.id); // 再帰処理
      }
    });
  }

  collectChildren(parentId);

  // 削除対象を除いた新しい配列を作成
  const newNode: any = nodes.filter(node => !idsToRemove.has(node.id));
  return { mainNodes: newNode, descendantNodes: Array.from(idsToRemove) };
}