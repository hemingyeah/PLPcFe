<template>
  <div class="normal-box">
    <!-- 仅看数据展示 start -->
    <div class="flex-x only-see-box">
      <div class="form-only-see flex-x" v-for="(item,index) in formArr" :key="index">
        <div class="form-only-see-title">{{item.lable}}</div>
        <div class="form-only-see-input">{{item.value}}</div>
      </div>
    </div>
    <!-- 仅看数据展示 end -->

    <!-- 备注 start-->

    <div class="flex-x mar-b-20 al-start">
      <div class="form-only-see-title mar-r-15">备注</div>
      <div>{{remark}}</div>
    </div>
    <!-- 备注 end -->

    <!-- 备件清单 start-->
    <div class="mar-b-20">
      <div class="mar-b-15 font-w-500">备件清单</div>
      <el-table border :data="propData.arr" stripe style="width: 100%" max-height="350">
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
                  <el-input
                    v-model="scope.row.number"
                    :readonly="inputonlyread || (scope.row.type==='分配' || scope.row.type==='调拨') || scope.row.variation < scope.row.solvedVariation || !propData.data.approve"
                    type="number"
                    min="0"
                  ></el-input>
                </el-form-item>
              </el-form>
            </template>
            <template v-else-if="item.field==='price'">{{countPrice(scope.row)}}</template>
            <!-- <template v-else-if="item.field==='child'">{{scope.row.sparepartRepertory[item.prop]}}</template> -->
            <template v-else-if="item.field==='sourceTargetName'">{{propData.data.sourceTargetName}}</template>
            <template v-else-if="item.field==='child_2'">{{scope.row.sparepart[item.prop]}}</template>
            <template v-else>{{scope.row[item.prop]}}</template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 备件清单 end-->
    <div>
      <div v-if="inputonlyread===false && propData.data.approve">
        <div class="mar-b-15 font-w-500">办理意见</div>

        <el-input
          type="textarea"
          maxlength="100"
          resize="none"
          :autosize="{ minRows: 2, maxRows: 6 }"
          :placeholder="inputonlyread?'':'请输入办理意见'"
          v-model="suggestion"
          :readonly="inputonlyread"
        ></el-input>
      </div>
    </div>
  </div>
</template>
<script>
import { mathMul, mathAccSub } from "@src/util/math";

export default {
  name: "part-deal-with-form",
  props: {
    propData: {
      type: Object
    }
  },
  computed: {
    formArr() {
      let arr = [
        { lable: "申请日期", value: this.propData.data.prosperTime },
        { lable: "办理编号", value: this.propData.data.approveNo },
        { lable: "申请类型", value: this.propData.data.type },
        { lable: "申请人", value: this.propData.data.prosperName },
        { lable: "目标仓库", value: this.propData.data.targetName }
      ];
      return arr;
    }
  },
  data() {
    let validateNumber = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入数量"));
      } else if (value < 0) {
        callback(new Error("请输入大于或等于0的数"));
      } else if (
        !/^(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,2})))$/.test(value)
      ) {
        callback(new Error("最多保留两位小数"));
      } else {
        callback();
      }
    };
    let tableColumn = [
      {
        field: "variation",
        prop: "variation",
        lable: "申请数量",
        width: "180"
      },
      {
        field: "child_2",
        prop: "name",
        lable: "备件名称",
        width: "180"
      },
      {
        field: "child_2",
        prop: "serialNumber",
        lable: "编号",
        width: "180"
      },
      {
        field: "child_2",
        prop: "type",
        lable: "类型",
        width: "180"
      },
      {
        field: "child_2",
        prop: "standard",
        lable: "规格",
        width: "180"
      },
      {
        field: "child_2",
        prop: "unit",
        lable: "单位",
        width: "180"
      },
      {
        field: "price",
        prop: "data1",
        lable: "金额",
        width: "180"
      },
      {
        field: "sourceTargetName",
        prop: "sourceTargetName",
        lable: "原始仓库",
        width: "180"
      },
      {
        field: "repertoryCount",
        prop: "repertoryCount",
        lable: "原仓库存",
        width: "180"
      },
      {
        field: "solvedVariation",
        prop: "solvedVariation",
        lable: "已办理数量",
        width: "180"
      },
      {
        normalType: "controler",
        lable: "办理数量",
        width: "150",
        fixed: "left"
      }
    ];
    let inputonlyread = this.propData.data.state !== "suspending";
    let remark = this.propData.data.remark;
    return {
      input: "测试数据",
      rules: {
        number: [{ validator: validateNumber, trigger: "change" }]
      },
      remark,
      suggestion: "",
      tableColumn,
      inputonlyread
    };
  },
  methods: {
    countPrice(obj) {
      return mathMul(obj.variation, obj.sparepart.salePrice);
    },
    getData() {
      return this.validator();
    },
    validator() {
      return new Promise((resolves, rejects) => {
        let func_arr = [];
        for (let index = 0; index < this.propData.arr.length; index++) {
          const func = new Promise((resolve, reject) => {
            this.$refs["ruleForm"][index].validate((valid, obj) => {
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
            this.propData.arr.forEach(element => {
              if (
                element.number >
                mathAccSub(element.variation, element.solvedVariation)
              ) {
                rejects(
                  new Error(
                    `"${
                      element.sparepart.name.length > 10
                        ? `${element.sparepart.name.slice(0, 9)}...`
                        : element.sparepart.name
                    }"的办理数量不得大于可办理数量`
                  )
                );
                return false;
              }
            });
            let { remark, suggestion, propData } = this;
            resolves({
              remark,
              suggestion,
              propData
            });
          })
          .catch(obj => {
            rejects(obj[0]);
          });
      });
    },
    resetData() {
      this.suggestion = "";
    }
  }
};
</script>
<style lang="scss" scoped>
.normal-box {
  padding: 10px;
  box-sizing: border-box;
}
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
.mar-b-15 {
  margin-bottom: 15px;
}
.mar-b-20 {
  margin-bottom: 20px;
}
.font-w-500 {
  font-weight: 500;
}
.form-only-see {
  width: 33.3%;
  margin-bottom: 15px;
  .form-only-see-input {
    width: 180px;
  }
}

.form-only-see-title {
  min-width: 56px;
  margin-right: 15px;
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
.al-start {
  align-items: flex-start;
}
</style>