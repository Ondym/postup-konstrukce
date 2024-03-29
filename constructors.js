function findEdgesOfLine(p1, p2) {
    if (typeof p1 == 'number') p1 = vector(elements.points[p1]);
    if (typeof p2 == 'number') p2 = vector(elements.points[p2]);

    // In case of perfectly vertical lines
    if (p1.x == p2.x) {
        return [
            vector(p1.x, p1.y > p2.y ? h : 0),
            vector(p2.x, p1.y > p2.y ? 0 : h),
        ];
    }
    
    let ps = [p1, p2];
    let slope = (p2.y - p1.y) / (p2.x - p1.x);
    let ends = new Array;
    let constant = p1.y - p1.x*slope;

    for (let i = 0; i < 2; i++) {
        if (constant >= 0 && constant <= h && ps[i].x < ps[(i + 1)%2].x) {
            ends.push(vector(0, constant));
        } else if (-constant/slope >= 0 && -constant/slope <= w && ps[i].y < ps[(i + 1)%2].y) {
            ends.push(vector(-constant/slope, 0));
        } if ((h - constant) / slope >= 0 && (h - constant) / slope <= w && ps[i].y > ps[(i + 1)%2].y) {
            ends.push(vector((h - constant) / slope, h));
        } else if (constant + w*slope >= 0 && constant + w*slope <= h && ps[i].x > ps[(i + 1)%2].x) {
            ends.push(vector(w, constant + w*slope));
        } 
    }

    if (ends.length == 0) {
        ends = [vector(-5, -5), vector(-5, -5)];
    }
    return ends;
}

function findLineLineIntersects(lineIndex1, lineIndex2) {
    let line1 = simpleLine(elements.lines[lineIndex1]);
    let line2 = simpleLine(elements.lines[lineIndex2]);

    let slope1 = (line1.p2.y - line1.p1.y) / (line1.p2.x - line1.p1.x);
    let slope2 = (line2.p2.y - line2.p1.y) / (line2.p2.x - line2.p1.x);
    
    let constant1 = line1.p1.y - slope1 * line1.p1.x
    let constant2 = line2.p1.y - slope2 * line2.p1.x
    
    let ix = (constant2 - constant1) / (slope1 - slope2);
    // In case of perfectly vertical lines
    if (Number.isNaN(ix)) {
        ix = slope1 < slope2 ? line1.p1.x:line2.p1.x;
        constant1 = abs(slope1) > abs(slope2) ? constant2:constant1;
        slope1 = abs(slope1) > abs(slope2) ? slope2:slope1;
    }
    
    let retPoint = vector(ix, slope1 * ix + constant1);
    if (isPointInBounds(lineIndex1, retPoint) && isPointInBounds(lineIndex2, retPoint)) {
        return retPoint;
    }
    return vector(NaN, NaN);
}

function findCircleLineIntersects(circleIndex, lineIndex, lineIsAngleArm) {
    let inpLine;
    if (typeof lineIndex == 'number') inpLine = simpleLine(elements.lines[lineIndex]);
    else inpLine = lineIndex;
    
    let r;
    let midPoint;
    if (typeof circleIndex == 'number') {
        r = elements.circles[circleIndex].r;
        midPoint = vector(elements.points[elements.circles[circleIndex].center])
    } else {
        r = circleIndex.r;
        midPoint = circleIndex.center || circleIndex.midPoint;
    }

    // implementation from WolframMathWorld
    let dx = inpLine.p2.x - inpLine.p1.x;
    let dy = inpLine.p2.y - inpLine.p1.y;
    let dr = Math.sqrt(dx**2+dy**2);
    let D = (inpLine.p1.x - midPoint.x)*(inpLine.p2.y - midPoint.y) - (inpLine.p2.x - midPoint.x)*(inpLine.p1.y - midPoint.y);
    let Delta = r**2 * dr**2 - D**2;

    if (Delta < 0) return new Array;

    let intersections = new Array;
    for (let m = -1; m < 2; m += 2) {
        intersections.push(vector(
            (D*dy + m*modifiedSign(dy) * dx * Math.sqrt(Delta)) / dr**2 + midPoint.x,
            (-D*dx + m*abs(dy) * Math.sqrt(Delta)) / dr**2 + midPoint.y
        ));
    }

    // if (lineIsAngleArm) return arePointsInBounds(lineIndex, intersections, t);
    return arePointsInBounds(lineIndex, intersections, lineIsAngleArm);
}

function findLineCircleIntersects(lineIndex, circleIndex) {
    return findCircleLineIntersects(circleIndex, lineIndex);
}

function findCircleCircleIntersects(circleIndex1, circleIndex2) {
    let c0 = vector(elements.points[elements.circles[circleIndex1].center]);
    let c1 = vector(elements.points[elements.circles[circleIndex2].center]);
    let r0 = elements.circles[circleIndex1].r;
    let r1 = elements.circles[circleIndex2].r;
    let d = dist(c0.x, c0.y, c1.x, c1.y);
    let a = (r0**2 - r1**2 + d**2) / (2*d);
    let p2 = vector(c0.x + a*(c1.x - c0.x) / d, c0.y + a*(c1.y - c0.y) / d);
    let h1 = Math.sqrt(r0**2 - a**2);

    let intersections = new Array;
    for (let m = -1; m < 2; m += 2) {
        intersections.push(vector(
            p2.x + m*h1 * (c1.y - c0.y) / d,
            p2.y - m*h1 * (c1.x - c0.x) / d,
        ));
    }

    intersections.sort((a, b) => a.y-b.y)

    return intersections;
}

function middlePoint(p1, p2) {
    if (p2 == undefined) {
        // In case of parameterers being just 1 line segment
        if (typeof p1 == "object") {
            p2 = p1.p2;
            p1 = p1.p1;
        } else if (typeof p1 == "number") {
            return middlePoint(elements.lines[p1]);
        }
    } else {
        if (typeof p1 == 'number') p1 = vector(elements.points[p1]);
        if (typeof p2 == 'number') p2 = vector(elements.points[p2]);
    }

    return vector(
        .5*(p1.x + p2.x),
        .5*(p1.y + p2.y),
    );
}

function findNearestOnLineToPoint(_line, _point) {
    // In case of _line = line index
    if (typeof _line == "number") {
        _line = simpleLine(elements.lines[_line]);
    }
    // In case of point = point index
    if (typeof _point == "number") {
        _point = vector(elements.points[_point].x, elements.points[_point].y);
    }

    var atob = vector(_line.p2.x - _line.p1.x, _line.p2.y - _line.p1.y);
    var atop = vector(_point.x - _line.p1.x, _point.y - _line.p1.y);
    var len = atob.x **2 + atob.y **2;
    var dot = atop.x * atob.x + atop.y * atob.y;
    var t = dot/len;
    dot = ( _line.p2.x - _line.p1.x ) * ( _point.y - _line.p1.y ) - ( _line.p2.y - _line.p1.y ) * ( _point.x - _line.p1.x );
    return vector(_line.p1.x + atob.x * t,_line.p1.y + atob.y * t);
}

function findPerpendicularPoint(_line, _point) {
    // In case of _line = line index
    if (typeof _line == "number") {
        _line = simpleLine(elements.lines[_line]);
    }
    // In case of point = point index
    if (typeof _point == "number") {
        _point = vector(elements.points[_point].x, elements.points[_point].y);
    }
    let np = findNearestOnLineToPoint(_line, _point);

    if (dist(_point.x, _point.y, np.x, np.y) < .001) {
        
        let vectorized = vector(_line.p1.x - _line.p2.x, _line.p1.y - _line.p2.y);
        let len = Math.sqrt(vectorized.x**2 + vectorized.y**2);
        vectorized.x /= len;
        vectorized.y /= -len;
        
        return vector(
            _point.x + vectorized.y,
            _point.y + vectorized.x,
            );
    } else {
        return np;
    }
}

function pointDist(p1Index, p2Index) {
    let p1 = elements.points[p1Index];
    let p2 = elements.points[p2Index];
    return dist(p1.x, p1.y, p2.x, p2.y);
} 

function findParallelLine(lineIndex, pointIndex) {
    let defLine = simpleLine(elements.lines[lineIndex]);
    let defPoint = vector(elements.points[pointIndex]);
    let slope = findLineSlope(defLine);

    if (abs(slope) == Infinity) return vector(defPoint.x, defPoint.y+10);

    let const2 = defPoint.y - slope * defPoint.x;
    return vector(defPoint.x + 1, slope * (defPoint.x + 1) + const2);
}

function findParallelLineFromDistance(lineIndex, _d) {
    let _line = simpleLine(elements.lines[lineIndex]);
    let slope = findLineSlope(_line);
    let constant = _line.p1.y - slope * _line.p1.x;

    let constant2 = _d * Math.sqrt(slope**2 + 1) + constant;
    let outputLine = simpleLine(0,0,0,0);

    // console.log((lineIndex));
    outputLine.p1 = vector(_line.p1.x, slope * _line.p1.x + constant2);
    outputLine.p2 = vector(_line.p1.x + cmToPx, slope * (_line.p1.x + cmToPx) + constant2);

    return outputLine;
}

function findLineSlope(_line) {
    return (_line.p2.y - _line.p1.y) / (_line.p2.x - _line.p1.x);
}

function isPointInBounds(_lineIndex, _point, lineIsAngleArm) {
    let _line;
    
    let lineType = lineIsAngleArm ? 1 : elements.lines[_lineIndex].type;
    if (typeof _lineIndex == "number") {
        _line = simpleLine(elements.lines[_lineIndex]);
    } else {
        _line = _lineIndex;
    }
    if (typeof _point == "number") {
        _point = vector(elements.points[_point].x, elements.points[_point].y);
    }

    switch (lineType) {
        case 0:
            return true;
        case 1:
            let isDirectionPositiveX = _line.p2.x >= _line.p1.x;
            let isDirectionPositiveY = _line.p2.y >= _line.p1.y;

            let isInXDirection = isDirectionPositiveX ? _point.x >= _line.p1.x : _point.x <= _line.p1.x;
            let isInYDirection = isDirectionPositiveY ? _point.y >= _line.p1.y : _point.y <= _line.p1.y;
        
            return isInXDirection && isInYDirection;
        case 2:
            let TLCorner = vector(min(_line.p1.x, _line.p2.x), min(_line.p1.y, _line.p2.y));
            let BRCorner = vector(max(_line.p1.x, _line.p2.x), max(_line.p1.y, _line.p2.y));
            
            return _point.x > TLCorner.x && _point.x < BRCorner.x && _point.y > TLCorner.y  && _point.y < BRCorner.y;
        default:
            return;
    }
}

function arePointsInBounds(_lineIndex, _points, lineIsAngleArm) {
    for (let i = _points.length - 1; i > -1; i--) {
        if (!isPointInBounds(_lineIndex, _points[i], lineIsAngleArm)) {
            // dispose.push(i);
            _points.splice(i, 1);
        }
    }
    
    return _points;
}

function getAngleBetweenPoints(p1, p2, p3) {
    if (typeof p1 == 'number') p1 = vector(elements.points[p1]);
    if (typeof p2 == 'number') p2 = vector(elements.points[p2]);
    if (typeof p3 == 'number') p3 = vector(elements.points[p3]);

    let a = dist(p2, p3);
    let b = dist(p1, p3);
    let c = dist(p1, p2);
 
    return angle = Math.acos((a**2 + c**2 - b**2) / (2 * a * c));
}

function findPointsUnderAngle(angle, p1, p2, _d) {
    if (typeof p1 == 'number') p1 = vector(elements.points[p1]);
    if (typeof p2 == 'number') p2 = vector(elements.points[p2]);
    if (_d == undefined) _d = cmToPx * 2;

    let startingAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x) - Math.PI;

    let  retPoints = new Array;

    for (let m = 1; m > -2; m -= 2) {
        retPoints.push(vector(
            p2.x + _d * Math.cos(m*angle + startingAngle),
            p2.y + _d * Math.sin(m*angle + startingAngle),
        ));
    }

    return retPoints;
}

function findAngleBisector(p1, p2, p3, _d) {
    if (typeof p1 == 'number') p1 = vector(elements.points[p1]);
    if (typeof p2 == 'number') p2 = vector(elements.points[p2]);
    if (typeof p3 == 'number') p3 = vector(elements.points[p3]);
/*
    let baseAngle = min(
        getAngleBetweenPoints(p2, vector(p2.x+10, p2.y), p1),
        getAngleBetweenPoints(p2, vector(p2.x+10, p2.y), p3)
    );
    console.log(baseAngle);
    let newPointAngle = baseAngle + getAngleBetweenPoints(p1, p2, p3)/2;

    return vector(p2.x + Math.cos(newPointAngle) * Math.sqrt(2)*100, p2.y + Math.sin(newPointAngle) * Math.sqrt(2)*100);
*/
    _d = _d || 40
    let temporaryCircle = {r: _d, center: p2};
    let armPoint1 = findCircleLineIntersects(temporaryCircle, simpleLine(p2.x, p2.y, p1.x, p1.y), true);
    let armPoint2 = findCircleLineIntersects(temporaryCircle, simpleLine(p2.x, p2.y, p3.x, p3.y), true);

    return middlePoint(armPoint1[0], armPoint2[0]);
}



function findElementsIntersects(_name1, _name2) {
    if (_name2 == undefined) {
        _name2 = _name1[1];
        _name1 = _name1[0];
    }

    let obj1 = searchElementByName(_name1, true);
    let obj2 = searchElementByName(_name2, true);

    obj1[0] =  obj1[0][0].toUpperCase() + obj1[0].slice(1, obj1[0].length - 1);
    obj2[0] =  obj2[0][0].toUpperCase() + obj2[0].slice(1, obj2[0].length - 1);

    let inters = window["find" + obj1[0] + obj2[0] + "Intersects"](obj1[1], obj2[1]);
    return inters;
}

// ---------------------------
//          VISUALS
// ---------------------------

function showName(_name, _x, _y, _color, _thin) {
    _x = _x > 2 ?    _x : 2;
    _x = _x < w-20 ? _x : w-20;
    _y = _y > 12 ?   _y : 12;
    _y = _y < h-8 ?  _y : h-8;
    
    if (paperMode) _thin = true;
    let letters = getObjectNames(_name) ;
    // if (letters.length > 1) _name = getObjectNames(_name).join(" ")
    
    // console.log(letters);
    let lx = _x;
    for (let i = 0; i < letters.length; i++) {
        let letter = letters[i];
        let subscript = "";
        let font = "Arial" + (_thin ? "" : " Black");
        if (letter.includes("_")) {
            letter = letter.split("_");
            subscript = letter[1];
            letter = letter[0];// + String.fromCharCode(0x2080 + Number(letter[1]));
        }

        if (outlineNames) {
            ctx.font = "15px " + font;
            ctx.lineWidth = 3;
            setStrokeColor(bgColor);
            ctx.strokeText(letter, lx, _y);
            if (subscript) {
                ctx.font = "11px " + font;
                ctx.strokeText(subscript, lx + (_thin ? 8 : 12), _y+5);
                ctx.font = "15px " + font;
            }
        }

        setFillColor(colorPalette[_color]);
        ctx.fillText(letter, lx, _y);
        if (subscript) {
            ctx.font = "11px " + font;
            ctx.fillText(subscript, lx+(_thin ? 8 : 12), _y+5);
        }

        lx += (letter.length + 0.6*subscript.length) * (_thin ? 10 : 12);
    }
}