<div>
	<%if (data.length > 0) {%>
	<h4>相关任务</h4>
	<div class="nav">
	<%for (var i = 0; i < data.length; i++) {%>
		<span href="#" data-id="<%=data[i].id%>" class="user_list"><%=data[i].cnname%></span>
	<%}%>
	</div>
	<div id="employeetasklist"></div>
	<%}%>
</div>