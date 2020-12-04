/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
/* mixin */
import fieldMixin from '@src/mixins/fieldMixin';
import FormDesignMixin from '@src/mixins/formDesign';
/* util */
import * as FormUtil from '@src/component/form/util';

export default {
  mixins: [fieldMixin, FormDesignMixin],
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      init: false,
      pending: false,
      fields: [],
    }
  },
  methods: {}
}
