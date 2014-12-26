var log4js = require('log4js');
var logger = log4js.getLogger(__filename);
var net = require('net');
var util = require('util');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var Socket = function(id) {
    this.socks = [];
    this.sockets = {};
    var self = this;
    self.id = id;
    EventEmitter.call(this);
    self.server = new net.createServer(function(sock) {
        self.socks.push(sock);
        sock.buffer = '';
        sock.on('data', function(data) {
            data = data.toString().replace(/\u0000+/, "").trim();
            if (data.length > 1 && data.length <= 2048) {
                logger.info('[RAW]:' + data.toString());
                //self.emit('data', sock, data);
                var messages = data.split('\n');
                for (var jj = 0; jj < messages.length; jj++) {
                    var message = {};
                    try {
                        message = JSON.parse(messages[jj]);
                    } catch (err) {
                        logger.error(err);
                        return;
                    }
                    if (message == null) {
                        logger.error('message parse error:' + JSON.stringify(message));
                        return;
                    }
                    if ((message.from == "" || message.from == undefined) && sock.uid != undefined && sock.uid != "") {
                        message.to_uid = message.to;
                    }
                    message.socket_id = sock.key;
                    if ((message.rid == "" || message.rid == undefined) && sock.rid != undefined && sock.rid != "") {
                        message.rid = sock.rid;
                    }
                    var rid = message.rid;
                    var uid = message.from;
                    //把消息过滤
                    //try {
                    self.emit(message.type, sock, message);
                    // } catch (err) {
                    //     logger.error(err);
                    //     if (message.messagetype == 'private') {
                    //         self.sendpvt(message);
                    //     } else {
                    //         self.sendpublic(message);
                    //     }
                    // }
                }
            } else {
                logger.warn('数据length:' + data.length + ' invalid');
            }
        });
        sock.on('error', function(err) {
            logger.error(err);
            self.emit('error', sock, err);
        });
        sock.on('close', function(s) {
            self.emit('close', s);
        });
    });
    util.inspect(self.server.listeners('connection'));
    logger.info('server init success');
    return self;
};
util.inherits(Socket, EventEmitter);
//全部消息发送
Socket.prototype.sendpublic = function(msg) {
    if (msg.type != 'gamesec' && msg.type != 'changeMove') {
        logger.info('sendpublic message:' + JSON.stringify(msg));
    }
    msg = JSON.stringify(msg) + '\n';
    //公聊消息
    async.each(this.socks, function(sock) {
        sock.buffer += msg;
    });
}
Socket.prototype.fastsendpub = function(msg) {
    if (typeof msg == 'object') {
        msg = JSON.stringify(msg) + '\n';
    }
    async.each(this.socks, function(sock) {
        var len = Buffer.byteLength(msg);
        var Buf = new Buffer(len);
        Buf.write(msg, 0);
        try {
            if (sock.writable) {
                sock.write(Buf);
            }
            sock.buffer = '';
            delete Buf;
        } catch (err) {
            sock.buffer = '';
            logger.error('socket send error:' + JSON.stringify(err));
        }
    });
}
Socket.prototype.sendpvtmsg = function(sock, msg) {
    msg = JSON.stringify(msg) + '\n';
    sock.buffer += msg;
}
Socket.prototype.sendpvt = function(msg) {
    if (msg.to == undefined || msg.rid == undefined) {
        logger.warn('msg.to or msg.rid is undefined');
        return;
    }
    //私聊消息
    if (this.sockets[msg.rid][msg.to] != undefined) {
        var s = this.sockets[msg.rid][msg.to];
        if (s != undefined) {
            this.sendpvtmsg(s, msg);
        } else {
            logger.warn('message has no to or rid');
        }
    } else {
        logger.warn('sockets has no socket');
    }
}
Socket.prototype.sending = function() {
    //logger.info('sending.......');
    async.each(this.socks, function(sock) {
        if (sock.buffer != '') {
            logger.info('socket buffer:' + sock.buffer);
            var len = Buffer.byteLength(sock.buffer);
            var Buf = new Buffer(len);
            Buf.write(sock.buffer, 0);
            try {
                if (sock.writable) {
                    sock.write(Buf);
                }
                sock.buffer = '';
                delete Buf;
            } catch (err) {
                sock.buffer = '';
                logger.error('socket send error:' + JSON.stringify(err));
            }
        }
    });
};
exports.create = function(id) {
    return new Socket(id);
}