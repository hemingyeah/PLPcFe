<template>
  <div id="doMyself-box">
    <div class="flex-x al-start">
      <div class="left-menu">
        <div class="menu-title">{{ '自助门户设置' }}</div>
        <template v-for="(item, index) in menuList">
          <nav
            :class="`menu-list ${nowMenu == index ? 'menu-checked' : ''}`"
            :key="index"
            @click="changePage(index)"
          >
            <!-- <div class="left-border" v-if="nowMenu==index"></div> -->
            <div class="icon-box">
              <i
                :class="
                  `iconfont ${item.icon} ${
                    nowMenu == index ? 'font-16 font-w-600' : 'font-14'
                  }`
                "
              ></i>
            </div>
            <span>{{ item.name }}</span>
          </nav>
        </template>
      </div>
      <!-- <keep-alive> -->
      <component :is="menuList[nowMenu].comName" ref="setData"></component>
      <!-- </keep-alive> -->

      <!-- <wx-set v-if="nowMenu === 1"></wx-set>
      <toast-list v-if="nowMenu === 3"></toast-list> -->
    </div>
  </div>
</template>
<script>
import toastList from '../toastList/toastList'
import wxSet from '../wxSet/wxSet'
import doMyselfSet from '../setting/index'
export default {
  name: 'do-myself-view',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  provide() {
    return {
      initData: this.initData,
    }
  },
  data() {
    return {
      menuList: [
        {
          name: '客户自助门户',
          icon: 'icon-Gateway',
          comName: 'do-myself-set',
        },
        {
          name: '公众号设置',
          icon: 'icon-weixin2',
          comName: 'wx-set',
        },
        {
          name: '短信消息设置',
          icon: 'icon-duanxin3',
        },
        {
          name: '消息记录',
          icon: 'icon-message',
          comName: 'toast-list',
        },
      ],
      nowMenu: 1, // 0 客户自助门户 1 公众号设置 2 短信消息设置 3 消息记录
    }
  },
  computed: {},
  created() {
    let type = window.location.href.split('/')[
      window.location.href.split('/').length - 1
    ]
    let typeObj = {
      wxSet: 1,
      toastList: 3,
      doMyselfSet: 0,
    }
    this.nowMenu = typeObj[type]
  },
  methods: {
    changePage(index) {
      if (this.nowMenu === index) {
        return
      }
      if (index === 2) {
        window.location.href = '/setting/message/smsmessage'
      } else if (index === 0) {
        window.location.href = '/setting/doMyself/doMyselfSet'
      } else if (index === 1) {
        window.location.href = '/setting/doMyself/wxSet'
      } else if (index === 3) {
        window.location.href = '/setting/doMyself/toastList'
      }
      this.nowMenu === index
    },
  },
  components: {
    [toastList.name]: toastList,
    [wxSet.name]: wxSet,
    [doMyselfSet.name]: doMyselfSet,
  },
}
</script>
<style lang="scss">
.al-start{
  align-items: flex-start;
}
.flex-1 {
  flex: 1;
}
.mar-b-12 {
  margin-bottom: 12px;
}
.mar-r-12 {
  margin-right: 12px;
}
.font-12 {
  font-size: 12px;
}
.font-14 {
  font-size: 14px;
}
.font-16 {
  font-size: 16px;
}
.al-c {
  align-items: center !important;
}
label {
  margin-bottom: 0;
}
#doMyself-box {
  padding: 10px;
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 100vw;
}
#doMyself-components-box {
  margin-left: 10px;
  flex: 1;
  min-width: 920px;
  box-sizing: border-box;
  min-height: 100vh;
}
::-webkit-scrollbar-track {
  background: transparent;
}
img {
  width: 100%;
  height: 100%;
}
.flex-x {
  display: flex;
  .left-menu {
    width: 25%;
    min-width: 200px;
    background: #fff;
    box-sizing: border-box;
    border-radius: 3px;
    overflow: hidden;
    position: sticky;
    position: -webkit-sticky;
    top: 10px;
    max-width: 400px;
    .menu-title {
      font-size: 18px;
      color: #454648;
      padding: 10px;
      font-weight: 600;
    }
    .menu-list {
      border-left: 3px solid transparent;
      border-top: 1px solid #f4f4f4;
      padding: 10px 15px;
      position: relative;
      display: flex;
      align-items: center;
      cursor: pointer;
      &:hover {
        background: rgb(246, 246, 246);
      }
      span {
        font-size: 12px;
      }
      .left-border {
        height: 100%;
        width: 3px;
        position: absolute;
        left: 0;
        background: #55b7b4;
        top: 0;
      }
      .icon-box {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        margin-right: 13px;
      }
    }
    .menu-checked {
      border-left: 3px solid #55b7b4;
      &:hover {
        background: #fff;
      }
      span {
        font-size: 13px;
        font-weight: 500;
      }
    }
  }
}
</style>
