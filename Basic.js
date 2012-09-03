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
 * ブラウザベンダーの判別
 */
var VENDER = (function() {
    var _ua = navigator.userAgent;
    if (_ua.indexOf('WebKit') != -1) {
        return 'webkit';
    } else if (navigator.product == 'Gecko') {
        return 'Moz';
    } else if (_ua.indexOf('Opera') != -1) {
        return 'O';
    } else {
        return '';
    }
})();

/**
 * Basic class
 * superクラスがこのクラスをinit(this)することで、下記メソッド（継承）が追加される
 */
function Basic(){
/*	var _body = document.getElementsByTagName('body')[0];
	_body.style[VENDER+'UserSelect'] = 'none';*/
}
Basic.init=function init(obj){
	/*
	var b = new Basic();
	obj = Object.create(Basic.prototype,obj.__proto__)
	*/
	Basic.SetterAndGetterEscape.prototype = {};
 	var _b =  new Basic();
 	for (var i in _b){
 		obj.__proto__[i]=_b[i];
	}
	var _cn =  obj.__proto__;
	
	var getSetFlag = false;
	var totalgetSetFlag = false;
 	for (var i in _cn){
 		getSetFlag = false;
        try{
	        if (_cn[i].get!=undefined){
	        	//obj.__defineGetter__(i, _cn[i].get);
	        	getSetFlag = true;
	        }
	        if (_cn[i].set!=undefined){
	        	//_cn.__defineSetter__(i, _cn[i].set);
	        	getSetFlag = true;
	        }
	        
	        if(getSetFlag){
	        	totalgetSetFlag = true;
	        	//Basic.SetterAndGetterEscape.prototype[i] = _cn[i];
	        }
	    }catch(e){
	    	//trace('_cn[i] value', _cn[i]);
	    }
	}
	return obj;
}
Basic.prototype={
	/**
	 * 継承
	 * @param {Function} clasName	継承したいクラスを渡す
	 */
	extend:function(clasName){
	 	/*
	 	var _cn =  new clasName();
		this.__proto__ = Object.create(_cn.__proto__,this.__proto__)
		clasName.apply(this);
		*/
		var _cn =  new clasName();
	 	var _self = this;
	 	var _proto = {};
	 	//自身の__proto__を逃がしておく
	 	for ( var i in this.__proto__){
	 		 _proto[i] = this.__proto__[i];
	 		 Basic.SetterAndGetterEscape.prototype[i] = this.__proto__[i];
	 	}
	 	//継承元のprototypeを自身に追加する
	 	for (var i in _cn){
	 		this.__proto__[i]=_cn[i];
	 		Basic.SetterAndGetterEscape.prototype[i] = clasName.prototype[i];
	 	}
	 	_cn = Basic.SetterAndGetterEscape.prototype;
	 	for (var i in _cn){
	        try{
		        if (_cn[i].get!=undefined){
		        	this.__defineGetter__(i, _cn[i].get);
		        }
		        if (_cn[i].set!=undefined){
		        	this.__defineSetter__(i, _cn[i].set);
		        }
		    }catch(e){
		    	//trace('_cn[i] value', _cn[i]);
		    }
	 		
		}
		Basic.SetterAndGetterEscape.prototype = {};
		
		//オーバーライドがある場合のための措置
	 	for (var index in _proto){
	 		this.__proto__[index]=_proto[index];
	 	}
	 	//インスタンスにシリアルIDを振る
 		this.__serialID = this.___serialID();
		//自身が継承されていることを知らせるflag
		this.extendsFlag=true;
		
		//
		if(clasName==Sprite){
			this.extend(DisplayObject);
			this._element = new this.createElement('div');
			this._style.position = 'absolute';
		}
	}
}
/**
 * getter setter　のあるクラスのprototypeを一時的に逃がすためのpraivateクラス
 * 
 */
Basic.SetterAndGetterEscape = function(){}
Basic.SetterAndGetterEscape.prototype = {
	___serialID : function(){
		 return Math.floor(Math.random()*1000000000000);
	}
}
/**
 * 詳しくはこちら
 * http://ameblo.jp/ca-1pixel/entry-11333270027.html
 * ＞HtimImageElementをpoolする
 */
Basic.imagePool = new Image();
/**
 * EventDispatcher class
 * dispathEventの引数（カスタムイベントハンドラー）生成
 */
function EventDispatcher(){
	this.enterFrameFlag=false;
	this._registEveArry={};
	var _ar = this._registEveArry;
	_ar.obj=[];
	_ar.ID=[];
	_ar.handler=[];
	_ar.method=[];
}
EventDispatcher.prototype={
	/**
	 * addEventLietener　第二、第三引数に注意
	 * 
	 * @param {String} handler	任意のハンドラーを設定
	 * @param {String} method	dispaatchEventを受け取った際の実行されるmethodを　String　で指定
	 * @param {Object} bindObj	methodのあるオブジェクトを指定。
	 */
	addEventListener : function(handler,method,bindObj)
	{
		var _ar = this._registEveArry;
		_ar.obj.push(bindObj);
		_ar.ID.push(this.__serialID);
		_ar.handler.push(handler);
		_ar.method.push(method);
		if(handler=="enterframe"){
			this.__onEnterFrame__();
		}
		//mouseイベント系はこっちで
		if(handler=='touchend'||handler=='touchmove'||handler=='click' || handler == 'mousemove' || handler == 'mouseover'|| handler == 'mousedown'){
			this._element.__this = this;
			this._element.__obj = bindObj;
			this._element.__handler = handler;
			this._element.__method = method;
			this._element.addEventListener(handler ,this.__mouseAndTouchHandler,true);
		}
	},
	/**
	 * dispatchEvent
	 * リスナー登録されているobjectに対して送出される
	 * @param {String} handler
	 */
	dispatchEvent : function(handler){
		var _ar = this._registEveArry;
		var _type;
		var _objFlag = false;
		if(typeof handler == 'object') {
			_type = handler.type
			_objFlag=true;
		}else{
			_type = handler;
		}
		var _rc = this.__removeCount(_ar,_type);
		if(_rc!=-1){
			var _targetObj = _ar.obj[_rc];
			var _obj;
			if(_objFlag)
				_obj = handler;
			else
				_obj = {"target":this,"type":_type}
			_targetObj[_ar.method[_rc]](_obj);
		}
	},
	/**
	 * addEventListenerで登録されているハンドラーの削除
	 * @param {String} handler
	 * @param {String} method
	 * @param {Object} obj
	 */
	removeEventListener : function(handler,method,obj){
		if(handler=="enterframe"){
			this.removeEnterFrame();
		}else{
			var _ar = this._registEveArry;
			var _rc = this.__removeCount(_ar,handler);
			if(_rc!=-1){
				_ar.obj.splice(_rc,1);
				_ar.handler.splice(_rc,1);
				_ar.method.splice(_rc,1);
				//mouseイベント系はこっちで
				if(handler=='touchend'||handler=='touchmove'||handler=='click' || handler == 'mousemove' || handler == 'mouseover'|| handler == 'mousedown'){
					this._element.removeEventListener(handler ,this.__mouseAndTouchHandler,true);
				}
			}
		}
	},
	__removeCount:function(ar,handler)
	{
		var _num=-1;
		var _hd = ar.handler;
		var _ID = ar.ID;
		for (var i=0; i < _hd.length; i++) {
			if(_hd[i]==handler && _ID[i] == this.__serialID){
				_num=i;
				break;
			}
		};
		return _num;
	},
    /**
     * mouse,touch系event専用のpraivateメソッド
     * @param {EventObject} e   targeとtype　etc〜
     */
    __mouseAndTouchHandler:function(e){
            var _e = {};
            for (var index in e) {
                _e[index] = e[index];
            };
            var _t = e.target;
            if(_t.__this == undefined )
                _t = _t.parentNode;
            _e.target = _t.__this;
            _e.type = _t.__handler;
            _t.__obj[_t.__method](_e);
    },
    ___serialID : function(){
         return Math.floor(Math.random()*1000000000000);
    }
}
/**
 * BEvent クラス
 * Eventオブジェクトを生成し返します。
 * 主にdispatchEventの引数に使用
 * 例：this.disatchEvent( new BEvent('complete', this));
 * 
 * @param {String} handler	
 * @param {Object} target
 */
function BEvent(handler,target){
	return {type:handler , target:target};
}

/**
 * DisplayObject　クラス
 * 表示オブジェクトの大本となるクラス。　divを生成
 * サブクラスにSprite、TextField、Stageなどがある。
 */
function DisplayObject(){
	Basic.init(this).extend(EventDispatcher);
	this.fps = Stage.fps;
	this._nID;
	if(!this.extendsFlag){
		this.__onEnterFrame__();
	}
	this._element = new this.createElement('div');
	this._element.style.position = 'absolute';
	this._children = [];
	this.__transformScale = '';
	this.__transformRotation = '';
}
DisplayObject.prototype = {
	/**
	 * 自分が属しているシーン
	 */
	_scene : {
		get : function(){return this.__scene},
		set : function(value){this.__scene = value}
	},
	/**
	 * div（HTMLdocument）を生成
	 * praivateメソッド
	 * @param {String} nodeName	基本的にdiv
	 */
	createElement : function(nodeName){
		return document.createElement(nodeName);
	},
	removeEnterFrame:function(){
		clearInterval(this._nID);
	},
	/**
	 * createElementで生成された'div'要素（HTMLdocument）にアクセスできる
	 */
	_element : {
		get : function(){
			if(!this.__element)this.__element= new this.createElement('div');
			return this.__element;
		},
		set : function(value){
			this.__element = value;
		}
	},
	/**
	 * div(HTMLDocument)のstyle
	 * cssを直接捜査したい時なのに使う
	 */
	_style : {
		get : function(){
			return this._element.style;
		},
		/**
		 * 
		 * @param {Object} value
		 */
		set : function(value){
			this._element.style = value;
		}
	},
	/**
     * div(HTMLDocument)のidにひもづく
     * <div id='value'></div>
	 */
	id : {
		get : function(){
			if(!this._element.id)this._element.id='';
			
			return this._element.id;
		},
		/**
		 * 
		 * @param {Object} value
		 */
		set : function(value){
			this._element.id = value;
		}
		
	},
    /**
     * div(HTMLDocument)のclassにひもづく
     * <div class='value'></div>
     */
	className : {
		get : function(){
			if(!this._element.className)this._element.className='';
			
			return this._element.className;
		},
		set : function(value){
			this._element.className = value;
		}
		
	},
	/**
	 * オブジェクトのx座標
	 */
	x : {
		get : function(){
			if(!this._x)this._x=0;
			return this._x;
		},
		/**
		 * 
		 * @param {Object} value
		 */
		set : function(value){
			this._style.left = value + 'px';
			this._x = value;
			//this.__transform__();
		}
	},
    /**
     * オブジェクトのy座標
     */
	y : {
		get : function(){
			if(!this._y)this._y=0;
			return this._y;
		},
		set : function(value){
			this._style.top = value + 'px';
			this._y = value;
			//this.__transform__();
		}
	},
    /**
     * オブジェクトの幅
     */
	width : {
		get : function(){
			if(!this._width)this._width=0;
			return this._width;
		},
		/**
		 * 
		 * @param {Object} value
		 */
		set : function(value){
			this._style.width = value + 'px';
			this._width = value;
		}
	},
    /**
     * オブジェクトの高さ
     */
	height : {
		get : function(){
			if(!this._height)this._height=0;
			return this._height;
		},
		set : function(value){
			this._style.height = value + 'px';
			this._height = value;
		}
	},
	/**
	 * scaleとrotationの処理
	 * @param {Object} value
	 */
	__transform__:function(value){
		/*
		var _x = this.x;
		var _y = this.y;
		if(value){
			this._style[VENDER + 'TransformOrigin'] = _x + (this.width/2) + 'px ' + (_y + (this.height/2)) + 'px';
		}*/
		this._style[VENDER + 'Transform'] = this.__transformScale + ' ' + this.__transformRotation //+ ' translate(' + _x + 'px,' + _y + 'px)';
	},
	/**
	 * オブジェクトのサイズ割合
	 * １が100%
	 */
	scale : {
		get : function(){
			if(this._scaleX == undefined)this._scaleX=1;
			if(this._scaleY == undefined)this._scaleY=1;
			return this._scaleX;
		},
		set  : function(value){
	        this._scaleX = value;
	        this._scaleY = value;
	        var _a = 'scale(' + value + ',' + value + ')';
	        this.__transformScale=_a;
	        this.__transform__(true);
		}
	},
    /**
     * オブジェクトのXサイズ割合
     * １が100%
     */
	scaleX : {
		get : function(){
			if(this._scaleX == undefined)this._scaleX=1;
			return this._scaleX;
		},
		set  : function(value){
	        this._scaleX = value;
	        var _a = 'scale(' + this.scaleX + ',' + this.scaleY + ')';
	        this.__transformScale=_a;
	        this.__transform__(true);
		}
	},
    /**
     * オブジェクトのYサイズ割合
     * １が100%
     */
	scaleY : {
		get : function(){
			if(this._scaleY == undefined)this._scaleY=1;
			return this._scaleY;
		},
		/**
		 * 
		 * @param {Object} value
		 */
		set : function(value){
	        this._scaleY = value;
	        var _a = 'scale(' + this.scaleX + ',' + this.scaleY + ')';
	        this.__transformScale=_a;
	        this.__transform__(true);
		}
	},
	/**
	 * オブジェクトの表示or非表示
	 * boolean
	 */
	visible : {
		get : function(){
			if(!this._visible)this._visible=true;
			return this._visible;
		},
		/**
		 * 
		 * @param {Object} value
		 */
		set : function(value){
	        this._visible = value;
	        if(value)
	        	value = 'visible';
	        else
	        	value = 'hidden'
	    	this._style.visibility = value;
		}
	},
	/**
	 * オブジェクとの透明度
	 * １〜０　　１が100%
	 */
	alpha : {
		get : function(){
			if(this._style.opacity==''){
				this._style.opacity = 1;
				this._alpha = 1;
			}
			return this._alpha;
		},
		set : function(value){
	    	this._style.opacity = value;
	    	this._alpha = value;
		}
	},
	/**
	 * オブジェクトの回転度数
	 */
	rotation : {
		get : function(){
			if(!this._rotation)this._rotation=0;
			return this._rotation;
		},
		/**
		 * 
		 * @param {Object} value
		 */
		set : function(value){
	        this._rotation = value;
	        var _a ='rotate(' + this._rotation + 'deg)';
	        this.__transformRotation=_a;
	        this.__transform__(true);
		}
	},
	/**
	 * オブジェクトに画像を指定
	 */
	image : {
		/**
		 * return {Object} src:画像パス、width:画像幅、height:画像高
		 */
		get : function(){
			return this._image
		},
		/**
		 * @param {String} value　画像のパスをセット
		 */
		set : function(value){
			this._image={}
			for(var i=0;i<stage.assets.length;i++){
				if(stage.assets[i].key == value){
					var _base64 = stage.assets[i].base64;
					var _imaeType = '';
					var _str = _base64.substring(0,3);
					switch(_str){
						case 'R0l':
						_imaeType =  'gif';
						break;
						case 'iVB':
						_imaeType =  'png';
						break;
						case '/9j':
						_imaeType =  'jpg';
						break;
					}
					var _image = Basic.imagePool;
					_image.img = stage.assets[i];
					_image.src = 'data:image/' + _imaeType + ';base64,' + _image.img.base64;
					this._image.src = _image.src;
					var _s = this;
					_image.onload = function(e){
						_s._image.width = _image.width;
						_s._image.height = _image.height;
					}
					this._style.backgroundImage = 'url(' + _image.src +')';
				}
			}
			//this._style.backgroundImage = 'url('+ value +')';
			//this._image = this._style.backgroundImage;
		}
	},
	/**
	 * Spriteアニメーション管理プロパティ
	 * Spriteの幅×引数分、画像が右にずれる
	 */
	frame : {
		get : function (){
			if(!this._frame)this._frame=0;
			return this._frame;
		},
		/**
		 * 
		 * @param {Object} value
		 */
		set : function (value){
			this._frame = value;
			var _w=this._width, _h=this._height;
			this._style.backgroundPosition=String(-(Math.floor(this._frame*_w)) + 'px 0' );
		}
	},
	/**
	 * 表示オブジェクトに表示オブジェクトを追加する
	 * @param {displayObject} displayObject
	 */
	addChild:function(displayObject){
		try{
			this._element.appendChild(displayObject._element);
		}catch(e){
			var _e = document.getElementById(this._element.id);
			trace(_e)
			_e.appendChild(displayObject._element);
		}
		if(this._scene)
			displayObject._scene = this._scene;
		
		displayObject.parent = this;
		this._children.push(displayObject);
	},
	/**
	 * 表示オブジェクトから表示オブジェクトを削除する
	 * @param {Object} displayObject
	 */
	removeChild:function(displayObject){
		this._element.removeChild(displayObject._element);
	},
	/**
	 * 表示オブジェクトを表示順から指定の表示オブジェクトを削除
	 * @param {Object} num
	 */
	removeChildAt:function(num){
		try{this._element.removeChild(this._element.childNodes[num])}catch(e){trace('childlen undefined')};
	},
	/**
	 * 表示オブジェクにいくつ子要素があるかを返す
	 */
	numChildren:{
		get:function(){
			return this._element.childNodes.length;
		}
	},
	/**
	 * 要素の表示順入れ替え
	 */
	swapChildren : function(displayObject1, displayObject2){
		this.parent._element.insertBefore(displayObject1._element, displayObject2._element);
	},
	/**
	 * 引数のdomの前に挿入
	 */
	/*
	 * @param {Object} displayObject
	insertBefore : function(displayObject){
		var _ar = this.parent._element.childNodes;
		for (var i=0; i < _ar.length; i++) {
			if(_ar[i]==displayObject._element){
				this.parent._element.insertBefore(this._element,displayObject._element);
			}
		};
	},*/
	/**
	 * Three.js のオブジェクトを追加する場合
	 * @param {threeObj} threeObj
	 */
	addChildThreejsContent : function(threeObj){
		threeObj.init();
		return threeObj;
	},
	/**
	 * Three.js のオブジェクトを削除する場合
	 * @param {Object} threeObj
	 */
	removeChildThreejsContent : function(threeObj){
		threeObj.remove();
	},
	/**
	 * 
	 */
	__clear__ : function(){
		var _ar = this._children;
		try{
			
			for (var i=0; i < _ar.length; i++) {
				if(_ar[i]._scene != undefined){
					if(this._scene==_ar[i]._scene){
						try{
							//trace('same scene',this,_ar[i])
							this.removeChild(_ar[i]);
							_ar[i]._scene = null;
							_ar[i].parent = null;
							_ar[i].__clear__();
							delete _ar[i]._scene;
							delete _ar[i].parent;
							delete _ar[i]
							//_ar.splice(i, 1);
						}catch(e){
							//displayObj継承ものでないとだめってこと・・・
						}
					}
				}
			}
		}catch(e){
			trace('__clear__', this,e)
		}
		this._children = [];
		_ar = []
	}
}


/**
 * Sprite
 * 
 * @param {Object} w
 * @param {Object} h
 */
function Sprite(w,h){
	Basic.init(this).extend(DisplayObject);
	this._element = new this.createElement('div');
	this._element.style.position = 'absolute';
	this.width = w;
	this.height = h;
	this._children = [];
}
Sprite.prototype = {
	/**
	 * enterframeがaddEventlistenerに指定された際にcallされる
	 */
	__onEnterFrame__:function()
	{
		var _self = this;
		var _fps = 1000/stage.fps;
		this._nID=setInterval(function(){
			_self.onEnterFrame();
		},_fps)
	},
	/**
	 * enterframeメソッド　毎秒fps分callされる
	 */
	onEnterFrame:function(){
		if(this._scene!= null)
			this.dispatchEvent(this._scene.ENTER_FRAME);
		else
			this.dispatchEvent('enterframe');
	},
	/**
	 * mask
	 * このオブジェクトに対し、imageが指定されていれば、imageがマスクになる
	 * imageの指定が無ければcssでいう、overfrow:hidden　状態　　　なので長方形になる
	 */
	mask:{
		get:function(){
			return this._mask;
		},
		/**
		 * set
		 * @param {Object} value
		 */
		set:function(value){
			if(!this._image){
				if(value){
					this._style.overflow = 'hidden';
				}
				else{
					this._style.overflow = 'visible';				
				}
			}else{
				if(value){
					this._style[VENDER + 'MaskImage'] = 'url(' + this._image.src + ')';
					this._style.backgroundImage = 'none';
				}
				else{
					this._style[VENDER + 'MaskImage'] = 'none';
					this._style.backgroundImage = 'url(' + this._image.src + ')';
				}
			}
			this._mask = value;
		}
	}
}

/**
 * TextField　クラス
 * @param {Object} w　幅
 * @param {Object} h　高さ
 */
function TextField(w,h){
	Basic.init(this).extend(DisplayObject);
	this._element = new this.createElement('div');
	this._element.style.position = 'absolute';
	this.width = w;
	this.height = h;
	this._children = [];
}
TextField.prototype = {
	/**
	 * text要素
	 */
	text : {
		get : function (){
			if(!this._text)this._text = '';
			return this._text;
		},
		/**
		 * divにテキスト要素を追記する
		 * @param {String} value
		 */
		set : function (value){
			this._text = value;
			this._element.innerHTML = value;
		}
	},
	/**
	 * テキストを選択できるかどうか
	 */
	selectable : {
		/**
		 * 
		 */
		get : function (){
			if(!this._selectable)this._selectable = false;
			return this._selectable;
		},
		/**
		 * trueで選択可
		 * @param {Boolean} value
		 */
		set : function (value){
			this._selectable = value;
			if(value)
				this._style[VENDER + 'UserSelect'] = 'text';
			else
				this._style[VENDER + 'UserSelect'] = 'none';
		}
	}
}


/**
 * Stage　クラス
 * 全てはこのクラスを軸に動く
 * 
 * @param {Object} w　幅
 * @param {Object} h　高さ
 */
function Stage(w,h){
	Basic.init(this).extend(Sprite);
	//Sprite.prototype[].call(this,w,h);
	/*
	for(i in Sprite.prototype){
		trace(i)
		try{
			i.call(this);
		}catch(e){}
	}*/
	//Basic.init(this).extend(DisplayObject);
	this._element = document.getElementById('stage');
	this._sceneStorage = [];
	this.fps=60;
	this._element.style.width = w+'px';
	this._element.style.height = h+'px';
	this._element.style.overflow ='hidden';
	this.width = w;
	this.height = h;
	
	this.__onloadFlag = false;
}
/**
 * 
 */
Stage.fps = 60;
Stage.prototype = {
	/**
	 * 現在のシーンを返す
	 */
	currentScene:function(){
		return this._sceneStorage[this._sceneStorage.length-1];
	},
	/**
	 * シーンを切り替える
	 * @param {Scene} scene
	 */
	pushScene : function(scene){
		this._sceneStorage.push(scene);
		var _length = this._sceneStorage.length;
		if(_length>=2){
			var _s = this._sceneStorage[_length-2];
			_s.stop();
			this.removeChild(_s);
		}
		scene._element.className = scene._sceneName;
		this.addChild(scene);
		scene.start();
	},
	/**
	 * 
	 */
	popScene : function(){
		
	},
	/**
	 * 登録されているシーンから削除する
	 * @param {Scene} scene
	 */
	removeScene : function(scene){
		//this.removeChild(scene);
		for(var i = 0; i < this._sceneStorage.length; i++){
			if(this._sceneStorage[i] == scene){
				this._sceneStorage.splice(i,1);
			}
		}
		scene.__clear__();
		scene = null;
		delete scene;
		
	},
	/**
	 * preloadされた画像を格納しておく配列
	 */
	assets : [],
	/**
	 * プリロードしたい画像パスを配列形式で指定。
	 * Ajax利用してロード。
	 * ロードされた画像はbase64形式でassetsに格納される
	 * @param {Array} fileArray
	 */
	preload : function(fileArray){
		var _self= this;
		if(typeof fileArray != "string"){
			this.loadFileLength = fileArray.length;
			this.loadFileCount = 0;
			for (var i=0; i < fileArray.length; i++) {
				Basic.Ajax({}, 'GET', fileArray[i], true, function(res,path){
					_self.assets.push({"key":path,"base64": 
						window.btoa(res.replace(/[\u0100-\uffff]/g, function(c) {
							return String.fromCharCode(c.charCodeAt(0) & 0xff)}))
					});
					/**
					 * 全てのプリロードファイルが読み終わったら
					 */
					if(_self.loadFileLength == _self.loadFileCount+1){
						if(!_self.__onloadFlag){
							new stage.onload();
							_self.__onloadFlag = true;
						}
					}
					_self.loadFileCount++;
				});
			};
		}else{
			Basic.Ajax({}, 'GET', fileArray, true, function(res, path){
				_self.assets.push({"key":path,"base64":
						window.btoa(res.replace(/[\u0100-\uffff]/g, function(c) {
							return String.fromCharCode(c.charCodeAt(0) & 0xff)})
						)
				});
				if(!_self.__onloadFlag){
					stage.onload();
					_self.__onloadFlag = true;
				}
			});
		}
	},
	/**
	 * 
	 */
	start : function(){
		
	}

}
/**
 * Scene クラス
 * 
 * @param {String} name
 */
function Scene(name){
	Basic.init(this).extend(DisplayObject);
	this._element = new this.createElement('div');
	this.ENTER_FRAME = '_enterframe';
	this._element.style.position = 'relative'
	if(name){
		this._sceneName = name;
	}else{
		this._sceneName = 'Scene' + Scene.number;
		Scene.number++;
	}
	this._children = [];
}
Scene.number = 0;
Scene.prototype = {
	/**
	 * 
	 */
	start : function(){
		trace(this._sceneName ,"start()")
		this.ENTER_FRAME = 'enterframe';
	},
	/**
	 * 
	 */
	stop : function(){
		trace(this._sceneName ,"stop()")
		this.ENTER_FRAME = '_enterframe';
	},
	//オーバーライド
	/**
	 * オーバーライド　addChild
	 * シーンに表示オブジェクトを追加します
	 * @param {displayObject} displayObject
	 */
	addChild:function(displayObject){
		this._element.appendChild(displayObject._element);
		displayObject.parent = this;
		displayObject._scene = this;
		this._children.push(displayObject);
		var _ar = displayObject._children;
		try{
			for (var i=0; i < _ar.length; i++) {
				_ar[i]._scene = this;
				var _br = _ar[i]._children;
				for (var i2=0; i2 < _br.length; i2++){
					_br[i2]._scene = this;
					var _cr = _br[i2]._children;
					for (var i3=0; i3 < _cr.length; i3++) {
						_cr[i3]._scene = this;
						var _dr = _cr[i3]._children;
						for (var i4=0; i4 < _dr.length; i4++) {
							_dr[i4]._scene = this;
						};
					};
				};
			};
		}catch(e){
			trace(e);
		}
	},
	/**
	 * オーバーライド　removeChild
	 * シーンから表示オブジェクトを削除します
	 * @param {displayObject} displayObject
	 */
	removeChild:function(displayObject){
		this._element.removeChild(displayObject._element);
		for(i = 0; i < this._children.length; i++){
			if(this._children[i] == displayObject){
				trace('scene delete obj',displayObject)
				this._children.splice(i,1);
			}
		}
		displayObject._scene = null;
		delete displayObject._scene;
		
	}
}

/**
 * Timerクラス
 * as3のタイマークラスと同等
 * msecTimeミリ秒ごとにTimer.TIMERが送出されます。ループカウントが終わるタイミングでTimer.COMPLETEが送出されます。
 * 
 * @param {Number} msecTime
 * @param {Number} count　０でmsecTime間隔で無限ループします。　１以上はループする数
 */
function Timer(msecTime,count){
	Basic.init(this).extend(EventDispatcher);

	Timer.COMPLETE = "complete";
	Timer.PAUSE = "pause";
	Timer.TIMER = "timer";
	this._timerFlag = false;
	this._msecTime = msecTime;
	this._counter = 0;
	count?this._loopCount = count : this._loopCount;
	if(count==0){
		this._loopFlag = true;
	}
}
Timer.prototype = {
	/**
	 * タイマーを開始します
	 */
	start:function(){
		var self = this;
		self._timerFlag = true;
		this.nID = setInterval(function()
		{
			if(self._msecTime > self._counter * 10 && self._timerFlag)
			{
				self._counter++;
			}else{
				if(self._loopFlag){
					self._counter = 0;
					self.dispatchEvent(Timer.TIMER);
				}else{
					if(self._loopCount>0){
						self._counter = 0;
						self.dispatchEvent(Timer.TIMER);
						self._loopCount--;
					}else{
						clearInterval(self.nID);
						self.stop();
					}
				}
			}
		},10);

	},
	/**
	 * 中断します
	 */
	pause:function(){
		var s= this;
		clearInterval(s.nID);
		this.dispatchEvent(Timer.PAUSE);  //calllbackメソッドに登録されている、このクラスの親のメソッドを実行
	},
	/**
	 * タイマーを終了します。
	 */
	stop:function(){
		this._timerFlag = false;
		this.dispatchEvent(Timer.COMPLETE);  //calllbackメソッドに登録されている、このクラスの親のメソッドを実行
	}
}
/**
 * Basic.Ajax処理をするクラス
 * 画像のプリロードなど
 * 
 * @param {Object} data
 * @param {String} method
 * @param {String} fileName
 * @param {Boolean} async
 * @param {String} callback
 * @param {Object} callbackObj
 */
Basic.Ajax = function(data, method, fileName, async, callback, callbackObj) {
	//XMLHttpRequestオブジェクト生成
	var req = new XMLHttpRequest();

	//open メソッド
	req.open(method, fileName, async);
	req.param = fileName;
	if(method == 'POST'){
	}
	req.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
	req.overrideMimeType('text/plain; charset=x-user-defined');
	//受信時に起動するイベント
	req.onreadystatechange = function(){
		//readyState値は4で受信完了
		if(req.readyState == 4){
			//コールバック
			var _type = req.getResponseHeader('Content-Type') || '';
			if (_type.match(/^image/)) {
				
			}
			if(typeof callback != 'string')
				callback(req.responseText,req.param);
			else{
				callbackObj[callback](req.responseText,req.param);
			}
		}
	}
	
	var _param = '';
	for(var key in data){
		if(_param != '')_param += '&';
		_param += key + '=' + data[key];
	}
	//console.log(data);
	//console.log(_param);
	//send メソッド
	req.send(_param);
}

//コールバック関数 ( 受信時に実行されます )
function on_loaded(oj) {
	//レスポンスを取得
	res = oj;

	//ダイアログで表示
	console.log(res);

}
/**
 * trace　console.logにtoraceされます
 * @param {Object} value
 */
function trace(value){
	if(arguments.length>=2){
		console.log(arguments);
	}else{
		console.log(value);
	}
	console.trace();
}
/**
 * 外部jsを読み込む
 * 
 * @param {Object} src
 */
function Import(src) {
	var _elm = document.createElement("script");
	_elm.src=src;
	_elm.charset="UTF-8"
	document.getElementsByTagName("head")[0].appendChild(_elm);
}

/**
 * fps
 */
function FpsView(){
	this._fr=stage.fps;
	this.init();
};
FpsView.prototype={
	init:function(){
		var stats = new Stats();
		
		// Align top-left
		stats.getDomElement().style.position = 'absolute';
		stats.getDomElement().style.left = '0px';
		stats.getDomElement().style.top = '0px';
		
		stage._element.appendChild( stats.getDomElement() );
		
		setInterval( function () {
		   stage.rialTimeFps = stats.update();
		}, 1000 / this._fr );

	}
}