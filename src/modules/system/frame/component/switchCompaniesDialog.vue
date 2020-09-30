<template>
  <base-modal
    title="切换企业"
    :show.sync="visible"
    width="500px"
    class="switchcompanies-dialog"
  >
    <div class="base-modal-content">
      <!-- start 企业轮播 -->
      <div class="enterprises_choose">
        <p class="choose_tit">请选择您需要切换的企业</p>
        <div class="swiper-container swiper-no-swiping">
          <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="item in tenantInform.tenantList" :key="item.id">
              <img :src="item.attribute.logoUrl?item.attribute.logoUrl:'/resource/images/qiye.jpg'"/>
            </div>
          </div>
          <!-- Add Arrows -->
          <div class="swiper-button-next">
            <img class="brand-left" src="/resource/images/login/you.png" />
          </div>
          <div class="swiper-button-prev">
            <img class="brand-right" src="/resource/images/login/zuo.png" />
          </div>
        </div>
        <p class="enterprise_name">{{enterpriseName}}</p>
      </div>
      <!-- end 企业轮播 -->

      <el-input
        placeholder="请输入密码"
        :type="inputType"
        v-model="form.password"
      >
        <template slot="prepend"
          ><i class="iconfont icon-account1"></i
        ></template>
         <template slot="suffix"
          >
          <img src="/resource/images/login/hidepassword.png" class="show_icon"  @click="changePass('show')" v-if="inputType == 'password'">
          <img src="/resource/images/login/showpassword.png" class="show_icon"  @click="changePass('hide')" v-else>
        </template>
       
      </el-input>
      <div class="dialog-footer" slot="footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button native-type="submit" type="primary" @click="submit">保存</el-button>
      </div>
    </div>
  </base-modal>
</template>
<script>
import md5 from "js-md5";
import http from "@src/util/http";
import Platform from "@src/platform";
// import Swiper from "swiper"
export default {
  name: "switchcompanies-dialog",
  data() {
    return {
      enterpriseName:"",
      inputType:"password",
      swiperOption: {
        //设置点击箭头
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        slideToClickedSlide: true,
        // paginationClickable: true, //点击切换
        slidesPerView: 4,
        spaceBetween: 0,
        centeredSlides: true,
        //拖动释放时不会输出信息，阻止click冒泡。拖动Swiper时阻止click事件。
        preventLinksPropagation: true,
      },
      carouselArr: [],
      form: {
        ua:"Chrome",
        mode:"PWD",
        tenantId:"",
        password: "",
      },
      init: false, // 初始化表单
      visible: false,
    };
  },
  props:{
    tenantInform: {
      type: Object
    }
  },
  computed: {},
  mounted() {
    var swiper = new Swiper(".swiper-container", {
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
       on:{
          slideChange:()=>{
            this.enterpriseName = this.tenantInform.tenantList[swiper.activeIndex].tenantName
            this.tenantId = this.tenantInform.tenantList[swiper.activeIndex].id;
          },
      },
      slideToClickedSlide: true,
      // paginationClickable: true, //点击切换
      offsetPxBefore:20,
      offsetPxAfter:20,
      slidesPerView: 4,
      spaceBetween: 10,
      centeredSlides: true,
      //拖动释放时不会输出信息，阻止click冒泡。拖动Swiper时阻止click事件。
      preventLinksPropagation: true,
    });
  },
  methods: {
    changePass(value) {
      console.log(value)
      if(value=='show'){
        this.inputType = 'text';
      }else{
        this.inputType = 'password';
      }
      
    },  
    openDialog() {
      this.visible = true;
      this.init = true;
      this.enterpriseName = this.tenantInform.tenantList[0].tenantName
    },
    // 切换企业
    async submit() {
      try {
        if(!this.form.password){
           Platform.notification({
            type: "error",
            title: "请输入密码",
          });
          return;
        }   
        let params = {};   
        params.ua = this.form.ua;
        params.mode = this.form.mode;
        params.tenantId = this.form.tenantId;
        params.password = md5(this.form.password);

        const { status,message } = await http.post("/account/login",params,false);
        if (status == 0) {
          Platform.notification({
            type: "success",
            title: "切换成功",
          });
          this.init = false;
          this.visible = false;
          this.form.password = "";
          location.reload()
        }else{
          Platform.notification({
            type: "error",
            title: message,
          });
        }
      } catch (e) {
        console.error("err", e);
      }
    },
  },
};
</script>
<style lang="scss">
.switchcompanies-dialog {
  .base-modal-body {
    padding: 10px 30px 0;
  }
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-bottom: 20px;
    padding-top: 20px;
  }
  .form-builder {
    label {
      display: none;
    }
  }
  .el-input{
    height: 40px;
    .el-input__inner{
      height: 40px;
    }
    .show_icon{
      width: 18px;
      margin-top: 15px;
      margin-right: 5px;
    }
  }
  .swiper-container {
    width: 100%;
    height: 100%;
    margin-bottom: 15px;
  }
  .swiper-slide {
    text-align: center;
    font-size: 18px;
    background: #fff;

    /* Center slide text vertically */
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
    transition: 300ms;
    transform: scale(0.8);
    width: 91px;
    height: 75px;
    text-align: center;
  }
  .swiper-slide img {
    width: 72px;
    height: 72px;
    border-radius: 8px;
  }
  .swiper-slide-active,
  .swiper-slide-duplicate-active {
    transform: scale(1);
  }
  .brand-right {
    width: 25px;
  }
  .brand-left {
    width: 25px;
  }
  .swiper-button-next{
    outline: none;
  }
  .swiper-button-prev{
    outline: none;
  }
  .swiper-button-next::after,
  .swiper-button-prev::after {
    content: "";
  }
  .enterprises_choose .choose_tit {
    font-size: 16px;
    color: #666;
    text-align: center;
    margin-bottom: 20px;
  }
  .enterprise_name {
    font-size: 16px;
    color: #666;
    text-align: center;
    margin-bottom: 25px;
  }
  .swiper-slide {
    opacity: 0.3;
    cursor: pointer;
  }
  .swiper-slide-active {
    opacity: 1;
  }
}


</style>