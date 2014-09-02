<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentSoftwareId" value="<%=data.id%>"/>
    
    <div class="drawer bs-docs-example form-horizontal">
        <ul class="dialog">
  
            <li>
                <div class="control-group">
                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">  
                    <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">  
                    <span class="controls">申请人：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>
                </div>
            </li>
                 
            <li>
                <div class="control-group">
                    <label class="control-label">提出日期</label>
                    <div class="controls">
                        <input class="input-xlarge disabled" readonly disabled value="<%=data.apply_time%>" type="text" id="iptApplyTime" placeholder="提出日期">
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">相关科室</label>
                    <div class="controls">
                        <input value="<%=data.apply_dept%>" type="hidden" id="applyDept">
                        <input class="input-small" readonly disabled value="<%=data.dept_name%>" type="text" id="iptApplyDept" placeholder="输入部门编码">输入部门编码检索
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">科室联系人</label>
                    <div class="controls">
                        <input value="<%=data.apply_user%>" type="hidden" id="applyUser">
                        <input class="input-small" readonly disabled value="<%=data.cnname%>" type="text" id="iptApplyUser" placeholder="输入工号">输入工号检索
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">标题</label>
                    <div class="controls">
                        <input class="input-xlarge" readonly disabled value="<%=data.title%>" type="text" id="iptTitle" placeholder="项目标题">
                    </div>
                </div>
            </li>
            
            <li>
                <div class="control-group">
                    <label class="control-label">项目描述</label>
                    <div class="controls">
                        <textarea rows="3" readonly disabled id="iptNote" placeholder="项目描述"><%=data.note%></textarea>  
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">相关系统</label>
                    <div class="controls">
                        <input class="input-xlarge" readonly disabled value="<%=data.related_app%>" type="text" id="iptRelatedApp" placeholder="故障标题">
                    </div>
                </div>
            </li>
            
            <li>
                <div class="control-group">
                    <label class="control-label">审核意见</label>
                    <div class="controls">
                        <textarea rows="3" id="iptResult" <% if (data.cstatus == 2) {%>disabled readonly<%}%> placeholder="审核意见"><%=data.result%></textarea> 
                    </div>
                </div>
            </li>
            <li class="hide">
                <div class="control-group">
                    <label class="control-label">是否完成</label>
                    <div class="controls">
                        <input id="chkStatus" type="checkbox" <%=data.cstatus==1? "": ""%>/> 
                    </div>
                </div>
            </li>
        </ul>
    </div>
    <div style="clear:both;">
        <%if (data.cstatus == 0) {%>
        <a href="javascript:void 0;" cmd="save_software_todo" class="btn btn-primary">审核</a>
        <a href="javascript:void 0;" cmd="refuse_software_todo" class="btn btn-danger">驳回</a>
        <%} else if (data.cstatus == 2) {%>
            <a href="javascript:void 0;" cmd="complete_software_todo" class="btn btn-primary">完成</a>
        <%}%>
        <%if (op == 1 && 0) {%><button cmd="del" class="btn btn-danger" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button><%}%>
    </div>
</div>