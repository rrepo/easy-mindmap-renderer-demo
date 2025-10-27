export const makeline = (el: any, pId: any, scale: number): any => {
  const cId = el.id;
  const svg: any = document.getElementById("svg-lines");
  const parent = document.getElementById(pId);
  const child = document.getElementById("selector" + cId);

  if (!svg || !parent || !child) return null;

  const fieldRect = document.getElementById("field")?.getBoundingClientRect();
  if (!fieldRect) return null;

  // 親・子要素の位置取得
  const parentRect = parent.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();

  // `scale` を考慮した座標計算
  const x1 = (parentRect.left + parentRect.width / 2 - fieldRect.left) / scale;
  const y1 = (parentRect.top + parentRect.height / 2 - fieldRect.top) / scale;

  const x2 = (childRect.left + childRect.width / 3 - fieldRect.left) / scale;
  const y2 = (childRect.top + childRect.height / 2 - fieldRect.top) / scale;
  // console.log(x1, y1, x2, y2)

  // 線を描画する関数（毎回新しい線を作成）
  function drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    id: string,
    color: string
  ): SVGLineElement {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1.toString());
    line.setAttribute("y1", y1.toString());
    line.setAttribute("x2", x2.toString());
    line.setAttribute("y2", y2.toString());
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "5");
    line.setAttribute("data-line-id", id);

    svg.appendChild(line);
    return line;
  }

  // `parent` の点と `child` の点を結ぶ線を描画
  return drawLine(x1, y1, x2, y2, `${pId}-${cId}`, "tomato");
};

export const makelines = (nodes: any, scale: number): any => {
  const returnEl: any = [];

  nodes.forEach((el: any) => {
    if (el.parent === 0) {
      returnEl.push(makeline(el, 0, scale));
    } else {
      returnEl.push(makeline(el, `node${el.parent}`, scale));
    }
  });
  return returnEl;
};

export const removeline = (lines: any): any => {
  lines.forEach((el: any) => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  lines.length = 0;
  return lines;
};

export const LineReset = (lines: any, nodes: any, scale: number): any => {
  lines = removeline(lines);
  lines = makelines(nodes, scale);
  return lines;
};
