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
        v-if="selectedField.formType === 'text' || selectedField.formType === 'code'">
        <el-input v-model="form[selectedField.fieldName]" :placeholder="selectedField.placeHolder" maxlength="50"
                  type="text"></el-input>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedFieldName"
        :key="selectedFieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'address'">
        <div class="address-picker">
          <base-dist-picker @input="handleCitySelectorChange" ref="baseDistPicker" :value="form.address.adAddress"></base-dist-picker>
          <el-button type="button" @click="chooseMap" style="margin-bottom: 10px">地图选址</el-button>
        </div>
        <el-input placeholder="" @input="handleAddressChange" :value="form.address.detail" type="text"/>
      </el-form-item>
      <el-form-item
        label="修改为"
        :prop="selectedFieldName"
        :key="selectedFieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'tags'">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          remote
          reserve-keyword
          clearable
          placeholder="请输入关键词搜索"
          @change="selectTag"
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
        :prop="selectedFieldName"
        :key="selectedFieldName"
        :rules="selectedField.rules"
        v-else-if="selectedField.formType === 'manager' || selectedField.formType === 'user'">
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
        v-else-if="selectedField.formType === 'selectMulti'">
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
        v-else-if="selectedField.formType === 'select'">
        <el-select v-model="form[selectedField.fieldName]" clearable placeholder="请选择">
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
                  maxlength="500" rows="10" resize="none"></el-input>
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
import {formatDate,} from '@src/util/lang';

export default {
  name: "batch-editing-customer-dialog",
  data: () => {
    return {
      inputRemoteSearch: {
        tag: {
          options: [],
          loading: false,
        },
        customerManager: {
          options: [],
          loading: false,
        },
      },
      addressBackup: {},
      form: {
        cusName: '',
        lmName: '',
        lmPhone: '',
        address: {
          adAddress: [],
          detail: '',
          addressType: 0,
          latitude: '',
          longitude: '',
        },
        tags: [],
        manager: '',
      },
      selectedFieldName: '',
      batchEditingCustomerDialog: false,
      pending: false,
      editableFields: [],
      fixedFieldsCount: 6,
      selectedTags: [],
      formBackup: {},
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
    },
    defaultAddress: {
      type: Array,
      default: () => ([]),
    }
  },
  watch: {
    defaultAddress: {
      handler: function(newValue) {
        this.form.address.adAddress = newValue;
      },
      deep: true
    }
  },
  computed: {
    selectedField() {
      return this.editableFields.filter(ef => ef.fieldName === this.selectedFieldName)[0] || {};
    }
  },
  mounted() {
    this.buildFields();
  },
  methods: {
    async onSubmit() {
      try {
        const valid = await this.$refs.editCustomerForm.validate();
        if (!valid) return;

        this.pending = true;
        const params = this.buildParams();

        const res = await this.$http.post('/customer/editBatch', params, false);

        if (res.status === 0) {
          this.$emit('submit-callback');
        }

        if (res.status === 1 && res.message) {
          this.$platform.alert(res.message);
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
    handleAddressChange(val) {
      const newVal = {
        adAddress: this.form.address.adAddress,
        detail: val,
        latitude: '',
        longitude: '',
        addressType: 0,
      };

      if (this.diffAddress(newVal, this.addressBackup)) {
        this.form.address = this.addressBackup;
      }
      this.form.address = newVal;
    },
    handleCitySelectorChange(val) {
      const newVal = {
        detail: this.form.address.detail,
        adAddress: val,
        latitude: '',
        longitude: '',
        addressType: 0,
      };

      if (this.diffAddress(newVal, this.addressBackup)) {
        this.form.address = this.addressBackup;
      }
      this.form.address = newVal;
    },
    diffAddress(newVal, oldVal) {
      if (newVal.detail === oldVal.detail &&
          newVal.adAddress.toString() === oldVal.adAddress.toString()) {
        return true;
      }
      return false;
    },
    handleFieldIdChange() {
      this.$nextTick(() => {
        this.form = JSON.parse(JSON.stringify(this.formBackup));
        this.$refs.editCustomerForm.resetFields();
      });
    },
    openBatchEditingCustomerDialog() {
      if (!this.selectedIds.length) {
        return this.$platform.alert('请选择需要批量编辑的客户');
      }
      this.batchEditingCustomerDialog = true;
      this.buildDynamicField();
    },
    selectTag(val) {
      const ts = this.inputRemoteSearch.tag.options;
      this.selectedTags = ts
        .filter(t => val.some(v => v === t.id))
        .map(t => ({
          id: t.id,
          tagName: t.tagName,
        }));
    },
    chooseMap() {
      let defaultArea = this.form.address.adAddress.filter(a => a !== '郊县' && a !== '市辖区' && a.indexOf('其他') === -1);

      this.$fast.map.picker({}, { defaultArea: defaultArea[defaultArea.length - 1]}).then(result => {

        if (result.status === 1) return;

        const { province, city, dist, address, latitude, longitude} = result.data;

        const newVal = {
          adAddress: [ province, city, dist,],
          detail: address,
          latitude,
          longitude,
          addressType: 1,
        };
        this.form.address = newVal;
        this.addressBackup = newVal;
      })
        .catch(err => console.error(err));
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

      this.formBackup = JSON.parse(JSON.stringify(this.form));
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
            if (value.adAddress.length < 2 || !value.detail) {
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
          trigger: ['change'],
          required: true, message: '请选择客户负责人',
        }]

      }];

      this.editableFields = [...fixedFields];
      this.selectedFieldName = this.editableFields[0].fieldName;
    },
    buildParams() {
      let tv = null;
      let params = {
        mapJson: JSON.stringify({
          [this.selectedFieldName]: this.form[this.selectedFieldName],
        }),
        ids: this.selectedIds.join(','),
      };

      if (this.selectedFieldName === 'tags') {
        params.mapJson = JSON.stringify({
          [this.selectedFieldName]: this.selectedTags,
        })
      }
      if (this.selectedFieldName === 'manager' || this.selectedField.formType === 'user') {
        tv = this.inputRemoteSearch.customerManager.options
          .filter(cm => cm.userId === this.form[this.selectedFieldName])[0] || {};

        params.mapJson = JSON.stringify({
          [this.selectedFieldName]: {
            id: tv.userId,
            name: tv.displayName,
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

      if (this.selectedField.formType === 'address') {
        tv = this.form[this.selectedFieldName];
        params.mapJson = JSON.stringify({
          [this.selectedFieldName]: {
            province: tv.adAddress[0] || '',
            city: tv.adAddress[1] || '',
            dist: tv.adAddress[2] || '',
            address: tv.detail,
            addressType: tv.addressType,
            latitude: tv.latitude,
            longitude: tv.longitude,
          },
        })
      }
      return params;
    },
    searchTag(keyword) {
      this.inputRemoteSearch.tag.loading = true;
      this.$http.get('/task/tag/list', {keyword: keyword, pageNum: 1,})
        .then(res => {
          this.inputRemoteSearch.tag.options = res.list;
          this.inputRemoteSearch.tag.loading = false;
        })
        .catch(err => console.error('searchTag function catch err', err));
    },
    searchCustomerManager(keyword) {
      this.inputRemoteSearch.customerManager.loading = true;
      this.$http.get('/customer/userTag/list', {keyword: keyword, pageNum: 1,})
        .then(res => {
          this.inputRemoteSearch.customerManager.options = res.list;
          this.inputRemoteSearch.customerManager.loading = false;
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },
  },
}
</script>

<style lang="scss">

  .batch-editing-customer-dialog {

    .base-modal-body {
      padding: 10px;
      padding-right: 50px;
    }

    .el-form-item.is-required .el-form-item__label:before {
      content: '';
    }

    .el-form-item {
      margin: 0;

      .el-select {
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
      padding: 10px 50px;
      display: flex;
      justify-content: flex-end;
    }

  }

</style>