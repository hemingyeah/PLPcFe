<template>
  <div class="form-sparepart">
    <!-- start 添加按钮 -->
    <el-button
      class="add-sparepart-btn"
      type="text"
      size="medium"
      v-if="!isPaySuccess"
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
        :min-width="column.minWidth || '108px'"
      >
        <template slot-scope="scope">
          <!-- start 数量 -->
          <template v-if="column.field === 'number' && !isPaySuccess">
            <input class="sparepart-number-input" type="number" v-model="scope.row.number" @change="handleSparepartNum(scope.row)" />
          </template>
          <!-- end 数量 -->

          <!-- start 单价 -->
          <template v-else-if="column.field === 'salePrice' && allowEditPrice">
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

          <!-- start 安装产品id获取安装产品名称 -->
          <template v-else-if="column.field === 'installProductId'">
            {{ getProductName(scope.row[column.field]) }}
          </template>
          <!-- end  安装产品id获取安装产品名称 -->

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
              <form-select :field="field" :source="repertoryList" v-model="repertoryId" @update="updateRepertory" :clearable="false"/>
            </form-item>
          </template>
          <!-- end 仓库 -->

          <!-- start 安装产品 只有一个产品默认选中-->
          <template v-if="partField.length && products.length == 1">
            <template slot="installProductId" slot-scope="{ field }" >
              <form-item :label="field.displayName">
                <form-select :field="field" v-model="installProductId" />
              </form-item>
            </template>
          </template>
          
          <!-- end 安装产品 -->

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
import _ from 'lodash';

export default {
  name: 'form-sparepart',
  mixins: [FormMixin],
  inject: ['initData'],
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
      partField: [],
      installProductId: '',
      products: this.initData.task.products,
      originValue: [],
      visible: false,
      showRepertory: true,
      repertoryId: 0, // 仓库ID
      repertoryList: [], // 仓库列表数据
      selectedSparepart: [], // 当前选中的备件
      sparepart: this._initData(), // 备件信息
      config: {}, // 备件配置
      editUnitPrice: false, // 是否可以修改单品价格
      isPaySuccess: false // 是否支付成功
    }
  },
  computed: {
    /**
    * @description 备件列表项
    */
    colums() {
      let colums = [{
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
      }, {
        label: '单价',
        field: 'salePrice',
      }, {
        label: '小计',
        field: 'total',
      }]

      // 支付成功前可编辑
      if (!this.isPaySuccess) {
        colums.push({
          label: '操作',
          field: 'action',
          minWidth: '70px'
        })
      }
      
      // 增加安装产品和安装位置
      this.partField.forEach((_part, _ind) => {
        colums.splice(_ind + 1, 0, {
          label: _part.displayName,
          field: _part.fieldName
        })
      })
      return colums;
    },
    /**
    * @description 备件字段
    */
    fields() {
      let fields = [{
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

      // 增加安装产品和安装位置
      this.partField.forEach((_part, _ind) => {
        fields.splice(_ind + 2, 0, _part)
      })
      return fields
    },
    /**
    * @description 小计
    */
    total() {
      let { number, salePrice } = this.sparepart;
      return number && salePrice ? (number * salePrice).toFixed(2) : '';
    },
    /**
    * @description 允许修改单价
    */
    allowEditPrice() {
      return this.editUnitPrice && !this.isPaySuccess;
    }
  },
  watch: {
    visible(n) {
      this.chooseDefaultProduct()
    }
  },
  methods: {
    // 根据产品id获取产品名称
    getProductName(id) {
      let name = ''
      this.products.forEach(product => {
        if (id == product.id) {
          name = product.name
        }
      })
      return name
    },
    // 只有一个产品时默认选中
    chooseDefaultProduct() {
      if (this.partField.length && this.products.length && this.products.length == 1) {
        this.installProductId = this.products[0].id
        this.$set(this.sparepart, 'installProductId', this.installProductId)
      }
    },
    /**
    * @description 初始化备件默认值
    */
    _initData() {
      let _initData = {
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
      // 安装产品和安装位置有数据时 增加这两个字段
      if (this.value && this.value.length) {
        this.value.forEach(val => {
          for (let v in val) {
            if (v == 'installProductId') {
              _initData.installProductId = ''
            } else if (v == 'installPosition') {
              _initData.installPosition = ''
            }
          }
        })
      }
      return _initData
    },
    /**
    * @description 修改列表备件数量
    */
    handleSparepartNum(item) {
      let maxNum = item.repertoryCount || 0;
      // 如果有自定义字段 maxNum为库存减去列表其它num
      if (this.partField.length) {
        if (!item.isAdd) {
          // 如果该备件没有做标记则做标记
          item.isAdd = true
        }
        this.value.forEach((val, ind) => {
          // id相同时说明是同一个备件 只是自定义选择的不一样
          if (item.id == val.id && val.isAdd) {
            let index = -1
            const attribute1 = item.attribute || {}
            const attribute2 = val.attribute || {}
            if (_.isEqual(attribute1, attribute2)) {
              index = ind
            }
            console.log(index, this.originValue, this.value, 'originValue 调试123')
            // originValue存在 说明是备件列表已存在的备件 库存变动为number减去originValue.number
            let num = val.number
            if (index > -1 && this.originValue[index]) num = this.originValue[index].number
            maxNum -= num
          }
        })
        maxNum < 0 ? maxNum = 0 : ''
        // 当前备件最大的库存应为库存减去所有同一个id的备件库存再加上当前备件的数量
        maxNum += item.number
      }
      let value = Number(item.number);
      let count = this.decimalNumber(value);

      if (value <= 0) {
        this.$platform.alert('请输入正确的数量');
        item.number = 1;
        return;
      }
      
      if (value > maxNum) {
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
      this.sparepart = this._initData();
      this.selectedSparepart = [];
      this.installProductId = ''

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
      this.sparepart = this._initData();
      this.chooseDefaultProduct()
    },
    /**
    * @description 搜索备件
    */
    searchPart(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {};
      pms.repertoryId = this.repertoryId || '';
      pms.with_OOS = false;
      pms.keyWord = pms.keyword;
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
      this.chooseDefaultProduct()
    },
    /**
    * @description 数量校验
    */
    validateNumber(value, field) {
      let maxNum = this.sparepart.availableNum || 0;
      // 如果有自定义字段 maxNum为库存减去列表其它num
      if (this.partField.length) {
        maxNum = this.sparepart.repertoryCount || 0;
        this.value.forEach((val, ind) => {
          // id相同时说明是同一个备件 只是自定义选择的不一样
          if (this.sparepart.id == val.id && val.isAdd) {
            let index = -1
            const attribute1 = this.sparepart.attribute || {}
            const attribute2 = val.attribute || {}
            if (_.isEqual(attribute1, attribute2)) {
              index = ind
            }
            console.log(index, this.originValue, this.value, 'originValue 调试123')
            // originValue存在 说明是备件列表已存在的备件 库存变动为number减去originValue.number
            let num = val.number
            if (index > -1 && this.originValue[index]) num = val.number - this.originValue[index].number
            maxNum -= num
          }
        })
        maxNum < 0 ? maxNum = 0 : ''
      }
      const val = Number(value);
      let count = this.decimalNumber(val);

      return new Promise((resolve, reject) => {
        if (val <= 0) {
          return resolve('请输入正确的数量');
        } else if(val > maxNum){
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
        let ids = ''
        if (this.partField.length) {
          // 如果有自定义字段 安装产品和安装位置 还需要判断安装产品和安装位置是否相等
          sparepartObj.attribute = {
            installPosition: this.sparepart.installPosition,
            installProductId: this.sparepart.installProductId
          }
          // 加入进来的新增isAdd字段 避免编辑回执时计算备件availableNum出错
          sparepartObj.isAdd = true
          ids = newValue.findIndex(val => val.id == sparepartObj.id && _.isEqual(val.attribute, sparepartObj.attribute));
          
        } else {
          ids = newValue.findIndex(val => val.id == sparepartObj.id);
        }

        if (ids > -1) {
          const sum = Number(math.add(math.bignumber(newValue[ids].number), math.bignumber(sparepartObj.number)));
          newValue[ids].number = sum > sparepartObj.availableNum ? sparepartObj.availableNum : sum;

          if (this.partField.length) {
            newValue[ids].number = sum
          }
        } else {
          newValue.push(sparepartObj);
        }

        this.$emit('update', {field: this.field, newValue});

        this.visible = false;

      } catch (e) {
        console.error('err', e);
      }
    },
    setEditConfig(config) {
      let { editUnitPrice, isPaySuccess } = config || {};

      this.editUnitPrice = editUnitPrice;
      this.isPaySuccess = isPaySuccess;
    }
  },
  async mounted() {
    this.$eventBus.$on('task_receipt_update_config', this.setEditConfig);
    
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
      
      // 获取是否有安装产品和安装位置 目前只有博立有数据 其它的数据为空
      const result = await TaskApi.getExpensePartField()
      if (result.code == 0) {
        result.result.forEach((res, ind) => {
          if (res.fieldName == 'installProductId') {
            // 设置安装产品的下拉数据
            let _res = Object.assign({}, res)
            let products = this.products
            products.forEach(product => {
              product.text = product.name
              product.value = product.id
            })
            _res.setting = {
              isMulti: false,
              dataSource: products
            }
            result.result.splice(ind, 1, _res)
          } else if (res.fieldName == 'installPosition') {
            // 设置安装位置的下拉数据
            let dataSource = res.setting.dataSource
            let _res = Object.assign({}, res)
            _res.setting = {
              isMulti: res.setting.isMulti,
              dataSource: []
            }
            dataSource.forEach(s => {
              _res.setting.dataSource.push({
                text: s,
                value: s
              })
            })
            result.result.splice(ind, 1, _res)
          }
        })
        this.partField = result.result || []
        if (this.value && this.value.length) {
          this.originValue = _.cloneDeep(this.value)
          console.log(this.originValue, 'originValue断点')
        }
      }
    } catch (err) {
      console.error('err', err);
    }
  },
  beforeDestroy() {
    this.$eventBus.$off('task_receipt_update_config', this.setEditConfig);
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
