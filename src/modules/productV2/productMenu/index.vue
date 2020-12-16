<template>
  <div class="work-tree-box" v-loading.fullscreen.lock="fullscreenLoading">
    <base-collapse class="modal-box" :right-size="3">
      <template slot="left">
        <div class="draggable-box">
          <div class="flex-1 draggable-data">
            <template v-if="treeData[0].tasks">
              <work-tree-draggable
                ref="workTreeDraggable"
                :com-index="-1"
                :tasks="treeData[0].tasks"
                :root-data="{
                  id: treeData[0].id,
                  banMoveIn: false,
                  indexArr: [0],
                  pathNameArr: [],
                }"
                :now-edit-menu="nowEditMenu"
                :now-hover-menu="nowHoverMenu"
                :deep-count="0"
                :sort-menu="sortMenu"
              />
            </template>
          </div>
          <div class="flex-x draggable-data-btn">
            <div
              class="draggable-data-btn-item cur-point"
              @click.stop="changeDialog('addMenu')"
            >
              <i class="iconfont icon-zhankai"></i>
              新建一级分类
            </div>
            <div
              class="draggable-data-btn-item cur-point"
              @click.stop="changeAll"
            >
              全部{{ allType ? '折叠' : '展开' }}
            </div>
          </div>
        </div>
      </template>
      <template slot="right">
        <div class="data-box">
          <work-tree-data :prop-data="nowEditMenu" ref="workTreeData" />
      </div> </template
    ></base-collapse>

    <!--  -->
    <public-dialog
      ref="publicDialog"
      :visible-prop="visibleProp"
      @changeVisibleProp="changeVisibleProp"
      @confirm="dialogConfirm"
      :dialog-type="dialogType"
      :init-data="childData"
    ></public-dialog>
    <!--  -->
  </div>
</template>
<script>
import _ from "lodash";

import workTreeDraggable from "@src/modules/productV2/productMenu/WorkTree/workTreeDraggable";
import WorkTreeData from "@src/modules/productV2/productMenu/WorkTree/WorkTreeData";
import PublicDialog from "@src/modules/productV2/productMenu/WorkTree/compoment/PublicDialog";

import {
  getTreeList,
  setTreeList,
  setPagerelationPartOrWiki,
  renameTree,
  cloneMenu,
} from "@src/api/ProductV2Api";

let finded = false;
export default {
  provide() {
    return {
      rootDataChange: this.rootDataChange,
      changeDialog: this.changeDialog,
      getTreeData: this.getTreeData,
      changeTree: this.changeTree,
      changeTreeDetail: this.changeTreeDetail,
    };
  },
  data() {
    return {
      allType: true,
      visibleProp: false,
      dialogType: "addMenu",
      treeData: [
        {
          id: "",
          tasks: [],
        },
      ],
      httpPending: [],
      nowEditMenu: {},
      nowHoverMenu: {},
      popoverVisible: {},
      fullscreenLoading: false,
      childData: {},
      sortMenu: {},
      dialogInitData: {},
      fasterFindId: "",
    };
  },
  components: {
    workTreeDraggable,
    WorkTreeData,
    PublicDialog,
  },
  created() {
    let id = this.$getUrlObj(window).id;
    if (id) {
      this.fasterFindId = id;
    }
    this.getTreeData();
  },
  methods: {
    changeVisibleProp(e) {
      this.visibleProp = e;
    },
    changeAll() {
      this.allType = !this.allType;
      this.forAllArr(this.treeData[0].tasks, this.allType);

      // window.parent.changeLinkPage();  快速刷页面
    },
    forAllArr(obj, val) {
      for (let index = 0; index < obj.length; index++) {
        let item = obj[index];
        item.showList = val;
        try {
          if (item.tasks.length > 0) {
            this.forAllArr(item.tasks, val);
          }
        } catch (error) {}
      }
    },
    dialogConfirm(e) {
      this.$refs.publicDialog.changeBtnLoading(true);
      switch (this.dialogType) {
      case "addMenu":
        e = {
          ...e,
          parentId: "",
          pathName: `${e.catalogName}`,
          orderId: this.treeData[0].tasks.length,
          showList: 1,
        };
        this.addMenu(e);
        break;
      case "addMenuChild":
        e = {
          ...e,
          parentId: this.childData.id,
          pathName: [
            ..._.cloneDeep(this.childData.pathNameArr),
            e.catalogName,
          ].join("/"),
          showList: 1,
          orderId:this.childData.orderId
        }
        this.addMenu(e);
        break;
      case "renameMenuChild":
        e = {
          ...e,
          pathName: [...this.childData.pathNameArr, e.catalogName].join("/"),
          id: this.childData.id,
        };
        this.renameMenu(e);
        break;
      case "linkPart":
        if (Object.keys(e).length) {
          this.link("part", e.nowChooseArr);
        } else {
          this.changeVisibleProp(false);
        }
        break;
      case "linkWiki":
        if (Object.keys(e).length) {
          this.link("wiki", e.nowChooseArr);
        } else {
          this.changeVisibleProp(false);
        }
        break;
      case "cloneMenu":
        if (e.nowChooseArr && e.nowChooseArr.length > 0) {
          this.$refs.workTreeData.reflashPage(e.nowChooseArr[0]);
          cloneMenu({
            cloneId: e.nowChooseArr[0],
            catalogId: this.nowEditMenu.id,
          }).then((res) => {
            if (res.code == 0) {
              this.$message({
                message: "复制成功",
                type: "success",
              });
              window.parent.flashSomePage({
                type: "M_PRODUCT_CATALOG",
              });
              this.changeVisibleProp(false);
            } else {
              this.$notify.error({
                title: "网络错误",
                message: res.message,
                duration: 2000,
              });
            }
          });
        }
        break;
      default:
        break;
      }
    },
    changeDialog(type) {
      this.dialogType = type;
      this.changeVisibleProp(true);
    },
    rootDataChange(key, val) {
      this.$set(this, key, val);
      if (key == "nowEditMenu") this.$refs.workTreeData.resetForm();
    },
    getTreeData() {
      this.fullscreenLoading = true;
      getTreeList()
        .then((res) => {
          if (res.code == 0) {
            this.treeData[0].tasks = res.result;

            if (res.result.length > 0) {
              let nowEditMenu = {
                id: res.result[0].id,
                canEditConData: !(res.result[0].tasks.length > 0),
                conData: res.result[0].conData || 0,
                name: res.result[0].name,
                indexArr: [0, 0],
                nowIndex: 0,
              };
              if (this.fasterFindId) {
                try {
                  let fasterEditRoot_ = this.fasterFindRootById(
                    this.treeData[0].tasks,
                    this.fasterFindId,
                    [0]
                  );

                  fasterEditRoot_["canEditConData"] = !(
                    fasterEditRoot_.tasks.length > 0
                  );
                  nowEditMenu = fasterEditRoot_;

                  if (fasterEditRoot_.indexArr.length > 2) {
                    this.fasterShowList(
                      this.treeData,
                      fasterEditRoot_.indexArr,
                      0
                    );
                  }
                } catch (error) {
                  console.warn("getTreeList error", error);
                }
              }
              this.nowEditMenu = nowEditMenu;
            }
          } else {
            this.$notify.error({
              title: "网络错误",
              message: res.message,
              duration: 2000,
            });
          }
        })
        .finally(() => {
          this.fullscreenLoading = false;
        });
    },
    addMenu(e) {
      setTreeList(e)
        .then((res) => {
          if (res.code == 0) {
            if (res.result) {
              res.result.tasks = [];
              if (this.dialogType == "addMenu") {
                this.changeTree("add", [0], res.result);
              } else {
                if(this.nowEditMenu && this.nowEditMenu.id == this.childData.id){
                  this.nowEditMenu.canEditConData = false;
                }
                this.changeTree("add", this.childData.indexArr, res.result);
              }
            }
            this.changeVisibleProp(false);
          } else {
            this.$notify.error({
              title: "网络错误",
              message: res.message,
              duration: 2000,
            });
          }
        })
        .finally(() => {
          this.$refs.publicDialog.changeBtnLoading(false);
        });
    },
    renameMenu(e) {
      renameTree(e)
        .then((res) => {
          if (res.code == 0) {
            if (res.result) {
              let element = this.findRoot(
                this.treeData,
                this.childData.indexArr,
                0,
                this.childData.indexArr.length - 2
              );
              // console.log(element, this.childData, 'renameMenu');
              element[this.childData.nowIndex].name = res.result.name;
            }
            this.changeVisibleProp(false);
          } else {
            this.$notify.error({
              title: "网络错误",
              message: res.message,
              duration: 2000,
            });
          }
        })
        .finally(() => {
          this.$refs.publicDialog.changeBtnLoading(false);
        });
    },
    changeTree(type, indexArr, data, des) {
      // console.log(type, indexArr, data);
      try {
        let element = this.findRoot(
          this.treeData,
          indexArr,
          0,
          indexArr.length - 1
        );
        if (type == "add") {
          element.push(data);
        } else if (type == "delete") {
          if (this.nowEditMenu && this.nowEditMenu.id == des.id) {
            this.nowEditMenu = {};
          }
          element.splice(data, 1);
        }
      } catch (error) {}
    },
    changeTreeDetail(key, val) {
      try {
        let element = this.findRoot(
          this.treeData,
          this.nowEditMenu.indexArr,
          0,
          this.nowEditMenu.indexArr.length - 2
        );
        console.log(element, "element")
        element[this.nowEditMenu.nowIndex][key] = val;
      } catch (error) {
        console.warn(error);
      }
    },
    findRoot(data, indexArr, index, max) {
      let root = data[indexArr[index]].tasks;
      if (index < max) {
        index++;
        return this.findRoot(root, indexArr, index, max);
      }
      return root;
    },
    fasterFindRootById(arr, id, indexArr) {
      let item;
      
      for (let index = 0; index < arr.length; index++) {

        let indexArr_ = _.cloneDeep(indexArr)
        if (finded) {
          break;
        }
        if (arr[index].id == id) {
          finded = true;
          item = arr[index];
          indexArr_.push(index);
          item["indexArr"] = indexArr_;
          item["nowIndex"] = index;
          break;
        } else if (arr[index].tasks.length > 0) {
          indexArr_.push(index);
          item = this.fasterFindRootById(arr[index].tasks, id, indexArr_);
        } else if (arr[index].tasks.length <= 0) {
          continue;
        }
      }
      if (finded) {
        return item;
      }
    },
    fasterShowList(data, indexArr, index) {
      let root = data[indexArr[index]].tasks;
      // debugger;
      if (index < indexArr.length - 2) {
        index++;
        if (index > 0 && indexArr.length > 2) {
          root[indexArr[index]]["showList"] = 1;
        }
        if (root.length) this.fasterShowList(root, indexArr, index);
      }
    },
    link(type, data) {
      setPagerelationPartOrWiki({
        catalogId: this.nowEditMenu.id,
        relationIds: data,
        type,
      })
        .then((res) => {
          if (res.code == 0) {
            this.changeVisibleProp(false);
            this.$refs.workTreeData.reflashTable(type);
            window.parent.flashSomePage({
              type: "M_PRODUCT_CATALOG",
            });
          } else {
            this.$notify.error({
              title: "网络错误",
              message: res.message,
              duration: 2000,
            });
          }
        })
        .finally(() => {
          this.$refs.publicDialog.changeBtnLoading(false);
        });
    },
  },
};
</script>
<style lang="scss">
@import url(../../linkc/assets/public.scss);

.work-tree-box {
  min-width: 300px;
  height: 100vh;
  overflow: hidden;

  .modal-box {
    .draggable-box {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100vh;
      overflow-x: hidden;
      .draggable-data {
        min-width: 250px;
        overflow-y: scroll;
        &::-webkit-scrollbar {
          width: 0 !important;
        }
        -ms-overflow-style: none;
        overflow: -moz-scrollbars-none;
      }
    }
    .draggable-data-btn {
      height: 48px;
      justify-content: space-between;
      background: #fafafa;
      padding: 0 12px;
      border-top: 1px solid $color-border-l1;
      &-item {
        .iconfont {
          color: #999;
        }
      }
    }
    .data-box {
      height: 100vh;
      overflow-y: scroll;
      &::-webkit-scrollbar {
        width: 0 !important;
      }
      -ms-overflow-style: none;
      overflow: -moz-scrollbars-none;
    }
  }
}
</style>
