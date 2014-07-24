if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.QueueHistogram3D = {
        LabelColor: null
    };
}
LChart.QueueHistogram3D = LChart.getCore().__extends({ GraphType: 'QueueHistogram3D' });
LChart.QueueHistogram3D._spreadSkin = function (newOps, skin) {
    newOps.label = {};
    newOps.label.color = skin.LabelColor || null;
};
LChart.QueueHistogram3D._getDefaultOptions = function (originalCommonOptions) {
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
LChart.QueueHistogram3D._getCheckOptions = function () {
    return {
        __top: [['animateY', 'b'], ['animateX', 'b'], ['contrastmode', 'b']],
        histogram: [['colors', 'ca'], ['length', 'n'], ['gap', 'n'], ['useSameColor', 'b']],
        label: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};
LChart.QueueHistogram3D._drawgraphic = function (inner, graphicID, innerData, options) {
    if (options.valueType == 'p') {
        throw new Error(inner._messages.WrongParam + inner._messages.ValueTypeMustNotBePercent);
    }
    inner._configs.recreateAssists = true;
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
    if (graphicID == inner.ID) {
        inner.coordinates.draw = coordinate;
        inner._configs.legendColors = colors;
    }
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
    var drawsplitpoint = function () {
        var linewidth = options.splitLine.linewidth;
        if (options.splitLine.show && linewidth && linewidth > 0) {
            var linecolor = options.splitLine.linecolor || '#cccccc';
            var stagewidth = axisSize.stagewidth;
            var left = axisSize.minX - stagewidth * axisSize.sinsightangle;
            var top = axisSize.splitLinePos + stagewidth * axisSize.cossightangle;
            inner.DrawFigures.create3DHistogram(left, top, axisSize.maxX - axisSize.minX, linewidth, linecolor, 0, axisSize.sightangle, stagewidth, null, LChart.Methods.getDarkenColor(linecolor, 0.7), LChart.Methods.getDarkenColor(linecolor, 0.8));
        }
    };
    var drawPart = function (shape, color, mouseon, drawgraphic, drawtext) {
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
                var centerX = (shape.left + _left) / 2 + shape.width / 2;
                var size = ops.fontsize || LChart.Methods.CapValue(shape.width / 2, 18, 11);
                var centerY = shape.isSmall ? _top + shape.height + size : shape.top - size / 3;
                inner.DrawFigures.createText(content, centerX, centerY, 'center', shape.data.fontweight || ops.fontweight, shape.data.fontsize || size, ops.fontfamily, shape.data.fontcolor || ops.color);
            }
        }
    };
    var barShape = function (isSmall, indexX, indexY, left, top, width, height, color, topcolor, rightcolor, data) {
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
        this.topcolor = topcolor;
        this.rightcolor = rightcolor;
        this.redraw = function (mouseon, drawgraphic, drawtext, color) {
            drawPart(this, color, mouseon, drawgraphic, drawtext);
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
        var complete = percentAnimComplete >= 1;
        var histograms = [];
        for (var i = 0, item; item = innerData[i]; i++) {
            var width = (options.animateX ? animationDecimal : 1) * length;
            if (axisData.multiple) {
                var color = item.color || colors[i % colors.length];
                var cut = demanCount / 2 - (contrastmode ? parseInt(i / 2) : i);
                for (var k = 0; k < item.value.length; k++) {
                    var val = item.value[k];
                    var isSmall = val < splitpoint;
                    var left = axisSize.startPos + axisSize.labelDistance * k - cut * length - (cut - 0.5) * gap;
                    var height = getHeight(val);
                    var top = isSmall ? axisSize.splitLinePos : axisSize.splitLinePos - height;
                    var data = null;
                    if (complete) {
                        data = { text: item.text, value: val, indexX: i, indexY: k, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight, click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave };
                        if (!inner.coordinates.histograms[graphicID][k]) { inner.coordinates.histograms[graphicID][k] = []; }
                        inner.coordinates.histograms[graphicID][k][i] = { left: left, top: top, width: width, height: height, color: color };
                    }
                    var shape = new barShape(isSmall, i, k, left, top, width, height, color, item.topcolor, item.rightcolor, data);
                    histograms.push(shape);
                }
            }
            else {
                var val = item.value;
                var isSmall = val < splitpoint;
                var left = axisSize.startPos + axisSize.labelDistance * i - length / 2;
                var height = getHeight(val);
                var top = isSmall ? axisSize.splitLinePos : axisSize.splitLinePos - height;
                var color = item.color || (options.histogram.useSameColor ? 'rgba(69,114,167,1)' : colors[i % colors.length]);
                var data = null;
                if (complete) {
                    data = { text: item.text, value: val, indexX: i, indexY: null, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight, click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave };
                    inner.coordinates.histograms[graphicID][i] = { left: left, top: top, width: width, height: height, color: color };
                }
                var shape = new barShape(isSmall, i, null, left, top, width, height, color, item.topcolor, item.rightcolor, data);
                histograms.push(shape);
            }
        }
        for (var i = 0, shape; shape = histograms[i]; i++) {
            if (shape.isSmall) {
                drawPart(shape, shape.color, false, true);
            }
        }
        drawsplitpoint();
        for (var i = 0, shape; shape = histograms[i]; i++) {
            if (!shape.isSmall) {
                drawPart(shape, shape.color, false, true);
            }
        }
        if (complete) {
            for (var i = 0, shape; shape = histograms[i]; i++) {
                drawPart(shape, shape.color, false, false, true);
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
                    var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                    if (mouseleave) {
                        mouseleave(shape.data, e);
                    }
                }
                if (specificConfig.currentMouseShape) {
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
            if (shape.isSmall) {
                shape.redraw(false, true);
            }
        }
        drawsplitpoint();
        for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
            if (!shape.isSmall) {
                shape.redraw(false, true);
            }
        }
        for (var i = 0, shape; shape = inner.shapes[graphicID].histograms[i]; i++) {
            shape.redraw(false, false, true);
        }
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};