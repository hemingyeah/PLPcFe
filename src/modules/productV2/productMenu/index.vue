<template>
  <div class="work-tree-box"
       v-loading.fullscreen.lock="fullscreenLoading">
    <div id="product-catalog-add"></div>
    <base-collapse class="modal-box"
                   :right-size="3">
      <template slot="left">
        <div class="draggable-box">
          <div class="flex-1 draggable-data">
            <template v-if="treeData[0].tasks.length">
              <work-tree-draggable ref="workTreeDraggable"
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
                                   :sort-menu="sortMenu" />
            </template>
            <div class="flex-x jus-center"
                 style="height:100%;"
                 v-else-if="treeLoaded">
              <div class="text-center">
                还未添加产品分类 <br>
                请在左下方添加一级分类
              </div>
            </div>
          </div>
          <div class="flex-x draggable-data-btn">
            <div class="draggable-data-btn-item cur-point"
                 id="product-catalog-add-1"
                 @click.stop="changeDialog('addMenu')">
              <i class="iconfont icon-zhankai"></i>
              新建一级分类
            </div>
            <div class="draggable-data-btn-item cur-point"
                 @click.stop="changeAll">
              全部{{ allType ? '折叠' : '展开' }}
            </div>
          </div>
        </div>
      </template>
      <template slot="right">
        <div class="data-box">
          <work-tree-data :prop-data="nowEditMenu"
                          ref="workTreeData" />
        </div>
      </template>
    </base-collapse>

    <!--  -->
    <public-dialog ref="publicDialog"
                   :visible-prop="visibleProp"
                   @changeVisibleProp="changeVisibleProp"
                   @confirm="dialogConfirm"
                   :dialog-type="dialogType"
                   :now-edit-menu="nowEditMenu"
                   :child-data="childData"></public-dialog>
                   <!--  -->
  </div>
</template>
<script>
import _, { result } from 'lodash';

import workTreeDraggable from '@src/modules/productV2/productMenu/WorkTree/workTreeDraggable';
import WorkTreeData from '@src/modules/productV2/productMenu/WorkTree/WorkTreeData';
import PublicDialog from '@src/modules/productV2/productMenu/WorkTree/compoment/PublicDialog';

import {
  getTreeList,
  setTreeList,
  setPagerelationPartOrWiki,
  renameTree,
  cloneMenu,
} from '@src/api/ProductV2Api';

import { storageGet, storageSet } from '@src/util/storage';

const {
  PRODUCT_CATALOG_ADD
} = require('@src/component/guide/productV2Store');

let finded = false;
export default {
  provide () {
    return {
      rootDataChange: this.rootDataChange,
      changeDialog: this.changeDialog,
      getTreeData: this.getTreeData,
      changeTree: this.changeTree,
      changeTreeDetail: this.changeTreeDetail,
    };
  },
  data () {
    return {
      allType: true,
      visibleProp: false,
      dialogType: 'addMenu',
      treeData: [
        {
          id: '',
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
      fasterFindId: '',
      treeLoaded: false
    };
  },
  components: {
    workTreeDraggable,
    WorkTreeData,
    PublicDialog,
  },
  created () {
    let id = this.$getUrlObj(window).id;
    if (id) {
      this.fasterFindId = id;
    }
    this.getTreeData();
  },
  mounted () {
    this.$nextTick(() => {
      if (storageGet(PRODUCT_CATALOG_ADD) && storageGet(PRODUCT_CATALOG_ADD) > 0) this.$Guide().destroy('product-catalog-add')
      else this.$Guide([{
        content:
          '新建产品类型，最多支持10级关系',
        haveStep: false,
        id: 'product-catalog-add',
        domId: 'product-catalog-add-1',
        finishBtn: 'OK',
      }], 0, '', (e) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }).create().then(res_=>{if(res_)storageSet(PRODUCT_CATALOG_ADD, '1')})
    })
  },
  methods: {
    changeVisibleProp (e) {
      this.visibleProp = e;
    },
    changeAll () {
      this.allType = !this.allType;
      this.forAllArr(this.treeData[0].tasks, this.allType);

      // window.parent.changeLinkPage();  快速刷页面
    },
    forAllArr (obj, val) {
      for (let index = 0; index < obj.length; index++) {
        let item = obj[index];
        item.showList = val;
        try {
          if (item.tasks.length > 0) {
            this.forAllArr(item.tasks, val);
          }
        } catch (error) { }
      }
    },
    dialogConfirm (e) {
      this.$refs.publicDialog.changeBtnLoading(true);
      switch (this.dialogType) {
      case 'addMenu':
        e = {
          ...e,
          parentId: '',
          pathName: `${e.catalogName}`,
          orderId: this.treeData[0].tasks.length,
          showList: 1,
        };
        this.addMenu(e);
        break;
      case 'addMenuChild':
        e = {
          ...e,
          parentId: this.childData.id,
          pathName: [
            ..._.cloneDeep(this.childData.pathNameArr),
            e.catalogName,
          ].join('/'),
          showList: 1,
          orderId: this.childData.orderId
        }
        this.addMenu(e);
        break;
      case 'renameMenuChild':
        e = {
          ...e,
          pathName: [...this.childData.pathNameArr, e.catalogName].join('/'),
          id: this.childData.id,
        };
        this.renameMenu(e);
        break;
      case 'linkPart':
        if (Object.keys(e).length) {
          this.link('part', e.nowChooseArr);
        } else {
          this.changeVisibleProp(false);
        }
        break;
      case 'linkWiki':
        if (Object.keys(e).length) {
          this.link('wiki', e.nowChooseArr);
        } else {
          this.changeVisibleProp(false);
        }
        break;
      case 'cloneMenu':
        if (e.nowChooseArr && e.nowChooseArr.length > 0) {
          this.$message({
            message: '复制成功',
            type: 'success',
          });
          this.$refs.workTreeData.reflashPage(e.nowChooseArr[0]);
          this.changeVisibleProp(false);
          // cloneMenu({
          //   cloneId: e.nowChooseArr[0],
          //   catalogId: this.nowEditMenu.id,
          // }).then((res) => {
          //   if (res.code == 0) {
          //     this.$message({
          //       message: '复制成功',
          //       type: 'success',
          //     });
          //     window.parent.flashSomePage([{
          //       type: 'M_PRODUCT_CATALOG',
          //     }]);

          //     this.$refs.workTreeData.reflashPage(e.nowChooseArr[0]);
          //     this.changeTreeDetail('conData', 1)
          //     this.changeVisibleProp(false);
          //   } else {
          //     this.$notify.error({
          //       title: '网络错误',
          //       message: res.message,
          //       duration: 2000,
          //     });
          //   }
          // }).finally(() => {
          //   this.$refs.publicDialog.changeBtnLoading(false);
          // });
        } else {
          this.$refs.publicDialog.changeBtnLoading(false);
        }
        break;
      default:
        break;
      }
    },
    changeDialog (type) {
      this.dialogType = type;
      this.changeVisibleProp(true);
    },
    rootDataChange (key, val) {
      this.$set(this, key, val);
      if (key == 'nowEditMenu') this.$refs.workTreeData.resetForm();
    },
    getTreeData () {
      this.fullscreenLoading = true;
      this.treeLoaded = false;
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

                  fasterEditRoot_['canEditConData'] = !(
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
                  console.warn('getTreeList error', error);
                }
              }
              this.nowEditMenu = nowEditMenu;
            }
          } else {
            this.$notify.error({
              title: '网络错误',
              message: res.message,
              duration: 2000,
            });
          }
        })
        .finally(() => {
          this.treeLoaded = true;
          this.fullscreenLoading = false;
        });
    },
    addMenu (e) {
      setTreeList(e)
        .then((res) => {
          if (res.code == 0) {
            if (res.result) {
              res.result.tasks = [];
              if (this.dialogType == 'addMenu') {
                this.changeTree('add', [0], res.result);
              } else {
                if (this.nowEditMenu && this.nowEditMenu.id == this.childData.id) {
                  this.nowEditMenu.canEditConData = false;
                }
                this.changeTree('add', this.childData.indexArr, res.result);
              }
            }
            this.changeVisibleProp(false);
          } else {
            this.$notify.error({
              title: '网络错误',
              message: res.message,
              duration: 2000,
            });
          }
        })
        .finally(() => {
          this.$refs.publicDialog.changeBtnLoading(false);
        });
    },
    renameMenu (e) {
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
              if (this.nowEditMenu.id == res.result.id) this.nowEditMenu.name = res.result.name;
            }
            this.changeVisibleProp(false);
          } else {
            this.$notify.error({
              title: '网络错误',
              message: res.message,
              duration: 2000,
            });
          }
        })
        .finally(() => {
          this.$refs.publicDialog.changeBtnLoading(false);
        });
    },
    changeTree (type, indexArr, data, des) {
      // console.log(type, indexArr, data);
      try {
        let element = this.findRoot(
          this.treeData,
          indexArr,
          0,
          indexArr.length - 1
        );
        if (type == 'add') {
          element.push(data);
        } else if (type == 'delete') {
          if (this.nowEditMenu && this.nowEditMenu.id == des.id) {
            this.nowEditMenu = {};
          }
          element.splice(data, 1);
        }
      } catch (error) { }
    },
    changeTreeDetail (key, val) {
      try {
        let element = this.findRoot(
          this.treeData,
          this.nowEditMenu.indexArr,
          0,
          this.nowEditMenu.indexArr.length - 2
        );
        element[this.nowEditMenu.nowIndex][key] = val;
      } catch (error) {
        console.warn(error);
      }
    },
    findRoot (data, indexArr, index, max) {
      let root = data[indexArr[index]].tasks;
      if (index < max) {
        index++;
        return this.findRoot(root, indexArr, index, max);
      }
      return root;
    },
    fasterFindRootById (arr, id, indexArr) {
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
          item['indexArr'] = indexArr_;
          item['nowIndex'] = index;
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
    fasterShowList (data, indexArr, index) {
      let root = data[indexArr[index]].tasks;
      // debugger;
      if (index < indexArr.length - 2) {
        index++;
        if (index > 0 && indexArr.length > 2) {
          root[indexArr[index]]['showList'] = 1;
        }
        if (root.length) this.fasterShowList(root, indexArr, index);
      }
    },
    link (type, data) {
      setPagerelationPartOrWiki({
        catalogId: this.nowEditMenu.id,
        relationIds: data,
        type,
      })
        .then((res) => {
          if (res.code == 0) {
            this.changeVisibleProp(false);
            this.$refs.workTreeData.reflashTable(type);
            this.changeTreeDetail('conData', 1);
            window.parent.flashSomePage([{
              type: 'M_PRODUCT_CATALOG',
            }]);
          } else {
            this.$notify.error({
              title: '网络错误',
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
  padding: 10px 10px 0 10px;
  overflow: hidden;
  position: relative;

  .modal-box {
    width: 100%;
    height: 100%;
    .draggable-box {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
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
      height: 56px;
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
      height: 100%;
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
