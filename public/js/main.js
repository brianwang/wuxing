    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    var swf = document.getElementById('socketswf');
    var socket = {
        readyHandler: function() {
            swf.connect('localhost', 1589);
        },
        connectHandler: function() {
            console.log('connectHandler');
        },
        ondata: function(message) {
            console.log(message);
        },
        ioErrorHandler: function(err) {
            console.log(err);
        },
        close: function() {
            var objDiv = document.getElementById('output');
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    };
    $(document).ready(function() {
        //$('.card').click(function(e){
        //    socket.emit('playcard',{id:1});
        //});
        $('.gamebegin').click(function(e) {
            swf.send("{type:'login',from:'bbbb',to: 'aaa'}" + '\n');
        });
    });