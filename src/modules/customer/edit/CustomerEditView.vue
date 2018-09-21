<template>
  <div class="customer-container">
    <form @submit.prevent="submit" style="width: 640px;">
      <div class="btn-group-container">
        <el-button><i class="iconfont icon-shuaxin"></i>返回</el-button>
        <el-button native-type="submit" type="primary"><i class="iconfont icon-chulizhong"></i>提交</el-button>
      </div>
      <div class="line"></div>
      <form-builder ref="form" :fields="fields" :value="form" @input="update">
        <form-item label="客户编号" :field="baseField.serialNumberField">
          <form-text :field="baseField.serialNumberField" :value="form.serialNumber" @input="update"
                     :placeholder="baseField.serialNumberField.placeholder"></form-text>
        </form-item>
        <form-item label="客户" :field="baseField.nameField">
          <form-text :field="baseField.nameField" :value="form.name" @input="update"
                     :placeholder="baseField.nameField.placeholder"></form-text>
        </form-item>
        <form-item label="联系人" :field="baseField.lmNameField">
          <div class="input-and-btn">
            <form-text :field="baseField.lmNameField" :value="form.lmName" @input="update"
                       :placeholder="baseField.lmNameField.placeholder"></form-text>
            <el-button @click="copyName">同名客户</el-button>
          </div>
        </form-item>
        <form-item label="电话" :field="baseField.lmPhoneField">
          <form-text :field="baseField.lmPhoneField" :value="form.lmPhone" @input="update"
                     :placeholder="baseField.lmPhoneField.placeholder"></form-text>
        </form-item>
        <form-item label="地址" :field="baseField.addressField">
          <form-address :field="baseField.addressField" :value="form.customerAddress" @input="update"
                        :placeholder="baseField.addressField.placeholder"></form-address>
        </form-item>
        <form-item label="服务团队" :field="baseField.tagField">
          <div class="input-and-btn">
            <form-text :field="baseField.tagField" :value="form.tags" @input="update"
                       :placeholder="baseField.tagField.placeholder"></form-text>
            <el-button type="button">自动分配</el-button>
          </div>
        </form-item>
        <form-item label="客户负责人" :field="baseField.customerManagerField">
          <form-user :field="baseField.customerManagerField" :value="form.customerManager" @input="update"
                     :placeholder="baseField.customerManagerField.placeholder"></form-user>
        </form-item>
      </form-builder>
    </form>
  </div>
</template>

<script>
  import * as FormUtil from '@src/component/form/util';
  import formatCustomer from '@src/util/customer';
  import BaseDistPicker from '@src/component/common/BaseDistPicker';
  import FormText from "@src/component/form/components/FormText/FormText";
  import FormUser from "@src/component/form/components/FormUser/FormUser";

  export default {
    name: 'customer-edit-view',
    components: {FormText, BaseDistPicker, FormUser,},
    props: {
      initData: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        baseField: {
          serialNumberField: {
            formType: 'text',
            fieldName: 'serialNumber',
            displayName: "客户编号",
            placeholder: '[最多50字]',
            isNull: 0,
            remoteValidation: {
              action: '/customer/unique',
              buildParams() {
                const params = {
                  id: '',
                  fieldName: 'serialNumber',
                };
                return params;
              }
            },
          },
          nameField: {
            formType: 'text',
            fieldName: 'name',
            displayName: "客户",
            placeholder: '[最多50字]',
            isNull: 0,
            remoteValidation: {
              action: '/customer/unique',
              buildParams() {
                const params = {
                  id: '',
                  fieldName: 'name',
                };
                return params;
              }
            },
          },
          lmNameField: {
            formType: 'text',
            fieldName: 'lmName',
            displayName: "联系人",
            placeholder: '[最多50字]',
            isNull: 0,
          },
          lmPhoneField: {
            formType: 'phone',
            fieldName: 'lmPhone',
            displayName: "电话",
            placeholder: '建议使用手机号,可发送短信通知',
            isNull: 0,
          },
          addressField: {
            formType: 'address',
            fieldName: 'customerAddress',
            displayName: "地址",
            placeholder: '请输入详细地址[最多50字]',
            isNull: 0,
          },
          tagField: {
            formType: 'select',
            fieldName: 'tags',
            displayName: "服务团队",
            placeholder: '请先选择团队',
            isNull: 1,
          },
          customerManagerField: {
            formType: 'select',
            fieldName: 'customerManager',
            displayName: "客户负责人",
            placeholder: '请选择',
            isNull: 1,
          },
        },
        form: {
          serialNumber: null,
          name: null,
          lmName: null,
          customerAddress: {
            adProvince: '',
            adCity: '',
            adDist: '',
            adAddress: '',
          },
          tags: null,
          customerManager: null,
        },
        address: {}
      }
    },
    computed: {
      fields() {
        let originFields = this.initData.fieldInfo || [];
        return FormUtil.migration(originFields);
      }
    },
    methods: {
      update({field, newValue, oldValue}) {
        let {fieldName, displayName} = field;
        if (this.$appConfig.debug) {
          console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
        }

        this.$set(this.form, fieldName, newValue)
      },
      submit() {
        this.$refs.form.validate().then(valid => {
          console.log(this.form);
          if (!valid) return Promise.reject('validate fail.');
          console.log(this.form);
          const params = formatCustomer(this.form);
          console.log('format params', params);
          this.$http.post('/customer/create', params)
            .then(res => {
              console.log('res', res);
            })

        })
          .catch(err => console.error(err))
      },
      copyName() {
        const {name,} = this.form;
        if (!name) return;
        this.form.lmName = name;
      },
      handleCitySelectorChange(location) {
        console.log('location', location);
      },
      chooseMap() {
        this.$fast.map.picker(this.address, {defaultArea: "临沂市"}).then(result => {
          console.log(result)
          if (result.status == 0) this.address = result.data
        })
          .catch(err => console.log(err));
      },
    },
    mounted() {
      //
    }
  }
</script>

<style lang="scss">

  .customer-container {
    height: 100%;
    overflow: auto;
    background: #f4f7f5;
    padding: 10px;

    .btn-group-container {
      padding: 10px;
      .iconfont {
        font-size: 12px;
      }
    }

    .line {
      height: 10px;
      width: 100%;
      background: #f4f7f5;
      margin-bottom: 10px;
    }

    form {
      background: #fff;
      width: 100% !important;
      min-width: 640px;
      .form-item {
        width: 640px;
        margin: 0 auto;
      }

      .base-dist-picker {
        margin-bottom: 10px;
        width: 430px;

        .el-cascader {
          width: 100%;
        }
      }

      .input-and-btn {
        display: flex !important;
        justify-content: space-between;
        .form-item, .form-text {
          width: 430px;
        }
      }
    }

  }

</style>
