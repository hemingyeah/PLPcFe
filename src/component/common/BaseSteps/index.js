import BaseSteps from './BaseSteps.vue';

BaseSteps.install = function (Vue) {
  Vue.component(BaseSteps.name, BaseSteps);
}

export default BaseSteps;