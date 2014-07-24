if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.MultiRing3D = {
        SeparateLineColor: null,
        InnerLabelColor: null,
        OuterLabelColor: null,
        OuterLabelBorderColor: null,
        OuterLabelBackColor: 'rgba(255,255,255,0.3)'
    };
}
LChart.MultiRing3D = LChart.getCore().__extends({ GraphType: 'MultiRing3D' });
LChart.MultiRing3D._spreadSkin = function (newOps, skin) {
    newOps.separateLine = {}; newOps.innerLabel = {}; newOps.outerLabel = {};
    newOps.separateLine.color = skin.SeparateLineColor || null;
    newOps.innerLabel.color = skin.InnerLabelColor || null;
    newOps.outerLabel.color = skin.OuterLabelColor || null;
    newOps.outerLabel.bordercolor = skin.OuterLabelBorderColor || null;
    newOps.outerLabel.backcolor = skin.OuterLabelBackColor || null;
};
LChart.MultiRing3D._getDefaultOptions = function (originalCommonOptions) {
    var options = LChart.Methods.Extend(originalCommonOptions, {
        offX: 0,
        offY: 0,
        radius: null,
        margin: null,
        colors: null,
        animateRotate: true,
        animateScale: true,
        startAngle: null,
        lengths: null,
        labels: null,
        reflection3d: {
            reflectoffX: null,
            reflectoffY: null,
            zoomX: null,
            zoomY: null
        },
        separateLine: {
            color: null,
            width: null
        },
        innerLabel: {
            show: true,
            content: function (data) {
                return data.percent.toFixed(1) + '%';
            },
            color: null,
            fontsize: null,
            fontfamily: null
        },
        outerLabel: {
            show: true,
            content: function (data) {
                return data.text;
            },
            withlegend: true,
            legendtype: null,
            length: null,
            color: null,
            backcolor: 'rgba(255,255,255,0.3)',
            bordercolor: null,
            borderwidth: 0.5,
            fontsize: null,
            fontfamily: null
        },
        tip: {
            content: function (data) { return '<div>' + (data.label ? data.label + '<br/>' : '&nbsp;') + data.text + '<br/>value：' + data.value.toString() + '<br/>percent：' + data.percent.toFixed(1) + '%</div>'; }
        }
    });
    return options;
};
LChart.MultiRing3D._getCheckOptions = function () {
    return {
        __top: [['offX', 'n'], ['offX', 'n'], ['radius', 'n'], ['margin', 'n'], ['colors', 'ca'], ['animateRotate', 'b'], ['animateScale', 'b'], ['startAngle', 'n'], ['lengths', 'na'], ['labels', 'sa']],
        reflection3d: [['reflectoffX', 'n'], ['reflectoffY', 'n'], ['zoomX', 'n'], ['zoomY', 'n']],
        separateLine: [['color', 'c'], ['width', 'n']],
        innerLabel: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's']],
        outerLabel: [['show', 'b'], ['content', 'f'], ['withlegend', 'b'], ['legendtype', 's'], ['length', 'n'], ['backcolor', 'c'], ['bordercolor', 'c'], ['borderwidth', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};
LChart.MultiRing3D._drawgraphic = function (inner, graphicID, innerData, options) {
    var segmentTotals = inner._computeSegmentTotal(innerData).segmentTotals;
    var cutX = 3; var cutY = 3;
    var zoomX = options.reflection3d.zoomX || 1.2;
    var zoomY = options.reflection3d.zoomY || 0.9;
    if (inner._configs._isIE678.isIE678) {
        zoomX = 1; zoomY = 1;
    }
    var radiusInfo = inner._computeRadiusForPies(options, zoomX, zoomY);
    if (inner._configs._isIE678.isIE678) {
        radiusInfo.maxRadius *= 0.9;
    }
    var ringCount = innerData[0].value.length;
    var cemicircleCount = innerData.length;
    if (!ringCount || ringCount < 1) {
        throw new Error(inner._messages.WrongData + inner._messages.DataMustBeMultipleArray);
    }
    var radius = !options.radius || !LChart.Methods.IsNumber(options.radius) ? radiusInfo.maxRadius : options.radius;
    var colors = (options.colors && options.colors.length > 0 ? options.colors : null) || LChart.Const.Defaults.FillColors;
    var labels = options.labels && options.labels.length > 0 ? options.labels : [''];
    var lengths = options.lengths && options.lengths.length > 0 ? options.lengths : null;
    var isMain = graphicID == inner.ID;
    if (isMain) {
        inner.coordinates.draw = radiusInfo.coordinate;
        inner._configs.legendColors = colors;
    }
    if (!inner.coordinates.multiRing) { inner.coordinates.multiRing = {}; }
    inner.coordinates.multiRing[graphicID] = { radius: radius, centerX: radiusInfo.centerX, centerY: radiusInfo.centerY, cemicircles: [], outerlabels: [] };
    if (lengths) {
        var totalLength = 0;
        for (var k = 0; k < ringCount; k++) {
            var length = lengths[k % lengths.length];
            totalLength += length;
        }
        if (totalLength > radius) {
            throw new Error(inner._messages.WrongSet + inner._messages.SumOfLengthsMustBeLessThanRadius);
        }
    }
    inner.shapes[graphicID] = { cemicircles: [], outerLabels: [] };
    var shapes = inner.shapes[graphicID];
    var reflectoffX = options.reflection3d.reflectoffX || 0;
    var reflectoffY = options.reflection3d.reflectoffY || radius / 6;
    var resetOuterLabelPosition = true;
    var linewidth = options.separateLine.width || 1;
    var linecolor = options.separateLine.color || '#ffffff';
    var initialStartAngle = Math.PI * (options.startAngle == null ? -0.5 : options.startAngle);
    var specificConfig = inner._configs.specificConfig[graphicID];

    var computeSemicircle = function (innerRadius, outerRadius, angleMin, angleMax) {
        var midAngle = (angleMin + angleMax) / 2;
        var centerX = radiusInfo.centerX;
        var centerY = radiusInfo.centerY;
        var cosmid = Math.cos(midAngle);
        var sinmid = Math.sin(midAngle);
        var darkCenterX = centerX + reflectoffX;
        var darkCenterY = centerY + reflectoffY;
        var computeLoc = function (centertype, angletype, radiustype) {
            var centerNum = centertype == 0 ? centerX : (centertype == 1 ? centerY : (centertype == 2 ? darkCenterX : darkCenterY));
            var sincos = centertype == 0 || centertype == 2 ? Math.cos : Math.sin;
            return centerNum + sincos(angletype ? angleMax : angleMin) * (radiustype ? outerRadius : innerRadius);
        };
        return {
            angleMin: angleMin, angleMax: angleMax, midAngle: midAngle, centerX: centerX, centerY: centerY, darkCenterX: darkCenterX, darkCenterY: darkCenterY, innerRadius: innerRadius, outerRadius: outerRadius,
            iStartX: computeLoc(0, 0, 0), iStartY: computeLoc(1, 0, 0), iEndX: computeLoc(0, 1, 0), iEndY: computeLoc(1, 1, 0),
            oStartX: computeLoc(0, 0, 1), oStartY: computeLoc(1, 0, 1), oEndX: computeLoc(0, 1, 1), oEndY: computeLoc(1, 1, 1),
            d_iStartX: computeLoc(2, 0, 0), d_iStartY: computeLoc(3, 0, 0), d_iEndX: computeLoc(2, 1, 0), d_iEndY: computeLoc(3, 1, 0),
            d_oStartX: computeLoc(2, 0, 1), d_oStartY: computeLoc(3, 0, 1), d_oEndX: computeLoc(2, 1, 1), d_oEndY: computeLoc(3, 1, 1)
        };
    };

    var pieshape = function (indexX, indexY, color, darksidecolor, innerRadius, outerRadius, percent, angleMin, angleMax, midAngle, data) {
        this.indexX = indexX;
        this.indexY = indexY;
        this.color = color;
        this.darksidecolor = darksidecolor;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.percent = percent;
        this.angleMin = angleMin;
        this.angleMax = angleMax;
        this.midAngle = midAngle;
        this.isHovered = false;
        this.data = data;
        this.redraw = function (color) {
            var mouseon = color;
            for (var i = 0; i < 4; i++) {
                drawPart(this.indexX, i, color || this.color, this.innerRadius, this.outerRadius, this.angleMin, this.angleMax, mouseon ? color : this.darksidecolor, mouseon);
            }
        };
        this.contact = null;
        this.computeinfo = function (forceCompute) {
            if (!this._computeinfo || forceCompute) {
                this._computeinfo = computeSemicircle(this.innerRadius, this.outerRadius, this.angleMin, this.angleMax);
            }
            return this._computeinfo;
        };
        this.click = function (e) {
            var click = typeof this.data.click == 'function' ? this.data.click : (options.click || null);
            if (click) {
                click(this.data, e);
            }
        };
        if (options.tip.show && typeof options.tip.content == 'function') {
            this.tip = null;
            this.showTip = function () {
                if (this.tip) {
                    this.tip.style.display = 'inline';
                }
                else {
                    var midAngle = (this.angleMin + this.angleMax) / 2;
                    var left = radiusInfo.centerX + (this.outerRadius + this.innerRadius) / 2 * Math.cos(midAngle);
                    var top = radiusInfo.centerY + (this.outerRadius + this.innerRadius) / 2 * Math.sin(midAngle);
                    this.tip = inner._createTip(options.tip.content(this.data), left * zoomX, top * zoomY);
                    var shape = this;
                    shape.tip.onclick = function (e) { shape.click(e); };
                }
            };
            this.hideTip = function () {
                if (this.tip) { this.tip.style.display = 'none'; }
            };
        }
    };

    var outerLabelShape = function (content, length, width, height, floatright, floattop, data, contact) {
        this.content = content;
        this.length = length;
        this.width = width;
        this.height = height;
        this.floatright = floatright;
        this.floattop = floattop;
        this.data = data;
        this.contact = contact;
        this.color = this.contact.color;
        this.index = this.contact.indexY;
        this.resetposition = function () {
            var length = this.length;
            var distance = 1.15;
            var computeinfo = this.contact.computeinfo();
            var cosmid = Math.cos(computeinfo.midAngle);
            var sinmid = Math.sin(computeinfo.midAngle);
            var cosright = cosmid > 0 ? 1 + cosmid : 0;
            var sinbottom = sinmid > 0 ? sinmid : 0;
            this.startX = (floattop ? computeinfo.centerX : (computeinfo.centerX + computeinfo.darkCenterX) / 2) + radius * cosmid;
            this.startY = (floattop ? computeinfo.centerY : (computeinfo.centerY + computeinfo.darkCenterY) / 2) + radius * sinmid;
            this.left = (floattop ? computeinfo.centerX : computeinfo.darkCenterX) + radius * distance * cosmid + (this.floatright ? 0 : -this.width);
            this.top = (floattop ? computeinfo.centerY : computeinfo.darkCenterY) + radius * distance * sinmid + sinbottom * length - length - cutY;
        };
        this.endX = function () { return this.left + (this.floatright ? 0 : this.width); };
        this.endY = function () { return this.top + this.height / 2; };
    };
    var drawPart = function (indexX, drawtype, color, innerRadius, outerRadius, angleMin, angleMax, darksidecolor, mouseon, drawOuterLabel, data, pieshape) {
        var computeinfo = computeSemicircle(innerRadius, outerRadius, angleMin, angleMax);
        var _linewidth = mouseon ? 0 : linewidth;
        darksidecolor = darksidecolor || LChart.Methods.getDarkenColor(color);
        inner.ctx.save();
        inner.ctx.transform(zoomX, 0, 0, zoomY, 0, 0);
        switch (drawtype) {
            case 0:
                inner.DrawFigures.createRingReflection(computeinfo, darksidecolor, _linewidth, linecolor, false, indexX != 0);
                break;
            case 1:
                inner.DrawFigures.createCloseFigure([[computeinfo.iStartX, computeinfo.iStartY], [computeinfo.d_iStartX, computeinfo.d_iStartY], [computeinfo.d_oStartX, computeinfo.d_oStartY], [computeinfo.oStartX, computeinfo.oStartY]], darksidecolor);
                break;
            case 2:
                inner.DrawFigures.createCloseFigure([[computeinfo.iEndX, computeinfo.iEndY], [computeinfo.d_iEndX, computeinfo.d_iEndY], [computeinfo.d_oEndX, computeinfo.d_oEndY], [computeinfo.oEndX, computeinfo.oEndY]], darksidecolor);
                break;
            default:
                inner.DrawFigures.createRing(computeinfo.centerX, computeinfo.centerY, computeinfo.innerRadius, computeinfo.outerRadius, color, angleMin, angleMax, _linewidth || .05, linecolor);
                break
        }
        inner.ctx.restore();
        var ops = options.outerLabel;
        if (drawOuterLabel) {
            var length = ops.length || radius / 12;
            var floatright = LChart.Methods.JudgeBetweenAngle(-Math.PI * 0.5, Math.PI * 0.5, computeinfo.midAngle);
            var floattop = LChart.Methods.JudgeBetweenAngle(-Math.PI, 0, computeinfo.midAngle);
            var content = ops.content(data);
            var ctxWidth = inner.DrawFigures.measureText(content, null, ops.fontsize || (length - 1), ops.fontfamily);
            var width = ctxWidth + (ops.withlegend ? length + 3 * cutX : 2 * cutX);
            var height = length + cutY * 2;
            var labelshape = new outerLabelShape(content, length, width, height, floatright ? 1 : 0, floattop ? 1 : 0, data, pieshape);
            shapes.outerLabels.push(labelshape);
            pieshape.contact = labelshape;
        }
    };

    var drawInnerLabels = function (_shape) {
        var ops = options.innerLabel;
        if (!(ops.show && typeof ops.content == 'function')) { return; }
        var drawSingleLabel = function (shape) {
            var midAngle = (shape.angleMin + shape.angleMax) / 2;
            var data = shape.data;
            var length = (shape.innerRadius + shape.outerRadius) / 2;
            var left = radiusInfo.centerX + length * Math.cos(midAngle);
            var top = radiusInfo.centerY + length * Math.sin(midAngle);
            inner.ctx.save();
            inner.ctx.transform(zoomX, 0, 0, zoomY, 0, 0);
            inner.DrawFigures.createText(ops.content(data), left, top, 'center', data.fontweight, data.fontsize || ops.fontsize || LChart.Methods.CapValue((shape.outerRadius - shape.innerRadius) / 3, 15, 11), ops.fontfamily, data.fontcolor || ops.color || LChart.Const.Defaults.InnerLabelColor);
            inner.ctx.restore();
        };
        if (_shape) { drawSingleLabel(_shape); }
        else {
            for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                drawSingleLabel(shape);
            }
        }
    };
    var drawOuterLabels = function (_shape, _color) {
        var ops = options.outerLabel;
        if (!(ops.show && typeof ops.content == 'function')) { return; }
        var minY = (isMain ? radiusInfo.coordinate.minY : 5) / zoomY;
        var maxY = (isMain ? radiusInfo.coordinate.maxY : inner.canvas.height - 5) / zoomY;
        shapes.outerLabels.sort(function (s1, s2) { return s1.index - s2.index; });
        if (resetOuterLabelPosition) {
            for (var i = 0, shape; shape = shapes.outerLabels[i]; i++) { shape.resetposition(); }
            resetOuterLabelPosition = false;
        }
        var resetPosition = function () {
            var judgeOuterLabelCross = function (r1, r2) {
                return Math.max(r1.left, r2.left) <= Math.min(r1.left + r1.width, r2.left + r2.width) && Math.max(r1.top, r2.top) <= Math.min(r1.top + r1.height, r2.top + r2.height);
            };
            var lefttop = []; var leftbuttom = []; var righttop = []; var rightbottom = [];
            for (var i = 0, shape; shape = shapes.outerLabels[i]; i++) {
                while (minY > shape.top) {
                    shape.top += cutY;
                    shape.left += shape.floatright ? cutX : -cutX;
                }
                while (maxY < shape.top + shape.height) {
                    shape.top -= cutY;
                    shape.left += shape.floatright ? cutX : -cutX;
                }
                if (shape.floatright && shape.floattop) { righttop.push(shape); }
                else if (shape.floatright && !shape.floattop) { rightbottom.push(shape); }
                else if (!shape.floatright && shape.floattop) { lefttop.push(shape); }
                else { leftbuttom.push(shape); }
            }
            var count = 0;
            var compares = [];
            var cycle = function (r) {
                if (compares.length > 0) {
                    for (var i = 0, compare; compare = compares[i]; i++) {
                        while (judgeOuterLabelCross(compare, r) && count < 1000) {
                            r.top += r.floattop ? cutY : -cutY;
                            r.left += r.floatright ? cutX : -cutX;
                            count++
                        }
                    }
                }
                compares.push(r);
            };
            for (var i = lefttop.length - 1; i >= 0; i--) { cycle(lefttop[i]); }
            compares = [];
            for (var i = 0; i < leftbuttom.length; i++) { cycle(leftbuttom[i]); }
            compares = [];
            for (var i = 0; i < righttop.length; i++) { cycle(righttop[i]); }
            compares = [];
            for (var i = rightbottom.length - 1; i >= 0; i--) { cycle(rightbottom[i]); }
        };
        var drawSingleLabel = function (labelshape, color) {
            var shape = labelshape;
            inner.ctx.save();
            inner.ctx.transform(zoomX, 0, 0, zoomY, 0, 0);
            if (!color) {
                inner.DrawFigures.createQuadraticCurve(shape.startX, shape.startY, shape.startX * 0.8 + shape.endX() * 0.2, shape.startY * 0.2 + shape.endY() * 0.8, shape.endX(), shape.endY(), 1, ops.bordercolor);
                if (ops.backcolor) {
                    inner.DrawFigures.createRectangleFill(shape.left, shape.top, shape.width, shape.height, ops.backcolor);
                }
                var fontsize = ops.fontsize || (shape.length - 1);
                var left = shape.left + (shape.floatright ? cutX + (ops.withlegend ? shape.length + cutX : 0) : shape.width - cutX);
                var top = shape.top + shape.length / 2 + fontsize / 2 + cutY / 2;
                inner.DrawFigures.createText(shape.content, left, top, shape.floatright ? 'left' : 'right', null, fontsize, ops.fontfamily, ops.color);
                if (ops.borderwidth && ops.borderwidth > 0) {
                    inner.DrawFigures.createRectangleBorder(shape.left, shape.top, shape.width, shape.height, ops.borderwidth, ops.bordercolor);
                }
            }
            if (ops.withlegend) {
                var legendtype = ops.legendtype || 's';
                var color = color || shape.color;
                inner.DrawFigures.createPointElement(legendtype, shape.left + cutX, shape.top + cutY, shape.length, color, legendtype != 'x', color, 2, legendtype == 'x');
            }
            inner.ctx.restore();
        };
        if (_shape) {
            drawSingleLabel(_shape.contact, _color);
        }
        else {
            resetPosition();
            inner.coordinates.multiRing[graphicID].outerlabels.length = 0;
            for (var i = 0, shape; shape = shapes.outerLabels[i]; i++) {
                drawSingleLabel(shape);
                inner.coordinates.multiRing[graphicID].outerlabels[i] = { index: shape.index, left: shape.left, top: shape.top, width: shape.width, height: shape.height };
            }
        }
    };
    var drawSegments = function (animationDecimal, percentAnimComplete) {
        var scaleAnimation = options.animation && options.animateScale ? animationDecimal : 1;
        var rotateAnimation = options.animation && options.animateRotate ? animationDecimal : 1;
        var usedRadius = radius;
        var complete = percentAnimComplete >= 1;
        var drawReflection = function (shapeitem, type) {
            drawPart(shapeitem.indexX, type, shapeitem.color, shapeitem.innerRadius * scaleAnimation, shapeitem.outerRadius * scaleAnimation, shapeitem.angleMin, shapeitem.angleMax, shapeitem.darksidecolor, false, complete && shapeitem.indexX == 0 && type == 3, shapeitem.data, shapeitem);
        };
        var pieshapes = [];
        for (var k = 0; k < ringCount; k++) {
            var length = lengths ? lengths[k % lengths.length] : radius / (ringCount <= 2 ? 2 * ringCount : 2 * ringCount - 1);
            var label = labels[k % labels.length];
            var outerRadius = usedRadius;
            usedRadius -= length;
            var innerRadius = usedRadius;
            var cumulativeAngle = initialStartAngle;
            for (var i = 0, item; item = innerData[i]; i++) {
                var tmpVal = item.value[k];
                var index = i + cemicircleCount * k;
                var percent = (tmpVal / segmentTotals[k]) * 100;
                var rotate = percent / 100 * Math.PI * 2 * rotateAnimation;
                var color = item.color || colors[i % colors.length];
                var angleMin = cumulativeAngle;
                var angleMax = cumulativeAngle + inner._formatSegmentAngle(rotate);
                var midAngle = (angleMin + angleMax) / 2;
                var data = null;
                if (complete) {
                    data = { index: index, color: color, darksidecolor: item.darksidecolor, percent: percent, value: tmpVal, text: item.text, label: label, click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight };
                    inner.coordinates.multiRing[graphicID].cemicircles.push({ index: index, percent: percent, angleMin: angleMin, angleMax: angleMax, innerRadius: innerRadius, outerRadius: outerRadius });
                }
                var _pieshape = new pieshape(k, i, color, item.darksidecolor, innerRadius, outerRadius, percent, angleMin, angleMax, midAngle, data);
                inner._methodsFor3D.computeLoc(_pieshape);
                pieshapes.push(_pieshape);
                cumulativeAngle = angleMax;
            }
        }
        pieshapes.sort(function (shapeitem0, shapeitem1) {
            if (shapeitem0.indexX > 0 && shapeitem0.indexX < ringCount - 1) {
                return -1;
            }
            else if (shapeitem1.indexX > 0 && shapeitem1.indexX < ringCount - 1) {
                return 1;
            }
            else {
                if (shapeitem0.indexX == shapeitem1.indexX) {
                    return inner._methodsFor3D.pieshapeSort(shapeitem0, shapeitem1);
                }
                else {
                    if (shapeitem0.indexX == 0) { return -1; }
                    else { return 1; }
                }
            }
        });
        for (var i = 0, shapeitem; shapeitem = pieshapes[i]; i++) {
            drawReflection(shapeitem, 0);
            drawReflection(shapeitem, 1);
            drawReflection(shapeitem, 2);
        }
        for (var i = 0, shapeitem; shapeitem = pieshapes[i]; i++) {
            drawReflection(shapeitem, 3);
        }
        if (complete) {
            shapes.cemicircles = pieshapes;
            drawInnerLabels();
            drawOuterLabels();
        }
    };

    var redraw = function () {
        var drawReflection = function (shapeitem, type) {
            drawPart(shapeitem.indexX, type, shapeitem.color, shapeitem.innerRadius, shapeitem.outerRadius, shapeitem.angleMin, shapeitem.angleMax, shapeitem.darksidecolor);
        };
        for (var i = 0, shapeitem; shapeitem = shapes.cemicircles[i]; i++) {
            drawReflection(shapeitem, 0);
            drawReflection(shapeitem, 1);
            drawReflection(shapeitem, 2);
        }
        for (var i = 0, shapeitem; shapeitem = shapes.cemicircles[i]; i++) {
            drawReflection(shapeitem, 3);
        }
        drawInnerLabels();
        drawOuterLabels();
    };
    var mouseEvents = function () {
        var showSingleShape = function (shape) {
            shape.isHovered = true;
            var mouseoverTransp = options.mouseoverTransparency;
            shape.redraw('rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')');
            if (shape.showTip) { shape.showTip(); }
        };
        var fixShape = function (x, y) {
            var veryShape = null;
            for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                var computeinfo = shape.computeinfo();
                var currentAngle = LChart.Methods.GetCurrentAngle(x, y, computeinfo.centerX, computeinfo.centerY);
                var distance2 = Math.pow(x - computeinfo.centerX, 2) + Math.pow(y - computeinfo.centerY, 2);
                if (distance2 >= Math.pow(computeinfo.innerRadius, 2) && distance2 <= Math.pow(computeinfo.outerRadius, 2) && LChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentAngle)) {
                    veryShape = shape; break;
                }
            }
            if (!veryShape) {
                for (var i = shapes.cemicircles.length - 1; i >= 0; i--) {
                    var shape = shapes.cemicircles[i];
                    var computeinfo = shape.computeinfo();
                    var distance2 = Math.pow(x - computeinfo.darkCenterX, 2) + Math.pow(y - computeinfo.darkCenterY, 2);
                    var currentDarkAngle = LChart.Methods.GetCurrentAngle(x, y, computeinfo.darkCenterX, computeinfo.darkCenterY);
                    if (distance2 >= Math.pow(computeinfo.innerRadius, 2) && distance2 <= Math.pow(computeinfo.outerRadius, 2) && LChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentDarkAngle)) {
                        veryShape = shape; break;
                    }
                }
            }
            return veryShape;
        };
        var fixIndex = function (x, y) {
            var index = null;
            for (var i = 0, rectangle; rectangle = shapes.outerLabels[i]; i++) {
                if (x >= rectangle.left && x <= rectangle.left + rectangle.width && y >= rectangle.top && y <= rectangle.top + rectangle.height) {
                    index = rectangle.index;
                    break;
                }
            }
            return index;
        };
        var onclick = function (e) {
            var e = window.event || e;
            var location = LChart.Methods.tranferLocation(inner._getMouseLoction(e), zoomX, zoomY);
            var veryShape = fixShape(location.X, location.Y);
            if (veryShape) {
                veryShape.click(e);
            }
        };
        var onmousemove = function (e) {
            var e = window.event || e;
            var location = LChart.Methods.tranferLocation(inner._getMouseLoction(e), zoomX, zoomY);
            var target = fixShape(location.X, location.Y) || fixIndex(location.X, location.Y);
            if (target) { inner._configs.cursorPointer = true; }
            if (specificConfig.currentMouseTarget != target) {
                var shape = specificConfig.currentMouseTarget;
                if (shape && shape.data) {
                    var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                    if (mouseleave) {
                        mouseleave(shape.data, e);
                    }
                }
                if (specificConfig.currentMouseTarget != null) {
                    inner.redrawAll();
                }
                specificConfig.currentMouseTarget = target;
                for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                    if (shape.isHovered) {
                        shape.isHovered = false;
                        if (shape.hideTip) { shape.hideTip(); }
                    }
                }
                if (target != null) {
                    if (target.data) {
                        showSingleShape(target);
                        var mouseover = typeof target.data.mouseover == 'function' ? target.data.mouseover : (options.mouseover || null);
                        if (mouseover) {
                            mouseover(target.data, e);
                        }
                    }
                    else {
                        for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                            if (shape.indexY % cemicircleCount == target) {
                                showSingleShape(shape);
                            }
                        }
                    }
                }
            }
        };
        inner._addEventListener('click', onclick);
        inner._addEventListener('mousemove', onmousemove);
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};