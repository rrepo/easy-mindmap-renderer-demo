<template>
    <div id="edge" v-dragscroll="controlDragZoom" class="edge">

        <div class="op-area">
            <button class="op-btn" @click="zoomIn">+</button>
            <button class="op-btn" @click="zoomOut">-</button>
        </div>

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
                        <div id="selector" class="selector" tabindex="0" @click="updateFocus" @dblclick="inputTitle"
                            @keydown="moveFocus">
                            <div id=0 class="title_nodes" contenteditable="true" @blur="onLineReset">
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
// safe
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

const title: any = ref(props.node_props[0]?.text);
const nodes: any = ref(props.node_props);
const lines: any = ref([]);
let count = ref(0);
const focus: any = ref(null);
const isEditing: any = ref()
isEditing.value = false
const plusButton: any = ref(true)
const controlDragZoom: any = ref(true)
const nodesNum: any = ref(0)
nodesNum.value = nodes.value.length

const scale = ref(0.6);
const minScale = 0.3;
const maxScale = 2;
const scaleStep = 0.5;

const zoomIn = () => {
    if (scale.value < maxScale) {
        scale.value += scaleStep;
    }
};

const zoomOut = () => {
    if (scale.value > minScale + scaleStep) {
        scale.value -= scaleStep;
    } else {
        scale.value = minScale; // 最小値に制限
    }
};

const onLineReset = () => {
    lines.value = LineReset(lines.value, nodes.value, scale.value);
};

const updateFocus = (e: any) => {
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
            id = 0
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


        if (id != 0) {
            wrapper.appendChild(createButton(plusSiblingButton, plusSvg, "plus-sibling-button"));
            wrapper.appendChild(createButton(moveButton, moveSvg, "move-button"));
            wrapper.appendChild(createButton(deleteButton, trashSvg, "delete-button"));
        }

        // ボタンクリック時の動作を設定
        plusChildButton.addEventListener("click", () => {
            addNode("child");
        });

        plusSiblingButton.addEventListener("click", () => {
            addNode("sibling");
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

const focusNode = () => {
    if (focus.value) {
        focus.value.focus();
    }
};

const moveFocus = (e: any) => {
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
            updateFocus({ srcElement: nextFocus });
        }
        e.preventDefault();
    } else if (e.keyCode === 37) { // Arrow Left
        moveFocusInDirection('left');
    } else if (e.keyCode === 38) { // Arrow Up
        moveFocusInDirection('up');
    } else if (e.keyCode === 39) { // Arrow Right
        moveFocusInDirection('right');
    } else if (e.keyCode === 40) { // Arrow Down
        moveFocusInDirection('down');
    }
};

const moveFocusInDirection = (direction: any) => {
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
                updateFocus({ srcElement: focusedElement });
            } else {
                selector.focus();
                updateFocus({ srcElement: selector });
            }
        } else {
            nextFocus.focus();
            updateFocus({ srcElement: nextFocus });
        }
    }
};

// ノード追加のロジックを分離
const addNode = (mode: "child" | "sibling") => {
    if (!focus.value) return;

    const nodeConfig = calculateNodeConfig(mode);
    if (!nodeConfig) return;

    const newNode = createNewNode(nodeConfig);
    addNodeToList(newNode);
    focusNewNode(newNode.id);
};

// ノード設定の計算を独立した関数に
const calculateNodeConfig = (mode: "child" | "sibling") => {
    const currentNodeId = focus.value.id.replace("selector", "");
    const currentNode = nodes.value.find((node: any) => node.id == currentNodeId);

    if (!currentNode && mode === "sibling") return null;

    let parentNodeId: number | undefined;
    let direction: string | undefined;

    if (mode === "child") {
        parentNodeId = currentNodeId === "" ? 0 : Number(currentNodeId);
        direction = currentNodeId === "" ? "right" : currentNode?.direction;
    } else {
        parentNodeId = currentNode.parent;
        direction = currentNode.direction;
    }

    if (parentNodeId === undefined || parentNodeId === null || !direction) {
        return null;
    }

    return { parentNodeId, direction };
};

// 新規ノードの作成
const createNewNode = ({ parentNodeId, direction }: { parentNodeId: number; direction: string }) => {
    nodesNum.value++;
    return {
        id: nodesNum.value,
        text: String(nodesNum.value),
        parent: parentNodeId,
        direction: direction,
    };
};

// ノードをリストに追加してレンダリング
const addNodeToList = (newNode: any) => {
    nodes.value.push(newNode);
    renderNode(newNode);
    onLineReset();
};

// 新規ノードにフォーカス
const focusNewNode = (nodeId: number) => {
    const selectorElement = document.getElementById(`selector${nodeId}`);
    updateFocus({ srcElement: selectorElement });
    focusNode();

    const nodeElement = document.getElementById(`node${nodeId}`) as HTMLElement;
    nodeElement?.focus();
    isEditing.value = true;
};

// レンダリングロジックを整理
const renderNode = (el: any) => {
    if (el.parent === null) return;

    const { nodeElements, containers } = createNodeElements(el);
    attachNodeToDOM(el, nodeElements, containers);
    attachEventListeners(el.id, nodeElements);
};

// DOM要素の作成を一箇所に
const createNodeElements = (el: any) => {
    const node_text = document.createElement('div');
    const node_selector = document.createElement('div');
    const rap_node = document.createElement('div');
    const node_childes = document.createElement('div');

    node_selector.classList.add('selector');
    node_selector.id = `selector${el.id}`;
    node_selector.tabIndex = 0;

    rap_node.id = `rap-node${el.id}`;
    node_childes.id = `${el.id}`;
    node_text.id = `node${el.id}`;
    node_text.contentEditable = 'true';
    node_text.textContent = el.text;

    return {
        nodeElements: { node_text, node_selector, rap_node, node_childes },
        containers: {
            right: document.getElementById('right_center'),
            left: document.getElementById('left_center')
        }
    };
};

// DOMへの追加ロジックを分離
const attachNodeToDOM = (el: any, nodeElements: any, containers: any) => {
    const { node_text, node_selector, rap_node, node_childes } = nodeElements;

    if (el.parent === 0) {
        const isRight = count.value % 2 === 0;
        const nodeFromParent = makeFromParent(node_text, rap_node, node_childes);

        if (isRight) {
            rightAppend(nodeFromParent.rap_node, nodeFromParent.node_text, nodeFromParent.node_childes, node_selector);
            containers.right.appendChild(nodeFromParent.rap_node);
            el.direction = 'right';
        } else {
            leftAppend(nodeFromParent.rap_node, nodeFromParent.node_text, nodeFromParent.node_childes, node_selector);
            containers.left.appendChild(nodeFromParent.rap_node);
            node_childes.classList.add('margin-left');
            el.direction = 'left';
        }
        count.value++;
    } else {
        makeFromChild(nodes.value, el, node_text, rap_node, node_childes, node_selector);
    }
};

// イベントリスナーの設定を独立した関数に
const attachEventListeners = (nodeId: number, nodeElements: any) => {
    const el_node = document.getElementById(`node${nodeId}`) as HTMLElement;
    const el_selector = document.getElementById(`selector${nodeId}`) as HTMLElement;
    const el_edge = document.getElementById('edge') as HTMLElement;

    if (!el_node || !el_selector) return;

    // blur イベント
    el_node.addEventListener('blur', onLineReset);

    // click イベント
    el_selector.addEventListener('click', updateFocus);

    // dblclick イベント
    el_selector.addEventListener('dblclick', handleDoubleClick);

    // keydown イベント
    el_selector.addEventListener('keydown', handleKeyDown);

    // focus/blur でスクロールイベントを制御
    el_node.addEventListener('focus', () => {
        el_edge.removeEventListener('scroll', focusNode);
    });

    el_node.addEventListener('blur', () => {
        el_edge.addEventListener('scroll', focusNode);
    });
};

// ダブルクリックハンドラー
const handleDoubleClick = (e: Event) => {
    const target = e.target as HTMLElement;
    const nodeId = extractNodeId(target.id);
    if (nodeId) {
        isEditing.value = inputNode(nodeId, isEditing.value);
    }
};

// キーボードハンドラー
const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    
    if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
        const nodeId = extractNodeId(target.id);
        if (nodeId) {
            isEditing.value = inputNode(nodeId, isEditing.value);
        }
    }
    moveFocus(e);
};

// IDから数値部分を抽出するヘルパー関数
const extractNodeId = (elementId: string): string | null => {
    if (elementId.includes('node')) {
        return elementId.replace('node', '');
    } else if (elementId.includes('selector')) {
        return elementId.replace('selector', '');
    }
    return null;
};

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
        const dropEl: any = checkDropZone(
            moveEvent.clientX,
            moveEvent.clientY,
            el,
        );

        if (dropEl) {
            dropEl.classList.remove("highlight");
            let id = Number(focus.value.id.replace("selector", ""))
            const result = deleteNodes(nodes.value, id, count.value)
            nodes.value = result.nodes
            let pId

            if (dropEl.id == 0) {
                pId = 0
                count.value++
            } else {
                pId = Number(dropEl.id.replace("node", ""))
            }

            const newNodes = result.removedNodes
            newNodes[0].parent = pId
            newNodes.forEach((node: any) => {
                node.direction = ""
                nodes.value.push(node)
                renderNode(node)
            });

        } else {
            el.style.position = "static";
        }

        isDragging = false;
        document.removeEventListener("mousemove", (moveEvent) => {
            const offset: any = mouseMove(isDragging, moveEvent, el!, initialLeft, initialTop, startX, startY, scale.value);
            offsetX = offset.offsetX
            offsetY = offset.offsetY
        });

        document.removeEventListener("mouseup", onMouseUp);
        controlDragZoom.value = true;

        onLineReset()
    };


    isDragging = true;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
};

onMounted(() => {
    const el_title: any = document.getElementById("0");
    const el_edge: any = document.getElementById('edge');
    const el_title_selector: any = document.getElementById('selector');

    nodes.value.forEach(renderNode)

    lines.value = makelines(nodes.value, scale.value);

    el_title_selector.addEventListener('keydown', (e: any) => {
        if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
            inputTitle();
        }
    });

    el_edge.addEventListener('scroll', focusNode);

    el_title.addEventListener('focus', () => {
        el_edge.removeEventListener('scroll', focusNode);
    });

    el_title.addEventListener('blur', () => {
        el_edge.addEventListener('scroll', focusNode);
    });
    el_title.scrollIntoView({ block: 'center', inline: 'center' });
});
</script>

<style>
.edge {
    width: 100vw;
    height: 100vh;
    overflow: auto;
    background-color: #F5F5F5;
    /* border: 1px solid #000; */

    .op-area {
        position: absolute;
        top: 7%;
        left: 10px;
        z-index: 10000;

        .op-btn {
            width: 30px;
            height: 30px;
            font-size: 23px;
            background-color: #00aaff;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            margin: 5px;
        }
    }

    .wrapper {
        position: relative;
        width: 5000px;
        height: 5000px;
        margin: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .field {
        position: relative;
        width: 5000px;
        height: 5000px;
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
    width: 5%;
    height: 100%;
    /* z-index: 1; */
    /* background-color: coral; */
}

.right {
    width: 47.5%;
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
    width: 47.5%;
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
    z-index: -1;
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