<template>
  <div class="call-center-contact-info">
    <h4>通话信息</h4>
    <div class="call-info">
      <p>呼入电话：<span>15200000000</span></p>
      <p>今日来电：<span>3</span></p>
    </div>
    <div class="call-info">
      <p>归属地：<span>浙江杭州</span></p>
      <p>呼入时间：<span>2020-05-12 12:30</span></p>
    </div>
    <h4 class="customer-info-header">客户信息</h4>
    <div class="customer-info">
      <!-- <audio src="http://65.ierge.cn/12/186/372266.mp3" controls="controls" preload style="height:42px;"></audio>  -->
      <template v-if="unknown">
        <p>未完成的事件：<span class="unFinishEvent">{{unfinishedEventCount}}</span></p>
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
          <base-button type="ghost" @event="saveDialogVisible=true">添加到现有客户</base-button>
        </div>
      </template>
      <template v-else>
        <p>客户：<a href="" style="color: #55b7b4;cursor: pointer;" @click.stop.prevent="createCustomerTab(contact.id)">{{contact.name}}</a></p>
        <p>联系人：<span>{{contact.lmName}}</span></p>
        <p>区域：<span>浙江杭州</span></p>
        <p>详细地址：<span>{{prettyAddress(contact.customerAddress)}}</span></p>
        <p>负责人：<img src="../../../assets/img/avatar.png"><span>{{contact.customerManagerName}}</span></p>
        <p>服务团队：<span>{{dealTags(contact.tags)}}</span></p>
        <p>未完成的工单：<span class="unFinishTask">{{contact.unfinishedTaskCount}}</span></p>
        <p>未完成的事件：<span class="unFinishEvent">{{contact.unfinishedEventCount}}</span></p>
      </template>
    </div>
    <h4 class="customer-info-header">关联工单
      <template v-if="unknown">
        <el-tooltip content="请新建客户或添加到现有客户" placement="top" :enterable="false">
          <el-dropdown trigger="click">
            <el-button type="primary" size="mini" disabled>新建工单</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="type in taskTypes" :key="type.id">
                <span class="link-of-dropdown" @click="createTask(type.id)">{{type.name}}</span>
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
                <span class="link-of-dropdown" @click="createTask(type.id)">{{type.name}}</span>
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
            <el-button type="primary" size="mini" disabled>新建事件</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="event in eventTypes" :key="event.id">
                <span class="link-of-dropdown" @click="createEvent(event.id)">{{event.name}}</span>
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
                <span class="link-of-dropdown" @click="createEvent(event.id)">{{event.name}}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </h4>

    <!-- 添加到现有客户的对话框 -->
    <el-dialog title="添加到现有客户" :visible.sync="saveDialogVisible" width="30%" @close="saveDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="saveForm" :rules="saveFormRules" ref="saveFormRef" label-width="100px" label-position="left">
        <el-form-item label="客户">
          <customer-select v-model="customer" :field="customerField" :remote-method="searchCustomer" :update-customer="updateCustomer" placeholder="请输入关键字搜索客户"></customer-select>
          <!-- <el-input v-model="saveForm.name"></el-input> -->
        </el-form-item>
        <el-form-item label="联系人" prop="name">
          <el-input v-model="saveForm.name"></el-input>
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
import FormMixin from '@src/component/form/mixin/form'
import CustomerEditForm from '../../customer/components/CustomerEditForm.vue'
import * as FormUtil from '@src/component/form/util'
import * as util from '../../customer/util/customer'
import platform from '@src/platform'

export default {
  name: 'contact-info',
  inject: ['initData'],
  data() {
    return {
      linkmanPhone:'18397952979',
      unknown: true,
      contact: {},
      showCreateUser: false,
      submitting: false,
      pending: false,
      loadingPage: false,
      form: {},
      init: false,
      customerId: 'd68cc004-6821-11ea-bfc9-00163e304a25',
      audioList:['http://devtest.qiniudn.com/Preparation.mp3'],
      
      saveDialogVisible: false,
      saveForm: {
        name: '',
        phone: '15200000000'
      },
      saveFormRules: {
        name: [{ required: true, message: '请选择客户', trigger: 'blur' }]
      },
      customer: [{
        'value' : '',
        'label' : ''
      }],
      customerField: { 'isSystem': 1, 'fieldName': 'customer', 'displayName': '客户', 'formType': 'customer', 'defaultValue': null, 'isNull': 0, 'isSearch': 0, 'placeHolder': null }
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
            f.isNull == 0 && f.fieldName !== 'serialNumber'
            && (f.fieldName !== 'tags'
              || (f.fieldName === 'tags' && this.initData.isDivideByTag))
          )
        })        
      return FormUtil.migration(sortedFields)
    },
    eventTypes() {
      if (!this.initData || (this.initData && !this.initData.eventTypeList))
        return [];
      return this.initData.eventTypeList.map(t => Object.freeze(t));
    },
    taskTypes() {
      if (!this.initData || (this.initData && !this.initData.taskTypeList))
        return [];
      return this.initData.taskTypeList.map(t => Object.freeze(t));
    },
    taskBusinessNo() {
      return (this.contact.taskBindRecord && this.contact.taskBindRecord.businessNo) || ''
    },
    eventBusinessNo() {
      return (this.contact.eventBindRecord && this.contact.eventBindRecord.businessNo) || ''
    }
  },
  async created () {
    try {
      const {status, message, data} = await this.$http.get('/customer/detail4CallCenterRemark', {linkmanPhone:this.linkmanPhone, callRecordId:2});
      console.info('', status, message, data);
      // 如果data为null说明是未知联系人 
      if(!data) {
        this.unknown = true;
      } else {
        this.unknown = false; 
      }
      this.contact = data || {};
    } catch (e) {
      console.error(e);
    }
  },
  async mounted() {
    try {
      // 初始化默认值
      let form = {};
      form = util.packToForm(this.fields, form, this.initData.customerAddress);
      this.form = FormUtil.initialize(this.fields, form);
      this.init = true;
    } catch (e) {
      console.error('CustomerEditView caught an error ', e);
    }
  },
 
  methods: {
    prettyAddress(adr = {}) {
      if (!adr) return '';
      let province = adr.adProvince || adr.province || '';
      let city = adr.adCity || adr.city || '';
      let dist = adr.adDist || adr.dist || '';
      let address = adr.adAddress || adr.address || '';
      return province + city + dist + address;
    },
    dealTags(tags = []){
      const arr = [];
      tags.forEach(item=>arr.push(item.tagName));
      return arr.join('，')
    },
    saveDialogClosed() {
      this.$refs.saveFormRef.resetFields()
    },
    submit() {
      // console.info('form::', this.form);
      this.submitting = true;
      this.$refs.form.validate()
        .then(valid => {
          this.submitting = false;
          if (!valid) return Promise.reject('validate fail.');
          const params = util.packToCustomer(this.fields, this.form, this.initData.tags);
          this.pending = true;
          this.loadingPage = true;
          this.createMethod(params);
        })
        .catch(err => {
          console.error(err);
          this.pending = false;
          this.loadingPage = false;
        });
    },
    createMethod(params) {
      this.$http.post('/customer/create', params)
        .then(res => {
          let isSucc = !res.status;
          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建客户${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })
          this.pending = false;
          this.loadingPage = false;

          if(!isSucc) return;
          this.customerId = res.data.customerId;
          // 是否还有后续动作
          console.info('createMethod:', this.customerId);
          
        })
        .catch(err => console.error('err', err));
    },
    cancelCreate(){
      this.showCreateUser = false;

    },
    saveUser() {
      this.$refs.saveFormRef.validate(async valid => {
        if (!valid) return        
        const params = this.saveForm        
        params.customerId = this.customer[0].value
        try {
          const {status, message} = await this.$http.post('/linkman/save4Dialog', params, false)
          if (status !== 0) return this.$platform.notification({
            title: '保存失败',
            message: message || '',
            type: 'error',
          })
          this.$refs.saveFormRef.resetFields()
          this.saveDialogVisible = false
          this.$platform.notification({
            title: '保存成功',
            type: 'success',
          })
        } catch (e) {
          console.error(e);
        }
      })
    },
    // 新建工单  
    createTask(typeId) {
      // console.info('typeId:', typeId);
      if(!this.customerId) return this.$message.error('请先新建或者保存客户！')
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: 'createTask',
        title: '新建工单',
        close: true,
        url: `/task/createFromCustomer/${this.customerId}?defaultTypeId=${typeId}&callRecordId=1`,
        fromId
      });
    },
    // 工单详情
    createTaskTab(taskId) {
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: `task_view_${taskId}`,
        title: '工单详情',
        close: true,
        url: `/task/view/${taskId}`,
        fromId
      });
    },
    // 新建事件
    createEvent(typeId) {
      // console.info('typeId:', typeId);
      if(!this.customerId) return this.$message.error('请先新建或者保存客户！')
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: 'createEvent',
        title: '新建事件',
        close: true,
        url: `/event/createFromCustomer/${this.customerId}?defaultTypeId=${typeId}&callRecordId=1`,
        fromId
      });
    },
    // 事件详情
    createEventTab(eventId) {
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: `event_view_${eventId}`,
        title: '事件详情',
        close: true,
        url: `/event/view/${eventId}`,
        fromId
      });
    },
    createCustomerTab(customerId) {
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: `customer_view_${customerId}`,
        title: '客户信息',
        close: true,
        url: `/customer/view/${customerId}?noHistory=1`,
        fromId
      })
    },

    searchCustomer(params) {
      const pms = params || {};
      return this.$http.post('/customer/list', pms)
        .then(res => {
          if (!res || !res.list) return;
          if (res.list) {
            res.list = res.list.map(customer => Object.freeze({
              label: customer.name,
              value: customer.id,
            }))
          }

          return res;
        })
        .catch(e => console.error(e));
    },

    updateCustomer(value) {
      console.info('value:', value);
      this.customer = value;
      
    },
    
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
        placeholder: String,
      },
      methods: {
        input(value){
          this.$emit('input', value)
        },
      },
      render(h){
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
  },
}
</script>

<style lang="scss">
.audio__play--previous, .audio__play--next {
  display: none;
}
.call-center-contact-info {
  padding: 20px;

  .call-info {
    display: flex;
    justify-content: space-between;
    p {
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

    .customer-container{
      .form-builder{
        padding: 0;
        .form-item {
          label {
            padding-left: 0!important;
          }
          .input-and-btn{
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
</style>