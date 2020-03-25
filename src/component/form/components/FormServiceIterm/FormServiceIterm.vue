<template>
  <div class="form-serviceterm">
    <button type="button" class="btn btn-primary base-upload-btn" @click="openDialog">添加</button>

    <el-table :data="value[field.fieldName]" border stripe>
      <el-table-column label="服务项目" prop="name"></el-table-column>
      <el-table-column label="编号" prop="serialNumber"></el-table-column>
      <el-table-column label="类别" prop="primaryType"></el-table-column>
      
      <el-table-column prop="number" label="数量" width="100px">
        <template slot-scope="scope">
          <input class="service-number-input" type="number" v-model="scope.row.number" @change="handleServiceItermNum(scope.row)" />
        </template>
      </el-table-column>

      <el-table-column label="单价" prop="salePrice" width="100px">
        <template slot-scope="scope">
          <input class="service-number-input" type="number" v-model="scope.row.salePrice" />           
        </template>
      </el-table-column>

      <el-table-column label="小计" width="100px">
        <template slot-scope="scope">
          {{(Number(scope.row.number) * Number(scope.row.salePrice)).toFixed(2)}}
        </template>
      </el-table-column>
    
      <el-table-column label="操作" width="70px" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="value.serviceIterm.splice(scope.$index, 1)"/>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加服务项目弹窗 -->
    <base-modal :show.sync="visible" title="服务项目添加" class="form-serviceterm-modal" width="700px" @closed="reset">
      <form @submit.prevent="submit" v-if="init">
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

        <div class="dialog-footer" slot="footer">
          <el-button @click="visible = false">关闭</el-button>
          <el-button native-type="submit" type="primary">保存</el-button>
        </div>
      </form> 
    </base-modal>
  </div>
</template>

<script>
export default {
  name: 'form-serviceterm',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      init: false,
      visible: false,
      selectedItem: [],
      serviceitem: this.initData()
    }
  },
  computed: {
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
    total() {
      let { number, salePrice } = this.serviceitem;
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
        salePrice: '',
        costPrice: '',
        number: '',
        unit: ''
      }
    },
    validateNumber(value, field){
      return new Promise((resolve, reject) => {
        if(!/^[1-9]\d*$/.test(value)) {
          return resolve('请输入正整数');
        } 
        resolve(null);
      })
    },
    searchServiceItem(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {}
      return this.$http
        .post('/task/service/list', pms)
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
    update({field, newValue, oldValue}) {
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      this.$set(this.serviceitem, fieldName, newValue);
    },
    handleServiceItermNum(item) {
      let value = Number(item.number);

      item.number = value <= 1 ? 1 : Math.floor(value);
    },
    async submit() {
      const { fieldName } = this.field;

      try {
        const validateRes = await this.$refs.form.validate();
        if (!validateRes) return;

        let serviceObj = JSON.parse(JSON.stringify(this.serviceitem));
        serviceObj.outPrice = serviceObj.costPrice;
        serviceObj.primaryType = serviceObj.type;
        serviceObj.primaryId = serviceObj.id;
        serviceObj.type = '服务';
        serviceObj.taskId = this.value.id;
        delete serviceObj.costPrice;

        let newValue = this.value[fieldName] || [];

        // 查找已添加的服务项目中是否存在该服务项目
        let ids = newValue.findIndex(val => val.primaryId == serviceObj.id);

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
    reset() {
      this.serviceitem = this.initData();
      this.selectedItem = [];
      this.init = false;
    },
    openDialog() {
      this.init = true;
      this.visible = true;
    }
  }
}
</script>

<style lang="scss">
.form-serviceterm {
  line-height: 30px;
  text-align: left;

  .el-table {
    margin: 10px 0;

    .service-number-input {
      width: 100%;
    }
  }

  .form-serviceterm-modal {
    .base-modal-body{
      padding: 10px 20px 20px 10px;
    
      .form-builder {
        width: 100%;

        .form-item {
          label {
            width: 110px;
          }

          .form-text {
            input {
              background: #eee;
            }
          }
        }
      }
    }

    .dialog-footer {
      text-align: right;
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
