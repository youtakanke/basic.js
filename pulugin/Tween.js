/*! 
 * Basic.js JavaScript Library v1.0.0 
 * 
 * Copyright 2012, k-factory, yota kanke 
 * Dual licensed under the MIT or GPL Version 2 licenses. 
 * https://github.com/youtakanke/basic.js 
 * 
 * Blog http://kf-plvs-vltra.com/blog/
 */
function Tween(elem,easing,duration,obj,callback,callbackobj){
	Basic.init(this).extend(EventDispatcher);
	this.initialize(elem,easing,duration,obj,callback,callbackobj);
}
Tween.prototype = {
	initialize:function(elem,easing,duration,obj,callback,callbackobj){
		this._nowObj = {};
		this.target = elem;
		this._firstObj = {}
		for(var _index in obj){
			this._firstObj[_index] = this.target[_index];
		}
		this._easing = easing;
		this._changeObj = {};
		this._duration=duration;
		this._callback = callback;
		this._callbackobj = callbackobj;
		for(var index in obj){
			this[index](obj[index]);
		}
		this._fps = stage.fps;
	},
	duration:function(value){
		this._duration = value;
	},
	nomal:function(index){
		var _n = this._changeObj[index];
		var _sa = _n-this._nowObj[index];
		this.target[index] += _sa * (this._frameTime/(this._duration*1000));
	},
	easeout:function(index){
		var t = this._count;
		var b = this._firstObj[index];
		var c = this._changeObj[index] - b;
		var d = this._duration*this._fps;
		
		t /= d;
		t -= 1;
		this.target[index] =  (c*(t*t*t + 1)) + b;
	},
	easein:function(index){
		var t = this._count;
		var b = this._firstObj[index];
		var c = this._changeObj[index]-b;
		var d = this._duration*this._fps;

		t /= d;
		this.target[index] = c*t*t*t+b;
	},
	easeinout:function(index){
		var t = this._count;
		var b = this._firstObj[index];
		var c = this._changeObj[index]-b;
		var d = this._duration*this._fps;

		this.target[index] = -c/2.0 * (Math.cos(Math.PI*t/d) - 1) + b
	},
	x:function(value){
		this._nowObj.x = this.target.x;
		this._changeObj.x = value;
	},
	y:function(value){
		this._nowObj.y = this.target.y;
		this._changeObj.y = value;
	},
	alpha:function(value){
		this._nowObj.alpha = this.target.alpha;
		this._changeObj.alpha = value;
	},
	scale:function(value){
		this._nowObj.scaleX = this.target.scaleX;
		this._nowObj.scaleY = this.target.scaleY;
		this._changeObj.scaleX = value;
		this._changeObj.scaleY = value;
	},
	rotation:function(value){
		this._nowObj.rotation = this.target.rotation;
		this._changeObj.rotation = value;
	},
	scaleX:function(value){
		this._nowObj.scaleX = this.target.scaleX;
		this._changeObj.scaleX = value;
	},
	scaleY:function(value){
		this._nowObj.scaleY = this.target.scaleY;
		this._changeObj.scaleY = value;
	},
	width:function(value){
		this._nowObj.width = this.target.width;
		this._changeObj.width = value;
	},
	height:function(value){
		this._nowObj.height = this.target.height;
		this._changeObj.height = value;
	},
	callback:function(func){
		this._callback = func;
	},
	start:function(playTime){
		var _self = this;
		var _timeLineLength = this._duration*stage.fps;
		var _count = 0;
		if(playTime==undefined) playTime = 0;
		
		_self._count = _count;
		this._frameTime = Math.round(1000/stage.fps);
		_self.safariScaleHack(_timeLineLength,playTime);
		
		setTimeout(function(){
			_self._nID = setInterval(function(){
				_count++;
				if(_count > _timeLineLength){
					for(var index in _self._changeObj){
						_self.target[index] = _self._changeObj[index];
					}
					_self.stop();
					if(_self._callback!=undefined)
						_self._callbackobj[_self._callback](_self.target);
				}else{
					for(var index in _self._changeObj){
						if(index.indexOf('scale')==-1){
							_self[_self._easing](index);
						}
					}
				}
				_self._count = _count;
			},_self._frameTime);
		},playTime)
	},
	/**
	 * safariはなぜかscaleとそれ以外のアニメーション処理を同一の関数内で行うと、バグるので
	 */
	safariScaleHack : function(_timeLineLength,playTime){
		var _self = this;
		var _count = 0;
		setTimeout(function(){
			_self._nHackID = setInterval(function(){
				_count++;
				if(_count < _timeLineLength){
					for(var index in _self._changeObj){
						if(index.indexOf('scale')!=-1){
							_self[_self._easing](index);
							//trace(_count,index,_self.target[index])
						}
					}
				}else{
					for(var index in _self._changeObj){
						if(index.indexOf('scale')!=-1){
							_self.target[index] = _self._changeObj[index];
							//trace(_count,index,_self.target[index])
						}
					}
				}
			},_self._frameTime);
		},playTime)

	},
	stop:function(){
		var _self = this;
		clearInterval(_self._nID);
		delete _self._nID;
		clearInterval(_self._nHackID);
		delete _self._nHackID;
	},
	finish:function(){

	}
}