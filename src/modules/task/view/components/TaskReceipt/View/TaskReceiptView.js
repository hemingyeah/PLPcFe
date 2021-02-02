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
      partField: [], // 安装产品和安装位置字段 博立定制
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
    * @description 回执自定义字段
    * 判断非自定义回执、自定义回执
    */
    fields() {
      return this.notCustom ? this.notCustomFields : this.shareData.receiptFields;
    },
    /** 
    * @description 回执详情数据
    */
    receiptData() {
      return this.initData?.receiptTaskForRead || {};
    },
    /** 
    * @description 备件、服务项目、折扣费用数据集合
    */
    expenseSheet() {
      return this.initData.receiptExpenseSheetForRead || {};
    },
    /** 
    * @description 显示合计
    */
    hasExpense() {
      let { sparepart = [], serviceIterm = [] } = this.form;

      return (sparepart && sparepart.length) || (serviceIterm && serviceIterm.length);
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
      let { state, inApprove } = this.task;

      return inApprove != 1 && this.initData.canEditTask && this.receiptConfig.editReceipt && stateArr.indexOf(state) == -1;
    },
    /** 
    * @description 支付方式
    */
    paymentMethod() {
      return this.receiptData?.attribute?.paymentMethod || this.task?.attribute?.paymentMethod || '';
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
      if (this.initData.isRepertoryDiff) return this.$platform.alert('回执备件来源与当前备件库配置不同，无法编辑回执。如需要，请回退并重新完成。');

      // 支付完成提示
      if(this.isPaySuccess) this.$platform.alert('该工单已经支付完成，备件、服务项目、折扣金额不可再编辑。');

      this.$refs.taskReceiptEdit.openDialog('edit');
    }
  },
  async mounted() {
    try {
      // 在线支付成功
      if (this.payOnlineSuccess) this.getPaymentMethodDetail();

      let { sparePartsExpense = [], serviceExpense = [], discountExpense = {} } = this.expenseSheet;
      let { attachment = [], attribute = {}, receiptContent } = this.receiptData;
      
      // 初始化默认值
      this.form = this.receiptData;
      
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
          // 计算修改后的单价
          sparePartsExpense.forEach(item => {
            let modifiedPrice = isNaN(item.modifiedPrice) ? 0 : item.modifiedPrice;
            let nowPrice = item.salePrice + modifiedPrice;
            item.salePrice = nowPrice.toFixed(2);
          })

          this.form[fieldName] = sparePartsExpense;
        }
        // 服务项目
        else if(fieldName === 'serviceIterm') {
          // 计算修改后的单价
          serviceExpense.forEach(item => {
            let modifiedPrice = isNaN(item.modifiedPrice) ? 0 : item.modifiedPrice;
            let nowPrice = item.salePrice + modifiedPrice;
            item.salePrice = nowPrice.toFixed(2);
          })

          this.form[fieldName] = serviceExpense;
        }
        // 回执内容
        else if(fieldName === 'receiptContent') {
          this.form[fieldName] = receiptContent || '';
        }

      });

      // 折扣费用
      this.form.disExpense = discountExpense?.salePrice || 0;

      // 获取是否有安装产品和安装位置 目前只有博立有数据 其它的数据为空
      const result = await TaskApi.getExpensePartField()
      if (result.code == 0) {
        this.partField = result.result || []
      }
      if (this.partField.length) {
        this.partField.forEach((part, ind) => {
          this.form.sparepart.forEach(_sparepart => {
            _sparepart.products = this.form.products
            if (part.fieldName == 'installProductId') {
              _sparepart.installProductId = _sparepart.attribute ? _sparepart.attribute.installProductId : ''
            } else if (part.fieldName == 'installPosition') {
              _sparepart.installPosition = _sparepart.attribute ? _sparepart.attribute.installPosition : ''
            }
          })
          // 更新sparepartColums
          let index = 2
          if (part.fieldName == 'installPosition') {
            index = 3
          }
          this.sparepartColums.splice(index, 0, {
            label: part.displayName,
            field: part.fieldName
          })
        })
      }
      
    } catch (e) {
      console.error('error ', e)
    }
  },
  components: {
    [ReceiptCommonTable.name]: ReceiptCommonTable,
    [TaskReceiptEditView.name]: TaskReceiptEditView
  }
}
