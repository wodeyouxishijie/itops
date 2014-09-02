<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentMenuId" value="<%=data.menuid%>"/>
    <%if (op == 1) {%><button cmd="del" menuid="<%=data.menuid%>"><i class="icon-remove"></i>删除</button><%}%>
    <div class="drawer">
        <ul class="dialog">
  
          <li class="clearfix">
              <div class="btn-toolbar" style="margin: 0;">
                  <div class="btn-group">
                    <button id="menuParent" class="btn dropdown-toggle" data-toggle="dropdown" parentid="<%=data.menuparent%>"><%=data.parentname%> <span class="caret"></span></button>
                    <ul class="dropdown-menu" data-event="parent">
                        <%=roothtml%>
                    </ul>
                                
                  </div><!-- /btn-group -->
                
            </div>
            <div class="input_tips">选择菜单的上级菜单</div>
          </li>
  
            <li class="clearfix">
                <label class="bind-domain-title"></label>
                <span class="input-text"><input class="input" value="<%=data.menuname%>" type="text" id="menuName" placeholder="输入菜单名称"></span>  
                <div class="input_tips">输入菜单名称</div>
            </li>
                        
            <li class="clearfix">
                <label class="bind-domain-title"></label>
                <span class="input-text"><input class="input" value="<%=data.menulink%>" type="text" id="menuLink" placeholder="输入菜单地址"></span>  
                <div class="input_tips">输入菜单地址</div>
            </li>
                        
            <li class="clearfix">
                <label class="bind-domain-title"></label>
                <textarea class="input" type="text" id="menuNote" placeholder="输入菜单描述"><%=data.menunonte%></textarea>  
                <div class="input_tips">输入菜单描述</div>
            </li>

  
              <li class="current_status">
                <a href="javascript:void 0;" id="saveMenu" class="btn btn-primary">确定</a>
              </li>
        </ul>
</div></div>