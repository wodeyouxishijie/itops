<a class="btn" href="#" cmd="addNew">新增</a>

<table class="table table-condensed table-bordered table-striped" data-event="edit_vacation">
    <thead>
      <tr>
        <th>标题</th>
        <th>申请人</th>
        <th>类别</th>
        <th>开始时间</th>
        
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        
        <td><a reportid="<%=data[i].id%>" href="#"><%=data[i].title%></a></td>
        <td><%=data[i].role_name%></td>
        <td><%=data[i].typename%></td>
        <td><%=data[i].start_time%></td>
      </tr>
        <%}%>
    </tbody>
</table>