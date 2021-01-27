export const PickerOptions = {
  shortcuts: [{
    text: '今日',
    onClick(picker: any) {
      const end = new Date();
      const start = new Date();
      picker.$emit('pick', [start, end]);
    }
  }, {
    text: '昨日',
    onClick(picker: any) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
      end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
      picker.$emit('pick', [start, end]);
    }
  }, {
    text: '最近7天',
    onClick(picker: any) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      picker.$emit('pick', [start, end]);
    }
  }, {
    text: '最近30天',
    onClick(picker: any) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      picker.$emit('pick', [start, end]);
    }
  }]
}