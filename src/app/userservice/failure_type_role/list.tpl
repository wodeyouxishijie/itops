<div><span class="label label-info"><%=typename%></span></div>

<table class="table table-condensed table-bordered table-striped" data-event="key_value_list">
    <thead>
      <tr>
        <th>故障类别</th>
        <th>角色</th>
      </tr>
    </thead>
    <tbody>
        <%for (var i = 0; i < data.length; i++) {%>
      <tr>
        <td>
            <span class="text" cmd="txt_<%=data[i].id%>"><%=data[i]._value%></span>
        </td>
        <td>
            <div class="type_<%=data[i].id%>"></div>
        </td>
      </tr>
        <%}%>
    </tbody>
</table>