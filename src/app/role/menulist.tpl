<ul class="role_power_ul">
    <% for (var i = 0; i < data.length; i++) {%>
       <li><label><input type="checkbox" <%if (data[i].checked) {%>checked<%}%> value="<%=data[i].menuid%>" /><%=data[i].menuname%></label></li>
    <%}%>
</ul>