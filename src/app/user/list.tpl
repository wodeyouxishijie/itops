<a class="btn" href="#" cmd="addNew">新增</a>
<form class="form-search">
  <div class="input-append">
    <input type="text" class="span2 search-query" style="width:200px;" id="user_query" placeholder="输入关键字">
    <button type="submit" class="btn" id="search_user">搜索</button><label id="show_tips"></label>
  </div>
</form>

<table class="table table-condensed table-bordered table-striped" data-event="edit_user">
    <thead>
      <tr>
        <th>用户工号</th>
        <th>中文名</th>
        <th>所在部门</th>
        <th>所属角色</th>
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        <td><a userid="<%=data[i].id%>" href="#"><%=data[i].user_id%></a></td>
        <td><%=data[i].cnname%> </td>
        <td><%=data[i].deptname %></td>
        <td><%=data[i].rolename%></td>
      </tr>
        <%}%>
    </tbody>
</table>
<div id="pagging_info"></div>