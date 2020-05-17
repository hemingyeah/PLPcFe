<template>
  <div class="part-set-safety-stock-form-container">

    <el-table stripe :data="formData">

      <el-table-column
        v-for="column in columns"

        :fdate='formData'
        :key="column.field"
        :label="column.label"
        :width="column.width"
        :prop="column.field"
        :render-header="column.renderHeader"
        show-overflow-tooltip>

        <template slot-scope="scope">
          <template v-if="column.field === 'safetyStock'">
          <el-input v-model="scope.row.safetyStock" type="number" step="any" :min="0" :readonly="!!unifiedValue"></el-input>
        </template>

          <template v-else-if="column.field === 'action'" >
            <!--<el-tooltip class="item" effect="dark" content="移除当前备件设置的安全库存值" placement="left">-->
              <el-button type="text" size="large" class="no-padding" @click="scope.row.safetyStock = ''">
                清除设置
              </el-button>
            <!--</el-tooltip>-->
          </template>
          <template v-else>
            {{scope.row[column.field]}}
          </template>

        </template>


      </el-table-column>

    </el-table>
    <div class="function-btn-group-container" v-if="formData.length > 1">
      <div class="function-btn-group">
        <span>批量设置</span>
        <!--<el-input type="number" value="unifiedValue" v-model="unifiedValue" @change="setUnifiedValue(unifiedValue)" min="1"></el-input>-->
        <el-input v-model="unifiedValue" min="1"></el-input>
        <el-button type="text" size="large" class="no-padding" @click="setUnifiedValue('')">
          批量清除
        </el-button>
      </div>
    </div>


  </div>
</template>

<script>
  import MathUtil from '@src/util/math';

  export default {
    name: "part-set-safety-stock-form",
    inject: ['initData'],
    data() {
      return {
        unifiedValue: '',
        columns: this.buildColumns(),
        formData: this.initData(this.formdata),
      }
    },
    props: {
      formdata: Array,
    },
    watch: {
      unifiedValue(n, o) {
        this.$nextTick(()=>{
          this.formData = this.formData.map(row => {
            row.safetyStock = n;
            return row;
          });

          if (!n) {
            this.unifiedValue = '';
          }
        })
      },
    },
    methods: {
      initData(obj){
        return JSON.parse(JSON.stringify(obj));
      },
      buildColumns(){
        return [{
          label: '备件名称',
          field: 'name',
          show: true
        }, {
          label: '备件编号',
          field: 'serialNumber',
          show: true
        }, {
          label: '备件类别',
          field: 'type',
          show: true,
        }, {
          label: '备件规格',
          field: 'standard',
          show: true
        }, {
          label: '仓库',
          field: 'repertory',
          show: true
        }, {
          // label: '设置安全库存值',
          field: 'safetyStock',
          show: true,
          width:'150px',
          renderHeader: this.renderHeader,
        }, {
          label: '',
          field: 'action',
          width: '80px',
        }]
      },
      async pack() {

        try {
          const data = this.formData;
          let params = [];
          let msg = '';
          let initData = this.initData;

          for (let i = 0; i < data.length; i++) {
            params.push(data[i]);
            let count = this.decimalNumber(data[i].safetyStock);

            if(count != -1 || Number(data[i].safetyStock) < 0) {
              if(!initData.isSparepart2) {
                msg = '安全库存数量不能小于0，且为正整数。'
              } else {
                if(initData.precision == 0) {
                  msg = '安全库存数量不能小于0，且为正整数。'
                } else {
                  msg = `安全库存数量不能小于0，最多支持${ initData.precision }位小数。`
                }
              }
            }
          }
          if(msg) {
            this.$platform.toast(msg)
            return null;
          }

          return params;
        } catch (e) {
          console.error('e', e);
        }
      },
      setUnifiedValue(value) {
        this.$nextTick(()=>{
          this.formData = this.formData.map(row => {
            row.safetyStock = value;
            return row;
          });

          if (!value) {
            this.unifiedValue = '';
          }
        })
      },
      decimalNumber(num) {
        let initData = this.initData;
        let count = MathUtil.decimalNumber(num);
        let isPartV2 = initData.isSparepart2;

        if(!isPartV2 && count != 0) return 0;
        if(initData.precision >= count) return -1;
        return initData.precision;
      },

      renderHeader(h) {
        return (
          <span>
          <el-tooltip class="item" effect="dark" content="清空安全库存值或者点击【清除设置】按钮并点击【确定】保存会移除当前备件设置的安全库存值" placement="top-end">
          <span>设置安全库存值<i class="el-icon-question"></i></span>
        </el-tooltip>
        </span>
      )
      }

    }
  }
</script>

<style lang="scss" scoped>
  .part-set-safety-stock-form-container {

    .function-btn-group-container {
      overflow: hidden;
      height: 49px;
      line-height: 49px;
    }

    .function-btn-group {
      display: flex;
      width: 360px;
      float: right;
      span {
        width: 130px;
        padding: 0 10px;
      }
      .el-input {
        width: 129px;
        margin: 0 8px 0 10px;
      }
      button {
        width: 80px;
      }
    }
  }
</style>