<ul class="nav nav-tabs nav_tabs_mod2">
    <li class="active">
        <a href="#" cmd="process_software">待处理</a>
      </li>
      <li><a href="#" cmd="done_software">已完成</a></li>
    </ul>
    
    <a class="btn hide" href="#" cmd="addNew">新增</a>

    <table class="table table-condensed table-bordered table-striped" data-event="edit_software_report_todo">
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
            <%for (var i = 0; i < software_data.length; i++) {%>
          <tr>
            <td><a reportid="<%=software_data[i].id%>" href="#"><%=software_data[i].title%></a></td>
            <td><%=software_data[i].op_username%></td>
            <td><%=software_data[i].dept_name%></td>
            <td><%=software_data[i].cnname%></td>
            <td><%=software_data[i].apply_time%></td>
            <td><%=software_data[i].statusname%></td>
          </tr>
            <%}%>
        </tbody>
    </table>