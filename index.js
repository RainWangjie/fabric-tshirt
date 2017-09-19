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
    QRCode = require("qrcode-svg");

var localhost = '',
    port = process.env.PORT || 9100;

try {
    var network = os.networkInterfaces();
    localhost = network['en0'][1].address
} catch (e) {
    localhost = 'localhost';
}
var url = 'http://' + localhost + ':' + port,
    hello = new QRCode(url),
    modules = hello.qrcode.modules,
    ascii = '\t\t',
    length = modules.length;
for (var y = 0; y < length; y++) {
    for (var x = 0; x < length; x++) {
        var module = modules[x][y];
        ascii += (module ? 'x' : ' ');
    }
    ascii += '\r\n\t\t';
}

server.listen(port, function () {
    console.log('success:', url);
    console.log(ascii);
    opn(url);
});


app.use(express.static(path.join(__dirname, 'src')));

app.get('/', function (req, res) {
    res.sendfile("src/fabric_control.html");
}); //指定静态HTML文件的位置