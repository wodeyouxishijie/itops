<a class="btn" href="#" cmd="addNew">新增</a>

<table class="table table-condensed table-bordered table-striped" data-event="edit_role">
    <thead>
      <tr>
        <th>角色名称</th>
        <th>拥有菜单</th>
        <th>描述</th>
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        <td><a roleid="<%=data[i].id%>" href="#"><%=data[i].name%></a></td>
        <td style="width:60%;"><%=data[i].power_names%> </td>
        <td><%=data[i].note%></td>
      </tr>
        <%}%>
    </tbody>
</table>