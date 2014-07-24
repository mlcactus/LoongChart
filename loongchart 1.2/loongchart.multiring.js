if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.MultiRing = {
        SeparateLineColor: null,
        InnerLabelColor: null,
        OuterLabelColor: null,
        OuterLabelBorderColor: null,
        OuterLabelBackColor: 'rgba(255,255,255,0.3)'
    };
}
LChart.MultiRing = LChart.getCore().__extends({ GraphType: 'MultiRing' });
LChart.MultiRing._spreadSkin = function (newOps, skin) {
    newOps.separateLine = {}; newOps.innerLabel = {}; newOps.outerLabel = {};
    newOps.separateLine.color = skin.SeparateLineColor || null;
    newOps.innerLabel.color = skin.InnerLabelColor || null;
    newOps.outerLabel.color = skin.OuterLabelColor || null;
    newOps.outerLabel.bordercolor = skin.OuterLabelBorderColor || null;
    newOps.outerLabel.backcolor = skin.OuterLabelBackColor || null;
};
LChart.MultiRing._getDefaultOptions = function (originalCommonOptions) {
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
LChart.MultiRing._getCheckOptions = function () {
    return {
        __top: [['offX', 'n'], ['offX', 'n'], ['radius', 'n'], ['margin', 'n'], ['colors', 'ca'], ['animateRotate', 'b'], ['animateScale', 'b'], ['startAngle', 'n'], ['lengths', 'na'], ['labels', 'sa']],
        separateLine: [['color', 'c'], ['width', 'n']],
        innerLabel: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's']],
        outerLabel: [['show', 'b'], ['content', 'f'], ['withlegend', 'b'], ['legendtype', 's'], ['length', 'n'], ['backcolor', 'c'], ['bordercolor', 'c'], ['borderwidth', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};
LChart.MultiRing._drawgraphic = function (inner, graphicID, innerData, options) {
    var segmentTotals = inner._computeSegmentTotal(innerData).segmentTotals;
    var radiusInfo = inner._computeRadiusForPies(options);
    var ringCount = innerData[0].value.length;
    var cemicircleCount = innerData.length;
    if (!ringCount || ringCount < 1) {
        throw new Error(inner._messages.WrongData + inner._messages.DataMustBeMultipleArray);
    }
    var separateLineWidth = options.separateLine.width || 1;
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
    var cutX = 3; var cutY = 3;
    var resetOuterLabelPosition = true;
    var specificConfig = inner._configs.specificConfig[graphicID];
    var pieshape = function (index, angleMin, angleMax, innerRadius, outerRadius, data) {
        this.index = index;
        this.angleMin = angleMin;
        this.angleMax = angleMax;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.data = data;
        this.isHovered = false;
        this.color = function () {
            return this.data.color || colors[this.index % colors.length];
        };
        this.redraw = function (color) {
            drawPart(1, this.innerRadius, this.outerRadius, this.angleMin, this.angleMax, color || this.color());
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
                    this.tip = inner._createTip(options.tip.content(this.data), left, top);
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
        this.endX = function () { return this.left + (this.floatright ? 0 : this.width) };
        this.endY = function () { return this.top + this.height / 2 };
        this.data = data;
        this.contact = contact;
        this.color = function () {
            return this.contact.color();
        };
        this.index = function () {
            return this.contact.index;
        };
        this.resetposition = function () {
            var length = this.length;
            var centerX = radiusInfo.centerX;
            var centerY = radiusInfo.centerY;
            var midAngle = (this.contact.angleMin + this.contact.angleMax) / 2;
            var cosmid = Math.cos(midAngle);
            var sinmid = Math.sin(midAngle);
            var distance = 1.15;
            var cosright = cosmid > 0 ? 1 + cosmid : 0;
            var sinbottom = sinmid > 0 ? sinmid : 0;
            this.startX = centerX + radius * cosmid;
            this.startY = centerY + radius * sinmid;
            this.left = centerX + radius * distance * cosmid + (this.floatright ? 0 : -this.width);
            this.top = centerY + radius * distance * sinmid + sinbottom * length - length - cutY;
        };
    };
    var drawPart = function (scalePercent, innerRadius, outerRadius, angleMin, angleMax, color, drawOuterLabel, data, pieshape) {
        var midAngle = (angleMin + angleMax) / 2;
        var centerX = radiusInfo.centerX;
        var centerY = radiusInfo.centerY;
        var cosmid = Math.cos(midAngle);
        var sinmid = Math.sin(midAngle);
        inner.DrawFigures.createRing(centerX, centerY, innerRadius * scalePercent, outerRadius * scalePercent, color, angleMin, angleMax, separateLineWidth, options.separateLine.color);
        if (drawOuterLabel) {
            var ops = options.outerLabel;
            if (!(data && ops.show && typeof ops.content == 'function')) { return }
            var length = ops.length || radius / 12;
            var floatright = LChart.Methods.JudgeBetweenAngle(-Math.PI * 0.5, Math.PI * 0.5, midAngle);
            var floattop = LChart.Methods.JudgeBetweenAngle(-Math.PI, 0, midAngle);
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
            inner.DrawFigures.createText(ops.content(data), left, top, 'center', data.fontweight, data.fontsize || ops.fontsize || LChart.Methods.CapValue((shape.outerRadius - shape.innerRadius) / 3, 15, 11), ops.fontfamily, data.fontcolor || ops.color || LChart.Const.Defaults.InnerLabelColor);
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
        var minY = isMain ? radiusInfo.coordinate.minY : 5;
        var maxY = isMain ? radiusInfo.coordinate.maxY : inner.canvas.height - 5;
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
                var color = color || shape.color();
                inner.DrawFigures.createPointElement(legendtype, shape.left + cutX, shape.top + cutY, shape.length, color, legendtype != 'x', color, 2, legendtype == 'x');
            }
        };
        if (_shape) {
            drawSingleLabel(_shape.contact, _color);
        }
        else {
            resetPosition();
            inner.coordinates.multiRing[graphicID].outerlabels.length = 0;
            for (var i = 0, shape; shape = shapes.outerLabels[i]; i++) {
                drawSingleLabel(shape);
                inner.coordinates.multiRing[graphicID].outerlabels[i] = { index: shape.contact.index, left: shape.left, top: shape.top, width: shape.width, height: shape.height };
            }
        }
    };
    var drawSegments = function (animationDecimal, percentAnimComplete) {
        var cumulativeAngle = Math.PI * (options.startAngle == null ? -0.5 : options.startAngle);
        var scaleAnimation = options.animation && options.animateScale ? animationDecimal : 1;
        var rotateAnimation = options.animation && options.animateRotate ? animationDecimal : 1;
        var usedRadius = radius;
        for (var k = 0; k < ringCount; k++) {
            var length = lengths ? lengths[k % lengths.length] : radius / (ringCount <= 2 ? 2 * ringCount : 2 * ringCount - 1);
            var label = labels[k % labels.length];
            var outerRadius = usedRadius;
            usedRadius -= length;
            var innerRadius = usedRadius;
            var startAngle = cumulativeAngle;
            for (var i = 0, item; item = innerData[i]; i++) {
                var tmpVal = item.value[k];
                var percent = (tmpVal / segmentTotals[k]) * 100;
                var segmentAngle = rotateAnimation * (percent / 100 * (Math.PI * 2));
                var color = item.color || colors[i % colors.length];
                var angleMin = startAngle;
                var angleMax = startAngle + inner._formatSegmentAngle(segmentAngle);
                if (percentAnimComplete >= 1) {
                    var index = i + cemicircleCount * k;
                    var data = { index: index, color: color, percent: percent, value: tmpVal, text: item.text, label: label, click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight };
                    var shape = new pieshape(index, angleMin, angleMax, innerRadius, outerRadius, data);
                    drawPart(scaleAnimation, innerRadius, outerRadius, angleMin, angleMax, color, k == 0, data, shape);
                    shapes.cemicircles.push(shape);
                    inner.coordinates.multiRing[graphicID].cemicircles.push({ index: index, percent: percent, angleMin: angleMin, angleMax: angleMax, innerRadius: innerRadius, outerRadius: outerRadius });
                }
                else {
                    drawPart(scaleAnimation, innerRadius, outerRadius, angleMin, angleMax, color);
                }
                startAngle = angleMax;
            }
        }
        if (percentAnimComplete >= 1) {
            drawInnerLabels();
            drawOuterLabels();
        }
    };
    var redraw = function () {
        for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
            shape.redraw();
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
                var midAngle = (shape.angleMin + shape.angleMax) / 2;
                var currentAngle = LChart.Methods.GetCurrentAngle(x, y, radiusInfo.centerX, radiusInfo.centerY);
                var distance = Math.pow(x - radiusInfo.centerX, 2) + Math.pow(y - radiusInfo.centerY, 2);
                if (distance <= Math.pow(shape.outerRadius + separateLineWidth, 2) && distance >= Math.pow(shape.innerRadius - separateLineWidth, 2) && LChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentAngle)) {
                    veryShape = shape;
                    break;
                }
            }
            return veryShape;
        };
        var fixIndex = function (x, y) {
            var index = null;
            for (var i = 0, rectangle; rectangle = shapes.outerLabels[i]; i++) {
                if (x >= rectangle.left && x <= rectangle.left + rectangle.width && y >= rectangle.top && y <= rectangle.top + rectangle.height) {
                    index = rectangle.data.index;
                    break;
                }
            }
            return index;
        };
        var onclick = function (e) {
            var e = window.event || e;
            var location = inner._getMouseLoction(e);
            var veryShape = fixShape(location.X, location.Y);
            if (veryShape) {
                veryShape.click(e);
            }
        };
        var onmousemove = function (e) {
            var e = window.event || e;
            var location = inner._getMouseLoction(e);
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
                            if (shape.index % cemicircleCount == target) {
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