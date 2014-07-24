window.dcharttools = window.lcharttools = {};
lcharttools.canvasConfigs = { defaultLineColor: '#CCCCCC', defaultLineWidth: 1, defaultFontFamily: '微软雅黑', defaultFontSize: 14, defaultFontColor: '#000000' };
lcharttools.funcs = {};
lcharttools.funcs._getMouseLoction = function (e) {
    if (e.offsetX != null) {
        return { X: e.offsetX, Y: e.offsetY };
    }
    else {
        var getPageCoord = function (element) {
            var coord = { x: 0, y: 0 };
            while (element) {
                coord.x += element.offsetLeft;
                coord.y += element.offsetTop;
                element = element.offsetParent;
            }
            return coord;
        };
        var target = e.target;
        if (target.offsetLeft == undefined) { target = target.parentNode; }
        var pageCoord = getPageCoord(target);
        var eventCoord = { x: window.pageXOffset + e.clientX, y: window.pageYOffset + e.clientY };
        return { X: eventCoord.x - pageCoord.x, Y: eventCoord.y - pageCoord.y };
    }
};
lcharttools.funcs._judgeNormalObject = function (obj) {
    return obj && typeof obj == 'object' && !(Object.prototype.toString.call(obj) === '[object Array]') && !(typeof obj == 'object' && obj.constructor == Date);
};
lcharttools.funcs._deepCopy = function (oldops) {
    var result = {};
    var deepDig = function (res, obj, path) {
        backupPath = path;
        for (var attrname in obj) {
            path += attrname + '.';
            if (lcharttools.funcs._judgeNormalObject(obj[attrname])) {
                res[attrname] = {};
                deepDig(res[attrname], obj[attrname], path);
            }
            else {
                if (obj.hasOwnProperty(attrname)) {
                    res[attrname] = obj[attrname];
                }
            }
            path = backupPath;
        }
    };
    deepDig(result, oldops, '');
    return result;
};
lcharttools.funcs._override = function (defaults, overrides, ingoreNull) {
    var result = lcharttools.funcs._deepCopy(defaults);
    var deepDig = function (res, obj, path) {
        var backupPath = path;
        for (var attrname in obj) {
            path += attrname + '.';
            if (res[attrname] !== undefined && obj.hasOwnProperty(attrname)) {
                if (lcharttools.funcs._judgeNormalObject(obj[attrname]) && lcharttools.funcs._judgeNormalObject(res[attrname])) {
                    deepDig(res[attrname], obj[attrname], path);
                }
                else if (!ingoreNull || obj[attrname] != null) {
                    res[attrname] = obj[attrname];
                }
            }
            path = backupPath;
        }
    };
    deepDig(result, overrides, '');
    return result;
};
lcharttools.funcs._formatLinePosition = function (width, x, y) {
    var width = Math.ceil(width);
    var format = function (val) {
        var i = Math.floor(val);
        if (width % 2 == 0) {
            return val - i > 0.5 ? i + 1 : i;
        }
        else {
            return i + 0.5;
        }
    };
    if (arguments.length == 3) {
        return { x: format(x), y: format(y) };
    }
    else {
        return format(x);
    }
};
lcharttools.funcs._curveSmoothPoints = function (ctx, point0, point1, invertAxis) {
    var centerX = (point0[0] + point1[0]) / 2;
    var centerY = (point0[1] + point1[1]) / 2;
    if (invertAxis) {
        ctx.quadraticCurveTo(point0[0], 0.5 * centerY + 0.5 * point0[1], centerX, centerY);
        ctx.quadraticCurveTo(point1[0], 0.5 * centerY + 0.5 * point1[1], point1[0], point1[1]);
    }
    else {
        ctx.quadraticCurveTo(0.5 * centerX + 0.5 * point0[0], point0[1], centerX, centerY);
        ctx.quadraticCurveTo(0.5 * centerX + 0.5 * point1[0], point1[1], point1[0], point1[1]);
    }
};
lcharttools.funcs._setShadow = function (ctx, shadow) {
    if (shadow) {
        if (shadow.color) {
            ctx.shadowColor = shadow.color;
        }
        if (shadow.blur) {
            ctx.shadowBlur = shadow.blur;
        }
        if (shadow.offsetX) {
            ctx.shadowOffsetX = shadow.offsetX;
        }
        if (shadow.offsetY) {
            ctx.shadowOffsetY = shadow.offsetY;
        }
    }
};
lcharttools.createArc = function (ctx, centerX, centerY, radius, linewidth, linecolor, fillcolor, angleMin, angleMax, shadow, linkCenter) {
    if (arguments.length < 4) {
        return;
    }
    angleMin = angleMin || 0;
    angleMax = angleMax || Math.PI * 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, angleMin, angleMax);
    if (linkCenter && Math.abs(angleMax - angleMin) < Math.PI * 2 - 0.0001) {
        ctx.lineTo(centerX, centerY);
    }
    ctx.closePath();
    lcharttools.funcs._setShadow(ctx, shadow);
    if (linewidth > 0) {
        ctx.strokeStyle = linecolor || lcharttools.canvasConfigs.defaultLineColor;
        ctx.lineWidth = linewidth;
        ctx.stroke();
    }
    if (fillcolor) {
        ctx.fillStyle = fillcolor;
        ctx.fill();
    }
    ctx.restore();
};
lcharttools.createRing = function (ctx, centerX, centerY, innerRadius, outerRadius, fillcolor, angleMin, angleMax, linewidth, linecolor) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX + outerRadius * Math.cos(angleMin), centerY + outerRadius * Math.sin(angleMin));
    ctx.arc(centerX, centerY, outerRadius, angleMin, angleMax);
    ctx.lineTo(centerX + innerRadius * Math.cos(angleMax), centerY + innerRadius * Math.sin(angleMax));
    ctx.arc(centerX, centerY, innerRadius, angleMax, angleMin, true);
    ctx.closePath();
    if (fillcolor) {
        ctx.fillStyle = fillcolor;
        ctx.fill();
    }
    if (linewidth > 0) {
        ctx.lineWidth = linewidth;
        ctx.strokeStyle = linecolor || lcharttools.canvasConfigs.defaultLineColor;
        ctx.stroke();
    }
    ctx.restore();
};
lcharttools.measureText = function (ctx, content, fontweight, fontsize, fontfamily) {
    ctx.save();
    ctx.font = (fontweight || 'normal') + ' ' + (fontsize || lcharttools.canvasConfigs.defaultFontSize) + 'px ' + (fontfamily || lcharttools.canvasConfigs.defaultFontFamily);
    var textWidth = ctx.measureText(content).width;
    ctx.restore();
    return textWidth;
};
lcharttools.createText = function (ctx, content, x, y, textAlign, fontweight, fontsize, fontfamily, color, fontrotate) {
    ctx.save();
    ctx.textAlign = textAlign || 'left';
    ctx.font = (fontweight || 'normal') + ' ' + (fontsize || lcharttools.canvasConfigs.defaultFontSize) + 'px ' + (fontfamily || lcharttools.canvasConfigs.defaultFontFamily);
    var textWidth = ctx.measureText(content).width;
    ctx.fillStyle = color || lcharttools.canvasConfigs.defaultFontColor;
    if (fontrotate) {
        ctx.translate(x, y);
        ctx.rotate(fontrotate);
        ctx.fillText(content, 0, 0);
    }
    else {
        ctx.fillText(content, x, y);
    }
    ctx.restore();
    return textWidth;
};
lcharttools.createRect = function (ctx, left, top, width, height, fillcolor, borderwidth, bordercolor, shadow) {
    if (width <= 0 || height <= 0) {
        return;
    }
    ctx.save();
    lcharttools.funcs._setShadow(ctx, shadow);
    ctx.beginPath();
    ctx.rect(left, top, width, height);
    ctx.closePath();
    if (fillcolor) {
        ctx.fillStyle = fillcolor;
        ctx.fill();
    }
    if (borderwidth > 0) {
        ctx.lineWidth = borderwidth;
        ctx.strokeStyle = bordercolor || lcharttools.canvasConfigs.defaultLineColor;
        ctx.stroke();
    }
    ctx.restore();
};
lcharttools.createLine = function (ctx, startX, startY, endX, endY, linewidth, linecolor) {
    var linewidth = Math.ceil(linewidth);
    if (startX == endX) {
        startX = endX = lcharttools.funcs._formatLinePosition(linewidth, startX);
    }
    else if (startY == endY) {
        startY = endY = lcharttools.funcs._formatLinePosition(linewidth, startY);
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = linewidth || lcharttools.canvasConfigs.defaultLineWidth;
    ctx.strokeStyle = linecolor || lcharttools.canvasConfigs.defaultLineColor;
    ctx.stroke();
    ctx.restore();
};
lcharttools.createPointsLine = function (ctx, points, linewidth, linecolor, smoothline, invertAxis) {
    var len = points.length;
    if (len < 3) {
        return;
    }
    ctx.save();
    ctx.lineWidth = linewidth || lcharttools.canvasConfigs.defaultLineWidth;
    ctx.strokeStyle = linecolor || lcharttools.canvasConfigs.defaultLineColor;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 0; i < len - 1; i++) {
        if (!smoothline) {
            ctx.lineTo(points[i + 1][0], points[i + 1][1]);
        }
        else {
            lcharttools.funcs._curveSmoothPoints(ctx, points[i], points[i + 1], invertAxis);
        }
    }
    ctx.stroke();
    ctx.restore();
};
lcharttools.createCloseFigure = function (ctx, points, fillcolor, linewidth, linecolor, smoothline, invertAxis, shadow) {
    ctx.save();
    ctx.beginPath();
    var len = points.length;
    lcharttools.funcs._setShadow(ctx, shadow);
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 0; i < len - 1; i++) {
        if (!smoothline) {
            ctx.lineTo(points[i + 1][0], points[i + 1][1]);
        }
        else {
            lcharttools.funcs._curveSmoothPoints(ctx, points[i], points[i + 1], invertAxis);
        }
    }
    ctx.closePath();
    if (fillcolor) {
        ctx.fillStyle = fillcolor;
        ctx.fill();
    }
    if (linewidth > 0) {
        ctx.lineWidth = linewidth;
        ctx.strokeStyle = linecolor || lcharttools.canvasConfigs.defaultLineColor;
        ctx.stroke();
    }
    ctx.restore();
};