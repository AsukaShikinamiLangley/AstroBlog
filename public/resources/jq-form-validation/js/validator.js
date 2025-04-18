$(function () {
  'use strict';

  window.Validator = function (val, rule) {

    this.is_valid = function (new_val) {
      if (new_val !== undefined) {
        val = new_val;
      }
      // if(new_val)
      // val = new_val;

      var key; //key是rule{}里的'max'或'min'等

      // 先验证是否为必填项,若不是必填项且用户未填写内容则直接判定为合法
      if (!rule.required && !val) {
        return true;
      }

      for (key in rule) {
        // 防止重复检测
        if (key === 'required')
          continue;

        // 调用rule中相对应的方法
        var r = this['validate_' + key](); //this.validate_max()
        if (!r) return false;
      }
      return true;
    }

    this.validate_max = function () {
      pre_max_min();
      return val <= rule.max;
    }
    this.validate_min = function () {
      pre_max_min();
      return val >= rule.min;
    }
    this.validate_maxlength = function () {
      pre_length();
      return val.length <= rule.maxlength;
    }
    this.validate_minlength = function () {
      pre_length();
      return val.length >= rule.minlength;
    }

    this.validate_numeric = function () {
      return $.isNumeric(val);
    }

    this.validate_reuqired = function () {
      // 去掉val两边的空格
      var real = $.trim(val);
      if (!real && real != 0) {
        return false;
      }
      return true;
    }

    // 正则表达式验证用户名
    this.validate_pattern = function () {
      var reg = new RegExp(rule.pattern);
      return reg.test(val);
    }
    // 用于this.validate_max或this.validate_min
    function pre_max_min() {
      val = parseFloat(val);
    }

    // 用于this.validate_maxlength或this.validate_minlength
    function pre_length() {
      val = val.toString();
    }
  }
});