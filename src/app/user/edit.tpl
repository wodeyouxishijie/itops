<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentId" value="<%=data.id%>"/>
    <%if (op == 1) {%><button cmd="del" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>
    <div class="form-horizontal">
        <ul class="dialog">
  
  
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">用户工号</label>
                    <div class="controls"><input class="input" value="<%=data.user_id%>" type="text" id="iptUserID" placeholder="用户工号"></div>  
                    <div class="input_tips"></div>
                </div>
            </li>
                 
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">用户中文名</label>
                    <div class="controls"><input class="input" value="<%=data.cnname%>" type="text" id="iptCnName" placeholder="用户中文名"></div>  
                    <div class="input_tips"></div>
                </div>
            </li>
            
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">联系电话</label>
                    <div class="controls"><input class="input" value="<%=data.telno%>" type="text" id="iptTelno" placeholder="联系电话"></div>  
                    <div class="input_tips"></div>
                </div>
            </li>
            
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">qq</label>
                    <div class="controls"><input class="input" value="<%=data.qq%>" type="text" id="iptqq" placeholder="qq"></div>  
                    <div class="input_tips"></div>
                </div>
            </li>
            
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">用户部门：</label>
                    <div class="controls"><div id="userDeptList"></div></div>
                    <span class="input-text"></span>  
                </div>
            </li>
            
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">用户岗位：</label>
                    <div class="controls"><select id="user_jobs">
                        <%for (var i=0;i<sysbase.length;i++) {%>
                            <%if (sysbase[i].type==5) {%>
                               <option value="<%=sysbase[i].id%>" <%=((data.jobs==sysbase[i].id)?"selected": "")%> ><%=sysbase[i]._value%></option> 
                            <%}%>
                            <%}%>
                    </select></div>
                    <span class="input-text"></span>  
                </div>
            </li>
            
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">用户角色：</label>
                    <div class="controls"><div id="userRoleList"></div></div>
                    <span class="input-text"></span>  
                </div>
            </li>
                
            
            <li class="clearfix hide">
                <div class="control-group">
                    <label class="control-label"></label>
                    <div class="controls"><textarea class="input" type="text" id="iptNote" placeholder="输入角色描述"><%=data.note%></textarea>  </div>
                </div>
            </li>

  
              <li class="current_status">
                <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>
              </li>
        </ul>
</div></div>