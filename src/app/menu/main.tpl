<div class="row-fluid">
    <div class="span2" style="width:200px" data-event="nav">
        <% if (data.length > 0) {%>
            
            <% for (var i = 0; i < data.length; i++) {%>
      <div class="well sidebar-nav" style="">
          <!--这里是左边的菜单导航-->
        
        <ul class="nav nav-list menu_list" pid="<%=data[i].menuid %>">
                <li class="nav-header" style=""><%=data[i].menuname %></li>
          
        </ul>
                
          <!--左边导航结束-->
      </div><!--/.well -->
    <%}%>
        <%} else if (type == 1){%> 
            
        <%}%>
    </div><!--/span-->
    <div class="span10" id="mainContainer" style="margin-left:10px;">
      <div class="hero-unit">
            <h1>欢迎使用</h1>
            <p>hello</p>
            <p></p>
          </div>
    </div><!--/span-->
  </div><!--/row-->

  <hr>

  <footer>
    <p></p>
  </footer>