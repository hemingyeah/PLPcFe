<template>
  <div class="form-sparepart">
    <!-- start 添加按钮 -->
    <el-button
      class="add-sparepart-btn"
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
            <input class="sparepart-number-input" type="number" v-model="scope.row.number" @change="handleSparepartNum(scope.row)" />
          </template>
          <!-- end 数量 -->

          <!-- start 单价 -->
          <template v-else-if="column.field === 'salePrice' && editUnitPrice">
            <input class="sparepart-number-input" type="number" v-model="scope.row.salePrice" @change="handlePrice(scope.row)" />
          </template>
          <!-- end 单价 -->

          <!-- start 小计 -->
          <template v-else-if="column.field === 'total'">
            {{ (scope.row.number * scope.row.salePrice).toFixed(2) }}
          </template>
          <!-- end 小计 -->

          <!-- start 操作 -->
          <template v-else-if="column.field === 'action'">
            <el-button size="small" type="text" icon="el-icon-delete" @click="value.splice(scope.$index, 1)" />
          </template>
          <!-- end 操作 -->

          <template v-else>{{ scope.row[column.field] }}</template>
        </template>
      </el-table-column>
    </el-table>
    <!-- end 备件列表 -->

    <!-- start 添加备件弹窗 -->
    <base-modal :show.sync="visible" title="备件添加" class="form-sparepart-modal" width="700px" @closed="reset">
      <div class="base-modal-content">
        <form-builder ref="form" :fields="fields" :value="sparepart" @update="update">
          <!-- start 仓库 -->
          <template slot="repertory" slot-scope="{ field }" v-if="showRepertory">
            <form-item :label="field.displayName">
              <form-select :field="field" :source="repertoryList" :value="repertoryId" @update="updateRepertory" :clearable="false"/>
            </form-item>
          </template>
          <!-- end 仓库 -->

          <!-- start 备件 -->
          <template slot="part" slot-scope="{ field }">
            <form-item :label="field.displayName">
              <biz-form-remote-select
                :field="field"
                v-model="selectedSparepart"
                :remote-method="searchPart"
                @input="updatePart"
                placeholder="请选择">
                <div class="sparepart-template-option" slot="option" slot-scope="{ option }">
                  <h3>{{ option.name }}</h3>
                  <p>
                    <span>
                      <label>编号：</label>
                      <span>{{ option.serialNumber }}</span>
                    </span>
                    <span>
                      <label>类别：</label>
                      <span>{{ option.type }}</span>
                    </span>
                    <span>
                      <label>规格</label>
                      <span>{{ option.standard }}</span>
                    </span>
                    <span>
                      <label>库存</label>
                      <span>{{ option.availableNum }} {{option.unit}}</span>
                    </span>
                  </p>
                </div>
              </biz-form-remote-select>
            </form-item>
          </template>
          <!-- end 备件 -->

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
    <!-- end 添加备件弹窗 -->
  </div>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* mixin */
import FormMixin from '@src/component/form/mixin/form';

/* util */
import MathUtil from '@src/util/math';
import * as math from 'mathjs';

export default {
  name: 'form-sparepart',
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
      showRepertory: true,
      repertoryId: 0, // 仓库ID
      repertoryList: [], // 仓库列表数据
      selectedSparepart: [], // 当前选中的备件
      sparepart: this.initData(), // 备件信息
      config: {}, // 备件配置
      editUnitPrice: false, // 是否可以修改单品价格
    }
  },
  computed: {
    /**
    * @description 备件列表项
    */
    colums() {
      return [{
        label: '备件',
        field: 'name'
      }, {
        label: '编号',
        field: 'serialNumber'
      }, {
        label: '类别',
        field: 'type'
      }, {
        label: '规格',
        field: 'standard'
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
    * @description 备件字段
    */
    fields() {
      return [{
        formType: 'select',
        fieldName: 'repertory',
        displayName: '仓库',
        placeholder: '请选择',
        isNull: 0
      }, {
        formType: 'select',
        fieldName: 'part',
        displayName: '备件',
        placeholder: '请选择',
        isNull: 0,
      }, {
        formType: 'text',
        fieldName: 'serialNumber',
        displayName: '编号',
        isNull: 1,
        disabled: true
      }, {
        formType: 'text',
        fieldName: 'type',
        displayName: '类别',
        isNull: 1,
        disabled: true
      }, {
        formType: 'text',
        fieldName: 'standard',
        displayName: '规格',
        isNull: 1,
        disabled: true
      }, {
        formType: 'text',
        fieldName: 'salePrice',
        displayName: '单价',
        isNull: 1,
        disabled: true
      }, {
        formType: 'textarea',
        fieldName: 'description',
        displayName: '说明',
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
      let { number, salePrice } = this.sparepart;
      return number && salePrice ? (number * salePrice).toFixed(2) : '';
    }
  },
  methods: {
    /**
    * @description 初始化备件默认值
    */
    initData() {
      return {
        id: '',
        name: '',
        serialNumber: '',
        type: '',
        standard: '',
        salePrice: '',
        costPrice: '',
        number: '',
        unit: '',
        availableNum: '',
        repertoryCount: '',
        description: ''
      }
    },
    /**
    * @description 修改列表备件数量
    */
    handleSparepartNum(item) {
      const maxNum = item.repertoryCount;
      let value = Number(item.number);
      let count = this.decimalNumber(value);

      if (value <= 0) {
        this.$platform.alert('请输入正确的数量');
        item.number = 1;
        return;
      }
      
      if (maxNum != '' && value > maxNum) {
        this.$platform.alert(`库存数量为：${ maxNum}`);
        item.number = maxNum;
        return;
      }
      
      if (count != -1 && count == 0) {
        this.$platform.alert('请输入大于0的正整数');
        item.number = 1;
        return;
      }
      
      if (count != -1 && count != 0) {
        this.$platform.alert(`请输入大于0的${ count }位小数`);
        item.number = 1;
      }
    },
    /**
    * @description 修改列表备件单价
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
      this.repertoryId = this.repertoryList[0]?.value || 0;
      this.sparepart = this.initData();
      this.selectedSparepart = [];

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
      this.$set(this.sparepart, fieldName, newValue);
    },
    /**
    * @description 选择仓库
    */
    updateRepertory() {
      // 重置备件信息
      this.selectedSparepart = [];
      this.sparepart = this.initData();
    },
    /**
    * @description 搜索备件
    */
    searchPart(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {};
      pms.repertoryId = this.repertoryId || '';
      pms.with_OOS = false;
      return this.$http
        .get('/task/spare/list', pms)
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
    * @description 选择备件
    */
    updatePart(value) {
      let newValue = value[0];

      for (let key in this.sparepart) {
        if (key == 'salePrice') {
          this.sparepart.salePrice = newValue.salePrice.toFixed(2);
        } else if (key == 'number') {
          this.sparepart.number = newValue.availableNum > 1 ? 1 : newValue.availableNum;
        } else {
          this.sparepart[key] = newValue[key];
        }
      }
    },
    /**
    * @description 数量校验
    */
    validateNumber(value, field) {
      const maxNum = this.sparepart.availableNum || '';
      const val = Number(value);
      let count = this.decimalNumber(val);

      return new Promise((resolve, reject) => {
        if (val <= 0) {
          return resolve('请输入正确的数量');
        } else if(maxNum && value > maxNum){
          return resolve('库存不足，请输入正确的数量');
        } else if (count != -1 && count == 0) {
          return resolve('请输入大于0的正整数');
        } else if (count != -1 && count != 0) {
          return resolve(`请填写大于0的${ count }位小数`);
        }

        resolve(null);
      })
    },
    /**
    * @description 数量小数位
    */
    decimalNumber(num) {
      let { sparepart2, precision } = this.config;
      let count = MathUtil.decimalNumber(num);

      if(!sparepart2 && count != 0) return 0;
      if(precision >= count) return -1;
      return precision;
    },
    /**
    * @description 添加备件
    */
    async submit() {
      try {
        const validateRes = await this.$refs.form.validate();
        if (!validateRes) return;

        let sparepartObj = JSON.parse(JSON.stringify(this.sparepart));
        sparepartObj.oldPrice = sparepartObj.salePrice;

        let newValue = this.value;

        // 查找已添加的备件中是否存在该备件
        let ids = newValue.findIndex(val => val.id == sparepartObj.id);

        if (ids > -1) {
          const sum = Number(math.add(math.bignumber(newValue[ids].number), math.bignumber(sparepartObj.number)));
          newValue[ids].number = sum > sparepartObj.availableNum ? sparepartObj.availableNum : sum;

        } else {
          newValue.push(sparepartObj);
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
  async mounted() {
    this.$eventBus.$on('task_receipt_update_editPrice', this.setEditPrice);
    
    try {
      this.config = await TaskApi.getSparepartConfig();

      let { sparepart2, personalRepertory } = this.config;

      if (sparepart2) {
        if (personalRepertory) {
          this.repertoryList = [{
            text: '个人备件库',
            value: 0
          }];
        } else {
          const list = await TaskApi.getRepertoryList();
          list.length && list.map(item => {
            this.repertoryList.push({
              text: item.name,
              value: item.id
            })
          })
        }

      } else {
        // 备件1.0不显示仓库
        this.showRepertory = false;
      }

      // 设置仓库默认值
      this.repertoryId = this.repertoryList[0]?.value || 0;
      
    } catch (err) {
      console.error('err', err);
    }
  },
  beforeDestroy() {
    this.$eventBus.$off('task_receipt_update_editPrice', this.setEditPrice);
  }
}
</script>

<style lang="scss">
.form-item.err :not(.is-success){
  .form-item :not(.err) {
    input, textarea, .base-select-main-content {
      border-color: #e0e1e2 !important;
    }
  }

  .form-item.err {
    input, .base-select-main-content {
      border-color: #f56c6c !important;
    }
  }
}

.form-sparepart{
  text-align: left;

  .add-sparepart-btn {
    min-width: auto !important;
    padding: 7px 0 0 0;
  }

  .el-table {
    margin: 10px 0;

    .sparepart-number-input {
      width: 100%;
    }

    .el-icon-delete {
      font-size: 16px;
      color: $color-danger;
      font-weight: 700;
    }
  }
}

.sparepart-template-option {
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
      width: 25%;
      display: flex;
      justify-content: flex-start;
      font-size: 12px;
      color: #666666;
      padding-right: 10px;

      & > label {
        padding: 0;
        width: 40px !important;
      }
      & > span {
        @include text-ellipsis();
      }
    }
  }
}
</style>
