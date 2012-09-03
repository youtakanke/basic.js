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
        stage.onload = Main;
        
        function Main(){
            〜//最初に実行される関数を代入※後述
        }
    ;}

- “stage”変数はグローバル変数であり、名前もこのまま使用してください。
- Stageオブジェクトenchant.jsでいうGameオブジェクトです。  
ゲーム全体を管理し、動かすシステム、つまりゲームの基本的な機能を提供します。   
すべてのゲームは、Stage オブジェクトを中心に動作します。 

License
---------
Dual licensed under the MIT or GPL Version 2 licenses


- ©k-factory All Rights Reserved
- blog http://kf-plvs-vltra.com/blog/