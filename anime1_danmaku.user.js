// ==UserScript==
// @name        anime1 Danmaku
// @namespace   anime1_danmaku
// @supportURL  https://github.com/zhuzemin
// @description anime1 显示弹幕(bilibili.com / ani.gamer.com.tw)
// @include     https://anime1.me/*
// @include     https://i.animeone.me/*
// @include     https://v.anime1.me/watch?v=*
// @include     http://video.eyny.com/*
// @include     http://www.bilibili.com/video/av*
// @include     http://bangumi.bilibili.com/movie/*
// @include     https://www.bilibili.com/video/av*
// @include     https://www.bilibili.com/bangumi/play/*
// @include     https://ani.gamer.com.tw/animeVideo.php?sn=*
// @version     1.5
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
// ==/UserScript==
/*!Copyright(c) CommentCoreLibrary v0.11.0-rc.1 (//github.com/jabbany/CommentCoreLibrary) - Licensed under the MIT License */
var BinArray=function(){var t={};return t.bsearch=function(t,e,r){if(!Array.isArray(t))throw new Error("Bsearch can only be run on arrays");if(0===t.length)return 0;if(r(e,t[0])<0)return 0;if(r(e,t[t.length-1])>=0)return t.length;for(var i=0,n=0,o=0,s=t.length-1;i<=s;){if(n=Math.floor((s+i+1)/2),o++,r(e,t[n-1])>=0&&r(e,t[n])<0)return n;if(r(e,t[n-1])<0)s=n-1;else{if(!(r(e,t[n])>=0))throw new Error("Program Error. Inconsistent comparator or unsorted array!");i=n}if(o>1500)throw new Error("Iteration depth exceeded. Inconsistent comparator or astronomical dataset!")}return-1},t.binsert=function(e,r,i){var n=t.bsearch(e,r,i);return e.splice(n,0,r),n},t}(),CommentUtils;!function(t){var e=function(){function t(t){if(this._internalArray=null,!Array.isArray(t))throw new Error("Not an array. Cannot construct matrix.");if(16!=t.length)throw new Error("Illegal Dimensions. Matrix3D should be 4x4 matrix.");this._internalArray=t}return Object.defineProperty(t.prototype,"flatArray",{get:function(){return this._internalArray.slice(0)},set:function(t){throw new Error("Not permitted. Matrices are immutable.")},enumerable:!0,configurable:!0}),t.prototype.isIdentity=function(){return this.equals(t.identity())},t.prototype.dot=function(e){for(var r=this._internalArray.slice(0),i=e._internalArray.slice(0),n=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],o=0;o<4;o++)for(var s=0;s<4;s++)for(var a=0;a<4;a++)n[4*o+s]+=r[4*o+a]*i[4*a+s];return new t(n)},t.prototype.equals=function(t){for(var e=0;e<16;e++)if(this._internalArray[e]!==t._internalArray[e])return!1;return!0},t.prototype.toCss=function(){for(var t=this._internalArray.slice(0),e=0;e<t.length;e++)Math.abs(t[e])<1e-6&&(t[e]=0);return"matrix3d("+t.join(",")+")"},t.identity=function(){return new t([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])},t.createScaleMatrix=function(e,r,i){return new t([e,0,0,0,0,r,0,0,0,0,i,0,0,0,0,1])},t.createRotationMatrix=function(e,r,i){var n=Math.PI/180,o=r*n,s=i*n,a=Math.cos,h=Math.sin;return new t([a(o)*a(s),a(o)*h(s),h(o),0,-h(s),a(s),0,0,-h(o)*a(s),-h(o)*h(s),a(o),0,0,0,0,1].map(function(t){return 1e-10*Math.round(1e10*t)}))},t}();t.Matrix3D=e}(CommentUtils||(CommentUtils={}));var __extends=this&&this.__extends||function(t,e){function r(){this.constructor=t}for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i]);t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)},CoreComment=function(){function t(e,r){if(void 0===r&&(r={}),this.mode=1,this.stime=0,this.text="",this.ttl=4e3,this.dur=4e3,this.cindex=-1,this.motion=[],this.movable=!0,this._alphaMotion=null,this.absolute=!0,this.align=0,this.axis=0,this._alpha=1,this._size=25,this._color=16777215,this._border=!1,this._shadow=!0,this._font="",this._transform=null,!e)throw new Error("Comment not bound to comment manager.");if(this.parent=e,r.hasOwnProperty("stime")&&(this.stime=r.stime),r.hasOwnProperty("mode")?this.mode=r.mode:this.mode=1,r.hasOwnProperty("dur")&&(this.dur=r.dur,this.ttl=this.dur),this.dur*=this.parent.options.global.scale,this.ttl*=this.parent.options.global.scale,r.hasOwnProperty("text")&&(this.text=r.text),r.hasOwnProperty("motion")){this._motionStart=[],this._motionEnd=[],this.motion=r.motion;for(var i=0,n=0;n<r.motion.length;n++){this._motionStart.push(i);var o=0;for(var s in r.motion[n]){var a=r.motion[n][s];o=Math.max(a.dur,o),null!==a.easing&&void 0!==a.easing||(r.motion[n][s].easing=t.LINEAR)}i+=o,this._motionEnd.push(i)}this._curMotion=0}r.hasOwnProperty("color")&&(this._color=r.color),r.hasOwnProperty("size")&&(this._size=r.size),r.hasOwnProperty("border")&&(this._border=r.border),r.hasOwnProperty("opacity")&&(this._alpha=r.opacity),r.hasOwnProperty("alpha")&&(this._alphaMotion=r.alpha),r.hasOwnProperty("font")&&(this._font=r.font),r.hasOwnProperty("x")&&(this._x=r.x),r.hasOwnProperty("y")&&(this._y=r.y),r.hasOwnProperty("shadow")&&(this._shadow=r.shadow),r.hasOwnProperty("align")&&(this.align=r.align),r.hasOwnProperty("axis")&&(this.axis=r.axis),r.hasOwnProperty("transform")&&(this._transform=new CommentUtils.Matrix3D(r.transform)),r.hasOwnProperty("position")&&"relative"===r.position&&(this.absolute=!1,this.mode<7&&console.warn("Using relative position for CSA comment."))}return t.prototype.init=function(t){void 0===t&&(t=null),this.dom=null!==t?t.dom:document.createElement("div"),this.dom.className=this.parent.options.global.className,this.dom.appendChild(document.createTextNode(this.text)),this.dom.textContent=this.text,this.dom.innerText=this.text,this.size=this._size,16777215!=this._color&&(this.color=this._color),this.shadow=this._shadow,this._border&&(this.border=this._border),""!==this._font&&(this.font=this._font),void 0!==this._x&&(this.x=this._x),void 0!==this._y&&(this.y=this._y),(1!==this._alpha||this.parent.options.global.opacity<1)&&(this.alpha=this._alpha),null===this._transform||this._transform.isIdentity()||(this.transform=this._transform.flatArray),this.motion.length>0&&this.animate()},Object.defineProperty(t.prototype,"x",{get:function(){return null!==this._x&&void 0!==this._x||(this.axis%2==0?this.align%2==0?this._x=this.dom.offsetLeft:this._x=this.dom.offsetLeft+this.width:this.align%2==0?this._x=this.parent.width-this.dom.offsetLeft:this._x=this.parent.width-this.dom.offsetLeft-this.width),this.absolute?this._x:this._x/this.parent.width},set:function(t){this._x=t,this.absolute||(this._x*=this.parent.width),this.axis%2==0?this.dom.style.left=this._x+(this.align%2==0?0:-this.width)+"px":this.dom.style.right=this._x+(this.align%2==0?-this.width:0)+"px"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"y",{get:function(){return null!==this._y&&void 0!==this._y||(this.axis<2?this.align<2?this._y=this.dom.offsetTop:this._y=this.dom.offsetTop+this.height:this.align<2?this._y=this.parent.height-this.dom.offsetTop:this._y=this.parent.height-this.dom.offsetTop-this.height),this.absolute?this._y:this._y/this.parent.height},set:function(t){this._y=t,this.absolute||(this._y*=this.parent.height),this.axis<2?this.dom.style.top=this._y+(this.align<2?0:-this.height)+"px":this.dom.style.bottom=this._y+(this.align<2?-this.height:0)+"px"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"bottom",{get:function(){var t=Math.floor(this.axis/2)===Math.floor(this.align/2);return this.y+(t?this.height:0)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"right",{get:function(){var t=this.axis%2==this.align%2;return this.x+(t?this.width:0)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"width",{get:function(){return null!==this._width&&void 0!==this._width||(this._width=this.dom.offsetWidth),this._width},set:function(t){this._width=t,this.dom.style.width=this._width+"px"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"height",{get:function(){return null!==this._height&&void 0!==this._height||(this._height=this.dom.offsetHeight),this._height},set:function(t){this._height=t,this.dom.style.height=this._height+"px"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"size",{get:function(){return this._size},set:function(t){this._size=t,this.dom.style.fontSize=this._size+"px"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"color",{get:function(){return this._color},set:function(t){this._color=t;var e=t.toString(16);e=e.length>=6?e:new Array(6-e.length+1).join("0")+e,this.dom.style.color="#"+e,0===this._color&&(this.dom.className=this.parent.options.global.className+" rshadow")},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"alpha",{get:function(){return this._alpha},set:function(t){this._alpha=t,this.dom.style.opacity=Math.min(this._alpha,this.parent.options.global.opacity)+""},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"border",{get:function(){return this._border},set:function(t){this._border=t,this._border?this.dom.style.border="1px solid #00ffff":this.dom.style.border="none"},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"shadow",{get:function(){return this._shadow},set:function(t){this._shadow=t,this._shadow||(this.dom.className=this.parent.options.global.className+" noshadow")},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"font",{get:function(){return this._font},set:function(t){this._font=t,this._font.length>0?this.dom.style.fontFamily=this._font:this.dom.style.fontFamily=""},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"transform",{get:function(){return this._transform.flatArray},set:function(t){this._transform=new CommentUtils.Matrix3D(t),null!==this.dom&&(this.dom.style.transform=this._transform.toCss())},enumerable:!0,configurable:!0}),t.prototype.time=function(t){this.ttl-=t,this.ttl<0&&(this.ttl=0),this.movable&&this.update(),this.ttl<=0&&this.finish()},t.prototype.update=function(){this.animate()},t.prototype.invalidate=function(){this._x=null,this._y=null,this._width=null,this._height=null},t.prototype._execMotion=function(t,e){for(var r in t)if(t.hasOwnProperty(r)){var i=t[r];this[r]=i.easing(Math.min(Math.max(e-i.delay,0),i.dur),i.from,i.to-i.from,i.dur)}},t.prototype.animate=function(){if(this._alphaMotion&&(this.alpha=(this.dur-this.ttl)*(this._alphaMotion.to-this._alphaMotion.from)/this.dur+this._alphaMotion.from),0!==this.motion.length){var t=Math.max(this.ttl,0),e=this.dur-t-this._motionStart[this._curMotion];return this._execMotion(this.motion[this._curMotion],e),this.dur-t>this._motionEnd[this._curMotion]?void(++this._curMotion>=this.motion.length&&(this._curMotion=this.motion.length-1)):void 0}},t.prototype.stop=function(){},t.prototype.finish=function(){this.parent.finish(this)},t.prototype.toString=function(){return["[",this.stime,"|",this.ttl,"/",this.dur,"]","(",this.mode,")",this.text].join("")},t.LINEAR=function(t,e,r,i){return t*r/i+e},t}(),ScrollComment=function(t){function e(e,r){t.call(this,e,r),this.dur*=this.parent.options.scroll.scale,this.ttl*=this.parent.options.scroll.scale}return __extends(e,t),Object.defineProperty(e.prototype,"alpha",{set:function(t){this._alpha=t,this.dom.style.opacity=Math.min(Math.min(this._alpha,this.parent.options.global.opacity),this.parent.options.scroll.opacity)+""},enumerable:!0,configurable:!0}),e.prototype.init=function(e){void 0===e&&(e=null),t.prototype.init.call(this,e),this.x=this.parent.width,this.parent.options.scroll.opacity<1&&(this.alpha=this._alpha),this.absolute=!0},e.prototype.update=function(){this.x=this.ttl/this.dur*(this.parent.width+this.width)-this.width},e}(CoreComment),__extends=this&&this.__extends||function(t,e){function r(){this.constructor=t}for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i]);t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)},CssCompatLayer=function(){function t(){}return t.transform=function(t,e){t.style.transform=e,t.style.webkitTransform=e,t.style.msTransform=e,t.style.oTransform=e},t}(),CssScrollComment=function(t){function e(){t.apply(this,arguments),this._dirtyCSS=!0}return __extends(e,t),Object.defineProperty(e.prototype,"x",{get:function(){return this.ttl/this.dur*(this.parent.width+this.width)-this.width},set:function(t){if(null!==this._x&&"number"==typeof this._x){var e=t-this._x;this._x=t,CssCompatLayer.transform(this.dom,"translateX("+(this.axis%2==0?e:-e)+"px)")}else this._x=t,this.absolute||(this._x*=this.parent.width),this.axis%2==0?this.dom.style.left=this._x+(this.align%2==0?0:-this.width)+"px":this.dom.style.right=this._x+(this.align%2==0?-this.width:0)+"px"},enumerable:!0,configurable:!0}),e.prototype.update=function(){this._dirtyCSS&&(this.dom.style.transition="transform "+this.ttl+"ms linear",this.x=-this.width,this._dirtyCSS=!1)},e.prototype.invalidate=function(){t.prototype.invalidate.call(this),this._dirtyCSS=!0},e.prototype.stop=function(){t.prototype.stop.call(this),this.dom.style.transition="",this.x=this._x,this._x=null,this.x=this.x,this._dirtyCSS=!0},e}(ScrollComment),CommentFactory=function(){function t(){this._bindings={}}return t._simpleCssScrollingInitializer=function(t,e){var r=new CssScrollComment(t,e);switch(r.mode){case 1:r.align=0,r.axis=0;break;case 2:r.align=2,r.axis=2;break;case 6:r.align=1,r.axis=1}return r.init(),t.stage.appendChild(r.dom),r},t._simpleScrollingInitializer=function(t,e){var r=new ScrollComment(t,e);switch(r.mode){case 1:r.align=0,r.axis=0;break;case 2:r.align=2,r.axis=2;break;case 6:r.align=1,r.axis=1}return r.init(),t.stage.appendChild(r.dom),r},t._simpleAnchoredInitializer=function(t,e){var r=new CoreComment(t,e);switch(r.mode){case 4:r.align=2,r.axis=2;break;case 5:r.align=0,r.axis=0}return r.init(),t.stage.appendChild(r.dom),r},t._advancedCoreInitializer=function(t,e){var r=new CoreComment(t,e);return r.init(),r.transform=CommentUtils.Matrix3D.createRotationMatrix(0,e.rY,e.rZ).flatArray,t.stage.appendChild(r.dom),r},t.defaultFactory=function(){var e=new t;return e.bind(1,t._simpleScrollingInitializer),e.bind(2,t._simpleScrollingInitializer),e.bind(6,t._simpleScrollingInitializer),e.bind(4,t._simpleAnchoredInitializer),e.bind(5,t._simpleAnchoredInitializer),e.bind(7,t._advancedCoreInitializer),e.bind(17,t._advancedCoreInitializer),e},t.defaultCssRenderFactory=function(){var e=new t;return e.bind(1,t._simpleCssScrollingInitializer),e.bind(2,t._simpleCssScrollingInitializer),e.bind(6,t._simpleCssScrollingInitializer),e.bind(4,t._simpleAnchoredInitializer),e.bind(5,t._simpleAnchoredInitializer),e.bind(7,t._advancedCoreInitializer),e.bind(17,t._advancedCoreInitializer),e},t.defaultCanvasRenderFactory=function(){throw new Error("Not implemented")},t.defaultSvgRenderFactory=function(){throw new Error("Not implemented")},t.prototype.bind=function(t,e){this._bindings[t]=e},t.prototype.canCreate=function(t){return this._bindings.hasOwnProperty(t.mode)},t.prototype.create=function(t,e){if(null===e||!e.hasOwnProperty("mode"))throw new Error("Comment format incorrect");if(!this._bindings.hasOwnProperty(e.mode))throw new Error("No binding for comment type "+e.mode);return this._bindings[e.mode](t,e)},t}(),__extends=this&&this.__extends||function(t,e){function r(){this.constructor=t}for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i]);t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)},CommentSpaceAllocator=function(){function t(t,e){void 0===t&&(t=0),void 0===e&&(e=0),this._pools=[[]],this.avoid=1,this._width=t,this._height=e}return t.prototype.willCollide=function(t,e){return t.stime+t.ttl>=e.stime+e.ttl/2},t.prototype.pathCheck=function(t,e,r){for(var i=t+e.height,n=e.right,o=0;o<r.length;o++)if(!(r[o].y>i||r[o].bottom<t)){if(!(r[o].right<e.x||r[o].x>n))return!1;if(this.willCollide(r[o],e))return!1}return!0},t.prototype.assign=function(t,e){for(;this._pools.length<=e;)this._pools.push([]);var r=this._pools[e];if(0===r.length)return t.cindex=e,0;if(this.pathCheck(0,t,r))return t.cindex=e,0;for(var i=0,n=0;n<r.length&&!((i=r[n].bottom+this.avoid)+t.height>this._height);n++)if(this.pathCheck(i,t,r))return t.cindex=e,i;return this.assign(t,e+1)},t.prototype.add=function(t){t.height>this._height?(t.cindex=-2,t.y=0):(t.y=this.assign(t,0),BinArray.binsert(this._pools[t.cindex],t,function(t,e){return t.bottom<e.bottom?-1:t.bottom>e.bottom?1:0}))},t.prototype.remove=function(t){if(!(t.cindex<0)){if(t.cindex>=this._pools.length)throw new Error("cindex out of bounds");var e=this._pools[t.cindex].indexOf(t);e<0||this._pools[t.cindex].splice(e,1)}},t.prototype.setBounds=function(t,e){this._width=t,this._height=e},t}(),AnchorCommentSpaceAllocator=function(t){function e(){t.apply(this,arguments)}return __extends(e,t),e.prototype.add=function(e){t.prototype.add.call(this,e),e.x=(this._width-e.width)/2},e.prototype.willCollide=function(t,e){return!0},e.prototype.pathCheck=function(t,e,r){for(var i=t+e.height,n=0;n<r.length;n++)if(!(r[n].y>i||r[n].bottom<t))return!1;return!0},e}(CommentSpaceAllocator),CommentManager=function(){function t(t){var e=0;this._listeners={},this._lastPosition=0,this.stage=t,this.options={global:{opacity:1,scale:1,className:"cmt"},scroll:{opacity:1,scale:1},limit:0},this.timeline=[],this.runline=[],this.position=0,this.limiter=0,this.factory=null,this.filter=null,this.csa={scroll:new CommentSpaceAllocator(0,0),top:new AnchorCommentSpaceAllocator(0,0),bottom:new AnchorCommentSpaceAllocator(0,0),reverse:new CommentSpaceAllocator(0,0),scrollbtm:new CommentSpaceAllocator(0,0)},this.width=this.stage.offsetWidth,this.height=this.stage.offsetHeight,this._startTimer=function(){if(!(e>0)){var t=(new Date).getTime(),r=this;e=window.setInterval(function(){var e=(new Date).getTime()-t;t=(new Date).getTime(),r.onTimerEvent(e,r)},10)}},this._stopTimer=function(){window.clearInterval(e),e=0}}var e=function(t,e){return t.stime>e.stime?2:t.stime<e.stime?-2:t.date>e.date?1:t.date<e.date?-1:null!=t.dbid&&null!=e.dbid?t.dbid>e.dbid?1:t.dbid<e.dbid?-1:0:0};return t.prototype.stop=function(){this._stopTimer(),this.runline.forEach(function(t){t.stop()})},t.prototype.start=function(){this._startTimer()},t.prototype.seek=function(t){this.position=BinArray.bsearch(this.timeline,t,function(t,e){return t<e.stime?-1:t>e.stime?1:0})},t.prototype.validate=function(t){return null!=t&&this.filter.doValidate(t)},t.prototype.load=function(t){this.timeline=t,this.timeline.sort(e),this.dispatchEvent("load")},t.prototype.insert=function(t){BinArray.binsert(this.timeline,t,e)<=this.position&&this.position++,this.dispatchEvent("insert")},t.prototype.clear=function(){for(;this.runline.length>0;)this.runline[0].finish();this.dispatchEvent("clear")},t.prototype.setBounds=function(){this.width=this.stage.offsetWidth,this.height=this.stage.offsetHeight,this.dispatchEvent("resize");for(var t in this.csa)this.csa[t].setBounds(this.width,this.height);this.stage.style.perspective=this.width/Math.tan(55*Math.PI/180)/2+"px",this.stage.style.webkitPerspective=this.width/Math.tan(55*Math.PI/180)/2+"px"},t.prototype.init=function(t){if(this.setBounds(),null==this.filter&&(this.filter=new CommentFilter),null==this.factory)switch(t){case"legacy":this.factory=CommentFactory.defaultFactory();break;default:case"css":this.factory=CommentFactory.defaultCssRenderFactory()}},t.prototype.time=function(t){if(t-=1,this.position>=this.timeline.length||Math.abs(this._lastPosition-t)>=2e3){if(this.seek(t),this._lastPosition=t,this.timeline.length<=this.position)return}else this._lastPosition=t;for(;this.position<this.timeline.length&&this.timeline[this.position].stime<=t;this.position++)this.options.limit>0&&this.runline.length>this.limiter||this.validate(this.timeline[this.position])&&this.send(this.timeline[this.position])},t.prototype.rescale=function(){},t.prototype.send=function(t){if(8===t.mode)return console.log(t),void(this.scripting&&console.log(this.scripting.eval(t.code)));if(null==this.filter||null!=(t=this.filter.doModify(t))){var e=this.factory.create(this,t);switch(e.mode){default:case 1:this.csa.scroll.add(e);break;case 2:this.csa.scrollbtm.add(e);break;case 4:this.csa.bottom.add(e);break;case 5:this.csa.top.add(e);break;case 6:this.csa.reverse.add(e);break;case 7:case 17:}e.y=e.y,this.dispatchEvent("enterComment",e),this.runline.push(e)}},t.prototype.finish=function(t){this.dispatchEvent("exitComment",t),this.stage.removeChild(t.dom);var e=this.runline.indexOf(t);switch(e>=0&&this.runline.splice(e,1),t.mode){default:case 1:this.csa.scroll.remove(t);break;case 2:this.csa.scrollbtm.remove(t);break;case 4:this.csa.bottom.remove(t);break;case 5:this.csa.top.remove(t);break;case 6:this.csa.reverse.remove(t);break;case 7:}},t.prototype.addEventListener=function(t,e){void 0!==this._listeners[t]?this._listeners[t].push(e):this._listeners[t]=[e]},t.prototype.dispatchEvent=function(t,e){if(void 0!==this._listeners[t])for(var r=0;r<this._listeners[t].length;r++)try{this._listeners[t][r](e)}catch(t){console.err(t.stack)}},t.prototype.onTimerEvent=function(t,e){for(var r=0;r<e.runline.length;r++)e.runline[r].time(t)},t}(),CommentFilter=function(){function t(e,r){for(var i=e.subject.split("."),n=r;i.length>0;){var o=i.shift();if(""!==o&&(n.hasOwnProperty(o)&&(n=n[o]),null===n||void 0===n)){n=null;break}}if(null===n)return!0;switch(e.op){case"<":return n<e.value;case">":return n>e.value;case"~":case"regexp":return new RegExp(e.value).test(n.toString());case"=":case"eq":return e.value===("number"==typeof n?n:n.toString());case"NOT":return!t(e.value,n);case"AND":return!!Array.isArray(e.value)&&e.value.every(function(e){return t(e,n)});case"OR":return!!Array.isArray(e.value)&&e.value.some(function(e){return t(e,n)});default:return!1}}function e(){this.rules=[],this.modifiers=[],this.allowUnknownTypes=!0,this.allowTypes={1:!0,2:!0,4:!0,5:!0,6:!0,7:!0,8:!0,17:!0}}return e.prototype.doModify=function(t){return this.modifiers.reduce(function(t,e){return e(t)},t)},e.prototype.beforeSend=function(t){return t},e.prototype.doValidate=function(e){return!((!this.allowUnknownTypes||e.mode.toString()in this.allowTypes)&&!this.allowTypes[e.mode.toString()])&&this.rules.every(function(r){try{i=t(r,e)}catch(t){var i=!1}return"accept"===r.mode?i:!i})},e.prototype.addRule=function(t){if("accept"!==t.mode&&"reject"!==t.mode)throw new Error("Rule must be of accept type or reject type.");this.rules.push(t)},e.prototype.addModifier=function(t){if("function"!=typeof t)throw new Error("Modifiers need to be functions.");this.modifiers.push(t)},e}(),CommentProvider=function(){function t(){this._started=!1,this._destroyed=!1,this._staticSources={},this._dynamicSources={},this._parsers={},this._targets=[]}return t.SOURCE_JSON="JSON",t.SOURCE_XML="XML",t.SOURCE_TEXT="TEXT",t.BaseHttpProvider=function(t,e,r,i,n){return new Promise(function(o,s){var a=new XMLHttpRequest,h=e;if(i&&("POST"===t||"PUT"===t)){h+="?";var l=[];for(var p in i)i.hasOwnProperty(p)&&l.push(encodeURIComponent(p)+"="+encodeURIComponent(i[p]));h+=l.join("&")}a.onload=function(){this.status>=200&&this.status<300?o(this.response):s(new Error(this.status+" "+this.statusText))},a.onerror=function(){s(new Error(this.status+" "+this.statusText))},a.open(t,h),a.responseType="string"==typeof r?r:"",void 0!==n?a.send(n):a.send()})},t.JSONProvider=function(e,r,i,n){return t.BaseHttpProvider(e,r,"json",i,n).then(function(t){return t})},t.XMLProvider=function(e,r,i,n){return t.BaseHttpProvider(e,r,"document",i,n).then(function(t){return t})},t.TextProvider=function(e,r,i,n){return t.BaseHttpProvider(e,r,"text",i,n).then(function(t){return t})},t.prototype.addStaticSource=function(t,e){if(this._destroyed)throw new Error("Comment provider has been destroyed, cannot attach more sources.");return e in this._staticSources||(this._staticSources[e]=[]),this._staticSources[e].push(t),this},t.prototype.addDynamicSource=function(t,e){if(this._destroyed)throw new Error("Comment provider has been destroyed, cannot attach more sources.");return e in this._dynamicSources||(this._dynamicSources[e]=[]),this._dynamicSources[e].push(t),this},t.prototype.addTarget=function(t){if(this._destroyed)throw new Error("Comment provider has been destroyed, cannot attach more targets.");if(!(t instanceof CommentManager))throw new Error("Expected the target to be an instance of CommentManager.");return this._targets.push(t),this},t.prototype.addParser=function(t,e){if(this._destroyed)throw new Error("Comment provider has been destroyed, cannot attach more parsers.");return e in this._parsers||(this._parsers[e]=[]),this._parsers[e].unshift(t),this},t.prototype.applyParsersOne=function(t,e){return new Promise(function(r,i){if(e in this._parsers){for(var n=0;n<this._parsers[e].length;n++){var o=null;try{o=this._parsers[e][n].parseOne(t)}catch(t){console.error(t)}if(null!==o)return void r(o)}i(new Error("Ran out of parsers for they target type"))}else i(new Error('No parsers defined for "'+e+'"'))}.bind(this))},t.prototype.applyParsersList=function(t,e){return new Promise(function(r,i){if(e in this._parsers){for(var n=0;n<this._parsers[e].length;n++){var o=null;try{o=this._parsers[e][n].parseMany(t)}catch(t){console.error(t)}if(null!==o)return void r(o)}i(new Error("Ran out of parsers for the target type"))}else i(new Error('No parsers defined for "'+e+'"'))}.bind(this))},t.prototype.load=function(){if(this._destroyed)throw new Error("Cannot load sources on a destroyed provider.");var t=[];for(var e in this._staticSources)t.push(Promises.any(this._staticSources[e]).then(function(t){return this.applyParsersList(t,e)}.bind(this)));return 0===t.length?Promise.resolve([]):Promises.any(t).then(function(t){for(var e=0;e<this._targets.length;e++)this._targets[e].load(t);return Promise.resolve(t)}.bind(this))},t.prototype.start=function(){if(this._destroyed)throw new Error("Cannot start a provider that has been destroyed.");return this._started=!0,this.load().then(function(t){for(var e in this._dynamicSources)this._dynamicSources[e].forEach(function(t){t.addEventListener("receive",function(t){for(var r=0;r<this._targets.length;r++)this._targets[r].send(this.applyParserOne(t,e))}.bind(this))}.bind(this));return Promise.resolve(t)}.bind(this))},t.prototype.send=function(t,e){throw new Error("Not implemented")},t.prototype.destroy=function(){return this._destroyed?Promise.resolve():(this._destroyed=!0,Promise.resolve())},t}(),Promises=function(){var t={};return t.any=function(t){return Array.isArray(t)?0===t.length?Promise.reject():new Promise(function(e,r){for(var i=!1,n=0,o=[],s=0;s<t.length;s++)t[s].then(function(t){n++,i||(i=!0,e(t))}).catch(function(e){return function(s){n++,o[e]=s,n===t.length&&(i||r(o))}}(s))}):Promise.resolve(t)},t}(),BilibiliFormat=function(){var t={},e=function(t){return t.replace(/\t/,"\\t")},r=function(t){if("["!==t.charAt(0))return t;switch(t.charAt(t.length-1)){case"]":return t;case'"':return t+"]";case",":return t.substring(0,t.length-1)+'"]';default:return r(t.substring(0,t.length-1))}},i=function(t){return t=t.replace(new RegExp("</([^d])","g"),"</disabled $1"),t=t.replace(new RegExp("</(S{2,})","g"),"</disabled $1"),t=t.replace(new RegExp("<([^d/]W*?)","g"),"<disabled $1"),t=t.replace(new RegExp("<([^/ ]{2,}W*?)","g"),"<disabled $1")};return t.XMLParser=function(t){this._attemptFix=!0,this._logBadComments=!0,"object"==typeof t&&(this._attemptFix=!1!==t.attemptFix,this._logBadComments=!1!==t.logBadComments)},t.XMLParser.prototype.parseOne=function(t){try{var i=t.getAttribute("p").split(",")}catch(t){return null}var n=t.textContent,o={};if(o.stime=Math.round(1e3*parseFloat(i[0])),o.size=parseInt(i[2]),o.color=parseInt(i[3]),o.mode=parseInt(i[1]),o.date=parseInt(i[4]),o.pool=parseInt(i[5]),o.position="absolute",null!=i[7]&&(o.dbid=parseInt(i[7])),o.hash=i[6],o.border=!1,o.mode<7)o.text=n.replace(/(\/n|\\n|\n|\r\n)/g,"\n");else if(7===o.mode)try{this._attemptFix&&(n=e(r(n)));var s=JSON.parse(n);if(o.shadow=!0,o.x=parseFloat(s[0]),o.y=parseFloat(s[1]),(Math.floor(o.x)<o.x||Math.floor(o.y)<o.y)&&(o.position="relative"),o.text=s[4].replace(/(\/n|\\n|\n|\r\n)/g,"\n"),o.rZ=0,o.rY=0,s.length>=7&&(o.rZ=parseInt(s[5],10),o.rY=parseInt(s[6],10)),o.motion=[],o.movable=!1,s.length>=11){o.movable=!0;var a=500,h={x:{from:o.x,to:parseFloat(s[7]),dur:a,delay:0},y:{from:o.y,to:parseFloat(s[8]),dur:a,delay:0}};if(""!==s[9]&&(a=parseInt(s[9],10),h.x.dur=a,h.y.dur=a),""!==s[10]&&(h.x.delay=parseInt(s[10],10),h.y.delay=parseInt(s[10],10)),s.length>11&&(o.shadow="false"!==s[11]&&!1!==s[11],null!=s[12]&&(o.font=s[12]),s.length>14)){"relative"===o.position&&(this._logBadComments&&console.warn("Cannot mix relative and absolute positioning!"),o.position="absolute");for(var l=s[14],p={x:h.x.from,y:h.y.from},c=[],u=new RegExp("([a-zA-Z])\\s*(\\d+)[, ](\\d+)","g"),d=l.split(/[a-zA-Z]/).length-1,m=u.exec(l);null!==m;){switch(m[1]){case"M":p.x=parseInt(m[2],10),p.y=parseInt(m[3],10);break;case"L":c.push({x:{from:p.x,to:parseInt(m[2],10),dur:a/d,delay:0},y:{from:p.y,to:parseInt(m[3],10),dur:a/d,delay:0}}),p.x=parseInt(m[2],10),p.y=parseInt(m[3],10)}m=u.exec(l)}h=null,o.motion=c}null!==h&&o.motion.push(h)}o.dur=2500,s[3]<12&&(o.dur=1e3*s[3]);var f=s[2].split("-");if(null!=f&&f.length>1){var y=parseFloat(f[0]),g=parseFloat(f[1]);o.opacity=y,y!==g&&(o.alpha={from:y,to:g})}}catch(t){this._logBadComments&&(console.warn("Error occurred in JSON parsing. Could not parse comment."),console.log("[DEBUG] "+n))}else 8===o.mode?o.code=n:this._logBadComments&&(console.warn("Unknown comment type : "+o.mode+". Not doing further parsing."),console.log("[DEBUG] "+n));return null!==o.text&&"string"==typeof o.text&&(o.text=o.text.replace(/\u25a0/g,"█")),o},t.XMLParser.prototype.parseMany=function(t){var e=[];try{e=t.getElementsByTagName("d")}catch(t){return null}for(var r=[],i=0;i<e.length;i++){var n=this.parseOne(e[i]);null!==n&&r.push(n)}return r},t.TextParser=function(e){this._allowInsecureDomParsing=!0,this._attemptEscaping=!0,this._canSecureNativeParse=!1,"object"==typeof e&&(this._allowInsecureDomParsing=!1!==e.allowInsecureDomParsing,this._attemptEscaping=!1!==e.attemptEscaping),"undefined"!=typeof document&&document&&document.createElement||(this._allowInsecureDomParsing=!1),"undefined"!=typeof DOMParser&&null!==DOMParser&&(this._canSecureNativeParse=!0),(this._allowInsecureDomParsing||this._canSecureNativeParse)&&(this._xmlParser=new t.XMLParser(e))},t.TextParser.prototype.parseOne=function(t){if(this._allowInsecureDomParsing){var e=t;this._attemptEscaping&&(e=i(e));var r=document.createElement("div");r.innerHTML=e;var n=r.getElementsByTagName("d");return 1!==n.length?null:this._xmlParser.parseOne(n[0])}if(this._canSecureNativeParse){var o=new DOMParser;return this._xmlParser.parseOne(o.parseFromString(t,"application/xml"))}throw new Error("Secure native js parsing not implemented yet.")},t.TextParser.prototype.parseMany=function(t){if(this._allowInsecureDomParsing){var e=t;this._attemptEscaping&&(e=i(e));var r=document.createElement("div");return r.innerHTML=e,this._xmlParser.parseMany(r)}if(this._canSecureNativeParse){var n=new DOMParser;return this._xmlParser.parseMany(n.parseFromString(t,"application/xml"))}throw new Error("Secure native js parsing not implemented yet.")},t}(),AcfunFormat=function(){var t={};return t.JSONParser=function(t){this._logBadComments=!0,this._logNotImplemented=!1,"object"==typeof t&&(this._logBadComments=!1!==t.logBadComments,this._logNotImplemented=!0===t.logNotImplemented)},t.JSONParser.prototype.parseOne=function(t){var e={};if("object"!=typeof t||null==t||!t.hasOwnProperty("c"))return null;var r=t.c.split(",");if(r.length>=6){if(e.stime=1e3*parseFloat(r[0]),e.color=parseInt(r[1]),e.mode=parseInt(r[2]),e.size=parseInt(r[3]),e.hash=r[4],e.date=parseInt(r[5]),e.position="absolute",7!==e.mode)e.text=t.m.replace(/(\/n|\\n|\n|\r\n|\\r)/g,"\n"),e.text=e.text.replace(/\r/g,"\n"),e.text=e.text.replace(/\s/g," ");else{try{var i=JSON.parse(t.m)}catch(t){return this._logBadComments&&(console.warn("Error parsing internal data for comment"),console.log("[Dbg] "+e.text)),null}if(e.position="relative",e.text=i.n,e.text=e.text.replace(/\ /g," "),"number"==typeof i.a?e.opacity=i.a:e.opacity=1,"object"==typeof i.p?(e.x=i.p.x/1e3,e.y=i.p.y/1e3):(e.x=0,e.y=0),"number"==typeof i.c)switch(i.c){case 0:e.align=0;break;case 2:e.align=1;break;case 6:e.align=2;break;case 8:e.align=3;break;default:this._logNotImplemented&&console.log("Cannot handle aligning to center! AlignMode="+i.c)}if(e.axis=0,e.shadow=i.b,e.dur=4e3,"number"==typeof i.l&&(e.dur=1e3*i.l),null!=i.z&&i.z.length>0){e.movable=!0,e.motion=[];for(var n=0,o={x:e.x,y:e.y,alpha:e.opacity,color:e.color},s=0;s<i.z.length;s++){var a=null!=i.z[s].l?1e3*i.z[s].l:500;n+=a;var h={};i.z[s].hasOwnProperty("rx")&&"number"==typeof i.z[s].rx&&this._logNotImplemented&&console.log("Encountered animated x-axis rotation. Ignoring."),i.z[s].hasOwnProperty("e")&&"number"==typeof i.z[s].e&&this._logNotImplemented&&console.log("Encountered animated y-axis rotation. Ignoring."),i.z[s].hasOwnProperty("d")&&"number"==typeof i.z[s].d&&this._logNotImplemented&&console.log("Encountered animated z-axis rotation. Ignoring."),i.z[s].hasOwnProperty("x")&&"number"==typeof i.z[s].x&&(h.x={from:o.x,to:i.z[s].x/1e3,dur:a,delay:0}),i.z[s].hasOwnProperty("y")&&"number"==typeof i.z[s].y&&(h.y={from:o.y,to:i.z[s].y/1e3,dur:a,delay:0}),o.x=h.hasOwnProperty("x")?h.x.to:o.x,o.y=h.hasOwnProperty("y")?h.y.to:o.y,i.z[s].hasOwnProperty("t")&&"number"==typeof i.z[s].t&&i.z[s].t!==o.alpha&&(h.alpha={from:o.alpha,to:i.z[s].t,dur:a,delay:0},o.alpha=h.alpha.to),i.z[s].hasOwnProperty("c")&&"number"==typeof i.z[s].c&&i.z[s].c!==o.color&&(h.color={from:o.color,to:i.z[s].c,dur:a,delay:0},o.color=h.color.to),e.motion.push(h)}e.dur=n+(e.moveDelay?e.moveDelay:0)}i.hasOwnProperty("w")&&(i.w.hasOwnProperty("f")&&(e.font=i.w.f),i.w.hasOwnProperty("l")&&Array.isArray(i.w.l)&&i.w.l.length>0&&this._logNotImplemented&&console.log("[Dbg] Filters not supported! "+JSON.stringify(i.w.l))),null!=i.r&&null!=i.k&&(e.rX=i.r,e.rY=i.k)}return e}return this._logBadComments&&(console.warn("Dropping this comment due to insufficient parameters. Got: "+r.length),console.log("[Dbg] "+t.c)),null},t.JSONParser.prototype.parseMany=function(t){if(!Array.isArray(t))return null;for(var e=[],r=0;r<t.length;r++){var i=this.parseOne(t[r]);null!==i&&e.push(i)}return e},t.TextParser=function(e){this._jsonParser=new t.JSONParser(e)},t.TextParser.prototype.parseOne=function(t){try{return this._jsonParser.parseOne(JSON.parse(t))}catch(t){return console.warn(t),null}},t.TextParser.prototype.parseMany=function(t){try{return this._jsonParser.parseMany(JSON.parse(t))}catch(t){return console.warn(t),null}},t}(),CommonDanmakuFormat=function(){var t={},e=function(t){return"number"==typeof t.mode&&"number"==typeof t.stime&&((8!==t.mode||"string"==typeof t.code)&&"string"==typeof t.text)};return t.JSONParser=function(){},t.JSONParser.prototype.parseOne=function(t){return e(t)?t:null},t.JSONParser.prototype.parseMany=function(t){return t.every(e)?t:null},t.XMLParser=function(){},t.XMLParser.prototype.parseOne=function(t){var e={};try{e.stime=parseInt(t.getAttribute("stime")),e.mode=parseInt(t.getAttribute("mode")),e.size=parseInt(t.getAttribute("size")),e.color=parseInt(t.getAttribute("color")),e.text=t.textContent}catch(t){return null}return e},t.XMLParser.prototype.parseMany=function(t){try{var e=t.getElementsByTagName("comment")}catch(t){return null}for(var r=[],i=0;i<e.length;i++){var n=this.parseOne(e[i]);null!==n&&r.push(n)}return r},t}();


function isMobile(){var e,t=!1;return e=navigator.userAgent||navigator.vendor||window.opera,(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(e)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(e.substr(0,4)))&&(t=!0),t}var CommentLoader=function(){var e=function(){this.parseOne=function(){throw new Error("Not Implemented")},this.parseMany=function(){throw new Error("Not Implemented")}},t=["text/xml","text/plain","application/json"],a=function(t){this._commentManager=t,this._responseType="text/xml",this._parser=new e};return a.prototype.setParser=function(e){return this._parser=e,this},a.prototype.setType=function(e){if(t.indexOf(e)<0)throw new Error("Unknown type: "+e);return this._responseType=e,this},a.prototype._fetch=function(e,t){return fetch(t,{method:e}).then(function(e){if(!e.ok)throw new Error("HTTP error, status = "+e.status);if("application/json"===this._responseType)return e.json();if("text/plain"===this._responseType)return e.text();if("text/xml"===this._responseType)return e.text().then(function(e){return(new DOMParser).parseFromString(e,this._responseType)}.bind(this));throw new Error("Unrecognized response type")}.bind(this))},a.prototype.load=function(e,t){return new Promise(function(e,a){e((new DOMParser).parseFromString(t,"text/xml"))}).then(function(e){return this._parser.parseMany(e)}.bind(this)).then(function(e){this._commentManager.load(e)}.bind(this)).catch(function(e){alert(e)})},a}(),ABP={version:"0.8.0"};!function(){"use strict";if(ABP){var e=function(e,t,a,n){var i=null;if("text"===e)return document.createTextNode(t);for(var r in i=document.createElement(e),t)if("style"!==r&&"className"!==r)i.setAttribute(r,t[r]);else if("className"===r)i.className=t[r];else for(var o in t.style)i.style[o]=t.style[o];if(a)for(var s=0;s<a.length;s++)null!=a[s]&&i.appendChild(a[s]);return n&&"function"==typeof n&&n(i),i},t=function(e,t){return null!=e&&e.className.split(" ").indexOf(t)>=0},a=function(e,t){var a={};for(var n in t)e&&void 0!==e[n]?a[n]=e[n]:a[n]=t[n];return a};ABP.create=function(n,i){var r,o=n;if(i||(i={}),i=a(i,{replaceMode:!0,width:512,height:384,src:"",mobile:!1}),"string"==typeof n&&(r=n,o=document.getElementById(r)),t(o,"ABP-Unit"))s=o;else{var s=e("div",{className:"ABP-Unit",style:{width:i.width+"px",height:i.height+"px"}});o.appendChild(s)}s.children.length>0&&i.replaceMode&&(s.innerHTML="");var l=[],d=[];if("string"==typeof i.src)i.src=e("video",{autobuffer:"true",dataSetup:"{}"},[e("source",{src:i.src})]),l.push(i.src);else if(i.src.hasOwnProperty("playlist"))for(var c=i.src.playlist,u=0;u<c.length;u++){if(c[u].hasOwnProperty("sources")){var m=[];for(var p in c[u].sources)m.push(e("source",{src:c[u].sources[p],type:p}));l.push(e("video",{autobuffer:"true",dataSetup:"{}"},m))}else c[u].hasOwnProperty("video")?l.push(c[u].video):console.log("No recognized format");d.push(c[u].comments)}else l.push(i.src);s.appendChild(e("div",{className:"ABP-Video",tabindex:"10"},[e("div",{className:"ABP-Container"}),l[0]])),s.appendChild(e("div",{className:"ABP-Text"},[e("input",{type:"text"})])),s.appendChild(e("div",{className:"ABP-Control"},[e("div",{className:"button ABP-Play"}),e("div",{className:"progress-bar"},[e("div",{className:"bar dark"}),e("div",{className:"bar"})]),e("div",{className:"button ABP-CommentShow"}),e("div",{className:"button ABP-FullScreen"})]));var v=ABP.bind(s,i.mobile);if(l.length>0){v.loader=new CommentLoader(v.cmManager).setParser(new BilibiliFormat.XMLParser);var h=l[0];v.gotoNext=function(){var e=l.indexOf(h)+1;if(e<l.length){(h=l[e]).style.display="";var t=v.video.parentNode;t.removeChild(v.video),t.appendChild(h),v.video.style.display="none",v.video=h,v.swapVideo(h),h.addEventListener("ended",function(){v.gotoNext()})}e<d.length&&null!==d[e]&&v.loader.load("GET",d[e])},h.addEventListener("ended",function(){v.gotoNext()}),d.length>0&&v.loader.load("GET",d[0])}return v},ABP.load=function(e,t,a,n){},ABP.bind=function(n,i,r){var o={btnPlay:null,barTime:null,barLoad:null,divComment:null,btnFull:null,btnDm:null,video:null,divTextField:null,txtText:null,cmManager:null,defaults:{w:0,h:0},state:a(r,{fullscreen:!1,commentVisible:!0,allowRescale:!1,autosize:!1}),createPopup:function(t,a){if(!0===n.hasPopup)return!1;var i=e("div",{className:"ABP-Popup"},[e("text",t)]);return i.remove=function(){i.isRemoved||(i.isRemoved=!0,n.removeChild(i),n.hasPopup=!1)},n.appendChild(i),n.hasPopup=!0,"number"==typeof a&&setTimeout(function(){i.remove()},a),i},removePopup:function(){for(var e=n.getElementsByClassName("ABP-Popup"),t=0;t<e.length;t++)null!=e[t].remove?e[t].remove():e[t].parentNode.removeChild(e[t]);n.hasPopup=!1},swapVideo:null};if(o.swapVideo=function(e){e.addEventListener("timeupdate",function(){x||(o.barTime.style.width=e.currentTime/e.duration*100+"%")}),e.addEventListener("ended",function(){o.btnPlay.className="button ABP-Play",o.barTime.style.width="0%"}),e.addEventListener("progress",function(){if(null!=this.buffered){try{this.buffered.start(0);var e=this.buffered.end(0)}catch(e){return}var t=e/this.duration*100;o.barLoad.style.width=t+"%"}}),e.addEventListener("loadedmetadata",function(){if(null!=this.buffered){try{this.buffered.start(0);var e=this.buffered.end(0)}catch(e){return}var t=e/this.duration*100;o.barLoad.style.width=t+"%"}}),e.isBound=!0;var t=0;o.cmManager&&(o.cmManager.clear(),e.addEventListener("progress",function(){t==e.currentTime?(e.hasStalled=!0,o.cmManager.stop()):t=e.currentTime}),window&&window.addEventListener("resize",function(){o.cmManager.setBounds()}),e.addEventListener("timeupdate",function(){!1!==o.cmManager.display&&(e.hasStalled&&(o.cmManager.start(),e.hasStalled=!1),o.cmManager.time(Math.floor(1e3*e.currentTime)))}),e.addEventListener("play",function(){o.cmManager.start();try{var e=this.buffered.end(0)/this.duration*100;o.barLoad.style.width=e+"%"}catch(e){}}),e.addEventListener("ratechange",function(){null!=o.cmManager.def.globalScale&&0!==e.playbackRate&&(o.cmManager.def.globalScale=1/e.playbackRate,o.cmManager.rescale())}),e.addEventListener("pause",function(){o.cmManager.stop()}),e.addEventListener("waiting",function(){o.cmManager.stop()}),e.addEventListener("playing",function(){o.cmManager.start()}))},null!==n&&null!==n.getElementsByClassName){o.defaults.w=n.offsetWidth,o.defaults.h=n.offsetHeight;var s=n.getElementsByClassName("ABP-Video");if(!(s.length<=0)){var l=null;for(var d in s[0].children)if(null!=s[0].children[d].tagName&&"VIDEO"===s[0].children[d].tagName.toUpperCase()){l=s[0].children[d];break}s[0]&&i&&(s[0].style.bottom="0px");var c=s[0].getElementsByClassName("ABP-Container");if(c.length>0&&(o.divComment=c[0]),null!==l){o.video=l;var u=n.getElementsByClassName("ABP-Play");if(!(u.length<=0)){o.btnPlay=u[0];var m=n.getElementsByClassName("progress-bar");if(!(m.length<=0)){o.barHitArea=m[0];var p=m[0].getElementsByClassName("bar");o.barTime=p[0],o.barLoad=p[1];var v=n.getElementsByClassName("ABP-FullScreen");if(!(v.length<=0)){o.btnFull=v[0];var h=n.getElementsByClassName("ABP-Text");if(h.length>0){o.divTextField=h[0];var f=h[0].getElementsByTagName("input");f.length>0&&(o.txtText=f[0])}var g=n.getElementsByClassName("ABP-CommentShow");if(g.length>0&&(o.btnDm=g[0]),"undefined"!=typeof CommentManager&&(o.cmManager=new CommentManager(o.divComment),o.cmManager.display=!0,o.cmManager.init(),o.cmManager.clear(),window&&window.addEventListener("resize",function(){o.cmManager.setBounds()})),i){var y=n.getElementsByClassName("ABP-Control");y.length>0&&(o.controlBar=y[0]);var b=-1,M=function(){o.controlBar.style.display="none",o.divTextField.style.display="none",o.divComment.style.bottom="0px",o.cmManager.setBounds()};o.divComment.style.bottom=o.controlBar.offsetHeight+o.divTextField.offsetHeight+"px";var w=function(){o.controlBar.style.display="",o.divTextField.style.display="",o.divComment.style.bottom=o.controlBar.offsetHeight+o.divTextField.offsetHeight+"px";try{-1!=b&&(clearInterval(b),b=-1),b=setInterval(function(){document.activeElement!==o.txtText&&(M(),clearInterval(b),b=-1)},2500)}catch(e){console.log(e)}};n.addEventListener("touchmove",w),n.addEventListener("mousemove",w),b=setTimeout(function(){M()},4e3)}if(!0!==l.isBound){o.swapVideo(l),o.btnFull.addEventListener("click",function(){o.state.fullscreen=t(n,"ABP-FullScreen"),o.state.fullscreen?function(e,t){if(null!=e){var a=e.className.split(" ");a.indexOf(t)>=0&&a.splice(a.indexOf(t),1),e.className=a.join(" ")}}(n,"ABP-FullScreen"):function(e,t){if(null!=e){var a=e.className.split(" ");a.indexOf(t)<0&&a.push(t),e.className=a.join(" ")}}(n,"ABP-FullScreen"),o.state.fullscreen=!o.state.fullscreen,o.cmManager&&o.cmManager.setBounds(),o.state.allowRescale&&(o.state.fullscreen?o.defaults.w>0&&(o.cmManager.def.scrollScale=n.offsetWidth/o.defaults.w):o.cmManager.def.scrollScale=1)}),o.btnDm.addEventListener("click",function(){0==o.cmManager.display?(o.cmManager.display=!0,o.cmManager.start()):(o.cmManager.display=!1,o.cmManager.clear(),o.cmManager.stop())}),o.barTime.style.width="0%";var x=!1;o.barHitArea.addEventListener("mousedown",function(e){x=!0}),document.addEventListener("mouseup",function(e){x=!1}),o.barHitArea.addEventListener("mouseup",function(e){x=!1;var t=e.layerX/this.offsetWidth*o.video.duration;Math.abs(t-o.video.currentTime)>4&&o.cmManager&&o.cmManager.clear(),o.video.currentTime=t}),o.barHitArea.addEventListener("mousemove",function(e){x&&(o.barTime.style.width=100*e.layerX/this.offsetWidth+"%")}),o.btnPlay.addEventListener("click",function(){o.video.paused?(o.video.play(),this.className="button ABP-Play ABP-Pause"):(o.video.pause(),this.className="button ABP-Play")}),n.addEventListener("keydown",function(e){e&&32==e.keyCode&&document.activeElement!==o.txtText&&(o.btnPlay.click(),e.preventDefault())}),n.addEventListener("touchmove",function(e){event.preventDefault()});var P=null;n.addEventListener("touchstart",function(e){e.targetTouches.length>0&&(P=e.targetTouches[0])}),n.addEventListener("touchend",function(e){if(e.changedTouches.length>0&&null!=P){var t=e.changedTouches[0].pageX-P.pageX,a=e.changedTouches[0].pageY-P.pageY;if(Math.abs(t)<20&&Math.abs(a)<20)return void(P=null);Math.abs(t)>3*Math.abs(a)?t>0?o.video.paused&&o.btnPlay.click():o.video.paused||o.btnPlay.click():Math.abs(a)>3*Math.abs(t)&&(o.video.volume=a<0?Math.min(1,o.video.volume+.1):Math.max(0,o.video.volume-.1)),P=null}})}if(null!==o.txtText&&o.txtText.addEventListener("keyup",function(e){if(null!=this.value)if(/^!/.test(this.value)?this.style.color="#5DE534":this.style.color="",null!=e&&13===e.keyCode){if(""==this.value)return;if(/^!/.test(this.value)){var t=this.value.substring(1).split(":");switch(t.shift()){case"help":o.createPopup("提示信息：",2e3);break;case"speed":case"rate":case"spd":if(t.length<1)o.createPopup("速度调节：输入百分比【 1% - 300% 】",2e3);else{var a=parseInt(t[0]);if(NaN!=a){var n=Math.min(Math.max(a,1),300);o.video.playbackRate=n/100}null!==o.cmManager&&o.cmManager.clear()}break;case"off":o.cmManager.display=!1,o.cmManager.clear(),o.cmManager.stop();break;case"on":o.cmManager.display=!0,o.cmManager.start();break;case"cls":case"clear":null!==o.cmManager&&o.cmManager.clear();break;case"pp":case"pause":o.video.pause();break;case"p":case"play":o.video.play();break;case"vol":case"volume":if(0==t.length)o.createPopup("目前音量："+Math.round(100*o.video.volume)+"%",2e3);else{var i=parseInt(t[0]);null!==i&&NaN!==i&&(o.video.volume=Math.max(Math.min(i,100),0)/100),o.createPopup("目前音量："+Math.round(100*o.video.volume)+"%",2e3)}}this.value=""}}else if(null!=e&&38===e.keyCode)if(e.shiftKey){if(null!==o.cmManager){var r=Math.min(Math.round(100*o.cmManager.def.opacity)+5,100);o.cmManager.def.opacity=r/100,o.removePopup();o.createPopup("弹幕透明度："+Math.round(r)+"%",800)}}else{o.video.volume=Math.round(Math.min(100*o.video.volume+5,100))/100,o.removePopup();o.createPopup("目前音量："+Math.round(100*o.video.volume)+"%",800)}else if(null!=e&&40===e.keyCode)if(e.shiftKey){if(null!==o.cmManager){r=Math.max(Math.round(100*o.cmManager.def.opacity)-5,0);o.cmManager.def.opacity=r/100,o.removePopup();o.createPopup("弹幕透明度："+Math.round(r)+"%",800)}}else{o.video.volume=Math.round(Math.max(100*o.video.volume-5,0))/100,o.removePopup();o.createPopup("目前音量："+Math.round(100*o.video.volume)+"%",800)}}),"undefined"!=typeof CommentManager&&o.state.autosize){var B=function(){if(0!==l.videoHeight&&0!==l.videoWidth){var e=l.videoHeight/l.videoWidth,t=n.offsetWidth,a=n.offsetHeight;a/t<e?(n.style.width=a/e+"px",n.style.height=a+"px"):(n.style.width=t+"px",n.style.height=t*e+"px"),o.cmManager.setBounds()}};l.addEventListener("loadedmetadata",B),B()}return o}}}}}}}}}();
var config = {
    'debug': false
}
var debug = config.debug ? console.log.bind(console)  : function () {
};

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

var body;
var input;
var btn;
var ABP_Unit;

function init(){
    debug("init");
    if(window.location.href.includes("bilibili.com")){
        setInterval(function(){
            var cid;
            if(window.location.href.includes("bangumi")){
               cid=unsafeWindow.__INITIAL_STATE__.epInfo.cid;
               }
            else if(window.location.href.includes("av")){
               cid=unsafeWindow.__INITIAL_STATE__.videoData.cid;
                
            }
        var href="https://api.bilibili.com/x/v1/dm/list.so?oid="+cid;
        debug("DanmakuLink: "+href);
        DisplayInput(href);
            input.value=href;
        },2000); 
    }
    else if(window.location.href.includes("https://anime1.me")){
        DisplayInput('https://api.bilibili.com...?oid=xxxxxx, https://ani.gamer.com.tw...?sn=xxxxxx.');
        if(window.location.href.match(/^https:\/\/anime1\.me\/\d*$/)){
            DisplayInput('https://api.bilibili.com...?oid=xxxxxx, https://ani.gamer.com.tw...?sn=xxxxxx, Leave blank will search.');
        }
        CreateButton('Search in bilibili',function () {
            var title=document.title.split(/–|-/);
            if(title.length==2){
                title=title[0];
            }
            window.open("https://search.bilibili.com/all?keyword="+title);
        });
        CreateButton('Load Danmaku',function () {
            if(window.location.href.match(/^https:\/\/anime1\.me\/\d*$/)&&input.value==""){
                input.value="Searching...";
                bahamut();
            }
            else{
                GM_setValue("DanmakuLink",input.value);
                if(input.value.match(/bilibili\.com|ani\.gamer\.com\.tw/)!=null){
                    input.value="Done, Now you can Open Player.";
                   
                   }
            }
        });
    }
    else if(window.location.href.includes("i.animeone.me")){
        GetDanmaku(animeone);
    }
    else if(window.location.href.includes("v.anime1.me")){
        var run=function (){
            GetDanmaku(anime1);
        }
        setInterval(run,5000);
    }
    else if(window.location.href.includes("video.eyny.com")) {
        DisplayInput('https://api.bilibili.com...?oid=xxxxxx, https://ani.gamer.com.tw...?sn=xxxxxx');
        CreateButton('Search in bilibili',function () {
            var title=document.title.split("-");
            if(title.length>=2){
                title=document.title[0];
            }
            window.open("https://search.bilibili.com/all?keyword="+title);
        });
        CreateButton(`Load Danmaku`,function() {GetDanmaku(eyny)});
    }
}

function CreateButton(text,func){
    btn=document.createElement("button");
    btn.type="button";
    btn.onclick="";
    btn.innerHTML=text;
    btn.addEventListener('click',func);
    body.insertBefore(btn, input.nextElementSibling);
}

function DisplayInput(href) {
    if(input==null){
    input=document.createElement("input");
    input.setAttribute("type","text");
    input.setAttribute("placeholder",href);
    input.setAttribute("onClick","this.select();");
    input.size=80;
    body = document.querySelector('body');
    body.insertBefore(input, body.firstChild);
        
    }
    else{
        input.setAttribute("placeholder",href);
    }
}

function GetDanmaku(func) {
    var DanmakuLink
    if(window.location.href.includes("i.animeone.me")||window.location.href.includes("v.anime1.me")){

        try{
            DanmakuLink=GM_getValue("DanmakuLink");
            DanmakuLink=DanmakuLink.match(/(https:\/\/api\.bilibili\.com\/x\/v1\/dm\/list.so\?oid=\d*)|https:\/\/ani\.gamer\.com\.tw\/animeVideo\.php\?sn=(\d*)/);
        }
        catch(e){
            if(!window.location.href.includes("v.anime1.me")) {
                alert("Not detect Danmaku Link.");
            }
        }
    }
    else{
        DanmakuLink=input.value.match(/(https:\/\/api\.bilibili\.com\/x\/v1\/dm\/list.so\?oid=\d*)|https:\/\/ani\.gamer\.com\.tw\/animeVideo\.php\?sn=(\d*)/);
    }
    debug(DanmakuLink);
    if(DanmakuLink!=null){
        var sn;
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
        debug("Open Danmaku Player");
        debug(DanmakuLink);
        var danmaku=new ObjectRequest(DanmakuLink);
        if(DanmakuLink.includes("https://ani.gamer.com.tw/ajax/danmuGet.php")){
            danmaku.method="POST";
            danmaku.data="sn="+sn;
        }
        if(window.location.href.includes("i.animeone.me")||window.location.href.includes("v.anime1.me")) {
            GM_setValue("DanmakuLink", null);
        }
        request(danmaku,function (responseDetails) {
            var responseText = responseDetails.responseText;
            var comments = responseText;
            if(DanmakuLink.includes("https://ani.gamer.com.tw/ajax/danmuGet.php")){
                debug("Comments: " + comments);
                var json=JSON.parse(comments);
                debug("Comments: " + comments);
                var parser = new DOMParser();
                var xmlDoc   = parser.parseFromString('<?xml version="1.0" encoding="utf-8"?><i></i>', "application/xml");
                for(var obj of Object.values( json)){
                    try{
                        var d=xmlDoc.createElement("d");
                        d.innerHTML=obj.text.replace(/[^\u4e00-\u9fa5`~\!@#\$%\^\*\(\)_\+\|\-=\\\{\}\[\]:";'\?,\.\/\w\d<>&\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u2605-\u2606\u2190-\u2195\u203B]/g,"").replace("<","&lt;").replace(">","&gt;").replace("&","&amp;");
                        var type;
                        if(obj.position==0){
                            type=1;
                        }
                        else if(obj.position==2){
                            type=5;
                        }
                        var p=obj.time/10+","+type+",25,"+parseInt(obj.color.match(/#([\d\w]{6})/)[1],16)+",1550236858,0,55f99b31,12108265626271746";
                        d.setAttribute("p",p);
                        var root=xmlDoc.getElementsByTagName("i");
                        root[0].appendChild(d);
                        
                    }
                    catch(e){
                        alert(obj.text);
                        continue;
                    }
                }
                comments= (new XMLSerializer()).serializeToString(xmlDoc );
            }
            debug("Comments: " + comments);
            func(comments);
        });
    }
    else {
        if(!window.location.href.includes("v.anime1.me")){
            alert("Not detect Danmaku Link.");
        }
    }

}
function eyny(comments){
    debug("eyny");
            var VideoContainer = document.querySelector("#video_container");
            var width=VideoContainer.style.width.match(/(\d*)/)[1];
            var height=VideoContainer.style.height.match(/(\d*)/)[1];
            var video = VideoContainer.querySelector("#mediaplayer");
            video.style.width="100%";
            video.style.height="100%";
            debug("video.style.height: "+video.style.height);
            var ObjectEyny = new ObjectABP(VideoContainer, video, comments, width, height);
            ABP_Init(ObjectEyny);
    ABP_Unit=VideoContainer.querySelector("div.ABP-Unit");
    var ButtonFullscreen_ABP=ABP_Unit.querySelector("div.button.ABP-FullScreen");
    ButtonFullscreen_ABP.addEventListener("click",function (){
        debug("Fullscreen");
        video.style.width="100%";
        video.style.height="100%";
        debug("video.style.height: "+video.style.height);
    });
}

function anime1(comments){
    debug("anime1");
    var VideoContainer = document.querySelector("#player");
    var jw_media=VideoContainer.querySelector("div.jw-media.jw-reset");
    var rewind=VideoContainer.querySelector("div.jw-icon.jw-icon-rewind.jw-button-color.jw-reset");
    var display=VideoContainer.querySelector("div.jw-icon.jw-icon-display.jw-button-color.jw-reset");
    rewind.style.display="none";
    display.style.display="none";
    var ButtonFullscreen_Anime1=VideoContainer.querySelector("div.jw-icon.jw-icon-inline.jw-button-color.jw-reset.jw-icon-fullscreen");
    var video = VideoContainer.querySelector("video.jw-video.jw-reset");
    var object = new ObjectABP(VideoContainer, video, comments, 640,360);
    try{
        ABP_Init(object);
    }
    catch(e){
        debug("Error: "+e);
    }
    ABP_Unit=VideoContainer.querySelector("div.ABP-Unit");
    VideoContainer.insertBefore(ABP_Unit,VideoContainer.firstChild);
    var ButtonFullscreen_ABP=ABP_Unit.querySelector("div.button.ABP-FullScreen");
    ButtonFullscreen_Anime1.addEventListener("mousedown",function (){
        debug("Fullscreen");
        ButtonFullscreen_ABP.click();
    });
    for(var Class of VideoContainer.classList){
        VideoContainer.classList.toggle(Class,false);
    }
}

function  animeone(comments) {
    debug("animeone");
            var VideoContainer=document.querySelector("#player");
            var video=VideoContainer.querySelector("#player_html5_api");
            var vjs_control_bar=VideoContainer.querySelector("div.vjs-control-bar");
            vjs_control_bar.style.display="none";
    var ButtonFullscreen_Animeone=vjs_control_bar.querySelector("button.vjs-fullscreen-control.vjs-control.vjs-button");
            //var vjs_playback_rate=vjs_control_bar.querySelector("div.vjs-playback-rate.vjs-menu-button.vjs-menu-button-popup.vjs-button");
            //vjs_control_bar.removeChild(vjs_playback_rate);
            var ObjectAnimeone=new ObjectABP(VideoContainer,video,comments,640,360);
            ABP_Init(ObjectAnimeone);

            ABP_Unit=VideoContainer.querySelector("div.ABP-Unit");
            VideoContainer.insertBefore(ABP_Unit,VideoContainer.firstChild);
            var ButtonFullscreen_ABP=ABP_Unit.querySelector("div.button.ABP-FullScreen");
            ButtonFullscreen_ABP.addEventListener("click",function (){
                debug("Fullscreen");
                ButtonFullscreen_Animeone.click();
            });
            for(var Class of VideoContainer.classList){
                VideoContainer.classList.toggle(Class,false);
            }
}

function bahamut(){
    var title=document.querySelector("h1.entry-title");
    var array=title.innerText.match(/(.*)\s\[(\d*)\]/);
    title=array[1];
    var EpisodeCurrent=array[2];
    var href="https://ani.gamer.com.tw/search.php?kw="+title;
    var search=new ObjectRequest(href);
    request(search,function (responseDetails) {
        var responseText=responseDetails.responseText;
        var dom = new DOMParser().parseFromString(responseText, "text/html");
        var anime_list=dom.querySelector("ul.anime_list");
        if(anime_list==null||anime_list.classList.length>1){
            input.value ="Search Result: Failed."
            return;
        }
        var li=anime_list.querySelector("li");
        var animelook=li.querySelector("a.animelook");
        href=animelook.href;
        href=href.replace("https://anime1.me/","https://ani.gamer.com.tw/");
        debug(href);
        var GetAnime=new ObjectRequest(href);
        request(GetAnime,function (responseDetails) {
            responseText=responseDetails.responseText;
            dom = new DOMParser().parseFromString(responseText, "text/html");
            var season=dom.querySelector("section.season");
            if(season==null){
                href=responseDetails.finalUrl;
                debug(href);
            }
            else {
                var episodes=season.querySelectorAll("li");
                for(var episode of episodes){
                    //debug("episode.innerHTML: "+episode.innerHTML);
                    //debug("episode: "+parseInt(episode.innerText)+"; EpisodeCurrent: "+parseInt(EpisodeCurrent));
                    if(parseInt(episode.innerText)==parseInt(EpisodeCurrent)){
                        href=episode.firstChild.href;
                        href=href.replace(window.location.href,"https://ani.gamer.com.tw/animeVideo.php");
                        debug(href);
                        break;
                    }
                }
            }
            input.value = "[Bahamut]"+title+EpisodeCurrent+" - "+href;
            GM_setValue("DanmakuLink",input.value);
        });
    });
}

function request(object,func) {
    var retries = 10;
    GM_xmlhttpRequest({
        method: object.method,
        url: object.url,
        data: object.data,
        headers: object.headers,
        overrideMimeType: object.charset,
        //synchronous: true
        onload: function (responseDetails) {
            if (responseDetails.status != 200&&responseDetails.status != 302) {
                // retry
                if (retries--) {          // *** Recurse if we still have retries
                    setTimeout(request,2000);
                    return;
                }
            }
            debug(responseDetails);
            //Dowork
            func(responseDetails,object.other);
        }
    })
}

function ABP_Init(object){
    try{
        debug("ABP Init");
        var link=document.createElement("link");
        link.setAttribute("rel","stylesheet");
        link.setAttribute("type","text/css");
        link.setAttribute("href","https://jabbany.github.io/ABPlayerHTML5/dist/css/base.min.css");
        var head=document.querySelector("head");
        head.insertBefore(link,null);
        ABP.create(object.VideoContainer, {
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
        })
    }
    catch (e) {
        debug("ABP Error: "+e);
    }

}
window.addEventListener('DOMContentLoaded', init);
