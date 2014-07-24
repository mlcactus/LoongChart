if (!window.LChart) {
    throw new Error('未能加载loongchart.core.js，该js必须在其他LChart框架的js加载之前被引用。\n' +
      'Not loaded loongchart.core.js which must be loaded before other LChart\'s js.');
}
else {
    LChart.Const.Skins.BlackAndWhite.RangeArea = {
        NodeLineColor: '#ffffff',
        NodeFillColor: '#000000',
        AlignlineLineColor: null
    };
}
LChart.RangeArea = LChart.getCore().__extends({ GraphType: 'RangeArea' });
LChart.RangeArea._spreadSkin = function (newOps, skin) {
    newOps.node = {}; newOps.alignline = {};
    newOps.node.linecolor = skin.NodeLineColor || null;
    newOps.node.fillcolor = skin.NodeFillColor || null;
    newOps.alignline.linecolor = skin.AlignlineLineColor || null;
};
LChart.RangeArea._getDefaultOptions = function (originalCommonOptions) {
    var options = LChart.Methods.Extend(originalCommonOptions, {
        invertAxis: false,
        area: {
            linecolors: null,
            linewidth: null,
            smoothline: false,
            fillcolors: null
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
            merge: true,
            spotdistance: 10,
            content: function (data, merge) {
                var formatVal = function (val, valueType) {
                    if (!valueType) { return ''; }
                    var valstr = val.toString();
                    if (valueType == 'd') { valstr = val.format('yyyy-MM-dd'); }
                    else if (valueType == 't') { valstr = val.format('MM-dd hh:mm'); }
                    else if (valueType == 'm') { valstr = val.format('hh:mm:ss.S'); }
                    return valstr;
                };
                if (merge) {
                    var res = '<div>';
                    for (var i = 0, dataitem; dataitem = data[i]; i++) {
                        if (i == 0) {
                            res += (dataitem.min.llabel != null ? dataitem.min.llabel : formatVal(dataitem.min.lvalue, this.labelAxis.valueType)) + '<br/>';
                        }
                        res += 'max, ' + (dataitem.max.text ? dataitem.max.text + ' : ' : '') + formatVal(dataitem.max.vvalue, this.valueType || 'n') + '<br/>';
                        res += 'min, ' + (dataitem.min.text ? dataitem.min.text + ' : ' : '') + formatVal(dataitem.min.vvalue, this.valueType || 'n') + '<br/>';
                    }
                    res += '</div>';
                    return res;
                }
                else {
                    return '<div>' + (data.issmall ? 'min, ' : 'max, ') + (data.llabel != null ? data.llabel : formatVal(data.lvalue, this.labelAxis.valueType)) + '<br/>' + (data.text ? data.text + " : " : '') + formatVal(data.vvalue, this.valueType || 'n') + '</div>';
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
LChart.RangeArea._getCheckOptions = function () {
    return {
        __top: [['invertAxis', 'b']],
        area: [['linecolors', 'ca'], ['linewidth', 'n'], ['fillcolors', 'ca']],
        labelAxis: [['valueType', 's'], ['content', 'f'], ['interval', 'n'], ['sort', 'b']],
        node: [['show', 'b'], ['nodetype', 's'], ['linecolor', 'c'], ['linewidth', 'n'], ['length', 'n'], ['fillcolor', 'c']],
        tip: [['merge', 'b'], ['spotdistance', 'n']],
        alignline: [['verticalline', 'b'], ['horizontalline', 'b'], ['linecolor', 'c']],
        scale: [['drawvertical', 'b']]
    };
};
LChart.RangeArea._drawgraphic = function (inner, graphicID, innerData, options) {
    var lValueType = options.labelAxis.valueType;
    if (lValueType == 'p') {
        throw new Error(inner._messages.WrongParam + inner._messages.LabelAxisValueTypeCannotBePercent);
    }
    if (options.valueType == 'p') {
        throw new Error(inner._messages.WrongParam + inner._messages.ValueTypeMustNotBePercent);
    }

    inner._configs.recreateAssists = true;
    var invertAxis = options.invertAxis;
    var lineIsMain = graphicID == inner.ID;
    if (lineIsMain) {
        inner._configs.invertAxis = invertAxis;
        inner._configs.valueAxiaDataIsRange = true;
    }
    var axisData = inner._formatAxisData();
    if (axisData.tuftCount < 2) {
        throw new Error(inner._messages.WrongData + inner._messages.NeedLeastTwoPoints);
    }
    var valids = inner._calculateOutersValid();
    var axisSize = inner._computeAxis(valids);
    var coordinate = inner._getDrawableCoordinate();
    var spotdistance = LChart.Methods.IsNumber(options.tip.spotdistance) && options.tip.spotdistance > 0 ? options.tip.spotdistance : 10;
    var alignlinecolor = options.alignline.linecolor || LChart.Const.Defaults.AlignLineColor;
    var fillcolors = (options.area.fillcolors && options.area.fillcolors.length > 0 ? options.area.fillcolors : null) || LChart.Const.Defaults.TransparentColors;
    var linecolors = (options.area.linecolors && options.area.linecolors.length > 0 ? options.area.linecolors : null) || LChart.Const.Defaults.FillColors;
    if (lineIsMain) {
        inner.coordinates.draw = coordinate;
        inner._configs.legendColors = linecolors;
    }

    var specificConfig = inner._configs.specificConfig[graphicID];
    specificConfig.mergeTips = [];
    specificConfig.loc = -1;
    if (!inner.coordinates.rangearea) { inner.coordinates.rangearea = {}; }
    inner.coordinates.rangearea[graphicID] = { nodes: [] };
    inner.shapes[graphicID] = { nodes: [] };
    var merge = options.tip.merge;
    var redrawRecord = {};
    var valueAxisLength = (invertAxis ? axisSize.maxX - axisSize.minX : axisSize.maxY - axisSize.minY);
    var labelAxisLength = (invertAxis ? axisSize.maxY - axisSize.minY : axisSize.maxX - axisSize.minX);
    var nodelength = options.node.length || LChart.Methods.CapValue(labelAxisLength / 100, 10, 6);
    var smoothline = options.area.smoothline;
    var drawlineFunction = smoothline ? inner.DrawFigures.createSmoothLine : inner.DrawFigures.createPointsLine;
    var nodeShape = function (index, centerX, centerY, length, data) {
        this.index = index;
        this.centerX = centerX;
        this.centerY = centerY;
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
    var drawnode = function (x, y, linecolor, areainfo) {
        var ops = options.node;
        if (ops.show) {
            var _nodelength = areainfo.nodelength || nodelength;
            var nodetype = areainfo.nodetype || ops.nodetype || 'c';
            var nodelinecolor = areainfo.nodelinecolor || ops.linecolor || linecolor;
            var nodelinewidth = areainfo.nodelinewidth || ops.linewidth;
            var fillcolor = areainfo.nodefillcolor || ops.fillcolor || linecolor;
            inner.DrawFigures.createPointElement(nodetype, x, y, _nodelength, fillcolor, true, nodelinecolor, nodelinewidth, true, true);
        }
    };
    var drawRangeArea = function (points0, points1, fillcolor) {
        var points = points0.__copy();
        for (var i = points1.length - 1; i >= 0; i--) {
            points.push(points1[i]);
        }
        inner.DrawFigures.createCloseFigure(points, fillcolor, 0, null, smoothline, invertAxis);
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
                    return labelAxisLength * val / (innerData.length - 1);
                }
            }
        };
        var addNodeShape = function (small, index, x, y, _nodelength, vvalue, lvalue, llabel, text, click, mouseover, mouseleave) {
            if (percentAnimComplete >= 1) {
                var data = { vvalue: vvalue, lvalue: lvalue, llabel: llabel, text: text, issmall: small };
                if (typeof click == 'function') { data.click = click; }
                if (typeof mouseover == 'function') { data.mouseover = mouseover; }
                if (typeof mouseleave == 'function') { data.mouseleave = mouseleave; }
                var shape = new nodeShape(index, x, y, _nodelength, data);
                inner.shapes[graphicID].nodes.push(shape);
                inner.coordinates.rangearea[graphicID].nodes[index] = { isSmall: small, centerX: x, centerY: y, length: _nodelength };
            }
        };
        var lvalue, vvalue, center1, center2Small, center2Big;
        if (axisData.multiple) {
            var pointsSmall = []; var pointsBig = [];
            var nodepoints = [];
            for (var i = 0, item; item = innerData[i]; i++) {
                var linewidth = item.linewidth || options.area.linewidth || LChart.Const.Defaults.LineWidth;
                var linecolor = item.color || linecolors[i % linecolors.length];
                var fillcolor = item.fillcolor || fillcolors[i % fillcolors.length];
                var text = item.text || '';
                var count = item.value.length;
                var labeldistance = count / (axisData.lLabels.length - 1);
                for (var k = 0; k < count; k++) {
                    subitem = item.value[k];
                    lvalue = lValueType ? subitem[0] : k;
                    vvalue = lValueType ? subitem[1] : subitem;
                    var smallvalue = vvalue[0];
                    var bigvalue = vvalue[1];
                    if (smallvalue > bigvalue) { bigvalue = smallvalue; smallvalue = vvalue[1]; }
                    center1 = (invertAxis ? axisSize.maxY - getLabelWidth(lvalue) : axisSize.minX + getLabelWidth(lvalue));
                    center2Small = invertAxis ? axisSize.minX + getValueHeight(smallvalue) : axisSize.maxY - getValueHeight(smallvalue);
                    center2Big = invertAxis ? axisSize.minX + getValueHeight(bigvalue) : axisSize.maxY - getValueHeight(bigvalue);
                    pointsSmall.push(invertAxis ? [center2Small, center1] : [center1, center2Small]);
                    pointsBig.push(invertAxis ? [center2Big, center1] : [center1, center2Big]);
                    var llabel = lValueType ? null : axisData.lLabels[parseInt(k / labeldistance + 0.5)];
                    var index = i * count + k;
                    addNodeShape(true, index, invertAxis ? center2Small : center1, invertAxis ? center1 : center2Small, item.nodelength || nodelength, smallvalue, lvalue, llabel, text, item.click, item.mouseover, item.mouseleave);
                    addNodeShape(false, index, invertAxis ? center2Big : center1, invertAxis ? center1 : center2Big, item.nodelength || nodelength, bigvalue, lvalue, llabel, text, item.click, item.mouseover, item.mouseleave);
                }
                drawRangeArea(pointsSmall, pointsBig, fillcolor);
                var areainfo = { pointsSmall: pointsSmall, pointsBig: pointsBig, fillcolor: fillcolor, linewidth: linewidth, linecolor: linecolor, nodetype: item.nodetype, nodelength: item.nodelength, nodelinecolor: item.nodelinecolor, nodelinewidth: item.nodelinewidth, nodefillcolor: item.nodefillcolor };
                nodepoints.push(areainfo);
                if (percentAnimComplete >= 1) {
                    if (!redrawRecord.areainfos) { redrawRecord.areainfos = []; }
                    redrawRecord.areainfos[i] = areainfo;
                }
                pointsSmall = []; pointsBig = [];
            }
            for (var i = 0; i < nodepoints.length; i++) {
                var pointsSmall = nodepoints[i].pointsSmall;
                drawlineFunction(pointsSmall, nodepoints[i].linewidth, nodepoints[i].linecolor, invertAxis);
                for (var j = 0; j < pointsSmall.length; j++) {
                    var point = pointsSmall[j];
                    drawnode(point[0], point[1], nodepoints[i].linecolor, nodepoints[i]);
                }
                var pointsBig = nodepoints[i].pointsBig;
                drawlineFunction(pointsBig, nodepoints[i].linewidth, nodepoints[i].linecolor, invertAxis);
                for (var j = 0; j < pointsBig.length; j++) {
                    var point = pointsBig[j];
                    drawnode(point[0], point[1], nodepoints[i].linecolor, nodepoints[i]);
                }
            }
        }
        else {
            var linewidth = options.area.linewidth || LChart.Const.Defaults.LineWidth;
            var linecolor = linecolors[0];
            var fillcolor = fillcolors[0];
            var pointsSmall = []; var pointsBig = [];
            var count = innerData.length;
            for (var i = 0; i < count; i++) {
                subitem = innerData[i];
                var text = subitem.text || '';
                lvalue = lValueType ? subitem.value[0] : i;
                vvalue = lValueType ? subitem.value[1] : subitem.value;
                var smallvalue = vvalue[0];
                var bigvalue = vvalue[1];
                if (smallvalue > bigvalue) { bigvalue = smallvalue; smallvalue = vvalue[1]; }
                center1 = invertAxis ? axisSize.maxY - getLabelWidth(lvalue) : axisSize.minX + getLabelWidth(lvalue);
                center2Small = invertAxis ? axisSize.minX + getValueHeight(smallvalue) : axisSize.maxY - getValueHeight(smallvalue);
                center2Big = invertAxis ? axisSize.minX + getValueHeight(bigvalue) : axisSize.maxY - getValueHeight(bigvalue);
                pointsSmall.push(invertAxis ? [center2Small, center1] : [center1, center2Small]);
                pointsBig.push(invertAxis ? [center2Big, center1] : [center1, center2Big]);
                var llabel = lValueType ? null : axisData.lLabels[i % axisData.lLabels.length];
                addNodeShape(true, i, invertAxis ? center2Small : center1, invertAxis ? center1 : center2Small, subitem.nodelength || nodelength, smallvalue, lvalue, llabel, text, subitem.click, subitem.mouseover, subitem.mouseleave);
                addNodeShape(false, i, invertAxis ? center2Big : center1, invertAxis ? center1 : center2Big, subitem.nodelength || nodelength, bigvalue, lvalue, llabel, text, subitem.click, subitem.mouseover, subitem.mouseleave);
            }
            if (percentAnimComplete >= 1) {
                redrawRecord.pointsSmall = pointsSmall;
                redrawRecord.pointsBig = pointsBig;
                redrawRecord.linewidth = linewidth;
                redrawRecord.linecolor = linecolor;
                redrawRecord.fillcolor = fillcolor;
            }
            drawRangeArea(pointsSmall, pointsBig, fillcolor);
            drawlineFunction(pointsSmall, linewidth, linecolor, invertAxis);
            for (var j = 0; j < pointsSmall.length; j++) {
                var point = pointsSmall[j];
                drawnode(point[0], point[1], linecolor, innerData[j]);
            }
            drawlineFunction(pointsBig, linewidth, linecolor, invertAxis);
            for (var j = 0; j < pointsBig.length; j++) {
                var point = pointsBig[j];
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
            var shapes = [], loc = -1, meetlocs = [];
            var referPos = (invertAxis ? y : x);
            if (y <= axisSize.maxY && y >= axisSize.minY && x >= axisSize.minX && x <= axisSize.maxX) {
                for (var i = 0, shape; shape = inner.shapes[graphicID].nodes[i]; i++) {
                    var center = invertAxis ? shape.centerY : shape.centerX;
                    if (Math.abs(center - referPos) < spotdistance) {
                        meetlocs.push(center);
                    }
                }
                meetlocs.sort(function (c1, c2) {
                    if (Math.abs(c1 - referPos) < Math.abs(c2 - referPos)) { return -1; }
                    else { return 1; }
                });
                if (meetlocs.length > 0) { loc = meetlocs[0]; }
                for (var i = 0, shape; shape = inner.shapes[graphicID].nodes[i]; i++) {
                    var center = invertAxis ? shape.centerY : shape.centerX;
                    if (Math.abs(center - loc) < 0.00001) {
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
                    var mouseover = typeof veryShape.data.mouseover == 'function' ? veryShape.data.mouseover : (options.mouseover || null);
                    if (mouseover) {
                        mouseover(veryShape.data, e);
                    }
                }
                else {
                    if (options.alignline.verticalline || options.alignline.horizontalline) {
                        inner.redrawAll();
                    }
                }
            }
            var fixed = fixRowShapes(location.X, location.Y);
            if (specificConfig.loc != fixed.loc) {
                specificConfig.loc = fixed.loc;
                if (invertAxis && options.alignline.horizontalline || !invertAxis && options.alignline.verticalline) {
                    inner.redrawAll();
                }
                if (merge) {
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
                if (fixed.shapes.length) {
                    if (!invertAxis && options.alignline.verticalline) {
                        inner.DrawFigures.createLine(fixed.loc, axisSize.minY, fixed.loc, axisSize.maxY + 1, 1, alignlinecolor);
                    }
                    if (invertAxis && options.alignline.horizontalline) {
                        inner.DrawFigures.createLine(axisSize.minX, fixed.loc, axisSize.maxX, fixed.loc, 1, alignlinecolor);
                    }
                    if (merge) {
                        if (fixed.shapes[0].showTip) {
                            var mergeTip = specificConfig.mergeTips[fixed.shapes[0].index];
                            if (!mergeTip) {
                                var data = [];
                                var centerXSum = 0; var centerYSum = 0;
                                var lastindex = -1;
                                var lastdata = [];
                                for (var i = 0, shape; shape = fixed.shapes[i]; i++) {
                                    var index = shape.index;
                                    if (index != lastindex) {
                                        lastindex = index;
                                        lastdata[index] = shape.data;
                                    }
                                    else {
                                        var dataitem = {};
                                        var isbigger = shape.data.vvalue > lastdata[index].vvalue;
                                        dataitem.max = isbigger ? shape.data : lastdata[index];
                                        dataitem.min = isbigger ? lastdata[index] : shape.data;
                                        data.push(dataitem);
                                    }
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
        };
        inner._addEventListener('click', onclick);
        inner._addEventListener('mousemove', onmousemove);
    };
    var redraw = function () {
        if (axisData.multiple) {
            var areainfos = redrawRecord.areainfos;
            for (var i = 0; i < areainfos.length; i++) {
                var areainfo = areainfos[i];
                drawRangeArea(areainfo.pointsSmall, areainfo.pointsBig, areainfo.fillcolor);
            }
            for (var i = 0; i < areainfos.length; i++) {
                var areainfo = areainfos[i];
                drawlineFunction(areainfo.pointsSmall, areainfo.linewidth, areainfo.linecolor, invertAxis);
                drawlineFunction(areainfo.pointsBig, areainfo.linewidth, areainfo.linecolor, invertAxis);
                for (var j = 0; j < areainfo.pointsSmall.length; j++) {
                    drawnode(areainfo.pointsSmall[j][0], areainfo.pointsSmall[j][1], areainfo.linecolor, areainfo);
                }
                for (var j = 0; j < areainfo.pointsSmall.length; j++) {
                    drawnode(areainfo.pointsBig[j][0], areainfo.pointsBig[j][1], areainfo.linecolor, areainfo);
                }
            }
        }
        else {
            var pointsSmall = redrawRecord.pointsSmall;
            var pointsBig = redrawRecord.pointsBig;
            drawRangeArea(pointsSmall, pointsBig, redrawRecord.fillcolor);
            drawlineFunction(redrawRecord.pointsSmall, redrawRecord.linewidth, redrawRecord.linecolor, invertAxis);
            drawlineFunction(redrawRecord.pointsBig, redrawRecord.linewidth, redrawRecord.linecolor, invertAxis);
            for (var j = 0; j < redrawRecord.pointsSmall.length; j++) {
                drawnode(redrawRecord.pointsSmall[j][0], redrawRecord.pointsSmall[j][1], redrawRecord.linecolor, innerData[j]);
            }
            for (var j = 0; j < redrawRecord.pointsBig.length; j++) {
                drawnode(redrawRecord.pointsBig[j][0], redrawRecord.pointsBig[j][1], redrawRecord.linecolor, innerData[j]);
            }
        }
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};