<template>
  <div class="part-record">
    <base-timeline v-if="items && items.length > 0">
      <base-timeline-item v-for="item in items" :key="item.id">
        <template v-if="item.action == '备注'">
          <template>{{item.executorName}} 添加了备注{{item.showInOwn == 1?'（仅自己可见）':''}}。</template>
          <template slot="content">
            <p v-if="item.content.updateContent">{{item.content.updateContent}}</p>
            <base-preview v-if="item.attachments" :files="item.attachments" readonly></base-preview>
          </template>
        </template>

        <template v-else-if="item.action == '编辑'">
          <template>{{item.executorName}} 编辑了备件。</template>
          <template slot="content">
            <p v-if="item.content.updateFieldsStr">{{item.content.updateFieldsStr}}</p>
          </template>
        </template>
        
        <template v-else-if="item.action === 'API新建'">
          <template>{{item.executorName}} 通过API应用 {{item.content.clientName}} 新建了备件</template>
        </template>

        <template v-else-if="item.action === 'API编辑'">
          <template>
            {{ item.executorName }} 通过API应用 {{ item.content.clientName }} 编辑了备件<br>
            {{ Object.keys(item.content).length > 0 ? ( item.content.updateFieldsStr != undefined ? `编辑字段：${item.content.updateFieldsStr}` : '' ) : '' }}
          </template>
        </template>

        <template v-else-if="item.action === '设置'">
          <template>{{item.executorName}} 设置了 {{item.content.repertoryName}} 仓库安全库存为 {{item.content.safetyStock}}。</template>
        </template>

        <template v-else-if="item.action === '批量更新'">
          <template>{{item.executorName}} 通过导入更新了备件</template>
          <template slot="content">
            <p v-if="item.content.updateFieldsStr">{{item.content.updateFieldsStr}}</p>
          </template>
        </template>

        <template v-else-if="item.action === '取消'">
          <template>{{item.executorName}} 取消了 {{item.content.repertoryName}} 仓库安全库存设置。</template>
        </template>

        <template v-else-if="item.action === '发送提醒'">
          <template> 系统向 {{item.content.receivers}} 发送了库存提醒，安全库存：{{item.content.safetyStock}}， 当前库存：{{item.content.repertoryCount}}。</template>
        </template>

        <template v-else>
          <template>{{item.executorName}} {{item.action}}了备件{{item.showInOwn == 1?'（仅自己可见）':''}}。</template>
          <template slot="content">
            <p v-if="item.content.updateContent">{{item.content.updateContent}}</p>
            <base-preview v-if="item.attachments" :files="item.attachments" readonly></base-preview>
          </template>
        </template>

        <template slot="time">{{item.createTime}}</template> 
        <i slot="icon" class="el-icon-message"></i>
      </base-timeline-item>
    </base-timeline>
    
    <div class="part-empty-tip" v-else>暂无数据</div>
  </div>
</template>

<script>
import BasePreview from 'packages/BasePreview';

export default {
  name: 'part-record',
  inject: ['initData'],
  props: ['items'],
  components: {
    [BasePreview.name]: BasePreview
  }
}
</script>

<style lang="scss">
.part-record{
  padding: 0 10px;
}
</style>

