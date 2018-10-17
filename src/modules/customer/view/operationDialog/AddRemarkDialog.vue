<template>
  <base-modal title="添加备注" :show.sync="addRemarkDialog" width="540px" class="add-remark-dialog">
    <form @submit.prevent="submit">
      <form-builder :fields="[]" class="remark-form" ref="form" :value="form" @input="update">
        <form-item label="内容" :field="fields.content">
          <form-textarea :field="fields.content" :value="form.content" @input="update"></form-textarea>
        </form-item>

        <form-item label="附件" :field="fields.attachments">
          <form-attachment :field="fields.attachments" :value="form.attachments" @input="update"></form-attachment>
        </form-item>

        <form-item>
          <el-checkbox v-model="form.showInOwn">仅自己可见</el-checkbox>
        </form-item>

        <div class="dialog-footer">
          <el-button @click="addRemarkDialog = false">关闭</el-button>
          <el-button native-type="submit" type="primary" :disabled="pending">保存</el-button>
        </div>
      </form-builder>
    </form>
  </base-modal>
</template>

<script>
  export default {
    name: "add-remark-dialog",
    props: {
      customer: {
        type: Object,
        default: () => ({}),
      }
    },
    data() {
      return {
        form: {
          content: '',
          attachments: [],
          showInOwn: 0,
        },
        pending: false,
        fields: {
          content: {
            formType: 'textarea',
            fieldName: 'content',
            displayName: "内容",
            placeholder: '请输入内容[最多500字]',
            isNull: 0,
          },
          attachments: {
            formType: 'attachment',
            fieldName: 'attachments',
            displayName: "附件",
            placeholder: '',
            isNull: 1,
          }
        },
        addRemarkDialog: false,
      }
    },
    mounted() {
    },
    methods: {
      update({field, newValue, oldValue}) {
        let {fieldName, displayName} = field;
        if (this.$appConfig.debug) {
          console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
        }
        this.$set(this.form, fieldName, newValue)
      },
      async submit() {
        try {
          const validateRes = await this.$refs.form.validate();
          const params = this.buildParams();
          if (!validateRes) return;
          this.pending = true;

          await this.$http.post('/customer/cRecord/create', params, false)

          this.pending = false;
          this.addRemarkDialog = false;

          // todo reload remark

        } catch (e) {
          this.pending = false;
          console.error('addRemarkDialog submit catch e', e);
        }
      },
      buildParams() {
        const {content, showInOwn, attachments,} = this.form;
        let params = {
          content: {
            updateContent: content,
            updateType: 'ptRecord',
          },
          primaryId: this.customer.id,
          primaryName: this.customer.name,
        };

        if (showInOwn) {
          params.showInOwn = 1;
        }
        if (attachments && attachments.length) {
          params.attachments = attachments
          .map(a => {
            a.filename = a.fileName;
            return a;
          });
        }
        return params;
      },
      openDialog() {
        this.addRemarkDialog = true;
      },
    },
  }
</script>

<style lang="scss">
  .add-remark-dialog {
    .remark-form {
      padding: 10px 20px;

      .form-item {
        label {
          width: 60px;
        }
        .form-item-control {
          width: 440px;
        }
      }

      .dialog-footer {
        text-align: right;
      }
    }
  }
</style>