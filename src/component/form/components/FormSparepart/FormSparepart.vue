<template>
  <div class="form-sparepart">
    <button type="button" class="btn btn-primary base-upload-btn" @click="visible = true">添加</button>

    <el-table :data="value" border stripe>
      <el-table-column label="备件" prop="name"></el-table-column>
      <el-table-column label="编号" prop="serialNumber"></el-table-column>
      <el-table-column label="类别" prop="primaryType"></el-table-column>
      <el-table-column label="规格" prop="standard"></el-table-column>
      <el-table-column prop="number" label="数量" width="100px">
        <template slot-scope="scope">
          <input class="sparepart-number-input" type="number" v-model="scope.row.number" @change="handleSparepartNum(scope.row)" />
        </template>
      </el-table-column>

      <el-table-column label="单价" prop="salePrice" width="100px">
        <template slot-scope="scope">
          <input class="sparepart-number-input" type="number" v-model="scope.row.salePrice" />      
        </template>
      </el-table-column>

      <el-table-column label="小计" width="100px">
        <template slot-scope="scope">
          {{(scope.row.number * scope.row.salePrice).toFixed(2)}}
        </template>
      </el-table-column>
    
      <el-table-column label="操作" width="70px" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="value.splice(scope.$index, 1)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加备件弹窗 -->
    <base-modal :show.sync="visible" title="备件添加" class="form-sparepart-modal" width="700px" @closed="reset">
      <form @submit.prevent="submit">
        <form-builder :fields="fields" ref="form" :value="sparepart" @update="update">

          <!-- start 仓库 -->
          <template slot="repertory" slot-scope="{ field }">
            <form-item :label="field.displayName">
              <form-select :field="field" :source="repertoryList" :value="repertoryId" @update="updateRepertory" :clearable="false"/>
            </form-item>
          </template>
          <!-- end 仓库 -->

          <!-- start 备件 -->
          <template slot="sparepart" slot-scope="{ field }">
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

        <div class="dialog-footer" slot="footer">
          <el-button @click="visible = false">关闭</el-button>
          <el-button native-type="submit" type="primary">保存</el-button>
        </div>
      </form>
    </base-modal>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
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
      repertoryId: 0, // 仓库ID
      repertoryList: [], // 仓库列表数据
      selectedSparepart: [], // 当前选中的备件
      sparepart: this.initData() // 备件信息
    }
  },
  computed: {
    fields() {
      return [{
        formType: 'select',
        fieldName: 'repertory',
        displayName: '仓库',
        placeholder: '请选择',
        isNull: 0
      }, {
        formType: 'select',
        fieldName: 'sparepart',
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
    total() {
      let { number, salePrice } = this.sparepart;
      return number && salePrice ? (number * salePrice).toFixed(2) : '';
    }
  },
  methods: {
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
        repertoryCount: ''
      }
    },
    validateNumber(value, field){
      const maxNum = this.sparepart.availableNum || '';
      return new Promise((resolve, reject) => {
        if(maxNum && value > maxNum) {
          return resolve('库存不足，请输入正确的数量');
        } 
        resolve(null);
      })
    },
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
    updateRepertory() {
      // 重置备件信息
      this.selectedSparepart = [];
      this.sparepart = this.initData();
    },
    update({field, newValue, oldValue}) {
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      this.$set(this.sparepart, fieldName, newValue);
    },
    handleSparepartNum(item){
      const maxNum = item.repertoryCount;
      let value = Number(item.number);

      item.number = value > maxNum ? maxNum : (value <= 0 ? 1 : value);
    },
    async submit() {
      try {
        const validateRes = await this.$refs.form.validate();
        if (!validateRes) return;

        let sparepartObj = JSON.parse(JSON.stringify(this.sparepart));
        sparepartObj.outPrice = sparepartObj.costPrice;
        sparepartObj.primaryType = sparepartObj.type;
        sparepartObj.type = '备件';

        let newValue = this.value;

        // 查找已添加的备件中是否存在该备件
        let ids = newValue.findIndex(val => val.id == sparepartObj.id);

        if (ids > -1) {
          const sum = Number(newValue[ids].number) + Number(sparepartObj.number);
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
    }
  },
  async mounted(){
    try {
      const config = await TaskApi.getSparepartConfig();

      if (config.sparepart2) {
        if (config.personalRepertory) {
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
      }

      // 设置仓库默认值
      this.repertoryId = this.repertoryList[0].value;
      
    } catch (err) {
      console.log('err', err);
    }
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

.form-sparepart{
  line-height: 30px;
  text-align: left;

  .el-table {
    margin: 10px 0;

    .sparepart-number-input {
      width: 100%;
    }
  }

  .form-sparepart-modal{
    .base-modal-body{
      padding: 10px 20px 20px 10px;

      .form-builder {
        width: 100%;

        .form-item {
          label {
            width: 80px;
          }

          .form-text {
            input {
              background: #eee;
            }
          }
        }
      }

      .dialog-footer {
        text-align: right;
      }
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
