let input;
// const symbols = ["=", "⊆", ";", "|", "↔", "↦", "∧", "∥", "⊥", "∢", "°", "∈", "∩", "△", "◻", "⬠"];
const symbols = ['=', '|', ';', '∧', '△', '◻', '⬠', '∈', '⊆', '∩', '↔', '↦', '∥', '⊥', '∢', '°'];
const shortcutSymbols = [-1, -1, -1, 'a', 't', 'c', 'n', 'e', 's', 'i', 'p', 'v', 'r', 'k', 'u', -1];
let lineNumbers;
let constructedSteps = 0;
let playInterval;
let playing;

// Line numbers inspired by https://webtips.dev/add-line-numbers-to-html-textarea

function init() {
    let buttons = document.getElementById("keyboard");
    lineNumbers = document.querySelector(".line-numbers");
    lineNumbers.innerHTML = "<span></span>";

    let checkboxes = document.getElementsByClassName("checkbox");
    checkboxes[0].checked = paperMode;
    checkboxes[1].checked = globalPointStyle == 2;
    checkboxes[2].checked = printLastStep;

    for (let i = 0; i < symbols.length+4; i++) {
        let button = document.createElement("button");
        button.innerText = symbols.concat("(", ")", "{", "}")[i];
        button.addEventListener("click", addSymbol);
        buttons.appendChild(button);
    }

    input = document.getElementById("input");
    input.addEventListener("keyup", () => updateLineNumbers());

    document.getElementById("cmToPx").addEventListener("input", function (e) {
        cmToPx = Number(e.target.value);
        run();
    });

    document.getElementById("step-back").addEventListener("click", function (e) {
        constructedSteps = max(constructedSteps-1, 0);
        run();
    });

    document.getElementById("step-front").addEventListener("click", function (e) {
        constructedSteps = min(constructedSteps+1, totalSteps);
        run();
    });

    let playButton = document.getElementById("play");
    playButton.addEventListener("click", function (e) {
        if (playing) {
            playing = false;
            clearInterval(playInterval);
            playButton.innerHTML = "►"
            return;
        }
        
        playButton.innerHTML = "<span class='pause-icon'></span>"
        constructedSteps = (constructedSteps+1) % totalSteps;
        run();
        playing = true;
        playInterval = setInterval(() => {
            constructedSteps = min(constructedSteps+1, totalSteps);
            run();
            if (constructedSteps == totalSteps) {
                playing = false;
                playButton.innerHTML = "►";
                clearInterval(playInterval);
            }
        }, 950);
    });

    input.addEventListener("keyup", () => {
        if (input.value.includes("/")) {
            let slashes = new Array;
            let cursor = input.selectionStart;
            let symbolsReplaced = 0;
            for (let i = 0; i < input.value.length-1; i++) {
                if (input.value[i] == "/") {
                    if (true) {
                        if (shortcutSymbols.includes(input.value[i+1])) {
                            symbolsReplaced++;
                            input.value = input.value.slice(0, i) + symbols[shortcutSymbols.indexOf(input.value[i+1])] +
                                          "ß" + input.value.slice(i+2, input.value.length);
                        }
                    }
                }
            }

            input.value = input.value.replaceAll("ß", "");
            input.selectionStart = input.selectionEnd = cursor - symbolsReplaced;
        }
    });

    let examples = document.getElementById("examples").getElementsByTagName("a");
    for (let i = 0; i < examples.length; i++) {
        examples[i].addEventListener("click", (e) => {
            e.preventDefault();

            input.value = e.target.parentElement.parentElement.getElementsByTagName("td")[2].innerText.replaceAll("  ", "");
            
            updateLineNumbers();
            constructedSteps = totalSteps;
            run();
        });
    }
}

function addSymbol(e) {
    let index = input.selectionStart;

    input.value = input.value.slice(0, index) + 
                  e.target.innerText + 
                  input.value.slice(input.selectionEnd, input.value.length);
    input.focus();
    input.selectionStart = input.selectionEnd = index+e.target.innerText.length;
}

function updateLineNumbers() {
    totalSteps = input.value.split('\n').length;

    lineNumbers.innerHTML = Array(totalSteps)
      .fill('<span></span>')
      .join('')
}