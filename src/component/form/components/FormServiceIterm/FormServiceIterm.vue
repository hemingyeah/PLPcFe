<template>
  <div class="form-serviceterm">
    <button class="btn btn-primary base-upload-btn" @click="add">添加</button>
    <base-modal :show.sync="visible" title="服务项目添加" class="form-serviceterm-modal">

      <form-item label="名称">
        <base-select
          v-model="value.template"
          :remote-method="searchServiceItem"
          @input="updateServiceItem">
          <div class="product-template-option" slot="option" slot-scope="{ option }">
            <h3>{{ option.name }}</h3>
            <p>
              <span>
                <label>编号：</label>
                <span>{{ option.serialNumber }}</span>
              </span>
              <span>
                <label>单位：</label>
                <span>{{ option.serialNumber }} {{option.unit}}</span>
              </span>
              <span>
                <label>服务类型：</label>
                <span>{{ option.type }}</span>
              </span>
            </p>
          </div>
        </base-select>
      </form-item>

      <form-item label="编号">   
        <input class="form-serviceterm-text" :value="serviceitem.serialNumber" disabled/>      
      </form-item>

      <form-item label="类别">
        <input class="form-serviceterm-text" :value="serviceitem.type" disabled/>
      </form-item>

      <form-item label="单价">
        <input class="form-serviceterm-text" :value="serviceitem.salePrice" disabled/>
      </form-item>

      <form-item label="数量">
        <form-number v-model="number" />
      </form-item>

      <form-item label="小计">
        <input class="form-serviceterm-text" :value="total" disabled/>
      </form-item>

      <div class="footer-save">
        <button class="btn btn-primary base-upload-btn btn-save" @click="save">保存</button>
      </div>
 
    </base-modal>
  </div>
</template>

<script>
import _ from 'lodash'
import EventBus from '@src/util/eventBus'
export default {
  name: 'form-serviceterm',
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
      serviceitem:{},
      number:'1'
    }
  },
  computed: {
    _value() {
      return this.value
    },
    total(){  
      return this.serviceitem.salePrice ? (this.serviceitem.salePrice * this.number).toFixed(2) : 0; 
    }
  },
  methods: {
    searchServiceItem(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {}
      return this.$http
        .post('/task/service/list', pms)
        .then(res => {
          if (!res || !res.list) return
          // console.log('service list:', res);     
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
    updateServiceItem(){
      // console.log('update: ', this.value.template[0]);
      this.serviceitem = this.value.template[0];
    },
    add() {
      this.visible = !this.visible;
      if (this.visible) {
        this.value.template = [];
        this.serviceitem = {};
      }
    },
    save(){
      this.value.template = [];
      let oldValue = this._value;
      let newValue = _.cloneDeep(this.value); 
      let o = {};
      o.id = this.serviceitem.id;
      o.taskId = this.taskId;
      o.name = this.serviceitem.name;
      o.number = parseInt(this.num || 1);
      o.type = '服务';
      o.salePrice = this.serviceitem.salePrice;
      o.outPrice = this.serviceitem.costPrice;
      o.unit = this.serviceitem.unit;
      o.primaryId = this.serviceitem.id;
      o.primaryType = this.serviceitem.type;
      // o.modifiedPrice = this.serviceitem.nowPrice - this.serviceitem.salePrice;
      o.total = (o.number * o.salePrice).toFixed(2);
      o.serialNumber = this.serviceitem.serialNumber || '';  
      if(!newValue.serviceIterm){   
        newValue.serviceIterm = [];
      }
      newValue.serviceIterm.push(o);
      this.$emit('update', {newValue: newValue.serviceIterm, oldValue: oldValue.serviceIterm, field: this.field});
      this.visible = false;    
    },
  }
}
</script>

<style lang="scss">

.form-serviceterm-text{
  width: 100%;
  background: #eee;  
}
.form-serviceterm{
  height: 30px;
  line-height: 30px;
  text-align: left;

   .form-serviceterm-modal {
     
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
