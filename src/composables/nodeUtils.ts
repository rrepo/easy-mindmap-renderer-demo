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
  margin_rap_node.id = `selector-margin${el.id}`;

  const parent: any = document.getElementById(el.parent);
  node_text.classList.add('c_nodes');

  const parentNode = nodes.find((node: any) => node.id == el.parent)
  el.direction = parentNode.direction;

  if (el.direction === 'right') {
    rightAppend(rap_node, node_text, node_childes, node_selector);
    rap_node.classList.add('rap_node');
  } else {
    if (nodes[el.parent] && nodes[el.parent].parent == "title") {
      rightAppend(rap_node, node_text, node_childes, node_selector);
    } else {
      rightAppend(rap_node, node_text, node_childes, node_selector);
      // margin_rap_node.classList.add('margin-left-cnodes');
    }
    rap_node.classList.add('rap_node_left');
    margin_rap_node.classList.add('margin-left-cnodes');
  }

  margin_rap_node.appendChild(rap_node);
  margin_rap_node.classList.add('margin_c_nodes');
  parent.appendChild(margin_rap_node);
  // return { rap_node, node_text, node_childes };
};

export const focusNode = (focus: any) => {
  focus.focus()
  return focus
}

export const getDescendants = (nodes: any[], parentId: number): any => {
  // 削除するノードの ID をリスト化
  const idsToRemove = new Set([parentId]);
  const allRemovedNodes: any[] = [];

  // 再帰的に子ノードも削除対象に追加
  function collectChildren(id: any) {
    nodes.forEach(node => {
      if (node.parent == id) { // `==` で型の違いにも対応
        allRemovedNodes.push(node);
        idsToRemove.add(node.id);
        collectChildren(node.id); // 再帰処理
      }
    });
  }

  collectChildren(parentId);

  // 削除対象を除いた新しい配列を作成
  const newNode: any = nodes.filter(node => !idsToRemove.has(node.id));
  allRemovedNodes.unshift(nodes.find(node => node.id === parentId));
  return { mainNodes: newNode, descendantNodes: Array.from(idsToRemove), removedNodes: allRemovedNodes };
}

export const deleteNodes = (nodes: any[], id: number, count: number) => {
  const node = nodes.find((node: any) => node.id == id)

  const result = getDescendants(nodes, id)
  const newNodes = result.mainNodes
  const removeNodeIds = result.descendantNodes
  const removedNodes = result.removedNodes

  nodes = newNodes

  let removedEl = null

  if (node.parent == "title") {
    const rap = document.getElementById(`rap-node${node.id}`)
    rap?.remove()
    removedEl = rap
    count--
  } else {
    removedEl = removeNodeIds
    removeNodeIds.forEach((node: any) => {
      const el: any = document.getElementById(`selector${node}`)
      el.remove()
    })

    const selectorMargin = document.getElementById(`selector-margin${id}`)
    selectorMargin?.remove()
    const rap = document.getElementById(`selector-margin${id}`)
    // rap?.remove()
    removedEl = rap
  }

  return { nodes, count, removedNodes }
}