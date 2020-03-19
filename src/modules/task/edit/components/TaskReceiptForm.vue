<template>
  <div>
    <form-builder ref="form" :fields="receiptFields" :value="value" @update="update">
     
      <template slot="autograph" slot-scope="{ field, value }">
        <form-item :label="field.displayName">
          <form-autograph :field="field" :value="value" @update="update"></form-autograph>
        </form-item>
      </template>

      <template slot="systemAutograph" slot-scope="{ field, value }">
        <form-item :label="field.displayName">
          <form-autograph :field="field" :value="value" @update="update"></form-autograph>
        </form-item>
      </template>

      <template slot="sparepart" slot-scope="{ field }"> 
        
        <form-item :label="field.displayName">
          <form-sparepart :field="field" :value="value" @update="update"></form-sparepart>
        </form-item>

        <template v-if="value[field.fieldName]">
          <el-table :data="value[field.fieldName]" border stripe>
            <el-table-column label="备件" prop="name"></el-table-column>
            <el-table-column label="编号" prop="serialNumber"></el-table-column>
            <el-table-column label="类别" prop="primaryType"></el-table-column>
            <el-table-column label="规格" prop="standard"></el-table-column>
            <el-table-column prop="number" label="数量" width="100px">
              <template slot-scope="scope">
                <el-input v-model="scope.row.number" @input="handleSparepartNum(scope.row,$event)"></el-input>
              </template>
            </el-table-column>

            <el-table-column label="单价" prop="salePrice" width="100px">
              <template slot-scope="scope"> 
                <el-input v-model="scope.row.salePrice" @input="handleSparepartPrice(scope.row,$event)"></el-input>           
              </template>
            </el-table-column>

            <el-table-column label="小计" prop="total" width="100px"></el-table-column>
          
            <el-table-column label="操作" width="70px" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleSparepartDelete(scope.$index,value[field.fieldName])"/>
              </template>
            </el-table-column>
          </el-table>

        </template>
      </template>

      <template slot="serviceIterm" slot-scope="{ field }">    
        <form-item :label="field.displayName">
          <form-serviceterm :field="field" :value="value" @update="update"></form-serviceterm>
        </form-item>
        <template v-if="value.serviceIterm">
          <el-table :data="value.serviceIterm" border stripe>
            <el-table-column label="服务项目" prop="name"></el-table-column>
            <el-table-column label="编号" prop="serialNumber"></el-table-column>
            <el-table-column label="类别" prop="primaryType"></el-table-column>
           
            <el-table-column prop="number" label="数量" width="100px">
              <template slot-scope="scope">
                <el-input v-model="scope.row.number" @input="handleServiceItermNum(scope.$index,$event)"></el-input>
              </template>
            </el-table-column>

            <el-table-column label="单价" prop="salePrice" width="100px">
              <template slot-scope="scope"> 
                <el-input v-model="scope.row.salePrice" @input="handleServiceItermPrice(scope.$index,$event)"></el-input>           
              </template>
            </el-table-column>

            <el-table-column label="小计" prop="total" width="100px"></el-table-column>
          
            <el-table-column label="操作" width="70px">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleServiceItermDelete(scope.$index)"/>
              </template>
            </el-table-column>
          </el-table>

        </template> 
      </template>
       
      <template v-if="hasExpense" slot="template" slot-scope="{ field }">    
        <form-item :label="field.displayName" class="task-receipt-expense">
          <div class="item">
            <label>备件费用</label>
            <span>{{ sparepartExpense }}</span>
          </div>
          <div class="item">
            <label>服务费用</label>
            <span>{{ serviceItermExpense }}</span>
          </div>
          
          <div class="item">
            <label>折扣费用</label>
            <el-input v-model="disExpense"></el-input>
          </div>
          <div class="item">
            <label>总计</label>
            <span>{{ totalExpense }}</span>
          </div>

        </form-item> 
      </template>

    </form-builder>
  </div>
</template>

<script>
export default {
  name: 'task-receipt-form',
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      validation: false, // this.buildValidation(),
      sparepartExpense: 0,
      serviceItermExpense: 0,
      disExpense: 0,
    }
  },
  computed: {
    receiptFields() {
      return [
        ...this.fields,
        { displayName: '合计',
          fieldName: 'template',
          formType: 'text',
          isSystem: 1
        }
      ]
    },
    hasExpense() {  
      return this.getSparepartExpense() || this.value.serviceIterm
    },
    totalExpense() {
      return (this.getSparepartExpense() - this.disExpense + this.serviceItermExpense).toFixed(2) || 0
    }
  },
  mounted() {
    this.sparepartExpense = this.getServiceItermExpense();
    this.serviceItermExpense = this.getServiceItermExpense();
  },
  methods: {
    getSparepartExpense(){
      let total = 0;
      this.fields.forEach(field=>{
        if(field.formType == 'sparepart'){
          const arr = this.value[field.fieldName] || []
          arr.forEach(item=>{
            total += item.total - 0;
          })
        }
      });
      return total;
    },
    
    getServiceItermExpense(){
      let total = 0;
      (this.value.serviceIterm || []).forEach(item => {
        total += item.total - 0;
      });
      return total;
    },

    handleSparepartNum(item, e){       
      item.number = e;
      item.total = (e * item.salePrice).toFixed(2);  
      this.$nextTick(()=>{
        this.sparepartExpense = this.getSparepartExpense();
      }); 
    },

    handleSparepartPrice(item, e){
      item.salePrice = e;
      item.total = (e * item.number).toFixed(2);
      this.$nextTick(()=>{
        this.sparepartExpense = this.getSparepartExpense();
      }); 
    },

    handleSparepartDelete(index, arr){
      arr.splice(index, 1);
      this.$nextTick(()=>{
        this.sparepartExpense = this.getSparepartExpense();
      }); 
    },

    handleServiceItermNum(index, e){
      const item = this.value.serviceIterm[index];
      item.number = e;
      item.total = (e * item.salePrice).toFixed(2);
      this.$nextTick(()=>{
        this.serviceItermExpense = this.getServiceItermExpense();
      });       
    },

    handleServiceItermPrice(index, e){
      const item = this.value.serviceIterm[index];
      item.salePrice = e;
      item.total = (e * item.number).toFixed(2);
      this.$nextTick(()=>{
        this.serviceItermExpense = this.getServiceItermExpense();
      }); 
    },

    handleServiceItermDelete(index){
      this.value.serviceIterm.splice(index, 1);
      this.$nextTick(()=>{
        this.serviceItermExpense = this.getServiceItermExpense();
      }); 
    },

    update({ field, newValue, oldValue }) { 
      let { fieldName, displayName, formType } = field
      if (this.$appConfig.debug) {
        console.info(
          `[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(
            newValue
          )}`
        )
      }
      let value = this.value
      this.$set(value, fieldName, newValue)  
      this.$emit('input', newValue)
      this.$nextTick(()=>{
        if(formType === 'sparepart') {
          this.sparepartExpense = this.getSparepartExpense();  
        } else if(fieldName === 'serviceIterm') {
          this.serviceItermExpense = this.getServiceItermExpense();  
        }
      });
    },

    validate() {
      return this.$refs.form.validate().then(valid => {
        return valid
      })
    },

  },
}
</script>

<style lang="scss" scoped>
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
.el-table{
  margin: 10px;
}

.task-receipt-expense .item{
  display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
    height: 42px;
    line-height: 42px;
}
</style>
