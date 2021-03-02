<template>
  <!-- start 工单进度 -->
  <div class="task-info-record">
    
    <!-- start 时间轴 -->
    <div class="task-timeline" ref="timeline">
      <base-timeline 
        :data="recordPage.list" 
        :record-render="renderRecord" 
        :loading="recordLoading"
        :loadmore="recordPage.hasNextPage"
        @load="loadmore"
      />
    </div>
    <!-- end 时间轴 -->
    
    <!-- start 添加备注 -->
    <div class="customer-quick-comment" v-if="editComment">
      <base-comment ref="comment" placeholder="请输入备注内容" :template-list="remarkTemplateList" :show-customer-action="true" @submit="createRemark" :disabled="commentPending" autofocus/>
    </div>
    <!-- end 添加备注 -->
    
  </div>
  <!-- end 工单进度 -->
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
/* utils */
import _ from 'lodash';
import { trimAll } from '@src/util/lang';
import Page from '@model/Page';
import { openTabForEventView } from '@src/util/business/openTab';
/* enum */
import { TaskEventNameMappingEnum } from '@model/enum/EventNameMappingEnum.ts';
/* image */
import DefaultHead from '@src/assets/img/avatar.png'

function createAttachmentDom(h, attachments){
  return attachments && attachments.length > 0 
    ? <div class="base-timeline-attachment base-file__preview">
      {attachments.map(item => <base-file-item file={item} key={item.id} readonly size="small"/>)}
    </div> 
    : ''
}

function createLinkDom(h,s){
  const reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/g;
  const str=s.replace(reg,str=>`@@${str}@@`);
  const arr=str.split('@@');
  return <p class="pre-line secondary-info">{arr.map(item=>{
    if(item.indexOf('http')===0){
      return <a href={item} target='_blank'>{item}</a>
    }else{
      return <span>{item}</span>
    }
  })}</p>
}

export default {
  name: 'task-info-record',
  inject: ['initData'],
  props: {
    showTemplate: {
      type: Boolean,
      default: true
    },
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      commentPending: false,
      params: {
        taskId: this.taskId,
        pageNum: 1,
        pageSize: 15,
      },
      recordLoading: false,
      recordPage: new Page(),
    }
  },
  computed: {
    address() {
      return this.shareData?.address || '';
    },
    auth() {
      return this.shareData?.auth || {};
    },
    // 权限
    authorities(){
      let user = this.loginUser || {};
      return user.authorities || {};
    },
    allTaskEdit() {
      return this.authorities['TASK_EDIT'] === 3;
    },
    /** 是否允许操作 */
    allowOperate(){
      return this.task?.isDelete === 0;
    },
    /** 查看单权限 */
    allowTaskView() {
      return this.initData?.canViewTask === true;
    },
    customer() {
      return this.task?.customer || {};
    },
    /** 添加备注权限 */
    editComment(){
      return this.allowTaskView && this.allowOperate;
    },
    loginUser(){
      return this.initData?.loginUser || {};
    },
    linkman() {
      return this.shareData?.linkman || {};
    },
    task() {
      return this.shareData?.task || {};
    },
    taskId() {
      return this.task?.id;
    },
    taskNo() {
      return this.task?.taskNo;
    },
    remarkTemplateList() {
      return this.showTemplate ? this.initData.remarkList : [];
    }
  },
  mounted() {
    this.initializeRecord();
    this.$eventBus.$on(TaskEventNameMappingEnum.UpdateRecord, this.searchRecord);
  },
  beforeDestroy() {
    this.$eventBus.$off(TaskEventNameMappingEnum.UpdateRecord, this.searchRecord);
  },
  methods: {
    /** 
     * 同时满足以下条件允许删除该记录
     * 1. 该记录没有被删除
     * 2. 工单编辑权限（CUSTOMER_EDIT）值为3 或者 是创建人
     * 3. 该工单没有被删除
     */
    allowDeleteRecord(item){
      let isDelete = item.content.isDelete == 'true'
      let user = this.loginUser
      let isCreator = item.userId == user.userId

      return !isDelete && (this.allTaskEdit || isCreator) && this.allowOperate;
    },
    buildMapMarkerContent() {
      return '<i class="bm-location-dot"></i><div class="map-address-title">客户地址</div>';
    },
    buildMapCustomerInfoContent() {
      return `
        <div class="map-info-window-content">
          <div class="customer-name">${ this.customer.name || '' }</div>
          <p><label>联系人：</label>${ this.linkman.lmName || '' }</p>
          <p><label>电话：</label>${ this.linkman.lmPhone || '' }</p>
          <p><label>地址：</label>${ this.address || '' }</p>
          <div class="info-window-arrow"></div>
        </div>
      `;
    },
    buildCommonMarker(map, aMap, longitude, latitude, markerContent, infoWindowContent) {
      let position = new aMap.LngLat(longitude, latitude);
      let marker = new aMap.Marker({
        position,
        content: markerContent
      })
      
      marker.on('mouseover', (event) => {
        let infoWindow = new aMap.InfoWindow({
          closeWhenClickMap: true,
          isCustom: true,
          offset: new aMap.Pixel(0, -34),
          content: infoWindowContent
        })
        
        infoWindow.open(map, event.target.getPosition());
      })
      
      return marker
    },
    /** 
     * @description 创建备注
    */
    async createRemark(form) {
      try{
        this.commentPending = true;
        
        let params = {
          taskId: this.taskId,
          attachment: form.attachments,
          showInOwn: form.showInOwn,
          toCustomer: form.toCustomer,
          cusNotice: form.cusNotice,
          content: form.content
        }
        
        let result = await TaskApi.taskRecordCreate(params);
        
        if (result.success) {
          // 清除备注信息
          this.$refs.comment.reset();
          // 初始化备注
          await this.initializeRecord();
          // 滚动到顶部
          this.$nextTick(() => {
            this.$refs.timeline.scrollTop = 0;
          })
        } else {
          this.$platform.alert(result.message)
        }
        
      } catch(err){
        console.warn(err)
      } finally {
        this.commentPending = false;
      }
    },
    /** 
     * @description 删除备注
    */
    async deleteRemark(record) {
      try {
        if (!await this.$platform.confirm('确认删除该备注吗？')) return;
        const result = await TaskApi.taskRecordDelete({ id: record.id });
        
        if (result.success) {
          this.initializeRecord(); 
        } else {
          this.$platform.alert(result.message)
        }
        
      } catch (e) {
        console.warn('task deleteRemark -> error', e);
      }
    },
    /** 
     * @description 抓取信息动态
    */
    fetchRecord(params){
      params.taskId = this.taskId;
      params.userId = this.loginUser.userId;
      params.hasViewBalanceRecord = 1;
      params.hasViewReviewRecord = 1;
      
      return TaskApi.taskRecordList(params).then(data => {
        let { list = [] } = data?.result;
        list.forEach(record => {
          try {
            record.attachments = JSON.parse(record.attachments);
            record.content = JSON.parse(record.content);
          } catch (error) {
            record.attachments = [];
            record.content = { updateContent: record.content };
            console.warn('searchRecord recordPage.list.forEach -> error', error)
          }
        })
        
        return data;
      })
    },
    /** 
     * @description 初始化信息动态
    */
    async initializeRecord() {
      this.params.pageNum = 1;
      this.searchRecord();
    },
    /** 
     * @description 加载下一页
    */
    async loadmore() {
      try {
        this.params.pageNum++;
        this.recordLoading = true;
        
        let data = await this.fetchRecord(this.params);
        
        this.recordLoading = false
        this.recordPage.merge(data.result)
        
      } catch (error) {
        console.warn('loadmore -> error', error)
      }
    },
    openMap(content){
      let longitude = content.longitude;
      let latitude = content.latitude;
      
      if(!longitude || !latitude) return;
      
      this.$fast.map
        .display({ ...content }, { title: '位置信息' })
        .catch(err => console.error('openMap catch an err: ', err));
    },
    openMapForFinished(content) {
      let longitude = content.longitude;
      let latitude = content.latitude;
      
      if(!longitude || !latitude) return;
      
      this.$fast.map
        .display(
          { ...content }, 
          { title: '位置信息' }, 
          undefined,
          undefined,
          (map, aMap) => {
            return this.renderMarks(content, map, aMap);
          }
        )
        .catch(err => {
          console.error('openMap catch an err: ', err)
        });
    },
    /** 
     * @description 构建用户标记
    */
    renderMarks(record, map, aMap) {
      let { longitude, latitude } = record
      let markers = []
      // 完成时地址
      if (longitude && latitude) {
        let markerContent = `<img class='user-head' src=${record.userHead || DefaultHead} />`
        let infoWindowContent = `<div class='amap-user-name'>${record.userName}</div>`
        let marker = this.buildCommonMarker(map, aMap, longitude, latitude, markerContent, infoWindowContent)
        
        markers.push(marker)
      }
      
      // 工单客户地址
      let address = this.task.taddress || {};
      let customerLongitude = address.longitude;
      let customerLatitude = address.latitude;
      if(customerLongitude && customerLatitude) {
        let marker = this.buildCommonMarker(
          map, aMap, customerLongitude, customerLatitude, this.buildMapMarkerContent(), this.buildMapCustomerInfoContent()
        )
        markers.push(marker)
      }
      
      return markers
    },
    recordPageListConvertHandler(list = []) {
      list.forEach(record => {
        try {
          record.attachments = JSON.parse(record.attachments);
        } catch (error) {
          console.warn('searchRecord  recordPage.list.forEach -> error', error)
        }
      })
    },
    /** 
     * @description 渲染地址dom
     * @param {Object} record 记录数据
     * @param {Boolean} isFinished 是否是完成状态 特殊处理
    */
    renderAddressRecordDom(record = {}, isFinished = false) {
      let address = trimAll(record.address || '');
      let { latitude, longitude } = record;
      let isShowAddress = address && latitude && longitude;
      let openMapFunc = isFinished ? this.openMapForFinished : this.openMap
      let icon = isShowAddress ? <i class="iconfont icon-address" onClick={e => {openMapFunc(record)}}></i> : '';
      
      return { address, icon, isShowAddress }
    },
    /* 渲染指派转派 */
    renderAllotDom(record = {}) {
      let { action, userName, content, taskNo, executorName } = record;
      return (
        <div class="task-record-allot">
          <h5><strong>{userName}</strong>{ ` 把工单 #${taskNo} ${action} 给 ${executorName} `}。</h5>
          {(content && Object.keys(content).length > 0) && (
            <div>
              {content.synergy && <div>{`协同人：${content.synergy}`}</div>}
              {content.updateType == 'tRecord' && (
                (action == '转派' && content.updateContent) ? <div>{`转派说明：${content.updateContent}`}</div> : <div>{content.updateContent}</div>
              )}
            </div>
          )}
        </div>
      )
    },
    /* 渲染添加备注 */
    renderActionRemarkDom(h, record = {}) {
      let { userName, showInOwn, toCustomer, cusNotice, content, attachments } = record;
      return [
        <h5 class="main-info">
          <strong>{ userName }</strong> 添加了备注
          {!!showInOwn && (
            <span class="private"> <i class="iconfont icon-account1"></i> 仅自己可见 </span>
          )}。
          {!!toCustomer && <span class=""> (客户可见) </span> }
          {!!cusNotice && <span class=""> (短信通知客户) </span> }
          {
            this.allowDeleteRecord(record) 
            && (
              <button type='button' class="btn-text base-timeline-delete" onClick={e => this.deleteRemark(record)}>
                <i class="iconfont icon-shanchu"></i>删除
              </button>
            )
          }
        </h5>,
        content.isDelete == 'true'
          ? <p class="text-danger">{content.deleteUserName}于{content.deleteTime}删除了该备注。</p> 
          : [createLinkDom(h,content.updateContent), createAttachmentDom(h, attachments)]
      ]
    },
    /* 渲染api新建 */
    renderApiCreateDom(record = {}) {
      let { userName, content, taskNo } = record;
      return [
        <h5><strong>{ userName }</strong>{` 通过API应用${content.clientName} 新建了工单  ${ taskNo }`}</h5>
      ]
    },
    /* 渲染工单自动分配dom */
    renderTaskAutoAllotDom(record = {}) {
      let { executorName = '', content, taskNo } = record;
      return <div>工单 #{ taskNo } 通过自动分配规则 { content.ruleName } 分配给 { executorName }</div>
    },
    /* 渲染工单自动分配失败dom */
    renderTaskAutoAllotFailDom(record = {}) {
      let { content, taskNo } = record;
      return <div class="task-record-fail">工单 #{ taskNo } 超时工单自动派单失败，失败原因  { content.fail }</div>
    },
    /* 渲染工单自动派单dom */
    renderTaskAutoDispatchDom(record = {}) {
      let { executorName = '', content, taskNo } = record;
      return <div>工单 #{ taskNo } 通过自动分配规则 { content.ruleName } 分配给 { executorName }</div>
    },
    /* 渲染基础的工单动作 */
    renderBaseTaskAction({ action, userName, taskNo }) {
      return <h5> <strong>{userName}</strong> {action}了工单 #{taskNo}。</h5>
    },
    /* 渲染留言 */
    renderLeaveMessageDom(h, record = {}) {
      let { userName, content, attachments } = record;
      return [
        <h5 class="main-info">
          <strong>{ userName }</strong> 添加了留言
        </h5>,
        content.isDelete == 'true'
          ? <p class="text-danger">{ content.deleteUserName }于{ content.deleteTime }删除了该留言。</p> 
          : [<p class="pre-line secondary-info">{ content.updateContent }</p>, createAttachmentDom(h, attachments)]
      ]
    },
    /* 渲染电话日志 */
    renderPhoneLogDom(record = {}) {
      let { userName, content } = record;
      return <h5><strong>{ userName }</strong> 拨打了 <strong>{ content.targetName }</strong> 的电话。</h5>
    },
    /* 渲染编辑回执dom */
    renderReceiptEditDom({ userName, taskNo }) {
      let addressData = this.renderAddressRecordDom(...arguments);
      return [
        <h5> <strong>{userName}</strong> 编辑了工单回执 #{taskNo}。</h5>,
        addressData.isShowAddress ? <div>{ addressData.icon }{ addressData.address }</div> : ''
      ]
    },
    /* 渲染发布到工单池dom */
    renderReleaseTaksPoolDom(record = {}) {
      let { action, userName, content, taskNo } = record;
      let synergyDom = content.synergy ? <div>{ `协同人 ${content.synergy}` }</div> : '';
      let contentDom = content.toTaskPool === '1'
        ? <p class="pre-line secondary-info">{ `转派说明： ${ content.updateContent }` }</p> 
        : <p class="pre-line secondary-info">{ content.updateContent }</p>;
        
      return [
        <h5><strong>{userName}</strong> 把工单 #{ taskNo } { action } 到工单池。</h5>,
        <div>
          { synergyDom }
          { content.updateType == 'tRecord' ? contentDom : '' }
        </div>
      ]
    },
    /* 渲染开始和完成 */
    renderStartOrFinishDom(record = {}) {
      let { content, address, action } = record;
      let isFinished = action == '完成'
      let addressData = this.renderAddressRecordDom(record, isFinished);
      let isPositionException = content.isPositionException == 'true';
      let className = isPositionException ? 'task-position-exception' : '';
      let startOrFinshRecord = [
        // 基础工单操作日志
        <div> { this.renderBaseTaskAction(record) } </div>,
        // 地址操作
        <div>
          { address === 'PC端' ? <span>从PC端操作</span> : <span>{ addressData.icon }{ addressData.address }</span> }
        </div>,
        // 是否地理位置异常
        <div>
          { isPositionException && <span>距离客户位置：{ content.distance ? `${content.distance} 公里` : '位置异常，未获取到位置信息' }</span> }
        </div>
      ];
      
      return (
        <div class={className}>
          { startOrFinshRecord }
        </div>
      )
    },
    /* 渲染计划任务新建工单 */
    renderPlanTaskCreateDom(record = {}) {
      let { content, taskNo } = record;
      return <h5>{`已通过计划任务${content.planName} 新建了工单  ${ taskNo }`}</h5>
    },
    /* 渲染工单接受dom */
    renderTaskAcceptDom(record = {}) {
      let { content, userName, action, taskNo } = record;
      let fromTaskPool = content.fromTaskPool == '1';
      let taskPoolAcceptDom = <h5> <strong>{userName}</strong> 从工单池 {action}了工单 #{taskNo}。</h5>
      
      return fromTaskPool ? taskPoolAcceptDom : this.renderBaseTaskAction(record)
    },
    /* 渲染工单审批dom */
    renderTaskApproveDom(record = {}) {
      let { content, taskNo, address, userName, longitude, latitude } = record;
      let { state, level } = content;
      // 工单审批状态
      let taskState = {
        unApproved: state == 'unapproved',
        success: state == 'success',
        fail: state == 'fail',
        offed: state == 'offed',
      }
      // 工单审批等级
      let levelName =  level >= 1 ? ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'][level] + '级': '';
      // 是否显示地址
      let isShowAddress = address && address != 'PC端';
      // 地址数据
      let addressData = this.renderAddressRecordDom(record);
      // 地址dom
      let addressDom = isShowAddress 
        ? longitude && latitude 
          ? <div>{ addressData.icon }{ addressData.address }</div> 
          : <div>{ address }</div>
        : '';
      // 未审批dom
      let unApprovedDom = [
        <div><strong>{ userName }</strong> { address == 'PC端' ? '通过PC端 ' : '' } 提交了对工单 #{ taskNo } 关于 { content.action } 操作的审批 </div>,
        content.remark && <div>备注：{ content.remark }</div>,
        content.apprNames && <div>审批人：{ content.apprNames }</div>,
        addressDom
      ];
      
      
      // 审批成功dom
      let isAutoApprove = userName == '自动审批';
      let autoApproveDom = <h5>工单 #{ taskNo } { content.action }节点未设置{ levelName }审批人，流程自动审批通过</h5>;
      let notAutoApproveDom = [
        <div><strong>{ userName }</strong> 通过了对工单 #{taskNo} { content.action } 操作的{ levelName }审批</div>,
        content.remark && <div>备注：{ content.remark }</div>
      ]
      let successDom = isAutoApprove ? autoApproveDom : notAutoApproveDom;
      // 审批失败dom
      let failDom = [
        <div><strong>{ userName }</strong> 拒绝了对工单 #{taskNo} { content.action } 操作的{ levelName }审批</div>,
        content.remark && <div>备注：{ content.remark }</div>
      ];
      // 审批撤回dom
      let offedDom = [<div><strong>{ userName }</strong> 撤回了对工单 #{taskNo} { content.action } 操作的审批</div>];
      
      return [
        <div>
          { taskState.unApproved ? unApprovedDom : '' }
          { taskState.success ? successDom : '' }
          { taskState.fail ? failDom : '' }
          { taskState.offed ? offedDom : '' }
        </div>
      ]
      
    },
    /* 渲染工单修改结算dom */
    renderTaskBalanceDom(record = {}) {
      let { content, taskNo, userName } = record;
      let balanceArr = [];
      
      for (let name in content){
        let value = content[name];
        let arr = value.split('[ + + ]');
        let data = { name, oldValue: arr[0], newValue: arr[1] }
        
        balanceArr.push(data);
      }
      
      return [
        <h5> <strong>{ userName }</strong> 修改了结算了工单 #{ taskNo }。</h5>,
        balanceArr.map(review => {
          return <div>
            <strong>{ review.name }</strong> 由 <strong>{ review.oldValue }</strong> 修改为 <strong>{ review.newValue }</strong>
          </div>
        })
      ]
    },
    /* 渲染工单附加组件卡片 */
    renderTaskCardDom(record = {}) {
      let { userName, content } = record;
      return <div><strong>{ userName }</strong> { content.action }了附件组件 { content.cardName } 的信息</div>
    },
    /* 渲染工单创建dom */
    renderTaskCreatetDom(record = {}) {
      let { content = {} } = record
      let { eventId, eventNo } = content
      let isEventToTask = Boolean(eventId)
      
      return [
        this.renderBaseTaskAction(record),
        isEventToTask ? <span onClick={event => openTabForEventView(eventId)}>由事件<span class="link-text"># {eventNo} </span>创建</span> : ''
      ]
    },
    /* 渲染工单修改dom */
    renderTaskEditDom(record = {}) {
      let { content } = record;
      return [
        this.renderBaseTaskAction(record),
        content.updateFields && <div>修改字段：{ content.updateFields } </div>,
        content.planTime && <div>计划时间：{ content.planTime } </div>
      ]
    },
    /* 渲染工单暂停dom */
    renderTaskPausedDom(record = {}) {
      let { action, content, taskNo, userName } = record;
      let reasonDom = content.reason && <div>暂停原因：{ content.reason }</div>
      return (
        <div class="task-record-fail">
          <div><strong>{ userName }</strong> { action } 了工单 #{ taskNo } </div>
          { reasonDom }
        </div>
      )
    },
    /* 渲染回访短信dom */
    renderTaskCodeReviewDom(record = {}){
      let { action, taskNo, userName } = record;
      return (
        <h5><strong>{ userName }</strong> 发送了 { action } #{ taskNo }</h5>
      )
    },
    /* 渲染工单支付dom */
    renderTaskPaymentDom(record = {}) {
      let { userName, taskNo } = record;
      return <h5><strong>{ userName }</strong> 已完成工单 #{ taskNo } 的支付。</h5>
    },
    /* 渲染工单回访dom */
    renderTaskReviewDom(record = {}) {
      let { content } = record;
      let degree = ''; 
      let tag = '';
      let star = [];
      let reviewArr = [];
        
      for (let name in content){
        let value = content[name];
        let arr = value.split('[ + + ]');
        let data = { name, oldValue: arr[0], newValue: arr[1] }
        
        if (name == '满意度') {
          degree = _.cloneDeep(data);
        } else if (name == '服务标签') {
          tag = _.cloneDeep(data);
        } else {
          star.push(data);
        }
      }
        
      if (degree) reviewArr.push(degree)
      if (star) reviewArr = reviewArr.concat(star)
      if (tag) reviewArr.push(tag)
      
      return [
        this.renderBaseTaskAction(record),
        reviewArr.map(review => {
          return <div>
            <strong>{ review.name }</strong> 由 <strong>{ review.oldValue }</strong> 修改为 <strong>{ review.newValue }</strong>
          </div>
        })
      ]
    },
    /* 渲染工单服务报告dom */
    renderTaskServiceReportDom(record = {}) {
      let { userName, taskNo } = record;
      return <div><strong>{ userName }</strong> 导出了 工单 #{ taskNo } 的服务报告 </div>
    },
    /* 渲染工单超时dom */
    renderTaskTimeoutDom(record = {}) {
      let { content } = record;
      return [
        <div>已发送超时提醒给 { content.receivers }</div>,
        content.flow && <div>流程节点： { content.flow }</div>,
        <div>流程超时时间：{ content.overTime }</div>
      ]
    },
    /* 渲染工单已超时dom */
    renderTaskTimeoutdDom(record = {}) {
      let { content, taskNo } = record;
      return <div class="task-record-fail">工单 #{ taskNo } 已在 { content.flow } 节点超时</div>
    },
    /* 渲染工单转交dom */
    renderTaskTransferDom(record = {}) {
      let { executorName, userName, executorId, content, taskNo } = record;
      return [
        <h5> <strong>{userName}</strong> 对工单 #{ taskNo } 进行了转交处理。</h5>,
        executorId && <div>负责人改为：{ executorName }</div>,
        content.synergy && <div>协同人改为：{ content.synergy }</div>
      ]
    },
    /* 渲染工单审批转交dom */
    renderTaskApproveTransferDom(record = {}) {
      let { operatorName, handoverName } = record?.content;
      return <h5><strong>{ operatorName }</strong> 将该审批转交至新审批人 <strong>{ handoverName }</strong> 进行处理。</h5>
    },
    /** 根据记录的action渲染对应的内容，支持jsx和render函数 */
    renderRecord(h, record) {
      let { action, userName, content, attachments, taskNo } = record;
      
      if (action == '指派' || action == '转派') return this.renderAllotDom(record)
      if (action == '开始' || action == '完成') return this.renderStartOrFinishDom(record)
      if (action == '编辑回执') return this.renderReceiptEditDom(record)
      if (action == '添加') return this.renderActionRemarkDom(h, record)
      if (action == '留言') return this.renderLeaveMessageDom(h, record)
      if (action == '发布') return this.renderReleaseTaksPoolDom(record)
      if (action == '接受') return this.renderTaskAcceptDom(record)
      if (action == '新建') return this.renderTaskCreatetDom(record)
      if (action === 'API新建') return this.renderApiCreateDom(record)
      if (action === '计划任务新建') return this.renderPlanTaskCreateDom(record)
      if (action === '审批') return this.renderTaskApproveDom(record)
      if (action === '卡片') return this.renderTaskCardDom(record)
      if (action === '自动分配') return this.renderTaskAutoAllotDom(record)
      if (action === '自动分配失败') return this.renderTaskAutoAllotFailDom(record)
      if (action === '自动派单') return this.renderTaskAutoDispatchDom(record)
      if (action === '超时') return this.renderTaskTimeoutDom(record)
      if (action === '已超时') return this.renderTaskTimeoutdDom(record)
      if (action === '修改') return this.renderTaskEditDom(record)
      if (action === '转交') return this.renderTaskTransferDom(record)
      if (action === '暂停') return this.renderTaskPausedDom(record)
      if (action === '回访短信') return this.renderTaskCodeReviewDom(record)
      if (action === '回访' || action === '回访并关闭') return this.renderTaskReviewDom(record)
      if (action === '修改结算') return this.renderTaskBalanceDom(record)
      if (action === '服务报告') return this.renderTaskServiceReportDom(record)
      if (action == '电话日志') return this.renderPhoneLogDom(record)
      if (action == '支付') return this.renderTaskPaymentDom(record)
      if (action == '审核转交') return this.renderTaskApproveTransferDom(record)
      
      const { isGoBack, synergy, updateType, updateContent } = content;
      
      return [
        <h5><strong>{ userName }</strong> { action } 了工单 #{ taskNo }。</h5>,
        synergy && <div>{`协同人：${ synergy }`}</div>,
        updateType == 'tRecord' && <div>{ updateContent }</div>,
        isGoBack !== undefined && <div> 工单被取消{isGoBack !== null ? `，备件及服务项目${ isGoBack == '1' ? '已' : '未' }退回` : ''} </div>,
        createAttachmentDom(h, attachments)
      ];
    },
    async searchRecord() {
      try {
        this.recordLoading = true;
        
        let data = await this.fetchRecord(this.params);
        
        this.recordLoading = false;
        this.recordPage.list = [];
        this.recordPage.merge(data.result)
        
      } catch (error) {
        console.warn('searchRecord -> error', error)
      }
    }
  }
}
</script>
<style lang="scss">
.task-timeline{
  padding-top: 15px;
  flex: 1;
  padding-right: 15px;
  .private {
    color: $color-primary;
  }
}
.task-position-exception,
.task-record-fail {
  color: #f0ad4e;
}

.task-info-record {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  background-color: #fff;
}
</style>