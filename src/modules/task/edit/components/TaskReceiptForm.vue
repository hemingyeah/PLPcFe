<template>
  <div>
    <form-builder ref="form" :fields="receiptFields" :value="value" @update="update">
      <!-- start 合计 -->
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
            <input type="number" class="text-red" v-model="value.disExpense" @input="updateDisExpense" @blur="disExpenseBlur" />
          </div>
          <div class="item">
            <label>总计</label>
            <span>{{ totalExpense }}</span>
          </div>
        </form-item> 
      </template>
      <!-- end 合计 -->
    </form-builder>
  </div>
</template>

<script>
import Platform from '@src/platform';
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
      return this.value.sparepart || this.value.serviceIterm
    },
    sparepartExpense() {
      let { sparepart } = this.value;
      let total = 0;

      if (Array.isArray(sparepart)) {
        sparepart.forEach(item => {
          total += item.number * item.salePrice;
        })
      }

      return total.toFixed(2);
    },
    serviceItermExpense() {
      let { serviceIterm } = this.value;
      let total = 0;

      if (Array.isArray(serviceIterm)) {
        serviceIterm.forEach(item => {
          total += item.number * item.salePrice;
        })
      }

      return total.toFixed(2);
    },
    totalExpense() {
      return (Number(this.sparepartExpense) + Number(this.serviceItermExpense) - Math.abs(this.value.disExpense)).toFixed(2);
    }
  },
  methods: {
    update({ field, newValue, oldValue }) { 
      let { fieldName, displayName } = field;

      if (this.$appConfig.debug) {
        console.info(
          `[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(
            newValue
          )}`
        )
      }

      this.$set(this.value, fieldName, newValue);
      this.$emit('input', newValue);
    },
    validate() {
      return this.$refs.form.validate().then(valid => {
        return valid
      })
    },
    updateDisExpense(event) {
      let value = event.target.value;
      const REG = /^[0-9]+([.]{1}[0-9]{0,2}){0,1}$/;

      this.value.disExpense = REG.test(value) ? parseFloat(value) : Math.floor(value * 100 / 100);
    },
    disExpenseBlur(event) {
      let value = event.target.value;
      let totalExpense = Number(this.sparepartExpense) + Number(this.serviceItermExpense);

      if (Math.abs(value) > totalExpense) {
        this.value.disExpense = 0;
        return Platform.notification({
          type: 'error',
          title: '提示',
          message: '折扣费用不能大于总价'
        })
      }

      this.value.disExpense = 0 - Math.abs(value);
    }
  }
}
</script>

<style lang="scss">
.task-receipt-expense .item{
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  height: 42px;
  line-height: 42px;

  input.text-red {
    width: 100px;
    color: #dd4b39 !important;
  }
}
</style>
