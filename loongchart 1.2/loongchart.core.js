Function.prototype.__extends = function (objs) {
    for (var obj in objs) {
        this.prototype[obj] = objs[obj];
    }
    return this;
};
Date.prototype.format = function (fmt) {
    var o =
    {
        "M+": this.getMonth() + 1, "d+": this.getDate(), "h+": this.getHours(), "m+": this.getMinutes(), "s+": this.getSeconds(), "q+": Math.floor((this.getMonth() + 3) / 3), "S": this.getMilliseconds()
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
Date.prototype.addMilliseconds = function (value) {
    this.setTime(this.getTime() + value);
    return this;
};
Date.prototype.addMinutes = function (value) {
    this.setMinutes(this.getMinutes() + value);
    return this;
};
Date.prototype.addDays = function (value) {
    this.setDate(this.getDate() + value);
    return this;
};
Date.prototype.shortOf = function (interval, endTime) {
    switch (interval) {
        case "S":
            return endTime - this;
        case "s":
            return parseInt((endTime - this) / 1000);
        case "n":
            return parseInt((endTime - this) / 60000);
        case "h":
            return parseInt((endTime - this) / 3600000);
        case "d":
            return parseInt((endTime - this) / 86400000);
        case "w":
            return parseInt((endTime - this) / (86400000 * 7));
        case "m":
            return (endTime.getMonth() + 1) + ((endTime.getFullYear() - this.getFullYear()) * 12) - (this.getMonth() + 1);
        case "y":
            return endTime.getFullYear() - this.getFullYear();
        default:
            return undefined;
    }
};
Array.prototype.__copy = function () {
    var newArray = [];
    for (var i = 0; i < this.length; i++) {
        newArray.push(this[i]);
    }
    return newArray;
};
Array.prototype.__multiply = function (param) {
    for (var i = 0; i < this.length; i++) {
        this[i] = this[i] * param;
    }
};
Array.prototype.__sum = function () {
    var res = 0;
    for (var i = 0; i < this.length; i++) {
        res += this[i];
    }
    return res;
};
Array.prototype.__contains = function (val) {
    var contain = false;
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) { contain = true; break; }
    }
    return contain;
};
Array.prototype.__only = function (val) {
    var judge = true;
    for (var i = 0; i < this.length; i++) {
        if (this[i] !== val) { judge = false; break; }
    }
    return judge;
};


window.LChart = window.DChart = {};
LChart.Methods = {
    JudgeNormalObject: function (obj) {
        return obj && typeof obj == 'object' && !LChart.Methods.IsArray(obj) && !LChart.Methods.IsDate(obj);
    },
    StringIsDate: function (str) {
        return !isNaN(Date.parse(str.replace(/-/g, '/')));
    },
    DeepCopy: function (oldops) {
        var result = {};
        var deepDig = function (res, obj, path) {
            backupPath = path;
            for (var attrname in obj) {
                path += attrname + '.';
                if (LChart.Methods.JudgeNormalObject(obj[attrname]) && !LChart.Const.Exceps.__contains(path.substring(0, path.length - 1))) {
                    res[attrname] = {};
                    deepDig(res[attrname], obj[attrname], path);
                }
                else {
                    if (obj.hasOwnProperty(attrname)) {
                        res[attrname] = obj[attrname];
                    }
                }
                path = backupPath;
            }
        };
        deepDig(result, oldops, '');
        return result;
    },
    Override: function (defaults, overrides, ingoreNull) {
        var result = LChart.Methods.DeepCopy(defaults);
        var deepDig = function (res, obj, path) {
            var backupPath = path;
            for (var attrname in obj) {
                path += attrname + '.';
                if (res[attrname] !== undefined && obj.hasOwnProperty(attrname)) {
                    if (LChart.Methods.JudgeNormalObject(obj[attrname]) && LChart.Methods.JudgeNormalObject(res[attrname]) && !LChart.Const.Exceps.__contains(path.substring(0, path.length - 1))) {
                        deepDig(res[attrname], obj[attrname], path);
                    }
                    else if (!ingoreNull || obj[attrname] != null) {
                        res[attrname] = obj[attrname];
                    }
                }
                path = backupPath;
            }
        };
        deepDig(result, overrides, '');
        return result;
    },
    Extend: function (defaults, extendes, ingoreNull) {
        var result = LChart.Methods.DeepCopy(defaults);
        var deepDig = function (res, obj, path) {
            var backupPath = path;
            for (var attrname in obj) {
                path += attrname + '.';
                if (obj.hasOwnProperty(attrname)) {
                    if (LChart.Methods.JudgeNormalObject(obj[attrname]) && !LChart.Const.Exceps.__contains(path.substring(0, path.length - 1))) {
                        if (!LChart.Methods.JudgeNormalObject(res[attrname])) {
                            res[attrname] = {};
                        }
                        deepDig(res[attrname], obj[attrname], path);
                    }
                    else {
                        if (res[attrname] === undefined || !ingoreNull || obj[attrname] != null) {
                            res[attrname] = obj[attrname];
                        }
                    }
                }
                path = backupPath;
            }
        };
        deepDig(result, extendes, '');
        return result;
    },
    CapValue: function (valueToCap, maxValue, minValue) {
        if (LChart.Methods.IsNumber(maxValue) && valueToCap > maxValue) { return maxValue; }
        if (LChart.Methods.IsNumber(minValue) && valueToCap < minValue) { return minValue; }
        return valueToCap;
    },
    GetRandomString: function (subindex) {
        return Math.random().toString().substring(5);
    },
    GetCurrentAngle: function (x, y, locX, locY) {
        var angle = Math.asin((y - locY) / Math.sqrt(Math.pow(x - locX, 2) + Math.pow(y - locY, 2)));
        if (angle != 0) {
            if (x < locX && y > locY) {
                angle = Math.PI - angle;
            }
            else if (x < locX && y < locY) {
                angle = -Math.PI - angle;
            }
        }
        else {
            if (x < locX) { angle = Math.PI; }
        }
        return angle;
    },
    JudgeBetweenAngle: function (min, max, target) {
        var right = false;
        var pi = Math.PI;
        while (target <= max) {
            if (target >= min) { right = true; break; }
            target += pi * 2;
        }
        if (!right) {
            while (target >= min) {
                if (target <= max) { right = true; break; }
                target -= pi * 2;
            }
        }
        return right;
    },
    judgeClockwiseBehind: function (min, max, r1, r2) {
        min = min * Math.PI;
        max = max * Math.PI;
        var format = function (r) {
            while (r < min) {
                r += 2 * Math.PI;
            }
            while (r > max) {
                r -= 2 * Math.PI;
            }
            return r;
        };
        r1 = format(r1);
        r2 = format(r2);
        return r1 < r2;
    },
    CopyInnerValue: function (valueType, value) {
        if (valueType == 'd' || valueType == 't' || valueType == 'm') {
            return new Date(value.getTime());
        }
        return value;
    },
    AddInnerValue: function (valueType, value, add) {
        if (valueType == 'd') {
            value = value.addDays(add);
        }
        else if (valueType == 't') {
            value = value.addMinutes(add);
        }
        else if (valueType == 'm') {
            value = value.addMilliseconds(add);
        }
        else {
            value += add;
        }
        return value;
    },
    FormatLinePosition: function (width, x, y) {
        var width = Math.ceil(width);
        var format = function (val) {
            var i = Math.floor(val);
            if (width % 2 == 0) { return val - i > 0.5 ? i + 1 : i; }
            else { return i + 0.5; }
        };
        if (arguments.length == 3) { return { x: format(x), y: format(y) }; }
        else { return format(x); }
    },
    ObjectHaveSameValues: function (obj1, obj2, fields) {
        var same = true;
        for (var i = 0, field; field = fields[i]; i++) {
            if (obj1[field] !== obj2[field]) { same = false; break; }
        }
        return same;
    },
    IsArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    IsNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    IsColor: function (color) {
        return LChart.Const.RegExps.HexColor.test(color) || LChart.Const.RegExps.RGBColor.test(color) || LChart.Const.RegExps.RGBAColor.test(color);
    },
    ParseDate: function (str) {
        return new Date(Date.parse(str.replace(/-/g, "/")));
    },
    IsDate: function (obj) {
        return (typeof obj == 'object') && obj.constructor == Date;
    },
    FormatNumber: function (num) {
        if (typeof num != 'number') { return num; }
        var res = num;
        for (var i = 0; i < 8; i++) {
            var tmp = parseFloat(num.toFixed(i));
            if (Math.abs(tmp - num) < 0.0000001) { res = tmp; break; }
        }
        return res;
    },
    getDarkenColor: function (color, proportion) {
        proportion = proportion || 0.7;
        var rgba = LChart.Methods.getRGBA(color);
        if (rgba) {
            var tmpRes = 'rgba(' + (rgba.R * proportion).toFixed(0) + ',' + (rgba.G * proportion).toFixed(0) + ',' + (rgba.B * proportion).toFixed(0) + ',' + rgba.A.toFixed(Math.abs((rgba.A - 1)) < 0.001 ? 0 : 1) + ')';
            return tmpRes;
        }
        else { return null; }
    },
    getRGBA: function (str) {
        if (LChart.Const.RegExps.HexColor.test(str)) {
            return { R: parseInt(str.substring(1, 3), 16), G: parseInt(str.substring(3, 5), 16), B: parseInt(str.substring(5), 16), A: 1 };
        }
        else if (LChart.Const.RegExps.RGBColor.test(str)) {
            var splits = str.split(',');
            return { R: parseInt(splits[0].substring(4)), G: parseInt(splits[1]), B: parseInt(splits[2].substring(0, splits[2].indexOf(')'))), A: 1 };
        }
        else if (LChart.Const.RegExps.RGBAColor.test(str)) {
            var splits = str.split(',');
            return { R: parseInt(splits[0].substring(5)), G: parseInt(splits[1]), B: parseInt(splits[2]), A: parseFloat(splits[3].substring(0, splits[3].indexOf(')'))) };
        }
        else {
            return null;
        }
    },
    tranferLocation: function (loc, zoomX, zoomY, toZoom) {
        if (toZoom) {
            return { X: loc.X * zoomX, Y: loc.Y * zoomY };
        }
        else {
            return { X: loc.X / zoomX, Y: loc.Y / zoomY };
        }
    },
    judgeIE678: function () {
        var isIE678 = !!window.ActiveXObject && !document.createElement('canvas').getContext;
        var isIE67 = isIE678 && (navigator.userAgent.indexOf("MSIE 6.0") > 0 || navigator.userAgent.indexOf("MSIE 7.0") > 0);
        var isIE8 = isIE678 && navigator.userAgent.indexOf("MSIE 8.0") > 0;
        return { isIE678: isIE678, isIE67: isIE67, isIE8: isIE8 };
    }
};

LChart.Const = {
    Language: {
        CN: {
            NotSupportHtml5: '您的浏览器不支持HTML5！',
            NeetExcanvasJS: '请引用excanvas.js',
            PluginParamWrong: '添加组合图的参数错误，图形类别不为字符串或图形类别不支持！',
            PluginNotSupportedType: '不能作为组合图，只能作为主图！',
            GraphicTypeNotQuoted: '图形未引用，请引用LChart相关图形的js！',
            MainGraphicMustBeAxis: '主图必须是坐标图！',
            WrongParam: '参数错误！',
            WrongData: '数据错误！',
            WrongSet: '设置错误！',
            NeedDiv: '需传入一个div节点元素或其id。',
            DataMustBeArray: '数据不能为空且必须为数组格式。',
            FirstValueShouldBeString: '数据第一个项必须为字符串以表示text',
            ValueMustNotBeUndefined: '数据的值不能为空',
            HexColorMalformed: '十六进制的颜色表达形式格式错误。',
            RGBColorMalformed: 'rgb的颜色表达形式格式错误。',
            RGBAChangeTransparencyWrongParam: 'RGBA表达式格式错误，或透明度值错误，必须>=0且<=1。',
            NeedDateData: '数据必须是日期格式。',
            NeedNumberData: '数据必须是数字格式。',
            NeedLeastTwoPoints: '要求至少有两个数据计算两个点以形成连线。',
            OuterRadiusShouldBigger: '环状图外部半径应大于内部半径',
            AxisMaxLessThanMin: '坐标设定的最大值应该大于最小值。',
            AxisMaxLessThanActual: '坐标设定的最大值应该大于实际数据的最大值。',
            AxisMinMoreThanActual: '坐标设定的最小值应该小于实际数据的最小值。',
            LabelAxisValueTypeCannotBePercent: '文本轴的数据类型不能为百分数。',
            LabelDistanceExceedMax: '文本开始间距与结束间距不能为负数且之和不能超出最大值。',
            ValueTypeMustBeNumberOrPercent: '值轴的数据类型必须为n或p。',
            ValueTypeMustNotBePercent: '值轴的数据类型不能为p。',
            AxisVauleShouldBeDArray: '数据必须为二维数组（第一个元素为文本轴值，第二个元素为值轴值）。',
            DataShouldBeSameAmount: '多维数组时，每个维度的数据量必须一致。',
            ValueAxisValueShouldBeDArray: '值轴数据必须为二位数组（第一个元素为较小值，第二个元素为较大值）。',
            DataMustGreaterThanZero: '数据必须为不小于零的数字。',
            SubItemsValueShouldEqualSuperValue: '子节点值的总和应该等于上级母节点的值。',
            DataMustBeMultipleArray: '数据必须为多维数组。',
            SumOfLengthsMustBeLessThanRadius: '环状图的宽度之和应小于半径',
            OptionShouldNotBeUndefined: '选项值不能为undefined',
            OptionShouldBeString: '选项值必须为字符串格式。',
            OptionShouldBeBoolean: '选项值必须为布尔格式。',
            OptionShouldBeNumber: '选项值必须为数字格式。',
            OptionShouldBeDate: '选项值必须为日期格式。',
            OptionShouldBeColorStr: '选项值必须为颜色格式的字符串。',
            OptionShouldBeFunction: '选项值必须为一个function。',
            OptionShouldBeColorArray: '选项值必须为由颜色字符串组成的数组。',
            OptionShouldBeStringArray: '选项值必须为由字符串组成的数组。',
            OptionShouldBeNumberArray: '选项值必须为由数字组成的数组。',
            WrongLegendSet: '错误的图例位置设置，不允许X和Y方向上都居中或者当type为\"row\"时Y方向居中。',
            WrongSplitPoint: '错误的临界值设定，该值必须大于实际最小值并小于实际最大值。',
            MarbleShouldBeBigger: '3D坐标轴\"大理石\"的宽度应大于\"舞台\"加\"窗帘\"的宽度',
            WrongSightAngle: '大理石宽线与Y轴线的夹角取值范围应为0至0.5。'
        },
        EN: {
            NotSupportHtml5: 'Your browser does not support HTML5',
            NeetExcanvasJS: '"please include excanvas.js!',
            PluginParamWrong: 'Wrong paramers to add a plugin graphic, grapihc type is not a string or the type is not supported!',
            PluginNotSupportedType: 'cannot be used as a plugin, this type must be used as main graphic!',
            GraphicTypeNotQuoted: 'The graphic is not quoted, please quote loongchart.[type].(min).js',
            MainGraphicMustBeAxis: 'Main graphic must ba a draw-axis type!',
            WrongParam: 'Wrong parameter!',
            WrongData: 'Wrong data!',
            WrongSet: 'Wrong set！',
            NeedDiv: 'A div DOM element or its id is needed.',
            DataMustBeArray: 'data must not be empty and be an array.',
            FirstValueShouldBeString: 'To indicate text property that the first item of data must be a string.',
            ValueMustNotBeUndefined: 'The value of data must not be null or undefined.',
            HexColorMalformed: 'Hex color expression is wrong.',
            RGBColorMalformed: 'Rgb color expression is wrong.',
            RGBAChangeTransparencyWrongParam: 'RGBA expression is wrong，or transparency number is unqualified, it must be >=0 and <=1.',
            NeedDateData: 'Data must be a date format.',
            NeedNumberData: 'Data must be a number format.',
            NeedLeastTwoPoints: 'At least two values as points needed to be computed to build up a line.',
            OuterRadiusShouldBigger: 'Ring graphic outer radius should be larger than the internal radius',
            AxisMaxLessThanMin: 'The maximum value set of axis should be greater than the minimum value.',
            AxisMaxLessThanActual: 'The maximum value set of axis should be greater than the actual maximum value.',
            AxisMinMoreThanActual: 'The minimum value set of axis should be less than the actual minimum value.',
            LabelAxisValueTypeCannotBePercent: 'The valueType of text-axis cannot be percent.',
            LabelDistanceExceedMax: 'label distance should not be negative and the sum of label distance should be less than the max length.',
            ValueTypeMustBeNumberOrPercent: 'The valueType of value-axis must be n or p.',
            ValueTypeMustNotBePercent: 'The valueType of value-axis cannot be percent.',
            AxisVauleShouldBeDArray: 'Data must be double-array(first value for label axis，second for value axis).',
            DataShouldBeSameAmount: 'When use multiple data, every amount of each dimension data must be the same.',
            ValueAxisValueShouldBeDArray: 'Data of value axis must be double-array(first value for smaller value，second for bigger value).',
            DataMustGreaterThanZero: 'Data must not be less than zero.',
            SubItemsValueShouldEqualSuperValue: 'The sum of value of subitems should equal the value of mother node.',
            DataMustBeMultipleArray: 'Data must be multiple array.',
            SumOfLengthsMustBeLessThanRadius: 'The sum of lengths in multiring picture must be less than the radius set',
            OptionShouldNotBeUndefined: 'Option value should not be undefined.',
            OptionShouldBeString: 'Option value should be a string.',
            OptionShouldBeBoolean: 'Option value should be a boolean.',
            OptionShouldBeNumber: 'Option value should be a number.',
            OptionShouldBeDate: 'Option value should be a date.',
            OptionShouldBeColorStr: 'Option value should be a string array.',
            OptionShouldBeFunction: 'Option value should be a function.',
            OptionShouldBeColorArray: 'Option value should be a color array.',
            OptionShouldBeStringArray: 'Option value should be a string array.',
            OptionShouldBeNumberArray: 'Option value should be a number array.',
            WrongLegendSet: 'Wrong legend position sets, direction X and direction Y cannot be center(middle) at the same time, and when type is \"row\" direction Y cannot be middle.',
            WrongSplitPoint: 'Wrong split point, the value should be less than min data value and more than max data value.',
            MarbleShouldBeBigger: 'The width of \"marble\" should be more than sum of width of the \"stage\" and the \"curtain\".',
            WrongSightAngle: 'The sightangle should be bewteen 0 and 0.5.'
        }
    },
    CustomCss: {
        tip_blue: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(13, 142, 207); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(13, 142, 207); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_red: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(176, 23,  31); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(176, 23,  31); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_dark: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(79 , 79, 79  ); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(79 , 79, 79  ); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_purple: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(138,43,226); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(138,43,226); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_yellow: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(255,128,0); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(255,128,0); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_bisque: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid #BEBEBE; border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(190,190,190);; opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}'
    },
    CustomCss_IE678: {
        tip_blue: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(13, 142, 207); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: #efefef; font-size: 12px; color: rgb(13, 142, 207); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_red: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(176, 23,  31); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: #efefef; font-size: 12px; color: rgb(176, 23,  31); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_dark: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(79 , 79, 79  ); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: #efefef; font-size: 12px; color: rgb(79 , 79, 79  ); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_purple: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(138,43,226); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: #efefef; font-size: 12px; color: rgb(138,43,226); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_yellow: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(255,128,0); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: #efefef; font-size: 12px; color: rgb(255,128,0); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_bisque: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid #BEBEBE; border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: #efefef; font-size: 12px; color: rgb(190,190,190);; opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}'
    },
    AnimationAlgorithms: {
        linear: function (t) {
            return t;
        },
        easeInQuad: function (t) {
            return t * t;
        },
        easeOutQuad: function (t) {
            return -1 * t * (t - 2);
        },
        easeInOutQuad: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t;
            return -1 / 2 * ((--t) * (t - 2) - 1);
        },
        easeInCubic: function (t) {
            return t * t * t;
        },
        easeOutCubic: function (t) {
            return 1 * ((t = t / 1 - 1) * t * t + 1);
        },
        easeInOutCubic: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
            return 1 / 2 * ((t -= 2) * t * t + 2);
        },
        easeInQuart: function (t) {
            return t * t * t * t;
        },
        easeOutQuart: function (t) {
            return -1 * ((t = t / 1 - 1) * t * t * t - 1);
        },
        easeInOutQuart: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
            return -1 / 2 * ((t -= 2) * t * t * t - 2);
        },
        easeInQuint: function (t) {
            return 1 * (t /= 1) * t * t * t * t;
        },
        easeOutQuint: function (t) {
            return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
        },
        easeInOutQuint: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
            return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
        },
        easeInSine: function (t) {
            return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
        },
        easeOutSine: function (t) {
            return 1 * Math.sin(t / 1 * (Math.PI / 2));
        },
        easeInOutSine: function (t) {
            return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
        },
        easeInExpo: function (t) {
            return (t == 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
        },
        easeOutExpo: function (t) {
            return (t == 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
        },
        easeInOutExpo: function (t) {
            if (t == 0) return 0;
            if (t == 1) return 1;
            if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
            return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
        },
        easeInCirc: function (t) {
            if (t >= 1) return t;
            return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
        },
        easeOutCirc: function (t) {
            return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
        },
        easeInOutCirc: function (t) {
            if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
            return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        },
        easeInElastic: function (t) {
            var s = 1.70158; var p = 0; var a = 1;
            if (t == 0) return 0; if ((t /= 1) == 1) return 1; if (!p) p = 1 * .3;
            if (a < Math.abs(1)) { a = 1; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(1 / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
        },
        easeOutElastic: function (t) {
            var s = 1.70158; var p = 0; var a = 1;
            if (t == 0) return 0; if ((t /= 1) == 1) return 1; if (!p) p = 1 * .3;
            if (a < Math.abs(1)) { a = 1; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(1 / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
        },
        easeInOutElastic: function (t) {
            var s = 1.70158; var p = 0; var a = 1;
            if (t == 0) return 0; if ((t /= 1 / 2) == 2) return 1; if (!p) p = 1 * (.3 * 1.5);
            if (a < Math.abs(1)) { a = 1; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(1 / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * .5 + 1;
        },
        easeInBack: function (t) {
            var s = 1.70158;
            return 1 * (t /= 1) * t * ((s + 1) * t - s);
        },
        easeOutBack: function (t) {
            var s = 1.70158;
            return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
        },
        easeInOutBack: function (t) {
            var s = 1.70158;
            if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
            return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
        },
        easeInBounce: function (t) {
            return 1 - LChart.Const.AnimationAlgorithms.easeOutBounce(1 - t);
        },
        easeOutBounce: function (t) {
            if ((t /= 1) < (1 / 2.75)) {
                return 1 * (7.5625 * t * t);
            } else if (t < (2 / 2.75)) {
                return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + .75);
            } else if (t < (2.5 / 2.75)) {
                return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375);
            } else {
                return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375);
            }
        },
        easeInOutBounce: function (t) {
            if (t < 1 / 2) return LChart.Const.AnimationAlgorithms.easeInBounce(t * 2) * .5;
            return LChart.Const.AnimationAlgorithms.easeOutBounce(t * 2 - 1) * .5 + 1 * .5;
        }
    },
    RegExps: {
        BlankCharacter: /\s/g,
        HexColor: /^#[a-fA-F0-9]{5}[a-fA-F0-9]$/,
        RGBColor: /^(rgb)\([0-9]{0,3},[0-9]{0,3},[0-9]{0,3}\)/,
        RGBAColor: /^(rgba)\([0-9]{0,3},[0-9]{0,3},[0-9]{0,3},(0.)?[0-9]+\)/,
        ReturnFunction: /function *\(.*\) *\{.*return.*\}$/,
        NormalFunction: /function *\(.*\) *\{.*\}$/
    },
    Defaults: {
        FillColors: [
    '#3F5C71',
    '#2F4F4F',
    '#0d233a',
    '#910000',
    '#2A962A',
    '#778088',
    '#4F7DE7',
    '#b5bcc5',
    '#1aadce',
    '#484848',
    '#3883bd',
    '#a5aaaa',
    '#782A56',
    '#B97944',
    '#7A3C9C',
    '#a6bfd2',
    '#008B8B',
    '#7d7f97',
    '#4F4F4F',
    '#9F2626'
        ],
        TransparentColors: [
    'rgba(72,72,72,0.5)',
    'rgba(56,131,189,0.5)',
    'rgba(13,35,58,0.5)',
    'rgba(42,150,42,0.5)',
    'rgba(119,128,136,0.5)',
    'rgba(79,125,231,0.5)',
    'rgba(26,173,206,0.5)',
    'rgba(165,170,170,0.5)',
    'rgba(145,0,0,0.5)',
    'rgba(120,42,86,0.5)',
    'rgba(47,79,79,0.5)',
    'rgba(185,121,68,0.5)',
    'rgba(122,60,156,0.5)',
    'rgba(166,191,210,0.5)',
    'rgba(0,139,139,0.5)',
    'rgba(63,92,113,0.5)',
    'rgba(159,38,38,0.5)',
    'rgba(125,127,151,0.5)',
    'rgba(181,188,197,0.5)',
    'rgba(79,79,79,0.5)'
        ],
        Language: 'CN',
        SavedPicName: 'exportCanvas_' + (new Date()).getTime(),
        LineColor: '#BEBEBE',
        FontColor: '#000000',
        FontSize: 13,
        FontFamily: 'Arial',
        LineWidth: 1,
        LegendType: 's',
        TipType: 'tip_blue',
        InnerLabelColor: '#ffffff',
        OuterLabelColor: '#000000',
        ValueType: 'n',
        ScaleLineColor: '#BEBEBE',
        AxisLineColor: '#000000',
        FooterFontColor: '#8B8386',
        AlignLineColor: '#21251e',
        FooterBottomDistance: 0.01,
        FooterRightDistance: 0.03,
        LengthReferCutForPies: 60,
        LengthReferCutForAxis: 90,
        OffXCutForPies: 20,
        OffXCutForAxis: 70,
        AxisXDrawableCut: 6,
        AxisYDrawableCut: { n: 9, p: 9, d: 7, t: 7, m: 7 },
        AxisYTitleLocation: { n: 0.7, p: 0.7, d: 0.75, t: 0.75, m: 0.75 },
        AxisXTitleLocation: { n: 0.8, p: 0.8, d: 0.8, t: 0.8, m: 0.8 }
    },
    Exceps: ['background.fillstyle'],
    NotDrawAxis: ['Pie', 'Ring', 'MultiRing', 'Polar', 'Radar', 'NestedPie', 'Pie3D', 'Ring3D', 'MultiRing3D', 'Polar3D', 'NestedPie3D'],
    DrawAxis: ['Bar', 'HeapBar', 'RangeBar', 'Histogram', 'Histogram3D', 'HeapHistogram', 'HeapHistogram3D', 'RangeHistogram', 'RangeHistogram3D', 'Line', 'Points', 'Area', 'RangeArea', 'QueueBar', 'QueueHistogram', 'QueueHistogram3D'],
    AxisFromFirstLeft: ['Line', 'Area', 'Points', 'RangeArea'],
    ComputeSplitPoint: ['QueueBar', 'QueueHistogram', 'QueueHistogram3D'],
    DrawSplitLine: ['QueueBar', 'QueueHistogram'],
    AsPlugins: ['Pie', 'Pie3D', 'Ring', 'Ring3D', 'MultiRing', 'MultiRing3D', 'Polar', 'Polar3D', 'Radar', 'NestedPie', 'NestedPie3D', 'Line', 'Points'],
    Draw3DAxis: ['Histogram3D', 'HeapHistogram3D', 'RangeHistogram3D', 'QueueHistogram3D'],
    Skins: {
        BlackAndWhite: {
            BackGround: {
                BorderWidth: 1,
                BorderColor: null,
                BackColor: '#ffffff',
                LinearGradient: null,
                RadialGradient: null
            },
            TipType: null,
            FontColor: null,
            LineColor: null,
            FontFamily: null,
            TitleColor: null,
            SubTitleColor: null,
            LegendFontColor: null,
            LegendBorderColor: null,
            ScaleLineColor: null,
            ScaleBackColors: ['rgba(150,150,150,0.3)', 'rgba(210,210,210,0.3)'],
            LabelAxisLineColor: null,
            LabelAxisFontColor: null,
            ValueAxisLineColor: null,
            ValueAxisFontColor: null,
            MarbleLineColor: null,
            MarbleTopColor: null,
            MarbleRightColor: null,
            MarbleFaceColor: null,
            SplitLineColor: null,
            CrossLineColor: null,
            CloseLineColor: null,
            CaptionFontColor: null,
            XAxisTitleFontColor: null,
            YAxisTitleFontColor: null,
            FooterFontColor: 'rgba(110,110,110,0.8)',
            ShadowColor: '#000000'
        }
    },
    Interval: {
        n: [1, 2, 3, 4, 5, 8, 10, 20, 30, 40, 50, 80, 100, 200, 300, 500, 800, 1000],
        p: [1, 2, 3, 4, 5, 8, 10, 20, 25, 50],
        d: [1, 2, 3, 5, 7, 10, 14, 20, 21, 30, 60, 90, 365],
        t: [1, 2, 5, 10, 20, 30, 60, 120, 180, 240, 300, 480, 720, 1440],
        m: [1, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 60000, 600000, 1800000, 3600000]
    }
};

LChart.getCore = function () {
    var core = function (_targetdiv, _language) {
        var inner = this;
        inner.ChangeLanguage = function (language) {
            inner.Language = LChart.Const.Language[language] != undefined ? language : 'CN';
            inner._messages = LChart.Const.Language[inner.Language];
        };
        inner.ChangeLanguage(_language);
        inner._initial = function () {
            inner._configs = {};
            inner._configs._isIE678 = LChart.Methods.judgeIE678();
            inner._configs.basicoptions = { Off: 0, OffLeft: null, OffRight: null, OffTop: null, OffBottom: null, Width: null, Height: null };

            inner.onStart = null;
            inner.onBeforeAnimation = null;
            inner.onAnimation = null;
            inner.onFinish = null;

            var targetdiv = null;
            var wrongParam = false;
            if (_targetdiv) {
                if (typeof _targetdiv == 'string' && _targetdiv.constructor == String) {
                    var tempTargetdiv = document.getElementById(_targetdiv);
                    if (tempTargetdiv != null && tempTargetdiv.nodeName.toLowerCase() == 'div') {
                        targetdiv = tempTargetdiv;
                    }
                    else { wrongParam = true; }
                }
                else if (typeof _targetdiv == 'object' && _targetdiv.nodeName != undefined && _targetdiv.nodeName.toLowerCase() == 'div') {
                    targetdiv = _targetdiv;
                }
                else {
                    wrongParam = true;
                }
            }
            else { wrongParam = true; }
            if (wrongParam) {
                throw new Error(inner._messages.WrongParam + inner._messages.NeedDiv);
            }
            else {
                if (targetdiv.clientWidth == 0) {
                    targetdiv.style.width = "800px";
                }
                if (targetdiv.clientHeight == 0) {
                    targetdiv.style.height = (targetdiv.clientWidth / 2).toString() + "px";
                }
                targetdiv.style.position = 'relative';
                targetdiv.style.left = '0px';
                targetdiv.style.top = '0px';
                targetdiv.style.padding = '';
            }
            inner.parentdiv = targetdiv;

            var head = document.getElementsByTagName('head')[0];
            var lchartStyle = head.getElementsByTagName('style');
            for (var i = 0, style; style = lchartStyle[i]; i++) {
                if (style.id.indexOf('LChart') == 0) {
                    head.removeChild(style);
                }
            }
            var style = document.createElement('style');
            style.id = 'loongchart_style_';
            head.appendChild(style);
            inner._configs.classes = {};
            var classes = inner._configs._isIE678.isIE678 ? LChart.Const.CustomCss_IE678 : LChart.Const.CustomCss;
            for (var classname in classes) {
                if (classes.hasOwnProperty(classname)) {
                    var newClassName = classname + LChart.Methods.GetRandomString();
                    inner._configs.classes[classname] = newClassName;
                    var css = '.' + newClassName + classes[classname] + '\n';
                    if (style.styleSheet) {
                        style.styleSheet.cssText += css;
                    }
                    else {
                        style.appendChild(document.createTextNode(css));
                    }
                }
            }

            inner.ID = 'LChart_' + LChart.Methods.GetRandomString();
            inner.Initial();
        };
        inner._computeBasic = function (_ops) {
            var getPosNum = function (num) { if (num != null) { return num < 0 ? 0 : num; } else { return null; } };
            var ops = _ops || inner._configs.basicoptions;
            var Off = getPosNum(ops.Off);
            var offleft = getPosNum(ops.OffLeft) || Off || 0;
            var offright = getPosNum(ops.offright) || Off || 0;
            var offtop = getPosNum(ops.offtop) || Off || 0;
            var offbottom = getPosNum(ops.offbottom) || Off || 0;
            var defaultWidth = getPosNum(inner.parentdiv.clientWidth - offleft - offright);
            var defaultHeight = getPosNum(inner.parentdiv.clientHeight - offtop - offbottom);
            var width = LChart.Methods.CapValue(ops.Width || defaultWidth, inner.parentdiv.clientWidth, 0);
            var height = LChart.Methods.CapValue(ops.Height || defaultHeight, inner.parentdiv.clientHeight, 0);
            var result = { offleft: offleft, offright: offright, offtop: offtop, offbottom: offbottom, width: width, height: height };
            if (!_ops) { inner._configs.calculatedBasic = result; }
            return result;
        };
        inner.Initial = function () {
            var children = inner.parentdiv.children;
            for (var i = 0, child; child = children[i]; i++) {
                if (child.nodeName.toLowerCase() == 'canvas') {
                    inner.parentdiv.removeChild(child);
                    break;
                }
            }
            var calculatedBasic = inner._computeBasic();
            var canvas = document.createElement('canvas');
            canvas.setAttribute('id', inner.ID);
            canvas.width = calculatedBasic.width;
            canvas.height = calculatedBasic.height;
            style = 'margin:' + calculatedBasic.offtop + 'px ' + calculatedBasic.offright + 'px ' + calculatedBasic.offbottom + 'px ' + calculatedBasic.offleft + 'px;';
            canvas.innerHTML = '<p>' + inner._messages.NotSupportHtml5 + '</p>';
            canvas.setAttribute('style', style);
            if (inner._configs._isIE678.isIE678) {
                if (window.G_vmlCanvasManager) {
                    canvas = window.G_vmlCanvasManager.initElement(canvas);
                }
                else {
                    throw new Error(inner._messages.NeetExcanvasJS);
                }
            }
            inner.parentdiv.appendChild(canvas);
            inner.canvas = canvas;
            inner.ctx = canvas.getContext('2d');
            inner._configs.needCheckSkin = true;
            inner._configs.optionsBackup = {};
            inner._configs.pluginZIndex = 0;
            inner._configs.cursorPointer = false;
            inner.plugins = [];
            inner.customDraws = [];
            inner._configs.eventlisteners = { click: [], mousemove: [] };
            inner.SetDefaultOptions();
            inner.ClearBackGround();
        };
        inner.SetBasicOptions = function (ops) {
            var _computedNew = inner._computeBasic(ops);
            var calculatedBasic = inner._configs.calculatedBasic;
            if (calculatedBasic && LChart.Methods.ObjectHaveSameValues(calculatedBasic, _computedNew, ['offleft', 'offright', 'offtop', 'offbottom', 'height', 'width'])) {
                return;
            }
            inner._configs.basicoptions = LChart.Methods.Override(inner._configs.basicoptions, ops);
            inner.Initial();
            return inner;
        };
        inner._addEventListener = function (type, func) {
            if (!inner.innerOptions.supportMouseEvents) {
                return;
            }
            if (inner._configs._isIE678.isIE678) {
                inner.canvas.attachEvent('on' + type, func);
            }
            else {
                inner.canvas.addEventListener(type, func);
            }
            inner._configs.eventlisteners[type].push(func);
        };
        inner.ClearBackGround = function () {
            inner.parentdiv.style.backgroundColor = '';
            inner.ctx.clearRect(0, 0, inner.canvas.width, inner.canvas.height);
            var children = inner.parentdiv.children;
            for (var i = 0, child; child = children[i]; i++) {
                if (child.nodeName && child.nodeName.toLowerCase() != 'canvas') {
                    inner.parentdiv.removeChild(child);
                    i--;
                }
            }
            for (var i = 0, eventlistener; eventlistener = inner._configs.eventlisteners.click[i]; i++) {
                if (inner._configs._isIE678.isIE678) {
                    inner.canvas.detachEvent('onclick', eventlistener);
                }
                else {
                    inner.canvas.removeEventListener('click', eventlistener, false);
                }
            }
            inner._configs.eventlisteners.click.length = 0;
            for (var i = 0, eventlistener; eventlistener = inner._configs.eventlisteners.mousemove[i]; i++) {
                if (inner._configs._isIE678.isIE678) {
                    inner.canvas.detachEvent('onmousemove', eventlistener);
                }
                else {
                    inner.canvas.removeEventListener('mousemove', eventlistener, false);
                }

            }
            inner._configs.eventlisteners.mousemove.length = 0;
            inner.canvas.style.cursor = 'auto';
        };
        inner.SetDefaultOptions = function () {
            inner._resetSharedOpions();
            inner.innerOptions = LChart[inner.GraphType]._getDefaultOptions(inner._configs.originalCommonOptions);
            return inner;
        };
        inner._resetSharedOpions = function () {
            if (inner._configs.originalCommonOptions) { return; }
            inner._configs.originalCommonOptions = {
                valueType: null,
                animation: !inner._configs._isIE678.isIE678,
                animationSteps: 100,
                animationEasing: 'easeInOutQuart',
                scaleOverlay: false,
                lineColor: null,
                fontFamily: null,
                fontColor: null,
                background: {
                    bordercolor: null,
                    borderwidth: null,
                    fillstyle: null
                },
                title: {
                    show: true,
                    content: null,
                    color: null,
                    fontfamily: null,
                    fontsize: null,
                    fontweight: null,
                    offtop: null,
                    height: null
                },
                subTitle: {
                    show: true,
                    content: null,
                    color: null,
                    fontfamily: null,
                    fontsize: null,
                    fontweight: null,
                    height: null
                },
                legend: {
                    show: true,
                    enablecontrol: false,
                    strikethrough: true,
                    type: null,
                    elementtype: null,
                    placeX: null,
                    placeY: null,
                    sidelength: null,
                    offX: null,
                    offY: null,
                    bordercolor: null,
                    borderwidth: 1,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null
                },
                scale: {
                    linewidth: 1,
                    linecolor: null,
                    backcolors: null
                },
                labelAxis: {
                    labels: null,
                    startlength: null,
                    endlength: null,
                    length: null,
                    linewidth: 1,
                    linecolor: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    fontrotate: null
                },
                valueAxis: {
                    length: null,
                    content: function (val) {
                        if (this.valueType == 'd') { return val.format('yyyy-MM-dd'); }
                        else if (this.valueType == 't') { return val.format('MM-dd hh:mm'); }
                        else if (this.valueType == 'm') { return val.format('hh:mm:ss.S'); }
                        else if (this.valueType == 'p') { return val.toFixed(0).toString() + '%'; }
                        else { return val.toString(); }
                    },
                    minvalue: null,
                    maxvalue: null,
                    interval: null,
                    verticalcomputeP: false,
                    linewidth: null,
                    linecolor: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    fontrotate: null
                },
                axis3d: {
                    sightangle: null,
                    marbleheight: null,
                    marblewidth: null,
                    marblelinewidth: 0,
                    marblelinecolor: null,
                    stagewidth: null,
                    marbletopcolor: null,
                    marblerightcolor: null,
                    marblefacecolor: null,
                    curtainwidth: null
                },
                splitLine: {
                    show: false,
                    linecolor: null,
                    linewidth: null
                },
                cross: {
                    show: true,
                    length: null,
                    linewidth: null,
                    linecolor: null
                },
                close: {
                    show: true,
                    linewidth: null,
                    linecolor: null
                },
                caption: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null
                },
                xAxisTitle: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    titlelocation: null
                },
                yAxisTitle: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    titlelocation: null
                },
                footer: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    rightdistance: null,
                    bottomdistance: null
                },
                shadow: {
                    show: true,
                    color: null,
                    blur: null,
                    offsetX: null,
                    offsetY: null
                },
                supportMouseEvents: true,
                tip: {
                    show: true,
                    content: function (data) {
                        var val = data.value.toString();
                        if (this.valueType == 'd') { val = data.value.format('yyyy-MM-dd'); }
                        else if (this.valueType == 't') { val = data.value.format('MM-dd hh:mm'); }
                        else if (this.valueType == 'm') { val = data.value.format('hh:mm:ss.S'); }
                        return '<div>&nbsp;' + data.text + '：' + val + '&nbsp;</div>';
                    },
                    tiptype: null
                },
                click: null,
                mouseover: null,
                mouseleave: null,
                mouseoverTransparency: 0.3,
                mouseoverChangeCursor: true,
                onAnimationComplete: null
            };
        };
        inner.SetSkin = function (skinID) {
            if (!LChart.Const.Skins[skinID]) { skinID = 'BlackAndWhite'; }
            var skin = LChart.Const.Skins[skinID];
            var newOps = {};
            newOps.fontColor = skin.FontColor || null;
            newOps.lineColor = skin.LineColor || null;
            newOps.fontFamily = skin.FontFamily || null;
            newOps.background = {};
            newOps.background.fillstyle = null;
            if (skin.BackGround) {
                newOps.background.bordercolor = skin.BackGround.BorderColor || null;
                newOps.background.borderwidth = skin.BackGround.BorderWidth || null;
                if (skin.BackGround.BackColor) {
                    newOps.background.fillstyle = skin.BackGround.BackColor;
                }
                else {
                    var ops = skin.BackGround.LinearGradient;
                    if (ops && ops.Location && ops.ColorStops && ops.ColorStops.length) {
                        var loc = ops.Location;
                        var gradient = inner.ctx.createLinearGradient(loc.minX || 0, loc.minY || 0, loc.maxX || inner.canvas.width, loc.maxY || inner.canvas.height);
                        for (var i = 0, stop; stop = ops.ColorStops[i]; i++) {
                            gradient.addColorStop(stop.offset, stop.color);
                        }
                        newOps.background.fillstyle = gradient;
                    }
                    else {
                        ops = skin.BackGround.RadialGradient;
                        if (ops && ops.Location && ops.ColorStops && ops.ColorStops.length) {
                            var loc = ops.Location;
                            var gradient = inner.ctx.createRadialGradient(loc.x0 || inner.canvas.width / 2, loc.y0 || inner.canvas.height / 2, loc.r0 || 0, loc.x1 || inner.canvas.width / 2, loc.y1 || inner.canvas.height / 2, loc.r1 || Math.max(inner.canvas.width, inner.canvas.height));
                            for (var i = 0, stop; stop = ops.ColorStops[i]; i++) {
                                gradient.addColorStop(stop.offset, stop.color);
                            }
                            newOps.background.fillstyle = gradient;
                        }
                    }
                }
            }
            newOps.title = {};
            newOps.title.color = skin.TitleColor || null;
            newOps.subTitle = {};
            newOps.subTitle.color = skin.SubTitleColor || null;
            newOps.legend = {};
            newOps.legend.fontcolor = skin.LegendFontColor || null;
            newOps.legend.bordercolor = skin.LegendBorderColor || null;
            newOps.title = {};
            newOps.title.color = skin.TitleColor || null;
            newOps.scale = {};
            newOps.scale.linecolor = skin.ScaleLineColor || null;
            newOps.scale.backcolors = skin.ScaleBackColors || null;
            newOps.labelAxis = {};
            newOps.labelAxis.linecolor = skin.LabelAxisLineColor || null;
            newOps.labelAxis.fontcolor = skin.LabelAxisFontColor || null;
            newOps.valueAxis = {};
            newOps.valueAxis.linecolor = skin.ValueAxisLineColor || null;
            newOps.valueAxis.fontcolor = skin.ValueAxisFontColor || null;
            newOps.axis3d = {};
            newOps.axis3d.marblelinecolor = skin.MarbleLineColor || null;
            newOps.axis3d.marbletopcolor = skin.MarbleTopColor || null;
            newOps.axis3d.marblerightcolor = skin.MarbleRightColor || null;
            newOps.axis3d.marblefacecolor = skin.MarbleFaceColor || null;
            newOps.splitLine = {};
            newOps.splitLine.linecolor = skin.SplitLineColor || null;
            newOps.cross = {};
            newOps.cross.linecolor = skin.CrossLineColor || null;
            newOps.close = {};
            newOps.close.linecolor = skin.CloseLineColor || null;
            newOps.caption = {};
            newOps.caption.fontcolor = skin.CaptionFontColor || null;
            newOps.xAxisTitle = {};
            newOps.xAxisTitle.fontcolor = skin.XAxisTitleFontColor || null;
            newOps.yAxisTitle = {};
            newOps.yAxisTitle.fontcolor = skin.YAxisTitleFontColor || null;
            newOps.footer = {};
            newOps.footer.fontcolor = skin.FooterFontColor || null;
            newOps.shadow = {};
            newOps.shadow.color = skin.ShadowColor || null;
            newOps.tip = {};
            newOps.tip.tiptype = skin.TipType || null;
            inner._configs.skinCommonOptions = newOps;
            inner._configs.skinID = skinID;
            inner._configs.needCheckSkin = true;
            return inner;
        };
        inner.RemoveSkin = function () {
            inner._configs.skinCommonOptions = null;
            inner._configs.skinID = null;
            inner._configs.needCheckSkin = true;
        };
        inner._transferArrayDataToObject = function (arr) {
            var res = {};
            if (arr[0] && typeof arr[0] == 'string') { res.text = arr[0]; }
            else {
                throw new Error(inner._messages.WrongParam + '\'' + arr + '\'' + inner._messages.FirstValueShouldBeString);
            }
            if (arr[1] != null) { res.value = arr[1]; }
            else {
                throw new Error(inner._messages.WrongParam + '\'' + arr + '\'' + inner._messages.ValueMustNotBeUndefined);
            }
            var index = 2;
            if (LChart.Methods.IsArray(arr[index])) {
                var subitems = arr[index];
                if (LChart.Methods.IsArray(subitems[0]) && subitems[0].length > 0 && typeof subitems[0][0] == 'string') {
                    for (var i = 0; i < subitems.length; i++) {
                        subitems[i] = inner._transferArrayDataToObject(subitems[i]);
                    }
                }
                res.subitems = subitems;
                index++;
            }
            if (typeof arr[index] == 'string') { res.color = arr[index]; index++; }
            if (typeof arr[index] == 'function') { res.click = arr[index]; index++; }
            if (typeof arr[index] == 'function') { res.mouseover = arr[index]; index++; }
            if (typeof arr[index] == 'function') { res.mouseleave = arr[index]; }
            return res;
        };
        inner._judgeArrayDataSource = function (data) {
            if (LChart.Methods.IsArray(data[0]) && data[0].length > 0 && typeof data[0][0] == 'string') {
                var tranData = [];
                for (var i = 0, item; item = data[i]; i++) {
                    var newitem = inner._transferArrayDataToObject(item);
                    tranData.push(newitem);
                }
                data = tranData;
            }
            return data;
        };
        inner.SetData = function (data) {
            if ((!data || !LChart.Methods.IsArray(data)) && (!inner.innerData || !LChart.Methods.IsArray(inner.innerData))) {
                throw new Error(inner._messages.WrongParam + inner._messages.DataMustBeArray);
            }
            if (data) {
                inner.innerData = inner._judgeArrayDataSource(data);
                inner._configs.dataBackup = [];
                for (var i = 0; i < inner.innerData.length; i++) {
                    inner._configs.dataBackup[i] = LChart.Methods.DeepCopy(inner.innerData[i]);
                }
                inner._configs.legendSize = null;
                inner._configs.legendcontrol = { hidelegend: [], mouseoverindex: null };
            }
            return inner;
        };
        inner.SetOptions = function (ops) {
            if (!inner.innerOptions) {
                inner.SetDefaultOptions();
            }
            if (ops) {
                inner.innerOptions = LChart.Methods.Override(inner.innerOptions, ops);
                inner._configs.needCheckSkin = true;
            }
            if (ops || !inner._configs.optionsBackup.mainOptions) {
                inner._configs.optionsBackup.mainOptions = inner.innerOptions;
            }
            return inner;
        };
        inner.getCoordinate = function (location) {
            var coors = inner.coordinates;
            if (typeof location != 'string') { return coors; }
            else {
                var splits = location.replace(LChart.Const.RegExps.BlankCharacter, '').split(".");
                for (var i = 0, item; item = splits[i]; i++) {
                    if (coors) { coors = coors[item]; }
                }
                return coors;
            }
        };
        inner._checkOptions = function () {
            var _checkOption = function (name, val, type) {
                var throwErr = function (errName) {
                    throw new Error(inner._messages.WrongParam + name + inner._messages[errName]);
                };
                if (val === null) { return null; }
                else if (val === undefined) { throwErr('OptionShouldNotBeUndefined'); }
                var returnval = null;
                switch (type) {
                    case 's':
                        if (typeof val != 'string') { throwErr('OptionShouldBeString'); }
                        break;
                    case 'd':
                    case 't':
                    case 'm':
                        var valIsDate = LChart.Methods.IsDate(val);
                        var valIsDateString = typeof val == 'string' && LChart.Methods.StringIsDate(val);
                        var valIsNumber = typeof val == 'number';
                        if (!valIsDate && !valIsDateString && !valIsNumber) { throwErr('OptionShouldBeDate'); }
                        if (valIsDateString) { returnval = LChart.Methods.ParseDate(val); }
                        else if (valIsNumber) { returnval = new Date(val); }
                        break;
                    case 'b':
                        if (typeof val != 'boolean') { throwErr('OptionShouldBeBoolean'); }
                        break;
                    case 'c':
                        if (typeof val != 'string' || !LChart.Methods.IsColor(val)) { throwErr('OptionShouldBeColorStr'); }
                        break;
                    case 'f':
                        if (typeof val != 'function') { throwErr('OptionShouldBeFunction'); }
                        break;
                    case 'ca':
                        if (typeof val == 'string' && LChart.Methods.IsColor(val)) { returnval = [val]; }
                        else {
                            var fluent = true;
                            if (LChart.Methods.IsArray(val) && val.length) { for (var i = 0, str; str = val[i]; i++) { if (typeof str != 'string' || !LChart.Methods.IsColor(str)) { fluent = false; } } }
                            else { fluent = false; }
                            if (!fluent) { throwErr('OptionShouldBeColorArray'); }
                        }
                        break;
                    case 'sa':
                        if (typeof val == 'string') { returnval = [val]; }
                        else {
                            var fluent = true;
                            if (LChart.Methods.IsArray(val) && val.length) { for (var i = 0, str; str = val[i]; i++) { if (typeof str != 'string') { fluent = false; } } }
                            else { fluent = false; }
                            if (!fluent) { throwErr('OptionShouldBeStringArray'); }
                        }
                        break;
                    case 'na':
                        if (typeof val == 'number' && LChart.Methods.IsNumber(val)) { returnval = [val]; }
                        else {
                            var fluent = true;
                            if (LChart.Methods.IsArray(val) && val.length) { for (var i = 0; i < val.length; i++) { if (typeof val[i] != 'number' || !LChart.Methods.IsNumber(val[i])) { fluent = false; } } }
                            else { fluent = false; }
                            if (!fluent) { throwErr('OptionShouldBeNumberArray'); }
                        }
                        break;
                    default:
                        if (typeof val != 'number' || !LChart.Methods.IsNumber(val)) { throwErr('OptionShouldBeNumber'); }
                        break;
                }
                return returnval;
            };
            var commonsets = {
                __top: [['valueType', 's'], ['animation', 'b'], ['animationSteps', 'n'], ['animationEasing', 's'], ['scaleOverlay', 'b'], ['lineColor', 'c'], ['fontFamily', 's'], ['fontColor', 'c'], ['supportMouseEvents', 'b'], ['click', 'f'], ['mouseover', 'f'], ['mouseleave', 'f'], ['mouseoverTransparency', 'n'], ['mouseoverChangeCursor', 'b'], ['onAnimationComplete', 'f']],
                title: [['show', 'b'], ['content', 's'], ['offtop', 'n'], ['height', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's']],
                subTitle: [['show', 'b'], ['content', 's'], ['height', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's']],
                legend: [['show', 'b'], ['enablecontrol', 'b'], ['strikethrough', 'b'], ['type', 's'], ['elementtype', 's'], ['placeX', 's'], ['placeY', 's'], ['sidelength', 'n'], ['offX', 'n'], ['offY', 'n'], ['bordercolor', 'c'], ['borderwidth', 'n'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's']],
                background: [['bordercolor', 'c'], ['borderwidth', 'n']],
                scale: [['linewidth', 'n'], ['linecolor', 'c'], ['backcolors', 'ca']],
                labelAxis: [['labels', 'sa'], ['startlength', 'n'], ['endlength', 'n'], ['length', 'n'], ['linewidth', 'n'], ['linecolor', 'c'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['fontrotate', 'n']],
                valueAxis: [['length', 'n'], ['content', 'f'], ['interval', 'n'], ['verticalcomputeP', 'b'], ['linewidth', 'n'], ['linecolor', 'c'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['fontrotate', 'n']],
                axis3d: [['sightangle', 'n'], ['marbleheight', 'n'], ['marblewidth', 'n'], ['marblelinewidth', 'n'], ['marblelinecolor', 'c'], ['stagewidth', 'n'], ['marbletopcolor', 'c'], ['marblerightcolor', 'c'], ['marblefacecolor', 'c'], ['curtainwidth', 'n']],
                splitLine: [['show', 'b'], ['linewidth', 'n'], ['linecolor', 'c']],
                cross: [['show', 'b'], ['length', 'n'], ['linewidth', 'n'], ['linecolor', 'c']],
                close: [['show', 'b'], ['linewidth', 'n'], ['linecolor', 'c']],
                caption: [['content', 's'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's']],
                xAxisTitle: [['content', 's'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['titlelocation', 'n']],
                yAxisTitle: [['content', 's'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['titlelocation', 'n']],
                footer: [['content', 's'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['rightdistance', 'n'], ['bottomdistance', 'n']],
                shadow: [['show', 'b'], ['color', 'c'], ['blur', 'n'], ['offsetX', 'n'], ['offsetY', 'n']],
                tip: [['show', 'b'], ['content', 'f'], ['tiptype', 's']]
            };
            var checksets = function (sets, _options) {
                for (var _item in sets) {
                    var ops = _item == '__top' ? _options : _options[_item];
                    for (var i = 0, subitem; subitem = sets[_item][i]; i++) {
                        var name = _item == '__top' ? subitem[0] : _item + '.' + subitem[0];
                        var val = ops[subitem[0]];
                        var type = subitem[1];
                        var returnval = _checkOption(name, val, type);
                        if (returnval != null) { ops[subitem[0]] = returnval; }
                    }
                }
            };
            var options = inner.innerOptions;
            checksets(commonsets, options);
            checksets(LChart[inner.GraphType]._getCheckOptions(), options);
            for (var i = 0, plugin; plugin = inner.plugins[i]; i++) {
                checksets(commonsets, plugin.pluginOptions);
                checksets(LChart[plugin.pluginType]._getCheckOptions(), plugin.pluginOptions);
            }
            if (options.labelAxis.valueType !== undefined) {
                options.labelAxis.minvalue = _checkOption('labelAxis.minvalue', options.labelAxis.minvalue, options.labelAxis.valueType) || options.labelAxis.minvalue;
                options.labelAxis.maxvalue = _checkOption('labelAxis.maxvalue', options.labelAxis.maxvalue, options.labelAxis.valueType) || options.labelAxis.maxvalue;
            }
            if (options.splitpoint !== undefined) {
                options.splitpoint = _checkOption('splitpoint', options.splitpoint, options.valueType) || options.splitpoint;
            }
            options.valueAxis.minvalue = _checkOption('valueAxis.minvalue', options.valueAxis.minvalue, options.valueType) || options.valueAxis.minvalue;
            options.valueAxis.maxvalue = _checkOption('valueAxis.maxvalue', options.valueAxis.maxvalue, options.valueType) || options.valueAxis.maxvalue;
        };
        inner.AddPlugin = function (type, data, options, zIndex) {
            if (typeof type != 'string' || !LChart.Const.DrawAxis.__contains(type) && !LChart.Const.NotDrawAxis.__contains(type)) {
                throw new Error(inner._messages.PluginParamWrong);
            }
            if (!LChart.Const.AsPlugins.__contains(type)) {
                throw new Error('"' + type + '"' + inner._messages.PluginNotSupportedType);
            }
            if (LChart[type] == undefined) {
                throw new Error('\'' + type + '\'' + inner._messages.GraphicTypeNotQuoted);
            }
            if (arguments.length === 2 && !LChart.Methods.IsArray(arguments[1])) {
                options = arguments[1];
                data = null;
            }
            if (data) {
                data = inner._judgeArrayDataSource(data);
            }
            if (!options) { options = LChart[type]._getDefaultOptions(inner._configs.originalCommonOptions); }
            else { options = LChart.Methods.Override(LChart[type]._getDefaultOptions(inner._configs.originalCommonOptions), options); }
            var pluginID = 'pluginID_' + LChart.Methods.GetRandomString();
            if (!LChart.Methods.IsNumber(zIndex)) {
                zIndex = inner._configs.pluginZIndex + 1;
                inner._configs.pluginZIndex++;
            }
            else {
                var addOne = false;
                if (zIndex == 0) { zIndex = 1; }
                for (var i = 0, plugin; plugin = inner.plugins[i]; i++) {
                    if (plugin.zIndex == zIndex) { addOne = true; }
                    if (addOne) { plugin.zIndex++; }
                    if (plugin.zIndex == 0) { plugin.zIndex++; }
                }
                if (inner.plugins.length > 0) {
                    inner._configs.pluginZIndex = Math.max(inner.plugins[inner.plugins.length - 1].zIndex, 0);
                }
            }
            var plugin = { pluginID: pluginID, pluginType: type, pluginData: data, pluginOptions: options, zIndex: zIndex };
            inner._configs.optionsBackup[pluginID] = options;
            inner._configs.needCheckSkin = true;
            inner.plugins.push(plugin);
            inner.plugins.sort(function (x, y) { return x.zIndex - y.zIndex; });
            return pluginID;
        };
        inner.RemovePlugin = function (pluginID) {
            var find = false;
            var plugins = inner.plugins;
            for (var i = 0, n = 0; i < plugins.length; i++) {
                if (plugins[i].pluginID != pluginID) {
                    plugins[n++] = plugins[i];
                }
                else { find = true; }
            }
            if (find) {
                plugins.length -= 1;
                var tmpOptionsBackup = { mainOptions: inner._configs.optionsBackup.mainOptions };
                for (var i = 0, plugin; plugin = inner.plugins[i]; i++) {
                    tmpOptionsBackup[plugin.pluginID] = inner._configs.optionsBackup[plugin.pluginID];
                }
                inner._configs.optionsBackup = tmpOptionsBackup;
            }
            return inner;
        };
        inner.ClearPlugins = function () {
            if (inner.plugins.length > 0) {
                inner.plugins.length = 0;
                var tmpOptionsBackup = { mainOptions: inner._configs.optionsBackup.mainOptions };
                inner._configs.optionsBackup = tmpOptionsBackup;
            }
        };
        inner._reApplySkinOptions = function () {
            var skinCommonOptions = inner._configs.skinCommonOptions;
            if (inner._configs.needCheckSkin) {
                inner._configs.needCheckSkin = false;
                var applySkin = function (backup, type) {
                    var newOps = {};
                    var skin = LChart.Const.Skins[inner._configs.skinID][type];
                    if (LChart.Const.Skins[inner._configs.skinID] && skin) { LChart[type]._spreadSkin(newOps, skin); }
                    var tmpSkinOptions = LChart.Methods.Extend(skinCommonOptions, newOps);
                    return LChart.Methods.Extend(tmpSkinOptions, backup, true);
                };
                if (skinCommonOptions) {
                    inner.innerOptions = applySkin(inner._configs.optionsBackup.mainOptions, inner.GraphType);
                    for (var i = 0, plugin; plugin = inner.plugins[i]; i++) {
                        plugin.pluginOptions = applySkin(inner._configs.optionsBackup[plugin.pluginID], plugin.pluginType);
                    }
                }
                else {
                    inner.innerOptions = inner._configs.optionsBackup.mainOptions;
                    for (var i = 0, plugin; plugin = inner.plugins[i]; i++) {
                        plugin.pluginOptions = inner._configs.optionsBackup[plugin.pluginID];
                    }
                }
            }
        };
        inner.Draw = function (_data, ops) {
            if (arguments.length === 1) {
                if (!LChart.Methods.IsArray(arguments[0])) {
                    ops = arguments[0];
                    _data = undefined;
                }
            }
            inner.SetData(_data);
            inner.SetOptions(ops);
            inner._checkOptions();
            inner.canvas.onclick = null;
            inner.canvas.onmousemove = null;
            inner.shapes = {};
            inner.coordinates = {};
            inner._configs.specificConfig = {};
            if (inner.onStart) { inner.onStart(); }
            inner._reApplySkinOptions();
            inner._configs.specificConfig[inner.ID] = {};
            var tasks = [];
            if (inner.innerData.length > 0) {
                inner._configs.axisData = null;
                inner._configs.axisSize = null;
                inner._configs.coordinate = null;
                var innerOptions = inner.innerOptions;
                var mainTask = LChart[inner.GraphType]._drawgraphic(inner, inner.ID, inner.innerData, innerOptions);
                mainTask.zIndex = 0;
                tasks.push(mainTask);
                for (var i = 0, plugin; plugin = inner.plugins[i]; i++) {
                    var pluginData = plugin.pluginData || inner.innerData;
                    if (pluginData.length > 0) {
                        inner._configs.specificConfig[plugin.pluginID] = {};
                        var task = LChart[plugin.pluginType]._drawgraphic(inner, plugin.pluginID, pluginData, plugin.pluginOptions);
                        task.zIndex = plugin.zIndex;
                        tasks.push(task);
                    }
                }
                tasks.sort(function (x, y) { return x.zIndex - y.zIndex; });
                if (innerOptions.animateRotate != undefined) {
                    if (!innerOptions.animateRotate && !innerOptions.animateScale) { innerOptions.animation = false; }
                }
                if (innerOptions.animateY != undefined) {
                    if (!innerOptions.animateY && !innerOptions.animateX) { innerOptions.animation = false; }
                }
            }
            inner.ClearBackGround();
            inner._startDrawAndAnimation(tasks);
        };
        inner._createAssists = function (valids) {
            inner._createBackground();
            inner._createTitle(valids);
            inner._createLegend();
            inner._createAxis(valids);
            inner._createFooter();
        };
        inner._startDrawAndAnimation = function (tasks) {
            var options = inner.innerOptions;
            var animFrameAmount = (options.animation) ? 1 / LChart.Methods.CapValue(options.animationSteps, 50, 1) : 1;
            var easingFunction = LChart.Const.AnimationAlgorithms[options.animationEasing];
            var percentAnimComplete = (options.animation && inner.innerData.length > 0) ? 0 : 1;
            var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); };
            var valids = inner._calculateOutersValid();
            if (!inner._configs.recreateAssists) { inner._createAssists(valids); }
            var coordinate = inner._getDrawableCoordinate();
            if (inner.onBeforeAnimation) { inner.onBeforeAnimation(); }
            var animLoop = function () {
                percentAnimComplete += animFrameAmount;
                if (inner.onAnimation) { inner.onAnimation(percentAnimComplete); }
                var easeAdjustedAnimationPercent = (options.animation) ? LChart.Methods.CapValue(easingFunction(percentAnimComplete), null, 0) : 1;
                inner._clearDrawable(coordinate);
                if (!valids.AxisValid || inner._configs.recreateAssists || inner._configs._isIE678.isIE678) { inner._createAssists(valids); }
                if (!options.scaleOverlay) {
                    inner._createScales(valids, true, true);
                }
                if (options.scaleOverlay) {
                    inner._createScales(valids, true);
                }
                for (var i = 0, task; task = tasks[i]; i++) {
                    if (options.scaleOverlay) {
                        task.drawSegments(easeAdjustedAnimationPercent, percentAnimComplete);
                    }
                    else {
                        task.drawSegments(easeAdjustedAnimationPercent, percentAnimComplete);
                    }
                }
                if (options.scaleOverlay) {
                    inner._createScales(valids, false, true);
                }
                for (var i = 0, customdraw; customdraw = inner.customDraws[i]; i++) {
                    inner.DrawFigures[customdraw.funcname].apply(inner, customdraw.options);
                }
                if (percentAnimComplete < 1) {
                    requestAnimationFrame(animLoop);
                }
                else {
                    inner.redrawAll = function () {
                        inner._clearDrawable(coordinate);
                        inner._createAssists();
                        if (!options.scaleOverlay) {
                            inner._createScales(valids, true, true);
                        }
                        if (options.scaleOverlay) {
                            inner._createScales(valids, true);
                        }
                        for (var i = 0, task; task = tasks[i]; i++) {
                            task.redraw();
                        }
                        if (options.scaleOverlay) {
                            inner._createScales(valids, false, true);
                        }
                        for (var i = 0, customdraw; customdraw = inner.customDraws[i]; i++) {
                            inner.DrawFigures[customdraw.funcname].apply(inner, customdraw.options);
                        }
                    };
                    for (var i = 0, task; task = tasks[i]; i++) {
                        if (options.supportMouseEvents && typeof task.mouseEvents == 'function') {
                            task.mouseEvents();
                        }
                    }
                    var legendcoor = inner.coordinates.legend;
                    if (legendcoor && options.legend.enablecontrol) {
                        var legendcontrol = inner._configs.legendcontrol;
                        var getlegend = function (e) {
                            var location = inner._getMouseLoction(e);
                            var x = location.X; var y = location.Y;
                            var index = null;
                            if (x > legendcoor.left + legendcoor.borderwidth / 2 && x < legendcoor.left + legendcoor.width - legendcoor.borderwidth / 2 && y > legendcoor.top + legendcoor.borderwidth / 2 && y < legendcoor.top + legendcoor.height - legendcoor.borderwidth / 2) {
                                var computed = inner._computeLegend();
                                var lineelement = computed.elementtype == 'l';
                                for (var i = 0; i < legendcoor.points.length; i++) {
                                    var point = legendcoor.points[i];
                                    if (computed.type == 'column') {
                                        var _length = lineelement ? point.length / 2 : point.length;
                                        var _top = lineelement ? point.top - _length / 2 : point.top;
                                        if (y > _top && y < _top + _length) { inner._configs.cursorPointer = true; index = i; break; }
                                    }
                                    else {
                                        if (x > point.left && x < point.left + computed.sidelength + computed.sidedistance + computed.textlengths[i]) { inner._configs.cursorPointer = true; index = i; break; }
                                    }
                                }
                            };
                            return index;
                        };
                        var mousemove_legend = function (e) {
                            var e = window.event || e;
                            var index = getlegend(e);
                            if (index != legendcontrol.mouseoverindex) {
                                legendcontrol.mouseoverindex = index;
                                inner.redrawAll();
                            }
                        };
                        inner._addEventListener('mousemove', mousemove_legend);
                        var click_legend = function (e) {
                            var e = window.event || e;
                            var index = getlegend(e);
                            if (index != null) {
                                if (legendcontrol.hidelegend.__contains(index)) {
                                    var newhidelegend = [];
                                    for (var i = 0, n = 0; i < legendcontrol.hidelegend.length; i++) {
                                        if (legendcontrol.hidelegend[i] != index) {
                                            newhidelegend[n++] = legendcontrol.hidelegend[i]
                                        }
                                    }
                                    legendcontrol.hidelegend = newhidelegend;
                                    inner.innerData = [];
                                    for (var i = 0; i < inner._configs.dataBackup.length; i++) {
                                        if (!legendcontrol.hidelegend.__contains(i)) {
                                            inner.innerData.push(inner._configs.dataBackup[i]);
                                        }
                                    }
                                }
                                else {
                                    legendcontrol.hidelegend.push(index);
                                    inner.innerData = [];
                                    for (var i = 0; i < inner._configs.dataBackup.length; i++) {
                                        if (!legendcontrol.hidelegend.__contains(i)) {
                                            inner.innerData.push(inner._configs.dataBackup[i]);
                                        }
                                    }
                                }
                                inner.Draw();
                            }
                        };
                        inner._addEventListener('click', click_legend);
                    }
                    var mousemove_cursor = function () {
                        if (options.mouseoverChangeCursor && inner._configs.cursorPointer) { inner.canvas.style.cursor = 'pointer'; }
                        else { inner.canvas.style.cursor = 'auto'; }
                        inner._configs.cursorPointer = false;
                    };
                    inner._addEventListener('mousemove', mousemove_cursor);
                    if (typeof options.onAnimationComplete == 'function') { options.onAnimationComplete(); }
                    if (inner.onFinish) { inner.onFinish(); }
                }
            };
            requestAnimationFrame(animLoop);
        };
        inner._createBackground = function () {
            var ops = inner.innerOptions.background;
            var canvas = inner.canvas;
            if (ops.fillstyle) {
                inner.DrawFigures.createRectangleFill(0, 0, canvas.width, canvas.height, ops.fillstyle);
            }
            else {
                inner.ctx.clearRect(0, 0, inner.canvas.width, inner.canvas.height);
            }
            var borderwidth = ops.borderwidth || 0;
            if (borderwidth > 0) {
                inner.DrawFigures.createRectangleBorder(0, 0, canvas.width, canvas.height, borderwidth * 2, ops.bordercolor);
            }
            inner.coordinates.canvas = { width: canvas.width, height: canvas.height, borderwidth: borderwidth };
        };
        inner._createTip = function (content, left, top) {
            var tipBox = document.createElement('span');
            var tiptype = inner.innerOptions.tip.tiptype || LChart.Const.Defaults.TipType;
            tipBox.setAttribute(inner._configs._isIE678.isIE67 ? 'className' : 'class', inner._configs.classes[tiptype]);
            tipBox.style.position = 'absolute';
            tipBox.style.left = left + inner._configs.calculatedBasic.offleft + 'px';
            tipBox.style.top = top + inner._configs.calculatedBasic.offtop + 'px';
            tipBox.innerHTML = content;
            inner.parentdiv.appendChild(tipBox);
            return tipBox;
        };
        inner._changeTip = function (tip, left, top) {
            if (left) {
                tip.style.left = left + inner._configs.calculatedBasic.offleft + 'px';
            }
            if (top) {
                tip.style.top = top + inner._configs.calculatedBasic.offtop + 'px';
            }
        };
        inner._getDrawableCoordinate = function () {
            if (!inner._configs.coordinate) {
                var ops = inner.innerOptions;
                var valids = inner._calculateOutersValid();
                var minX, minY, maxX, maxY;
                if (valids.AxisValid) {
                    var axisSize = inner._configs.axisSize || inner._computeAxis(valids);
                    minX = axisSize.minX - 1;
                    minY = axisSize.minY - 1;
                    maxX = axisSize.maxX + 1;
                    maxY = axisSize.maxY + 1;
                }
                else {
                    var legendSize = valids.legendValid ? inner._computeLegend() : null;
                    minX = (legendSize ? legendSize.occupyLeft : 0);
                    maxX = inner.canvas.width - (legendSize ? legendSize.occupyRight : 0);
                    if (valids.titleValid) { minY = inner._computeTitle(valids).occupyTop; }
                    else { minY = 0; }
                    minY += (legendSize ? legendSize.occupyTop : 0);
                    maxY = inner.canvas.height - (legendSize ? legendSize.occupyBottom : 0);
                    var canvasBorderWidth = ops.background.borderwidth || 0;
                    minX += canvasBorderWidth; maxX -= canvasBorderWidth; minY += canvasBorderWidth; maxY -= canvasBorderWidth;
                }
                var centerX = (maxX + minX) / 2;
                var centerY = (maxY + minY) / 2;
                inner._configs.coordinate = { minX: Math.ceil(minX), maxX: Math.ceil(maxX), minY: Math.ceil(minY), maxY: Math.ceil(maxY), centerX: centerX, centerY: centerY };
            }
            return inner._configs.coordinate;
        };
        inner._clearDrawable = function (coordinate) {
            var ops = inner.innerOptions.background;
            coordinate = coordinate || inner._getDrawableCoordinate();
            inner.ctx.clearRect(coordinate.minX + 1, coordinate.minY + 1, coordinate.maxX - coordinate.minX - 2, coordinate.maxY - coordinate.minY - 2);
            if (ops.fillstyle) {
                inner.DrawFigures.createRectangleFill(coordinate.minX + 1, coordinate.minY + 1, coordinate.maxX - coordinate.minX - 2, coordinate.maxY - coordinate.minY - 2, ops.fillstyle);
            }
        };
        inner._computeTitle = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            var ops = inner.innerOptions.title;
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            var referencedlength = Math.min(inner.canvas.height - canvasBorderWidth * 2, inner.canvas.width / 2 - canvasBorderWidth);
            var height = ops.height != null ? ops.height : referencedlength / 15;
            var offtop = ops.offtop != null ? ops.offtop : height / 8;
            var fontsize = ops.fontsize || height * 0.8;
            ops = inner.innerOptions.subTitle;
            var subheight = ops.height != null ? ops.height : referencedlength / 18;
            var subfontsize = ops.fontsize != null ? ops.fontsize : subheight * 0.8;
            var occupyTop = (valids.titleValid ? height + offtop : 0) + (valids.titleValid && valids.subTitleValid ? subheight : 0) + fontsize / 4;
            return { title: { height: height, offtop: offtop, fontsize: fontsize }, subTitle: { height: subheight, fontsize: subfontsize }, occupyTop: occupyTop };
        };
        inner._createTitle = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            var ops = inner.innerOptions.title;
            if (!valids.titleValid) { return; }
            var computed = inner._computeTitle(valids);
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            var centerX = inner.canvas.width / 2;
            var bottom = canvasBorderWidth + computed.title.offtop + computed.title.height / 2 + computed.title.fontsize / 2;
            var textlength = inner.DrawFigures.createText(ops.content, centerX, bottom, 'center', (ops.fontweight || 'bold'), computed.title.fontsize, ops.fontfamily, ops.color);
            inner.coordinates.title = { left: centerX - textlength / 2, right: centerX + textlength / 2, top: bottom - computed.title.fontsize, bottom: bottom, fontsize: computed.title.fontsize, length: textlength };
            ops = inner.innerOptions.subTitle;
            if (!valids.subTitleValid) { return; }
            bottom = canvasBorderWidth + computed.title.offtop + computed.title.height + computed.subTitle.height;
            textlength = inner.DrawFigures.createText(ops.content, centerX, bottom, 'center', (ops.fontweight || 'bold'), computed.subTitle.fontsize, ops.fontfamily, ops.color);
            inner.coordinates.subTitle = { left: centerX - textlength / 2, right: centerX + textlength / 2, top: bottom - computed.subTitle.fontsize, bottom: bottom, fontsize: computed.subTitle.fontsize, length: textlength };
        };
        inner._computeLegend = function (valids) {
            if (inner._configs.legendSize) { return inner._configs.legendSize; }
            var valids = valids || inner._calculateOutersValid();
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            var fullWidth = inner.canvas.width - canvasBorderWidth * 2;
            var fullHeight = inner.canvas.height - canvasBorderWidth * 2;
            var ops = inner.innerOptions.legend;
            var data = inner.innerData;
            var legendWidth = 0;
            var legendHeight = 0;
            var type = ops.type != 'row' ? 'column' : ops.type;
            var placeX = ops.placeX != 'left' && ops.placeX != 'center' ? 'right' : ops.placeX;
            var placeY = ops.placeY != 'top' && ops.placeY != 'bottom' ? 'middle' : ops.placeY;
            if (placeY == 'middle' && placeX == 'center' || type == 'row' && placeY == 'middle') {
                throw new Error(inner._messages.WrongLegendSet);
            }
            var elementtype = ops.elementtype || LChart.Const.Defaults.LegendType;
            var sidelength = ops.sidelength || Math.max(fullWidth, fullHeight) / (valids.AxisValid ? LChart.Const.Defaults.LengthReferCutForAxis : LChart.Const.Defaults.LengthReferCutForPies);
            var sidedistance = sidelength / 2;
            var sideoffY = type == 'row' ? sidelength / 3 : sidelength;
            var sideoffX = sidelength / 2;
            var borderwidth = ops.borderwidth && ops.borderwidth > 0 ? ops.borderwidth : 0;
            var fontsize = ops.fontsize || sidelength * 1.2;
            var fontfamily = ops.fontfamily || inner.innerOptions.fontFamily || LChart.Const.Defaults.FontFamily;
            var maxTextLength = 0;
            var texts = [];
            var textlengths = [];
            for (var i = 0, item; item = data[i]; i++) {
                texts[i] = item.text || '';
                if (typeof item.text == 'string') {
                    var length = inner.DrawFigures.measureText(item.text, null, fontsize, fontfamily);
                    textlengths[i] = length;
                    if (maxTextLength < length) { maxTextLength = length; }
                }
            }
            var offX = ops.offX == null ? fullWidth / (valids.AxisValid ? LChart.Const.Defaults.OffXCutForAxis : LChart.Const.Defaults.OffXCutForPies) : ops.offX;
            var offY = ops.offY == null ? sidelength / 2 : ops.offY;
            if (elementtype == 'l') { sidelength *= 2; }
            if (type == 'column') {
                legendWidth = sideoffX * 2 + sidelength + sidedistance + maxTextLength + borderwidth * 2;
                legendHeight = data.length * ((elementtype == 'l' ? sidelength / 2 : sidelength) + sidedistance) - sidedistance + sideoffY * 2 + borderwidth * 2;
            }
            else {
                legendWidth = data.length * (sidelength + sidedistance * 2) + textlengths.__sum() - sidedistance + sideoffX * 2 + borderwidth * 2;
                legendHeight = sideoffY * 2 + (elementtype == 'l' ? sidelength / 2 : sidelength) + borderwidth * 2;
            }

            var left = (placeX == 'left' ? offX : (placeX == 'center' ? fullWidth / 2 - legendWidth / 2 : fullWidth + canvasBorderWidth - offX - legendWidth)) + borderwidth;
            var titleHeight = valids.titleValid ? inner._computeTitle(valids).occupyTop : inner.canvas.height / 45;
            var top = offY + canvasBorderWidth + titleHeight;
            var estimateYAxisHeight = (valids.AxisValid ? fullHeight / 7.5 : 0);
            if (placeY == 'bottom') { top = fullHeight + canvasBorderWidth - legendHeight - offY - (placeX == 'center' || type == 'row' ? 0 : estimateYAxisHeight); }
            else if (placeY == 'middle') { top = (fullHeight - titleHeight - legendHeight) / 2 + canvasBorderWidth + titleHeight - estimateYAxisHeight / 2; }

            var occupyTop = placeY == 'top' && (type == 'row' || type == 'column' && placeX == 'center') ? legendHeight + offY + canvasBorderWidth + sidelength / 3 : 0;
            var occupyBottom = placeY == 'bottom' && (type == 'row' || type == 'column' && placeX == 'center') ? legendHeight + offY + canvasBorderWidth + sidelength / 3 : 0;
            var occupyLeft = placeX == 'left' && type == 'column' ? legendWidth + offX : 0;
            var occupyRight = placeX == 'right' && type == 'column' ? legendWidth + offX : 0;

            inner._configs.legendSize = {
                legendWidth: legendWidth, legendHeight: legendHeight, type: type, placeX: placeX, placeY: placeY, elementtype: elementtype,
                sidelength: sidelength, sidedistance: sidedistance, sideoffY: sideoffY, sideoffX: sideoffX,
                borderwidth: borderwidth, fontsize: fontsize, fontfamily: fontfamily,
                maxTextLength: maxTextLength, texts: texts, textlengths: textlengths,
                left: left, top: top,
                occupyTop: occupyTop, occupyBottom: occupyBottom, occupyLeft: occupyLeft, occupyRight: occupyRight
            };
            return inner._configs.legendSize;
        };
        inner._createLegend = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            if (!valids.legendValid) { return; }
            var ops = inner.innerOptions.legend;
            var computed = inner._computeLegend();
            var colors = inner._configs.legendColors || LChart.Const.Defaults.FillColors;
            var lineelement = computed.elementtype == 'l';
            var texts = []; var points = [];
            var legendcontrol = inner._configs.legendcontrol;
            var lightcolor = 'rgba(255,255,255,0.4)';
            var dimcolor = '#CCCCCC';
            var index = 0;
            for (var i = 0, item; item = inner._configs.dataBackup[i]; i++) {
                var left = computed.left + computed.sideoffX + computed.borderwidth;
                if (computed.type == 'row') {
                    left += i * (computed.sidelength + computed.sidedistance * 2) + computed.textlengths.slice(0, i).__sum();
                }
                var top = computed.top + computed.sideoffY + computed.borderwidth;
                if (computed.type == 'column') {
                    top += i * ((lineelement ? computed.sidelength / 2 : computed.sidelength) + computed.sidedistance);
                }
                var showdimcolor = legendcontrol.hidelegend.__contains(i);
                var showlightcolor = !legendcontrol.hidelegend.__contains(i) && legendcontrol.mouseoverindex == i;
                var color = showdimcolor ? dimcolor : (item.color || colors[index % colors.length]);
                if (!showdimcolor) { index++; }
                if (lineelement) {
                    var _top = top + computed.sidelength * 0.3;
                    inner.DrawFigures.createLine(left, _top, left + computed.sidelength, _top, 3, color);
                    if (showlightcolor) {
                        inner.DrawFigures.createLine(left, _top, left + computed.sidelength, _top, 3, lightcolor);
                    }
                    points[i] = { length: computed.sidelength, left: left, top: _top };
                }
                else {
                    inner.DrawFigures.createPointElement(computed.elementtype, left, top, computed.sidelength, color, computed.elementtype != 'x', color, 2, computed.elementtype == 'x');
                    if (showlightcolor) {
                        inner.DrawFigures.createPointElement(computed.elementtype, left, top, computed.sidelength, lightcolor, computed.elementtype != 'x', lightcolor, 2, computed.elementtype == 'x');
                    }
                    points[i] = { length: computed.sidelength, left: left, top: top };
                }
                var textleft = left + computed.sidelength + (computed.elementtype == 'x' ? 5 : 3);
                var textbottom = top + computed.sidelength * (lineelement ? 0.45 : 0.9);
                var textlength = inner.DrawFigures.createText(computed.texts[i], textleft, textbottom, null, null, computed.fontsize, computed.fontfamily, showdimcolor ? dimcolor : ops.fontcolor, null);
                if (showdimcolor && ops.strikethrough) {
                    var lineY = textbottom - computed.fontsize / 3;
                    inner.DrawFigures.createLine(textleft, lineY, textleft + textlength, lineY, 1, dimcolor);
                }
                texts[i] = { length: textlength, left: textleft, top: textbottom - computed.fontsize, right: textleft + textlength, bottom: textbottom };
            }
            var borderwidth = computed.borderwidth;
            var legend = { borderwidth: borderwidth, left: computed.left + borderwidth / 2, top: computed.top + borderwidth / 2, width: computed.legendWidth - borderwidth, height: computed.legendHeight - borderwidth, points: points, texts: texts };
            inner.coordinates.legend = legend;
            if (borderwidth > 0) {
                inner.DrawFigures.createRectangleBorder(legend.left, legend.top, legend.width, legend.height, borderwidth, ops.bordercolor);
            }
        };
        inner._getFormatDiff = function (valueType, small, big) {
            if (small > big) { var tmp = small; small = big; big = tmp; }
            if (valueType == 'd') {
                return small.shortOf('d', big);
            }
            else if (valueType == 't') {
                return small.shortOf('n', big);
            }
            else if (valueType == 'm') {
                return small.shortOf('S', big);
            }
            else {
                return big - small;
            }
        };
        inner._getComputed = function (vAxisVery, valueType, ops, minval, maxval, scaleCount) {
            var minvalue = ops.minvalue;
            var maxvalue = ops.maxvalue;
            var isTimeType = valueType == 'd' || valueType == 't' || valueType == 'm';
            var getInterval = function (minval, maxval, valueType) {
                if (Math.abs(minval - maxval) < 0.0000001) {
                    if (isTimeType) { return 1; }
                    else { return maxval / 2; }
                }
                var interval = inner._getFormatDiff(valueType, minvalue != null && minvalue < minval ? minvalue : minval, maxvalue != null && maxvalue > maxval ? maxvalue : maxval) / scaleCount;
                var defaults = LChart.Const.Interval[valueType].__copy();
                var find = false;
                while (!find) {
                    if (interval < defaults[0]) {
                        if (isTimeType) { interval = defaults[0]; break; }
                        else { defaults.__multiply(0.1); }
                    }
                    if (interval > defaults[defaults.length - 1]) { defaults.__multiply(10); }
                    for (var i = 1; i < defaults.length; i++) {
                        if (defaults[i - 1] <= interval && defaults[i] >= interval) {
                            find = true;
                            interval = interval - defaults[i - 1] < defaults[i] - interval ? defaults[i - 1] : defaults[i];
                            break;
                        }
                    }
                }
                return interval;
            };
            var interval = ops.interval;
            if (!interval) {
                interval = getInterval(minval, maxval, valueType);
            }
            if (minvalue == null) {
                if (isTimeType) {
                    var cut = interval * (valueType == "d" ? 1440 * 60000 : (valueType == 'm' ? 1 : 60000));
                    minvalue = new Date(minval - cut * vAxisVery);
                    if (valueType == 'd') {
                        minvalue = new Date(Date.parse(minvalue.format('yyyy/MM/dd')));
                    }
                }
                else if (valueType == 'p' && (minval / interval) < 3) {
                    minvalue = 0;
                }
                else {
                    minvalue = (Math.floor(minval / interval) - vAxisVery) * interval;
                }
            }
            if (vAxisVery && minvalue < 0 && inner._configs.notAllowValueNegative) { minvalue = 0; }

            if (maxvalue == null) {
                if (isTimeType) {
                    var cut = interval * (valueType == "d" ? 1440 * 60000 : (valueType == 'm' ? 1 : 60000));
                    var addSection = Math.ceil((maxval.getTime() - minvalue.getTime()) / cut);
                    maxvalue = new Date(minvalue.getTime() + ((addSection || 1) + vAxisVery) * cut);
                }
                else {
                    var addSection = (Math.ceil((maxval - minvalue) / interval) + vAxisVery);
                    maxvalue = minvalue + (addSection || 1) * interval;
                }
            }
            if (valueType == 'p' && maxvalue > 100) { maxvalue = 100; }


            var scalecount = 0;
            var tmpMinValue = LChart.Methods.CopyInnerValue(valueType, minvalue);
            var val = LChart.Methods.AddInnerValue(valueType, tmpMinValue, interval);
            while (val <= maxvalue || ((valueType == 'p' || valueType == 'n') && Math.abs(maxvalue - val) < 0.0001)) {
                val = LChart.Methods.AddInnerValue(valueType, val, interval);
                scalecount++;
            }
            maxvalue = LChart.Methods.AddInnerValue(valueType, val, -interval);
            if (maxvalue < maxval) {
                maxvalue = LChart.Methods.AddInnerValue(valueType, val, interval);
                scalecount++;
            }

            maxvalue = LChart.Methods.FormatNumber(maxvalue);
            minvalue = LChart.Methods.FormatNumber(minvalue);
            interval = LChart.Methods.FormatNumber(interval);
            if (maxvalue < minvalue) {
                throw new Error(inner._messages.WrongParam + inner._messages.AxisMaxLessThanMin);
            }
            if (maxvalue < maxval) {
                throw new Error(inner._messages.WrongParam + inner._messages.AxisMaxLessThanActual);
            }
            if (minvalue > minval) {
                throw new Error(inner._messages.WrongParam + inner._messages.AxisMinMoreThanActual);
            }
            return { interval: interval, maxvalue: maxvalue, minvalue: minvalue, scalecount: scalecount };
        };
        inner._formatAxisData = function (heapCompute) {
            if (!LChart.Const.DrawAxis.__contains(inner.GraphType)) {
                throw new Error(inner._messages.MainGraphicMustBeAxis);
            }
            if (inner._configs.axisData) { return inner._configs.axisData; }
            var options = inner.innerOptions;
            var innerData = inner.innerData;
            var lValueType = options.labelAxis.valueType;
            var isRange = inner._configs.valueAxiaDataIsRange;
            var multiple = LChart.Methods.IsArray(innerData[0].value) && innerData[0].value.length > 0 &&
                ((!isRange && !lValueType) || (!isRange && lValueType && innerData[0].value[0].length == 2) || (isRange && innerData[0].value[0].length == 2));
            var vValueType = options.valueType || LChart.Const.Defaults.ValueType;

            var heapCompute = heapCompute && multiple && !lValueType && (vValueType == 'p' || vValueType == 'n');

            var verticalcomputeP = (heapCompute || options.valueAxis.verticalcomputeP && multiple && !lValueType) && vValueType == 'p';


            var vMaxval = null;
            var vMinval = null;
            var lMaxval = null;
            var lMinval = null;

            var tuftCount = innerData.length;
            if (multiple) {
                tuftCount = innerData[0].value.length;
            }
            var demanCount = 1;
            if (multiple) {
                demanCount = innerData.length;
            }
            var valueSum = [];
            if (vValueType == 'p' || heapCompute) {
                if (multiple) {
                    if (verticalcomputeP || heapCompute) {
                        for (var i = 0; i < tuftCount; i++) {
                            var tmpSum = 0;
                            for (var j = 0, item; item = innerData[j]; j++) {
                                tmpSum += (lValueType ? item.value[i][1] : item.value[i]);
                            }
                            valueSum[i] = tmpSum;
                        }
                    }
                    else {
                        for (var i = 0, item; item = innerData[i]; i++) {
                            var tmpSum = 0;
                            for (var j = 0; j < item.value.length; j++) {
                                tmpSum += (lValueType ? item.value[j][1] : item.value[j]);
                            }
                            valueSum[i] = tmpSum;
                        }
                    }
                }
                else {
                    valueSum = 0;
                    for (var i = 0, item; item = innerData[i]; i++) {
                        valueSum += (lValueType ? item.value[1] : item.value);
                    }
                }
            }
            var formatValue = function (valueAxis, valueType, value, i, j, k) {
                if ((valueType == 'd' || valueType == 't' || valueType == 'm') && !value.getDate) {
                    var parseDate = Date.parse(value.toString().replace(/-/g, "/"));
                    if (typeof value == 'number') {
                        parseDate = value;
                    }
                    else {
                        if (isNaN(parseDate) && (valueType == 't' || valueType == 'm')) {
                            parseDate = Date.parse((new Date()).format("yyyy/MM/dd ") + value);
                        }
                        if (isNaN(parseDate) && valueType == 'm') {
                            parseDate = Date.parse((new Date()).format("yyyy/MM/dd hh:") + value);
                        }
                    }
                    if (isNaN(parseDate)) {
                        throw new Error(inner._messages.WrongData + "'" + value + "'" + inner._messages.NeedDateData);
                    }
                    else {
                        value = new Date(parseDate);
                        if (k == undefined) {
                            if (j == undefined) { innerData[i].value = value; }
                            else { innerData[i].value[j] = value; }
                        }
                        else {
                            if (isRange && valueAxis && lValueType) {
                                innerData[i].value[j][1][k] = value;
                            }
                            else if (isRange && !valueAxis) {
                                innerData[i].value[j][0] = value;
                            }
                            else {
                                innerData[i].value[j][k] = value;
                            }
                        }
                    }
                }
                else if (valueType == 'n' || valueType == 'p') {
                    if (typeof value != 'number') {
                        throw new Error(inner._messages.WrongData + "'" + value + "'" + inner._messages.NeedNumberData);
                    }
                    if (valueType == 'p') {
                        if (value < 0) {
                            throw new Error(inner._messages.WrongData + '\'' + value + '\'' + inner._messages.DataMustGreaterThanZero);
                        }
                        if (k == undefined) {
                            if (j == undefined) {
                                value = (value / valueSum) * 100;
                                innerData[i].percent = value;
                            }
                            else {
                                value = (value / (multiple ? (verticalcomputeP ? valueSum[j] : valueSum[i]) : valueSum)) * 100;
                                if (multiple && !innerData[i].percent) { innerData[i].percent = []; }
                                if (multiple) { innerData[i].percent[j] = value; }
                                else { innerData[i].percent = value; }
                            }
                        }
                        else {
                            value = (value / (verticalcomputeP ? valueSum[j] : valueSum[i])) * 100;
                            if (!innerData[i].percent) { innerData[i].percent = []; }
                            innerData[i].percent[j] = value;
                        }
                    }
                    else {
                        if (valueAxis && inner._configs.notAllowValueNegative && value < 0) {
                            throw new Error(inner._messages.WrongData + '\'' + value + '\'' + inner._messages.DataMustGreaterThanZero);
                        }
                    }
                }
                return value;
            };
            var updateLabelExtreme = function (val) {
                if (lMaxval === null || val > lMaxval) { lMaxval = val; }
                if (lMinval === null || val < lMinval) { lMinval = val; }
            };
            var updateValueExtreme = function (val) {
                if (vMaxval === null || val > vMaxval) { vMaxval = val; }
                if (vMinval === null || val < vMinval) { vMinval = val; }
            };
            var computeSplitPoint = inner._configs.computeSplitPoint;
            var splitExtremePoints = [];
            var updateSplitExtreme = function (val, row, newrow) {
                if (!computeSplitPoint) { return; }
                if (newrow) {
                    splitExtremePoints[row] = [null, null];
                }
                if (splitExtremePoints[row][0] == null || val < splitExtremePoints[row][0]) { splitExtremePoints[row][0] = val; }
                if (splitExtremePoints[row][1] == null || val > splitExtremePoints[row][1]) { splitExtremePoints[row][1] = val; }
            };
            if (multiple) {
                for (var i = 0, item; item = innerData[i]; i++) {
                    if (!lValueType && item.value.length != tuftCount) {
                        throw new Error(inner._messages.WrongData + "'[" + item.value + "]'" + inner._messages.DataShouldBeSameAmount);
                    }
                    for (var j = 0; j < item.value.length; j++) {
                        var value = item.value[j];
                        var lValue = null; var vValue = value;
                        if (lValueType) {
                            if (value.length != 2) {
                                throw new Error(inner._messages.WrongData + "'" + value + "'" + inner._messages.AxisVauleShouldBeDArray);
                            }
                            lValue = value[0]; vValue = value[1];
                            if (isRange && vValue.length != 2) {
                                throw new Error(inner._messages.ValueAxisValueShouldBeDArray);
                            }
                        }
                        if (lValue != null) {
                            lValue = formatValue(false, lValueType, lValue, i, j, 0);
                            updateLabelExtreme(lValue);
                        }
                        if (isRange) {
                            for (var k = 0; k <= 1; k++) {
                                var tmpVValue = vValue[k];
                                tmpVValue = formatValue(true, vValueType, tmpVValue, i, j, k);
                                updateValueExtreme(tmpVValue);
                            }
                        }
                        else {
                            vValue = formatValue(true, vValueType, vValue, i, j, lValueType ? 1 : undefined);
                            updateValueExtreme(vValue);
                            updateSplitExtreme(vValue, i, j == 0);
                        }
                    }
                }
                if (heapCompute) {
                    if (vValueType == 'n') {
                        for (var i = 0; i < tuftCount; i++) {
                            updateValueExtreme(valueSum[i]);
                        }
                    }
                    else {
                        vMaxval = 100;
                        vMinval = 0;
                    }
                }
            }
            else {
                for (var i = 0, item; item = innerData[i]; i++) {
                    var lValue = null; var vValue = item.value;
                    if (lValueType) {
                        if (item.value.length != 2) {
                            throw new Error(inner._messages.WrongData + "'" + item.value + "'" + inner._messages.AxisVauleShouldBeDArray);
                        }
                        lValue = item.value[0]; vValue = item.value[1];
                        if (isRange && vValue.length != 2) {
                            throw new Error(inner._messages.ValueAxisValueShouldBeDArray);
                        }
                    }
                    if (lValue != null) {
                        lValue = formatValue(false, lValueType, lValue, i, 0);
                        updateLabelExtreme(lValue);
                    }
                    if (isRange) {
                        for (var j = 0; j <= 1; j++) {
                            var tmpVValue = vValue[j];
                            tmpVValue = formatValue(true, vValueType, tmpVValue, i, j);
                            updateValueExtreme(tmpVValue);
                        }
                    }
                    else {
                        var vValue = formatValue(true, vValueType, vValue, i, lValueType ? 1 : undefined);
                        updateValueExtreme(vValue);
                        updateSplitExtreme(vValue, 0, i == 0);
                    }
                }
            }
            var splitpoint = null;
            if (computeSplitPoint) {
                var tmpMin = null; var tmpMax = null;
                for (var i = 0, point; point = splitExtremePoints[i]; i++) {
                    var min = point[0]; var max = point[1];
                    if (tmpMin == null) { tmpMin = max; tmpMax = min; }
                    if (max > tmpMax && (tmpMin > tmpMax || min < tmpMax)) { tmpMax = min; }
                    if (min < tmpMin && (tmpMin > tmpMax || max > tmpMin)) { tmpMin = max; }
                }
                if (vValueType == 'd' || vValueType == 't' || vValueType == 'm') {
                    splitpoint = new Date((tmpMin.getTime() + tmpMax.getTime()) / 2);
                    if (vValueType == 'd') { splitpoint = new Date(Date.parse(splitpoint.format('yyyy/MM/dd'))); }
                }
                else {
                    splitpoint = (tmpMin + tmpMax) / 2;
                }
            }
            if (splitpoint != null || options.splitpoint != null) {
                updateValueExtreme(splitpoint || options.splitpoint);
            }
            if (lValueType && options.labelAxis.sort) {
                var asc = function (x, y) {
                    if (y.value) {
                        if (y.value[0] > x.value[0]) { return -1; }
                        else { return 1; }
                    }
                    else {
                        if (y[0] > x[0]) { return -1; }
                        else { return 1; }
                    }
                };
                if (multiple) {
                    for (var i = 0, item; item = innerData[i]; i++) {
                        item.value.sort(asc);
                    }
                }
                else {
                    innerData.sort(asc);
                }
            }
            var tmpCompute = inner._getComputed(1, vValueType, options.valueAxis, vMinval, vMaxval, 6);
            var axisData = { vValueType: vValueType, lValueType: lValueType, heapCompute: heapCompute, multiple: multiple, vMaxval: vMaxval, vMinval: vMinval, vInterval: tmpCompute.interval, vMaxValue: tmpCompute.maxvalue, vMinValue: tmpCompute.minvalue, vScalecount: tmpCompute.scalecount, tuftCount: tuftCount, demanCount: demanCount, splitpoint: splitpoint };
            if (lValueType) {
                tmpCompute = inner._getComputed(0, lValueType, options.labelAxis, lMinval, lMaxval, 6);
                axisData.lValueType = lValueType;
                axisData.lInterval = tmpCompute.interval;
                axisData.lMaxval = lMaxval;
                axisData.lMinval = lMinval;
                axisData.lMaxValue = tmpCompute.maxvalue;
                axisData.lMinValue = tmpCompute.minvalue;
                axisData.lScalecount = tmpCompute.scalecount;
            }
            var _collectValueLabels = function () {
                var labels = [];
                var valueAxisContent = options.valueAxis.content;
                var tmpMinValue = LChart.Methods.CopyInnerValue(axisData.vValueType, axisData.vMinValue);
                for (var i = 0; i <= axisData.vScalecount; i++) {
                    labels[i] = valueAxisContent.call(options, LChart.Methods.FormatNumber(LChart.Methods.AddInnerValue(axisData.vValueType, tmpMinValue, axisData.vInterval * i)));
                    tmpMinValue = LChart.Methods.CopyInnerValue(axisData.vValueType, axisData.vMinValue);
                }
                return labels;
            };
            var _collectTextLabels = function () {
                var textlabels = [];
                if (axisData.lValueType) {
                    var labels = [];
                    var content = options.labelAxis.content;
                    if (typeof content == 'function') {
                        var tmpMinValue = LChart.Methods.CopyInnerValue(axisData.lValueType, axisData.lMinValue);
                        for (var i = 0; i <= axisData.lScalecount; i++) {
                            labels[i] = content.call(options.labelAxis, LChart.Methods.FormatNumber(LChart.Methods.AddInnerValue(axisData.lValueType, tmpMinValue, axisData.lInterval * i)));
                            tmpMinValue = LChart.Methods.CopyInnerValue(axisData.lValueType, axisData.lMinValue);
                        }
                    }
                    textlabels = labels;
                }
                else {
                    if (axisData.multiple) {
                        textlabels = options.labelAxis.labels || [];
                    }
                    else {
                        for (var i = 0, data; data = inner.innerData[i]; i++) {
                            textlabels[i] = data.text || ' ';
                        }
                        if (textlabels.__only(' ') && options.labelAxis.labels && options.labelAxis.labels.length) {
                            textlabels = options.labelAxis.labels;
                        }
                    }
                }
                return textlabels;
            };
            axisData.vLabels = _collectValueLabels();
            axisData.vScalecount = axisData.vLabels.length - 1;
            axisData.lLabels = _collectTextLabels();
            axisData.lScalecount = axisData.lLabels.length - 1;
            inner._configs.axisData = axisData;
            return axisData;
        };
        inner._computeAxis = function (valids) {
            if (!valids.AxisValid) { return null; }
            if (inner._configs.axisSize) { return inner._configs.axisSize; }
            var options = inner.innerOptions;
            var axisData = inner._configs.axisData;
            var invertAxis = inner._configs.invertAxis;
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            var valids = valids || inner._calculateOutersValid();
            var legendSize = valids.legendValid ? inner._computeLegend() : null;
            var titleHeight = inner.canvas.height / 30;
            if (valids.titleValid) { titleHeight = inner._computeTitle(valids).occupyTop; }
            var draw3daxis = LChart.Const.Draw3DAxis.__contains(inner.GraphType);

            var availableWidth = inner.canvas.width - canvasBorderWidth * 2 - (legendSize ? legendSize.occupyLeft : 0) - (legendSize ? legendSize.occupyRight : 0);
            var availableHeight = inner.canvas.height - canvasBorderWidth * 2 - titleHeight - (legendSize ? legendSize.occupyTop : 0) - (legendSize ? legendSize.occupyBottom : 0);

            var tmpAxisWidth = availableWidth / (invertAxis ? 8 : LChart.Const.Defaults.AxisYDrawableCut[axisData.vValueType]);
            var tmpAxisHeight = availableHeight / LChart.Const.Defaults.AxisXDrawableCut;
            var labelAxisLength = options.labelAxis.length || (invertAxis ? tmpAxisWidth : tmpAxisHeight);
            var valueAxisLength = options.valueAxis.length || (invertAxis ? tmpAxisHeight : tmpAxisWidth);
            var yAxisWidth = invertAxis ? labelAxisLength : valueAxisLength;
            var xAxisHeight = invertAxis ? valueAxisLength : labelAxisLength;
            var marginRight = valids.legendValid && legendSize.placeY == 'middle' ? yAxisWidth / 8 : yAxisWidth / 2;
            var marginTop = valids.titleValid ? xAxisHeight / 10 : xAxisHeight / 6;
            if (!invertAxis && (typeof options.caption.content == 'string' || options.caption.content != '')) { marginTop += xAxisHeight / 10; }
            if (legendSize && legendSize.occupyTop > 0) { marginTop = 0 }
            var scaleLineWidth = options.scale.linewidth == null ? 1 : options.scale.linewidth;
            var closeLineWidth = options.close.linewidth || scaleLineWidth || 1;
            var labelAxisLineWidth = options.labelAxis.linewidth == null ? 1 : options.labelAxis.linewidth;
            var valueAxisLineWidth = options.valueAxis.linewidth == null ? 1 : options.valueAxis.linewidth;
            var xAxisLineWidth = invertAxis ? valueAxisLineWidth : labelAxisLineWidth;
            var yAxisLineWidth = invertAxis ? labelAxisLineWidth : valueAxisLineWidth;
            var crossLength = options.cross.length || valueAxisLength / 15;

            var axis3dconfigs = null;
            if (draw3daxis) {
                var ops = options.axis3d;
                axis3dconfigs = {};
                axis3dconfigs.draw3daxis = true;
                axis3dconfigs.sightangle = Math.PI * (ops.sightangle || (axisData.multiple ? 0.2 : 0.3));
                axis3dconfigs.sinsightangle = Math.sin(axis3dconfigs.sightangle);
                axis3dconfigs.cossightangle = Math.cos(axis3dconfigs.sightangle);
                axis3dconfigs.marbleheight = ops.marbleheight || labelAxisLength / 3;
                axis3dconfigs.marblewidth = ops.marblewidth || labelAxisLength * 0.5;
                axis3dconfigs.stagewidth = ops.stagewidth || axis3dconfigs.marblewidth * 2 / 3;
                axis3dconfigs.curtainwidth = ops.curtainwidth || axis3dconfigs.marblewidth / 7;
                if (axis3dconfigs.curtainwidth + axis3dconfigs.stagewidth > axis3dconfigs.marblewidth) {
                    throw new Error(inner._messages.MarbleShouldBeBigger);
                }
                if (axis3dconfigs.sightangle <= 0 || axis3dconfigs.sightangle > Math.PI / 2) {
                    throw new Error(inner._messages.WrongSightAngle);
                }
            }

            var maxX = inner.canvas.width - canvasBorderWidth - marginRight - (legendSize ? legendSize.occupyRight : 0);
            var maxY = inner.canvas.height - xAxisHeight - canvasBorderWidth - (legendSize ? legendSize.occupyBottom : 0);
            var minX = canvasBorderWidth + yAxisWidth + (legendSize ? legendSize.occupyLeft : 0);
            var minY = canvasBorderWidth + titleHeight + marginTop + (legendSize && legendSize.occupyTop > 0 ? legendSize.occupyTop : xAxisHeight / 10);
            if (axis3dconfigs) {
                minX += axis3dconfigs.sinsightangle * axis3dconfigs.stagewidth;
                maxY -= axis3dconfigs.cossightangle * axis3dconfigs.stagewidth;
            }

            var axisValueCut = (invertAxis ? maxX - minX : maxY - minY) / axisData.vScalecount;

            var labelCount = axisData.lLabels.length || axisData.tuftCount;
            var fromFirstLeft = LChart.Const.AxisFromFirstLeft.__contains(inner.GraphType);
            var startlength = 0;
            var endlength = 0;
            var lMaxLength = invertAxis ? maxY - minY : maxX - minX;
            var vMaxLength = invertAxis ? maxX - minX : maxY - minY;
            if (!fromFirstLeft) {
                startlength = options.labelAxis.startlength;
                endlength = options.labelAxis.endlength;
                if (startlength == null && endlength == null) {
                    startlength = lMaxLength / (labelCount + 1 / 3) * 2 / 3;
                    endlength = startlength;
                }
                else if (startlength == null && endlength != null) { startlength = endlength; }
                else if (endlength == null && startlength != null) { endlength = startlength; }
                if (startlength < 0 || endlength < 0 || startlength + endlength > lMaxLength) {
                    throw new Error(inner._messages.WrongParam + inner._messages.LabelDistanceExceedMax);
                }
            }
            var startPos = (invertAxis ? maxY : minX) + (invertAxis ? -endlength : startlength);
            var labelDistance = (lMaxLength - startlength - endlength) / (labelCount - 1);
            if (labelCount <= 1) { labelDistance = lMaxLength * 2 / 3; }
            var splitLinePos = null;
            if (LChart.Const.ComputeSplitPoint.__contains(inner.GraphType)) {
                splitLinePos = (invertAxis ? minX : minY) + vMaxLength * inner._getFormatDiff(axisData.vValueType, (invertAxis ? axisData.vMinValue : axisData.vMaxValue), axisData.splitpoint) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
            }
            var axisconfigs = {
                labelAxisLength: labelAxisLength, valueAxisLength: valueAxisLength, yAxisWidth: yAxisWidth, xAxisHeight: xAxisHeight,
                minX: Math.ceil(minX), maxX: Math.ceil(maxX), minY: Math.ceil(minY), maxY: Math.ceil(maxY),
                axisValueCut: axisValueCut, crossLength: crossLength,
                scaleLineWidth: scaleLineWidth, closeLineWidth: closeLineWidth, labelAxisLineWidth: labelAxisLineWidth, valueAxisLineWidth: valueAxisLineWidth, xAxisLineWidth: xAxisLineWidth, yAxisLineWidth: yAxisLineWidth,
                startPos: startPos, labelDistance: labelDistance, splitLinePos: splitLinePos
            };

            inner._configs.axisSize = axis3dconfigs ? LChart.Methods.Extend(axisconfigs, axis3dconfigs) : axisconfigs;
            return inner._configs.axisSize;
        };
        inner._createAxis = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            if (!valids.AxisValid || inner.innerData.length == 0) { return; }
            inner.coordinates.axis = {};
            var options = inner.innerOptions;
            var canvasBorderWidth = options.background.borderwidth || 0;
            if (typeof options.valueAxis.content != 'function') { return; }
            var axisData = inner._configs.axisData;
            var axisSize = inner._configs.axisSize || inner._computeAxis(valids);
            var invertAxis = inner._configs.invertAxis;
            var vTimeType = axisData.vValueType == 'd' || axisData.vValueType == 't';
            var lTimeType = axisData.lValueType == 'd' || axisData.lValueType == 't';

            var vfontsize = options.valueAxis.fontsize || (invertAxis ? 1.3 : 1) * (axisSize.valueAxisLength - axisSize.valueAxisLineWidth) / (vTimeType ? 7 : 5);
            var vfontweight = options.valueAxis.fontweight || 'normal';
            var vfontfamily = options.valueAxis.fontfamily || options.fontFamily || LChart.Const.Defaults.FontFamily;
            var vLabelFontColor = options.valueAxis.fontcolor;
            var vLineColor = options.valueAxis.linecolor || LChart.Const.Defaults.AxisLineColor;
            var vLabelStartX = (options.cross.show ? axisSize.crossLength : 3) + axisSize.valueAxisLineWidth + 3;

            var formatRotate = function (rotate, inYAxis, labels, fontweight, fontsize, fontfamily) {
                if (rotate == null) {
                    rotate = 0;
                    var overlap = true;
                    while (overlap) {
                        var tmpOverlap = false;
                        var cosx = Math.cos(rotate * Math.PI);
                        var sinx = Math.abs(rotate * Math.PI);
                        for (var i = 0; i <= labels.length - 1; i++) {
                            var length1 = inner.DrawFigures.measureText(labels[i], fontweight, fontsize, fontfamily);
                            if (inYAxis) {
                                if (length1 * cosx > axisSize.yAxisWidth - vLabelStartX) {
                                    tmpOverlap = true; break;
                                }
                            }
                            else {
                                var length0 = i == 0 ? 0 : inner.DrawFigures.measureText(labels[i - 1], fontweight, fontsize, fontfamily);
                                var distance = invertAxis ? axisSize.valueAxisLength : axisSize.labelDistance;
                                if (i > 0 && distance * sinx < fontsize && (length1 + length0 > 2 * distance / cosx)) {
                                    tmpOverlap = true; break;
                                }
                            }
                        }
                        overlap = tmpOverlap;
                        if (tmpOverlap) {
                            rotate -= 0.01;
                        }
                    }
                }
                return rotate;
            };
            var drawAxisBasicLine = function () {
                if (axisSize.valueAxisLineWidth && axisSize.valueAxisLineWidth > 0) {
                    if (invertAxis) {
                        var y = axisSize.maxY + axisSize.valueAxisLineWidth / 2;
                        inner.DrawFigures.createLine(axisSize.minX - axisSize.labelAxisLineWidth, y, axisSize.maxX + axisSize.valueAxisLength / 20, y, axisSize.valueAxisLineWidth, vLineColor);
                    }
                    else {
                        var x = axisSize.minX - axisSize.valueAxisLineWidth / 2;
                        inner.DrawFigures.createLine(x, axisSize.maxY + axisSize.labelAxisLineWidth + 1, x, axisSize.minY - axisSize.valueAxisLength / 20, axisSize.valueAxisLineWidth, vLineColor);
                    }
                }
                if (axisSize.labelAxisLineWidth && axisSize.labelAxisLineWidth > 0) {
                    if (invertAxis) {
                        var x = axisSize.minX - axisSize.labelAxisLineWidth / 2;
                        inner.DrawFigures.createLine(x, axisSize.minY - (options.close.show ? axisSize.closeLineWidth : 0), x, axisSize.maxY, axisSize.labelAxisLineWidth, options.labelAxis.linecolor || LChart.Const.Defaults.AxisLineColor);
                    }
                    else {
                        var y = axisSize.maxY + axisSize.labelAxisLineWidth / 2 + 1;
                        inner.DrawFigures.createLine(axisSize.minX - 1, y, axisSize.maxX + (options.close.show ? axisSize.closeLineWidth : 0), y, axisSize.labelAxisLineWidth, options.labelAxis.linecolor || LChart.Const.Defaults.AxisLineColor);
                    }
                }
            };
            var draw3DAxis = function () {
                var anglecos = Math.cos(axisSize.sightangle);
                var marbleleft = axisSize.minX - axisSize.stagewidth * axisSize.sinsightangle;
                var marbletop = axisSize.maxY + axisSize.stagewidth * axisSize.cossightangle;
                var marblefacecolor = options.axis3d.marblefacecolor || '#cccccc';
                var marbletopcolor = options.axis3d.marbletopcolor || LChart.Methods.getDarkenColor(marblefacecolor, 0.7);
                var marblerightcolor = options.axis3d.marblerightcolor || LChart.Methods.getDarkenColor(marblefacecolor, 0.8);

                inner.DrawFigures.create3DHistogram(marbleleft, marbletop, axisSize.maxX - axisSize.minX, axisSize.marbleheight, marblefacecolor, options.axis3d.marblelinewidth, axisSize.sightangle, axisSize.marblewidth, options.axis3d.marblelinecolor, marbletopcolor, marblerightcolor);
                var curtaintopface = [[axisSize.minX, axisSize.minY], [axisSize.minX + axisSize.curtainwidth * axisSize.sinsightangle, axisSize.minY - axisSize.curtainwidth * axisSize.cossightangle], [axisSize.maxX + axisSize.curtainwidth * axisSize.sinsightangle, axisSize.minY - axisSize.curtainwidth * axisSize.cossightangle], [axisSize.maxX, axisSize.minY]];
                inner.DrawFigures.createCloseFigure(curtaintopface, marbletopcolor);
                var curtainrightface = [[axisSize.maxX, axisSize.minY], [axisSize.maxX + axisSize.curtainwidth * axisSize.sinsightangle, axisSize.minY - axisSize.curtainwidth * axisSize.cossightangle], [axisSize.maxX + axisSize.curtainwidth * axisSize.sinsightangle, axisSize.maxY - axisSize.curtainwidth * axisSize.cossightangle], [axisSize.maxX, axisSize.maxY]];
                inner.DrawFigures.createCloseFigure(curtainrightface, marblerightcolor);
            };
            var drawValueAxisLabels = function () {
                var labels = axisData.vLabels;
                var contentX = axisSize.minX - vLabelStartX;
                var contentY = axisSize.maxY + (options.cross.show ? axisSize.crossLength : 3) + axisSize.valueAxisLineWidth + 3 + vfontsize;
                var rotate = formatRotate(options.valueAxis.fontrotate, !invertAxis, labels, vfontweight, vfontsize, vfontfamily);
                inner.coordinates.axis.vlabels = [];
                for (var i = 0; i <= axisData.vScalecount; i++) {
                    if (invertAxis) {
                        var centerX = axisSize.minX + i * axisSize.axisValueCut;
                        var textLength = inner.DrawFigures.createText(labels[i], centerX, contentY, 'center', vfontweight, vfontsize, vfontfamily, vLabelFontColor, rotate, 'right');
                        inner.coordinates.axis.vlabels[i] = { index: i, left: centerX - textLength / 2, right: centerX + textLength / 2, top: contentY - vfontsize, bottom: contentY, fontsize: vfontsize, length: textLength };
                    }
                    else {
                        var bottom = axisSize.maxY - i * axisSize.axisValueCut + axisSize.scaleLineWidth / 2 + vfontsize / 3;
                        var textLength = inner.DrawFigures.createText(labels[i], contentX, bottom, 'right', vfontweight, vfontsize, vfontfamily, vLabelFontColor, rotate);
                        inner.coordinates.axis.vlabels[i] = { index: i, left: contentX - textLength, right: contentX, top: bottom - vfontsize, bottom: bottom, fontsize: vfontsize, length: textLength };
                    }
                }
            };
            var drawLabelAxisLabels = function () {
                var labels = axisData.lLabels;
                var fontsize = options.labelAxis.fontsize || (lTimeType ? axisSize.xAxisHeight / 6 : axisSize.xAxisHeight / 4.5);
                var fontweight = options.labelAxis.fontweight || vfontweight;
                var fontfamily = options.labelAxis.fontfamily || vfontfamily;
                var fontcolor = options.labelAxis.fontcolor || vLabelFontColor;
                var rotate = formatRotate(options.labelAxis.fontrotate, invertAxis, labels, fontweight, fontsize, fontfamily);
                inner.coordinates.axis.llabels = [];
                for (var i = 0, label; label = labels[i]; i++) {
                    if (invertAxis) {
                        var right = axisSize.minX - axisSize.labelAxisLineWidth - fontsize * (rotate < 0 ? 1 : 0.5);
                        var bottom = axisSize.startPos - (axisSize.labelDistance) * i + fontsize / 2;
                        var textLength = inner.DrawFigures.createText(label, right, bottom, 'right', fontweight, fontsize, fontfamily, fontcolor, rotate);
                        inner.coordinates.axis.llabels[i] = { index: i, left: right - textLength, right: right, top: bottom - fontsize, bottom: bottom, fontsize: fontsize, length: textLength };
                    }
                    else {
                        var offx = axisSize.draw3daxis ? -axisSize.stagewidth * Math.sin(axisSize.sightangle) : 0;
                        var offy = axisSize.draw3daxis ? axisSize.stagewidth * Math.cos(axisSize.sightangle) + axisSize.marbleheight / 2 - fontsize : 0;
                        var centerX = axisSize.startPos + (axisSize.labelDistance) * i;
                        var bottom = axisSize.maxY + axisSize.labelAxisLineWidth + fontsize * 1.2;
                        var textLength = inner.DrawFigures.createText(label, centerX + offx, bottom + offy, 'center', fontweight, fontsize, fontfamily, fontcolor, rotate, 'right');
                        inner.coordinates.axis.llabels[i] = { index: i, left: centerX - textLength / 2, right: centerX + textLength / 2, top: bottom - fontsize, bottom: bottom, fontsize: fontsize, length: textLength };
                    }
                }
            };
            var drawCaption = function () {
                if (typeof options.caption.content != 'string') { return; }
                var size = options.caption.fontsize || (vfontsize + (vTimeType ? 2 : -1));
                if (invertAxis) {
                    var centerX = Math.min(axisSize.maxX + size * 1.5, inner.canvas.width - canvasBorderWidth - size);
                    var centerY = axisSize.maxY + axisSize.xAxisLineWidth / 2;
                    var textlength = inner.DrawFigures.createText(options.caption.content, centerX, centerY, 'center', options.caption.fontweight, size, options.caption.fontfamily, options.caption.fontcolor || vLabelFontColor, 0.5);
                    inner.coordinates.axis.caption = { left: centerX, right: centerX + size, top: centerY - textlength / 2, bottom: centerY + textlength / 2, fontsize: size, length: textlength };
                }
                else {
                    var centerX = axisSize.minX - axisSize.valueAxisLineWidth / 2;
                    var bottom = axisSize.minY - size;
                    var textlength = inner.DrawFigures.createText(options.caption.content, centerX, bottom, 'center', options.caption.fontweight, size, options.caption.fontfamily, options.caption.fontcolor || vLabelFontColor);
                    inner.coordinates.axis.caption = { left: centerX - textlength / 2, right: centerX + textlength / 2, top: bottom - size, bottom: bottom, fontsize: size, length: textlength };
                }
            };
            var drawValueAxisCrosses = function () {
                if (!options.cross.show) { return; }
                var drawscalebackcolor = options.scale.backcolors && options.scale.backcolors.length > 1;
                var linewidth = options.cross.linewidth;
                var linecolor = options.cross.linecolor || vLineColor;
                var crossLength = axisSize.crossLength;
                if (invertAxis) {
                    var startY = axisSize.maxY + axisSize.valueAxisLineWidth;
                    var endY = axisSize.maxY + axisSize.valueAxisLineWidth + axisSize.crossLength;
                    var linecut = Math.floor((axisSize.scaleLineWidth + 0.1) / 2);
                    for (var i = 1; i <= axisData.vScalecount; i++) {
                        var x = axisSize.maxX - i * axisSize.axisValueCut;
                        if (i == axisData.vScalecount && x < axisSize.minX) { x = axisSize.minX; }
                        if (drawscalebackcolor && i < axisData.vScalecount) { x -= linecut; }
                        inner.DrawFigures.createLine(x + axisSize.axisValueCut, startY, x + axisSize.axisValueCut, endY, options.cross.linewidth, linecolor);
                    }
                    inner.DrawFigures.createLine(axisSize.minX - 1, startY, axisSize.minX - 1, endY, options.cross.linewidth, linecolor);
                }
                else {
                    var endX = axisSize.minX - axisSize.valueAxisLineWidth;
                    var startX = endX - axisSize.crossLength;
                    for (var i = 1; i <= axisData.vScalecount; i++) {
                        var y = axisSize.maxY - i * axisSize.axisValueCut;
                        if (drawscalebackcolor) { y += axisSize.scaleLineWidth / 2; }
                        inner.DrawFigures.createLine(startX, y, endX, y, linewidth, linecolor);
                    }
                    inner.DrawFigures.createLine(startX, axisSize.maxY + 1, endX, axisSize.maxY + 1, linewidth, linecolor);
                }
            };
            var drawCloseLine = function () {
                if (!(options.close.show && axisSize.closeLineWidth && axisSize.closeLineWidth > 0)) { return; }
                var linecolor = options.close.linecolor || options.scale.linecolor || LChart.Const.Defaults.ScaleLineColor;
                if (invertAxis) {
                    var closeY = axisSize.minY - axisSize.closeLineWidth / 2;
                    inner.DrawFigures.createLine(axisSize.minX, closeY, axisSize.maxX + 1, closeY, axisSize.closeLineWidth, linecolor);
                }
                else {
                    var closeX = axisSize.maxX + axisSize.closeLineWidth / 2;
                    inner.DrawFigures.createLine(closeX, axisSize.maxY + 1, closeX, axisSize.minY, axisSize.closeLineWidth, linecolor);
                }
            };
            var drawYAxisTitle = function () {
                var ops = options.yAxisTitle;
                if (!ops.content) { return; }
                var fontsize = ops.fontsize || axisSize.yAxisWidth / 5;
                var fontweight = ops.fontweight || 'bold';
                var centerY = (axisSize.minY + axisSize.maxY) / 2;
                var right = axisSize.minX - axisSize.yAxisLineWidth - (axisSize.yAxisWidth - axisSize.yAxisLineWidth) * (ops.titlelocation || (invertAxis ? 0.75 : LChart.Const.Defaults.AxisYTitleLocation[axisData.vValueType]));
                var textlength = inner.DrawFigures.createText(ops.content, right, centerY, 'center', fontweight, fontsize, ops.fontfamily, ops.fontcolor, -0.5);
                inner.coordinates.axis.yAxisTitle = { top: centerY - textlength / 2, bottom: centerY + textlength / 2, left: right - fontsize, right: right, fontsize: fontsize, length: textlength };
            };
            var drawXAxisTitle = function () {
                var ops = options.xAxisTitle;
                if (!ops.content) { return; }
                var fontsize = ops.fontsize || axisSize.xAxisHeight / 5;
                var fontweight = ops.fontweight || 'bold';
                var centerX = inner.canvas.width / 2;
                var bottom = axisSize.maxY + axisSize.xAxisLineWidth + (axisSize.xAxisHeight - axisSize.xAxisLineWidth) * (ops.titlelocation || (invertAxis ? 0.75 : LChart.Const.Defaults.AxisXTitleLocation[axisData.vValueType]));
                var textlength = inner.DrawFigures.createText(ops.content, centerX, bottom, 'center', fontweight, fontsize, ops.fontfamily, ops.fontcolor);
                inner.coordinates.axis.xAxisTitle = { top: bottom - fontsize, bottom: bottom, left: centerX - textlength / 2, right: centerX + textlength / 2, fontsize: fontsize, length: textlength };
            };
            if (axisSize.draw3daxis) {
                draw3DAxis();
            }
            else {
                drawAxisBasicLine();
            }
            drawCaption();
            drawYAxisTitle();
            drawXAxisTitle();
            drawValueAxisLabels();
            drawLabelAxisLabels();
            drawValueAxisCrosses();
            drawCloseLine();
            inner.coordinates.axis.yAxis = { width: axisSize.yAxisWidth };
            inner.coordinates.axis.xAxis = { height: axisSize.xAxisHeight };
        };
        inner._createFooter = function () {
            var ops = inner.innerOptions.footer;
            if (!ops.content) { return; }
            var canvasSize = inner.coordinates.canvas;
            var fontsize = ops.fontsize || Math.min(canvasSize.height / 25, canvasSize.width / 50);
            var bottom = canvasSize.height * (1 - (ops.bottomdistance || LChart.Const.Defaults.FooterBottomDistance)) - canvasSize.borderwidth - fontsize / 2;
            var right = canvasSize.width * (1 - (ops.rightdistance || LChart.Const.Defaults.FooterRightDistance)) - canvasSize.borderwidth;
            var fontcolor = ops.fontcolor || LChart.Const.Defaults.FooterFontColor;
            var textlength = inner.DrawFigures.createText(ops.content, right, bottom, 'right', ops.fontweight, fontsize, ops.fontfamily, fontcolor);
            inner.coordinates.footer = { top: bottom - fontsize, bottom: bottom, right: right, left: right - textlength, fontsize: fontsize, length: textlength };
        };
        inner._createScales = function (valids, drawBackOnly, drawLineOnly) {
            var valids = valids || inner._calculateOutersValid();
            if (!valids.AxisValid || inner.innerData.length == 0) { return; }
            var options = inner.innerOptions;
            var axisSize = inner._configs.axisSize || inner._computeAxis(valids);
            var axisData = inner._configs.axisData;
            var scaleLineWidth = axisSize.scaleLineWidth;
            var linecut = Math.floor((scaleLineWidth + 0.1) / 2);
            var scaleLineColor = options.scale.linecolor || LChart.Const.Defaults.ScaleLineColor;
            var scaleBackColors = options.scale.backcolors;
            var invertAxis = inner._configs.invertAxis;
            if (drawBackOnly && scaleBackColors && scaleBackColors.length == 1) {
                inner.DrawFigures.createRectangleFill(axisSize.minX, axisSize.minY, axisSize.maxX - axisSize.minX, axisSize.maxY - axisSize.minY, scaleBackColors[0]);
            }
            for (var i = 1; i <= axisData.vScalecount; i++) {
                if (invertAxis) {
                    var x = axisSize.maxX - i * axisSize.axisValueCut;
                    if (i == axisData.vScalecount && x < axisSize.minX) { x = axisSize.minX; }
                    if (drawBackOnly && scaleBackColors && scaleBackColors.length > 1) {
                        var color = scaleBackColors.length ? scaleBackColors[(i - 1) % scaleBackColors.length] : null;
                        if (i < axisData.vScalecount) { x -= linecut; }
                        inner.DrawFigures.createRectangleFill(x, axisSize.minY, axisSize.axisValueCut - linecut, axisSize.maxY - axisSize.minY, color);
                    }
                    if (drawLineOnly && scaleLineWidth > 0) {
                        inner.DrawFigures.createLine(x + axisSize.axisValueCut, axisSize.minY, x + axisSize.axisValueCut, axisSize.maxY, scaleLineWidth, scaleLineColor);
                    }
                }
                else {
                    var y = axisSize.maxY - i * axisSize.axisValueCut;
                    if (drawBackOnly && scaleBackColors && scaleBackColors.length > 1) {
                        var color = scaleBackColors.length ? scaleBackColors[(i - 1) % scaleBackColors.length] : null;
                        y += scaleLineWidth / 2;
                        var height = axisSize.axisValueCut - scaleLineWidth / 2;
                        if (i == 1) { height += 1; }
                        inner.DrawFigures.createRectangleFill(axisSize.minX, y, axisSize.maxX - axisSize.minX, height, color);
                    }
                    if (drawLineOnly && scaleLineWidth > 0) {
                        inner.DrawFigures.createLine(axisSize.minX, y, axisSize.maxX, y, scaleLineWidth, scaleLineColor);
                    }
                }
            }
            if (drawLineOnly && options.scale.drawvertical) {
                var drawCloseLine = options.close.show && axisSize.closeLineWidth && axisSize.closeLineWidth > 0;
                for (var i = 1; i < axisData.lScalecount + (drawCloseLine ? 0 : 1) ; i++) {
                    if (invertAxis) {
                        var pos = axisSize.startPos - i * axisSize.labelDistance;
                        if (scaleLineWidth > 0) {
                            inner.DrawFigures.createLine(axisSize.minX, pos, axisSize.maxX, pos, scaleLineWidth, scaleLineColor);
                        }
                    }
                    else {
                        var pos = axisSize.startPos + i * axisSize.labelDistance;
                        if (scaleLineWidth > 0) {
                            inner.DrawFigures.createLine(pos, axisSize.minY, pos, axisSize.maxY + 1, scaleLineWidth, scaleLineColor);
                        }
                    }
                }
            }
            if (drawLineOnly && LChart.Const.DrawSplitLine.__contains(inner.GraphType) && options.splitLine.show) {
                var linecolor = options.splitLine.linecolor;
                var linewidth = options.splitLine.linewidth;
                if (invertAxis) {
                    inner.DrawFigures.createLine(axisSize.splitLinePos, axisSize.minY, axisSize.splitLinePos, axisSize.maxY, linewidth || 1, linecolor);
                }
                else {
                    inner.DrawFigures.createLine(axisSize.minX, axisSize.splitLinePos, axisSize.maxX, axisSize.splitLinePos, linewidth || 1, linecolor);
                }
            }
        };
        inner._calculateOutersValid = function () {
            var ops = inner.innerOptions;
            var legendValid = ops.legend.show;
            if (inner._configs.axisData && !inner._configs.axisData.multiple || inner._configs.legendInvalid) {
                legendValid = false;
            }
            var titleValid = ops.title && ops.title.show && ops.title.content;
            var subTitleValid = titleValid && ops.subTitle && ops.subTitle.show && ops.subTitle.content;
            var AxisValid = LChart.Const.DrawAxis.__contains(inner.GraphType);
            return { legendValid: legendValid, titleValid: titleValid, subTitleValid: subTitleValid, AxisValid: AxisValid };
        };
        inner._getMouseLoction = function (e) {
            if (e.offsetX != null) {
                return { X: e.offsetX, Y: e.offsetY };
            }
            else {
                var getPageCoord = function (element) {
                    var coord = { x: 0, y: 0 };
                    while (element) {
                        coord.x += element.offsetLeft;
                        coord.y += element.offsetTop;
                        element = element.offsetParent;
                    }
                    return coord;
                };
                var target = e.target;
                if (target.offsetLeft == undefined) { target = target.parentNode; }
                var pageCoord = getPageCoord(target);
                var eventCoord = { x: window.pageXOffset + e.clientX, y: window.pageYOffset + e.clientY };
                return { X: eventCoord.x - pageCoord.x, Y: eventCoord.y - pageCoord.y };
            }
        };
        inner.DrawFigures = {};
        inner._addCustomDraw = function (type, ops) {
            var customdrawID = 'CustomDraw_' + LChart.Methods.GetRandomString();
            inner.customDraws.push({ customdrawID: customdrawID, funcname: type, options: ops });
            return customdrawID;
        };
        inner.RemoveCustomDraw = function (customdrawID) {
            var customDraws = inner.customDraws, find = false;;
            for (var i = 0, n = 0; i < customDraws.length; i++) {
                if (customDraws[i].customdrawID != customdrawID) {
                    customDraws[n++] = customDraws[i];
                }
                else {
                    find = true;
                }
            }
            if (find) {
                customDraws.length -= 1;
            }
        };
        inner.ClearCustomDraws = function () {
            inner.customDraws.length = 0;
        };
        inner.clearCanvas = function () {
            inner.ctx.clearRect(0, 0, inner.canvas.width, inner.canvas.height);
        };
        inner.DrawFigures.createPointElement = function (type, X, Y, length, fillcolor, fill, strokecolor, linewidth, stroke, middle) {
            if (arguments.length < 5) { return; }
            if (fill == null) { fill = true; }
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            switch (type) {
                case 'c':
                    if (middle) { ctx.arc(X, Y, length / 2, 0, Math.PI * 2); }
                    else { ctx.arc(X + length / 2, Y + length / 2, length / 2, 0, Math.PI * 2); }
                    break;
                case 't':
                    if (middle) {
                        ctx.moveTo(X - length / 2, Y + length / 2);
                        ctx.lineTo(X + length / 2, Y + length / 2);
                        ctx.lineTo(X, Y - length / 2);
                        ctx.lineTo(X - length / 2, Y + length / 2);
                    }
                    else {
                        ctx.moveTo(X, Y + length);
                        ctx.lineTo(X + length, Y + length);
                        ctx.lineTo(X + length / 2, Y);
                        ctx.lineTo(X, Y + length);
                    }
                    break;
                case 'x':
                    if (middle) {
                        ctx.moveTo(X - length / 2, Y - length / 2);
                        ctx.lineTo(X + length / 2, Y + length / 2);
                        ctx.moveTo(X - length / 2, Y + length / 2);
                        ctx.lineTo(X + length / 2, Y - length / 2);
                    }
                    else {
                        ctx.moveTo(X, Y);
                        ctx.lineTo(X + length, Y + length);
                        ctx.moveTo(X, Y + length);
                        ctx.lineTo(X + length, Y);
                    }
                    break;
                default:
                    if (middle) { ctx.rect(X - length / 2, Y - length / 2, length, length); }
                    else { ctx.rect(X, Y, length, length); }
                    break;
            }
            ctx.closePath();
            if (stroke && (linewidth > 0 || type == 'x')) {
                ctx.strokeStyle = (type == 'x' ? fillcolor : strokecolor);
                ctx.lineWidth = linewidth * 2;
                ctx.stroke();
            }
            if (fill && type != 'x') {
                ctx.fillStyle = fillcolor;
                ctx.fill();
            }
            ctx.restore();
        };
        inner.createPoint = function (type, X, Y, length, fillcolor, fill, strokecolor, linewidth, stroke, middle) {
            return inner._addCustomDraw('createPointElement', [type, X, Y, length, fillcolor, fill, strokecolor, linewidth, stroke, middle]);
        };
        inner.DrawFigures.createArc = function (centerX, centerY, radius, linewidth, linecolor, fillcolor, angleMin, angleMax, linkCenter) {
            if (arguments.length < 4) { return; }
            var ctx = inner.ctx;
            angleMin = angleMin || 0;
            angleMax = angleMax || Math.PI * 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, angleMin, angleMax);
            if (linkCenter && Math.abs(angleMax - angleMin) < Math.PI * 2 - 0.01) {
                ctx.lineTo(centerX, centerY);
            }
            ctx.closePath();
            if (linewidth > 0) {
                ctx.strokeStyle = linecolor || LChart.Const.Defaults.LineColor;
                ctx.lineWidth = linewidth;
                ctx.stroke();
            }
            if (fillcolor) {
                ctx.fillStyle = fillcolor;
                ctx.fill();
            }
            ctx.restore();
        };
        inner.createArc = function (centerX, centerY, radius, linewidth, linecolor, fillcolor, angleMin, angleMax, linkCenter) {
            return inner._addCustomDraw('createArc', [centerX, centerY, radius, linewidth, linecolor, fillcolor, angleMin, angleMax, linkCenter]);
        };
        inner.DrawFigures.createRing = function (centerX, centerY, innerRadius, outerRadius, fillcolor, angleMin, angleMax, linewidth, linecolor) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(centerX + outerRadius * Math.cos(angleMin), centerY + outerRadius * Math.sin(angleMin));
            ctx.arc(centerX, centerY, outerRadius, angleMin, angleMax);
            ctx.lineTo(centerX + innerRadius * Math.cos(angleMax), centerY + innerRadius * Math.sin(angleMax));
            ctx.arc(centerX, centerY, innerRadius, angleMax, angleMin, true);
            ctx.closePath();
            ctx.fillStyle = fillcolor;
            ctx.fill();
            if (linewidth > 0) {
                ctx.lineWidth = linewidth;
                ctx.strokeStyle = linecolor || LChart.Const.Defaults.LineColor;
                ctx.stroke();
            }
            ctx.restore();
        };
        inner.createRing = function (centerX, centerY, innerRadius, outerRadius, fillcolor, angleMin, angleMax, linewidth, linecolor) {
            return inner._addCustomDraw('createRing', [centerX, centerY, innerRadius, outerRadius, fillcolor, angleMin, angleMax, linewidth, linecolor]);
        };
        inner.DrawFigures.createRingReflection = function (computeinfo, fillcolor, linewidth, linecolor, preventinnerLine, preventouterLine) {
            var ctx = inner.ctx;

            ctx.beginPath();
            ctx.moveTo(computeinfo.iStartX, computeinfo.iStartY);
            ctx.arc(computeinfo.centerX, computeinfo.centerY, computeinfo.innerRadius, computeinfo.angleMin, computeinfo.angleMax);
            ctx.lineTo(computeinfo.d_iEndX, computeinfo.d_iEndY);
            ctx.arc(computeinfo.darkCenterX, computeinfo.darkCenterY, computeinfo.innerRadius, computeinfo.angleMax, computeinfo.angleMin, true);
            ctx.closePath();
            ctx.fillStyle = fillcolor;
            ctx.fill();

            ctx.moveTo(computeinfo.oStartX, computeinfo.oStartY);
            ctx.arc(computeinfo.centerX, computeinfo.centerY, computeinfo.outerRadius, computeinfo.angleMin, computeinfo.angleMax);
            ctx.lineTo(computeinfo.d_oEndX, computeinfo.d_oEndY);
            ctx.arc(computeinfo.darkCenterX, computeinfo.darkCenterY, computeinfo.outerRadius, computeinfo.angleMax, computeinfo.angleMin, true);
            ctx.closePath();
            ctx.fillStyle = fillcolor;
            ctx.fill();

            inner.DrawFigures.createRing(computeinfo.darkCenterX, computeinfo.darkCenterY, computeinfo.innerRadius, computeinfo.outerRadius, fillcolor, computeinfo.angleMin, computeinfo.angleMax);

            if (linewidth > 0) {
                if (LChart.Methods.JudgeBetweenAngle(0, Math.PI, computeinfo.angleMin) && !preventouterLine) {
                    inner.DrawFigures.createLine(computeinfo.oStartX, computeinfo.oStartY, computeinfo.d_oStartX, computeinfo.d_oStartY, linewidth, linecolor);
                }
                if (LChart.Methods.JudgeBetweenAngle(Math.PI, Math.PI * 2, computeinfo.angleMin) && !preventinnerLine) {
                    inner.DrawFigures.createLine(computeinfo.iStartX, computeinfo.iStartY, computeinfo.d_iStartX, computeinfo.d_iStartY, linewidth, linecolor);
                }
                if (LChart.Methods.JudgeBetweenAngle(0, Math.PI, computeinfo.angleMax) && !preventouterLine) {
                    inner.DrawFigures.createLine(computeinfo.oEndX, computeinfo.oEndY, computeinfo.d_oEndX, computeinfo.d_oEndY, linewidth, linecolor);
                }
                if (LChart.Methods.JudgeBetweenAngle(Math.PI, Math.PI * 2, computeinfo.angleMax) && !preventinnerLine) {
                    inner.DrawFigures.createLine(computeinfo.iEndX, computeinfo.iEndY, computeinfo.d_iEndX, computeinfo.d_iEndY, linewidth, linecolor);
                }
            }
            ctx.restore();
        };
        inner.DrawFigures.measureText = function (content, fontweight, fontsize, fontfamily) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.font = (fontweight || 'normal') + ' ' + (fontsize || LChart.Const.Defaults.FontSize) + 'px ' + (fontfamily || inner.innerOptions.fontFamily || LChart.Const.Defaults.FontFamily);
            var textWidth = ctx.measureText(content).width;
            ctx.restore();
            return textWidth;
        };
        inner.DrawFigures.createText = function (content, x, y, textAlign, fontweight, fontsize, fontfamily, color, fontrotate, reference) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.textAlign = textAlign || 'left';
            ctx.font = (fontweight || 'normal') + ' ' + (fontsize || LChart.Const.Defaults.FontSize) + 'px ' + (fontfamily || inner.innerOptions.fontFamily || LChart.Const.Defaults.FontFamily);
            var textWidth = ctx.measureText(content).width;
            ctx.fillStyle = color || inner.innerOptions.fontColor || LChart.Const.Defaults.FontColor;
            if (fontrotate) {
                if (textAlign == 'center' && reference == 'right') {
                    y -= Math.sin(fontrotate * Math.PI) * textWidth / 2;
                }
                ctx.translate(x, y);
                ctx.rotate(fontrotate * Math.PI);
                ctx.fillText(content, 0, 0);
            }
            else {
                ctx.fillText(content, x, y);
            }
            ctx.restore();
            return textWidth;
        };
        inner.createText = function (content, x, y, textAlign, fontweight, fontsize, fontfamily, color, fontrotate, reference) {
            return inner._addCustomDraw('createText', [content, x, y, textAlign, fontweight, fontsize, fontfamily, color, fontrotate, reference]);
        };
        inner.DrawFigures.createRectangleFill = function (left, top, width, height, fillstyle, shadow) {
            if (width <= 0 || height <= 0) { return; }
            var ctx = inner.ctx;
            ctx.save();
            ctx.fillStyle = fillstyle;
            if (shadow) {
                if (shadow.color) { ctx.shadowColor = shadow.color; }
                if (shadow.blur) { ctx.shadowBlur = shadow.blur; }
                if (shadow.offsetX) { ctx.shadowOffsetX = shadow.offsetX; }
                if (shadow.offsetY) { ctx.shadowOffsetY = shadow.offsetY; }
            }
            ctx.fillRect(left, top, width, height);
            ctx.restore();
        };
        inner.createRect = function (left, top, width, height, fillstyle, shadow) {
            return inner._addCustomDraw('createRectangleFill', [left, top, width, height, fillstyle, shadow]);
        };
        inner.DrawFigures.createRectangleBorder = function (left, top, width, height, borderwidth, bordercolor) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = borderwidth || LChart.Const.Defaults.LineWidth;
            ctx.rect(left, top, width, height);
            ctx.closePath();
            ctx.strokeStyle = bordercolor || inner.innerOptions.lineColor || LChart.Const.Defaults.LineColor;
            ctx.stroke();
            ctx.restore();
        };
        inner.DrawFigures.createLine = function (startX, startY, endX, endY, linewidth, linecolor) {
            var linewidth = Math.ceil(linewidth);
            if (startX == endX) {
                startX = endX = LChart.Methods.FormatLinePosition(linewidth, startX);
            }
            else if (startY == endY) {
                startY = endY = LChart.Methods.FormatLinePosition(linewidth, startY);
            }
            var ctx = inner.ctx;
            ctx.save();
            ctx.lineWidth = linewidth || LChart.Const.Defaults.LineWidth;
            ctx.strokeStyle = linecolor || inner.innerOptions.lineColor || LChart.Const.Defaults.LineColor;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();
        };
        inner.createLine = function (startX, startY, endX, endY, linewidth, linecolor) {
            return inner._addCustomDraw('createLine', [startX, startY, endX, endY, linewidth, linecolor]);
        };
        inner.DrawFigures.createQuadraticCurve = function (startX, startY, controlX, controlY, endX, endY, linewidth, linecolor) {
            var linewidth = Math.ceil(linewidth);
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(controlX, controlY, endX, endY);
            ctx.lineWidth = linewidth || LChart.Const.Defaults.LineWidth;
            ctx.strokeStyle = linecolor || inner.innerOptions.lineColor || LChart.Const.Defaults.LineColor;
            ctx.stroke();
            ctx.restore();
        };
        inner.DrawFigures.curveSmoothPoints = function (ctx, point0, point1, invertAxis) {
            var centerX = (point0[0] + point1[0]) / 2;
            var centerY = (point0[1] + point1[1]) / 2;
            if (invertAxis) {
                ctx.quadraticCurveTo(point0[0], 0.5 * centerY + 0.5 * point0[1], centerX, centerY);
                ctx.quadraticCurveTo(point1[0], 0.5 * centerY + 0.5 * point1[1], point1[0], point1[1]);
            }
            else {
                ctx.quadraticCurveTo(0.5 * centerX + 0.5 * point0[0], point0[1], centerX, centerY);
                ctx.quadraticCurveTo(0.5 * centerX + 0.5 * point1[0], point1[1], point1[0], point1[1]);
            }
        };
        inner.DrawFigures.createSmoothLine = function (points, linewidth, linecolor, invertAxis) {
            var ctx = inner.ctx;
            var len = points.length;
            ctx.save();
            ctx.lineWidth = linewidth || LChart.Const.Defaults.LineWidth;
            ctx.strokeStyle = linecolor || inner.innerOptions.lineColor || LChart.Const.Defaults.LineColor;
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (var i = 0; i < len - 1; i++) {
                inner.DrawFigures.curveSmoothPoints(ctx, points[i], points[i + 1], invertAxis);
            }
            ctx.stroke();
            ctx.restore();
        };
        inner.DrawFigures.createCloseFigure = function (points, fillcolor, linewidth, linecolor, smoothline, invertAxis, shadow) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            var len = points.length;
            ctx.moveTo(points[0][0], points[0][1]);
            for (var i = 0; i < len - 1; i++) {
                if (!smoothline) { ctx.lineTo(points[i + 1][0], points[i + 1][1]); }
                else { inner.DrawFigures.curveSmoothPoints(ctx, points[i], points[i + 1], invertAxis); }
            }
            ctx.closePath();
            if (shadow) {
                if (shadow.color) { ctx.shadowColor = shadow.color; }
                if (shadow.blur) { ctx.shadowBlur = shadow.blur; }
                if (shadow.offsetX) { ctx.shadowOffsetX = shadow.offsetX; }
                if (shadow.offsetY) { ctx.shadowOffsetY = shadow.offsetY; }
            }
            ctx.fillStyle = fillcolor;
            ctx.fill();
            if (linewidth > 0 && linecolor) {
                ctx.lineWidth = linewidth;
                ctx.strokeStyle = linecolor;
                ctx.stroke();
            }
            ctx.restore();
        };
        inner.DrawFigures.createPointsLine = function (points, linewidth, linecolor) {
            if (points.length < 2) { return; }
            var x0 = points[0][0]; var y0 = points[0][1];
            for (var i = 1, point; point = points[i]; i++) {
                var x1 = points[i][0]; var y1 = points[i][1];
                inner.DrawFigures.createLine(x0, y0, x1, y1, linewidth, linecolor);
                x0 = x1; y0 = y1;
            }
        };
        inner.DrawFigures.create3DHistogram = function (left, top, width, height, fillcolor, linewidth, angle, longlength, linecolor, topdarksidecolor, rightdarksidecolor, shadow) {
            topdarksidecolor = topdarksidecolor || LChart.Methods.getDarkenColor(fillcolor);
            rightdarksidecolor = rightdarksidecolor || topdarksidecolor;
            linecolor = linecolor || '#ffffff';
            linewidth = linewidth || 0;
            angle = angle || Math.PI * 0.30;
            if (angle <= 0 || angle > Math.PI * 0.5) { throw new Error("偏移角度必须介于0-0.5间"); }
            longlength = longlength || width / 2;
            var rightright = left + Math.sin(angle) * longlength + width;
            var toptop = top - Math.cos(angle) * longlength;
            var positiveFace = [[left, top], [left + width, top], [left + width, top + height], [left, top + height]];
            var topFace = [[left, top], [rightright - width, toptop], [rightright, toptop], [left + width, top]];
            var rightFace = [[left + width, top], [rightright, toptop], [rightright, toptop + height], [left + width, top + height]];
            var surface = [[left, top], [rightright - width, toptop], [rightright, toptop], [rightright, toptop + height], [left + width, top + height], [left, top + height]];
            inner.DrawFigures.createCloseFigure(surface, fillcolor, 0, null, false, false, shadow);
            inner.DrawFigures.createCloseFigure(positiveFace, fillcolor, linewidth, linecolor);
            inner.DrawFigures.createCloseFigure(topFace, topdarksidecolor, linewidth, linecolor);
            inner.DrawFigures.createCloseFigure(rightFace, rightdarksidecolor, linewidth, linecolor);
        };
        inner.SavePic = function (filename, type) {
            type = type || 'png';
            var _fixType = function (type) {
                type = type.toLowerCase().replace(/jpg/i, 'jpeg');
                var r = type.match(/png|jpeg|bmp|gif/)[0];
                return 'image/' + r;
            };
            var saveFile = function (data, filename) {
                var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
                save_link.href = data;
                save_link.download = filename;
                var event = document.createEvent('MouseEvents');
                event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                save_link.dispatchEvent(event);
            };
            var imgData = inner.canvas.toDataURL(_fixType(type));
            imgData = imgData.replace(_fixType(type), 'image/octet-stream');
            var filename = (filename || LChart.Const.Defaults.SavedPicName) + '.' + type;
            saveFile(imgData, filename);
        };
        inner._computeRadiusForPies = function (options, zoomX, zoomY) {
            var coordinate = inner._getDrawableCoordinate();
            var offX = LChart.Methods.IsNumber(options.offX) ? options.offX : 0;
            var offY = LChart.Methods.IsNumber(options.offY) ? options.offY : 0;
            var halfXLength = (coordinate.maxX - coordinate.minX) / 2;
            var halfYLength = (coordinate.maxY - coordinate.minY) / 2;
            var minAvailableLength = Math.min(halfXLength, halfYLength);
            var margin = options.margin == null && (options.radar || options.outerLabel.show) ? minAvailableLength / 6 : minAvailableLength / 10;
            if (LChart.Methods.IsNumber(options.margin) && options.margin > 0) {
                margin = options.margin;
            }
            if (offX < 0 && halfXLength < -offX) { offX = -halfXLength / 2; }
            if (offX > 0 && halfXLength < offX) { offX = halfXLength / 2; }
            if (offY < 0 && halfYLength < -offY) { offY = -halfYLength / 2; }
            if (offY > 0 && halfYLength < offY) { offY = halfYLength / 2; }
            var maxRadius = Math.min(halfXLength - Math.abs(offX), halfYLength - Math.abs(offY)) - margin;
            var _zoomX = zoomX || 1;
            var _zoomY = zoomY || 1;
            maxRadius = maxRadius / Math.max(_zoomX, _zoomY);
            var centerX = (coordinate.centerX + offX) / _zoomX;
            var centerY = (coordinate.centerY + offY) / (zoomY ? zoomY * 1.07 : 1);
            return { coordinate: coordinate, maxRadius: maxRadius, centerX: centerX, centerY: centerY };
        };
        inner._computeSegmentTotal = function (innerData) {
            var minval = null;
            var maxval = null;
            var segmentTotal = 0;
            var segmentTotals = [];
            var dimensionCount = innerData[0].value.length;
            var multiple = dimensionCount != undefined;
            var checkNumber = function (tmpVal) {
                if (typeof tmpVal != 'number') {
                    throw new Error(inner._messages.WrongData + '\'' + tmpVal + '\'' + inner._messages.NeedNumberData);
                }
                else if (tmpVal < 0) {
                    throw new Error(inner._messages.WrongData + '\'' + tmpVal + '\'' + inner._messages.DataMustGreaterThanZero);
                }
                else {
                    if (maxval == null) { minval = maxval = tmpVal; }
                    else {
                        if (tmpVal > maxval) { maxval = tmpVal; }
                        else if (tmpVal < minval) { minval = tmpVal; }
                    }
                    return tmpVal;
                }
            };
            for (var k = 0; k < (multiple ? dimensionCount : 1) ; k++) {
                var tmpTotal = 0;
                for (var i = 0, item; item = innerData[i]; i++) {
                    var tmpVal = checkNumber(multiple ? item.value[k] : item.value);
                    segmentTotal += tmpVal;
                    tmpTotal += tmpVal;
                }
                segmentTotals[k] = tmpTotal;
            }
            return { multiple: multiple, segmentTotal: segmentTotal, segmentTotals: segmentTotals, minval: minval, maxval: maxval };
        };
        inner._methodsFor3D = {
            computeLoc: function (pieshape) {
                pieshape.isRight = LChart.Methods.JudgeBetweenAngle(-Math.PI * 0.5, Math.PI * 0.5, pieshape.midAngle);
                pieshape.isBottom = LChart.Methods.JudgeBetweenAngle(pieshape.angleMin, pieshape.angleMax, Math.PI / 2);
                pieshape.isTop = LChart.Methods.JudgeBetweenAngle(pieshape.angleMin, pieshape.angleMax, -Math.PI / 2);
            },
            pieshapeSort: function (shapeitem0, shapeitem1) {
                if (shapeitem0.isBottom) { return 1; }
                else if (shapeitem1.isBottom) { return -1; }
                else if (shapeitem0.isTop) { return -1; }
                else if (shapeitem1.isTop) { return 1; }
                else {
                    if (shapeitem0.isRight == shapeitem1.isRight) {
                        if (shapeitem0.isRight) { return LChart.Methods.judgeClockwiseBehind(-0.5, 0.5, shapeitem0.midAngle, shapeitem1.midAngle) ? -1 : 1; }
                        else { return LChart.Methods.judgeClockwiseBehind(0.5, 1.5, shapeitem0.midAngle, shapeitem1.midAngle) ? 1 : -1; }
                    }
                    else {
                        if (shapeitem0.isRight) { return -1; }
                        else { return 1; }
                    }
                }
            }
        };
        inner._formatSegmentAngle = function (angle) {
            if (inner._configs._isIE678) {
                if (Math.abs(angle) < 0.0001) {
                    angle = 0.0001;
                }
                else if (Math.abs(Math.PI * 2 - angle) < 0.0001) {
                    angle = Math.PI * 2 - 0.0001;
                }
            }
            return angle;
        };

        inner._initial();
    };
    return core;
};