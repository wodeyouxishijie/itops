<div><span class="label label-info"><%=typename%></span></div>
<a class="btn" href="#" cmd="addNew">新增</a>
<div cmd="new_con" class="hide new_con">
    <form class="form-inline">
      <input type="text" class="" cmd="value" placeholder="输入名称">
      <button cmd="save" type="submit" class="btn btn-primary">保存</button>
</form>
</div>
<table class="table table-condensed table-bordered table-striped" data-event="key_value_list">
    <thead>
      <tr>
        <th>id</th>
        <th>值</th>
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        <td><%=data[i].id%></td>
        <td><div class="name_relative">
            <span class="text" cmd="txt_<%=data[i].id%>"><%=data[i]._value%></span>
            <div class="form-inline edit_panel hide">
                <input type="text" value="<%=data[i]._value%>" cmd="value_<%=data[i].id%>" placeholder="输入名称">
                <button cmd="save_row" keyid="<%=data[i].id%>" type="submit" class="btn btn-primary">保存</button>
                <button cmd="del_row" keyid="<%=data[i].id%>" type="submit" class="btn btn-danger">删除</button>
            </div>
        </div></td>
      </tr>
        <%}%>
    </tbody>
</table>