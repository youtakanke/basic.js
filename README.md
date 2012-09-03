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
