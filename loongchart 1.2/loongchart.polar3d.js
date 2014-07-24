if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.Polar3D = {
        SeparateLineColor: null,
        OuterLabelColor: null,
        OuterLabelBorderColor: null,
        OuterLabelBackColor: 'rgba(255,255,255,0.3)',
        StaffFontColor: null,
        StaffBackColor: null,
        ScaleLineColors: null
    };
}
LChart.Polar3D = LChart.getCore().__extends({ GraphType: 'Polar3D' });
LChart.Polar3D._spreadSkin = function (newOps, skin) {
    newOps.separateLine = {}; newOps.outerLabel = {}; newOps.staff = {}; newOps.scale = {};
    newOps.separateLine.color = skin.SeparateLineColor || null;
    newOps.outerLabel.color = skin.OuterLabelColor || null;
    newOps.outerLabel.backcolor = skin.OuterLabelBackColor || null;
    newOps.outerLabel.bordercolor = skin.OuterLabelBorderColor || null;
    newOps.staff.fontcolor = skin.StaffFontColor || null;
    newOps.staff.backcolor = skin.StaffBackColor || null;
    newOps.scale.linecolors = skin.ScaleLineColors || null;
};
LChart.Polar3D._getDefaultOptions = function (originalCommonOptions) {
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
        reflection3d: {
            reflectoffX: null,
            reflectoffY: null,
            zoomX: null,
            zoomY: null
        },
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
LChart.Polar3D._getCheckOptions = function () {
    return {
        __top: [['offX', 'n'], ['offX', 'n'], ['radius', 'n'], ['margin', 'n'], ['colors', 'ca'], ['animateRotate', 'b'], ['animateScale', 'b'], ['startAngle', 'n'], ['averageAngle', 'b']],
        reflection3d: [['reflectoffX', 'n'], ['reflectoffY', 'n'], ['zoomX', 'n'], ['zoomY', 'n']],
        separateLine: [['show', 'b'], ['color', 'c'], ['width', 'n']],
        scale: [['minvalue', 'n'], ['maxvalue', 'n'], ['interval', 'n'], ['linecolors', 'ca']],
        staff: [['show', 'b'], ['content', 'f'], ['fontcolor', 'c'], ['fontfamily', 's'], ['fontsize', 'n'], ['fontweight', 's'], ['directions', 'sa'], ['backcolor', 'c']],
        outerLabel: [['show', 'b'], ['content', 'f'], ['withlegend', 'b'], ['legendtype', 's'], ['length', 'n'], ['color', 'c'], ['backcolor', 'c'], ['bordercolor', 'c'], ['borderwidth', 'n'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};

LChart.Polar3D._drawgraphic = function (inner, graphicID, innerData, options) {
    var segmentInfo = inner._computeSegmentTotal(innerData);
    var cemicircleCount = innerData.length;
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
    var reflectoffX = options.reflection3d.reflectoffX || 0;
    var reflectoffY = options.reflection3d.reflectoffY || polarRadius / 6;
    var linewidth = options.separateLine.show ? (options.separateLine.width || 1) : 0;
    var linecolor = options.separateLine.color || '#ffffff';
    var initialStartAngle = Math.PI * (options.startAngle == null ? -0.5 : options.startAngle);
    var resetOuterLabelPosition = true;
    var specificConfig = inner._configs.specificConfig[graphicID];

    var computeSemicircle = function (radius, angleMin, angleMax) {
        var midAngle = (angleMin + angleMax) / 2;
        var centerX = radiusInfo.centerX;
        var centerY = radiusInfo.centerY;
        var cosmid = Math.cos(midAngle);
        var sinmid = Math.sin(midAngle);
        var startX = centerX + Math.cos(angleMin) * radius;
        var startY = centerY + Math.sin(angleMin) * radius;
        var endX = centerX + Math.cos(angleMax) * radius;
        var endY = centerY + Math.sin(angleMax) * radius;
        var darkCenterX = centerX + reflectoffX;
        var darkCenterY = centerY + reflectoffY;
        var darkStartX = darkCenterX + Math.cos(angleMin) * radius;
        var darkStartY = darkCenterY + Math.sin(angleMin) * radius;
        var darkEndX = darkCenterX + Math.cos(angleMax) * radius;
        var darkEndY = darkCenterY + Math.sin(angleMax) * radius;
        return {
            midAngle: midAngle, centerX: centerX, centerY: centerY, startX: startX, startY: startY, endX: endX, endY: endY, radius: radius,
            darkCenterX: darkCenterX, darkCenterY: darkCenterY, darkStartX: darkStartX, darkStartY: darkStartY, darkEndX: darkEndX, darkEndY: darkEndY
        };
    };

    var pieshape = function (index, color, radius, percent, angleMin, angleMax, midAngle, data) {
        this.index = index;
        this.color = color;
        this.radius = radius;
        this.percent = percent;
        this.angleMin = angleMin;
        this.angleMax = angleMax;
        this.midAngle = midAngle;
        this.isHovered = false;
        this.data = data;
        this.redraw = function (color) {
            var mouseon = color;
            for (var i = 0; i < 4; i++) {
                drawPart(i, this.radius, this.angleMin, this.angleMax, color || this.color, mouseon, mouseon ? color : this.data.darksidecolor);
            }
        };
        this.computeinfo = function (forceCompute) {
            if (!this._computeinfo || forceCompute) {
                this._computeinfo = computeSemicircle(this.radius, this.angleMin, this.angleMax);
            }
            return this._computeinfo;
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
                    var left = (radiusInfo.centerX + this.radius * 0.5 * Math.cos(midAngle)) * zoomX;
                    var top = (radiusInfo.centerY + this.radius * 0.5 * Math.sin(midAngle)) * zoomY;
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
        this.data = data;
        this.contact = contact;
        this.color = this.contact.color;
        this.index = this.contact.index;
        this.resetposition = function () {
            var length = this.length;
            var distance = 1.08;
            var computeinfo = this.contact.computeinfo();
            var cosmid = Math.cos(computeinfo.midAngle);
            var sinmid = Math.sin(computeinfo.midAngle);
            var cosright = cosmid > 0 ? 1 + cosmid : 0;
            var sinbottom = sinmid > 0 ? sinmid : 0;
            this.startX = (floattop ? computeinfo.centerX : (computeinfo.centerX + computeinfo.darkCenterX) / 2) + computeinfo.radius * cosmid;
            this.startY = (floattop ? computeinfo.centerY : (computeinfo.centerY + computeinfo.darkCenterY) / 2) + computeinfo.radius * sinmid;
            this.left = (floattop ? computeinfo.centerX : computeinfo.darkCenterX) + polarRadius * distance * cosmid + (this.floatright ? 0 : -this.width);
            this.top = (floattop ? computeinfo.centerY : computeinfo.darkCenterY) + polarRadius * distance * sinmid + sinbottom * length - length - cutY;
        };
        this.endX = function () { return this.left + (this.floatright ? 0 : this.width); };
        this.endY = function () { return this.top + this.height / 2; };
    };

    var getPartPercent = function (val) {
        return (val - scaleData.minvalue) / (scaleData.maxvalue - scaleData.minvalue);
    };
    var drawPart = function (drawtype, radius, angleMin, angleMax, color, mouseon, darksidecolor, data, pieshape) {
        var computeinfo = computeSemicircle(radius, angleMin, angleMax);
        darksidecolor = darksidecolor || LChart.Methods.getDarkenColor(color);
        var _linewidth = mouseon ? 0 : linewidth;
        inner.ctx.save();
        inner.ctx.transform(zoomX, 0, 0, zoomY, 0, 0);
        switch (drawtype) {
            case 0:
                inner.DrawFigures.createArc(computeinfo.darkCenterX, computeinfo.darkCenterY, computeinfo.radius, 0, null, darksidecolor, angleMin, angleMax, true);
                break;
            case 1:
                inner.DrawFigures.createCloseFigure([[computeinfo.darkCenterX, computeinfo.darkCenterY], [computeinfo.centerX, computeinfo.centerY], [computeinfo.endX, computeinfo.endY], [computeinfo.darkEndX, computeinfo.darkEndY]], darksidecolor);
                break;
            case 2:
                inner.DrawFigures.createCloseFigure([[computeinfo.darkCenterX, computeinfo.darkCenterY], [computeinfo.centerX, computeinfo.centerY], [computeinfo.startX, computeinfo.startY], [computeinfo.darkStartX, computeinfo.darkStartY]], darksidecolor);
                break;
            default:
                inner.DrawFigures.createArc(computeinfo.centerX, computeinfo.centerY, computeinfo.radius, _linewidth, linecolor, color, angleMin, angleMax, true);
                if (_linewidth > 0) {
                    if (LChart.Methods.JudgeBetweenAngle(0, Math.PI, angleMin)) {
                        inner.DrawFigures.createLine(computeinfo.startX, computeinfo.startY, computeinfo.darkStartX, computeinfo.darkStartY, _linewidth, linecolor);
                    }
                    if (LChart.Methods.JudgeBetweenAngle(0, Math.PI, angleMax)) {
                        inner.DrawFigures.createLine(computeinfo.endX, computeinfo.endY, computeinfo.darkEndX, computeinfo.darkEndY, _linewidth, linecolor);
                    }
                }
                break;
        }
        inner.ctx.restore();
        var ops = options.outerLabel;
        if (data && ops.show && typeof ops.content == 'function') {
            var length = ops.length || polarRadius / 12;
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
    var drawScales = function (recordStaff) {
        var opsScale = options.scale;
        var linewidth = opsScale.linewidth;
        if (!(opsScale.linewidth > 0)) { return; }
        var i = 0;
        for (var val = scaleData.minvalue + scaleData.interval; val <= scaleData.maxvalue; val += scaleData.interval) {
            var linecolor = opsScale.linecolors && opsScale.linecolors.length > 0 ? opsScale.linecolors[i % opsScale.linecolors.length] : 'rgb(190,190,190)';
            inner.ctx.save();
            inner.ctx.transform(zoomX, 0, 0, zoomY, 0, 0);
            inner.DrawFigures.createArc(radiusInfo.centerX, radiusInfo.centerY, polarRadius * getPartPercent(val), linewidth, linecolor);
            inner.ctx.restore();
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
            inner.ctx.save();
            inner.ctx.transform(zoomX, 0, 0, zoomY, 0, 0);
            var centerX = (direc == 'n' || direc == 's') ? radiusInfo.centerX : (direc == 'w' ? radiusInfo.centerX - distance : radiusInfo.centerX + distance);
            var bottom = (direc == 'w' || direc == 'e') ? radiusInfo.centerY + fontsize / 2.5 : (direc == 'n' ? radiusInfo.centerY - distance + fontsize / 2.5 : radiusInfo.centerY + distance + fontsize / 2.5);
            if (backcolor) {
                inner.DrawFigures.createRectangleFill(centerX - maxLength / 2 - 1, bottom - fontsize + 1, maxLength + 2, fontsize + 2, backcolor);
            }
            var textLength = inner.DrawFigures.createText(text, centerX, bottom, 'center', opsStaff.fontweight, fontsize, opsStaff.fontfamily, fontcolor);
            if (recordStaff) {
                inner.coordinates.polar[graphicID].staff.push({ direction: direc, text: text, left: centerX - textLength / 2, right: centerX + textLength / 2, top: bottom - fontsize, bottom: bottom, size: fontsize, length: textLength });
            }
            inner.ctx.restore();
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
                inner.DrawFigures.createPointElement(legendtype, shape.left + cutX, shape.top + cutY, shape.length, shape.color, legendtype != 'x', color, 2, legendtype == 'x');
            }
            inner.ctx.restore();
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
        var cumulativeAngle = initialStartAngle;
        var scaleAnimation = options.animation && options.animateScale ? animationDecimal : 1;
        var rotateAnimation = options.animation && options.animateRotate ? animationDecimal : 1;
        var complete = percentAnimComplete >= 1;
        if (!options.scaleOverlay) { drawScales(complete); }
        var pieshapes = [];
        for (var i = 0, item; item = innerData[i]; i++) {
            var percent = (item.value / segmentInfo.segmentTotal) * 100;
            var rotate = rotateAnimation * Math.PI * 2 * (options.averageAngle ? 1 / cemicircleCount : (percent / 100));
            var color = item.color || colors[i % colors.length];
            var angleMin = cumulativeAngle;
            var angleMax = cumulativeAngle + inner._formatSegmentAngle(rotate);
            var midAngle = (angleMin + angleMax) / 2;
            if (complete) { item.percent = percent; }
            var _pieshape = new pieshape(i, color, polarRadius * scaleAnimation * getPartPercent(item.value), percent, angleMin, angleMax, midAngle, item);
            inner._methodsFor3D.computeLoc(_pieshape);
            pieshapes.push(_pieshape);
            cumulativeAngle = angleMax;
        }
        pieshapes.sort(inner._methodsFor3D.pieshapeSort);
        var drawReflection = function (shapeitem, type, data, pieshape) {
            drawPart(type, shapeitem.radius, shapeitem.angleMin, shapeitem.angleMax, shapeitem.color, false, shapeitem.data.darksidecolor, complete && type == 3 ? shapeitem.data : null, complete && type == 3 ? shapeitem : null);
        };
        for (var i = 0, shapeitem; shapeitem = pieshapes[i]; i++) {
            drawReflection(shapeitem, 0);
            drawReflection(shapeitem, 1);
            drawReflection(shapeitem, 2);
            drawReflection(shapeitem, 3);
        }
        if (options.scaleOverlay) { drawScales(complete); }
        if (complete) {
            shapes.cemicircles = pieshapes;
            drawOuterLabels();
        }
    };
    var mouseEvents = function () {
        var fixShape = function (x, y) {
            var veryShape = null;
            for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                var computeinfo = shape.computeinfo();
                var currentAngle = LChart.Methods.GetCurrentAngle(x, y, computeinfo.centerX, computeinfo.centerY);
                var withinPie = (Math.pow(x - computeinfo.centerX, 2) + Math.pow(y - computeinfo.centerY, 2) <= Math.pow(shape.radius, 2)) && LChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentAngle);
                var withinOuterLabel = false;
                if (options.outerLabel && options.outerLabel.show && shape.contact) {
                    var rectangle = shape.contact;
                    if (x >= rectangle.left && x <= rectangle.left + rectangle.width && y >= rectangle.top && y <= rectangle.top + rectangle.height) {
                        withinOuterLabel = true;
                    }
                }
                if (withinPie || withinOuterLabel) {
                    veryShape = shape; break;
                }
            }
            if (!veryShape) {
                for (var i = shapes.cemicircles.length - 1; i >= 0; i--) {
                    var shape = shapes.cemicircles[i];
                    var computeinfo = shape.computeinfo();
                    var currentDarkAngle = LChart.Methods.GetCurrentAngle(x, y, computeinfo.darkCenterX, computeinfo.darkCenterY);
                    var withinDarkPie = (Math.pow(x - computeinfo.darkCenterX, 2) + Math.pow(y - computeinfo.darkCenterY, 2) <= Math.pow(shape.radius, 2)) && LChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentDarkAngle);
                    if (withinDarkPie) {
                        veryShape = shape; break;
                    }
                }
            }
            return veryShape;
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