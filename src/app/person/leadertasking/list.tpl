<a class="btn" href="#" cmd="addNew">新增</a>
<ul class="nav nav-tabs">
  <li class="active">
    <a href="#" cmd="new_report">未处理</a>
  </li>
    <li>
    <a href="#" cmd="process_report">处理中</a>
  </li>
  <li><a href="#" cmd="done_report">已完成</a></li>
</ul>
<table class="table table-condensed table-bordered table-striped" data-event="edit_leadertasking">
    <thead>
      <tr>
        <th>标题</th>
        <th>所属类别</th>
        <th>创建日期</th>
        <th>相关科室</th>
        
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>
        <td><%=data[i].typename%></td>
        <td><%=data[i].create_time%></td>
        <td><%=data[i].related_dept_name%> </td>
        
      </tr>
        <%}%>
    </tbody>
</table>