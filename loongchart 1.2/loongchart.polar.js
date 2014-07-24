if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.Polar = {
        SeparateLineColor: null,
        OuterLabelColor: null,
        OuterLabelBorderColor: null,
        OuterLabelBackColor: 'rgba(255,255,255,0.3)',
        StaffFontColor: null,
        StaffBackColor: null,
        ScaleLineColors: null
    };
}
LChart.Polar = LChart.getCore().__extends({ GraphType: 'Polar' });
LChart.Polar._spreadSkin = function (newOps, skin) {
    newOps.separateLine = {}; newOps.outerLabel = {}; newOps.staff = {}; newOps.scale = {};
    newOps.separateLine.color = skin.SeparateLineColor || null;
    newOps.outerLabel.color = skin.OuterLabelColor || null;
    newOps.outerLabel.backcolor = skin.OuterLabelBackColor || null;
    newOps.outerLabel.bordercolor = skin.OuterLabelBorderColor || null;
    newOps.staff.fontcolor = skin.StaffFontColor || null;
    newOps.staff.backcolor = skin.StaffBackColor || null;
    newOps.scale.linecolors = skin.ScaleLineColors || null;
};
LChart.Polar._getDefaultOptions = function (originalCommonOptions) {
    var options = LChart.Methods.Extend(originalCommonOptions, {
        offX: 0,
        offY: 0,
        radius: null,
        margin: null,
        colors: null,
        animateRotate: true,
        animateScale: true,
        scaleOverlay: true,
        startAngle: null,
        averageAngle: false,
        separateLine: {
            show: false,
            color: null,
            width: null
        },
        scale: {
            linewidth: 0.5,
            minvalue: null,
            maxvalue: null,
            interval: null,
            linecolors: null
        },
        staff: {
            show: true,
            content: function (val) {
                return val.toString();
            },
            fontcolor: null,
            fontfamily: null,
            fontsize: null,
            fontweight: null,
            directions: ['n', 's', 'e', 'w'],
            backcolor: 'rgba(255,255,255,0.3)'
        },
        outerLabel: {
            show: true,
            content: function (data) {
                return data.text + ' ' + data.percent.toFixed(1) + '%';
            },
            withlegend: true,
            legendtype: null,
            length: null,
            color: null,
            backcolor: 'rgba(220,220,220,0.2)',
            bordercolor: null,
            borderwidth: 0.5,
            fontsize: null,
            fontfamily: null
        }
    });
    return options;
};
LChart.Polar._getCheckOptions = function () {
    return {
        __top: [['offX', 'n'], ['offX', 'n'], ['radius', 'n'], ['margin', 'n'], ['colors', 'ca'], ['animateRotate', 'b'], ['animateScale', 'b'], ['startAngle', 'n'], ['averageAngle', 'b']],
        separateLine: [['show', 'b'], ['color', 'c'], ['width', 'n']],
        scale: [['minvalue', 'n'], ['maxvalue', 'n'], ['interval', 'n'], ['linecolors', 'ca']],
        staff: [['show', 'b'], ['content', 'f'], ['fontcolor', 'c'], ['fontfamily', 's'], ['fontsize', 'n'], ['fontweight', 's'], ['directions', 'sa'], ['backcolor', 'c']],
        outerLabel: [['show', 'b'], ['content', 'f'], ['withlegend', 'b'], ['legendtype', 's'], ['length', 'n'], ['color', 'c'], ['backcolor', 'c'], ['bordercolor', 'c'], ['borderwidth', 'n'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};

LChart.Polar._drawgraphic = function (inner, graphicID, innerData, options) {
    var segmentInfo = inner._computeSegmentTotal(innerData);
    var cemicircleCount = innerData.length;
    var radiusInfo = inner._computeRadiusForPies(options);
    var colors = (options.colors && options.colors.length > 0 ? options.colors : null) || LChart.Const.Defaults.FillColors;
    var isMain = graphicID == inner.ID;
    if (isMain) {
        inner.coordinates.draw = radiusInfo.coordinate;
        inner._configs.legendColors = colors;
    }
    var scaleData = inner._getComputed(0, 'n', options.scale, segmentInfo.minval, segmentInfo.maxval, 8);
    var polarRadius = !options.radius || !LChart.Methods.IsNumber(options.radius) ? radiusInfo.maxRadius : options.radius;
    if (!inner.coordinates.polar) { inner.coordinates.polar = {}; }
    inner.coordinates.polar[graphicID] = { radius: polarRadius, centerX: radiusInfo.centerX, centerY: radiusInfo.centerY, outerlabels: [], staff: [], cemicircles: [] };
    inner.shapes[graphicID] = { cemicircles: [], outerLabels: [] };
    var shapes = inner.shapes[graphicID];
    var cutX = 3; var cutY = 3;
    var resetOuterLabelPosition = true;
    var specificConfig = inner._configs.specificConfig[graphicID];

    var polarshape = function (index, angleMin, angleMax, data, radius) {
        this.index = index;
        this.angleMin = angleMin;
        this.angleMax = angleMax;
        this.data = data;
        this.isHovered = false;
        this.radius = radius;
        this.color = function () {
            return this.data.color || colors[this.index % colors.length];
        };
        this.redraw = function (color) {
            drawPart(getPartPercent(this.data.value), this.angleMin, this.angleMax, color || this.color());
        };
        this.contact = null;
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
                    var left = radiusInfo.centerX + this.radius * 0.5 * Math.cos(midAngle);
                    var top = radiusInfo.centerY + this.radius * 0.5 * Math.sin(midAngle);
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
            var distance = 1.1;
            var cosright = cosmid > 0 ? 1 + cosmid : 0;
            var sinbottom = sinmid > 0 ? sinmid : 0;
            this.startX = centerX + this.contact.radius * cosmid;
            this.startY = centerY + this.contact.radius * sinmid;
            this.left = centerX + polarRadius * distance * cosmid + (this.floatright ? 0 : -this.width);
            this.top = centerY + polarRadius * distance * sinmid + sinbottom * length - length - cutY;
        };
    };
    var getPartPercent = function (val) {
        return (val - scaleData.minvalue) / (scaleData.maxvalue - scaleData.minvalue);
    };
    var drawPart = function (scalePercent, angleMin, angleMax, color, data, polarshape) {
        var midAngle = (angleMin + angleMax) / 2;
        var centerX = radiusInfo.centerX;
        var centerY = radiusInfo.centerY;
        var cosmid = Math.cos(midAngle);
        var sinmid = Math.sin(midAngle);
        var linewidth = options.separateLine.show ? (options.separateLine.width || 1) : 0;
        inner.DrawFigures.createArc(centerX, centerY, polarRadius * scalePercent, linewidth, options.separateLine.color, color, angleMin, angleMax, true);
        var ops = options.outerLabel;
        if (data && ops.show && typeof ops.content == 'function') {
            var length = ops.length || polarRadius / 12;
            var floatright = LChart.Methods.JudgeBetweenAngle(-Math.PI * 0.5, Math.PI * 0.5, midAngle);
            var floattop = LChart.Methods.JudgeBetweenAngle(-Math.PI, 0, midAngle);
            var content = ops.content(data);
            var ctxWidth = inner.DrawFigures.measureText(content, null, ops.fontsize || (length - 1), ops.fontfamily);
            var width = ctxWidth + (ops.withlegend ? length + 3 * cutX : 2 * cutX);
            var height = length + cutY * 2;
            var labelshape = new outerLabelShape(content, length, width, height, floatright ? 1 : 0, floattop ? 1 : 0, data, polarshape);
            shapes.outerLabels.push(labelshape);
            polarshape.contact = labelshape;
        }
    };
    var drawScales = function (recordStaff) {
        var opsScale = options.scale;
        var linewidth = opsScale.linewidth;
        if (!(opsScale.linewidth > 0)) { return; }
        var i = 0;
        for (var val = scaleData.minvalue + scaleData.interval; val <= scaleData.maxvalue; val += scaleData.interval) {
            var linecolor = opsScale.linecolors && opsScale.linecolors.length > 0 ? opsScale.linecolors[i % opsScale.linecolors.length] : 'rgb(190,190,190)';
            inner.DrawFigures.createArc(radiusInfo.centerX, radiusInfo.centerY, polarRadius * getPartPercent(val), linewidth, linecolor);
            i++;
        }
        var opsStaff = options.staff;
        var content = opsStaff.content;
        if (!opsStaff.show || typeof content != 'function' || opsStaff.directions == null || !(opsStaff.directions.length > 0)) { return; }
        var fontsize = opsStaff.fontsize || polarRadius / scaleData.scalecount * 0.6;
        var backcolor = opsStaff.backcolor;
        var maxLength = 0;
        if (backcolor) {
            for (var val = scaleData.minvalue + scaleData.interval; val <= scaleData.maxvalue; val += scaleData.interval) {
                var tmpLen = inner.DrawFigures.measureText(content(val), opsStaff.fontweight, fontsize, opsStaff.fontfamily);
                maxLength = Math.max(maxLength, tmpLen);
            }
        }
        i = 0;
        var drawDirection = function (text, direc, distance) {
            var centerX = (direc == 'n' || direc == 's') ? radiusInfo.centerX : (direc == 'w' ? radiusInfo.centerX - distance : radiusInfo.centerX + distance);
            var bottom = (direc == 'w' || direc == 'e') ? radiusInfo.centerY + fontsize / 2.5 : (direc == 'n' ? radiusInfo.centerY - distance + fontsize / 2.5 : radiusInfo.centerY + distance + fontsize / 2.5);
            if (backcolor) {
                inner.DrawFigures.createRectangleFill(centerX - maxLength / 2 - 1, bottom - fontsize + 1, maxLength + 2, fontsize + 2, backcolor);
            }
            var textLength = inner.DrawFigures.createText(text, centerX, bottom, 'center', opsStaff.fontweight, fontsize, opsStaff.fontfamily, fontcolor);
            if (recordStaff) {
                inner.coordinates.polar[graphicID].staff.push({ direction: direc, text: text, left: centerX - textLength / 2, right: centerX + textLength / 2, top: bottom - fontsize, bottom: bottom, size: fontsize, length: textLength });
            }
        };
        for (var val = scaleData.minvalue + scaleData.interval; val <= scaleData.maxvalue; val += scaleData.interval) {
            var fontcolor = opsStaff.fontcolor || '#000000';
            var distance = polarRadius * getPartPercent(val);
            var text = content(LChart.Methods.FormatNumber(val));
            if (opsStaff.directions.__contains('n')) {
                drawDirection(text, 'n', distance);
            }
            if (opsStaff.directions.__contains('s')) {
                drawDirection(text, 's', distance);
            }
            if (opsStaff.directions.__contains('e')) {
                drawDirection(text, 'e', distance);
            }
            if (opsStaff.directions.__contains('w')) {
                drawDirection(text, 'w', distance);
            }
            i++;
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
            inner.coordinates.polar[graphicID].outerlabels.length = 0;
            for (var i = 0, shape; shape = shapes.outerLabels[i]; i++) {
                drawSingleLabel(shape);
                inner.coordinates.polar[graphicID].outerlabels[i] = { index: shape.contact.index, left: shape.left, top: shape.top, width: shape.width, height: shape.height };
            }
        }
    };
    var redraw = function () {
        if (!options.scaleOverlay) { drawScales(); }
        for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
            shape.redraw();
        }
        if (options.scaleOverlay) { drawScales(); }
        drawOuterLabels();
    };
    var drawSegments = function (animationDecimal, percentAnimComplete) {
        var cumulativeAngle = Math.PI * (options.startAngle == null ? -0.5 : options.startAngle);
        var scaleAnimation = options.animation && options.animateScale ? animationDecimal : 1;
        var rotateAnimation = options.animation && options.animateRotate ? animationDecimal : 1;
        if (!options.scaleOverlay) { drawScales(percentAnimComplete >= 1); }
        for (var i = 0, item; item = innerData[i]; i++) {
            var percent = (item.value / segmentInfo.segmentTotal) * 100;
            var segmentAngle = rotateAnimation * Math.PI * 2 * (options.averageAngle ? 1 / cemicircleCount : (percent / 100));
            var color = item.color || colors[i % colors.length];
            var radiusPercent = scaleAnimation * getPartPercent(item.value);
            var angleMax = cumulativeAngle + inner._formatSegmentAngle(segmentAngle);
            if (percentAnimComplete >= 1) {
                item.percent = percent;
                item.index = i;
                var _polarshape = new polarshape(i, cumulativeAngle, angleMax, item, polarRadius * radiusPercent);
                shapes.cemicircles.push(_polarshape);
                drawPart(radiusPercent, cumulativeAngle, angleMax, color, item, _polarshape);
                inner.coordinates.polar[graphicID].cemicircles.push({ index: i, percent: percent, radius: radiusPercent, angleMin: cumulativeAngle, angleMax: angleMax, color: color });
            }
            else {
                drawPart(radiusPercent, cumulativeAngle, angleMax, color);
            }
            cumulativeAngle = angleMax;
        }
        if (options.scaleOverlay) { drawScales(percentAnimComplete >= 1); }
        if (percentAnimComplete >= 1) { drawOuterLabels(); }
    };
    var mouseEvents = function () {
        var fixShape = function (x, y) {
            var veryShape = null;
            for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                var midAngle = (shape.angleMin + shape.angleMax) / 2;
                var centerX = radiusInfo.centerX;
                var centerY = radiusInfo.centerY;
                var currentAngle = LChart.Methods.GetCurrentAngle(x, y, centerX, centerY);
                var withinPolar = (Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) <= Math.pow(shape.radius, 2)) && LChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentAngle);
                var withinOuterLabel = false;
                if (options.outerLabel && options.outerLabel.show && shape.contact) {
                    var rectangle = shape.contact;
                    if (x >= rectangle.left && x <= rectangle.left + rectangle.width && y >= rectangle.top && y <= rectangle.top + rectangle.height) {
                        withinOuterLabel = true;
                    }
                }
                if (withinPolar || withinOuterLabel) {
                    veryShape = shape; break;
                }
            }
            return veryShape;
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
            var veryShape = fixShape(location.X, location.Y);
            if (veryShape) { inner._configs.cursorPointer = true; }
            if (specificConfig.currentMouseShape != veryShape) {
                var shape = specificConfig.currentMouseShape;
                if (shape) {
                    var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                    if (mouseleave) {
                        mouseleave(shape.data, e);
                    }
                }
                if (specificConfig.currentMouseShape) {
                    inner.redrawAll();
                }
                specificConfig.currentMouseShape = veryShape;
                for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                    if (shape.isHovered) {
                        shape.isHovered = false;
                        if (shape.hideTip) { shape.hideTip(); }
                    }
                }
                if (veryShape) {
                    veryShape.isHovered = true;
                    var mouseoverTransp = options.mouseoverTransparency;
                    var newColor = 'rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')';
                    veryShape.redraw(newColor);
                    drawOuterLabels(veryShape, newColor);
                    if (veryShape.showTip) { veryShape.showTip(); }
                    var mouseover = typeof veryShape.data.mouseover == 'function' ? veryShape.data.mouseover : (options.mouseover || null);
                    if (mouseover) {
                        mouseover(veryShape.data, e);
                    }
                }
            }
        };
        inner._addEventListener('click', onclick);
        inner._addEventListener('mousemove', onmousemove);
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};