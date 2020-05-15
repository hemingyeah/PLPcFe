<template>
  <div class="guide-admin-main">
    <div class="guide-admin-view">

      <!-- start 标题 -->
      <div class="guide-admin-title">
        请确认超级管理员身份
      </div>
      <!-- end 标题 -->

      <!-- start 副标题 -->
      <div class="guide-admin-subtitle">
        当涉及数据恢复、日记查询等高级权限时需要使用该手机号进行验证
        售后宝承诺保证您的数据安全
      </div>
      <!-- end 副标题 -->

      <!-- start 手机号 表单 -->
      <div class="guide-admin-form">
        <el-form :model="form" :rules="rules" ref="from" label-width="100px">
          <el-form-item prop="phone" class="guide-admin-form-phone">
            <el-input placeholder="请输入手机号" type="text" v-model="form.phone" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item prop="code" class="guide-admin-form-code">
            <el-input placeholder="请输入验证码" type="text" v-model="form.code" autocomplete="off"></el-input>
            <base-button :disabled="isSend" @event="send">
              {{ sendBtnText }}
            </base-button>
          </el-form-item>
          <el-form-item class="guide-admin-form-submit">
            <base-button @event="validate">
              完成
            </base-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- end 手机号 表单 -->
    </div>

    <!-- start 底部按钮 -->
    <div class="guide-view-footer">
        
      <span @click="prev" class="guide-view-footer-left">
        <i class="iconfont icon-left"></i>
        <!-- <span> -->
        {{ prevBtnText }}
        <!-- </span> -->
      </span>
      <span @click="jump" class="guide-view-footer-right">
        {{ jumpBtnText }}
        <i class="iconfont icon-right"></i>
      </span>
    </div>
    <!-- end 底部按钮 -->

  </div>
</template>

<script>
import { freeGuideCode, saveGuideSetting } from '@src/api/GuideApi.js';
import { PHONE_REG } from '@src/util/validator';

let timer = null;

export default {
  name: 'guide-step-three-admin',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    let validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入正确的手机号'));
      }
      else if (!PHONE_REG.test(value)) {
        callback(new Error('手机号码格式有误!'));
      } 
      else {
        callback();
      }
    };
    return {
      form: {
        phone: '',
        code: ''
      },
      isSend: false,
      rules: {
        phone: [
          { validator: validatePhone, trigger: 'blur' },
          { validator: validatePhone, required: true, message: '请输入正确的手机号', trigger: 'change' }
        ],
        code: [
          { min: 4, max: 6, required: true, message: '请输入正确的验证码格式', trigger: 'change' }
        ]
      },
      seconds: 0,
    }
  },
  computed: {
    // 跳过按钮文字
    jumpBtnText() {
      return '跳过';
    },
    // 上一步按钮文字
    prevBtnText() {
      return '上一步';
    },
    // 发送按钮文字
    sendBtnText() {
      return this.seconds <= 0 ? '发送验证码' : `${this.seconds}s后发送`;
    }
  },
  methods: {
    // 触发事件
    emit(index, { key, value }) {
      this.$emit('next', [index, { key, value}]);
    },
    // 跳过
    jump() {
      this.form.code = '';
      this.$emit('next', [2, { key: 'code', value: ''}]);
      this.submit();
    },
    // 上一步
    prev() {
      this.emit(1, { key: null, value: null });
    },
    // 发送短信验证码
    send() {
      if(this.isSend) return

      let isError = false;

      this.$refs.from.validateField('phone', (err) => {
        if(err) isError = true;
      })
      if(isError) return 

      let params = {
        phone: this.form.phone
      }

      this.isSend = true;
      this.seconds = 60;

      freeGuideCode(params).then(result => {
        let isSucc = result.status == 0;
        this.$platform.notification({
          type: isSucc ? 'success' : 'error',
          title: isSucc ? '成功' : '失败',
          message: isSucc ? '短信发送成功' : result.message
        })
      }).catch(err => {
        console.log(err);
      })

      timer = setInterval(() => {
        this.seconds--;
        if(this.seconds <= 0) {
          this.isSend = false;
          clearInterval(timer);
        }
      }, 1000);
    },
    // 提交
    submit() {
      this.$emit('updateLoading', true);

      let params = {
        profession: this.data.profession || '',
        role: this.data.role.filter(f => {
          return Array.isArray(f.userId) && f.userId.length > 0;
        }).map(r => {
          return {
            roleId: r.roleId,
            userId: r.userId,
          }
        }),
        code: this.form.code || '',
        phone: this.form.phone || '',
      }

      saveGuideSetting(params).then(result => {
        let isSucc = result.status == 0;

        if(isSucc) {
          this.emit(3, { key: 'qrcode', value: result.data || '' });
        } else {
          this.$platform.notification({
            type: 'error',
            title: isSucc ? '' : '失败',
            message: isSucc ? '' : result.message
          })
        }
        
        this.$emit('updateLoading', false);

      }).catch(err => {
        this.$emit('updateLoading', false);
        console.log(err)
      })
    },
    // 验证
    validate() {
      this.$refs.from.validate().then(result => {
        if(result) {
          return this.submit();
        }
        return Promise.reject('validate fail.');
      }).catch(err => console.log(err));
    }
  },
}
</script>

<style lang="scss">
.guide-admin-view {
  width: 420px;
  margin: 0 auto;
  padding-top: 60px;

  .guide-admin-title {
    color: #333;
    font-size: 16px;
    font-weight: bold;
    line-height: 22px
  }
  .guide-admin-subtitle {
    color: #777;
    line-height: 22px;
    margin-top: 5px;
  }

}

.guide-admin-form {
  margin-top: 30px;

  .el-form-item {
    .el-input input {
      height: 38px;
      line-height: 38px;
    }
  }

  &-phone,
  &-code,
  &-submit {
    .el-form-item__content {
      display: flex;
      width: 300px;
      margin: 0 auto !important;
    }
  }

  &-code {
    .el-input {
      width: 185px;
    }
    .base-button {
      margin-left: 15px;
      flex: 1;
      padding: 5px 10px;
    }
  }

  &-submit {
    .base-button {
      flex: 1;
    }
  }

}
</style>