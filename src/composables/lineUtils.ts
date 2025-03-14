export const makeline = (LeaderLine: any, el: any, parent: any, scale: number): any => {
  const line = new LeaderLine(
    document.getElementById(parent),
    document.getElementById(`node${el.id}`), { x: '50%', y: '50%' }
  );
  line.path = 'magnet';
  line.endPlug = 'behind';

  const elmWrapper = document.getElementById('line-wrapper') as HTMLElement;
  const el_line = document.querySelectorAll('.leader-line');

  const position = () => {
    if (!elmWrapper) return;
    elmWrapper.style.transform = 'none';
    const rectWrapper = elmWrapper.getBoundingClientRect();
    const baseX = (rectWrapper.left + pageXOffset) * -1;
    const baseY = (rectWrapper.top + pageYOffset) * -1;
    elmWrapper.style.transform = `translate(${baseX}px, ${baseY}px)`;
    line.position();
  };

  if (elmWrapper && el_line.length > 0) {
    elmWrapper.appendChild(el_line[el_line.length - 1]);
  }
  position();

  return el_line.length > 0 ? (el_line[el_line.length - 1] as HTMLElement) : null;
};

export const makelines = (LeaderLine: any, nodes: any, scale: number): any => {
  const returnEl: any = []

  nodes.forEach((el: any) => {
    if (el.parent === 'title') {
      returnEl.push(makeline(LeaderLine, el, 'title', scale));
    } else {
      returnEl.push(makeline(LeaderLine, el, `node${el.parent}`, scale));
    }
  });
  return returnEl
};

export const removeline = (lines: any): any => {
  lines.forEach((el: any) => {
    el.parentNode.removeChild(el);
  });
  lines.length = 0;
  return lines;
}

export const LineReset = (LeaderLine: any, lines: any, nodes: any, scale: number): any => {
  lines = removeline(lines);
  lines = makelines(LeaderLine, nodes, scale);
  return lines;
}