if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.HeapHistogram3D = {
        CutLinecolor: null,
        InnerLabelColor: null
    };
}

LChart.HeapHistogram3D = LChart.getCore().__extends({ GraphType: 'HeapHistogram3D' });
LChart.HeapHistogram3D._spreadSkin = function (newOps, skin) {
    newOps.histogram = {}; newOps.label = {};
    newOps.histogram.cutlinecolor = skin.CutLinecolor || null;
    newOps.label.color = skin.InnerLabelColor || null;
};
LChart.HeapHistogram3D._getDefaultOptions = function (originalCommonOptions) {
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
LChart.HeapHistogram3D._getCheckOptions = function () {
    return {
        __top: [['animateY', 'b'], ['animateX', 'b']],
        histogram: [['colors', 'ca'], ['length', 'n'], ['cutlinecolor', 'c'], ['cutlinewidth', 'n']],
        label: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};
LChart.HeapHistogram3D._drawgraphic = function (inner, graphicID, innerData, options) {
    if (options.valueType && options.valueType != 'n' && options.valueType != 'p') {
        throw new Error(inner._messages.WrongParam + inner._messages.ValueTypeMustBeNumberOrPercent);
    }
    if (!LChart.Methods.IsArray(innerData[0].value) || innerData[0].value.length < 1) {
        throw new Error(inner._messages.WrongData + inner._messages.DataMustBeMultipleArray);
    }
    inner._configs.recreateAssists = true;
    if (graphicID == inner.ID) {
        inner._configs.notAllowValueNegative = true;
    }

    var axisData = inner._formatAxisData(true);
    var valids = inner._calculateOutersValid();
    var axisSize = inner._computeAxis(valids);
    var coordinate = inner._getDrawableCoordinate();

    var cutlinewidth = Math.floor(options.histogram.cutlinewidth || 0);
    var cutlinecolor = options.histogram.cutlinecolor || '#ffffff';
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

    var drawPart = function (shape, color, mouseon, drawgraphic, drawline, drawtext) {
        var _left = shape.left - axisSize.stagewidth * axisSize.sinsightangle;
        var _top = shape.top + axisSize.stagewidth * axisSize.cossightangle;
        var _color = color || shape.color;
        if (drawgraphic) {
            inner.DrawFigures.create3DHistogram(_left, _top, shape.width, shape.height, _color, 0, axisSize.sightangle, axisSize.stagewidth, null, mouseon ? color : shape.topcolor || LChart.Methods.getDarkenColor(_color, 0.7), mouseon ? color : shape.rightcolor || LChart.Methods.getDarkenColor(_color, 0.8));
        }
        if (drawtext && options.label.show) {
            var ops = options.label;
            var content = typeof ops.content == 'function' ? ops.content.call(options, shape.data) : '';
            if (content) {
                var centerX = _left + shape.width / 2;
                var size = ops.fontsize || LChart.Methods.CapValue(shape.width / 2, 18, 11);
                var centerY = _top + shape.height / 2 + size / 3;
                inner.DrawFigures.createText(content, centerX, centerY, 'center', shape.data.fontweight || ops.fontweight, shape.data.fontsize || size, ops.fontfamily, shape.data.fontcolor || ops.color);
            }
        }
        if (drawline && shape.linetop) {
            var linetop = shape.linetop + axisSize.stagewidth * axisSize.cossightangle;
            if (cutlinewidth > 1) {
                inner.DrawFigures.create3DHistogram(_left, linetop, shape.width, cutlinewidth, cutlinecolor, 0, axisSize.sightangle, axisSize.stagewidth, null, cutlinecolor, cutlinecolor);
            }
            else {
                inner.DrawFigures.createLine(_left, linetop, _left + shape.width, linetop, cutlinewidth, cutlinecolor);
                inner.DrawFigures.createLine(_left + shape.width, linetop, shape.left + shape.width, shape.top, cutlinewidth, cutlinecolor);
            }
        }
    };

    var histogramShape = function (indexX, indexY, left, top, width, height, color, topcolor, rightcolor, data, linetop) {
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
        this.topcolor = topcolor;
        this.rightcolor = rightcolor;
        this.redraw = function (color) {
            drawPart(this, color, true, true);
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
        var complete = percentAnimComplete >= 1;
        var histograms = [];
        var width = (options.animateX ? animationDecimal : 1) * length;
        for (var i = 0; i < axisData.tuftCount; i++) {
            var left = axisSize.startPos + axisSize.labelDistance * i - length / 2;
            var tmpheight = 0;
            var cutlines = [];
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
                if (k > 0) { height -= cutlinewidth / 2; }
                if (height + top > axisSize.maxY) {
                    height = axisSize.maxY - top;
                }
                var linetop = null;
                if (cutlinewidth > 0 && k < axisData.demanCount - 1) {
                    linetop = top - cutlinewidth / 2;
                    if (linetop + cutlinewidth / 2 + 1 > axisSize.maxY) { linetop = axisSize.maxY - cutlinewidth / 2 - 1 }
                }
                var data = null;
                if (complete) {
                    data = { click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, text: item.text, indexX: i, indexY: k, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight };
                    if (percentType) { data.percent = values[i]; data.value = item.value[i]; }
                    else { data.value = values[i]; }
                    if (!inner.coordinates.histograms[graphicID][i]) { inner.coordinates.histograms[graphicID][i] = []; }
                    inner.coordinates.histograms[graphicID][i][k] = { left: left, top: top, width: width, height: height, color: color };
                }
                var shape = new histogramShape(i, k, left, top, width, height, color, item.topcolor, item.rightcolor, data, linetop);
                histograms.push(shape);
            }
        }
        histograms.sort(function (shape0, shape1) {
            if (shape0.indexX == shape1.indexX) { return shape0.indexY - shape1.indexY; }
            else { return shape0.indexX - shape1.indexX; }
        });
        for (var i = 0, shape; shape = histograms[i]; i++) {
            drawPart(shape, shape.color, false, true, cutlinewidth > 1);
        }
        if (cutlinewidth > 0 && cutlinewidth <= 1) {
            for (var i = 0, shape; shape = histograms[i]; i++) {
                drawPart(shape, shape.color, false, false, true);
            }
        }
        if (complete) {
            for (var i = 0, shape; shape = histograms[i]; i++) {
                drawPart(shape, shape.color, false, false, false, true);
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
                    if (shape.left + shape.width - widthdistance <= x && shape.left + shape.width >= x) {
                        var _y = shape.top + heightdistance * (shape.left + shape.width - x) / widthdistance;
                        if (_y <= y && _y + shape.height >= y) {
                            veryShape = shape; break;
                        }
                    }
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
            drawPart(shape, shape.color, false, true, cutlinewidth > 1);
        }
        if (cutlinewidth > 0 && cutlinewidth <= 1) {
            for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
                drawPart(shape, shape.color, false, false, true);
            }
        }
        for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
            drawPart(shape, shape.color, false, false, false, true);
        }
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};