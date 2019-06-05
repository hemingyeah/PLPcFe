<template>
  <!-- <div class="batch-edit-product-template-dialog"> -->
    <!-- start 批量编辑弹窗 -->
    <base-modal 
      title="批量编辑" 
      @closed="reset" 
      :show.sync="batchEditProductTemplateDialog" 
      width="500px"
      class="batch-edit-product-template-dialog">

      <!-- start form 表单 -->
      <el-form ref="editProductTemplateForm" :model="form" label-width="100px">

        <!-- start 修改字段 -->
        <el-form-item label="修改字段">
          <el-select v-model="selectedFieldName" @change="handleFieldIdChange">
            <el-option 
              v-for="item in editableFields" 
              :label="item.displayName" 
              :value="item.fieldName"
              :key="`${item.fieldName}${Math.random()}`">
            </el-option>
          </el-select>
        </el-form-item>
        <!-- end 修改字段 -->

        <!-- start 修改字段类型列表 -->
        <el-form-item
          label="修改为"
          :prop="selectedFieldName"
          :key="selectedFieldName"
          :rules="selectedField.rules"
          v-if="selectedField.formType === 'text' || selectedField.formType === 'code' || selectedField.formType === 'phone' || selectedField.formType === 'email'">
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
          <el-input :placeholder="selectedField.placeHolder" @input="handleAddressChange" :value="form.address.detail" type="text"/>
        </el-form-item>
        <el-form-item
          label="修改为"
          :prop="selectedFieldName"
          :key="selectedFieldName"
          :rules="selectedField.rules"
          v-else-if="selectedField.formType === 'tags'">
          <!-- <biz-team-select v-model="form.tags" multiple/> -->
          <el-select
            v-model="form.tags"
            multiple
            filterable
            clearable
            :placeholder="selectedField.placeHolder || '请输入关键字搜索'"
            @change="selectTag"
          >
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
            :placeholder="selectedField.placeHolder || '请输入关键字搜索'"
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
          v-else-if="selectedField.formType === 'select' && selectedField.setting && !selectedField.setting.isMulti">
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
          v-else-if="selectedField.formType === 'select' && selectedField.setting && selectedField.setting.isMulti">
          <el-select v-model="form[selectedField.fieldName]" multiple clearable :placeholder="selectedField.placeHolder || '请选择'">
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
            :placeholder="selectedField.placeHolder || '选择日期时间'"
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
            :placeholder="selectedField.placeHolder || '选择日期'">
          </el-date-picker>
        </el-form-item>
        <!-- end 修改字段类型列表 -->

      </el-form>
      <!-- end form 表单 -->

      <!-- start 底部  -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchEditProductTemplateDialog = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
      </div>
      <!-- end 底部 -->

    </base-modal>
    <!-- end 批量编辑弹窗 -->
  <!-- </div> -->
</template>

<script>

import { productTemplateEditBatch } from '@src/api/ProductApi.js';
import { formatDate } from '@src/util/lang';
import platform from '@src/platform';

export default {
  name: 'batch-edit-product-template-dialog',
  props: {
    // 选择的id列表
    selectedIds: {
      type: Array,
      default: () => ([]),
    },
    // 字段列表
    fields: {
      type: Array,
      default: () => ([]),
    },
    // 初始化数据
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      batchEditProductTemplateDialog: false, // 批量编辑弹窗显示
      editableFields: [], // 需要修改的字段列表
      form: {
        name: '',
        serialNumber: '',
        type: '',
      },
      formBackup: {}, // form 备份数据
      fixedFieldsCount: 3,
      inputRemoteSearch: {
        tag: {
          options: [],
          loading: false,
        },
        customerManager: {
          options: [],
          loading: false,
        },
      }, // input 远程搜索
      selectedFieldName: '', // 当前选择字段名字
      pending: false, // 等待状态
    }
  },
  computed: {
    selectedField() {
      let field = this.editableFields.filter(ef => ef.fieldName === this.selectedFieldName)[0] || {};
      return field;
    }
  },
  watch: {
    form: {
      handler(newValue) {
        if ((this.selectedField.formType === 'manager' || this.selectedField.formType === 'user') && !newValue[this.selectedField.fieldName]) {
          this.inputRemoteSearch.customerManager.options = [];
        }
      },
      deep: true
    }
  },
  mounted() {
  },
  methods: {
    // 构建自定义字段列表
    buildCustomizeField() {
      if (this.editableFields.length > this.fixedFieldsCount) return;

      let formTypes = ['attachment', 'separator', 'location'];

      const customizedField = this.fields
        .filter(f => {
          return (
            !f.isSystem
            && f.fieldName.indexOf('customer') < 0 
            && formTypes.indexOf(f.formType) < 0
          )
        })
        .map(field => {
          // select
          if (field.formType === 'select' && field.setting && field.setting.isMulti) {
            this.$set(this.form, field.fieldName, []);
          } else {
            this.$set(this.form, field.fieldName, null);
          }
          // 系统字段
          if (!field.isNull) {
            field.rules = [{
              required: true, message: `请输入${field.displayName}`, trigger: ['blur', 'change']
            }];
          }
          // type 类型
          if(field.fieldName == 'type') {
            field.setting.dataSource = (this.initData.productConfig && this.initData.productConfig.productType) || [];
          }
          // select && 系统字段
          if (field.formType === 'select' && !field.isNull && field.setting && !field.setting.isMulti) {
            field.rules = [{
              required: true, message: '必须选择一个选项', trigger: ['blur', 'change']
            }];
          }
          // 多选 && 系统字段
          else if (field.formType === 'select' && !field.isNull && field.setting && field.setting.isMulti) {
            field.rules = [{
              required: true, message: '请至少选择一个选项', trigger: ['blur', 'change']
            }];
          }
          // number
          else if (field.formType === 'number') {
            field.rules = [{
              required: !field.isNull,
              message: `请输入${field.displayName}`, trigger: ['blur', 'change']
            }, {
              type: 'number',
              message: '请输入数字', trigger: ['blur', 'change']
            }];
          }
          // phone 
          else if (field.formType === 'phone') {
            field.rules = [
              {
                required: !field.isNull, message: '请输入电话', trigger: ['blur', 'change']
              },
              {
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
              }
            ]
          }
          // email 
          else if (field.formType === 'email') {
            field.rules = [
              {
                required: !field.isNull, message: '请输入邮箱', trigger: ['blur', 'change']
              }, {
                trigger: ['blur', 'change'],
                validator(rule, value, callback) {
                  const reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
                  if (!reg.test(value)) {
                    callback(new Error('请输入正确的邮箱'));
                  }
                  callback();
                }
              }, {
                trigger: ['blur', 'change']
              }
            ]
          }

          return field;
        });

      this.formBackup = JSON.parse(JSON.stringify(this.form));
      this.editableFields = [...this.editableFields, ...customizedField].slice();
      this.selectedFieldName = this.editableFields[0].fieldName;
    },
    //  构建参数
    buildParams() {
      let tv = null;
      let params = {
        mapJson: JSON.stringify({
          [this.selectedFieldName]: this.form[this.selectedFieldName],
        }),
        ids: this.selectedIds.join(','),
      };
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

      return params;
    },
    // 修改字段变化
    handleFieldIdChange() {
      this.$nextTick(() => {
        this.form = JSON.parse(JSON.stringify(this.formBackup));
        this.$refs.editProductTemplateForm.resetFields();
      });
    },
    // 打开
    open() {
      if(this.selectedIds.length <= 0) {
        return platform.alert('请选择需要批量编辑的产品');
      }

      this.batchEditProductTemplateDialog = true;
      this.buildCustomizeField();
      this.searchTag();
    },
    // TODO: 提交
    async onSubmit() {
      try {
        const valid = await this.$refs.editProductTemplateForm.validate();
        if (!valid) return;

        this.pending = true;
        const params = this.buildParams();

        const result = await productTemplateEditBatch(params);

        if (result.status === 0) {
          this.$emit('submit-callback');
          this.batchEditProductTemplateDialog = false;
          this.pending = false;
        }
        const isSucc = (result.status == 0);

        this.$platform.notification({
          title: `批量编辑${this.selectedField.displayName}${ isSucc ? '成功' : '失败' }`,
          message: !isSucc && result.message,
          type: isSucc ? 'success' : 'error',
        });


      } catch (e) {
        if (e !== false) {
          this.batchEditProductTemplateDialog = false;
          this.pending = false;
        }
        console.error('onSubmit EditProductTemplate catch e', e);
      }
    },
    // 关闭弹窗后 重置
    reset() {
      this.selectedFieldName = this.editableFields[0].fieldName;
      this.form = JSON.parse(JSON.stringify(this.formBackup));
      this.$refs.editProductTemplateForm.resetFields();
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
    // 搜索团队
    searchTag(keyword) {
      this.inputRemoteSearch.tag.loading = true;
      this.$http.get('/task/tag/list', {keyword: keyword, pageNum: 1, pageSize: 100 * 100, })
        .then(res => {
          this.inputRemoteSearch.tag.options = res.list;
          this.inputRemoteSearch.tag.loading = false;
        })
        .catch(err => console.error('searchTag function catch err', err));
    },
    // 搜索客户管理员
    searchCustomerManager(keyword) {
      this.inputRemoteSearch.customerManager.loading = true;
      this.$http.get('/customer/userTag/list', {keyword: keyword, pageNum: 1,})
        .then(res => {
          this.inputRemoteSearch.customerManager.options = res.list;
          this.inputRemoteSearch.customerManager.loading = false;
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },
  }
}
</script>

<style lang="scss">
  .batch-edit-product-template-dialog {

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