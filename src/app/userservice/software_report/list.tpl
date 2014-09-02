<a class="btn" href="#" cmd="addNew">新增</a>

<table class="table table-condensed table-bordered table-striped table-nowrap" data-event="edit_software_report">
    <thead>
      <tr>
        <th>标题</th>
        <th>提单者</th>
        <th>相关科室</th>
        <th>相关联系人</th>
        <th>申请日期</th>
        <th>状态</th>
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>
        <td><%=data[i].op_username%></td>
        <td><%=data[i].dept_name%></td>
        <td><%=data[i].cnname%></td>
        <td><%=data[i].apply_time%></td>
        <td><%=data[i].statusname%></td>
      </tr>
        <%}%>
    </tbody>
</table>