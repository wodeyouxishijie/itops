<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentDeptId" value="<%=data.id%>"/>
    <%if (op == 1) {%><button cmd="del" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>
    <div class="drawer">
        <ul class="dialog">
  
          <li class="clearfix">
              <div class="btn-toolbar" style="margin: 0;">
                  <div class="btn-group">
                    <button id="deptParent" class="btn dropdown-toggle" data-toggle="dropdown" parentid="<%=data.parent%>"><%=data.parentname%> <span class="caret"></span></button>
                    <ul class="dropdown-menu" data-event="dept-parent">
                        <%=roothtml%>
                    </ul>
                                
                  </div><!-- /btn-group -->
                
                </div>
                <div class="input_tips">选择部门的上级部门</div>
          </li>
  
            <li class="clearfix">
                <label class="bind-domain-title">部门名称</label>
                <span class="input-text"><input class="input" value="<%=data.name%>" type="text" id="deptName" placeholder="输入部门名称"></span>  
                <div class="input_tips">输入部门名称</div>
            </li>
                        
            <li class="clearfix">
                <label class="bind-domain-title">部门编码</label>
                <span class="input-text"><input class="input" value="<%=data.codes%>" type="text" id="deptCodes" placeholder="输入部门编码"></span>  
                <div class="input_tips">输入部门编码</div>
            </li>
                 
            <li class="clearfix">
                <label class="bind-domain-title">部门负责人1</label>
                <input value="<%=data.leader1_id%>" type="hidden" id="deptLeader1">
                <span class="input-text"><input class="input" value="<%=data.leader1_cnname%>" type="text" id="deptLeader1Name" placeholder="部门负责人1"></span>  <a href="#" data-event="clear_leader" data-for="deptLeader1">清除</a>
                <div class="input_tips">部门负责人1</div>
            </li>
                  
            <li class="clearfix">
                <label class="bind-domain-title">部门负责人2</label>
                <input value="<%=data.leader2_id%>" type="hidden" id="deptLeader2">                
                <span class="input-text"><input class="input" value="<%=data.leader2_cnname%>" type="text" id="deptLeader2Name" placeholder="部门负责人2"></span>  <a href="#" data-event="clear_leader" data-for="deptLeader2">清除</a>
                <div class="input_tips">部门负责人2</div>
            </li> 
                  
            <li class="clearfix">
                <label class="bind-domain-title"></label>
                <textarea class="input" type="text" id="deptNote" placeholder="输入部门描述"><%=data.ext%></textarea>  
                <div class="input_tips">输入部门描述</div>
            </li>

  
              <li class="current_status">
                <a href="javascript:void 0;" id="saveDept" class="btn btn-primary">确定</a>
              </li>
        </ul>
</div></div>