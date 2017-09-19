/**
 * Created by gewangjie on 2017/9/19
 */
var imageList = {
    'bear': 'http://o830wpqbz.bkt.clouddn.com/bear.jpg',
    'kobe': 'http://o830wpqbz.bkt.clouddn.com/11-2.jpg',
    'chicken': 'http://o830wpqbz.bkt.clouddn.com/chicken.png',
    'cat': 'http://o830wpqbz.bkt.clouddn.com/cat.jpg',
};
var maskImg, readyMask = false;

var moban = {
    1: {
        'frame': 'http://o830wpqbz.bkt.clouddn.com/FlN20Fq7e_yoiLU6TaAu8FiABbzU',
        'mask': 'http://o830wpqbz.bkt.clouddn.com/FvYmZw36u8kBAApgnwtGIZMQ7PS_'
    },
    2: {
        'frame': 'https://o5b8263mg.qnssl.com/FuzvbT6HgSK2ht_8EUyWG-RDO48m',
        'mask': 'https://o5b8263mg.qnssl.com/FmN3FNZpSykUUDavFKj1Enq_-odw'
    },
    3: {
        'frame': 'https://o5b8263mg.qnssl.com/FmwDI6woIEPe3gJ4UxnMwz4G6Doi',
        'mask': 'https://o5b8263mg.qnssl.com/FsjIbRdmUywJVYyxCQryOR-xA8xD'
    },
    4: {
        'frame': 'https://o5b8263mg.qnssl.com/FtYXMR4MMh40oxiD4QmE7Fn5u8yM',
        'mask': 'https://o5b8263mg.qnssl.com/Fm8Sl0tSNNO6JXgaZI6FUWC51s-k'
    },
    5: {
        'frame': 'https://o5b8263mg.qnssl.com/FiFIry6RZ9NkxkYZxBXVzkicTJHM',
        'mask': 'https://o5b8263mg.qnssl.com/Fi9-iXzqSSv1hjw82TKBuX__Evf8'
    }
};

var w = window.screen.availWidth,
    h = window.screen.availHeight;
var standard = 900;
w = w > standard ? standard : w;
h = h > standard ? standard : h;

var horizontalCenterLine, verticalCenterLine;

$('.design-area').css({
    width: w,
    height: w
});
document.getElementById('fabric_canvas').width = w - 2;
document.getElementById('fabric_canvas').height = w - 2;


var canvas = new fabric.Canvas('fabric_canvas', {
        moveCursoe: 'move'
    }),
    ctx = canvas.getContext('2d');

canvas.crossOrigin = '*';

var canvas_w = canvas.width,
    canvas_h = canvas.height;
//    绘画模式
//    canvas.isDrawingMode = true;

// 操作区域
var print = {
    x: Math.round(canvas_w * 0.2839),
    y: Math.round(canvas_h * 0.2443),
    w: Math.round(canvas_w * 0.4354),
    h: Math.round(canvas_h * 0.5474)
};

print.center = {
    x: Math.round(print.x + print.w / 2),
    y: Math.round(print.y + print.h / 2)
};
fabric.Canvas.prototype.customiseControls({
    tl: {
        action: 'rotate',
        cursor: 'pointer'
    },
    tr: {
        action: 'scale'
    },
    bl: {
        action: 'remove',
        cursor: 'pointer'
    },
    br: {
        action: 'moveUp',
        cursor: 'pointer'
    },
    mb: {
        action: 'moveDown',
        cursor: 'pointer'
    },
    mr: {
        action: function (e, target) {
            target.set({
                left: w / 2,
                top: h / 2
            });
            canvas.renderAll();
        },
        cursor: 'pointer'
    },
    mt: {
        action: {
            'rotateByDegrees': 45
        },
        cursor: 'pointer'
    }
});
// basic settings
fabric.Object.prototype.customiseCornerIcons({
    settings: {
        borderColor: '#0094dd',
        cornerSize: 25,
        cornerShape: 'rect',
        cornerBackgroundColor: 'black'
    },
    tl: {
        icon: '../images/icons/rotate.svg'
    },
    tr: {
        icon: '../images/icons/resize.svg'
    },
    bl: {
        icon: '../images/icons/remove.svg'
    },
    br: {
        icon: '../images/icons/up.svg'
    },
    mb: {
        icon: '../images/icons/down.svg'
    },
    ml: {
        icon: '../images/icons/diagonal-resize.svg'
    },
    mr: {
        icon: '../images/icons/diagonal-resize.svg'
    }
});


function addImg(url, id) {
    fabric.Image.fromURL(url, function (img) {
        var scale = print.w / img.getWidth() * .8;
        setObject(img, function () {
            img.set({
                id: id,
                left: canvas_w / 2,
                top: canvas_h / 2,
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                centeredScaling: true,
                hasRotatingPoint: false
            });
        });
    }, {
        crossOrigin: 'anonymous'
    });
}

function setObject(object, setFun) {
    setFun && setFun();
    object.setControlsVisibility({
        ml: false,
        mr: false,
        mt: false
    });
    object.on('rotating', function () {
        autoAngle(this);
        drawRotationCircle(this);
    });
    object.on('moving', function () {
        var centerPiont = this.getCenterPoint(),
            differ_x = centerPiont.x - print.center.x,
            differ_y = centerPiont.y - print.center.y;
        //自动吸合辅助线
        if (Math.abs(differ_y) < 5) {
            this.setTop(centerPiont.y - differ_y);
            horizontalCenterLine || drawHorizontalCenterLine();
        } else {
            removeHorizontalCenterLine();
        }
        if (Math.abs(differ_x) < 5) {
            this.setLeft(centerPiont.x - differ_x);
            verticalCenterLine || drawVerticalCenterLine();
        } else {
            removeVerticalCenterLine();
        }

    });
    object.on('mouseup', function () {
        clearOther();
    });
    object.on('selected', function () {
        var w = this.width,
            h = this.height;
        object.clipTo = function () {
            ctx.rect(-w / 2, -h / 2, w, h);
        };
    });
    // modified 实时，性能
    // deselected 取消寻中执行
    object.on('modified', function () {
        readyMask && useMask(this);
        this.clipTo = function (ctx) {
            this.setCoords();
            ctx.save();
            ctx.translate(-this.width / 2, -this.height / 2);
            ctx.rotate(-1 * this.angle * (Math.PI / 180));
            ctx.scale(1 / this.scaleX, 1 / this.scaleY);
            ctx.beginPath();
            ctx.rect(print.x - this.oCoords.tl.x, print.y - this.oCoords.tl.y, print.w, print.h);
            ctx.closePath();
            ctx.restore();
        };
    });
    object.on('deselected', function () {
        //mask
    });
    // overwrite the prototype object based
    object.customiseCornerIcons({
        settings: {
            borderColor: 'black',
            cornerSize: 20,
            cornerShape: 'circle',
            cornerBackgroundColor: 'black',
            cornerPadding: 10
        },
        mt: {
            icon: '../images/icons/acute.svg'
        },
        mr: {
            icon: '../images/icons/repair-tools-cross.svg'
        }
    }, function () {
        canvas.renderAll();
    });
    canvas.add(object).setActiveObject(object);
}

//    按钮
$('#word').focus(function () {
    $(this).val('');
});

$('.choose-photo').click(function () {
    var name = $(this).attr('data-id');
    var url = imageList[name];
    addImg(url, name);
});

$('.getActiveObject').click(function () {
    console.log('选中' + canvas.getActiveObject().id);
});

$('.big_small').click(function () {
    $('.design-area').toggleClass('bigger');
});

$('#addWord').click(function () {
    addWord($('#word').val());
});

$('.submit_img').click(function () {
    var data = {
        'img_json': JSON.stringify(canvas),
        'width': w,
        'height': h
    };
    $.post('http://10.1.1.237:9100', data, function (d) {
        console.log(d);
    });
});

//模版
$('.moban').click(function () {
    var id = $(this).attr('data-moban');
    if (id !== '0') {
        //边框前景色 frame
        canvas.setOverlayImage(moban[id].frame, canvas.renderAll.bind(canvas), {
            left: print.center.x,
            top: print.center.y,
            originX: "center",
            originY: "center",
            width: print.w,
            height: print.h,
            crossOrigin: 'anonymous'
        });
        //mask
        readyMask = false;
        new fabric.Image.fromURL(moban[id].mask, function (img) {
            maskImg = img;
            useMask(canvas.getActiveObject());
            readyMask = true;
        }, {
            crossOrigin: 'anonymous'
        });
    } else {
        canvas.overlayImage.opacity = 0;
        readyMask = false;
        canvas.renderAll();
    }
});
var maskCanvas, maskCtx;

//    辅助画布
//    function initMask() {
//        maskCanvas = document.createElement('canvas');
//        maskCanvas.style.float = 'right';
//        maskCanvas.style.background = '#f1f1f1';
//        maskCanvas.style.border= '1px solid #000';
//        maskCanvas.width = print.w;
//        maskCanvas.height = print.h;
//        $('body').append(maskCanvas);
//        maskCtx = maskCanvas.getContext('2d');
//    }
//    initMask();
//添加文字
function addWord(text) {
    var word = new fabric.Text(text, {
        left: canvas_w / 2,
        top: canvas_h / 2,
        originX: "center",
        originY: "center",
        textAlign: "center",
        fontFamily: $('#font_family').val(),
        fontSize: 30,
        lineHeight: 1.3,
        fill: $('#color').val(),
        backgroundColor: "transparent",
        hasRotatingPoint: false
    });
    setObject(word)
}
//辅助圆drawRotationCircle
var assistWord, assistCircle;
function drawRotationCircle(t) {
    //t:fabric.object
    var angle = Math.round(t.getAngle()),
        i = angle % 45 == 0;
    var centerPoint = t.getCenterPoint(),

        radius = Math.sqrt(Math.pow(t.getWidth() / 2, 2) + Math.pow(t.getHeight() / 2, 2));
    if (assistWord) {
        assistWord.set({
            left: centerPoint.x,
            top: centerPoint.y - radius - 10,
            text: angle + "º",
            fill: i ? "#fff" : "#00B2A5",
            backgroundColor: i ? "#00B2A5" : "transparent"
        });
        assistCircle.set({
            radius: radius
        });
    } else {
        //角度文字
        assistWord = new fabric.Text(angle + "º", {
            left: centerPoint.x,
            top: centerPoint.y - radius - 10,
            selectable: !1,
            originX: "center",
            originY: "center",
            textAlign: "center",
            fontSize: 12,
            lineHeight: 1.3,
            fill: i ? "#fff" : "#00B2A5",
            backgroundColor: i ? "#00B2A5" : "transparent"
        });
        //辅助圆
        assistCircle = new fabric.Circle({
            fill: "transparent",
            stroke: "#00B2A5",
            strokeWidth: 1,
            selectable: !1,
            left: centerPoint.x,
            top: centerPoint.y,
            radius: radius,
            originX: "center",
            originY: "center"
        });
        canvas.add(assistWord).add(assistCircle)
    }
}
function removeRotationCircle() {
    canvas.remove(assistWord).remove(assistCircle);
    assistWord = '';
    assistCircle = '';
}
function autoAngle(t) {
    var angle = Math.round(t.getAngle()),
        n = angle % 45;
    //5度内吸合
    n < 5 && t.setAngle(angle - n);
    n > 40 && t.setAngle(angle + 45 - n);
}
//辅助线
function drawHorizontalCenterLine() {
    horizontalCenterLine = new fabric.Line([0, print.center.y, canvas_w, print.center.y], {
        stroke: "#00B2A5",
        strokeWidth: 1,
        selectable: !1,
        width: 0,
        height: 0
    });
    canvas.add(horizontalCenterLine)
}
function drawVerticalCenterLine() {
    verticalCenterLine = new fabric.Line([print.center.x, 0, print.center.x, canvas_h], {
        stroke: "#00B2A5",
        strokeWidth: 1,
        selectable: !1,
        width: 0,
        height: 0
    });
    canvas.add(verticalCenterLine)
}
function removeHorizontalCenterLine() {
    canvas.remove(horizontalCenterLine);
    horizontalCenterLine = '';
}
function removeVerticalCenterLine() {
    canvas.remove(verticalCenterLine);
    verticalCenterLine = '';
}
//清除辅助
function clearOther() {
    removeRotationCircle();
    removeHorizontalCenterLine();
    removeVerticalCenterLine();
}

//mask操作
function useMask(object) {
    object.filters[0] = (new fabric.Image.filters.MaskUp({
        'mask': maskImg
    }));
    object.applyFilters(function () {
        canvas.renderAll();
    });
}

/*
 JSON序列化
 var img_json = JSON.stringify(canvas);
 JSON反序列化
 canvas.loadFromJSON(img_json);
 canvas.renderAll();
 */
