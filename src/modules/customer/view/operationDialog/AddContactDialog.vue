<template>
  <base-modal title="添加联系人" :show.sync="addContactDialog" width="500px"
              class="add-contact-dialog">

    <form @submit.prevent="submit" class="add-contact-form-container">
      <form-builder :fields="[]" class="add-contact-form" ref="form" :value="form" @input="update">
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
            <form-select :field="formFields.genderField" :value="form.gender" @input="update"
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
          <form-item label="关联地址" :field="formFields.genderField">
            <form-select :field="formFields.genderField" :value="form.gender" @input="update"
                         :placeholder="formFields.genderField.placeholder"></form-select>
          </form-item>
          <form-item label="关联产品" :field="formFields.genderField">
            <form-select :field="formFields.genderField" :value="form.gender" @input="update"
                         :placeholder="formFields.genderField.placeholder"></form-select>
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
    name: "add-contact-dialog",
    components: {FormTextarea},
    props: {
      customer: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
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
            remoteValidation: {
              action: '/linkman/checkUnique4Phone',
              buildParams() {
                const params = {
                  phone: '',
                };
                return params;
              }
            },
          },
          genderField: {
            formType: 'selectMulti',
            fieldName: 'gender',
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

        },
        form: {
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
        },
      }
    },
    computed: {
      customerId() {
        return this.customer && this.customer.id || '';
      }
    },
    mounted() {
    },
    methods: {
      async submit() {
        try {
          const validateRes = await this.$refs.form.validate();
          if (!validateRes) return;
          this.pending = true;

          const params = {
            ...this.form,
            customer: this.customer,
          };

          await this.$http.post('/linkman/createByJson', params);

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
      },
    },
  }
</script>

<style lang="scss">

  .add-contact-dialog {

    .add-contact-form-container {
      width: 85%;
    }

    .add-contact-form {

    }

    .dialog-footer {
      text-align: right;
      padding: 10px 30px 20px;
    }
  }

</style>