if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.QueueHistogram = {
        LabelColor: null
    };
}
LChart.QueueHistogram = LChart.getCore().__extends({ GraphType: 'QueueHistogram' });
LChart.QueueHistogram._spreadSkin = function (newOps, skin) {
    newOps.label = {};
    newOps.label.color = skin.LabelColor || null;
};
LChart.QueueHistogram._getDefaultOptions = function (originalCommonOptions) {
    var options = LChart.Methods.Extend(originalCommonOptions, {
        animateY: true,
        animateX: true,
        splitpoint: null,
        contrastmode: true,
        histogram: {
            colors: null,
            length: null,
            gap: null,
            useSameColor: true
        },
        label: {
            show: true,
            content: function (data) {
                if (this.valueType == 'd') { return data.value.format('MM-dd'); }
                else if (this.valueType == 't') { return data.value.format('hh:mm'); }
                else if (this.valueType == 'm') { return data.value.format('mm:ss.S'); }
                else { return data.value.toString(); }
            },
            color: null,
            fontweight: null,
            fontsize: null,
            fontfamily: null
        }
    });
    return options;
};
LChart.QueueHistogram._getCheckOptions = function () {
    return {
        __top: [['animateY', 'b'], ['animateX', 'b'], ['contrastmode', 'b']],
        histogram: [['colors', 'ca'], ['length', 'n'], ['gap', 'n'], ['useSameColor', 'b']],
        label: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};
LChart.QueueHistogram._drawgraphic = function (inner, graphicID, innerData, options) {
    if (options.valueType == 'p') {
        throw new Error(inner._messages.WrongParam + inner._messages.ValueTypeMustNotBePercent);
    }
    var splitpoint = options.splitpoint;
    var computeSplitPoint = splitpoint == null;
    if (graphicID == inner.ID) { inner._configs.computeSplitPoint = computeSplitPoint; }
    var axisData = inner._formatAxisData();
    if (computeSplitPoint) { splitpoint = axisData.splitpoint; }
    else { axisData.splitpoint = splitpoint; }
    if (axisData.demanCount > 1 && (splitpoint >= axisData.vMaxval || splitpoint <= axisData.vMinval)) { throw new Error(inner._messages.WrongSet + inner._messages.WrongSplitPoint); }
    var valids = inner._calculateOutersValid();
    var axisSize = inner._computeAxis(valids);
    var colors = (options.histogram.colors && options.histogram.colors.length > 0 ? options.histogram.colors : null) || LChart.Const.Defaults.FillColors;
    var coordinate = inner._getDrawableCoordinate();
    if (!inner.coordinates.histograms) { inner.coordinates.histograms = {}; }
    inner.coordinates.histograms[graphicID] = [];
    inner.shapes[graphicID] = { histograms: [] };
    var specificConfig = inner._configs.specificConfig[graphicID];
    var contrastmode = options.contrastmode;
    var demanCount = contrastmode ? Math.ceil(axisData.demanCount / 2.0 - 0.1) : axisData.demanCount;
    var gap = options.histogram.gap;
    var length = options.histogram.length;
    var multiple = demanCount > 1;
    if (multiple) {
        if (gap && gap > 0) {
            var maxGap = (axisSize.labelDistance - demanCount * 2) / (demanCount + 1);
            gap = Math.min(gap, maxGap);
        }
        else {
            gap = axisSize.labelDistance / 20;
        }
    }
    else {
        gap = 0;
    }
    if (length && length > 0) {
        var maxLen = multiple ? ((axisSize.labelDistance - (demanCount + 1) * gap) / demanCount) : axisSize.labelDistance * 0.8;
        length = Math.min(length, maxLen);
    }
    else {
        length = (axisSize.labelDistance - (demanCount + 1) * gap) / (multiple ? (demanCount + 0.5) : 1.5);
    }
    var showshadow = options.shadow.show;
    var getShadow = function (isSmall) {
        var resShadow = null;
        if (showshadow) {
            var shadowoffsetY = Math.max(Math.abs(options.shadow.blur), Math.abs(options.shadow.offsetY));
            resShadow = LChart.Methods.DeepCopy(options.shadow);
            resShadow.offsetY = isSmall ? shadowoffsetY : -shadowoffsetY;
        }
        return resShadow;
    };
    var getHistogramLeft = function (i, k) {
        if (k != undefined) {
            var cut = demanCount / 2 - (contrastmode ? parseInt(i / 2) : i);
            return axisSize.startPos + axisSize.labelDistance * k - cut * length - (cut - 0.5) * gap;
        }
        else {
            return axisSize.startPos + axisSize.labelDistance * i - length / 2;
        }
    };
    if (graphicID == inner.ID) {
        inner.coordinates.draw = coordinate;
        inner._configs.legendColors = colors;
        if (axisData.multiple) {
            inner._configs.pointsPosition = { labelDistance: axisSize.labelDistance, startPoints: [] };
            for (var i = 0, item; item = innerData[i]; i++) {
                inner._configs.pointsPosition[i] = getHistogramLeft(i, 0) + length / 2;
            }
        }
    }

    var drawPart = function (isSmall, left, top, width, height, color, data, _shadow) {
        inner.DrawFigures.createRectangleFill(left, top, width, height, color, _shadow || getShadow(isSmall));
        if (data && options.label.show) {
            var ops = options.label;
            var content = typeof ops.content == 'function' ? ops.content.call(options, data) : '';
            if (content) {
                var centerX = left + width / 2;
                var size = ops.fontsize || LChart.Methods.CapValue(width / 2, 18, 11);
                var centerY = isSmall ? top + height + size : top - size / 3;
                inner.DrawFigures.createText(content, centerX, centerY, 'center', data.fontweight || ops.fontweight, data.fontsize || size, ops.fontfamily, data.fontcolor || ops.color);
            }
        }
    };
    var barShape = function (isSmall, indexX, indexY, left, top, width, height, color, data) {
        this.isSmall = isSmall;
        this.indexX = indexX;
        this.indexY = indexY;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.data = data;
        this.isHovered = false;
        this.color = color;
        this.redraw = function (color, drawlabel) {
            if (arguments.length == 1 && typeof arguments[0] == 'boolean') { drawlabel = arguments[0]; color = undefined; }
            var tmpshadow = getShadow(this.isSmall);
            if (tmpshadow && color) { tmpshadow.color = color; }
            drawPart(this.isSmall, this.left, this.top, this.width, this.height, color || this.color, drawlabel ? this.data : null, tmpshadow);
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
                    var left = this.left + this.width / 2 + 5;
                    var top = this.top + this.height / 2;
                    this.tip = inner._createTip(options.tip.content.call(options, this.data), left, top);
                    if (left + this.tip.clientWidth > axisSize.maxX) {
                        inner._changeTip(this.tip, left - this.width / 2 - this.tip.clientWidth);
                    }
                    var shape = this;
                    shape.tip.onclick = function (e) { shape.click(e); };
                }
            };
            this.hideTip = function () {
                if (this.tip) { this.tip.style.display = 'none'; }
            };
        }
    };
    var drawSegments = function (animationDecimal, percentAnimComplete) {
        var getHeight = function (val) {
            var valDistance = Math.abs(inner._getFormatDiff(axisData.vValueType, splitpoint, val));
            var height = (options.animateY ? animationDecimal : 1) * (axisSize.maxY - axisSize.minY) * valDistance / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
            return height;
        };
        for (var i = 0, item; item = innerData[i]; i++) {
            var width = (options.animateX ? animationDecimal : 1) * length;
            if (axisData.multiple) {
                var color = item.color || colors[i % colors.length];
                for (var k = 0; k < item.value.length; k++) {
                    var val = item.value[k];
                    var isSmall = val < splitpoint;
                    var left = getHistogramLeft(i, k);
                    var height = getHeight(val);
                    var top = isSmall ? axisSize.splitLinePos : axisSize.splitLinePos - height;
                    if (percentAnimComplete >= 1) {
                        var data = { text: item.text, value: val, indexX: k, indexY: i, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight, click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave };
                        var shape = new barShape(isSmall, k, i, left, top, width, height, color, data);
                        inner.shapes[graphicID].histograms.push(shape);
                        drawPart(isSmall, left, top, width, height, color, data);
                        if (!inner.coordinates.histograms[graphicID][k]) { inner.coordinates.histograms[graphicID][k] = []; }
                        inner.coordinates.histograms[graphicID][k][i] = { left: left, top: top, width: width, height: height, color: color };
                    }
                    else {
                        drawPart(isSmall, left, top, width, height, color);
                    }
                }
            }
            else {
                var val = item.value;
                var isSmall = val < splitpoint;
                var left = getHistogramLeft(i);
                var height = getHeight(val);
                var top = isSmall ? axisSize.splitLinePos : axisSize.splitLinePos - height;
                var color = item.color || (options.histogram.useSameColor ? 'rgba(69,114,167,1)' : colors[i % colors.length]);
                if (percentAnimComplete >= 1) {
                    var data = { text: item.text, value: val, indexX: i, indexY: null, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight, click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave };
                    var shape = new barShape(isSmall, i, null, left, top, width, height, color, data);
                    inner.shapes[graphicID].histograms.push(shape);
                    drawPart(isSmall, left, top, width, height, color, data);
                    inner.coordinates.histograms[graphicID][i] = { left: left, top: top, width: width, height: height, color: color };
                }
                else {
                    drawPart(isSmall, left, top, width, height, color);
                }
            }
        }
    };
    var mouseEvents = function () {
        var fixShape = function (x, y) {
            var veryShape = null;
            for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
                if (shape.left <= x && shape.left + shape.width >= x && shape.top <= y && shape.top + shape.height >= y) {
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
                if (showshadow || specificConfig.currentMouseShape) {
                    inner.redrawAll();
                }
                specificConfig.currentMouseShape = veryShape;
                for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
                    if (shape != veryShape && shape.isHovered) {
                        shape.isHovered = false;
                        if (shape.hideTip) { shape.hideTip(); }
                    }
                }
                if (veryShape) {
                    veryShape.isHovered = true;
                    var mouseoverTransp = options.mouseoverTransparency;
                    veryShape.redraw('rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')');
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
    var redraw = function () {
        for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
            shape.redraw(true);
        }
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};