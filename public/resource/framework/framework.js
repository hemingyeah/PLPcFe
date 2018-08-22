var currentFrameHistoryUrl = "";//返回到哪个url界面
var currentFrameId = "";//当前所处的currentFrameId
//返回操作
function backOperater() {
  window.history.back();
}

$(function () {
  //设置页面input:text 输入长度小于100
  $("input:text").attr("maxlength", 50);

  $("input:text#displayName.maxlength-6").attr("maxlength", 6);
  $("input:text.codelength").attr("maxlength", 120);

  $("textarea").attr("maxlength", 500);
  $("input:text[placeholder='同时添加多个以逗号（英文）分隔']").attr("maxlength", 50);
  $("input:text[placeholder='同时添加多个以逗号（英文）分隔']").attr("placeholder", '同时添加多个以逗号（英文）分隔[最多50字]');
  //日期选择初始化
  $('.publink_date').datetimepicker(
    {
      format: 'yyyy-mm-dd',
      language: 'zh-CN',
      minView: '3',
      autoclose: true
    }
  ).on("changeDate", function (e) { $(e.target).trigger("validate"); });

  var startDate = new Date();
  var hours = startDate.getHours();
  if (startDate.getMinutes() > 45) {
    startDate.setHours(hours + 1);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
  }

  $('.publink_datetime').datetimepicker({
    format: 'yyyy-mm-dd hh:ii:00',
    language: 'zh-CN',
    minView: '0',
    autoclose: true,
    minuteStep: 15,
    startDate: startDate
  }).on("changeDate", function (e) {
    $(e.target).trigger("validate");
  });
  $("#sizeSelect").change(function () {
    var pageSize = $(this).val();
    $(":hidden[name=pageSize]").val(pageSize);
    $(":hidden[name=pageNum]").val(1);
    $("#mainForm").trigger('submit')

  })
  $("[page-index]:not('.disabled')").click(function () {
    var pageNo = $(this).attr("page-index");
    $(":hidden[name=pageNum]").val(pageNo);
    $("#mainForm").trigger('submit')
  });

  /**
   * table-select  tab中点击tr选中该行
   * @auhtor dongls
   */
  $(".table-select>tbody").on("click", "tr", function () {
    var tr = $(this);
    if (tr.attr('data-select') == 'select') {
      tr.removeAttr('data-select').find("input[type='checkbox']").prop("checked", false);
    } else {
      tr.attr("data-select", "select").find("input[type='checkbox']").prop("checked", true);
      tr.siblings().removeAttr("data-select").find("input[type='checkbox']").prop("checked", false);
    }
  });
});


function sortBy(sortBy) {
  $("[name='sortBy']").val(sortBy);
  var direction = $("[name='direction']");
  if (direction.val() == "") {
    direction.val("asc");
  }
  if (direction.val() == "asc") {
    direction.val("desc");
  }
  else {
    direction.val("asc");
  }

  $("#mainForm").submit();
}


$.fn.datepicker.dates["zh-CN"] = {
  days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
  daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
  months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
  monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
  today: "今日",
  suffix: [],
  meridiem: ["上午", "下午"],
  format: "yyyy-mm-dd" /*控制显示格式,默认为空，显示小时分钟*/
};

//毫秒格式化为正常时间(oldDate毫秒时间，isContainTime是否包含日期)
function millisecondToLocalDate(oldDate, isContainTime) {
  var oDate = new Date(oldDate * 1);
  var oYear = oDate.getFullYear();
  var oMonth = oDate.getMonth() + 1;
  var oDay = oDate.getDate();
  var oHour = oDate.getHours();
  var oMin = oDate.getMinutes();
  var oSen = oDate.getSeconds();
  if (oMonth < 10) {
    oMonth = "0" + oMonth;
  }
  if (oDay < 10) {
    oDay = "0" + oDay;
  }
  if (oHour < 10) {
    oHour = "0" + oHour;
  }
  if (oMin < 10) {
    oMin = "0" + oMin;
  }
  if (oSen < 10) {
    oSen = "0" + oSen;
  }
  if (isContainTime) {
    return oYear + '-' + oMonth + '-' + oDay + ' ' + oHour + ':' + oMin + ':' + oSen;//最后拼接时间
  } else {
    return oYear + '-' + oMonth + '-' + oDay;
  }
}