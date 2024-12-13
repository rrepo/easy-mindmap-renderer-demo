<template>
  <div class="edge" id="edge" v-dragscroll="true">
    <div class="field" id="field">
      <div class="left">
        <div class="left_vertical">
          <div class="left_horizontal" id="left_center">
            <div></div>
          </div>
        </div>
      </div>

      <div class="center">
        <div class="title_node_rap">
          <div class="selector" id="selector" tabindex="0" @click="update_focus" @dblclick="input_node"
            @keydown="move_focus">
            <div class="title_nodes" id="title" contenteditable="true" @blur="line_reset">
              {{ title }}
            </div>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="right_vertical">
          <div class="right_horizontal" id="right_center">
            <div></div>
          </div>
        </div>
      </div>

      <div id="line-wrapper"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
// import { dragscroll } from 'vue-dragscroll';

const props = defineProps({
  title_props: String,
  node_props: Array,
});

const title = ref(props.title_props);
const nodes = ref(props.node_props);
const lines = ref([]);
let count = 0;
let focus = null;
const LeaderLine = window.LeaderLine;
const isEditing = ref()
isEditing.value = false

const right_append = (rap_node, node_text, node_childes, node_selector) => {
  node_selector.appendChild(node_text);
  rap_node.appendChild(node_selector);
  rap_node.appendChild(node_childes);
};

const left_append = (rap_node, node_text, node_childes, node_selector) => {
  node_selector.appendChild(node_text);
  rap_node.appendChild(node_childes);
  rap_node.appendChild(node_selector);
};

const makeFromParent = (node_text, rap_node, node_childes) => {
  node_text.classList.add('p_nodes');
  rap_node.classList.add('rap_node');
  count++;
  return { rap_node, node_text, node_childes };
};

const makeFromChild = (el, node_text, rap_node, node_childes, node_selector) => {
  const margin_rap_node = document.createElement('div');
  margin_rap_node.classList.add('selector');

  const parent = document.getElementById(el.parent);
  node_text.classList.add('c_nodes');

  el.direction = nodes.value[el.parent].direction;
  if (el.direction === 'right') {
    right_append(rap_node, node_text, node_childes, node_selector);
    rap_node.classList.add('rap_node');
  } else {
    left_append(rap_node, node_text, node_childes, node_selector);
    rap_node.classList.add('rap_node_left');
  }

  margin_rap_node.appendChild(rap_node);
  margin_rap_node.classList.add('margin_c_nodes');
  parent.appendChild(margin_rap_node);
  return { rap_node, node_text, node_childes };
};

const makeline = (el, direction, parent) => {
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

const makelines = () => {
  const right = 1;
  const left = 99;

  nodes.value.forEach(el => {
    if (el.parent === 'title') {
      if (el.direction === 'right') {
        makeline(el, right, 'title');
      } else {
        makeline(el, left, 'title');
      }
    } else {
      if (el.direction === 'right') {
        makeline(el, right, `node${el.parent}`);
      } else {
        makeline(el, left, `node${el.parent}`);
      }
    }
  });
};

const removelines = () => {
  lines.value.forEach(el => {
    el.parentNode.removeChild(el);
  });
  lines.value.length = 0;
};

const line_reset = () => {
  removelines();
  makelines();
};

const input_node = () => {
  const el = document.getElementById('title');
  const selection = window.getSelection();
  const range = document.createRange();
  selection.removeAllRanges();
  range.selectNodeContents(el);
  range.collapse(false);
  selection.addRange(range);
  el.focus();
  return false;
};

const input_node_test = (e) => {
  const target = document.getElementById(`node${e}`);
  target.focus();
  const selection = window.getSelection();
  const range = document.createRange();
  selection.removeAllRanges();
  range.selectNodeContents(target);
  range.collapse(false);
  selection.addRange(range);
  target.focus();
  return false;
};

const update_focus = (e) => {
  if (focus !== null) {
    focus.classList.remove('selector_focus');
  }
  e.srcElement.classList.add('selector_focus');
  focus = e.srcElement;
};

const focus_node = () => {
  if (focus) {
    focus.focus();
  }
};
const move_focus = (e) => {
  if (e.keyCode === 9) { // Tab key code
    let currentFocus = focus;
    let nextFocus = null;

    if (e.shiftKey) {
      // Shift + Tab: Move to the previous node
      nextFocus = currentFocus.previousElementSibling;
    } else {
      // Tab: Move to the next node
      nextFocus = currentFocus.nextElementSibling;
    }

    if (nextFocus && nextFocus.classList.contains('selector')) {
      nextFocus.focus();
      update_focus({ srcElement: nextFocus });
    }
    e.preventDefault();
  } else if (e.keyCode === 37) { // Arrow Left
    move_focus_in_direction('left');
  } else if (e.keyCode === 38) { // Arrow Up
    move_focus_in_direction('up');
  } else if (e.keyCode === 39) { // Arrow Right
    move_focus_in_direction('right');
  } else if (e.keyCode === 40) { // Arrow Down
    move_focus_in_direction('down');
  } else if (e.metaKey && e.key === 'Enter') {
    const editableNode = focus.querySelector('.c_nodes, .p_nodes, .title_nodes');
    if (editableNode) {
      if (!isEditing.value) {
        editableNode.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editableNode); // 要素内のすべての内容を選択
        range.collapse(false); // 範囲を折りたたんで一番後ろにカーソルを移動
        selection.removeAllRanges(); // 既存の選択範囲をクリア
        selection.addRange(range); // 新しい範囲を追加
        isEditing.value = true;
      } else {
        isEditing.value = false;
        editableNode.blur();
        focus.focus()
      }
    }
  }
};

const move_focus_in_direction = (direction) => {
  let currentFocus = focus;
  let nextFocus = null;

  const activeEditable = document.activeElement;
  if (activeEditable && activeEditable.isContentEditable) {
    return; // 編集中の場合は何もしない
  }

  // 現在のノードの座標を取得
  const currentRect = currentFocus.getBoundingClientRect();

  // ノードのリストを取得
  const allNodes = Array.from(document.querySelectorAll('.selector'));

  // 最も近いノードを探すために初期化
  let minDistance = Infinity;

  // 各ノードについて距離を計算し、最も近いノードを選択
  allNodes.forEach((node) => {
    const nodeRect = node.getBoundingClientRect();
    let distance = null;

    switch (direction) {
      case 'left':
        // 現在のノードの右側に最も近いノードを探す
        if (nodeRect.right < currentRect.left) {
          // 距離を水平方向と垂直方向の距離で評価
          const horizontalDistance = currentRect.left - nodeRect.right;
          const verticalDistance = Math.abs((currentRect.top + currentRect.bottom) / 2 - (nodeRect.top + nodeRect.bottom) / 2);
          distance = Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2); // 総距離
        }
        break;

      case 'right':
        // 現在のノードの左側に最も近いノードを探す
        if (nodeRect.left > currentRect.right) {
          // 距離を水平方向と垂直方向の距離で評価
          const horizontalDistance = nodeRect.left - currentRect.right;
          const verticalDistance = Math.abs((currentRect.top + currentRect.bottom) / 2 - (nodeRect.top + nodeRect.bottom) / 2);
          distance = Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2); // 総距離
        }
        break;
      case 'up':
        if (nodeRect.bottom < currentRect.top) {
          const verticalDistance = currentRect.top - nodeRect.bottom;
          const horizontalDistance = Math.abs(currentRect.left - nodeRect.left);
          distance = verticalDistance + horizontalDistance;
        }
        break;
      case 'down':
        if (nodeRect.top > currentRect.bottom) {
          const verticalDistance = nodeRect.top - currentRect.bottom;
          const horizontalDistance = Math.abs(currentRect.left - nodeRect.left);
          distance = verticalDistance + horizontalDistance;
        }
        break;
    }

    // 最も近いノードを更新
    if (distance !== null && distance < minDistance) {
      minDistance = distance;
      nextFocus = node;
    }
  });

  // If nextFocus is valid and is a selector element
  if (nextFocus && nextFocus.classList.contains('selector')) {
    const rapNodeChild = nextFocus.querySelector('.rap_node');
    const selector = rapNodeChild ? rapNodeChild.querySelector('.selector') : null;

    if (selector) {
      selector.focus();
      update_focus({ srcElement: selector });
    } else {
      nextFocus.focus();
      update_focus({ srcElement: nextFocus });
    }
  }
};

onMounted(() => {
  const el_title = document.getElementById('title');
  const el_edge = document.getElementById('edge');
  const el_selector = document.getElementById('selector');

  el_title.scrollIntoView({ block: 'center', inline: 'center' });

  const right = document.getElementById('right_center');
  const left = document.getElementById('left_center');

  nodes.value.forEach(el => {
    const node_text = document.createElement('div');
    const node_selector = document.createElement('div');
    node_selector.classList.add('selector');
    node_selector.id = `selector${el.id}`;
    node_selector.tabIndex = '0';

    const rap_node = document.createElement('div');
    const node_childes = document.createElement('div');
    const text = document.createTextNode(el.text);
    node_text.contentEditable = true;

    node_childes.id = `${el.id}`;
    node_text.id = `node${el.id}`;
    node_text.appendChild(text);

    if (el.parent === 'title') {
      if (count % 2 === 0) {
        const nodeFromParent = makeFromParent(node_text, rap_node, node_childes);
        right_append(nodeFromParent.rap_node, nodeFromParent.node_text, nodeFromParent.node_childes, node_selector);
        right.appendChild(nodeFromParent.rap_node);
        el.direction = 'right';
      } else {
        const nodeFromParent = makeFromParent(node_text, rap_node, node_childes);
        left_append(nodeFromParent.rap_node, nodeFromParent.node_text, nodeFromParent.node_childes, node_selector);
        left.appendChild(nodeFromParent.rap_node);
        node_childes.classList.add('margin-left');
        el.direction = 'left';
      }
    } else {
      makeFromChild(el, node_text, rap_node, node_childes, node_selector);
    }

    const el_node = document.getElementById(`node${el.id}`);
    const el_selector = document.getElementById(`selector${el.id}`);

    el_node.addEventListener('blur', () => {
      line_reset();
    });

    el_selector.addEventListener('click', (e) => {
      update_focus(e);
    });

    el_selector.addEventListener('dblclick', (e) => {
      input_node_test(e.srcElement.id.substr(8));
    });

    el_selector.addEventListener('keydown', (e) => {
      if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
        input_node_test(e.srcElement.id.substr(8));
      }
      move_focus(e); // Call move_focus to handle Tab key navigation and Arrow keys
    });

    el_node.addEventListener('focus', () => {
      el_edge.removeEventListener('scroll', focus_node);
    });

    el_node.addEventListener('blur', () => {
      el_edge.addEventListener('scroll', focus_node);
    });
  });

  makelines();

  el_selector.addEventListener('keydown', (e) => {
    if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
      input_node(e);
    }
  });

  el_edge.addEventListener('scroll', focus_node);

  el_title.addEventListener('focus', () => {
    el_edge.removeEventListener('scroll', focus_node);
  });

  el_title.addEventListener('blur', () => {
    el_edge.addEventListener('scroll', focus_node);
  });
});
</script>



<style>
#line-wrapper {
  z-index: -100;
}

.btn {
  z-index: 10000;
  /* display: flex; */
}

.edge {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  /* border: 1px solid #000; */
}

.field {
  width: 5000px;
  height: 5000px;
  z-index: 1;
  display: flex;
  position: relative;
}

.center {
  width: 10%;
  height: 100%;
  /* z-index: 1; */
  /* background-color: coral; */
}

.right {
  width: 45%;
  height: 100%;
  display: flex;
  align-items: center;
}

.right_vertical {
  width: 100%;
  /* background-color: olive; */
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
}

.right_horizontal {
  width: fit-content;
  /* background-color: orchid; */
}

.left {
  width: 45%;
  height: 100%;
  display: flex;
  align-items: center;
}

.left_vertical {
  width: 100%;
  margin: 0 auto;
  text-align: left;
  display: flex;
  justify-content: flex-end;
  /* background-color: olive; */
}

.left_horizontal {
  width: fit-content;
  /* background-color: orchid; */
}

.title_node_rap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.selector {
  width: fit-content;
  height: fit-content;
  border-radius: 10px;
  /* background-color:#00aaff; */
  position: relative;
  margin: 5px;
}

.selector:focus {
  outline: none;
}

.title_selector:focus {
  outline: none;
}

.title_nodes {
  background-color: white;
  border-radius: 10px;
  /* box-shadow: 0 3px 3px 0 rgba(0, 0, 0, .5); */

  width: fit-content;

  font-size: 35px;
  font-family: sans-serif;
  padding: 10px 10px;
  max-width: 200px;

  /* pointer-events: none; */
  position: relative;
  z-index: -10;
}

.title_nodes:focus {
  outline: none;
}

.p_nodes {
  background-color: #F5F5F5;
  border-radius: 10px;
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, .5);
  /* width: fit-content;
  height: fit-content; */
  width: -moz-fit-content;
  /* Firefox */
  width: fit-content;
  /* other browsers */
  font-size: 23px;
  font-family: sans-serif;
  padding: 10px 10px;
  margin: auto 0;

  position: relative;
  z-index: -10;
}

.p_nodes:focus {
  outline: none;
}

.c_nodes {
  background-color: #F5F5F5;
  border-radius: 10px;
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, .5);
  /* width: fit-content;
  height: fit-content; */

  width: -moz-fit-content;
  width: fit-content;

  font-size: 23px;
  font-family: sans-serif;

  padding: 10px 10px;
  /* margin: 30px 30px; */

  position: relative;
  z-index: -10;
}

.c_nodes:focus {
  outline: none;
}

.margin_c_nodes {
  margin: 30px 30px;
}

.rap_node {
  display: flex;
  align-items: center;
  width: 100%;
  /* height: 100%; */
  /* padding: 10px 0px; */
  /* margin-left: auto;
  margin-right: 0; */

  /* background-color: aqua; */
}

.rap_node_left {
  display: flex;
  align-items: center;
  padding: 10px 0px;
  width: 100%;

  justify-content: flex-end;
}

.margin-left {
  /* margin: auto; */
  margin-left: auto;
  margin-right: 0;
}

.selector_focus {
  border: 4px solid #00aaff;
  border-radius: 10px;
}
</style>