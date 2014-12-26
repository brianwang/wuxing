var express = require("express");
var validator = require('validator');
//var session = require('express-session')
var md5 = require('MD5');
var app = express();
//var bodyParser = require('body-parser');
//var multer = require('multer');
var twig = require('twig');
var mysql = require('mysql');
var captcha = require('easy-captcha');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '9dYt?1/I',
    database: 'wuxing'
});
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});
app.use('/captcha.jpg', captcha.generate());
app.set('view engine', 'html');
app.engine('html', twig.__express);
app.set('views', __dirname + '/public/views');
app.set('basepath', __dirname + '/public');
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    return res.render('index', {
        title: 'Home'
    });
});
app.get('/register', function(req, res) {
    return res.render('register', {
        title: '注册'
    });
});
app.get('/room', function(req, res) {
    var roomlistsql = 'select * from rooms;'
    connection.query(roomlistsql, function(err, rows, fields) {
        if (err) {
            throw err;
        } else {
            return res.render('room', {
                title: '注册',
                roomlist: rows
            });
        }
    });
});
app.get('/addcard', function(req, res) {
    return res.render('addcard', {
        arrs1: [{
            value: 'hp',
            name: '体力值'
        }, {
            value: 'mp',
            name: '法力值'
        }, {
            value: 'cd',
            name: '冷却时间'
        }, {
            value: 'ab',
            name: '攻击加成'
        }],
        attrs: [{
            value: 'gas',
            name: '气'
        }, {
            value: 'wood',
            name: '木'
        }, {
            value: 'water',
            name: '水'
        }, {
            value: 'fire',
            name: '火'
        }, {
            value: 'mood',
            name: '土'
        }, {
            value: 'gold',
            name: '金'
        }]
    });
});
app.post('/card/add', function(req, res) {
    var cardinfo = req.params;
    var sql
    connection.query(roomlistsql, function(err, rows, fields) {
        if (err) {
            throw err;
        } else {
            return res.render('room', {
                title: '注册',
                roomlist: rows
            });
        }
    });
});
app.get('/card/:id', function(req, res) {
    var playercards = [];
    var roomid = req.params.id;
    var mycards = [];
    return res.render('card', {
        title: '牌卡',
        mycards: mycards,
        roomid: roomid,
        playercards: playercards
    });
});
app.post('/auth/register', captcha.check, function(req, res) {
    console.log(req.body);
    var postreq = req.body;
    var is_ajax_request = req.xhr;
    if (postreq.username != '' && postreq.password != "" && postreq.confirmpassword != "" && postreq.nickname != "") {
        if (postreq.password != postreq.confirmpassword) {
            res.json({
                result: 'error',
                message: '不一致'
            });
            res.end();
        } else {
            if (!req.session.captcha.valid) {
                return res.send(401, "Captcha does not match");
            } else {
                var passtoken = md5(postreq.password + new Date().toString());
                console.log('passtoken' + passtoken);
                var sql = 'insert into users(username,nickname, password, passtoken,register_time) values(\'' + postreq.username + '\',\'' + postreq.nickname + '\',\'' + md5(postreq.password) + '\',\'' + passtoken + "',NOW())";
                console.log(sql);
                connection.query(sql, function(err, rows, fields) {
                    if (err) {
                        throw err;
                    } else {
                        if (is_ajax_request) {
                            res.json({
                                result: 'success',
                                message: '注册成功'
                            });
                            res.end();
                        } else {
                            res.redirect('/');
                        }
                    }
                });
            }
        }
    } else {
        res.json({
            result: 'error',
            message: '参数不正确'
        });
        res.end();
    }
});
console.log("Web server has started.\nPlease log on http://127.0.0.1:3001/index.html");
app.listen(3011);