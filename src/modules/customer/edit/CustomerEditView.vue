<template>
  <div class="customer-container">
    <form @submit.prevent="submit" style="width: 640px;">
      <h1 class="page-title">
        <strong>基本信息</strong>
        <div class="btn-group-container">
          <el-button><i class="iconfont icon-return"></i>返回</el-button>
          <el-button native-type="submit" type="primary"><i class="iconfont icon-commit1"></i>提交</el-button>
        </div>
      </h1>
      <form-builder ref="form" :fields="fields" :value="form" @input="update">
        <form-item v-if="!config.isAutoSerialNumber" label="客户编号" :field="baseField.serialNumberField">
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
          <form-address ref="addressForm" :field="baseField.addressField" :value="form.customerAddress" @input="update"
                        @update-address-backup="updateAddressBackup" :address-backup="addressBackup"
                        :placeholder="baseField.addressField.placeholder"></form-address>
        </form-item>
        <form-item v-if="config.isDivideByTag" label="服务团队" :field="baseField.tagField">
          <div class="input-and-btn">
            <form-select :field="baseField.tagField" :value="form.tags" @input="update" :source="selectTagOptions || []"
                         :placeholder="baseField.tagField.placeholder"></form-select>
            <el-button type="button" @click="autoAssign">自动分配</el-button>
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
  import { formatCustomer, convertCustomerToForm, } from '@src/util/customer';
  import BaseDistPicker from '@src/component/common/BaseDistPicker';
  import FormText from "@src/component/form/components/FormText/FormText";
  import FormUser from "@src/component/form/components/FormUser/FormUser";
  import FormAddress from './FormAddress.vue';

  export default {
    name: 'customer-edit-view',
    components: {FormText, BaseDistPicker, FormUser, FormAddress,},
    props: {
      initData: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      const initData = JSON.parse(window._init) || {};
      let addressBackup = {};

      const data = {
        addressBackup,
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
                  id: initData.id || '',
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
                  id: initData.id || '',
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
            remoteValidation: {
              action: '/linkman/checkUnique4Phone',
              buildParams() {
                const params = {
                  customerId: initData.id || '',
                  phone: '',
                };
                return params;
              }
            },

          },
          addressField: {
            formType: 'address',
            fieldName: 'customerAddress',
            displayName: "地址",
            placeholder: '请输入详细地址[最多50字]',
            isNull: 0,
          },
          tagField: {
            formType: 'selectMulti',
            fieldName: 'tags',
            displayName: "服务团队",
            placeholder: '请先选择团队',
            isNull: 1,
            setting: {
              isMulti: true,
              dataSource: [],
            }
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
            adAddress: [],
            detail: '',
            adLongitude: '',
            adLatitude: '',
            addressType: 0,
          },
          tags: [],
          customerManager: null,
        },
        address: {}
      };

      if (this.initData.isCustomerNameDuplicate) {
        delete data.baseField.nameField.remoteValidation;
      }

      if (!this.initData.isPhoneUnique) {
        delete data.baseField.lmPhoneField.remoteValidation;
      }

      return data;
    },
    computed: {
      action() {
        return this.initData.action;
      },
      editId() {
        return this.initData.id || '';
      },
      config() {
        const { customerAddress, isAutoSerialNumber, isDivideByTag, isCustomerNameDuplicate, isPhoneUnique, } = this.initData;
        return {
          isCustomerNameDuplicate,
          isAutoSerialNumber,
          customerAddress,
          isDivideByTag,
          isPhoneUnique,
        }
      },
      tags() {
        return this.initData.tags || [];
      },
      selectTagOptions() {
        return this.initData.tags
        .map(tag => ({
          text: tag.tagName,
          value: tag.id,
        })) || [];
      },
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
        this.$refs.form.validate()
        .then(valid => {
          if (!valid) return Promise.reject('validate fail.');
          const params = formatCustomer(this.form, this.initData.tags);

          if (this.action === 'edit') {
            return this.updateMethod(params);
          }
          this.createMethod(params);
        })
        .catch(err => console.error(err))
      },
      createMethod(params) {
  
        this.$http.post('/customer/create', params)
        .then(res => {
    
          if (res.status) return this.$platform.alert('创建客户失败');
          window.location.href = `/customer/view/${res.data.customerId}`;
          // window.location.href = `/customer/edit/${res.data.customerId}`;
        })
        .catch(err => console.error('err', err));
        
      },
      updateMethod(params) {


        this.$http.post(`/customer/update?id=${this.editId}`, params)
        .then(res => {

          if (res.status) return this.$platform.alert('更新客户失败');
          window.location.href = `/customer/view/${res.data}`;
        })
        .catch(err => console.error('err', err));
        
      },
      copyName() {
        const {name,} = this.form;
        if (!name) return;
        this.form.lmName = name;
      },
      autoAssign(){
        let adr = this.form.customerAddress;
        let adProvince, adCity, adDist;

        if (adr.adAddress && Array.isArray(adr.adAddress) && adr.adAddress.length) {
          adProvince = adr.adAddress[0];
          adCity = adr.adAddress[1];
          adDist = adr.adAddress[2];
        }

        if(!adProvince || !adCity) return this.$platform.alert('请先补全客户地址');

        let province = adProvince;
        let city = adCity;
        let dist = adDist;

        let tags = [];
        this.tags.forEach(team => {
          let places = team.places || [];
          for(let i = 0; i < places.length; i++){
            let place = places[i];
            let placeProvince = (place.province || "").replace("所有省", "");
            let placeCity = (place.city || "").replace("所有市", "");
            let placeDist = (place.dist || "").replace("所有区", "");

            let placeStr = placeProvince + placeCity + placeDist;
            let adrStr = province + city + dist;
            if(placeStr && adrStr.indexOf(placeStr) == 0) tags.push(team.id);
          }
        });

        if(tags.length == 0) return this.$platform.alert('未能按照规则分配成功，请到服务团队中设置负责区域');

        this.form.tags = tags;
      },
      setDefaultAddress(ad) {
        const { adProvince, adCity, adDist, } = ad;
        if (!adProvince || !adCity) return;
        const newVal = {
          adAddress: [adProvince, adCity, adDist,].filter(ad => ad),
          detail: '',
          adLongitude: '',
          adLatitude: '',
        };
        this.form.customerAddress = newVal;
        this.addressBackup = this.form.customerAddress;
      },
      fetchCustomer(id) {
        this.$http.get(`/v2/customer/getForEdit`, {id})
        .then(res => {
          if (res.status) return;
          this.form = convertCustomerToForm(res.data);
          this.addressBackup = this.form.customerAddress;
        })
      },
      updateAddressBackup(ad) {
        this.addressBackup = ad;
      }
    },
    mounted() {
      this.initData = JSON.parse(window._init) || {};
      if (this.initData.customerAddress) {
        this.setDefaultAddress(this.initData.customerAddress);
      }

      if (this.initData.action === 'edit' && this.initData.id) {
        this.fetchCustomer(this.initData.id);
      }
    },
  }
</script>

<style lang="scss">

  .customer-container {
    height: 100%;
    overflow: auto;
    background: #f4f7f5;
    padding: 10px;

    .page-title {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #f4f7f5;
      padding-left: 10px;

      strong {
        line-height: 62px;
        font-weight: normal;
        font-size: 16px;
      }

      .btn-group-container {
        padding: 10px;
        .iconfont {
          font-size: 12px;
        }
      }
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
        .form-item, .form-text, .form-select {
          width: 430px;
        }
      }
    }

  }

</style>
