# anime1_danmaku

Compatibility:
Firefox/Chrome,
Greasemonkey/Tampermonkey

This script can display and post Danmaku in "anime1.me" / "video.eyny.com" / "www.tucao.one", 
Danmaku from "bilibili.com" / "ani.gamer.com.tw" / "acfun.cn".

Usage:
1: Click Button "Search Danmaku", 
2: Wait for Search complete, 
3: Click Button "Load Player", 
4: Enjoy anime.


Other function:
5: Download Danmaku: After "Search Danmaku", "Download Danmaku" Button will be ready, it's use for download Danmaku as ".ass" file. 
6: Volume adjust: ¡ü¡ý(arrow key).
7: Danmaku speed adjust(temporally): use command: "!dmspd:***", 
*Type it in Input inside Player, "***" mean percentage of speed for Danmaku, (100-200%), more larger more slower, default: 150.
8: Post Danmaku: "!dm:******", 
*Specify Danmaku type/size/color: "!dm:******{{type,size,color}}", 
*Type: L2R/R2L/btm/top, Size: 12/16/18/25/36/45/64, Color: black/blue/green/orange/pink/purple/red/silver/yellow/white/gold.
9: Open Disqus(anime1.me): !comment
10: Open this userscript greasyfork page: !fork
11: Open current Anime wiki page: !wiki
12: Search current Anime theme song: !music

Notice:
*Post Danmaku work base "www.tucao.one", Danmaku from "tucao.one" will add mark "[www.tucao.one]".
*Double click Input will show all search result, you can select one to display(or download).
*you can don't use "Search Danmaku", instead paste "url" in Input, then will directly Load Player.
"url" like:
	https://api.bilibili.com/x/v1/dm/list.so?oid=******,
	https://ani.gamer.com.tw/animeVideo.php?sn=******
*but because script disn't know title, so other function will be unavailable.
but if input like "Search Result" format:
	[³ÉÈºÖð¶Ó£¡Î÷¶ÙÑ§Ô°] [µÚ4»°] - http://danmu.aixifan.com/V2/11290983?pageSize=500&pageNo=1
all function will be available.


Advanced command:
13: Use alias for search: !alias:{{targetSite}}targetTitle
*this command will store a alias of current anime, 
then next search request send to the defined site, the alias will replace origin title.
Example: !alias:{{bilibili}}¸èÎè¼¿î®¥·¥ã©`¥í¥Ã¥¯
then next time you watching "¸èÎè¼¿î®ÏÄÂå¿Ë", the script will try search '¸èÎè¼¿î®¥·¥ã©`¥í¥Ã¥¯'(from bilibili);
*targetSite: acfun/bilibili/bahamut/tucao/anime1
14: when before "Load Player" not use "Search Danmaku": !alias:{{targetSite,currentTitle}}targetTitle
15: Show all stored alias: !alias
16: Clear all alias: !alias:null
*I planning store some alias in script, if you can help me, will be grateful!



Feedback:
QQ Group: 32835999

![01](https://github.com/zhuzemin/anime1_danmaku/raw/master/Get Danmaku Link.jpg)

![02](https://github.com/zhuzemin/anime1_danmaku/raw/master/Screenshot-2020-1-31.jpg)

![03](https://github.com/zhuzemin/anime1_danmaku/raw/master/Screenshot-2020-1-31(2).jpg)

![04](https://github.com/zhuzemin/anime1_danmaku/raw/master/Screenshot-2020-1-31(3).jpg)
