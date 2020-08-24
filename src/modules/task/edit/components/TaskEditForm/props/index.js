export default {
  fields: {
    type: Array,
    default: () => []
  },
  types:{
    type: Array,
    default: () => []
  },
  value: {
    type: Object,
    required: true,
    default: () => ({})
  },
}