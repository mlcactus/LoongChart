if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.HeapHistogram = {
        CutLinecolor: null,
        InnerLabelColor: null
    };
}

LChart.HeapHistogram = LChart.getCore().__extends({ GraphType: 'HeapHistogram' });
LChart.HeapHistogram._spreadSkin = function (newOps, skin) {
    newOps.histogram = {}; newOps.label = {};
    newOps.histogram.cutlinecolor = skin.CutLinecolor || null;
    newOps.label.color = skin.InnerLabelColor || null;
};
LChart.HeapHistogram._getDefaultOptions = function (originalCommonOptions) {
    var options = LChart.Methods.Extend(originalCommonOptions, {
        animateY: true,
        animateX: true,
        histogram: {
            colors: null,
            length: null,
            cutlinecolor: null,
            cutlinewidth: null
        },
        label: {
            show: true,
            content: function (data) {
                return this.valueType == 'p' ? data.percent.toFixed(1) + '%' : data.value.toString();
            },
            color: null,
            fontweight: null,
            fontsize: null,
            fontfamily: null
        }
    });
    return options;
};
LChart.HeapHistogram._getCheckOptions = function () {
    return {
        __top: [['animateY', 'b'], ['animateX', 'b']],
        histogram: [['colors', 'ca'], ['length', 'n'], ['cutlinecolor', 'c'], ['cutlinewidth', 'n']],
        label: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};
LChart.HeapHistogram._drawgraphic = function (inner, graphicID, innerData, options) {
    if (options.valueType && options.valueType != 'n' && options.valueType != 'p') {
        throw new Error(inner._messages.WrongParam + inner._messages.ValueTypeMustBeNumberOrPercent);
    }
    if (!LChart.Methods.IsArray(innerData[0].value) || innerData[0].value.length < 1) {
        throw new Error(inner._messages.WrongData + inner._messages.DataMustBeMultipleArray);
    }
    if (graphicID == inner.ID) {
        inner._configs.notAllowValueNegative = true;
    }

    var axisData = inner._formatAxisData(true);
    var valids = inner._calculateOutersValid();
    var axisSize = inner._computeAxis(valids);
    var coordinate = inner._getDrawableCoordinate();

    var cutlinewidth = Math.floor(options.histogram.cutlinewidth || 0);
    var cutlinecolor = options.histogram.cutlinecolor || '#ffffff';
    var drawcutline = cutlinewidth > 0;
    var percentType = axisData.vValueType == 'p';
    var length = options.histogram.length;
    if (length && length > 0) {
        var maxLen = axisSize.labelDistance * 0.8;
        length = Math.min(length, maxLen);
    }
    else { length = axisSize.labelDistance * 0.6; }
    var colors = (options.histogram.colors && options.histogram.colors.length > 0 ? options.histogram.colors : null) || LChart.Const.Defaults.FillColors;
    if (graphicID == inner.ID) {
        inner.coordinates.draw = coordinate;
        inner._configs.legendColors = colors;
    }

    var specificConfig = inner._configs.specificConfig[graphicID];
    inner.shapes[graphicID] = { histograms: [] };
    if (!inner.coordinates.histograms) { inner.coordinates.histograms = {}; }
    inner.coordinates.histograms[graphicID] = [];

    var drawPart = function (left, top, width, height, color, data, drawtextonly) {
        if (!drawtextonly) { inner.DrawFigures.createRectangleFill(left, top, width, height, color); }
        if (data && options.label.show) {
            var ops = options.label;
            var content = typeof ops.content == 'function' ? ops.content.call(options, data) : '';
            if (content) {
                var centerX = left + width / 2;
                var size = ops.fontsize || LChart.Methods.CapValue(width / 2, 18, 11);
                var centerY = top + height / 2 + size / 3;
                var color = ops.color || '#ffffff';
                inner.DrawFigures.createText(content, centerX, centerY, 'center', data.fontweight || ops.fontweight, data.fontsize || size, ops.fontfamily, data.fontcolor || color);
            }
        }
    };
    var histogramShape = function (indexX, indexY, left, top, width, height, color, data, linetop) {
        this.indexX = indexX;
        this.indexY = indexY;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.data = data;
        this.linetop = linetop;
        this.isHovered = false;
        this.color = color;
        this.redrawrect = function (color) {
            drawPart(this.left, this.top, this.width, this.height, color || this.color);
        };
        this.redrawtext = function () {
            drawPart(this.left, this.top, this.width, this.height, color || this.color, this.data, true);
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
                    var left = this.left + this.width;
                    var top = this.top + this.height / 2;
                    this.tip = inner._createTip(options.tip.content.call(options, this.data), left, top);
                    if (left + this.tip.clientWidth > axisSize.maxX) {
                        inner._changeTip(this.tip, left - this.tip.clientWidth - this.width);
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
            var height = (options.animateY ? animationDecimal : 1) * (axisSize.maxY - axisSize.minY) * inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, val) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
            return height;
        };
        var width = (options.animateX ? animationDecimal : 1) * length;
        for (var i = 0; i < axisData.tuftCount; i++) {
            var left = axisSize.startPos + axisSize.labelDistance * i - length / 2;
            var tmpheight = 0;
            var cutlines = [];
            var lastshapes = [];
            for (var k = 0; k < axisData.demanCount; k++) {
                var item = innerData[k];
                var color = item.color || colors[k % colors.length];
                var values = percentType ? item.percent : item.value;
                var height = getHeight(values[i]);
                tmpheight += height;
                var top = axisSize.maxY - tmpheight;
                if (top < axisSize.minY + 1) {
                    height -= axisSize.minY + 1 - top;
                    top = axisSize.minY + 1;
                }
                if (k < axisData.demanCount - 1) { top += cutlinewidth / 2; }
                if (k == axisData.demanCount - 1 || k == 0) { height -= cutlinewidth / 2; }
                else { height -= cutlinewidth; }
                if (height + top > axisSize.maxY) {
                    height = axisSize.maxY - top;
                }
                var linetop = null;
                if (drawcutline && k < axisData.demanCount - 1) {
                    linetop = top - cutlinewidth / 2;
                    if (linetop + cutlinewidth / 2 + 1 > axisSize.maxY) { linetop = axisSize.maxY - cutlinewidth / 2 - 1 }
                    cutlines.push(linetop);
                }
                if (percentAnimComplete >= 1) {
                    var data = { click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, text: item.text, indexX: i, indexY: k, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight };
                    if (percentType) {
                        data.percent = values[i];
                        data.value = item.value[i];
                    }
                    else { data.value = values[i]; }
                    var shape = new histogramShape(k, i, left, top, width, height, color, data, linetop);
                    inner.shapes[graphicID].histograms.push(shape);
                    lastshapes.push(shape);
                    shape.redrawrect();
                    if (!inner.coordinates.histograms[graphicID][i]) { inner.coordinates.histograms[graphicID][i] = []; }
                    inner.coordinates.histograms[graphicID][i][k] = { left: left, top: top, width: width, height: height, color: color };
                }
                else {
                    drawPart(left, top, width, height, color);
                }
            }
            if (drawcutline) {
                for (var j = 0; j < cutlines.length; j++) {
                    inner.DrawFigures.createLine(left, cutlines[j], left + width, cutlines[j], cutlinewidth, cutlinecolor);
                }
            }
            if (percentAnimComplete >= 1) {
                for (var j = 0, shape; shape = lastshapes[j]; j++) {
                    shape.redrawtext();
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
                    shape.isHovered = false;
                    if (shape.hideTip) { shape.hideTip(); }
                    var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                    if (mouseleave) {
                        mouseleave(shape.data, e);
                    }
                }
                if (specificConfig.currentMouseShape) {
                    inner.redrawAll();
                }
                specificConfig.currentMouseShape = veryShape;
                if (veryShape) {
                    veryShape.isHovered = true;
                    var mouseoverTransp = options.mouseoverTransparency;
                    veryShape.redrawrect('rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')');
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
            shape.redrawrect();
        }
        for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
            if (shape.linetop != null) {
                inner.DrawFigures.createLine(shape.left, shape.linetop, shape.left + shape.width, shape.linetop, cutlinewidth, cutlinecolor);
            }
        }
        for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
            shape.redrawtext();
        }
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};