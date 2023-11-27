const globalPointStyle = 1;

class Point{
    constructor(_x, _y, _name, _visible, _color) {
        this.x = _x;
        this.y = _y;
        this.color = _color != undefined ? _color : (visiblePoints+1) % (colorPalette.length-1) + 1;
        console.log(autoNamedPoints);
        this.name = _name != undefined ? _name : String.fromCharCode(65+autoNamedPoints);
        this.visible = _visible != undefined ? _visible : true;
        
        this.ID = "point_" + elements.points.length;
        
        // 0 = circle    1 = cross
        this.style = globalPointStyle;

        if (this.visible) {
            visiblePoints++;
            if (_name == undefined) {
                autoNamedPoints++;
            }
        } else if (_name == undefined) this.name = String(elements.points.length);

        elements.points.push(this);
        // this.color = 0;
    }

    show() {
        if (!this.visible) return;
        
        showName(this.name, this.x + 6, this.y + 10, this.color)
        
        ctx.lineWidth = 4;
        if (this.style == 1) {
            // let str = ctx.lineWidth;
            setStrokeColor(colorPalette[this.color]);
            line(this.x - 5, this.y - 5, this.x + 5, this.y + 5);
            line(this.x + 5, this.y - 5, this.x - 5, this.y + 5);
            // ctx.lineWidth = str;
            
        } else {
            stroke = false;
            circle(this.x, this.y, 5);
        }
    }

    changePos(_newX, _newY)  {
        this.x = _newX;
        this.y = _newY;
    }
}

class Line{
    constructor(_point1, _point2, _type, _name, _visible) {
        this.point1 = _point1;
        this.point2 = _point2;
        this.color = 0;
        this.ID = "line_" + elements.lines.length;
        
        this.visible = _visible != undefined ? _visible : true;
        
        // 0 = infinite line   1 = ray   2 = line segment
        this.type = _type != undefined ?_type : 2;
        elements.lines.push(this);
        
        if (this.visible && _name == undefined) {
            if (this.type == 0) {
                this.name = String.fromCharCode(111 + elements.lines.length);
            } else {
                this.name = elements.points[_point1].name + elements.points[_point2].name;
            }
        } else if (this.visible)  this.name = _name ;
    }
    
    show() {
        if (!this.visible) return;

        let ends = [
            vector(elements.points[this.point1].x, elements.points[this.point1].y), 
            vector(elements.points[this.point2].x, elements.points[this.point2].y)
        ];

        if (this.type < 2) {
            let inf = findEdgesOfLine(ends[0], ends[1]);
            
            ends[1] = inf[1];
            if (this.type == 0) {
                ends[0] = inf[0];
            }

            showName(this.name, ends[1].x + 8, ends[1].y + 8, this.color, true);
        } 
        
        // setFillColor(colorPalette[this.color]);
        // setStrokeColor(bgColor);
        // ctx.lineWidth = 1;
        // ctx.fillText(this.name, titlePos.x, titlePos.y);
        // if (outlineNames) {
            // ctx.strokeText(this.name, titlePos.x, titlePos.y);
        // }
        
        ctx.lineWidth = lineWidth;
        setStrokeColor(colorPalette[this.color]);
        line(ends[0].x, ends[0].y, ends[1].x, ends[1].y);
    }

    getLength() {
        if (this.type == 2) {
            return dist(elements.points[this.point1].x, elements.points[this.point1].y, 
                        elements.points[this.point2].x, elements.points[this.point2].y );
        }
        return Infinity;
    }

    ext() {
        let ends = [vector(elements.points[this.point1].x, elements.points[this.point1].y), vector(elements.points[this.point2].x, elements.points[this.point2].y)]
        let inf = findEdgesOfLine(ends[0], ends[1]);
        console.log(ends);
    }
}

class Circle{
    constructor(_centerPointindex, _radius) {
        this.center = _centerPointindex;
        this.r = _radius;
        this.ID = "circle_" + elements.circles.length;

        this.visible = true;
        this.name = "k_" + elements.circles.length;

        elements.circles.push(this);
    }

    show() {
        if (!this.visible) return;

        for (let i = 0; i < Math.PI*2; i += 0.05) {
            let titlePos = vector(
                elements.points[this.center].x + (this.r + 12) * Math.cos(i+1),
                elements.points[this.center].y + (this.r + 12) * Math.sin(i+1)
            );
            
            if (titlePos.x > 0 && titlePos.y > 0 && titlePos.x < w && titlePos.y < h) {
                showName(this.name, titlePos.x, titlePos.y, colorPalette[0], true);
                break;
            }
        }

        ctx.lineWidth = lineWidth;
        setStrokeColor("#000");
        circle(elements.points[this.center].x, elements.points[this.center].y, this.r, true);
    }
}

class Polygon{
    constructor(_vertexes, _color) {
        if (_vertexes.length < 3) return;
        
        this.vertexes = _vertexes;
        this.color = _color != undefined ? _color:4;

        this.ID = "polygon_" + elements.polygons.length;

        elements.polygons.push(this);
    }

    show() {
        ctx.lineWidth = lineWidth*2;
        setFillColor(colorPalette[this.color] + "37");
        setStrokeColor(colorPalette[this.color]);

        ctx.beginPath();
        ctx.moveTo(elements.points[this.vertexes[0]].x, elements.points[this.vertexes[0]].y);
        for (let i = 1; i <= this.vertexes.length; i++) {
            ctx.lineTo(
                elements.points[this.vertexes[i%this.vertexes.length]].x,
                elements.points[this.vertexes[i%this.vertexes.length]].y
            );
        }
        ctx.closePath();

        ctx.stroke();
        ctx.fill();
    }
}

class Angle {

}

function searchElementByName(_name) {
    for (const elementClass in elements) {
        for (i = 0; i < elements[elementClass].length; i++) {
            if (elements[elementClass][i].name == _name) {
                return [elementClass, i];
            }
        }
    }
}

function SEBN(_name) {
    return searchElementByName(_name);
}

function searchElementByID(_id) {
    _id = _id.split("_");
    return [_id[0] + "s", Number(_id[1])];

    // In case of changing the ID system:
    /*for (const elementClass in elements) {
        for (i = 0; i < elements[elementClass].length; i++) {
            if (elements[elementClass][i].ID == _id) {
                return [elementClass, i];
            }
        }
    }*/
}
