<template>

  <base-modal title="批量编辑" :show.sync="batchEditingCustomerDialog" width="600px" class="batch-editing-customer-dialog">
    <el-form ref="form" :rules="rules" :model="form" label-width="100px">
      <el-form-item label="修改字段">
        <el-select v-model="selectedFieldId" @change="handleFieldIdChange">
          <el-option v-for="item in editableFields" :label="item.displayName" :value="item.fieldId" :key="item.fieldId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="修改为">
        <template v-if="selectedField.formType === 'text' || selectedField.formType === 'code'">
          <el-input v-model="form[selectedField.fieldId]" :placeholder="selectedField.placeHolder" type="text"></el-input>
        </template>
        <template v-else-if="selectedField.formType === 'address'">
          <base-dist-picker v-on:city-selector-change="handleCitySelectorChange" ref="baseDistPicker"></base-dist-picker>
          <el-input :placeholder="selectedField.placeHolder" type="text"></el-input>
        </template>
        <template v-else-if="selectedField.formType === ''">
          <!--<template v-else-if="selectedField.formType === 'tags'">-->
          <!--<el-select-->
          <!--v-model="form.tags"-->
          <!--multiple-->
          <!--filterable-->
          <!--remote-->
          <!--reserve-keyword-->
          <!--placeholder="请输入关键词"-->
          <!--:loading="inputRemoteSearch.tag.loading"-->
          <!--:remote-method="searchTag">-->
          <!--<el-option-->
          <!--v-for="item in inputRemoteSearch.tag.options"-->
          <!--:key="item.id"-->
          <!--:label="item.tagName"-->
          <!--:value="item.id">-->
          <!--</el-option>-->
          <!--</el-select>-->
          <!--</template>-->
        </template>
        <template v-else-if="selectedField.formType === 'manager'">
          <el-select
            v-model="form.manager"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :loading="inputRemoteSearch.customerManager.loading"
            :remote-method="searchCustomerManager">
            <el-option
              v-for="item in inputRemoteSearch.customerManager.options"
              :key="item.userId"
              :label="item.displayName"
              :value="item.userId">
            </el-option>
          </el-select>
        </template>
        <template v-else-if="selectedField.formType === 'user'">
          <el-select
            v-model="form[selectedField.fieldId]"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :loading="inputRemoteSearch.customerManager.loading"
            :remote-method="searchCustomerManager">
            <el-option
              v-for="item in inputRemoteSearch.customerManager.options"
              :key="item.userId"
              :label="item.displayName"
              :value="item.userId">
            </el-option>
          </el-select>
        </template>
        <template v-else-if="selectedField.formType === 'selectMulti'">
          <el-select v-model="form[selectedField.fieldId]" multiple placeholder="请选择">
            <el-option
              v-for="item in selectedField.setting.dataSource"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </template>
        <template v-else-if="selectedField.formType === 'select'">
          <el-select v-model="form[selectedField.fieldId]" placeholder="请选择">
            <el-option
              v-for="item in selectedField.setting.dataSource"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </template>
        <template v-else-if="selectedField.formType === 'textarea'">
          <el-input v-model="form[selectedField]" :placeholder="selectedField.placeHolder" type="textarea"></el-input>
        </template>
        <template v-else-if="selectedField.formType === 'number'">
          <el-input v-model="form[selectedField]" :placeholder="selectedField.placeHolder" type="number"></el-input>
        </template>
        <template v-else-if="selectedField.formType === 'datetime'">
          <el-date-picker
            v-model="form[selectedField]"
            type="datetime"
            placeholder="选择日期时间"
            default-time="12:00:00">
          </el-date-picker>
        </template>
        <template v-else-if="selectedField.formType === 'date'">
          <el-date-picker
            v-model="form[selectedField]"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </template>
        <template v-else>
        </template>
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
          cusAddress: '',
          tags: [],
          manager: '',
        },
        selectedFieldId: '',
        selectedField: {},
        batchEditingCustomerDialog: false,
        pending: false,
        editableFields: [],
        rules: {},
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
      handleCitySelectorChange(city) {
        this.addressSelector = city;
      },
      handleFieldIdChange() {
        this.editableFields.forEach(ef => {
          if (ef.fieldId === this.selectedFieldId) {
            this.selectedField = ef;
          } else {
            console.log('1 ef', ef);
            this.form[ef.fieldId] = '';
          }
        });
      },
      openBatchEditingCustomerDialog() {
        if (!this.selectedIds.length) {
          return this.$platform.alert('请选择需要批量编辑的客户');
        }
        this.batchEditingCustomerDialog = true;
        this.buildDynamicField();
      },
      onSubmit() {
        console.log('submit!');
      },
      buildDynamicField() {

        const customizedField = this.fields
          .filter(f => f.isSystem === 0 && f.formType !== 'attachment')
          .map(f => {
            this.$set(this.form, f.fieldId, null);
            if (f.formType === 'selectMulti') {
              this.$set(this.form, f.fieldId, []);
            }
            return f;
          });

        this.editableFields = [...this.editableFields, ...customizedField];
      },
      buildFields() {
        let fixedFields = [{
          fieldId: "cusName",
          formType: "text",
          displayName: '客户名称',
        }, {
          fieldId: "lmName",
          formType: "text",
          displayName: '联系人',
        }, {
          fieldId: "lmPhone",
          formType: "text",
          displayName: '电话',
        }, {
          fieldId: "cusAddress",
          formType: "address",
          displayName: '客户地址',
        }, {
          fieldId: "tags",
          formType: "tags",
          displayName: '服务团队',
        }, {
          fieldId: "manager",
          formType: "manager",
          displayName: '客户负责人',
        }];

        this.editableFields = [...fixedFields];
        this.selectedFieldId = this.editableFields[0].fieldId;
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
    }

    .el-form-item {
      margin: 0;
    }

    .dialog-footer {
      padding: 10px 50px;
      display: flex;
      justify-content: flex-end;
    }

  }

</style>