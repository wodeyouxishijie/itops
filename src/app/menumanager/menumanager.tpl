<a class="btn" href="#" id="newMenu">新增</a>

    <table class="table table-condensed table-bordered table-striped" data-event="edit_menu">
        <thead>
          <tr>
            <th>菜单名称</th>
            <th>处理模块</th>
            <th>上级菜单</th>
          </tr>
        </thead>
        <tbody>
            <%for (var i = 0; i < data.length; i++) {%>
          <tr>
            <td><a menuid="<%=data[i].menuid%>" href="#"><%=data[i].menuname%></a></td>
            <td><%=data[i].menulink%> </td>
            <td><%=data[i].parentname%></td>
          </tr>
            <%}%>
        </tbody>
      </table>