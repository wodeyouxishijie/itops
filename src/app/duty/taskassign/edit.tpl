<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentId" value="<%=data.id%>"/>
    <input type="hidden" id="currentMainId" value="<%=data.main_id%>"/>
    <input type="hidden" id="currentTable" value="<%=data.task_src%>"/>
    <%var canEdit = (op==0 || (op == 1 && data.task_src == "tasking_list" && data.op_user == g_User.id && data.cstatus == 76));%>
    <div class="drawer bs-docs-example form-horizontal">
        <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">  
        <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">
        <ul class="dialog">
            <li>
                <label class="control-label"></label>
                <div class="control-group">
                    <% if (!canEdit) {%><span class="input-text">申请人科室：<%=data.dept_name%>&nbsp;申请人：<%=data.cnname%>&nbsp;<%=data.clientip%></span><%}%>
                </div>
            </li>  
            <%if (canEdit) {%>
                
            <li>
                <div class="control-group">
                    <label class="control-label">申请人</label>
                    <div class="controls">
                        <input class="input" type="hidden" id="iptRepairUser">
                        <input class="input" type="text" id="iptRepairUserName" placeholder="申请人">
                    </div>
                </div>
            </li>
                
            <li>
                <div class="control-group">
                    <label class="control-label">申请人科室</label>
                    <div class="controls">
                        <input class="input-xlarge" type="hidden" id="iptRepairDept">
                        <input class="input-xlarge" type="text" id="iptRepairDeptName" readonly disabled placeholder="选择申请人后自动获取">
                    </div>
                </div>
            </li>                
            <%}%>
            <li>
                <div class="control-group">
                    <label class="control-label">标题</label>
                    <div class="controls">
                        <input class="input-xlarge" value="<%=data.title%>" <%= (!canEdit ? "readonly disabled": "")%> type="text" id="iptTitle" placeholder="任务标题">
                    </div>
                </div>
            </li>
                
            <li>
                <div class="control-group">
                    <label class="control-label">联系电话</label>
                    <div class="controls">
                        <span class="input-text"><input class="input" <%= (!canEdit ? "readonly disabled": "")%> value="<%=data.tel%>" type="text" id="iptTelNo" placeholder="联系电话"></span>  
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">任务类型</label>
                    <div class="controls">
                        <span class=""><select <%= (!canEdit ? "readonly disabled": "")%> id="report_type" style="width:auto;"></select></span> 
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">紧急程度</label>
                    <div class="controls">
                        <span class=""><select <%= (!canEdit ? "readonly disabled": "")%> id="report_grade" style="width:auto;"></select></span>  
                    </div>
                </div>
            </li>
            
            <li>
                <div class="control-group">
                    <label class="control-label">任务描述</label>
                    <div class="controls">
                        
                            <%if (canEdit) {%>
                                <div id="editFailureNote"></div>
                        <textarea rows="3" id="iptNote" class="hide" placeholder="任务描述" ></textarea> 
                            <%} else {%>
                        <div><%=data.note%></div>
                            <%}%>
                    </div>
                </div>
            </li>
        </ul>
                
    </div>
    <div style="clear:both;margin: 0 100px;" class="form-horizontal">
        <hr />
        
        
            <% if (data.cstatus == 76) {%>
                <div id="process_wrap">
                    <div class="control-group">
                        <label class="control-label">处理人员</label>
                        <div class="controls">
                            <span class="">
                                <input type="hidden" id="processUser" />
                                <input class="input-xlarge" type="text" id="iptProcessUser" placeholder="处理人">
                                <select id="sel_duty_user" style="width:auto;display:none;"></select>
                            </span> 
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label">处理时间</label>
                        <div class="controls">
                            <span class="input-text"><input class="input-xlarge" value="<%=data.current_time%>" type="text" id="iptProcessDate" placeholder="处理时间"></span>
                        </div>
                    </div>
                
                    <div class="control-group">
                        <label class="control-label">处理意见</label>
                        <div class="controls">
                            <textarea rows="3" id="iptProcessNote" placeholder="处理意见"><%=data.process_note%></textarea>  
                        </div>
                    </div>
                </div>
            <%} else if (data.cstatus == 75) {%>
                <h3>处理意见：</h3>
                <div id="process_log_wrap">
            
                </div> 
            <%}%>
    </div>
    <div style="clear:both;margin: 0 100px;">
        <% if (canEdit) {%>
            
            <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>
        <%}%>
        <%if (op == 1) {%>
            <% if (data.cstatus == 76) {%>
                <button cmd="start_exec" class="btn btn-primary" rid="<%=data.id%>">分派</button>
            <%} else if (data.cstatus == 74) {%>
                <button cmd="done_exec" class="btn btn-primary hide" rid="<%=data.id%>">完成</button>
            <%}%>
                <%if (canEdit) {%>
            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>
                    <%}%>
        <%} %>
    </div>
</div>