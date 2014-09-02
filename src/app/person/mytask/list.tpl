<a class="btn" href="#" cmd="addNew">新增</a>

<table class="table table-condensed table-bordered table-striped table-nowrap" data-event="edit_mytasking">
    <thead>
      <tr>
        <th>标题</th>
        <th>所属类别</th>
        <th>创建日期</th>
        <th>录入者</th>
        <th>最后更新日期</th>
        
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        <td><a taskingid="<%=data[i].id%>" href="#" src="main"><%=data[i].title%></a></td>
        <td><%=data[i].typename%></td>
        <td><%=data[i].create_time%></td>
        <td><%=data[i].adduser_cnname%> </td>
        <td><%=data[i].last_modify_time%></td>
        
      </tr>
        <%}%>
    </tbody>
</table>
<div id="employee_task_list"></div>