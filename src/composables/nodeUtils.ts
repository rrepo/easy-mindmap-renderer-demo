export const rightAppend = (rap_node: any, node_text: any, node_childes: any, node_selector: any) => {
  node_selector.appendChild(node_text);
  rap_node.appendChild(node_selector);
  rap_node.appendChild(node_childes);
};

export const leftAppend = (rap_node: any, node_text: any, node_childes: any, node_selector: any) => {
  node_selector.appendChild(node_text);
  rap_node.appendChild(node_childes);
  rap_node.appendChild(node_selector);
};


export const makeFromParent = (node_text: any, rap_node: any, node_childes: any) => {
  node_text.classList.add('p_nodes');
  rap_node.classList.add('rap_node');
  return { rap_node, node_text, node_childes };
};

export const makeFromChild = (nodes: any, el: any, node_text: any, rap_node: any, node_childes: any, node_selector: any) => {
  const margin_rap_node = document.createElement('div');
  margin_rap_node.classList.add('selector');

  const parent: any = document.getElementById(el.parent);
  node_text.classList.add('c_nodes');

  el.direction = nodes[el.parent].direction;
  if (el.direction === 'right') {
    rightAppend(rap_node, node_text, node_childes, node_selector);
    rap_node.classList.add('rap_node');
  } else {
    if (nodes[el.parent].parent == "title") {
      rightAppend(rap_node, node_text, node_childes, node_selector);
    } else {
      rightAppend(rap_node, node_text, node_childes, node_selector);
      margin_rap_node.classList.add('margin-left-cnodes');
    }
    rap_node.classList.add('rap_node_left');
  }

  margin_rap_node.appendChild(rap_node);
  margin_rap_node.classList.add('margin_c_nodes');
  parent.appendChild(margin_rap_node);
  return { rap_node, node_text, node_childes };
};

