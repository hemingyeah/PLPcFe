<template>
  <div class="base-data-table-view team-table-view">
    <base-table
      ref="teamTable" class="team-list-table"
      row-key="id" max-height="100vh - 44px"
      stripe multiple advanced
      :columns="columns" :rows="rows" @select="select" 
      @update="updateTable">
    </base-table>

    <div style="height:24px;">
      <button type="button" @click="insert">添加数据</button>
      <button type="button" @click="selectInit">清空</button>
      <button type="button" @click="prevPage">上一页</button>
      <button type="button" @click="nextPage">下一页</button>
      <button type="button" @click="multipleSelectionPanelShow = true">已选择({{multipleSelection.length}})</button>
      <span>共计{{rows.length}}行</span>
    </div>
    <base-panel :show.sync="multipleSelectionPanelShow" width="420px" class="selected-customer-panel">
      <h4 class="panel-title">
        已选择({{multipleSelection.length}})
        <i class="iconfont icon-fe-close" @click="multipleSelectionPanelShow = false"></i>
      </h4>
      <dl class="selected-team-list">
        <dt>
          <span class="id-team">编号</span>
          <span class="name-team">团队</span>
          <i></i>
        </dt>
        <dd v-for="(team, index) in multipleSelection" :key="team.id" >
          <span class="id-team">{{team.serialNumber}}</span>
          <span class="name-team">{{team.name}}</span>
          <span class="delete-btn">
            <i class="iconfont icon-fe-close" @click.self="cancelSelecTteam(team, index)"></i>
          </span>
        </dd>
      </dl>
      <el-button type="info" class="cancel-select-team-btn" @click="selectInit()">清除</el-button>
    </base-panel>
  </div>
</template>

<script>
import _ from "lodash";
import * as mock from './mock';

export default {
  name: 'base-datatable-demo',
  data(){
    return {
      rows: mock.genRows(),
      columns: mock.genColumns(),
      multipleSelectionPanelShow: false,
      selection: [],
      selectedLimit: 200,
      multipleSelection: [],
    }
  },
  methods: {
    updateTable({type, data}){
      if(type == 'column'){
       
        let columns = this.columns.map(col => {
          let same = data.find(item => item.field == col.field) || {};
          return {...col, ...same}
        })
console.log(this.columns)
        this.columns = columns;
        //TODO: 本地存储
      }
    },
    /** 取消选择 团队 */
    cancelSelecTteam(row, index) {
      this.multipleSelection.splice(index, 1);
      this.$nextTick(() => {
        this.$refs.teamTable.toggleRowSelection(row);
      });
    },
    insert(){
      this.rows = this.rows.concat(this.buildRows())
    },
    /** 批量选择 */
    matchSelected() {
      if (!this.multipleSelection.length) return;

      let selected = [];

      for(let i = 0; i < this.rows.length; i++) {
        let row = this.rows[i];
        let bool = this.multipleSelection.some(sc => {
          return sc.id == row.id
        })
        if(bool && selected.indexOf(row) < 0) {
          selected.push(row);
        } 

        for(let j = 0; j < row.children.length; j++) {
          let child = row.children[j];
          let isHasRow = this.multipleSelection.some(sc => {
            return sc.id == child.id
          })
          if(isHasRow) selected.push(child); continue;
        }  
        
      }
      this.$nextTick(() => {
        selected.forEach(row => {
          this.$refs.teamTable.toggleRowSelection(row, true);
        })
      });
    },
    /** 计算选中 */
    computeSelection(selection) {
      let tv = [];
      for(let i = 0; i < this.multipleSelection.length; i++) {
        let ms = this.multipleSelection[i];
        let hasRow = false;
        for(let j = 0; j < this.rows.length; j++) {
          let row = this.rows[j];
          if(ms.id === row.id) {
            hasRow = true
          }else {
            for(let k = 0; k < row.children.length; k++) {
              let child = row.children[k];
              if(child.id === ms.id) {
                hasRow = true;
              }
            }
          }

        }
        if(!hasRow) tv.push(ms)
      }
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
    },
    select(selection){
      let tv = this.computeSelection(selection);
      // let original = this.multipleSelection
      //   .filter(ms => this.rows.some(row => {
      //     return row.id === ms.id || 
      //     row.children.some(child => child.id == ms.id)
      //   } ));
      // let unSelected = this.rows
      //   .filter(c => original.every(oc => {
      //     return oc.id !== c.id ||
      //     oc.children.some(child => child.id == oc.id)
      //   }));

      if (tv.length > this.selectedLimit) {
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }
      this.multipleSelection = tv;
      // console.log(this.multipleSelection);
      // console.log(this.rows)
    },
    /** 清空select */
    selectInit() {
      this.multipleSelection = [];
      this.$refs.teamTable.clearSelection();
    },
    prevPage() {
      this.$set(this, 'rows', this.buildRows());
      this.matchSelected();
    },
    nextPage() {
      this.$set(this, 'rows', this.buildRowsCopy());
      this.matchSelected();
    }
  }
}
</script>

<style lang="scss">
.base-data-table-view {
  box-shadow: 0 0 4px rgba(0, 0, 0, .125)
}
</style>
