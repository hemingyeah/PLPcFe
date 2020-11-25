<template>
  <div class="spare-parts">
    <!-- 头部搜索 -->
    <div class="task-flex task-ai">
      <div class="search-parts">
        <el-input v-model="searchParts" placeholder="请输入备件信息" />
      </div>
      <div class="select-state">
        <el-select v-model="selectState" placeholder="发布状态">
          <el-option
            v-for="item in selectStateList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div class="select-stock">
        <el-select v-model="selectStock" placeholder="有无库存">
          <el-option
            v-for="item in selectStockList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <base-button
        type="primary"
        native-type="submit"
        class="task-ml12"
        @event="search"
      >
        搜索
      </base-button>
      <base-button type="ghost" class="task-ml12" @event="initialization">
        重置
      </base-button>
    </div>
    <!-- 入库 出库  -->
    <div class="spare-parts-stock task-flex task-ai task-mt12">
      <div class="task-span1">
        <base-button
          type="primary"
          native-type="submit"
          class="task-mr12"
          @event="instockBatch"
        >
          入库
        </base-button>
        <base-button type="primary" native-type="submit" @event="outstockBatch">
          出库
        </base-button>
      </div>
    </div>
    <!-- table -->
    <div class="task-mt12">
      <el-table
        stripe
        border
        :data="tableData"
        ref="multipleTable"
        @select="handleSelection"
        @select-all="handleSelection"
        header-row-class-name="common-list-table-header taks-list-table-header"
      >
        <el-table-column
          type="selection"
          width="48"
          align="center"
          class-name="select-column"
        ></el-table-column>
        <el-table-column
          v-for="(item, index) in tableNames"
          :key="index"
          :label="item.displayName"
        >
          <template slot-scope="scope">
            <template v-if="item.fieldName === 'isShopWindow'">
              <el-switch
                v-model="scope.row.isShopWindow"
                @change="
                  updateIsShowOrIsShopWindows(
                    scope.row.isShopWindow,
                    scope.row.id
                  )
                "
              />
              <span>{{ scope.row.isShopWindow ? "禁用" : "启用" }}</span>
            </template>
            <template v-else-if="item.fieldName === 'isShow'">
              <el-checkbox
                v-model="scope.row.isShow"
                @change="
                  updateIsShowOrIsShopWindows(scope.row.isShow, scope.row.id, 0)
                "
              ></el-checkbox>
            </template>
            <template v-else-if="item.fieldName === 'images'">
              <img
                :src="scope.row[item.fieldName]"
                class="spare-parts-img"
                v-if="scope.row[item.fieldName]"
              />
            </template>
            <template v-else>{{ scope.row[item.fieldName] }}</template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="spare-parts-foot task-flex task-ai">
      <div class="task-span1">
        <div class="task-c6 task-font14 task-mt8" v-show="selected.length">
          已选择
          <span class="task-c2">
            {{ selected.length }}
          </span>
          条
          <span class="task-c2 task-pointer" @click="toggleSelection"
            >清空</span
          >
        </div>
      </div>

      <el-pagination
        class="comment-list-table-footer-pagination"
        background
        :page-sizes="[10, 20, 50]"
        :page-size="params.pageSize"
        :total="pagination.total"
        :current-page="params.pageNum"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        layout="prev, pager, next, sizes, jumper"
      >
      </el-pagination>
    </div>

    <!-- S 出库 -->
    <el-dialog
      title="批量出库操作"
      :visible.sync="outstockBatchDialog"
      width="940px"
    >
      <part-outstock-batch-form
        v-if="outstockBatchDialog"
        ref="outstockBatchForm"
        :sparepart-config="sparepartConfig"
      ></part-outstock-batch-form>
      <div slot="footer" class="dialog-footer">
        <base-button type="ghost" @event="outstockBatchDialog = false"
          >取 消</base-button
        >
        <base-button type="primary" @event="outstockBatchSave">确 定</base-button>
      </div>
    </el-dialog>
    <!-- E 出库 -->

    <!-- S 入库 -->
    <el-dialog
      title="批量入库操作"
      :visible.sync="instockBatchDialog"
      width="940px"
    >
      <part-instockBatch-form
        v-if="instockBatchDialog"
        ref="instockBatchForm"
        :repertory="manageRepertories"
        :sparepart-config="sparepartConfig"
        type="mall"
        :repertoryName="tableData[0].baseRepertory"
      ></part-instockBatch-form>
      <div slot="footer" class="dialog-footer">
        <base-button type="ghost" @event="instockBatchDialog = false"
          >取 消</base-button
        >
        <base-button type="primary" @event="instockBatchSave"
          >确 定</base-button
        >
      </div>
    </el-dialog>
    <!-- E 入库 -->
  </div>
</template>
<script>
import _ from "lodash";
import AuthUtil from "@src/util/auth";

// components
import PartOutStockBatchForm from "../../../partV2/repertory/form/PartOutStockBatchForm";
import PartInStockBatchForm from "../../../partV2/repertory/form/PartInStockBatchForm";

// api
import * as SettingApi from "@src/api/SettingApi";
// 发布状态
const STATELIST = [
  {
    value: 0,
    label: "全部",
  },
  {
    value: 1,
    label: "未发布",
  },
  {
    value: 2,
    label: "已发布",
  },
];
// 库存
const STOCK = [
  {
    value: 0,
    label: "全部",
  },
  {
    value: 2,
    label: "有库存",
  },
  {
    value: 1,
    label: "无库存",
  },
];

// table名称
const TABLENAME = [
  {
    displayName: "商品图片",
    fieldName: "images",
  },
  {
    displayName: "编号",
    fieldName: "serialNumber",
  },
  {
    displayName: "名称",
    fieldName: "name",
  },
  {
    displayName: "类别",
    fieldName: "type",
  },
  {
    displayName: "规格",
    fieldName: "standard",
  },
  {
    displayName: "销售价",
    fieldName: "salePrice",
  },
  {
    displayName: "出库价",
    fieldName: "costPrice",
  },
  {
    displayName: "库存",
    fieldName: "repertoryCount",
  },
  {
    displayName: "启用橱窗",
    fieldName: "isShopWindow",
  },
  {
    displayName: "发布/取消",
    fieldName: "isShow",
  },
];

export default {
  inject: ["initData"],
  name: "spare-parts",
  data() {
    return {
      params: {
        pageNum: 1,
        pageSize: 10,
      }, // 列表请求参数
      pagination: {}, //分页
      searchParts: "", // 搜索备件信息
      selectState: "全部", //状态
      selectStock: "全部", //库存
      outstockBatchDialog: false, //出库
      instockBatchDialog: false, //入库
      sparepartConfig: {}, // 出库数据
      manageRepertories: [],
      userId: "", //用户id
      auths: {}, //权限
      selected: [],
      selectStateList: STATELIST,
      selectStockList: STOCK,
      tableNames: TABLENAME,
      tableData: [],
    };
  },
  mounted() {
    const { initData } = this;
    this.userId = _.cloneDeep(initData.userId);
    this.auths = _.cloneDeep(initData.auths) || {};

    this.getShopSparepartRepertory();
    this.sparepartConfigs();
    this.allRepertory();
  },
  computed: {
    allowInout() {
      return AuthUtil.hasAuth(this.auths, "VIP_SPAREPART_INOUT");
    },
  },
  methods: {
    /*列表数据 */
    async getShopSparepartRepertory() {
      const params = {
        ...this.params,
      };
      const { result } = await SettingApi.getShopSparepartRepertory(params);

      const { list, total, pageNum, pageSize } = result.data;
      this.pagination = {
        total,
        pageNum,
        pageSize,
      };

      this.tableData = list.map((item) => {
        const {
          imageList,
          image,
          serialNumber,
          name,
          type,
          standard,
          salePrice,
          costPrice,
          isShopWindow,
          isShow,
          id,
        } = item.baseSparepart;
        let images = imageList ? JSON.parse(imageList)[0] : image;
        return {
          images,
          serialNumber,
          name,
          type,
          standard,
          salePrice,
          costPrice,
          repertoryCount: item.repertoryCount,
          isShopWindow: isShopWindow ? true : false,
          isShow: isShow ? true : false,
          id,
          relatedId: item.id,
          baseRepertory: item.baseRepertory,
          repertoryCount: item.repertoryCount,
          safetyStock: item.safetyStock,
        };
      });

      if (this.selected.length) {
        this.$nextTick(() => {
          this.selected.forEach((item) => {
            this.tableData.forEach((v) => {
              if (v.id === item.id) {
                this.$refs.multipleTable.toggleRowSelection(v);
              }
            });
          });
        });
      }
    },
    /*获取备件设置 */
    async sparepartConfigs() {
      const result = await SettingApi.sparepartConfig();
      this.sparepartConfig = result;
    },
    /*获取仓库列表 */
    async allRepertory() {
      const result = await SettingApi.allRepertory();
      let arr = Array.isArray(result) ? result : [];
      this.manageRepertories = arr.filter((item) => {
        return (
          null == item.manager ||
          item.manager.length == 0 ||
          item.manager.some((item) => item.userId == this.userId)
        );
      });
    },

    handleSelection(selection) {
      let tv = this.computeSelection(selection);
      // 在需要限制最多选择500个备件时，取消function内部全部注释即可
      let original = this.selected.filter((ms) =>
        this.tableData.some((cs) => cs.id === ms.id)
      );
      let unSelected = this.tableData.filter((c) =>
        original.every((oc) => oc.id !== c.id)
      );

      if (tv.length > 500) {
        this.$nextTick(() => {
          original.length > 0
            ? unSelected.forEach((row) => {
                this.$refs.multipleTable.toggleRowSelection(row, false);
              })
            : this.$refs.multipleTable.clearSelection();
        });
        return this.$platform.alert(`最多只能选择500条数据`);
      }
      this.selected = tv;
    },

    computeSelection(selection) {
      let tv = [];
      tv = this.selected.filter((ms) =>
        this.tableData.every((c) => c.id !== ms.id)
      );
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
    },
    /**
     * 判断是否是管理员
     */
    judgeSelectManager() {
      const { manager } = this.tableData[0].baseRepertory;
      let isManage;
      if (manager) {
        isManage = JSON.parse(manager).some((item) => {
          return item.userId == this.userId;
        });
      }
      return isManage;
    },
    /*清空 */
    toggleSelection() {
      this.selected = [];
      this.$refs.multipleTable.clearSelection();
    },
    /*选中的数据 */
    checkSelected() {
      return this.selected.map((item) => {
        return {
          id: item.relatedId,
          sparepart: {
            id: item.id,
            name: item.name,
            serialNumber: item.serialNumber,
            type: item.type,
            standard: item.standard,
          },
          repertory: item.baseRepertory,
          repertoryCount: item.repertoryCount,
          safetyStock: item.safetyStock,
        };
      });
    },
    /*出库 */
    outstockBatch() {
      if (!this.allowInout) {
        this.$platform.alert("对不起，您没有该操作权限");
        return;
      }
      if (!this.judgeSelectManager()) {
        this.$platform.alert(
          `尚未给您分配"${this.tableData[0].baseRepertory.name}"的管理员权限，请联系管理员或到备件库管理中设置`
        );
        return;
      }
      let outstockBatchFormList = this.checkSelected();
      this.outstockBatchDialog = true;
      this.$nextTick(() => {
        this.$refs.outstockBatchForm.receive(
          outstockBatchFormList || [],
          this.userId
        );
      });
    },
    /*入库 */
    instockBatch() {
      if (!this.allowInout) {
        this.$platform.alert("对不起，您没有该操作权限");
        return;
      }
      if (!this.judgeSelectManager()) {
        this.$platform.alert(
          `尚未给您分配"${this.tableData[0].baseRepertory.name}"的管理员权限，请联系管理员或到备件库管理中设置`
        );
        return;
      }
      let instockBatchFormList = this.checkSelected();
      this.instockBatchDialog = true;
      this.$nextTick(() => {
        this.$refs.instockBatchForm.receive(instockBatchFormList || []);
      });
    },
    /*入库请求 */
    instockBatchSave: _.debounce(async function () {
      let form = this.$refs.instockBatchForm;
      if (null == form) return;

      let instock = await form.pack();
      if (!Array.isArray(instock) || instock.length == 0) return;

      this.pending = true;

      try {
        let result = await this.$http.post(
          "/partV2/repertory/stockInOutBach",
          instock
        );

        if (result.status == 0) {
          this.$platform.toast("批量入库成功").then(() => {
            this.initialization()
            this.getShopSparepartRepertory()
          });
          this.instockBatchDialog = false;
        } else {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error);
      }
    }, 1000),
    /*出库请求*/
    outstockBatchSave: _.debounce(async function () {
      let form = this.$refs.outstockBatchForm;

      if (null == form) return;

      let outstock = await form.pack();

      if (!Array.isArray(outstock) || outstock.length == 0) return;

      this.pending = true;

      try {
        let result = await this.$http.post(
          "/partV2/repertory/stockInOutBach",
          outstock
        );
        if (result.status == 0) {
          this.$platform.toast("批量出库成功").then(() => {
            this.initialization()
            this.getShopSparepartRepertory()
          });
          this.outstockBatchDialog = false;
        } else {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error);
      }
    }, 1000),
    search() {
      const { selectState, searchParts, selectStock } = this;
      this.params.pageNum = 1;
      this.params.isShow = selectState !== '全部' ? selectState - 1 : "";
      this.params.keyWord = searchParts;
      this.params.haveStock = selectStock !== '全部' ? selectStock - 1 : "";
      this.getShopSparepartRepertory();
    },
    /** 初始化 */
    initialization() {
      this.params = {
        pageNum: 1,
        pageSize: 10,
      };
      this.searchParts = "";
      this.selectState = '全部';
      this.selectStock = "全部";
      this.getShopSparepartRepertory();
    },
    /*分页条数切换 */
    handleSizeChange(value) {
      this.params.pageNum = 1;
      this.params.pageSize = value;
      this.getShopSparepartRepertory();
    },
    /*分页页数切换 */
    handlePageChange(value) {
      this.params.pageNum = value;
      this.getShopSparepartRepertory();
    },

    /** 发布 取消 启动 */
    async updateIsShowOrIsShopWindows(value, id, type = 1) {
      const params = {
        id,
        type,
        flag: value ? 1 : 0,
      };
      const { message, code } = await SettingApi.updateIsShowOrIsShopWindows(
        params
      );
      if (code) {
        this.tableData = this.tableData.map((item) => {
          if (item.id === id) {
            item.isShopWindow = false;
          }
          return item;
        });
        this.$platform.alert(message);
      }
    },
  },
  components: {
    [PartOutStockBatchForm.name]: PartOutStockBatchForm,
    [PartInStockBatchForm.name]: PartInStockBatchForm,
  },
};
</script>
<style lang="scss" scoped>
.spare-parts {
  padding: 10px;
  .search-parts {
    width: 230px;
  }
  .select-state,
  .select-stock {
    margin-left: 12px;
    width: 180px;
  }
  &-img {
    width: 50px;
    height: 50px;
  }
  &-foot {
    margin-top: 10px;
    > div {
      &:first-child {
        font-size: 13px;
        color: #767e89;
      }
    }
  }
}
</style>
<style lang="scss">
.spare-parts {
  .select-state,
  .select-stock {
    .el-select {
      width: 100%;
    }
  }
  th > div {
    font-size: 14px !important;
    font-weight: 500 !important;
    border-color: #f2f2f2 !important;
  }
}
</style>