let input;
const symbols = ["|", "cm", "=", ";", "∥", "⊥", "∢", "∈", "↔", "↦", "∩", "∪", "△", "◻", "⬠"];
let lineNumbers;

// Line numbers inspired by https://webtips.dev/add-line-numbers-to-html-textarea

function init() {
    let buttons = document.getElementById("keyboard");
    lineNumbers = document.querySelector(".line-numbers");
    lineNumbers.innerHTML = "<span></span>";

    for (let i = 0; i < symbols.length+2; i++) {
        let button = document.createElement("button");
        button.innerText = symbols.concat("(", ")")[i];
        button.addEventListener("click", addSymbol);
        buttons.appendChild(button);
    }

    input = document.getElementById("input");
    input.addEventListener("keyup", e => updateLineNumbers(e));
}

function addSymbol(e) {
    let index = input.selectionStart;

    input.value = input.value.slice(0, index) + 
                  e.target.innerText + 
                  input.value.slice(input.selectionEnd, input.value.length);
    input.focus();
    input.selectionStart = input.selectionEnd = index+e.target.innerText.length;
}

function updateLineNumbers(e) {
    let numberOfLines = e.target.value.split('\n').length;
    // if (e.target.value[e.target.value.length-1] == "\n") numberOfLines++;

    lineNumbers.innerHTML = Array(numberOfLines)
      .fill('<span></span>')
      .join('')
}