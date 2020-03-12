<template>
  <div class="form-sparepart">
    <button type="button" class="btn btn-primary base-upload-btn" @click="add">添加</button>
    <base-modal :show.sync="visible" title="备件添加" class="form-sparepart-modal">

      <!-- <form-item label="仓库">
        <base-select
          v-model="value.template"
          :remote-method="searchPart"
          @input="updatePart">
          <div class="product-template-option" slot="option" slot-scope="{ option }">
            <h3>{{ option.name }}</h3>
          </div>
        </base-select>
      </form-item> -->

      <form-item label="名称">
        <base-select
          v-model="value.template"
          :remote-method="searchPart"
          @input="updatePart">
          <div class="product-template-option" slot="option" slot-scope="{ option }">
            <h3>{{ option.name }}</h3>
            <p>
              <span>
                <label>编号：</label>
                <span>{{ option.serialNumber }}</span>
              </span>
              <span>
                <label>类别：</label>
                <span>{{ option.type }}</span>
              </span>
              <span>
                <label>规格</label>
                <span>{{ option.standard }}</span>
              </span>
              <span>
                <label>库存</label>
                <span>{{ option.availableNum }} {{option.unit}}</span>
              </span>
            </p>
          </div>
        </base-select>
      </form-item>

      <form-item label="编号">   
        <input class="form-sparepart-text" :value="sparepart.serialNumber" disabled/>      
      </form-item>

      <form-item label="类别">
        <input class="form-sparepart-text" :value="sparepart.type" disabled/>
      </form-item>
      
      <form-item label="规格">
        <input class="form-sparepart-text" :value="sparepart.standard" disabled/>
      </form-item>

      <form-item label="单价">
        <input class="form-sparepart-text" :value="sparepart.salePrice" disabled/>
      </form-item>

      <form-item label="数量">
        <form-number v-model="number" />
      </form-item>

      <form-item label="小计">
        <input class="form-sparepart-text" :value="total" disabled/>
      </form-item>

      <div class="footer-save">
        <button type="button" class="btn btn-primary base-upload-btn btn-save" @click="save">保存</button>
      </div>
 
    </base-modal>
  </div>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
import _ from 'lodash'
import EventBus from '@src/util/eventBus'
export default {
  name: 'form-sparepart',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      visible: false,
      pending: false,
      sparepart:{},
      number:'1'
    }
  },
  computed: {
    _value() {
      return this.value
    },
    total(){  
      return this.sparepart.salePrice ? (this.sparepart.salePrice * this.number).toFixed(2) : 0; 
    }
  },
  methods: {
    searchPart(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {}
      pms.repertoryId = '';
      pms.with_OOS = false;
      return this.$http
        .post('/task/spare/list', pms)
        .then(res => {
          if (!res || !res.list) return
          // console.log('part list:', res);     
          res.list = res.list.map(template =>
            Object.freeze({
              label: template.name,
              value: template.id,
              ...template
            })
          )     
          return res
        })
        .catch(e => console.error(e))
    },
    updatePart(){
      // console.log('update: ', this.value.template[0]);
      this.sparepart = this.value.template[0];
    },
    add() {
      this.visible = !this.visible;
      if (this.visible) {
        this.value.template = [];
        this.sparepart = {};
      }
    },
    save(){
      this.value.template = [];
      let oldValue = this._value;
      let newValue = _.cloneDeep(this.value); 
      let o = {};
      o.id = this.sparepart.id;
      o.taskId = this.taskId;
      o.name = this.sparepart.name;
      o.number = parseInt(this.num || 1);
      o.type = '备件';
      o.salePrice = this.sparepart.salePrice;
      o.outPrice = this.sparepart.costPrice;
      o.unit = this.sparepart.unit;
      o.primaryId = this.sparepart.id;
      o.primaryType = this.sparepart.type;
      // o.modifiedPrice = this.sparepart.nowPrice - this.sparepart.salePrice;
      o.serialNumber = this.sparepart.serialNumber || '';
      o.total = (o.number * o.salePrice).toFixed(2);
      if(!newValue[this.field.fieldName]){
        newValue[this.field.fieldName] = [];
      }
      newValue[this.field.fieldName].push(o);
      this.$emit('update', {newValue: newValue[this.field.fieldName], oldValue: oldValue[this.field.fieldName], field: this.field});
      this.visible = false;    
    },
  }
}
</script>

<style lang="scss">
 .form-sparepart-text{
    width: 100%;
    background: #eee;  
  }
.form-sparepart{
  height: 30px;
  line-height: 30px;
  text-align: left;
  .form-sparepart-modal{
    .base-modal-body{
      padding: 10px 20px 60px 10px;
      .form-item label{
        width: 80px;
      }
      .footer-save{
        position: relative;
        .btn-save{
          position: absolute;
          top: 5px;
          right: 10px;
        }
      }
    }
  }
}

.product-template-option {
  * {
    margin: 0;
  }
  padding: 10px 0;
  h3 {
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
  }

  p {
    display: flex;
    justify-content: space-between;
    line-height: 24px;

    & > span {
      width: 50%;
      display: flex;
      justify-content: flex-start;
      font-size: 12px;
      color: #666666;
      padding-right: 10px;

      & > label {
        padding: 0;
        width: 70px;
      }
      & > span {
        @include text-ellipsis();
      }
    }
  }
}
</style>
