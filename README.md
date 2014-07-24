LoongChart
===========
LoongChart is designed as Infographics mapping components. With it you draw general information charts in your web page or application, 
such as Pie, Bar, Line, Etc. Becasue it is coded by pure javascript, so as long as your device support javascript and html5, 
you will not encounter support problems during use theoretically.

Just see my site for more infomation.
[dcharts.net][dcharts]
[dcharts]: http://www.dcharts.net/Home_EN.htm


## Usage Examples
<pre>
var data = [
    { text: 'C', value: 17.855 },
    { text: 'Java', value: 17.417 },
    { text: 'Objective-C', value: 10.283 },
    { text: 'C++', value: 9.140 },
    { text: 'C#', value: 6.196 },
    { text: 'PHP', value: 5.546 },
    { text: 'Visual Basic', value: 4.749 },
    { text: 'Python', value: 4.173 },
    { text: 'Perl', value: 2.264 },
    { text: 'Javascript', value: 1.976 },
    { text: 'Others', value: 20.401 }
];
var options = {
    title: { content: 'Programming Language Ranking List in January 2013.' },
    subTitle: { content: 'Here\'s Top Ten Languages.' },
    legend: { sidelength: 10, fontsize: 13 },
    tip: { content: function(data) { return '&lt;div&gt;' + data.text + '&lt;br/&gt;value：' + data.value.toString() + '&lt;br/&gt;percent：' + data.percent.toFixed(3) + '%&lt;/div&gt;'; } }
};

window.lchart = new LChart.Pie('divCanvas', 'CN');
lchart.SetSkin('BlackAndWhite');
lchart.SetOptions(options);
lchart.Draw(data); 
</pre>

## License
Copyright (c) 2013, Ma Long, All rights reserved.
See BSD(3-Clause) [LICENSE][] for details.
[license]: LICENSE
