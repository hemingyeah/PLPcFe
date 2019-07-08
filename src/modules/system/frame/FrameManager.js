import _ from 'lodash';
import {parse} from '@src/util/querystring'
import Tab from './model/Tab';
import {getRootWindow} from '@src/util/dom';
import FrameHistoryManager from './FrameHistoryManager'
import { platform } from '@src/platform';

// import normalizeWheel from '@src/util/normalizeWheel'

const CACHED_FRAMES = [
  'M_TASK_ALL',
  'M_TASK_AUDIT',
  'M_TASK_REVIEW'
];

const FrameManager = {
  data(){
    return {
      frameTabs: [],
      // hiddenTabs: [],
      offset: 0,
      nextBtnEnable: false,
      prevBtnEnable: false,
      offsetTransition: false
    }
  },
  methods: {
    receiveMessage(event){
      // 不接收其他域名发送的信息
      if(event.origin !== window.location.origin) return;
      
      // 验证数据格式
      let eventData = event.data;
      if(!eventData || !eventData.action) return;

      let action = eventData.action;

      if(action == 'shb.system.openFrameTab') this.openForFrame(eventData.data);
      if(action == 'shb.system.realodFrameById') this.reloadFrameTabById(eventData.data);
      if(action == 'shb.system.closeFrameById') this.closeFrameTabById(eventData.data);
    },
    /** @deprecated 兼容旧页面，迁移完成后删除 */
    addTabs(option){
      console.warn('不推荐调用该方法，使用 platform.openForFrame 替代');
      this.openForFrame(option)
    },
    /** 用于从导航菜单打开tab */
    openForNav(menu){
      window.TDAPP.onEvent(`pc：访问${menu.name || (`未命名页面${menu.menuKey || ''}`)}`);
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
      tab.timeStamp = new Date();
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
      this.removeFrameCache(tab.id)

      // 为该frame添加事件
      this.$nextTick(() => {
        let frame = document.getElementById(`frame_tab_${tab.id}`);
        if(!frame) return 
        
        let frameWindow = frame.contentWindow;

        // frame页面卸载时，重置刷新icon
        frameWindow.addEventListener('unload', () => tab.loading = true)
      })
      
      // 进入客户列表时，清除记录的列表搜索参数
      // if (tab.currentUrl === '/customer') {
      //   sessionStorage.removeItem('customer_list_search_status');
      // }
    },
    // 关闭frameTab
    closeFrameTab(frameTab){
      // sessionStorage.removeItem('customer_list_search_status');
      
      if(!frameTab.closeable) return;

      // TODO:迁移完成后删除
      localStorage.removeItem(`frame_tab_${ frameTab.id }_idArray`);

      let index = this.frameTabs.indexOf(frameTab);
      if(index >= 0) {
        let adjustTab = this.frameTabs.find(item => item.show);
        let currTab = this.frameTabs.splice(index, 1)[0];

        // 清空历史
        FrameHistoryManager.removeStack(`frame_tab_${frameTab.id}`)

        if(currTab.show){
          let prevTab = this.frameTabs[index - 1];
          if(null != prevTab){
            prevTab.show = true;
            adjustTab = prevTab;
            this.currUrl = prevTab.url;
          }
        }

        this.adjustFrameTabs(adjustTab);
      }
    },
    closeFrameTabById(id) {
      let frameTab = {};
      let tab = this.frameTabs.filter(f => f.id == id);

      if(Array.isArray(tab) && tab.length > 0) {
        frameTab = tab[0];
      }
      this.closeFrameTab(frameTab);
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
      try {
        let frameWindow = frame.contentWindow;

        tab.title = frameWindow.document.title || tab.originTitle;
        tab.currentUrl = frameWindow.location.pathname;
        tab.loading = false;
        tab.reload = false;
      
        this.adjustFrameTabs(tab);
        this.$nextTick(() => {
          let rootWindow = getRootWindow(window);

          // 传递点击事件，用于关闭顶层window popper
          frameWindow.addEventListener('click', (e) => {
            const clickEvent = new CustomEvent('click', {
              detail: {
                isTrusted: e.isTrusted,
                isMock: true
              },
              bubbles: true
            })
            rootWindow.document.body.dispatchEvent(clickEvent)
          })
        })
        
        // 记录frame历史
        FrameHistoryManager.push(frameWindow.frameElement.id, frameWindow.location.href)
      } catch (error) {
        platform.alert([
          `[frame src]: ${frame.src}`,
          `[tab url]: ${tab.url}`,
          `[tab id]: ${tab.id}`,
          `[tab fromid]: ${tab.fromId}`
        ].join('\n'));
      }
    },
    reloadFrameTab(tab, redirect = false){
      if (tab.timeStamp && (new Date() - tab.timeStamp <= 5000)) return;
      
      tab.timeStamp = new Date();
      this.removeFrameCache(tab.id)
      
      let iframe = document.getElementById(`frame_tab_${tab.id}`);
      if(null != iframe){
        tab.loading = true;
        tab.title = '正在加载...';

        if(redirect) return iframe.src = tab.url;
        // 如果页面由导出刷新方法，调用该方法
        if(typeof iframe.contentWindow.__exports__refresh == 'function'){
          return iframe.contentWindow.__exports__refresh().then(() => {
            tab.loading = false;
            tab.title = iframe.contentWindow.document.title;
          });
        }
        iframe.contentWindow.location.reload(true);
      }
    },
    reloadFrameTabById(id){
      // 啄木鸟监控显示id可能为null
      if(null == id) return;

      // 替换传入的 id 中的 frame_tab_
      id = id.replace(/^frame_tab_/, '');
      
      let index = _.findIndex(this.frameTabs, item => item.id == id);
      if(index >= 0){
        this.reloadFrameTab(this.frameTabs[index])
      }
    },
    tabScroll(event){ 
      event.preventDefault();

      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffsetWidth = scrollEl.offsetWidth; // 外层容器的宽度
      let listOffsetWidth = listEl.offsetWidth; // tab list的宽度
      let maxOffset = listOffsetWidth - scrollOffsetWidth;
      // 无法滚动
      if(listOffsetWidth <= scrollOffsetWidth) return;
      
      // let delta = normalizeWheel(event);

      // 1. 兼容不同浏览器的事件
      // 2. 根据方向设置offset
      let direction = event.deltaX != 0 
        ? event.deltaX > 0 ? 1 : -1 // 存在横向滚动,
        : event.deltaY > 0 ? 4 : -4;

      let offset = this.offset + (direction * 12);
      if(offset < 0) offset = 0;
      if(offset > maxOffset) offset = maxOffset;
      
      this.offset = offset;
      this.prevBtnEnable = this.offset > 0;
      this.nextBtnEnable = this.offset < maxOffset;
    },
    /** 显示上一页tab */
    prev(){
      if(!this.prevBtnEnable) return;

      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffset = scrollEl.offsetWidth;
      let offset = 0;

      // 如果能滚动，计算上一页offset
      if(listEl.offsetWidth > scrollEl.offsetWidth && this.offset - scrollOffset > 0) {
        offset = this.offset - scrollOffset
      }

      this.offsetTransition = true;
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
      let maxOffset = listWidth - scrollOffset; // 最大偏移量

      let offset = 0;
      if(listEl.offsetWidth > scrollEl.offsetWidth){
        offset = this.offset + scrollOffset < maxOffset ? this.offset + scrollOffset : maxOffset;
      }
      
      this.offsetTransition = true;
      this.offset = offset;
      this.adjustFrameTabs();
    },
    /** 重新计算frameTabs样式 */
    adjustFrameTabs: _.debounce(function(tab){    
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      if(!scrollEl) return 
      
      let scrollOffsetWidth = scrollEl.offsetWidth; // 外层容器的宽度
      let listOffsetWidth = listEl.offsetWidth; // tab list的宽度
      
      // 如果无法滚动，offset置为0
      if(listOffsetWidth <= scrollOffsetWidth){
        this.offset = 0;
        this.adjustScrollStyle();
        return;
      }

      this.$nextTick(() => {
        // 超出最大滚动范围
        if(this.offset + scrollOffsetWidth > listOffsetWidth){
          this.offset = listOffsetWidth - scrollOffsetWidth;
        }
        
        // 显示激活的tab
        if(null != tab && tab.show) this.showActiveTab(tab)
        // 如果显示操作按钮，判断翻页按钮的样式
        this.adjustScrollStyle();
      });
    }, 160),
    /** 显示已激活的tab */
    showActiveTab(frameTab){
      let tabEl = this.$el.querySelector(`#tab_${frameTab.id}`);
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffsetWidth = scrollEl.offsetWidth;
      let listOffsetWidth = listEl.offsetWidth;
      let maxOffset = listEl.offsetWidth - scrollOffsetWidth; // 最大偏移量

      // 左侧不可见
      if(tabEl.offsetLeft < this.offset + 5){
        let offset = tabEl.offsetLeft - 5;
        if(offset < 0) offset = 0;
        this.offset = offset;
      }

      // 右侧不可见
      let rightOffset = tabEl.offsetLeft + tabEl.offsetWidth
      if(this.offset + scrollOffsetWidth < rightOffset + 5){
        let offset = rightOffset + 5 - scrollOffsetWidth;
        if(offset > maxOffset) offset = maxOffset;

        this.offset = offset;
      }

      // 如果激活的tab是最后一个tab(多个tab情况下),且是可滚动的，重置offset为最大偏移量
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
      // 只处理tab list的transform效果
      if(event.propertyName != 'transform' || !event.target.classList.contains('frame-tabs-list')) return;
      this.offsetTransition = false;
    },
    resizeHandler(){
      let currTab = this.frameTabs.find(item => item.show);
      this.adjustFrameTabs(currTab);
    },
    // 打开frame前清空缓存
    removeFrameCache(menuKey){
      if(CACHED_FRAMES.indexOf(menuKey) >= 0){
        let key = `frame_tab_${menuKey}_cache`;
        localStorage.removeItem(key);
        console.info(`debug: clear localStorage for key [${key}]`);
      }
    },
    closeTabHandler(event){
      let {target, command} = event;
      let id = target.id;
      let index = this.frameTabs.findIndex(tab => `tab_${tab.id}` == id);
      if(index < 0) return;

      let tab = this.frameTabs[index];

      if(command == 'itself') return this.closeFrameTab(tab);

      if(command == 'other'){
        this.frameTabs = this.frameTabs.filter(item => {
          if(item != tab && item.closeable){
            // 清空历史
            FrameHistoryManager.removeStack(`frame_tab_${item.id}`)
            return false;
          }
          
          return true;
        })

        let adjustTab = this.frameTabs.find(i => i == tab);
        adjustTab.show = true;
        return this.adjustFrameTabs(adjustTab);
      }

      if(command == 'all'){
        this.frameTabs = this.frameTabs.filter(item => {
          if(item.closeable){
            // 清空历史
            FrameHistoryManager.removeStack(`frame_tab_${item.id}`)
            return false;
          }
          
          return true;
        })

        let adjustTab = this.frameTabs[this.frameTabs.length - 1];
        adjustTab.show = true;
        return this.adjustFrameTabs(adjustTab);
      }
    }
  },
  mounted(){
    window.addEventListener('message', this.receiveMessage);
    window.addEventListener('resize', this.resizeHandler);

    // TODO: 迁移完成后删除
    window.addTabs = this.addTabs;
    window.closeFrameTabById = this.closeFrameTabById;
    
    window.frameHistoryBack = function(originWindow){
      if(originWindow.__shb_pc_frame_history__back_pending__) return;

      originWindow.__shb_pc_frame_history__back_pending__ = true;
      let id = originWindow.frameElement.id;
      let referrer = FrameHistoryManager.getReferrer(id);
      referrer ? originWindow.location.replace(referrer) : originWindow.location.reload(true)
    }

    let homeTab = new Tab({id:'HOME', url: '/home', title: '首页', show: true})
    this.openForFrame(homeTab);

    // 处理消息跳转url
    let query = parse(window.location.search);
    let pcUrl = this.initData.pcUrl || query.pcUrl;
    if(pcUrl) this.openForFrame({id: 'PcUrl', title: '正在加载', url: pcUrl});
  }
};

export default FrameManager;
