;
(function () {
  'use strict';
  //事件中心
  var Event = new Vue();

  var alert_sound = document.getElementById('alert-sound');

  function copy(obj) {
    //Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。
    return Object.assign({}, obj);
  }

  Vue.component('task', {
    template: '#task-tpl',
    props: ['todo'],
    methods: {
      action: function (name, params) {
        //子组件向父级传数据
        //https://cn.vuejs.org/v2/api/#vm-on 事件触发
        //this.$emit("自定义事件名",要传送的数据)
        //v-on:自定义事件名="在methods中的函数名"
        Event.$emit(name, params);
      }
    }
  });

  new Vue({
    el: '#main',
    data: {
      list: [],
      last_id: 0,
      current: {},
    },

    //加载的时候执行
    mounted: function () {
      var me = this;
      this.list = ms.get('list') || this.list;
      this.last_id = ms.get('last_id') || this.last_id;

      setInterval(function () {
        me.check_alerts();
      }, 1000);

      //组件事件
      Event.$on('remove', function (id) {
        if (id) {
          me.remove(id);
        }
      });

      Event.$on('toggle_complete', function (id) {
        if (id) {
          me.toggle_complete(id);
        }
      });

      Event.$on('set_current', function (id) {
        if (id) {
          me.set_current(id);
        }
      });

      Event.$on('toggle_detail', function (id) {
        if (id) {
          me.toggle_detail(id);
        }
      });
    },

    methods: {
      check_alerts: function () {
        var me = this;
        this.list.forEach(function (row, index) {
          alert_at = row.alert_at;
          if (!alert_at || row.alert_confirmed) {
            return;
          };

          //getTime():从1970年到现在过去多少毫秒
          var alert_at = (new Date(alert_at)).getTime();
          var now = (new Date()).getTime();

          if (now >= alert_at) {
            // alert_sound.play();
            var confirmed = confirm(row.title);
            Vue.set(me.list[index], 'alert_confirmed', confirmed);
          };
        })
      },

      merge: function () {
        //如果有id则是更新,没有则是添加
        var id;
        var is_update = id = this.current.id;
        if (is_update) {
          //.find()返回满足条件的第一个元素,这里是"item.id==is_update"
          var index = this.find_index_by_id(id);

          //vue中修改数组的方式
          Vue.set(this.list, index, copy(this.current));
        } else {
          var title = this.current.title;
          //title==0的时候也会return
          if (!title && title !== 0) {
            return;
          }

          var todo = copy(this.current);
          this.last_id++;
          ms.set('last_id', this.last_id);
          todo.id = this.last_id;
          this.list.push(todo);
        };

        this.reset_current();
      },

      remove: function (id) {
        var index = this.find_index_by_id(id);
        //splice() 方法向/从数组中添加/删除项目，然后返回被删除的项目。
        //该方法会改变原始数组
        this.list.splice(index, 1);
      },

      // next_id: function () {
      //   return this.list.length + 1;
      // },

      set_current: function (todo) {
        this.current = copy(todo);
      },

      reset_current: function () {
        this.set_current({});
      },

      find_index_by_id: function (id) {
        return this.list.findIndex(function (item) { //返回符合要求的项的index
          return item.id == id;
        })
      },

      toggle_complete: function (id) {
        var index = this.find_index_by_id(id);
        Vue.set(this.list[index], 'completed', !this.list[index].completed)
        // this.list[index].completed=!this.list[index].completed;
      },

      toggle_detail: function (id) {
        var index = this.find_index_by_id(id);
        Vue.set(this.list[index], 'show_detail', !this.list[index].show_detail);
      }
    },

    watch: {
      //每次list发生变化的时候自动执行handler
      list: {
        deep: true,
        handler: function (new_val, old_val) {
          if (new_val) {
            ms.set('list', new_val);
          } else {
            ms.set('list', []);
          }
        }
      }
    }
  });

})();