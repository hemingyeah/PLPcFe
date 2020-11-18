<template>
  <base-modal title="批量编辑" @closed="reset" :show.sync="visible" width="500px" class="batch-editing-customer-dialog">

    <batch-form :fields="fields" ref="batchForm" :default-address="config.defaultAddress"/>

    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>

import {formatDate} from '@src/util/lang';
import { FormFieldMap, } from '@src/component/form/components';
import * as Utils from '@src/component/form/util';
import { editBatchProduct } from '@src/api/ProductApi';
import FormItem from '@src/component/form/FormItem.vue';
import * as CustomerApi from '@src/api/CustomerApi';
// import {searchCustomer} from '@src/api/EcSearchApi.js';

export default {
  name: 'batch-editing-dialog',
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    selectedIds: {
      type: Array,
      default: () => ([])
    },
    callback: Function,
  },
  data: () => {
    return {
      visible: false,
      pending: false,
    }
  },
  computed: {
    fields() {
      let tv = null;
      let formTypes = ['attachment', 'separator', 'location', 'info', 'autograph', 'formula', 'related_task'];
      let fieldNames = ['createUser', 'createTime', 'updateTime', 'productTemplate', 'tags', 'remindCount', 'qrcodeId', 'linkmanName', 'phone', 'address'];
      let isNotModify = ['text', 'textarea', 'number'];
      let isRepeat = ['text', 'textarea', 'number','phone'];

      let fields = (this.config.fields || [])
        .filter(f => formTypes.indexOf(f.formType) < 0 && !fieldNames.some(key => key === f.fieldName))
        .filter(f => !(isNotModify.indexOf(f.formType) > -1 && f.setting.defaultValueConfig && !!f.setting.defaultValueConfig.isNotModify))
        .filter(f => !(isRepeat.indexOf(f.formType) > -1 && f.setting.isRepeat == 1))
        .map(f => {
          tv = Object.assign({}, f);

          if (tv.isSystem) {
            tv.orderId -= 100;
          }

          // tv.isNull = 0;
          return Object.freeze(tv);
        });

      if (!fields || !fields.length) return [];
      return fields.sort((a, b) => a.orderId - b.orderId);
    },
    productTypes() {
      return this.config.productTypes || [];
    }
  },
  mounted() {
    this.$el.addEventListener('form.add.field', this.addFieldHandler);
  },
  beforeDestroy() {
    this.$el.removeEventListener('form.add.field', this.addFieldHandler);
  },
  methods: {
    addFieldHandler(event) {
      this.validate = event.detail.validate;
    },
    async onSubmit() {
      if (await this.validate()) return;

      const params = this.buildParams();

      this.pending = true;

      editBatchProduct(params)
        .then(res => {
          const failure = res.status;

          this.pending = false;
          this.$platform.notification({
            type: !failure ? 'success' : 'error',
            title: `批量编辑产品${!failure ? '成功' : '失败'}`,
            message: !failure ? null : res.message
          });

          if (failure) return;
          this.visible = false;
          this.reset();
          this.callback && this.callback();
        })
        .catch(e => console.error('e', e));
    },
    reset() {
      this.$refs.batchForm.reset();
      this.$refs.batchForm.buildForm();
    },
    open() {

      if (!this.selectedIds.length) {
        return this.$platform.alert('请选择需要批量编辑的产品');
      }

      this.reset();
      this.visible = true;
    },
    buildParams() {
      let tv = null;
      const {form, selectedField: sf} = this.$refs.batchForm.returnData()

      let params = {
        mapJson: JSON.stringify({
          [sf.fieldName]: form[sf.fieldName],
        }),
        ids: this.selectedIds.join(','),
      };

      if (this.selectedFieldName === 'tags') {
        params.mapJson = JSON.stringify({
          [sf.fieldName]: form[sf.fieldName].map(({id, tagName}) => ({id, tagName}))
        })
      }
      // if (sf.formType === 'user') {
      //   tv = form[sf.fieldName];

      //   params.mapJson = JSON.stringify({
      //     [sf.fieldName]: {
      //       userId: tv.userId,
      //       displayName: tv.displayName,
      //       staffId: tv.staffId
      //     },
      //   })
      // }
      if (sf.fieldName === 'manager') {
        tv = form[sf.fieldName];

        params.mapJson = JSON.stringify({
          [sf.fieldName]: {
            id: tv.userId,
            name: tv.displayName,
            staffId: tv.staffId
          },
        })
      }
      if (sf.formType === 'datetime') {
        tv = form[sf.fieldName];
        params.mapJson = JSON.stringify({
          [sf.fieldName]: tv,
        })
      }
      if (sf.formType === 'date') {
        tv = form[sf.fieldName];
        params.mapJson = JSON.stringify({
          [sf.fieldName]: tv,
        })
      }

      if (sf.formType === 'address') {
        tv = form[sf.fieldName];
        params.mapJson = JSON.stringify({
          [sf.fieldName]: {
            ...tv,
            all: [tv.province, tv.city, tv.dist, tv.address].filter(str => !!str).join('')
          },
        })
      }

      return params;
    },

  },
  components: {
    BatchForm: {
      name: 'batch-form',
      props: {
        fields: {
          type: Array,
          default: () => ([])
        },
        defaultAddress: {
          type: Array,
          default: () => ([])
        }
      },
      data:() => {
        return {
          selectedField: {},
          form: {},
          inputRemoteSearch: {
            customer: {
              options: [],
              loading: false,
            },
          },
        }
      },
      mounted() {
        this.buildForm();
      },
      methods: {
        returnData() {
          return {
            selectedField: this.selectedField,
            form: Object.assign({}, this.form),
          }
        },
        reset() {
          this.form = {};
          if(this.fields.length == 0) {
            return;
          }
          this.selectField(this.fields[0].fieldName)
        },
        dispatch({type, bubbles = false, params = {}}) {
          const _dom = Array.prototype.slice.call(this.$el.children)
            .filter(d => /form-item/g.test(d.className))[0];
          _dom.dispatchEvent(new CustomEvent(type, {detail: params, bubbles}));
        },
        buildForm() {
          if (Object.keys(this.form).length === this.fields.length) return;
          this.form = Utils.initialize(this.fields);
        },
        update(event) {
          /**
           * 选择团队使用的是单独的组件，不是统一的form组件，所以更新时的返回值不同，需要特殊处理
          */
          if (this.selectedField.fieldName === 'customer') {
            this.form[this.selectedField.fieldName] = event;
            return
          }

          const f = event.field;
          this.form[f.fieldName] = event.newValue;
        },
        searchCustomer(keyword) {
          this.inputRemoteSearch.customer.loading = true;
          CustomerApi.getCustomerListAsyn({keyword, pageNum: 1, })
            .then(res => {
              this.inputRemoteSearch.customer.options = res.list;
              this.inputRemoteSearch.customer.loading = false;
            })
            .catch(err => console.error('searchCustomerManager function catch err', err));
        },
        selectField(val) {
          this.selectedField = this.fields.filter(f => f.fieldName === val)[0];

          /**
             * 1、切换的字段是系统地址时，根据默认值设置
             * 2、切换字段的时候，重新注册一遍，是因为： 切换前后两个字段类型相同，不会触发字段的组件的重新注册，form-item 的 field 就不会更新，还是切换之前的 field
             */

          if (this.selectedField.formType === 'address' && this.selectedField.isSystem) {
            let [province, city, dist] = this.defaultAddress;
            this.form[this.selectedField.fieldName] = {
              province: province || '',
              city: city || '',
              dist: dist || ''
            }
          }

          this.dispatch({
            type: 'form.add.field',
            params: {
              value: () => this.form[this.selectedField.fieldName],
              field: this.selectedField,
              fieldName: this.selectedField.fieldName
            }
          })

          this.dispatch({
            type: 'form.clear.validate',
          })
        },
        renderSelector() {
          if (!this.fields) return null;
          return (
            <el-select value={this.selectedField.fieldName} placeholder="请选择需要修改的字段" onChange={this.selectField}>
              {this.fields.map(f => (
                <el-option
                  key={f.fieldName}
                  label={f.displayName}
                  value={f.fieldName}>
                </el-option>
              ))}
            </el-select>
          )
        },

        renderInput(h) {
          const sf = this.selectedField;

          if (!sf.formType) return null;

          if (sf.fieldName === 'customer') {
            return h(
              'el-select',
              {
                props: {
                  filterable: true,
                  remote: true,
                  clearable: true,
                  'reserve-keyword': true,
                  'remote-method': this.searchCustomer,
                  value: this.form[sf.fieldName],
                  loading: this.inputRemoteSearch.customer.loading,
                  placeholder: '请输入关键词搜索',
                },
                on: {
                  input: event => {
                    this.update(event)
                    this.$forceUpdate()
                  }
                }
              },
              this.inputRemoteSearch.customer.options
                .map(op => (
                  h(
                    'el-option',
                    {
                      props: {
                        key: op.id,
                        label: op.name,
                        value: op.id,
                      }
                    }
                  )
                )),
            )
          }

          const comp = FormFieldMap.get(sf.formType);
          const data = {
            props: {
              field: sf,
              value: this.form[sf.fieldName],
              placeholder: Utils.genPlaceholder(sf),
            },
            on: {
              update: event => this.update(event)
            }
          };

          // if (sf.formType === 'address' && !sf.isSystem) {
          //   data.props.disableMap = true;
          // }

          return h(comp.build, data);
        }
      },
      render(h) {
        return (
          <div>
            <div class="item">
              <label class="form-name">修改字段</label>
              <div>{this.renderSelector()}</div>
            </div>
            <form-item label={'修改为'}>
              {this.renderInput(h)}
            </form-item>
          </div>
        )
      }
    },
    components: {
      [FormItem.name]: FormItem,
    }
  }

}
</script>

<style lang="scss">

  .batch-editing-customer-dialog {

    .base-modal-body {
      padding: 10px 30px 0;
    }

    .form-name, .form-item label {
      width: 70px;
      padding: 0;
      line-height: 32px;
    }

    .el-select {
      width: 100%;
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

</style>
