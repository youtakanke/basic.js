/*! 
 * Basic.js JavaScript Library v1.0.0 
 * 
 * Copyright 2012, k-factory, yota kanke 
 * Dual licensed under the MIT or GPL Version 2 licenses. 
 * https://github.com/youtakanke/basic.js 
 * 
 * Blog http://kf-plvs-vltra.com/blog/
 */
/**
 * @class Tween2
 * @param elem {displayObject} tweenをかけたいdisplayObject
 * @param loopFlag = false {boolean} ループさせたいか否か。初期値はfalse
 */
function Tween2(elem, loopFlag){//},easing,duration,obj,callback,callbackobj){
	Basic.init(this).extend(EventDispatcher);
	this.initialize(elem, loopFlag)//,easing,duration,obj,callback,callbackobj);
}
Tween2.prototype = {
	initialize:function(elem, loopFlag){//,easing,duration,obj,callback,callbackobj){
		this._loopFlag = loopFlag || false;
		this._nowObj = {};
		this.target = elem;
		this._firstObj = {}
		this._thread=[];
		this._dilayFlag =false;
		this._fps = stage.fps;
	},
	/**
	 * @method loop
	 * 特定の箇所からループさせることが出来る。もしくはやめさせられる
	 * @param value {boolean} trueの場合はループ。
	 */
	loop:function(value){
		this._thread.push({type:'loop',value:value});
		return this;
	},
	_loop:function(value){
		this._next();
		this._loopFlag = value;
	},
	/**
	 * @method wait
	 * 次のアニメーション実行までの待ち時間を設定します。
	 * @param {Number} msec ミリ秒で指定します。
	 */
	wait:function(msec){
		this._thread.push({type:'wait',value:msec});
		this._dilay();
		return this;
	},
	_wait:function(msec){
		this._waitStartTime = {start:new Date().getTime(), msec : msec};
		this._wID = setTimeout(function(obj){
			obj._next();
		},msec,this)
	},
	/**
	 * @method call
	 * アニメーション「to()」終了時や、wait終了時「wait()」に実行される関数を登録できます。
	 * @param {Function} callback callbackメソッドを登録できます。
	 * @param {Object} 第一引き数のcallback関数の登録されているオブジェクトを指定できます。
	 */
	call:function(callback,target){
		this._thread.push({type:'call',value:[callback,target]});
		this._dilay();
		return this;
	},
	_call:function(callback,target){
		if(!target){
			callback();
		}else{
			target[callback]();
		}
		if(this._loopFlag){
			this._thread.push(this._nowThread);
		}
		this._next();
		return this;
	},
	/**
	 * @method to 
	 * 変形後の値を登録
	 * @param {Object} styleObj cssのオブジェクトを登録します。
	 * @param {Number} msec アニメーションの実行時間をミリ秒単位で指定します。
	 * @param {String} ease イージングを指定します。値はcssのtransitionTimingFunctionに指定できる値になります。
	 * @param {Number} startTimeLine 基本的には使用しませんが、アニメーションの途中から再生したい場合に指定するtimeline値になります。計算めんどくさいです。
	 *                 ※しかしmsecはフルタイムとしてカウントされますので注意してください。
	 */
	to:function(styleObj, msec, ease, startTimeLine){
		this._thread.push({type:'to',value:[styleObj, msec, ease, startTimeLine]});
		this._dilay();
		return this;
	},
	_to:function(styleObj, msec, ease, startTimeLine){
		this._waitStartTime = {start:new Date().getTime(), msec : msec};
		var _self = this;
		var _timeLineLength = msec*stage.fps/1000;
		var _count = startTimeLine || 0;
		this._count = startTimeLine || 0;
		this._easing = ease || 'easeout'
		this._easing = this._easing.replace(/-/g,'');
		this._changeObj = styleObj;
		this._duration=msec/1000;
		this._transFormObj = {};
		this._noTransFormObj = {};
		this._firstObj = {}
		for(var _index in styleObj){
			this._firstObj[_index] = this.target[_index];
			if(_index.indexOf('scale')!=-1 || _index.indexOf('rotation')!=-1){
				if(_index == 'scale'){
					this._firstObj['scaleX'] = this.target['scaleX'];
					this._firstObj['scaleY'] = this.target['scaleY'];
				}
				var _transFormFlag = true;
				this._transFormObj[_index] = styleObj[_index];
			}else{
				this._noTransFormObj[_index] = styleObj[_index];
			}
		}
		_self._count = _count;
		this._frameTime = Math.round(1000/stage.fps);
		if(_transFormFlag){
			_self.safariScaleHack(_timeLineLength);
		}
		_self._nID = setInterval(function(){
			_count++;
			_self._count = _count;
			if(_count > _timeLineLength){
				_self._count = _timeLineLength;
				for(var index in _self._changeObj){
					_self.target[index] = _self._changeObj[index];
				}
				_self.stop();
				_self._next();
			}else{
				for(var index in _self._noTransFormObj){
					_self[_self._easing](index);
				}
			}
		},this._frameTime);
	},
	/**
	 * safariはなぜかscaleとそれ以外のアニメーション処理を同一の関数内で行うと、バグるので
	 */
	safariScaleHack : function(_timeLineLength, extraCount){
		var _self = this;
		if(!extraCount){
			var _count = 0;
		}else {
			var _count = extraCount;
		}
		_self._nHackID = setTimeout(function(){
			_count++;
			if(_count < _timeLineLength){
				for(var index in _self._transFormObj){
					if(index.indexOf('scale')!=-1 || index.indexOf('rotation')!=-1){
						_self[_self._easing](index);
					}
				}
				_self.safariScaleHack(_timeLineLength);
			}else{
				for(var index in _self._transFormObj){
					_self.target[index] = _self._changeObj[index];
				}
			}
		},_self._frameTime);

	},
	/**
	 * 実行スレッド登録
	 */
	_dilay:function(){
		if(this._thread.length>0){
			if(!this._dilayFlag){
				this._dilayFlag = true;
				this._nowThread = this._thread[0];
				var _value = this._thread[0].value;
				var _type = this._thread[0].type;
				this._thread.splice(0,1);
				switch(_type){
					case 'loop':
						this._loop(_value);
					break;
					case 'wait':
						this._wait(_value);
					break;
					case 'call':
						this._call(_value[0], _value[1]);
					break;
					case 'to':
						this._to(_value[0], _value[1], _value[2], _value[3]);
					break;
				}
				if(this._loopFlag&&_type!='call'){
					this._thread.push(this._nowThread);
				}
			}
		}
	},
	/**
	* 次のスレッドを実行する為のメソッド
	 */
	_next:function(){
		this._dilayFlag = false;
		this._dilay();
	},
	duration:function(value){
		this._duration = value;
	},
	linear:function(index){
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

		this.target[index] = -c/2.0 * (Math.cos(3.1416*t/d) - 1) + b
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
	/**
	 * Tweenの完全終了
	 */
	stop:function(){
		var _self = this;
		clearInterval(_self._nID);
		delete _self._nID;
		clearInterval(_self._nHackID);
		delete _self._nHackID;
		clearTimeout(_self._wID);
		delete _self._wID;
	},
	/**
	 * 一時停止
	 */
	pause:function(){
		var _self = this;
		clearInterval(_self._nID);
		delete _self._nID;
		clearInterval(_self._nHackID);
		delete _self._nHackID;
		clearTimeout(_self._wID);
		delete _self._wID;
		this._restartTime = this._waitStartTime.msec - (new Date().getTime() - this._waitStartTime.start);
	},
	/**
	 * 一時停止からの再開
	 */
	resume:function(){
		switch(this._nowThread.type){
			case 'wait':
				this._nowThread.value = this._restartTime;
				break;
			case 'to':
				this._nowThread.value[1] = this._restartTime;
				this._nowThread.value.push(this._count);
				break;
		}
		this._thread.unshift(this._nowThread)
		this._next();
	}
	
}