<template>
  <base-modal title="批量转交办理" @closed="reset" :show.sync="visible" width="500px" class="batch-editing-dialog">

    <batch-form :fields="fields" ref="batchForm"/>

    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>

import { FormFieldMap } from '@src/component/form/components';
import * as Utils from '@src/component/form/util';
import FormItem from '@src/component/form/FormItem.vue';

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
    module:{
      type: String,
      default: ''
    }
  },
  data: () => {
    return {
      visible: false,
      pending: false
    }
  },
  computed: {
    fields() {
      let tv = null;

      let formTypes = ['attachment', 'separator', 'location', 'info'];

      let fields = (this.config.fields || [])
        .filter(f => (
          f.fieldName !== 'serialNumber'
          && formTypes.indexOf(f.formType) < 0
        ))
        .map(f => {
          tv = Object.assign({}, f);

          if (tv.formType === 'address' && tv.isSystem) {
            tv.displayName = '客户地址';
            tv.fieldName = 'address';
          }

          if (tv.fieldName === 'name') {
            tv.fieldName = 'cusName';
          }

          if (tv.isSystem) {
            tv.orderId -= 100;
          }

          // tv.isNull = 0;
          return Object.freeze(tv);
        })

      if (!fields || !fields.length) return [];

      return fields.sort((a, b) => a.orderId - b.orderId);
    },
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
      // if (await this.validate()) return;
      // 这里不需要校验 
      const {form, selectedField: sf} = this.$refs.batchForm.returnData()
      const manager = form[sf.fieldName];
      // userId: "6839d043-683e-11ea-bfc9-00163e304a25" displayName: "薄德忠"
      // ids: this.selectedIds.join(','),
      // console.info('params:', manager.userId, manager.displayName);
      let params = {}, emulateJSON = true;   
      //  {mapJson: 
      // "{"manager":{"id":"b33e25bb-380e-11ea-bfc9-00163e304a25","name":"安迪"}}",
      // ids: "7dbd757e-2525-11e8-b7b4-00163e304a25"}
 
      this.pending = true;
      try {
        let url = '';
        switch (this.module) {
        case '未完成事件':
          url = '/event/allotBatch';
          params.eventIdList = this.selectedIds;
          params.executorId = manager.userId;
          params.executorName = manager.displayName;
          break;
        case '未完成工单':
          url = '/task/allotBatch';
          params.taskIdList = this.selectedIds;
          params.executorId = manager.userId;
          break;
        case '负责客户':
          url = '/customer/editBatch';
          params = this.buildParams();
          emulateJSON = false;
          break;
        default:
          break;
        }
        // console.info('params', params);
        const res = await this.$http.post(url, params, emulateJSON);
        const failure = res.status;
        this.pending = false;
        this.$platform.notification({
          type: failure == 0 ? 'success' : 'error',
          title: `批量转交${!failure ? '成功' : '失败'}`,
          message: failure == 0 ? null : res.message
        });
        if (failure) return;
        this.visible = false;
        this.reset();
        this.callback && this.callback();
      } catch (error) {
        this.pending = false;
        console.info('e', error);
      }
    },
    reset() {
      this.$refs.batchForm.reset();
      this.$refs.batchForm.buildForm();
    },
    open() {
      if (!this.selectedIds.length) {
        // console.info('this.module', this.module);
        
        return this.$platform.alert(`请选择需要批量编辑的${this.module}`);
      }
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

      if (sf.fieldName === 'tags') {
        params.mapJson = JSON.stringify({
          [sf.fieldName]: form[sf.fieldName].map(({id, tagName}) => ({id, tagName}))
        })
      }
      if (sf.formType === 'user') {
        tv = form[sf.fieldName];

        params.mapJson = JSON.stringify({
          [sf.fieldName]: {
            userId: tv.userId,
            name: tv.displayName,
          },
        })
      }
      if (sf.fieldName === 'manager') {
        tv = form[sf.fieldName];

        params.mapJson = JSON.stringify({
          [sf.fieldName]: {
            id: tv.userId,
            name: tv.displayName,
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
        }
      },
      mounted() {
        this.reset();
        this.buildForm();
      },
      methods: {
        returnData() {
          return {
            selectedField: this.selectedField,
            form: Object.assign({}, this.form)
          }
        },
        reset() {
          this.form = {};
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

          this.fields.forEach(f => {
            if (f.fieldName === 'tags' && f.formType === 'select') {
              this.form[f.fieldName] = [];
            }
          });

        },
        update(event) {
          /**
           * 选择团队使用的是单独的组件，不是统一的form组件，所以更新时的返回值不同，需要特殊处理
           */
          if (this.selectedField.fieldName === 'tags') {
            this.form[this.selectedField.fieldName] = event;
            return
          }

          const f = event.field;
          this.form[f.fieldName] = event.newValue;
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
        renderInput(h) {
          const sf = this.selectedField;

          if (!sf.formType) return null;

          if (sf.fieldName === 'tags') {
            return h(
              'biz-team-select',
              {
                props: {
                  multiple: true,
                  value: this.form[sf.fieldName],
                },
                on: {
                  input: event => this.update(event)
                }
              }
            )
          }

          const comp = FormFieldMap.get(sf.formType);
          
          const data = {
            props: {
              field: sf,
              value: this.form[sf.fieldName],
              placeholder: '请选择新的负责人，不选择时将不会修改',
            },
            on: {
              update: event => this.update(event)
            }
          };

          return h(comp.build, data);
        }
      },
      render(h) {
        return (
          <div>
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

  .batch-editing-dialog {

    .base-modal-body {
      padding: 10px 30px 0;
    }

    .form-name, .form-item label {
      width: 70px;
      padding: 0;
      line-height: 32px;
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