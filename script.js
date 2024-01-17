//    Colors inspired/copied from https://colorhunt.co/palette/219c90e9b824ee9322d83f31
const colorPalette = ["#000", "#219C90", "#E9B824", "#FB9200", "#0E9322", "#D83F31", "#B5C99A", "#862B0D", "#5c3e8c"];
let elements = new Object;
let outlineNames = true;
let autoNamedPoints = 0;
let visiblePoints = 0;
const UN = undefined;
const lineWidth = .8;
let cmToPx = 30;
let totalSteps;
let printLastStep = true;

String.prototype.isUpper = function () {
    return this.valueOf().toUpperCase() == this.valueOf();
}

String.prototype.isLower = function () {
    return this.valueOf().toLowerCase() == this.valueOf();
}

function setup() {
    makeCanvas(600, 600);
    cnv.style.border = "#000 solid 1.5px"
    clearCanvas();

    ctx.lineWidth = lineWidth;
    setInput();

    document.getElementById("run").addEventListener("click", function(e) {
        constructedSteps = totalSteps;
        run();
    });
    updateLineNumbers({target: input});

    document.getElementById("run").click();
}

function run() {
    elements = {
        lines: new Array,
        circles: new Array,
        // angles: new Array,
        polygons: new Array,
        points: new Array,
    };

    clearCanvas();
    autoNamedPoints = 0;
    visiblePoints = 0;

    let postup = input.value.split("\n");
    for (var i = 0; i < constructedSteps; i++) {
        constructStep(postup[i]);
    }

    showAll(postup[constructedSteps - 1]);
}

function showAll(txt) {
    for (const elementClass of Object.values(elements)) {
        for (const e of elementClass) {
            e.show();
        }
    }

    if (printLastStep && txt) {
        ctx.font = "30px Arial";
        setFillColor("#ffb5");
        rect(0, 0, 20 + ctx.measureText(txt).width, 50);

        setFillColor("#000");
        ctx.fillText(txt, 10, 35);
    }
}

function constructStep(step) {
    if (step.length == 0) return;

    step = step.replaceAll(" ", "");

    if (step.includes("mm")) {
        let i = step.indexOf("mm")-1;
        while (!isNaN(step[i]) || step[i] == "." || step[i] == ",") {
            i--;
        }
        i++;
        let mmValue = Number(step.slice(i, step.indexOf("mm")).replace(",", "."));
        let cmValue = mmValue/10;
        
        // step = step.replace(mmValue + "mm", cmValue + "cm");
        step = step.slice(0, i) + cmValue + "cm" 
        + step.slice(i + String(mmValue).length+2, step.length);
    }

    let obj;
    let def = UN;

    if (step.includes(";")) {
        obj = step.slice(0, step.indexOf(";"));
        def = step.slice(step.indexOf(";")+1, step.length);
        def.replaceAll("||", "∥");
    } else {
        obj = step;
    }
    let strObj = "" + obj;
    obj = getObjectNames(obj);

    // console.log("OBJECT:", obj, def); 
    // console.log(def);
    switch (obj.length) {
        case 0:
            alert("ERROR, zkontrolujte prosím zápis");
            return;
        case 1:
            obj = obj[0];
            if (obj[0].isUpper()) {
                // Definice bodu
                if (def == undefined) {
                    // Pomocný bod pro začátek
                    new Point(w/2, h/2, obj);
                    return;
                }
                if (def.includes("∈") && def.includes("∩")) {
                    // Prusečík
                    let invert = 0;
                    if (def.includes("-")) {
                        def = def.replace("-", "");
                        invert = 1;
                    }
                    def = def.slice(obj.length+1, def.length).split("∩");
                    let cords = findElementsIntersects(def[0], def[1]);
                    if (cords.length) {
                        cords = cords[invert];
                    }

                    new Point(cords.x, cords.y, obj);
                    return;
                }

                if (def.includes("∧") && !def.includes("∢")) {
                    // Střed úsečky
                    def = def.split("∧");
                    if (def[0].includes("∈")) def.push(def.shift())

                    if (def[0].split("=")[0].includes(obj) && def[0].split("=")[1].includes(obj)) {
                        let endPoints = getObjectNames(def[0].replaceAll(obj, ""));

                        let cords = middlePoint(SEBN(endPoints[0]), SEBN(endPoints[1]));
                        new Point(cords.x, cords.y, obj);
                    } else {
                        alert("ERROR, zkontrolujte prosím zápis");
                    }
                    return;
                }

                if (def.includes("∈")) {
                    // Bod na objektu
                    let objs = def.split("∈");
                    if (objs[0] == obj) {
                        let parentObject = SEBN(objs[1], true);
                        if (parentObject[0] == "circles") {
                            parentObject = vector(elements.points[elements.circles[parentObject[1]].center]);
                            new Point(parentObject.x + elements.circles[SEBN(objs[1])].r, parentObject.y, obj);
                        } else if (parentObject[1] == "lines") {
                            // let mid = middlePoint(parentObject[1]);
                            new Point(elements.circles[parentObject].x, elements.circles[parentObject].y, obj);
                        }
                    }
                }

                if (def.includes("∢")) {
                    let d = UN;
                    if (def.includes("∧")) {
                        def = def.split("∧");

                        if (def[0].includes("∢")) def.push(def.shift());
                        let defPoints = getObjectNames(def[0]);
                        if (def[0].includes(defPoints[1]) && def[0].includes(obj)) {
                            def[0] = def[0].split("=");
                            if (def[0][0].includes(obj)) def[0].push(def[0].shift());

                            def[0] = def[0][0];

                            if (def[0].includes("|")) {
                                let ps = getObjectNames(def[0]);
                                d = pointDist(SEBN(ps[0]), SEBN(ps[1]));
                            } else {
                                d = Number(def[0].slice(0, def[0].length-2)) * cmToPx;
                            }
                        } else {
                            alert("ERROR, zkontrolujte prosím zápis 0");
                            return;
                        }
                        
                        def = def[1];
                    }
                    
                    let defPoints = getObjectNames(def);
                    let pLength = getObjectNames(def.split("=")[0]).join("").length;
                    if (!(def.slice(0, 2) == "|∢" && def.slice(pLength+2, pLength+4) == "|=")/* || 
                    defPoints.indexOf(obj) % 2 != 0*/) {
                        alert("ERROR, zkontrolujte prosím zápis 0");
                        return;
                    }
    
                    let angle;
                    if (defPoints.length == 6) {
                        if (defPoints.slice(0, 3).includes(obj)) defPoints = defPoints.concat(defPoints.splice(0, 3));

                        if (defPoints[1] == defPoints[4] && defPoints.slice(0, 3).includes(obj) && defPoints.slice(3, 6).includes(obj)) {
                            let angles = [defPoints.slice(0, 3), defPoints.slice(3, 6)]
                            
                            if (angles[0].indexOf(obj) == 0) {
                                angles[0].unshift(angles[0].splice(2, 1)[0]);
                            }
                            if (angles[1].indexOf(obj) == 0) {
                                angles[1].unshift(angles[1].splice(2, 1)[0]);
                            }
                            angles[0].splice(angles[0].indexOf(obj), 1);
                            angles[1].splice(angles[1].indexOf(obj), 1);
                            
                            let cords = findAngleBisector(SEBN(angles[0][0]), SEBN(angles[0][1]), SEBN(angles[1][0]), d);
                            new Point(cords.x, cords.y, obj)
                            return;
                        } else if (defPoints.slice(3, 6).includes(obj) && true) { 
                            angle = getAngleBetweenPoints(SEBN(defPoints[0]), SEBN(defPoints[1]), SEBN(defPoints[2]));
                            defPoints[0] = SEBN(defPoints[defPoints[3] == obj ? 5 : 3]);
                            defPoints[1] = SEBN(defPoints[4]);
                            defPoints = defPoints.slice(0, 2);
                            
                            if (def.includes("-")) {
                                angle *= -1;
                            }

                        } else {
                            alert("ERROR, zkontrolujte prosím zápis 5");
                            return;
                        }
                    } else {
                        if (defPoints.indexOf(obj) == 0) {
                            defPoints.unshift(defPoints.splice(2, 1)[0]);
                        } else if (defPoints.indexOf(obj) != 2) {
                            alert("ERROR, zkontrolujte prosím zápis 0");
                            return;
                        };
                        defPoints.splice(defPoints.indexOf(obj), 1);
                        for (let i = 0; i < defPoints.length; i++) {
                            defPoints[i] = SEBN(defPoints[i]);
                        }
                        
                        if (defPoints.length == 2) {
                            angle = Number(def.slice(pLength+4, def.length-1).replace(",", ".")) / 180*Math.PI;
                        } else if (defPoints.length == 5) {
                            if (true) {
                                angle = getAngleBetweenPoints(defPoints[2], defPoints[3], defPoints[4]);
                            }
                        } else {
                            alert("ERROR, zkontrolujte prosím zápis 1");
                            return;
                        }
                    }
                    
                    let cords = findPointsUnderAngle(angle, defPoints[0], defPoints[1], d)[0];
                    new Point(cords.x, cords.y, obj);
                    return;
                }
            }
            if (obj[0].isLower()) {
                // Definice primky / kruznice
                if (def[0] == "↔") {
                    let endPoints = getObjectNames(def);
                    new Line(SEBN(endPoints[0]), SEBN(endPoints[1]), 0, obj);
                    return;
                }

                let cords;

                if (def.includes("∥")) {
                    def = def.split("∧");
                    if (def[0].includes("∥")) def.push(def.shift());
                    
                    if (def[0].includes("∈")) {
                        // Rovnobezka prochazejici bodem
                        def[0] = def[0].split("∈")[0];
                        def[1] = def[1].split("∥");
                        def[1] = def[1][(def[1].indexOf(obj) + 1) % 2];

                        cords = findParallelLine(SEBN(def[1]), SEBN(def[0]));

                        new Point(cords.x, cords.y, UN, false);
                        new Line(SEBN(def[0]), elements.points.length-1, 0, obj);
                    } else if (def[0].includes("|")) {
                        def[1] = getLineNames(def[1]);
                        let baseLine = def[1][(def[1].indexOf(obj) + 1) % 2];
                        
                        def[0] = def[0].split("=");
                        let ps = getLineNames(def[0][0]);

                        if (!(ps.includes(def[1][0]) && ps.includes(def[1][1]))) {
                            alert("ERROR, zkontrolujte prosím zápis");
                            return;
                        }

                        let d;
                        if (def[0][1][0] == def[0][1][def[0][1].length-1] && def[0][1][0] == "|") {
                            ps = getObjectNames(def[0][1]);
                            d =  pointDist(SEBN(ps[0]), SEBN(ps[1]));
                        } else {
                            d = Number(def[0][1].slice(0, def[0][1].length - 2).replace(",", "."))  * cmToPx;
                        }

                        cords = findParallelLineFromDistance(SEBN(baseLine), d);

                        new Point(cords.p1.x, cords.p1.y, UN, false);
                        new Point(cords.p2.x, cords.p2.y, UN, false);
                        new Line(elements.points.length-1, elements.points.length-2, 0, obj);
                    } else {
                        alert("ERROR, zkontrolujte prosím zápis");
                        return;
                    }


                    return;
                }
                
                if (def.includes("⊥")) {
                    // Kolmice prochazejici bodem
                    def = def.split("∧");
                    if (def[0].includes("⊥")) def.push(def.shift());
                    def[0] = def[0].split("∈")[0];
                    def[1] = def[1].split("⊥");
                    def[1] = def[1][(def[1].indexOf(obj) + 1) % 2];

                    let cords = findPerpendicularPoint(SEBN(def[1]), SEBN(def[0]));
                    new Point(cords.x, cords.y, UN, false);
                    new Line(SEBN(def[0]), elements.points.length-1, 0, obj);

                    return;
                }
                
                def = def.replaceAll(",", ";");
                if ((def.slice(0, obj.length+1) == obj + "(") && def[def.length-1] == ")") {
                    let radius;
                    let i = def.indexOf(";");
                    i += def.includes("r=") ? 2:0;
                    let endI = def.length-2;
                    
                    if (def.includes("|")) {
                        let ps = getObjectNames(def.slice(i, endI));
                        radius = pointDist(SEBN(ps[0]), SEBN(ps[1]));
                    } else {
                        radius = Number(def.slice(i+1, endI-1)) * cmToPx;
                    }

                    new Circle(SEBN(getObjectNames(def.slice(obj.length, i))[0]), radius, obj);
                }
            }
            return;
        case 2:

            if (obj[0][0].isUpper() && obj[1][0].isUpper()) {
                if (strObj[0] == "↦" || strObj[0] == "↔") {
                // Definice poloprimky / primky dvema body
                    if (def == undefined) {
                        new Line(SEBN(obj[0]), SEBN(obj[1]), (strObj[0] == "↦" ? 1:0), obj[0]+obj[1]);
                        return;
                    }
                }
                // Definice dvou bodu nebo usecky
                if (def == undefined) {
                    new Line(SEBN(obj[0]), SEBN(obj[1]), 2, obj.join(""));
                    return;
                }
                
                if (def.length == 0) {
                    new Line(SEBN(obj[0]), SEBN(obj[1]));
                    return
                }
                
                if (def.slice(0, 3 + strObj.length) == "|" + strObj + "|=" || def.slice(0, 3 + strObj.length) == "|" + obj[1]+obj[0] + "|=") {
                    // Definice dvou bodu vzdalenosti
                    let halfDist = Number(def.slice(3 + strObj.length, def.length-2).replace(",", "."))*cmToPx / 2;
                    new Point(w*.5 - halfDist, h*.5, obj[0]);
                    new Point(w*.5 + halfDist, h*.5, obj[1]);
                    new Line(SEBN(obj[0]), SEBN(obj[1]), 2);
                    return;
                }

                if (def.includes("⊆") && def.includes("∩")) {
                    // Pruseciky
                    def = def.replaceAll(";", ",");

                    if (def.slice(0, 3 + strObj.length) == "{" + obj[0] + "," + obj[1] + "}" || def.slice(0, 3 + strObj.length) == "{" + obj[1] + "," + obj[0] + "}") {
                        def = def.slice(strObj.length + 4, def.length).split("∩");
                        let cords = findElementsIntersects(def[0], def[1]);
        
                        new Point(cords[0].x, cords[0].y, obj[0]);
                        new Point(cords[1].x, cords[1].y, obj[1]);
                        return;
                    }
                }
            }
            break;
    }

    if (!def) {
        if ((strObj[0] == "△" && obj.length == 3) ||
            (strObj[0] == "◻" && obj.length == 4) ||
            (strObj[0] == "⬠" && obj.length > 2)) {
            for (let i = 0; i < obj.length; i++) {
                obj[i] = SEBN(obj[i]);
            }
            new Polygon(obj, elements.polygons.length+1);
            return;
        }
    }
    alert("ERROR, zkontrolujte prosím zápis (konec funkce)");
}

function getObjectNames(_str) {
    const regex = /[A-Za-z](_[A-Za-z0-9])?/g;
    return _str.match(regex) || [];
}

function getLineNames(_str) {
    const regex = /([a-z](_[A-Za-z0-9])?)|([A-Z](_[A-Za-z0-9])?[A-Z](_[A-Za-z0-9])?)/g;
    return _str.match(regex) || [];
}


function makePentagon() {
    elements = {
        lines: new Array,
        circles: new Array,
        // angles: new Array,
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

    clearCanvas();
    showAll();
}

