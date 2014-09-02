<ul class="nav nav-tabs nav_tabs_mod1">
  <li class="active hide">
    <a href="#" cmd="new_report">未处理</a>
  </li>
<li class="active">
    <a href="#" cmd="process_report">待处理</a>
  </li>
    <li class="hide">
    <a href="#" cmd="process_ing">处理中/已分派</a>
  </li>
  <li><a href="#" cmd="done_report">已完成</a></li>
</ul>
<table class="table table-condensed table-bordered table-striped" data-event="edit_todo">
    <thead>
      <tr>
        <th>标题</th>
        <th>报修人</th>
        <th>报修人科室</th>
        <th>处理人员</th>
        <th>完成人</th>
        <th>提单时间</th>
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
        <td><%=data[i].process_cnname%></td>
        <td><%=data[i].done_cnname%></td>
        <td><%=data[i].create_time%></td>
        <td><%=data[i].apply_time%></td>
        <td><%=data[i].statusname%></td>
        <td><%=data[i].gradename%></td>
        <td><%=data[i].typename%></td>
      </tr>
        <%}%>
    </tbody>
</table>