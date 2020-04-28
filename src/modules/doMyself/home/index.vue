<template>
  <div id="doMyself-box">
    <div class="flex-x">
      <div class="left-menu">
        <h3 class="menu-title">自助门户设置</h3>
        <nav
          :class="`menu-list ${nowMenu==index?'menu-checked':''}`"
          v-for="(item,index) in menuList"
          @click="nowMenu=index"
        >
          <div class="left-border" v-if="nowMenu==index"></div>
          <i :class="`iconfont ${item.icon}`"></i>
          {{item.name}}
        </nav>
      </div>

      <wx-set v-if="nowMenu===1"></wx-set>
      <toast-list v-if="nowMenu===3"></toast-list>
    </div>
  </div>
</template>
<script>
import toastList from "../toastList/toastList";
import wxSet from "../wxSet/wxSet";
export default {
  name: "do-myself-view",
  data() {
    return {
      menuList: [
        {
          name: "客户自助门户",
          icon: "icon-shouye"
        },
        {
          name: "公众号设置",
          icon: "icon-shouye"
        },
        {
          name: "短信消息设置",
          icon: "icon-shouye"
        },
        {
          name: "消息记录",
          icon: "icon-shouye"
        }
      ],
      nowMenu: 3 // 0 客户自助门户 1 公众号设置 2 短信消息设置 3 消息记录
    };
  },
  created() {
    // console.log(this.$route);
  },
  components: {
    [toastList.name]: toastList,
    [wxSet.name]: wxSet
  }
};
</script>
<style lang="scss">
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
  max-height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
}
#doMyself-components-box {
  margin-left: 10px;
  flex: 1;
  box-sizing: border-box;
  max-height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
}
::-webkit-scrollbar-track {
  background: #d7dadc;
}
img {
  width: 100%;
  height: 100%;
}
.flex-x {
  display: flex;
  align-items: flex-start;
  .left-menu {
    min-width: 354px;
    background: #fff;
    box-sizing: border-box;
    .menu-title {
      font-size: 18px;
      color: #454648;
      padding: 13px 0 13px 10px;
    }
    .menu-list {
      font-size: 12px;
      border-top: 1px solid #e9ecef;
      padding: 10px 15px;
      position: relative;
      cursor: pointer;
      .left-border {
        height: 100%;
        width: 3px;
        position: absolute;
        left: 0;
        background: #55b7b4;
        top: 0;
      }
      .iconfont {
        font-size: 12px;
        margin-right: 13px;
      }
    }
    .menu-checked {
      // border-left: 3px solid #55b7b4;
      font-weight: 700;
    }
  }
}
</style>