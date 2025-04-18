$(function () {
  'use strict';

  window.Input = function (selector) {

    var $ele,  //这个selector代表的元素
      $error_ele,
      me = this,
      rule = {
        required: true
      };

    this.load_validator = function () {
      var val = this.get_val();
      this.validator = new Validator(val, rule);
    }

    this.get_val = function () {
      return $ele.val();
    }

    function init() {
      find_ele();
      get_error_ele();
      parse_rule();
      me.load_validator();   //暴露出去的加载验证函数
      listen();
    }

    //在输入框blur的时候验证
    function listen() {
      $ele.on('blur', function () {
        var valid = me.validator.is_valid(me.get_val());
        if (valid)
          $error_ele.hide();
        else
          $error_ele.show();
      })
    }

    function get_error_ele() {
      $error_ele = $(get_error_selector());
    }

    function get_error_selector() {
      return '#' + $ele.attr('name') + '-input-error';
    }

    //确定$ele是哪个
    function find_ele() {
      if (selector instanceof jQuery) {  //如果输入的是jQuery对象,如$("#abc")
        $ele = selector;  //$ele=$("#abc")
      }
      else {
        $ele = $(selector); 
      }
    }

    function parse_rule() {
      // .data方法专门用于用于获取'data-'开头的属性字符串
      // .data()方法为jQuery独有, 原生可以使用$ele.getSet.rule, 或者$ele.getAttribute('data-rule')来获取
      // 'min:18|maxlength:10'
      var rule_string = $ele.data('rule');  //相当于获取'data-rule'"
      if (!rule_string) return;  //没有rule

      // .split()方法 分割
      var rule_arr = rule_string.split('|');  //返回一个数组
      // rule_arr['min:18','maxlength:10']
      for (var i = 0; i < rule_arr.length; i++) {
        var item_str = rule_arr[i];
        var item_arr = item_str.split(':');
        // item_arr['min','18']
        rule[item_arr[0]] = JSON.parse(item_arr[1]);  //通过JSON.parse()来确定返回值的类型
        // rule['min'] = '18'
        // rule{min:18}
      }
    }

    init();
  }
})
