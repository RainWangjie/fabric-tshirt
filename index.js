/**
 * Created by gewangjie on 2017/9/19
 */
/**
 * Created by gewangjie on 2016/9/14.
 */
var os = require('os'),
    express = require('express'),
    app = express(),
    path = require('path'),
    opn = require('opn'),
    server = require('http').createServer(app),
    QRCode = require("qrcode-terminal");

var localhost = '',
    port = process.env.PORT || 9100;

try {
    var network = os.networkInterfaces();
    localhost = network['en0'][1].address
} catch (e) {
    localhost = 'localhost';
}

// Terminal内绘制二维码
var url = 'http://' + localhost + ':' + port;
QRCode.setErrorLevel('Q');
QRCode.generate(url);

// 打开默认浏览器
server.listen(port, function () {
    console.log('连接同一wifi下打开or扫码：', url);
    opn(url);
});

app.use(express.static(path.join(__dirname, 'src')));

app.get('/', function (req, res) {
    res.sendfile("src/fabric_control.html");
}); //指定静态HTML文件的位置