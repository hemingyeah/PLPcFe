<template>
  <div class="call-center-workbench" v-loading.fullscreen.lock="loadingListData">
    <div class="left">
      <div class="current-header">当前通话</div>
      <el-card v-if="query.callPhone && query.callState === 'Link'" class="current-card">
        <div class="current-item">
          <div class="item">
            <p>{{query.linkmanName ? `${query.linkmanName} ${query.callPhone}` : '未知联系人'}} </p>
            <span>{{ringTime}}</span>
          </div>
          <div class="item">
            <p style="margin-bottom:0">{{query.customerName}}</p>
            <i class="iconfont" style="color:#55B7B4" :class="query.callType === 'dialout' ? 'icon-qudian' : 'icon-laidian'"></i>
          </div>
        </div>
      </el-card>
      <el-card class="history-card">
        <div slot="header">今日历史通话（{{recordListPage.list.length}}）</div>
        <div v-if="recordListPage.list.length != 0">
          <div v-for="(item,index) in recordListPage.list" :key="item.id" class="history-item" 
               :class="{'item-active': item.id == activeLinkId,'item-hover':index==hoverIndex}"
               @click="handleHistoryItem(item,index)"
               @mouseover="hoverIndex = index"
               @mouseout="hoverIndex = -1">
            <i v-if="hoverIndex===index && item.id != activeLinkId" class="iconfont icon-fe-close" @click.stop="delHistoryItem(index,item)"></i>
            <div class="current-item">
              <div class="item">
                <p>{{item.linkmanName}} {{item.dialPhone}}</p>
                <span>{{item.ring |fmt_short_time}}</span>
              </div>
              <div class="item">
                <p style="margin-bottom:0;color:#999;">{{item.customerName}}</p>
                <i class="iconfont" :class="item.callType === 'dialout' ? 'icon-qudian' : 'icon-laidian'"></i>
              </div>
            </div>

          </div>
          <div class="call-center-list-footer">
            <button class="call-center-list-footer-more" @click="getMore" v-if="moreShow && !loading">加载更多</button>
            <div v-if="loading">正在加载...</div>
            <div v-if="!moreShow && !loading">
              <span class="call-center-list-footer-line"></span>
              <span class="call-center-list-footer-text">没有更多数据</span>
              <span class="call-center-list-footer-line"></span>
            </div>
          </div>
        </div>
        <div class="call-center-list-footer" v-else-if="recordListPage.list.length == 0 && !loading">暂无数据</div>
        <div class="call-center-list-footer" v-else>正在加载...</div>
      </el-card>
    </div>
    <div class="main">
      <base-tabbar :tabs="tabs" v-model="currTab"></base-tabbar>
      <keep-alive>
        <component :is="currTab" :item="item"></component>
      </keep-alive>
    </div>
    <div class="right">
      <h4 style="font-size: 16px;margin-bottom: 20px;padding-top: 8px;">服务备注</h4>
      <template v-if="remarkList.length">
        <div v-for="(item, index) in remarkList" :key="item.id" class="item">
          <div class="item-title">
            <h4>服务备注</h4>
            <i v-if="!item.isDelete" class="iconfont icon-qingkongshanchu" @click="delRemark(item, index)"></i>
          </div>
          <div class="item-header">
            <p>{{item.createUser}}</p>
            <span>{{item.createTime}}</span>
          </div>

          <div v-if="item.isDelete" class="item-isDelete">
            <span>删除了服务备注</span>
            <span class="delete-time">删除时间:{{item.deleteTime}}</span>

          </div>
          <div v-else class="item-content">
            <el-tag v-if="item.sortName" class="sort">{{item.sortName}}</el-tag>
            <el-tag v-if="item.status == 0 || item.status == 1" :type="item.status ? 'info' : 'danger'">{{item.status == 1 ? '已解决' : (item.status == 0 ? '未解决' : '')}}</el-tag>
            <p v-if="item.remark">备注:{{item.remark}}</p>
          </div>

        </div>
        <el-button v-if="!showAddRemarkForm" type="primary" @click="showAddRemarkForm=true">添加新备注</el-button>
      </template>

      <el-form v-if="remarkList.length == 0 || showAddRemarkForm" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" label-position="left">
        <el-form-item label="咨询分类">
          <el-cascader style="width: 100%;" expand-trigger="hover" :options="categoryList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select>
          </el-cascader>
        </el-form-item>
        <el-form-item label="解决状态" prop="status">
          <el-select v-model="ruleForm.status" placeholder="请选择解决状态" style="width: 100%;">
            <el-option label="未解决" value="0"></el-option>
            <el-option label="已解决" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark" style="width: 100%;">
          <el-input type="textarea" maxlength="500" v-model="ruleForm.remark" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveRemark('ruleForm')">保存</el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>

<script>
import * as CallCenterApi from '@src/api/CallCenterApi'
import ContactInfo from './ContactInfo.vue'
import ServiceRecord from './ServiceRecord.vue'
import { parse } from '@src/util/querystring';
import Page from '@model/Page';
let callInterval;
export default {
  name: 'workbench',
  data() {
    return {
      loading: false,
      params: {
        pageSize: 10,
        pageNum: 1,
      },
      recordListPage: new Page(),
      loadingListData: false,
      query: {},
      ringTime:'00:00',
      unkonwn: false,
      hoverIndex: -1, // 菜单hover索引
      activeLinkId: 0, // 当前激活的菜单id
      historyList: [],
      tabs: [
        {
          displayName: '联系人信息',
          component: ContactInfo.name,
          show: true
        },
        {
          displayName: '服务记录',
          component: ServiceRecord.name,
          show: true
        }
      ],
      currTab: 'contact-info',
      item: {},
      remarkList: [],
      showAddRemarkForm:false,
      categoryList: [],
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children'
      },
      selectedKeys: [],
      ruleForm: {
        sortId: '',
        status: '',
        remark: ''
      },
      rules: {
        status: [{ required: true, message: '请选择解决状态', trigger: 'blur' }]
      }
    }
  },
  computed: {
    moreShow () {
      return this.recordListPage.hasNextPage;
    },
  },
  mounted() {
    this.query = parse(window.location.search) || {};
    if(this.query.id && this.query.callPhone) {
      if(this.query.callState === 'Link'){
        let callSec = 0;
        callInterval = setInterval(()=>{
          callSec ++;
          this.getCallTime(callSec)
        }, 1000);
      } else {
        callInterval && clearInterval(callInterval)
        callInterval = null
      }
      // 说明是websocket过来的 获取联系人信息 
      this.item = {id:this.query.id, dialPhone:this.query.callPhone || '', dialCount:this.query.dialCount || 0} 
    }
    // console.info('query::', this.query);
    this.$eventBus.$on('callcenter-workbench.select_tab', this.selectTab)
    this.getHistoryList()
    this.getRemarkList()
    this.getCategoryList()
  },
  beforeDestroy() {
    callInterval && clearInterval(callInterval)
    callInterval = null
    this.$eventBus.$off('callcenter-workbench.select_tab', this.selectTab)
  },
  methods: {
    async getMore () {
      console.log("1111111111");
      try {
        this.params.pageNum++;
        this.loading = true;
        let recordListPage = await CallCenterApi.getTodayCallRecordList(this.params);
        if(recordListPage.code == 0) {
          this.recordListPage.merge(Page.as(recordListPage.result));
        }
        this.loading = false;
      } catch(error) {
        console.error(error);
      }
    },
    getCallTime(sec){
      const HOUR_SEC = 60 * 60;
      const MIN_SEC = 60;
      let hour = sec / HOUR_SEC >> 0;
      sec = sec % HOUR_SEC;
      let min = sec / MIN_SEC >> 0;
      sec = sec % MIN_SEC;
      hour = hour > 0 && hour < 10 ? `0${ hour }` : hour;
      min = min < 10 ? `0${ min }` : min;       
      sec = sec < 10 ? `0${ sec }` : sec;
      console.info('temp:', hour == 0 ? `${ min }:${ sec }` : `${ hour }:${ min }:${ sec }`);
      this.ringTime = hour == 0 ? `${ min }:${ sec }` : `${ hour }:${ min }:${ sec }`;
    },
    // 获取服务备注列表
    getRemarkList(){
      const params = {
        recordId: this.item.id
      }
      if(!this.item.id) return
      CallCenterApi.getFwRemarkList(params).then(({code, message, result}) => {
        if (code != 0) return this.$message.error(message || '内部错误')
        this.remarkList = result || []
      }).catch((err) => {
        console.error(err)
      })
    },
    // 获取咨询分类列表
    getCategoryList(){
      CallCenterApi.getZxSortList().then(({code, message, result}) => {
        if (code !== 0) return this.$message.error(message || '内部错误')
        this.categoryList = result || []
        // console.info('this.categoryList:', this.categoryList);
      }).catch((err) => {
        console.error(err)
      })
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // console.info('this.selectedKeys:', this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中父级分类
      if (this.selectedKeys.length > 0) {
        this.ruleForm.sortId = this.selectedKeys[this.selectedKeys.length - 1]
      } else {
        this.ruleForm.sortId = 0
      }
    },
    // 今日通话记录
    async getHistoryList(){
      // this.loadingListData = true
      try {
        this.recordListPage.list = [];
        this.params.pageNum = 1;
        this.loading = true;
        let recordListPage = await CallCenterApi.getTodayCallRecordList(this.params);
        if(recordListPage.code == 0) {
          this.recordListPage.merge(Page.as(recordListPage.result));
          if(!this.query.linkmanName && this.query.callState !== 'Link') {
            if(this.recordListPage.list.length) {
              this.item = this.recordListPage.list[0]
              this.getRemarkList()
              this.activeLinkId = this.item.id
              // console.info('item:', this.item)
            }
          }
        }
        this.loading = false;
      } catch(error) {
        console.error(error);
      }

      // CallCenterApi.getTodayCallRecordList().then(({code, message, result}) => {
      //   this.loadingListData = false
      //   if (code !== 0) return this.$message.error(message || '内部错误')
      //   this.historyList = result || []
      //   if(!this.query.linkmanName && this.query.callState !== 'Link') {
      //     if(this.historyList.length) {
      //       this.item = this.historyList[0]
      //       this.getRemarkList()
      //       this.activeLinkId = this.item.id
      //     // console.info('item:', this.item)
      //     }
      //   }
      // }).catch((err) => {
      //   this.loadingListData = false
      //   console.error(err)
      // })
    },
    handleHistoryItem(item, index) {
      this.activeLinkId = item.id
      this.item = item
      this.getRemarkList()
    },
    async delHistoryItem(index, item) {
      try {
        const {code, message} = await CallCenterApi.deleteTodayCallRecord({id:item.id})
        if (code !== 0) return this.$platform.notification({
          title: '删除失败',
          message: message || '',
          type: 'error',
        })
        this.recordListPage.list.splice(index, 1)
        this.$platform.notification({
          title: '删除成功',
          type: 'success',
        })
      } catch (e) {
        console.error(e)
      }
    },
    selectTab(tab) {
      this.currTab = tab
    },
    saveRemark(formName) {
      this.$refs[formName].validate(async valid => {
        if (!valid) {
          return false
        } 
        if(!this.item.id) return this.$platform.notification({
          title: '操作失败',
          message: '请先选中一条通话记录',
          type: 'error',
        })
        const params = this.ruleForm
        params.recordId = this.item.id
        // console.info('params', params)
        try {
          const {code, message} = await CallCenterApi.saveFwRemark(params)
          if (code !== 0) return this.$platform.notification({
            title: '保存失败',
            message: message || '',
            type: 'error',
          })
          this.$refs[formName].resetFields()
          this.selectedKeys = []
          this.getRemarkList()
          this.$platform.notification({
            title: '保存成功',
            type: 'success',
          })
        } catch (e) {
          console.error(e)
        }
      })
    },
    async delRemark(item, index){
      try {
        if (!await this.$platform.confirm('确定要删除该服务备注？')) return;
        const {code, message} = await CallCenterApi.deleteFwRemark({id:item.id})
        if (code !== 0) return this.$platform.notification({
          title: '删除失败',
          message: message || '',
          type: 'error',
        });
        this.getRemarkList()
        this.$platform.notification({
          title: '删除成功',
          type: 'success',
        });
      } catch (e) {
        console.error(e);
      }
    }
  },
  components: {
    [ContactInfo.name]: ContactInfo,
    [ServiceRecord.name]: ServiceRecord
  }
}
</script>

<style lang="scss">
.el-cascader-menus .el-cascader-menu__item{
  padding: 8px 15px;
  display: flex;
  line-height: 21px;
}
.el-cascader-menus .el-cascader-menu__item div{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 120px!important;
}
.item-hover {
  background-color: #fafafa;
}
.item-active {
  // 链接菜单激活样式
  background-color: #f5f5f5;
  border-left: 3px solid #55B7B4;
}

.call-center-workbench {
  h4 {
    font-size: 16px;
    font-weight: 500;
  }
  display: flex;
  padding: 10px;
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 100vw;
  .left {
    width: 20%;
    min-width: 270px;
    .el-card__header {
      padding: 13px 20px;
    }
    .current-header {
      padding: 13px 20px;
      border-bottom: 1px solid #ebeef5;
      box-sizing: border-box;
      background: #fff;
      font-size: 16px;
      font-weight: 500;
      color: #051A13;
    }
    .current-card {
      box-shadow: 0 0 0 0;
      border: none;
      .el-card__body {
        padding: 10px 15px;
        background: #f5f5f5;
        border-left: 3px solid $color-primary;
        .current-item {
          .item {
            display: flex;
            justify-content: flex-end;
            p {
              flex: 1;
              margin-bottom: 4px;
            }
            i,
            span {
              color: #999;
            }
          }
        }
      }
    }
    .history-card {
      box-shadow: 0 0 0 0;
      border-radius: 0 0 4px 4px;
      .el-card__body {
        overflow: auto;
        max-height: 800px;
        padding: 0;
        .history-item {
          padding: 12px 15px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e0e1e2;

          .icon-fe-close {
            margin-right: 10px;
          }
          .current-item {
            flex: 1;
            .item {
              display: flex;
              justify-content: space-between;
              p {
                margin-bottom: 4px;
              }
              i,
              span {
                color: #999;
              }
            }
          }
        }
      }
      .call-center-list-footer {
        text-align: center;
        margin-top: 10px;
        height: 30px;
        line-height: 30px;
        color: #8C8989;
      }
      .call-center-list-footer-more {
        margin: 0;
        padding: 0;
        outline: none;
        border: none;
        background: none;
        color: #8C8989;
        &:hover {
          color: #55B7B4;
        }
      }
      .job-notification-dividing-line {
        width: 2px;
        height: 15px;
        background: #fff;
        position: absolute;
        right: 113px;
        top: 28px;
        z-index: 100;
      }
      .call-center-list-footer-line {
        position: relative;
        bottom: 4px;
        display: inline-block;
        background: #D0D0D0;
        height: 1px;
        width: 18px;
      }
      .call-center-list-footer-text {
        padding: 0 16px;
      }
    }

    .el-card__header {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

  }

  .main {
    flex: 1;
    background: #fff;
    border-right: 1px solid #f5f5f5;
  }
  .right {
    overflow: auto;
    max-height: 820px;
    background: #fafafa;
    width: 25%;
    min-width: 330px;
    padding: 10px;
    .item {
      margin-bottom: 10px;
      border-bottom: 1px solid #f5f5f5;
      .item-title {
        display: flex;
        justify-content: space-between;
        h4{
          font-size: 14px;
          margin-bottom: 10px;
          margin-left: 8px;
        }
      }
      .item-header {
        display: flex;
        align-items: center;
        p {
          flex: 1;
          margin-bottom: 10px;
          margin-left: 8px;
        }
      }
      .item-isDelete {
        display: flex;
        justify-content: space-between;
        color: #fb602c;
        height: 42px;
        font-size: 14px;
        line-height: 42px;
        .delete-time {
          color: #666;
          font-size: 12px;
        }
      }
      .item-content {
        padding: 5px;
        p {
          padding: 10px 2px;
          color: #737f7b;
        }
        .el-tag--small {
          overflow: hidden;
        }
        .sort {
          width: 90px;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin-right: 8px;
        }
      }
    }
    .el-textarea__inner{
      padding: 5px 10px;
    }

    .el-form-item--small .el-form-item__label {
      position: relative;
      padding-left: 10px;
    }

    .el-cascader__label{
      max-width: 160px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
      position: absolute;
      left: -5px;
    }
  }
}
</style>