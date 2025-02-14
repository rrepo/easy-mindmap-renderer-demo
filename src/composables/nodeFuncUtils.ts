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

export const updateFocus = (e: any, focus: any, plusButton: any) => {
  // ボタンがクリックされて作動したときは終了するようにする
  if (e.srcElement.classList[0] != "selector") {
    return
  }

  if (focus !== null) {
    focus.classList.remove('selector_focus');
  }
  e.srcElement.classList.add('selector_focus');

  focus = e.srcElement;

  if (plusButton) {
    const existingWrapper = plusButton;
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
    focus.appendChild(wrapper); // focusの中にラップ要素を追加

    // 新しいボタンを作成
    const button = document.createElement("button");
    button.textContent = "✚";
    button.className = "plus-button";
    button.style.position = "relative"; // ボタンをラップ内で相対位置に配置

    // ボタンをラップ要素に追加
    wrapper.appendChild(button);

    // ボタンクリック時の動作を設定
    button.addEventListener("click", () => {
      // createChildNode()
    });

    // 新しいラップ要素を保存
    return { focus, wrapper };
  }
};

