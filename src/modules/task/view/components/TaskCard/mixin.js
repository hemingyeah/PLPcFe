/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* components */
import CardEditDialog from './CardEditDialog';
import CardViewDialog from './CardViewDialog';

export default {
  props: {
    task: {
      type: Object,
      default: () => ({})
    },
    card: {
      type: Object,
      default: () => ({})
    },
    taskAllowUpdate: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      pending: false,
      cardInstance: {}, // 附加组件实例数据
      action: ''
    }
  },
  computed: {
    /**
     * @description 是否工时记录类型
     */
    isHoursRecord() {
      return this.card.specialfrom == '工时记录';
    },
    /**
     * @description 是老权限，只有两个权限，没有返回canCreate以及canDelete
     */
    isOldAuth() {
      let { canCreate, canDelete } = this.card;
      return canCreate === undefined && canDelete === undefined;
    },
    /**
     * @description 附加组件操作的前提是工单未删除且工单允许编辑
     */
    editable() {
      return this.task.isDelete == 0 && this.taskAllowUpdate;
    },
    /**
     * @description 当前工单节点的附加组件是否可以进行编辑，删除，添加操作
     */
    stateCanEdit() {
      let { state } = this.task;

      // 该附加组件设置处于某种状态下可以编辑
      let stateCanEdit = this.card.stateCanEdit;

      // 没有设置则默认可以
      if (!stateCanEdit || !stateCanEdit.length) return true;

      // 如果设置了，则判断设置的节点是否包含当前工单状态
      return stateCanEdit.indexOf(state) > -1;
    },
    /** 
    * @description 允许新增
    * 1.有新增权限 或者 老权限(无新增和删除)且有编辑权限
    * 2.附加组件设置的允许某种状态下可编辑 或 无设置
    * 3.工单未删除且允许编辑
    */
    allowCreate() {
      let { canCreate, canWrite } = this.card;
      let hasCreateAuth = canCreate || (this.isOldAuth && canWrite);

      return this.editable && hasCreateAuth && this.stateCanEdit;
    },
    /** 
    * @description 允许编辑
    * 1.有编辑权限
    * 2.附加组件设置的允许某种状态下可编辑 或 无设置
    * 3.工单未删除且允许编辑
    */
    allowEdit() {
      return this.editable && this.card.canWrite && this.stateCanEdit;
    },
    /** 
    * @description 允许删除
    * 1.有删除权限 或者 老权限(无新增和删除)且有编辑权限
    * 2.附加组件设置的允许某种状态下可编辑 或 无设置
    * 3.工单未删除且允许编辑
    */
    allowDelete() {
      let { canDelete, canWrite } = this.card;
      let hasDeleteAuth = canDelete || (this.isOldAuth && canWrite);

      return this.editable && hasDeleteAuth && this.stateCanEdit;
    }
  },
  methods: {
    /** 
    * @description 附加组件操作
    * 新增、编辑、详情、删除、位置详情
    */
    handleEvent({ action, cardInstance }) {
      this.action = action;
      this.cardInstance = { attribute: cardInstance || {} };

      if (action == 'create' || action == 'edit') {
        this.$refs.taskCardEdit.openDialog();
      } else if (action == 'delete') {
        this.deleteCard(cardInstance.id);
      } else if (action == 'view') {
        this.$refs.taskCardView.openDialog();
      } else if (action == 'location') {
        this.$refs.hoursRecordLocation.openDialog(cardInstance.id);
      }
    },
    /** 
    * @description 获取接口API
    */
    getApiMap(action) {
      let apiMap = {};

      // 若是工时记录
      if (this.isHoursRecord) {
        apiMap = {
          create: 'createHoursRecord',
          edit: 'updateHoursRecord',
          delete: 'deleteHoursRecord'
        }
      } else {
        apiMap = {
          create: 'taskCreateCard',
          edit: 'taskEditCard',
          delete: 'taskDeleteCard'
        }
      }

      return apiMap[action];
    },
    /**
    * @description 将附加组件数据打包成服务器可接收的数据
    */
    pack(form) {
      let { cardId, inputType } = this.card;

      let data = {
        taskId: this.task.id,
        attribute: {},
        cardId,
        inputType
      }

      if (this.action == 'edit') data.attribute.id = form.id;
      
      this.card.fields.forEach(field => {
        data.attribute[field.fieldName] = form[field.fieldName];
      })

      return data;
    },
    /**
    * @description 将工时记录数据打包成服务器可接收的数据
    */
    packSpecial(form) {
      let data = {};

      if (this.action == 'edit') {
        data.id = form.id;
      } else {
        data.cardId = this.card.cardId;
        data.orderId = this.task.id;
        data.recordFromType = 1;
      }
      
      this.formFields.forEach(field => {
        if (field.formType === 'attachment') {
          data[field.fieldName] = JSON.stringify(form[field.fieldName] || '[]');
        } else {
          data[field.fieldName] = form[field.fieldName];
        }
      })

      return data;
    },
    /** 
    * @description 新增、编辑附加组件
    */
    submit(form) {
      if (this.pending) return;
      this.pending = true;

      const API = this.getApiMap(this.action);
      const params = this.isHoursRecord ? this.packSpecial(form) : this.pack(form);

      TaskApi[API](params).then(res => {
        if (res.success) {
          this.$platform.alert('保存成功');
          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },
    /** 
    * @description 删除附加组件
    */
    async deleteCard(infoId) {
      const API = this.getApiMap('delete');

      try {
        let result = await this.$platform.confirm('确定要删除这条数据吗？\n' + '删除后数据不可恢复');
        if (!result) return;
        
        let params = {};

        // 工时记录
        if (this.isHoursRecord) {
          params = { mainId: infoId };
        } else {
          params = {
            taskId: this.task.id,
            cardId: this.card.cardId,
            infoId
          }
        }

        TaskApi[API](params).then(res => {
          if (res.success) {
            this.$platform.alert('删除成功');
            window.location.reload();
          } else {
            this.$platform.alert(res.message);
          }
        }).catch(err => console.error(err))
      } catch(err) {
        console.error(err)
      }
    }
  },
  components: {
    [CardEditDialog.name]: CardEditDialog,
    [CardViewDialog.name]: CardViewDialog
  }
}
