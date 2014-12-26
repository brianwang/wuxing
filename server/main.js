var server = require('./server');
var _ = require('underscore');
var os = require('os');
var cache = require('./cache');
var loads = os.loadavg();
var async = require('async');
var GAMEID = 2;
var gameserver = server.create(GAMEID);
var log4js = require('log4js');
var db = require('./db');
var logger = log4js.getLogger(__filename);
//游戏列表
gameserver.games = {};
//游戏申请人列表
gameserver.gameusers = {};
gameserver.gameplayers = {};
gameserver.applygameusers = {};
gameserver.on('connect', function(sock) {
    logger.info('connect:');
});
gameserver.on('data', function(sock, data) {
    data = JSON.parse(data);
    logger.log('data.type is ' + data.type);
});
//关闭socket
function closesocket(sock) {
    var idx = gameserver.socks.indexOf(sock);
    if (idx != -1) {
        gameserver.socks.splice(idx, 1);
    }
    if (sock.rid != undefined && sock.uid != undefined) {
        if (gameserver.sockets[sock.rid][sock.uid] != undefined) {
            delete gameserver.sockets[sock.rid][s.uid];
        }
        var offlinemsg = {
            msgType: 'offline',
            fromUID: sock.uid,
            fromNick: sock.user.nickname
        };
        //断线删掉
        gameserver.sendpublic(offlinemsg);
    }
}
//sock关闭
gameserver.on('close', function(sock) {
    logger.info('close:' + sock);
    closesocket(sock);
});
gameserver.on('login', function(sock, message) {
    sock.rid = message.rid;
    sock.uid = message.uid;
    var sql = 'select u.*,c.* from player_cards pc join users u on u.id=pc.uid join cards c on c.id=pc.cid where uid=\'' + escape(message.uid) + '\'';
    db.query(sql, function(err, rows, fields) {
        if (err) {
            logger.error(err);
        } else {
            var cardmsg = {
                type: 'cards',
                cards: rows
            }
            debugger;
            gameserver.sendpvtmsg(sock, cardmsg);
        }
    });
});
//sock出错
gameserver.on('error', function(sock, error) {
    logger.info(error);
    if (sock.uid != undefined) {
        sock.buffer += JSON.stringify({
            msgType: 'error',
            info: JSON.stringify(error),
            to: sock.uid
        }) + '\n';
    }
});
var GAMETIME = 30;
var APPLYTIME = 10;
var SELECTPLAYER = 3;
var KICKTIME = 5;
var STARTTIME = 3;
var PLAYERCOUNT = 4;
gameserver.server.listen(3000, '0.0.0.0');
setInterval(function() {
    gameserver.sending();
}, 10);