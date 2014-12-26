 $(document).ready(function() {
     $('#login').click(function(e) {
         var formdata = $('#f_login').serializeObject();
         pomelo.request("connector.entryHandler.login", formdata, function(data) {
             console.log(data);
             if (data.code == 200) {
                 window.location.replace('/room');
             } else {
                 alert(data.msg);
             }
         });
     });
 });

 function test() {
     //alert('aaa');
 }
 test();