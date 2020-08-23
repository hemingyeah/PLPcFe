/* Api */
import * as TaskApi from "@src/api/TaskApi.ts";

/* components */
import TaskSearchPanel from "@src/modules/task/components/list/TaskSearchPanel.vue";
import TaskSelect from "./components/TaskSelect.vue";
import TaskViewModel from "./components/TaskViewModel.vue";

/** model */
import TaskStateEnum from "@model/enum/TaskStateEnum";
import { fields, selectIds, advanceds } from "./TaskFieldModel";
import { LINK_REG } from "@src/model/reg";

/** utils */
import _ from "lodash";
import Page from "@model/Page";
import { storageGet, storageSet } from "@src/util/storage";
import { formatDate } from "@src/util/lang";

/* constants */
const TASK_LIST_KEY = "task_list";
// 埋点事件对象
const TRACK_EVENT_MAP = {
  search: "pc：工单列表-搜索事件",
  moreAction: "pc：工单列表-更多操作事件",
  reset: "pc：工单列表-重置事件",
  avvancedSearch: "pc：工单列表-高级搜索事件",
  columns: "pc：工单列表-选择列事件",
};
// 工单字段名字
const TASK_SELF_FIELD_NAMES = [
  "taskNo",
  "templateName",
  "customer",
  "tlmName",
  "tlmPhone",
  "taddress",
  "serviceType",
  "serviceContent",
  "planTime",
  "description",
];
// 导出过来字段类型
const EXPORT_FILTER_FORM_TYPE = ["attachment", "address", "autograph"];

export default {
  name: "task-list",
  inject: ["initData"],
  data() {
    return {
      selectIds, // id
      taskView: [], // 顶部筛选列表
      otherList: [], //其他列表
      filterId: selectIds.createdId, //顶部筛选选中的状态id
      allShow: false, // 全部工单
      otherShow: false, //其他
      otherText: "其他", //其他文案
      filterData: {}, //状态数据
      region: {}, //保存视图的数据
      isViewModel: "默认", //视图是否保存过
      advanceds, //高级搜索列表
      columns: [],
      columnNum: 1,
      currentTaskType: {},
      loading: false,
      multipleSelection: [],
      multipleSelectionPanelShow: false,
      params: this.initParams(),
      selectPanelColumns: [
        {
          key: "taskNo",
          text: "编号",
        },
      ],
      tableKey: (Math.random() * 1000) >> 2,
      taskStateEnum: TaskStateEnum,
      taskStatusFields: [
        "onceOverTime",
        "onceRefused",
        "oncePaused",
        "onceRollback",
        "onceReallot",
        "oncePrinted",
        "positionException",
      ],
      taskTypes: [
        {
          name: "全部",
          id: "",
        },
      ],
      taskFields: [],
      taskReceiptFields: [],
      taskPage: new Page(),
      totalItems: 0,
    };
  },
  computed: {
    /** 权限数据 */
    auth() {
      return this.initData.auth || {};
    },
    /** 获取是否开启联系人地址产品 */
    customerSetting() {
      let {
        address,
        product,
        linkman,
      } = this.currentTaskTypeCustomerFieldSetting;
      return {
        addressOn: address == true,
        productOn: product == true,
        linkmanOn: linkman == true,
      };
    },
    /** 当前工单类型客户字段设置 */
    currentTaskTypeCustomerFieldSetting() {
      let customerFields = this.taskFields.filter(
        (field) => field.formType == "customer"
      );
      let customerField = customerFields[0];
      let customerSetting = {};

      if (customerField) {
        let setting = customerField.setting || {};
        customerSetting = setting.customerOption || {};
      }

      return customerSetting;
    },
    /** 导出列 */
    exportColumns() {
      // 工单自身字段
      let taskSelfFields = [];
      // 工单系统字段
      let taskSystemFields = [];
      // 工单回执字段
      let taskReceiptSystemFields = [
        {
          id: 5460,
          isSystem: 1,
          fieldName: "sysReceiptContent",
          field: "sysReceiptContent",
          displayName: "回执内容",
          label: "回执内容",
          formType: "text",
          isNull: 1,
          isSearch: 0,
        },
      ];

      this.columns.forEach((field) => {
        field.export = true;

        let isTaskSeldField =
          TASK_SELF_FIELD_NAMES.indexOf(field.fieldName) > -1;
        let fields = isTaskSeldField ? taskSelfFields : taskSystemFields;
        fields.push(field);
      });

      let taskFields = this.taskFields;
      let taskReceiptFields = this.taskReceiptFields;

      taskFields = taskFields.filter((field) =>
        this.filterFieldFuncHandle(field)
      );
      taskReceiptFields = taskReceiptFields.filter((field) =>
        this.filterFieldFuncHandle(field)
      );

      taskSelfFields = [...taskSelfFields, ...taskFields].map((field) => {
        field.export = true;
        return field;
      });

      taskReceiptSystemFields = [
        ...taskReceiptSystemFields,
        ...taskReceiptFields,
      ].map((field) => {
        field.export = true;
        return field;
      });

      return [
        {
          label: "工单信息",
          value: "taskChecked",
          columns: taskSelfFields,
        },
        {
          label: "回执信息",
          value: "receiptChecked",
          columns: taskReceiptSystemFields,
        },
        {
          label: "系统信息",
          value: "systemChecked",
          columns: taskSystemFields,
        },
      ];
    },
    /** 导出权限 */
    exportPermission() {
      return this.auth.EXPORT_IN;
    },
    /** 高级搜索面板宽度 */
    panelWidth() {
      return `${420 * this.columnNum}px`;
    },
    /** 查看工单全部权限 */
    permissionTaskView() {
      return this.auth.TASK_VIEW === 3;
    },
    /** 当前选中的工单ids */
    selectedIds() {
      return this.multipleSelection.map((p) => p.id);
    },
    /** 服务项目 服务内容 系统字段设置 */
    sysFieldsSetting() {
      let serviceContentFields = this.taskFields.filter(
        (field) => field.formType == "serviceContent"
      );
      let serviceTypeFields = this.taskFields.filter(
        (field) => field.formType == "serviceType"
      );

      let serviceContentField = serviceContentFields[0] || {};
      let serviceTypeField = serviceTypeFields[0] || {};

      let isServiceContentFieldEnabled = serviceContentField.enabled == 1;
      let isServiceTypeFieldEnabled = serviceTypeField.enabled == 1;

      return {
        hasServiceContent: isServiceContentFieldEnabled,
        hasServiceType: isServiceTypeFieldEnabled,
      };
    },
    /** 工单类型列表 */
    taskTypeList() {
      return this?.initData?.taskTypeList || [];
    },
    /** 工单列表字段 */
    taskListFields() {
      let fixedFields = fields.slice();

      return []
        .concat(fixedFields)
        .filter((f) => f.formType !== "separator" && f.formType !== "info")
        .sort((a, b) => a.orderId - b.orderId);
    },
    /** 工单类型过滤后的字段 */
    taskTypeFilterFields() {
      let fields = this.taskFields.concat(this.taskReceiptFields) || [];

      let taskTypeFilterFields = fields.filter((field) =>
        this.filterFieldFuncHandle(field)
      );

      return taskTypeFilterFields;
    },
  },
  mounted() {
    this.taskTypes = [...this.taskTypes, ...this.taskTypeList];
    this.taskView = this.initData.taskView;
    this.currentTaskType = this.taskTypes[0];

    this.revertStorage();
    this.initialize();
    this.otherLists();
    this.getTaskCountByState();
    this.searchList();
    this.isAdvanced()

    // 对外开放刷新方法，用于其他tab刷新本tab数据
    window.__exports__refresh = this.search;
    console.log("taskView", this.initData);
  },
  methods: {
    /**
     * @description 高级搜索列表匹配
     */
    isAdvanced(list = '') {
      const {initData} = this
      let selects = list ? list : initData.allFieldInfo
      selects.map((v, i) => {
        if (v.displayName === '优先级') {
          this.advanceds[8].setting = v.setting
        } else if (v.displayName === '服务类型') {
          this.advanceds[5].setting = v.setting
        } else if (v.displayName === '服务内容') {
          this.advanceds[6].setting = v.setting
        }
      })
    },
    /**
     * @description 高级搜索
     */
    advancedSearch() {
      this.params.pageNum = 1;
      this.taskPage.list = [];

      this.params.moreConditions = this.$refs.searchPanel.buildParams();
      // this.$refs.searchPanel.hide();

      this.search();
    },
    /* 其他,列表 */
    otherLists() {
      const { taskView } = this.initData;
      taskView.map((item, index) => {
        if (
          item.id === "1e930239-1ea3-11e7-8d4e-00163e304a25" ||
          item.id === "2a53a0ff-4141-11e7-a318-00163e304a25" ||
          item.region === "所有用户" ||
          item.region === "只有我"
        ) {
          this.otherList.push(item);
        }
      });
    },
    /* 其他, 选择 */
    checkOther({ name, region, id }) {
      this.isViewModel = region;
      this.region["editViewId"] = id;
      this.otherText = name;
      this.filterId = "";
    },
    /* 顶部筛选 */
    checkFilter({ id, name }) {
      this.isViewModel = "默认";
      this.region["editViewId"] = id;
      this.filterId = id;
      this.otherText = "其他";
      // 埋点
      window.TDAPP.onEvent(`pc：工单列表-${name}`);
    },
    /*创建视图接口的参数 */
    /*全部工单 */
    checkAll() {
      this.filterId = selectIds.allId;
    },
    // 最高事件
    allEvent() {
      this.allShow = false;
      this.otherShow = false;
    },
    /**
     * 顶部筛选, 状态数据展示
     */
    getTaskCountByState() {
      // 如果没有缓存时间或者超过1小时
      var now = new Date().getTime();
      const localData = JSON.parse(localStorage.getItem("getTaskCountByState"));
      if (!localData || now - localData.date > 60 * 60 * 1000) {
        TaskApi.getTaskCountByState().then((res) => {
          const {
            created,
            refused,
            allocated,
            accepted,
            exception,
            processing,
            taskPool,
            finished,
            costed,
          } = res;
          this.filterData = {
            allocated,
            accepted,
            processing,
            exception,
            created: created + refused,
            finished: finished + costed,
            all:
              allocated +
              accepted +
              processing +
              taskPool +
              created +
              refused +
              finished +
              costed,
            unfinished:
              created + refused + allocated + taskPool + accepted + processing,
          };
          localStorage.setItem(
            "getTaskCountByState",
            JSON.stringify({ data: now, filterData: this.filterData })
          );
        });
      } else {
        this.filterData = localData.filterData;
      }
    },
    /**
     * 存为视图和编辑视图
     */
    editView() {
      window.__exports__refresh = "";
      const selectCols = [];
      this.columns.map((item, index) => {
        if (item.show) {
          selectCols.push(item.fieldName);
        }
      });
      this.region["editViewId"] = this.otherList[0].id;
      this.region["tsmStr"] = JSON.stringify(this.initData.expTSMJSON);
      this.region["selectedCols"] = selectCols;
      this.$refs.viewModel.open();
    },
    /**
     * @description 工单列表展示
     * @return {Object} 页面展示数据
     */
    searchList() {
      TaskApi.search().then((res) => {
        console.log("工单列表", res);
      });
    },
    /**
     * @description 构建列
     */
    buildColumns() {
      const localStorageData = this.getLocalStorageData();

      let columnStatus = localStorageData.columnStatus || [];
      let localColumns = columnStatus
        .map((i) => (typeof i == "string" ? { field: i, show: true } : i))
        .reduce((acc, col) => (acc[col.field] = col) && acc, {});
      let taskListFields = this.filterTaskListFields();
      let fields = taskListFields.concat(this.taskTypeFilterFields);
      this.columns = fields
        .map((field) => {
          let sortable = false;
          let minWidth = null;

          if (["date", "datetime", "number"].indexOf(field.formType) >= 0) {
            sortable = "custom";
            minWidth = 100;
          }

          if (["address"].indexOf(field.formType) >= 0) {
            minWidth = 200;
          }

          if (["taskNo", "level", "updateTime"].indexOf(field.fieldName) >= 0) {
            sortable = "custom";
          }

          if (field.displayName.length > 4) {
            minWidth = field.displayName.length * 20;
          }

          if (sortable && field.displayName.length >= 4) {
            minWidth = 125;
          }

          if (
            field.formType === "datetime" ||
            field.fieldName === "updateTime" ||
            field.fieldName === "createTime"
          ) {
            minWidth = 150;
          }

          if (
            ["taskNo", "customer", "taddress", "templateName"].indexOf(
              field.fieldName
            ) >= 0
          ) {
            minWidth = 200;
          }

          return {
            ...field,
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            minWidth: typeof minWidth == "number" ? minWidth : `${minWidth}px`,
            sortable,
            isSystem: field.isSystem,
          };
        })
        .map((col) => {
          let show = col.show === true;
          let width = col.width;
          let localField = localColumns[col.field];

          if (null != localField) {
            width =
              typeof localField.width == "number"
                ? `${localField.width}px`
                : "";
            show = localField.show !== false;
          } else {
            show = true;
          }

          col.show = show;
          col.width = width;
          col.type = "column";

          return col;
        });
    },
    /**
     * @description 构建导出参数
     * @return {Object} 导出参数
     */
    buildExportParams(checkedMap, ids) {
      const Params = Object.assign({}, this.params);
      let exportAll = !ids || !ids.length;

      let taskQueryInput = {
        ids: exportAll ? [] : ids,
        keyword: Params.keyword,
        pageSize: exportAll ? 0 : Params.pageSize,
        page: exportAll ? 1 : Params.pageNum,
        typeId: this.currentTaskType.id,
        ...Params.moreConditions,
      };

      let params = {
        taskQueryInput: JSON.stringify(taskQueryInput),
      };

      for (let key in checkedMap) {
        params[key] = checkedMap[key].join(",");
      }

      return params;
    },
    /**
     * @description 构建搜索参数
     * @return {Object} 搜索参数
     */
    buildSearchParams() {
      const Params = Object.assign({}, this.params);
      let searchParams = {
        keyword: Params.keyword,
        pageSize: Params.pageSize,
        page: Params.pageNum,
        typeId: this.currentTaskType.id,
      };

      if (Object.keys(Params.orderDetail || {}).length) {
        searchParams.orderDetail = Params.orderDetail;
      }

      if (
        Object.keys(Params.moreConditions).length > 1 ||
        Params.moreConditions.conditions.length
      ) {
        searchParams = {
          ...searchParams,
          ...Params.moreConditions,
        };
      }

      return searchParams;
    },
    /**
     * @description 构建多行文本
     * @return {String}
     */
    buildTextarea(value) {
      return value
        ? value.replace(LINK_REG, (match) => {
            return `<a href="javascript:;" target="_blank" url="${match}">${match}</a>`;
          })
        : "";
    },
    /**
     * @description 工单类型改变
     */
    changeTaskType(taskType) {
      this.currentTaskType = taskType;
      this.initialize();
    },
    /**
     * @description 检测导出条数
     * @return {String | null}
     */
    checkExportCount(ids, max) {
      let exportAll = !ids || ids.length == 0;
      return exportAll && this.taskPage.total > max
        ? "为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。"
        : null;
    },
    /**
     * @description 导出提示
     */
    exportAlert(result, params = {}) {
      let taskQueryInputString = params?.taskQueryInput || "{}";
      let taskQueryInput = JSON.parse(taskQueryInputString);
      let ids = taskQueryInput.ids || [];
      let idsArr = ids;
      let exportNum =
        idsArr.length > 0 && ids.length > 0
          ? idsArr.length
          : this.taskPage.total;
      let message = `您已选择${exportNum}条数据进行导出，导出进行中，导出完成后，您可以到右上角后台任务中查看导出数据，关闭本窗口不影响数据导出。`;

      this.$platform.alert(message);
    },
    /**
     * @description 导出工单
     * @param {Boolean} exportAll 是否导出全部
     */
    exportTask(exportAll) {
      let ids = [];
      let fileName = `${formatDate(new Date(), "YYYY-MM-DD")}工单数据.xlsx`;

      if (!exportAll) {
        if (!this.multipleSelection.length)
          return this.$platform.alert("请选择要导出的数据");
        ids = this.selectedIds;
      }

      this.$refs.exportPanel.open(ids, fileName);
    },
    /**
     * @description 获取工单字段列表
     * @return {Promise}
     */
    fetchTaskFields() {
      let params = {
        templateId: this.currentTaskType.id || "",
        tableName: "task",
      };
      return TaskApi.getTaskTemplateFields(params).then((result) => {
        result.forEach((field) => {
          field.group = "task";
          field.label = field.displayName;
          field.field = field.fieldName;
        });
        this.$set(this, "taskFields", result || []);
        this.isAdvanced(result)
        return result;
      });
    },
    /**
     * @description 获取工单回执字段列表
     * @return {Promise}
     */
    fetchTaskReceiptFields() {
      let params = {
        templateId: this.currentTaskType.id || "",
        tableName: "task_receipt",
      };
      return TaskApi.getTaskTemplateFields(params).then((result) => {
        result.forEach((field) => {
          field.group = "task_receipt";
          field.label = field.displayName;
          field.field = field.fieldName;
        });
        this.$set(this, "taskReceiptFields", result || []);
        return result;
      });
    },
    /**
     * @description 过滤字段函数操作处理
     * @return {Boolean}
     */
    filterFieldFuncHandle(field) {
      return (
        EXPORT_FILTER_FORM_TYPE.indexOf(field.formType) == -1 &&
        field.isSystem == 0
      );
    },
    /**
     * @description 过滤工单列表字段
     * @return {Array<TaskField>} 过滤后工单列表字段
     */
    filterTaskListFields() {
      let fields = this.taskListFields || [];
      let field = null;

      let customerSetting = this.customerSetting;
      let sysFieldsSetting = this.sysFieldsSetting;

      let newFields = [];

      for (let i = 0; i < fields.length; i++) {
        field = fields[i];

        // 未开启联系人
        if (
          !customerSetting.linkmanOn &&
          (field.fieldName == "tlmName" || field.fieldName == "tlmPhone")
        ) {
          continue;
        }

        // 未开启地址
        if (!customerSetting.addressOn && field.fieldName == "taddress") {
          continue;
        }

        // 未开启产品
        if (!customerSetting.productOn && field.fieldName == "product") {
          continue;
        }

        // 服务类型
        if (
          !sysFieldsSetting.hasServiceType &&
          field.fieldName == "serviceType"
        ) {
          continue;
        }

        // 服务内容
        if (
          !sysFieldsSetting.hasServiceContent &&
          field.fieldName == "serviceContent"
        ) {
          continue;
        }

        newFields.push(field);
      }

      return newFields;
    },
    /**
     * @description 格式话自定义地址
     * @param {Object} customizeAddress 自定义地址
     * @return {String} 过滤后的地址
     */
    formatCustomizeAddress(customizeAddress) {
      if (null == customizeAddress) return "";

      const { province, city, dist, address } = customizeAddress;
      return [province, city, dist, address].filter((d) => !!d).join("-");
    },
    /**
     * @description 获取本地存储数据
     * @return {Object} 本地存取数据对象
     */
    getLocalStorageData() {
      const dataStr = storageGet(TASK_LIST_KEY, "{}");
      return JSON.parse(dataStr);
    },
    /**
     * @description 获取行的key
     * @param {Object} row 行数据
     * @return {String} key
     */
    getRowKey(row = {}) {
      return `${row.id}${(Math.random() * 1000) >> 2}`;
    },
    /**
     * @description 表格选择操作
     * @param {Array} selection 选择的数据
     */
    handleSelection(selection) {
      let tv = this.selectionCompute(selection);

      let original = this.multipleSelection.filter((ms) =>
        this.taskPage.list.some((cs) => cs.id === ms.id)
      );

      let unSelected = this.taskPage.list.filter((c) =>
        original.every((oc) => oc.id !== c.id)
      );

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
            ? unSelected.forEach((row) => {
                this.$refs.multipleTable.toggleRowSelection(row, false);
              })
            : this.$refs.multipleTable.clearSelection();
        });
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }

      this.multipleSelection = tv;

      // this.$refs.baseSelectionBar.openTooltip();
    },
    /**
     * @description 页大小改变操作
     * @param {Number} pageSize 页大小
     */
    handleSizeChange(pageSize) {
      this.saveDataToStorage("pageSize", pageSize);

      this.params.pageSize = pageSize;
      this.params.pageNum = 1;

      this.search();
    },
    /**
     * @description 初始化
     */
    initialize() {
      this.initPage();
      this.loading = true;

      Promise.all([this.fetchTaskFields(), this.fetchTaskReceiptFields()])
        .then((res) => {
          this.buildColumns();
          this.search();
        })
        .catch((err) => {
          console.warn(err);
        });
    },
    /**
     * @description 初始化page
     */
    initPage() {
      this.taskPage = new Page();
      this.taskPage.list = [];
      this.params.pageNum = 1;
    },
    /**
     * @description 初始化参数
     * @param {Number} pageSize 页大小
     * @returns {Object} params
     */
    initParams(pageSize = 10) {
      return {
        keyword: "",
        pageNum: 1,
        pageSize,
        orderDetail: {},
        moreConditions: {
          conditions: [],
        },
      };
    },
    /**
     * @description 页码跳转
     * @param {Number} pageNum 页码
     */
    jump(pageNum) {
      this.params.pageNum = pageNum;
      this.taskPage.list = [];
      this.search();
    },
    /**
     * @description 修改选择列设置
     * @param {Object} event 事件对象
     */
    modifyColumnStatus(event) {
      let columns = event.data || [];
      let colMap = columns.reduce(
        (acc, col) => (acc[col.field] = col) && acc,
        {}
      );

      this.columns.forEach((col) => {
        let newCol = colMap[col.field];
        if (null != newCol) {
          this.$set(col, "show", newCol.show);
          this.$set(col, "width", newCol.width);
        }
      });
      const columnsStatus = this.columns.map((c) => ({
        field: c.field,
        show: c.show,
        width: c.width,
      }));
      this.saveDataToStorage("columnStatus", columnsStatus);
    },
    /**
     * @description 打开外部链接
     * @param {Object} e 事件对象
     */
    openOutsideLink(e) {
      let url = e.target.getAttribute("url");
      if (!url) return;
      if (!/http/gi.test(url))
        return this.$platform.alert("请确保输入的链接以http或者https开始");

      this.$platform.openLink(url);
    },
    /**
     * @description 打开已选中列表面板
     */
    openSelectionPanel() {
      this.$refs.openSelectionPanel.open();
    },
    /**
     * @description 打开工单详情tab
     * @param {String} taskId 工单id
     */
    openTaskTab(taskId) {
      if (!taskId) return;

      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: `task_view_${taskId}`,
        title: "工单详情",
        close: true,
        url: `/task/view/${taskId}?noHistory=1`,
        fromId,
      });
    },
    /**
     * @description 打开用户详情tab
     * @param {String} userId 用户id
     */
    openUserTab(userId) {
      if (!userId) return;

      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: `security_user_view_${userId}`,
        title: "工单详情",
        close: true,
        url: `/security/user/view/${userId}?noHistory=1&from=task`,
        fromId,
      });
    },
    /**
     * @description 高级搜索切换
     */
    panelSearchAdvancedToggle() {
      this.trackEventHandler("avvancedSearch");
      this.$refs.searchPanel.open();

      this.$nextTick(() => {
        let forms = document.getElementsByClassName("advanced-search-form");
        for (let i = 0; i < forms.length; i++) {
          let form = forms[i];
          form.setAttribute("novalidate", true);
        }
      });
    },
    /**
     * @description 重置参数
     */
    resetParams() {
      this.trackEventHandler("reset");

      this.currentTaskType = this.taskTypes[0];
      this.$refs.searchPanel.resetParams();

      let pageSize = this.params.pageSize;
      this.params = this.initParams(pageSize);

      this.search();
    },
    /**
     * @description 还原本地存储
     */
    revertStorage() {
      const { pageSize, column_number } = this.getLocalStorageData();

      if (pageSize) {
        this.params.pageSize = pageSize;
      }
      if (column_number) this.columnNum = Number(column_number);
    },
    /**
     * @description 保存数据到本地存储
     */
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;

      storageSet(TASK_LIST_KEY, JSON.stringify(data));
    },
    /**
     * @description 搜索之前处理
     */
    searchBefore() {
      this.params.pageNum = 1;
      this.taskPage.list = [];

      this.search();
      this.trackEventHandler("search");
    },
    /**
     * @description 搜索
     * @return {Promise}
     */
    search() {
      const params = this.buildSearchParams();

      this.loading = true;
      console.log(params)
      return TaskApi.taskList(params)
        .then((result) => {
          let isSuccess = result?.success === true;
          if (!isSuccess) {
            this.$platform.alert(result?.message);
            this.initPage();
            return;
          }

          let data = result?.data || {};
          let { pageNum, list } = data;

          list.map((c) => {
            c.pending = false;
            return c;
          });

          this.taskPage.merge(Page.as(data));
          this.params.pageNum = pageNum;

          // 把选中的匹配出来
          this.matchSelected();

          return data;
        })
        .then(() => {
          this.$refs.taskListPage.scrollTop = 0;
        })
        .catch((err) => {
          console.warn("Caused: TaskList search Function err", err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    /**
     * @description 已选择面板数据变化
     */
    selectionPanelInputChange(value) {
      this.multipleSelection = value.slice();
    },
    /**
     * @description 已选择面板移除某一项
     */
    selectionPanelRemoveItem({ selection, item }) {
      selection.length < 1
        ? this.toggleSelection()
        : this.toggleSelection([item]);
    },
    /**
     * @description 计算已选择
     * @param {Array} selection 已选择列表
     * @return {Array} 计算过滤后的列表
     */
    selectionCompute(selection) {
      let tv = [];

      tv = this.multipleSelection.filter((ms) =>
        this.taskPage.list.every((c) => c.id !== ms.id)
      );
      tv = _.uniqWith([...tv, ...selection], _.isEqual);

      return tv;
    },
    /**
     * @description 显示最后一次更新记录
     * @param {Object} row 行数据
     */
    showLatestUpdateRecord(row) {
      if (row.latesetUpdateRecord) return;

      TaskApi.getTaskUpdateRecord({ taskId: row.id })
        .then((res) => {
          if (!res || res.status) return;

          this.taskPage.list = this.taskPage.list.map((c) => {
            if (c.id === row.id) {
              c.latesetUpdateRecord = res.data;
            }
            return c;
          });
        })
        .catch((e) => console.error("e", e));
    },
    /**
     * @description 显示高级搜索设置
     */
    showAdvancedSetting() {
      this.trackEventHandler("columns");

      this.$refs.advanced.open(this.columns);
    },
    /**
     * @description 排序变化
     * @param {Object} option 配置
     */
    sortChange(option) {
      try {
        const { prop, order } = option;

        if (!order) {
          this.params.orderDetail = {};
          return this.search();
        }
        const sortedField =
          this.taskListFields.filter((sf) => sf.fieldName === prop)[0] || {};

        let isSystem = 0;

        if (prop === "createTime" || prop === "updateTime") {
          isSystem = 1;
        } else {
          isSystem = sortedField.isSystem;
        }

        let sortModel = {
          isSystem,
          sequence: order === "ascending" ? "ASC" : "DESC",
          // column: isSystem ? `task.${prop}` : prop,
          column: prop,
        };

        if (
          prop === "createTime" ||
          prop === "updateTime" ||
          sortedField.formType === "date" ||
          sortedField.formType === "datetime"
        ) {
          sortModel.type = "date";
        } else if (prop === "level" || prop === "taskNo") {
          sortModel.type = "string";
        } else {
          sortModel.type = sortedField.formType;
        }

        this.params.orderDetail = sortModel;
        this.taskPage.list = [];

        this.search();
      } catch (e) {
        console.error("e", e);
      }
    },
    /**
     * @description 选择项切换
     * @param {Array<Row>} rows 行
     */
    toggleSelection(rows = []) {
      let isNotOnCurrentPage = false;
      let row = undefined;

      if (Array.isArray(rows) && rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.taskPage.list.every((item) => {
            return item.id !== row.id;
          });
          if (isNotOnCurrentPage) return;
        }
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
    },
    /**
     * @description TalkingData事件埋点
     * @param {String} type The constant TRACK_EVENT_MAP of the keys
     */
    trackEventHandler(type = "") {
      let eventName = TRACK_EVENT_MAP[type];
      if (!eventName) return;

      window.TDAPP.onEvent(eventName);
    },
  },
  components: {
    [TaskSearchPanel.name]: TaskSearchPanel,
    [TaskViewModel.name]: TaskViewModel,
    TaskSelect,
  },
};
