// @ts-ignore
import BaseCalculationFormula from './BaseCalculationFormula.tsx';

// @ts-ignore
BaseCalculationFormula.install = function(Vue: any){
  Vue.component(BaseCalculationFormula.name, BaseCalculationFormula);
};

export default BaseCalculationFormula