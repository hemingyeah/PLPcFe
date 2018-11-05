import _ from 'lodash';
import {parse} from '@src/util/querystring'
import Tab from './model/Tab';
import {getRootWindow} from '@src/util/dom';

function isTabHidden(scrollRect, tabRect){
  let isLeftHidden = tabRect.right < scrollRect.left || (tabRect.left < scrollRect.left && tabRect.right > scrollRect.left);
  let isRightHidden = tabRect.left > scrollRect.right || (tabRect.left < scrollRect.right && tabRect.right > scrollRect.right)

  return isLeftHidden || isRightHidden;
}

const FrameManager = {
  data(){
    return {
      frameTabs: [],
      hiddenTabs: [],
      offset: 0,
      nextBtnEnable: false,
      prevBtnEnable: false,
      showOperateBtn: false
    }
  },
  methods: {
    receiveMessage(event){
      //不接收其他域名发送的信息
      if(event.origin !== window.location.origin) return;
      
      //验证数据格式
      let eventData = event.data;
      if(!eventData || !eventData.action) return;

      let action = eventData.action;

      if(action == 'shb.system.openFrameTab') this.openForFrame(eventData.data);
      if(action == 'shb.system.realodFrameById') this.reloadFrameTabById(eventData.id);
    },
    /** 用于从导航菜单打开tab */
    openForNav(menu){
      let tab = new Tab({id: menu.menuKey, url: menu.url, title: menu.name});
      this.openFrameTab(tab)
    },
    /** 
     * 用于从其他iframe中打开新的tab
     * option: {id,title,close,url,fromId} 
     */
    openForFrame(option){
      let tab = new Tab(option)
      this.openFrameTab(tab)
    },
    /** 打卡一个frame tab */
    openFrameTab(tab){
      let index = _.findIndex(this.frameTabs, item => item.id == tab.id);
      if(index >= 0){
        let target = this.frameTabs[index];
        target.merge(tab);
        return this.jumpFrameTab(target);
      }

      this.frameTabs.forEach(item => item.show = false);
      this.frameTabs.push(tab)
      this.currUrl = tab.url;

      this.adjustFrameTabs(tab);

      //为该frame添加事件
      this.$nextTick(() => {
        let rootWindow = getRootWindow(window);
        let frame = document.getElementById(`frame_${tab.id}`);
        let frameWindow = frame.contentWindow;

        //传递点击事件，用于关闭顶层window popper
        frameWindow.addEventListener('click', () => rootWindow.document.body.click())
        //frame页面卸载时，重置刷新icon
        frameWindow.addEventListener('unload', () => tab.loading = true)
      })
    },
    //关闭frameTab
    closeFrameTab(frameTab){
      //TODO:迁移完成后删除
      localStorage.removeItem("frame_" + frameTab.id + "_idArray");

      let index = this.frameTabs.indexOf(frameTab);
      if(index >= 0) {
        let adjustTab = this.frameTabs.find(item => item.show);
        let currTab = this.frameTabs.splice(index, 1)[0];
        if(currTab.show){
          let prevTab = this.frameTabs[index - 1];
          if(null != prevTab){
            prevTab.show = true;
            adjustTab = prevTab;
            this.currUrl = prevTab.url;
          }
        }

        this.adjustFrameTabs(adjustTab);
        this.calcHiddenTabs();
      }
    },
    jumpFrameTab(frameTab){
      this.frameTabs.forEach(item => item.show = false);
      frameTab.show = true;

      this.$emit('input', frameTab.url)
      if(frameTab.reload) this.reloadFrameTab(frameTab, frameTab.isUrlChange)

      this.adjustFrameTabs(frameTab);
    },
    updateFrameTab(event, tab){
      let frame = event.target;
      let frameWindow = frame.contentWindow;

      tab.title = frameWindow.document.title || tab.originTitle;
      tab.currentUrl = frameWindow.location.pathname;
      tab.loading = false;
      tab.reload = false;
    
      this.adjustFrameTabs(tab)
    },
    reloadFrameTab(tab, redirect = false){
      let iframe = document.getElementById(`frame_${tab.id}`);
      if(null != iframe){
        tab.loading = true;
        tab.title = '正在加载...';

        if(redirect){
          iframe.src = tab.url;
        }else{
          iframe.contentWindow.location.reload();
        }
      }
    },
    reloadFrameTabById(id){
      let index = _.findIndex(this.frameTabs, item => item.id == id);
      if(index >= 0){
        this.reloadFrameTab(this.frameTabs[index])
      }
    },
    scroll(event){ 
      return; 
      // let scrollEl = this.$refs.scroll;
      // let listEl = this.$refs.list;
      
      // if(listEl.offsetWidth <= scrollEl.offsetWidth) return;
      
      // event.deltaY > 0 ? this.next() : this.prev()
    },
     /** 显示上一页tab */
    prev(){
      if(!this.prevBtnEnable) return;

      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffset = scrollEl.offsetWidth;
      let offset = 0;

      //如果能滚动，计算上一页offset
      if(listEl.offsetWidth > scrollEl.offsetWidth && this.offset - scrollOffset > 0) {
        offset = this.offset - scrollOffset
      }

      this.offset = offset;
      this.adjustFrameTabs();
    },
    /** 显示下一页tab */
    next(){
      if(!this.nextBtnEnable) return;

      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffset = scrollEl.offsetWidth;
      let listWidth = listEl.offsetWidth;
      let maxOffset = listWidth - scrollOffset; //最大偏移量

      let offset = 0;
      if(listEl.offsetWidth > scrollEl.offsetWidth){
        offset = this.offset + scrollOffset < maxOffset ? this.offset + scrollOffset : maxOffset;
      }

      this.offset = offset;
      this.adjustFrameTabs();
    },
    /** 重新计算frameTabs样式 */
    adjustFrameTabs(tab){
      //nextTick是必须的，为了等待dom变化完成
      this.$nextTick(() => {
        let scrollEl = this.$refs.scroll;
        let listEl = this.$refs.list;
        
        let scrollOffsetWidth = scrollEl.offsetWidth; //外层容器的宽度
        let listOffsetWidth = listEl.offsetWidth; //tab list的宽度

        //判断是否显示操作按钮
        this.showOperateBtn = listOffsetWidth > scrollOffsetWidth;
        
        //如果无法滚动，offset置为0
        if(!this.showOperateBtn){
          this.offset = 0;
          this.adjustScrollStyle();
          return;
        }

        this.$nextTick(() => {
           //超出最大滚动范围
          if(this.offset + scrollOffsetWidth > listOffsetWidth){
            this.offset = listOffsetWidth - scrollOffsetWidth;
          }
          
          //显示激活的tab
          if(null != tab && tab.show) this.showActiveTab(tab)
          //如果显示操作按钮，判断翻页按钮的样式
          this.adjustScrollStyle();
        });
      })
    },
    /** 显示已激活的tab */
    showActiveTab(frameTab){
      let tabEl = this.$el.querySelector(`#tab_${frameTab.id}`);
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffsetWidth = scrollEl.offsetWidth;
      let listOffsetWidth = listEl.offsetWidth;
      let maxOffset = listEl.offsetWidth - scrollOffsetWidth; //最大偏移量

      //左侧不可见
      if(tabEl.offsetLeft < this.offset + 5){
        let offset = tabEl.offsetLeft - 5;
        if(offset < 0) offset = 0;
        this.offset = offset;
      }

      //右侧不可见
      let rightOffset = tabEl.offsetLeft + tabEl.offsetWidth
      if(this.offset + scrollOffsetWidth < rightOffset + 5){
        let offset = rightOffset + 5 - scrollOffsetWidth;
        if(offset > maxOffset) offset = maxOffset;

        this.offset = offset;
      }

      //如果激活的tab是最后一个tab(多个tab情况下),且是可滚动的，重置offset为最大偏移量
      if(listOffsetWidth > scrollOffsetWidth && this.frameTabs.length > 1 && frameTab == this.frameTabs[this.frameTabs.length - 1]){
        this.offset = maxOffset;
      }
    },
    /** 重置翻页按钮样式 */
    adjustScrollStyle(){
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      if(listEl.offsetWidth <= scrollEl.offsetWidth) {
        this.prevBtnEnable = this.nextBtnEnable = false;
        return;
      }

      this.prevBtnEnable = this.offset > 0;
      this.nextBtnEnable = this.offset < listEl.offsetWidth - scrollEl.offsetWidth;
    },
    tabTransitionEnd(event){
      //只处理tab list的tranform效果
      if(event.propertyName != 'transform' || !event.target.classList.contains('frame-tabs-list')) return;
      
      this.calcHiddenTabs();
    },
    calcHiddenTabs(){
      this.$nextTick(() => {
        let scrollRect = this.$refs.scroll.getBoundingClientRect();

        this.hiddenTabs = this.frameTabs.filter(tab => {
          let tabEl = document.getElementById(`tab_${tab.id}`)
          if(tabEl == null) return false;

          let tabRect = tabEl.getBoundingClientRect();
          return isTabHidden(scrollRect, tabRect);
        });
      })
    },
    resizeHanler(){
      let currTab = this.frameTabs.find(item => item.show);
      this.adjustFrameTabs(currTab);
    }
  },
  mounted(){
    window.addEventListener("message", this.receiveMessage);
    window.addEventListener("resize", this.resizeHanler);

    let homeTab = new Tab({id:'HOME',url: '/home', title: '首页', show: true})
    this.openForFrame(homeTab);

    //处理消息跳转url
    let query = parse(window.location.search);
    let pcUrl = this.initData.pcUrl || query.pcUrl;
    if(null != pcUrl){
      this.openForFrame({id: "PcUrl", title: "正在加载", url: pcUrl});
    }
  }
};

export default FrameManager;