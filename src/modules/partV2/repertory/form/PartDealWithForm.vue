<template>
  <div class="normal-box">
    <!-- 仅看数据展示 start -->
    <div class="flex-x only-see-box">
      <div class="form-only-see flex-x" v-for="(item,index) in formArr" :key="index">
        <div class="form-only-see-title">{{item.lable}}</div>
        <div class="form-only-see-input">
          <el-input v-model="item.value" :readonly="true"></el-input>
        </div>
      </div>
    </div>
    <!-- 仅看数据展示 end -->

    <!-- 备注 start-->

    <div class="flex-x mar-b-20">
      <div class="form-only-see-title mar-r-15">备注</div>
      <div class="flex-1">
        <el-input placeholder="请输入备注内容" v-model="remark" :readonly="false"></el-input>
      </div>
    </div>
    <!-- 备注 end -->

    <!-- 备件清单 start-->
    <div class="mar-b-20">
      <div>备件清单</div>
      <el-table :data="tableData" stripe style="width: 100%" max-height="350">
        <el-table-column
          v-for="(item,index) in tableColumn"
          :key="index"
          :prop="item.prop"
          :label="item.lable"
          :width="item.width"
          :fixed="item.fixed"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <template v-if="item.normalType==='controler'">
              <el-form :model="scope.row" :rules="rules" :ref="'ruleForm'" class="demo-ruleForm">
                <el-form-item prop="number">
                  <el-input v-model="scope.row.number" :readonly="false" type="number"></el-input>
                </el-form-item>
              </el-form>
            </template>
            <template v-else slot-scope="scope">{{scope.row[item.prop]}}</template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 备件清单 end-->
    <div>
      <div class="mar-b-20">办理意见</div>
      <el-input placeholder="请输入办理意见" maxlength="100" v-model="suggestion" :readonly="false"></el-input>
    </div>
  </div>
</template>
<script>
export default {
  name: 'part-deal-with-form',
  data() {
    let validateNumber = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入数量'));
      } else if (!/^[1-9]\d*$/.test(value)) {
        callback(new Error('请输入正整数'));
      } else {
        callback();
      }
    };
    return {
      input: '测试数据',
      rules: {
        number: [{ validator: validateNumber, trigger: 'change' }]
      },
      formArr: [
        { lable: '申请日期', value: '' },
        { lable: '办理编号', value: '' },
        { lable: '申请类型', value: '' },
        { lable: '申请人', value: '' },
        { lable: '目标仓库', value: '' }
      ],
      remark: '',
      suggestion: '',
      tableData: [
        {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路1518弄',
          number: 1,
          count: 1
        },
        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄',
          number: 1,
          count: 1
        },
        {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄',
          number: 1,
          count: 1
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄',
          number: 1,
          count: 1
        }
      ],
      tableColumn: [
        {
          prop: 'date',
          lable: '备件名称',
          width: '180'
        },
        {
          prop: 'name',
          lable: '编号',
          width: '180'
        },
        {
          prop: 'address',
          lable: '类型',
          width: '180'
        },
        {
          prop: 'data1',
          lable: '规格',
          width: '180'
        },
        {
          prop: 'data1',
          lable: '单位',
          width: '180'
        },
        {
          prop: 'data1',
          lable: '申请数量',
          width: '180'
        },
        {
          prop: 'data1',
          lable: '涉及金额',
          width: '180'
        },
        {
          prop: 'data1',
          lable: '原始仓库',
          width: '180'
        },
        {
          prop: 'data1',
          lable: '原仓库存',
          width: '180'
        },
        {
          prop: 'data1',
          lable: '已办理数量',
          width: '180'
        },
        {
          prop: 'data1',
          normalType: 'controler',
          lable: '办理数量',
          width: '100',
          fixed: 'right'
        }
      ]
    };
  },
  methods: {
    getData() {
      return this.validator();
    },
    validator() {
      return new Promise((resolves, rejects) => {
        let func_arr = [];
        for (let index = 0; index < this.tableData.length; index++) {
          const func = new Promise((resolve, reject) => {
            this.$refs['ruleForm'][index].validate((valid, obj) => {
              let keys = Object.keys(this.rules);
              if (valid) resolve();
              keys.forEach(item => {
                if (obj.hasOwnProperty(item) === true) {
                  reject(obj[item]);
                  return false;
                }
              });
            });
          });
          func_arr.push(func);
        }
        Promise.all(func_arr)
          .then(res => {
            let { remark, suggestion, tableData } = this;
            resolves({
              remark,
              suggestion,
              tableData
            });
          })
          .catch(obj => {
            rejects(obj[0]);
          });
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.flex-x {
  display: flex;
  align-items: center;
}
.flex-1 {
  flex: 1;
}
.mar-r-15 {
  margin-right: 15px;
}
.mar-b-20 {
  margin-bottom: 20px;
}
.form-only-see {
  width: 33.3%;
  margin-bottom: 15px;
  .form-only-see-title {
    min-width: 56px;
    text-align: end;
    margin-right: 15px;
  }
  .form-only-see-input {
    width: 180px;
  }
}
.only-see-box {
  flex-wrap: wrap;
}
.overHideCon-1 {
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  overflow: hidden;
}
</style>