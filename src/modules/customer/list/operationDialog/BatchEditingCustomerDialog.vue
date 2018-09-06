<template>

  <base-modal title="批量编辑" :show.sync="batchEditingCustomerDialog" width="600px" class="batch-editing-customer-dialog">
    <el-form ref="editCustomerForm" :model="form" label-width="100px">
      <el-form-item label="修改字段">
        <el-select v-model="selectedFieldName" @change="handleFieldIdChange">
          <el-option v-for="item in editableFields" :label="item.displayName" :value="item.fieldName" :key="item.fieldName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedField.fieldName"
        :rules="selectedField.rules"
        v-if="selectedField.formType === 'text' || selectedField.formType === 'code'">
        <el-input v-model="form[selectedField.fieldName]" :placeholder="selectedField.placeHolder" maxlength="50" type="text"></el-input>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedField.fieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'address'">
        <base-dist-picker v-on:city-selector-change="handleCitySelectorChange" ref="baseDistPicker"></base-dist-picker>
        <el-input placeholder="" v-model="form.address.address" type="text" />
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedField.fieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'tags'">

        <el-select
        v-model="form.tags"
        multiple
        filterable
        remote
        reserve-keyword
        placeholder=""
        :loading="inputRemoteSearch.tag.loading"
        :remote-method="searchTag">
          <el-option
          v-for="item in inputRemoteSearch.tag.options"
          :key="item.id"
          :label="item.tagName"
          :value="item.id">
          </el-option>
        </el-select>

      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedField.fieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'manager' || selectedField.formType === 'user'">
        <el-select
          v-model="form[selectedFieldName]"
          filterable
          remote
          reserve-keyword
          placeholder=""
          :loading="inputRemoteSearch.customerManager.loading"
          :remote-method="searchCustomerManager">
          <el-option
            v-for="item in inputRemoteSearch.customerManager.options"
            :key="item.userId"
            :label="item.displayName"
            :value="item.userId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedField.fieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'selectMulti'">
        <el-select v-model="form[selectedField.fieldName]" multiple placeholder="请选择">
          <el-option
            v-for="item in selectedField.setting.dataSource"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedField.fieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'select'">
        <el-select v-model="form[selectedField.fieldName]" placeholder="请选择">
          <el-option
            v-for="item in selectedField.setting.dataSource"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedField.fieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'textarea'">
        <el-input v-model="form[selectedFieldName]" :placeholder="selectedField.placeHolder" type="textarea" maxlength="500" rows="10" resize="none"></el-input>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedField.fieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'number'">
        <el-input v-model.number="form[selectedFieldName]" :placeholder="selectedField.placeHolder" type="number" maxlength="60"></el-input>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedField.fieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'datetime'">
        <el-date-picker
        v-model="form[selectedFieldName]"
        type="datetime"
        placeholder="选择日期时间"
        default-time="12:00:00">
        </el-date-picker>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedField.fieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'date'">
        <el-date-picker
        v-model="form[selectedFieldName]"
        type="date"
        placeholder="选择日期">
        </el-date-picker>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="batchEditingCustomerDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
  import BaseModal from '../../../../component/common/BaseModal';
  import BaseDistPicker from '../../../../component/common/BaseDistPicker';

  export default {
    name: "batch-editing-customer-dialog",
    data: () => {
      return {
        addressSelector: [],
        inputRemoteSearch: {
          tag: {
            options: [],
            loading: false,
          },
          customerManager: {
            options: [],
            loading: false,
          },

          linkman: {
            options: [],
            loading: false,
          },
          creator: {
            options: [],
            loading: false,
          },
        },

        form: {
          cusName: '',
          lmName: '',
          lmPhone: '',
          address: {
            province: '',
            city: '',
            dist: '',
            address: '',
          },
          tags: [],
          manager: '',
        },
        selectedFieldName: '',
        selectedField: {},
        batchEditingCustomerDialog: false,
        pending: false,
        editableFields: [],
        fixedFieldsCount: 6,
      }
    },
    props: {
      selectedIds: {
        type: Array,
        default: () => ([]),
      },
      fields: {
        type: Array,
        default: () => ([]),
      }
    },
    computed: {
    },
    mounted() {
      console.log('mounted');
      this.buildFields();
    },
    methods: {
      async onSubmit() {
        console.log('submit!');
        try {
          const valid = await this.$refs.editCustomerForm.validate;
          if (!valid) return;

          const params = {
            mapJson: JSON.stringify({
              [this.selectedFieldName]: this.form[this.selectedFieldName],
            }),
            ids: this.selectedIds.join(','),
          };

          const res = await this.$http.post('/customer/editBatch', params, false);

          if (res.status === 0) {
            // success
            this.batchEditingCustomerDialog = false;
          }


        } catch (e) {
          console.error('onSubmit editBatch catch e', e);
        }
      },
      handleCitySelectorChange(city) {
        this.addressSelector = city;
        this.form.address = {
          adProvince: city[0],
          adCity: city[1] || '',
          adDist: city[2] || '',
        }
      },
      handleFieldIdChange() {
        this.editableFields.forEach(ef => {
          if (ef.fieldName === this.selectedFieldName) {
            this.selectedField = ef;
            console.log('this.selectedField', this.selectedField);
          } else {
            this.form[ef.fieldName] = ef.formType === 'selectMulti' ? [] : '';
          }
        });
        this.form.address = {
          province: '',
            city: '',
            dist: '',
            address: '',
        };
        this.form.tags = [];
        this.form.manager = '';

        this.$refs.editCustomerForm.resetFields();
      },
      openBatchEditingCustomerDialog() {
        if (!this.selectedIds.length) {
          return this.$platform.alert('请选择需要批量编辑的客户');
        }
        this.batchEditingCustomerDialog = true;
        this.buildDynamicField();
      },
      buildDynamicField() {
        if (this.editableFields.length > this.fixedFieldsCount) return;
        const customizedField = this.fields
          .filter(f => f.isSystem === 0 && f.formType !== 'attachment')
          .map(f => {
            if (f.formType === 'selectMulti') {
              this.$set(this.form, f.fieldName, []);
            } else {
              this.$set(this.form, f.fieldName, null);
            }

            if (!f.isNull) {
              f.rules = [{
                required: true, message: `请输入${f.displayName}`, trigger: ['blur', 'change']
              },];
            }

            if (f.formType === 'select' && !f.isNull) {
              f.rules = [{
                required: true, message: '必须选择一个选项', trigger: ['blur', 'change']
              },];
            } else if (f.formType === 'selectMulti' && !f.isNull) {
              f.rules = [{
                required: true, message: '请至少选择一个选项', trigger: ['blur', 'change']
              },];
            } else if (f.formType === 'number') {
              f.rules = [{
                required: !f.isNull,
                message: `请输入${f.displayName}`, trigger: ['blur', 'change']
              }, {
                type: 'number',
                message: `请输入数字`, trigger: ['blur', 'change']
              }];
            }

            return f;
          });

        this.editableFields = [...this.editableFields, ...customizedField];
      },
      buildFields() {
        let fixedFields = [{
          fieldName: "cusName",
          formType: "text",
          displayName: '客户名称',
          rules: [{
            required: true, message: `请输入客户名称`, trigger: ['blur', 'change']
          },]
        }, {
          fieldName: "lmName",
          formType: "text",
          displayName: '联系人',
          rules: [{
            required: true, message: `请输入联系人`, trigger: ['blur', 'change']
          },]
        }, {
          fieldName: "lmPhone",
          formType: "text",
          displayName: '电话',
          rules: [{
            required: true, message: `请输入电话`, trigger: ['blur', 'change']
          }, {
            trigger: ['blur', 'change'],
            validator(rule, value, callback) {
              const reg = /^(((0\d{2,3}-{0,1})?\d{7,8})|(1[3578496]\d{9})|([+][0-9-]{1,30}))$/;
              if (!reg.test(value)) {
                callback(new Error('请输入正确的电话'));
              }
              callback();
            }
          }, {
            trigger: ['blur', 'change']
          }]
        }, {
          fieldName: "address",
          formType: "address",
          displayName: '客户地址',
          rules: [{
            trigger: ['blur', 'change'],
            validator(rule, value, callback) {
              if (!value.adProvince || !value.address) {
                callback(new Error('请输入客户地址'));
              }
              callback();
            }
          }]
        }, {
          fieldName: "tags",
          formType: "tags",
          displayName: '服务团队',
          rules: [{
            trigger: ['blur', 'change'],
            required: true, message: '请选择服务团队',
          }]
        }, {
          fieldName: "manager",
          formType: "manager",
          displayName: '客户负责人',
          rules: [{
            trigger: ['blur', 'change'],
            required: true, message: '请选择客户负责人',
          }]

        }];

        this.editableFields = [...fixedFields];
        this.selectedFieldName = this.editableFields[0].fieldName;
        this.selectedField = this.editableFields[0];
      },
      searchTag(keyword) {
        this.inputRemoteSearch.tag.loading = true;
        this.$http.get('/task/tag/list', { keyword: keyword, pageNum: 1, })
          .then(res => {
            this.inputRemoteSearch.tag.options = res.list;
            this.inputRemoteSearch.tag.loading = false;
          })
          .catch(err => console.error('searchTag function catch err', err));
      },
      searchCustomerManager(keyword) {
        this.inputRemoteSearch.customerManager.loading = true;
        this.$http.get('/customer/userTag/list', { keyword: keyword, pageNum: 1, })
          .then(res => {
            this.inputRemoteSearch.customerManager.options = res.list;
            this.inputRemoteSearch.customerManager.loading = false;
          })
          .catch(err => console.error('searchCustomerManager function catch err', err));
      },
    },
    components: {
      [BaseModal.name]: BaseModal,
      [BaseDistPicker.name]: BaseDistPicker,
    }
  }
</script>

<style lang="scss">

  .batch-editing-customer-dialog {

    .base-modal-body {
      padding: 10px;
      padding-right: 100px;
    }

    .el-form-item {
      margin: 0;
      .el-select {
        width: 100%;
      }
      .base-dist-picker {
        margin-bottom: 10px;
      }
    }

    .dialog-footer {
      padding: 10px 50px;
      display: flex;
      justify-content: flex-end;
    }

  }

</style>