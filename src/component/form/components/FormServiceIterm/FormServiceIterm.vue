<template>
  <div class="form-serviceterm">
    <!-- start 添加按钮 -->
    <el-button
      class="add-serviceterm-btn"
      type="text"
      size="medium"
      @click="visible = true"
    >添加</el-button>
    <!-- end 添加按钮 -->

    <!-- start 备件列表 -->
    <el-table
      v-if="value.length"
      header-row-class-name="base-table-header-v3"
      row-class-name="base-table-row-v3"
      :data="value"
      border>
      <el-table-column
        v-for="(column, index) in colums"
        :key="`${column.field}_${index}`"
        :label="column.label"
        :prop="column.field"
        show-overflow-tooltip
        :min-width="column.minWidth || '148px'">
        <template slot-scope="scope">
          <!-- start 数量 -->
          <template v-if="column.field === 'number'">
            <input class="service-number-input" type="number" v-model="scope.row.number" @change="handleServiceItermNum(scope.row)" />
          </template>
          <!-- end 数量 -->

          <!-- start 单价 -->
          <template v-else-if="column.field === 'salePrice' && editUnitPrice">
            <input class="service-number-input" type="number" v-model="scope.row.salePrice" @change="handlePrice(scope.row)" />
          </template>
          <!-- end 单价 -->

          <!-- start 小计 -->
          <template v-else-if="column.field === 'total'">
            {{ (scope.row.number * scope.row.salePrice).toFixed(2) }}
          </template>
          <!-- end 小计 -->

          <!-- start 操作 -->
          <template v-else-if="column.field === 'action'">
            <el-button size="small" type="text" icon="el-icon-delete" @click="value.splice(scope.$index, 1)"/>
          </template>
          <!-- end 操作 -->

          <template v-else>{{ scope.row[column.field] }}</template>
        </template>
      </el-table-column>
    </el-table>
    <!-- end 备件列表 -->

    <!-- 添加服务项目弹窗 -->
    <base-modal :show.sync="visible" title="服务项目添加" class="form-serviceterm-modal" width="700px" @closed="reset">
      <div class="base-modal-content">
        <form-builder :fields="fields" ref="form" :value="serviceitem" @update="update">
          <!-- start 服务项目名称 -->
          <template slot="service" slot-scope="{ field }">
            <form-item :label="field.displayName">
              <biz-form-remote-select
                :field="field"
                v-model="selectedItem"
                :remote-method="searchServiceItem"
                @input="updateServiceItem"
                placeholder="请选择">
                <div class="service-template-option" slot="option" slot-scope="{ option }">
                  <h3>{{ option.name }}</h3>
                  <p>
                    <span>
                      <label>编号：</label>
                      <span>{{ option.serialNumber }}</span>
                    </span>
                    <span>
                      <label>单位：</label>
                      <span>{{option.unit}}</span>
                    </span>
                    <span>
                      <label>服务类型：</label>
                      <span>{{ option.type }}</span>
                    </span>
                  </p>
                </div>
              </biz-form-remote-select>
            </form-item>
          </template>
          <!-- end 服务项目名称 -->

          <!-- start 数量 -->
          <template slot="number" slot-scope="{ field, value }">
            <form-item :label="field.displayName" :validation="validateNumber">
              <form-number :field="field" :value="value" @update="update" />
            </form-item>
          </template>
          <!-- end 数量 -->

          <!-- start 小计 -->
          <template slot="total" slot-scope="{ field }">
            <form-item :label="field.displayName">
              <form-text :field="field" :value="total" />
            </form-item>
          </template>
          <!-- end 小计 -->
        </form-builder>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="submit">保 存</el-button>
      </div>
    </base-modal>
  </div>
</template>

<script>
/* mixin */
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-serviceterm',
  mixins: [FormMixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Array,
      default: () => ([])
    },
  },
  data() {
    return {
      visible: false,
      selectedItem: [], // 当前选中的服务项目
      serviceitem: this.initData(), // 服务项目信息
      editUnitPrice: false, // 是否可以修改单品价格
    }
  },
  computed: {
    /**
    * @description 服务项目列表项
    */
    colums() {
      return [{
        label: '服务项目',
        field: 'name'
      }, {
        label: '编号',
        field: 'serialNumber'
      }, {
        label: '类别',
        field: 'type'
      }, {
        label: '数量',
        field: 'number',
        minWidth: '100px'
      }, {
        label: '单价',
        field: 'salePrice',
        minWidth: '100px'
      }, {
        label: '小计',
        field: 'total',
        minWidth: '128px'
      }, {
        label: '操作',
        field: 'action',
        minWidth: '70px'
      }]
    },
    /**
    * @description 服务项目字段
    */
    fields() {
      return [{
        formType: 'select',
        fieldName: 'service',
        displayName: '服务项目名称',
        placeholder: '请选择',
        isNull: 0,
      }, {
        formType: 'text',
        fieldName: 'serialNumber',
        displayName: '服务项目编号',
        isNull: 1,
        disabled: true
      }, {
        formType: 'text',
        fieldName: 'type',
        displayName: '类别',
        placeholder: ' ',
        isNull: 1,
        disabled: true
      }, {
        formType: 'text',
        fieldName: 'salePrice',
        displayName: '单价',
        isNull: 1,
        disabled: true
      }, {
        formType: 'number',
        fieldName: 'number',
        displayName: '数量',
        isNull: 0,
      }, {
        formType: 'text',
        fieldName: 'total',
        displayName: '小计',
        isNull: 1,
        disabled: true
      }]
    },
    /**
    * @description 小计
    */
    total() {
      let { number, salePrice } = this.serviceitem;
      return number && salePrice ? (number * salePrice).toFixed(2) : '';
    }
  },
  methods: {
    /**
    * @description 初始化服务项目默认值
    */
    initData() {
      return {
        id: '',
        name: '',
        serialNumber: '',
        type: '',
        salePrice: '',
        costPrice: '',
        number: '',
        unit: ''
      }
    },
    /**
    * @description 修改列表服务项目数量
    */
    handleServiceItermNum(item) {
      let value = Number(item.number);

      if (value <= 0) {
        this.$platform.alert('请输入正确的数量');
        item.number = 1;
        return;
      }

      item.number = value <= 1 ? 1 : Math.floor(value);
    },
    /**
    * @description 修改列表服务项目单价
    */
    handlePrice(item) {
      let value = Number(item.salePrice);
      
      if(value < 0){
        this.$platform.alert('请输入不小于0的数值');
        item.salePrice = item.oldPrice ? item.oldPrice : 0;
      }
    },
    /**
    * @description 弹窗关闭重置数据
    */
    reset() {
      this.serviceitem = this.initData();
      this.selectedItem = [];

      // 清空校验结果
      setTimeout(() => {
        this.$refs.form.$children.map(child => {
          if (child.$el.className == 'form-item err') {
            child.$el.dispatchEvent(new CustomEvent('form.clear.validate', {bubbles: false}));
          }
        })
      }, 0);
    },
    /**
    * @description 更新表单数据
    */
    update({field, newValue, oldValue}) {
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      this.$set(this.serviceitem, fieldName, newValue);
    },
    /**
    * @description 搜索服务项目
    */
    searchServiceItem(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {}
      return this.$http
        .get('/task/service/list', pms)
        .then(res => {
          if (!res || !res.list) return;   
          res.list = res.list.map(template =>
            Object.freeze({
              label: template.name,
              value: template.id,
              ...template
            })
          )     
          return res;
        })
        .catch(e => console.error(e));
    },
    /**
    * @description 选择服务项目
    */
    updateServiceItem(value) {
      let newValue = value[0];

      for (let key in this.serviceitem) {
        if (key == 'salePrice') {
          this.serviceitem.salePrice = newValue.salePrice.toFixed(2);
        } else if (key == 'number') {
          this.serviceitem.number = 1;
        } else {
          this.serviceitem[key] = newValue[key];
        }
      }
    },
    /**
    * @description 数量校验
    */
    validateNumber(value, field){
      return new Promise((resolve, reject) => {
        if(!/^[1-9]\d*$/.test(value)) {
          return resolve('请输入正整数');
        } 
        resolve(null);
      })
    },
    /**
    * @description 添加服务项目
    */
    async submit() {
      try {
        const validateRes = await this.$refs.form.validate();
        if (!validateRes) return;

        let serviceObj = JSON.parse(JSON.stringify(this.serviceitem));
        serviceObj.oldPrice = serviceObj.salePrice;

        let newValue = this.value;

        // 查找已添加的服务项目中是否存在该服务项目
        let ids = newValue.findIndex(val => val.id == serviceObj.id);

        if (ids > -1) {
          newValue[ids].number = Number(newValue[ids].number) + Number(serviceObj.number);
        } else {
          newValue.push(serviceObj);
        }

        this.$emit('update', {field: this.field, newValue});

        this.visible = false;

      } catch (e) {
        console.error('err', e);
      }
    },
    setEditPrice(config) {
      let { editUnitPrice } = config?.options || {};

      this.editUnitPrice = editUnitPrice;
    }
  },
  mounted() {
    this.$eventBus.$on('task_receipt_update_editPrice', this.setEditPrice);
  },
  beforeDestroy() {
    this.$eventBus.$off('task_receipt_update_editPrice', this.setEditPrice);
  }
}
</script>

<style lang="scss">
.form-item.err :not(.is-success){
  .form-item :not(.err) {
    input, .base-select-main-content {
      border-color: #e0e1e2 !important;
    }
  }

  .form-item.err {
    input, .base-select-main-content {
      border-color: #f56c6c !important;
    }
  }
}

.form-serviceterm {
  text-align: left;

  .add-serviceterm-btn {
    min-width: auto !important;
    padding: 7px 0 0 0;
  }

  .el-table {
    margin: 10px 0;

    .service-number-input {
      width: 100%;
    }

    .el-icon-delete {
      font-size: 16px;
      color: $color-danger;
      font-weight: 700;
    }
  }
}

.service-template-option {
  * {
    margin: 0;
  }
  padding: 10px 0;
  h3 {
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
  }

  p {
    display: flex;
    justify-content: space-between;
    line-height: 24px;

    & > span {
      width: 50%;
      display: flex;
      justify-content: flex-start;
      font-size: 12px;
      color: #666666;
      padding-right: 10px;

      & > label {
        padding: 0;
        width: auto !important;
      }
      & > span {
        @include text-ellipsis();
      }
    }
  }
}
</style>
