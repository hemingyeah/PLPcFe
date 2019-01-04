<template>
  <div class="customer-modal-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form">
      <form-builder ref="form" :fields="fields" :value="form" @input="update" v-if="init">
        <template slot="serialNumber" slot-scope="{field}">
          <form-item :label="field.displayName" :remote="remote.serialNumber" :validation="!config.isAutoSerialNumber">
            <form-text
              v-if="!config.isAutoSerialNumber"
              :field="field"
              :value="form.serialNumber" @input="update"
              :placeholder="genPlaceholder(field)"/>
            <div v-else class="form-item__text">客户编号将在创建后由系统生成</div>
          </form-item>
        </template>

        <template slot="name" slot-scope="{field}">
          <form-item :label="field.displayName" :remote="remote.name" validation>
            <form-text
              :field="field"
              :value="form.name" @input="update"
              :placeholder="genPlaceholder(field)"/>
          </form-item>
        </template>

        <template slot="lmName" slot-scope="{field}">
          <form-item :label="field.displayName" validation>
            <div class="input-and-btn">
              <form-text
                :field="field"
                :value="form.lmName" @input="update"
                :placeholder="genPlaceholder(field)"/>
              <el-button @click="copyName">同客户名</el-button>
            </div>
          </form-item>
        </template>

        <template slot="lmPhone" slot-scope="{field}">
          <form-item :label="field.displayName" :remote="remote.lmPhone" validation>
            <form-text
              :field="field"
              :value="form.lmPhone" @input="update"
              :placeholder="genPlaceholder(field)"/>
          </form-item>
        </template>

        <template slot="customerAddress" slot-scope="{field}">
          <form-item :label="field.displayName" validation>
            <form-address
              :field="field"
              :value="form.customerAddress" @input="update"
              @update-address-backup="updateAddressBackup" :address-backup="addressBackup"
              :placeholder="genPlaceholder(field)"></form-address>
          </form-item>
        </template>

        <template slot="tags" slot-scope="{field}">
          <form-item :label="field.displayName" validation>
            <div class="input-and-btn">
              <form-select
                :field="field" :source="selectTagOptions || []"
                :value="form.tags" @input="update"
                :placeholder="genPlaceholder(field)"/>
              <el-button type="button" @click="autoAssign">自动分配</el-button>
            </div>
          </form-item>
        </template>
      </form-builder>
    </form>
  </div>
</template>

<script>
import * as CustomerApi from '@src/api/CustomerApi';
import * as FormUtil from '@src/component/form/util';
import {toArray} from '@src/util/lang';

export default {
  name: 'customer-edit-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      submitting: false,
      pending: false,
      loadingPage: false,
      addressBackup: {},
      form: {},
      remote: this.buildRemote(),
      init: false
    };
  },
  computed: {
    action() {
      return this.initData.action;
    },
    // editId() {
    //   return this.initData.id || '';
    // },
    // eventId() {
    //   return this.initData.eventId || '';
    // },
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
      if (!this.initData.tags) return [];
      return this.initData.tags
        .map(tag => ({
          text: tag.tagName,
          value: tag.id,
        })) || [];
    },
    fields() {
      let originFields = this.initData.fieldInfo || [];
      let sortedFields = originFields.sort((a,b) => a.orderId - b.orderId)
        .map(f => {
          if (f.formType === 'address' && f.isSystem) {
            f.isNull = this.initData.addressAllowNull ? 1 : 0;
          }
          return f;
        })
        .filter(f => f.fieldName !== 'tags' || (f.fieldName === 'tags' && this.initData.isDivideByTag));
      return FormUtil.migration(sortedFields)
    },
    postUrl() {
      if (location.pathname.indexOf('task') >= 0) {
        return '/task/customer/create';
      }
      return '/event/customer/create';
    }
  },
  methods: {
    genPlaceholder(field){
      return FormUtil.genPlaceholder(field)
    },
    buildRemote(){
      let customerId = this.initData.id;
      let {isAutoSerialNumber, isCustomerNameDuplicate, isPhoneUnique} = this.initData;
      return {
        serialNumber: isAutoSerialNumber ? null : {
          action: '/customer/unique',
          method: 'post',
          // 提交表单的时候，验证请求不可取消
          buildParams(value) {
            return {
              id: customerId,
              fieldName: 'serialNumber',
              value
            };
          }
        },
        name: isCustomerNameDuplicate ? null : {
          action: '/customer/unique',
          method: 'post',
          buildParams(value) {
            return {
              id: customerId,
              fieldName: 'name',
              value,
            };
          }
        },
        lmPhone: !isPhoneUnique ? null : {
          action: '/linkman/checkUnique4Phone',
          method: 'post',
          buildParams(value) {
            return {
              customerId: customerId,
              phone: value,
            };
          }
        }
      }
    },
    update({field, newValue, oldValue}) {
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      this.$set(this.form, fieldName, newValue)
    },
    submit(callBack) {
      this.submitting = true;
      this.$refs.form.validate()
        .then(valid => {
          this.submitting = false;
          if (!valid) return Promise.reject('validate fail.');
          const params = this.formToCustomer(this.fields, this.form);
          this.pending = true;
          this.loadingPage = true;
          // if (this.action === 'edit') {
          //   return this.updateMethod(params);
          // }
          // if (this.action === 'createFromEvent') {
          //   return this.createCustomerForEvent(params);
          // }

          this.createMethod(params, callBack);


        })
        .catch(err => {
          console.error(err);
          this.pending = false;
          this.loadingPage = false;
        });
    },
    // createCustomerForEvent(params) {
    //   this.$http.post('/event/customer/create', params)
    //     .then(res => {
    //       if (res.status) return this.$platform.alert('创建客户失败');
    //       const params = {
    //         ...res.data,
    //         eventId: this.eventId,
    //       };
    //
    //       delete params.latitude;
    //       delete params.longitude;
    //
    //       this.$http.post('/event/update4CusInfo', params, false)
    //         .then(res => {
    //
    //           if (this.initData.goto === 'eventView') {
    //             return window.location.href = `/event/view/${this.initData.eventId}`;
    //           }
    //           if (this.initData.goto === 'createTask') {
    //             return window.location.href = `/event/convent2Task/jump?eventId=${this.initData.eventId}`;
    //           }
    //         })
    //     })
    //     .catch(err => console.error('createCustomerForEvent catch an error', err));
    // },
    createMethod(params, callBack) {
      this.$http.post(this.postUrl, params)
        .then(result => {
          if (result.status) return this.$platform.alert('创建客户失败');

          const addressId = result.data.addressId;
          const customerId = result.data.customerId;
          const linkmanId = result.data.linkmanId;

          const customer = {
            id:customerId,
            name: params.name,
            lmId:linkmanId,
            lmName: params.lmName,
            lmPhone: params.lmPhone,
            addressId:addressId,
            country: params.customerAddress.adCountry || '',
            province:params.customerAddress.adProvince || '',
            city: params.customerAddress.adCity || '',
            dist: params.customerAddress.adDist || '',
            address: params.customerAddress.adAddress || '',
            latitude: result.data.latitude,
            longitude: result.data.longitude,
            customerManager: params.customerManager,
            customerManagerName: params.customerManagerName || ''
          }

          callBack && typeof callBack == 'function' && callBack(customer);
          // window.location.href = `/customer/view/${res.data.customerId}`;
        })
        .catch(err => console.error('err', err));
    },
    // updateMethod(params) {
    //   this.$http.post(`/customer/update?id=${this.editId}`, params)
    //     .then(res => {
    //       if (res.status) return this.$platform.alert('更新客户失败');
    //       window.location.href = `/customer/view/${res.data || this.editId}`;
    //     })
    //     .catch(err => console.error('err', err));
    // },
    copyName() {
      const {name} = this.form;
      if(!name) return;
      this.form.lmName = name;
    },
    autoAssign(){
      let adr = this.form.customerAddress;
      let {province, city, dist} = adr;
      if(!province || !city) return this.$platform.alert('请先补全客户地址');

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
    updateAddressBackup(ad) {
      this.addressBackup = ad;
    },
    //将后端传来的客户对象转换成form
    customerToForm(fields, data){
      let cusAdr = data.customerAddress || this.initData.customerAddress || {};

      return {
        id: data.id,
        name: data.name,
        lmName: data.lmName,
        lmPhone: data.lmPhone,
        serialNumber: data.serialNumber,
        customerAddress: {
          province: cusAdr.adProvince,
          city: cusAdr.adCity,
          dist: cusAdr.adDist,
          address: cusAdr.adAddress,
          longitude: cusAdr.adLongitude || '',
          latitude: cusAdr.adLatitude || '',
          addressType: cusAdr.addressType || 0
        },
        tags: toArray(data.tags).map(item => item.id),
        manager: data.customerManager ? {displayName: data.customerManagerName, userId: data.customerManager} : null
      };
    },
    //将form对象转换成后端可接收的对象
    formToCustomer(fields, form){
      let customer = {
        id: form.id,
        attribute: {}
      };

      fields.forEach(field => {
        let {fieldName, isSystem} = field;
        let value = form[fieldName];

        if(fieldName === 'customerAddress'){
          let customerAddress = form.customerAddress || {};
          // address
          return customer.customerAddress = {
            adCountry: '',
            adProvince: customerAddress.province,
            adCity: customerAddress.city,
            adDist: customerAddress.dist,
            adLatitude: customerAddress.latitude || '',
            adLongitude: customerAddress.longitude || '',
            addressType: customerAddress.addressType || 0,
            adAddress: customerAddress.address,
          };
        }

        if(fieldName === 'tags'){
          let allTags = this.tags || [];
          return customer.tags = value.map(tag => {
            const t = allTags.find(at => at.id === tag);
            return {
              id: t.id,
              tagName: t.tagName,
            }
          });
        }

        if(fieldName === 'manager'){
          customer.customerManager = value.userId || '';
          customer.customerManagerName = value.displayName || ''
          return;
        }

        isSystem == 0
          ? customer.attribute[fieldName] = value
          : customer[fieldName] = value;
      });

      return customer;
    }
  },
  async mounted() {
    window.submit = this.submit;
    try {
      //初始化默认值
      let form = {};
      // if (this.initData.action === 'edit' && this.initData.id) {
      //   //处理编辑时数据
      //   this.loadingPage = true;
      //   let cusRes = await CustomerApi.getForEdit(this.initData.id);
      //   this.loadingPage = false;
      //   if(cusRes.status === 0) form = cusRes.data;
      // }
      //
      // if (this.initData.action === 'createFromEvent') {
      //   form = this.initData.eventCustomer;
      // }

      this.form = FormUtil.initialize(this.fields, form, this.customerToForm);
      this.addressBackup = this.form.customerAddress;
      this.init = true;


    } catch (e) {
      console.error('CustomerEditView caught an error ', e);
    }
  }
}
</script>

<style lang="scss">
body {
  .base-modal {
    width: calc(100vw - 10px)!important;
    margin: 0;
  }
}
.bm-picker {
  height: 459px;
}

.customer-modal-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  background-color: #fff;

  .form-builder{
    width: 655px;
    padding: 10px 0 0 10px;
    margin: 0 auto;

    .input-and-btn{
      display: flex !important;
      flex-flow: row nowrap;

      .form-item, .form-text, .form-select {
        flex: 1;
      }

      .base-dist-picker{
        padding-right: 0;
      }

      button{
        margin-left: 10px;
      }
    }
  }
}

</style>
