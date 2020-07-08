<template>
  <div class="call-center-detail-info">
    <div class="main">
      <h4>通话信息</h4>
      <div class="call-info">
        <p>通话ID：<span>{{callDetail.recordId}}</span></p>
        <p>通话时长：<span>{{callDetail.talkTime >>0 |fmt_h_m_s}}</span></p>
        <p>接待坐席：<span>{{callDetail.agentName}}</span></p>
      </div>
      <div class="call-info">
        <p>呼叫电话：<span>{{callDetail.dialPhone}}</span></p>
        <p>通话开始时间：<span>{{callDetail.beginTime}}</span></p>
        <p>来去电时间：<span>{{callDetail.ring}}</span></p>
      </div>
      <div class="call-info">
        <p>归属地：<span>{{callDetail.attribution}}</span></p>
        <p>通话结束时间：<span>{{callDetail.endTime}}</span></p>
        <p></p>
      </div>
      <div class="call-info">
        <span style="color: #999;">通话录音：</span>
        <audio :src="callDetail.recordFile" controls="controls" preload style="height:36px;outline: 0;"></audio>
      </div>
      <h4 class="customer-info-header">联系人信息</h4>
      <div class="customer-info">
        <!-- <audio src="http://65.ierge.cn/12/186/372266.mp3" controls="controls" preload style="height:42px;"></audio>  -->
        <template v-if="unknown">
          <p>未完成的事件：<span class="unFinishEvent">{{contact.unfinishedEventCount}}</span></p>
          <div v-if="showCreateUser" class="customer-container" v-loading.fullscreen.lock="loadingPage">
            <form @submit.prevent="submit" class="base-form" v-if="init">
              <customer-edit-form :fields="fields" v-model="form" ref="form" />
              <button type="submit" :disabled="submitting || pending" class="btn btn-primary">保存</button>
              <button type="button" class="btn btn-ghost" @click="cancelCreate">取消</button>
            </form>
          </div>
          <div v-else>
            <p>客户：<span>未知</span></p>
            <p>联系人：<span>未知</span></p>
            <base-button type="primary" @event="showCreateUser=true">新建客户</base-button>
            <base-button type="ghost" @event="saveDialogVisible=true" style="margin-left:10px;">添加到现有客户</base-button>
          </div>
        </template>
        <template v-else>
          <p>客户：<a href="" style="color: #55b7b4;cursor: pointer;" @click.stop.prevent="createCustomerTab(contact.id)">{{contact.name}}</a></p>
          <p>联系人：<span v-if="contact.linkman">{{contact.linkman.name}}</span></p>
          <p>区域：<span v-if="contact.customerAddress">{{contact.customerAddress.adProvince}}</span></p>
          <p>详细地址：<span v-if="contact.customerAddress">{{contact.customerAddress.adAddress}}</span></p>
          <p>负责人：<span>{{contact.customerManagerName}}</span></p>
          <p>服务团队：<span>{{dealTags(contact.tags)}}</span></p>
          <p>未完成的工单：<span class="unFinishTask">{{contact.unfinishedTaskCount}}</span></p>
          <p>未完成的事件：<span class="unFinishEvent">{{contact.unfinishedEventCount}}</span></p>
        </template>
      </div>
      <h4 class="customer-info-header">关联工单
        <template v-if="unknown">
          <el-tooltip content="请新建客户或添加到现有客户" placement="top" :enterable="false">
            <el-dropdown trigger="click">
              <el-button type="info" plain size="mini" disabled>新建工单</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="type in taskTypes" :key="type.id">
                  <div class="link-of-dropdown" @click="createTask(type.id)">{{type.name}}</div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-tooltip>
        </template>
        <template v-else>
          <el-dropdown trigger="click">
            <!-- 如果已经有关联工单了显示关联工单单号 -->
            <template v-if="taskBusinessNo">
              <a href="" style="color: #55b7b4;cursor: pointer;" @click.stop.prevent="createTaskTab(contact.taskBindRecord.wordId)">{{taskBusinessNo}}</a>
            </template>
            <template v-else>
              <el-button type="primary" size="mini">新建工单</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="type in taskTypes" :key="type.id">
                  <div class="link-of-dropdown" @click="createTask(type.id)">{{type.name}}</div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>

          </el-dropdown>
        </template>
      </h4>
      <h4 class="customer-info-header">关联事件
        <template v-if="unknown">
          <el-tooltip content="请新建客户或添加到现有客户" placement="top" :enterable="false">
            <el-dropdown trigger="click">
              <el-button type="info" plain size="mini" disabled>新建事件</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="event in eventTypes" :key="event.id">
                  <div class="link-of-dropdown" @click="createEvent(event.id)">{{event.name}}</div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-tooltip>
        </template>
        <template v-else>
          <el-dropdown trigger="click">
            <!-- 如果已经有关联事件了显示关联事件编号 -->
            <template v-if="eventBusinessNo">
              <a href="" style="color: #55b7b4;cursor: pointer;" @click.stop.prevent="createEventTab(contact.eventBindRecord.wordId)">{{eventBusinessNo}}</a>
            </template>
            <template v-else>
              <el-button type="primary" size="mini">新建事件</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="event in eventTypes" :key="event.id">
                  <div class="link-of-dropdown" @click="createEvent(event.id)">{{event.name}}</div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </h4>
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
            <el-tag v-if="item.status == 0 || item.status == 1" :type="item.status ? 'info' : 'danger'">{{item.status == 1 ? '已解决' : (item.status == 0 ? '未解决' : '--')}}</el-tag>
            <p v-if="item.remark">备注:{{item.remark}}</p>
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
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="500" v-model="ruleForm.remark" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveRemark('ruleForm')">保存</el-button>
        </el-form-item>
      </el-form>

    </div>

    <!-- 添加到现有客户的对话框 -->
    <el-dialog title="添加到现有客户" :visible.sync="saveDialogVisible" width="30%" @close="saveDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="saveForm" :rules="saveFormRules" ref="saveFormRef" label-width="100px" label-position="left">
        <el-form-item label="客户">
          <customer-select v-model="customer" :field="customerField" :remote-method="searchCustomer" :update-customer="updateCustomer" placeholder="请选择客户"></customer-select>
          <!-- <el-input v-model="saveForm.name"></el-input> -->
        </el-form-item>
        <el-form-item label="联系人" prop="name">
          <el-input v-model="saveForm.name" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="saveForm.phone" disabled></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUser">确 认</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import {parse} from '@src/util/querystring';
import FormMixin from '@src/component/form/mixin/form'
import CustomerEditForm from '../../customer/components/CustomerEditForm.vue'
import * as FormUtil from '@src/component/form/util'
import * as util from '../../customer/util/customer'
import platform from '@src/platform'
import * as CallCenterApi from '@src/api/CallCenterApi'
let query;
export default {
  name: 'call-detail',
  inject: ['initData'],
  data() {
    return {
      callDetail:{},
      unknown: true,
      contact: {},
      showCreateUser: false,
      submitting: false,
      pending: false,
      loadingPage: false,
      form: {},
      init: false,
      customerId: '',
      saveDialogVisible: false,
      saveForm: {
        name: '',
        phone: this.linkmanPhone
      },
      saveFormRules: {
        name: [{ required: true, message: '请选择客户', trigger: 'blur' }]
      },
      customer: [
        {
          value: '',
          label: ''
        }
      ],
      customerField: {
        isSystem: 1,
        fieldName: 'customer',
        displayName: '客户',
        formType: 'customer',
        defaultValue: null,
        isNull: 0,
        isSearch: 0,
        placeHolder: null
      },
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
    action() {
      return 'create'
    },
    fields() {
      let originFields = this.initData.fieldInfo || []
      let sortedFields = originFields
        .sort((a, b) => a.orderId - b.orderId)
        .map(f => {
          if (f.formType === 'address' && f.isSystem) {
            f.isNull = this.initData.isAddressAllowNull ? 1 : 0
          }
          return f
        })
        .filter(f => {
          return (
            f.isNull == 0 &&
            f.fieldName !== 'serialNumber' &&
            (f.fieldName !== 'tags' ||
              (f.fieldName === 'tags' && this.initData.isDivideByTag))
          )
        })
      return FormUtil.migration(sortedFields)
    },
    eventTypes() {
      if (!this.initData || (this.initData && !this.initData.eventTypeList))
        return []
      return this.initData.eventTypeList.map(t => Object.freeze(t))
    },
    taskTypes() {
      if (!this.initData || (this.initData && !this.initData.taskTypeList))
        return []
      return this.initData.taskTypeList.map(t => Object.freeze(t))
    },
    taskBusinessNo() {
      return (this.contact.taskBindRecord && this.contact.taskBindRecord.businessNo) || '' 
    },
    eventBusinessNo() {
      return (this.contact.eventBindRecord && this.contact.eventBindRecord.businessNo) || ''
    }
  },
  async mounted() {
    query = parse(window.location.search) || {}
    this.getCallRecord(query.id)
    this.getCustomerInfo()
    try {
      // 初始化默认值
      let form = {}
      form = util.packToForm(this.fields, form, this.initData.customerAddress)
      this.form = FormUtil.initialize(this.fields, form)
      this.init = true
    } catch (e) {
      console.error('CustomerEditView caught an error ', e)
    }
    this.getRemarkList()
    this.getCategoryList()
  },
  methods: {
    // 获取服务备注列表
    getRemarkList(){
      const params = {
        recordId: query.id
      }
      if(!query.id) return
      CallCenterApi.getFwRemarkList(params).then(({code, message, result}) => {
        if (code != 0) return this.$message.error(message || '内部错误')
        this.remarkList = result || []
      }).catch((err) => {
        console.error(err)
      })
    },
    // 获取咨询分类列表
    async getCategoryList(){
      CallCenterApi.getZxSortList().then(({code, message, result}) => {
        if (code !== 0) return this.$message.error(message || '内部错误')
        this.categoryList = result || []
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
    },
    // 保存备注
    saveRemark(formName) {
      this.$refs[formName].validate(async valid => {
        if (!valid) {
          return false
        } 
        if(!query.id) return false
        const params = this.ruleForm
        params.recordId = query.id
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
    // 通话信息
    getCallRecord(id) {
      if (!id) return
      CallCenterApi.getCallRecord({id}).then(({ code, message, result }) => {
        // 如果data为null说明是未知联系人
        if(code !== 0) return
        this.callDetail = result || {}
      }).catch((err) => {
        console.error(err)
      })
    },
    // 联系人信息
    getCustomerInfo() {
      if (!query.phone || !query.id) return
      CallCenterApi.getCustomerInfo({
        linkmanPhone: query.phone,
        callRecordId: query.id
      }).then(({ status, message, data }) => {
        // console.info('', status, message, data)
        // 如果data为null说明是未知联系人
        if (!data) {
          this.unknown = true
        } else {
          this.unknown = false
          this.customerId = data.id || ''
        }
        this.contact = data || {}
      }).catch((err) => {
        console.error(err)
      })
    },
    prettyAddress(adr = {}) {
      if (!adr) return ''
      let province = adr.adProvince || adr.province || ''
      let city = adr.adCity || adr.city || ''
      let dist = adr.adDist || adr.dist || ''
      let address = adr.adAddress || adr.address || ''
      return province + city + dist + address
    },
    dealTags(tags = []) {
      const arr = []
      tags.forEach(item => arr.push(item.tagName))
      return arr.join('，')
    },
    saveDialogClosed() {
      this.$refs.saveFormRef.resetFields()
    },
    submit() {
      // console.info('form::', this.form);
      this.submitting = true
      this.$refs.form
        .validate()
        .then(valid => {
          this.submitting = false
          if (!valid) return Promise.reject('validate fail.')
          const params = util.packToCustomer(
            this.fields,
            this.form,
            this.initData.tags
          )
          this.pending = true
          this.loadingPage = true
          this.createMethod(params)
        })
        .catch(err => {
          console.error(err)
          this.pending = false
          this.loadingPage = false
        })
    },
    createMethod(params) {
      this.$http
        .post('/customer/create', params)
        .then(res => {
          let isSucc = !res.status
          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建客户${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })
          this.pending = false
          this.loadingPage = false

          if (!isSucc) return
          this.customerId = res.data.customerId
          // 是否还有后续动作
          // console.info('createMethod:', this.customerId)
          this.getCustomerInfo()
          this.showCreateUser = false;
        })
        .catch(err => console.error('err', err))
    },
    cancelCreate() {
      this.showCreateUser = false
    },
    saveUser() {
      this.$refs.saveFormRef.validate(async valid => {
        if (!valid) return
        const params = this.saveForm
        params.customerId = this.customer[0].value
        try {
          const { status, message } = await this.$http.post(
            '/linkman/save4Dialog',
            params,
            false
          )
          if (status !== 0)
            return this.$platform.notification({
              title: '保存失败',
              message: message || '',
              type: 'error'
            })
          this.$refs.saveFormRef.resetFields()
          this.saveDialogVisible = false
          this.$platform.notification({
            title: '保存成功',
            type: 'success'
          })
        } catch (e) {
          console.error(e)
        }
      })
    },
    // 新建工单
    createTask(typeId) {
      // console.info('typeId:', typeId);
      if (!this.customerId) return this.$message.error('请先新建或者保存客户！')
      let fromId = window.frameElement.getAttribute('id')
      const linkmanId = this.contact.linkman.id
      this.$platform.openTab({
        id: 'createTask',
        title: '新建工单',
        close: true,
        url: `/task/edit4CallCenter?defaultTypeId=${typeId}&callRecordId=${query.id}&linkmanId=${linkmanId}`,
        fromId
      })
    },
    // 工单详情
    createTaskTab(taskId) {
      let fromId = window.frameElement.getAttribute('id')
      this.$platform.openTab({
        id: `task_view_${taskId}`,
        title: '工单详情',
        close: true,
        url: `/task/view/${taskId}`,
        fromId
      })
    },
    // 新建事件
    createEvent(typeId) {
      // console.info('typeId:', typeId);
      if (!this.customerId) return this.$message.error('请先新建或者保存客户！')
      let fromId = window.frameElement.getAttribute('id')
      const linkmanId = this.contact.linkman.id
      this.$platform.openTab({
        id: 'createEvent',
        title: '新建事件',
        close: true,
        url: `/event/edit4CallCenter?defaultTypeId=${typeId}&callRecordId=${query.id}&linkmanId=${linkmanId}`,
        fromId
      })
    },
    // 事件详情
    createEventTab(eventId) {
      let fromId = window.frameElement.getAttribute('id')
      this.$platform.openTab({
        id: `event_view_${eventId}`,
        title: '事件详情',
        close: true,
        url: `/event/view/${eventId}`,
        fromId
      })
    },
    createCustomerTab(customerId) {
      let fromId = window.frameElement.getAttribute('id')
      this.$platform.openTab({
        id: `customer_view_${customerId}`,
        title: '客户信息',
        close: true,
        url: `/customer/view/${customerId}?noHistory=1`,
        fromId
      })
    },

    searchCustomer(params) {
      const pms = params || {}
      return this.$http
        .post('/customer/list', pms)
        .then(res => {
          if (!res || !res.list) return
          if (res.list) {
            res.list = res.list.map(customer =>
              Object.freeze({
                label: customer.name,
                value: customer.id
              })
            )
          }

          return res
        })
        .catch(e => console.error(e))
    },

    updateCustomer(value) {
      console.info('value:', value)
      this.customer = value
    }
  },
  components: {
    [CustomerEditForm.name]: CustomerEditForm,
    'customer-select': {
      name: 'customer-select',
      mixins: [FormMixin],
      props: {
        value: {
          type: Array,
          default: () => []
        },
        remoteMethod: Function,
        updateCustomer: Function,
        placeholder: String
      },
      methods: {
        input(value) {
          this.$emit('input', value)
        }
      },
      render(h) {
        return (
          <base-select
            value={this.value}
            placeholder={this.placeholder}
            remoteMethod={this.remoteMethod}
            onInput={this.updateCustomer}
          />
        )
      }
    }
  }
}
</script>

<style lang="scss">
.audio__play--previous,
.audio__play--next {
  display: none;
}

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

.call-center-detail-info {
  padding: 10px;
  display: flex;
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 100vw;
  .main {
    flex: 1;
    background: #fff;
    padding: 12px;
    .call-info {
      display: flex;
      align-items: center;
      p {
        flex: 1;
        color: #999;
        span {
          color: #333;
        }
      }
    }

    .customer-info-header {
      margin-top: 20px;
      button {
        margin-left: 10px;
      }
    }

    .customer-info {
      p {
        color: #999;
        span {
          color: #333;
        }
      }
      img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 10px;
      }
      .unFinishTask,
      .unFinishEvent {
        color: $color-primary;
      }

      .customer-container {
        .form-builder {
          padding: 0;
          .form-item {
            label {
              padding-left: 0 !important;
            }
            .input-and-btn {
              display: flex;
              button {
                margin-left: 10px;
                margin-right: 0px;
              }
            }
          }
        }
      }

      button {
        margin-right: 0px;
      }
    }
  }
  .right {
    margin-left: 10px;
    width: 25%;
    background: #fff;
    padding: 12px;
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
          background-color: #fafbfc;
          padding: 10px;
          margin: 10px 0;
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
    .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
      position: absolute;
      left: -5px;
    }
  }
}
</style>