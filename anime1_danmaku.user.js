// ==UserScript==
// @name        anime1 Danmaku
// @name:zh-CN  anime1 Danmaku
// @name:zh-TW  anime1 Danmaku
// @namespace   anime1_danmaku
// @supportURL  https://github.com/zhuzemin
// @description anime1.me / video.eyny.com / www.tucao.one Show/Post Danmaku (Danmaku from bilibili.com / ani.gamer.com.tw / acfun.cn)
// @description:zh-CN anime1.me / video.eyny.com / www.tucao.one Show/Post Danmaku (Danmaku from bilibili.com / ani.gamer.com.tw / acfun.cn)
// @description:zh-TW  anime1.me / video.eyny.com / www.tucao.one Show/Post Danmaku (Danmaku from bilibili.com / ani.gamer.com.tw / acfun.cn)
// @include     https://anime1.me/*
// @include     https://i.animeone.me/*
// @include     https://v.anime1.me/watch?v=*
// @include     http://video.eyny.com/watch?v=*
// @include     http://video.eyny.com/*/watch?v=*
// @include     http://bangumi.bilibili.com/movie/*
// @include     https://www.bilibili.com/video/av*
// @include     https://www.bilibili.com/bangumi/play/*
// @include     https://www.tucao.one/play/*
// @include     https://www.acfun.cn/bangumi/*
// @include     https://www.acfun.cn/v/*
// @version     4.12
// @grant       GM_xmlhttpRequest
// @grant         GM_registerMenuCommand
// @grant         GM_setValue
// @grant         GM_getValue
// @run-at      document-start
// @author      zhuzemin
// @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
// @license     CC Attribution-ShareAlike 4.0 International; http://creativecommons.org/licenses/by-sa/4.0/
// @connect-src api.bilibili.com
// @connect-src ani.gamer.com.tw
// @connect-src www.bilibili.com
// @connect-src www.tucao.one
// @connect-src search.bilibili.com
// @connect-src www.acfun.cn
// @connect-src danmu.aixifan.com
// @connect-src anime1.me
// @connect-src zh.wikipedia.org
// @connect-src greasyfork.org
// ==/UserScript==
var cfg = {
    'debug': false
}
var debug = cfg.debug ? console.log.bind(console)  : function () {
};

//user setting
var TucaoEnable=true;
var PushEnable=true;
var TucaoDelay=5;
var defaultAlias={
    bahamut:{
        '异种族风俗娘评鉴指南':'異種族風俗娘評鑑指南 無修正版'
    }
}
// prepare UserPrefs
setUserPref(
    'DanmakuSpeed',
    '150',
    'Set Danmaku speed',
    `Enter percentage of speed for Danmaku, (100-200%), more larger more slower, default: 150.`,
    ','
);



//global variate
var TucaoStatus=0;
var EpisodeCurrent=null;
var title=null;
var input;
var datalist;
var abp=null;
var SearchFinished=false;
var IsDownload=false;
var danmakuSource={};
var matching=/(https:\/\/api\.bilibili\.com\/x\/v1\/dm\/list.so\?oid=\d*)|https:\/\/ani\.gamer\.com\.tw\/animeVideo\.php\?sn=(\d*)|(http:\/\/danmu\.aixifan\.com\/V2\/\d*\?pageSize=1000&pageNo=1)|(https:\/\/www\.tucao\.one\/index\.php\?m=mukio&c=index&a=init&playerID=\d*-\d*-\d*-\d*)/;
var MatchingWithTitle=/\[.*\] \[(.*)\] \[(.*)\] - ((https:\/\/api\.bilibili\.com\/x\/v1\/dm\/list.so\?oid=\d*)|https:\/\/ani\.gamer\.com\.tw\/animeVideo\.php\?sn=(\d*)|(http:\/\/danmu\.aixifan\.com\/V2\/\d*\?pageSize=1000&pageNo=1)|(https:\/\/www\.tucao\.one\/index\.php\?m=mukio&c=index&a=init&playerID=\d*-\d*-\d*-\d*))/;
var InputPlaceholder='Leave blank or, https://api.bilibili.com...?oid=******, https://ani.gamer.com.tw...?sn=******, http://danmu.aixifan.com/V2/******?pageSize=...';
var InputPlaceholderSearch='Enter title or, https://api.bilibili.com...?oid=******, https://ani.gamer.com.tw...?sn=******, http://danmu.aixifan.com/V2/******?pageSize=...';
class ObjectABP{
    constructor(VideoContainer,video,comments,width,height) {
        this.VideoContainer = VideoContainer;
        this.video = video;
        this.comments = comments;
        this.width = width;
        this.height=height;
    }
}
class ObjectRequest{
    constructor(href) {
        this.method = 'GET';
        this.url = href;
        this.data=null,
            this.headers = {
                'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
                //'Accept': 'application/atom+xml,application/xml,text/xml',
                //'Referer': window.location.href,
            };
        this.charset = 'text/plain;charset=utf8';
        this.other=null;
    }
}
var currentSite=getLocation(window.location.href).hostname;;
var messages=[
    ["[Notice] My userscript for adult site: !adult",5000,5],
    ["[Update] v4.1: now all function working on anime1.me",5000,2],
    ["[Notice] Danmaku source page: !source",5000,2],
    ["[Notice] a secret command for who rating this userscript: !secret",5000,5],
    ["[Notice] Post Danmaku: !dm:******",5000,2],
    ["[Notice] Danmaku speed(100-200): !dmspd:***",5000,2],
    ["[Notice] Current Anime theme song: !music",5000,2],
    ["[Notice] Current Anime wiki: !wiki",5000,2],
    ["[Notice] Current Anime on anime1.me page: !anime1",5000,2],
    ["[Notice] Set alias: !alias:{{targetSite}}targetTitle",5000,2],
    ["[Notice] Home page: !fork",5000,2],
    ["[Notice] Feedback: QQ Group: 32835999",5000,5]
];


//require
// 设置项
// 设置项
var config = {
    'playResX': 560, // 屏幕分辨率宽（像素）
    'playResY': 420, // 屏幕分辨率高（像素）
    'fontlist': [ // 字形（会自动选择最前面一个可用的）
        'Microsoft YaHei UI',
        'Microsoft YaHei',
        '文泉驿正黑',
        'STHeitiSC',
        '黑体',
    ],
    'font_size': 1, // 字号（比例）
    'r2ltime': 8, // 右到左弹幕持续时间（秒）
    'fixtime': 4, // 固定弹幕持续时间（秒）
    'opacity': 0.6, // 不透明度（比例）
    'space': 0, // 弹幕间隔的最小水平距离（像素）
    'max_delay': 6, // 最多允许延迟几秒出现弹幕
    'bottom': 50, // 底端给字幕保留的空间（像素）
    'use_canvas': null, // 是否使用canvas计算文本宽度（布尔值，Linux下的火狐默认否，其他默认是，Firefox bug #561361）
    'debug': false, // 打印调试信息
};
//var debug = config.debug ? console.log.bind(console)  : function () {};
// 将字典中的值填入字符串
var fillStr = function (str) {
    var dict = Array.apply(Array, arguments);
    return str.replace(/{{([^}]+)}}/g, function (r, o) {
        var ret;
        dict.some(function (i) {
            return ret = i[o];
        });
        return ret || '';
    });
};
// 将颜色的数值化为十六进制字符串表示
var RRGGBB = function (color) {
    var t = Number(color).toString(16).toUpperCase();
    return (Array(7).join('0') + t).slice( - 6);
};
// 将可见度转换为透明度
var hexAlpha = function (opacity) {
    var alpha = Math.round(255 * (1 - opacity)).toString(16).toUpperCase();
    return Array(3 - alpha.length).join('0') + alpha;
};
// 字符串
var funStr = function (fun) {
    return fun.toString().split(/\r\n|\n|\r/).slice(1, - 1).join('\n');
};
// 平方和开根
var hypot = Math.hypot ? Math.hypot.bind(Math)  : function () {
    return Math.sqrt([0].concat(Array.apply(Array, arguments)).reduce(function (x, y) {
        return x + y * y;
    }));
};
// 创建下载
var startDownload = function (data, filename) {
    var blob = new Blob([data], {
        type: 'application/octet-stream'
    });
    var url = window.URL.createObjectURL(blob);
    var saveas = document.createElement('a');
    saveas.href = url;
    saveas.style.display = 'none';
    document.body.appendChild(saveas);
    saveas.download = filename;
    saveas.click();
    setTimeout(function () {
        saveas.parentNode.removeChild(saveas);
    }, 1000)
    document.addEventListener('unload', function () {
        window.URL.revokeObjectURL(url);
    });
};
// 计算文字宽度
var calcWidth = (function () {
    // 使用Canvas计算
    var calcWidthCanvas = function () {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        return function (fontname, text, fontsize) {
            context.font = 'bold ' + fontsize + 'px ' + fontname;
            return Math.ceil(context.measureText(text).width + config.space);
        };
    }  // 使用Div计算

    var calcWidthDiv = function () {
        var d = document.createElement('div');
        d.setAttribute('style', [
            'all: unset',
            'top: -10000px',
            'left: -10000px',
            'width: auto',
            'height: auto',
            'position: absolute',
            '',
        ].join(' !important; '));
        var ld = function () {
            document.body.parentNode.appendChild(d);
        }
        if (!document.body) document.addEventListener('DOMContentLoaded', ld);
        else ld();
        return function (fontname, text, fontsize) {
            d.textContent = text;
            d.style.font = 'bold ' + fontsize + 'px ' + fontname;
            return d.clientWidth + config.space;
        };
    };
    // 检查使用哪个测量文字宽度的方法
    if (config.use_canvas === null) {
        if (navigator.platform.match(/linux/i) && !navigator.userAgent.match(/chrome/i)) config.use_canvas = false;
    }
    debug('use canvas: %o', config.use_canvas !== false);
    if (config.use_canvas === false) return calcWidthDiv();
    return calcWidthCanvas();
}());
// 选择合适的字体
var choseFont = function (fontlist) {
    // 检查这个字串的宽度来检查字体是否存在
    var sampleText = 'The quick brown fox jumps over the lazy dog' +
        '7531902468' + ',.!-' + '，。：！' +
        '天地玄黄' + '则近道矣';
    // 和这些字体进行比较
    var sampleFont = [
        'monospace',
        'sans-serif',
        'sans',
        'Symbol',
        'Arial',
        'Comic Sans MS',
        'Fixed',
        'Terminal',
        'Times',
        'Times New Roman',
        '宋体',
        '黑体',
        '文泉驿正黑',
        'Microsoft YaHei'
    ];
    // 如果被检查的字体和基准字体可以渲染出不同的宽度
    // 那么说明被检查的字体总是存在的
    var diffFont = function (base, test) {
        var baseSize = calcWidth(base, sampleText, 72);
        var testSize = calcWidth(test + ',' + base, sampleText, 72);
        return baseSize !== testSize;
    };
    var validFont = function (test) {
        var valid = sampleFont.some(function (base) {
            return diffFont(base, test);
        });
        debug('font %s: %o', test, valid);
        return valid;
    };
    // 找一个能用的字体
    var f = fontlist[fontlist.length - 1];
    fontlist = fontlist.filter(validFont);
    debug('fontlist: %o', fontlist);
    return fontlist[0] || f;
};
// 从备选的字体中选择一个机器上提供了的字体
var initFont = (function () {
    var done = false;
    return function () {
        if (done) return;
        done = true;
        calcWidth = calcWidth.bind(window, config.font = choseFont(config.fontlist)
        );
    };
}());
var generateASS = function (danmaku, info) {
    var assHeader = fillStr(funStr(function () { /*! ASS弹幕文件文件头
[Script Info]
Title: {{title}}
Original Script: 根据 {{ori}} 的弹幕信息，由 https://github.com/tiansh/us-danmaku 生成
ScriptType: v4.00+
Collisions: Normal
PlayResX: {{playResX}}
PlayResY: {{playResY}}
Timer: 10.0000

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Fix,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0
Style: R2L,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text

  */
    }), config, info, {
        'alpha': hexAlpha(config.opacity)
    });
    // 补齐数字开头的0
    var paddingNum = function (num, len) {
        num = '' + num;
        while (num.length < len) num = '0' + num;
        return num;
    };
    // 格式化时间
    var formatTime = function (time) {
        time = 100 * time ^ 0;
        var l = [
            [100,
                2],
            [
                60,
                2
            ],
            [
                60,
                2
            ],
            [
                Infinity,
                0
            ]
        ].map(function (c) {
            var r = time % c[0];
            time = (time - r) / c[0];
            return paddingNum(r, c[1]);
        }).reverse();
        return l.slice(0, - 1).join(':') + '.' + l[3];
    };
    // 格式化特效
    var format = (function () {
        // 适用于所有弹幕
        var common = function (line) {
            var s = '';
            var rgb = line.color.split(/(..)/).filter(function (x) {
                return x;
            }).map(function (x) {
                return parseInt(x, 16);
            });
            // 如果不是白色，要指定弹幕特殊的颜色
            if (line.color !== 'FFFFFF') // line.color 是 RRGGBB 格式
                s += '\\c&H' + line.color.split(/(..)/).reverse().join('');
            // 如果弹幕颜色比较深，用白色的外边框
            var dark = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 48;
            if (dark) s += '\\3c&HFFFFFF';
            if (line.size !== 25) s += '\\fs' + line.size;
            return s;
        };
        // 适用于从右到左弹幕
        var r2l = function (line) {
            return '\\move(' + [
                line.poss.x,
                line.poss.y,
                line.posd.x,
                line.posd.y
            ].join(',') + ')';
        };
        // 适用于固定位置弹幕
        var fix = function (line) {
            return '\\pos(' + [
                line.poss.x,
                line.poss.y
            ].join(',') + ')';
        };
        var withCommon = function (f) {
            return function (line) {
                return f(line) + common(line);
            };
        };
        return {
            'R2L': withCommon(r2l),
            'Fix': withCommon(fix),
        };
    }());
    // 转义一些字符
    var escapeAssText = function (s) {
        // "{"、"}"字符libass可以转义，但是VSFilter不可以，所以直接用全角补上
        return s.replace(/{/g, '｛').replace(/}/g, '｝').replace(/\r|\n/g, '');
    };
    // 将一行转换为ASS的事件
    var convert2Ass = function (line) {
        return 'Dialogue: ' + [
                0,
                formatTime(line.stime),
                formatTime(line.dtime),
                line.type,
                ',20,20,2,,',
            ].join(',')
            + '{' + format[line.type](line) + '}'
            + escapeAssText(line.text);
    };
    return assHeader +
        danmaku.map(convert2Ass).filter(function (x) {
            return x;
        }).join('\n');
};
/*

下文字母含义：
0       ||----------------------x---------------------->
           _____________________c_____________________
=        /                     wc                      \      0
|       |                   |--v--|                 wv  |  |--v--|
|    d  |--v--|               d f                 |--v--|
y |--v--|  l                                         f  |  s    _ p
|       |              VIDEO           |--v--|          |--v--| _ m
v       |              AREA            (x ^ y)          |

v: 弹幕
c: 屏幕

0: 弹幕发送
a: 可行方案

s: 开始出现
f: 出现完全
l: 开始消失
d: 消失完全

p: 上边缘（含）
m: 下边缘（不含）

w: 宽度
h: 高度
b: 底端保留

t: 时间点
u: 时间段
r: 延迟

并规定
ts := t0s + r
tf := wv / (wc + ws) * p + ts
tl := ws / (wc + ws) * p + ts
td := p + ts

*/
// 滚动弹幕
var normalDanmaku = (function (wc, hc, b, u, maxr) {
    return function () {
        // 初始化屏幕外面是不可用的
        var used = [
            {
                'p': - Infinity,
                'm': 0,
                'tf': Infinity,
                'td': Infinity,
                'b': false
            },
            {
                'p': hc,
                'm': Infinity,
                'tf': Infinity,
                'td': Infinity,
                'b': false
            },
            {
                'p': hc - b,
                'm': hc,
                'tf': Infinity,
                'td': Infinity,
                'b': true
            },
        ];
        // 检查一些可用的位置
        var available = function (hv, t0s, t0l, b) {
            var suggestion = [
            ];
            // 这些上边缘总之别的块的下边缘
            used.forEach(function (i) {
                if (i.m > hc) return;
                var p = i.m;
                var m = p + hv;
                var tas = t0s;
                var tal = t0l;
                // 这些块的左边缘总是这个区域里面最大的边缘
                used.forEach(function (j) {
                    if (j.p >= m) return;
                    if (j.m <= p) return;
                    if (j.b && b) return;
                    tas = Math.max(tas, j.tf);
                    tal = Math.max(tal, j.td);
                });
                // 最后作为一种备选留下来
                suggestion.push({
                    'p': p,
                    'r': Math.max(tas - t0s, tal - t0l),
                });
            });
            // 根据高度排序
            suggestion.sort(function (x, y) {
                return x.p - y.p;
            });
            var mr = maxr;
            // 又靠右又靠下的选择可以忽略，剩下的返回
            suggestion = suggestion.filter(function (i) {
                if (i.r >= mr) return false;
                mr = i.r;
                return true;
            });
            return suggestion;
        };
        // 添加一个被使用的
        var use = function (p, m, tf, td) {
            used.push({
                'p': p,
                'm': m,
                'tf': tf,
                'td': td,
                'b': false
            });
        };
        // 根据时间同步掉无用的
        var syn = function (t0s, t0l) {
            used = used.filter(function (i) {
                return i.tf > t0s || i.td > t0l;
            });
        };
        // 给所有可能的位置打分，分数是[0, 1)的
        var score = function (i) {
            if (i.r > maxr) return - Infinity;
            return 1 - hypot(i.r / maxr, i.p / hc) * Math.SQRT1_2;
        };
        // 添加一条
        return function (t0s, wv, hv, b) {
            var t0l = wc / (wv + wc) * u + t0s;
            syn(t0s, t0l);
            var al = available(hv, t0s, t0l, b);
            if (!al.length) return null;
            var scored = al.map(function (i) {
                return [score(i),
                    i];
            });
            var best = scored.reduce(function (x, y) {
                return x[0] > y[0] ? x : y;
            }) [1];
            var ts = t0s + best.r;
            var tf = wv / (wv + wc) * u + ts;
            var td = u + ts;
            use(best.p, best.p + hv, tf, td);
            return {
                'top': best.p,
                'time': ts,
            };
        };
    };
}(config.playResX, config.playResY, config.bottom, config.r2ltime, config.max_delay));
// 顶部、底部弹幕
var sideDanmaku = (function (hc, b, u, maxr) {
    return function () {
        var used = [
            {
                'p': - Infinity,
                'm': 0,
                'td': Infinity,
                'b': false
            },
            {
                'p': hc,
                'm': Infinity,
                'td': Infinity,
                'b': false
            },
            {
                'p': hc - b,
                'm': hc,
                'td': Infinity,
                'b': true
            },
        ];
        // 查找可用的位置
        var fr = function (p, m, t0s, b) {
            var tas = t0s;
            used.forEach(function (j) {
                if (j.p >= m) return;
                if (j.m <= p) return;
                if (j.b && b) return;
                tas = Math.max(tas, j.td);
            });
            return {
                'r': tas - t0s,
                'p': p,
                'm': m
            };
        };
        // 顶部
        var top = function (hv, t0s, b) {
            var suggestion = [
            ];
            used.forEach(function (i) {
                if (i.m > hc) return;
                suggestion.push(fr(i.m, i.m + hv, t0s, b));
            });
            return suggestion;
        };
        // 底部
        var bottom = function (hv, t0s, b) {
            var suggestion = [
            ];
            used.forEach(function (i) {
                if (i.p < 0) return;
                suggestion.push(fr(i.p - hv, i.p, t0s, b));
            });
            return suggestion;
        };
        var use = function (p, m, td) {
            used.push({
                'p': p,
                'm': m,
                'td': td,
                'b': false
            });
        };
        var syn = function (t0s) {
            used = used.filter(function (i) {
                return i.td > t0s;
            });
        };
        // 挑选最好的方案：延迟小的优先，位置不重要
        var score = function (i, is_top) {
            if (i.r > maxr) return - Infinity;
            var f = function (p) {
                return is_top ? p : (hc - p);
            };
            return 1 - (i.r / maxr * (31 / 32) + f(i.p) / hc * (1 / 32));
        };
        return function (t0s, hv, is_top, b) {
            syn(t0s);
            var al = (is_top ? top : bottom) (hv, t0s, b);
            if (!al.length) return null;
            var scored = al.map(function (i) {
                return [score(i, is_top),
                    i];
            });
            var best = scored.reduce(function (x, y) {
                return x[0] > y[0] ? x : y;
            }) [1];
            use(best.p, best.m, best.r + t0s + u)
            return {
                'top': best.p,
                'time': best.r + t0s
            };
        };
    };
}(config.playResY, config.bottom, config.fixtime, config.max_delay));
// 为每条弹幕安置位置
var setPosition = function (danmaku) {
    var normal = normalDanmaku(),
        side = sideDanmaku();
    return danmaku.sort(function (x, y) {
        return x.time - y.time;
    }).map(function (line) {
        var font_size = Math.round(line.size * config.font_size);
        var width = calcWidth(line.text, font_size);
        switch (line.mode) {
            case 'R2L':
                return (function () {
                    var pos = normal(line.time, width, font_size, line.bottom);
                    if (!pos) return null;
                    line.type = 'R2L';
                    line.stime = pos.time;
                    line.poss = {
                        'x': config.playResX + width / 2,
                        'y': pos.top + font_size,
                    };
                    line.posd = {
                        'x': - width / 2,
                        'y': pos.top + font_size,
                    };
                    line.dtime = config.r2ltime + line.stime;
                    return line;
                }());
            case 'TOP':
            case 'BOTTOM':
                return (function (isTop) {
                    var pos = side(line.time, font_size, isTop, line.bottom);
                    if (!pos) return null;
                    line.type = 'Fix';
                    line.stime = pos.time;
                    line.posd = line.poss = {
                        'x': Math.round(config.playResX / 2),
                        'y': pos.top + font_size,
                    };
                    line.dtime = config.fixtime + line.stime;
                    return line;
                }(line.mode === 'TOP'));
            default:
                return null;
        };
    }).filter(function (l) {
        return l;
    }).sort(function (x, y) {
        return x.stime - y.stime;
    });
};


/*
 * bilibili
 */
// 获取xml
var fetchXML = function (cid, callback) {
    if(cid.includes("ani.gamer.com.tw")){
        cid = cid.match(/https:\/\/ani\.gamer\.com\.tw\/animeVideo\.php\?sn=(\d*)/)[1];
        var DanmakuLink="https://ani.gamer.com.tw/ajax/danmuGet.php";
        var danmaku=new ObjectRequest(DanmakuLink);
        danmaku.method="POST";
        danmaku.data="sn="+cid;
        request(danmaku,function (responseDetails) {
            var responseText = responseDetails.responseText;
            var comments = responseText;
            debug("Comments: " + comments);
            var json=JSON.parse(comments);
            debug("Comments: " + comments);
            var parser = new DOMParser();
            var xmlDoc   = parser.parseFromString('<?xml version="1.0" encoding="utf-8"?><i></i>', "application/xml");
            var root=xmlDoc.getElementsByTagName("i");
            for(var obj of Object.values( json)){
                try{
                    var d=xmlDoc.createElement("d");
                    d.innerHTML=obj.text.replace(/[^\u4e00-\u9fa5`~\!@#\$%\^\*\(\)_\+\|\-=\\\{\}\[\]:";'\?,\.\/\w\d<>&\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u2605-\u2606\u2190-\u2195\u203B]/g,"").replace("<","&lt;").replace(">","&gt;").replace("&","&amp;");
                    var type;
                    if(obj.position==0){
                        type=1;
                    }
                    else if(obj.position==2){
                        type=4;
                    }
                    else if(obj.position==1){
                        type=5;
                    }
                    else{
                        type=6;
                    }
                    var p=obj.time/10+","+type+",25,"+parseInt(obj.color.match(/#([\d\w]{6})/)[1],16)+",1550236858,0,55f99b31,12108265626271746";
                    d.setAttribute("p",p);
                    root[0].appendChild(d);
                }
                catch(e){
                    debug(e+" "+obj.text);
                    continue;
                }
            }
            comments= (new XMLSerializer()).serializeToString(xmlDoc );
            debug("Comments: " + comments);
            callback(comments);
        });
    }
    else if(cid.includes("api.bilibili.com")||cid.includes("www.tucao.one")){
        GM_xmlhttpRequest({
            'method': 'GET',
            'url': cid,
            'onload': function (resp) {
                var content = resp.responseText.replace(/(?:[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, '');
                callback(content);
            }
        });
    }
    else if(cid.includes("danmu.aixifan.com")) {
        var danmaku=new ObjectRequest(cid);
        request(danmaku, function (responseDetails) {
            var responseText = responseDetails.responseText;
            comments = responseText;
            var json = JSON.parse(comments);
            comments=AcfunParse(json);
            callback(comments);
        });
        //reset for player
        AcfunDanmaku = [];
        AcfunCount = 1;
    }
};

var fetchDanmaku = function (cid, callback) {
    fetchXML(cid, function (content) {
        callback(parseXML(content));
    });
};
var parseXML = function (content) {
    var data = (new DOMParser()).parseFromString(content, 'text/xml');
    return Array.apply(Array, data.querySelectorAll('d')).map(function (line) {
        var info = line.getAttribute('p').split(','),
            text = line.textContent;
        return {
            'text': text,
            'time': Number(info[0]),
            'mode': [
                undefined,
                'R2L',
                'R2L',
                'R2L',
                'BOTTOM',
                'TOP'
            ][Number(info[1])],
            'size': Number(info[2]),
            'color': RRGGBB(parseInt(info[3], 10) & 16777215),
            'bottom': Number(info[5]) > 0,
            // 'create': new Date(Number(info[4])),
            // 'pool': Number(info[5]),
            // 'sender': String(info[6]),
            // 'dmid': Number(info[7]),
        };
    });
};
// 获取当前cid
var getCid = function (callback) {
    debug('get cid...');
    var cid = null;
    try {
        cid = input.value.match(/.* - (https?:\/\/.*)/)[1];
    } catch (e) {
        var DanmakuLink=input.value.match(matching);
        if (DanmakuLink != null) {

            //bahamut
            if (DanmakuLink[2] != null) {
                cid = DanmakuLink[2];
            }
            //bilibili
            else if (DanmakuLink[1] != null) {
                cid = DanmakuLink[1];
            }
            //acfun
            else if(DanmakuLink[3]!=null){
                cid=DanmakuLink[3];
            }
        }
    }
    if (cid) {
        setTimeout(callback, 0, cid || undefined);
    } else {
        setTimeout(getCid, 100, callback);
    }
};
// 下载的主程序
var mina = function (cid0) {
    getCid(function (cid) {
        cid = cid || cid0;
        fetchDanmaku(cid, function (danmaku) {
            var name = null;
            try {
                name=input.value.match(/Search Result: (.*) - https?:\/\/.*/)[1];
            }
            catch (e) {
                name=document.title;
            }
            debug('got xml with %d danmaku', danmaku.length);
            var ass = generateASS(setPosition(danmaku), {
                'title': document.title,
                'ori': location.href,
            });
            startDownload('﻿' + ass, name + '.ass');
        });
    });
};
// 初始化按钮
var initButton = (function () {
    var done = false;
    return function () {
        debug('init button');
        if (!document.querySelector('body')) return;
        getCid(function (cid) {
            debug('cid = %o', cid);
            if (!cid || done) return;
            else done = true;
            fetchDanmaku(cid, function (danmaku) {
                CreateButton("Download Danmaku",function () {
                    mina(cid);

                });
            });
        });
    };
}());
/*
 * Common
 */
// 初始化
var DanmakuDownloaderInit = function () {
    IsDownload=true;
    initFont();
    initButton();
};
var BinArray=function(){var t={};return t.bsearch=function(t,e,r){if(!Array.isArray(t))throw new Error("Bsearch can only be run on arrays");if(0===t.length)return 0;if(r(e,t[0])<0)return 0;if(r(e,t[t.length-1])>=0)return t.length;for(var i=0,n=0,o=0,s=t.length-1;i<=s;){if(n=Math.floor((s+i+1)/2),o++,r(e,t[n-1])>=0&&r(e,t[n])<0)return n;if(r(e,t[n-1])<0)s=n-1;else{if(!(r(e,t[n])>=0))throw new Error("Program Error. Inconsistent comparator or unsorted array!");i=n}if(o>1500)throw new Error("Iteration depth exceeded. Inconsistent comparator or astronomical dataset!")}return-1},t.binsert=function(e,r,i){var n=t.bsearch(e,r,i);return e.splice(n,0,r),n},t}(),CommentUtils;!function(t){var e=function(){function t(t){if(this._internalArray=null,!Array.isArray(t))throw new Error("Not an array. Cannot construct matrix.");if(16!=t.length)throw new Error("Illegal Dimensions. Matrix3D should be 4x4 matrix.");this._internalArray=t}return Object.defineProperty(t.prototype,"flatArray",{get:function(){return this._internalArray.slice(0)},set:function(t){throw new Error("Not permitted. Matrices are immutable.")},enumerable:!0,configurable:!0}),t.prototype.isIdentity=function(){return this.equals(t.identity())},t.prototype.dot=function(e){for(var r=this._internalArray.slice(0),i=e._internalArray.slice(0),n=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],o=0;o<4;o++)for(var s=0;s<4;s++)for(var a=0;a<4;a++)n[4*o+s]+=r[4*o+a]*i[4*a+s];return new t(n)},t.prototype.equals=function(t){for(var e=0;e<16;e++)if(this._internalArray[e]!==t._internalArray[e])return!1;return!0},t.prototype.toCss=function(){for(var t=this._internalArray.slice(0),e=0;e<t.length;e++)Math.abs(t[e])<1e-6&&(t[e]=0);return"matrix3d("+t.join(",")+")"},t.identity=function(){return new t([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])},t.createScaleMatrix=function(e,r,i){return new t([e,0,0,0,0,r,0,0,0,0,i,0,0,0,0,1])},t.createRotationMatrix=function(e,r,i){var n=Math.PI/180,o=r*n,s=i*n,a=Math.cos,h=Math.sin;return new t([a(o)*a(s),a(o)*h(s),h(o),0,-h(s),a(s),0,0,-h(o)*a(s),-h(o)*h(s),a(o),0,0,0,0,1].map(function(t){return 1e-10*Math.round(1e10*t)}))},t}();t.Matrix3D=e}(CommentUtils||(CommentUtils={}));var __extends=this&&this.__extends||function(t,e){function r(){this.constructor=t}for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i]);t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)},CoreComment=function(){function t(e,r){if(void 0===r&&(r={}),this.mode=1,this.stime=0,this.text="",this.ttl=4e3,this.dur=4e3,this.cindex=-1,this.motion=[],this.movable=!0,this._alphaMotion=null,this.absolute=!0,this.align=0,this.axis=0,this._alpha=1,this._size=25,this._color=16777215,this._border=!1,this._shadow=!0,this._font="",this._transform=null,!e)throw new Error("Comment not bound to comment manager.");if(this.parent=e,r.hasOwnProperty("stime")&&(this.stime=r.stime),r.hasOwnProperty("mode")?this.mode=r.mode:this.mode=1,r.hasOwnProperty("dur")&&(this.dur=r.dur,this.ttl=this.dur),this.dur*=this.parent.options.global.scale,this.ttl*=this.parent.options.global.scale,r.hasOwnProperty("text")&&(this.text=r.text),r.hasOwnProperty("motion")){this._motionStart=[],this._motionEnd=[],this.motion=r.motion;for(var i=0,n=0;n<r.motion.length;n++){this._motionStart.push(i);var o=0;for(var s in r.motion[n]){var a=r.motion[n][s];o=Math.max(a.dur,o),null!==a.easing&&void 0!==a.easing||(r.motion[n][s].easing=t.LINEAR)}i+=o,this._motionEnd.push(i)}this._curMotion=0}r.hasOwnProperty("color")&&(this._color=r.color),r.hasOwnProperty("size")&&(this._size=r.size),r.hasOwnProperty("border")&&(this._border=r.border),r.hasOwnProperty("opacity")&&(this._alpha=r.opacity),r.hasOwnProperty("alpha")&&(this._alphaMotion=r.alpha),r.hasOwnProperty("font")&&(this._font=r.font),r.hasOwnProperty("x")&&(this._x=r.x),r.hasOwnProperty("y")&&(this._y=r.y),r.hasOwnProperty("shadow")&&(this._shadow=r.shadow),r.hasOwnProperty("align")&&(this.align=r.align),r.hasOwnProperty("axis")&&(this.axis=r.axis),r.hasOwnProperty("transform")&&(this._transform=new CommentUtils.Matrix3D(r.transform)),r.hasOwnProperty("position")&&"relative"===r.position&&(this.absolute=!1,this.mode<7&&console.warn("Using relative position for CSA comment."))}return t.prototype.init=function(t){void 0===t&&(t=null),this.dom=null!==t?t.dom:document.createElement("div"),this.dom.className=this.parent.options.global.className,this.dom.appendChild(document.createTextNode(this.text)),this.dom.textContent=this.text,this.dom.innerText=this.text,this.size=this._size,16777215!=this._color&&(this.color=this._color),this.shadow=this._shadow,this._border&&(this.border=this._border),""!==this._font&&(this.font=this._font),void 0!==this._x&&(this.x=this._x),void 0!==this._y&&(this.y=this._y),(1!==this._alpha||this.parent.options.global.opacity<1)&&(this.alpha=this._alpha),null===this._transform||this._transform.isIdentity()||(this.transform=this._transform.flatArray),this.motion.length>0&&this.animate()},Object.defineProperty(t.prototype,"x",{get:function(){return null!==this._x&&void 0!==this._x||(this.axis%2==0?this.align%2==0?this._x=this.dom.offsetLeft:this._x=this.dom.offsetLeft+this.width:this.align%2==0?this._x=this.parent.width-this.dom.offsetLeft:this._x=this.parent.width-this.dom.offsetLeft-this.width),this.absolute?this._x:this._x/this.parent.width},set:function(t){this._x=t,this.absolute||(this._x*=this.parent.width),this.axis%2==0?this.dom.style.left=this._x+(this.align%2==0?0:-this.width)+"px":this.dom.style.right=this._x+(this.align%2==0?-this.width:0)+"px"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"y",{get:function(){return null!==this._y&&void 0!==this._y||(this.axis<2?this.align<2?this._y=this.dom.offsetTop:this._y=this.dom.offsetTop+this.height:this.align<2?this._y=this.parent.height-this.dom.offsetTop:this._y=this.parent.height-this.dom.offsetTop-this.height),this.absolute?this._y:this._y/this.parent.height},set:function(t){this._y=t,this.absolute||(this._y*=this.parent.height),this.axis<2?this.dom.style.top=this._y+(this.align<2?0:-this.height)+"px":this.dom.style.bottom=this._y+(this.align<2?-this.height:0)+"px"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"bottom",{get:function(){var t=Math.floor(this.axis/2)===Math.floor(this.align/2);return this.y+(t?this.height:0)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"right",{get:function(){var t=this.axis%2==this.align%2;return this.x+(t?this.width:0)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"width",{get:function(){return null!==this._width&&void 0!==this._width||(this._width=this.dom.offsetWidth),this._width},set:function(t){this._width=t,this.dom.style.width=this._width+"px"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"height",{get:function(){return null!==this._height&&void 0!==this._height||(this._height=this.dom.offsetHeight),this._height},set:function(t){this._height=t,this.dom.style.height=this._height+"px"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"size",{get:function(){return this._size},set:function(t){this._size=t,this.dom.style.fontSize=this._size+"px"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"color",{get:function(){return this._color},set:function(t){this._color=t;var e=t.toString(16);e=e.length>=6?e:new Array(6-e.length+1).join("0")+e,this.dom.style.color="#"+e,0===this._color&&(this.dom.className=this.parent.options.global.className+" rshadow")},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"alpha",{get:function(){return this._alpha},set:function(t){this._alpha=t,this.dom.style.opacity=Math.min(this._alpha,this.parent.options.global.opacity)+""},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"border",{get:function(){return this._border},set:function(t){this._border=t,this._border?this.dom.style.border="1px solid #00ffff":this.dom.style.border="none"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"shadow",{get:function(){return this._shadow},set:function(t){this._shadow=t,this._shadow||(this.dom.className=this.parent.options.global.className+" noshadow")},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"font",{get:function(){return this._font},set:function(t){this._font=t,this._font.length>0?this.dom.style.fontFamily=this._font:this.dom.style.fontFamily=""},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"transform",{get:function(){return this._transform.flatArray},set:function(t){this._transform=new CommentUtils.Matrix3D(t),null!==this.dom&&(this.dom.style.transform=this._transform.toCss())},enumerable:!0,configurable:!0}),t.prototype.time=function(t){this.ttl-=t,this.ttl<0&&(this.ttl=0),this.movable&&this.update(),this.ttl<=0&&this.finish()},t.prototype.update=function(){this.animate()},t.prototype.invalidate=function(){this._x=null,this._y=null,this._width=null,this._height=null},t.prototype._execMotion=function(t,e){for(var r in t)if(t.hasOwnProperty(r)){var i=t[r];this[r]=i.easing(Math.min(Math.max(e-i.delay,0),i.dur),i.from,i.to-i.from,i.dur)}},t.prototype.animate=function(){if(this._alphaMotion&&(this.alpha=(this.dur-this.ttl)*(this._alphaMotion.to-this._alphaMotion.from)/this.dur+this._alphaMotion.from),0!==this.motion.length){var t=Math.max(this.ttl,0),e=this.dur-t-this._motionStart[this._curMotion];return this._execMotion(this.motion[this._curMotion],e),this.dur-t>this._motionEnd[this._curMotion]?void(++this._curMotion>=this.motion.length&&(this._curMotion=this.motion.length-1)):void 0}},t.prototype.stop=function(){},t.prototype.finish=function(){this.parent.finish(this)},t.prototype.toString=function(){return["[",this.stime,"|",this.ttl,"/",this.dur,"]","(",this.mode,")",this.text].join("")},t.LINEAR=function(t,e,r,i){return t*r/i+e},t}(),ScrollComment=function(t){function e(e,r){t.call(this,e,r),this.dur*=this.parent.options.scroll.scale,this.ttl*=this.parent.options.scroll.scale}return __extends(e,t),Object.defineProperty(e.prototype,"alpha",{set:function(t){this._alpha=t,this.dom.style.opacity=Math.min(Math.min(this._alpha,this.parent.options.global.opacity),this.parent.options.scroll.opacity)+""},enumerable:!0,configurable:!0}),e.prototype.init=function(e){void 0===e&&(e=null),t.prototype.init.call(this,e),this.x=this.parent.width,this.parent.options.scroll.opacity<1&&(this.alpha=this._alpha),this.absolute=!0},e.prototype.update=function(){this.x=this.ttl/this.dur*(this.parent.width+this.width)-this.width},e}(CoreComment),__extends=this&&this.__extends||function(t,e){function r(){this.constructor=t}for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i]);t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)},CssCompatLayer=function(){function t(){}return t.transform=function(t,e){t.style.transform=e,t.style.webkitTransform=e,t.style.msTransform=e,t.style.oTransform=e},t}(),CssScrollComment=function(t){function e(){t.apply(this,arguments),this._dirtyCSS=!0}return __extends(e,t),Object.defineProperty(e.prototype,"x",{get:function(){return this.ttl/this.dur*(this.parent.width+this.width)-this.width},set:function(t){if(null!==this._x&&"number"==typeof this._x){var e=t-this._x;this._x=t,CssCompatLayer.transform(this.dom,"translateX("+(this.axis%2==0?e:-e)+"px)")}else this._x=t,this.absolute||(this._x*=this.parent.width),this.axis%2==0?this.dom.style.left=this._x+(this.align%2==0?0:-this.width)+"px":this.dom.style.right=this._x+(this.align%2==0?-this.width:0)+"px"},enumerable:!0,configurable:!0}),e.prototype.update=function(){this._dirtyCSS&&(this.dom.style.transition="transform "+this.ttl+"ms linear",this.x=-this.width,this._dirtyCSS=!1)},e.prototype.invalidate=function(){t.prototype.invalidate.call(this),this._dirtyCSS=!0},e.prototype.stop=function(){t.prototype.stop.call(this),this.dom.style.transition="",this.x=this._x,this._x=null,this.x=this.x,this._dirtyCSS=!0},e}(ScrollComment),CommentFactory=function(){function t(){this._bindings={}}return t._simpleCssScrollingInitializer=function(t,e){var r=new CssScrollComment(t,e);switch(r.mode){case 1:r.align=0,r.axis=0;break;case 2:r.align=2,r.axis=2;break;case 6:r.align=1,r.axis=1}return r.init(),t.stage.appendChild(r.dom),r},t._simpleScrollingInitializer=function(t,e){var r=new ScrollComment(t,e);switch(r.mode){case 1:r.align=0,r.axis=0;break;case 2:r.align=2,r.axis=2;break;case 6:r.align=1,r.axis=1}return r.init(),t.stage.appendChild(r.dom),r},t._simpleAnchoredInitializer=function(t,e){var r=new CoreComment(t,e);switch(r.mode){case 4:r.align=2,r.axis=2;break;case 5:r.align=0,r.axis=0}return r.init(),t.stage.appendChild(r.dom),r},t._advancedCoreInitializer=function(t,e){var r=new CoreComment(t,e);return r.init(),r.transform=CommentUtils.Matrix3D.createRotationMatrix(0,e.rY,e.rZ).flatArray,t.stage.appendChild(r.dom),r},t.defaultFactory=function(){var e=new t;return e.bind(1,t._simpleScrollingInitializer),e.bind(2,t._simpleScrollingInitializer),e.bind(6,t._simpleScrollingInitializer),e.bind(4,t._simpleAnchoredInitializer),e.bind(5,t._simpleAnchoredInitializer),e.bind(7,t._advancedCoreInitializer),e.bind(17,t._advancedCoreInitializer),e},t.defaultCssRenderFactory=function(){var e=new t;return e.bind(1,t._simpleCssScrollingInitializer),e.bind(2,t._simpleCssScrollingInitializer),e.bind(6,t._simpleCssScrollingInitializer),e.bind(4,t._simpleAnchoredInitializer),e.bind(5,t._simpleAnchoredInitializer),e.bind(7,t._advancedCoreInitializer),e.bind(17,t._advancedCoreInitializer),e},t.defaultCanvasRenderFactory=function(){throw new Error("Not implemented")},t.defaultSvgRenderFactory=function(){throw new Error("Not implemented")},t.prototype.bind=function(t,e){this._bindings[t]=e},t.prototype.canCreate=function(t){return this._bindings.hasOwnProperty(t.mode)},t.prototype.create=function(t,e){if(null===e||!e.hasOwnProperty("mode"))throw new Error("Comment format incorrect");if(!this._bindings.hasOwnProperty(e.mode))throw new Error("No binding for comment type "+e.mode);return this._bindings[e.mode](t,e)},t}(),__extends=this&&this.__extends||function(t,e){function r(){this.constructor=t}for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i]);t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)},CommentSpaceAllocator=function(){function t(t,e){void 0===t&&(t=0),void 0===e&&(e=0),this._pools=[[]],this.avoid=1,this._width=t,this._height=e}return t.prototype.willCollide=function(t,e){return t.stime+t.ttl>=e.stime+e.ttl/2},t.prototype.pathCheck=function(t,e,r){for(var i=t+e.height,n=e.right,o=0;o<r.length;o++)if(!(r[o].y>i||r[o].bottom<t)){if(!(r[o].right<e.x||r[o].x>n))return!1;if(this.willCollide(r[o],e))return!1}return!0},t.prototype.assign=function(t,e){for(;this._pools.length<=e;)this._pools.push([]);var r=this._pools[e];if(0===r.length)return t.cindex=e,0;if(this.pathCheck(0,t,r))return t.cindex=e,0;for(var i=0,n=0;n<r.length&&!((i=r[n].bottom+this.avoid)+t.height>this._height);n++)if(this.pathCheck(i,t,r))return t.cindex=e,i;return this.assign(t,e+1)},t.prototype.add=function(t){t.height>this._height?(t.cindex=-2,t.y=0):(t.y=this.assign(t,0),BinArray.binsert(this._pools[t.cindex],t,function(t,e){return t.bottom<e.bottom?-1:t.bottom>e.bottom?1:0}))},t.prototype.remove=function(t){if(!(t.cindex<0)){if(t.cindex>=this._pools.length)throw new Error("cindex out of bounds");var e=this._pools[t.cindex].indexOf(t);e<0||this._pools[t.cindex].splice(e,1)}},t.prototype.setBounds=function(t,e){this._width=t,this._height=e},t}(),AnchorCommentSpaceAllocator=function(t){function e(){t.apply(this,arguments)}return __extends(e,t),e.prototype.add=function(e){t.prototype.add.call(this,e),e.x=(this._width-e.width)/2},e.prototype.willCollide=function(t,e){return!0},e.prototype.pathCheck=function(t,e,r){for(var i=t+e.height,n=0;n<r.length;n++)if(!(r[n].y>i||r[n].bottom<t))return!1;return!0},e}(CommentSpaceAllocator),CommentManager=function(){function t(t){var e=0;this._listeners={},this._lastPosition=0,this.stage=t,this.options={global:{opacity:1,scale:1,className:"cmt"},scroll:{opacity:1,scale:1},limit:0},this.timeline=[],this.runline=[],this.position=0,this.limiter=0,this.factory=null,this.filter=null,this.csa={scroll:new CommentSpaceAllocator(0,0),top:new AnchorCommentSpaceAllocator(0,0),bottom:new AnchorCommentSpaceAllocator(0,0),reverse:new CommentSpaceAllocator(0,0),scrollbtm:new CommentSpaceAllocator(0,0)},this.width=this.stage.offsetWidth,this.height=this.stage.offsetHeight,this._startTimer=function(){if(!(e>0)){var t=(new Date).getTime(),r=this;e=window.setInterval(function(){var e=(new Date).getTime()-t;t=(new Date).getTime(),r.onTimerEvent(e,r)},10)}},this._stopTimer=function(){window.clearInterval(e),e=0}}var e=function(t,e){return t.stime>e.stime?2:t.stime<e.stime?-2:t.date>e.date?1:t.date<e.date?-1:null!=t.dbid&&null!=e.dbid?t.dbid>e.dbid?1:t.dbid<e.dbid?-1:0:0};return t.prototype.stop=function(){this._stopTimer(),this.runline.forEach(function(t){t.stop()})},t.prototype.start=function(){this._startTimer()},t.prototype.seek=function(t){this.position=BinArray.bsearch(this.timeline,t,function(t,e){return t<e.stime?-1:t>e.stime?1:0})},t.prototype.validate=function(t){return null!=t&&this.filter.doValidate(t)},t.prototype.load=function(t){this.timeline=t,this.timeline.sort(e),this.dispatchEvent("load")},t.prototype.insert=function(t){BinArray.binsert(this.timeline,t,e)<=this.position&&this.position++,this.dispatchEvent("insert")},t.prototype.clear=function(){for(;this.runline.length>0;)this.runline[0].finish();this.dispatchEvent("clear")},t.prototype.setBounds=function(){this.width=this.stage.offsetWidth,this.height=this.stage.offsetHeight,this.dispatchEvent("resize");for(var t in this.csa)this.csa[t].setBounds(this.width,this.height);this.stage.style.perspective=this.width/Math.tan(55*Math.PI/180)/2+"px",this.stage.style.webkitPerspective=this.width/Math.tan(55*Math.PI/180)/2+"px"},t.prototype.init=function(t){if(this.setBounds(),null==this.filter&&(this.filter=new CommentFilter),null==this.factory)switch(t){case"legacy":this.factory=CommentFactory.defaultFactory();break;default:case"css":this.factory=CommentFactory.defaultCssRenderFactory()}},t.prototype.time=function(t){if(t-=1,this.position>=this.timeline.length||Math.abs(this._lastPosition-t)>=2e3){if(this.seek(t),this._lastPosition=t,this.timeline.length<=this.position)return}else this._lastPosition=t;for(;this.position<this.timeline.length&&this.timeline[this.position].stime<=t;this.position++)this.options.limit>0&&this.runline.length>this.limiter||this.validate(this.timeline[this.position])&&this.send(this.timeline[this.position])},t.prototype.rescale=function(){},t.prototype.send=function(t){if(8===t.mode)return console.log(t),void(this.scripting&&console.log(this.scripting.eval(t.code)));if(null==this.filter||null!=(t=this.filter.doModify(t))){var e=this.factory.create(this,t);switch(e.mode){default:case 1:this.csa.scroll.add(e);break;case 2:this.csa.scrollbtm.add(e);break;case 4:this.csa.bottom.add(e);break;case 5:this.csa.top.add(e);break;case 6:this.csa.reverse.add(e);break;case 7:case 17:}e.y=e.y,this.dispatchEvent("enterComment",e),this.runline.push(e)}},t.prototype.finish=function(t){this.dispatchEvent("exitComment",t),this.stage.removeChild(t.dom);var e=this.runline.indexOf(t);switch(e>=0&&this.runline.splice(e,1),t.mode){default:case 1:this.csa.scroll.remove(t);break;case 2:this.csa.scrollbtm.remove(t);break;case 4:this.csa.bottom.remove(t);break;case 5:this.csa.top.remove(t);break;case 6:this.csa.reverse.remove(t);break;case 7:}},t.prototype.addEventListener=function(t,e){void 0!==this._listeners[t]?this._listeners[t].push(e):this._listeners[t]=[e]},t.prototype.dispatchEvent=function(t,e){if(void 0!==this._listeners[t])for(var r=0;r<this._listeners[t].length;r++)try{this._listeners[t][r](e)}catch(t){console.err(t.stack)}},t.prototype.onTimerEvent=function(t,e){for(var r=0;r<e.runline.length;r++)e.runline[r].time(t)},t}(),CommentFilter=function(){function t(e,r){for(var i=e.subject.split("."),n=r;i.length>0;){var o=i.shift();if(""!==o&&(n.hasOwnProperty(o)&&(n=n[o]),null===n||void 0===n)){n=null;break}}if(null===n)return!0;switch(e.op){case"<":return n<e.value;case">":return n>e.value;case"~":case"regexp":return new RegExp(e.value).test(n.toString());case"=":case"eq":return e.value===("number"==typeof n?n:n.toString());case"NOT":return!t(e.value,n);case"AND":return!!Array.isArray(e.value)&&e.value.every(function(e){return t(e,n)});case"OR":return!!Array.isArray(e.value)&&e.value.some(function(e){return t(e,n)});default:return!1}}function e(){this.rules=[],this.modifiers=[],this.allowUnknownTypes=!0,this.allowTypes={1:!0,2:!0,4:!0,5:!0,6:!0,7:!0,8:!0,17:!0}}return e.prototype.doModify=function(t){return this.modifiers.reduce(function(t,e){return e(t)},t)},e.prototype.beforeSend=function(t){return t},e.prototype.doValidate=function(e){return!((!this.allowUnknownTypes||e.mode.toString()in this.allowTypes)&&!this.allowTypes[e.mode.toString()])&&this.rules.every(function(r){try{i=t(r,e)}catch(t){var i=!1}return"accept"===r.mode?i:!i})},e.prototype.addRule=function(t){if("accept"!==t.mode&&"reject"!==t.mode)throw new Error("Rule must be of accept type or reject type.");this.rules.push(t)},e.prototype.addModifier=function(t){if("function"!=typeof t)throw new Error("Modifiers need to be functions.");this.modifiers.push(t)},e}(),CommentProvider=function(){function t(){this._started=!1,this._destroyed=!1,this._staticSources={},this._dynamicSources={},this._parsers={},this._targets=[]}return t.SOURCE_JSON="JSON",t.SOURCE_XML="XML",t.SOURCE_TEXT="TEXT",t.BaseHttpProvider=function(t,e,r,i,n){return new Promise(function(o,s){var a=new XMLHttpRequest,h=e;if(i&&("POST"===t||"PUT"===t)){h+="?";var l=[];for(var p in i)i.hasOwnProperty(p)&&l.push(encodeURIComponent(p)+"="+encodeURIComponent(i[p]));h+=l.join("&")}a.onload=function(){this.status>=200&&this.status<300?o(this.response):s(new Error(this.status+" "+this.statusText))},a.onerror=function(){s(new Error(this.status+" "+this.statusText))},a.open(t,h),a.responseType="string"==typeof r?r:"",void 0!==n?a.send(n):a.send()})},t.JSONProvider=function(e,r,i,n){return t.BaseHttpProvider(e,r,"json",i,n).then(function(t){return t})},t.XMLProvider=function(e,r,i,n){return t.BaseHttpProvider(e,r,"document",i,n).then(function(t){return t})},t.TextProvider=function(e,r,i,n){return t.BaseHttpProvider(e,r,"text",i,n).then(function(t){return t})},t.prototype.addStaticSource=function(t,e){if(this._destroyed)throw new Error("Comment provider has been destroyed, cannot attach more sources.");return e in this._staticSources||(this._staticSources[e]=[]),this._staticSources[e].push(t),this},t.prototype.addDynamicSource=function(t,e){if(this._destroyed)throw new Error("Comment provider has been destroyed, cannot attach more sources.");return e in this._dynamicSources||(this._dynamicSources[e]=[]),this._dynamicSources[e].push(t),this},t.prototype.addTarget=function(t){if(this._destroyed)throw new Error("Comment provider has been destroyed, cannot attach more targets.");if(!(t instanceof CommentManager))throw new Error("Expected the target to be an instance of CommentManager.");return this._targets.push(t),this},t.prototype.addParser=function(t,e){if(this._destroyed)throw new Error("Comment provider has been destroyed, cannot attach more parsers.");return e in this._parsers||(this._parsers[e]=[]),this._parsers[e].unshift(t),this},t.prototype.applyParsersOne=function(t,e){return new Promise(function(r,i){if(e in this._parsers){for(var n=0;n<this._parsers[e].length;n++){var o=null;try{o=this._parsers[e][n].parseOne(t)}catch(t){console.error(t)}if(null!==o)return void r(o)}i(new Error("Ran out of parsers for they target type"))}else i(new Error('No parsers defined for "'+e+'"'))}.bind(this))},t.prototype.applyParsersList=function(t,e){return new Promise(function(r,i){if(e in this._parsers){for(var n=0;n<this._parsers[e].length;n++){var o=null;try{o=this._parsers[e][n].parseMany(t)}catch(t){console.error(t)}if(null!==o)return void r(o)}i(new Error("Ran out of parsers for the target type"))}else i(new Error('No parsers defined for "'+e+'"'))}.bind(this))},t.prototype.load=function(){if(this._destroyed)throw new Error("Cannot load sources on a destroyed provider.");var t=[];for(var e in this._staticSources)t.push(Promises.any(this._staticSources[e]).then(function(t){return this.applyParsersList(t,e)}.bind(this)));return 0===t.length?Promise.resolve([]):Promises.any(t).then(function(t){for(var e=0;e<this._targets.length;e++)this._targets[e].load(t);return Promise.resolve(t)}.bind(this))},t.prototype.start=function(){if(this._destroyed)throw new Error("Cannot start a provider that has been destroyed.");return this._started=!0,this.load().then(function(t){for(var e in this._dynamicSources)this._dynamicSources[e].forEach(function(t){t.addEventListener("receive",function(t){for(var r=0;r<this._targets.length;r++)this._targets[r].send(this.applyParserOne(t,e))}.bind(this))}.bind(this));return Promise.resolve(t)}.bind(this))},t.prototype.send=function(t,e){throw new Error("Not implemented")},t.prototype.destroy=function(){return this._destroyed?Promise.resolve():(this._destroyed=!0,Promise.resolve())},t}(),Promises=function(){var t={};return t.any=function(t){return Array.isArray(t)?0===t.length?Promise.reject():new Promise(function(e,r){for(var i=!1,n=0,o=[],s=0;s<t.length;s++)t[s].then(function(t){n++,i||(i=!0,e(t))}).catch(function(e){return function(s){n++,o[e]=s,n===t.length&&(i||r(o))}}(s))}):Promise.resolve(t)},t}(),BilibiliFormat=function(){var t={},e=function(t){return t.replace(/\t/,"\\t")},r=function(t){if("["!==t.charAt(0))return t;switch(t.charAt(t.length-1)){case"]":return t;case'"':return t+"]";case",":return t.substring(0,t.length-1)+'"]';default:return r(t.substring(0,t.length-1))}},i=function(t){return t=t.replace(new RegExp("</([^d])","g"),"</disabled $1"),t=t.replace(new RegExp("</(S{2,})","g"),"</disabled $1"),t=t.replace(new RegExp("<([^d/]W*?)","g"),"<disabled $1"),t=t.replace(new RegExp("<([^/ ]{2,}W*?)","g"),"<disabled $1")};return t.XMLParser=function(t){this._attemptFix=!0,this._logBadComments=!0,"object"==typeof t&&(this._attemptFix=!1!==t.attemptFix,this._logBadComments=!1!==t.logBadComments)},t.XMLParser.prototype.parseOne=function(t){try{var i=t.getAttribute("p").split(",")}catch(t){return null}var n=t.textContent,o={};if(o.stime=Math.round(1e3*parseFloat(i[0])),o.size=parseInt(i[2]),o.color=parseInt(i[3]),o.mode=parseInt(i[1]),o.date=parseInt(i[4]),o.pool=parseInt(i[5]),o.position="absolute",null!=i[7]&&(o.dbid=parseInt(i[7])),o.hash=i[6],o.border=!1,o.mode<7)o.text=n.replace(/(\/n|\\n|\n|\r\n)/g,"\n");else if(7===o.mode)try{this._attemptFix&&(n=e(r(n)));var s=JSON.parse(n);if(o.shadow=!0,o.x=parseFloat(s[0]),o.y=parseFloat(s[1]),(Math.floor(o.x)<o.x||Math.floor(o.y)<o.y)&&(o.position="relative"),o.text=s[4].replace(/(\/n|\\n|\n|\r\n)/g,"\n"),o.rZ=0,o.rY=0,s.length>=7&&(o.rZ=parseInt(s[5],10),o.rY=parseInt(s[6],10)),o.motion=[],o.movable=!1,s.length>=11){o.movable=!0;var a=500,h={x:{from:o.x,to:parseFloat(s[7]),dur:a,delay:0},y:{from:o.y,to:parseFloat(s[8]),dur:a,delay:0}};if(""!==s[9]&&(a=parseInt(s[9],10),h.x.dur=a,h.y.dur=a),""!==s[10]&&(h.x.delay=parseInt(s[10],10),h.y.delay=parseInt(s[10],10)),s.length>11&&(o.shadow="false"!==s[11]&&!1!==s[11],null!=s[12]&&(o.font=s[12]),s.length>14)){"relative"===o.position&&(this._logBadComments&&console.warn("Cannot mix relative and absolute positioning!"),o.position="absolute");for(var l=s[14],p={x:h.x.from,y:h.y.from},c=[],u=new RegExp("([a-zA-Z])\\s*(\\d+)[, ](\\d+)","g"),d=l.split(/[a-zA-Z]/).length-1,m=u.exec(l);null!==m;){switch(m[1]){case"M":p.x=parseInt(m[2],10),p.y=parseInt(m[3],10);break;case"L":c.push({x:{from:p.x,to:parseInt(m[2],10),dur:a/d,delay:0},y:{from:p.y,to:parseInt(m[3],10),dur:a/d,delay:0}}),p.x=parseInt(m[2],10),p.y=parseInt(m[3],10)}m=u.exec(l)}h=null,o.motion=c}null!==h&&o.motion.push(h)}o.dur=2500,s[3]<12&&(o.dur=1e3*s[3]);var f=s[2].split("-");if(null!=f&&f.length>1){var y=parseFloat(f[0]),g=parseFloat(f[1]);o.opacity=y,y!==g&&(o.alpha={from:y,to:g})}}catch(t){this._logBadComments&&(console.warn("Error occurred in JSON parsing. Could not parse comment."),console.log("[DEBUG] "+n))}else 8===o.mode?o.code=n:this._logBadComments&&(console.warn("Unknown comment type : "+o.mode+". Not doing further parsing."),console.log("[DEBUG] "+n));return null!==o.text&&"string"==typeof o.text&&(o.text=o.text.replace(/\u25a0/g,"█")),o},t.XMLParser.prototype.parseMany=function(t){var e=[];try{e=t.getElementsByTagName("d")}catch(t){return null}for(var r=[],i=0;i<e.length;i++){var n=this.parseOne(e[i]);null!==n&&r.push(n)}return r},t.TextParser=function(e){this._allowInsecureDomParsing=!0,this._attemptEscaping=!0,this._canSecureNativeParse=!1,"object"==typeof e&&(this._allowInsecureDomParsing=!1!==e.allowInsecureDomParsing,this._attemptEscaping=!1!==e.attemptEscaping),"undefined"!=typeof document&&document&&document.createElement||(this._allowInsecureDomParsing=!1),"undefined"!=typeof DOMParser&&null!==DOMParser&&(this._canSecureNativeParse=!0),(this._allowInsecureDomParsing||this._canSecureNativeParse)&&(this._xmlParser=new t.XMLParser(e))},t.TextParser.prototype.parseOne=function(t){if(this._allowInsecureDomParsing){var e=t;this._attemptEscaping&&(e=i(e));var r=document.createElement("div");r.innerHTML=e;var n=r.getElementsByTagName("d");return 1!==n.length?null:this._xmlParser.parseOne(n[0])}if(this._canSecureNativeParse){var o=new DOMParser;return this._xmlParser.parseOne(o.parseFromString(t,"application/xml"))}throw new Error("Secure native js parsing not implemented yet.")},t.TextParser.prototype.parseMany=function(t){if(this._allowInsecureDomParsing){var e=t;this._attemptEscaping&&(e=i(e));var r=document.createElement("div");return r.innerHTML=e,this._xmlParser.parseMany(r)}if(this._canSecureNativeParse){var n=new DOMParser;return this._xmlParser.parseMany(n.parseFromString(t,"application/xml"))}throw new Error("Secure native js parsing not implemented yet.")},t}(),AcfunFormat=function(){var t={};return t.JSONParser=function(t){this._logBadComments=!0,this._logNotImplemented=!1,"object"==typeof t&&(this._logBadComments=!1!==t.logBadComments,this._logNotImplemented=!0===t.logNotImplemented)},t.JSONParser.prototype.parseOne=function(t){var e={};if("object"!=typeof t||null==t||!t.hasOwnProperty("c"))return null;var r=t.c.split(",");if(r.length>=6){if(e.stime=1e3*parseFloat(r[0]),e.color=parseInt(r[1]),e.mode=parseInt(r[2]),e.size=parseInt(r[3]),e.hash=r[4],e.date=parseInt(r[5]),e.position="absolute",7!==e.mode)e.text=t.m.replace(/(\/n|\\n|\n|\r\n|\\r)/g,"\n"),e.text=e.text.replace(/\r/g,"\n"),e.text=e.text.replace(/\s/g," ");else{try{var i=JSON.parse(t.m)}catch(t){return this._logBadComments&&(console.warn("Error parsing internal data for comment"),console.log("[Dbg] "+e.text)),null}if(e.position="relative",e.text=i.n,e.text=e.text.replace(/\ /g," "),"number"==typeof i.a?e.opacity=i.a:e.opacity=1,"object"==typeof i.p?(e.x=i.p.x/1e3,e.y=i.p.y/1e3):(e.x=0,e.y=0),"number"==typeof i.c)switch(i.c){case 0:e.align=0;break;case 2:e.align=1;break;case 6:e.align=2;break;case 8:e.align=3;break;default:this._logNotImplemented&&console.log("Cannot handle aligning to center! AlignMode="+i.c)}if(e.axis=0,e.shadow=i.b,e.dur=4e3,"number"==typeof i.l&&(e.dur=1e3*i.l),null!=i.z&&i.z.length>0){e.movable=!0,e.motion=[];for(var n=0,o={x:e.x,y:e.y,alpha:e.opacity,color:e.color},s=0;s<i.z.length;s++){var a=null!=i.z[s].l?1e3*i.z[s].l:500;n+=a;var h={};i.z[s].hasOwnProperty("rx")&&"number"==typeof i.z[s].rx&&this._logNotImplemented&&console.log("Encountered animated x-axis rotation. Ignoring."),i.z[s].hasOwnProperty("e")&&"number"==typeof i.z[s].e&&this._logNotImplemented&&console.log("Encountered animated y-axis rotation. Ignoring."),i.z[s].hasOwnProperty("d")&&"number"==typeof i.z[s].d&&this._logNotImplemented&&console.log("Encountered animated z-axis rotation. Ignoring."),i.z[s].hasOwnProperty("x")&&"number"==typeof i.z[s].x&&(h.x={from:o.x,to:i.z[s].x/1e3,dur:a,delay:0}),i.z[s].hasOwnProperty("y")&&"number"==typeof i.z[s].y&&(h.y={from:o.y,to:i.z[s].y/1e3,dur:a,delay:0}),o.x=h.hasOwnProperty("x")?h.x.to:o.x,o.y=h.hasOwnProperty("y")?h.y.to:o.y,i.z[s].hasOwnProperty("t")&&"number"==typeof i.z[s].t&&i.z[s].t!==o.alpha&&(h.alpha={from:o.alpha,to:i.z[s].t,dur:a,delay:0},o.alpha=h.alpha.to),i.z[s].hasOwnProperty("c")&&"number"==typeof i.z[s].c&&i.z[s].c!==o.color&&(h.color={from:o.color,to:i.z[s].c,dur:a,delay:0},o.color=h.color.to),e.motion.push(h)}e.dur=n+(e.moveDelay?e.moveDelay:0)}i.hasOwnProperty("w")&&(i.w.hasOwnProperty("f")&&(e.font=i.w.f),i.w.hasOwnProperty("l")&&Array.isArray(i.w.l)&&i.w.l.length>0&&this._logNotImplemented&&console.log("[Dbg] Filters not supported! "+JSON.stringify(i.w.l))),null!=i.r&&null!=i.k&&(e.rX=i.r,e.rY=i.k)}return e}return this._logBadComments&&(console.warn("Dropping this comment due to insufficient parameters. Got: "+r.length),console.log("[Dbg] "+t.c)),null},t.JSONParser.prototype.parseMany=function(t){if(!Array.isArray(t))return null;for(var e=[],r=0;r<t.length;r++){var i=this.parseOne(t[r]);null!==i&&e.push(i)}return e},t.TextParser=function(e){this._jsonParser=new t.JSONParser(e)},t.TextParser.prototype.parseOne=function(t){try{return this._jsonParser.parseOne(JSON.parse(t))}catch(t){return console.warn(t),null}},t.TextParser.prototype.parseMany=function(t){try{return this._jsonParser.parseMany(JSON.parse(t))}catch(t){return console.warn(t),null}},t}(),CommonDanmakuFormat=function(){var t={},e=function(t){return"number"==typeof t.mode&&"number"==typeof t.stime&&((8!==t.mode||"string"==typeof t.code)&&"string"==typeof t.text)};return t.JSONParser=function(){},t.JSONParser.prototype.parseOne=function(t){return e(t)?t:null},t.JSONParser.prototype.parseMany=function(t){return t.every(e)?t:null},t.XMLParser=function(){},t.XMLParser.prototype.parseOne=function(t){var e={};try{e.stime=parseInt(t.getAttribute("stime")),e.mode=parseInt(t.getAttribute("mode")),e.size=parseInt(t.getAttribute("size")),e.color=parseInt(t.getAttribute("color")),e.text=t.textContent}catch(t){return null}return e},t.XMLParser.prototype.parseMany=function(t){try{var e=t.getElementsByTagName("comment")}catch(t){return null}for(var r=[],i=0;i<e.length;i++){var n=this.parseOne(e[i]);null!==n&&r.push(n)}return r},t}();

function isMobile(){var e,t=!1;return e=navigator.userAgent||navigator.vendor||window.opera,(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(e)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(e.substr(0,4)))&&(t=!0),t}var CommentLoader=function(){function t(){this.parseOne=function(){throw new Error("Not Implemented")},this.parseMany=function(){throw new Error("Not Implemented")}}function e(e){this._commentManager=e,this._responseType="text/xml",this._parser=new t}var a=["text/xml","text/plain","application/json"];return e.prototype.setParser=function(e){return this._parser=e,this},e.prototype.setType=function(e){if(a.indexOf(e)<0)throw new Error("Unknown type: "+e);return this._responseType=e,this},e.prototype._fetch=function(e,t){return fetch(t,{method:e}).then(function(e){if(!e.ok)throw new Error("HTTP error, status = "+e.status);if("application/json"===this._responseType)return e.json();if("text/plain"===this._responseType)return e.text();if("text/xml"===this._responseType)return e.text().then(function(e){return(new DOMParser).parseFromString(e,this._responseType)}.bind(this));throw new Error("Unrecognized response type")}.bind(this))},e.prototype.load=function(e,a){return new Promise(function(e,t){e((new DOMParser).parseFromString(a,"text/xml"))}).then(function(e){return this._parser.parseMany(e)}.bind(this)).then(function(e){this._commentManager.load(e)}.bind(this)).catch(function(e){alert(e)})},e}(),ABP={version:"0.8.0"};!function(){"use strict";if(ABP){var x=function(e,t,a,n){var i=null;if("text"===e)return document.createTextNode(t);for(var r in i=document.createElement(e),t)if("style"!==r&&"className"!==r)i.setAttribute(r,t[r]);else if("className"===r)i.className=t[r];else for(var o in t.style)i.style[o]=t.style[o];if(a)for(var s=0;s<a.length;s++)null!=a[s]&&i.appendChild(a[s]);return n&&"function"==typeof n&&n(i),i},P=function(e,t){return null!=e&&0<=e.className.split(" ").indexOf(t)},B=function(e,t){var a={};for(var n in t)e&&void 0!==e[n]?a[n]=e[n]:a[n]=t[n];return a};ABP.create=function(e,t){var a,n=e;if(t=B(t=t||{},{replaceMode:!0,width:512,height:384,src:"",mobile:!1}),"string"==typeof e&&(a=e,n=document.getElementById(a)),P(n,"ABP-Unit"))i=n;else{var i=x("div",{className:"ABP-Unit",style:{width:t.width+"px",height:t.height+"px"}});n.appendChild(i)}0<i.children.length&&t.replaceMode&&(i.innerHTML="");var r=[],o=[];if("string"==typeof t.src)t.src=x("video",{autobuffer:"true",dataSetup:"{}"},[x("source",{src:t.src})]),r.push(t.src);else if(t.src.hasOwnProperty("playlist"))for(var s=t.src.playlist,l=0;l<s.length;l++){if(s[l].hasOwnProperty("sources")){var d=[];for(var c in s[l].sources)d.push(x("source",{src:s[l].sources[c],type:c}));r.push(x("video",{autobuffer:"true",dataSetup:"{}"},d))}else s[l].hasOwnProperty("video")?r.push(s[l].video):console.log("No recognized format");o.push(s[l].comments)}else r.push(t.src);i.appendChild(x("div",{className:"ABP-Video",tabindex:"10"},[x("div",{className:"ABP-Container"}),r[0]])),i.appendChild(x("div",{className:"ABP-Text"},[x("input",{type:"text"})])),i.appendChild(x("div",{className:"ABP-Control"},[x("div",{className:"button ABP-Play"}),x("div",{className:"progress-bar"},[x("div",{className:"bar dark"}),x("div",{className:"bar"})]),x("div",{className:"button ABP-CommentShow"}),x("div",{className:"button ABP-FullScreen"})]));var u=ABP.bind(i,t.mobile);if(0<r.length){u.loader=new CommentLoader(u.cmManager).setParser(new BilibiliFormat.XMLParser);var m=r[0];u.gotoNext=function(){var e=r.indexOf(m)+1;if(e<r.length){(m=r[e]).style.display="";var t=u.video.parentNode;t.removeChild(u.video),t.appendChild(m),u.video.style.display="none",u.video=m,u.swapVideo(m),m.addEventListener("ended",function(){u.gotoNext()})}e<o.length&&null!==o[e]&&u.loader.load("GET",o[e])},m.addEventListener("ended",function(){u.gotoNext()}),0<o.length&&u.loader.load("GET",o[0])}return u},ABP.load=function(e,t,a,n){},ABP.bind=function(n,e,t){var o={btnPlay:null,barTime:null,barLoad:null,divComment:null,btnFull:null,btnDm:null,video:null,divTextField:null,txtText:null,cmManager:null,defaults:{w:0,h:0},state:B(t,{fullscreen:!1,commentVisible:!0,allowRescale:!1,autosize:!1}),createPopup:function(e,t){if(!0===n.hasPopup)return!1;var a=x("div",{className:"ABP-Popup"},[x("text",e)]);return a.remove=function(){a.isRemoved||(a.isRemoved=!0,n.removeChild(a),n.hasPopup=!1)},n.appendChild(a),n.hasPopup=!0,"number"==typeof t&&setTimeout(function(){a.remove()},t),a},removePopup:function(){for(var e=n.getElementsByClassName("ABP-Popup"),t=0;t<e.length;t++)null!=e[t].remove?e[t].remove():e[t].parentNode.removeChild(e[t]);n.hasPopup=!1},swapVideo:null};if(o.swapVideo=function(e){e.addEventListener("timeupdate",function(){b||(o.barTime.style.width=e.currentTime/e.duration*100+"%")}),e.addEventListener("ended",function(){o.btnPlay.className="button ABP-Play",o.barTime.style.width="0%"}),e.addEventListener("progress",function(){if(null!=this.buffered){try{this.buffered.start(0);var e=this.buffered.end(0)}catch(e){return}var t=e/this.duration*100;o.barLoad.style.width=t+"%"}}),e.addEventListener("loadedmetadata",function(){if(null!=this.buffered){try{this.buffered.start(0);var e=this.buffered.end(0)}catch(e){return}var t=e/this.duration*100;o.barLoad.style.width=t+"%"}}),e.isBound=!0;var t=0;o.cmManager&&(o.cmManager.clear(),e.addEventListener("progress",function(){t==e.currentTime?(e.hasStalled=!0,o.cmManager.stop()):t=e.currentTime}),window&&window.addEventListener("resize",function(){o.cmManager.setBounds()}),e.addEventListener("timeupdate",function(){!1!==o.cmManager.display&&(e.hasStalled&&(o.cmManager.start(),e.hasStalled=!1),o.cmManager.time(Math.floor(1e3*e.currentTime)))}),e.addEventListener("play",function(){o.cmManager.start();try{var e=this.buffered.end(0)/this.duration*100;o.barLoad.style.width=e+"%"}catch(e){}}),e.addEventListener("ratechange",function(){null!=o.cmManager.def.globalScale&&0!==e.playbackRate&&(o.cmManager.def.globalScale=1/e.playbackRate,o.cmManager.rescale())}),e.addEventListener("pause",function(){o.cmManager.stop()}),e.addEventListener("waiting",function(){o.cmManager.stop()}),e.addEventListener("playing",function(){o.cmManager.start()}))},null!==n&&null!==n.getElementsByClassName){o.defaults.w=n.offsetWidth,o.defaults.h=n.offsetHeight;var a=n.getElementsByClassName("ABP-Video");if(!(a.length<=0)){var i=null;for(var r in a[0].children)if(null!=a[0].children[r].tagName&&"VIDEO"===a[0].children[r].tagName.toUpperCase()){i=a[0].children[r];break}a[0]&&e&&(a[0].style.bottom="0px");var s=a[0].getElementsByClassName("ABP-Container");if(0<s.length&&(o.divComment=s[0]),null!==i){o.video=i;var l=n.getElementsByClassName("ABP-Play");if(!(l.length<=0)){o.btnPlay=l[0];var d=n.getElementsByClassName("progress-bar");if(!(d.length<=0)){o.barHitArea=d[0];var c=d[0].getElementsByClassName("bar");o.barTime=c[0],o.barLoad=c[1];var u=n.getElementsByClassName("ABP-FullScreen");if(!(u.length<=0)){o.btnFull=u[0];var m=n.getElementsByClassName("ABP-Text");if(0<m.length){o.divTextField=m[0];var p=m[0].getElementsByTagName("input");0<p.length&&(o.txtText=p[0])}var v=n.getElementsByClassName("ABP-CommentShow");if(0<v.length&&(o.btnDm=v[0]),"undefined"!=typeof CommentManager&&(o.cmManager=new CommentManager(o.divComment),o.cmManager.display=!0,o.cmManager.init(),o.cmManager.clear(),window&&window.addEventListener("resize",function(){o.cmManager.setBounds()})),e){var h=n.getElementsByClassName("ABP-Control");0<h.length&&(o.controlBar=h[0]);var f=-1,g=function(){o.controlBar.style.display="none",o.divTextField.style.display="none",o.divComment.style.bottom="0px",o.cmManager.setBounds()};o.divComment.style.bottom=o.controlBar.offsetHeight+o.divTextField.offsetHeight+"px";var y=function(){o.controlBar.style.display="",o.divTextField.style.display="",o.divComment.style.bottom=o.controlBar.offsetHeight+o.divTextField.offsetHeight+"px";try{-1!=f&&(clearInterval(f),f=-1),f=setInterval(function(){document.activeElement!==o.txtText&&(g(),clearInterval(f),f=-1)},2500)}catch(e){console.log(e)}};n.addEventListener("touchmove",y),n.addEventListener("mousemove",y),f=setTimeout(function(){g()},4e3)}if(!0!==i.isBound){o.swapVideo(i),o.btnFull.addEventListener("click",function(){o.state.fullscreen=P(n,"ABP-FullScreen"),(o.state.fullscreen?function(e,t){if(null!=e){var a=e.className.split(" ");0<=a.indexOf(t)&&a.splice(a.indexOf(t),1),e.className=a.join(" ")}}:function(e,t){if(null!=e){var a=e.className.split(" ");a.indexOf(t)<0&&a.push(t),e.className=a.join(" ")}})(n,"ABP-FullScreen"),o.state.fullscreen=!o.state.fullscreen,o.cmManager&&o.cmManager.setBounds(),o.state.allowRescale&&(o.state.fullscreen?0<o.defaults.w&&(o.cmManager.def.scrollScale=n.offsetWidth/o.defaults.w):o.cmManager.def.scrollScale=1)}),o.btnDm.addEventListener("click",function(){0==o.cmManager.display?(o.cmManager.display=!0,o.cmManager.start()):(o.cmManager.display=!1,o.cmManager.clear(),o.cmManager.stop())});var b=!(o.barTime.style.width="0%");o.barHitArea.addEventListener("mousedown",function(e){b=!0}),document.addEventListener("mouseup",function(e){b=!1}),o.barHitArea.addEventListener("mouseup",function(e){b=!1;var t=e.layerX/this.offsetWidth*o.video.duration;4<Math.abs(t-o.video.currentTime)&&o.cmManager&&o.cmManager.clear(),o.video.currentTime=t}),o.barHitArea.addEventListener("mousemove",function(e){b&&(o.barTime.style.width=100*e.layerX/this.offsetWidth+"%")}),o.btnPlay.addEventListener("click",function(){o.video.paused?(o.video.play(),this.className="button ABP-Play ABP-Pause"):(o.video.pause(),this.className="button ABP-Play")}),n.addEventListener("keydown",function(e){e&&32==e.keyCode&&document.activeElement!==o.txtText&&(o.btnPlay.click(),e.preventDefault())}),n.addEventListener("touchmove",function(e){event.preventDefault()});var M=null;n.addEventListener("touchstart",function(e){0<e.targetTouches.length&&(M=e.targetTouches[0])}),n.addEventListener("touchend",function(e){if(0<e.changedTouches.length&&null!=M){var t=e.changedTouches[0].pageX-M.pageX,a=e.changedTouches[0].pageY-M.pageY;if(Math.abs(t)<20&&Math.abs(a)<20)return void(M=null);Math.abs(t)>3*Math.abs(a)?0<t?o.video.paused&&o.btnPlay.click():o.video.paused||o.btnPlay.click():Math.abs(a)>3*Math.abs(t)&&(o.video.volume=a<0?Math.min(1,o.video.volume+.1):Math.max(0,o.video.volume-.1)),M=null}})}if(null!==o.txtText&&o.txtText.addEventListener("keyup",function(e){if(null!=this.value)if(/^!/.test(this.value)?this.style.color="#5DE534":this.style.color="",null!=e&&13===e.keyCode){if(""==this.value)return;if(/^!/.test(this.value)){var t=this.value.substring(1).split(":");switch(t.shift()){case"help":o.createPopup("提示信息：",2e3);break;case"speed":case"rate":case"spd":if(t.length<1)o.createPopup("速度调节：输入百分比【 1% - 300% 】",2e3);else{var a=parseInt(t[0]);if(NaN!=a){var n=Math.min(Math.max(a,1),300);o.video.playbackRate=n/100}null!==o.cmManager&&o.cmManager.clear()}break;case"off":o.cmManager.display=!1,o.cmManager.clear(),o.cmManager.stop();break;case"on":o.cmManager.display=!0,o.cmManager.start();break;case"cls":case"clear":null!==o.cmManager&&o.cmManager.clear();break;case"pp":case"pause":o.video.pause();break;case"p":case"play":o.video.play();break;case"vol":case"volume":if(0==t.length)o.createPopup("目前音量："+Math.round(100*o.video.volume)+"%",2e3);else{var i=parseInt(t[0]);null!==i&&NaN!==i&&(o.video.volume=Math.max(Math.min(i,100),0)/100),o.createPopup("目前音量："+Math.round(100*o.video.volume)+"%",2e3)}}}}else if(null!=e&&38===e.keyCode)if(e.shiftKey){if(null!==o.cmManager){var r=Math.min(Math.round(100*o.cmManager.def.opacity)+5,100);o.cmManager.def.opacity=r/100,o.removePopup();o.createPopup("弹幕透明度："+Math.round(r)+"%",800)}}else{o.video.volume=Math.round(Math.min(100*o.video.volume+5,100))/100,o.removePopup();o.createPopup("目前音量："+Math.round(100*o.video.volume)+"%",800)}else if(null!=e&&40===e.keyCode)if(e.shiftKey){if(null!==o.cmManager){r=Math.max(Math.round(100*o.cmManager.def.opacity)-5,0);o.cmManager.def.opacity=r/100,o.removePopup();o.createPopup("弹幕透明度："+Math.round(r)+"%",800)}}else{o.video.volume=Math.round(Math.max(100*o.video.volume-5,0))/100,o.removePopup();o.createPopup("目前音量："+Math.round(100*o.video.volume)+"%",800)}}),"undefined"!=typeof CommentManager&&o.state.autosize){var w=function(){if(0!==i.videoHeight&&0!==i.videoWidth){var e=i.videoHeight/i.videoWidth,t=n.offsetWidth,a=n.offsetHeight;a/t<e?(n.style.width=a/e+"px",n.style.height=a+"px"):(n.style.width=t+"px",n.style.height=t*e+"px"),o.cmManager.setBounds()}};i.addEventListener("loadedmetadata",w),w()}return o}}}}}}}}}();



//entry
function init(){
    debug("init");
    if(!window.location.href.includes("v.anime1.me")&&!window.location.href.includes("i.animeone.me")){
        //in here clear value , because maybe need open frame in tab
        GM_setValue("DanmakuLink", null);
        GM_setValue("DanmakuLinkTucao", null);
        GM_setValue("danmakuSource", null);

    }
    if(window.location.href.includes("bilibili.com")){
        DisplayInput('');
        CreateButton('Detect cid',function () {
            var cid;
            if(window.location.href.includes("bangumi")){
                title=unsafeWindow.__INITIAL_STATE__.h1Title;
                EpisodeCurrent=unsafeWindow.__INITIAL_STATE__.epInfo.titleFormat;
                cid=unsafeWindow.__INITIAL_STATE__.epInfo.cid;
            }
            else if(window.location.href.includes("av")){
                title=unsafeWindow.__INITIAL_STATE__.videoData.title;
                var EpisodeMatched=window.location.href.match(/\?p=(\d{1,2})/);
                if(EpisodeMatched!=null){
                    var EpisodeNum=parseInt(EpisodeMatched[1]);
                    EpisodeCurrent=unsafeWindow.__INITIAL_STATE__.videoData.pages[EpisodeNum-1].part;
                    cid=unsafeWindow.__INITIAL_STATE__.videoData.pages[EpisodeNum-1].cid;
                }
                else{
                    EpisodeCurrent=unsafeWindow.__INITIAL_STATE__.videoData.pages[0].part;
                    cid=unsafeWindow.__INITIAL_STATE__.videoData.pages[0].cid;

                }

            }
            var href="[bilibili] ["+title+"] ["+EpisodeCurrent+"] - https://api.bilibili.com/x/v1/dm/list.so?oid="+cid;
            debug("DanmakuLink: "+href);
            input.value=href;

        });
    }
    else if(window.location.href.includes("acfun.cn")){
        DisplayInput('');
        CreateButton('Detect vid',function () {
            var vid;
            if(window.location.href.includes("bangumi")){
                vid=unsafeWindow.pageInfo.videoId;
                title=unsafeWindow.pageInfo.bangumiTitle;
                EpisodeCurrent=unsafeWindow.pageInfo.episodeName;
            }
            else{
                title=unsafeWindow.pageInfo.title;
                vid=unsafeWindow.pageInfo.currentVideoId;
            }
            var href="[acfun] ["+title+"] ["+EpisodeCurrent+"] - http://danmu.aixifan.com/V2/" + vid + "?pageSize=500&pageNo=1";
            debug("DanmakuLink: "+href);
            input.value=href;

        });
    }
    else if(window.location.href.match(/^https:\/\/anime1\.me\/\d*$/)){
            DisplayInput(InputPlaceholder);

            /*CreateButton('Search in bilibili',function () {
                SearchBilibili();
            });*/
            var btn=CreateButton('Search Danmaku',function () {
                if(input.value==""&&datalist==null){
                    input.value="Searching...";
                    btn.innerHTML="Searching...";
                    title=document.querySelector("h1.entry-title");
                    var array=title.innerText.match(/(.*)\s\[(\d*)\]/);
                    title=array[1];
                    EpisodeCurrent=array[2];
                    bahamut();
                    var CheckValue=setInterval(function () {
                        if(SearchFinished&&input.value.match(matching)){
                            btn.innerHTML='Load Player';
                            clearInterval(CheckValue);
                        }
                        else if(input.value=="Search Result: All Failed."){
                            btn.innerHTML='Search Failed';
                            clearInterval(CheckValue);

                        }
                    },2000);
                }
                else if((input.value.match(matching)!=null||input.value.match(MatchingWithTitle))&&(datalist==null||SearchFinished)) {
                    var ManualInput=input.value.match(MatchingWithTitle);
                    if(ManualInput!=null){
                        title=ManualInput[1];
                        EpisodeCurrent=ManualInput[2].match(/(\d{1,4})/)[1];
                        debug('title: '+title+'&EpisodeCurrent: '+EpisodeCurrent);
                    }
                    if(input.value.includes('tucao.one')){
                        GM_setValue("DanmakuLinkTucao", null);
                        TucaoStatus=3;
                    }
                    GM_setValue("DanmakuLink", input.value);
                    btn.innerHTML="Done";
                    DanmakuDownloaderInit();
                }
            });
        }
    else if(window.location.href.includes("i.animeone.me")){
        var CheckValue=setInterval(function () {
            var ret=GetDanmaku(animeone);
            if(ret){
                clearInterval(CheckValue);
            }
        },5000);
    }
    else if(window.location.href.includes("v.anime1.me")){
        var CheckValue=setInterval(function () {
            var ret=GetDanmaku(anime1);
            if(ret){
                clearInterval(CheckValue);
            }
        },5000);
    }
    else if(window.location.href.includes("video.eyny.com")) {
        DisplayInput(InputPlaceholderSearch);
        var btn=CreateButton('Search Danmaku',function () {
            //title input correct
            if(input.value.match(/^(.*) (\d{1,4})$/)!=null){
                var arr=input.value.match(/(.*) (\d{1,4})/);
                input.value="Searching...";
                btn.innerHTML="Searching...";
                title=arr[1];
                debug("title: "+title);
                EpisodeCurrent=arr[2];
                debug("EpisodeCurrent: "+EpisodeCurrent);
                bahamut();
                var CheckValue=setInterval(function () {
                    //search success
                    if(SearchFinished&&input.value.match(matching)){
                        btn.innerHTML='Load Player';
                        clearInterval(CheckValue);
                    }
                    else if(input.value=="Search Result: All Failed."){
                        btn.innerHTML='Search Failed';
                        clearInterval(CheckValue);

                    }
                },2000);
            }
            //input has correct url
            else if((input.value.match(matching)!=null||input.value.match(MatchingWithTitle))&&(datalist==null||SearchFinished)&&abp==null) {
                var ManualInput=input.value.match(MatchingWithTitle);
                if(ManualInput!=null){
                    title=ManualInput[1];
                    EpisodeCurrent=ManualInput[2].match(/(\d{1,4})/)[1];
                    debug('title: '+title+'&EpisodeCurrent: '+EpisodeCurrent);
                }
                if(input.value.includes('tucao.one')){
                    TucaoStatus=3;
                }
                GetDanmaku(eyny);
                GM_setValue("DanmakuLink", input.value);
                btn.innerHTML='Player loading...';
                var CheckValue=setInterval(function () {
                    if(abp!=null){
                        btn.innerHTML='Done';
                        clearInterval(CheckValue);
                    }
                },2000);
                DanmakuDownloaderInit();

            }
        });
        input.addEventListener("mouseover",function () {
                input.setAttribute('placeholder','Search format example: 歌舞伎町夏洛克 07');
        });
            input.addEventListener("mouseout",function () {
                    input.setAttribute('placeholder',InputPlaceholderSearch);

            });

    }
    else if(window.location.href.includes("www.tucao.one")) {
        DisplayInput(InputPlaceholder);
        var btn=CreateButton('Search Danmaku',function () {
            //first time search
            if(input.value==""&&datalist==null){
                input.value="Searching...";
                btn.innerHTML="Searching...";
                title=document.querySelector("h1.show_title").textContent;
                var array=title.match(/【.*】(.*)\s(\d{1,4})/);
                title=array[1];
                debug("title: "+title);
                EpisodeCurrent=array[2];
                bahamut();
                var CheckValue=setInterval(function () {
                    //search success
                    if(SearchFinished&&input.value.match(matching)){
                        btn.innerHTML='Load Player';
                        clearInterval(CheckValue);
                    }
                    else if(input.value=="Search Result: All Failed."){
                        btn.innerHTML='Search Failed';
                        clearInterval(CheckValue);

                    }
                },2000);
            }
            //input has correct url
            else if((input.value.match(matching)!=null||input.value.match(MatchingWithTitle))&&(datalist==null||SearchFinished)&&abp==null) {
                if(title==null){
                    var ManualInput=input.value.match(MatchingWithTitle);
                    if(ManualInput!=null){
                        title=ManualInput[1];
                        EpisodeCurrent=ManualInput[2].match(/(\d{1,4})/)[1];
                        debug('title: '+title+'&EpisodeCurrent: '+EpisodeCurrent);
                    }

                }
                if(input.value.includes('tucao.one')){
                    TucaoStatus=3;
                }
                GetDanmaku(TucaoAlternate);
                GM_setValue("DanmakuLink", input.value);
                btn.innerHTML='Player loading...';
                var CheckValue=setInterval(function () {
                    if(abp!=null){
                        btn.innerHTML='Done';
                        clearInterval(CheckValue);
                    }
                },2000);
                DanmakuDownloaderInit();
            }
        });
        var play_ren=document.querySelector("#play_ren");
        play_ren.insertBefore(input.parentElement,play_ren.firstChild);
    }
    else if(window.location.href.match(/^https:\/\/anime1\.me\/\d*#comment$/)){
        document.querySelector("#dcl_comment_btn").click();
    }
}



//replace Player
function eyny(comments){
    debug("eyny");
    var VideoContainer = document.querySelector("#video_container");
    var width=parseInt(VideoContainer.style.width.match(/(\d{1,4})/)[1])-20;
    var height=parseInt(VideoContainer.style.height.match(/(\d{1,4})/)[1])-20;
    debug("width: "+width+" &height: "+height);
    VideoContainer.style.width=width+"px";
    VideoContainer.style.height=height+"px";
    var fixwidth = document.querySelector("div.fixwidth");
    var div=document.querySelector("div");
    var video = VideoContainer.querySelector("#mediaplayer");
    var object = new ObjectABP(VideoContainer, video, comments, width, height);
        ABP_Init(object);
        var ABP_Unit = VideoContainer.querySelector("div.ABP-Unit");
        var ButtonFullscreen_ABP = ABP_Unit.querySelector("div.button.ABP-FullScreen");
        ButtonFullscreen_ABP.addEventListener("click", function () {
            setTimeout(function () {
                debug("Fullscreen");
                video.style = "width:100%!important; height:100%!important;"
                debug("video.style.height: " + video.style.height);
                VideoContainer.style.width = width + "px";
                VideoContainer.style.height = height + "px";
                if (fixwidth.style == "display:none;") {
                    fixwidth.style = "display:block;";
                    div.style = "display:block;";

                }
                else {
                    fixwidth.style = "display:none;";
                    div.style = "display:none;";

                }
            }, 500);
        });
}

function anime1(comments){
    debug("anime1");
    var VideoContainer = document.querySelector("#player");
    var video = VideoContainer.querySelector("video.jw-video.jw-reset");
    var rewind=VideoContainer.querySelector("div.jw-icon.jw-icon-rewind.jw-button-color.jw-reset");
    var display=VideoContainer.querySelector("div.jw-icon.jw-icon-display.jw-button-color.jw-reset");
    rewind.style.display="none";
    display.style.display="none";
    var object = new ObjectABP(VideoContainer, video, comments, 640,360);
            ABP_Init(object);
            var ABP_Unit=VideoContainer.querySelector("div.ABP-Unit");
            VideoContainer.insertBefore(ABP_Unit,VideoContainer.firstChild);
            var ButtonFullscreen_ABP=ABP_Unit.querySelector("div.button.ABP-FullScreen");
            var ButtonFullscreen_Anime1=VideoContainer.querySelector("div.jw-icon.jw-icon-inline.jw-button-color.jw-reset.jw-icon-fullscreen");
            ButtonFullscreen_Anime1.addEventListener("mousedown",function (){
                debug("Fullscreen");
                ButtonFullscreen_ABP.click();
            });
            for(var Class of VideoContainer.classList){
                VideoContainer.classList.toggle(Class,false);
            }
}

function animeone(comments) {
    debug("animeone");
    var VideoContainer=document.querySelector("body");
    var video=VideoContainer.querySelector("#player_html5_api");
    var object=new ObjectABP(VideoContainer,video,comments,640,360);
    ABP_Init(object);

}

function TucaoAlternate(comments) {
    debug("Tucao");
    var VideoContainer=document.querySelector("#play_ren");
    var video=VideoContainer.querySelector("video.dplayer-video.dplayer-video-current");
    var OriginPlayer=VideoContainer.querySelector("#player");
    OriginPlayer.style.display="none";
    var object=new ObjectABP(VideoContainer,video,comments,964,556);
        ABP_Init(object);

        var ABP_Unit = VideoContainer.querySelector("div.ABP-Unit");
        document.querySelector("#show_share").style.display = "none";
        document.querySelector("div.footer").style.display = "none";
}



//search danmaku
function bahamut(){
    var _title=CheckAlias('ani.gamer.com.tw',title);
    var href="https://ani.gamer.com.tw/search.php?kw="+encodeURIComponent(simplized(_title,"s2t"));
    var search=new ObjectRequest(href);
    var SearchResult;
    if(datalist==null) {
        datalist = document.createElement("datalist");
        datalist.id = "result";
        input.parentElement.insertBefore(datalist, null);
        input.setAttribute("list", "result");
    }
    request(search,function (responseDetails) {
        var responseText=responseDetails.responseText;
        var dom = new DOMParser().parseFromString(responseText, "text/html");
        var anime_list=dom.querySelector("ul.anime_list");
        if(anime_list==null||anime_list.classList.length>1){
            SearchResult ="Search Result: [Bahamut] Failed.";
            InsertOption( SearchResult);
            bilibili();
        }
        else {
            var li = anime_list.querySelector("li");
            var animelook = li.querySelector("a.animelook");
            var SearchResultTitle=animelook.nextElementSibling.firstChild.innerText;
            href = animelook.href;
            href = href.replace(/https?:\/\/.*\/(animeRef\.php\?sn=\d*)$/, function(match, $1, $2, offset, original){ return 'https://ani.gamer.com.tw/'+$1;})
            debug(href);
            danmakuSource['bahamut']=href;
            var GetAnime = new ObjectRequest(href);
            request(GetAnime, function (responseDetails) {
                responseText = responseDetails.responseText;
                dom = new DOMParser().parseFromString(responseText, "text/html");
                var season = dom.querySelector("section.season");
                if (season == null) {
                    href = responseDetails.finalUrl;
                    debug(href);
                    SearchResult ="Search Result: [Bahamut] Failed.";
                }
                else {
                    var anime_name=dom.querySelector("div.anime_name").firstChild.innerText;
                    var episodes = season.querySelectorAll("li");
                    for (var episode of episodes) {
                        //debug("episode.innerHTML: "+episode.innerHTML);
                        //debug("episode: "+parseInt(episode.innerText)+"; EpisodeCurrent: "+parseInt(EpisodeCurrent));
                        if (parseInt(episode.innerText.match(/(\d{1,4})/)[1]) == parseInt(EpisodeCurrent)) {
                            href = episode.firstChild.href;
                            href = href.replace(/https?:\/\/.*\/(\?sn=\d*)$/, function(match, $1, $2, offset, original){ return 'https://ani.gamer.com.tw/animeVideo.php'+$1;})
                            debug(href);
                            SearchResult = "Search Result: [Bahamut] [" + SearchResultTitle + "] ["+episode.innerText + "] - " + href;
                        }
                    }
                }
                InsertOption( SearchResult);
                bilibili();
            });
        }
    });
}

function bilibili() {
    var _title=CheckAlias('search.bilibili.com',title);
    var href="https://search.bilibili.com/bangumi?keyword="+encodeURIComponent(simplized(_title));
    var search=new ObjectRequest(href);
    var SearchResult;
    request(search,function (responseDetails) {
        var responseText=responseDetails.responseText;
        var dom = new DOMParser().parseFromString(responseText, "text/html");
        var bangumi_items=dom.querySelectorAll("li.bangumi-item");
        if(bangumi_items.length==0){
            SearchResult ="Search Result: [Bilibili] Failed."
            InsertOption( SearchResult);
            TucaoSearch();
            //acfun();
        }
        else {
            var bangumi_item;
            var SearchResultTitle;
            for(bangumi_item of bangumi_items){
                SearchResultTitle=bangumi_item.querySelector("a.title").getAttribute("title");
                if(!(SearchResultTitle.includes("僅限"))||bangumi_items.length==1){
                    break;
                }
            }
            href=bangumi_item.querySelector("a").href;
            danmakuSource['bilibili']=href;
            var GetAnime=new ObjectRequest(href);
            request(GetAnime,function (responseDetails) {
                responseText=responseDetails.responseText;
                dom = new DOMParser().parseFromString(responseText, "text/html");
                var __INITIAL_STATE__=dom.querySelectorAll("script")[5];
                __INITIAL_STATE__=__INITIAL_STATE__.innerText.match(/window\.__INITIAL_STATE__=([^;]*)/)[1];
                __INITIAL_STATE__=JSON.parse(__INITIAL_STATE__);
                debug(__INITIAL_STATE__);
                var cid;
                for(var epInfo of __INITIAL_STATE__.epList){
                    //debug(parseInt(epInfo.title.match(/(\d{1,4})/)[1])+" & "+parseInt(EpisodeCurrent));
                    if(epInfo.title.match(/(\d{1,4})/)!=null){
                        if(parseInt(epInfo.title.match(/(\d{1,4})/)[1]) == parseInt(EpisodeCurrent)){
                            cid=epInfo.cid;
                            var href="https://api.bilibili.com/x/v1/dm/list.so?oid="+cid;
                            SearchResult = "Search Result: [Bilibili] ["+SearchResultTitle+ "] ["+epInfo.title+"] - "+href;
                            break;
                        }

                    }
                    else if(epInfo==__INITIAL_STATE__.epList[__INITIAL_STATE__.epList.length-1]){
                        SearchResult ="Search Result: [Bilibili] Failed."

                    }

                }
                InsertOption( SearchResult);
                TucaoSearch();
                //acfun();
            });
        }
    });

}

function TucaoSearch() {
    debug('TucaoSearch')
    var _title=CheckAlias('www.tucao.one',title);
    var href="https://www.tucao.one/index.php?m=search&c=index&a=init2&catid=24&time=all&order=inputtime&username=&tag=&q="+encodeURIComponent(simplized(_title)+" "+EpisodeCurrent);
    var search=new ObjectRequest(href);
    var SearchResult;
    request(search,function (responseDetails) {
        var responseText=responseDetails.responseText;
        var dom = new DOMParser().parseFromString(responseText, "text/html");
        var search_list=dom.querySelector("div.search_list");
        if(search_list==null){
            SearchResult ="Search Result: [Tucao] Failed."
            InsertOption( SearchResult);
            acfun();
            if(PushEnable){
                messages.push(['[Error] tucao.one search failed, "!dm" unavailable.',5000,null]);
                TucaoStatus=2;

            }
        }
        else {
            var bangumi_item=search_list.querySelector("div.list");
            href=bangumi_item.querySelector("a").href;
            danmakuSource['tucao']=href;

            var GetAnime=new ObjectRequest(href);
            request(GetAnime,function (responseDetails) {
                    responseText=responseDetails.responseText;
                    dom = new DOMParser().parseFromString(responseText, "text/html");
                    var player_code=dom.querySelector("#player_code");
                    var cid=player_code.querySelectorAll("li")[1].innerText+"-0";
                    debug("cid: "+cid);
                    var href="https://www.tucao.one/index.php?m=mukio&c=index&a=init&playerID="+cid;
                    var SearchResultTitle=dom.querySelector("h1.show_title").textContent;
                    var array=SearchResultTitle.match(/【.*】(.*)\s(\d{1,4})/);
                    SearchResultTitle=array[1];
                    var episode=array[2];
                    SearchResult = "Search Result: [Tucao] ["+SearchResultTitle+"] ["+episode+"] - "+href;
                InsertOption( SearchResult);
                acfun();
                GM_setValue('DanmakuLinkTucao',href);
                if(PushEnable){

                    messages.push(['[Notice] tucao.one search success, "!dm" available.',5000,null]);

                    TucaoStatus=1;
                }
            });
        }
    });

}

function acfun(){
    var _title=CheckAlias('www.acfun.cn',title);
    var href="https://www.acfun.cn/rest/pc-direct/search/bgm?keyword="+encodeURIComponent(simplized(_title))+"&pCursor=1&requestId=";
    var search=new ObjectRequest(href);
    var SearchResult;

    request(search,function (responseDetails) {
        var responseText=responseDetails.responseText;
        var json=JSON.parse(responseText);
        if(json.bgmList==undefined){

            SearchResult ="Search Result: [Acfun] Failed."
            InsertDropDown();
            InsertOption( SearchResult);
        }
        else {
            href = "https://www.acfun.cn/bangumi/aa"+json.bgmList[0].id;
            debug(href);
            danmakuSource['acfun']=href;
            var GetAnime = new ObjectRequest(href);
            request(GetAnime, function (responseDetails) {
                responseText = responseDetails.responseText;
                var dom = new DOMParser().parseFromString(responseText, "text/html");
                var bangumiData = dom.querySelectorAll("script")[7];
                /*for(var s of bangumiData){
                    debug("bangumiData: "+s.innerText);

                }*/
                debug("bangumiData: " + bangumiData);
                bangumiData = bangumiData.innerText.match(/window\.bangumiList = ([^;]*)/)[1];
                debug("bangumiData: " + bangumiData);
                bangumiData = JSON.parse(bangumiData);
                for (var item of bangumiData.items) {
                    if (item.episodeName.includes(parseInt(EpisodeCurrent))) {
                        var videoId = item.videoId;
                        var SearchResultTitle = dom.querySelector("h2.title").textContent;
                        debug('SearchResultTitle: ' + SearchResultTitle);
                        href = 'http://danmu.aixifan.com/V2/' + videoId + '?pageSize=1000&pageNo=1';
                        SearchResult = "Search Result: [Acfun] [" + SearchResultTitle + "] [" + item.episodeName + "] - " + href;
                        break;
                    }
                }
                InsertDropDown();
                InsertOption( SearchResult);
            });
        }
    });
}

function Anime1Comment(){
    var DanmakuLink=GM_getValue('DanmakuLink');
    var _title=DanmakuLink.match(/\[(.*)\] \[(.*)\] \[(.*)\]/)[2];
    title=CheckAlias('anime1.me',_title);
    var href="https://anime1.me/?s="+encodeURIComponent(simplized(title,'s2t')+" "+pad(EpisodeCurrent,2));
    var search=new ObjectRequest(href);
    var SearchResult;
    request(search,function (responseDetails) {
        var responseText=responseDetails.responseText;
        var dom = new DOMParser().parseFromString(responseText, "text/html");
        var NoResult=dom.querySelector("section.no-results.not-found");
        if(NoResult!=null){
            abp.createPopup('[Error] anime1.me search failed.', 2000);
        }
        else {
            var main=dom.querySelector("#main");
            var item=main.querySelector("article");
            var Anime1Url=item.querySelector("a").href+"#comment";
            window.open(Anime1Url);
        }
    });
}

function RatingCheck(){
    var href="https://greasyfork.org/en/scripts/395158-anime1-danmaku/feedback";
    var search=new ObjectRequest(href);
    var SearchResult;
    request(search,function (responseDetails) {
        var responseText=responseDetails.responseText;
        var dom = new DOMParser().parseFromString(responseText, "text/html");
        var result=dom.querySelector("span.user-profile-link");
        if(result==null){
            if(PushEnable){
                abp.createPopup('[Error] You are not login greasyfork.org',5000);

            }
        }
        else {
            var username=result.textContent;
            var ratingUser=dom.querySelector('#feedback-favoriters').nextElementSibling.textContent;
            if(ratingUser.includes(username)){
                if(PushEnable){
                    abp.createPopup('[Notice] Thanks for you rating! the secret command is: !pixiv',5000);
                }

            }
            else {
                if(PushEnable){
                    abp.createPopup('[Error] You are not rating yet, you can rating this script now: !fork',5000);
                }

            }
        }
    });
}

function GetJaTitle(func=null,title){
    var DanmakuLink=GM_getValue('DanmakuLink');
    var title=DanmakuLink.match(/\[(.*)\] \[(.*)\] \[(.*)\]/)[2];

    var href="http://zh.wikipedia.org/w/api.php?action=query&prop=langlinks&format=json&titles="+encodeURIComponent(simplized(title));
    var search=new ObjectRequest(href);
    var SearchResult;
    request(search,function (responseDetails) {
        var result=JSON.parse(responseDetails.responseText);
        debug(Object.keys(result.query.pages)[0]);
        if(Object.keys(result.query.pages)[0]=='-1'){
            if(PushEnable){
                abp.createPopup('[Error] Get Japanese Title failed.',5000);

            }
        }
        else {
            var value=GM_getValue("AliasSetting")||null;
            var AliasSetting;
            var site='Japanese Title';
            if(value==null){
                AliasSetting={};
            }
            else{
                AliasSetting=JSON.parse(value);
            }
            if(AliasSetting[site]==undefined){
                AliasSetting[site]={};
            }
            debug(Object.values(result.query.pages)[0]);
                var langlinks=Object.values(result.query.pages)[0].langlinks;
                for(var obj of langlinks){
                    if(obj.lang=='ja'){
                        debug(obj['*']);
                        var jtitle=obj['*'];
                        AliasSetting[site][title] = jtitle;
                        GM_setValue('AliasSetting',JSON.stringify(AliasSetting));
                        abp.createPopup("Alias saved.", 2000);
                        if(func!=null){
                            func();

                        }
                        break;
                    }
                }
        }
    });
}

function pixiv(){
    var DanmakuLink=GM_getValue('DanmakuLink');
    var title=DanmakuLink.match(/\[(.*)\] \[(.*)\] \[(.*)\]/)[2];
    title=CheckAlias('Japanese Title',title);
    window.open("https://www.pixiv.net/en/tags/"+encodeURIComponent(title)+"/artworks?s_mode=s_tag");
}



//library
function CreateButton(text,func){
    var btn=document.createElement("button");
    btn.type="button";
    btn.onclick="";
    btn.innerHTML=text;
    btn.addEventListener('click',func);
    input.parentElement.insertBefore(btn, input.nextElementSibling);
    //body.insertBefore(btn, input.nextElementSibling);
    return btn;
}

function DisplayInput(href) {
    if(input==null){
        var div=document.createElement("div");
        input=document.createElement("input");
        input.id="InputDanmaku";
        input.setAttribute("type","text");
        input.setAttribute("placeholder",href);
        //input.setAttribute("onClick","this.select();");
        input.size=80;
        div.insertBefore(input,null);
        var body = document.querySelector('body');
        body.insertBefore(div, body.firstChild);

    }
    else{
        input.setAttribute("placeholder",href);
    }
}

function InsertOption(value) {
        var option=document.createElement("option");
        option.value=value;
        datalist.insertBefore(option,null);
        if(!value.includes("Failed")){
            input.value = value;
            if (/www\.tucao\.one/.test(value)){
                GM_setValue("DanmakuLinkTucao", value);

            }
        }
        else  if(value.includes("Failed")&&input.value=="Searching..."&&SearchFinished){
            input.value = "Search Result: All Failed.";

        }

    //else{
    //    debug("InsertOption Error: value="+value+" & input="+input.value);
    //}
}

function InsertDropDown() {
    input.setAttribute("onfocus","this.value='';");
    input.style=`
        background-image:    url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAlCAYAAADFniADAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAZtSURBVFhHjVdNaFVXEJ68FxOMRiGKBlJjkYBV0aRKXHYR/4q4EMFN8CdV3JRaqYIR0UXalSXZREEljwoJ7mwxC0s3VREMxux0I1SDUqkmIQkxmJi8vJzON+fOfXNv7svzw3HmnDNn5jsz9517U5LL5VxJSQnNz88TkEqlyDkngnlds3Y6nRZfYHR0lF68eEGDg4O0f/9+evbsGU1MTNCGDRto27ZtgZcHYhbLg3kYbnZ21s3NzTkQzGazIrAxhzW14Qs8efLE7d692yGPlcePH7vGxsbIXEXFUnfhwgXZB8TzYKx51CY1kghZW/FFXV0kKZUQV9rbAwMDEbJ8+rwfS1dXl8RYLA+Ea+WRVFa1tV0o8VcvX9K1NWsoU11N31VWSjp2EeRyPgYAX+xVGzh16hS1trZSaWlpYp5I+xZjDhugZcvcLxUVbuT6deemplx2dNRNPnjg/qipCSvx9OlT19TUFI4hqJZWUjXaDNg89hFKIR8QZ6s2TpXp7qbajx/p5MWLlK2rozs1NdS7cSMNPnxIe3t6qAUVY6AictIAvkKoBmw/B3CLRds82g3hA3Yq9qFW5kDl2rXu+/Jy58bG3O/V1e5efb37k+XO6tUuOz7uungO8fr7+8NnKl4ha0M/f/5cYtsKaf6U9pvXhS20VgtjdqLJoSFKlZVR7tMnKl2+HCfxfrxWunQpzbBWYK9HtEJ520/cvn1bNPKAA/JolYVUvGXqCNy//7foe1NT9O+lS7S3v59y2SzNjI3RN3fv0kgmQ3/xGmD3FSKEHMCjR49ExwnJurbOtkxLCbS3tyOKyMkVK9zrEyfc3Nu3zvGD/l9bm/t11apwHe3bs2eP2Jxr0fZVVVVJfJtTH3ywDAmpjUVo4MyZMxJE5cvStPuhstL9yNJYXhZZAyn99UUJ5e8rawOWEIQ75Z8pbRkAG3MQ4P37IdGK13M5ujY5SZ0sAzOzwawHB5VXDBB0STTn9gOGtQHND4CD5AdTXWTG4XOBRVwH7969ow8fJnguFaz5SxI+GgSJcrk52rRpM42MjND4+Hi4pvEQO78nR9PTn+TdyPlDQiFhlA4S7y0EOHbsGDwdbxJJp71W247hp75xv6jtWwggD3IiNzjwQXz7cAreICfB6QCMAd4nGvMQVMnadqxI8ovaPiaAPMgBwRUEn5T8l0BIySg5rCtg6xC6sB0MGHaPhRKK5MR/SYTUAVUEdOwTFb4YAzcG7MJ7FPDRnFogFv9AApYQbJ1TFCeEDzbvB1tmE/ZYaE4lJLl1c9Kin/eR4sGhA5fA9gNrA7AxVEJmSaA57QtZSOnJIPb9B2j72J3n84QOHDggPvC9evWqeFy+fFnGtbW1Mj548KCM8VWAPRAlp9AiqC2H159j/KcJDRw9ehRnEwF36HJ8MTA6OjrktQIcPnxY1oDp6enQ7uvri+znpOEY0GvIXklgF3nF2EWgpeW4CeiDreB3YEtLSyQ4f1GKXcMffRbqEycEASwhlaIvZK2UElKtcvPmTfGzczdu3JC55uZmGdsD2f2AzandCtuHRWtDA/H22dNmMhnx2blzZzgHUQwNDcnYEinUPn2LoHNh+3TR2sDx47Z9+YBXrlyR9ZUrV4ZzEDxDwI4dO0S38ecN5uP7IYAlpEUJ2xcnBCfgyJEjQdB8wHXr1skagGoAp0+fdocOHRJb35c9PT0yXr9+fbjXChAnBJG/kBnhT5OTiw3gK4G/p6izs1PGiu3bv6Z9+76lmZkZKuPP5CVLllBv713iX6Lsb2/vCDyJ2tp+plev/qHu7h4ZYx35AGgmEbkjkXNB+yxzAH/dYn9S+QsJfJPn839M6LWiFbLVKvpCbmhoEM1nDOfgy/8CO38hqg03bwcLDG/7CxjYunWraMSE2JzyTMUrpMwV2KtiTwsdtfOVjNvWD5rfAhLb5kTH0DlpXxIhtQE8wEnBo7YnYe2kPToPIIclBI2x3FOFCMFRocE0uE30uYTU7u3tlZg2j9qQyI0eJwSNMfDmzRuTbCEhPy5eoXPnzkm8pDywpX26WIiQ2sDw8HAY3Cf7vArpvD5Hi+WBHV4JxRxBWnH27E9horhYEir19fX8t+uo7F0sj0riC9naSkgrCVHcuvWb27Wrif9CSS8gsmXLZnf+fGtIBogTSsoDXYJKsXCc/P0E4RbInNoQ6weoTzFwItmTlGdhTqL/Abq9hxjY+TxPAAAAAElFTkSuQmCC');
        background-position: calc(100% - .5rem), 100% 0;
        background-size:  1.5em 1.5em;
        background-repeat: no-repeat;
        `;
    SearchFinished=true;
    GM_setValue('danmakuSource',danmakuSource);
}

function AcfunParse(AcfunDanmaku){
    debug("AcfunDanmaku: " + JSON.stringify(AcfunDanmaku));
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString('<?xml version="1.0" encoding="utf-8"?><i></i>', "application/xml");
    var root = xmlDoc.getElementsByTagName("i");
    for (var obj of AcfunDanmaku[2]) {
                try {
                    var d = xmlDoc.createElement("d");
                    //my regex
                    d.innerHTML = obj.m.replace(/[^\u4e00-\u9fa5`~\!@#\$%\^\*\(\)_\+\|\-=\\\{\}\[\]:";'\?,\.\/\w\d<>&\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u2605-\u2606\u2190-\u2195\u203B]/g, "").replace("<", "&lt;").replace(">", "&gt;").replace("&", "&amp;");
                    var c = obj.c.split(',');
                    var time = c[0];
                    if (window.location.href.includes("www.tucao.one") && !IsDownload) {
                        time = parseFloat(time) + parseFloat(TucaoDelay);
                    }
                    var color = c[1];
                    var mode = c[2];
                    var size = c[3];
                    var p = time + "," + mode + "," + size + "," + color + ",1550236858,0,55f99b31,12108265626271746";
                    d.setAttribute("p", p);
                    root[0].appendChild(d);
                }
                catch (e) {
                    debug(e + " " + d.innerHTML);
                    continue;

                }
    }
    var comments = (new XMLSerializer()).serializeToString(xmlDoc);
    debug("Comments: " + comments);
    return comments;

}

function SearchBilibili() {
    var title=document.title.replace(" - EYNY","").replace(" – Anime1.me 動畫線上看","").match(/(.*)\s(\[(\d*)\])?/)[1];
    window.open("https://search.bilibili.com/all?keyword="+simplized(title));
}

function CheckAlias(site,title) {
    title=simplized(title);
    var alias=title;
    var aliasList=GM_getValue('AliasSetting')||null;
    if(aliasList!=null){
        aliasList=JSON.parse(aliasList);
        if (aliasList[site]!=undefined){
            if(aliasList[site][title]!=undefined){
                alias=aliasList[site][title];
                debug(alias);
            }
        }
    }
    return alias;
}

function siteMapping(url) {
    var site;
    if(url.includes('acfun')){
        site='www.acfun.cn';
    }
    else if(url.includes('bilibili')){
        site="search.bilibili.com";
    }
    else if(url.includes('bahamut')){
        site="ani.gamer.com.tw";
    }
    else if(url.includes('anime1')){
        site="anime1.me";
    }
    else if(url.includes('tucao')){
        site="www.tucao.one";
    }
    return site;
    
}

//utils
function getRandomColor() {
    var Colors = {};
    Colors.names = {
        aqua: "#00ffff",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        black: "#000000",
        blue: "#0000ff",
        brown: "#a52a2a",
        cyan: "#00ffff",
        fuchsia: "#ff00ff",
        gold: "#ffd700",
        green: "#008000",
        indigo: "#4b0082",
        khaki: "#f0e68c",
        lightblue: "#add8e6",
        lightcyan: "#e0ffff",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        magenta: "#ff00ff",
        maroon: "#800000",
        navy: "#000080",
        olive: "#808000",
        orange: "#ffa500",
        pink: "#ffc0cb",
        purple: "#800080",
        violet: "#800080",
        red: "#ff0000",
        silver: "#c0c0c0",
        white: "#ffffff",
        yellow: "#ffff00"
    };
    Colors.random = function() {
        var result;
        var count = 0;
        for (var prop in this.names)
            if (Math.random() < 1/++count)
                result = prop;
        return result;
    };
    return parseInt(Colors.names[Colors.random()].match(/#([\d\w]{6})/)[1],16);
}

function simplized(cc,mode="t2s") {
    //繁体字列表
    var fanti = unescape("%u9312%u769A%u85F9%u7919%u611B%u566F%u5B21%u74A6%u66D6%u9744%u8AF3%u92A8%u9D6A%u9AAF%u8956%u5967%u5ABC%u9A41%u9C32%u58E9%u7F77%u9200%u64FA%u6557%u5504%u9812%u8FA6%u7D46%u9211%u5E6B%u7D81%u938A%u8B17%u525D%u98FD%u5BF6%u5831%u9B91%u9D07%u9F59%u8F29%u8C9D%u92C7%u72FD%u5099%u618A%u9D6F%u8CC1%u931B%u7E43%u7B46%u7562%u6583%u5E63%u9589%u84FD%u55F6%u6F77%u924D%u7BF3%u8E55%u908A%u7DE8%u8CB6%u8B8A%u8FAF%u8FAE%u8290%u7DF6%u7C69%u6A19%u9A43%u98AE%u98C6%u93E2%u9463%u9C3E%u9C49%u5225%u765F%u7015%u6FF1%u8CD3%u64EF%u5110%u7E7D%u6AB3%u6BAF%u81CF%u944C%u9AD5%u9B22%u9905%u7A1F%u64A5%u7F3D%u9251%u99C1%u9911%u9238%u9D53%u88DC%u923D%u8CA1%u53C3%u8836%u6B98%u615A%u6158%u71E6%u9A42%u9EF2%u84BC%u8259%u5009%u6EC4%u5EC1%u5074%u518A%u6E2C%u60FB%u5C64%u8A6B%u9364%u5115%u91F5%u6519%u647B%u87EC%u995E%u8B92%u7E8F%u93DF%u7522%u95E1%u986B%u56C5%u8AC2%u8B96%u8546%u61FA%u5B0B%u9A4F%u8998%u79AA%u9414%u5834%u5617%u9577%u511F%u8178%u5EE0%u66A2%u5000%u8407%u60B5%u95B6%u9BE7%u9214%u8ECA%u5FB9%u7868%u5875%u9673%u896F%u5096%u8AF6%u6AEC%u78E3%u9F54%u6490%u7A31%u61F2%u8AA0%u9A01%u68D6%u6A89%u92EE%u943A%u7661%u9072%u99B3%u6065%u9F52%u71BE%u98ED%u9D1F%u6C96%u885D%u87F2%u5BF5%u9283%u7587%u8E8A%u7C4C%u7DA2%u5114%u5E6C%u8B8E%u6AE5%u5EDA%u92E4%u96DB%u790E%u5132%u89F8%u8655%u82BB%u7D40%u8E95%u50B3%u91E7%u7621%u95D6%u5275%u6134%u9318%u7D9E%u7D14%u9D89%u7DBD%u8F1F%u9F6A%u8FAD%u8A5E%u8CDC%u9DBF%u8070%u8525%u56EA%u5F9E%u53E2%u84EF%u9A44%u6A05%u6E4A%u8F33%u8EA5%u7AC4%u651B%u932F%u92BC%u9E7A%u9054%u5660%u97C3%u5E36%u8CB8%u99D8%u7D3F%u64D4%u55AE%u9132%u64A3%u81BD%u619A%u8A95%u5F48%u6BAB%u8CE7%u7649%u7C1E%u7576%u64CB%u9EE8%u8569%u6A94%u8B9C%u78AD%u8960%u6417%u5CF6%u79B1%u5C0E%u76DC%u71FE%u71C8%u9127%u9419%u6575%u6ECC%u905E%u7DE0%u7CF4%u8A46%u8AE6%u7D88%u89BF%u93D1%u985B%u9EDE%u588A%u96FB%u5DD4%u923F%u7672%u91E3%u8ABF%u929A%u9BDB%u8ADC%u758A%u9C08%u91D8%u9802%u9320%u8A02%u92CC%u4E1F%u92A9%u6771%u52D5%u68DF%u51CD%u5D20%u9D87%u7AC7%u72A2%u7368%u8B80%u8CED%u934D%u7006%u6ADD%u7258%u7BE4%u9EF7%u935B%u65B7%u7DDE%u7C6A%u514C%u968A%u5C0D%u61DF%u9413%u5678%u9813%u920D%u71C9%u8E89%u596A%u58AE%u9438%u9D5D%u984D%u8A1B%u60E1%u9913%u8AE4%u580A%u95BC%u8EDB%u92E8%u9354%u9D9A%u984E%u9853%u9C77%u8A92%u5152%u723E%u990C%u8CB3%u9087%u927A%u9D2F%u9B9E%u767C%u7F70%u95A5%u743A%u792C%u91E9%u7169%u8CA9%u98EF%u8A2A%u7D21%u9201%u9B74%u98DB%u8AB9%u5EE2%u8CBB%u7DCB%u9428%u9BE1%u7D1B%u58B3%u596E%u61A4%u7CDE%u50E8%u8C50%u6953%u92D2%u98A8%u760B%u99AE%u7E2B%u8AF7%u9CF3%u7043%u819A%u8F3B%u64AB%u8F14%u8CE6%u5FA9%u8907%u8CA0%u8A03%u5A66%u7E1B%u9CE7%u99D9%u7D31%u7D3C%u8CFB%u9EA9%u9B92%u9C12%u91D3%u8A72%u9223%u84CB%u8CC5%u687F%u8D95%u7A08%u8D1B%u5C37%u641F%u7D3A%u5CA1%u525B%u92FC%u7DB1%u5D17%u6207%u93AC%u776A%u8AA5%u7E1E%u92EF%u64F1%u9D3F%u95A3%u927B%u500B%u7D07%u9398%u6F41%u7D66%u4E99%u8CE1%u7D86%u9BC1%u9F94%u5BAE%u978F%u8CA2%u9264%u6E9D%u830D%u69CB%u8CFC%u5920%u8A6C%u7DF1%u89AF%u8831%u9867%u8A41%u8F42%u9237%u932E%u9D23%u9D60%u9DBB%u526E%u639B%u9D30%u6451%u95DC%u89C0%u9928%u6163%u8CAB%u8A7F%u645C%u9E1B%u9C25%u5EE3%u7377%u898F%u6B78%u9F9C%u95A8%u8ECC%u8A6D%u8CB4%u528A%u532D%u528C%u5AAF%u6A9C%u9BAD%u9C56%u8F25%u6EFE%u889E%u7DC4%u9BC0%u934B%u570B%u904E%u581D%u54BC%u5E57%u69E8%u87C8%u927F%u99ED%u97D3%u6F22%u95DE%u7D4E%u9821%u865F%u705D%u9865%u95A1%u9DB4%u8CC0%u8A36%u95D4%u8823%u6A6B%u8F5F%u9D3B%u7D05%u9ECC%u8A0C%u8452%u958E%u9C5F%u58FA%u8B77%u6EEC%u6236%u6EF8%u9D98%u5629%u83EF%u756B%u5283%u8A71%u9A4A%u6A3A%u93F5%u61F7%u58DE%u6B61%u74B0%u9084%u7DE9%u63DB%u559A%u7613%u7165%u6E19%u5950%u7E6F%u9370%u9BC7%u9EC3%u8B0A%u9C09%u63EE%u8F1D%u6BC0%u8CC4%u7A62%u6703%u71F4%u532F%u5F59%u8AF1%u8AA8%u7E6A%u8A7C%u8588%u5666%u6FAE%u7E62%u743F%u6689%u8477%u6E3E%u8AE2%u991B%u95BD%u7372%u8CA8%u798D%u9225%u944A%u64CA%u6A5F%u7A4D%u9951%u8DE1%u8B4F%u96DE%u7E3E%u7DDD%u6975%u8F2F%u7D1A%u64E0%u5E7E%u858A%u5291%u6FDF%u8A08%u8A18%u969B%u7E7C%u7D00%u8A10%u8A70%u85BA%u5630%u568C%u9A65%u74A3%u89AC%u9F4F%u78EF%u7F88%u8806%u8E8B%u973D%u9C6D%u9BFD%u593E%u83A2%u9830%u8CC8%u9240%u50F9%u99D5%u90DF%u6D79%u92CF%u93B5%u87EF%u6BB2%u76E3%u5805%u7B8B%u9593%u8271%u7DD8%u7E6D%u6AA2%u583F%u9E7C%u63C0%u64BF%u7C21%u5109%u6E1B%u85A6%u6ABB%u9451%u8E10%u8CE4%u898B%u9375%u8266%u528D%u991E%u6F38%u6FFA%u6F97%u8AEB%u7E11%u6214%u6229%u77BC%u9DBC%u7B67%u9C39%u97C9%u5C07%u6F3F%u8523%u69F3%u734E%u8B1B%u91AC%u7D73%u97C1%u81A0%u6F86%u9A55%u5B0C%u652A%u9278%u77EF%u50E5%u8173%u9903%u7E73%u7D5E%u8F4E%u8F03%u649F%u5DA0%u9DE6%u9BAB%u968E%u7BC0%u6F54%u7D50%u8AA1%u5C46%u7664%u981C%u9B9A%u7DCA%u9326%u50C5%u8B39%u9032%u6649%u71FC%u76E1%u5118%u52C1%u834A%u8396%u5DF9%u85CE%u9949%u7E09%u8D10%u89B2%u9BE8%u9A5A%u7D93%u9838%u975C%u93E1%u5F91%u75D9%u7AF6%u51C8%u5244%u6D87%u9015%u5F33%u811B%u975A%u7CFE%u5EC4%u820A%u9B2E%u9CE9%u9DF2%u99D2%u8209%u64DA%u92F8%u61FC%u5287%u8A4E%u5C68%u6AF8%u98B6%u9245%u92E6%u7AB6%u9F5F%u9D51%u7D79%u9308%u942B%u96CB%u89BA%u6C7A%u7D55%u8B4E%u73A8%u921E%u8ECD%u99FF%u76B8%u958B%u51F1%u5274%u584F%u613E%u6137%u93A7%u9347%u9F95%u958C%u9227%u92AC%u9846%u6BBC%u8AB2%u9A0D%u7DD9%u8EFB%u9233%u9301%u9837%u58BE%u61C7%u9F66%u93D7%u6473%u5EAB%u8932%u56B3%u584A%u5108%u9136%u5672%u81BE%u5BEC%u736A%u9AD6%u7926%u66E0%u6CC1%u8A86%u8A91%u913A%u58D9%u7E8A%u8CBA%u8667%u5DCB%u7ABA%u994B%u6F70%u5331%u8562%u6192%u8075%u7C23%u95AB%u9315%u9BE4%u64F4%u95CA%u8810%u881F%u81D8%u840A%u4F86%u8CF4%u5D0D%u5FA0%u6DF6%u7028%u8CDA%u775E%u9338%u7669%u7C5F%u85CD%u6B04%u6514%u7C43%u95CC%u862D%u703E%u8B95%u652C%u89BD%u61F6%u7E9C%u721B%u6FEB%u5D50%u6B16%u6595%u946D%u8964%u746F%u95AC%u92C3%u6488%u52DE%u6F87%u562E%u5D97%u92A0%u9412%u7646%u6A02%u9C33%u9433%u58D8%u985E%u6DDA%u8A84%u7E32%u7C6C%u8C8D%u96E2%u9BC9%u79AE%u9E97%u53B2%u52F5%u792B%u66C6%u6B77%u701D%u96B8%u5137%u9148%u58E2%u85F6%u849E%u863A%u56A6%u9090%u9A6A%u7E2D%u6AEA%u6ADF%u8F62%u792A%u92F0%u9E1D%u7658%u7CF2%u8E92%u9742%u9C7A%u9C67%u5006%u806F%u84EE%u9023%u942E%u6190%u6F23%u7C3E%u6582%u81C9%u93C8%u6200%u7149%u7DF4%u861E%u5969%u7032%u7489%u6BAE%u8933%u895D%u9C31%u7CE7%u6DBC%u5169%u8F1B%u8AD2%u9B4E%u7642%u907C%u9410%u7E5A%u91D5%u9DEF%u7375%u81E8%u9130%u9C57%u51DC%u8CC3%u85FA%u5EE9%u6A81%u8F54%u8EAA%u9F61%u9234%u9748%u5DBA%u9818%u7DBE%u6B1E%u87F6%u9BEA%u993E%u5289%u700F%u9A2E%u7DB9%u93A6%u9DDA%u9F8D%u807E%u56A8%u7C60%u58DF%u650F%u96B4%u8622%u7027%u74CF%u6AF3%u6727%u7931%u6A13%u5A41%u645F%u7C0D%u50C2%u851E%u560D%u5D81%u93E4%u763A%u802C%u87BB%u9ACF%u8606%u76E7%u9871%u5EEC%u7210%u64C4%u9E75%u865C%u9B6F%u8CC2%u797F%u9304%u9678%u58DA%u64FC%u5695%u95AD%u7018%u6DE5%u6AE8%u6AD3%u8F64%u8F05%u8F46%u6C0C%u81DA%u9E15%u9DFA%u826B%u9C78%u5DD2%u6523%u5B7F%u7064%u4E82%u81E0%u5B4C%u6B12%u9E1E%u947E%u6384%u8F2A%u502B%u4F96%u6DEA%u7DB8%u8AD6%u5707%u863F%u7F85%u908F%u947C%u7C6E%u9A3E%u99F1%u7D61%u7296%u7380%u6FFC%u6B0F%u8161%u93CD%u9A62%u5442%u92C1%u4FB6%u5C62%u7E37%u616E%u6FFE%u7DA0%u6ADA%u8938%u92DD%u5638%u5ABD%u746A%u78BC%u879E%u99AC%u7F75%u55CE%u561C%u5B24%u69AA%u8CB7%u9EA5%u8CE3%u9081%u8108%u52F1%u779E%u9945%u883B%u6EFF%u8B3E%u7E35%u93DD%u9859%u9C3B%u8C93%u9328%u925A%u8CBF%u9EBC%u9EBD%u6C92%u9382%u9580%u60B6%u5011%u636B%u71DC%u61E3%u9346%u9333%u5922%u7787%u8B0E%u5F4C%u8993%u51AA%u7F8B%u8B10%u737C%u79B0%u7DBF%u7DEC%u6FA0%u9766%u9EFD%u5EDF%u7DF2%u7E46%u6EC5%u61AB%u95A9%u9594%u7DE1%u9CF4%u9298%u8B2C%u8B28%u9A40%u9943%u6B7F%u93CC%u8B00%u755D%u926C%u5436%u9209%u7D0D%u96E3%u6493%u8166%u60F1%u9B27%u9403%u8A25%u9912%u5167%u64EC%u81A9%u922E%u9BE2%u6506%u8F26%u9BF0%u91C0%u9CE5%u8526%u88CA%u8076%u5699%u9477%u93B3%u9689%u8617%u56C1%u9862%u8EA1%u6AB8%u7370%u5BE7%u64F0%u6FD8%u82E7%u5680%u8079%u9215%u7D10%u81BF%u6FC3%u8FB2%u5102%u5665%u99D1%u91F9%u8AFE%u513A%u7627%u6B50%u9DD7%u6BC6%u5614%u6F1A%u8B33%u616A%u750C%u76E4%u8E63%u9F90%u62CB%u76B0%u8CE0%u8F61%u5674%u9D6C%u7D15%u7F86%u9239%u9A19%u8ADE%u99E2%u98C4%u7E39%u983B%u8CA7%u5B2A%u860B%u6191%u8A55%u6F51%u9817%u91D9%u64B2%u92EA%u6A38%u8B5C%u93F7%u9420%u68F2%u81CD%u9F4A%u9A0E%u8C48%u555F%u6C23%u68C4%u8A16%u8604%u9A0F%u7DBA%u69BF%u78E7%u980E%u980F%u9C2D%u727D%u91EC%u925B%u9077%u7C3D%u7C64%u8B19%u9322%u9257%u6F5B%u6DFA%u8B74%u5879%u50C9%u8541%u6173%u9A2B%u7E7E%u69E7%u9210%u69CD%u55C6%u58BB%u8594%u5F37%u6436%u5B19%u6AA3%u6227%u7197%u9306%u93D8%u93F9%u7FA5%u8E4C%u936C%u6A4B%u55AC%u50D1%u7FF9%u7AC5%u8A9A%u8B59%u854E%u7E70%u78FD%u8E7A%u7ACA%u611C%u9365%u7BCB%u6B3D%u89AA%u5BE2%u92DF%u8F15%u6C2B%u50BE%u9803%u8ACB%u6176%u64B3%u9BD6%u74CA%u7AAE%u7162%u86FA%u5DF0%u8CD5%u87E3%u9C0D%u8DA8%u5340%u8EC0%u9A45%u9F72%u8A58%u5D87%u95C3%u89B7%u9D1D%u9874%u6B0A%u52F8%u8A6E%u7DA3%u8F07%u9293%u537B%u9D72%u78BA%u95CB%u95D5%u6128%u8B93%u9952%u64FE%u7E5E%u8558%u5B08%u6A48%u71B1%u97CC%u8A8D%u7D09%u98EA%u8ED4%u69AE%u7D68%u5DB8%u8811%u7E1F%u92A3%u9870%u8EDF%u92B3%u8706%u958F%u6F64%u7051%u85A9%u98AF%u9C13%u8CFD%u5098%u6BFF%u7CDD%u55AA%u9A37%u6383%u7E45%u6F80%u55C7%u92AB%u7A61%u6BBA%u524E%u7D17%u93A9%u9BCA%u7BE9%u66EC%u91C3%u522A%u9583%u965C%u8D0D%u7E55%u8A15%u59CD%u9A38%u91E4%u9C54%u5891%u50B7%u8CDE%u5770%u6BA4%u89F4%u71D2%u7D39%u8CD2%u651D%u61FE%u8A2D%u5399%u7044%u756C%u7D33%u5BE9%u5B38%u814E%u6EF2%u8A75%u8AD7%u700B%u8072%u7E69%u52DD%u5E2B%u7345%u6FD5%u8A69%u6642%u8755%u5BE6%u8B58%u99DB%u52E2%u9069%u91CB%u98FE%u8996%u8A66%u8B1A%u5852%u8494%u5F12%u8EFE%u8CB0%u9230%u9C23%u58FD%u7378%u7DAC%u6A1E%u8F38%u66F8%u8D16%u5C6C%u8853%u6A39%u8C4E%u6578%u6504%u7D13%u5E25%u9582%u96D9%u8AB0%u7A05%u9806%u8AAA%u78A9%u720D%u9460%u7D72%u98FC%u5EDD%u99DF%u7DE6%u9376%u9DE5%u8073%u616B%u980C%u8A1F%u8AA6%u64FB%u85EA%u993F%u98BC%u93AA%u8607%u8A34%u8085%u8B16%u7A4C%u96D6%u96A8%u7D8F%u6B72%u8AB6%u5B6B%u640D%u7B4D%u84C0%u733B%u7E2E%u7463%u9396%u55E9%u8127%u737A%u64BB%u95E5%u9248%u9C28%u81FA%u614B%u9226%u9B90%u6524%u8CAA%u7671%u7058%u58C7%u8B5A%u8AC7%u5606%u66C7%u926D%u931F%u9807%u6E6F%u71D9%u513B%u9933%u940B%u93DC%u6FE4%u7D73%u8A0E%u97DC%u92F1%u9A30%u8B04%u92BB%u984C%u9AD4%u5C5C%u7DF9%u9D5C%u95D0%u689D%u7CF6%u9F60%u9C37%u8CBC%u9435%u5EF3%u807D%u70F4%u9285%u7D71%u615F%u982D%u9204%u79BF%u5716%u91F7%u5718%u6476%u9839%u86FB%u98E9%u812B%u9D15%u99B1%u99DD%u6A62%u7C5C%u9F09%u896A%u5AA7%u8183%u5F4E%u7063%u9811%u842C%u7D08%u7DB0%u7DB2%u8F1E%u97CB%u9055%u570D%u70BA%u7232%u6FF0%u7DAD%u8466%u5049%u507D%u7DEF%u8B02%u885B%u8AC9%u5E43%u95C8%u6E88%u6F7F%u744B%u97D9%u7152%u9BAA%u6EAB%u805E%u7D0B%u7A69%u554F%u95BF%u7515%u64BE%u8778%u6E26%u7AA9%u81E5%u8435%u9F77%u55DA%u93A2%u70CF%u8AA3%u7121%u856A%u5433%u5862%u9727%u52D9%u8AA4%u9114%u5EE1%u61AE%u5AF5%u9A16%u9D61%u9DA9%u932B%u72A7%u8972%u7FD2%u9291%u6232%u7D30%u993C%u9B29%u74BD%u89A1%u8766%u8F44%u5CFD%u4FE0%u72F9%u5EC8%u5687%u7864%u9BAE%u7E96%u8CE2%u929C%u9591%u9592%u986F%u96AA%u73FE%u737B%u7E23%u9921%u7FA8%u61B2%u7DDA%u83A7%u859F%u861A%u5CF4%u736B%u5AFB%u9DF4%u7647%u8814%u79C8%u8E9A%u5EC2%u9472%u9109%u8A73%u97FF%u9805%u858C%u9909%u9A64%u7DD7%u9957%u856D%u56C2%u92B7%u66C9%u562F%u5635%u701F%u9A4D%u7D83%u689F%u7C2B%u5354%u633E%u651C%u8105%u8AE7%u5BEB%u7009%u8B1D%u893B%u64F7%u7D32%u7E88%u92C5%u91C1%u8208%u9658%u6ECE%u5147%u6D36%u92B9%u7E61%u9948%u9D42%u865B%u5653%u9808%u8A31%u6558%u7DD2%u7E8C%u8A61%u980A%u8ED2%u61F8%u9078%u766C%u7D62%u8AFC%u9249%u93C7%u5B78%u8B14%u6FA9%u9C48%u52DB%u8A62%u5C0B%u99B4%u8A13%u8A0A%u905C%u5864%u6F6F%u9C58%u58D3%u9D09%u9D28%u555E%u4E9E%u8A1D%u57E1%u5A6D%u690F%u6C2C%u95B9%u7159%u9E7D%u56B4%u5DD6%u984F%u95BB%u8277%u8C54%u53AD%u786F%u5F65%u8AFA%u9A57%u53B4%u8D17%u513C%u5157%u8B9E%u61E8%u9586%u91C5%u9B58%u995C%u9F34%u9D26%u694A%u63DA%u760D%u967D%u7662%u990A%u6A23%u716C%u7464%u6416%u582F%u9059%u7AAF%u8B20%u85E5%u8EFA%u9DC2%u9C29%u723A%u9801%u696D%u8449%u9768%u8B01%u9134%u66C4%u71C1%u91AB%u92A5%u9824%u907A%u5100%u87FB%u85DD%u5104%u61B6%u7FA9%u8A63%u8B70%u8ABC%u8B6F%u7570%u7E79%u8A52%u56C8%u5DA7%u98F4%u61CC%u9A5B%u7E0A%u8EFC%u8CBD%u91D4%u93B0%u943F%u761E%u8264%u852D%u9670%u9280%u98F2%u96B1%u92A6%u766E%u6AFB%u5B30%u9DF9%u61C9%u7E93%u7469%u87A2%u71DF%u7192%u8805%u8D0F%u7A4E%u584B%u9DAF%u7E08%u93A3%u6516%u56B6%u7005%u7020%u74D4%u9E1A%u766D%u9826%u7F4C%u55B2%u64C1%u50AD%u7670%u8E34%u8A60%u93DE%u512A%u6182%u90F5%u923E%u7336%u8A98%u8555%u92AA%u9B77%u8F3F%u9B5A%u6F01%u5A1B%u8207%u5DBC%u8A9E%u7344%u8B7D%u9810%u99AD%u50B4%u4FC1%u8ADB%u8AED%u8577%u5D33%u98EB%u95BE%u5AD7%u7D06%u89A6%u6B5F%u923A%u9D52%u9DF8%u9F6C%u9D1B%u6DF5%u8F45%u5712%u54E1%u5713%u7DE3%u9060%u6ADE%u9CF6%u9EFF%u7D04%u8E8D%u9470%u7CB5%u6085%u95B1%u925E%u9116%u52FB%u9695%u904B%u860A%u919E%u6688%u97FB%u9106%u8553%u60F2%u614D%u7D1C%u97DE%u6B9E%u6C33%u96DC%u707D%u8F09%u6522%u66AB%u8D0A%u74DA%u8DB2%u93E8%u8D13%u9AD2%u81DF%u99D4%u947F%u68D7%u8CAC%u64C7%u5247%u6FA4%u8CFE%u5616%u5E58%u7C00%u8CCA%u8B56%u8D08%u7D9C%u7E52%u8ECB%u9358%u9598%u67F5%u8A50%u9F4B%u50B5%u6C08%u76DE%u65AC%u8F3E%u5D84%u68E7%u6230%u7DBB%u8B6B%u5F35%u6F32%u5E33%u8CEC%u8139%u8D99%u8A54%u91D7%u87C4%u8F4D%u937A%u9019%u8B2B%u8F12%u9DD3%u8C9E%u91DD%u5075%u8A3A%u93AE%u9663%u6E5E%u7E1D%u6968%u8EEB%u8CD1%u798E%u9D06%u6399%u775C%u7319%u722D%u5E40%u7665%u912D%u8B49%u8ACD%u5D22%u9266%u931A%u7B8F%u7E54%u8077%u57F7%u7D19%u646F%u64F2%u5E5F%u8CEA%u6EEF%u9A2D%u6ADB%u6894%u8EF9%u8F0A%u8D04%u9DD9%u8784%u7E36%u8E93%u8E91%u89F6%u9418%u7D42%u7A2E%u816B%u773E%u937E%u8B05%u8EF8%u76BA%u665D%u9A5F%u7D02%u7E10%u8C6C%u8AF8%u8A85%u71ED%u77DA%u56D1%u8CAF%u9444%u99D0%u4F47%u6AE7%u9296%u5C08%u78DA%u8F49%u8CFA%u56C0%u994C%u9873%u6A01%u838A%u88DD%u599D%u58EF%u72C0%u9310%u8D05%u589C%u7DB4%u9A05%u7E0B%u8AC4%u6E96%u8457%u6FC1%u8AD1%u9432%u8332%u8CC7%u6F2C%u8AEE%u7DC7%u8F1C%u8CB2%u7725%u9319%u9F5C%u9BD4%u8E64%u7E3D%u7E31%u50AF%u9112%u8ACF%u9A36%u9BEB%u8A5B%u7D44%u93C3%u9246%u7E98%u8EA6%u9C52%u7FFA%u4F75%u4E26%u8514%u6C88%u919C%u6FB1%u9B25%u7BC4%u5E79%u81EF%u77FD%u6AC3%u5F8C%u5925%u7A2D%u5091%u8A23%u8A87%u88CF%u6DE9%u9EF4%u649A%u6DD2%u6261%u8056%u5C4D%u64E1%u5857%u7AAA%u9935%u6C59%u9341%u9E79%u880D%u5F5C%u6E67%u904A%u7C72%u79A6%u9858%u5DBD%u96F2%u7AC8%u7D2E%u5284%u7BC9%u65BC%u8A8C%u8A3B%u96D5%u8A01%u8B7E%u90E4%u6C39%u962A%u58DF%u5816%u57B5%u588A%u6ABE%u8552%u8464%u84E7%u8493%u83C7%u69C1%u6463%u54A4%u551A%u54E2%u565D%u5645%u6485%u5288%u8B14%u8946%u5DB4%u810A%u50E5%u7341%u9E85%u9918%u9937%u994A%u9962%u695E%u6035%u61CD%u723F%u6F35%u7069%u6FEB%u7026%u6DE1%u5BE7%u7CF8%u7D5D%u7DD4%u7449%u6898%u68EC%u6A70%u6AEB%u8EF2%u8EE4%u8CEB%u8181%u8156%u98C8%u7CCA%u7146%u6E9C%u6E63%u78B8%u6EFE%u7798%u9208%u9255%u92E3%u92B1%u92E5%u92F6%u9426%u9427%u9369%u9340%u9343%u9307%u9384%u9387%u93BF%u941D%u9465%u9479%u9454%u7A6D%u9D93%u9DA5%u9E0C%u7667%u5C59%u7602%u81D2%u8947%u7E48%u802E%u986C%u87CE%u9EAF%u9B81%u9B83%u9B8E%u9BD7%u9BDD%u9BF4%u9C5D%u9BFF%u9C20%u9C35%u9C45%u97BD%u97DD%u9F47%u8E2B%u7526%u6DE8%u7246%u80C7%u6046%u672E%u6AFA%u75FA%u7921%u6AB7%u7955%u7D5B%u5191%u866F%u8837%u8949%u8A3C%u9452%u947D%u93FD%u9394%u965D%u98E2%u9C4D%u88FD%u6BAD%u7343%u5FB5%u5690%u7652%u8B41%u7260%u617E%u8216%u7E6B%u4FC2%u88E1%u63A1%u95E2%u9B31%u4F48%u4F54%u771E%u9031%u9EB5%u95C6");
    //对应的简体字
    var jianti = unescape("%u9515%u7691%u853C%u788D%u7231%u55F3%u5AD2%u7477%u66A7%u972D%u8C19%u94F5%u9E4C%u80AE%u8884%u5965%u5AAA%u9A9C%u9CCC%u575D%u7F62%u94AF%u6446%u8D25%u5457%u9881%u529E%u7ECA%u94A3%u5E2E%u7ED1%u9551%u8C24%u5265%u9971%u5B9D%u62A5%u9C8D%u9E28%u9F85%u8F88%u8D1D%u94A1%u72C8%u5907%u60EB%u9E4E%u8D32%u951B%u7EF7%u7B14%u6BD5%u6BD9%u5E01%u95ED%u835C%u54D4%u6ED7%u94CB%u7B5A%u8DF8%u8FB9%u7F16%u8D2C%u53D8%u8FA9%u8FAB%u82C4%u7F0F%u7B3E%u6807%u9AA0%u98D1%u98D9%u9556%u9573%u9CD4%u9CD6%u522B%u762A%u6FD2%u6EE8%u5BBE%u6448%u50A7%u7F24%u69DF%u6BA1%u8191%u9554%u9ACC%u9B13%u997C%u7980%u62E8%u94B5%u94C2%u9A73%u997D%u94B9%u9E41%u8865%u94B8%u8D22%u53C2%u8695%u6B8B%u60ED%u60E8%u707F%u9A96%u9EEA%u82CD%u8231%u4ED3%u6CA7%u5395%u4FA7%u518C%u6D4B%u607B%u5C42%u8BE7%u9538%u4FAA%u9497%u6400%u63BA%u8749%u998B%u8C17%u7F20%u94F2%u4EA7%u9610%u98A4%u5181%u8C04%u8C36%u8487%u5FCF%u5A75%u9AA3%u89C7%u7985%u9561%u573A%u5C1D%u957F%u507F%u80A0%u5382%u7545%u4F25%u82CC%u6005%u960A%u9CB3%u949E%u8F66%u5F7B%u7817%u5C18%u9648%u886C%u4F27%u8C0C%u6987%u789C%u9F80%u6491%u79F0%u60E9%u8BDA%u9A8B%u67A8%u67FD%u94D6%u94DB%u75F4%u8FDF%u9A70%u803B%u9F7F%u70BD%u996C%u9E31%u51B2%u51B2%u866B%u5BA0%u94F3%u7574%u8E0C%u7B79%u7EF8%u4FE6%u5E31%u96E0%u6A71%u53A8%u9504%u96CF%u7840%u50A8%u89E6%u5904%u520D%u7ECC%u8E70%u4F20%u948F%u75AE%u95EF%u521B%u6006%u9524%u7F0D%u7EAF%u9E51%u7EF0%u8F8D%u9F8A%u8F9E%u8BCD%u8D50%u9E5A%u806A%u8471%u56F1%u4ECE%u4E1B%u82C1%u9AA2%u679E%u51D1%u8F8F%u8E7F%u7A9C%u64BA%u9519%u9509%u9E7E%u8FBE%u54D2%u9791%u5E26%u8D37%u9A80%u7ED0%u62C5%u5355%u90F8%u63B8%u80C6%u60EE%u8BDE%u5F39%u6B9A%u8D55%u7605%u7BAA%u5F53%u6321%u515A%u8361%u6863%u8C20%u7800%u88C6%u6363%u5C9B%u7977%u5BFC%u76D7%u7118%u706F%u9093%u956B%u654C%u6DA4%u9012%u7F14%u7C74%u8BCB%u8C1B%u7EE8%u89CC%u955D%u98A0%u70B9%u57AB%u7535%u5DC5%u94BF%u766B%u9493%u8C03%u94EB%u9CB7%u8C0D%u53E0%u9CBD%u9489%u9876%u952D%u8BA2%u94E4%u4E22%u94E5%u4E1C%u52A8%u680B%u51BB%u5CBD%u9E2B%u7AA6%u728A%u72EC%u8BFB%u8D4C%u9540%u6E0E%u691F%u724D%u7B03%u9EE9%u953B%u65AD%u7F0E%u7C16%u5151%u961F%u5BF9%u603C%u9566%u5428%u987F%u949D%u7096%u8DB8%u593A%u5815%u94CE%u9E45%u989D%u8BB9%u6076%u997F%u8C14%u57A9%u960F%u8F6D%u9507%u9537%u9E57%u989A%u989B%u9CC4%u8BF6%u513F%u5C14%u9975%u8D30%u8FE9%u94D2%u9E38%u9C95%u53D1%u7F5A%u9600%u73D0%u77FE%u9492%u70E6%u8D29%u996D%u8BBF%u7EBA%u94AB%u9C82%u98DE%u8BFD%u5E9F%u8D39%u7EEF%u9544%u9CB1%u7EB7%u575F%u594B%u6124%u7CAA%u507E%u4E30%u67AB%u950B%u98CE%u75AF%u51AF%u7F1D%u8BBD%u51E4%u6CA3%u80A4%u8F90%u629A%u8F85%u8D4B%u590D%u590D%u8D1F%u8BA3%u5987%u7F1A%u51EB%u9A78%u7EC2%u7ECB%u8D59%u9EB8%u9C8B%u9CC6%u9486%u8BE5%u9499%u76D6%u8D45%u6746%u8D76%u79C6%u8D63%u5C34%u64C0%u7EC0%u5188%u521A%u94A2%u7EB2%u5C97%u6206%u9550%u777E%u8BF0%u7F1F%u9506%u6401%u9E3D%u9601%u94EC%u4E2A%u7EA5%u9549%u988D%u7ED9%u4E98%u8D53%u7EE0%u9CA0%u9F9A%u5BAB%u5DE9%u8D21%u94A9%u6C9F%u82DF%u6784%u8D2D%u591F%u8BDF%u7F11%u89CF%u86CA%u987E%u8BC2%u6BC2%u94B4%u9522%u9E2A%u9E44%u9E58%u5250%u6302%u9E39%u63B4%u5173%u89C2%u9986%u60EF%u8D2F%u8BD6%u63BC%u9E73%u9CCF%u5E7F%u72B7%u89C4%u5F52%u9F9F%u95FA%u8F68%u8BE1%u8D35%u523D%u5326%u523F%u59AB%u6867%u9C91%u9CDC%u8F8A%u6EDA%u886E%u7EF2%u9CA7%u9505%u56FD%u8FC7%u57DA%u5459%u5E3C%u6901%u8748%u94EA%u9A87%u97E9%u6C49%u961A%u7ED7%u9889%u53F7%u704F%u98A2%u9602%u9E64%u8D3A%u8BC3%u9616%u86CE%u6A2A%u8F70%u9E3F%u7EA2%u9EC9%u8BA7%u836D%u95F3%u9C8E%u58F6%u62A4%u6CAA%u6237%u6D52%u9E55%u54D7%u534E%u753B%u5212%u8BDD%u9A85%u6866%u94E7%u6000%u574F%u6B22%u73AF%u8FD8%u7F13%u6362%u5524%u75EA%u7115%u6DA3%u5942%u7F33%u953E%u9CA9%u9EC4%u8C0E%u9CC7%u6325%u8F89%u6BC1%u8D3F%u79FD%u4F1A%u70E9%u6C47%u6C47%u8BB3%u8BF2%u7ED8%u8BD9%u835F%u54D5%u6D4D%u7F0B%u73F2%u6656%u8364%u6D51%u8BE8%u9984%u960D%u83B7%u8D27%u7978%u94AC%u956C%u51FB%u673A%u79EF%u9965%u8FF9%u8BA5%u9E21%u7EE9%u7F09%u6781%u8F91%u7EA7%u6324%u51E0%u84DF%u5242%u6D4E%u8BA1%u8BB0%u9645%u7EE7%u7EAA%u8BA6%u8BD8%u8360%u53FD%u54DC%u9AA5%u7391%u89CA%u9F51%u77F6%u7F81%u867F%u8DFB%u9701%u9C9A%u9CAB%u5939%u835A%u988A%u8D3E%u94BE%u4EF7%u9A7E%u90CF%u6D43%u94D7%u9553%u86F2%u6B7C%u76D1%u575A%u7B3A%u95F4%u8270%u7F04%u8327%u68C0%u78B1%u7877%u62E3%u6361%u7B80%u4FED%u51CF%u8350%u69DB%u9274%u8DF5%u8D31%u89C1%u952E%u8230%u5251%u996F%u6E10%u6E85%u6DA7%u8C0F%u7F23%u620B%u622C%u7751%u9E63%u7B15%u9CA3%u97AF%u5C06%u6D46%u848B%u6868%u5956%u8BB2%u9171%u7EDB%u7F30%u80F6%u6D47%u9A84%u5A07%u6405%u94F0%u77EB%u4FA5%u811A%u997A%u7F34%u7EDE%u8F7F%u8F83%u6322%u5CE4%u9E6A%u9C9B%u9636%u8282%u6D01%u7ED3%u8BEB%u5C4A%u7596%u988C%u9C92%u7D27%u9526%u4EC5%u8C28%u8FDB%u664B%u70EC%u5C3D%u5C3D%u52B2%u8346%u830E%u537A%u8369%u9991%u7F19%u8D46%u89D0%u9CB8%u60CA%u7ECF%u9888%u9759%u955C%u5F84%u75C9%u7ADE%u51C0%u522D%u6CFE%u8FF3%u5F2A%u80EB%u9753%u7EA0%u53A9%u65E7%u9604%u9E20%u9E6B%u9A79%u4E3E%u636E%u952F%u60E7%u5267%u8BB5%u5C66%u6989%u98D3%u949C%u9514%u7AAD%u9F83%u9E43%u7EE2%u9529%u954C%u96BD%u89C9%u51B3%u7EDD%u8C32%u73CF%u94A7%u519B%u9A8F%u76B2%u5F00%u51EF%u5240%u57B2%u5FFE%u607A%u94E0%u9534%u9F9B%u95F6%u94AA%u94D0%u9897%u58F3%u8BFE%u9A92%u7F02%u8F72%u94B6%u951E%u9894%u57A6%u6073%u9F88%u94FF%u62A0%u5E93%u88E4%u55BE%u5757%u4FA9%u90D0%u54D9%u810D%u5BBD%u72EF%u9ACB%u77FF%u65F7%u51B5%u8BD3%u8BF3%u909D%u5739%u7EA9%u8D36%u4E8F%u5CBF%u7AA5%u9988%u6E83%u532E%u8489%u6126%u8069%u7BD1%u9603%u951F%u9CB2%u6269%u9614%u86F4%u8721%u814A%u83B1%u6765%u8D56%u5D03%u5F95%u6D9E%u6FD1%u8D49%u7750%u94FC%u765E%u7C41%u84DD%u680F%u62E6%u7BEE%u9611%u5170%u6F9C%u8C30%u63FD%u89C8%u61D2%u7F06%u70C2%u6EE5%u5C9A%u6984%u6593%u9567%u8934%u7405%u9606%u9512%u635E%u52B3%u6D9D%u5520%u5D02%u94D1%u94F9%u75E8%u4E50%u9CD3%u956D%u5792%u7C7B%u6CEA%u8BD4%u7F27%u7BF1%u72F8%u79BB%u9CA4%u793C%u4E3D%u5389%u52B1%u783E%u5386%u5386%u6CA5%u96B6%u4FEA%u90E6%u575C%u82C8%u8385%u84E0%u5456%u9026%u9A8A%u7F21%u67A5%u680E%u8F79%u783A%u9502%u9E42%u75A0%u7C9D%u8DDE%u96F3%u9CA1%u9CE2%u4FE9%u8054%u83B2%u8FDE%u9570%u601C%u6D9F%u5E18%u655B%u8138%u94FE%u604B%u70BC%u7EC3%u8539%u5941%u6F4B%u740F%u6B93%u88E2%u88E3%u9CA2%u7CAE%u51C9%u4E24%u8F86%u8C05%u9B49%u7597%u8FBD%u9563%u7F2D%u948C%u9E69%u730E%u4E34%u90BB%u9CDE%u51DB%u8D41%u853A%u5EEA%u6AA9%u8F9A%u8E8F%u9F84%u94C3%u7075%u5CAD%u9886%u7EEB%u68C2%u86CF%u9CAE%u998F%u5218%u6D4F%u9A9D%u7EFA%u954F%u9E68%u9F99%u804B%u5499%u7B3C%u5784%u62E2%u9647%u830F%u6CF7%u73D1%u680A%u80E7%u783B%u697C%u5A04%u6402%u7BD3%u507B%u848C%u55BD%u5D5D%u9542%u7618%u8027%u877C%u9AC5%u82A6%u5362%u9885%u5E90%u7089%u63B3%u5364%u864F%u9C81%u8D42%u7984%u5F55%u9646%u5786%u64B8%u565C%u95FE%u6CF8%u6E0C%u680C%u6A79%u8F73%u8F82%u8F98%u6C07%u80EA%u9E2C%u9E6D%u823B%u9C88%u5CE6%u631B%u5B6A%u6EE6%u4E71%u8114%u5A08%u683E%u9E3E%u92AE%u62A1%u8F6E%u4F26%u4ED1%u6CA6%u7EB6%u8BBA%u56F5%u841D%u7F57%u903B%u9523%u7BA9%u9AA1%u9A86%u7EDC%u8366%u7321%u6CFA%u6924%u8136%u9559%u9A74%u5415%u94DD%u4FA3%u5C61%u7F15%u8651%u6EE4%u7EFF%u6988%u891B%u950A%u5452%u5988%u739B%u7801%u8682%u9A6C%u9A82%u5417%u551B%u5B37%u6769%u4E70%u9EA6%u5356%u8FC8%u8109%u52A2%u7792%u9992%u86EE%u6EE1%u8C29%u7F26%u9558%u98A1%u9CD7%u732B%u951A%u94C6%u8D38%u4E48%u4E48%u6CA1%u9541%u95E8%u95F7%u4EEC%u626A%u7116%u61D1%u9494%u9530%u68A6%u772F%u8C1C%u5F25%u89C5%u5E42%u8288%u8C27%u7315%u7962%u7EF5%u7F05%u6E11%u817C%u9EFE%u5E99%u7F08%u7F2A%u706D%u60AF%u95FD%u95F5%u7F17%u9E23%u94ED%u8C2C%u8C1F%u84E6%u998D%u6B81%u9546%u8C0B%u4EA9%u94BC%u5450%u94A0%u7EB3%u96BE%u6320%u8111%u607C%u95F9%u94D9%u8BB7%u9981%u5185%u62DF%u817B%u94CC%u9CB5%u64B5%u8F87%u9CB6%u917F%u9E1F%u8311%u8885%u8042%u556E%u954A%u954D%u9667%u8616%u55EB%u989F%u8E51%u67E0%u72DE%u5B81%u62E7%u6CDE%u82CE%u549B%u804D%u94AE%u7EBD%u8113%u6D53%u519C%u4FAC%u54DD%u9A7D%u9495%u8BFA%u50A9%u759F%u6B27%u9E25%u6BB4%u5455%u6CA4%u8BB4%u6004%u74EF%u76D8%u8E52%u5E9E%u629B%u75B1%u8D54%u8F94%u55B7%u9E4F%u7EB0%u7F74%u94CD%u9A97%u8C1D%u9A88%u98D8%u7F25%u9891%u8D2B%u5AD4%u82F9%u51ED%u8BC4%u6CFC%u9887%u948B%u6251%u94FA%u6734%u8C31%u9564%u9568%u6816%u8110%u9F50%u9A91%u5C82%u542F%u6C14%u5F03%u8BAB%u8572%u9A90%u7EEE%u6864%u789B%u9880%u9883%u9CCD%u7275%u948E%u94C5%u8FC1%u7B7E%u7B7E%u8C26%u94B1%u94B3%u6F5C%u6D45%u8C34%u5811%u4F65%u8368%u60AD%u9A9E%u7F31%u6920%u94A4%u67AA%u545B%u5899%u8537%u5F3A%u62A2%u5AF1%u6A2F%u6217%u709D%u9516%u9535%u956A%u7F9F%u8DC4%u9539%u6865%u4E54%u4FA8%u7FD8%u7A8D%u8BEE%u8C2F%u835E%u7F32%u7857%u8DF7%u7A83%u60EC%u9532%u7BA7%u94A6%u4EB2%u5BDD%u9513%u8F7B%u6C22%u503E%u9877%u8BF7%u5E86%u63FF%u9CAD%u743C%u7A77%u8315%u86F1%u5DEF%u8D47%u866E%u9CC5%u8D8B%u533A%u8EAF%u9A71%u9F8B%u8BCE%u5C96%u9612%u89D1%u9E32%u98A7%u6743%u529D%u8BE0%u7EFB%u8F81%u94E8%u5374%u9E4A%u786E%u9615%u9619%u60AB%u8BA9%u9976%u6270%u7ED5%u835B%u5A06%u6861%u70ED%u97E7%u8BA4%u7EAB%u996A%u8F6B%u8363%u7ED2%u5D58%u877E%u7F1B%u94F7%u98A6%u8F6F%u9510%u86AC%u95F0%u6DA6%u6D12%u8428%u98D2%u9CC3%u8D5B%u4F1E%u6BF5%u7CC1%u4E27%u9A9A%u626B%u7F2B%u6DA9%u556C%u94EF%u7A51%u6740%u5239%u7EB1%u94E9%u9CA8%u7B5B%u6652%u917E%u5220%u95EA%u9655%u8D61%u7F2E%u8BAA%u59D7%u9A9F%u9490%u9CDD%u5892%u4F24%u8D4F%u57A7%u6B87%u89DE%u70E7%u7ECD%u8D4A%u6444%u6151%u8BBE%u538D%u6EE0%u7572%u7EC5%u5BA1%u5A76%u80BE%u6E17%u8BDC%u8C02%u6E16%u58F0%u7EF3%u80DC%u5E08%u72EE%u6E7F%u8BD7%u65F6%u8680%u5B9E%u8BC6%u9A76%u52BF%u9002%u91CA%u9970%u89C6%u8BD5%u8C25%u57D8%u83B3%u5F11%u8F7C%u8D33%u94C8%u9CA5%u5BFF%u517D%u7EF6%u67A2%u8F93%u4E66%u8D4E%u5C5E%u672F%u6811%u7AD6%u6570%u6445%u7EBE%u5E05%u95E9%u53CC%u8C01%u7A0E%u987A%u8BF4%u7855%u70C1%u94C4%u4E1D%u9972%u53AE%u9A77%u7F0C%u9536%u9E36%u8038%u6002%u9882%u8BBC%u8BF5%u64DE%u85AE%u998A%u98D5%u953C%u82CF%u8BC9%u8083%u8C21%u7A23%u867D%u968F%u7EE5%u5C81%u8C07%u5B59%u635F%u7B0B%u836A%u72F2%u7F29%u7410%u9501%u5522%u7743%u736D%u631E%u95FC%u94CA%u9CCE%u53F0%u6001%u949B%u9C90%u644A%u8D2A%u762B%u6EE9%u575B%u8C2D%u8C08%u53F9%u6619%u94BD%u952C%u9878%u6C64%u70EB%u50A5%u9967%u94F4%u9557%u6D9B%u7EE6%u8BA8%u97EC%u94FD%u817E%u8A8A%u9511%u9898%u4F53%u5C49%u7F07%u9E48%u9617%u6761%u7C9C%u9F86%u9CA6%u8D34%u94C1%u5385%u542C%u70C3%u94DC%u7EDF%u6078%u5934%u94AD%u79C3%u56FE%u948D%u56E2%u629F%u9893%u8715%u9968%u8131%u9E35%u9A6E%u9A7C%u692D%u7BA8%u9F0D%u889C%u5A32%u817D%u5F2F%u6E7E%u987D%u4E07%u7EA8%u7EFE%u7F51%u8F8B%u97E6%u8FDD%u56F4%u4E3A%u4E3A%u6F4D%u7EF4%u82C7%u4F1F%u4F2A%u7EAC%u8C13%u536B%u8BFF%u5E0F%u95F1%u6CA9%u6DA0%u73AE%u97EA%u709C%u9C94%u6E29%u95FB%u7EB9%u7A33%u95EE%u960C%u74EE%u631D%u8717%u6DA1%u7A9D%u5367%u83B4%u9F8C%u545C%u94A8%u4E4C%u8BEC%u65E0%u829C%u5434%u575E%u96FE%u52A1%u8BEF%u90AC%u5E91%u6003%u59A9%u9A9B%u9E49%u9E5C%u9521%u727A%u88AD%u4E60%u94E3%u620F%u7EC6%u9969%u960B%u73BA%u89CB%u867E%u8F96%u5CE1%u4FA0%u72ED%u53A6%u5413%u7856%u9C9C%u7EA4%u8D24%u8854%u95F2%u95F2%u663E%u9669%u73B0%u732E%u53BF%u9985%u7FA1%u5BAA%u7EBF%u82CB%u83B6%u85D3%u5C98%u7303%u5A34%u9E47%u75EB%u869D%u7C7C%u8DF9%u53A2%u9576%u4E61%u8BE6%u54CD%u9879%u8297%u9977%u9AA7%u7F03%u98E8%u8427%u56A3%u9500%u6653%u5578%u54D3%u6F47%u9A81%u7EE1%u67AD%u7BAB%u534F%u631F%u643A%u80C1%u8C10%u5199%u6CFB%u8C22%u4EB5%u64B7%u7EC1%u7F2C%u950C%u8845%u5174%u9649%u8365%u51F6%u6C79%u9508%u7EE3%u9990%u9E3A%u865A%u5618%u987B%u8BB8%u53D9%u7EEA%u7EED%u8BE9%u987C%u8F69%u60AC%u9009%u7663%u7EDA%u8C16%u94C9%u955F%u5B66%u8C11%u6CF6%u9CD5%u52CB%u8BE2%u5BFB%u9A6F%u8BAD%u8BAF%u900A%u57D9%u6D54%u9C9F%u538B%u9E26%u9E2D%u54D1%u4E9A%u8BB6%u57AD%u5A05%u6860%u6C29%u9609%u70DF%u76D0%u4E25%u5CA9%u989C%u960E%u8273%u8273%u538C%u781A%u5F66%u8C1A%u9A8C%u53A3%u8D5D%u4FE8%u5156%u8C33%u6079%u95EB%u917D%u9B47%u990D%u9F39%u9E2F%u6768%u626C%u75A1%u9633%u75D2%u517B%u6837%u7080%u7476%u6447%u5C27%u9065%u7A91%u8C23%u836F%u8F7A%u9E5E%u9CD0%u7237%u9875%u4E1A%u53F6%u9765%u8C12%u90BA%u6654%u70E8%u533B%u94F1%u9890%u9057%u4EEA%u8681%u827A%u4EBF%u5FC6%u4E49%u8BE3%u8BAE%u8C0A%u8BD1%u5F02%u7ECE%u8BD2%u5453%u5CC4%u9974%u603F%u9A7F%u7F22%u8F76%u8D3B%u9487%u9552%u9571%u7617%u8223%u836B%u9634%u94F6%u996E%u9690%u94DF%u763E%u6A31%u5A74%u9E70%u5E94%u7F28%u83B9%u8424%u8425%u8367%u8747%u8D62%u9896%u8314%u83BA%u8426%u84E5%u6484%u5624%u6EE2%u6F46%u748E%u9E66%u763F%u988F%u7F42%u54DF%u62E5%u4F63%u75C8%u8E0A%u548F%u955B%u4F18%u5FE7%u90AE%u94C0%u72B9%u8BF1%u83B8%u94D5%u9C7F%u8206%u9C7C%u6E14%u5A31%u4E0E%u5C7F%u8BED%u72F1%u8A89%u9884%u9A6D%u4F1B%u4FE3%u8C00%u8C15%u84E3%u5D5B%u996B%u9608%u59AA%u7EA1%u89CE%u6B24%u94B0%u9E46%u9E6C%u9F89%u9E33%u6E0A%u8F95%u56ED%u5458%u5706%u7F18%u8FDC%u6A7C%u9E22%u9F0B%u7EA6%u8DC3%u94A5%u7CA4%u60A6%u9605%u94BA%u90E7%u5300%u9668%u8FD0%u8574%u915D%u6655%u97F5%u90D3%u82B8%u607D%u6120%u7EAD%u97EB%u6B92%u6C32%u6742%u707E%u8F7D%u6512%u6682%u8D5E%u74D2%u8DB1%u933E%u8D43%u810F%u810F%u9A75%u51FF%u67A3%u8D23%u62E9%u5219%u6CFD%u8D5C%u5567%u5E3B%u7BA6%u8D3C%u8C2E%u8D60%u7EFC%u7F2F%u8F67%u94E1%u95F8%u6805%u8BC8%u658B%u503A%u6BE1%u76CF%u65A9%u8F97%u5D2D%u6808%u6218%u7EFD%u8C35%u5F20%u6DA8%u5E10%u8D26%u80C0%u8D75%u8BCF%u948A%u86F0%u8F99%u9517%u8FD9%u8C2A%u8F84%u9E67%u8D1E%u9488%u4FA6%u8BCA%u9547%u9635%u6D48%u7F1C%u6862%u8F78%u8D48%u796F%u9E29%u6323%u7741%u72F0%u4E89%u5E27%u75C7%u90D1%u8BC1%u8BE4%u5CE5%u94B2%u94EE%u7B5D%u7EC7%u804C%u6267%u7EB8%u631A%u63B7%u5E1C%u8D28%u6EDE%u9A98%u6809%u6800%u8F75%u8F7E%u8D3D%u9E37%u86F3%u7D77%u8E2C%u8E2F%u89EF%u949F%u7EC8%u79CD%u80BF%u4F17%u953A%u8BCC%u8F74%u76B1%u663C%u9AA4%u7EA3%u7EC9%u732A%u8BF8%u8BDB%u70DB%u77A9%u5631%u8D2E%u94F8%u9A7B%u4F2B%u69E0%u94E2%u4E13%u7816%u8F6C%u8D5A%u556D%u9994%u989E%u6869%u5E84%u88C5%u5986%u58EE%u72B6%u9525%u8D58%u5760%u7F00%u9A93%u7F12%u8C06%u51C6%u7740%u6D4A%u8BFC%u956F%u5179%u8D44%u6E0D%u8C18%u7F01%u8F8E%u8D40%u7726%u9531%u9F87%u9CBB%u8E2A%u603B%u7EB5%u506C%u90B9%u8BF9%u9A7A%u9CB0%u8BC5%u7EC4%u955E%u94BB%u7F35%u8E9C%u9CDF%u7FF1%u5E76%u5E76%u535C%u6C88%u4E11%u6DC0%u6597%u8303%u5E72%u768B%u7845%u67DC%u540E%u4F19%u79F8%u6770%u8BC0%u5938%u91CC%u51CC%u9709%u637B%u51C4%u6266%u5723%u5C38%u62AC%u6D82%u6D3C%u5582%u6C61%u9528%u54B8%u874E%u5F5D%u6D8C%u6E38%u5401%u5FA1%u613F%u5CB3%u4E91%u7076%u624E%u672D%u7B51%u4E8E%u5FD7%u6CE8%u96D5%u8BA0%u8C2B%u90C4%u51FC%u5742%u5785%u57B4%u57EF%u57DD%u82D8%u836C%u836E%u839C%u83BC%u83F0%u85C1%u63F8%u5412%u5423%u5494%u549D%u54B4%u5658%u567C%u56AF%u5E5E%u5C99%u5D74%u5FBC%u72B8%u72CD%u9980%u9987%u9993%u9995%u6123%u61B7%u61D4%u4E2C%u6E86%u6EDF%u6F24%u6F74%u6FB9%u752F%u7E9F%u7ED4%u7EF1%u73C9%u67A7%u684A%u69D4%u6A65%u8F71%u8F77%u8D4D%u80B7%u80E8%u98DA%u7173%u7145%u7198%u610D%u781C%u78D9%u770D%u949A%u94B7%u94D8%u94DE%u9503%u950D%u950E%u950F%u9518%u951D%u952A%u952B%u953F%u9545%u954E%u9562%u9565%u9569%u9572%u7A06%u9E4B%u9E5B%u9E71%u75AC%u75B4%u75D6%u766F%u88E5%u8941%u8022%u98A5%u87A8%u9EB4%u9C85%u9C86%u9C87%u9C9E%u9CB4%u9CBA%u9CBC%u9CCA%u9CCB%u9CD8%u9CD9%u9792%u97B4%u9F44%u78B0%u82CF%u51C0%u5899%u5DEF%u6052%u672F%u68C2%u75F9%u7934%u7962%u79D8%u7EE6%u80C4%u866C%u883C%u88E5%u8BC1%u9274%u94BB%u9508%u9555%u9655%u9965%u9C85%u5236%u50F5%u5446%u5F81%u5C1D%u6108%u54D7%u5B83%u6B32%u94FA%u7CFB%u7CFB%u91CC%u91C7%u8F9F%u90C1%u5E03%u5360%u771F%u5468%u9762%u677F");

    var str = "";
    var find;
    var clen = cc.length;
    if(mode=="t2s"){
        for (var i = 0; i < clen; i++) {
            var ch = cc.charAt(i);
            var rerr = new RegExp("[^\x00-\xff]");
            if (ch.search(rerr) == -1)
                find = -1;
            else
                find = fanti.indexOf(ch);
            if (find != -1)
                str += jianti.charAt(find);
            else
                str += ch;
        }

    }
    else if(mode=="s2t"){
        for (var i = 0; i < clen; i++) {
            var ch = cc.charAt(i);
            var rerr = new RegExp("[^\x00-\xff]");
            if (ch.search(rerr) == -1)
                find = -1;
            else
                find = jianti.indexOf(ch);
            if (find != -1)
                str += fanti.charAt(find);
            else
                str += ch;
        }

    }
    return str
}

function toggleFullScreen() {
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

function getLocation(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
}
/* 补零 */
function pad(num, n) {
    var i = (num + "").length;
    while(i++ < n) num = "0" + num;
    return num;
}

function request(object,func) {
    debug('requestUrl: '+object.url)
    var retries = 3;
    GM_xmlhttpRequest({
        method: object.method,
        url: object.url,
        data: object.data,
        headers: object.headers,
        overrideMimeType: object.charset,
        timeout:60000,
        //synchronous: true
        onload: function (responseDetails) {
            debug(responseDetails);
            if (responseDetails.status != 200&&responseDetails.status != 302) {
                // retry
                if (retries--) {          // *** Recurse if we still have retries
                    setTimeout(request,2000);
                    return;
                }
            }
            //Dowork
            func(responseDetails,object.other);
        },
        ontimeout: function (responseDetails) {
            debug(responseDetails);
            // retry
            if (retries--) {          // *** Recurse if we still have retries
                setTimeout(request,2000);
                return;
            }
            //Dowork
            func(responseDetails,object.other);

        },
        ononerror: function (responseDetails) {
            debug(responseDetails);
            // retry
            if (retries--) {          // *** Recurse if we still have retries
                setTimeout(request,2000);
                return;
            }
            //Dowork
            func(responseDetails,object.other);

        },
        onabort: function (responseDetails) {
            debug(responseDetails);
            // retry
            if (retries--) {          // *** Recurse if we still have retries
                setTimeout(request,2000);
                return;
            }
            //Dowork
            func(responseDetails,object.other);

        }
    })
}

function setUserPref(varName, defaultVal, menuText, promtText, sep){
    GM_registerMenuCommand(menuText, function() {
        var val = prompt(promtText, GM_getValue(varName, defaultVal));
        if (val === null)  { return; }  // end execution if clicked CANCEL
        // prepare string of variables separated by the separator
        if (sep && val){
            var pat1 = new RegExp('\\s*' + sep + '+\\s*', 'g'); // trim space/s around separator & trim repeated separator
            var pat2 = new RegExp('(?:^' + sep + '+|' + sep + '+$)', 'g'); // trim starting & trailing separator
            //val = val.replace(pat1, sep).replace(pat2, '');
        }
        //val = val.replace(/\s{2,}/g, ' ').trim();    // remove multiple spaces and trim
        GM_setValue(varName, val);
        // Apply changes (immediately if there are no existing highlights, or upon reload to clear the old ones)
        //if(!document.body.querySelector(".THmo")) THmo_doHighlight(document.body);
        //else location.reload();
    });
}



//core

function DanmakuPost(comment){
    var cid=GM_getValue("DanmakuLinkTucao").match(/https:\/\/www\.tucao\.one\/index\.php\?m=mukio&c=index&a=init&playerID=(\d*-\d*-\d*-\d*)/)[1];
    debug(cid);
    var url="https://www.tucao.one/index.php?m=mukio&c=index&a=post&playerID="+cid;
    var object=new ObjectRequest(url);
    object.method="POST";
    var time;
    if(document.location.href.includes('www.tucao.one')){
        time=parseInt(comment.stime/1000);
    }
    else {
        time=parseInt(comment.stime/1000)+TucaoDelay;
    }
    object.data=JSON.stringify({
        'message':encodeURIComponent(comment.text),
        'color':comment.color,
        'stime':time,
        'addtime':parseInt(new Date(). getTime()/1000),
        'token':'demo',
        'cid':cid,
        'mode':comment.mode,
        'size':comment.size,
        'user':'test',
        'datatype':'send'
    }).replace(/[\{\}]/g,'').replace(/"/g,'').replace(/,/g,'&').replace(/:/g,'=');
    debug(object.data);
    request(object,function (responseDetails) {
        var responseText=responseDetails.responseText;
        debug("Danmaku post result: "+responseText);
    });

}

function MessagePush(messages) {
    var Pushs;
    try {
        Pushs=JSON.parse(GM_getValue("Pushs"));
    } catch (e) {
        debug("Not set Pushs.");
    }
    if (Pushs == undefined||Pushs.length ==0) {
        Pushs = {};
    }
    debug(JSON.stringify(Pushs));
    messages.sort(function(a, b) {
        return a[1] - b[1];
    });
    var DisplayInterval=messages[messages.length-1][1]+100;
    debug("DisplayInterval: "+DisplayInterval);
    var count=1;
    var LasetTime=0;
    var MessageCheck=setInterval(function () {
        var message=messages[count-1];
        var AlreadyRepeat;
        if(Pushs[message[0]]!=undefined){
            AlreadyRepeat=parseInt(Pushs[message[0]]);
        }
        else{
            AlreadyRepeat=0;
        }
        if(count-1==messages.length){
            clearInterval(MessageCheck);
        }
        else if(message[2]==null||message[2]>AlreadyRepeat){
            var currentTime=parseInt(abp.video.currentTime*1000);
            debug("currentTime: "+currentTime);
            debug("LasetTime: "+LasetTime);
            if(currentTime>3000&&currentTime-LasetTime>DisplayInterval){
                debug(message[0]);
                abp.createPopup(message[0],message[1]);
                if(message[2]!=null){
                    Pushs[message[0]]=AlreadyRepeat+1;
                    GM_setValue("Pushs",JSON.stringify(Pushs));
                    debug(JSON.stringify(Pushs));

                }
                count++;
            }
                LasetTime=currentTime;
        }
        else if(message[2]==AlreadyRepeat){
            count++;

        }

    },DisplayInterval);

}

function ABP_Init(object){
    try{

        debug("ABP Init");
        //try ger value of danmaku speed
        var DanmakuSpeed;
        try{
            DanmakuSpeed=parseInt(GM_getValue("DanmakuSpeed").trim())||150;
        }catch(e){
            debug("Not set GM_Value.");
        }
        debug("DanmakuSpeed: " + DanmakuSpeed);
        //insert css
        var link=document.createElement("link");
        link.setAttribute("rel","stylesheet");
        link.setAttribute("type","text/css");
        link.setAttribute("href","https://jabbany.github.io/ABPlayerHTML5/dist/css/base.min.css");
        var head=document.querySelector("head");
        head.insertBefore(link,null);
        //abplayer init
        abp=ABP.create(object.VideoContainer, {
            "src":{
                "playlist":[
                    {
                        "video":object.video,
                        "comments":object.comments
                    }
                ]
            },
            "width":object.width,
            "height":object.height
        });
        var ABP_Unit=document.querySelector("div.ABP-Unit");
        var ABP_Control=ABP_Unit.querySelector("div.ABP-Control");
        var ABP_Text=ABP_Unit.querySelector("div.ABP-Text");
        var ABP_Video=ABP_Unit.querySelector("div.ABP-Video");
        var ButtonABP_Play=ABP_Unit.querySelector("div.button.ABP-Play");
        //click video play/pause
        ABP_Video.addEventListener("click",function () {
            ButtonABP_Play.click();
        });
        //mouse not move then hide control bar
        var timeout;
        var mousemove=function(){
            ABP_Control.style=" display: block;"
            ABP_Text.style=" display: block;"
            clearTimeout(timeout);

            timeout = setTimeout(function(){
                ABP_Control.style=" display: none;";
                ABP_Text.style=" display: none;";
            },1000);

        };
        //fullscreen button add event
        var ButtonFullscreen_ABP=ABP_Unit.querySelector("div.button.ABP-FullScreen");
        ButtonFullscreen_ABP.addEventListener("click",function (){
            //desktop fullscreen
            toggleFullScreen();
            //ABP_Video.style.width=ABP_Unit.offsetWidth+"px";
            //make video fit screen
            setTimeout(function(){
                ABP_Video.style.height=ABP_Unit.offsetHeight+"px";

            },500);
        });
        //trigger hide control bar
        ABP_Control.addEventListener('mouseover',function () {
            ABP_Video.removeEventListener("mousemove",mousemove);
            clearTimeout(timeout);

        });
        ABP_Text.addEventListener('mouseover',function () {
            ABP_Video.removeEventListener("mousemove",mousemove);
            clearTimeout(timeout);

        });
        ABP_Control.addEventListener('mouseout',function () {
            ABP_Video.addEventListener("mousemove",mousemove);

        });
        ABP_Text.addEventListener('mouseout',function () {
            ABP_Video.addEventListener("mousemove",mousemove);

        });
        //setting danmaku speed
        if (DanmakuSpeed != undefined&&DanmakuSpeed!=NaN&&DanmakuSpeed>=100&&DanmakuSpeed<=200) {
            debug("DanmakuSpeed: " + DanmakuSpeed);
            abp.cmManager.options.scroll.scale=DanmakuSpeed/100;
        }
        //input add event
        abp.txtText.addEventListener("keyup",InputLisener);
        //trigger message push function
        if(PushEnable){
            var CheckValue=setInterval(function () {
                if((TucaoEnable&&TucaoStatus!=0)||!TucaoEnable){
                    MessagePush(messages);
                    clearInterval(CheckValue);
                }

                },5000);
        }
    }
    catch (e) {
        debug("ABP Error: "+e);
    }

}

function GetDanmaku(func) {
    IsDownload=false;
    var DanmakuLink
    if(window.location.href.includes("i.animeone.me")||window.location.href.includes("v.anime1.me")){

        try{
            DanmakuLink=GM_getValue("DanmakuLink");
            DanmakuLink=DanmakuLink.match(matching);
        }
        catch(e){
            //debug("Error: "+ e);
        }
    }
    else{
        DanmakuLink=input.value.match(matching);
    }
    debug(DanmakuLink);
    if(DanmakuLink!=null){
        var sn;
        //not OtherInsertTucao
        if(DanmakuLink.length>1){
            //bahamut
            if(DanmakuLink[2]!=null){
                DanmakuLink=DanmakuLink[2];
                sn=DanmakuLink;
                DanmakuLink="https://ani.gamer.com.tw/ajax/danmuGet.php";
            }
            //bilibili
            else if(DanmakuLink[1]!=null){
                DanmakuLink=DanmakuLink[1];
            }
            //acfun
            else if(DanmakuLink[3]!=null){
                DanmakuLink=DanmakuLink[3];
            }
            //tucao
            else if(DanmakuLink[4]!=null){
                DanmakuLink=DanmakuLink[4];
            }

        }
        else{
            DanmakuLink=DanmakuLink[1];
        }
        debug("Open Danmaku Player");
        debug(DanmakuLink);
        var danmaku=new ObjectRequest(DanmakuLink);
        if(DanmakuLink.includes("https://ani.gamer.com.tw/ajax/danmuGet.php")){
            danmaku.method="POST";
            danmaku.data="sn="+sn;
        }
        request(danmaku,function (responseDetails) {
            var responseText = responseDetails.responseText;
            var comments = responseText;
            if(responseDetails.finalUrl.includes("https://ani.gamer.com.tw/ajax/danmuGet.php")){
                var json=JSON.parse(comments);
                debug("Comments: " + comments);
                var parser = new DOMParser();
                var xmlDoc   = parser.parseFromString('<?xml version="1.0" encoding="utf-8"?><i></i>', "application/xml");
                var root=xmlDoc.getElementsByTagName("i");
                for(var obj of Object.values( json)){
                    try{
                        var d=xmlDoc.createElement("d");
                        d.innerHTML=obj.text.replace(/[^\u4e00-\u9fa5`~\!@#\$%\^\*\(\)_\+\|\-=\\\{\}\[\]:";'\?,\.\/\w\d<>&\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u2605-\u2606\u2190-\u2195\u203B]/g,"").replace("<","&lt;").replace(">","&gt;").replace("&","&amp;");
                        var type;
                        if(obj.position==0){
                            type=1;
                        }
                        else if(obj.position==2){
                            type=4;
                        }
                        else if(obj.position==1){
                            type=5;
                        }
                        else{
                            type=6;
                        }
                        var time=obj.time/10;
                        if(window.location.href.includes("www.tucao.one")){
                            time=parseFloat(time)+parseFloat(TucaoDelay);
                        }
                        var p=time+","+type+",25,"+parseInt(obj.color.match(/#([\d\w]{6})/)[1],16)+",1550236858,0,55f99b31,12108265626271746";
                        d.setAttribute("p",p);
                        root[0].appendChild(d);

                    }
                    catch(e){
                        debug(e+" "+obj.text);
                        continue;
                    }
                }
                comments= (new XMLSerializer()).serializeToString(xmlDoc );
            }
            else if(responseDetails.finalUrl.includes("danmu.aixifan.com")){
                var json = JSON.parse(comments);
                    comments=AcfunParse(json);
            }
            else if(window.location.href.includes("www.tucao.one")&&responseDetails.finalUrl.includes("api.bilibili.com")){
                var parser = new DOMParser();
                var xmlDoc   = parser.parseFromString(comments, "application/xml");
                var nodes=xmlDoc.getElementsByTagName("d");
                for (var node of nodes) {
                    //debug(node.innerHTML);
                    var p=node.getAttribute("p");
                    //debug('p: '+p);
                    var params = p.split(",");
                    var time=params[0];
                    p=p.replace(time,parseFloat(time)+parseFloat(TucaoDelay));
                    //debug('p: '+p);
                    node.setAttribute('p',p);
                }
                comments= (new XMLSerializer()).serializeToString(xmlDoc );
            }
            else if(!window.location.href.includes("www.tucao.one")&&responseDetails.finalUrl.includes("tucao.one")){
                var parser = new DOMParser();
                var xmlDoc   = parser.parseFromString(comments, "application/xml");
                var nodes=xmlDoc.getElementsByTagName("d");
                for (var node of nodes) {
                    //debug(node.innerHTML);
                    var p=node.getAttribute("p");
                    //debug('p: '+p);
                    var params = p.split(",");
                    var time=params[0];
                    var _time=parseFloat(time)-parseFloat(TucaoDelay);
                    if(_time<0){
                        _time=0;
                    }
                    p=p.replace(time,_time);
                    //debug('p: '+p);
                    node.setAttribute('p',p);
                }
                comments= (new XMLSerializer()).serializeToString(xmlDoc );
            }

            //trigger insert tucao.one danmaku(and enable danmaku post function)
            if(TucaoEnable&&title!=null&&EpisodeCurrent!=null&&TucaoStatus==1){
                var DanmakuLink;
                try{
                    DanmakuLink=GM_getValue("DanmakuLinkTucao");
                }
                catch(e){
                    debug("OtherInsertTucao Error: "+ e);
                }
                debug('DanmakuLink: '+DanmakuLink);
                //this condition for anime1
                if(/(https:\/\/www\.tucao\.one\/index\.php\?m=mukio&c=index&a=init&playerID=\d*-\d*-\d*-\d*)/.test(DanmakuLink)) {
                    var danmaku=new ObjectRequest(DanmakuLink);
                    request(danmaku,function (responseDetails) {
                        var responseText = responseDetails.responseText;
                        var tucaoComments = responseText;
                    if(!window.location.href.includes("www.tucao.one")&&responseDetails.finalUrl.includes("tucao.one")){
                            var parser = new DOMParser();
                            var xmlDoc   = parser.parseFromString(tucaoComments, "application/xml");
                            var nodes=xmlDoc.getElementsByTagName("d");
                            for (var node of nodes) {
                                //debug(node.innerHTML);
                                var p=node.getAttribute("p");
                                //debug('p: '+p);
                                var params = p.split(",");
                                var time=params[0];
                                var _time=parseFloat(time)-parseFloat(TucaoDelay);
                                if(_time<0){
                                    _time=0;
                                }
                                p=p.replace(time,_time);
                                //debug('p: '+p);
                                node.setAttribute('p',p);
                            }
                        tucaoComments= (new XMLSerializer()).serializeToString(xmlDoc );
                        }
                        comments=OtherInsertTucao(tucaoComments, comments);
                        func(comments);
                    });
                    return;
                }
            }
            else {
                debug('here');
                if (TucaoEnable) {
                    messages.push(['[Error] tucao.one search failed, "!dm" unavailable.', 5000, null]);
                }
                func(comments);
            }
        });
        return true;
    }
}

function InputLisener(k) {
    if(abp.txtText !== null) {
        if (abp.txtText.value == null) return;
        if (/^!/.test(abp.txtText.value)) {
            abp.txtText.style.color = "#5DE534";
        } else {
            abp.txtText.style.color = "";
        }
        if (k != null && k.keyCode === 13) {
            debug("abp.txtText.value: "+abp.txtText.value);
            if (abp.txtText.value == "") return;
            if (/^!/.test(abp.txtText.value)) {
                /** Execute command **/
                var commandPrompts = abp.txtText.value.substring(1).split(":");
                var command = commandPrompts.shift();
                var DanmakuLink=GM_getValue('DanmakuLink');
                var title=DanmakuLink.match(/\[(.*)\] \[(.*)\] \[(.*)\]/)[2];
                switch (command) {
                    case "dmspd":
                    case "DmkSpd": {
                        if (commandPrompts.length < 1) {
                            abp.createPopup("Danmaku speed adjust：Persentage【 100% - 200% 】", 2000);
                        } else {
                            var pct = parseInt(commandPrompts[0]);
                            if (pct != NaN) {
                                var percentage = Math.min(Math.max(pct, 100), 200);
                                abp.cmManager.options.scroll.scale = percentage / 100;
                            }
                            if (abp.cmManager !== null) {
                                abp.cmManager.clear();
                            }
                        }
                    }
                        break;
                    case "dm":
                    case "danmaku": {
                        if (commandPrompts.length < 1) {
                            abp.createPopup("Post Danmaku: !dm:****** || !dm:******{{type,size,color}}", 2000);
                        } else {
                            var DanmakuLinkTucao=GM_getValue('DanmakuLinkTucao');
                            if (DanmakuLinkTucao!=undefined||null||'') {
                                var mode = 1;
                                var size = 25;
                                var text = commandPrompts[0];
                                var color = getRandomColor();
                                var params = commandPrompts[0].match(/\{\{(\w{3},\d{2},\w*)\}\}/);
                                if (params != null) {
                                    text = commandPrompts[0].replace(params[0], '');
                                    params = params[1].split(',');
                                    if (params.length == 3) {
                                        mode = params[0];
                                        size = params[1];
                                        color = params[2];
                                        if (!['12', '16', '18', "25", "36", "45", "64"].includes(size)) {
                                            abp.createPopup("[Error] size wrong.", 2000);

                                        }
                                        if (["L2R", "R2L", "btm", "top"].includes(mode)) {
                                            if (mode.toLowerCase() == "r2l") {
                                                mode = 1;
                                            }
                                            else if (mode.toLowerCase() == "btm") {
                                                mode = 4;
                                            }
                                            else if (mode.toLowerCase() == "top") {
                                                mode = 5;
                                            }
                                            else if (mode.toLowerCase() == "l2r") {
                                                mode = 6;
                                            }

                                        }
                                        else {
                                            abp.createPopup("[Error] type wrong.", 2000);

                                        }
                                        if (["black", "blue", "green", "orange", "pink", "purple", "red", "silver", "yellow", "white", "gold"].includes(color)) {

                                            if (color.toLowerCase() == "red") {
                                                color = "#ff0000";
                                            }
                                            else if (color.toLowerCase() == "silver") {
                                                color = "#c0c0c0";
                                            }
                                            else if (color.toLowerCase() == "yellow") {
                                                color = "#ffff00";
                                            }
                                            else if (color.toLowerCase() == "white") {
                                                color = "#ffffff";
                                            }
                                            else if (color.toLowerCase() == "gold") {
                                                color = "#ffd700";
                                            }
                                            else if (color.toLowerCase() == "black") {
                                                color = "#000000";
                                            }
                                            else if (color.toLowerCase() == "blue") {
                                                color = "#0000ff";
                                            }
                                            else if (color.toLowerCase() == "green") {
                                                color = "#008000";
                                            }
                                            else if (color.toLowerCase() == "orange") {
                                                color = "#ffa500";
                                            }
                                            else if (color.toLowerCase() == "pink") {
                                                color = "#ffc0cb";
                                            }
                                            else if (color.toLowerCase() == "purple") {
                                                color = "#800080";
                                            }
                                            else if (color.toLowerCase() == "red") {
                                                color = "#ff0000";
                                            }
                                            color = parseInt(color.match(/#([\d\w]{6})/)[1], 16);
                                        }
                                        else {
                                            abp.createPopup("[Error] parsed wrong color", 2000);

                                        }

                                    }
                                    else {
                                        abp.createPopup("[Error] wrong format. {{type,size,color}}.", 2000);
                                    }

                                }
                                var comment = {
                                    'text': text,
                                    'stime': abp.video.currentTime * 1000 - 1,// 比现在时间稍微慢一ms
                                    'mode': mode,//弹幕的模式：1～3 滚动弹幕 4 底端弹幕 5 顶端弹幕 6 逆向弹幕 7 精准定位 8 高级弹幕
                                    'color': color,
                                    'size': size,//字号：12 非常小 16 特小 18 小 25 中 36 大 45 很大 64 特别大
                                    'border': true
                                };
                                debug(comment);
                                abp.cmManager.time(abp.video.currentTime * 1000)
                                abp.cmManager.insert(comment);
                                abp.cmManager.send(comment);
                                DanmakuPost(comment);
                            }
                            else {
                                abp.createPopup('[Error] tucao.one search failed, "!dm" unavailable.', 2000);
                            }
                        }
                    }
                        break;
                    case "disqus":
                    case "anime1":
                    case "comment": {
                        if(window.location.href.includes("anime1.me")||window.location.href.includes("animeone.me")){
                            abp.createPopup('[Error] you already in anime1.me', 2000);

                        }
                        else {
                            if(title!=null&&EpisodeCurrent!=null){
                                Anime1Comment();
                            }
                            else{
                                abp.createPopup('[Error] Title or Episode unkown.', 2000);
                            }

                        }
                    }
                        break;
                    case "music": {
                        window.open("https://music.163.com/#/search/m/?s="+encodeURIComponent(title));
                    }
                        break;
                    case "wiki": {
                        window.open("https://zh.wikipedia.org/wiki/"+encodeURIComponent(title));
                    }
                        break;
                    case "fork": {
                        window.open("https://greasyfork.org/en/scripts/395158-anime1-danmaku");
                    }
                        break;
                    case "alias": {
                        var value=GM_getValue("AliasSetting")||null;
                        if (commandPrompts.length < 1) {
                            abp.createPopup("Current alias setting: "+value, 10000);
                        }
                        else {
                            if(commandPrompts[0]=="null"){
                                GM_setValue('AliasSetting',null);
                            }
                            else {
                                var matched=commandPrompts[0].match(/\{\{(\w*),?(.*)?\}\}/);
                                debug('matched: '+matched);
                                if(matched!=null){
                                    var site=matched[1].toLowerCase();
                                    debug('site: '+site);
                                    if(['acfun','bilibili','tucao','bahamut','anime1'].includes(site)){
                                        site=siteMapping(site,null);
                                        var alias=commandPrompts[0].replace(matched[0],"");

                                        var AliasSetting;
                                        if(value==null){
                                            AliasSetting={};
                                        }
                                        else{
                                            AliasSetting=JSON.parse(value);
                                        }
                                        if(AliasSetting[site]==undefined){
                                            AliasSetting[site]={};
                                        }
                                        if(matched[2]!=undefined){
                                            title=matched[2];
                                        }
                                        debug('title: '+title);
                                        if(title!=null){
                                            title=simplized(title);
                                            AliasSetting[site][title]=alias;
                                            if(AliasSetting[currentSite]==undefined){
                                                AliasSetting[currentSite]={};
                                            }
                                            AliasSetting[currentSite][alias]=title;

                                        }
                                        else {
                                            abp.createPopup("[Error] currentTitle not parsed.", 2000);

                                        }
                                        
                                        GM_setValue('AliasSetting',JSON.stringify(AliasSetting));
                                        abp.createPopup("Alias saved.", 2000);
                                    }
                                    else{
                                        abp.createPopup("[Error] parsed wrong site. [acfun|bilibili|tucao|bahamut|anime1]", 5000);

                                    }
                                }
                                else{
                                    abp.createPopup("[Error] Wrong format. {{targetSite}}targetTitle || {{targetSite,currentTitle}}targetTitle ", 5000);


                                }

                            }
                        }
                    }
                        break;
                    case "secret": {
                        RatingCheck();
                    }
                        break;
                    case "pixiv": {
                        var jtitle=CheckAlias('Japanese Title',title);
                        if(jtitle!=title){
                            pixiv();
                        }
                        else {
                            GetJaTitle(pixiv);

                        }
                    }
                        break;
                    case "source": {
                        danmakuSource=GM_getValue('danmakuSource');
                        if(danmakuSource!=null){
                            var DanmakuLink=GM_getValue('DanmakuLink');
                            var danmakuSite=DanmakuLink.match(/\[(.*)\] \[(.*)\] \[(.*)\]/)[1].toLowerCase();
                            window.open(danmakuSource[danmakuSite]);

                        }
                        else{
                            abp.createPopup('[Error] Not Search Danmaku, "!source" unavailable.', 2000);
                        }

                    }
                        break;
                    case "adult": {
                        window.open("https://sleazyfork.org/en/scripts?q=zhuzemin");
                    }
                        break;
                }
            }
        }
    }
}

function OtherInsertTucao(tucaoDanmaku,mainDanmaku){
    debug("OtherInsertTucao");
    var tucaoDanmaku=tucaoDanmaku.replace('</i>','')
        .replace('<?xml version="1.0" encoding="utf-8"?>','')
    .replace(/(<d p='[\.\d,]*'>)(.*<\/d>)/g,
        function(match, $1, $2, offset, original){ return $1+"[www.tucao.one]"+$2;});
    return mainDanmaku.replace('<i>',tucaoDanmaku);
}



window.addEventListener('DOMContentLoaded', init);
