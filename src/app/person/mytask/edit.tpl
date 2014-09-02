<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentId" value="<%=data.id%>"/>
    <%var canEdit = (src == "employee" || data.cstatus == 1) ? " readonly disabled ": "";%>
    <div class="drawer bs-docs-example form-horizontal">
        <ul class="dialog">
  
            <li <%if (src == "employee") {%> style="display:none;"<%}%>>
                <div class="control-group">
                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">  
                    <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">  
                    <span class="input-text">录入者：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">所属类型</label>
                    <div class="controls">
                        <span class=""><select id="mytask_type" style="width:auto;" <%=canEdit%>></select></span> 
                    </div>
                </div>
            </li>
                    
            <li>
                <div class="control-group">
                    <label class="control-label">标题</label>
                    <div class="controls">
                        <input class="input-xlarge" value="<%=data.title%>" type="text" <%=canEdit%> id="iptTitle" placeholder="任务标题">
                    </div>
                </div>
            </li>
            
            <li>
                <div class="control-group">
                    <label class="control-label">任务描述</label>
                    <div class="controls">
                        <div id="editToobar"></div>
                        <textarea class="hide" rows="3" id="iptNote" placeholder="任务描述" <%=canEdit%>><%=data.note%></textarea>  
                    </div>
                </div>
            </li>
        </ul>
    </div>
    <%if (src == "employee") {%>
        <hr />
        <div class="drawer bs-docs-example form-horizontal">
            <div class="control-group">
                <label class="control-label">处理意见</label>
                <div class="controls">
                    <textarea rows="3" id="iptProcessNote" style="width:500px;" placeholder="处理意见"><%=data.process_note%></textarea>  
                </div>
            </div>
        </div>
    <%}%>

    <%if (data.cstatus==1) {%>
    <a href="#" cmd="show_process">显示处理情况</a> 
    <div id="process_wrap">
            
    </div>
    <%}%>

    <div style="clear:both;">
        <%if (src == "employee") {%>
            <%if (+data.cstatus == 0) {%>
            <a href="javascript:void 0;" cmd="process" class="btn btn-primary">处理</a>
            <%}%>
        <%} else {%>
        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>
        <%}%>

        <%if (op == 1) {%>
            <%if ( src == "main") {%>
            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>
            <%}%>
        <%}%>
    </div>
</div>