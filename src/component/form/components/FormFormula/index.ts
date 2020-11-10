import FormFormulaSetting from './FormFormulaSetting.vue';
import FormFormulaPreview from './FormFormulaPreview.vue';
import FormFormula from './FormFormula.vue';

import FormNumber from './../FormNumber/FormNumber.vue';

let FormCalculationFormulaField = {
  // 字段类型
  formType: 'formula',
  name: '计算公式',
  isSystem: 0,
  component: {
    setting: FormFormulaSetting,
    preview: FormFormulaPreview,
    build: FormFormula,
    extend: {
      'formula_search': FormNumber
    }
  }
};

export default FormCalculationFormulaField