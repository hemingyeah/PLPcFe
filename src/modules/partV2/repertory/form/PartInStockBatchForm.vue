
<template>
  <div class="part-batchIn-form">
    <el-table :data="form" empty-text="请点击下方按钮添加要入库的数据">
      <el-table-column label="名称" width="150px">
        <el-autocomplete
          slot-scope="scope"
          popper-class="batch-in-part"
          v-model="scope.row.sparepartName"
          :fetch-suggestions="fetchSparepart"
          placeholder="请选择备件"
          @select="choosePart($event,scope.row)"
        >
          <div class="bacth-in-part-item" slot-scope="scope">
            <p>名称：{{scope.item.name}}</p>
            <p>编号：{{scope.item.serialNumber}}</p>
            <p>规格：{{scope.item.standard}}</p>
          </div>
        </el-autocomplete>
      </el-table-column>
      <el-table-column label="编号" prop="serialNumber"></el-table-column>
      <el-table-column label="类别" prop="sparepartType"></el-table-column>
      <el-table-column label="备件规格" prop="standard" width="100px"></el-table-column>
      <el-table-column label="仓库">
        <el-select v-model="scope.row.repertory" slot-scope="scope" value-key="id">
          <el-option
            v-for="option in repertory"
            :key="option.id"
            :label="option.name"
            :value="option"
          ></el-option>
        </el-select>
      </el-table-column>
      <el-table-column label="类型">
        <el-select v-model="scope.row.type" slot-scope="scope">
          <el-option
            v-for="option in sparepartConfig.inStoreType"
            :key="option"
            :label="option"
            :value="option"
          ></el-option>
        </el-select>
      </el-table-column>
      <el-table-column label="数量" width="80px">
        <el-input
          slot-scope="scope"
          v-model="scope.row.variation"
          type="number"
          step="any"
          :min="0"
        ></el-input>
      </el-table-column>
      <el-table-column label="操作" width="45px">
        <el-button type="text" @click="remove(scope.row)" slot-scope="scope">删除</el-button>
      </el-table-column>
    </el-table>

    <div class="in-stock-remark" v-if="form.length > 0">
      <textarea :maxlength="500" placeholder="请输入备注内容" v-model="remark"></textarea>
    </div>

    <div class="part-batchIn-footer">
      <el-button type="text" @click="add" icon="el-icon-plus">添加</el-button>
    </div>
  </div>
</template>

<script>
import MathUtil from "@src/util/math";

export default {
  name: "part-instockBatch-form",
  inject: ["initData"],
  props: {
    sparepartConfig: Object,
    repertory: Array
  },
  data() {
    return {
      form: [],
      remark: ""
    };
  },
  computed: {
    // TODO: 支持小数 提示
    minVariation() {
      let initData = this.initData;
      return !initData || !initData.precision
        ? 1
        : initData.precision == 1
        ? 0.1
        : 0.01;
    }
  },
  methods: {
    remove(row) {
      let index = -1;
      for (let i = 0; i < this.form.length; i++) {
        if (this.form[i] == row) {
          index = i;
          break;
        }
      }
      if (index >= 0) this.form.splice(index, 1);
    },
    add(event, row = {}) {
      if (this.form.length > 19) {
        return this.$message({
          showClose: true,
          message: "最多添加20个备件",
          type: "error"
        });
      }
      let config = this.sparepartConfig || {};
      let types = config.inStoreType || [];

      let repertories = this.repertory || [];

      let repertory = row.repertory || {};
      let sparepart = row.sparepart || {};

      let id = repertory.id + "_" + sparepart.id;
      this.form.push({
        _id: id,
        sparepart: sparepart.id || "",
        sparepartName: sparepart.name || "",
        serialNumber: sparepart.serialNumber || "",
        sparepartType: sparepart.type || "",
        standard: sparepart.standard || "",
        type: types[0],
        repertory:
          JSON.stringify(repertory) == "{}" ? repertories[0] : repertory,
        variation: 1
      });
    },
    fetchSparepart(keyword, cb) {
      let model = {
        keyWord: keyword,
        pageSize: 50,
        pageNum: 1,
        enable: 1
      };

      this.$http
        .get("/partV2/repertory/sparepart/list", model)
        .then(result => cb(result.list))
        .catch(err => console.log(err));
    },
    hasRow(value) {
      return this.form.some(item => item._id == value);
    },
    choosePart(value, row) {
      let id = row.repertory + "_" + value.id;

      if (this.hasRow(id)) {
        this.$platform.toast("该记录已存在！", "warning");
        return;
      }

      row._id = id;
      row.sparepart = value.id;
      row.sparepartName = value.name;
      row.serialNumber = value.serialNumber;
      row.sparepartType = value.type;
      row.standard = value.standard;
    },
    async pack() {
      let form = this.form;
      try {
        let message = "";
        let initData = this.initData;
        form.forEach((item, index) => {
          let count = this.decimalNumber(item.variation);
          if (
            !item.sparepart ||
            !item.repertory.id ||
            !item.type ||
            !item.variation ||
            item.variation <= 0 ||
            count != -1
          ) {
            message = "仓库、备件、目标库不能为空；";
            message +=
              initData.precision == 0
                ? "数量为大于0的正整数"
                : `数量大于0，支持${initData.precision}位小数`;
          }
        });

        if (message) {
          this.$platform.alert(message);
          return null;
        }

        return form.map(item => ({
          sparepart: {
            id: item.sparepart,
            name: item.sparepartName
          },
          repertory: {
            id: item.repertory.id,
            name: item.repertory.name
          },
          item: item.type,
          type: "入库",
          variation: item.variation,
          remark: this.remark
        }));
      } catch (error) {
        console.log(error);
      }
      return null;
    },
    receive(data = []) {
      if (data.length > 20) {
        return this.$platform.alert("单次最多支持入库20个备件");
      }
      data.forEach(item => this.add(null, item));
    },
    decimalNumber(num) {
      let initData = this.initData;
      let count = MathUtil.decimalNumber(num);
      let isPartV2 = initData.isSparepart2;

      if (!isPartV2 && count != 0) return 0;
      if (initData.precision >= count) return -1;
      return initData.precision;
    }
  }
};
</script>

<style lang="scss">
.el-form-item {
  margin-bottom: 0;
}

.part-batchIn-form {
  td,
  th {
    padding: 5px 0;
  }
  .cell {
    padding: 0 5px;
  }
}

.part-batchIn-footer {
  padding-top: 10px;
  text-align: center;
}

.batch-in-part {
  width: 200px !important;

  li {
    padding: 5px;
    margin: 0 10px;
    border-bottom: 1px solid #f0f0f0;
    overflow: hidden;

    &:last-child {
      border-color: transparent;
    }
  }
}

.bacth-in-part-item {
  p {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 24px;
    margin: 0;
  }
}
.in-stock-remark {
  width: 100%;
  display: flex;
  margin: 10px 0 0;
  padding: 0 5px;
  textarea {
    flex: 1;
    height: 40px;
    min-height: 40px;
    padding: 10px;
    border-color: #dadada;
    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }
}
</style>