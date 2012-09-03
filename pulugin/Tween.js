/**
 * @author kanke_yota
 * 
 */
function Tween(displayObject,easing,duration,propertyObj,callback,callbackobj){
	Basic.init(this).extend(EventDispatcher);
	this.initialize(displayObject,easing,duration,propertyObj,callback,callbackobj);
}
Tween.prototype = {
	initialize:function(displayObject,easing,duration,propertyObj,callback,callbackobj){
		this._nowObj = {};
		this.target = displayObject;
		this._firstObj = {}
		for(var _index in propertyObj){
			this._firstObj[_index] = this.target[_index];
		}
		this._easing = easing;
		this._changeObj = {};
		this._duration=duration;
		this._callback = callback;
		this._callbackobj = callbackobj;
		for(var index in propertyObj){
			this[index](propertyObj[index]);
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
	ease:function(index){
		var _n = this._changeObj[index];
		var _sa = _n-this._nowObj[index];
		this.target[index] += _sa * (this._frameTime/(this._duration*1000));
	},
	easeout:function(index){
		var t = this._count;
		var b = this._firstObj[index];
		var c = this._changeObj[index] - b;
		var d = (this._duration*1000)/this._fps;

		t /= d;
		t = t - 1;
		this.target[index] =  c*(t*t*t + 1) + b;//-c*t*(t-2) + b;
	},
	easein:function(index){
		var t = this._count;
		var b = this._firstObj[index];
		var c = this._changeObj[index]-b;
		var d = (this._duration*1000)/this._fps;

		t /= d;
		this.target[index] = c*t*t+b;
	},
	easeinout:function(index){
		var t = this._count;
		var b = this._firstObj[index];
		var c = this._changeObj[index]-b;
		var d = (this._duration*1000)/this._fps;

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
		this._nowObj.scale = this.target.scale;
		this._changeObj.scale = value;

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
	start:function(delay){
		var _self = this;
		var _timeLineLength = this._duration*stage.fps;
		var _count = 0;
		if(delay==undefined) delay = 0;
		
		_self._count = _count;
		this._frameTime = 1000/stage.fps;

		_self.safariScaleHack(_timeLineLength,delay);
		
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
						if(index.indexOf('scale')==-1 && index.indexOf('rotation')==-1){
							_self[_self._easing](index);
						}
					}
				}
				_self._count = _count;
			},_self._frameTime);
		},delay)
	},
	/**
	 * safariはなぜかscaleとそれ以外のアニメーション処理を同一の関数内で行うと、バグるので
	 */
	safariScaleHack : function(_timeLineLength,delay){
		var _self = this;
		var _count = 0;
		setTimeout(function(){
			_self._nHackID = setInterval(function(){
				_count++;
				if(_count < _timeLineLength){
					for(var index in _self._changeObj){
						if(index.indexOf('scale')>=0 || index.indexOf('rotation')>=0){
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
		},delay)

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
