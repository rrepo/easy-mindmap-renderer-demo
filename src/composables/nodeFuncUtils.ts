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

export const checkDropZone = (x: number, y: number, el: any, allNodes: any) => {
  allNodes.filter((node: any) => node !== el);

  allNodes.forEach((zone: any) => {
    zone.classList.remove("highlight");
  })

  const targetZone = allNodes.find((node: any) => {
    const rect = node.getBoundingClientRect();
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  });

  if (targetZone) {
    targetZone.classList.add("highlight");
    return targetZone
  }
  return null
}

export const mouseMove = (
  isDragging: boolean,
  moveEvent: MouseEvent,
  el: HTMLElement,
  initialLeft: number,
  initialTop: number,
  startX: number,
  startY: number
) => {
  if (!isDragging) return;

  const offsetX = moveEvent.clientX - startX;
  const offsetY = moveEvent.clientY - startY;

  el.style.left = `${initialLeft + offsetX}px`;
  el.style.top = `${initialTop + offsetY }px`;

  checkDropZone(
    moveEvent.clientX,
    moveEvent.clientY,
    el,
    Array.from(document.querySelectorAll(".p_nodes, .c_nodes"))
  );

  return { offsetX, offsetY };
};