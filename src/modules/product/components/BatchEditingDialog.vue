<template>
  <base-modal title="批量编辑" @closed="reset" :show.sync="batchEditingCustomerDialog" width="500px"
              class="batch-editing-customer-dialog">
    <el-form ref="editCustomerForm" :model="form" label-width="100px">
      <el-form-item label="修改字段">
        <el-select v-model="selectedFieldName" @change="handleFieldIdChange">
          <el-option v-for="item in editableFields" :label="item.displayName" :value="item.fieldName"
                     :key="item.fieldName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedFieldName"
        :key="selectedFieldName"
        :rules="selectedField.rules"
        v-if="selectedField.formType === 'text' && selectedField.fieldName === 'customer'">
        <el-select
          v-model="form[selectedFieldName]"
          filterable
          remote
          reserve-keyword
          placeholder="请输入关键词搜索"
          clearable
          :loading="inputRemoteSearch.customer.loading"
          :remote-method="searchCustomer">
          <el-option
            v-for="item in inputRemoteSearch.customer.options"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="修改为"
        :prop="selectedFieldName"
        :key="selectedFieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'text' || selectedField.formType === 'code' || selectedField.formType === 'phone'">
        <el-input v-model="form[selectedField.fieldName]" :placeholder="selectedField.placeHolder" maxlength="50"
                  type="text"></el-input>
      </el-form-item>

      <el-form-item
        label="修改为"
        :prop="selectedFieldName"
        :key="selectedFieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'user'">
        <el-select
          v-model="form[selectedFieldName]"
          filterable
          remote
          reserve-keyword
          placeholder="请输入关键词搜索"
          clearable
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
        :prop="selectedFieldName"
        :key="selectedFieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'select' && selectedField.setting.isMulti">
        <el-select v-model="form[selectedField.fieldName]" multiple clearable placeholder="请选择">
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
        :prop="selectedFieldName"
        :key="selectedFieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'select' && selectedField.fieldName === 'type'">
        <el-select v-model="form[selectedField.fieldName]" clearable :placeholder="selectedField.placeHolder">
          <el-option
            v-for="item in productTypes"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="修改为"
        :prop="selectedFieldName"
        :key="selectedFieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'select'">
        <el-select v-model="form[selectedField.fieldName]" clearable :placeholder="selectedField.placeHolder || '请选择'">
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
        :prop="selectedFieldName"
        :key="selectedFieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'textarea'">
        <el-input v-model="form[selectedFieldName]" :placeholder="selectedField.placeHolder" type="textarea"
                  maxlength="500" rows="5" resize="none"></el-input>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedFieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'number'">
        <el-input v-model.number="form[selectedFieldName]" :placeholder="selectedField.placeHolder" type="number"
                  maxlength="60"></el-input>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedFieldName"
        :key="selectedFieldName"
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
        :prop="selectedFieldName"
        :key="selectedFieldName"
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
import {formatDate } from '@src/util/lang';
import { editBatchProduct } from '@src/api/ProductApi';
import {searchCustomer} from '@src/api/EcSearchApi.js';

export default {
  name: 'batch-editing-dialog',
  props: {
    selectedIds: {
      type: Array,
      default: () => ([]),
    },
    fields: {
      type: Array,
      default: () => ([]),
    },
    productTypes: {
      type: Array,
      default: () => ([]),
    },
  },
  data: () => {
    return {
      inputRemoteSearch: {
        customer: {
          options: [],
          loading: false,
        },
        customerManager: {
          options: [],
          loading: false,
        },
      },
      form: {},
      selectedFieldName: '',
      batchEditingCustomerDialog: false,
      pending: false,
      editableFields: [],
      fixedFieldsCount: 0,
      /** @deprecated */
      formBackup: {},
    }
  },
  watch: {
    form: {
      handler(newValue) {
        if (this.selectedField.formType === 'user' && !newValue[this.selectedField.fieldName]) {
          this.inputRemoteSearch.customerManager.options = [];
        }
      },
      deep: true
    }
  },
  computed: {
    selectedField() {
      return this.editableFields.filter(ef => ef.fieldName === this.selectedFieldName)[0] || {};
    }
  },
  methods: {
    async onSubmit() {
      try {
        const valid = await this.$refs.editCustomerForm.validate();
        if (!valid) return;

        this.pending = true;
        const params = this.buildParams();

        const res = await editBatchProduct(params);

        if (!res.status) {
          this.$emit('submit-callback');
        }

        if (res.status === 1 && res.message) {
          this.$platform.notification({
            title: '失败',
            type: 'error',
            message: res.message
          });
        }

        this.batchEditingCustomerDialog = false;
        this.pending = false;
      } catch (e) {
        if (e !== false) {
          this.batchEditingCustomerDialog = false;
          this.pending = false;
        }
        console.error('onSubmit editBatch catch e', e);
      }
    },
    reset() {
      this.selectedFieldName = this.editableFields[0].fieldName;
      this.form = JSON.parse(JSON.stringify(this.formBackup));
      this.$refs.editCustomerForm.resetFields();
    },
    handleFieldIdChange() {
      this.$nextTick(() => {
        this.form = JSON.parse(JSON.stringify(this.formBackup));
        this.$refs.editCustomerForm.resetFields();
      });
    },
    openBatchEditingDialog() {
      if (!this.selectedIds.length) {
        return this.$platform.alert('请选择需要批量编辑的产品');
      }
      this.batchEditingCustomerDialog = true;
      this.buildDynamicField();
      this.selectedFieldName = this.editableFields[0].fieldName;
    },
    buildDynamicField() {
      if (this.editableFields.length > this.fixedFieldsCount) return;
      const customizedField = this.fields
        .filter(f => {
          return (
            f.formType !== 'attachment' 
            && f.formType !== 'location'
            && !['updateTime', 'productTemplate', 'tags', 'remindCount', 'qrcodeId'].some(key => key === f.fieldName)
          )
        })
        .map(f => {
          if (f.formType === 'select' && f.setting.isMulti) {
            this.$set(this.form, f.fieldName, []);
          }

          if (f.formType === 'select' && !f.setting.isMulti) {
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
              message: '请输入数字', trigger: ['blur', 'change']
            }];
          }

          return f;
        });

      // 空的form对象方便 reset form
      this.formBackup = JSON.parse(JSON.stringify(this.form));

      this.editableFields = [...this.editableFields, ...customizedField];
    },
    buildParams() {
      let tv = null;
      let params = {
        mapJson: JSON.stringify({
          [this.selectedFieldName]: this.form[this.selectedFieldName],
        }),
        ids: this.selectedIds.join(','),
      };

      if (this.selectedField.formType === 'user') {
        tv = this.inputRemoteSearch.customerManager.options
          .filter(cm => cm.userId === this.form[this.selectedFieldName])[0] || {};

        params.mapJson = JSON.stringify({
          [this.selectedFieldName]: {
            userId: tv.userId,
            displayName: tv.displayName,
            staffId: tv.staffId,
            head: tv.head,
          },
        })
      }
      if (this.selectedField.formType === 'datetime') {
        tv = this.form[this.selectedFieldName];
        params.mapJson = JSON.stringify({
          [this.selectedFieldName]: formatDate(tv, 'YYYY-MM-DD HH:mm:ss'),
        })
      }
      if (this.selectedField.formType === 'date') {
        tv = this.form[this.selectedFieldName];
        params.mapJson = JSON.stringify({
          [this.selectedFieldName]: formatDate(tv, 'YYYY-MM-DD'),
        })
      }
      return params;
    },
    searchCustomerManager(keyword) {
      this.inputRemoteSearch.customerManager.loading = true;
      this.$http.get('/customer/userTag/list', {keyword, pageNum: 1, })
        .then(res => {
          this.inputRemoteSearch.customerManager.options = res.list;
          this.inputRemoteSearch.customerManager.loading = false;
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },
    searchCustomer(keyword) {
      this.inputRemoteSearch.customer.loading = true;
      searchCustomer({keyword, page: 1, })
        .then(res => {

          if(!res || res.stauts) {
            this.inputRemoteSearch.customer.options = [];
            this.inputRemoteSearch.customer.loading = false;
            return res;
          }

          this.inputRemoteSearch.customer.options = res.data.list;
          this.inputRemoteSearch.customer.loading = false;
          return res;
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },
  },
}
</script>

<style lang="scss">

  .batch-editing-customer-dialog {

    .base-modal-body {
      padding: 10px 30px 0;
    }

    .el-form-item.is-required .el-form-item__label:before {
      content: '';
    }

    .el-form-item {
      margin: 0;

      .el-select, .el-date-editor.el-input {
        width: 100%;
      }
      .base-dist-picker {
        margin-bottom: 10px;
      }

      .el-form-item__error {
        line-height: 24px;
      }
    }

    .address-picker {
      display: flex;
      justify-content: space-between;

      .el-cascader {
        width: 250px;
      }

    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
    }

  }

</style>
