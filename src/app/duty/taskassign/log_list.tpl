<% for (var i=0;i<data.length;i++){%>
<div style="padding:20px;border:1px solid #ccc; margin:5px;width:400px;">
    <div style="font-size:14px;"><%=data[i].note%></div>
    <div style="margin:5px 0 0 20px;font-size:12px;color:#666;"><%=data[i].op_user_cnname%>&nbsp;&nbsp;在&nbsp;&nbsp;<%=data[i].last_modify_time%>&nbsp;&nbsp;最后处理为<%=data[i].cstatusname%><%if (data[i].cstatus != 74 && i == data.length - 1) {%>,当前处理人为<%=data[i].process_user_cnname%><%}%></div>
</div>
<%}%>