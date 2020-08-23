<template>
  <div>
    <el-form :model="form" label-width="80px"  style="width: 350px;">
      <el-form-item label="修改字段:">
        <el-select :value="form.field" v-model="form.field" @change="changeField" class="srp-list-form-item">
          <el-option v-for="item in fields" :key="item.field" :value="item.field" :label="item.name"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="修改为:">
        <el-select v-if="form.field === 'type'" v-model="form.value" :value="form.value" class="srp-list-form-item">
          <el-option v-for="item in types" :key="item" :value="item" :label="item"></el-option>
        </el-select>
        <el-select v-else-if="form.field === 'unit'" v-model="form.value" :value="form.value" class="srp-list-form-item">
          <el-option v-for="item in units" :key="item" :value="item" :label="item"></el-option>
        </el-select>
        <el-input v-else-if="form.field === 'name' || form.field === 'standard'" v-model="form.value" maxlength="50"></el-input>
        <el-input v-else-if="form.field === 'salePrice' || form.field === 'costPrice'" v-model="form.value" min="0"></el-input>
        <el-input v-else v-model="form.value"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: "part-edit-batch-form",
    props: {
      fields: {
        type: Array,
        default() {
          return []
        }
      },
      types: {
        type: Array,
        default() {
          return []
        }
      },
      units: {
        type: Array,
        default() {
          return []
        }
      }
    },
    data() {

      return {
        form: {
          field: null,
          value: null,
        },
      }
    },
    methods:{
      reset() {
        this.form.field = null;
        this.form.value = null;
      },
      async pack(){
        try {
          let params = this.form;
          if (!params.field) {
            this.$platform.alert('想要修改的字段不能为空');
            return
          }
          if (!params.value) {
            this.$platform.alert('字段的新值不能为空');
            return
          }
          if ((params.field === 'salePrice' || params.field === 'costPrice') &&
          Number(params.value) < 0
          ) {
            this.$platform.alert('价格不能为负数');
            return
          }
          return params;
        } catch (error) {
          console.log(error)
        }

        return null;
      },
      changeField(n, o) {
        // if (!o && n !== 'type' && n !== 'unit') return;
        this.form.value = null
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>