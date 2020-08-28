/* api */
import * as TaskApi from '@src/api/TaskApi.ts'
/* component */
import TaskEditForm from '@src/modules/task/edit/components/TaskEditForm/TaskEditForm.vue'
/* utils */
import * as FormUtil from '@src/component/form/util'
import * as util from '@src/modules/task/util/task'
import platform from '@src/platform';
import { 
  customerAddressSelectConversion,
  customerSelectConversion,
  linkmanSelectConversion
} from '@src/util/conversionFunctionUtil.ts';
/* vue */
import data from './data'
import computed from './computed'
import methods from './methods'
/* enum */
import { TaskFieldNameMappingEnum } from '@model/enum/MappingEnum.ts'

let taskTemplate = {};

export default {
  name: 'task-edit-view',
  inject: ['initData'],
  data() {
    return data
  },
  computed,
  async mounted() {
    try {
      this.initialize();

      // 初始化默认值
      let form = this.workTask;

      this.fields = await TaskApi.getTaskTemplateFields({ templateId: form.templateId || this.types[0].id, tableName: 'task' });

      form = util.packToForm(this.fields, form);
      this.form = FormUtil.initialize(this.fields, form);

      // 呼叫中心需求处理
      this.callCenterWithTaskDataHandler();

      this.init = true;

    } catch (e) {
      console.error('error ', e)
    }
  },
  methods: {
    ...methods,
    /** 
     * @description 呼叫中心与工单数据的处理 linkman/address/customer
    */
    callCenterWithTaskDataHandler() {
      let callRecordId = this.initData?.callRecordId;
      if(!callRecordId) {
        return console.warn(`Caused: current is not have callRecordId, The value is ${callRecordId}`);
      }

      // 联系人 地址
      let { linkman, address } = this.initData;
      // 更新联系人/客户数据
      if (linkman) {
        let { customer } = linkman;
        this.$set(this.form, TaskFieldNameMappingEnum.Customer, [customerSelectConversion(customer)]);
        this.$set(this.form, TaskFieldNameMappingEnum.Linkman, [linkmanSelectConversion(linkman)]);
      }
      // 更新地址数据
      if(address) {
        this.$set(this.form, TaskFieldNameMappingEnum.Address, [customerAddressSelectConversion(address)]);
      }
    },
    /** 
     * @description 创建工单方法
    */
    createTaskMethod(params, isAllot) {
      TaskApi.createTask(params)
        .then(res => {
          let isSucc = res.success;

          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建工单${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })

          this.pending = false;
          this.loadingPage = false;

          if (!isSucc) return;
          
          // 根据是否派单决定跳转地址
          let taskId = res.result;
          let taskDetailPath = `/task/view/${taskId}`;
          let taskAllotPath = `/task/allotTask?id=${taskId}`;

          window.location.href = isAllot ? taskAllotPath : taskDetailPath;
        })
        .catch(err => console.error('err', err))
    },
    /** 
     * @description 返回
    */
    goBack() {
      if (this.isTaskCreate) {
        let id = window.frameElement.dataset.id;
        return this.$platform.closeTab(id)
      }

      parent.frameHistoryBack(window)
    },
    /** 
     * @description 初始化
    */
    initialize() {
      this.initUrl();
      this.initTitle();
    },
    /** 
     * @description 初始化url
    */
    initUrl() {
      let url = '';
      let createUrl = '/task/create';
      let updateAndEditUrl = '/task/update';

      if(this.isTaskEdit) {
        url = this.isFromEvent ? createUrl : updateAndEditUrl;
      } else {
        url = createUrl;
      }

      this.submitModel.url = url;
    },
    /** 
     * @description 初始化标题
    */
    initTitle() {
      let title = '';

      if(this.isPlanTaskEdit) {
        title = '编辑计划任务';
      } else if(this.isFromPlan) {
        title = '新建计划任务';
      } else if(!this.isFromEvent && this.isTaskEdit) {
        title = '编辑工单';
      } else {
        title = '新建工单';
      }

      document.title = title;
    },
    /** 
     * @description 刷新tab
    */
    reloadTab() {
      let fromId = window.frameElement.getAttribute('fromid');

      this.$platform.refreshTab(fromId);
    },
    /** 
     * @description 提交
     * @param {Boolean} isAllot 是否派单
    */
    submit(isAllot = false) {
      this.submitting = true;

      this.$refs.form
        .validate()
        .then(valid => {
          this.submitting = false;

          if (!valid) return Promise.reject('validate fail.');
        
          const task = util.packToTask(this.fields, this.form);
          task.templateId = taskTemplate.value;
          task.templateName = taskTemplate.text;
          
          const { address, customer, tick, linkman } = task;
          const params = {
            address,
            customer,
            eventId: '',
            eventNo: '',
            linkman,
            task,
            tick,
          };
          params.templateId = taskTemplate.value;
          params.templateName = taskTemplate.text;
          params.callRecordId = this.initData?.callRecordId;
        
          this.pending = true;
          this.loadingPage = true;

          if (this.isTaskEdit) {
            return this.updateTaskMethod(params);
          }
          if (this.isTaskCreate) {
            return this.createTaskMethod(params, isAllot);
          }

        })
        .catch(err => {
          this.pending = false;
          this.loadingPage = false;
          console.error(err);
        })
    },
    /** 
     * @description 编辑工单方法
    */
    updateTaskMethod(params) {
      TaskApi.editTask(params)
        .then(res => {
          if (!res.success) {
            this.loadingPage = false;
            this.pending = false;
            return platform.notification({
              type: 'error',
              title: '更新工单失败',
              message: res.message
            })
          }
          
          window.location.href = `/task/view/${this.editId}`;

        })
        .catch(err => {
          this.pending = false;
          this.loadingPage = false;
          console.error('err', err);
        })
    },
    /** 
     * @description 更新工单类型
    */
    updateTaskTemplateId(template = {}) {
      taskTemplate = template || {};
    },
  },
  components: {
    [TaskEditForm.name]: TaskEditForm
  }
}