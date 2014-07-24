if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.NestedPie = {
        SeparateLineColor: null,
        InnerLabelColor: null,
        OuterLabelColor: null,
        OuterLabelBorderColor: null,
        OuterLabelBackColor: 'rgba(255,255,255,0.3)'
    };
}
LChart.NestedPie = LChart.getCore().__extends({ GraphType: 'NestedPie' });
LChart.NestedPie._spreadSkin = function (newOps, skin) {
    newOps.separateLine = {}; newOps.innerLabel = {}; newOps.outerLabel = {};
    newOps.separateLine.color = skin.SeparateLineColor || null;
    newOps.innerLabel.color = skin.InnerLabelColor || null;
    newOps.outerLabel.color = skin.OuterLabelColor || null;
    newOps.outerLabel.bordercolor = skin.OuterLabelBorderColor || null;
    newOps.outerLabel.backcolor = skin.OuterLabelBackColor || null;
};
LChart.NestedPie._getDefaultOptions = function (originalCommonOptions) {
    var options = LChart.Methods.Extend(originalCommonOptions, {
        offX: 0,
        offY: 0,
        innerRadius: null,
        outerRadius: null,
        margin: null,
        colors: null,
        animateRotate: true,
        animateScale: true,
        startAngle: null,
        subitems: {
            outerlabalpoint: null,
            innerlabalpoint: null,
            inheritevents: true,
            showinnerlabels: false
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
            distance: null,
            color: null,
            fontsize: null,
            fontfamily: null
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
            backcolor: 'rgba(255,255,255,0.3)',
            bordercolor: null,
            borderwidth: 0.5,
            fontsize: null,
            fontfamily: null
        }
    });
    return options;
};
LChart.NestedPie._getCheckOptions = function () {
    return {
        __top: [['offX', 'n'], ['offX', 'n'], ['innerRadius', 'n'], ['outerRadius', 'n'], ['margin', 'n'], ['colors', 'ca'], ['animateRotate', 'b'], ['animateScale', 'b'], ['startAngle', 'n']],
        subitems: [['outerlabalpoint', 'n'], ['innerlabalpoint', 'n'], ['inheritevents', 'b'], ['showinnerlabels', 'b']],
        separateLine: [['color', 'c'], ['width', 'n']],
        innerLabel: [['show', 'b'], ['content', 'f'], ['distance', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's']],
        outerLabel: [['show', 'b'], ['content', 'f'], ['withlegend', 'b'], ['legendtype', 's'], ['length', 'n'], ['backcolor', 'c'], ['bordercolor', 'c'], ['borderwidth', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};
LChart.NestedPie._drawgraphic = function (inner, graphicID, innerData, options) {
    var radiusInfo = inner._computeRadiusForPies(options);
    var pieOuterRadius = !options.outerRadius || !LChart.Methods.IsNumber(options.outerRadius) ? radiusInfo.maxRadius : options.outerRadius;
    var pieInnerRadius = options.innerRadius && options.innerRadius > pieOuterRadius * 0.1 && options.innerRadius < pieOuterRadius ? options.innerRadius : pieOuterRadius * 0.7;
    if (pieOuterRadius <= pieInnerRadius) {
        throw new Error(inner._messages.WrongSet + inner._messages.OuterRadiusShouldBigger);
    }
    var isMain = graphicID == inner.ID;
    var colors = (options.colors && options.colors.length > 0 ? options.colors : null) || LChart.Const.Defaults.FillColors;
    if (isMain) {
        inner.coordinates.draw = radiusInfo.coordinate;
        inner._configs.legendColors = colors;
    }
    if (!inner.coordinates.nestedpie) { inner.coordinates.nestedpie = {}; }
    inner.coordinates.nestedpie[graphicID] = { outerRadius: pieOuterRadius, innerRadius: pieInnerRadius, centerX: radiusInfo.centerX, centerY: radiusInfo.centerY, cemicircles: [], outerlabels: [] };
    inner.shapes[graphicID] = { cemicircles: [], outerlabels: [] };
    var shapes = inner.shapes[graphicID];
    var allTotal = 0;
    var subTotals = [];
    var hasSubs = [];
    var subvalues = [];
    for (var i = 0, item; item = innerData[i]; i++) {
        var tmpVal = item.value;
        if (typeof tmpVal != 'number' || tmpVal < 0) {
            throw new Error(inner._messages.WrongData + '\'' + tmpVal + '\'' + inner._messages.DataMustGreaterThanZero);
        }
        allTotal += tmpVal;
        subTotals[i] = tmpVal;
        var subitems = item.subitems;
        if (LChart.Methods.IsArray(subitems)) {
            hasSubs[i] = true;
            var subTotal = 0;
            for (var j = 0, subitem; subitem = subitems[j]; j++) {
                var tmpsubVal = subitem.value;
                subvalues.push(tmpsubVal);
                if (typeof tmpsubVal != 'number' || tmpsubVal < 0) {
                    throw new Error(inner._messages.WrongData + '\'' + tmpsubVal + '\'' + inner._messages.DataMustGreaterThanZero);
                }
                subTotal += tmpsubVal;
            }
            if (!(Math.abs(subTotal - tmpVal) < 0.00001)) {
                throw new Error(inner._messages.WrongData + '\'' + tmpVal + '\'' + inner._messages.SubItemsValueShouldEqualSuperValue);
            }
        }
        else {
            hasSubs[i] = false;
        }
    }
    var cutX = 3; var cutY = 3;
    var resetOuterLabelPosition = true;
    var specificConfig = inner._configs.specificConfig[graphicID];
    var outerlabalpoint = options.subitems.outerlabalpoint;
    var innerlabalpoint = options.subitems.innerlabalpoint;
    if (outerlabalpoint == null || innerlabalpoint == null) {
        if (subvalues.length > 8) {
            subvalues.sort(function (x, y) { return y - x; });
            var pointvalue = subvalues[8];
            if (outerlabalpoint == null) { outerlabalpoint = pointvalue; }
            if (innerlabalpoint == null) { innerlabalpoint = pointvalue; }
        }
    }
    var inheritevents = options.subitems.inheritevents;
    var showSubitemsInnerlabels = options.subitems.showinnerlabels;
    var pieshape = function (indexX, indexY, angleMin, angleMax, data) {
        this.indexX = indexX;
        this.indexY = indexY;
        this.angleMin = angleMin;
        this.angleMax = angleMax;
        this.data = data;
        this.isHovered = false;
        this.isInnerPie = function () {
            return this.indexY == null;
        };
        this.color = function () {
            return this.data.color || (this.isInnerPie() ? colors[this.indexX % colors.length] : this.superShape.data.subcolor || this.superShape.color());
        };
        this.redraw = function (color) {
            drawPart(1, !this.isInnerPie(), this.angleMin, this.angleMax, color || this.color());
        };
        this.contact = null;
        this.superShape = null;
        this.click = function (e, data) {
            var click = typeof this.data.click == 'function' ? this.data.click : (options.click || null);
            if (click) {
                click(data || this.data, e);
            }
            else if (inheritevents && this.superShape) {
                this.superShape.click(e, this.data);
            }
        };
        this.mouseover = function (e, data) {
            var mouseover = typeof this.data.mouseover == 'function' ? this.data.mouseover : (options.mouseover || null);
            if (mouseover) {
                mouseover(data || this.data, e);
            }
            else if (inheritevents && this.superShape) {
                this.superShape.mouseover(e, this.data);
            }
        };
        this.mouseleave = function (e, data) {
            var mouseleave = typeof this.data.mouseleave == 'function' ? this.data.mouseleave : (options.mouseleave || null);
            if (mouseleave) {
                mouseleave(data || this.data, e);
            }
            else if (inheritevents && this.superShape) {
                this.superShape.mouseleave(e, this.data);
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
                    var distance = this.isInnerPie() ? pieInnerRadius : (pieOuterRadius + pieInnerRadius);
                    var left = radiusInfo.centerX + distance / 2 * Math.cos(midAngle);
                    var top = radiusInfo.centerY + distance / 2 * Math.sin(midAngle);
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
        this.endX = function () { return this.left + (this.floatright ? 0 : this.width); };
        this.endY = function () { return this.top + this.height / 2; };
        this.data = data;
        this.contact = contact;
        this.color = function () {
            return this.contact.color();
        };
        this.resetposition = function () {
            var radius = contact.isInnerPie() ? pieInnerRadius : pieOuterRadius;
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
            this.left = centerX + pieOuterRadius * distance * cosmid + (this.floatright ? 0 : -this.width);
            this.top = centerY + pieOuterRadius * distance * sinmid + sinbottom * length - length - cutY;
        };
    };
    var drawPart = function (scalePercent, isSubitem, angleMin, angleMax, color, data, pieshape) {
        var midAngle = (angleMin + angleMax) / 2;
        var centerX = radiusInfo.centerX;
        var centerY = radiusInfo.centerY;
        var cosmid = Math.cos(midAngle);
        var sinmid = Math.sin(midAngle);
        var separateLineWidth = options.separateLine.width || 1;
        var linecolor = options.separateLine.color;
        if (isSubitem) {
            inner.DrawFigures.createRing(centerX, centerY, pieInnerRadius * scalePercent, pieOuterRadius * scalePercent, color, angleMin, angleMax, separateLineWidth, linecolor);
        }
        else {
            inner.DrawFigures.createArc(centerX, centerY, pieInnerRadius * scalePercent, separateLineWidth, linecolor, color, angleMin, angleMax, true);
        }
        var ops = options.outerLabel;
        if (data && ops.show && typeof ops.content == 'function' && (isSubitem && (outerlabalpoint == null || data.value > outerlabalpoint) || !hasSubs[data.indexX])) {
            var length = ops.length || pieOuterRadius / 12;
            var floatright = LChart.Methods.JudgeBetweenAngle(-Math.PI * 0.5, Math.PI * 0.5, midAngle);
            var floattop = LChart.Methods.JudgeBetweenAngle(-Math.PI, 0, midAngle);
            var content = ops.content(data);
            var ctxWidth = inner.DrawFigures.measureText(content, null, ops.fontsize || (length - 1), ops.fontfamily);
            var width = ctxWidth + (ops.withlegend ? length + 3 * cutX : 2 * cutX);
            var height = length + cutY * 2;
            var labelshape = new outerLabelShape(content, length, width, height, floatright ? 1 : 0, floattop ? 1 : 0, data, pieshape);
            shapes.outerlabels.push(labelshape);
            pieshape.contact = labelshape;
        }
    };
    var drawInnerLabels = function (_shape) {
        var ops = options.innerLabel;
        if (!(ops.show && typeof ops.content == 'function')) { return; }
        var distance = ops.distance || 0.5;
        var drawSingleLabel = function (shape) {
            var drawInner = shape.isInnerPie();
            var drawOuter = !shape.isInnerPie() && showSubitemsInnerlabels && (innerlabalpoint == null || shape.data.value > innerlabalpoint);
            if (drawInner || drawOuter) {
                var midAngle = (shape.angleMin + shape.angleMax) / 2;
                var data = shape.data;
                var length = drawInner ? (pieInnerRadius + pieOuterRadius) / 2 * distance : pieInnerRadius + (pieOuterRadius - pieInnerRadius) * distance;
                var left = radiusInfo.centerX + length * Math.cos(midAngle);
                var top = radiusInfo.centerY + length * Math.sin(midAngle);
                inner.DrawFigures.createText(ops.content(data), left, top, 'center', data.fontweight, data.fontsize || ops.fontsize || pieOuterRadius / 10, ops.fontfamily, data.fontcolor || ops.color || LChart.Const.Defaults.InnerLabelColor);
            }
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
            for (var i = 0, shape; shape = shapes.outerlabels[i]; i++) { shape.resetposition(); }
            resetOuterLabelPosition = false;
        }
        var resetPosition = function () {
            var judgeOuterLabelCross = function (r1, r2) {
                return Math.max(r1.left, r2.left) <= Math.min(r1.left + r1.width, r2.left + r2.width) && Math.max(r1.top, r2.top) <= Math.min(r1.top + r1.height, r2.top + r2.height);
            };
            var lefttop = []; var leftbuttom = []; var righttop = []; var rightbottom = [];
            for (var i = 0, shape; shape = shapes.outerlabels[i]; i++) {
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
            if (_shape.contact) {
                drawSingleLabel(_shape.contact, _color);
            }
        }
        else {
            resetPosition();
            inner.coordinates.nestedpie[graphicID].outerlabels.length = 0;
            for (var i = 0, shape; shape = shapes.outerlabels[i]; i++) {
                drawSingleLabel(shape);
                inner.coordinates.nestedpie[graphicID].outerlabels[i] = { left: shape.left, top: shape.top, width: shape.width, height: shape.height };
            }
        }
    };
    var redraw = function () {
        for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
            shape.redraw();
        }
        drawInnerLabels();
        drawOuterLabels();
    };
    var drawSegments = function (animationDecimal, percentAnimComplete) {
        var cumulativeAngle = Math.PI * (options.startAngle == null ? -0.5 : options.startAngle);
        var cumulativeAngleSub = cumulativeAngle;
        var scaleAnimation = options.animation && options.animateScale ? animationDecimal : 1;
        var rotateAnimation = options.animation && options.animateRotate ? animationDecimal : 1;
        for (var i = 0, item; item = innerData[i]; i++) {
            var percent = (item.value / allTotal) * 100;
            var segmentAngle = rotateAnimation * (percent / 100 * (Math.PI * 2));
            var color = item.color || colors[i % colors.length];
            var angleMax = cumulativeAngle + inner._formatSegmentAngle(segmentAngle);
            var _pieshape = null;
            if (percentAnimComplete >= 1) {
                item.indexX = i;
                item.indexY = null;
                item.percent = percent;
                _pieshape = new pieshape(i, null, cumulativeAngle, angleMax, item);
                shapes.cemicircles.push(_pieshape);
                drawPart(scaleAnimation, null, cumulativeAngle, angleMax, color, item, _pieshape);
                inner.coordinates.nestedpie[graphicID].cemicircles.push({ indexX: i, indexY: null, percent: percent, radius: pieInnerRadius, angleMin: cumulativeAngle, angleMax: angleMax, color: color });
            }
            else {
                drawPart(scaleAnimation, null, cumulativeAngle, angleMax, color);
            }
            cumulativeAngle = angleMax;
            var subitems = item.subitems;
            if (subitems && LChart.Methods.IsArray(subitems)) {
                for (var j = 0, subitem; subitem = subitems[j]; j++) {
                    var percentSub = (subitem.value / allTotal) * 100;
                    var segmentAngleSub = rotateAnimation * (percentSub / 100 * (Math.PI * 2));
                    var angleMaxSub = cumulativeAngleSub + inner._formatSegmentAngle(segmentAngleSub);
                    var colorSub = subitem.color || item.subcolor || color;
                    if (percentAnimComplete >= 1) {
                        subitem.indexX = i;
                        subitem.indexY = j;
                        subitem.percent = percentSub;
                        subitem.subpercent = (subitem.value / subTotals[i]) * 100;
                        var _pieshapeSub = new pieshape(i, j, cumulativeAngleSub, angleMaxSub, subitem);
                        _pieshapeSub.superShape = _pieshape;
                        shapes.cemicircles.push(_pieshapeSub);
                        drawPart(scaleAnimation, true, cumulativeAngleSub, angleMaxSub, colorSub, subitem, _pieshapeSub);
                        inner.coordinates.nestedpie[graphicID].cemicircles.push({ indexX: i, indexY: j, percent: percentSub, innerRadius: pieInnerRadius, outerRadius: pieOuterRadius, angleMin: cumulativeAngleSub, angleMax: angleMaxSub, color: colorSub });
                    }
                    else {
                        drawPart(scaleAnimation, true, cumulativeAngleSub, angleMaxSub, colorSub);
                    }
                    cumulativeAngleSub = angleMaxSub;
                }
            }
            else {
                cumulativeAngleSub = cumulativeAngle;
            }
        }
        if (percentAnimComplete >= 1) {
            drawInnerLabels();
            drawOuterLabels();
        }
    };
    var mouseEvents = function () {
        var fixShape = function (x, y) {
            var veryShape = null;
            for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                var midAngle = (shape.angleMin + shape.angleMax) / 2;
                var currentAngle = LChart.Methods.GetCurrentAngle(x, y, radiusInfo.centerX, radiusInfo.centerY);
                var distance = Math.pow(x - radiusInfo.centerX, 2) + Math.pow(y - radiusInfo.centerY, 2);
                var withinPie = (shape.isInnerPie() && distance <= Math.pow(pieInnerRadius, 2) || !shape.isInnerPie() && distance > Math.pow(pieInnerRadius, 2) && distance <= Math.pow(pieOuterRadius, 2)) && LChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentAngle);
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
                    shape.mouseleave(e);
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
                    veryShape.mouseover(e);
                }
            }
        };
        inner._addEventListener('click', onclick);
        inner._addEventListener('mousemove', onmousemove);
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};
