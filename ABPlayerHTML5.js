function isMobile() {
var check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
return check; }

/**
 * CommentLoader - Alternative to comment provider
 *
 * @licence MIT License
 * @author Jim Chen (jabbany)
 */

var CommentLoader = (function () {
  var NullParser = function () {
    this.parseOne = function () { throw new Error('Not Implemented'); };
    this.parseMany = function () { throw new Error('Not Implemented'); };
  };
  var ACCEPTABLE_TYPES = [
    "text/xml",
    "text/plain",
    "application/json"
  ];

  var CommentLoader = function CommentLoader(commentManager) {
    this._commentManager = commentManager;
    this._responseType = "text/xml";
    this._parser = new NullParser();
  };

  CommentLoader.prototype.setParser = function (parser) {
    this._parser = parser;
    return this;
  };

  CommentLoader.prototype.setType = function (type) {
    if (ACCEPTABLE_TYPES.indexOf(type) < 0) {
      throw new Error('Unknown type: ' + type);
    }
    this._responseType = type;
    return this;
  };

  CommentLoader.prototype._fetch = function (method, url) {
    return fetch(url, {
      'method': method
    }).then((function (resp) {
      if (!resp.ok) {
        throw new Error('HTTP error, status = ' + resp.status);
      }
      if (this._responseType === 'application/json') {
        return resp.json();
      } else if (this._responseType === 'text/plain') {
        return resp.text();
      } else if (this._responseType === 'text/xml'){
        return resp.text().then((function (text) {
          // We know this works since we're in a browser!
          return (new DOMParser()).parseFromString(text, this._responseType);
        }).bind(this));
      } else {
        throw new Error('Unrecognized response type');
      }
    }).bind(this));
  };

  CommentLoader.prototype.load = function (method, url) {
    return new Promise(function(resolve, reject){resolve(    (new DOMParser()).parseFromString(url, 'text/xml'))}).then((function (data) {
      return this._parser.parseMany(data);
    }).bind(this)).then((function (comments) {
        this._commentManager.load(comments);
    }).bind(this)).catch(function (err) {
      alert(err);
    }); 
  };

	return CommentLoader;
})();

/**
 * ABPlayerHTML5 Main Class
 *
 * @licence MIT License
 * @author Jim Chen (jabbany)
 */
 var ABP = {
 	"version":"0.8.0"
 };

 (function(){
 	"use strict";
 	if(!ABP) return;
 	var $ = function (e) { return document.getElementById(e); };
 	var _ = function (type, props, children, callback) {
 		var elem = null;
 		if (type === "text") {
 			return document.createTextNode(props);
 		} else {
 			elem = document.createElement(type);
 		}
 		for(var n in props){
 			if(n !== "style" && n !== "className"){
 				elem.setAttribute(n, props[n]);
 			}else if(n === "className"){
 				elem.className = props[n];
 			}else{
 				for(var x in props.style){
 					elem.style[x] = props.style[x];
 				}
 			}
 		}
 		if (children) {
 			for(var i = 0; i < children.length; i++){
 				if(children[i] != null)
 					elem.appendChild(children[i]);
 			}
 		}
 		if (callback && typeof callback === "function") {
 			callback(elem);
 		}
 		return elem;
 	};
 	var addClass = function(elem, className){
 		if(elem == null) return;
 		var oldClass = elem.className.split(" ");
 		if(oldClass.indexOf(className) < 0){
 			oldClass.push(className);
 		}
 		elem.className = oldClass.join(" ");
 	};
 	var hasClass = function(elem, className){
 		if(elem == null) return false;
 		var oldClass = elem.className.split(" ");
 		return oldClass.indexOf(className) >= 0;
 	}
 	var removeClass = function(elem, className){
 		if(elem == null) return;
 		var oldClass = elem.className.split(" ");
 		if(oldClass.indexOf(className) >= 0){
 			oldClass.splice(oldClass.indexOf(className),1);
 		}
 		elem.className = oldClass.join(" ");
 	};
 	var buildFromDefaults = function (n, d){
 		var r = {};
 		for(var i in d){
 			if(n && typeof n[i] !== "undefined")
 				r[i] = n[i];
 			else
 				r[i] = d[i];
 		}
 		return r;
 	}
 	
 	
 	ABP.create = function (element, params) {
 		var elem = element;
 		if(!params){
 			params = {};
 		}
 		params = buildFromDefaults(params,{
 			"replaceMode":true,
 			"width":512,
 			"height":384,
 			"src":"",
 			"mobile":false
 		});
 		if (typeof element === "string") {
 			elem = $(element);
 		}
 		// 'elem' is the parent container in which we create the player.
 		if(!hasClass(elem, "ABP-Unit")){
 			// Assuming we are injecting
 			var container = _("div", {
 				"className": "ABP-Unit",
 				"style":{
 					"width": params.width + "px",
 					"height": params.height + "px"
 				}
 			});
 			elem.appendChild(container);
 		}else{
 			container = elem;
 		}
 		// Create the innards if empty
 		if(container.children.length > 0 && params.replaceMode){
 			container.innerHTML = "";
 		}
 		var playlist = [];
 		var danmaku = [];
 		if(typeof params.src === "string"){
 			params.src = _("video",{
 				"autobuffer":"true",
 				"dataSetup": "{}",
 			},[
 				_("source",{
 					"src":params.src
 				})
 			]);
 			playlist.push(params.src);
 		}else if(params.src.hasOwnProperty("playlist")){
 			var data = params.src;
 			var plist = data.playlist;
 			for(var id = 0; id < plist.length; id++){
 				if(plist[id].hasOwnProperty("sources")){
 					var sources = [];
 					for(var mime in plist[id]["sources"]){
 						sources.push(_("source", {
 							"src":plist[id]["sources"][mime],
 							"type":mime
 						}));
 					}
 					playlist.push(_("video",{
 						"autobuffer":"true",
 						"dataSetup": "{}",
 					},sources));
 				}else if(plist[id].hasOwnProperty("video")){
 					playlist.push(plist[id]["video"]);
 				}else{
 					console.log("No recognized format");
 				}
 				danmaku.push(plist[id]["comments"]);
 			}
 		}else{
 			playlist.push(params.src);
 		}
 		container.appendChild(_("div",{
 				"className" : "ABP-Video",
 				"tabindex" : "10"	
 			}, [_("div", {
 					"className":"ABP-Container"
 				}),
 				playlist[0]
 		]));		
 		container.appendChild(_("div", {
 					"className":"ABP-Text",
 			},[
 				_("input", {
 					"type":"text"
 				})
 		]));
 		container.appendChild(_("div", {
 					"className":"ABP-Control"
 			},[
 				_("div", {
 						"className": "button ABP-Play"
 				}),
 				_("div", {
 					"className": "progress-bar"
 				},[
 					_("div", {
 						"className": "bar dark"
 					}),
 					_("div", {
 						"className": "bar"
 					})
 				]),
 				_("div", {
 					"className": "button ABP-CommentShow"
 				}),
 				_("div", {
 					"className": "button ABP-FullScreen"
 				})
 		]));
 		var bind = ABP.bind(container, params.mobile);
 		if(playlist.length > 0){
 			bind.loader = (new CommentLoader(bind.cmManager)).setParser(
        new BilibiliFormat.XMLParser());
 			var currentVideo = playlist[0];
 			bind.gotoNext = function(){
 				var index = playlist.indexOf(currentVideo) + 1;
 				if(index < playlist.length){
 					currentVideo = playlist[index];
 					currentVideo.style.display = "";
 					var container = bind.video.parentNode;
 					container.removeChild(bind.video);
 					container.appendChild(currentVideo);
 					bind.video.style.display = "none";
 					bind.video = currentVideo;
 					bind.swapVideo(currentVideo);
 					currentVideo.addEventListener("ended", function(){
 						bind.gotoNext();
 					});
 				}
 				if(index < danmaku.length && danmaku[index] !== null){
 					bind.loader.load("GET", danmaku[index]);
 				}
 			}
 			currentVideo.addEventListener("ended", function(){
 				bind.gotoNext();
 			});
 			if (danmaku.length > 0) {
 			    bind.loader.load("GET", danmaku[0]);
 			}
 		}
 		return bind;
 	}
 	
 	ABP.load = function (inst, videoProvider, commentProvider, commentReceiver){
 		// 
 	};
 	
 	ABP.bind = function (playerUnit, mobile, state) {
 		var ABPInst = {
 			btnPlay:null,
 			barTime:null,
 			barLoad:null,
 			divComment:null,
 			btnFull:null,
 			btnDm:null,
 			video:null,
 			divTextField:null,
 			txtText:null,
 			cmManager:null,
 			defaults:{
 				w:0,
 				h:0
 			},
 			state:buildFromDefaults(state, {
 				fullscreen: false,
 				commentVisible: true,
 				allowRescale: false,
 				autosize: false
 			}),
 			createPopup:function(text, delay){
 				if(playerUnit.hasPopup === true)
 					return false;
 				var p = _("div", {
 					"className":"ABP-Popup"
 				},[_("text",text)]);
 				p.remove = function(){
 					if(p.isRemoved)	return;
 					p.isRemoved = true;
 					playerUnit.removeChild(p);
 					playerUnit.hasPopup = false;
 				};
 				playerUnit.appendChild(p);
 				playerUnit.hasPopup = true;
 				if(typeof delay === "number"){
 					setTimeout(function(){
 						p.remove();
 					},delay);
 				}
 				return p;
 			},
 			removePopup:function(){
 				var pops = playerUnit.getElementsByClassName("ABP-Popup");
 				for(var i = 0; i < pops.length; i++){
 					if(pops[i].remove != null){
 						pops[i].remove();
 					}else{
 						pops[i].parentNode.removeChild(pops[i]);
 					}
 				}
 				playerUnit.hasPopup = false;
 			},
 			swapVideo: null
 		};		
 		ABPInst.swapVideo = function(video){
 			video.addEventListener("timeupdate", function(){
 				if(!dragging)
 					ABPInst.barTime.style.width = ((video.currentTime / video.duration) * 100) + "%";
 			});
 			video.addEventListener("ended", function(){
 				ABPInst.btnPlay.className = "button ABP-Play";
 				ABPInst.barTime.style.width = "0%";
 			});
 			video.addEventListener("progress",function(){
 				if(this.buffered != null){
 					try{
 						var s = this.buffered.start(0);
 						var e = this.buffered.end(0);
 					}catch(err){
 						return;
 					}
 					var dur = this.duration;
 					var perc = (e/dur) * 100;
 					ABPInst.barLoad.style.width = perc + "%";
 				}
 			});
 			video.addEventListener("loadedmetadata", function(){
 				if(this.buffered != null){
 					try{
 						var s = this.buffered.start(0);
 						var e = this.buffered.end(0);
 					}catch(err){
 						return;
 					}
 					var dur = this.duration;
 					var perc = (e/dur) * 100;
 					ABPInst.barLoad.style.width = perc + "%";
 				}
 			});
 			video.isBound = true;
 			var lastPosition = 0;
 			if(ABPInst.cmManager) {
 				ABPInst.cmManager.clear();
 				video.addEventListener("progress", function(){
 					if (lastPosition == video.currentTime) {
 						video.hasStalled = true;
 						ABPInst.cmManager.stop();
 					} else
 						lastPosition = video.currentTime;
 				});
 				if(window){
 					window.addEventListener("resize", function(){
 						//Notify on resize
 						ABPInst.cmManager.setBounds();
 					});
 				}
 				video.addEventListener("timeupdate", function(){
 					if(ABPInst.cmManager.display === false) return;
 					if(video.hasStalled){
 						ABPInst.cmManager.start();
 						video.hasStalled = false;
 					}
 					ABPInst.cmManager.time(Math.floor(video.currentTime * 1000));
 				});
 				video.addEventListener("play", function(){
 					ABPInst.cmManager.start();
 					try{
 						var e = this.buffered.end(0);
 						var dur = this.duration;
 						var perc = (e/dur) * 100;
 						ABPInst.barLoad.style.width = perc + "%";
 					}catch(err){}	
 				});
 				video.addEventListener("ratechange", function(){
 					if(ABPInst.cmManager.def.globalScale != null){
 						if(video.playbackRate !== 0){
 							ABPInst.cmManager.def.globalScale = (1 / video.playbackRate);
 							ABPInst.cmManager.rescale();
 						}
 					}
 				});
 				video.addEventListener("pause", function(){
 					ABPInst.cmManager.stop();
 				});
 				video.addEventListener("waiting", function(){
 					ABPInst.cmManager.stop();
 				});
 				video.addEventListener("playing",function(){
 					ABPInst.cmManager.start();
 				});
 			}
 		}
 		
 		if(playerUnit === null || playerUnit.getElementsByClassName === null) return;
 		ABPInst.defaults.w = playerUnit.offsetWidth; 
 		ABPInst.defaults.h = playerUnit.offsetHeight;
 		var _v = playerUnit.getElementsByClassName("ABP-Video");
 		if(_v.length <= 0) return;
 		var video = null;
 		for(var i in _v[0].children){
 			if(_v[0].children[i].tagName != null &&
 				_v[0].children[i].tagName.toUpperCase() === "VIDEO"){
 				video = _v[0].children[i];
 				break;
 			}
 		}
 		if(_v[0] && mobile){
 			_v[0].style.bottom="0px";
 		}
 		var cmtc = _v[0].getElementsByClassName("ABP-Container");
 		if(cmtc.length > 0)
 			ABPInst.divComment = cmtc[0];
 		if(video === null) return;
 		ABPInst.video = video;
 		/** Bind the Play Button **/
 		var _p = playerUnit.getElementsByClassName("ABP-Play");
 		if(_p.length <= 0) return;
 		ABPInst.btnPlay = _p[0];
 		/** Bind the Loading Progress Bar **/
 		var pbar = playerUnit.getElementsByClassName("progress-bar");
 		if(pbar.length <= 0) return;
 		ABPInst.barHitArea = pbar[0];
 		var pbars = pbar[0].getElementsByClassName("bar");
 		ABPInst.barTime = pbars[0];
 		ABPInst.barLoad = pbars[1];
 		/** Bind the FullScreen button **/
 		var fbtn = playerUnit.getElementsByClassName("ABP-FullScreen");
 		if(fbtn.length <= 0) return;
 		ABPInst.btnFull = fbtn[0];
 		/** Bind the TextField **/
 		var txtf = playerUnit.getElementsByClassName("ABP-Text");
 		if(txtf.length > 0){
 			ABPInst.divTextField = txtf[0];
 			var txti = txtf[0].getElementsByTagName("input");
 			if(txti.length > 0)
 				ABPInst.txtText = txti[0];
 		}
 		/** Bind the Comment Disable button **/
 		var cmbtn = playerUnit.getElementsByClassName("ABP-CommentShow");
 		if(cmbtn.length > 0){
 			ABPInst.btnDm = cmbtn[0];
 		}
 		/** Create a commentManager if possible **/
 		if(typeof CommentManager !== "undefined"){
 			ABPInst.cmManager = new CommentManager(ABPInst.divComment);
 			ABPInst.cmManager.display = true;
 			ABPInst.cmManager.init();
 			ABPInst.cmManager.clear();
 			if(window){
 				window.addEventListener("resize", function(){
 					//Notify on resize
 					ABPInst.cmManager.setBounds();
 				});
 			}
 		}
 		/** Bind mobile **/
 		if(mobile){
 			// Controls
 			var controls = playerUnit.getElementsByClassName("ABP-Control");
 			if(controls.length > 0){
 				ABPInst.controlBar = controls[0];
 			}
 			var timer = -1;
 			var hideBar = function(){
 				ABPInst.controlBar.style.display = "none";
 				ABPInst.divTextField.style.display = "none";
 				ABPInst.divComment.style.bottom = "0px";
 				ABPInst.cmManager.setBounds();
 			};
 			ABPInst.divComment.style.bottom = 
 				(ABPInst.controlBar.offsetHeight + ABPInst.divTextField.offsetHeight) + "px";
 			var listenerMove = function(){
 				ABPInst.controlBar.style.display = "";
 				ABPInst.divTextField.style.display = "";
 				ABPInst.divComment.style.bottom = 
 					(ABPInst.controlBar.offsetHeight + ABPInst.divTextField.offsetHeight) + "px";
 				try{
 					if (timer != -1){
 						clearInterval(timer);
 						timer = -1;
 					}
 					timer = setInterval(function(){
 						if(document.activeElement !== ABPInst.txtText){
 							hideBar();
 							clearInterval(timer);
 							timer = -1;
 						}
 					}, 2500);
 				} catch(e){
 					console.log(e);
 				}
 			};
 			playerUnit.addEventListener("touchmove",listenerMove);
 			playerUnit.addEventListener("mousemove",listenerMove);
 			timer = setTimeout(function(){
 				hideBar();
 			}, 4000);
 		}
 		if(video.isBound !== true){
 			ABPInst.swapVideo(video);
 			ABPInst.btnFull.addEventListener("click", function(){
 				ABPInst.state.fullscreen = hasClass(playerUnit, "ABP-FullScreen");
 				if(!ABPInst.state.fullscreen){
 					addClass(playerUnit, "ABP-FullScreen");
 				}else{
 					removeClass(playerUnit, "ABP-FullScreen");
 				}
 				ABPInst.state.fullscreen = !ABPInst.state.fullscreen;
 				if(ABPInst.cmManager)
 					ABPInst.cmManager.setBounds();
 				if(!ABPInst.state.allowRescale) return;
 				if(ABPInst.state.fullscreen){
 					if(ABPInst.defaults.w >0){
 						ABPInst.cmManager.def.scrollScale = playerUnit.offsetWidth / ABPInst.defaults.w;
 					}
 				}else{
 					ABPInst.cmManager.def.scrollScale = 1;
 				}
 			});
 			ABPInst.btnDm.addEventListener("click", function(){
 				if(ABPInst.cmManager.display == false){
 					ABPInst.cmManager.display = true;
 					ABPInst.cmManager.start();
 				}else{
 					ABPInst.cmManager.display = false;
 					ABPInst.cmManager.clear();
 					ABPInst.cmManager.stop();
 				}   
 			}); 
 			ABPInst.barTime.style.width = "0%";
 			var dragging = false;
 			ABPInst.barHitArea.addEventListener("mousedown", function(e){
 				dragging = true;
 			});
 			document.addEventListener("mouseup", function(e){
 				dragging = false;
 			});
 			ABPInst.barHitArea.addEventListener("mouseup", function(e){
 				dragging = false;
 				var newTime = ((e.layerX) / this.offsetWidth) * ABPInst.video.duration;
 				if(Math.abs(newTime - ABPInst.video.currentTime) > 4){
 					if(ABPInst.cmManager)
 						ABPInst.cmManager.clear();
 				}
 				ABPInst.video.currentTime = newTime;
 			});
 			ABPInst.barHitArea.addEventListener("mousemove", function(e){
 				if(dragging){
 					ABPInst.barTime.style.width =((e.layerX) * 100 / this.offsetWidth) + "%";
 				}
 			});
 			ABPInst.btnPlay.addEventListener("click", function(){
 				if(ABPInst.video.paused){
 					ABPInst.video.play();
 					this.className = "button ABP-Play ABP-Pause";
 				}else{
 					ABPInst.video.pause();
 					this.className = "button ABP-Play";
 				}
 			});
 			playerUnit.addEventListener("keydown", function(e){
 				if(e && e.keyCode == 32 && document.activeElement !== ABPInst.txtText){
 					ABPInst.btnPlay.click();
 					e.preventDefault();
 				}
 			});
 			playerUnit.addEventListener("touchmove", function(e){
 				event.preventDefault();
 			});
 			var _touch = null;
 			playerUnit.addEventListener("touchstart", function(e){
 				if(e.targetTouches.length > 0) {
 					//Determine whether we want to start or stop
 					_touch = e.targetTouches[0];
 				}
 			});
 			playerUnit.addEventListener("touchend", function(e){
 				if(e.changedTouches.length > 0) {
 					if(_touch != null){
 						var diffx = e.changedTouches[0].pageX - _touch.pageX;
 						var diffy = e.changedTouches[0].pageY - _touch.pageY;
 						if(Math.abs(diffx) < 20 && Math.abs(diffy) < 20){
 							_touch = null;
 							return;
 						}
 						if(Math.abs(diffx) > 3 * Math.abs(diffy)){
 							if(diffx > 0) {
 								if(ABPInst.video.paused){
 									ABPInst.btnPlay.click();
 								}
 							} else {
 								if(!ABPInst.video.paused){
 									ABPInst.btnPlay.click();
 								}
 							}
 						} else if (Math.abs(diffy) > 3 * Math.abs(diffx)) {
 							if(diffy < 0){
 								ABPInst.video.volume = Math.min(1,ABPInst.video.volume + 0.1)
 							}else{
 								ABPInst.video.volume = Math.max(0,ABPInst.video.volume - 0.1)
 							}
 						}
 						_touch = null;
 					}
 				}
 			});
 			
 		}
 		/** Bind command interface **/
 		if(ABPInst.txtText !== null){
 			ABPInst.txtText.addEventListener("keyup", function(k){
 				if(this.value == null) return;
 				if(/^!/.test(this.value)){
 					this.style.color = "#5DE534";
 				}else{
 					this.style.color = "";
 				}
 				if(k != null && k.keyCode === 13){
 					if(this.value == "") return;
 					if(/^!/.test(this.value)){
 						/** Execute command **/
 						var commandPrompts = this.value.substring(1).split(":");
 						var command = commandPrompts.shift();
 						switch (command){
 							case "help":{
 								var popup = ABPInst.createPopup("提示信息：",2000);
 							}break;
 							case "speed":
 							case "rate":
 							case "spd":{
 								if(commandPrompts.length < 1){
 									ABPInst.createPopup("速度调节：输入百分比【 1% - 300% 】", 2000);
 								}else{
 									var pct = parseInt(commandPrompts[0]);
 									if(pct != NaN){
 										var percentage = Math.min(Math.max(pct, 1), 300);
 										ABPInst.video.playbackRate = percentage / 100;
 									}
 									if(ABPInst.cmManager !== null){
 										ABPInst.cmManager.clear();
 									}
 								}
 							}break;
 							case "off":{
 								ABPInst.cmManager.display = false;
 								ABPInst.cmManager.clear();
 								ABPInst.cmManager.stop();
 							}break;
 							case "on":{
 								ABPInst.cmManager.display = true;
 								ABPInst.cmManager.start();
 							}break;
 							case "cls":
 							case "clear":{
 								if(ABPInst.cmManager !== null){
 									ABPInst.cmManager.clear();
 								}
 							}break;
 							case "pp":
 							case "pause":{
 								ABPInst.video.pause();
 							}break;
 							case "p":
 							case "play":{
 								ABPInst.video.play();
 							}break;
 							case "vol":
 							case "volume":{
 								if(commandPrompts.length == 0){
 									var popup = ABPInst.createPopup("目前音量：" + 
 										Math.round(ABPInst.video.volume * 100) + "%", 2000);
 								}else{
 									var precVolume = parseInt(commandPrompts[0]);
 									if(precVolume !== null && precVolume !== NaN){
 										ABPInst.video.volume = Math.max(Math.min(precVolume, 100),0) / 100;
 									}
 									ABPInst.createPopup("目前音量：" + 
 										Math.round(ABPInst.video.volume * 100) + "%", 2000);
 								}
 							}break;
 							default:break;
 						}
 						this.value = "";
 					}
 				}else if(k != null && k.keyCode === 38){
 					if(!k.shiftKey){
 						/** Volume up **/
 						ABPInst.video.volume = Math.round(Math.min((ABPInst.video.volume * 100) + 5, 100)) / 100;
 						ABPInst.removePopup();
 						var p = ABPInst.createPopup("目前音量：" + 
 											Math.round(ABPInst.video.volume * 100) + "%", 800);
 					}else{
 						if(ABPInst.cmManager !== null){
 							var opa = Math.min(Math.round(ABPInst.cmManager.def.opacity * 100) + 5,100);
 							ABPInst.cmManager.def.opacity = opa / 100;
 							ABPInst.removePopup();
 							var p = ABPInst.createPopup("弹幕透明度：" + Math.round(opa) + "%",800);
 						}
 					}
 				}else if(k != null && k.keyCode === 40){
 					if(!k.shiftKey){
 						/** Volume Down **/
 						ABPInst.video.volume = Math.round(Math.max((ABPInst.video.volume * 100) - 5, 0)) / 100;
 						ABPInst.removePopup();
 						var p = ABPInst.createPopup("目前音量：" + 
 											Math.round(ABPInst.video.volume * 100) + "%", 800);
 					}else{
 						if(ABPInst.cmManager !== null){
 							var opa = Math.max(Math.round(ABPInst.cmManager.def.opacity * 100) - 5,0);
 							ABPInst.cmManager.def.opacity = opa / 100;
 							ABPInst.removePopup();
 							var p = ABPInst.createPopup("弹幕透明度：" + Math.round(opa) + "%",800);
 						}
 					}
 				}
 			});
 		}
 		/** Create a bound CommentManager if possible **/
 		if(typeof CommentManager !== "undefined"){
 			if(ABPInst.state.autosize){
 				var autosize = function(){
 					if(video.videoHeight === 0 || video.videoWidth === 0){
 						return;
 					}
 					var aspectRatio = video.videoHeight / video.videoWidth;
 					// We only autosize within the bounds
 					var boundW = playerUnit.offsetWidth;
 					var boundH = playerUnit.offsetHeight;
 					var oldASR = boundH / boundW;
 					
 					if(oldASR < aspectRatio){
 						playerUnit.style.width = (boundH / aspectRatio) + "px";
 						playerUnit.style.height = boundH  + "px";
 					}else{
 						playerUnit.style.width = boundW + "px";
 						playerUnit.style.height = (boundW * aspectRatio) + "px";
 					}
 					
 					ABPInst.cmManager.setBounds();
 				};
 				video.addEventListener("loadedmetadata", autosize);
 				autosize();
 			}
 		}
 		return ABPInst;
 	}
})();