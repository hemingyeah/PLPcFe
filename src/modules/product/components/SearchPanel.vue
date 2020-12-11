<template>
  <base-panel :show.sync="visible" :width="panelWidth">
    <h3 slot="title">
      <span>高级搜索</span>
      <el-dropdown class="pull-right" trigger="click" @command="setAdvanceSearchColumn">
        <i class="iconfont icon-xitongguanli customer-panel-btn" style="float: none;"></i>

        <el-dropdown-menu slot="dropdown" class="customer-advance-setting">
          <el-dropdown-item command="1">一栏</el-dropdown-item>
          <el-dropdown-item command="2">两栏</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </h3>
    <el-form class="advanced-search-form" onsubmit="return false;">
      <search-form
        :fields="fields"
        ref="searchForm"
        :form-backup="formBackup"
        :column-num="columnNum"
      ></search-form>
      <slot name="footer"></slot>
    </el-form>
  </base-panel>
</template>

<script>
import {
  FormFieldMap,
  SettingComponents
} from '@src/component/form/components';
import * as Utils from '@src/component/form/util';
import { formatDate } from '@src/util/lang';
import _ from 'lodash';
import { isEmptyStringObject } from '@src/util/function';

export default {
  name: 'search-panel',
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      formBackup: {},
      columnNum: 1,
      selfFields: this.buildSelfFields()
    };
  },
  computed: {
    fields() {
      let f = {};
      let fields = [...this.config.fields, ...this.selfFields]
        .filter(f => f.isSearch || f.isSystem)
        .map(field => {
          f = _.cloneDeep(field);

          let formType = f.formType;

          if (formType === 'datetime') {
            formType = 'date';
          }

          if (f.fieldName === 'customer') {
            formType = 'customer';
          }

          if (formType === 'updateTime') {
            f.displayName = '更新时间';
          }
          return Object.freeze({
            ...f,
            isNull: 1,
            formType,
            originalFormType: f.formType,
            operator: this.matchOperator(f)
          });
        })
        .sort((a, b) => a.orderId - b.orderId);
        
      return fields;
    },
    panelWidth() {
      return `${420 * this.columnNum}px`;
    }
  },
  mounted() {
    const { column_number } = this.getLocalStorageData();
    if (column_number) this.columnNum = Number(column_number);

    this.computedWhetherAddQrcodeField();
  },
  methods: {
    buildSelfFields() {
      let fields = [
        {
          displayName: '创建时间',
          fieldName: 'createTime',
          formType: 'date',
          isExport: false,
          isNull: 1,
          isSystem: 1,
          operator: 'between',
          orderId: -2
        },
        {
          displayName: '有无提醒',
          fieldName: 'hasRemind',
          formType: 'select',
          isExport: false,
          isNull: 1,
          isSystem: 1,
          operator: 'between',
          orderId: -3,
          setting: {
            isMulti: false,
            dataSource: [
              {
                text: '全部',
                value: ''
              },
              {
                text: '有',
                value: 1
              },
              {
                text: '无',
                value: 2
              }
            ]
          }
        },
        {
          displayName: '创建人',
          fieldName: 'createUser',
          formType: 'user',
          returnData: 'name',
          noClearable: true,
          isExport: false,
          isNull: 1,
          isSystem: 1,
          orderId: -3.5,
          placeHolder: '请输入创建人'
        },{
            displayName: '是否绑定二维码',
            fieldName: 'qrcodeState',
            formType: 'select',
            isExport: false,
            isNull: 1,
            isSystem: 1,
            operator: 'between',
            orderId: 1000,
            setting: {
              isMulti: false,
              dataSource: [
                {
                  text: '全部',
                  value: ''
                },
                {
                  text: '是',
                  value: 1
                },
                {
                  text: '否',
                  value: 2
                }
              ]
            }
          }
      ];

      let hasLinkman = this.config.fields.filter(
        item => item.fieldName == 'linkmanName'
      )[0];
      let hasAddress = this.config.fields.filter(
        item => item.fieldName == 'address'
      )[0];

      if (hasLinkman) {
        fields.push({
          displayName: '联系人',
          fieldName: 'linkmanId',
          formType: 'linkman',
          isExport: false,
          isNull: 1,
          isSystem: 1,
          orderId: -11,
          placeholder: '请输入关键字搜索联系人'
        });
      }

      if (hasAddress) {
        fields.push({
          displayName: '区域',
          fieldName: 'area',
          formType: 'area',
          isExport: false,
          isNull: 1,
          isSystem: 1,
          orderId: -10
        });
        fields.push({
          displayName: '详细地址',
          fieldName: 'addressDetail',
          formType: 'text',
          isExport: false,
          isNull: 1,
          isSystem: 1,
          orderId: -9
        });
      }

      return fields;
    },
    computedWhetherAddQrcodeField() {
      this.selfFields = [
        ...this.selfFields,
      ];
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;
      localStorage.setItem(
        'product_list_localStorage_19_4_24',
        JSON.stringify(data)
      );
    },
    getLocalStorageData() {
      const dataStr =
        localStorage.getItem('product_list_localStorage_19_4_24') || '{}';
      return JSON.parse(dataStr);
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
    resetParams() {
      this.formBackup = {};
      this.$refs.searchForm &&
        this.$nextTick(this.$refs.searchForm.initFormVal);
    },

    buildParams() {
      const form = this.$refs.searchForm.returnData();
      this.formBackup = Object.assign({}, form);

      const isSystemFields = this.fields.filter(f => f.isSystem);
      const notSystemFields = this.fields.filter(f => !f.isSystem);
      let params = {
        conditions: []
      };

      let tv = null;
      let fn = '';

      for (let i = 0; i < isSystemFields.length; i++) {
        tv = isSystemFields[i];
        fn = tv.fieldName;

        // hasRemind
        if (fn === 'hasRemind' && form[fn] !== '') {
          params.hasRemind = form[fn] == 2 ? 0 : form[fn];
          continue;
        }

        if (fn === 'qrcodeState' && form[fn] !== '') {
          params.qrcodeState = form[fn] == 2 ? 0 : form[fn];
          continue;
        }

        if (fn == 'area') {
          params.productAddress = {
            ...(params.productAddress || {}),
            province: form[fn][0],
            city: form[fn][1],
            dist: form[fn][2]
          };
          continue;
        }

        if (fn === 'addressDetail') {
          params.productAddress = {
            ...(params.productAddress || {}),
            address: form[fn]
          };
          continue;
        }

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        if (tv.formType === 'date' || tv.formType === 'datetime') {
          params[fn] = form[fn].map(t => formatDate(t, 'YYYY/MM/DD')).join('-');
          continue;
        }

        if (tv.formType === 'tags') {
          params.tagId = form[fn].map(({ id }) => id).join('');
        }

        if (typeof form[fn] === 'string') {
          params[fn === 'customer' ? 'customerId' : fn] = form[fn];
          continue;
        }
      }

      for (let i = 0; i < notSystemFields.length; i++) {
        tv = notSystemFields[i];
        fn = tv.fieldName;

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        // 空对象
        if (
          typeof form[fn] === 'object' &&
          !Array.isArray(form[fn]) &&
          !Object.keys(form[fn]).length
        ) {
          continue;
        }

        if (tv.originalFormType === 'date') {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], 'YYYY-MM-DD'),
            betweenValue2: formatDate(form[fn][1], 'YYYY-MM-DD')
          });
          continue;
        }

        if (tv.originalFormType === 'datetime') {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], 'YYYY-MM-DD HH:mm:ss'),
            betweenValue2: `${formatDate(form[fn][1], 'YYYY-MM-DD')} 23:59:59`
          });
          continue;
        }

        if (tv.formType === 'address') {
          let address = {
            property: fn,
            operator: tv.operator
          };
          let isEmpty = isEmptyStringObject(form[fn]);

          if (!isEmpty) {
            address.value =
              (form[fn].province || '') +
              (form[fn].city || '') +
              (form[fn].dist || '') +
              (form[fn].address || '');
          }
          params.conditions.push(address);
          continue;
        }

        params.conditions.push({
          property: fn,
          operator: tv.operator,
          value: form[fn]
        });
      }
      // 返回接口数据
      return params;
    },
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command);
      this.saveDataToStorage('column_number', command);
    },
    open() {
      this.visible = true;
    }
  },
  components: {
    SearchForm: {
      name: 'search-form',
      props: {
        fields: {
          type: Array,
          default: () => []
        },
        formBackup: {
          type: Object,
          default: () => ({})
        },
        columnNum: {
          type: Number,
          default: 1
        }
      },
      data() {
        return {
          form: {},
          tableName: 'product'
        };
      },
      mounted() {
        this.buildForm();
      },
      methods: {
        returnData() {
          return Object.assign({}, this.form);
        },
        buildForm() {
          if (Object.keys(this.form).length === this.fields.length) return;
          this.initFormVal();
        },
        initFormVal() {
          let fields = this.fields;
          let form = {};
          let tv = '';

          fields.forEach(field => {
            tv = '';
            // 地址的默认值初始化为对象
            if (
              field.formType == 'customerAddress' ||
              field.formType == 'address'
            )
              tv = {};
            if (field.formType == 'date' || field.formType == 'datetime')
              tv = [];
            if (field.formType === 'link') {
              tv = {};
            }
            if (field.formType === 'tags') {
              tv = [];
            }
            if (field.formType === 'area') {
              tv = [];
            }
            if (field.formType === 'area') {
              tv = []
            }

            form[field.fieldName] = this.formBackup[field.fieldName] || tv;

            this.$set(
              this.form,
              field.fieldName,
              this.formBackup[field.fieldName] || tv
            );
          });

          return form;
        },
        update(event, action) {
          console.log('update::', event, action);
          if (action === 'tags') {
            return (this.form.tags = event);
          }

          if (action === 'dist') {
            return (this.form.area = event);
          }
          const f = event.field;
          this.form[f.fieldName] = event.newValue;
        },
        createUserInput(event, isTags) {
          if (isTags) {
            return this.form.tags = event;
          }
          const f = event.field;
          this.form[f.fieldName] = event.keyword;
        },
        renderInput(h, field) {
          const f = {
            ...Object.freeze(field)
          };

          let comp = FormFieldMap.get(f.formType);

          if (!comp && f.formType !== 'tags' && f.formType !== 'area' && f.formType !== 'linkman') {
            return null;
          }

          if (f.formType === 'select') {
            f.setting.isMulti = false;
          }

          let childComp = null;

          if (f.formType === 'tags') {
            childComp = h('biz-team-select', {
              props: {
                value: this.form[f.fieldName]
              },
              on: {
                input: event => this.update(event, 'isTags')
              }
            });
          } else if (f.formType === 'linkman') {
            childComp = h('linkman-search', {
              props: {
                field: f,
                value: this.form[f.fieldName],
                disableMap: true
              },
              on: {
                update: event => {
                  this.update(event);
                },
                input: event => {
                  this.form[f.fieldName] = event.keyword;
                }
              }
            });
          } else if (f.formType === 'area') {
            childComp = h(
              'base-dist-picker',
              {
                props: {
                  value: this.form[f.fieldName],
                },
                on: {
                  input: event => this.update(event, 'dist')
                }
              });
          } else if (f.formType === 'customer') {
            childComp = h('customer-search', {
              props: {
                field: f,
                value: this.form[f.fieldName],
                disableMap: true
              },
              on: {
                update: event => this.update(event)
              }
            });
          } else if (f.formType === 'user') {
            childComp = h('user-search', {
              props: {
                field: f,
                value: this.form[f.fieldName],
                disableMap: true
              },
              on: {
                update: event => this.update(event),
                input: event => {
                  this.form[f.fieldName] = event.keyword;
                }
              }
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
                  placeholder: Utils.genPlaceholder(f)
                },
                on: {
                  update: event => this.update(event)
                }
              }
            );
          }

          return h(
            'form-item',
            {
              props: {
                label: f.displayName,
                needValidate: false
              }
            },
            [childComp]
          );
        }
      },
      render(h) {
        return (
          <div
            class={`form-item-container ${
              this.columnNum == 2 ? 'two-columns' : ''
            }`}
          >
            {this.fields.map(f => this.renderInput(h, f))}
          </div>
        );
      },
      components: { ...SettingComponents }
    }
  }
};
</script>

<style lang="scss">
.advanced-search-form {
  overflow: auto;
  padding: 10px 15px 63px 15px;

  height: calc(100% - 52px);
  justify-content: space-between;

  .two-columns {
    display: flex;
    flex-wrap: wrap;
    .el-form-item {
      width: 50%;
    }
  }

  .form-item-container {
    justify-content: space-between;
  }

  .form-item {
    label {
      padding-left: 0;
    }

    width: 390px;
  }

  .advanced-search-btn-group {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    position: absolute;
    bottom: 0px;
    background: #fff;
    padding: 15px 20px;

    .base-button {
      margin: 0 10px;
    }
  }
}
</style>