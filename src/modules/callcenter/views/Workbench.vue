<template>
  <div class="call-center-workbench">
    <div class="left">
      <div class="current-header">当前通话</div>
      <el-card v-if="query.callPhone" class="current-card">
        <div class="current-item">
          <div class="item">
            <p>{{query.linkmanName ? `${query.linkmanName} ${query.callPhone}` : '未知联系人'}} </p>
            <span>{{query.ringTime |fmt_short_time}}</span>
          </div>
          <div class="item">
            <p style="margin-bottom:0">{{query.customerName}}</p>
            <i class="iconfont" :class="query.callType === 'dialout' ? 'icon-qudian' : 'icon-laidian'"></i>
          </div>
        </div>
      </el-card>
      <el-card class="history-card">
        <div slot="header">今日历史通话（{{historyList.length}}）</div>
        <div v-for="(item,index) in historyList" :key="item.id" class="history-item" 
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
              <p style="margin-bottom:0">{{item.customerName}}</p>
              <i class="iconfont" :class="query.callType === 'dialout' ? 'icon-laidian' : 'icon-qudian'"></i>
            </div>
          </div>

        </div>
      </el-card>
    </div>
    <div class="main">
      <base-tabbar :tabs="tabs" v-model="currTab"></base-tabbar>
      <keep-alive>
        <component :is="currTab" :item="item"></component>
      </keep-alive>
    </div>
    <div class="right">
      <h4 style="padding-left: 10px;font-size: 16px;margin-bottom: 12px;">服务备注</h4>
      <template v-if="remarkList.length">
        <div v-for="(item, index) in remarkList" :key="item.id" class="item" @click="delRemark(item, index)">
          <div class="item-title">
            <h4>服务备注（{{index + 1}}）</h4>
            <i v-if="!item.isDelete" class="iconfont icon-qingkongshanchu"></i>
          </div>
          <div class="item-header">
            <img src="../../../assets/img/avatar.png">
            <p>{{item.createUser}}</p>
            <span>{{item.createTime}}</span>
          </div>

          <div v-if="item.isDelete" class="item-isDelete">
            <span>删除了服务备注</span>
          </div>
          <div v-else class="item-content">
            <el-tag v-if="item.sortName">{{item.sortName}}</el-tag>
            <el-tag :type="item.status ==1 ? 'info' : 'danger'">{{item.status ? '已解决' : '未解决'}}</el-tag>
            <p>{{item.remark}}</p>
          </div>

        </div>
        <el-button v-if="!showAddRemarkForm" type="primary" @click="showAddRemarkForm=true">添加新备注</el-button>
      </template>

      <el-form v-if="remarkList.length == 0 || showAddRemarkForm" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" label-position="left">
        <el-form-item label="咨询分类">
          <el-cascader expand-trigger="hover" :options="categoryList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select>
          </el-cascader>
        </el-form-item>
        <el-form-item label="解决状态" prop="status">
          <el-select v-model="ruleForm.status" placeholder="请选择解决状态">
            <el-option label="未解决" value="0"></el-option>
            <el-option label="已解决" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark" style="margin-right: 20px;">
          <el-input type="textarea" v-model="ruleForm.remark" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入"></el-input>
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

export default {
  name: 'workbench',
  data() {
    return {
      query: {},
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
  mounted() {
    this.query = parse(window.location.search) || {};
    if(this.query.id && this.query.callPhone) {
      // 获取联系人信息 
      this.item = {id:this.query.id, dialPhone:this.query.callPhone, dialCount:this.query.dialCount} 
    }
    // console.log('query::', this.query);
    this.$eventBus.$on('callcenter-workbench.select_tab', this.selectTab)
    this.getHistoryList()
    this.getRemarkList()
    this.getCategoryList()
  },
  beforeDestroy() {
    this.$eventBus.$off('callcenter-workbench.select_tab', this.selectTab)
  },
  methods: {
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
        console.info('this.categoryList:', this.categoryList);
      }).catch((err) => {
        console.error(err)
      })
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      console.info('this.selectedKeys:', this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中父级分类
      if (this.selectedKeys.length > 0) {
        this.ruleForm.sortId = this.selectedKeys[this.selectedKeys.length - 1]
      } else {
        this.ruleForm.sortId = 0
      }
    },
    // 今日通话记录
    getHistoryList(){
      CallCenterApi.getTodayCallRecordList().then(({code, message, result}) => {
        if (code !== 0) return this.$message.error(message || '内部错误')
        this.historyList = result || []
        if(!this.query.linkmanName) {
          this.item = this.historyList[0]
          this.activeLinkId = this.item.id
          console.info('item:', this.item)
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    handleHistoryItem(item, index) {
      this.activeLinkId = item.id
      this.item = item
    },
    async delHistoryItem(index, item) {
      try {
        const {code, message} = await CallCenterApi.deleteTodayCallRecord({id:item.id})
        if (code !== 0) return this.$platform.notification({
          title: '删除失败',
          message: message || '',
          type: 'error',
        })
        this.historyList.splice(index, 1)
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
.item-hover {
  background-color: #f5f5f5;
}
.item-active {
  // 链接菜单激活样式
  background-color: #f5f5f5;
  border-left: 3px solid #55B7B4;
}

.call-center-workbench {
  display: flex;
  padding: 10px;
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 100vw;
  .left {
    width: 25%;
    min-width: 270px;
    .current-header {
      padding: 18px 20px;
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
      .el-card__body {
        padding: 0;
        .history-item {
          padding: 10px 15px;
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
              i,
              span {
                color: #999;
              }
            }
          }
        }
      }
    }

    .el-card__header {
      font-size: 16px;
      font-weight: 500;
      color: #051A13;
    }

  }

  .main {
    flex: 1;
    margin: 0 10px;
    background: #fff;
  }
  .right {
    background: #fff;
    width: 25%;
    min-width: 330px;
    padding: 10px;
    .item {
      margin-bottom: 10px;
      border-bottom: 1px solid #f5f5f5;
      .item-title {
        display: flex;
        justify-content: space-between;
      }
      .item-header {
        display: flex;
        align-items: center;
        img {
          width: 36px;
          height: 36px;
        }
        p {
          flex: 1;
          margin-bottom: 0;
          margin-left: 10px;
        }
      }
      .item-isDelete {
        color: #fb602c;
        height: 42px;
        font-size: 14px;
        line-height: 42px;
      }
      .item-content {
        padding: 5px;
        p {
          background-color: #fafbfc;
          padding: 10px;
          margin: 10px 0;
          color: #737f7b;
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
    .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
      position: absolute;
      left: -5px;
    }

  }
}
</style>