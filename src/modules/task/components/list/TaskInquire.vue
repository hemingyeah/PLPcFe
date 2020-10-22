<template>
  <div v-if="fields.length">
    <div v-for="(item, index) in list" :key="index">
      <batch-form
        :fields="fields"
        :column-num="columnNum"
        :list="list"
        :index="index"
        ref="batchForm"
        @add="add"
        @del="del"
        @setting="setting"
        :item="item"
        :search-model="searchModel"
        :search-model-cn="searchModelCN"
      />
    </div>
    <div
      class="task-font14 task-c2 task-mt15 task-pointer"
      @click="create"
    >
      设为常用搜索字段
    </div>
  </div>
</template>

<script>
import {
  FormFieldMap,
  SettingComponents,
} from '@src/component/form/components';
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
import * as CustomerApi from '@src/api/CustomerApi';

/* utils */
import _ from 'lodash';
import * as Utils from '@src/component/form/util';

import SearchProductSelect from './SearchProductSelect.vue';
import SearchCustomerSelect from './SearchCustomerSelect.vue';

// const TaskInquireFiltersFieldNames = ["cusAddress", "area", "tags"];
const OperatorSelectOptionsMap = {
  input: [
    { label: '包含', value: 'like' },
    { label: '等于', value: 'eq' },
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'ge' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'le' },
  ],
  text: [
    { label: '包含', value: 'like' },
    { label: '等于', value: 'eq' },
  ],
  date: [{ label: '介于', value: 'between' }],
  select: [{ label: '等于', value: 'eq' }],
  cascader: [{ label: '包含', value: 'cascader' }],
  many: [{ label: '包含', value: 'contain' }],
};

function setFieldOperateHandler(field = {}) {
  let { fieldName, formType, setting } = field;

  if (formType == 'number') {
    field.operatorOptions = OperatorSelectOptionsMap.input.slice();
  } else if (fieldName == 'customer' || fieldName == 'product') {
    field.operatorOptions = OperatorSelectOptionsMap.select.slice();
  } else if (
    formType == 'text'
    || formType == 'textarea'
    || formType === 'code'
    || formType === 'description'
  ) {
    field.operatorOptions = OperatorSelectOptionsMap.text.slice();
  } else if (formType == 'date' || formType == 'datetime') {
    field.operatorOptions = OperatorSelectOptionsMap.date.slice();
  } else if (formType == 'select' && !setting.isMult) {
    field.operatorOptions = OperatorSelectOptionsMap.select.slice();
  } else if (formType == 'select' && setting.isMult) {
    field.operatorOptions = OperatorSelectOptionsMap.many.slice();
  } else if (formType === 'cascader') {
    field.operatorOptions = OperatorSelectOptionsMap.cascader.slice();
  } else {
    field.operatorOptions = OperatorSelectOptionsMap.select.slice();
  }

  field.operatorValue = field.operatorOptions[0].value;
}

export default {
  name: 'task-inquire',
  props: {
    searchModel: {
      type: Object,
      default: () => ({}),
    },
    searchModelCN: {
      type: Array,
      default: () => [],
    },
    config: {
      type: Array,
      default: () => ({}),
    },
    columnNum: {
      type: Number,
      default: 1,
    },
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      list: [1],
      check_list: [],
      checkSystemList: [], // 系统
      checkCustomizeList: [], // 自定义
      check_system_list: [],
      check_customize_list: [],
    };
  },
  watch: {
    config() {
      this.fields;
    },
    searchModelCN(v) {
      if (v.length) {
        this.list = v.map((item, index) => {
          return index + 1;
        });
      } else {
        this.list = [1];
      }
    },
  },
  computed: {
    fields() {
      let f = {};
      let fields = [...this.config].map((field) => {
        f = _.cloneDeep(field);

        let formType = f.formType;

        if (formType === 'datetime') {
          formType = 'date';
        }

        if (formType === 'updateTime') {
          f.displayName = '更新时间';
        }

        setFieldOperateHandler(f);

        return {
          ...f,
          isNull: 1,
          formType,
          originalFormType: f.formType,
          operator: this.matchOperator(f),
        };
      });
      return fields;
    },
  },
  methods: {
    // 高级搜索选中的值
    returnData() {
      let data = {};
      if (!this.$refs.batchForm) return {}
      this.$refs.batchForm.forEach((item) => {
        for (let key in item.returnDatas()) {
          if (item.returnDatas()[key]) {
            data[key] = item.returnDatas()[key];
          } else if (key === 'tags' && item.returnDatas()[key].length) {
            data[key] = item.returnDatas()[key];
          } else {
            data[key] = item.returnDatas()[key];
          }
        }
      });
      return data;
    },
    returnInquireFields() {
      let inquireFields = [];

      if (!this.$refs.batchForm) return []
      this.$refs.batchForm.forEach((batchFormEl) => {
        inquireFields.push(batchFormEl.selectedField);
      });

      return inquireFields;
    },
    // 设置为常用
    create() {
      const { check_system_list, check_customize_list, check_list } = this;
      this.$emit('setting', {
        list: check_list,
        check_system_list,
        check_customize_list,
      });
      this.list = [1]
    },
    matchOperator(field) {
      let formType = field.formType;
      let operator = '';

      switch (formType) {
      case 'date': {
        operator = 'between';
        break;
      }
      case 'datetime': {
        operator = 'between';
        break;
      }
      case 'select': {
        if (field.setting && field.setting.isMulti) {
          operator = 'contain';
        } else {
          operator = 'eq';
        }
        break;
      }
      case 'user': {
        operator = 'user';
        break;
      }
      case 'address': {
        operator = 'address';
        break;
      }
      case 'cascader': {
        operator = 'cascader';
        break;
      }
      case 'location': {
        operator = 'location';
        break;
      }
      default: {
        operator = 'like';
        break;
      }
      }
      return operator;
    },
    // 添加
    add() {
      this.list.push(1);
    },
    // 删除
    del({ index, v }) {
      this.checkSystemList = [];
      this.checkCustomizeList = [];
      this.check_list = this.check_list.filter((val, i) => {
        return val !== v.displayName;
      });

      this.fields
        .filter((item, index) => {
          let bool = this.check_list.some((v) => {
            return item.displayName === v;
          });
          return bool;
        })
        .forEach((item) => {
          if (item.isSystem) {
            this.checkSystemList.push(item.displayName);
          } else {
            this.checkCustomizeList.push(item.displayName);
          }
        });

      console.log(this.checkSystemList)
      this.check_system_list = new Set(this.checkSystemList);
      this.check_customize_list = new Set(this.checkCustomizeList);
      this.list = this.list.map((v, i) => {
        if (index === i) {
          v = '';
        }
        return v;
      });
    },
    // 获取选中的类型
    setting({ item, index }) {
      // type 0 = 初始化 1筛选
      if (item.isSystem) {
        this.checkSystemList = this.checkSystemList.map((v, i) => {
          if (index === i) {
            v = item.displayName;
          }
          return v;
        });
        if (
          this.checkSystemList.every((v, i) => {
            return index !== i;
          })
        ) {
          this.checkSystemList.push(item.displayName);
        }
      } else {
        this.checkCustomizeList = this.checkCustomizeList.map((v, i) => {
          if (index === i) {
            v = item.displayName;
          }
          return v;
        });
        if (
          this.checkCustomizeList.every((v, i) => {
            return index !== i;
          })
        ) {
          this.checkCustomizeList.push(item.displayName);
        }
      }
      this.check_system_list = new Set(this.checkSystemList);
      this.check_customize_list = new Set(this.checkCustomizeList);
      this.check_list = [
        ...this.check_system_list,
        ...this.check_customize_list,
      ];
    },
    initFormVal() {
      if (!this.$refs.batchForm) return
      this.$refs.batchForm.forEach((el) => {
        el.buildForm();
      });
    },
  },
  components: {
    BatchForm: {
      name: 'batch-form',
      props: {
        searchModel: {
          type: Object,
          default: () => ({}),
        },
        searchModelCN: {
          type: Array,
          default: () => [],
        },
        fields: {
          type: Array,
          default: () => [],
        },
        list: {
          type: Array,
          default: [],
        },
        index: {
          type: Number,
          default: 0,
        },
        columnNum: {
          type: Number,
          default: 1,
        },
        item: {
          type: Number | String,
          default: '',
        },
      },
      data: () => {
        return {
          selectedField: {},
          customer: {},
          form: {},
          product: {},
        };
      },
      watch: {
        fields(v) {
          if (v.length === Number(localStorage.getItem('fieldNum'))) return;
          this.reset();
          this.buildForm();
        },
        searchModelCN(v) {
          if (JSON.stringify(this.searchModel) !== '{}') {
            this._inPar(this.searchModel);
          }
        },
      },
      mounted() {
        localStorage.setItem('fieldNum', this.fields.length);
        this.reset();
        this.buildForm();
      },
      methods: {
        _inPar(searchParams) {
          let inPar = []; // 初始化的参数
          for (let key in searchParams) {
            if (
              JSON.stringify(searchParams[key]) !== '[]'
              && searchParams[key]
              && key !== 'pageSize'
              && key !== 'page'
              && key !== 'pageNum'
              && key !== 'stateList'
              && key !== 'whoseInfo'
              && key !== 'isPermission'
              && key !== 'distance'
              && key !== 'orderDetail'
              && key !== 'sortBy'
            ) {
              inPar.push({ key, value: searchParams[key] });
            }
          }
          console.log(inPar);
          inPar.forEach((item) => {
            if (item.key === 'customerId') {
              this.form['customer'] = item.value;
              this.customer['id'] = item.value;
            }
          });
          this.searchModelCN.forEach((item) => {
            if (item.key === '客户') {
              this.customer['name'] = item.value;
            }
          });
        },
        returnDatas() {
          let data = Object.assign({}, this.form);
          data.backUp = {
            customer: this.customer,
            product: this.product,
          };
          return data;
        },
        reset() {
          this.form = {};
          this.selectField(this.fields[0].fieldName);
        },
        buildForm() {
          if (Object.keys(this.form).length === this.fields.length) return;
          // this.form = Utils.initialize(this.fields);

          this.fields.forEach((f) => {
            if (f.fieldName === 'tags' && f.formType === 'select') {
              this.form[f.fieldName] = [];
            }
          });
        },
        searchCustomer(params) {
          const pms = params || {};

          return CustomerApi.getCustomerListAsyn(pms)
            .then((res) => {
              if (!res || !res.list) return;

              res.list = res.list.map((custoner) =>
                Object.freeze({
                  label: custoner.name,
                  value: custoner.id,
                  ...custoner,
                })
              );
              return res;
            })
            .catch((e) => console.error(e));
        },
        searchProduct(params) {
          const pms = params || {};

          pms.customerId = this.form.customer || '';
          return TaskApi.getTaskCustonerProductList(pms)
            .then((res) => {
              if (!res || !res.list) return;
              res.list = res.list.map((product) =>
                Object.freeze({
                  label: product.name,
                  value: product.id,
                  ...product,
                })
              );
              return res;
            })
            .catch((e) => console.error(e));
        },
        update(event, action) {
          this.form = {};
          if (action === 'tags') {
            return (this.form.tags = event);
          }

          if (action === 'dist') {
            return (this.form.area = event);
          }
          const f = event.field;
          this.form[f.fieldName] = event.newValue;
          this.$forceUpdate();
        },
        selectField(val) {
          this.selectedField = this.fields.filter(
            (f) => f.fieldName === val
          )[0];
          this.$emit('setting', {
            item: this.selectedField,
            index: this.index,
          });
          this.form[val] = val == 'tags' ? [] : '';

        },
        renderSelector() {
          if (!this.fields) return null;

          return (
            <el-select
              value={this.selectedField.fieldName}
              onChange={this.selectField}
              filterable
            >
              {this.fields.map((f) => (
                <el-option
                  key={f.fieldName}
                  label={f.displayName}
                  value={f.fieldName}
                ></el-option>
              ))}
            </el-select>
          );
        },
        renderOperateSelect() {
          if (!this.selectedField.operatorOptions) return;

          return (
            <el-select
              class={
                this.columnNum === 2
                  ? 'task-inquire-operator-select'
                  : 'task-mt12'
              }
              value={this.selectedField.operatorValue}
              onInput={(value) => (this.selectedField.operatorValue = value)}
            >
              {this.selectedField.operatorOptions.map((operatorItem) => (
                <el-option
                  key={operatorItem.value}
                  label={operatorItem.label}
                  value={operatorItem.value}
                ></el-option>
              ))}
            </el-select>
          );
        },
        renderInput(h) {
          const f = this.selectedField;
          const comp = FormFieldMap.get(f.formType);
          if (!comp || f.formType === 'area') {
            return null;
          }
          if (f.formType === 'select') {
            f.setting.isMulti = false;
          }

          let childComp = null;
          if (f.fieldName == 'customer') {
            let value = this.form[f.fieldName];
            childComp = h('search-customer-select', {
              props: {
                placeholder: '请选择客户',
                field: f,
                value: value
                  ? [{ label: this.customer.name || '', value }]
                  : [],
                remoteMethod: this.searchCustomer,
              },
              on: {
                input: (event) => {
                  this.form = {};
                  this.customer = event && event.length > 0 ? event[0] : {};
                  this.form[f.fieldName] = this.customer.id;
                },
              },
            });
          } else if (f.fieldName == 'product') {
            let value = this.form[f.fieldName];
            childComp = h('search-product-select', {
              props: {
                placeholder: '请选择产品',
                field: f,
                value: value ? [{ label: this.product.name || '', value }] : [],
                remoteMethod: this.searchProduct,
              },
              on: {
                input: (event) => {
                  this.form = {};
                  this.product = event && event.length > 0 ? event[0] : {};
                  this.form[f.fieldName] = this.product.id;
                },
              },
            });
          } else if (f.formType === 'user') {
            childComp = h('user-search', {
              props: {
                field: f,
                value: this.form[f.fieldName],
                disableMap: true,
              },
              on: {
                update: (event) => this.update(event),
                input: (event) => {
                  if (event && event.length > 1) {
                    this.$set(this, 'product', event[0]);
                  }
                  // this.form[f.fieldName] = event.keyword;
                },
              },
            });
          } else if (f.fieldName === 'tags') {
            let value = this.form[f.fieldName];
            childComp = h('biz-team-select', {
              props: {
                value: value ? value : [],
              },
              on: {
                input: (event) => this.update(event, 'tags'),
              },
            });
            
          } else if (f.fieldName === 'tlmName') {
            childComp = h('linkman-search', {
              props: {
                field: f,
                value: this.form[f.fieldName],
                disableMap: true,
              },
              on: {
                update: (event) => this.update(event),
              },
            });
          } else {
            childComp = h(
              comp.extend && comp.extend[`${f.formType}_search`]
                ? comp.extend[`${f.formType}_search`]
                : comp.build,
              {
                props: {
                  field: f,
                  value: this.form[f.fieldName],
                  disableMap: true,
                  placeholder: Utils.genPlaceholder(f),
                  seo: true,
                },
                on: {
                  update: (event) => this.update(event),
                },
              }
            );
          }
          return h(
            'form-item',
            {
              props: {
                label: f.displayName,
                needValidate: false,
              },
            },
            [childComp]
          );
        },
      },
      render(h) {
        return (
          <div>
            {this.item ? (
              <div
                class={
                  this.columnNum === 2
                    ? 'task-flex task-ai task-mt12'
                    : 'task-mt12'
                }
              >
                <div class="task-type">
                  {this.renderSelector()}
                  {this.renderOperateSelect()}
                </div>
                <div
                  class={
                    this.columnNum === 2
                      ? 'task-inquire-two task-flex task-ai'
                      : 'task-inquire task-flex task-ai'
                  }
                >
                  {this.renderInput(h)}
                  {this.list.length - 1 === this.index ? (
                    <div
                      class={
                        this.selectedField.displayName
                          ? 'task-font14 task-c13 task-inquire-add task-ml15 task-pointer'
                          : 'task-font14 task-c13 task-inquire-add task-pointer'
                      }
                      onClick={() => {
                        this.$emit('add');
                      }}
                    >
                      添加
                    </div>
                  ) : (
                    <i
                      class="iconfont icon-yemianshanchu task-pointer task-ml15 task-icon"
                      onClick={() => {
                        this.$emit('del', {
                          index: this.index,
                          v: this.selectedField,
                        });
                      }}
                    ></i>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        );
      },
      components: {
        ...SettingComponents,
        [SearchProductSelect.name]: SearchProductSelect,
        [SearchCustomerSelect.name]: SearchCustomerSelect,
      },
    },
  },
};
</script>

<style lang="scss">
.task-type > div {
  width: 210px!important;
}
</style>
<style lang="scss">
.task-inquire,
.task-inquire-two {
  margin-top: 12px;
  label {
    display: none !important;
  }
  .form-item {
    width: 210px;
  }
  .form-item-control {
    width: 210px;
    flex: inherit;
    .err-msg-wrap {
      min-height: 0 !important;
      padding-bottom: 0 !important;
    }
  }
}
.task-inquire-add {
  width: 68px;
  height: 32px;
  background-color: #e9f9f9;
  border-radius: 4px;
  border: 1px solid #d0f3f4;
  text-align: center;
  line-height: 32px;
}
.task-inquire-two {
  margin: 0;
  margin-left: 12px;
}
.batch-editing-customer-dialog {
  .base-modal-body {
    padding: 10px 30px 0;
  }

  .item {
    display: flex;
    justify-content: space-between;
    line-height: 32px;
    div {
      flex-grow: 1;
      .el-select {
        width: 100%;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
}

.task-inquire-operator-select {
  margin-left: 12px;
}
</style>
