<template>
  <div class="base-select-team">
    <div class="inner">
      <div class="inputWrapper" @click="toggle">
        <input type="text" readonly :placeholder="placeholder">
      </div>
      <transition :name="transitionName">
        <div class="base-select-team-dropdown">
          <ul class="options" v-show="showOptions">
            <li v-for="(item, index) in options" :key="index">{{item.value}}</li>
            <li v-if="options.length == 0">
              {{ notFoundText }}
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </div>
</template> 

<script>
import _ from 'lodash';
import http from '@src/util/http';
import {alert} from '@src/platform/notification';

export default {
  name: 'base-select-team',
  props: {
    /** 提示信息 */
    placeholder: {
      type: String,
      default: ''
    },
    /** 多选 */
    multiple: {
      type: Boolean,
      default: false
    },
    /** 请求地址 */
    action: {
      type: String,
      default: '/task/tag/dispatch/customerTagList'
    },
    /** 请求参数 */
    params: {
      type: Object,
      default: () => ({})
    },
    /** 找不到的提示文字 */
    notFoundText: {
      type: String,
      default: '无匹配数据'
    },
  },
  data() {
    return {
      options: [
        {
          value: '1'
        },
        {
          value: '2'
        },
        {
          value: '3'
        }
      ], // 列表数据
      showOptions: false, // 是否显示下拉列表
    }
  },
  computed: {
    _params() {
      let obj = {};
      if(Object.keys(this.params).length == 0) {
        obj = {
          pageNum: 1,
          pageSize: 0
        }
        return obj
      }
      return this.params
    },
    transitionName() {
      return this.showOptions ? 'slide-up' : 'slide-down';
    }
  },
  mounted() {
    // this.fetchUser(this._params);
  },
  methods: {
    /** 抓取用户数据 */
    fetchUser(params = {}){
      return http.get(this.action, params).then(page => {
        console.log('page', page)
        //合并数据
        let rows = page.list || [];

        for(let i = 0;i < rows.length; i++){
          let user = rows[i];

          let index = -1;
          for(let j = 0;j < this.chosen.length;j++){
            if(user.userId == this.chosen[j].userId){
              index = j;
              break;
            }
          }

          if(index >= 0){//存在相同数据 则替换原数据
            user.selected = true;
            this.$set(this.chosen, index, user);
          }else{
            user.selected = false;
          }
        }
        return page;
      });
    },
    /** 切换 */
    toggle() {
      this.showOptions = !this.showOptions;
    }
  }
}
</script>

<style lang="scss">
  /** 过渡 */
  .slide-up-appear,.slide-up-enter-active,.slide-up-leave-active {
      animation-duration: .3s;
      animation-fill-mode: both;
      animation-play-state: paused
  }
  .slide-up-appear,.slide-up-enter-active {
      animation-name: jqSlideUpIn;
      animation-play-state: running
  }
  .slide-up-leave-active {
      animation-name: jqSlideUpOut;
      animation-play-state: running
  }
  .slide-up-appear,.slide-up-enter-active {
      opacity: 0;
      animation-timing-function: ease-in-out
  }
  .slide-up-leave-active {
      animation-timing-function: ease-in-out
  }
  .slide-down-appear,.slide-down-enter-active,.slide-down-leave-active {
    animation-duration: .3s;
    animation-fill-mode: both;
    animation-play-state: paused
  }
  .slide-down-appear,.slide-down-enter-active {
      animation-name: jqSlideDownIn;
      animation-play-state: running
  }
  .slide-down-leave-active {
      animation-name: jqSlideDownOut;
      animation-play-state: running
  }
  .slide-down-appear,.slide-down-enter-active {
      opacity: 0;
      animation-timing-function: ease-in-out
  }
  .slide-down-leave-active {
      animation-timing-function: ease-in-out
  }
</style>
