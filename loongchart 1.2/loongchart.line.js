if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.Line = {
        NodeLineColor: '#ffffff',
        AlignlineLineColor: null
    };
}
LChart.Line = LChart.getCore().__extends({ GraphType: 'Line' });
LChart.Line._spreadSkin = function (newOps, skin) {
    newOps.node = {}; newOps.alignline = {};
    newOps.node.linecolor = skin.NodeLineColor || null;
    newOps.alignline.linecolor = skin.AlignlineLineColor || null;
};
LChart.Line._getDefaultOptions = function (originalCommonOptions) {
    var options = LChart.Methods.Extend(originalCommonOptions, {
        invertAxis: false,
        line: {
            colors: null,
            linewidth: null,
            smoothline: false
        },
        labelAxis: {
            valueType: null,
            content: function (val) {
                if (this.valueType == 'd') { return val.format('yyyy-MM-dd'); }
                else if (this.valueType == 't') { return val.format('MM-dd hh:mm'); }
                else if (this.valueType == 'm') { return val.format('hh:mm:ss.S'); }
                else { return val.toString(); }
            },
            minvalue: null,
            maxvalue: null,
            interval: null,
            sort: true
        },
        node: {
            show: true,
            nodetype: null,
            linecolor: null,
            linewidth: null,
            length: null,
            fillcolor: null
        },
        tip: {
            merge: false,
            spotdistance: 10,
            content: function (data, merge) {
                if (merge) {
                    var res = '<div>';
                    for (var i = 0; i < data.length; i++) {
                        var val = this.valueType == 'p' ? data[i].vpercent.toFixed(2) + '%' : data[i].vvalue.toString();
                        res += (i > 0 ? '<br/>' : '') + data[i].text + " : " + val;
                    }
                    res += '&nbsp;</div>';
                    return res;
                }
                else {
                    var val = this.valueType == 'p' ? data.vpercent.toFixed(2) + '%' : data.vvalue.toString();
                    if (this.valueType == 'd') { val = data.vvalue.format('yyyy-MM-dd'); }
                    else if (this.valueType == 't') { val = data.vvalue.format('MM-dd hh:mm'); }
                    else if (this.valueType == 'm') { val = data.vvalue.format('hh:mm:ss.S'); }
                    return '<div>&nbsp;' + (data.text ? data.text + '：' : '') + val + '&nbsp;</div>';
                }
            }
        },
        alignline: {
            verticalline: true,
            horizontalline: true,
            linecolor: null
        },
        scale: {
            drawvertical: true
        }
    });
    return options;
};
LChart.Line._getCheckOptions = function () {
    return {
        __top: [['invertAxis', 'b']],
        line: [['colors', 'ca'], ['linewidth', 'n'], ['smoothline', 'b']],
        labelAxis: [['valueType', 's'], ['content', 'f'], ['interval', 'n'], ['sort', 'b']],
        node: [['show', 'b'], ['nodetype', 's'], ['linecolor', 'c'], ['linewidth', 'n'], ['length', 'n'], ['fillcolor', 'c']],
        tip: [['merge', 'b'], ['spotdistance', 'n']],
        alignline: [['verticalline', 'b'], ['horizontalline', 'b'], ['linecolor', 'c']],
        scale: [['drawvertical', 'b']]
    };
};
LChart.Line._drawgraphic = function (inner, graphicID, innerData, options) {
    inner._configs.recreateAssists = true;
    var invertAxis = options.invertAxis;
    var lineIsMain = graphicID == inner.ID;
    if (lineIsMain) {
        inner._configs.invertAxis = invertAxis;
        if (options.labelAxis.valueType == 'p') {
            throw new Error(inner._messages.WrongParam + inner._messages.LabelAxisValueTypeCannotBePercent);
        }
    }
    var axisData = inner._formatAxisData();
    if (axisData.tuftCount < 2) {
        throw new Error(inner._messages.WrongData + inner._messages.NeedLeastTwoPoints);
    }
    var valids = inner._calculateOutersValid();
    var axisSize = inner._computeAxis(valids);
    var coordinate = inner._getDrawableCoordinate();

    if (!inner.coordinates.nodes) { inner.coordinates.nodes = {}; }
    inner.coordinates.nodes[graphicID] = { nodes: [] };
    inner.shapes[graphicID] = { nodes: [] };

    var lValueType = options.labelAxis.valueType;
    var percentType = axisData.vValueType == 'p';
    var spotdistance = LChart.Methods.IsNumber(options.tip.spotdistance) && options.tip.spotdistance > 0 ? options.tip.spotdistance : 10;
    var alignlinecolor = options.alignline.linecolor || LChart.Const.Defaults.AlignLineColor;

    var linecolors = (options.line.colors && options.line.colors.length > 0 ? options.line.colors : null) || LChart.Const.Defaults.FillColors;
    if (lineIsMain) {
        inner.coordinates.draw = coordinate;
        inner._configs.legendColors = linecolors;
    }
    var redrawRecord = {};
    var specificConfig = inner._configs.specificConfig[graphicID];
    var pointsPosition = inner._configs.pointsPosition;
    specificConfig.mergeTips = [];
    var valueAxisLength = (invertAxis ? axisSize.maxX - axisSize.minX : axisSize.maxY - axisSize.minY);
    var labelAxisLength = (invertAxis ? axisSize.maxY - axisSize.minY : axisSize.maxX - axisSize.minX);
    var nodelength = options.node.length || LChart.Methods.CapValue(labelAxisLength / 100, 10, 6);
    var drawlineFunction = options.line.smoothline ? inner.DrawFigures.createSmoothLine : inner.DrawFigures.createPointsLine;
    var nodeShape = function (index, centerX, centerY, length, data) {
        this.index = index;
        this.centerX = centerX;
        this.centerY = centerY;
        this.isHovered = false;
        this.data = data;
        this.nodelength = length;
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
                    var centerX = this.centerX + nodelength + 5;
                    var centerY = this.centerY - nodelength - 10;
                    this.tip = inner._createTip(options.tip.content.call(options, this.data, false), centerX, centerY);
                    if (this.centerX + this.tip.clientWidth > axisSize.maxX) {
                        inner._changeTip(this.tip, centerX - 5 - nodelength - this.tip.clientWidth);
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
    var drawnode = function (x, y, linecolor, nodeinfo) {
        var ops = options.node;
        if (ops.show) {
            var _nodelength = nodeinfo.nodelength || nodelength;
            var nodetype = nodeinfo.nodetype || ops.nodetype || 'c';
            var nodelinecolor = nodeinfo.nodelinecolor || ops.linecolor || linecolor;
            var nodelinewidth = nodeinfo.nodelinewidth || ops.linewidth;
            var fillcolor = nodeinfo.nodefillcolor || ops.fillcolor || linecolor;
            inner.DrawFigures.createPointElement(nodetype, x, y, _nodelength, fillcolor, true, nodelinecolor, nodelinewidth, true, true);
        }
    };
    var drawSegments = function (animationDecimal, percentAnimComplete) {
        var getValueHeight = function (val) {
            var height = (options.animation ? animationDecimal : 1) * valueAxisLength * inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, val) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
            return height;
        };
        var getLabelWidth = function (val) {
            if (lValueType) {
                return labelAxisLength * inner._getFormatDiff(axisData.lValueType, axisData.lMinValue, val) / inner._getFormatDiff(axisData.lValueType, axisData.lMinValue, axisData.lMaxValue);
            }
            else {
                if (axisData.multiple) {
                    return labelAxisLength * val / (axisData.tuftCount - 1);
                }
                else {
                    if (lineIsMain) { return labelAxisLength * val / (innerData.length - 1); }
                    else { return axisSize.labelDistance * val; }
                }
            }
        };
        var addNodeShape = function (i, index, x, y, _nodelength, vvalue, lvalue, text, vpercent, click, mouseover, mouseleave) {
            if (percentAnimComplete >= 1) {
                var data = { vvalue: vvalue, lvalue: lvalue, text: text };
                if (vpercent != null) { data.vpercent = vpercent; }
                if (typeof click == 'function') { data.click = click; }
                if (typeof mouseover == 'function') { data.mouseover = mouseover; }
                if (typeof mouseleave == 'function') { data.mouseleave = mouseleave; }
                var shape = new nodeShape(index, x, y, _nodelength, data);
                inner.shapes[graphicID].nodes.push(shape);
                if (i >= 0) { inner.coordinates.nodes[graphicID].nodes[i][index] = { centerX: x, centerY: y, length: _nodelength }; }
                else { inner.coordinates.nodes[graphicID].nodes[index] = { centerX: x, centerY: y, length: _nodelength }; }
            }
        };
        var lvalue, vvalue, vpercent, center1, center2;
        if (axisData.multiple) {
            var nodepoints = [];
            for (var i = 0, item; item = innerData[i]; i++) {
                var points = [];
                var linewidth = item.linewidth || options.line.linewidth || LChart.Const.Defaults.LineWidth;
                var linecolor = item.color || linecolors[i % linecolors.length];
                var text = item.text || '';
                if (percentAnimComplete >= 1) { inner.coordinates.nodes[graphicID].nodes[i] = []; }
                var count = item.value.length;
                for (var k = 0; k < count; k++) {
                    subitem = item.value[k];
                    lvalue = lValueType ? subitem[0] : k;
                    vvalue = lValueType ? subitem[1] : subitem;
                    vpercent = percentType ? item.percent[k] : null;
                    center2 = invertAxis ? axisSize.minX + getValueHeight(percentType ? vpercent : vvalue) : axisSize.maxY - getValueHeight(percentType ? vpercent : vvalue);
                    if (pointsPosition) {
                        center1 = pointsPosition[i] + (invertAxis ? -pointsPosition.labelDistance * k : pointsPosition.labelDistance * k);
                    }
                    else {
                        center1 = (invertAxis ? axisSize.maxY - getLabelWidth(lvalue) : axisSize.minX + getLabelWidth(lvalue));
                    }
                    points.push(invertAxis ? [center2, center1] : [center1, center2]);
                    addNodeShape(i, k, invertAxis ? center2 : center1, invertAxis ? center1 : center2, item.nodelength || nodelength, vvalue, lvalue, text, vpercent, item.click, item.mouseover, item.mouseleave);
                }
                var nodeinfo = { points: points, linewidth: linewidth, linecolor: linecolor, nodetype: item.nodetype, nodelength: item.nodelength, nodelinecolor: item.nodelinecolor, nodelinewidth: item.nodelinewidth, nodefillcolor: item.nodefillcolor };
                nodepoints.push(nodeinfo);
                if (percentAnimComplete >= 1) {
                    if (!redrawRecord.nodeinfos) { redrawRecord.nodeinfos = []; }
                    redrawRecord.nodeinfos[i] = nodeinfo;
                }
            }
            for (var i = 0; i < nodepoints.length; i++) {
                var points = nodepoints[i].points;
                drawlineFunction(points, nodepoints[i].linewidth, nodepoints[i].linecolor, invertAxis);
                for (var j = 0; j < points.length; j++) {
                    var point = points[j];
                    drawnode(point[0], point[1], nodepoints[i].linecolor, nodepoints[i]);
                }
            }
        }
        else {
            var linewidth = options.line.linewidth || LChart.Const.Defaults.LineWidth;
            var linecolor = linecolors[0];
            var points = [];
            var count = innerData.length;
            for (var i = 0; i < count; i++) {
                subitem = innerData[i];
                var text = subitem.text || '';
                lvalue = lValueType ? subitem.value[0] : i;
                vvalue = lValueType ? subitem.value[1] : subitem.value;
                vpercent = percentType ? innerData[i].percent : null;
                center1 = lineIsMain ? (invertAxis ? axisSize.maxY - getLabelWidth(lvalue) : axisSize.minX + getLabelWidth(lvalue)) : axisSize.startPos + (invertAxis ? -getLabelWidth(lvalue) : getLabelWidth(lvalue));
                center2 = invertAxis ? axisSize.minX + getValueHeight(percentType ? vpercent : vvalue) : axisSize.maxY - getValueHeight(percentType ? vpercent : vvalue);
                points.push(invertAxis ? [center2, center1] : [center1, center2]);
                addNodeShape(-1, i, invertAxis ? center2 : center1, invertAxis ? center1 : center2, subitem.nodelength || nodelength, vvalue, lvalue, text, vpercent, subitem.click, subitem.mouseover, subitem.mouseleave);
            }
            if (percentAnimComplete >= 1) {
                redrawRecord.points = points;
                redrawRecord.linewidth = linewidth;
                redrawRecord.linecolor = linecolor;
            }
            drawlineFunction(points, linewidth, linecolor, invertAxis);
            for (var j = 0; j < points.length; j++) {
                var point = points[j];
                drawnode(point[0], point[1], linecolor, innerData[j]);
            }
        }
    };
    var mouseEvents = function () {
        var fixSingleShape = function (x, y) {
            var veryShape = null;
            for (var i = inner.shapes[graphicID].nodes.length - 1; i >= 0; i--) {
                var shape = inner.shapes[graphicID].nodes[i];
                if (Math.sqrt(Math.pow(x - shape.centerX, 2) + Math.pow(y - shape.centerY, 2)) <= shape.nodelength / 2) {
                    veryShape = shape; break;
                }
            }
            return veryShape;
        };
        var fixRowShapes = function (x, y) {
            var shapes = [];
            var loc = 0;
            if (y <= axisSize.maxY && y >= axisSize.minY && x >= axisSize.minX && x <= axisSize.maxX) {
                var index = -1;
                var cut = labelAxisLength / (axisData.tuftCount - 1);
                var startDistance = (invertAxis ? axisSize.maxY : axisSize.minX);
                var referPos = (invertAxis ? y : x);
                for (var i = 1; i < axisData.tuftCount; i++) {
                    var x1 = startDistance + (invertAxis ? -i * cut : (i - 1) * cut);
                    var x2 = startDistance + (invertAxis ? -(i - 1) * cut : i * cut);
                    if (x1 <= referPos && x2 >= referPos) {
                        var distance1 = Math.abs(x1 - referPos);
                        var distance2 = Math.abs(x2 - referPos);
                        if (distance1 < spotdistance && distance1 <= distance2) { index = invertAxis ? i : i - 1; loc = x1; }
                        else if (distance2 < spotdistance && distance2 <= distance1) { index = invertAxis ? i - 1 : i; loc = x2; }
                        break;
                    }
                }
                for (var i = 0, shape; shape = inner.shapes[graphicID].nodes[i]; i++) {
                    if (shape.index == index) {
                        shapes.push(shape);
                    }
                }
            }
            return { shapes: shapes, loc: loc };
        };
        var onclick = function (e) {
            var e = window.event || e;
            var location = inner._getMouseLoction(e);
            var veryShape = fixSingleShape(location.X, location.Y);
            if (veryShape) {
                veryShape.click(e);
            }
        };
        var onmousemove = function (e) {
            var e = window.event || e;
            var location = inner._getMouseLoction(e);
            var showByNode = pointsPosition || axisData.lValueType || !axisData.multiple;
            var veryShape = fixSingleShape(location.X, location.Y);
            if (veryShape) { inner._configs.cursorPointer = true; }
            if (specificConfig.currentMouseShape != veryShape) {
                var shape = specificConfig.currentMouseShape;
                if (shape) {
                    var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                    if (mouseleave) {
                        mouseleave(shape.data, e);
                    }
                }
                specificConfig.currentMouseShape = veryShape;
                for (var i = 0, shape; shape = inner.shapes[graphicID].nodes[i]; i++) {
                    if (shape != veryShape && shape.isHovered) {
                        shape.isHovered = false;
                        if (showByNode && shape.hideTip) { shape.hideTip(); }
                    }
                }
                if (veryShape) {
                    veryShape.isHovered = true;
                    if (options.alignline.verticalline || options.alignline.horizontalline) {
                        inner.redrawAll();
                    }
                    if (options.alignline.verticalline) {
                        inner.DrawFigures.createLine(veryShape.centerX, axisSize.minY, veryShape.centerX, axisSize.maxY + 1, 1, alignlinecolor);
                    }
                    if (options.alignline.horizontalline) {
                        inner.DrawFigures.createLine(axisSize.minX, veryShape.centerY, axisSize.maxX, veryShape.centerY, 1, alignlinecolor);
                    }
                    if (veryShape.showTip && showByNode) { veryShape.showTip(); }
                    var mouseover = typeof veryShape.data.mouseover == 'function' ? veryShape.data.mouseover : (options.mouseover || null);
                    if (mouseover) {
                        mouseover(veryShape.data, e);
                    }
                }
                else {
                    if (showByNode && (options.alignline.verticalline || options.alignline.horizontalline)) {
                        inner.redrawAll();
                    }
                }
            }
            if (!showByNode) {
                var fixed = fixRowShapes(location.X, location.Y);
                if (inner.loc != fixed.loc) {
                    inner.loc = fixed.loc;
                    if (options.tip.merge) {
                        for (var i = 0; i < specificConfig.mergeTips.length; i++) {
                            if (specificConfig.mergeTips[i]) {
                                specificConfig.mergeTips[i].style.display = 'none';
                            }
                        }
                    }
                    else {
                        for (var i = 0, shape; shape = inner.shapes[graphicID].nodes[i]; i++) {
                            if (shape.hideTip) { shape.hideTip(); }
                        }
                    }
                    if (invertAxis && options.alignline.horizontalline || !invertAxis && options.alignline.verticalline) {
                        inner.redrawAll();
                    }
                    if (fixed.shapes.length) {
                        if (!invertAxis && options.alignline.verticalline) {
                            inner.DrawFigures.createLine(fixed.loc, axisSize.minY, fixed.loc, axisSize.maxY + 1, 1, alignlinecolor);
                        }
                        if (invertAxis && options.alignline.horizontalline) {
                            inner.DrawFigures.createLine(axisSize.minX, fixed.loc, axisSize.maxX, fixed.loc, 1, alignlinecolor);
                        }
                        if (options.tip.merge) {
                            if (fixed.shapes[0].showTip) {
                                var mergeTip = specificConfig.mergeTips[fixed.shapes[0].index];
                                if (!mergeTip) {
                                    var data = [];
                                    var centerXSum = 0; var centerYSum = 0;
                                    for (var i = 0, shape; shape = fixed.shapes[i]; i++) {
                                        data.push(shape.data);
                                        centerYSum += shape.centerY;
                                        centerXSum += shape.centerX;
                                    }
                                    var centerX = centerXSum / fixed.shapes.length + 5;
                                    var centerY = centerYSum / fixed.shapes.length;
                                    mergeTip = inner._createTip(options.tip.content.call(options, data, true), centerX, centerY);
                                    inner._changeTip(mergeTip, null, centerY - mergeTip.clientHeight / 2 + 10);
                                    if (centerX + mergeTip.clientWidth > axisSize.maxX) {
                                        inner._changeTip(mergeTip, centerX - 5 - nodelength - mergeTip.clientWidth);
                                    }
                                    specificConfig.mergeTips[fixed.shapes[0].index] = mergeTip;
                                }
                                mergeTip.style.display = 'inline';
                            }
                        }
                        else {
                            for (var i = 0, shape; shape = fixed.shapes[i]; i++) {
                                if (shape.showTip) { shape.showTip(); }
                            }
                        }

                    }
                }
            }
        };
        inner._addEventListener('click', onclick);
        inner._addEventListener('mousemove', onmousemove);
    };
    var redraw = function () {
        if (axisData.multiple) {
            for (var i = 0; i < redrawRecord.nodeinfos.length; i++) {
                var points = redrawRecord.nodeinfos[i].points;
                drawlineFunction(points, redrawRecord.nodeinfos[i].linewidth, redrawRecord.nodeinfos[i].linecolor, invertAxis);
                for (var j = 0; j < points.length; j++) {
                    drawnode(points[j][0], points[j][1], redrawRecord.nodeinfos[i].linecolor, redrawRecord.nodeinfos[i]);
                }
            }
        }
        else {
            var points = redrawRecord.points;
            drawlineFunction(points, redrawRecord.linewidth, redrawRecord.linecolor, invertAxis);
            for (var j = 0; j < points.length; j++) {
                drawnode(points[j][0], points[j][1], redrawRecord.linecolor, innerData[j]);
            }
        }
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};