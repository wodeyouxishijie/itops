<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentId" value="<%=data.id%>"/>
    <%if (op == 1) {%><button cmd="del" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>
    <div class="drawer">
        <ul class="dialog">
  
  
            <li class="clearfix">
                <label class="bind-domain-title"></label>
                <span class="input-text"><input class="input" value="<%=data.name%>" type="text" id="iptName" placeholder="输入角色名称"></span>  
                <div class="input_tips">输入角色名称</div>
            </li>
                        
            <li class="clearfix">
                <label class="bind-domain-title">角色权限：</label>
                <div id="menuPowerList"></div>
                <span class="input-text"></span>  
            </li>
                        
            <li class="clearfix">
                <label class="bind-domain-title"></label>
                <textarea class="input" type="text" id="iptNote" placeholder="输入角色描述"><%=data.note%></textarea>  
                <div class="input_tips">输入角色描述</div>
            </li>

  
              <li class="current_status">
                <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>
              </li>
        </ul>
</div></div>