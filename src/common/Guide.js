

import guideCompoment from '@src/component/guide/Guide';

import { storageGet, storageSet } from '@src/util/storage';

import GrayUtil from '@src/util/gray';

import Vue from 'vue';

// <div id="guide-test"></div>
// this.$nextTick(()=>{
//   this.$Guide([{
//     content:
// '步骤1',
//     haveStep: true,
//     nowStep: 1,
//     gStyle: 'top:35px',
//     id: 'guide-test',
//     finishBtn: 'OK',
//     needCover:true,
//     diyContent:true,
//     diyContentDom:组件名称
//   }, {
//     content:
// '步骤2',
//     haveStep: true,
//     nowStep: 2,
//     gStyle: 'top:35px',
//     id: 'guide-test',
//     finishBtn: 'OK',
//   }], 0, '', (e)=>{
//     return new Promise((resolve, reject)=>{
//       resolve()
//     })
//   }).create()
// })
class Guide {
  constructor(arr = [], nowStep, storageKe, watchStepFn) {
    this.arr = arr;
    this.nowStep = nowStep;
    this.storageKe = storageKe;
    this.stopStep = () => {
      return new Promise((resolve, reject) => {
        if (watchStepFn)
          return watchStepFn({ type: 'stop', nowStep: this.nowStep }).then(
            (res) => {
              if (storageKe) storageSet(storageKe, arr.length);
              resolve();
            }
          );

        if (storageKe) storageSet(storageKe, arr.length);
        resolve();
      });
    };
    this.finishBtnFn = () => {
      return this.stopStep();
    };
    this.previousStep = () => {
      return new Promise((resolve, reject) => {
        if (this.nowStep == 0) reject();
        if (watchStepFn)
          return watchStepFn({ type: 'pre', nowStep: this.nowStep }).then(
            (res) => {
              this.nowStep--;
              this.create();
              resolve();
            }
          );
        this.nowStep--;
        this.create();
        resolve();
      });
    };
    this.nextStep = () => {
      return new Promise((resolve, reject) => {
        if (this.nowStep == this.arr.length - 1) reject();
        if (watchStepFn)
          return watchStepFn({ type: 'next', nowStep: this.nowStep }).then(
            (res) => {
              this.nowStep++;
              this.create();
              resolve();
            }
          );
        this.nowStep++;
        this.create();
        resolve();
      });
    };
    this.watchContentClick = (e) => {
      if (watchStepFn) {
        return watchStepFn({
          type: 'contentClick',
          nowStep: this.nowStep,
          event: e,
        });
      }
    };
  }
  create() {
    return new Promise((resolve, reject) => {
      let obj = this.arr[this.nowStep];
      let Test;
      if (obj.diyContentDom) {
        Test = obj.diyContentDom;
      }

      let _this = this;

      const guideDom = {
        render(h) {
          return (
            <guide-compoment
              totalStep={_this.arr.length}
              canUse={obj.canUse}
              inside={obj.inside}
              nowStep={obj.nowStep}
              title={obj.title}
              content={obj.content}
              needCover={obj.needCover}
              finishBtn={obj.finishBtn}
              gStyle={obj.gStyle}
              id={obj.id}
              domId={obj.domId}
              domObj={obj.domObj}
              diyContent={obj.diyContent}
              haveStep={obj.haveStep}
              stopStep={_this.stopStep}
              finishBtnFn={_this.finishBtnFn}
              watchContentClick={_this.watchContentClick}
              nextStep={_this.nextStep}
              copyDom={obj.copyDom}
            >
              <template slot="diyContent">
                <Test />
              </template>
            </guide-compoment>
          );
        },
        components: {
          [guideCompoment.name]: guideCompoment,
          Test,
        },
      };
      let GuideCompoments = Vue.extend(guideDom);
      new GuideCompoments().$mount(`#${obj.id}`);
      resolve(true);
    });
  }
  destroy(id) {
    try {
      let dom = document.getElementById(`${id}`);
      dom.remove();
    } catch (error) {
      console.warn(error, 'error try catch');
    }
  }
}

function domGuide(arr = [], nowStep, storageKe, watchStepFn) {
  if(!arr || arr.length <= 0){
    return {
      create: () => {
        return Promise.resolve(false)
      },
      destroy: () => {},
    };
  }
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  let guideType;
  try {
    guideType = arr[0].id.split('-')[0]
  } catch (error) {
    console.warn(error, 'error try catch');
  }
  if ((productPreFixedPath && guideType == 'product') || guideType != 'product') {
    return new Guide(arr, nowStep, storageKe, watchStepFn);
  }
  
}

export default domGuide;
