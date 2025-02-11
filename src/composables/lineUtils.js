export const makeline = (LeaderLine, lines, el, parent) => {
  let line = new LeaderLine(
    document.getElementById(parent),
    LeaderLine.pointAnchor(document.getElementById(`node${el.id}`), { x: '50%', y: '50%' })
  );
  line.path = 'magnet';
  line.endPlug = 'behind';

  const elmWrapper = document.getElementById('line-wrapper');
  const el_line = document.querySelectorAll('.leader-line');

  const position = () => {
    elmWrapper.style.transform = 'none';
    const rectWrapper = elmWrapper.getBoundingClientRect();
    elmWrapper.style.transform = `translate(${(rectWrapper.left + pageXOffset) * -1}px, ${(rectWrapper.top + pageYOffset) * -1}px)`;
    line.position();
  };

  elmWrapper.appendChild(el_line[el_line.length - 1]);
  position();
  lines.value.push(el_line[el_line.length - 1]);
};
