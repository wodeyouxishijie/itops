<% for (var i=0;i<data.length;i++){%>
<div style="padding:5px 0;border-bottom:1px solid #ccc;">
    <div><%=data[i].note%></div>
    <div><i><%=data[i].op_user_cnname%></i>在<i><%=data[i].last_modify_time%></i>最后处理为<i><%=data[i].cstatusname%></i><%if (data[i].cstatus != 74 && i == data.length - 1) {%>,当前处理人为<i><%=data[i].process_user_cnname%></i><%}%></div>
</div>
<%}%>