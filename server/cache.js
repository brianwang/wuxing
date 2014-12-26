//var redis = require("redis"),
//var snappy = require('snappy');
var Q = require('q');
var redis = require('redis');
var zlib = require('zlib');
redisclient = redis.createClient(6379, '127.0.0.1', {});
redisclient.on('error', function(err) {
    console.log('redis error:' + err);
});
lock = require("redis-lock")(redisclient);
exports.compress = function(input) {
    if (input == null) {
        return;
    }
    var deferred = Q.defer();
    zlib.deflate(input, function(err, buffer) {
        if (!err) {
            deferred.resolve(buffer.toString('base64'));
        } else {
            deferred.reject(new Error(err));
        }
    });
    return deferred.promise;
}
exports.uncompress = function(out) {
    if (out == null) {
        return;
    }
    var deferred = Q.defer();
    var buffer = new Buffer(out, 'base64');
    zlib.unzip(buffer, function(err, buffer) {
        if (!err) {
            deferred.resolve(buffer.toString());
        } else {
            deferred.reject(new Error(err));
        }
    });
    return deferred.promise;
}