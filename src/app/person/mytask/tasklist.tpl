<%if (data.length > 0) {%>
<table class="table table-condensed table-bordered table-striped table-nowrap" data-event="edit_mytasking">
    <thead>
      <tr>
        <th>标题</th>
        <th>所属类别</th>
        <th>创建日期</th>
        <th>录入者</th>
        <th>最后更新日期</th>
        <th>状态</th>
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        <td><a taskingid="<%=data[i].id%>" src="employee" href="#"><%=data[i].title%></a></td>
        <td><%=data[i].typename%></td>
        <td><%=data[i].create_time%></td>
        <td><%=data[i].adduser_cnname%> </td>
        <td><%=data[i].last_modify_time%></td>
        <td><%=data[i].statusname%></td>
      </tr>
        <%}%>
    </tbody>
</table>
<%} else {%>
<font size="5"><%=cnname%></font>还没有提交任何任务，您可以<a href="">邮件提醒</a>
<%}%>