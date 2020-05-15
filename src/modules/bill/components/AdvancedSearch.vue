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
      <search-form :fields="fields" ref="searchForm" :form-backup="formBackup" :columnNum="columnNum"></search-form>
      <slot name="footer"></slot>
    </el-form>
  </base-panel>
</template>

<script>
import { FormFieldMap, SettingComponents } from '@src/component/form/components';
import * as Utils from '@src/component/form/util';
import _ from 'lodash';

export default {
  name: 'advanced-search',
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      visible: false,
      formBackup: {},
      columnNum: 1,
    }
  },
  computed: {
    fields() {
      let f = {};
      return [...this.config.fields]
        .filter(f => (f.isSearch || f.isSystem) && f.fieldName !== 'qrcodeId')
        .map(field => {

          f = _.cloneDeep(field);

          let formType = f.formType;

          if (formType === 'datetime') {
            formType = 'date';
          }

          if (formType === 'select' && f.setting.isMulti) {
            f.setting.isMulti = false;
          }

          return Object.freeze({
            ...f,
            isNull: 1,
            formType,
            originalFormType: f.formType,
            operator: this.matchOperator(f)
          })
        })
        .sort((a) => a.orderId);
    },
    panelWidth() {
      return `${420 * this.columnNum}px`;
    },
  },
  methods: {
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
        if(field.setting && field.setting.isMulti) {
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
      this.$refs.searchForm && this.$nextTick(this.$refs.searchForm.initFormVal)
    },

    buildParams() {
      const form = this.$refs.searchForm.returnData();
      this.formBackup = Object.assign({}, form);
      console.log(this.fields);
      console.log(this.formBackup);

      return this.formBackup;

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
          default: () => ([])
        },
        formBackup: {
          type: Object,
          default: () => ({})
        },
        columnNum: {
          type: Number,
          default: 1
        },
      },
      data() {
        return {
          form: {},
          tableName: 'product',
        }
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
            if(field.formType == 'customerAddress' || field.formType == 'address') tv = {};
            if(field.formType == 'date' || field.formType == 'datetime') tv = [];
            if (field.formType === 'link') {
              tv = {}
            }
            // if (field.formType === 'tags') {
            //   tv = []
            // }

            form[field.fieldName] = this.formBackup[field.fieldName] || tv;

            this.$set(this.form, field.fieldName, this.formBackup[field.fieldName] || tv)
          });


          return form;
        },
        update(event, isTags) {
          console.log(event, isTags);
          if (isTags) {
            return this.form.tags = event;
          }

          const f = event.field;
          this.form[f.fieldName] = event.newValue;
        },
        renderInput(h, f) {
          let comp = FormFieldMap.get(f.formType);

          if (!comp && f.formType !== 'tags' && f.formType !== 'customer') {
            return null;
          }

          let childComp = null;

          if (f.formType === 'tags') {
            childComp = h(
              'biz-team-select',
              {
                props: {
                  value: this.form[f.fieldName],
                },
                on: {
                  input: event => this.update(event, 'isTags')
                }
              }
            )
          } else if (f.formType === 'customer') {
            childComp = h(
              'customer-search',
              {
                props: {
                  field: f,
                  value: this.form[f.fieldName],
                  disableMap: true,
                },
                on: {
                  update: event => this.update(event)
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
                  placeholder: Utils.genPlaceholder(f),
                },
                on: {
                  update: event => this.update(event)
                }
              });
          }

          return h(
            'form-item',
            {
              props: {
                label: f.displayName,
                needValidate: false,
              }
            },
            [childComp]
          )
        }
      },
      render(h) {
        return (
          <div class={`form-item-container ${this.columnNum == 2 ? 'two-columns' : ''}`}>
            {this.fields.map(f => this.renderInput(h, f))}
          </div>
        )
      },
      components: {...SettingComponents}
    }
  }
}
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