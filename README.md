basic.js
========

actionscript3.0ライクで「spriteA.addChild(spriteB)」のできるdomベースなjavascripptライブラリ

SpriteオブジェクトにSpriteオブジェクトをaddChildできる、domベースなライブラリ（Basic.js）を作りました。

    var _spA = new Sprite();
    var _spB = new Sprite();
    _spA.addChild(_spB);
これによって生成されるdom↓

    <div>            <!-- _spA -->
       <div></div>   <!-- _spB -->
    </div>


Usage
-----

・htmlで“stage”というIDのdivを用意します。  

    <html>
    <head>
    <script src="/Basic.js" charset="utf-8"></script>
    </head>
    <body>
        <div id="stage"></div>   //このdivが描画領域になります
    </body>
    </html>
     

・javascript

    window.onload = function(){
        stage = new Stage(240,320);　//引数は幅と高さ
        stage.fps = 30;　　　　　　//fps※1秒間の描画数
        stage.preload(['./images/img1.png', './images/img2.png']);   //preloadしたい画像のpathを配列形式で指定
        stage.onload = Main;        //imageが全てloadされると　new Main(); される
        
        function Main(){
            var _spA = new Sprite(20,28);
            _spA.image = ‘img1.png’;
            stage.addChild(_spA);
        }
    ;}

- “stage”変数はグローバル変数であり、名前もこのまま使用してください。
- Stageオブジェクトenchant.jsでいうGameオブジェクトです。  
ゲーム全体を管理し、動かすシステム、つまりゲームの基本的な機能を提供します。   
すべてのゲームは、Stage オブジェクトを中心に動作します。 


クラス構成図
------------
<img src="https://raw.github.com/youtakanke/basic.js/master/images/basic_class.png">

クラスの定義と継承
------------------
クラス定義はjsの通常のfunction定義と同じです。

    function Scene01(sceneName){ }

続いて継承方法です。 

    function Scene01(sceneName){
        Basic.init(this).extend(Scene);
    }
    
これによりScene01クラスはSceneクラスのプロパティを使えるようになります。  


addEventListener と dispatchEvent
---------------------------------

EventDispatcherクラスを継承することで、addEventListener　と　dispatchEvent　が使えるようになります。  
これにより、任意のイベントハンドラーを設定することができるようになります。  
  
※EventDispatcherクラスはBasic.jsで実装されているほぼ全てのクラスが継承しています。  
 (Sprite、Stage、Scene、TextFieldなど)  
※BEventクラスはイベントオブジェクトを返すクラスです。  



    stage.onload = Main;　　　//実行

    function Test{
        Basic.init(this).extend(EventDispatcher);  //これでTestクラスは　addEventListener　と　dispatchEvent　が使える
    }
    Test.prototype = {
        start : function(){
            this.dispatchEvent( new BEvent( 'aaaaaa' , this));　　　// ※ BEventの第二引数はtargetオブジェクトを
        }
    }
    
    function Main(){
        var _test = new Test();
        _test.addEventListener('aaaaaa', 'bbbbb', this);    //aaaaaaのカスタムイベントハンドラを登録
        _test.start();
    }
    Main.prototype = {
        //callbackで指定された関数
        bbbbb : function(e){
            alert(e.type);　　
        }
    }

※結果はアラートで「aaaaaa」が表示されます。  
  
通常のMouseEventやtouchEventなども無論使えます。  


License
---------
Dual licensed under the MIT or GPL Version 2 licenses


- ©k-factory All Rights Reserved
- blog http://kf-plvs-vltra.com/blog/