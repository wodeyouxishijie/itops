<a class="btn" href="#" id="newDept">新增</a>

<table class="table table-condensed table-bordered table-striped" data-event="edit_dept">
    <thead>
      <tr>
        <th>部门名称</th>
        <th>部门编码</th>
        <th>上级部门</th>
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        <td><a deptid="<%=data[i].id%>" href="#"><%=data[i].name%></a></td>
        <td><%=data[i].codes%> </td>
        <td><%=data[i].parentname%></td>
      </tr>
        <%}%>
    </tbody>
</table>