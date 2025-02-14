<template>
  <div id="edge" v-dragscroll="true" class="edge">
    <div id="field" class="field">
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
            <div id="title" class="title_nodes" contenteditable="true" @blur="line_reset">
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

      <div id="line-wrapper" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
// import { dragscroll } from 'vue-dragscroll';

import { makelines, removeline, LineReset } from '@/composables/lineUtils';
import { rightAppend, leftAppend, makeFromParent, makeFromChild, focusNode } from '@/composables/nodeUtils';
import { inputTitle, inputNode } from '@/composables/nodeFuncUtils';

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

const line_reset = () => {
  lines.value = LineReset(LeaderLine, lines.value, nodes.value);
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
    focus.value.appendChild(wrapper); // focusの中にラップ要素を追加

    // 新しいボタンを作成
    const button = document.createElement("button");
    button.textContent = "✚";
    button.className = "plus-button";
    button.style.position = "relative"; // ボタンをラップ内で相対位置に配置

    // ボタンをラップ要素に追加
    wrapper.appendChild(button);

    // ボタンクリック時の動作を設定
    button.addEventListener("click", () => {
      createChildNode()
    });

    // 新しいラップ要素を保存
    plusButton.value = wrapper;
    // focus.value = selector
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
  if (parentNodeId == "") {
    parentNodeId = "title"
  }

  const paredentNode = nodes.value.find((node: any) => node.id == parentNodeId)

  // 新しいノードの情報を生成
  const newNode = {
    id: nodes.value.length + 1, // 新しいID
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

  lines.value = LineReset(LeaderLine, lines.value, nodes.value)
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
  const node_childes = document.createElement('div');
  const text = document.createTextNode(el.text);
  node_text.contentEditable = true;

  node_childes.id = `${el.id}`;
  node_text.id = `node${el.id}`;
  node_text.appendChild(text);

  if (el.parent === 'title') {
    if (count.value % 2 === 0) {
      const nodeFromParent = makeFromParent(node_text, rap_node, node_childes);
      count.value++

      rightAppend(nodeFromParent.rap_node, nodeFromParent.node_text, nodeFromParent.node_childes, node_selector);
      right.appendChild(nodeFromParent.rap_node);
      el.direction = 'right';
    } else {
      const nodeFromParent = makeFromParent(node_text, rap_node, node_childes);
      count.value++

      leftAppend(nodeFromParent.rap_node, nodeFromParent.node_text, nodeFromParent.node_childes, node_selector);
      left.appendChild(nodeFromParent.rap_node);
      node_childes.classList.add('margin-left');
      el.direction = 'left';
    }
  } else {
    makeFromChild(nodes.value, el, node_text, rap_node, node_childes, node_selector);
  }

  const el_node: any = document.getElementById(`node${el.id}`);
  const el_selector: any = document.getElementById(`selector${el.id}`);

  el_node.addEventListener('blur', () => {
    lines.value = LineReset(LeaderLine, lines.value, nodes.value)
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

onMounted(() => {
  const el_title: any = document.getElementById('title');
  const el_edge: any = document.getElementById('edge');
  const el_title_selector: any = document.getElementById('selector');

  el_title.scrollIntoView({ block: 'center', inline: 'center' });

  nodes.value.forEach(createNewNode)

  lines.value = makelines(LeaderLine, nodes.value);

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

  let scale = 1;

  el_edge.addEventListener('wheel', (event: any) => {
    event.preventDefault(); // デフォルトのスクロールを無効化
    const zoomSpeed = 0.1;  // ズーム速度調整
    if (event.deltaY < 0) {
      scale *= 1 + zoomSpeed; // ズームイン
    } else {
      scale *= 1 - zoomSpeed; // ズームアウト
    }
    scale = Math.max(0.5, Math.min(scale, 3)); // 拡大縮小の範囲を制限
    el_edge.style.transform = `scale(${scale})`;
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
  /* width: 100%;
  height: 100vh; */
  width: 300vw;
  height: 300vh;
  overflow: auto;
  background-color: #F5F5F5;
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
  width: 100%;
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
  left: calc(100% + 10px);
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

.plus-button::before {
  content: '';
  position: absolute;
  /* width: 35px; */
  /* height: 6px; */
  background-color: #00aaff;

  top: 45%;
  left: -30px;
  z-index: -100;
}
</style>