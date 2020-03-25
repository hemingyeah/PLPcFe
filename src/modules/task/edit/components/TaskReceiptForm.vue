<template>
  <div>
    <form-builder ref="form" :fields="receiptFields" :value="value" @update="update">
      <!-- start 备件 -->
      <template slot="sparepart" slot-scope="{ field }">
        <form-item :label="field.displayName">
          <form-sparepart :field="field" :value="value" @update="update"></form-sparepart>
        </form-item>
      </template>
      <!-- end 备件 -->

      <!-- start 服务项目 -->
      <template slot="serviceIterm" slot-scope="{ field }">
        <form-item :label="field.displayName">
          <form-serviceterm :field="field" :value="value" @update="update"></form-serviceterm>
        </form-item>
      </template>
      <!-- end 服务项目 -->
       
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
            <form-number v-model="value.disExpense" @update="update" />
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
    }
  }
}
</script>

<style lang="scss" scoped>
.task-receipt-expense .item{
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  height: 42px;
  line-height: 42px;
}
</style>
