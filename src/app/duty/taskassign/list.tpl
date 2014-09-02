<a class="btn" href="#" cmd="addNew">新增</a>
<ul class="nav nav-tabs">
  <li class="active">
    <a href="#" cmd="new_report">未处理</a>
  </li>
    <li>
    <a href="#" cmd="process_report">已分派</a>
  </li>
  <li><a href="#" cmd="done_report">已完成</a></li>
</ul>
<table class="table table-condensed table-bordered table-striped" data-event="edit_tasking">
    <thead>
      <tr>
        <th>标题</th>
        <th>报修人</th>
        <th>报修人科室</th>
        <th>申报日期</th>
        <th>处理人</th>
        <th>完成人</th>
        <th>完成时间</th>
        <th>状态</th>
        <th>紧急程度</th>
        <th>故障类别</th>
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>
        <td><%=data[i].cnname%> </td>
        <td><%=data[i].dept_name%></td>
        <td><%=data[i].create_time%></td>
        <td><%=data[i].process_cnname%></td>
        <td><%=data[i].done_cnname%></td>
        <td><%=data[i].end_time%></td>
        <td><%=data[i].statusname%></td>
        <td><%=data[i].gradename%></td>
        <td><%=data[i].typename%></td>
      </tr>
        <%}%>
    </tbody>
</table>
<div  class="pagination" data-event="tasking-page">
  <ul>
  <% if (page.pc > 0) {%>
  <%  for (var i = 0; i < page.pc; i++) {%>
        <% if (i == page.cp) {%>
        <li class="active"><a href="#" ><%= (i + 1)%></a></li>
        <%} else {%>
        <li><a href="#"  data-page="<%=i%>"><%= (i + 1)%></a></li>
        <%}%>
  <%  }%>
  <%}%>
</ul>
</div>