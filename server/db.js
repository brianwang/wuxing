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

module.exports = exports = connection;