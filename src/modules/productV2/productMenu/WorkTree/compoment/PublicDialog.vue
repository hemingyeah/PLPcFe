<!--  -->
<template>
  <div>
    <!--  -->
    <el-dialog
      :title="dialogData[dialogType].title"
      :visible.sync="visible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="add-menu-dialog-box">
        <template v-if="dialogType == 'addMenu'">
          <el-form
            :model="ruleForm"
            :rules="rules"
            ref="ruleForm"
            label-width="100px"
            class="demo-ruleForm"
            status-icon
          >
            <el-form-item label="目录名称" prop="name">
            <el-input v-model="ruleForm.name"></el-input> </el-form-item
          ></el-form>
        </template>
        <template v-else>
          <div class="flex-x copy-el-form-item">
            <div class="lable-100">
              {{ dialogType == 'linkPart' ? '备件' : '知识库' }}：
            </div>
            <el-select
              class="flex-1"
              v-model="nowChooseArr"
              multiple
              filterable
              remote
              collapse-tags
              clearable
              placeholder="请输入关键词"
              :remote-method="lenovoselectSearchData"
              :loading="selectLoading"
            >
              <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              >
              </el-option>
            </el-select>
            <!-- <com-lenovoselect
              :search-data="lenovoselectSearchData"
              :default-item="false"
              ref="comLenovoselect"
              :choose-show-key="dialogType == 'linkPart' ? 'name' : 'title'"
              list-key="id"
              :com-ruturn-data="nowChooseArr"
              @dataUpdate="dataUpdate()('nowChooseArr')"
            >
              <template
                slot="select"
                slot-scope="slotProps"
                v-if="slotProps.slotData"
              >
                <div
                  v-for="(item, index) in slotProps.slotData.list"
                  :key="index"
                  class="flex-x"
                  :class="
                    slotProps.slotNowDataIndex[item.id] > -1
                      ? 'checked-item'
                      : ''
                  "
                  @click.prevent="slotClick(item, 'comLenovoselect')"
                >
                  <div>{{ item.name }}</div>
                </div>
              </template>
            </com-lenovoselect> -->
          </div>
        </template>
        <template v-if="dialogType == 'linkWiki'"> </template>
      </div>
      <div slot="footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </div>
    </el-dialog>
    <!--  -->
  </div>
</template>

<script>
import { getDocumentList } from '@src/api/Repository';
export default {
  name: 'public-dialog',
  props: {
    visibleProp: {
      type: Boolean,
    },
    dialogType: {
      type: String,
      default: 'addMenu',
    },
  },
  data() {
    return {
      dialogData: {
        addMenu: {
          title: '添加目录',
        },
        linkPart: {
          title: '关联备件',
        },
        linkWiki: {
          title: '关联知识库',
        },
      },
      nowChooseArr: [],
      selectedSparepart: [],
      ruleForm: {
        name: '',
      },
      rules: {
        name: [
          { required: true, message: '请输入目录名称', trigger: 'blur' },
          // { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
      },
      selectLoading: false,
      options: [],
    };
  },
  computed: {
    visible: {
      get() {
        return this.visibleProp;
      },
      set(val) {
        this.$emit('changeVisibleProp', val);
      },
    },
  },
  watch: {
    visible(newVal, oldVal) {
      if (newVal == false) {
        if (this.dialogData == 'addMenu') this.$refs['ruleForm'].resetFields();
        this.nowChooseArr = [];
        // this.$refs.comLenovoselect.resetSerchList();
      }
    },
  },
  methods: {
    confirm() {
      if (this.dialogType == 'addMenu') {
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) this.$emit('confirm', { name: this.ruleForm.name });
        });
      }
      console.log(JSON.stringify(this.nowChooseArr), 321);
    },
    dataUpdate(e, key) {
      console.log(e, key, 'get');
      this[key] = e;
    },
    calculateClass(e, t) {
      let str = '';
      if (e.slotNowData) {
        for (let index = 0; index < e.slotNowData.length; index++) {
          const element = e.slotNowData[index];
          if (element.orderId === t.orderId) {
            str = 'checked-item';
          }
        }
      }
      return str;
    },
    slotClick(e, ref) {
      this.$refs[ref].chooseItem(e);
    },
    lenovoselectSearchData(data = {}) {
      return new Promise((resolve, reject) => {
        if (this.dialogType == 'linkPart') {
          this.selectLoading = true;
          this.$http
            .get('/partV2/category/listData', {
              ...data,
            })
            .then((res) => {
              if (!res) {
                return reject();
              }
              this.options = res.list;
              resolve(res);
            })
            .catch((err) => {
              reject();
            })
            .finally(() => {
              this.selectLoading = false;
            });
        } else {
          getDocumentList({ ...data })
            .then((res) => {
              if (res.code != 0) {
                return reject();
              }
              resolve(res.result);
            })
            .catch((err) => {
              reject();
            });
        }
      });
    },
    /**
     * @description 搜索备件
     */
    searchPart(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {};
      pms.repertoryId = this.repertoryId || '';
      pms.with_OOS = false;
      pms.keyWord = pms.keyword;
      return this.$http
        .get('/task/spare/list', pms)
        .then((res) => {
          if (!res || !res.list) return;
          res.list = res.list.map((template) =>
            Object.freeze({
              label: template.name,
              value: template.id,
              ...template,
            })
          );
          return res;
        })
        .catch((e) => console.error(e));
    },
    /**
     * @description 选择备件
     */
    updatePart(value) {
      let newValue = value[0];

      for (let key in this.sparepart) {
        if (key == 'salePrice') {
          this.sparepart.salePrice = newValue.salePrice.toFixed(2);
        } else if (key == 'number') {
          this.sparepart.number = newValue.availableNum > 1 ? 1 : newValue.availableNum;
        } else {
          this.sparepart[key] = newValue[key];
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.add-menu-dialog-box {
  padding: 12px 12px 0 0;
}
.lable-100 {
  width: 100px;
  padding-left: 20px;
}
.copy-el-form-item {
  margin-bottom: 18px;
}
.checked-item {
  background: $color-primary;
}
</style>
<style lang="scss">
.el-dialog__body {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  border-bottom: 1px solid rgba(0, 0, 0, 0.09);
  padding: 0;
}
</style>
