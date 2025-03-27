<template>
  <div id="edge" v-dragscroll="controlDragZoom" class="edge">

    <div class="wrapper">
      <svg id="svg-lines" xmlns="http://www.w3.org/2000/svg" :style="{ transform: `scale(${scale})` }">
      </svg>

      <div id="field" class="field" :style="{ transform: `scale(${scale})` }">
        <div class="left">
          <div class="left_vertical">
            <div id="left_center" class="left_horizontal">
              <div />
            </div>
          </div>
        </div>

        <div class="center">
          <div class="title_node_rap">
            <div id="selector" class="selector" tabindex="0" @click="update_focus" @dblclick="inputTitle"
              @keydown="move_focus">
              <div id="title" class="title_nodes" contenteditable="true" @blur="onLineReset">
                {{ title }}
              </div>
            </div>
          </div>
        </div>

        <div class="right">
          <div class="right_vertical">
            <div id="right_center" class="right_horizontal">
              <div />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
// import { dragscroll } from 'vue-dragscroll';
import plusSvg from '@/assets/icons/plus-solid.svg';
import trashSvg from '@/assets/icons/trash-solid.svg';
// import allowSvg from '@/assets/icons/up-down-left-right-solid.svg';
// import EightAllowSvg from '@/assets/icons/8Arrows.svg'
import moveSvg from '@/assets/icons/move-svgrepo-com.svg'

import { makelines, removeline, LineReset } from '@/composables/lineUtils';
import { rightAppend, leftAppend, makeFromParent, makeFromChild, getDescendants, deleteNodes } from '@/composables/nodeUtils';
import { inputTitle, inputNode, createButton, checkDropZone, mouseMove } from '@/composables/nodeFuncUtils';

const props = defineProps({
  title_props: String,
  node_props: Array,
});

const title: any = ref(props.title_props);
const nodes: any = ref(props.node_props);
const lines: any = ref([]);
let count = ref(0);
const focus: any = ref(null);
const LeaderLine: any = window.LeaderLine;
const isEditing: any = ref()
isEditing.value = false
const plusButton: any = ref(true)
const controlDragZoom: any = ref(true)

const scale = ref(1);
const minScale = 0.5;
const maxScale = 2;
const scaleStep = 0.3;

const zoomIn = () => {
  if (scale.value < maxScale) {
    scale.value += scaleStep;
  }
};

const zoomOut = () => {
  console.log("out")
  if (scale.value > minScale) {
    scale.value -= scaleStep;
  }
};

const onLineReset = () => {
  lines.value = LineReset(LeaderLine, lines.value, nodes.value, scale.value);
};

const update_focus = (e) => {
  // ボタンがクリックされて作動したときは終了するようにする
  if (e.srcElement.classList[0] != "selector") {
    return
  }

  if (focus.value !== null) {
    focus.value.classList.remove('selector_focus');
  }
  e.srcElement.classList.add('selector_focus');

  focus.value = e.srcElement;

  if (plusButton.value) {
    const existingWrapper = plusButton.value;
    if (existingWrapper && existingWrapper.className) {
      existingWrapper.remove();
      const existingButton = existingWrapper.querySelector(".plus-button");
      if (existingButton) {
        existingButton.remove(); // ボタンを削除
      }
    }

    const wrapper = document.createElement("div");
    wrapper.className = "plus-button-wrapper";
    wrapper.style.position = "absolute"; // ラップ要素を絶対位置で配置
    wrapper.style.top = "0";
    wrapper.style.left = "0";
    wrapper.style.right = "100%";
    focus.value.appendChild(wrapper); // focusの中にラップ要素を追加

    let id = focus.value.id.replace("selector", "");
    const node = nodes.value.find((node: any) => node.id == id)

    // 新しいボタンを作成
    const plusChildButton: any = document.createElement("button");
    const deleteButton: any = document.createElement("button");
    const moveButton: any = document.createElement("button");
    const plusSiblingButton: any = document.createElement("button");

    if (id == "") {
      id = "title"
      plusChildButton.className = "plus-button-right";
      deleteButton.className = "plus-button-right";
    } else {
      if (node.direction == "right") {
        plusChildButton.className = "plus-button-right";
        deleteButton.className = "plus-button-right";
      } else {
        plusChildButton.className = "plus-button-left";
        deleteButton.className = "plus-button-left";
      }

    }

    // ボタンをラップ要素に追加
    wrapper.appendChild(createButton(plusChildButton, plusSvg, "plus-button"));
    wrapper.appendChild(createButton(plusSiblingButton, plusSvg, "plus-sibling-button"));

    if (id != "title") {
      wrapper.appendChild(createButton(moveButton, moveSvg, "move-button"));
      wrapper.appendChild(createButton(deleteButton, trashSvg, "delete-button"));
    }

    // ボタンクリック時の動作を設定
    plusChildButton.addEventListener("click", () => {
      createChildNode()
    });

    deleteButton.addEventListener("click", () => {
      onDeleteNode()
    });

    moveButton.addEventListener("mousedown", (e: MouseEvent) => {
      onMoveNode(e)
    });

    plusButton.value = wrapper;
  }
};

const focus_node = () => {
  if (focus.value) {
    focus.value.focus();
  }
};

const move_focus = (e: any) => {
  if (e.keyCode === 9) { // Tab key code
    let currentFocus = focus.value;
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
    const editableNode = focus.value.querySelector('.c_nodes, .p_nodes, .title_nodes');
    if (editableNode) {
      if (!isEditing.value) {
        editableNode.focus();
        const range = document.createRange();
        const selection: any = window.getSelection();
        range.selectNodeContents(editableNode); // 要素内のすべての内容を選択
        range.collapse(false); // 範囲を折りたたんで一番後ろにカーソルを移動
        selection.removeAllRanges(); // 既存の選択範囲をクリア
        selection.addRange(range); // 新しい範囲を追加
        isEditing.value = true;
      } else {
        isEditing.value = false;
        editableNode.blur();
        focus.value.focus()
      }
    }
  }
};

const move_focus_in_direction = (direction: any) => {
  let currentFocus = focus.value;
  let nextFocus: any = null;

  const activeEditable: any = document.activeElement;
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

  if (nextFocus && nextFocus.classList.contains('selector')) {
    let rapNodeChild = nextFocus.querySelector('.rap_node');
    let selector = rapNodeChild ? rapNodeChild.querySelector('.selector') : null;

    if (rapNodeChild == null) {
      rapNodeChild = nextFocus.querySelector('.rap_node_left');
      selector = rapNodeChild ? rapNodeChild.querySelector('.selector') : null;
    }

    if (selector) {
      const focusedElement = selector.querySelector('[id*="selector"]');
      if (focusedElement) {
        // 正しい要素にフォーカスを当てる
        focusedElement.focus();
        update_focus({ srcElement: focusedElement });
      } else {
        selector.focus();
        update_focus({ srcElement: selector });
      }
    } else {
      nextFocus.focus();
      update_focus({ srcElement: nextFocus });
    }
  }
};

const createChildNode = () => {
  if (!focus.value) return;

  let parentNodeId = focus.value.id.replace("selector", "");
  let paredentNode = null

  if (parentNodeId == "") {
    parentNodeId = "title"
    paredentNode = "title"
  } else {
    paredentNode = nodes.value.find((node: any) => node.id == parentNodeId)
  }

  // 新しいノードの情報を生成
  const newNode = {
    id: nodes.value[nodes.value.length - 1].id + 1,
    text: nodes.value.length + 1, // デフォルトテキスト
    parent: parentNodeId, // 親ノード
    direction: paredentNode.direction,
  };
  nodes.value.push(newNode);

  createNewNode(newNode)

  // フォーカスしたあとisEditingをtrueにする
  update_focus({ srcElement: document.getElementById("selector" + newNode.id) });
  focus_node();
  const newFocus: any = document.getElementById("node" + newNode.id)
  newFocus.focus();

  isEditing.value = true

  onLineReset()
};

const createNewNode = (el: any) => {
  const right: any = document.getElementById('right_center');
  const left: any = document.getElementById('left_center');

  const el_edge: any = document.getElementById('edge');
  const node_text: any = document.createElement('div');
  const node_selector: any = document.createElement('div');
  node_selector.classList.add('selector');
  node_selector.id = `selector${el.id}`;
  node_selector.tabIndex = '0';

  const rap_node = document.createElement('div');
  rap_node.id = `rap-node${el.id}`;
  const node_childes = document.createElement('div');
  const text = document.createTextNode(el.text);
  node_text.contentEditable = true;

  node_childes.id = `${el.id}`;
  node_text.id = `node${el.id}`;
  node_text.appendChild(text);

  if (el.parent === 'title') {
    if (count.value % 2 === 0) {
      const nodeFromParent = makeFromParent(node_text, rap_node, node_childes);

      rightAppend(nodeFromParent.rap_node, nodeFromParent.node_text, nodeFromParent.node_childes, node_selector);
      right.appendChild(nodeFromParent.rap_node);
      el.direction = 'right';
    } else {
      const nodeFromParent = makeFromParent(node_text, rap_node, node_childes);

      leftAppend(nodeFromParent.rap_node, nodeFromParent.node_text, nodeFromParent.node_childes, node_selector);
      left.appendChild(nodeFromParent.rap_node);
      node_childes.classList.add('margin-left');
      el.direction = 'left';
    }
    count.value++
  } else {
    makeFromChild(nodes.value, el, node_text, rap_node, node_childes, node_selector);
  }

  const el_node: any = document.getElementById(`node${el.id}`);
  const el_selector: any = document.getElementById(`selector${el.id}`);

  el_node.addEventListener('blur', () => {
    onLineReset()
  });

  el_selector.addEventListener('click', (e: any) => {
    update_focus(e);
  });

  el_selector.addEventListener('dblclick', (e: any) => {
    inputNode(e.srcElement.id.substr(8));
  });

  el_selector.addEventListener('keydown', (e: any) => {
    if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
      inputNode(e.srcElement.id.substr(8));
    }
    move_focus(e); // Call move_focus to handle Tab key navigation and Arrow keys
  });

  el_node.addEventListener('focus', () => {
    el_edge.removeEventListener('scroll', focus_node);
  });

  el_node.addEventListener('blur', () => {
    el_edge.addEventListener('scroll', focus_node);
  });
}

const onDeleteNode = () => {
  let id = Number(focus.value.id.replace("selector", ""))
  const result = deleteNodes(nodes.value, id, count.value)
  nodes.value = result.nodes
  count.value = result.count
  onLineReset()
}

const onMoveNode = (e: any) => {
  e.preventDefault(); // 不要な選択やスクロールを防ぐ
  let id = Number(focus.value.id.replace("selector", ""))
  const el = document.getElementById(`rap-node${id}`)
  if (!el) return;
  controlDragZoom.value = false;
  let isDragging = false;

  const initialLeft = el.offsetLeft;
  let initialTop = el.offsetTop;
  if (el.offsetTop == 0) {
    initialTop = initialTop - el.offsetHeight / 2;
  }

  console.log(initialTop)
  el.style.position = "absolute";
  onLineReset()

  const startX = e.clientX;
  const startY = e.clientY;
  let offsetX = 0;
  let offsetY = 0;

  const onMouseMove = (moveEvent: MouseEvent) => {
    const offset = mouseMove(isDragging, moveEvent, el!, initialLeft, initialTop, startX, startY, scale.value);
    if (offset) {
      offsetX = offset.offsetX;
      offsetY = offset.offsetY;
    }
  };

  const onMouseUp = (moveEvent: MouseEvent) => {
    const dropEl: any = checkDropZone(moveEvent.clientX, moveEvent.clientY, el, Array.from(document.querySelectorAll(".p_nodes, .c_nodes")));
    if (dropEl) {
      dropEl.classList.remove("highlight");
      let id = Number(focus.value.id.replace("selector", ""))
      const result = deleteNodes(nodes.value, id, count.value)
      nodes.value = result.nodes
      count.value = result.count
    } else {
      el.style.position = "static";
    }

    isDragging = false;
    document.removeEventListener("mousemove", (moveEvent) => {
      const offset: any = mouseMove(isDragging, moveEvent, el!, initialLeft, initialTop, startX, startY);
      offsetX = offset.offsetX
      offsetY = offset.offsetY
    });
    document.removeEventListener("mouseup", onMouseUp);
    controlDragZoom.value = true;

    onLineReset()
  };

  // イベント登録
  isDragging = true;

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

onMounted(() => {
  const el_title: any = document.getElementById('title');
  const el_edge: any = document.getElementById('edge');
  const el_title_selector: any = document.getElementById('selector');

  nodes.value.forEach(createNewNode)

  lines.value = makelines(LeaderLine, nodes.value, scale.value);

  el_title_selector.addEventListener('keydown', (e: any) => {
    if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
      inputTitle();
    }
  });

  el_edge.addEventListener('scroll', focus_node);

  el_title.addEventListener('focus', () => {
    el_edge.removeEventListener('scroll', focus_node);
  });

  el_title.addEventListener('blur', () => {
    el_edge.addEventListener('scroll', focus_node);
  });
  el_title.scrollIntoView({ block: 'center', inline: 'center' });

  const el_field: any = document.getElementById('field');
  el_field.addEventListener('wheel', (event: any) => {
    event.preventDefault();

    const zoomSpeed = 0.1;
    let newScale = scale.value;

    if (event.deltaY < 0) {
      newScale *= 1 + zoomSpeed; // ズームイン
    } else {
      newScale *= 1 - zoomSpeed; // ズームアウト
    }

    newScale = Math.max(0.4, Math.min(newScale, 3)); // ズーム範囲制限

    scale.value = newScale;

    console.log("new point")
  });
});
</script>

<style>
.edge {
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background-color: #F5F5F5;
  /* border: 1px solid #000; */

  .wrapper {
    position: relative;
    width: 2000px;
    height: 2000px;
    margin: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .field {
    position: relative;
    width: 2000px;
    height: 2000px;
    z-index: 1;
    display: flex;
  }

  #svg-lines {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 0;
  }
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

  .right_vertical {
    width: 100%;
    /* background-color: olive; */
    margin: 0 auto;
    display: flex;
    justify-content: flex-start;

    .right_horizontal {
      width: fit-content;
      /* background-color: orchid; */
    }
  }
}

.left {
  width: 45%;
  height: 100%;
  display: flex;
  align-items: center;

  .left_vertical {
    width: 100%;
    margin: 0 auto;
    text-align: left;
    display: flex;
    justify-content: flex-end;
    /* background-color: olive; */

    .left_horizontal {
      width: fit-content;
      /* background-color: orchid; */
    }
  }
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
  /* margin-left: auto; */
}

.margin-left-cnodes {
  margin-left: auto;
}

.rap_node {
  display: flex;
  align-items: center;
  /* width: 100%; */
}

.rap_node_left {
  display: flex;
  align-items: center;
  padding: 10px 0px;
  width: 100%;
  justify-content: flex-start;
  flex-direction: row-reverse;
}

.margin-left {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: auto;
  margin-right: 0;
}

.selector_focus {
  border: 4px solid #00aaff;
  border-radius: 10px;
}

.plus-button-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  width: 100%;
  height: 100%;
  display: block;
  /* 要素が表示されている状態にします */
  pointer-events: none;
  /* クリックイベントを無効にする */
}

.plus-button {
  position: relative;
  top: calc(50% - 15px);
  /* left: calc(100% + 10px); */
  font-size: 24px;
  background-color: #00aaff;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  z-index: 30;
  pointer-events: auto;
}

.plus-button-right {
  left: calc(100% + 10px);
}

.plus-button-left {
  left: calc(0% - 40px);
}

.delete-button {
  position: relative;
  top: calc(100% - 79.6px);
  font-size: 24px;
  background-color: #c61e29;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  z-index: 30;
  pointer-events: auto;
}

.plus-sibling-button {
  position: relative;
  top: calc(100% - 20px);
  left: calc(50% - 15px);
  font-size: 24px;
  background-color: #00aaff;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  z-index: 30;
  pointer-events: auto;
}

.move-button {
  position: relative;
  top: calc(0% - 100px);
  left: calc(50% - 15px);
  font-size: 24px;
  background-color: #00aaff;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  z-index: 30;
  pointer-events: auto;
}

.highlight {
  background: lightblue;
  border-color: blue;
}
</style>