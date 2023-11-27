//    Colors inspired/copied from https://colorhunt.co/palette/219c90e9b824ee9322d83f31
const colorPalette = ["#000", "#219C90", "#E9B824", "#FB9200", "#0E9322", "#D83F31", "#B5C99A", "#862B0D", "#FFC95F"];
let elements = new Object;
let outlineNames = true;
let autoNamedPoints = 0;
let visiblePoints = 0;
const UN = undefined;
const lineWidth = .8;
let cmToPx = window.devicePixelRatio / 2.54*90;

String.prototype.isUpper = function () {
    return this.valueOf().toUpperCase() == this.valueOf();
}

String.prototype.isLower = function () {
    return this.valueOf().toLowerCase() == this.valueOf();
}

String.prototype.corresponds = function (_str) {
    if (this.valueOf().length != _str.length) return false;
    let corresponds = true;
    let mainStr = this.valueOf();
    
    for (let i = 0; i < mainStr.length; i++) {
        if (!(_str[i] == "X" || _str[i] == mainStr[i])) {
            corresponds = false;
            break;
        }
    }

    return corresponds;
}

// String.prototype.removeSpacing = function () {
//     for (let i = this.length; i > -1; i--) {
//         if (this.valueOf()[i] == ' ') {
//             this.splice(i, 1);
//         }
//     }
// }

function setup() {
    makeCanvas(600, 600);
    cnv.style.border = "#000 solid 1.5px"
    clearCanvas();

    ctx.lineWidth = lineWidth;
    document.getElementById("input").value = "AB; |AB| = 5cm";

    document.getElementById("run").addEventListener("click", function(e) {
        run(document.getElementById("input").value);
    });
    document.getElementById("run").click();
    // run("");
}

function run(input) {
    elements = {
        lines: new Array,
        circles: new Array,
        angles: new Array,
        polygons: new Array,
        points: new Array,
    };
    clearCanvas();
    autoNamedPoints = 0;

    input.split("\n").forEach(function(step) {
        step = step.replaceAll(" ", "");
        let obj = step.slice(0, step.indexOf(";"));
        let def = step.slice(step.indexOf(";")+1, step.length);
        console.log(def);
        switch (obj.length) {
            case 0:
                alert("ERROR, zkontrolujte prosím zápis");
                break;
            case 1:
                
                break;
            case 2:
                if (obj.isUpper()) {
                    // Definice dvou bodu
                    if (def.slice(0, 5) == "|" + obj + "|=" || def.slice(0, 5) == "|" + obj[1]+obj[0] + "|=") {
                        // Definice dvou bodu vzdalenosti
                        let halfDist = Number(def.slice(5, def.length-2))*cmToPx / 2;
                        new Point(w*.5 - halfDist, h*.5, obj[0]);
                        new Point(w*.5 + halfDist, h*.5, obj[1]);
                        new Line(SEBN(obj[0])[1], SEBN(obj[1])[1], 2);
                    }
                }
                break;
        }
    });

    showAll();
}

function showAll() {
    for (const elementClass of Object.values(elements)) {
        for (const e of elementClass) {
            e.show();
        }
    }
}

function makePentagon() {
    elements = {
        lines: new Array,
        circles: new Array,
        angles: new Array,
        polygons: new Array,
        points: new Array,
    };
    new Point(w/2, h/2, "S");
    new Point(w/2+150, h/2+30);
    new Line(0, 1, 0);
    let r = pointDist(0, 1);
    new Circle(0, r);
    new Circle(1, r);
    elements.circles[1].visible = false;
    // let ints = findCircleCircleIntersects(0, 1);
    let mid = middlePoint(elements.points[0], elements.points[1]);
    new Point(mid.x, mid.y);
    let pp = findPerpendicularPoint(0, 0);
    new Point(pp.x, pp.y, undefined, false);
    new Line(0, 3, 0);
    pp = findCircleLineIntersects(0, 1);
    new Point(pp[0].x, pp[0].y);
    r = pointDist(2, 4);
    new Circle(2, r);
    pp = findCircleLineIntersects(2, 0);
    new Point(pp[0].x, pp[0].y, "H"); 
    r = pointDist(4, 5);
    new Circle(4, r);
    pp = findCircleCircleIntersects(0, 3);
    new Point(pp[0].x, pp[0].y);
    
    for (let i = 1; i < 4; i++) {
        if (i < 6) {
            new Circle(5+i, r);
            elements.circles[i+3].visible = false;
            let int = findCircleCircleIntersects(0, i+3)[0];
            new Point(int.x, int.y);
        }
    }
    new Polygon([4, 6, 7, 8, 9]);
}