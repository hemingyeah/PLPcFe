import guideCompoment from '@src/component/guide/Guide';

import { storageGet, storageSet } from '@src/util/storage';

import Vue from 'vue';

// <div id="guide-test"></div>
// this.$nextTick(()=>{
//   this.$Guide("guide-test", [{
//     content:
// "步骤1",
//     haveStep: true,
//     nowStep: 1,
//     totalStep: 2,
//     gStyle: "top:35px",
//     id: "guide-test",
//     arrowStyle: "left:-140px",
//     onlyOne: true,
//     finishBtn: "OK",
//   }, {
//     content:
// "步骤2",
//     haveStep: true,
//     nowStep: 2,
//     totalStep: 2,
//     gStyle: "top:35px",
//     id: "guide-test",
//     arrowStyle: "left:-140px",
//     onlyOne: true,
//     finishBtn: "OK",
//   }], 0, "", (e)=>{
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
        if (!storageKe) resolve();
        if (watchStepFn)
          return watchStepFn({ type: 'stop', nowStep: this.nowStep }).then(
            (res) => {
              storageSet(storageKe, arr.length);
              resolve();
            }
          );

        storageSet(storageKe, arr.length);
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
  }
  create() {
    let GuideCompoments = Vue.extend(guideCompoment);
    let obj = this.arr[this.nowStep];
    new GuideCompoments({
      data() {
        return {};
      },
      propsData: {
        ...obj,
        stopStep: this.stopStep,
        finishBtnFn: this.finishBtnFn,
      },
      methods: {
        previousStep: this.previousStep,
        nextStep: this.nextStep,
      },
    }).$mount(`#${obj.id}`);
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
  return new Guide(arr, nowStep, storageKe, watchStepFn);
}

export default domGuide;
