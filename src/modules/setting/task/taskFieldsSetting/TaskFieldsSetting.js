/* mixin */
import fieldMixin from '@src/mixins/fieldMixin';
import FormDesignMixin from '@src/mixins/formDesign';
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
import * as CustomerApi from '@src/api/CustomerApi';
import * as ProductApi from '@src/api/ProductApi';
/* util */
import * as FormUtil from '@src/component/form/util';
import _ from 'lodash';
/* components */
import RelationOptionsModal from './components/RelationOptionsModal/RelationOptionsModal.tsx';
/* enum */
import TableNameEnum from '@model/enum/TableNameEnum.ts';

// 关联字段禁用的类型
const RELATION_DISABLE_FIELDS = ['attachment', 'autograph', 'separator', 'info'];

// 模块名映射
const MODE_NAME_MAP = {
  [TableNameEnum.Task]: '工单表单',
  [TableNameEnum.TaskReceipt]: '回执表单'
}

export default {
  name: 'task-fields-setting',
  mixins: [fieldMixin, FormDesignMixin],
  props: {
    mode: {
      type: String,
      default: TableNameEnum.Task
    },
    templateId: {
      type: String,
      default: ''
    },
    templateName: {
      type: String,
      default: ''
    }
  },
  data(){
    return {
      init: false,
      pending: false,
      visble: false,
      fields: [], // 表单字段
      commonFields: [], // 公共字段
      relationField: {}, // 关联项字段
      relationOptions: { // 关联查询字段关联项数据
        customerFields: [],
        productFields: []
      },
      relationOptionsMap: {
        relationCustomer: 'customerFields',
        relationProduct: 'productFields'
      }
    }
  },
  computed: {
    // 模块名
    modeName() {
      return MODE_NAME_MAP[this.mode];
    }
  },
  watch: {
    visble(val) {
      if(!val) this.$emit('success');
    }
  },
  methods: {
    initialize() {
      this.pending = true;

      Promise.all([
        TaskApi.getAllFields({ tableName: this.mode, typeId: this.templateId, isFromSetting: true }),
        TaskApi.getCommonFieldList({ tableName: this.mode })
      ])
        .then(res => {
          this.fields = this.toFormField(res[0] || []);
          this.commonFields = res[1].result || [];

          this.init = true;
        })
        .finally(() => {
          this.pending = false;
        })
        .catch(e => console.log('initialize', e));     
    },
    // 打开表单设置弹窗
    open() {
      this.init = false;
      this.visble = true;
      this.initialize();
    },
    // 将后端字段转换成设计器可接受的字段
    toFormField(fields = []) {
      let sortedFields = fields.sort((a, b) => a.orderId - b.orderId);
  
      // 工单自带的 attachment 字段需要特殊处理, 提交时需要将formType还原
      sortedFields.forEach(f => {
        if(f.formType == 'attachment' && f.isSystem == 1) {
          f.formType = 'taskAttachment'
        }
      })
      
      return FormUtil.toFormField(sortedFields);
    },
    // 将字段转换成后端可接收的字段
    packToField(origin) {
      let fields = FormUtil.toField(origin);

      fields.forEach((field, index) => {
        field.templateId = this.templateId;
        field.templateName = this.templateName;
        field.tableName = this.mode;
        field.orderId = index;
        
        // 还原工单表单的系统附件的formType
        if(field.formType == 'taskAttachment' && field.isSystem) {
          field.formType = 'attachment';
        }

        // 是否升级为公共字段
        field.isUpgrade = field.isPublic > field.isCommon ? 1 : 0;

        // 新拖进来的公共字段，去掉id保存
        if(field.isDragCommon == 1) field.fieldId = field.id = null;
      })

      return fields;
    },
    /** 
    * @description 提交表单字段设置
    */
    async submit() {
      try {
        let fields = this.packToField(this.fields);
        
        // 表单字段格式校验
        let message = FormUtil.validate(fields);
        if(!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;

        let result = await TaskApi.taskSettingSave(fields);

        let isSuccess = result.succ;
        this.$platform.notification({
          type: isSuccess ? 'success' : 'error',
          title: `${this.modeName}字段更新${isSuccess ? '成功' : '失败'}`,
          message: isSuccess ? null : result.message
        })

        if(isSuccess) {
          this.visble = false;
        }

      } catch (error) {
        console.error(error)
      }

      this.pending = false;
    },
    // 公共字段降级为私有字段
    transformPrivateField(field) {
      this.pending = true;

      const params = {
        templateId: this.templateId,
        commonFieldFormList: [{
          fieldName: field.fieldName,
          isUpgrade: false
        }]
      }

      TaskApi.setCommonFields(params).then(res => {
        if (res.success) {
          // 更新字段的公共字段属性
          field.isCommon = field.isPublic = 0;

          // 公共字段库删除该字段
          let index = this.commonFields.findIndex(item => item.fieldName == field.fieldName);
          this.commonFields.splice(index, 1);

          this.$platform.notification({
            title: '取消成功',
            type: 'success'
          })
        } else {
          this.$platform.alert(res.message);
        }
      })
        .finally(() => {
          this.pending = false;
        })
        .catch(err => console.warn(err));
    },
    // 修改公共字段配置
    updatePublicFieldSetting(field) {
      let fields = this.packToField([field]);

      TaskApi.updateCommonField(fields[0]).then(res => {
        if (res.success) {
          // 关闭修改控件配置弹窗
          this.$refs.formDesign.fieldSettingModal.visible = false;

          // 更新公共字段库该字段
          let index = this.commonFields.findIndex(item => item.fieldName == field.fieldName);
          this.$set(this.commonFields, index, {...field});

          this.$platform.notification({
            title: '修改成功',
            type: 'success'
          })
        } else {
          this.$platform.alert(res.message);
        }
      })
        .finally(() => {
          this.$refs.formDesign.fieldSettingModal.pending = false;
        })
        .catch(err => console.warn(err));
    },
    /** 
    * @description 获取客户关联查询字段关联项数据
    */
    getCustomerFields() {
      CustomerApi.getCustomerFields({ isFromSetting: true })
        .then(res => {
          if (res.succ) {
            // 过滤自定义字段且非禁用类型
            let fields = res.data.filter(field => field.isSystem == 0 && RELATION_DISABLE_FIELDS.indexOf(field.formType) == -1);

            fields.unshift({
              'fieldId':'serialNumber',
              'tableName':'customer',
              'fieldName':'serialNumber',
              'displayName':'客户编号',
              'isSystem':'0',
              'isSearch':'1',
              'isAppShow':'0',
              'formType':'text'
            }, {
              'fieldId':'tags',
              'tableName':'customer',
              'fieldName':'tags',
              'displayName':'服务团队',
              'isSystem':'0',
              'isSearch':'1',
              'isAppShow':'0',
              'formType':'selectMulti'
            }, {
              'fieldId':'customerManager',
              'tableName':'customer',
              'fieldName':'customerManager',
              'displayName':'客户负责人',
              'isSystem':'0',
              'isSearch':'1',
              'isAppShow':'0',
              'formType':'text'
            })
            
            this.relationOptions.customerFields = fields;
          }
        })
        .catch(err => console.warn(err));
    },
    /** 
    * @description 获取产品关联查询字段关联项数据
    */
    getProductFields() {
      ProductApi.getProductFields({ isFromSetting: true })
        .then(res => {
          if (res.succ) {
            // 过滤自定义字段且非禁用类型
            let fields = res.data.filter(field => field.isSystem == 0 && RELATION_DISABLE_FIELDS.indexOf(field.formType) == -1);

            fields.unshift({
              'fieldId':'serialNumber',
              'tableName':'customer',
              'fieldName':'serialNumber',
              'displayName':'产品编号',
              'isSystem':'0',
              'isSearch':'1',
              'isAppShow':'1',
              'formType':'text'
            }, {
              'fieldId':'type',
              'tableName':'customer',
              'fieldName':'type',
              'displayName':'产品类型',
              'isSystem':'0',
              'isSearch':'1',
              'isAppShow':'1',
              'formType':'select'
            })

            this.relationOptions.productFields = fields;
          }
        })
        .catch(err => console.warn(err));
    },
    /** 
    * @description 打开关联项设置弹窗
    * 从左侧基础控件拖入客户关联字段或者产品关联字段时打开弹窗
    */
    openRelatedOptionsDialog(field) {
      this.relationField = field;

      // 关联项字段列表
      let relationTypeOption = this.relationOptionsMap[field.formType];
      let relationOptions = this.relationOptions[relationTypeOption];

      let isCustomer = field.formType == 'relationCustomer';
      this.$refs.relationOptionsModal.open(relationOptions, isCustomer);
    },
    /** 
    * @description 关联项设置成功
    */
    relationOptionsConfirm(options) {
      for (let index = 0; index < options.length; index++) {
        const setting = options[index];
        const field = _.cloneDeep(this.relationField);
        
        // 设置该关联查询字段的标题为关联项标题
        field.name = setting.displayName;

        // 删除setting多余字段
        delete setting.displayName;
        field.setting = setting;

        // 加延时异步是因为form-design的insertField方法更新value异步会导致选择多个关联项时只能插入一个
        setTimeout(() => {
          this.$refs.formDesign.immediateInsert(field, null, true);
        }, 0)
      }
    }
  },
  mounted() {
    this.$eventBus.$on('task_form_design_relation_options_set', this.openRelatedOptionsDialog);

    // 获取客户和产品关联字段关联项数据
    this.getCustomerFields();
    this.getProductFields();
  },
  beforeDestroy() {
    this.$eventBus.$off('task_form_design_relation_options_set', this.openRelatedOptionsDialog);
  },
  components: {
    RelationOptionsModal
  }
}