<template>
  <div class="customer-info-record-container">

    <ul class="info-list">
      <li class="record-item" v-for="r in records" :key="r.id">
        <template v-if="r.action === '备注'">
          <div class="content">
            <p class="mark-title">
              <span class="main-info" v-html="r.formatInfo.recordTitle"></span>
              <span>{{r.createTime}}</span>
            </p>
            <p v-if="r.content.isDelete" style="color: red">
              {{r.formatInfo.deleteTitle}}
            </p>
            <template v-if="r.formatInfo.displayMark">
              <p v-if="r.content.updateType === 'ptRecord'">{{r.content.updateContent}}</p>
              <div v-if="r.attachments && r.attachments.length">
                <base-file-item v-for="file in r.attachments" :file="file" :key="file.url" :del="false"></base-file-item>
              </div>
            </template>
          </div>
          <p class="delete-mark-btn" v-if="!r.content.isDelete">
            <a href="javascript:;" @click="deleteMark(r)">删除</a>
          </p>
        </template>

        <div class="content" v-else-if="r.action === '地址'">
          <p class="mark-title">
            <span class="main-info">
              {{r.userName}}
              <template v-if="r.content.type === '设为默认'">
                将 <i class="iconfont icon-guide"></i>{{r.content.address}} 设为默认地址
              </template>
              <template v-else>
                {{r.content.type}}了地址 <i class="iconfont icon-guide"></i>{{r.content.address}}
              </template>
            </span>
            <span>{{r.createTime}}</span>
          </p>
        </div>

        <div class="content" v-else>
          <p class="mark-title">
            <span class="main-info" v-html="r.formatInfo.recordTitle"></span>
            <span>{{r.createTime}}</span>
          </p>
          <div v-if="r.attachments && r.attachments.length">
            <base-file-item v-for="file in r.attachments" :file="file" :key="file.url" :del="false"></base-file-item>
          </div>
        </div>
      </li>
    </ul>
    <p style="line-height: 20px; text-align: center;">
      <a href="javascript:;" @click="loadMore">{{btnText}}</a>
    </p>

    {{customerId}}

  </div>
</template>

<script>
  import BasFileItem from '@src/component/common/BaseFileItem';
  import {formatDate,} from '@src/util/lang';

  export default {
    name: "customer-info-record",
    props: {
      customerId: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        params: {
          pageNum: 1,
          pageSize: 10,
        },
        records: [],
        loadedAllRecord: false,
      }
    },
    computed: {
      btnText() {
        return this.loadedAllRecord ? '已加载全部' : '加载更多';
      }
    },
    mounted() {
      this.fetchRecord();
    },
    methods: {
      loadMore() {
        if (this.loadedAllRecord) return;
        this.params.pageNum++;
        this.fetchRecord();
      },
      fetchRecord() {
        const params = {
          primaryId: this.customerId,
          ...this.params,
        };
        this.$http.get('/v2/customer/cRecord', params)
        .then(res => {
          this.records = [...this.records, ...this.processRawData(res.list)];

          this.loadedAllRecord = res.total === this.records.length;
        })
        .catch(err => {
          console.error('fetchRecord err', err);
        })

      },
      async deleteMark(record) {
        try {
          const res = await this.$platform.confirm('确认删除该备注吗？');
          if (!res) return;

          const delRes = await this.$http.post('/customer/deleteCustomerRecord', {id: record.id,}, false);
          if (delRes.succ) {
            // reload record
            this.records = this.records.map(r => {
              if (r.id !== record.id) return r;
              let backup = Object.assign({}, r);
              backup.content.isDelete = true;
              backup.formatInfo.displayMark = false;
              backup.formatInfo.deleteTitle = `${'userName'}  于  ${formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')}  删除了该备注`;

              return Object.freeze(backup);
            })

          }
        } catch (e) {
          console.error('deleteMark catch err', e);
        }
      },
      processRawData(rs) {
        return rs.map(r => {
          r.formatInfo = {
            recordTitle: '',
            deleteTitle: '',
            displayMark: true,
          };

          // isDelete 换成Boolean
          if (r.content.isDelete === 'true') {
            r.content.isDelete = true;
            r.formatInfo.deleteTitle = `${r.content.deleteUserName}  于  ${r.content.deleteTime}  删除了该备注`;
          } else {
            r.content.isDelete = false;
          }

          // 记录信息格式化
          if (r.action === '备注') {
            r.formatInfo.displayMark = !r.content.isDelete && Object.keys(r.content).length > 0;
            r.formatInfo.recordTitle = `${r.userName}   添加了备注   ${r.primaryName}   ${r.showInOwn ? '(仅自己可见)' : ''}`;
          } else if (r.action === '联系人') {
            r.formatInfo.recordTitle = `${r.userName}
            ${r.content.type !== '设为默认' ?
              r.content.type + '了联系人  ' + r.content.name :
              '将  ' + r.content.name + '   设为默认联系人'
              }`;
          } else if (r.action === '消息提醒' && r.content.type === '已发送') {
            r.formatInfo.recordTitle = `${r.content.type}了消息提醒  ${r.content.remindName}给  ${r.content.remindTo}`;
          } else if (r.action === '消息提醒' && r.content.type !== '已发送') {
            r.formatInfo.recordTitle =
              `${r.userName}  ${r.content.type}了消息提醒  ${r.content.remindName} </br> ${r.content.rule || ''}`;
          } else if (r.action === '发送短信' && r.content.type === '添加') {
            r.formatInfo.recordTitle =
              `${r.userName}  使用短信模板   ${r.content.templateName} 向客户发送了短信</br>预计发送时间：${r.content.sendTime}`
          } else if (r.action === '发送短信' && r.content.type === '已发送') {
            r.formatInfo.recordTitle =
              `已使用短信模板 ${r.content.templateName}  向客户发送了短信</br>接收人：${r.content.remindToName}`
          } else {
            r.formatInfo.recordTitle += r.userName;
            if (r.action === '批量更新') {
              r.formatInfo.recordTitle += `通过导入更新了客户   ${r.primaryName}`;
            } else {
              r.formatInfo.recordTitle += ` ${r.action}了客户   ${r.primaryName}`;
            }

            if (Object.keys(r.content).length > 0) {
              if (r.content.updateFields !== undefined) {
                r.formatInfo.recordTitle += `</br>修改字段：${r.content.updateFields}`;
              }
            }
          }

          return Object.freeze(r);
        })
      }
    },
    components: {
      [BasFileItem.name]: BasFileItem,
    },
  }
</script>

<style lang="scss">
  .customer-info-record-container {

    .info-list {
      list-style: none;
    }

    .record-item {
      padding-bottom: 40px;
      border-left: 5px solid #ccc;
      padding-left: 35px;
      .content {
        .mark-title {
          display: flex;
          justify-content: space-between;

          .main-info {
            width: 380px;
          }
        }
      }
      .delete-mark-btn {
        text-align: right;
      }
    }

  }
</style>