$(function () {
  'use strict';

  // 选中页面所有input[data-rule]
  var $inputs = $('[data-rule]'),
    $form = $('#signup'),
    inputs = [];
  $inputs.each(function (index, node) {
    // 解析每一个input的验证规则
    var tmp = new Input(node);
    inputs.push(tmp);
  })
  
  //在表单提交的时候进行验证
  $form.on('submit', function(event){
    event.preventDefault();  //防止刷新
    $inputs.trigger('blur');

    for(var i = 0; i < inputs.length; i ++){
      var item = inputs[i];
      var r = item.validator.is_valid();
      if(!r){
        alert('invalid');
        return;
      }
    }
    alert('valid!');
  })

  // 服务器通信
  // function signup(){
  //   $.post('/api/signup', {...})
  // }
  // 验证
});
