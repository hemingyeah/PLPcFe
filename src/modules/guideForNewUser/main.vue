<!--  -->
<template>
  <div class="main-box flex-x">
    <div class="nav-box hide-scroll">
      <frame-nav
        :collapse.sync="collapse"
        :source="navBarMenus"
        :callcenter="has_call_center_module"
      />
    </div>
    <div class="con-box flex-1">
      <div class="status-header">
        <div class="size-50 flex-x al-c jus-center">
          <i class="iconfont icon-open"></i>
        </div>
        <div class="flex-x header-btn-box">
          <div class="header-btn-item">
            <i class="iconfont icon-dianhua1"></i>
          </div>
          <div class="header-btn-item">
            <i class="iconfont icon-experiment"></i>
          </div>
          <div class="header-btn-item">
            <i class="iconfont icon-bangzhu"></i>
          </div>
          <div class="header-btn-item">
            <i class="iconfont icon-customerservice"></i>
          </div>
          <div class="header-btn-item">
            <i class="iconfont icon-xiazai"></i>
          </div>
          <div class="header-btn-item">
            <i class="iconfont icon-notification"></i>
          </div>
          <div class="flex-x user-info">
            <img src="" alt="" />
            <div class="flex-1">
              <div>黄宝成</div>
              <div>工作中</div>
            </div>
            <i class="iconfont icon-nav-down font-12"></i>
          </div>
        </div>
      </div>
      <div class="frame-box">
        <div class="change-box"><i class="iconfont icon-zuoyidong"></i></div>
        <div class="flex-1 frame-list-box">
          <div
            class="frame-list-item"
            v-for="(item, index) in frameList"
            :key="index"
          >
            <i class="iconfont icon-Satisfied1 mar-r-6"></i>
            <div class="flex-1 overHideCon-1">{{ item.name }}</div>
            <i class="iconfont icon-fe-close color-gray font-12"></i>
          </div>
        </div>
        <div class="change-box"><i class="iconfont icon-youyidong"></i></div>
      </div>
      <keep-alive>
        <component :is="nowPage" :now-step="nowStepData"></component>
      </keep-alive>
    </div>


    <div class="guide-box">

    </div>
  </div>
</template>

<script>
import FrameNav from '@src/modules/system/frame/component/FrameNav.vue';
import CopyTaskList from '@src/modules/guideForNewUser/compoment/CopyTaskList.vue';
import CopyTaskDetail from '@src/modules/guideForNewUser/compoment/CopyTaskDetail.vue';
export default {
  data() {
    return {
      collapse: false,
      has_call_center_module: false,
      navBarMenus: [
        {
          parent: null,
          menuKey: 'M_CASE',
          menuIcon: 'iconfont icon-caidan_fuwutai',
          name: '服务台',
          url: null,
          order: 100,
        },
        {
          parent: 'M_CASE',
          menuKey: 'M_CASE_LIST',
          menuIcon: 'fa fa-files-o',
          name: '服务事件',
          url: '/event',
          order: 101,
        },
        {
          parent: 'M_CASE',
          menuKey: 'M_CASE_ORDER',
          menuIcon: 'fa fa-files-o',
          name: '服务订单',
          url: '/event/order',
          order: 102,
        },
        {
          parent: null,
          menuKey: 'M_TASK',
          menuIcon: 'iconfont icon-caidan_gongdanmokuai',
          name: '工单中心',
          url: null,
          order: 200,
        },
        {
          parent: 'M_TASK',
          menuKey: 'M_TASK_ALL',
          menuIcon: 'fa fa-files-o',
          name: '工单列表',
          url: '/task',
          order: 201,
        },
        {
          parent: 'M_TASK',
          menuKey: 'M_TASK_NEW',
          menuIcon: 'fa fa-files-o',
          name: '新建工单',
          url: '/task/edit',
          order: 202,
        },
        {
          parent: 'M_TASK',
          menuKey: 'M_TASK_ALLOT',
          menuIcon: 'fa fa-files-o',
          name: '指派工单',
          url: '/task/allot',
          order: 203,
        },
        {
          parent: 'M_TASK',
          menuKey: 'M_TASK_AUDIT',
          menuIcon: 'fa fa-files-o',
          name: '审核结算',
          url: '/balance/alreadySettlement',
          order: 204,
        },
        {
          parent: 'M_TASK',
          menuKey: 'M_TASK_REVIEW',
          menuIcon: 'fa fa-files-o',
          name: '回访工单',
          url: '/task/review',
          order: 205,
        },
        {
          parent: 'M_TASK',
          menuKey: 'M_TASK_CLOSE',
          menuIcon: 'fa fa-files-o',
          name: '关闭工单',
          url: '/task/close',
          order: 206,
        },
        {
          parent: 'M_TASK',
          menuKey: 'M_TASK_PLAN',
          menuIcon: 'fa fa-files-o',
          name: '计划任务',
          url: '/task/planTask/list',
          order: 207,
        },
        {
          parent: 'M_TASK',
          menuKey: 'M_TASK_POOL',
          menuIcon: 'fa fa-files-o',
          name: '工单池',
          url: '/task/taskPool',
          order: 208,
        },
        {
          parent: null,
          menuKey: 'M_VIP_FINANCE',
          menuIcon: 'iconfont icon-caidan_caiwumokuai',
          name: '财务管理',
          url: null,
          order: 280,
        },
        {
          parent: 'M_VIP_FINANCE',
          menuKey: 'M_VIP_PAYMENT_ONLINE',
          menuIcon: 'fa fa-files-o',
          name: '在线支付管理',
          url: '/payment/paymentBillOnline',
          order: 281,
        },
        {
          parent: null,
          menuKey: 'M_CUSTOMER',
          menuIcon: 'iconfont icon-caidan_kehumokuai',
          name: '客户信息',
          url: null,
          order: 300,
        },
        {
          parent: 'M_CUSTOMER',
          menuKey: 'M_CUSTOMER_LIST',
          menuIcon: 'fa fa-files-o',
          name: '客户管理',
          url: '/customer',
          order: 301,
        },
        {
          parent: 'M_CUSTOMER',
          menuKey: 'M_LINKMAN_LIST',
          menuIcon: null,
          name: '客户联系人',
          url: '/linkman/jump/list',
          order: 302,
        },
        {
          parent: null,
          menuKey: 'M_PRODUCT_MANAGE',
          menuIcon: 'iconfont icon-caidan-chanpin',
          name: '产品管理',
          url: '',
          order: 330,
        },
        {
          parent: 'M_PRODUCT_MANAGE',
          menuKey: 'M_PRODUCT_LIST',
          menuIcon: 'fa fa-files-o',
          name: '产品列表',
          url: '/customer/product',
          order: 331,
        },
        {
          parent: 'M_PRODUCT_MANAGE',
          menuKey: 'M_PRODUCT_CATALOG',
          menuIcon: 'fa fa-files-o',
          name: '产品类型',
          url: '/productV2/catalog/list',
          order: 332,
        },
        {
          parent: 'M_PRODUCT_MANAGE',
          menuKey: 'M_PRODUCT_TEMPLATE_NEW',
          menuIcon: 'fa fa-files-o',
          name: '产品模板',
          url: '/product',
          order: 333,
        },
        {
          parent: 'M_PRODUCT_MANAGE',
          menuKey: 'M_PRODUCT_QR_CODE',
          menuIcon: 'fa fa-files-o',
          name: '产品二维码',
          url: '/product/qrcode',
          order: 334,
        },
        {
          parent: null,
          menuKey: 'M_VIP_SPAREPART',
          menuIcon: 'iconfont icon-caidan_beijianguanli',
          name: '备件管理',
          url: null,
          order: 410,
        },
        {
          parent: 'M_VIP_SPAREPART',
          menuKey: 'M_VIP_SPAREPART_LIST',
          menuIcon: 'fa fa-files-o',
          name: '备件品类',
          url: '/partV2/category/list',
          order: 411,
        },
        {
          parent: 'M_VIP_SPAREPART',
          menuKey: 'M_VIP_SPAREPART_STOCK',
          menuIcon: 'fa fa-files-o',
          name: '备件库存',
          url: '/partV2/repertory/stock',
          order: 412,
        },
        {
          parent: 'M_VIP_SPAREPART',
          menuKey: 'M_VIP_SPAREPART_RECORD',
          menuIcon: 'fa fa-files-o',
          name: '出入库记录',
          url: '/partV2/repertory/record',
          order: 413,
        },
        {
          parent: 'M_VIP_SPAREPART',
          menuKey: 'M_VIP_SPAREPART_APPLY',
          menuIcon: 'fa fa-files-o',
          name: '办理出入库',
          url: '/partV2/repertory/apply',
          order: 414,
        },
        {
          parent: 'M_VIP_SPAREPART',
          menuKey: 'M_VIP_SPAREPART_PERSON',
          menuIcon: 'fa fa-files-o',
          name: '个人备件库',
          url: '/partV2/repertory/person',
          order: 415,
        },
        {
          parent: null,
          menuKey: 'M_DASHBOARD',
          menuIcon: 'iconfont icon-caidan_yunyingtongji',
          name: '运营分析',
          url: null,
          order: 450,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_DASHBOARD_YWJH',
          menuIcon: 'fa fa-files-o',
          name: '业务计划',
          url: '/stats/plan',
          order: 454,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_DASHBOARD_RYBB',
          menuIcon: 'fa fa-files-o',
          name: '人员报表',
          url: '/stats/staff',
          order: 455,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_DASHBOARD_YSBB',
          menuIcon: 'fa fa-files-o',
          name: '营收报表',
          url: '/stats/revenue',
          order: 456,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_DASHBOARD_GDBB',
          menuIcon: 'fa fa-files-o',
          name: '工单报表',
          url: '/stats/task',
          order: 457,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_DASHBOARD_KGBB',
          menuIcon: 'fa fa-files-o',
          name: '客户报表',
          url: '/stats/customer',
          order: 458,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_DASHBOARD_FWTBB',
          menuIcon: 'fa fa-files-o',
          name: '服务台报表',
          url: '/stats/station',
          order: 459,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_DASHBOARD_BJBB',
          menuIcon: 'fa fa-files-o',
          name: '备件报表',
          url: '/stats/sparepart/showStatistics',
          order: 460,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_DASHBOARD_FWXM',
          menuIcon: 'fa fa-files-o',
          name: '服务项目报表',
          url: '/stats/servicePrice',
          order: 461,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_DASHBOARD_JX',
          menuIcon: 'fa fa-files-o',
          name: '绩效报告',
          url: '/performance/list',
          order: 462,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_DASHBOARD_SCREEN',
          menuIcon: 'fa fa-files-o',
          name: '数据大屏',
          url: '/stats/screenData/screenDataView',
          order: 463,
        },
        {
          parent: null,
          menuKey: 'M_SERVICE',
          menuIcon: 'iconfont icon-caidan_fuwuguanli',
          name: '服务管理',
          url: null,
          order: 500,
        },
        {
          parent: 'M_SERVICE',
          menuKey: 'M_SERVICE_PROJECT',
          menuIcon: 'fa fa-files-o',
          name: '服务项目',
          url: '/service/price',
          order: 501,
        },
        {
          parent: 'M_SERVICE',
          menuKey: 'M_SERVICE_RECORD',
          menuIcon: 'fa fa-files-o',
          name: '服务记录',
          url: '/service/price/record',
          order: 502,
        },
        {
          parent: null,
          menuKey: 'M_INFO',
          menuIcon: 'iconfont icon-caidan_xinxiguanli',
          name: '信息管理',
          url: null,
          order: 600,
        },
        {
          parent: 'M_INFO',
          menuKey: 'M_INFO_DOC',
          menuIcon: 'fa fa-book',
          name: '知识库',
          url: '/wiki',
          order: 601,
        },
        {
          parent: 'M_INFO',
          menuKey: 'M_INFO_NOTICE',
          menuIcon: 'fa fa-book',
          name: '信息公告',
          url: '/info/notice',
          order: 602,
        },
        {
          parent: null,
          menuKey: 'M_USER',
          menuIcon: 'iconfont icon-caidan_zhanghaoquanxian',
          name: '账号权限',
          url: null,
          order: 700,
        },
        {
          parent: 'M_USER',
          menuKey: 'M_STAFF',
          menuIcon: 'fa fa-files-o',
          name: '账号管理',
          url: '/security/user',
          order: 701,
        },
        {
          parent: 'M_USER',
          menuKey: 'M_EE_TAG',
          menuIcon: 'fa fa-files-o',
          name: '团队管理',
          url: '/security/tag',
          order: 702,
        },
        {
          parent: 'M_USER',
          menuKey: 'M_ROLE',
          menuIcon: 'fa fa-files-o',
          name: '角色管理',
          url: '/security/role',
          order: 703,
        },
        {
          parent: null,
          menuKey: 'M_SYSTEM',
          menuIcon: 'iconfont icon-caidan_shezhi',
          name: '系统管理',
          url: '/setting',
          order: 800,
        },
        {
          parent: 'M_CASE',
          menuKey: 'M_CALLCENTER_WORKBENCH_LIST',
          menuIcon: 'fa fa-files-o',
          name: '呼叫工作台',
          url: '/setting/callcenter/workbench',
          order: 1000,
        },
        {
          parent: 'M_CASE',
          menuKey: 'M_CALLCENTER_STAGE',
          menuIcon: 'fa fa-files-o',
          name: '呼叫中心',
          url: '/setting/callcenter/stage',
          order: 1001,
        },
        {
          parent: 'M_DASHBOARD',
          menuKey: 'M_CALLCENTER_STATISTICS',
          menuIcon: 'fa fa-files-o',
          name: '呼叫中心报表',
          url: '/stats/callcenter',
          order: 1002,
        },
        {
          parent: 'M_CASE',
          menuKey: 'M_PORTAL_ORDER',
          menuIcon: 'fa fa-files-o',
          name: '订单管理',
          url: '/linkc/order/list',
          order: 1100,
        },
      ],
      nowPage: 'copy-task-detail',
      frameList: [{ name: '工单管理' }],
      nowStepData: {
        nowStep:0,
        nowStepType: 'menu',
      },
    };
  },
  components: {
    [FrameNav.name]: FrameNav,
    CopyTaskList,
    CopyTaskDetail
  },
  created() {},
  mounted() {},
};
</script>
<style lang="scss" scoped>
$border-color: #f2f2f2;
.main-box {
  width: 100%;
  height: 100vh;
  min-width: 890px;
  align-items: stretch;
  overflow: hidden;
  position: relative;
  .nav-box {
    width: 190px;
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  .con-box {
    .status-header {
      display: flex;
      background: #fff;
      justify-content: space-between;
      border-bottom: 1px solid $border-color;
      .header-btn-box {
        .header-btn-item {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-info {
          width: 160px;
          margin-right: 4px;
        }
      }
    }
    .frame-box {
      background: #fff;
      display: flex;
      box-shadow: 0px 7px 7px -7px rgba(0, 0, 0, 0.2);
      .change-box {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-left: 1px solid $border-color;
        border-right: 1px solid $border-color;
      }
      .frame-list-box {
        display: flex;
        position: relative;
        .frame-list-item {
          width: 12.5%;
          display: flex;
          padding: 0 12px;
          align-items: center;
          justify-content: space-between;
          &:not(:nth-child(8)) {
            border-right: 1px solid $border-color;
          }
        }
      }
    }
  }

  .guide-box{
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
