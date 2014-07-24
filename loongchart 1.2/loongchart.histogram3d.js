if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.Histogram3D = {
        TopLabelColor: null
    };
}
LChart.Histogram3D = LChart.getCore().__extends({ GraphType: 'Histogram3D' });
LChart.Histogram3D._spreadSkin = function (newOps, skin) {
    newOps.topLabel = {};
    newOps.topLabel.color = skin.TopLabelColor || null;
};
LChart.Histogram3D._getDefaultOptions = function (originalCommonOptions) {
    var options = LChart.Methods.Extend(originalCommonOptions, {
        animateY: true,
        animateX: true,
        histogram: {
            colors: null,
            length: null,
            gap: null,
            useSameColor: true
        },
        topLabel: {
            show: true,
            content: function (data) {
                if (this.valueType == 'd' || this.valueType == 't' || this.valueType == 'm') { return ''; }
                else if (this.valueType == 'p') { return data.percent.toFixed(1).toString() + '%'; }
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
LChart.Histogram3D._getCheckOptions = function () {
    return {
        __top: [['animateY', 'b'], ['animateX', 'b']],
        histogram: [['colors', 'ca'], ['length', 'n'], ['gap', 'n'], ['useSameColor', 'b']],
        topLabel: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};
LChart.Histogram3D._drawgraphic = function (inner, graphicID, innerData, options) {
    inner._configs.recreateAssists = true;
    if (graphicID == inner.ID) {
        inner._configs.notAllowValueNegative = true;
    }
    var axisData = inner._formatAxisData();
    var valids = inner._calculateOutersValid();
    var axisSize = inner._computeAxis(valids);
    var coordinate = inner._getDrawableCoordinate();
    inner.shapes[graphicID] = { histograms: [] };
    if (!inner.coordinates.histograms) { inner.coordinates.histograms = {}; }
    inner.coordinates.histograms[graphicID] = [];
    var specificConfig = inner._configs.specificConfig[graphicID];
    var percentType = axisData.vValueType == 'p';
    var showshadow = options.shadow.show && options.shadow.blur > 0;
    var shadow = showshadow ? { color: options.shadow.color, blur: options.shadow.blur } : null;
    var length = options.histogram.length;
    var gap = options.histogram.gap;
    if (axisData.multiple) {
        if (gap && gap > 0) {
            var maxGap = (axisSize.labelDistance - axisData.demanCount * 2) / (axisData.demanCount + 1);
            gap = Math.min(gap, maxGap);
        }
        else {
            gap = axisSize.labelDistance / 20;
        }
    }
    if (length && length > 0) {
        var maxLen = axisData.multiple ? ((axisSize.labelDistance - (axisData.demanCount + 1) * gap) / axisData.demanCount) : axisSize.labelDistance * 0.8;
        length = Math.min(length, maxLen);
    }
    else {
        length = (axisSize.labelDistance - (axisData.demanCount + 1) * gap) / (axisData.multiple ? (axisData.demanCount + 0.5) : 1.5);
    }
    var getHistogramLeft = function (i, k) {
        if (k != undefined) {
            var cut = axisData.demanCount / 2 - i;
            return axisSize.startPos + axisSize.labelDistance * k - cut * length - (cut - 0.5) * gap;
        }
        else {
            return axisSize.startPos + axisSize.labelDistance * i - length / 2
        }
    };
    var colors = (options.histogram.colors && options.histogram.colors.length > 0 ? options.histogram.colors : null) || LChart.Const.Defaults.FillColors;
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
    var drawPart = function (shape, color, mouseon, _shadow, drawgraphic, drawtext) {
        var _left = shape.left - axisSize.stagewidth * axisSize.sinsightangle;
        var _top = shape.top + axisSize.stagewidth * axisSize.cossightangle;
        var _color = color || shape.color;
        if (drawgraphic) {
            inner.DrawFigures.create3DHistogram(_left, _top, shape.width, shape.height, _color, 0, axisSize.sightangle, axisSize.stagewidth, null, mouseon ? color : shape.topcolor || LChart.Methods.getDarkenColor(_color, 0.7), mouseon ? color : shape.rightcolor || LChart.Methods.getDarkenColor(_color, 0.8), _shadow);
        }
        if (drawtext && options.topLabel.show) {
            var ops = options.topLabel;
            var content = typeof ops.content == 'function' ? ops.content.call(options, shape.data) : '';
            if (content) {
                var centerX = (shape.left + _left) / 2 + shape.width / 2;
                var size = ops.fontsize || LChart.Methods.CapValue(shape.width / 2, 18, 11);
                var centerY = (shape.top + _top) / 2 + size / 3;
                inner.DrawFigures.createText(content, centerX, centerY, 'center', shape.data.fontweight || ops.fontweight, shape.data.fontsize || size, ops.fontfamily, shape.data.fontcolor || ops.color);
            }
        }
    };
    var histogramShape = function (indexX, indexY, left, top, width, height, color, topcolor, rightcolor, data) {
        this.indexX = indexX;
        this.indexY = indexY;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.data = data;
        this.isHovered = false;
        this.color = color;
        this.topcolor = topcolor;
        this.rightcolor = rightcolor;
        this.redraw = function (mouseon, drawgraphic, drawtext, color) {
            var tmpshadow = shadow;
            if (showshadow && color) {
                tmpshadow = LChart.Methods.DeepCopy(shadow);
                tmpshadow.color = color;
            }
            drawPart(this, color, mouseon, tmpshadow, drawgraphic, drawtext);
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
                    var left = this.left;
                    var top = this.top + this.height / 2;
                    this.tip = inner._createTip(options.tip.content.call(options, this.data), left, top);
                    if (left + this.tip.clientWidth > axisSize.maxX) {
                        inner._changeTip(this.tip, left - this.tip.clientWidth);
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
        var complete = percentAnimComplete >= 1;
        var histograms = [];
        for (var i = 0, item; item = innerData[i]; i++) {
            var width = (options.animateX ? animationDecimal : 1) * length;
            if (axisData.multiple) {
                var color = item.color || colors[i % colors.length];
                var values = percentType ? item.percent : item.value;
                for (var k = 0; k < values.length; k++) {
                    var val = values[k];
                    var left = getHistogramLeft(i, k);
                    var height = getHeight(val);
                    var top = axisSize.maxY - height;
                    var data = null;
                    if (complete) {
                        data = { indexX: k, indexY: i, click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, text: item.text, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight };
                        if (percentType) { data.percent = val; data.value = item.value[k]; }
                        else { data.value = val; }
                        if (!inner.coordinates.histograms[graphicID][k]) { inner.coordinates.histograms[graphicID][k] = []; }
                        inner.coordinates.histograms[graphicID][k][i] = { left: left, top: top, width: width, height: height, color: color };
                    }
                    var shape = new histogramShape(k, i, left, top, width, height, color, item.topcolor, item.rightcolor, data);
                    histograms.push(shape);
                }
            }
            else {
                var left = getHistogramLeft(i);
                var height = getHeight(percentType ? item.percent : item.value);
                var top = axisSize.maxY - height;
                var color = item.color || (options.histogram.useSameColor ? 'rgba(69,114,167,1)' : colors[i % colors.length]);
                if (complete) {
                    inner.coordinates.histograms[graphicID][i] = { left: left, top: top, width: width, height: height, color: color };
                }
                var shape = new histogramShape(null, i, left, top, width, height, color, item.topcolor, item.rightcolor, complete ? item : null);
                histograms.push(shape);
            }
        }
        if (axisData.multiple) {
            histograms.sort(function (shape0, shape1) {
                if (shape0.indexX == shape1.indexX) { return shape0.indexY - shape1.indexY; }
                else { return shape0.indexX - shape1.indexX; }
            });
        }
        for (var i = 0, shape; shape = histograms[i]; i++) {
            drawPart(shape, shape.color, false, shadow, true);
        }
        if (complete) {
            for (var i = 0, shape; shape = histograms[i]; i++) {
                drawPart(shape, shape.color, false, shadow, false, true);
            }
            inner.shapes[graphicID].histograms = histograms;
        }
    };
    var mouseEvents = function () {
        var fixShape = function (x, y) {
            var veryShape = null;
            var heightdistance = axisSize.cossightangle * axisSize.stagewidth;
            var widthdistance = axisSize.sinsightangle * axisSize.stagewidth;
            for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
                var _left = shape.left - axisSize.stagewidth * axisSize.sinsightangle;
                var _top = shape.top + axisSize.stagewidth * axisSize.cossightangle;
                if (_left <= x && _left + shape.width >= x && _top <= y && _top + shape.height >= y) {
                    veryShape = shape; break;
                }
            }
            if (!veryShape) {
                for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
                    if (shape.top <= y && shape.top + heightdistance >= y) {
                        var _x = shape.left - widthdistance * (y - shape.top) / heightdistance;
                        if (_x <= x && _x + shape.width >= x) {
                            veryShape = shape; break;
                        }
                    }
                }
            }
            if (!veryShape) {
                for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
                    if (shape.left + shape.width - widthdistance <= x && shape.left + shape.width >= x) {
                        var _y = shape.top + heightdistance * (shape.left + shape.width - x) / widthdistance;
                        if (_y <= y && _y + shape.height >= y) {
                            veryShape = shape; break;
                        }
                    }
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
                if (showshadow || specificConfig.currentMouseShape || options.topLabel.show) {
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
                    veryShape.redraw(true, true, false, 'rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')');
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
            shape.redraw(false, true);
        }
        for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
            shape.redraw(false, false, true);
        }
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};