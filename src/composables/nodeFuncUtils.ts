export const inputTitle = (): any => {
  const el: any = document.getElementById("title");
  const selection: any = window.getSelection();
  const range = document.createRange();
  selection.removeAllRanges();
  range.selectNodeContents(el);
  range.collapse(false);
  selection.addRange(range);
  el.focus();
};



export const inputNode = (e: any, isEditing: boolean): any => {
  const target = document.getElementById(`node${e}`);
  if (!target) {
    console.warn(`Element with id node${e} not found`);
    console.log("not found: ", e);
    return isEditing; // 状態はそのまま返す
  }

  console.log("target: ", isEditing);

  if (!isEditing) {
    // 編集モードに入る
    target.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);

    console.log("→ 編集開始");
    return true;
  } else {
    // 編集モードを終了
    const textContent = target.textContent;
    console.log("→ 編集終了: ", textContent);
    target.blur();
    return false;
  }
};

export const createButton = (button: any, svg: any, cssClass: any): any => {
  const svgEl = document.createElement("img");
  svgEl.src = svg;
  button.appendChild(svgEl);
  button.classList.add(cssClass);
  button.style.position = "relative";

  return button;
};

export const checkDropZone = (x: number, y: number, el: any) => {
  const selectorElement = document.getElementById("title");
  const allNodes: any[] = [
    ...document.querySelectorAll(".p_nodes, .c_nodes"),
    ...(selectorElement ? [selectorElement] : []),
  ];

  allNodes.filter((node: any) => node !== el);

  allNodes.forEach((zone: any) => {
    zone.classList.remove("highlight");
  });

  const targetZone = allNodes.find((node: any) => {
    const rect = node.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  });

  if (targetZone) {
    targetZone.classList.add("highlight");
    return targetZone;
  }
  return null;
};

export const mouseMove = (
  isDragging: boolean,
  moveEvent: MouseEvent,
  el: HTMLElement,
  initialLeft: number,
  initialTop: number,
  startX: number,
  startY: number,
  scale: number
) => {
  if (!isDragging) return;

  const offsetX = (moveEvent.clientX - startX) / scale;
  const offsetY = (moveEvent.clientY - startY) / scale;

  el.style.left = `${initialLeft + offsetX}px`;
  el.style.top = `${initialTop + offsetY}px`;

  checkDropZone(
    moveEvent.clientX,
    moveEvent.clientY,
    el
    // Array.from(document.querySelectorAll(".p_nodes, .c_nodes"))
  );

  return { offsetX, offsetY };
};
