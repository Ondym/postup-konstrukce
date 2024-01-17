let bgColor = "#fff";
let w,h;
let stroke = false;

function dist(x1, y1, x2, y2) {
  if (x2 == undefined || y2 == undefined) {
    return Math.sqrt(abs(x1.x - y1.x)**2 + abs(x1.y - y1.y)**2);
  }
    return Math.sqrt(abs(x1 - x2) * abs(x1 - x2) + abs(y1 - y2) * abs(y1 - y2));
 }

function print(_a,_b,_c,_d,_e,_f) {
  console.log(_a);
}
  
 function abs(num1) {
   return Math.abs(num1);
 }

 function min(num1, num2) {
   return Math.min(num1, num2);
 }

 function max(num1, num2) {
   return Math.max(num1, num2);
 }
 
 function vector(x, y) {
  if (y == undefined && typeof x == "object") {
    return {x: x.x, y: x.y};
  }
   return {x: x, y: y};
 }
 
 function random(min, max) {
   if (!max) {
     max = min;
     min = 0;
   }
   return Math.floor(Math.random() * (max - min) ) + min;
 }

function modifiedSign(num1) {
  return num1 < 0 ? -1 : 1;
}

 function circle(x, y, size, stroke) {
   stroke = stroke || false;
   ctx.beginPath();
   ctx.arc(x, y, size, 0 , 2 * Math.PI);
   if (stroke) {
     ctx.stroke();
   } else {
     ctx.fill();
   }
   ctx.closePath();
}

function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function rect(x1, y1, s1, s2, stroke) {
    ctx.beginPath();
    ctx.rect(x1, y1, s1, s2);
    if (stroke) {
        ctx.stroke();
    } else {
        ctx.fill();
    }
    ctx.closePath();
 }

function floor(num1) {
  return Math.floor(num1);
}

function clearCanvas() {
  let colOfFill = ctx.fillStyle;
  ctx.fillStyle = bgColor;
  rect(0, 0, w, h);
  ctx.fillStyle = colOfFill;

}

function setFillColor(_color) {
  ctx.fillStyle = _color;
}

function setStrokeColor(_color) {
  ctx.strokeStyle = _color;
}

function simpleLine(x1, y1, x2, y2) {
  if (y1 == undefined && typeof x1 == "object") {
    return {p1: vector(elements.points[x1.point1]), p2: vector(elements.points[x1.point2])};
  }
  return {p1: vector(x1, y1), p2: vector(x2, y2)};
}

let ctx;
let cnv;
function makeCanvas(_w, _h) {
  cnv = document.createElement("canvas");
  cnv.id = "canvas";
  cnv.height = _w;
  cnv.width = _h;
  ctx = cnv.getContext("2d");

  w = _w;
  h = _h;
  document.getElementById("canvas-container").appendChild(cnv);
}