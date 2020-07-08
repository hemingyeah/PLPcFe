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
      <search-form :fields="fields" ref="searchForm" :form-backup="formBackup" :column-num="columnNum"></search-form>
      <slot name="footer"></slot>
    </el-form>
  </base-panel>
</template>

<script>
import { FormFieldMap, SettingComponents } from '@src/component/form/components'
import * as Utils from '@src/component/form/util'
import { formatDate } from '@src/util/lang'
import { isEmptyStringObject } from '@src/util/function'
import _ from 'lodash'

export default {
  name: 'search-panel',
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      formBackup: {},
      columnNum: 1,
      selfFields: [
        {
          orderId: 1,
          displayName: '通话ID',
          fieldName: 'recordId',
          formType: 'text',
          placeholder: '请输入通话ID',
          maxlength:50
        },
        {
          orderId: 2,
          displayName: '接待坐席',
          fieldName: 'agentName',
          formType: 'text',
          placeholder: '请输入接待坐席',
          maxlength:50
        },
        {
          orderId: 3,
          displayName: '来去电时间',
          fieldName: 'ringTime',
          formType: 'date',
          operator: 'between'
        },

        {
          orderId: 4,
          displayName: '咨询分类',
          fieldName: 'sortId',
          formType: 'category'
        },

        {
          orderId: 5,
          displayName: '解决状态',
          fieldName: 'resolveStatus',
          formType: 'select',
          setting: {
            isMulti: false,
            dataSource: [
              {
                text: '全部',
                value: ''
              },
              {
                text: '已解决',
                value: 1
              },
              {
                text: '未解决',
                value: 2
              }
            ]
          }
        },
        {
          orderId: 6,
          displayName: '归属地',
          fieldName: 'area',
          formType: 'area'
        },
        {
          orderId: 7,
          displayName: '客户',
          fieldName: 'customer',
          formType: 'customer',
          placeholder: '请输入客户',
          isSystem: 1,
          maxlength:50
        },
        {
          orderId: 8,
          displayName: '联系人',
          fieldName: 'linkmanId',
          formType: 'linkman',
          placeholder: '请输入联系人名称',
          isSystem: 1,
          maxlength:50
        },
        {
          orderId: 9,
          displayName: '呼叫电话',
          fieldName: 'dialPhone',
          formType: 'text',
          placeholder: '请输入电话',
          maxlength:50
        },
        {
          orderId: 10,
          displayName: '消耗话费',
          fieldName: 'cost',
          formType: 'text',
          placeholder: '请输入话费数目',
          maxlength:50
        },
        {
          orderId: 14,
          displayName: '通话开始时间',
          fieldName: 'beginTime',
          formType: 'date',
          operator: 'between'
        },
        {
          orderId: 15,
          displayName: '通话结束时间',
          fieldName: 'endTime',
          formType: 'date',
          operator: 'between'
        },
        {
          orderId: 16,
          displayName: '关联工单',
          fieldName: 'taskId',
          formType: 'text',
          placeholder: '请输入关联工单ID'
        },
        {
          orderId: 17,
          displayName: '关联事件',
          fieldName: 'eventId',
          formType: 'text',
          placeholder: '请输入关联事件ID'
        }
      ]
    }
  },
  computed: {
    fields() {
      let f = {}
      return (
        [...this.selfFields]
          // .filter(f => (f.isSearch || f.isSystem) && f.fieldName !== 'qrcodeId' && f.displayName !== '服务团队')
          .map(field => {
            f = _.cloneDeep(field)
            return Object.freeze({
              ...f,
              isNull: 1,
              formType: f.formType,
              originalFormType: f.formType,
              // orderId: f.isSystem ? f.orderId - 100 : f.orderId,
              operator: this.matchOperator(f)
            })
          })
          .sort((a, b) => a.orderId - b.orderId)
      )
    },
    panelWidth() {
      return `${420 * this.columnNum}px`
    }
  },
  mounted() {
    const { column_number } = this.getLocalStorageData()
    if (column_number) this.columnNum = Number(column_number)
  },
  methods: {
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData()
      data[key] = value
      localStorage.setItem('callcenter_list_localStorage', JSON.stringify(data))
    },
    getLocalStorageData() {
      const dataStr =
        localStorage.getItem('callcenter_list_localStorage') || '{}'
      return JSON.parse(dataStr)
    },
    matchOperator(field) {
      let formType = field.formType
      let operator = ''

      switch (formType) {
      case 'date': {
        operator = 'between'
        break
      }
      case 'datetime': {
        operator = 'between'
        break
      }
      case 'select': {
        if (field.setting && field.setting.isMulti) {
          operator = 'contain'
        } else {
          operator = 'eq'
        }
        break
      }
      case 'user': {
        operator = 'user'
        break
      }
      case 'address': {
        operator = 'address'
        break
      }
      case 'location': {
        operator = 'location'
        break
      }
      default: {
        operator = 'like'
        break
      }
      }
      return operator
    },
    resetParams() {
      this.formBackup = {}
      this.$refs.searchForm && this.$nextTick(this.$refs.searchForm.initFormVal)
    },

    buildParams() {
      const form = this.$refs.searchForm.returnData()
      this.formBackup = Object.assign({}, form)

      const isSystemFields = this.fields.filter(f => f.isSystem)
      const notSystemFields = this.fields.filter(f => !f.isSystem)
      let params = {
        conditions: []
      }

      let tv = null
      let fn = ''

      for (let i = 0; i < isSystemFields.length; i++) {
        tv = isSystemFields[i]
        fn = tv.fieldName

        // hasRemind
        if ((fn === 'hasRemind' || fn === 'status') && form[fn] !== '') {
          params[fn] = form[fn]
          continue
        }

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue
        }

        if (fn === 'addressDetail') {
          params.customerAddress = {
            ...(params.customerAddress || {}),
            adAddress: form[fn]
          }
          continue
        }

        if (typeof form[fn] === 'string') {
          params[fn === 'customer' ? 'customerId' : fn] = form[fn]
          continue
        }

        if (fn === 'area') {
          params.customerAddress = {
            ...(params.customerAddress || {}),
            adProvince: form[fn][0],
            adCity: form[fn][1],
            adDist: form[fn][2]
          }
          continue
        }

        if (fn === 'addressDetail') {
          params.customerAddress = {
            ...(params.customerAddress || {}),
            adAddress: form[fn]
          }
          continue
        }

        if (fn === 'createTime') {
          params.createTimeStart = `${formatDate(
            form[fn][0],
            'YYYY-MM-DD'
          )} 00:00:00`
          params.createTimeEnd = `${formatDate(
            form[fn][1],
            'YYYY-MM-DD'
          )} 23:59:59`
          continue
        }

        if (fn === 'updateTime') {
          params.updateTimeStart = `${formatDate(
            form[fn][0],
            'YYYY-MM-DD'
          )} 00:00:00`
          params.updateTimeEnd = `${formatDate(
            form[fn][1],
            'YYYY-MM-DD'
          )} 23:59:59`
          continue
        }

        if (tv.formType === 'date' || tv.formType === 'datetime') {
          params[fn] = form[fn].map(t => formatDate(t, 'YYYY/MM/DD')).join('-')
          continue
        }

        if (tv.formType === 'category') {
          params.sortId = form[fn].map(({ id }) => id).join('')
        }
      }

      for (let i = 0; i < notSystemFields.length; i++) {
        tv = notSystemFields[i]
        fn = tv.fieldName

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue
        }

        // 空对象
        if (
          typeof form[fn] === 'object' &&
          !Array.isArray(form[fn]) &&
          !Object.keys(form[fn]).length
        ) {
          continue
        }

        if (tv.originalFormType === 'date') {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], 'YYYY-MM-DD'),
            betweenValue2: formatDate(form[fn][1], 'YYYY-MM-DD')
          })
          continue
        }

        if (tv.originalFormType === 'datetime') {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], 'YYYY-MM-DD HH:mm:ss'),
            betweenValue2: `${formatDate(form[fn][1], 'YYYY-MM-DD')} 23:59:59`
          })
          continue
        }

        if (tv.formType === 'address') {
          let address = {
            property: fn,
            operator: tv.operator
          }
          let isEmpty = isEmptyStringObject(form[fn])

          if (!isEmpty) {
            address.value =
              (form[fn].province || '') +
              (form[fn].city || '') +
              (form[fn].dist || '') +
              (form[fn].address || '')
            params.conditions.push(address)
          }
          continue
        }

        params.conditions.push({
          property: fn,
          operator: tv.operator,
          value: form[fn]
        })
      }
      // console.log('buildParams:', params);
      return params
    },
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command)
      this.saveDataToStorage('column_number', command)
    },
    open() {
      this.visible = true
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
        }
      },
      mounted() {
        this.buildForm()
      },
      methods: {
        returnData() {          
          return Object.assign({}, this.form)
        },
        buildForm() {
          if (Object.keys(this.form).length === this.fields.length) return
          this.initFormVal()
        },
        initFormVal() {
          let fields = this.fields
          let form = {}
          let tv = ''

          fields.forEach(field => {
            tv = ''
            // 地址的默认值初始化为对象
            if (
              field.formType == 'customerAddress' ||
              field.formType == 'address'
            )
              tv = {}
            if (field.formType == 'date' || field.formType == 'datetime')
              tv = []
            if (field.formType === 'link') {
              tv = {}
            }
            if (field.formType === 'category') {
              tv = []
            }
            if (field.formType === 'tags') {
              tv = []
            }
            if (field.formType === 'area') {
              tv = []
            }
            if (
              field.formType === 'select' &&
              field.displayName === '服务团队'
            ) {
              tv = []
            }

            form[field.fieldName] = this.formBackup[field.fieldName] || tv

            if (
              field.fieldName === 'status' ||
              field.fieldName === 'hasRemind'
            ) {
              this.$set(
                this.form,
                field.fieldName,
                Number(this.formBackup[field.fieldName]) >= 0
                  ? this.formBackup[field.fieldName]
                  : ''
              )
            } else {
              this.$set(
                this.form,
                field.fieldName,
                this.formBackup[field.fieldName] || tv
              )
            }
          })

          return form
        },
        update(event, action) {
          if (action === 'category') {
            return (this.form.sortId = [event])
          }

          if (action === 'tags') {
            return (this.form.tags = event)
          }

          if (action === 'dist') {
            return (this.form.area = event)
          }

          const f = event.field
          this.form[f.fieldName] = event.newValue
        },
        renderInput(h, field) {
          const f = {
            ...Object.freeze(field)
          }

          let comp = FormFieldMap.get(f.formType)
          if (
            !comp &&
            f.formType !== 'category' &&
            f.formType !== 'tags' &&
            f.formType !== 'area' &&
            f.formType !== 'customer' &&
            f.formType !== 'linkman'
          ) {
            return null
          }

          if (f.formType === 'select') {
            f.setting.isMulti = false
          }

          let childComp = null

          if (f.formType === 'category') {
            childComp = h('biz-category-select', {
              props: {
                value: this.form[f.fieldName]
              },
              on: {
                input: event => this.update(event, 'category')
              }
            })
          } else if (f.formType === 'tags') {
            childComp = h('biz-team-select', {
              props: {
                value: this.form[f.fieldName]
              },
              on: {
                input: event => this.update(event, 'tags')
              }
            })
          } else if (f.formType === 'area') {
            childComp = h('base-dist-picker', {
              props: {
                value: this.form[f.fieldName]
              },
              on: {
                input: event => this.update(event, 'dist')
              }
            })
          } else if (f.formType === 'linkman') {
            childComp = h('linkman-search', {
              props: {
                field: f,
                value: this.form[f.fieldName],
                disableMap: true
              },
              on: {
                update: event => this.update(event)
              }
            })
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
          }else {
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
            )
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
          )
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
        )
      },
      components: { ...SettingComponents }
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
