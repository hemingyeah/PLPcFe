<!--  -->
<template>
  <div class="normal-page-box">
    <div class="search-box">
      <div class="flex-x al-c mar-r-12">
        <img class="filter-img" :src="filter_img" alt="" /> 自定义筛选视图
        <i class="iconfont icon-triangle-down"></i>
      </div>
      <div class="mar-r-12 search-input">
        <el-input placeholder="请输入工单编号或工单信息">
          <el-select
            class="search-input-select"
            v-model="select_value_1"
            slot="prepend"
            placeholder="表单内容"
          >
            <el-option label="餐厅名" value="1"></el-option>
            <el-option label="订单号" value="2"></el-option>
            <el-option label="用户电话" value="3"></el-option>
          </el-select>
        </el-input>
      </div>
      <el-button type="primary">搜索</el-button>
      <el-button>重置</el-button>
      <el-button type="primary" plain>
        <i class="iconfont icon-gaojisousuo font-12 mar-r-4"></i>
        高级搜索</el-button
        >
    </div>
    <div class="status-box">
      <div
        class="flex-x al-s status-item"
        v-for="(item, index) in statusList"
        :key="index"
      >
        <div class="status-item-title">{{ item.title }}</div>
        <div class="flex-x flex-w flex-1">
          <div
            class="status-item-items"
            v-for="(items, indexs) in item.options"
            :key="indexs"
          >
            {{ items }}
          </div>
        </div>
      </div>
    </div>
    <div class="table-box">
      <div class="table-btn-box">
        <div class="flex-x">
          <el-button type="primary">
            <i class="iconfont icon-add font-12 mar-r-4"></i>
            新建</el-button
            >
          <div class="color-gray mar-l-25">
            <i class="iconfont font-12 icon-qingkongshanchu"></i> 删除
          </div>
          <div class="color-gray mar-l-25">
            <i class="iconfont font-12 icon-edit"></i> 批量编辑
          </div>
        </div>
        <div class="flex-x">
          <div class="flex-x color-gray">
            <i class="iconfont font-12 icon-liebiaoshitu mar-r-4"></i>
            列表模式<i class="iconfont font-12 icon-triangle-down mar-l-4"></i>
          </div>
          <div class="flex-x mar-l-25 color-gray">
            选择列<i class="iconfont font-12 icon-triangle-down mar-l-4"></i>
          </div>
          <div class="flex-x mar-l-25 color-gray">
            更多操作<i class="iconfont font-12 icon-triangle-down mar-l-4"></i>
          </div>
        </div>
      </div>
      <div class="table-con mar-t-10">
        <el-table
          :data="page.list"
          stripe
          style="width: 100%"
          :highlight-current-row="false"
          :border="true"
          class="task-list-table"
          header-row-class-name="common-list-table-header taks-list-table-header"
          ref="multipleTable"
        >
          <el-table-column prop="value_1" label="工单编号" width="180">
          </el-table-column>
          <el-table-column prop="value_2" label="工单类型" width="180">
          </el-table-column>
          <el-table-column prop="value_3" label="客户"> </el-table-column>
          <el-table-column prop="value_4" label="联系人"> </el-table-column>
          <el-table-column prop="value_5" label="电话"> </el-table-column>
        </el-table>
        <div class="table-footer comment-list-table-footer mar-t-20">
          <div class="comment-list-table-footer-info task-flex task-ai">
            共<span class="level-padding">{{ page.total || 0 }}</span
            >条
            <div class="task-font14 task-c6 task-ml12">
              每页
              <el-select
                v-model="page.pageSize"
                placeholder="请选择"
                class="table-footer-select"
              >
                <el-option :label="10" :value="10"></el-option>
                <el-option :label="20" :value="20"></el-option>
                <el-option :label="50" :value="50"></el-option>
              </el-select>
              条
            </div>
          </div>
          <el-pagination
            v-if="page.list.length"
            class="comment-list-table-footer-pagination"
            background
            :page-size="page.pageSize"
            :current-page="page.pageNum"
            layout="prev, pager, next, jumper"
            :total="page.total"
          >
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import filter_img from '@src/assets/img/customize.png';
export default {
  data() {
    return {
      filter_img,
      select_value_1: '',
      statusList: [
        {
          title: '工作状态：',
          options: [
            '全部',
            '待指派',
            '已指派',
            '已接受',
            '进行中',
            '已完成',
            '异常工单',
            '未完成',
          ],
        },
        {
          title: '创建视角：',
          options: ['全部', '我创建的', '我负责的', '我协同的'],
        },
        { title: '工单类型：', options: ['全部'] },
      ],
      page: {
        list: [
          {
            value_1: 'TEST001',
            value_2: '测试类型',
            value_3: '测试客户',
            value_4: '测试联系人',
            value_5: '18888888888',
          },
          {
            value_1: 'TEST001',
            value_2: '测试类型',
            value_3: '测试客户',
            value_4: '测试联系人',
            value_5: '18888888888',
          },
          {
            value_1: 'TEST001',
            value_2: '测试类型',
            value_3: '测试客户',
            value_4: '测试联系人',
            value_5: '18888888888',
          },
          {
            value_1: 'TEST001',
            value_2: '测试类型',
            value_3: '测试客户',
            value_4: '测试联系人',
            value_5: '18888888888',
          },
          {
            value_1: 'TEST001',
            value_2: '测试类型',
            value_3: '测试客户',
            value_4: '测试联系人',
            value_5: '18888888888',
          },
          {
            value_1: 'TEST001',
            value_2: '测试类型',
            value_3: '测试客户',
            value_4: '测试联系人',
            value_5: '18888888888',
          },
        ],
        total: 5,
        pageNum: 1,
        pageSize: 10,
      },
    };
  },
  created() {},
  mounted() {},
};
</script>
<style lang="scss" scoped>
.color-gray {
  color: #666;
}
.normal-page-box {
  margin: 10px;
  .search-box {
    background: #fff;
    display: flex;
    justify-content: flex-end;
    padding: 6px 16px;
    .filter-img {
      width: 18px;
      height: 15px;
      margin-right: 4px;
    }
    .search-input {
      width: 300px;
      .search-input-select {
        width: 100px;
      }
    }
  }

  .status-box {
    background: #fff;
    margin-bottom: 12px;
    .status-item {
      border-top: 1px solid #f2f2f2;
    }
    .status-item-title {
      padding-top: 4px;
      padding-left: 11px;
      width: 90px;
      font-weight: 500;
      background-color: #fafafa;
    }
    .status-item-items {
      padding-left: 11px;
      font-size: 13px;
      width: 130px;
      height: 30px;
      overflow-y: hidden;
      color: #808080;
      line-height: 30px;
    }
  }

  .table-box {
    padding: 16px;
    background: #fff;
    .table-btn-box {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
