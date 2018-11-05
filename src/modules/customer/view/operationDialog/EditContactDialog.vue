<template>
  <base-modal title="添加联系人" :show.sync="addContactDialog" width="500px" @cancel="$emit('submit-success')"
              class="edit-contact-dialog">

    <form @submit.prevent="submit" class="edit-contact-form-container">
      <form-builder :fields="[]" class="edit-contact-form" ref="form" :value="form" @input="update">
        <div>
          <form-item label="姓名" :field="formFields.nameField">
            <form-text :field="formFields.nameField" :value="form.name" @input="update"
                       :placeholder="formFields.nameField.placeholder"></form-text>
          </form-item>
          <form-item label="电话" :field="formFields.lmPhoneField">
            <form-text :field="formFields.lmPhoneField" :value="form.phone" @input="update"
                       :placeholder="formFields.lmPhoneField.placeholder"></form-text>
          </form-item>
        </div>
        <div>
          <form-item label="性别" :field="formFields.genderField">
            <form-select :field="formFields.genderField" :value="form.sex" @input="update"
                         :placeholder="formFields.genderField.placeholder"></form-select>
          </form-item>
          <form-item label="邮箱" :field="formFields.emailField">
            <form-text :field="formFields.emailField" :value="form.email" @input="update"
                       :placeholder="formFields.emailField.placeholder"></form-text>
          </form-item>
        </div>
        <div>
          <form-item label="职位" :field="formFields.positionField">
            <form-text :field="formFields.positionField" :value="form.position" @input="update"
                       :placeholder="formFields.positionField.placeholder"></form-text>
          </form-item>
          <form-item label="部门" :field="formFields.departmentField">
            <form-text :field="formFields.departmentField" :value="form.department" @input="update"
                       :placeholder="formFields.departmentField.placeholder"></form-text>
          </form-item>
        </div>
        <div>
          <form-item label="关联地址" :field="formFields.addressField">
            <form-select :field="formFields.addressField" :value="form.address" @input="update"
                         :placeholder="formFields.addressField.placeholder"></form-select>
          </form-item>
          <form-item label="关联产品" :field="formFields.productField">
            <form-select :field="formFields.productField" :value="form.productId" @input="update"
                         :placeholder="formFields.productField.placeholder"></form-select>
          </form-item>
        </div>
        <div>
          <form-item label="备注" :field="formFields.remarkField">
            <form-textarea :field="formFields.remarkField" :value="form.remark" @input="update"
                           :placeholder="formFields.remarkField.placeholder"></form-textarea>
          </form-item>
        </div>
      </form-builder>

      <div class="dialog-footer">
        <el-button @click="addContactDialog = false">关闭</el-button>
        <el-button native-type="submit" type="primary" :disabled="pending">保存</el-button>
      </div>
    </form>
  </base-modal>
</template>

<script>
  import FormTextarea from "../../../../component/form/components/FormTextarea/FormTextarea";

  export default {
    name: "edit-contact-dialog",
    components: {FormTextarea},
    props: {
      customer: {
        type: Object,
        default: () => ({}),
      },
      originalValue: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      const ctx = this;
      return {
        addContactDialog: false,
        pending: false,
        formFields: {
          nameField: {
            formType: 'text',
            fieldName: 'name',
            displayName: "客户",
            placeholder: '[最多50字]',
            isNull: 0,
          },
          lmPhoneField: {
            formType: 'phone',
            fieldName: 'phone',
            displayName: "电话",
            placeholder: '建议使用手机号,可发送短信通知',
            isNull: 0,
            remote: {
              action: '/linkman/checkUnique4Phone',
              buildParams(val) {
                const params = {
                  phone: val,
                  id: ctx.originalValue.id || '',
                };
                return params;
              }
            }
          },
          genderField: {
            formType: 'selectMulti',
            fieldName: 'sex',
            displayName: "性别",
            placeholder: '请选择',
            isNull: 1,
            setting: {
              dataSource: ['男', '女'],
            }
          },
          emailField: {
            formType: 'email',
            fieldName: 'email',
            displayName: "邮箱",
            placeholder: '',
            isNull: 1,
          },
          positionField: {
            formType: 'text',
            fieldName: 'position',
            displayName: "职位",
            placeholder: '',
            isNull: 1,
          },
          departmentField: {
            formType: 'text',
            fieldName: 'department',
            displayName: "部门",
            placeholder: '',
            isNull: 1,
          },
          remarkField: {
            formType: 'textarea',
            fieldName: 'remark',
            displayName: "备注",
            placeholder: '[最多500字]',
            isNull: 1,
          },
          productField: {
            formType: 'selectMulti',
            fieldName: 'productId',
            displayName: "关联产品",
            placeholder: '请选择',
            isNull: 1,
            setting: {
              isMulti: true,
              dataSource: [],
            }
          },
          addressField: {
            formType: 'selectMulti',
            fieldName: 'address',
            displayName: "关联地址",
            placeholder: '请选择',
            isNull: 1,
            setting: {
              dataSource: [],
            }
          },
        },
        form: {
          name: null,
          remark: '',
          sex: '男',
          position: '',
          department: '',
          address: '', // address的ID
          customId: '',
          customer: {},
          id: '',
          phone: null,
          email: null,
          productId: [], //数组，包含产品对象
        },
        loadData: false,
      }
    },
    computed: {
      action() {
        return this.originalValue.name ? 'edit' : 'create';
      },
      customerId() {
        return this.customer && this.customer.id || '';
      }
    },
    mounted() {
      this.fetchData();

    },
    methods: {
      fetchData() {
        let n = 0;
        let timer = setInterval(() => {
          n++;
          if (this.customer.id) {
            this.fetchProducts();
            this.fetchAddress();

            return clearInterval(timer);
          }
          if (n > 10) {
            return clearInterval(timer);
          }
        }, 1000);
      },
      async submit() {
        try {
          const validateRes = await this.$refs.form.validate();
          if (!validateRes) return;
          this.pending = true;

          const params = {
            ...this.form,
            customer: this.customer,
            productId: this.formFields.productField.setting.dataSource
            .filter(p => this.form.productId.some((pId => pId === p.value)))
            .map(p => ({
              id: p.value,
              name: p.text,
            })),
          };

          if (this.action === 'create') {
            await this.$http.post('/linkman/createByJson', params);
          } else {
            await this.$http.post('/linkman/updateByJson', params);
          }

          this.pending = false;
          this.addContactDialog = false;
          this.reset();

        } catch (e) {
          this.pending = false;
          console.error('addContactDialog submit catch e', e);
        }
      },
      reset() {
        this.form = {
          name: null,
          remark: '',
          sex: '男',
          position: '',
          department: '',
          address: '',
          customId: '',
          customer: {},
          id: '',
          phone: null,
          email: null,
          productId: [],
        };
      },
      update({field, newValue, oldValue}) {
        let {fieldName, displayName} = field;
        if (this.$appConfig.debug) {
          console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
        }
        this.$set(this.form, fieldName, newValue)
      },
      openDialog() {
        this.addContactDialog = true;
        if (this.action === 'edit') {
          this.matchValueToForm(this.originalValue)
        }
      },
      matchValueToForm(val) {
        const {name, remark, sex, position, department, customerId, customer, id, phone, email, address} = val;

        this.form = {
          name,
          remark,
          sex,
          position,
          department,
          address,
          customId: customerId || customer.id,
          customer: customer || {},
          id,
          phone,
          email,
          productId: [],
        };
        if (val.productId && val.productId.length) {
          this.form.productId = val.productId.map(p => p.id);
        }
      },
      fetchAddress() {
        this.$http.get('/v2/customer/address/list', {
          customerId: this.customer.id,
          pageSize: 100000,
          pageNum: 1,
        })
        .then(res => {
          this.formFields.addressField.setting.dataSource = res.list
          .map(p => ({
            text: p.province + p.city + p.dist + p.address,
            value: p.id,
          }));
        })
        .catch(err => console.error('fetchAddress catch err', err));
      },
      fetchProducts() {
        this.$http.get('/v2/customer/product/list', {
          customerId: this.customer.id,
          pageSize: 100000,
          pageNum: 1,
        })
        .then(res => {
          this.formFields.productField.setting.dataSource = res.list
          .map(p => ({
            text: p.name,
            value: p.id,
          }));
        })
        .catch(err => console.error('fetchProducts catch err', err));
      }
    },
  }
</script>

<style lang="scss">

  .edit-contact-dialog {

    .edit-contact-form-container {
      width: 85%;
    }

    .edit-contact-form {

    }

    .dialog-footer {
      text-align: right;
      padding: 10px 30px 20px;
    }
  }

</style>