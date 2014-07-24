Date.prototype.format = function (fmt) {
    var o =
    {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
lcharttools.clock = function (parentDivID) {
    var inner = this;
    inner.parentDivID = parentDivID;
    inner._initial = function () {
        var parentDiv = document.getElementById(inner.parentDivID);
        if (parentDiv != null && parentDiv.nodeName.toLowerCase() == 'div') {
            inner.parentDiv = parentDiv;
        }
        else {
            throw new Error("The parent element doesn't exist or isn't a div!");
        }
        inner.parentDiv.innerHTML = "";
        var canvas = document.createElement('canvas');
        inner.ID = 'LChart_' + Math.random().toString().substring(5);
        canvas.setAttribute('id', inner.ID);
        canvas.width = inner.parentDiv.clientWidth;
        canvas.height = inner.parentDiv.clientHeight;
        if (!!window.ActiveXObject && !document.createElement('canvas').getContext) {
            if (window.G_vmlCanvasManager) {
                canvas = window.G_vmlCanvasManager.initElement(canvas);
            }
            else {
                throw new Error("please include excanvas.js!");
            }
        }
        inner.parentDiv.appendChild(canvas);
        inner.canvas = canvas;
        inner.ctx = canvas.getContext('2d');
        inner._configs = {};
        inner._configs._adjust = 0;
        inner._configs._runningHandler = null;
        inner._configs._currentVal = null;
        inner._configs._staticTime = null;
        inner._configs._computed = null;
        inner.options = inner._getDefaultOptions();
    };
    inner._getDefaultOptions = function () {
        var options = {
            centerX: null,
            centerY: null,
            radius: null,
            tickType: 'fluent',
            adjust: 0,
            canvas: {
                backcolor: null,
                borderwidth: 1,
                bordercolor: null
            },
            background: {
                backcolor: null,
                borderwidth: 1,
                bordercolor: null,
                shadowcolor: '#000000',
                shadowblur: 0
            },
            calibration: {
                backcolor: null,
                margin: null,
                interval: 4,
                thinwidth: 2,
                thickwidth: 4,
                thinlength: null,
                thicklength: null,
                thinlinecolor: '#999999',
                thicklinecolor: '#000000'
            },
            labels: {
                margin: null,
                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                labelcontrol: '111111111111',
                rotate: false,
                fontcolor: null,
                fontsize: null,
                fontfamily: null,
                fontweight: 'bold'
            },
            pointer: {
                nodecolor: null,
                nodelength: null,

                hourpincolor: null,
                hourheadwidth: null,
                hourtailwidth: null,
                hourpinlength: null,

                minutepincolor: null,
                minuteheadwidth: null,
                minutetailwidth: null,
                minutepinlength: null,

                secondpincolor: '#a01313',
                secondheadwidth: null,
                secondtailwidth: null,
                secondpinlength: null
            },
            currentValue: {
                show: true,
                content: function (val) {
                    return val.format("hh:mm:ss");
                },
                xdistance: null,
                ydistance: null,
                fontcolor: null,
                fontsize: null,
                fontfamily: null,
                fontweight: null,
                backcolor: null,
                borderwidth: 0,
                bordercolor: null
            }
        };
        return options;
    };
    inner._computeOptions = function (recompute) {
        if (!recompute && inner._configs._computed) {
            return inner._configs._computed;
        }
        var ops = inner.options;
        var centerX = ops.centerX || inner.canvas.width / 2;
        var centerY = ops.centerY || inner.canvas.height / 2;
        var radius = ops.radius || Math.min(inner.canvas.width, inner.canvas.height) * 0.4;
        var margin = ops.calibration.margin || radius / 12;
        var thinlength = ops.calibration.thinlength || radius / 15;
        var thicklength = ops.calibration.thicklength || thinlength * 1.2;
        var outerRadius = radius - margin;
        var thinInnerRadius = radius - margin - thinlength;
        var thickInnerRadius = radius - margin - thicklength;
        var calibration = { margin: margin, thinlength: thinlength, thicklength: thicklength, outerRadius: outerRadius, thinInnerRadius: thinInnerRadius, thickInnerRadius: thickInnerRadius };
        var labelmargin = ops.labels.margin || radius / 15;
        var labelfontsize = ops.labels.fontsize || radius / 5;
        var labelradius = thickInnerRadius - labelmargin;
        var labels = { margin: labelmargin, radius: labelradius, fontsize: labelfontsize };
        var nodelength = ops.pointer.nodelength || radius / 12;
        var hourtailwidth = ops.pointer.hourtailwidth || radius / 14;
        var hourheadwidth = ops.pointer.hourheadwidth || radius / 40;
        var hourpinlength = ops.pointer.hourpinlength || radius * 0.5;
        var minutetailwidth = ops.pointer.minutetailwidth || radius / 25;
        var minuteheadwidth = ops.pointer.minuteheadwidth || radius / 40;
        var minutepinlength = ops.pointer.minutepinlength || radius * 0.8;
        var secondtailwidth = ops.pointer.secondtailwidth || radius / 40;
        var secondheadwidth = ops.pointer.secondheadwidth || 0;
        var secondpinlength = ops.pointer.secondpinlength || radius;
        if (hourpinlength >= radius + nodelength || minutepinlength >= radius + nodelength || secondpinlength >= radius + nodelength) {
            throw new Error("pinlength should be less than radius!");
        }
        var pointer = { nodelength: nodelength, hour: { tailwidth: hourtailwidth, headwidth: hourheadwidth, pinlength: hourpinlength, pincolor: ops.pointer.hourpincolor }, minute: { tailwidth: minutetailwidth, headwidth: minuteheadwidth, pinlength: minutepinlength, pincolor: ops.pointer.minutepincolor }, second: { tailwidth: secondtailwidth, headwidth: secondheadwidth, pinlength: secondpinlength, pincolor: ops.pointer.secondpincolor } };

        var valuedistanceX = ops.currentValue.xdistance || 0;
        var valuedistanceY = ops.currentValue.ydistance == null ? 0.4 : ops.currentValue.ydistance;
        var valuefontsize = ops.currentValue.fontsize || radius / 8;
        var currentValue = { xdistance: valuedistanceX, ydistance: valuedistanceY, fontsize: valuefontsize };

        inner._configs._computed = {
            centerX: centerX, centerY: centerY, radius: radius,
            calibration: calibration, labels: labels, pointer: pointer, currentValue: currentValue
        };
        return inner._configs._computed;
    };
    inner._drawCanvasBackround = function () {
        var ops = inner.options.canvas;
        if (ops.backcolor) {
            lcharttools.createRect(inner.ctx, 0, 0, inner.canvas.width, inner.canvas.height, ops.backcolor);
        }
        else {
            inner.ctx.clearRect(0, 0, inner.canvas.width, inner.canvas.height);
        }
        var borderwidth = ops.borderwidth || 0;
        if (borderwidth > 0) {
            lcharttools.createRect(inner.ctx, 0, 0, inner.canvas.width, inner.canvas.height, null, borderwidth * 2, ops.bordercolor);
        }
    };
    inner._drawBackground = function () {
        var computed = inner._computeOptions();
        var ops = inner.options.background;
        var shadow = null;
        if (ops.shadowblur > 0) {
            shadow = { color: ops.shadowcolor || '#000000', blur: ops.shadowblur };
        }
        lcharttools.createArc(inner.ctx, computed.centerX, computed.centerY, computed.radius, 0, null, ops.backcolor || '#F2F2F2', null, null, shadow);
        lcharttools.createArc(inner.ctx, computed.centerX, computed.centerY, computed.radius, ops.borderwidth, ops.bordercolor);
    };
    inner._drawCalibration = function () {
        var computed = inner._computeOptions();
        var ccalibration = computed.calibration;
        var clabels = computed.labels;
        var ops = inner.options.calibration;
        var opslabels = inner.options.labels;

        if (ops.backcolor) {
            lcharttools.createRing(inner.ctx, computed.centerX, computed.centerY, ccalibration.thinInnerRadius, ccalibration.outerRadius, ops.backcolor, 0, Math.PI * 2);
        }

        var bigsplit = Math.PI * 2 / 12;
        var smallsplit = ops.interval > 0 ? bigsplit / (ops.interval + 1) : null;
        var offxs = [0, 0.2, 0.3, 0.3, 0.3, 0.2, 0, -0.25, -0.4, -0.3, -0.25, -0.25];
        var offys = [0.5, 0.4, 0.4, 0.3, 0.2, 0.1, 0.1, 0.15, 0.2, 0.3, 0.4, 0.45];

        for (var i = 0; i < 12; i++) {
            var angle = bigsplit * i;
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            var innerX = computed.centerX + ccalibration.thickInnerRadius * sin;
            var innerY = computed.centerY - ccalibration.thickInnerRadius * cos;
            var outerX = computed.centerX + ccalibration.outerRadius * sin;
            var outerY = computed.centerY - ccalibration.outerRadius * cos;
            lcharttools.createLine(inner.ctx, innerX, innerY, outerX, outerY, ops.thickwidth, ops.thicklinecolor);

            if (opslabels.labelcontrol[(i + 11) % 12] == "1") {
                var label = opslabels.labels[(i + 11) % opslabels.labels.length];
                if (opslabels.rotate) {
                    var labelX = computed.centerX + (clabels.radius - clabels.fontsize / 2) * sin;
                    var labelY = computed.centerY - (clabels.radius - clabels.fontsize / 2) * cos;
                    lcharttools.createText(inner.ctx, label, labelX, labelY, 'center', opslabels.fontweight, clabels.fontsize, opslabels.fontfamily, opslabels.fontcolor, angle);
                }
                else {
                    var textlength = lcharttools.measureText(inner.ctx, label, opslabels.fontweight, clabels.fontsize, opslabels.fontfamily);
                    var offX = -textlength * offxs[i];
                    var offY = offys[i] * 1.3 * clabels.fontsize;
                    var labelX = computed.centerX + clabels.radius * sin + offX;
                    var labelY = computed.centerY - clabels.radius * cos + offY;
                    lcharttools.createText(inner.ctx, label, labelX, labelY, 'center', opslabels.fontweight, clabels.fontsize, opslabels.fontfamily, opslabels.fontcolor);
                }
            }

            if (ops.interval > 0) {
                for (var j = 1; j <= ops.interval; j++) {
                    var sangle = angle + smallsplit * j;
                    sin = Math.sin(sangle);
                    cos = Math.cos(sangle);
                    innerX = computed.centerX + ccalibration.thinInnerRadius * sin;
                    innerY = computed.centerY - ccalibration.thinInnerRadius * cos;
                    outerX = computed.centerX + ccalibration.outerRadius * sin;
                    outerY = computed.centerY - ccalibration.outerRadius * cos;
                    lcharttools.createLine(inner.ctx, innerX, innerY, outerX, outerY, ops.thinwidth, ops.thinlinecolor);
                }
            }
        }
    };
    inner._drawPointer = function () {
        var computed = inner._computeOptions();
        var ops = inner.options.pointer;
        var currentval = inner._configs._currentVal;
        var currenttime = currentval.getTime();
        var basictime = Date.parse(currentval.format("yyyy/MM/dd " + (currentval.getHours() > 11 ? "12" : "00") + ":00:00"));
        var angleHour = Math.PI * 2 * (currenttime - basictime) / 43200000;
        var angleMinute = Math.PI * 2 * (currenttime - Date.parse(currentval.format("yyyy/MM/dd " + currentval.getHours() + ":00:00"))) / 3600000;
        var angleSecond = Math.PI * 2 * (currenttime - Date.parse(currentval.format("yyyy/MM/dd " + currentval.getHours() + ":" + currentval.getMinutes() + ":00"))) / 60000;
        var drawpoint = function (angle, params) {
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            var outerX = computed.centerX + params.pinlength * 0.8 * sin;
            var outerY = computed.centerY - params.pinlength * 0.8 * cos;
            var outerLeftX = outerX - params.headwidth / 2 * cos;
            var outerLeftY = outerY - params.headwidth / 2 * sin;
            var outerRightX = outerX + params.headwidth / 2 * cos;
            var outerRightY = outerY + params.headwidth / 2 * sin;
            var innerX = computed.centerX - params.pinlength * 0.2 * sin;
            var innerY = computed.centerY + params.pinlength * 0.2 * cos;
            var innerLeftX = innerX - params.tailwidth / 2 * cos;
            var innerLeftY = innerY - params.tailwidth / 2 * sin;
            var innerRightX = innerX + params.tailwidth / 2 * cos;
            var innerRightY = innerY + params.tailwidth / 2 * sin;
            var points = [[outerLeftX, outerLeftY], [outerRightX, outerRightY], [innerRightX, innerRightY], [innerLeftX, innerLeftY]];
            lcharttools.createCloseFigure(inner.ctx, points, params.pincolor || '#000000');
        };
        drawpoint(angleHour, computed.pointer.hour);
        drawpoint(angleMinute, computed.pointer.minute);
        drawpoint(angleSecond, computed.pointer.second);
        lcharttools.createArc(inner.ctx, computed.centerX, computed.centerY, computed.pointer.nodelength / 2, 0, null, ops.nodecolor || ops.secondpincolor || '#000000')
    };
    inner._drawCurrentValue = function () {
        var ops = inner.options.currentValue;
        if (!inner._configs._currentVal || !ops.show || typeof ops.content != 'function') { return; }
        var val = inner._configs._currentVal;
        var computed = inner._computeOptions();
        var content = ops.content(val);
        var centerX = computed.centerX - computed.radius * computed.currentValue.xdistance;
        var centerY = computed.centerY - computed.radius * computed.currentValue.ydistance + computed.currentValue.fontsize / 3;
        if (ops.backcolor || ops.borderwidth) {
            var fontlength = lcharttools.measureText(inner.ctx, content, ops.fontweight, computed.currentValue.fontsize, ops.fontfamily);
            var left = centerX - fontlength / 2 - computed.currentValue.fontsize / 4;
            var top = centerY - computed.currentValue.fontsize;
            lcharttools.createRect(inner.ctx, left, top, fontlength + computed.currentValue.fontsize / 2, computed.currentValue.fontsize * 4 / 3, ops.backcolor, ops.borderwidth, ops.bordercolor);
        }
        lcharttools.createText(inner.ctx, content, centerX, centerY, 'center', ops.fontweight, computed.currentValue.fontsize, ops.fontfamily, ops.fontcolor);
    };
    inner._drawValue = function () {
        inner._drawCanvasBackround();
        inner._drawBackground();
        inner._drawCalibration();
        inner._drawPointer();
        inner._drawCurrentValue();
    };
    inner.setOptions = function (ops) {
        inner.options = lcharttools.funcs._override(inner.options, ops);
    };
    inner.setAdjust = function (adjust) {
        inner._configs._adjust = adjust || 0;
    };
    inner.setTime = function (val) {
        if (!val || !val.getTime) {
            val = null;
        }
        inner._configs._staticTime = val;
    };
    inner.draw = function () {
        inner._computeOptions(true);
        if (inner._configs._runningHandler) {
            clearInterval(inner._configs._runningHandler);
        }
        inner._configs._adjust = inner.options.adjust || 0;
        if (inner._configs._staticTime) {
            inner._configs._currentVal = new Date(inner._configs._staticTime.getTime() + inner._configs._adjust);
            inner._drawValue();
            return;
        }
        if (inner.options.tickType == "fluent") {
            inner._configs._runningHandler = setInterval(function () {
                inner._configs._currentVal = new Date((new Date).getTime() + inner._configs._adjust);
                inner._drawValue();
            }, 10);
        }
        else if (inner.options.tickType == "vibrate") {
            inner._configs._runningHandler = setInterval(function () {
                var currenttime = (new Date).getTime() + inner._configs._adjust;
                inner._configs._currentVal = new Date(currenttime);
                if (currenttime - Date.parse(inner._configs._currentVal.format("yyyy/MM/dd hh:mm:ss")) <= 30) {
                    inner._drawValue();
                }
            }, 10);
        }
    };
    inner._initial();
    return inner;
}