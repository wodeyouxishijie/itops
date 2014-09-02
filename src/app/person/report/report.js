// use sea

var $ = require('$');
var login = require('login');
var event = require('event');
var util = require('util');
var dialog = require('dialog');
var manager = require('manager');
var slidepanel = require('widget/slidepanel/slidepanel');
var app_util = require('main/app_util');
var dept = require('app/dept/dept');
var user = require('app/user/user');
var ve = require('editor/ve');

var query = {};
event.addCommonEvent('click', {
	'report-type-nav': (function () {
		var last;
		return function (evt) {
			var el = evt.target;
			if (el.nodeName != 'A') {
				return;
			}
			if (last) {
				last.parent().removeClass('active');
			}
			last = $(el);
			query.typeid = last.data('typeid');
			query.title = last.text();
			initReport(query, function () {
				last.parent().addClass('active');
			});
			return false;
		}
	}) (),

	'report-date-nav': (function () {
		var last;
		return function (evt) {
			var el = evt.target;
			if (el.nodeName != 'A') {
				return;
			}
			if (last) {
				last.parent().removeClass('active');
			}
			last = $(el);
			query.day = last.data('date');
			initReport(query, function () {
				last.parent().addClass('active');
			});
			return false;
		}
	}) ()
});

function initPage() {
	manager.getKeyValue({type: 3}, function (list) {
        initNav(list);
    });
}

function initNav(list) {
	var tpl = <Template.failure_type_nav>;
	var html = util.tmpl(tpl, {list: list});
	container.html(html);
}

function initReport(query, callback) {
	var reportContainer = $('report_chart');
	if ('undefined' == typeof Highcharts) {
		$.getScript('/dest/highcharts.src.js', getReportData);
	}
	else {
		getReportData ();
	}
	function getReportData() {
		var title = query.title;
		manager.getReportData(query, function (list) {
			var labels = [], vals = [];

			for (var i in list) {
				labels.push(i);
				vals.push(list[i]);
			}
			// labels = labels.slice(0, 7);
			// vals = vals.slice(0, 7);
			$('#report_chart').html('');
			chart = new Highcharts.Chart({ 
		        chart: { 
		            renderTo: 'report_chart',
		            zoomType: 'x'
		        }, 
		        title: { 
		            text: '统计图 - ' + title //图表标题 
		        }, 
		        subtitle: { 
		            text: 'IT运维系统'   //图表副标题 
		        }, 
		        credits: { 
		            enabled: false   //不显示LOGO 
		        }, 
		        xAxis: { //X轴标签 
		            categories: labels, 
		            labels: { 
		                rotation: -45,  //逆时针旋转45°，标签名称太长。 
		                align: 'right'  //设置右对齐 
		            } 
		        }, 
		        yAxis: { //设置Y轴-第二个（金额） 
		            title: {text: ''},//Y轴标题设为空 
		            labels: { 
		                formatter: function() {//格式化标签名称 
		                    return this.value;// + ' 万亿元'; 
		                }, 
		                style: { 
		                    color: '#4572A7' //设置标签颜色 
		                } 
		            } 
		 
		        }, 
		        tooltip: { //鼠标滑向数据区显示的提示框 
		            formatter: function() {  //格式化提示框信息 
		                return '' + this.x + ': ' + this.y + ' 次'; 
		            } 
		        }, 
		        legend: { //设置图例 
		            layout: 'vertical', //水平排列图例 
		            shadow: true,  //设置阴影 
		            align: 'left',
		            verticalAlign: 'top',
		            floating: true,
		            backgroundColor: '#ffffff'
		        }, 
		        series: [{  //数据列 
		            name: title, 
		            color: '#4572A7', 
		            type: 'column', 
		            data: vals 
		        }] 
		    }); 
			
			callback && callback();
		});
	}
}

var wrap = {
    render: function () {
        container = $('#mainContainer');
        var param = {};
        initPage();
    }
};
module.exports = wrap;