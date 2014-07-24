/*
  本js文件用于延迟加载包括Pie、Ring、Bar等loongchart支持的27种图表类型，用户在使用每种图表类型时，该js文件会自动访问服务器中相应所需的js文件。
  因此，在用户不确定具体会使用哪几种图表类型时(如使用组合图功能时)，只需引用core.js+all.delay.js即可。
  This js is used for delay loading needed js of 27 types of graphics that loongchart supports. When user call single type of graphic, this js will automaticly load the needed js in the server.
  Therefore, when user can't make sure which types of graphics will be needed(take plugins as example), he can just quote core.js+all.delay.js.
*/

(function () {
    function loadScript(url) {
        var xmlhttp;
        if (window.XMLHttpRequest) { xmlhttp = new XMLHttpRequest(); }
        else { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }

        var allScript = document.getElementsByTagName("script");
        for (var i = 0, _script; _script = allScript[i]; i++) {
            if (_script.src.indexOf('loongchart.all.delay.') >= 0) {
                allScript = _script; break;
            }
        }
        try {
            var url = allScript.src.replace('loongchart.all.delay.', url);
            xmlhttp.open("Get", url, false);
            xmlhttp.send();
            eval(xmlhttp.responseText)
        }
        catch (ex) {
            throw new Error('请确保文件：' + url + ' 在服务器中存在！\n' + 'Please make sure that：' + url + '  exists in the server!');
        }
    }

    var delayLoad = '';
    for (var i = 0, type; type = LChart.Const.NotDrawAxis[i]; i++) {
        delayLoad += 'LChart.' + type + ' = function(_targetdiv, _language) { loadScript(\'loongchart.' + type.toLowerCase() + '.\'); return new LChart.' + type + '(_targetdiv, _language); };';
        delayLoad += 'LChart.' + type + '._getDefaultOptions = function(options) { loadScript(\'loongchart.' + type.toLowerCase() + '.\'); return LChart.' + type + '._getDefaultOptions(options); };';
    }
    for (var i = 0, type; type = LChart.Const.DrawAxis[i]; i++) {
        delayLoad += 'LChart.' + type + ' = function(_targetdiv, _language) { loadScript(\'loongchart.' + type.toLowerCase() + '.\'); return new LChart.' + type + '(_targetdiv, _language); };';
        delayLoad += 'LChart.' + type + '._getDefaultOptions = function(options) { loadScript(\'loongchart.' + type.toLowerCase() + '.\'); return LChart.' + type + '._getDefaultOptions(options); };';
    }
    eval(delayLoad);
})();