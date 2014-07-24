if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.Points = {
        NodeLineColor: '#ffffff',
        AlignlineLineColor: null
    };
}
LChart.Points = LChart.getCore().__extends({ GraphType: 'Points' });
LChart.Points._spreadSkin = function (newOps, skin) {
    newOps.node = {}; newOps.alignline = {};
    newOps.node.linecolor = skin.NodeLineColor || null;
    newOps.alignline.linecolor = skin.AlignlineLineColor || null;
};
LChart.Points._getDefaultOptions = function (originalCommonOptions) {
    var options = LChart.Methods.Extend(originalCommonOptions, {
        invertAxis: false,
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
            colors: null,
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
LChart.Points._getCheckOptions = function () {
    return {
        __top: [['invertAxis', 'b']],
        labelAxis: [['valueType', 's'], ['content', 'f'], ['interval', 'n'], ['sort', 'b']],
        node: [['colors', 'ca'], ['nodetype', 's'], ['linecolor', 'c'], ['linewidth', 'n'], ['length', 'n'], ['fillcolor', 'c']],
        tip: [['merge', 'b'], ['spotdistance', 'n']],
        alignline: [['verticalline', 'b'], ['horizontalline', 'b'], ['linecolor', 'c']],
        scale: [['drawvertical', 'b']]
    };
};
LChart.Points._drawgraphic = function (inner, graphicID, innerData, options) {
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

    var nodecolors = (options.node.colors && options.node.colors.length > 0 ? options.node.colors : null) || LChart.Const.Defaults.FillColors;
    if (lineIsMain) {
        inner.coordinates.draw = coordinate;
        inner._configs.legendColors = nodecolors;
    }
    var specificConfig = inner._configs.specificConfig[graphicID];
    var pointsPosition = inner._configs.pointsPosition;
    specificConfig.mergeTips = [];
    var valueAxisLength = (invertAxis ? axisSize.maxX - axisSize.minX : axisSize.maxY - axisSize.minY);
    var labelAxisLength = (invertAxis ? axisSize.maxY - axisSize.minY : axisSize.maxX - axisSize.minX);
    var nodelength = options.node.length || LChart.Methods.CapValue(labelAxisLength / 100, 10, 6);
    var nodeShape = function (index, centerX, centerY, length, data, color) {
        this.index = index;
        this.centerX = centerX;
        this.centerY = centerY;
        this.color = color;
        this.isHovered = false;
        this.nodelength = length;
        this.data = data;
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
    var drawnode = function (x, y, color, nodeinfo) {
        var ops = options.node;
        var _nodelength = nodeinfo.nodelength || nodelength;
        var nodetype = nodeinfo.nodetype || ops.nodetype || 'c';
        var nodelinecolor = nodeinfo.nodelinecolor || ops.linecolor || color;
        var nodelinewidth = nodeinfo.nodelinewidth || ops.linewidth;
        inner.DrawFigures.createPointElement(nodetype, x, y, _nodelength, color, true, nodelinecolor, nodelinewidth, true, true);
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
                    return val == 0 ? 0 : labelAxisLength * val / (axisData.tuftCount - 1);
                }
                else {
                    if (lineIsMain) { return val == 0 ? 0 : labelAxisLength * val / (innerData.length - 1); }
                    else { return axisSize.labelDistance * val; }
                }
            }
        };
        var addPointsShape = function (i, index, x, y, _nodelength, color, vvalue, lvalue, text, vpercent, dataitem) {
            if (percentAnimComplete >= 1) {
                var data = { vvalue: vvalue, lvalue: lvalue, text: text, click: dataitem.click, mouseover: dataitem.mouseover, mouseleave: dataitem.mouseleave, nodetype: dataitem.nodetype, nodelength: dataitem.nodelength, nodelinecolor: dataitem.nodelinecolor, nodelinewidth: dataitem.nodelinewidth, nodefillcolor: dataitem.nodefillcolor };
                if (vpercent != null) { data.vpercent = vpercent; }
                var shape = new nodeShape(index, x, y, _nodelength, data, color);
                inner.shapes[graphicID].nodes.push(shape);
                if (i >= 0) { inner.coordinates.nodes[graphicID][i][index] = { centerX: x, centerY: y, length: _nodelength }; }
                else { inner.coordinates.nodes[graphicID][index] = { centerX: x, centerY: y, length: _nodelength }; }
            }
        };
        var lvalue, vvalue, vpercent, center1, center2;
        if (axisData.multiple) {
            for (var i = 0, dataitem; dataitem = innerData[i]; i++) {
                var text = dataitem.text || '';
                var color = dataitem.color || nodecolors[i % nodecolors.length];
                var nodetype = dataitem.nodetype;
                if (percentAnimComplete >= 1) { inner.coordinates.nodes[graphicID][i] = []; }
                for (var k = 0; k < dataitem.value.length; k++) {
                    subitem = dataitem.value[k];
                    lvalue = lValueType ? subitem[0] : k;
                    vvalue = lValueType ? subitem[1] : subitem;
                    vpercent = percentType ? dataitem.percent[k] : null;
                    center2 = invertAxis ? axisSize.minX + getValueHeight(percentType ? vpercent : vvalue) : axisSize.maxY - getValueHeight(percentType ? vpercent : vvalue);
                    if (pointsPosition) {
                        center1 = pointsPosition[i] + (invertAxis ? -pointsPosition.labelDistance * k : pointsPosition.labelDistance * k);
                    }
                    else {
                        center1 = (invertAxis ? axisSize.maxY - getLabelWidth(lvalue) : axisSize.minX + getLabelWidth(lvalue));
                    }
                    drawnode(invertAxis ? center2 : center1, invertAxis ? center1 : center2, color, dataitem);
                    addPointsShape(i, k, invertAxis ? center2 : center1, invertAxis ? center1 : center2, dataitem.nodelength || nodelength, color, vvalue, lvalue, text, vpercent, dataitem);
                }
            }
        }
        else {
            for (var i = 0; i < innerData.length; i++) {
                var subitem = innerData[i];
                var text = subitem.text || '';
                var color = subitem.color || (options.node.colors && options.node.colors.length > 0 ? nodecolors[i % nodecolors.length] : null) || options.node.fillcolor || '#000000';
                lvalue = lValueType ? subitem.value[0] : i;
                vvalue = lValueType ? subitem.value[1] : subitem.value;
                vpercent = percentType ? innerData[i].percent : null;
                center1 = lineIsMain ? (invertAxis ? axisSize.maxY - getLabelWidth(lvalue) : axisSize.minX + getLabelWidth(lvalue)) : axisSize.startPos + (invertAxis ? -getLabelWidth(lvalue) : getLabelWidth(lvalue));
                center2 = invertAxis ? axisSize.minX + getValueHeight(percentType ? vpercent : vvalue) : axisSize.maxY - getValueHeight(percentType ? vpercent : vvalue);
                drawnode(invertAxis ? center2 : center1, invertAxis ? center1 : center2, color, subitem);
                addPointsShape(-1, i, invertAxis ? center2 : center1, invertAxis ? center1 : center2, subitem.nodelength || nodelength, color, vvalue, lvalue, text, vpercent, subitem);
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
                var startDistance = (invertAxis ? axisSize.maxY : axisSize.minX);
                var referPos = (invertAxis ? y : x);
                if (axisData.tuftCount == 1) {
                    if (Math.abs(startDistance - referPos) < spotdistance) {
                        index = 0;
                        loc = startDistance;
                    }
                }
                else {
                    var cut = labelAxisLength / (axisData.tuftCount - 1);

                    for (var i = 1; i < axisData.tuftCount; i++) {
                        var x1 = startDistance + (invertAxis ? -i * cut : (i - 1) * cut);
                        var x2 = startDistance + (invertAxis ? -(i - 1) * cut : i * cut);
                        if (x1 <= referPos && x2 >= referPos) {
                            var distance1 = Math.abs(x1 - referPos);
                            var distance2 = Math.abs(x2 - referPos);
                            if (distance1 < spotdistance && distance1 <= distance2) {
                                index = invertAxis ? i : i - 1;
                                loc = x1;
                            }
                            else if (distance2 < spotdistance && distance2 <= distance1) {
                                index = invertAxis ? i - 1 : i;
                                loc = x2;
                            }
                            break;
                        }
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
        var centerX, centerY = null;
        for (var i = 0; i < inner.shapes[graphicID].nodes.length; i++) {
            var shape = inner.shapes[graphicID].nodes[i];
            drawnode(shape.centerX, shape.centerY, shape.color, shape.data);
        }
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};