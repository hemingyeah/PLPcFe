/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* mixin */
import ReceiptMixin from '../TaskReceiptMixin';

/* components */
import ReceiptCommonTable from './components/ReceiptCommonTable';
import TaskReceiptEditView from '../Edit/TaskReceiptEditView';

/* image */
import APPROVING_IMG from '@src/assets/img/task/approving.png';

export default {
  name: 'task-receipt-detail-view',
  mixins: [ReceiptMixin],
  data() {
    return {
      sparepartColums: [{
        label: '编号',
        field: 'serialNumber'
      }, {
        label: '名称',
        field: 'name'
      }, {
        label: '类别',
        field: 'primaryType'
      }, {
        label: '单价',
        field: 'salePrice',
        minWidth: '88px'
      }, {
        label: '数量',
        field: 'number',
        minWidth: '88px'
      }, {
        label: '小计',
        field: 'total',
        minWidth: '128px'
      }],
      serviceColums: [{
        label: '编号',
        field: 'serialNumber'
      }, {
        label: '名称',
        field: 'name'
      }, {
        label: '类别',
        field: 'primaryType'
      }, {
        label: '单价',
        field: 'salePrice',
        minWidth: '88px'
      }, {
        label: '数量',
        field: 'number',
        minWidth: '88px'
      }, {
        label: '小计',
        field: 'total',
        minWidth: '128px'
      }]
    }
  },
  computed: {
    /** 
    * @description 工单详情数据
    */
    task() {
      // TODO: task数据不一致啊
      let { task, receiptTaskForRead } = this.initData;
      return receiptTaskForRead || task || {};
    },
    /** 
    * @description 备件、服务项目、折扣费用数据集合
    */
    expenseSheet() {
      return this.initData.receiptExpenseSheetForRead || {};
    },
    /** 
    * @description 是否完成审批中
    */
    isFinishApproving() {
      return this.shareData.isFinishApproving;
    },
    /** 
    * @description 是否显示[编辑回执]按钮
    * 1. 不是审批状态
    * 2. 且 允许编辑工单canEditTask
    * 3. 且 工单状态不是costed和closed
    * 4. 且 工单配置开启了启用回执编辑
    */
    allowEditReceipt() {
      let stateArr = ['costed', 'closed'];
      let { state, inApprove } = this.initData.task;

      return inApprove != 1 && this.initData.canEditTask && this.receiptConfig.editReceipt && stateArr.indexOf(state) == -1;
    }
  },
  methods: {
    /** 
    * @description 审批图片
    */
    getApprovingImg() {
      return APPROVING_IMG;
    },
    /** 
    * @description 打开弹窗
    */
    async openDialog() {
      // 工单上备件用的库和当前租户备件库配置不同
      if (this.initData.isRepertoryDiff) {
        if (!await this.$platform.confirm('回执备件来源与当前备件库配置不同，无法编辑回执。如需要，请回退并重新完成。')) return;
      }

      // TODO: 支付完成提示
      if(this.initData.isPaySuccess) {
        if (!await this.$platform.confirm('该工单已经支付完成，备件、服务项目、折扣金额不可再编辑。')) return;
      }

      this.$refs.taskReceiptEdit.openDialog('edit');
    }
  },
  async mounted() {
    try {
      let { templateId, attachment, attribute } = this.task;
      let { sparePartsExpense, serviceExpense, discountExpense } = this.expenseSheet;

      this.fields = await TaskApi.getTaskTemplateFields({ templateId, tableName: 'task_receipt' });
      
      // 初始化默认值
      this.form = this.task;

      // 处理回执信息
      this.fields.forEach(field => {
        let { fieldName } = field;

        // 回执附件
        if(fieldName === 'receiptAttachment') {
          this.form[fieldName] = attachment.filter(img => img.receipt);
        }
        // 客户签名
        else if(fieldName === 'systemAutograph') {
          this.form[fieldName] = attribute[fieldName];
        }
        // 备件
        else if(fieldName === 'sparepart') {
          this.form[fieldName] = sparePartsExpense || [];
          console.log(this.form[fieldName], sparePartsExpense, 8887776666)
        }
        // 服务项目
        else if(fieldName === 'serviceIterm') {
          this.form[fieldName] = serviceExpense || [];
        }

      });

      // 折扣费用
      this.form.disExpense = discountExpense?.salePrice || 0;

    } catch (e) {
      console.error('error ', e)
    }
  },
  components: {
    [ReceiptCommonTable.name]: ReceiptCommonTable,
    [TaskReceiptEditView.name]: TaskReceiptEditView
  }
}
