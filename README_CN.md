# anime1_danmaku  
  
兼容性:  
Firefox/Chrome,  
Tampermonkey <--- !!!注意: Greasemonkey 4 不支持!  
  
这个脚本显示 弹幕 在 www.bimibimi.me / video.eyny.com / www.tucao.one,   
弹幕来自 bilibili.com / ani.gamer.com.tw / acfun.cn.  
  
用法:  
1: 点击按钮 "Search Danmaku",   
2: 等待搜索完成,   
3: 点击按钮  "Load Player",   
4: 观看动漫.  
  
  
其他指令:  
(*指令输入在播放器内的文字控)  
5: 下载弹幕: "Load Player"后, "Download Danmaku" 按钮会准备好, 用来下载弹幕以 ".ass" 文件.   
6: 音量调节: ↑↓(箭头键).  
7: 弹幕速度调节(100-200%): !dmspd:***   
8: 发送弹幕: !dm:******  
9: 发送弹幕用指定 模式/尺寸/颜色: !dm:******{{mode,size,color}}  
*模式: right/bottom/top  
*尺寸: 12/16/18/25/36/45/64  
*颜色: black/blue/green/orange/pink/purple/red/silver/yellow/white/gold  
10: 打开这个greasefork页: !fork  
11: 打开当前动漫wiki页: !wiki  
12: 搜索当前动漫主题歌: !music  
13: 打开弹幕来源页: !source  
14: 搜索当前动漫在pixiv: !pixiv  
  
  
注意:  
*双击搜索框会显示所有搜索结果, 你可以择一播放(或下载).  
*你可以不使用 "Search Danmaku", 作为替代 粘贴 "url" 到文字框, 然后会直接 "Load Player".  
"url" 类似:  
	https://api.bilibili.com/x/v1/dm/list.so?oid=******,  
	https://ani.gamer.com.tw/animeVideo.php?sn=******  
*但是因为脚本不知道title, 所以其他指令会失效.  
但是粘贴格式类似 "Search Result":  
	[Acfun] [成群逐队！西顿学园] [第4话] - http://danmu.aixifan.com/V2/11290983?pageSize=500&pageNo=1  
所有指令可生效.  
  
  
高级指令:  
13: 使用别名搜索: !alias:{{targetSite}}targetTitle  
*这个指令会储存一个别名对当前动漫,   
然后下次搜索请求针对目标网站时, 别名会替代原始title.  
示例: !alias:{{bilibili}}歌舞伎町シャーロック  
下次你观看 "歌舞伎町夏洛克", 脚本会尝试搜索 '歌舞伎町シャーロック'(从bilibili);  
*目标网站: acfun/bilibili/bahamut/tucao  
14: 使用 !alias 指定当前title: !alias:{{targetSite,currentTitle}}targetTitle  
15: 显示所有别名: !alias  
16: 清空别名: !alias:null  
  
  
秘密指令:  
17: 秘密指令针对给本脚本反馈的用户: !secret  
  
  
  
反馈:  
Twitter: https://twitter.com/zemin_zhu  
QQ Group: 32835999  
  
  
感谢:  
1.弹幕播放器: "ABPlayer" ---- https://github.com/jabbany/ABPlayerHTML5  
*我做了微小改变: 载入弹幕并非来自url, 取而代之读自string.(*为 CROS)  
2.弹幕下载: "Ass Danmaku" ---- https://github.com/tiansh/ass-danmaku  
*我修改了早期userscript版本, 让它支持新站.  
  
  
  
![01](https://github.com/zhuzemin/anime1_danmaku/raw/master/Get Danmaku Link.jpg)  
  
![02](https://github.com/zhuzemin/anime1_danmaku/raw/master/Screenshot-2020-1-31.jpg)  
  
![03](https://github.com/zhuzemin/anime1_danmaku/raw/master/Screenshot-2020-1-31(2).jpg)  
  
![04](https://github.com/zhuzemin/anime1_danmaku/raw/master/Screenshot-2020-1-31(3).jpg)  
  
![05](https://github.com/zhuzemin/anime1_danmaku/raw/master/2020-02-07_110851.jpg)  
  