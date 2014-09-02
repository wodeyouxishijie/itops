<ul class="nav nav-pills" data-event="report-type-nav">
	<% for (var i = 0; i < list.length; i++) {%>
  <li class=""><a href="#" data-typeid="<%=list[i].id%>"><%=list[i]._value%></a></li>
  <%}%>
</ul>
<ul class="nav nav-pills" data-event="report-date-nav">
  <li class=""><a href="#" data-date="7">近7天</a></li>
  <li class=""><a href="#" data-date="31">近一个月</a></li>
  <li class=""><a href="#" data-date="62">近两个月</a></li>
</ul>
<div id="report_chart" >
</div>