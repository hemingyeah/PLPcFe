<template>
  <div class="list-base-search">
    <!-- 搜索 -->
    <div class="list-base-search-container">
      <slot></slot>
      <form class="base-search" onsubmit="return false;">
        <div class="list-left">
          <div class="list-base-search-group">
            <el-input v-model="searchModel.keyword" :placeholder="placeholder" v-trim:blur>
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <base-button type="primary" @event="search();trackEventHandler('search')" native-type="submit">搜索</base-button>
            <base-button type="ghost" @event="resetParams">重置</base-button>
          </div>
          <slot name="middle"></slot>
        </div>

        <span class="advanced-search-visible-btn" @click.self="panelSearchAdvancedToggle"><i class="iconfont icon-add"></i>高级搜索</span>
      </form>
    </div>
    

    <!-- 高级搜索 -->
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
          :columnNum="columnNum" 
          :options="options" 
          @updateCreateTime="updateCreateTime"
          @getForm="getForm"></search-form>
        <div class="advanced-search-btn-group">
          <base-button type="ghost" @event="resetParams">重置</base-button>
          <base-button type="primary" @event="search" native-type="submit">搜索</base-button>
        </div>
      </el-form>
    </base-panel>
  </div>
</template>

<script>
import { FormFieldMap, SettingComponents } from '@src/component/form/components';
import * as Utils from '@src/component/form/util';
import _ from 'lodash';
import BillAmountRange from './AmountRange.vue'

export default {
  name: 'list-search',
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
        pickerOptions: {
          type: Object,
          default: () => ({})
        },
        options: {
          type: Object,
          default: () => ({})
        }
      },
      data() {
        return {
          form: {},
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
            if (field.fieldName === 'partName') {
              let data = field.setting.dataSource;
              let arr = [];
              data.forEach((item) => {
                arr.push(item.name)
              })
              field.setting.dataSource = arr;
            }
            if (field.formType === 'tags') {
              tv = []
            }

            if (field.formType === 'range') {
              this.$set(this.form, field.fieldName, this.options.amount)
            } else if (field.fieldName == 'createTime') {
              this.$set(this.form, field.fieldName, this.options.createTime)
            } else {
              form[field.fieldName] = this.formBackup[field.fieldName] || tv;
              this.$set(this.form, field.fieldName, this.formBackup[field.fieldName] || tv)
            }

          });

          return form;
        },
        update(event, isTags) {
          if (isTags) {
            return this.form.tags = event;
          }

          const f = event.field;
          this.form[f.fieldName] = event.newValue;          
          if(f.fieldName == 'createTime') {
            this.$emit('updateCreateTime', event.newValue)
          }
        },
        renderInput(h, f) {
          let comp = FormFieldMap.get(f.formType);

          if (!comp && f.formType !== 'tags' && f.formType !== 'customer' && f.formType !== 'range' && f.formType !== 'customize' && f.formType !== 'linkman') {
            return null;
          }

          let childComp = null;

          if (f.formType === 'tags') { // 团队搜索
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
          } else if (f.formType === 'customer') { // 客户搜索
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
          } else if (f.formType === 'range') { // 金额范围
            childComp = h(
              f.components,
              {
                props: {
                  field: f,
                  value: this.form[f.fieldName],
                  disableMap: true,
                  placeholder: f.placeholder,
                },
                on: {
                  update: event => this.update(event)
                }
              });
          } else if (f.formType === 'linkman') {
            childComp = h(
              'linkman-search',
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
          } else if (f.formType === 'date') {
            childComp = h(
              'date-search',
              {
                props: {
                  field: f,
                  value: this.form[f.fieldName],
                  disableMap: true,
                  pickerOptions: this.options.pickerOptions,
                },
                on: {
                  update: event => this.update(event)
                }
              });
          } else if (f.formType === 'customize') { // 其他非公共模板
            childComp = h(
              f.components,
              {
                props: {
                  field: f,
                  value: this.form[f.fieldName],
                  disableMap: true,
                  placeholder: f.placeholder
                },
                on: {
                  update: event => this.update(event)
                }
              }
            )
          } else { // 其他
            childComp = h(
              comp.extend && comp.extend[`${f.formType}_search`]
                ? comp.extend[`${f.formType}_search`]
                : comp.build,
              {
                props: {
                  field: f,
                  value: this.form[f.fieldName],
                  disableMap: true,
                  placeholder: f.placeholder || Utils.genPlaceholder(f),
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
      components: {
        ...SettingComponents,
        [BillAmountRange.name]: BillAmountRange,
        // [PartNameSelect.name]: PartNameSelect,
        // [PartLibrarySelect.name]: PartLibrarySelect
      }
    }
  },
  props: {
    placeholder: {
      type: String,
      default: '根据关键词搜索'
    },
    config: {
      type: Object,
      default: () => ({})
    },
    pickerOptions: {
      type: Object,
      default: () => ({})
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      searchModel: {
        keyword: '',
        moreConditions: {},
      },
      visible: false,
      formBackup: {},
      columnNum: 1,
      form: {}
    }
  },
  methods: {
    updateCreateTime(value) {
      this.$emit('updateCreateTime', value)
    },
    search () {
      this.searchModel.moreConditions = this.buildParams();
      this.$emit('search', this.searchModel);
    },
    // TalkingData事件埋点
    trackEventHandler (type) {
      if (type === 'search') {
        window.TDAPP.onEvent('pc：支付管理-搜索事件');
        return;
      } 
      if (type === 'moreAction') {
        window.TDAPP.onEvent('pc：支付管理-更多操作事件');
        return;
      }
    },
    resetParams () {
      this.searchModel = {
        keyword: '',
        moreConditions: {},
      };
      this.formBackup = {};
      this.$refs.searchForm && this.$nextTick(this.$refs.searchForm.initFormVal)
      this.$emit('reset');
    },
    panelSearchAdvancedToggle () {
      window.TDAPP.onEvent('pc：支付管理-高级搜索事件');
      this.visible = true;
      this.$nextTick(() => {
        let forms = document.getElementsByClassName('advanced-search-form');
        for(let i = 0; i < forms.length; i++) {
          let form = forms[i];
          form.setAttribute('novalidate', true)
        }
      })
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

    getForm (value) {
      return value;
    },

    buildParams() {
      if(this.$refs.searchForm) {
        this.form = this.$refs.searchForm.returnData();
      }
      const form = this.form;
      
      this.formBackup = Object.assign({}, form);

      const isSystemFields = this.fields.filter(f => f.isSystem);
      const notSystemFields = this.fields.filter(f => !f.isSystem);
      let params = {
        conditions: [],
      };

      let tv = null;
      let fn = '';

      for(let i = 0;i < isSystemFields.length;i++) {
        tv = isSystemFields[i];
        fn = tv.fieldName;


        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        if (typeof form[fn] === 'string') {
          params[fn === 'customer' ? 'customerId' : fn] = form[fn];
          continue;
        }

        if (tv.formType === 'tags') {
          params.tagId = form[fn].map(({id}) => id).join('');
        }
      }

      for(let i = 0;i < notSystemFields.length;i++) {
        tv = notSystemFields[i];
        fn = tv.fieldName;

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        // 空对象
        if (typeof form[fn] === 'object' && !Array.isArray(form[fn]) && !Object.keys(form[fn]).length) {
          continue;
        }

        params.conditions.push({
          property: fn,
          operator: tv.operator,
          value: form[fn],
        });
      }

      return {
        form,
        fields: this.fields
      };
    },
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command);
      this.saveDataToStorage('column_number', command);
    },
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
}
</script>

<style lang="scss">
.list-base-search {

  .list-base-search-container {
    background: #fff;
    border-radius: 3px;
    display: flex;
    padding: 12px 10px;

    .base-search {
      font-size: 14px;
      flex: 1;
      display: flex;
      justify-content: space-between;

      .list-left {
        flex: 1;
        display: flex;
      }

      .list-base-search-group {
        display: flex;
        width: 440px;
        justify-content: space-between;

        .el-input {
          width: 300px;
          input {
            height: 34px;
            line-height: 34px;
            width: 300px;
          }
        }

        a {
          line-height: 33px;
        }

      }

      .advanced-search-visible-btn {
        font-size: 14px;
        font-weight: lighter;
        line-height: 32px;
        color: $color-primary;
        border-color: $color-primary;
        background: #fff;
        padding: 0 13px;
        font-weight: 400;
        &:hover {
          cursor: pointer;
        }

        .iconfont {
          font-size: 12px;
          font-weight: bolder;
          padding-right: 4px;
        }
      }
    }
  }

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

}
</style>