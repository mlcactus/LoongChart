if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.RangeBar = {
        SmallLabelColor: null,
        BigLabelColor: null
    };
}
LChart.RangeBar = LChart.getCore().__extends({ GraphType: 'RangeBar' });
LChart.RangeBar._spreadSkin = function (newOps, skin) {
    newOps.smallLabel = {};
    newOps.smallLabel.color = skin.SmallLabelColor || null;
    newOps.bigLabel = {};
    newOps.bigLabel.color = skin.BigLabelColor || null;
};
LChart.RangeBar._getDefaultOptions = function (originalCommonOptions) {
    var options = LChart.Methods.Extend(originalCommonOptions, {
        animateY: true,
        animateX: true,
        bar: {
            colors: null,
            length: null,
            gap: null,
            useSameColor: true
        },
        tip: {
            content: function (data) {
                var val = null;
                if (this.valueType == 'd') { val = '<br/>Small Value: ' + data.value[0].format('yyyy-MM-dd') + '<br/>Big Value: ' + data.value[1].format('yyyy-MM-dd'); }
                else if (this.valueType == 't') { val = '<br/>Small Value: ' + data.value[0].format('MM-dd hh:mm') + '<br/>Big Value: ' + data.value[1].format('MM-dd hh:mm'); }
                else if (this.valueType == 'm') { val = '<br/>Small Value: ' + data.value[0].format('hh:mm:ss.S') + '<br/>Big Value: ' + data.value[1].format('hh:mm:ss.S'); }
                else { val = '<br/>Small Value: ' + data.value[0] + '<br/>Big Value: ' + data.value[1]; }
                return '<div>' + data.text + '：' + val + '&nbsp;</div>';
            }
        },
        smallLabel: {
            show: true,
            content: function (val) {
                if (this.valueType == 'd') { return val.format('yyyy-MM-dd'); }
                else if (this.valueType == 't') { return val.format('MM-dd hh:mm'); }
                else if (this.valueType == 'm') { return val.format('hh:mm:ss.S'); }
                else { return val.toString(); }
            },
            color: null,
            fontweight: null,
            fontsize: null,
            fontfamily: null
        },
        bigLabel: {
            show: true,
            content: function (val) {
                if (this.valueType == 'd') { return val.format('yyyy-MM-dd'); }
                else if (this.valueType == 't') { return val.format('MM-dd hh:mm'); }
                else if (this.valueType == 'm') { return val.format('hh:mm:ss.S'); }
                else { return val.toString(); }
            },
            color: null,
            fontweight: null,
            fontsize: null,
            fontfamily: null
        }
    });
    return options;
};
LChart.RangeBar._getCheckOptions = function () {
    return {
        __top: [['animateY', 'b'], ['animateX', 'b']],
        bar: [['colors', 'ca'], ['length', 'n'], ['gap', 'n'], ['useSameColor', 'b']],
        smallLabel: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']],
        bigLabel: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};
LChart.RangeBar._drawgraphic = function (inner, graphicID, innerData, options) {
    if (options.valueType == 'p') {
        throw new Error(inner._messages.WrongParam + inner._messages.ValueTypeMustNotBePercent);
    }
    if (graphicID == inner.ID) {
        inner._configs.invertAxis = true;
        inner._configs.valueAxiaDataIsRange = true;
    }

    var axisData = inner._formatAxisData();
    var valids = inner._calculateOutersValid();
    var axisSize = inner._computeAxis(valids);
    var coordinate = inner._getDrawableCoordinate();

    inner.shapes[graphicID] = { bars: [] };
    if (!inner.coordinates.bars) { inner.coordinates.bars = {}; }
    inner.coordinates.bars[graphicID] = [];
    var specificConfig = inner._configs.specificConfig[graphicID];

    var percentType = axisData.vValueType == 'p';
    var showshadow = options.shadow.show && options.shadow.blur > 0;
    var shadow = options.shadow.show ? options.shadow : null;
    var length = options.bar.length;
    var gap = options.bar.gap;
    if (axisData.multiple) {
        if (gap && gap > 0) {
            var maxGap = (axisSize.labelDistance - axisData.demanCount * 2) / (axisData.demanCount + 1);
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
        var maxLen = axisData.multiple ? ((axisSize.labelDistance - (axisData.demanCount + 1) * gap) / axisData.demanCount) : axisSize.labelDistance * 0.8;
        length = Math.min(length, maxLen);
    }
    else {
        length = (axisSize.labelDistance - (axisData.demanCount + 1) * gap) / (axisData.multiple ? (axisData.demanCount + 0.5) : 1.5);
    }
    var colors = (options.bar.colors && options.bar.colors.length > 0 ? options.bar.colors : null) || LChart.Const.Defaults.FillColors;
    if (graphicID == inner.ID) {
        inner.coordinates.draw = coordinate;
        inner._configs.legendColors = colors;
    }

    var drawPart = function (left, top, width, height, color, data, _shadow) {
        inner.DrawFigures.createRectangleFill(left, top, width, height, color, _shadow || shadow);
        if (data) {
            var smallVal = data.value[0];
            var bigVal = data.value[1];
            if (smallVal > bigVal) { smallVal = data.value[1]; bigVal = data.value[0]; }
            var ops = options.smallLabel;
            if (ops.show) {
                var minContent = typeof ops.content == 'function' ? ops.content.call(options, smallVal) : '';
                if (minContent) {
                    var fontsize = data.smallfontsize || ops.fontsize || LChart.Methods.CapValue(height, 18, 11);
                    var fontweight = data.smallfontweight || ops.fontweight;
                    var fontcolor = data.smallfontcolor || ops.color;
                    var _right = left - fontsize / 2;
                    var _top = top + height / 2 + fontsize / 3;
                    inner.DrawFigures.createText(minContent, _right, _top, 'right', fontweight, fontsize, ops.fontfamily, fontcolor);
                }
            }
            ops = options.bigLabel;
            if (ops.show) {
                var maxContent = typeof ops.content == 'function' ? ops.content.call(options, bigVal) : '';
                if (maxContent) {
                    var fontsize = data.bigfontsize || ops.fontsize || LChart.Methods.CapValue(height, 18, 11);
                    var fontweight = data.bigfontweight || ops.fontweight;
                    var fontcolor = data.bigfontcolor || ops.color;
                    var _left = left + width + fontsize / 2;
                    var _top = top + height / 2 + fontsize / 3;
                    inner.DrawFigures.createText(maxContent, _left, _top, 'left', fontweight, fontsize, ops.fontfamily, fontcolor);
                }
            }
        }
    };
    var barShape = function (indexX, indexY, left, top, width, height, color, data) {
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
            var tmpshadow = shadow;
            if (showshadow && color) {
                tmpshadow = LChart.Methods.DeepCopy(shadow);
                tmpshadow.color = color;
            }
            drawPart(this.left, this.top, this.width, this.height, color || this.color, drawlabel ? this.data : null, tmpshadow);
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
        var getDiffWidth = function (small, big, animation) {
            var width = (animation && options.animateX ? animationDecimal : 1) * (axisSize.maxX - axisSize.minX) * inner._getFormatDiff(axisData.vValueType, small, big) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
            return width;
        };
        for (var i = 0, item; item = innerData[i]; i++) {
            var height = (options.animateY ? animationDecimal : 1) * length;
            if (axisData.multiple) {
                var color = item.color || colors[i % colors.length];
                var values = percentType ? item.percent : item.value;
                for (var k = 0; k < values.length; k++) {
                    var val = values[k];
                    var cut = axisData.demanCount / 2 - i;
                    var top = axisSize.startPos - axisSize.labelDistance * k - cut * length - (cut - 0.5) * gap;
                    var width = getDiffWidth(val[0], val[1], true);
                    var left = axisSize.minX + getDiffWidth(axisData.vMinValue, Math.min(val[0], val[1]));
                    if (percentAnimComplete >= 1) {
                        var data = { click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, text: item.text, indexX: k, indexY: i, bigfontcolor: item.bigfontcolor, bigfontsize: item.bigfontsize, bigfontweight: item.bigfontweight, smallfontcolor: item.smallfontcolor, smallfontsize: item.smallfontsize, smallfontweight: item.smallfontweight };
                        if (percentType) {
                            data.percent = val;
                            data.value = item.value[k];
                        }
                        else { data.value = val; }
                        var shape = new barShape(k, i, left, top, width, height, color, data);
                        inner.shapes[graphicID].bars.push(shape);
                        drawPart(left, top, width, height, color, data);
                        if (!inner.coordinates.bars[graphicID][k]) { inner.coordinates.bars[graphicID][k] = []; }
                        inner.coordinates.bars[graphicID][k][i] = { left: left, top: top, width: width, height: height, color: color };
                    }
                    else {
                        drawPart(left, top, width, height, color);
                    }
                }
            }
            else {
                var top = axisSize.startPos - axisSize.labelDistance * i - length / 2;
                var val = percentType ? item.percent : item.value;
                var width = getDiffWidth(val[0], val[1], true);
                var left = axisSize.minX + getDiffWidth(axisData.vMinValue, Math.min(val[0], val[1]));
                var color = item.color || (options.bar.useSameColor ? 'rgba(69,114,167,1)' : colors[i % colors.length]);
                if (percentAnimComplete >= 1) {
                    item.indexX = i;
                    item.indexY = 1;
                    var shape = new barShape(i, 1, left, top, width, height, color, item);
                    inner.shapes[graphicID].bars.push(shape);
                    drawPart(left, top, width, height, color, item);
                    inner.coordinates.bars[graphicID][i] = { left: left, top: top, width: width, height: height, color: color };
                }
                else {
                    drawPart(left, top, width, height, color);
                }
            }
        }
    };
    var mouseEvents = function () {
        var fixShape = function (x, y) {
            var veryShape = null;
            for (var i = 0, shape; shape = inner.shapes[graphicID].bars[i]; i++) {
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
                for (var i = 0, shape; shape = inner.shapes[graphicID].bars[i]; i++) {
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
        for (var i = 0, shape; shape = inner.shapes[graphicID].bars[i]; i++) {
            shape.redraw(true);
        }
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};