
    $(document).ready(function() {
        $('#btn_addcard').click(function() {
            var data = $('#form_addcard').serializeForm();
            //console.log(data);
            $.post('/addcard', data, function(result) {
                result = JSON.parse(result);
                if (result.result == 'success') {
                    alert('添加成功');
                } else {
                    alert('添加失败');
                }
            });
        });
    });