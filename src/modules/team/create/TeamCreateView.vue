<template>
  <section class="team-create-view">
    <!-- start 新建团队 内容 -->
    <div class="team-create-content">
      <!-- start 按钮 -->
      <div class="team-tool-bar">
        <base-button type="only-text" icon="icon-arrow-left" @event="goBack">返回</base-button>
        <base-button type="only-text" icon="icon-edit" @event="jump" v-if="allowEdit">编辑</base-button>
      </div>
      <!-- end 按钮 -->
      <!-- start 新建团队 -->
      <div class="team-create-form">
        <!-- start form -->
        <form @submit.prevent="submit" class="edit-contact-form-container">
          <form-builder :fields="fields" class="edit-contact-form" ref="form" :value="form" @input="update">

          </form-builder>

          <div class="dialog-footer">
            <el-button @click="addContactDialog = false">关闭</el-button>
            <el-button native-type="submit" type="primary" :disabled="pending">保存</el-button>
          </div>
        </form>
        <!-- end form -->
      </div>
      <!-- end 新建团队 -->
    </div>
    <!-- end  新建团队内容 -->
  </section>
</template>

<script>
export default {
  name: 'team-create-view',
  data() {
    return {
      allowEdit: true, // TODO: 是否含有编辑的权限
      addContactDialog: false,
      pending: false,
      products: [],
      addresses: [],
      form: {
        name: '',
        description: '',
        charge: '黄',
        position: '',
        department: '',
        address: '', // address的ID
        customId: '',
        customer: {},
        id: '',
        phone: null,
        email: null,
        productId: [], //数组，包含产品对象
      },
      loadData: false,
    }
  },
  computed: {
    fields() {
      return [{
        formType: 'text',
        fieldName: 'name',
        displayName: "团队名称",
        placeholder: '团队名称[最多10字]',
        isNull: 0,
      }, {
        formType: 'text',
        fieldName: 'description',
        displayName: "团队描述",
        placeholder: '团队描述[最多30字]',
        isNull: 1,
      }, {
        formType: 'select',
        fieldName: 'charge',
        displayName: "团队主管",
        placeholder: '请选择团队主管',
        isNull: 0,
        setting: {
          isMulti: true,
          dataSource: ['黄', '宝'],
        }
      }, {
        formType: 'email',
        fieldName: 'email',
        displayName: "邮箱",
        placeholder: '',
        isNull: 1,
      }, {
        formType: 'text',
        fieldName: 'position',
        displayName: "职位",
        placeholder: '',
        isNull: 1,
      }, {
        formType: 'text',
        fieldName: 'department',
        displayName: "部门",
        placeholder: '',
        isNull: 1,
      }, {
        formType: 'textarea',
        fieldName: 'remark',
        displayName: "备注",
        placeholder: '[最多500字]',
        isNull: 1,
      }, {
        formType: 'select',
        fieldName: 'productId',
        displayName: "关联产品",
        placeholder: '请选择',
        isNull: 1,
        setting: {
          isMulti: true,
          dataSource: this.products || [],
        }
      }, {
        formType: 'select',
        fieldName: 'address',
        displayName: "关联地址",
        placeholder: '请选择',
        isNull: 1,
        setting: {
          dataSource: this.addresses || [],
        }
      }]
    },
  },
  methods: {
    goBack() {
      window.parent.frameHistoryBack(window);
    },
    jump() {
      // 
    },
    async submit() {
      try {
        const validateRes = await this.$refs.form.validate();
        if (!validateRes) return;

      } catch (e) {
        this.pending = false;
        console.error('team create submit catch e', e);
      }
    },
    update({field, newValue, oldValue}) {
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      this.$set(this.form, fieldName, newValue)
    },
  }
}
</script>

<style lang="scss">
  .team-create-view {
    height: 100%;
    overflow: auto;
    padding: 10px;
  }

  .team-create-content {

    .team-tool-bar {
      background-color: #fff;
      display: flex;
      justify-content: flex-start;
      font-size: 14px;
      color: $text-color-regular;
      padding: 12px 20px;
      border-bottom: 1px solid #f2f2f2;

      .text-button {
          padding: 10px 15px;
      }
    }
  }
</style>
