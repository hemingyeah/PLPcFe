<template>
  <nav class="frame-nav"
       :class="{'frame-nav-expand': !collapse}"
       :style="{'backgroundColor':isColorScheme ? isColorScheme.colorMain : ''}"
       @transitionend="navTransitionEnd">
    <div class="frame-logo">
      <a href="javascript:;"
         @click="openHome"><img :src="logoImg"></a>
    </div>

    <div id="product-product-nav"></div>
    <div id="task-setting-nav"></div>
    <div class="frame-menu-scroll">
      <ul class="frame-menu">
        <template v-for="(menu, index) in menus">
          <!-- <div :key="index" class="pos-r">
           
          </div> -->

          <li :class="{
                'frame-menu-item': true, 
                'frame-menu-active': menu == currMenu,
                'frame-menu-expand': menu == currMenu
              }"
              :key="`${menu.url}_${index}`"
              :id="menu.menuKey">
            <a :href="menu.url ? menu.url : 'javascript:;'"
               @click.prevent="open(menu)"
               :id="`${menu.menuKey}-a`"
               :class="{'': menu.active}">
              <span class="frame-menu-icon"><i :class="['iconfont', menu.menuIcon]"></i></span>
              <template v-if="!collapse">
                <span class="frame-menu-name">{{menu.name}}</span>
                <i class="iconfont icon-caidanjiantou-zhankai"
                   v-if="menu.children && menu.children.length > 0"></i>
                <i class="red-dot"
                   id="worktime_dot"
                   v-if="menu.menuKey==='M_SYSTEM' && worktimeNoEnter && isShowCardWorkTime"></i>
              </template>
            </a>

            <ul :class="{'frame-subMenu': true,'frame-float-menu': collapse}"
                :style="{'backgroundColor':isColorScheme && !collapse? isColorScheme.colorExpand : ''}"
                v-show="!collapse && menu == currMenu">
              <li class="frame-float-menu-title">
                <h3>{{menu.name}}</h3>
              </li>
              <div class="frame-subMenu-item-wrap"
                   :style="getMenuItemWrapStyle(menu)">
                <template v-for="menu in menu.children">
                  <li :class="{'frame-subMenu-item': true, 'frame-subMenu-active': menu.active}"
                      :style="{'background':isColorScheme && menu.active ? `${isColorScheme.colorSelected} !important`: '',
                               color:isColorScheme && menu.active ? `${isColorScheme.colorMain} !important`: ''}"
                      :key="menu.menuKey">
                    <a :href="menu.url ? menu.url : 'javascript:;'"
                       @click.prevent="open(menu)">{{menu.name}}</a>
                  </li>
                </template>
              </div>
            </ul>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script>
import _ from 'lodash';
import MenuIcon from '../model/MenuIcon';

import Logo from '@src/assets/img/logo.png';
import MiniLogo from '@src/assets/svg/logo.svg';
import { storageGet, storageSet } from '@src/util/storage';
import { isShowCardWorkTime } from '@src/util/version.ts';
import GuideContent from '@src/component/guide/contentCom/ProductFrameNav.vue';
// 新存储工具方法
import * as StorageUtil from '@src/util/storage.ts';
/* enum */
import StorageModuleEnum from '@model/enum/StorageModuleEnum';

const {
  PRODUCT_FRAME_NAV
} = require('@src/component/guide/productV2Store');

const {
  TASK_SETTING_FRAME_NAV
} = require('@src/component/guide/taskSettingStore');
export default {
  name: 'frame-nav',
  props: {
    collapse: {
      type: Boolean,
      default: false
    },
    callcenter: {
      type: Boolean,
      default: false
    },
    source: {
      type: Array,
      default: () => []
    }
  },
  inject: ['initData'],
  data () {
    let originMenus = _.cloneDeep(this.source);
    let { menus } = this.buildMenus(originMenus, null);

    return {
      originMenus,
      menus,
      menuIcon: MenuIcon,
      currMenu: null,
      bodyHeight: 0,
      worktimeNoEnter: true
    };
  },
  computed: {
    isShowCardWorkTime () {
      return isShowCardWorkTime()
    },
    logoImg () {
      let logoImage;
      if(this.initData.logo && this.collapse){
        logoImage = this.initData.logo.smallLogo
      }else if(this.initData.logo && !this.collapse){
        logoImage = this.initData.logo.bigLogo
      }
      else if(!this.initData.logo && !this.collapse){
        logoImage = Logo
      }
      else if(!this.initData.logo && this.collapse){
        logoImage = MiniLogo
      }
      return logoImage;
    },
    isCustomLogo(){
      return this.initData.logo
    },
    // isShowCardWorkTime () {
    //   return isShowCardWorkTime()
    // },
    isColorScheme(){
      return this.initData.colorScheme
    }
  },
  methods: {
    navTransitionEnd (event) {
      // 只监听nav宽段变化
      if (event.target != this.$el || event.propertyName != 'width') return;
      this.$emit('collapse-changed')
    },
    /** 将后端返回的菜单，重整为多根树形结构 */
    buildMenus (source, parent) {
      let menus = [];
      let otherMenus = [];

      for (let i = 0; i < source.length; i++) {
        let menu = source[i]
        if (menu.parent == parent) {
          menus.push(menu);
        } else {
          otherMenus.push(menu)
        }
      }

      if (menus.length > 0) {
        for (let j = 0; j < menus.length; j++) {
          let subMenu = menus[j];
          let subRes = this.buildMenus(otherMenus, subMenu.menuKey);

          subMenu.children = subRes.menus;
          otherMenus = subRes.otherMenus;
        }
      }

      return { menus, otherMenus };
    },
    open (menu) {
      // 如果有子菜单，展开子菜单
      if (menu.children && menu.children.length > 0) {
        this.currMenu = this.currMenu?.menuKey == menu.menuKey ? null : menu;
        this.$emit('update:collapse', false);
        return
      }

      if (!menu.url) return;

      let parentMenu = null;

      this.originMenus.forEach(item => {
        item.active && (item.active = false)
        if (item.menuKey == menu.parent) parentMenu = item;
      });

      this.currMenu = parentMenu;
      this.$set(menu, 'active', true);

      this.$emit('open', menu)
    },
    openHome () {
      this.$emit('open', { menuKey: 'HOME', url: '/home', title: '首页' })
    },
    /**
     * 为menus的每个条目设置y轴占用高度数据 供计算
     */
    setMenuOffsetData () {
      const baseTitleHeight = 51; // 菜单栏标题的高度
      const baseItemHeight = 40; // 菜单栏每个条目的高度

      // 获取menus的位置，记录menuItem 的offsetTop
      this.menus = this.menus.map(menu => {
        let key = (menu || {}).menuKey;
        if (!key) return menu;

        let dom = document.querySelector(`#${key}`);
        if (!dom) return menu;
        // 获取距离顶部的高度
        let offsetTop = dom.offsetTop || 0;
        // menu._offsetTop = offsetTop || 0;
        // 记录每个条目 距离顶部高度+自身占用高度， 用于比较body.offsetHeight
        let childrenLength = (menu.children && menu.children.length) || 0;
        menu.__bottomToTop = offsetTop + baseTitleHeight;
        menu.__totalHeight = offsetTop + baseTitleHeight + (baseItemHeight * childrenLength);

        return menu;
      })
    },
    /**
     * 注册窗口大小变更监听器
     */
    registerResizeListener () {
      try {
        let _scope = this;
        let dom = document.body;
        this.bodyHeight = dom.offsetHeight;

        window.addEventListener('resize', _.debounce(function () {
          _scope.bodyHeight = dom.offsetHeight || 0;
        }, 167));
      } catch (e) {
        console.error(e);
      }
    },
    /**
     * 获取菜单条目外围容器的样式，来确保显示不会被裁减
     */
    getMenuItemWrapStyle (menu) {
      let totalHeight = menu.__totalHeight || 0;
      let bottomToTop = menu.__bottomToTop || 0;
      // 如果该菜单的子条目显示不会被当前屏幕裁剪
      if (totalHeight <= this.bodyHeight) return '';

      let remindHeight = this.bodyHeight - bottomToTop;
      const minHeight = 40; // 菜单条目的高度
      // 看不到一个半完整的条目停止计算
      if (remindHeight < (minHeight / 2)) return '';

      return `max-height: ${remindHeight}px; overflow-y: auto;`;
    },
    init () {
      this.setMenuOffsetData();
      this.registerResizeListener();
      let hasEntered = storageGet('worktime_guid');
      if (hasEntered) {
        this.worktimeNoEnter = false;
      }
    }
  },
  mounted () {
    this.init()
    this.$nextTick(async() => {
      if (storageGet(PRODUCT_FRAME_NAV) && storageGet(PRODUCT_FRAME_NAV) > 0) this.$Guide().destroy('product-product-nav')
      else this.$Guide([{
        content:
          '',
        haveStep: false,
        gStyle: 'top:35px',
        id: 'product-product-nav',
        domId: 'M_PRODUCT_MANAGE-a',
        arrowStyle: 'left:-300px',
        finishBtn: 'OK',
        diyContent: true,
        diyContentDom: GuideContent
      }], 0, '', (e) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }).create().then(res_=>{if(res_)storageSet(PRODUCT_FRAME_NAV, '1')})

      // 工单设置新功能引导，只针对灰度内且【系统管理员】开发
      let { restructSetting, confirmSetting } = this.$parent.initData || {};
      if ((restructSetting || confirmSetting) && window.isSystemAdmin) {
        const guideStore = await StorageUtil.storageGet(TASK_SETTING_FRAME_NAV, 0, StorageModuleEnum.Task);
        if (guideStore > 0) return this.$Guide().destroy('task-setting-nav');

        this.$Guide([{
          domId: 'M_SYSTEM-a',
          id: 'task-setting-nav',
          content: '工单设置有新功能更新',
          finishBtn: '去查看'
        }], 0, '', (e) => {
          return new Promise((resolve, reject) => {
            if(e.type == 'finish') {
              this.$platform.openTab({
                id: 'M_SYSTEM',
                title: '系统管理',
                url: '/setting'
              })
            }
            resolve();
          })
        }).create()
          .then(res => {
            if(res) StorageUtil.storageSet(TASK_SETTING_FRAME_NAV, '1', StorageModuleEnum.Task);
          })
      }
    })
  }
}
</script>

<style lang="scss">
$frame-nav-width: 190px;

.frame-nav {
  width: 50px;
  height: 100%;
  background-color: $color-nav-primary;
  box-shadow: 1px 0 8px rgba(0, 0, 0, 0.125);
  transition: width ease 0.2s;
  position: relative;
  z-index: 9;

  a {
    text-decoration: none !important;
  }
}

.frame-nav.frame-nav-expand {
  width: $frame-nav-width;
  overflow: hidden;

  .frame-menu-scroll {
    overflow: auto;
    height: calc(100% - 44px);
    margin-right: -40px;
  }

  .frame-menu {
    width: $frame-nav-width;
  }

  .frame-menu-item {
    width: $frame-nav-width;
    overflow: hidden;
  }

  .frame-subMenu-item {
    color: #fff;

    & > a {
      padding: 13px 15px 13px 46px;
    }

    &:hover {
      background-color: $color-nav-hover;
    }
  }

  .frame-float-menu-title {
    display: none;
  }
}

.frame-logo {
  height: 50px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  a {
    height: 49px;
    width: 100%;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  img {
    display: block;
    margin: 0;
    height: 34px;
  }
}

.frame-menu {
  margin: 0;
  padding: 0;
  list-style: none;
}

.frame-menu-item {
  position: relative;
  margin: 0;
  padding: 0;
  min-height: 50px;
  transition: background-color ease 0.3s;

  &:hover {
    .frame-float-menu {
      display: block !important;
    }
  }

  & > a {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    color: #fff;
    font-size: 14px;

    &:hover {
      background-color: $color-nav-hover;
    }

    i.iconfont {
      font-size: 16px;
    }

    i.icon-caidanjiantou-zhankai {
      margin-right: 16px;
    }

    i.red-dot {
      margin-right: 20px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: red;
    }
  }
}

.frame-menu-active > a:before {
  content: "";
  position: absolute;
  width: 3px;
  height: 30px;
  top: 10px;
  left: 0;
  background-color: #fff;
}

.frame-menu-expand .icon-caidanjiantou-zhankai {
  transform: rotateZ(180deg);
}

.frame-menu-icon {
  width: 50px;
  height: 50px;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
}

.frame-menu-name {
  flex: 1;
}

.frame-subMenu {
  background-color: $color-nav-secondary;
  margin: 0;
  padding: 0;
}

.frame-subMenu-item-wrap {
  position: relative;
}

.frame-subMenu-item {
  display: block;
  position: relative;
  width: 100%;
  transition: background-color ease 0.3s, color ease 0.3s;

  &:hover {
    background-color: $color-td-hover;
  }

  &.frame-subMenu-active {
    // background: mix(#fff, $color-primary, 89.88%);
    background-color: $color-primary !important;
    color: #fff !important;
  }

  & > a {
    width: 100%;
    display: block;
    padding: 10px 25px;
    line-height: 20px;
    color: inherit;
  }
}

.frame-float-menu {
  display: none;
  position: absolute;
  left: 50px;
  top: 0;
  overflow: hidden;
  width: 176px;
  background-color: #fff;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.1);
}

.frame-float-menu-title h3 {
  margin: 0;
  font-size: 16px;
  padding: 13px 25px;
  line-height: 24px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  cursor: default;

  a {
    color: $text-color-primary;
    width: 100%;
    display: block;
  }
}
</style>
