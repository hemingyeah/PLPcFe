<template>
  <div class="page">
     
    <div class="page-panel">
      <div class="page-panel-body">
        <!--<el-button @click="back">返回</el-button>-->
        <!--<el-button type="primary" @click="validate" :disabled="pending" v-if="allowEdit">提交</el-button>-->

        <base-button type="ghost"  @event="back">返回</base-button>
        <base-button type="primary" @event="validate" :disabled="pending" v-if="allowEdit">提交</base-button>

      </div>   
    </div>   
  
    <div class="page-panel">
      <div class="page-panel-body">
        <el-form :model="part" :rules="rules" ref="partForm" label-width="16.6666667%" :inline-message="true">
          <el-form-item label="编号：" prop="serialNumber">
            <el-input style="width: 66.6666667%" v-model.trim="part.serialNumber" placeholder="备件的编号[最多50字]"></el-input>
          </el-form-item>
          <el-form-item label="名称：" prop="name">
            <el-input style="width: 66.6666667%"  v-model="part.name" placeholder="备件的名称[最多50字]"></el-input>
          </el-form-item>
          <el-form-item label="类别：" prop="type">
            <el-select style="width: 66.6666667%" v-model="part.type" placeholder="请选择备件类别">
              <el-option :label="item" :value="item" v-for="item in types" :key="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="规格：" prop="standard" >
            <el-input style="width: 66.6666667%" v-model="part.standard" placeholder="备件的规格，如2017款电池[最多50字]"></el-input>
          </el-form-item>
          <el-form-item label="单位：" prop="unit">
            <el-select style="width: 66.6666667%" v-model="part.unit" placeholder="请选择活备件单位">
              <el-option :label="item" :value="item" v-for="item in units" :key="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="销售价：" prop="salePrice">
            <el-input style="width: 66.6666667%" v-model.number="part.salePrice" @blur="numeric('salePrice', $event)" @input="filterNumber($event, 'salePrice')" placeholder="对外销售的价格"></el-input>
          </el-form-item>
          <el-form-item label="出库价：" prop="costPrice">
            <el-input style="width: 66.6666667%" v-model.number="part.costPrice" @blur="numeric('costPrice', $event)" @input="filterNumber($event, 'costPrice')" placeholder="核算利润的成本价，系统将用于利润核算，销售价格减去出库价即为利润"></el-input>
          </el-form-item>
          <el-form-item label="说明：" prop="description">
            <el-input style="width: 66.6666667%" type="textarea" placeholder="备件说明" :autosize="{minRows:2, maxRows: 4}" v-model="part.description"></el-input>
          </el-form-item>
          <el-form-item label="图片：" class="category-edit-form-item-upload">
            <base-upload style="width: 66.6666667%" :value="attachments" @input="uploadImg" :limit="1" accept="image/*">
              <template slot="preview">
                <div class="part-image-preview" v-show="partImg">
                  <img :src="partImg" @click="preview">
                  <button type="button" @click.stop="removePartImg" class="part-image-close"><i class="el-icon-circle-close"></i></button>
                </div>
              </template>
            </base-upload>
          </el-form-item>
        </el-form>
      </div>
    </div>  
  </div>
</template>

<script>
import BaseGallery from 'packages/BaseGallery/index';
import qs from '@src/util/queryString2';
import AuthUtil from '@src/util/auth';
import _ from 'lodash';
        
export default {
  name: 'partV2-edit-view',
  inject: ['initData'],
  data() {
    return {
      auths: {},
      action: 'create',
      units: [],
      types: [],
      pending: false,
      attachments: [],

      origin: {},
      
      part: {
        id: '',
        serialNumber: '',
        name: '',
        standard: '',
        type: '',
        description: '',
        unit: '',
        image: '',
        salePrice: '',
        costPrice: ''
      },
      rules: {
        serialNumber: [
          {required: true, message: '请填写备件编号'},
          {max: 50, message: '备件编号不能超过50字'},
          {validator: _.debounce((rule, value, callback) => {
            value = value && value.trim();
            
            let err = [];
            if(this.action == 'edit' && value == this.origin.serialNumber) return callback(err)
            
            this.$http.post('/partV2/category/checkUnique', {field: 'serialNumber',value: value}, false)
              .then(result => {
                if(result.status != 0) err.push(new Error('备件编号已存在'))
              })
              .catch(err => console.warn(err))
              .finally(() => callback(err))
          }, 500)}
        ],
        name: [
          {required: true, message: '请填写备件名称'},
          {max: 50, message: '备件名称不能超过50字'}
        ],
        type: [
          {required: true, message: '请选择备件类型'},
        ],
        standard: [
          {required: true, message: '请填写备件规格'},
          {max: 50, message: '备件规格不能超过50字'}
        ],
        salePrice: [
          {
            validator(rule, value, callback) {
              const val = Number(value);
              if (value === '') {
                callback(new Error('请输入备件出库价'))
              } else if(val < 0 || isNaN(val)){
                callback(new Error('备件销售价必须为不小于0的数值'))
              } else{
                callback();
              }
            },
            trigger: 'change',
            required: true
          }
        ],
        costPrice: [
          {
            validator(rule, value, callback) {
              const val = Number(value);
              if (value === '') {
                callback(new Error('请输入备件出库价'))
              } else if(val < 0 || isNaN(val)){
                callback(new Error('备件销售价必须为不小于0的数值'))
              } else{
                callback();
              }
            },
            trigger: 'change',
            required: true
          }
        ],
        description:[
          {max: 500, message: "备件说明不能超过500字"}
        ]    
      }
    }; 
  },
  computed: {
    partImg(){
      if(!this.attachments || this.attachments.length == 0) return null;

      return this.attachments[0].url;
    },
    allowEdit(){
      return this.action == 'create' ? AuthUtil.hasAuth(this.auths, 'VIP_SPAREPART_CREATE') : AuthUtil.hasAuth(this.auths, 'VIP_SPAREPART_EDIT')
    }
  },
  methods: {
    preview(event){
      BaseGallery.preview(event.target)
    },
    uploadImg(attachments){
      this.attachments = attachments;
    },
    async removePartImg(){
      if(await this.$platform.confirm('确定要删除该图片吗？')) this.attachments = [];
    },
    numeric(field, event){
      let value = this.part[field];
      this.part[field] = '';
      this.$nextTick(() => this.part[field] = value);
    },
    filterNumber(value, field) {
      if(!value) return;
      let reg = /^[0-9]+([.]{1}[0-9]{0,2}){0,1}$/;
      let num = reg.test(value) ? value : (isNaN(Number(value)) ? value : Number(value).toFixed(3).slice(0, -1));
      this.$nextTick(() => this.part[field] = num);
    },
    validate() {
      if(this.pending) return;

      this.pending = true; 

      this.$refs.partForm.validate((valid) => {
        if(valid) {
          this.submit(this.part)
        } else {
          this.pending = false;
        }
      })
    },
    back(){
      window.history.back()
    },
    async submit(part){
      if(!this.allowEdit) return;
      
      let loading = this.$loading();
      this.pending = true;

      try {
        if(this.partImg) part.image = this.partImg;

        let url = this.action == 'edit' ? '/partV2/category/update' : '/partV2/category/create';
        let result = await this.$http.post(url, part);
        
        if(result.status == 0){
          window.location.href = '/partV2/category/list'
        }else{
          this.$platform.alert(result.message)
        }
      } catch (error) {
        console.warn(error)
      }

      loading.close();
      this.pending = false;
    },
    initialize(origin){
      let part = this.part;

      part.id = origin.id || '';
      part.serialNumber = origin.serialNumber || '';
      part.name = origin.name || ''
      part.standard = origin.standard || '';
      part.type = origin.type || '';
      part.description = origin.description || '';
      part.unit = origin.unit || '';
      part.salePrice = origin.id ? origin.salePrice : '';
      part.costPrice = origin.id ? origin.costPrice : '';

      if(origin.image){
        this.attachments = [{
          url: origin.image
        }]
      }

      if(this.units.length > 0 && !origin.unit) part.unit = this.units[0]; 
      if(this.types.length > 0 && !origin.type) part.type = this.types[0]; 
    },
    fetchData(id){
      if(!id) return Promise.all({});

      return this.$http.get('/partV2/category/get', {id})
    }
  },
  async mounted(){
    try {
      let initData = this.initData;
      this.units = initData.units || [];
      this.types = initData.sparepartType || [];
      this.auths = initData.auths;

      let path = window.location.pathname;
      if(path == '/partV2/category/edit') this.action = 'edit'; 

      let part = {};

      if(this.action == 'edit'){
        let urlParams = qs.parse(window.location.search);
        let loading = this.$loading();
        let result = await this.fetchData(urlParams.id);
        loading.close();
        part = result || {};
      }

      this.initialize(part);
      this.origin = part;
    } catch (error) {
      console.warn(error)
    }
  }          
}
</script>

<style lang="scss">
.part-image-preview{
  position: relative;
  width: 128px;
  max-height: 128px;
  cursor: pointer;
  overflow: hidden;

  img{
    display: block;
    max-width: 100%;
    max-height: 100%;
  }

  .part-image-close{
    position: absolute;
    top: 5px;
    right: 5px;
    border: none;
    outline: none;
    background-color: transparent;
    padding: 0;
    cursor: pointer;

    color: #F56C6C;
    font-size: 16px;
    display: none;
  }

  &:hover{
    .part-image-close{
      display: block;
    }
  }
}

.category-edit-form-item-upload {
  margin-top: 10px;
}
</style>
