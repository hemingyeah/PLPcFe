/* Api */
import * as TaskApi from "@src/api/TaskApi.ts";

/* components */
import TaskSearchPanel from "@src/modules/task/components/list/TaskSearchPanel.vue";
import TaskSelect from "./components/TaskSelect.vue";
import TaskViewModel from "./components/TaskViewModel.vue";
import BatchEditingCustomerDialog from "./components/BatchEditingCustomerDialog.vue";
import TaskTransfer from "./components/TaskTransfer.vue";
import TaskMap from "./components/TaskMap.vue";
import TaskView from './components/TaskView.vue'

/** model */
import TaskStateEnum from "@model/enum/TaskStateEnum.ts";
import { fields, selectIds, advancedList, allExport,Inquire } from "./TaskFieldModel";
import { LINK_REG } from "@src/model/reg";

/** utils */
import _ from "lodash";
import Page from "@model/Page";
import { storageGet, storageSet } from "@src/util/storage";
import { formatDate } from "@src/util/lang";
import { getRootWindow } from "@src/util/dom";
import * as FormUtil from '@src/component/form/util'

/* constants */
import { AllotTypeConvertMap, FlagConvertMap, TaskSearchInputPlaceholderMap } from '@src/modules/task/model/TaskConvertMap.ts';

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
  "product",
  "level"
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
      filterId: selectIds.allId, //顶部筛选选中的状态id
      otherText: "自定义筛选视图", //其他文案
      filterData: {}, //状态数据
      region: {}, //保存视图的数据
      isViewModel: "默认", //视图是否保存过
      advanceds: advancedList, //高级搜索列表
      searchParams: {}, //筛选列表的参数
      searchParams_spare: {},
      dropDownInfo: "", //顶部下拉
      mapShow: true, //地图预览
      selectColumnState: "", //视图选择列状态存储
      planTimeType: "", //判断计划时间展示的样式
      keyword_select: "", // 搜索筛选条件
      exportColumnList: [],
      selectList: [
        { name: "全部", id: "all" },
        { name: "我创建的", id: "create" },
        { name: "我负责的", id: "execute" },
        { name: "我协同的", id: "synergy" },
      ], //头部筛选列表
      selectId: "all",
      checkImportTask: "",
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
        "source"
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
      navWidth: window.innerWidth - 120,
      taskSearchInputPlaceholderMap :TaskSearchInputPlaceholderMap,
      task_view_list: [],
      seoSetList: [],
      exportColumns: []
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
    /** 导出权限 */
    exportPermission() {
      return this.auth.EXPORT_IN;
    },
    // 转派条件
    exportPermissionTaskEdit() {
      return this.auth.TASK_EDIT === 3;
    },
    exportPermissionTaskBatchDispatch() {
      return this.auth.TASK_BATCH_DISPATCH;
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
      let taskTypeFilterFields = fields.filter((field) => {
        return (
          EXPORT_FILTER_FORM_TYPE.indexOf(field.formType) == -1 &&
          field.isSystem == 0
        )
      // return field.isSystem == 0
      });
      return taskTypeFilterFields;
    },
    taskAllFields() {
      return this.taskFields.concat(this.taskReceiptFields)
    },
    /* 批量编辑过滤后的字段 */
    taskFieldList() {
      let fields = this.taskFields || [];
      let taskTypeFilterFields = fields.filter((field) =>{
        return (
          EXPORT_FILTER_FORM_TYPE.indexOf(field.formType) == -1 &&
          field.isSystem == 0
        )
      }
      );

      return taskTypeFilterFields;
    },
  },
  filters: {
    displaySelect(value) {
      if (!value) return null;
      if (value && typeof value === "string") {
        return value;
      }
      if (Array.isArray(value) && value.length) {
        return value.join("，");
      }
      return null;
    },
  },
  mounted() {
    const that = this
    console.log("taskView", this.initData);
    this.taskTypes = [...this.taskTypes, ...this.taskTypeList];
    this.currentTaskType =
      this.taskTypeList.length === 1 ? this.taskTypes[1] : this.taskTypes[0];
    if (this.taskTypeList.length === 1) {
      this.getCardDetailList(this.taskTypes[1].id);
    }
    window.onresize = () => {
      return (() => {
        that.navWidth = window.innerWidth - 120;
      })();
    };

    this.getUserViews();
    this.getTaskCountByState();
    this.revertStorage();

    // 对外开放刷新方法，用于其他tab刷新本tab数据
    window.__exports__refresh = this.searchList;
  },
  methods: {
    /**
     * 获取附件
     */
    async getCardDetailList(typeId) {
      const res = await TaskApi.getCardDetailList({ typeId });
      let list = res.map((item, index) => {
        if (item.canRead) {
          let columns, endAddress = {
            displayName: '位置',
            fieldName: `endAddress`,
          },startAddress = {
            displayName: '位置',
            fieldName: `startAddress`,
          }
          if (item.specialfrom === '工时记录') {
            let list = []
            // 添加固定导出参数
            item.fields.splice(item.fields.map((v, i) => {
              if (v.fieldName === 'endTime') {
                return i + 1
              }
            }).filter(v => {
              return v
            })[0], 0, endAddress)

            item.fields.splice(item.fields.map((v, i) => {
              if (v.fieldName === 'startTime') {
                return i + 1
              }
            }).filter(v => {
              return v
            })[0], 0, startAddress)
            
            item.fields.forEach(v => {
              if (v.fieldName !== "remark" && v.fieldName !== "attachment" ){
                list.push(v)
              }
            })
            list.map((v, i) => {
              if (!v.map) {
                v.fieldName = `${item.cardId}_${v.fieldName}`
              }
            })

            item.fields = [...list, ...[{displayName: '行程距离',
            fieldName: `${item.cardId}_distance`}]]
          } else {
            item.fields = [...item.fields, ...[{displayName: '操作人',
            fieldName: `cu_${item.cardId}`}, {displayName: '操作时间',
            fieldName: `ct_${item.cardId}`}]]
          }
          columns = item.fields.map((v, i) => {
            return {
              export: item.canRead,
              label: v.displayName,
              exportAlias: v.fieldName,
              ...v,
            };
          }).filter(v => {return v.formType !== 'attachment'});
          return {
            value: `annexChecked${index}`,
            label: `附加组件：${item.cardName}`,
            inputType: item.inputType,
            columns,
          };
        }
      });
      this.exportColumnList = [...this.exportColumns, ...list];
    },
    /**
     * 获取视图
     */
    async getUserViews() {
      const { success, result } = await TaskApi.getUserViews();
      if (success) {
        this.taskView = result;
        this.otherLists(result);
        this.initialize();
      }
    },
    /**
     * @description 高级搜索
     */
    advancedSearch() {
      this.params.pageNum = 1;
      this.taskPage.list = [];
      console.log(this.$refs.searchPanel.buildParams());
      this.params.moreConditions = this.$refs.searchPanel.buildParams();
      // this.$refs.searchPanel.hide();

      this.search();
    },
    /**
     * @description 头部筛选
     */
    /* 其他,列表 */
    otherLists(result) {
      result.map((item, index) => {
        if (
          item.id === "1e930239-1ea3-11e7-8d4e-00163e304a25" ||
          item.id === "2a53a0ff-4141-11e7-a318-00163e304a25" ||
          item.region === "所有用户" ||
          item.region === "只有我"
        ) {
          item["title"] = `other${index}`;
          this.otherList.push(item);
        }
      });
    },
    /**
     * @description 新建视图
     */
    addView({ id }) {
      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: "createEvent",
        title: "正在加载",
        url: `/task/edit?defaultTypeId=${id}`,
        close: true,
        fromId,
      });
    },
    /**
     * @description 选择展示模式
     */
    taskMode(type) {
      this.mapShow = type === "列表模式" ? 1 : 0;
    },
    /**
     * @description 删除工单列表人员
     */
    async delTask() {
      const { selectedIds, $platform } = this;
      let params = selectedIds
        .map((item) => {
          return `taskIds=${item}`;
        })
        .join("&");
      if (!selectedIds.length) {
        $platform.alert("请选择需要删除的数据");
        return;
      }
      window.TDAPP.onEvent(`pc：工单列表-删除工单`);
      try {
        const { succ, status, message, data } = await TaskApi.withPart(params);
        if (succ) {
          let warningMsg = "确定要删除所选工单吗？";
          if (status) {
            warningMsg = `${message}，确定要删除所选工单吗？`;
          } else if (!data.status && data.length > 0) {
            warningMsg = "以下工单已添加备件: 工单编号";
            if (data.length <= 5) {
              warningMsg += data.join("、");
            } else {
              let ids = [];
              for (let i = 0; i < 5; i++) {
                ids.push(data[i]);
              }
              warningMsg += `${ids.join("、")}等${data.length}个`;
            }
            warningMsg += "，确定要删除么？";
          }
          let confirm = await this.$platform.confirm(warningMsg);
          if (confirm) {
            // 删除工单
            const { success } = await TaskApi.deleteTask(selectedIds);
            if (success) {
              $platform.alert("删除成功");
              this.getTaskCountByState(this.searchParams)
              this.initialize();
            }
          }
        }
      } catch (error) {}
    },
    /* 其他, 选择 */
    checkOther(params) {
      const { name, id, searchModel, title } = params;
      this.region["viewId"] = id;
      this.otherText = name;
      this.filterId = "";
      this.allShow = false;
      this.selectColumnState = title;
      this.searchParams = searchModel
      this.searchParams_spare = searchModel
      this.params = this.initParams();

      if (searchModel.createUser) {
        this.selectId = "create";
      } else if (searchModel.executor) {
        this.selectId = "execute";
      } else if (searchModel.synergyId) {
        this.selectId = "synergy";
      } else {
        this.selectId = "all";
      }
      this.taskTypes.forEach((item) => {
        if (item.id === searchModel.templateId) {
          this.currentTaskType = item;
        }
      });
      if (!searchModel.templateId) {
        this.currentTaskType = { id: "", name: "全部" };
      }
      // console.log(FormUtil.initialize(this.advanceds, searchModel))
      // this.$refs.taskView.open(id)
      this.search(searchModel);
      this.buildColumns();
    },
    /*
      查看视图
     */
    _searchModel(list) {
      this.task_view_list = list
    },
    /* 顶部筛选 */
    checkFilter({ id, name, searchModel, title }) {
      this.isViewModel = "默认";
      this.region["viewId"] = id;
      this.filterId = id;
      this.otherText = "自定义筛选视图";
      this.selectColumnState = title;
      this.searchParams = searchModel
      this.searchParams_spare = searchModel
      this.getTaskCountByState(searchModel);
      this.params = this.initParams();
      this.search(searchModel);
      this.buildColumns();
      // 埋点
      window.TDAPP.onEvent(`pc：工单列表-${name}`);
    },
    /**
     * @description 根据视图匹配高级筛选
     */
    // 最高事件
    allEvent() {},
    /**
     * 顶部筛选, 状态数据展示
     */
    getTaskCountByState(searchModel = {}) {
      // 如果没有缓存时间或者超过1小时
      var now = new Date().getTime();
      // const localData = JSON.parse(localStorage.getItem("getTaskCountByState"));
      // if (!localData || now - localData.date > 60 * 60 * 1000) {
      TaskApi.getTaskCountByState(searchModel).then((res) => {
        if (!res.success) return;
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
        } = res.result;
        this.filterData = {
          allocated,
          accepted,
          processing,
          exception,
          created: this._number(created) + this._number(refused),
          finished: this._number(finished) + this._number(costed),
          all:
            this._number(allocated) +
            this._number(accepted) +
            this._number(processing) +
            this._number(taskPool) +
            this._number(created) +
            this._number(refused) +
            this._number(finished) +
            this._number(costed),
          unfinished:
            this._number(created) +
            this._number(refused) +
            this._number(allocated) +
            this._number(taskPool) +
            this._number(accepted) +
            this._number(processing),
        };
        localStorage.setItem(
          "getTaskCountByState",
          JSON.stringify({ data: now, filterData: this.filterData })
        );
      });
      // } else {
      //   this.filterData = localData.filterData;
      // }
    },
    _number(number) {
      return number ? number : 0;
    },
    /**
     * @description 工单导入
     */
    imporTask(item) {
      this.checkImportTask = item;
      this.$refs.importCustomerModal.open();
    },
    /**
     * @description 批量编辑
     */
    Alledit() {
      const { currentTaskType, selectedIds } = this;
      if (!currentTaskType.id) {
        this.$platform.alert("请选择工单类型");
        return;
      }
      if (!selectedIds.length) {
        this.$platform.alert("请选择需要批量编辑的工单");
        return;
      }
      window.TDAPP.onEvent("pc：工单列表-批量编辑工单");
      this.$refs.batchEditingCustomerDialog.open();
    },
    /**
     * @description 工单转派
     */
    reallotBatch() {
      const { selectedIds } = this;
      if (!selectedIds.length) {
        this.$platform.alert("请选择要转派的工单");
        return;
      }
      this.$refs.TaskTransfer.openSendMessageDialog();
    },
    /**
     * @description 批量编辑成功
     */
    updatEedit() {
      this.initialize();
    },
    /**
     * 存为视图和编辑视图
     */
    editView({region, id}) {
      const {moreConditions} = this.params
      let bool, bool_text;
      for(let key in moreConditions) {
        if (key !== 'conditions' && key !== 'productAddress' && key !== 'systemConditions') {
          bool_text = key
        }
      }
      for(let key in moreConditions) {
        if((JSON.stringify(moreConditions[key]) === '[]' || JSON.stringify(moreConditions[key]) === '{}') && !bool_text) {
          bool = true
        }
      }
      if (bool) {
        this.$platform.alert('请您先设置条件进行查询，再保存【筛选视图】！');
        return
      }

      const selectCols = [];
      this.columns.map((item, index) => {
        if (item.show) {
          selectCols.push(item.fieldName);
        }
      });
      this.region["searchModel"] = this.searchParams;
      this.region["selectedCols"] = selectCols.join(",");
      if (id) {
        this.region["viewId"] = id;
        this.isViewModel = region;
        this.$refs.searchPanel.open()
        return
      }
      this.$refs.viewModel.open();
    },
    /**
     * @description 工单列表展示
     * @return {Object} 页面展示数据
     */
    searchList() {
      const { searchParams } = this;
      return TaskApi.search(searchParams)
        .then((result) => {
          let isSuccess = result?.success === true;
          if (!isSuccess) {
            this.$platform.alert(result?.message);
            this.initPage();
            return;
          }

          let data = result?.result || {};
          let { number, content, totalPages, totalElements, size } = data;

          data["list"] = content;
          data["total"] = totalPages;
          data["pageNum"] = number;
          data['pageSize'] = size
          content.map((item) => {
            item.pending = false;
            if (item.acceptUsedTime) {
              item.acceptUsedTime = this.timestamp(item.acceptUsedTime);
            }
            if (item.taskUsedTime) {
              item.taskUsedTime = this.timestamp(item.taskUsedTime);
            }
            if (item.workUsedTime) {
              item.workUsedTime = this.timestamp(item.workUsedTime);
            }
            if (item.taskResponseTime) {
              item.taskResponseTime = this.timestamp(item.taskResponseTime);
            }
            if (item.planTime && this.planTimeType === "date") {
              item.planTime = formatDate(new Date(item.planTime), "YYYY-MM-DD");
            }
            return item;
          });
          this.taskPage["totalElements"] = totalElements;
          // let list = [...data.content, ...data.content, ...data.content, ...data.content, ...data.content, ...data.content]
          this.taskPage.list = [];
          this.taskPage.merge(Page.as(data));
          this.params.pageNum = number;
          console.log(this.taskPage)

          // 把选中的匹配出来
          // this.matchSelected();
          // console.log("工单列表渲染数据", this.taskPage);
          if (this.multipleSelection.length) {
            this.$nextTick(() => {
              this.multipleSelection.forEach(item => {
                this.taskPage.list.forEach(v => {
                  if (v.id === item.id) {
                    this.$refs.multipleTable.toggleRowSelection(v);
                  }
                  })
                })
            })
          }
          // this.multipleSelection = [];
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
     * @description 时间戳转换
     */
    timestamp(value) {
      return formatDate(value * 1000, "HH小时mm分钟");
    },
    /**
     * @description 表头更改
     */
    headerDragend(newWidth, oldWidth, column, event) {
      let data = this.columns
        .map((item) => {
          if (item.displayName === column.label) {
            item.width = column.width;
          }
          return item;
        })
        .map((item) => {
          return {
            field: item.field,
            show: item.show,
            width: item.width,
          };
        });
      this.modifyColumnStatus({ type: "column", data });
    },
    /**
     * @description 构建列
     */
    buildColumns() {
      const localStorageData = this.getLocalStorageData();
      const { paymentConfig } = this.initData;

      let columnStatus = [];
      if (localStorageData.columnStatus) {
        for (let key in localStorageData.columnStatus) {
          if (key === this.selectColumnState) {
            columnStatus = localStorageData.columnStatus[key];
          }
        }
      }
      let localColumns = columnStatus
        .map((i) => (typeof i == "string" ? { field: i, show: true } : i))
        .reduce((acc, col, currentIndex) => {
          acc[col.field] = {
            field: col,
            index: currentIndex,
          }
          return acc
        }, {});
      let taskListFields = this.filterTaskListFields();
      let fields = taskListFields.concat(this.taskTypeFilterFields);

      if (Array.isArray(columnStatus) && columnStatus.length > 0) {
        fields = this.buildSortFields(fields, localColumns)
      }

      // S 高级搜索
      // this.advanceds = [...advancedList, ...this.taskTypeFilterFields];
      // E 高级搜索
      let columns = fields
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

          if (["level", "updateTime", 'createUserName', 'executorName', 'state'].indexOf(field.fieldName) >= 0) {
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
            ["customer", "taddress", "templateName"].indexOf(field.fieldName) >=
            0
          ) {
            minWidth = 200;
          }

          if (["taskNo", 'customer'].indexOf(field.fieldName) !== -1) {
            minWidth = 250;
            sortable = "custom";
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
          let localField = localColumns[col.field]?.field || null;

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
      
      this.columns = []
      
      this.$nextTick(() => {
        this.$set(this, 'columns', columns.slice())
        
        // 根据版本号判断是否需要支付方式
        if (!paymentConfig.version) {
          this.advanceds = this.advanceds.filter((item) => {
            return item.fieldName !== "paymentMethod";
          });
          this.columns = this.columns.filter((item) => {
            return item.fieldName !== "paymentMethod";
          });
        }
        
      })
    },
    buildSortFields(originFields = [], fieldsMap = {}) {
      let fields = [];
      let unsortedFields = []

      originFields.forEach(originField => {
        let { fieldName } = originField
        let field = fieldsMap[fieldName]

        if (field) {
          let { index } = field
          fields[index] = originField
        } else {
          unsortedFields.push(originField)
        }

      })

      return fields.concat(unsortedFields)
    },
    /**
     * @description 构建导出参数
     * @return {Object} 导出参数
     */
    // buildExportParams(checkedMap, ids) {
    //   const Params = Object.assign({}, this.params);
    //   let exportAll = !ids || !ids.length;

    //   let taskQueryInput = {
    //     ids: exportAll ? [] : ids,
    //     keyword: Params.keyword,
    //     pageSize: exportAll ? 0 : Params.pageSize,
    //     page: exportAll ? 1 : Params.pageNum,
    //     typeId: this.currentTaskType.id,
    //     ...Params.moreConditions,
    //   };

    //   let params = {
    //     taskQueryInput: JSON.stringify(taskQueryInput),
    //   };

    //   for (let key in checkedMap) {
    //     params[key] = checkedMap[key].join(",");
    //   }

    //   return params;
    // },
    /**
     * 导出数据
     */
    exportData(number, list = []) {
      const export_list = this.exportColumnList.length ? this.exportColumnList : this.exportColumns
      if (number === 3) {
        let cardField = []
        export_list.filter((item, index) => {
          return index > 2
        }).forEach(v => {
          v.columns.forEach(item => {
            cardField.push(item)
          })
        })
        return cardField.map(v => {
          let bool = list.some(item => {
            if (v.exportAlias) {
              return v.exportAlias === item
            } else {
              return v.fieldName === item
            }
          })
          if (bool) {
            return v.exportAlias ? v.exportAlias : v.fieldName
          }
        }).filter(item => {return item})
      }

      return export_list[number].columns.map(v => {
        let bool = list.some(item => {
          if (v.exportAlias) {
            return v.exportAlias === item
          } else {
            return v.fieldName === item
          }
        })
        if (bool) {
          return v.exportAlias ? v.exportAlias : v.fieldName
        }
      }).filter(item => {return item})
    },
    /**
     * @description 构建导出参数
     * @return {Object} 导出参数
     */
    buildExportParams( checkedMap, ids, exportOneRow) {
      const { receiptChecked, systemChecked, taskChecked } = checkedMap
      const Params = Object.assign({}, this.params);
      const rootWindow = getRootWindow(window);
      const { loginUser } = this.initData;
      const all = {
        ...this.searchParams,
        taskIds: this.selectedIds,
        tagIds: loginUser.tagIds,
        dataLevel: loginUser.authorities.TASK_VIEW,
        tenantId: JSON.parse(rootWindow._init).user.tenantId,
      };
      let exportAll = !ids || !ids.length;

      let exportSearchModel = {
        typeId: this.currentTaskType.id,
      };
      let params = {
        exportSearchModel: JSON.stringify({
          ...all,
          ...{
            exportTotal: exportAll
              ? this.taskPage.totalElements
              : this.selectedIds.length,
          },
        }),
      };
      // 附加
      let cardFieldChecked = []
      for(let key in checkedMap) {
        if (key.indexOf('annexChecked') !== -1) {
          cardFieldChecked = [...cardFieldChecked, ...checkedMap[key]]
        }
      }
      cardFieldChecked = cardFieldChecked.filter(item => {return item})
      /*********************** *********************/
      // 工单信息
      let export_task = this.exportData(0, taskChecked)
      // 回执信息
      let export_receipt_task = this.exportData(1, receiptChecked)
      //系统信息
      let export_sys_task = this.exportData(2, systemChecked)
      //附加信息
      let export_card_fiel_task = cardFieldChecked.length ? this.exportData(3, cardFieldChecked) : cardFieldChecked
      console.log('导出数据----附加', export_card_fiel_task)

      params['exportOneRow'] = exportOneRow
      params["data"] = exportAll ? "" : this.selectedIds.join(",");
      params["typeId"] = exportSearchModel.typeId;
      params["receiptChecked"] = export_receipt_task
        .map((item) => {
          if (item === 'spare_name') {
            item = 'spare_name,spare_serialNumber,spare_type,spare_number,spare_cost'
          } 
          if (item === 'service_name') {
            item = 'service_name,service_type,service_number,service_cost'
          } 
          if (item === 'balance_total') {
            item = 'balance_total,balance_discount,balance_sum'
          }
          return item;
        })
        .join(",");
      params["sysChecked"] = export_sys_task
        .map((item) => {
          return item;
        })
        .join(",");
      params["checked"] = export_task
        .map((item) => {
          if (item === 'product') {
            item = 'product,productSN'
          }
          return item;
        })
        .join(",");
      params['cardFieldChecked'] = export_card_fiel_task.filter(item => {
        return item
      }).join(',')
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
      return exportAll && this.taskPage.totalElements > max
        ? "为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。"
        : null;
    },
    /**
     * @description 导出提示
     */
    exportAlert(result, params = {}) {
      // let taskQueryInputString = params?.taskQueryInput || "{}";
      // let taskQueryInput = JSON.parse(taskQueryInputString);
      // let ids = taskQueryInput.ids || [];
      // let idsArr = ids;
      // let exportNum =
      //   idsArr.length > 0 && ids.length > 0
      //     ? idsArr.length
      //     : this.taskPage.totalElements;
      // let message = `您已选择${exportNum}条数据进行导出，导出进行中，导出完成后，您可以到右上角后台任务中查看导出数据，关闭本窗口不影响数据导出。`;

      this.$platform.alert(result.message);
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
      return `${row.iid}${(Math.random() * 1000) >> 2}`;
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
      // this.loading = true;
      Promise.all([this.fetchTaskFields(), this.fetchTaskReceiptFields()])
        .then((res) => {
          this.planTimeType = res[0].filter((item) => {
            return item.displayName === "计划时间";
          })[0].setting.dateType;
          this.search(this.searchParams);
          this.buildColumns();
          this.seoSet()
          this._exportColumns()
        })
        .catch((err) => {
          console.warn(err);
        });
    },
    /**
     * @description 高级搜索里面设置的值
     */
    seoSet() {
      const {taskFields} = this
      let linkman_list =[], address_list =[],product_list =[]
      if (taskFields.length) {
        let first = taskFields.filter(item => {return item.displayName === '客户'})[0]
        if (first.setting.customerOption.linkman) {
          linkman_list = [{
            id: 5460,
            tableName: "customer",
            isSystem: 1,
            fieldName: "tlmName",
            displayName: "联系人",
            exportAlias: "customerLinkman",
            formType: "select",
            defaultValue: null,
            isNull: 1,
            isSearch: 1,
            placeHolder: null,
            setting: {},
            orderId: 1,
            isDelete: 0,
            show: true,
            guideProfessions: [],
            isGuideData: false,
            guideData: false,
          }]
        }
        if (first.setting.customerOption.address) {
          address_list = [{
            id: 5460,
            tableName: "customer",
            isSystem: 1,
            fieldName: "area",
            exportAlias: "customerAddress",
            displayName: "区域",
            formType: "address",
            defaultValue: null,
            isNull: 1,
            isSearch: 1,
            placeHolder: null,
            setting: {},
            orderId: 1,
            isDelete: 0,
            guideProfessions: [],
            show: true,
            isGuideData: false,
            guideData: false,
          },
          {
            id: 5460,
            tableName: "customer",
            isSystem: 1,
            fieldName: "cusAddress",
            displayName: "详细地址",
            formType: "text",
            defaultValue: null,
            isNull: 1,
            isSearch: 1,
            placeHolder: null,
            setting: {},
            orderId: 1,
            isDelete: 0,
            guideProfessions: [],
            show: true,
            isGuideData: false,
            guideData: false,
          }]
        } 
        if (first.setting.customerOption.product) {
          product_list = [{
            id: 5460,
            tableName: "customer",
            isSystem: 1,
            fieldName: "product",
            displayName: "产品",
            formType: "text",
            defaultValue: null,
            isNull: 1,
            isSearch: 1,
            placeHolder: null,
            setting: {},
            orderId: 1,
            isDelete: 0,
            guideProfessions: [],
            show: true,
            isGuideData: false,
            guideData: false,
          }]
        }
      }
      this.seoSetList = [...taskFields.filter(item => { return item.isSystem === 1 && item.displayName !== '工单编号' && item.formType !== 'attachment'}).map(item => {if (item.fieldName === 'planTime'){item.formType = 'date'; item.isNull = 1} return item}),...linkman_list, ...address_list, ...product_list, ...Inquire]
    },
    /**
     * @description 初始化page
     */
    initPage() {
      this.taskPage = new Page();
      this.taskPage.list = [];
      this.params.page = 1;
      this.params.pageNum = 1;
      this.params.pageSize = 10
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
      this.search(this.searchParams);
    },
    /**
     * @description 修改选择列设置
     * @param {Object} event 事件对象
     */
    modifyColumnStatus(event) {
      let columns = event.data || [],
        colMap = columns.reduce(
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

      this.saveColumnStatusToStorage()
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
     *
     * @description 打开客户详情
     * @param {object} clientInfo 客户详情
     */
    openClientTab(clientInfo) {
      const { linkAuth, customerEntity } = clientInfo;
      const { id } = customerEntity;
      if (!linkAuth) return;

      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: `customer_view_${id}`,
        title: "客户详情",
        close: true,
        url: `/customer/view/${id}?noHistory=1`,
        fromId,
      });
    },
    /**
     * @description 打开工单详情tab
     * @param {String} taskId 工单id
     */
    openTaskTab(taskId, taskNo) {
      if (!taskId) return;

      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: `task_view_${taskId}`,
        title: `工单${taskNo}`,
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
        title: "9",
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

      this.$refs.searchPanel.mergeTaskFields(this.taskAllFields)
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
      // this.trackEventHandler("reset");

      // this.currentTaskType = this.taskTypes[0];
      // this.$refs.searchPanel.resetParams();

      // let pageSize = this.params.pageSize;
      // this.params = this.initParams(pageSize);
      // this.search();
      window.__exports__refresh = "";
      const fromId = window.frameElement.getAttribute("id");
      this.$platform.refreshTab(fromId);
    },
    /**
     * @description 还原本地存储
     */
    revertStorage() {
      const { pageSize, column_number } = this.getLocalStorageData();
      // if (pageSize) {
      //   this.params.pageSize = pageSize;
      // }
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
     * @description 派单方式文案
     */
    allotTypeText(params) {
      let text;
      switch (params) {
        case 1:
          text = "手动派单";
          break;
        case 2:
          text = "工单池派单";
          break;
        case 3:
          text = "自动派单";
          break;
        default:
          text = "";
          break;
      }
      return text;
    },
    /**
     * @description 搜索
     * @return {Promise}
     */
    search(searchModel = "") {
      const params = this.buildSearchParams();
      console.log("列表参数", params);
      const { selectId, initData, searchParams } = this;
      let mySearch;
      this.loading = true;
      switch (selectId) {
        case "all":
          mySearch = {};
          this.searchParams.createUser = "";
          this.searchParams.executor = "";
          this.searchParams.synergyId = "";
          break;
        case "create":
          mySearch = { createUser: initData.currentUserId };
          this.searchParams.executor = "";
          this.searchParams.synergyId = "";
          break;
        case "execute":
          mySearch = { executor: initData.currentUserId };
          this.searchParams.createUser = "";
          this.searchParams.synergyId = "";
          break;
        default:
          mySearch = { synergyId: initData.currentUserId };
          this.searchParams.createUser = "";
          this.searchParams.executor = "";
          break;
      }

      if (!searchModel) {
        /* S 高级搜索条件 */
        // 排序条件
        let sorts = [];
        if (params.orderDetail) {
          const { column, isSystem, sequence } = params.orderDetail;
          sorts = [
            {
              property: isSystem ? column : `attribute.${column}`,
              direction: sequence,
            },
          ];
        }
        // 城市
        let citys = {};
        if (params.productAddress) {
          const { province, city, dist } = params.productAddress;
          citys = {
            cusProvince: province,
            cusCity: city,
            cusDist: dist,
          };
        }
        // 系统字段查询条件
        const { systemConditions = [] } = params
        systemConditions && systemConditions.forEach((item)=>{
          if(item.value == 'API创建'){
            item.value = '开放API'
          }
        })
        // 自定义
        const conditions = params.conditions || [];
        const paymentMethod = params.paymentMethod
          ? [
              {
                property: "paymentMethod",
                value: params.paymentMethod,
                operator: "eq",
              },
            ]
          : [];
        // 创建时间
        const createTimeStart = this._time(params.createTime, 0);
        const createTimeEnd = this._time(params.createTime, 1);
        // 计划时间
        const planTimeStart = this._time(params.planTime, 0);
        const planTimeEnd = this._time(params.planTime, 1);
        // 派单时间
        const allotTimeStart = this._time(params.allotTime, 0);
        const allotTimeEnd = this._time(params.allotTime, 1);
        // 接收时间
        const acceptTimeStart = this._time(params.acceptTime, 0);
        const acceptTimeEnd = this._time(params.acceptTime, 1);
        // 开始时间
        const startTimeStart = this._time(params.startTime, 0);
        const startTimeEnd = this._time(params.startTime, 1);
        // 完成时间
        const completeTimeStart = this._time(params.completeTime, 0);
        const completeTimeEnd = this._time(params.completeTime, 1);
        // 更新时间
        const updateTimeStart = this._time(params.updateTime, 0);
        const updateTimeEnd = this._time(params.updateTime, 1);
        // 更新时间
        const reviewTimeStart = this._time(params.reviewTime, 0);
        const reviewTimeEnd = this._time(params.reviewTime, 1);
        // 结算时间
        const balanceTimeStart = this._time(params.balanceTime, 0);
        const balanceTimeEnd = this._time(params.balanceTime, 1);
        // 结算时间
        const closeTimeStart = this._time(params.closeTime, 0);
        const closeTimeEnd = this._time(params.closeTime, 1);
        // 派单方式
        let allotType;
        switch (params.allotTypeStr) {
          case "手动派单":
            allotType = 1;
            break;
          case "工单池派单":
            allotType = 2;
            break;
          case "自动派单":
            allotType = 3;
            break;
          default:
            allotType = "";
            break;
        }
        // 异常标记
        let onceException;
        switch (params.onceException) {
          case "曾超时":
            onceException = 1;
            break;
          case "曾拒绝":
            onceException = 2;
            break;
          case "曾暂停":
            onceException = 3;
            break;
          case "曾回退":
            onceException = 4;
            break;
          case "位置异常":
            onceException = 5;
            break;
          default:
            onceException = "";
            break;
        }
        // 曾转派
        let onceReallot;
        switch (params.onceReallot) {
          case "是":
            onceReallot = 1;
            break;
          default:
            onceReallot = "";
            break;
        }
        //曾打印
        let oncePrinted;
        switch (params.oncePrinted) {
          case "是":
            oncePrinted = 1;
            break;
          case "否":
            oncePrinted = 0;
            break;
          default:
            oncePrinted = "";
            break;
        }
        let source = params.source && params.source instanceof Array && params.source.length && params.source.map((item)=>{
                if(item=='API创建'){
                  item='开放API'
                }
                return item
              }) || [];
        // 是否审批中
        let inApprove;
        switch (params.inApprove) {
          case "审批中":
            inApprove = 1;
            break;
          case "无审批":
            inApprove = 0;
            break;
          default:
            inApprove = "";
            break;
        }
        // 工单类型
        let state;
        switch (params.state) {
          case "全部":
            state = "";
            break;
          case "待指派":
            state = "created";
            break;
          case "已指派":
            state = "allocated";
            break;
          case "已接受":
            state = "accepted";
            break;
          case "进行中":
            state = "processing";
            break;
          case "已完成":
            state = "finished";
            break;
          case "已拒绝":
            state = "refused";
            break;
          case "已结算":
            state = "costed";
            break;
          case "已关闭":
            state = "closed";
            break;
          case "已取消":
            state = "offed";
            break;
          case "工单池":
            state = "taskPool";
            break;
          case "未完成":
            state = "unfinished";
            break;
          default:
            break;
        }

        const par = {
          ...citys,
          conditions: [...conditions], //支付方式
          customerId: params.customerId,
          customerLinkman: params.tlmName,
          cusAddress: params.cusAddress,
          productId: params.productId,
          serviceType: params.serviceType,
          serviceContent: params.serviceContent,
          level: params.level,
          description: params.description,
          // createUser: mySearch.createUser || params.createUser,
          // allotUser: params.allotUser,
          // executor: mySearch.executor || params.executor,
          // synergyId: mySearch.synergyId || params.synergyId,
          createTimeStart,
          createTimeEnd,
          planTimeStart,
          planTimeEnd,
          allotTimeStart,
          allotTimeEnd,
          acceptTimeStart,
          acceptTimeEnd,
          startTimeStart,
          startTimeEnd,
          completeTimeStart,
          completeTimeEnd,
          updateTimeStart,
          updateTimeEnd,
          reviewTimeStart,
          reviewTimeEnd,
          balanceTimeStart,
          balanceTimeEnd,
          closeTimeStart,
          closeTimeEnd,
          allotType,
          onceException,
          onceReallot,
          oncePrinted,
          inApprove,
          sorts,
          // tagId: params.tagId,
          keyword: params.keyword,
          page: params.page,
          pageSize: params.pageSize,
          templateId: this.currentTaskType.id,
          state: state,
          source,
          eventNo: params.eventNo,
          serviceTypes: params.serviceTypes,
          serviceContents: params.serviceContents,
          levels: params.levels,
          searchStateList: params.states && params.states.map(stateName => TaskStateEnum.getValue(stateName)),
          allotTypes: params.allotTypeStrs && params.allotTypeStrs.map(type => AllotTypeConvertMap[type]),
          flags: params.onceExceptions && params.onceExceptions.map(exception => FlagConvertMap[exception] || '') ,
          createUserIds: this.getUserIdsWithSubmit(mySearch.createUser, params, 'createUser'),
          executorUserIds: this.getUserIdsWithSubmit(mySearch.executor, params, 'executor'),
          synergyUserIds: this.getUserIdsWithSubmit(mySearch.synergyId, params, 'synergyId'),
          allotUserIds: this.getUserIdsWithSubmit(null, params, 'allotUser'),
          payTypes: params.paymentMethods,
          searchTagIds: params.tags && params.tags.map(({ id }) => id),
          systemConditions
        };
        
        // 工单搜索分类型
        if (this.keyword_select) {
          par.searchCondition = this.keyword_select
        } else {
          if (this.searchParams.searchCondition) {
            delete this.searchParams.searchCondition
          }
        }
        
        this.searchParams = {...this.searchParams, ...par}
        
        for(let key in this.searchParams_spare) {
          if (this.searchParams_spare[key] && JSON.stringify(this.searchParams_spare[key]) !== '[]' && JSON.stringify(this.searchParams_spare[key]) !== '{}') {
            this.searchParams[key] = this.searchParams_spare[key]
          }
        }
        /* E 高级搜索条件*/
      } else {
        this.$refs.searchPanel.resetParams();
        this.params.keyword = "";
        searchModel["page"] = params.page;
        searchModel.createTimeStart = this._time(searchModel.createTimeStart);
        searchModel.createTimeEnd = this._time(searchModel.createTimeEnd);
        // 计划时间
        searchModel.planTimeStart = this._time(searchModel.planTimeStart);
        searchModel.planTimeEnd = this._time(searchModel.planTimeEnd);
        // 派单时间
        searchModel.allotTimeStart = this._time(searchModel.allotTimeStart);
        searchModel.allotTimeEnd = this._time(searchModel.allotTimeEnd);
        // 接收时间
        searchModel.acceptTimeStart = this._time(searchModel.acceptTimeStart);
        searchModel.acceptTimeEnd = this._time(searchModel.acceptTimeEnd);
        // 开始时间
        searchModel.startTimeStart = this._time(searchModel.startTimeStart);
        searchModel.startTimeEnd = this._time(searchModel.startTimeEnd);
        // 完成时间
        searchModel.completeTimeStart = this._time(
          searchModel.completeTimeStart
        );
        searchModel.completeTimeEnd = this._time(searchModel.completeTimeEnd);
        // 更新时间
        searchModel.updateTimeStart = this._time(searchModel.updateTimeStart);
        searchModel.updateTimeEnd = this._time(searchModel.updateTimeEnd);
        // 更新时间
        searchModel.reviewTimeStart = this._time(searchModel.reviewTimeStart);
        searchModel.reviewTimeEnd = this._time(searchModel.reviewTimeEnd);
        // 结算时间
        searchModel.balanceTimeStart = this._time(searchModel.balanceTimeStart);
        searchModel.balanceTimeEnd = this._time(searchModel.balanceTimeEnd);
        // 结算时间
        searchModel.closeTimeStart = this._time(searchModel.closeTimeStart);
        searchModel.closeTimeEnd = this._time(searchModel.closeTimeEnd);

        searchModel.templateId = this.currentTaskType.id;

        this.searchParams = { ...searchModel, ...mySearch };
      }
      console.log("参数", this.searchParams);
      this.searchList();
    },
    getUserIdsWithSubmit(user, params, userKey) {
      let users = params[userKey]
      let isUserArray = Array.isArray(users) 
      return (
        user 
        ? isUserArray
          ? users.push(user) 
          : [] 
        : isUserArray
          ? users
          : []
      )
    },
    /**
     * @description 时间字符串切割
     */
    _time(params, num) {
      if (!params) return;
      if (params && !isNaN(num)) {
        return new Date(params.split("-")[num]);
      } else {
        return new Date(params);
      }
    },
    /** 导出列 */
    _exportColumns() {
      let {taskFields, taskReceiptFields} = this
      // 工单信息
      let taskSelfFields = [];
      // 回执信息
      let taskReceiptSystemFields = [
        {
          id: 5460,
          isSystem: 1,
          fieldName: "spare_name",
          field: "spare_name",
          displayName: "备件",
          label: "备件",
          formType: "text",
          isNull: 1,
          isSearch: 0,
        },
        {
          id: 5460,
          isSystem: 1,
          fieldName: "service_name",
          field: "service_name",
          displayName: "服务项目",
          label: "服务项目",
          formType: "text",
          isNull: 1,
          isSearch: 0,
        },
        {
          id: 5460,
          isSystem: 1,
          fieldName: "balance_total",
          field: "balance_total",
          displayName: "费用信息",
          label: "费用信息",
          formType: "text",
          isNull: 1,
          isSearch: 0,
        },
      ];

      // 工单信息逻辑
      let linkman_list = '', address_list = '', product_list = ''
      taskSelfFields = taskFields.filter(item => {
        return item.formType !== 'attachment'
      })
      if (taskFields.length) {
        let first = taskFields.filter(item => {return item.displayName === '客户'})[0]
        if (first.setting.customerOption.linkman) {
          linkman_list = [{
            id: 5460,
            tableName: "customer",
            isSystem: 1,
            fieldName: "tlmName",
            displayName: "联系人",
            exportAlias: "customerLinkman",
            formType: "select",
            defaultValue: null,
            isNull: 1,
            isSearch: 1,
            placeHolder: null,
            setting: {},
            orderId: 1,
            isDelete: 0,
            show: true,
            guideProfessions: [],
            isGuideData: false,
            guideData: false,
          },
          {
            id: 5460,
            tableName: "customer",
            isSystem: 1,
            fieldName: "tlmPhone",
            exportAlias: "customerPhone",
            displayName: "电话",
            formType: "text",
            defaultValue: null,
            isNull: 1,
            isSearch: 1,
            placeHolder: null,
            setting: {},
            orderId: 1,
            isDelete: 0,
            guideProfessions: [],
            show: true,
            isGuideData: false,
            guideData: false,
          }]
        }
        if (first.setting.customerOption.address) {
          address_list = [{
            id: 5460,
            tableName: "customer",
            isSystem: 1,
            fieldName: "taddress",
            exportAlias: "customerAddress",
            displayName: "客户地址",
            formType: "address",
            defaultValue: null,
            isNull: 1,
            isSearch: 1,
            placeHolder: null,
            setting: {},
            orderId: 1,
            isDelete: 0,
            guideProfessions: [],
            show: true,
            isGuideData: false,
            guideData: false,
          }]
        } 
        if (first.setting.customerOption.product) {
          product_list = [{
            id: 5460,
            tableName: "customer",
            isSystem: 1,
            fieldName: "product",
            exportAlias: "product",
            displayName: "产品",
            formType: "text",
            defaultValue: null,
            isNull: 1,
            isSearch: 1,
            placeHolder: null,
            setting: {},
            orderId: 1,
            isDelete: 0,
            guideProfessions: [],
            show: true,
            isGuideData: false,
            guideData: false,
          }]
        }
      }
      taskSelfFields.forEach((item, index) => {
        if (item.displayName === '工单编号') {
          taskSelfFields.splice(index + 1, 0,{
            id: 476,
            tableName: "customer",
            isSystem: 1,
            fieldName: "templateName",
            exportAlias: "templateName",
            displayName: "工单类型",
            formType: "text",
            defaultValue: null,
            isNull: 0,
            isSearch: 1,
            placeHolder: null,
            setting: {
              customerNameDuplicate: false,
            },
            orderId: 0,
            isDelete: 0,
            guideProfessions: [],
            show: true,
            isGuideData: false,
            guideData: false,
          })
        }
        if (item.displayName === '客户') {
          if (linkman_list) {
            taskSelfFields.splice(index + 1, 0, linkman_list[0], linkman_list[1])
          }
          if (address_list) {
            taskSelfFields.splice(index + linkman_list.length + 1, 0, address_list[0])
          }
          if (product_list) {
            taskSelfFields.splice(index + linkman_list.length + address_list.length + 1, 0, product_list[0])
          }
        }
      })
       taskSelfFields.map(item => {
          item.label = item.displayName
          item.export = true
          return item
        })


      // 回执信息逻辑
      taskReceiptSystemFields = [
        ...taskReceiptSystemFields,
        ...taskReceiptFields.filter(item => {
          return (item.isSystem === 0 && item.formType !== 'attachment')
        })
      ].map((field) => {
        field.export = true;
        return field;
      });
      this.exportColumns = [
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
          columns: allExport.map(item => {
            item.export = true
            item.label = item.displayName
            return item
          }),
        },
      ];
      this.getCardDetailList(this.currentTaskType.id);
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

      this.$refs.advanced.open(this.columns, this.currentTaskType);
    },
    /**
     * @description 排序变化
     * @param {Object} option 配置
     */
    sortChange(option) {
      const UserNameConvertMap = {
        'createUserName': 'createUser',
        'executorName': 'executorUser',
        'customer': 'customerName'
      }

      try {
        let { prop, order } = option;

        if (!order) {
          this.params.orderDetail = {};
          return this.search();
        }
        const sortedField =
          this.taskListFields.filter((sf) => sf.fieldName === prop)[0] || {};

        let isSystem = 0;
        let isConvertedProp = Object.keys(UserNameConvertMap).indexOf(prop) > -1

        if (prop === "createTime" || prop === "updateTime" || isConvertedProp) {
          isSystem = 1;
        } 
        else {
          isSystem = sortedField.isSystem;
        }

        if (isConvertedProp) {
          prop = UserNameConvertMap[prop]
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
    /**
     * @description 修改选择列设置
     * @param {Object} event 事件对象
     */
    saveColumnStatus(event) {
      let columns = event.data || []

      this.columns = []

      this.$nextTick(() => {
        this.$set(this, 'columns', columns.slice());
        this.saveColumnStatusToStorage()
      })
    },
    saveColumnStatusToStorage() {
      const localStorageData = this.getLocalStorageData();
      let columnsStatus = null

      // 判断是否存储选择列
      const columnsList = this.columns.map(c => ({
        field: c.field,
        show: c.show,
        width: c.width,
      }));

      if (localStorageData.columnStatus) {
        localStorageData.columnStatus[
          `${this.selectColumnState}`
        ] = columnsList;
        columnsStatus = localStorageData.columnStatus;
      } else {
        columnsStatus = {
          [`${this.selectColumnState}`]: columnsList,
        };
      }

      this.saveDataToStorage('columnStatus', columnsStatus);
    }
  },
  components: {
    [TaskMap.name]: TaskMap,
    [TaskView.name]: TaskView,
    [TaskTransfer.name]: TaskTransfer,
    [BatchEditingCustomerDialog.name]: BatchEditingCustomerDialog,
    [TaskSearchPanel.name]: TaskSearchPanel,
    [TaskViewModel.name]: TaskViewModel,
    TaskSelect,
  },
};
