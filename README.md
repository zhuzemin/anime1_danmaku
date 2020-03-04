# anime1_danmaku

Compatibility:
Firefox/Chrome,
Tampermonkey <--- !!!Attention: Greasemonkey 4 was not support!

This script display and post danmaku in anime1.me / video.eyny.com / www.tucao.one  / www.silisili.me, 
danmaku from bilibili.com / ani.gamer.com.tw / acfun.cn.

Usage:
1: Click button "Search Danmaku", 
2: Wait for search complete, 
3: Click button "Load Player", 
4: Enjoy anime.


Other command:
(*Command type in text input inside player)
5: Download danmaku: after "Load Player", "Download Danmaku" button will be ready, it's use for download danmaku as ".ass" file. 
6: Volume adjust: ¡ü¡ý(arrow key).
7: Danmaku speed adjust(100-200%): !dmspd:*** 
8: Post danmaku: !dm:******
9: Post danmaku with specify mode/size/color: !dm:******{{mode,size,color}}
*Mode: right/bottom/top
*Size: 12/16/18/25/36/45/64
*Color: black/blue/green/orange/pink/purple/red/silver/yellow/white/gold
9: Current anime on anime1.me page: !anime1
10: Open this userscript greasyfork page: !fork
11: Open current anime wiki page: !wiki
12: Search current anime theme song: !music
13: Danmaku source page: !source
14: Search anime in pixiv: !pixiv


Notice:
*Double click Input will show all search result, you can select one to display(or download).
*you can don't use "Search Danmaku", instead paste "url" in Input, then will directly load player.
"url" like:
	https://api.bilibili.com/x/v1/dm/list.so?oid=******,
	https://ani.gamer.com.tw/animeVideo.php?sn=******
*but because script doesn't know title, so other function will be unavailable.
but if input like "Search Result" format:
	[Acfun] [³ÉÈºÖð¶Ó£¡Î÷¶ÙÑ§Ô°] [µÚ4»°] - http://danmu.aixifan.com/V2/11290983?pageSize=500&pageNo=1
all function will be available.


Advanced command:
13: Use alias for search: !alias:{{targetSite}}targetTitle
*this command will store a alias of current anime, 
then next search request send to the defined site, the alias will replace origin title.
Example: !alias:{{bilibili}}¸èÎè¼¿î®¥·¥ã©`¥í¥Ã¥¯
then next time you watching "¸èÎè¼¿î®ÏÄÂå¿Ë", the script will try search '¸èÎè¼¿î®¥·¥ã©`¥í¥Ã¥¯'(from bilibili);
*targetSite: acfun/bilibili/bahamut/tucao/anime1
14: use !alias when not use "Search Danmaku": !alias:{{targetSite,currentTitle}}targetTitle
15: Show all stored alias: !alias
16: Clear all alias: !alias:null


Secret command:
17: a secret command for who rating this userscript: !secret



Feedback:
Twitter: https://twitter.com/zemin_zhu
QQ Group: 32835999


Thanks:
1.Danmaku Player: "ABPlayer" ---- https://github.com/jabbany/ABPlayerHTML5
*I made tiny modified: load Danmaku not from url, instead read from string.(*for CROS)
2.Danmaku download: "Ass Danmaku" ---- https://github.com/tiansh/ass-danmaku
*I modified early userscript version, make it support new site.



![01](https://github.com/zhuzemin/anime1_danmaku/raw/master/Get Danmaku Link.jpg)

![02](https://github.com/zhuzemin/anime1_danmaku/raw/master/Screenshot-2020-1-31.jpg)

![03](https://github.com/zhuzemin/anime1_danmaku/raw/master/Screenshot-2020-1-31(2).jpg)

![04](https://github.com/zhuzemin/anime1_danmaku/raw/master/Screenshot-2020-1-31(3).jpg)

![05](https://github.com/zhuzemin/anime1_danmaku/raw/master/2020-02-07_110851.jpg)
