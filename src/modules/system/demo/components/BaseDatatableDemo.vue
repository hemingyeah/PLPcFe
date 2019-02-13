<template>
  <div class="base-data-table-view team-table-view">
    <div style="height:24px;">
      <button>选择列</button>
    </div>
    <base-datatable
      ref="teamTable" class="team-list-table"
      :columns="columns" :rows="rows"
      row-key="id" 
      :stripe="true"
      :multiple="true"
      @select="select"
      max-height="100vh - 68px">
    </base-datatable>

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

export default {
  name: 'base-datatable-demo',
  data(){
    return {
      rows: this.buildRows(),
      columns: this.buildColumns(),
      multipleSelectionPanelShow: false,
      selection: [],
      selectedLimit: 200,
      multipleSelection: [],
    }
  },
  methods: {
    buildRows(){
      return [
        {
          id: 123152341324,
          name: '山东团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座',
          location: '山东省青岛市李沧区',
          children: [
            {
              id: 123543563425342341,
              name: '济南团队',
              manager: '张三',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心A济南团队张三济南团队张三济南团队张三济南团队张三济南团队张三'
            },
            {
              id: 16345423412432,
              name: '青岛团队',
              manager: '李四',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心B'
            },
            {
              id: 1256134512343241,
              name: '临沂团队',
              manager: '王五',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心C济南团队张三济南团队张三济南团队张三济南团队张三济南团队张三'
            }
          ],
        },
        {
          id: 153461342341234,
          name: '山西团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 123643151344324,
          name: '北京团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [
            {
              id: 123534161345,
              name: '海淀团队',
              manager: '张三',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心'
            },
            {
              id: 132534161346,
              name: '朝阳团队',
              manager: '张三',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心'
            },
            {
              id: 165346431515,
              name: '中关村团队',
              manager: '张三',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心'
            }
          ],
        },
        {
          id: 13253463425464536,
          name: '上海团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 15314623463425234525,
          name: '河北团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122221,
          name: '测试团队-1',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122222,
          name: '测试团队-2',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122223,
          name: '测试团队-3',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122224,
          name: '测试团队-4',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122225,
          name: '测试团队-5',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122226,
          name: '测试团队-6',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122227,
          name: '测试团队-7',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122228,
          name: '测试团队-8',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122229,
          name: '测试团队-9',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122210,
          name: '测试团队-10',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122211,
          name: '测试团队-11',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 122212,
          name: '测试团队-12',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 1222213,
          name: '测试团队-13',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 1222214,
          name: '测试团队-14',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        }
      ]
    },
    buildRowsCopy(){
      return [
        {
          id: 6234523143241435,
          name: '1111山东团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [
            {
              id: 1634534152345,
              name: '111济南团队',
              manager: '张三',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心A'
            },
            {
              id: 456431325345342,
              name: '1111青岛团队',
              manager: '李四',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心B'
            },
            {
              id: 1345615641353416134,
              name: '111临沂团队',
              manager: '王五',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心C'
            }
          ],
        },
        {
          id: 16346756745634,
          name: '111山西团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 26456756745523467,
          name: '111北京团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [
            {
              id: 246546765756,
              name: '111海淀团队',
              manager: '张三',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心'
            },
            {
              id: 523464575674132,
              name: '111朝阳团队',
              manager: '张三',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心'
            },
            {
              id: 24674756723453425,
              name: '1111中关村团队',
              manager: '张三',
              phone: '13895546633',
              area: '山东省青岛市市北区万科中心'
            }
          ],
        },
        {
          id: 23456476547568568,
          name: '1111上海团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        },
        {
          id: 64563234523475674235,
          name: '111河北团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市市北区万科中心',
          location: '山东省青岛市李沧区',
          children: [],
        }
      ]
    },
    buildColumns(){
      return [
        {
          field: 'name',
          label: '团队名称',
          width: 150,
          expandProp: 'children',
          render(h, col, row){
            return (
              <a href="javscript:;">{row.name}</a>
            )
          },
        },
        {
          field: 'manager',
          label: '团队主管',
          width: 150,
          render(h, col, row) {
            return (
              <span> {row.manager} </span>
            )
          },
        },
        {
          field: 'phone',
          label: '电话',
          width: 200,
        },
        {
          field: 'area',
          label: '负责区域',
          overflow: 'tooltip',
          headRender(h, col){
            return [
              col.label,
              <i class="iconfont icon-address" style="font-size:14px;"></i>
            ]
          },
          render1(h, col, row) {
            let str = ''
            if(row.area.length < 25) {
              str = row.area;
              return (<div style={{'width': col['elWidth'] + 'px'}} class="base-table-nowrap-text">{str}</div>)
            } else {
              str = row.area.substring(0, 25) + '...'
              return (
                <el-tooltip class="item" effect="dark" content={row.area} placement="top">
                  <div style={{'width': col['elWidth'] + 'px'}} class="base-table-nowrap-text">{str}</div>
                </el-tooltip>
              )
            }
          }
        },
        {
          field: 'location',
          label: '所在位置',
          width: 150,
        },
        {
          field: 'location',
          label: '所在位置',
          width: 150,
        },
        {
          field: 'location',
          label: '所在位置',
          width: 150,
        },
        {
          field: 'location',
          label: '所在位置',
          width: 150,
        },
        {
          field: 'location',
          label: '所在位置',
          width: 150,
        },
        {
          field: 'location',
          label: '所在位置',
          width: 150,
        },
        {
          field: 'location',
          label: '所在位置',
          width: 150,
        },
        {
          field: 'location',
          label: '所在位置',
          width: 150,
        }
      ]
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
  body{
    background-color: #fff;
  }
  .base-data-table-view {
    width: 100%;
  }

  .team-list-table{
    max-height: calc(100vh - 44px);
  }
</style>
