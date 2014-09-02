<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentId" value="<%=data.id%>"/>
    
    <div class="drawer bs-docs-example form-horizontal">
        <ul class="dialog">
  
            <li>
                <div class="control-group hide">
                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">  
                    <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">  
                    <span class="input-text">申请人：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%></span>
                </div>
            </li>
            <li>
                <label class="control-label"></label>
                <div class="control-group">
                    <input type="hidden" value="<%=data.repair_user %>" id="repaireUser" />
                    <input type="hidden" value="<%=data.repair_dept %>" id="repaireDept" />
                    <span class="input-text">申请人科室：<%=data.dept_name%>&nbsp;申请人：<%=data.cnname%></span>
                </div>
            </li>  
            <li>
                <div class="control-group">
                    <label class="control-label">标题</label>
                    <div class="controls">
                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="任务标题">
                    </div>
                </div>
            </li>
                
            <li>
                <div class="control-group">
                    <label class="control-label">联系电话</label>
                    <div class="controls">
                        <span class="input-text"><input class="input" value="<%=data.tel%>" type="text" id="iptTelNo" placeholder="联系电话"></span>  
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">任务类型</label>
                    <div class="controls">
                        <span class=""><select id="report_type" style="width:auto;"></select></span> 
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">紧急程度</label>
                    <div class="controls">
                        <span class=""><select id="report_grade" style="width:auto;"></select></span>  
                    </div>
                </div>
            </li>
            
            <li>
                <div class="control-group">
                    <label class="control-label">任务描述</label>
                    <div class="controls">
                        <div id="iptNote"><%=data.note%></div>
                        <textarea class="hide" rows="3" id="iptNote2" placeholder="任务描述"><%=data.note%></textarea>  
                    </div>
                </div>
            </li>
        </ul>
                
        <ul class="dialog_right hide">
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">处理人</label>
                    <div class="controls">
                        <input type="hidden" readonly disabled id="processUser2" value="<%=data.user_id%>"/>
                        <span class="input-text"><input class="input-xlarge" value="<%=data.user_cn_name%>" type="text" id="iptProcessUser2" placeholder="处理人"></span>
                    </div>
                </div>
            </li>
            
            <li>
                <div class="control-group">
                    <label class="control-label">处理时间</label>
                    <div class="controls">
                        <span class="input-text"><input class="input-xlarge" value="<%=data.apply_time%>" type="text" id="iptProcessDate2" placeholder="处理时间"></span>
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">完成人</label>
                    <div class="controls">
                        <input type="hidden" id="doneUser" value="<%=data.done_user%>"/>
                        <span class="input-text"><input class="input-xlarge" value="<%=data.done_cnname%>" type="text" id="iptDoneUser" placeholder="完成人"></span>
                    </div>
                </div>
            </li>
            
            <li>
                <div class="control-group">
                    <label class="control-label">完成时间</label>
                    <div class="controls">
                        <span class="input-text"><input class="input-xlarge" value="<%=data.end_time%>" type="text" id="iptDoneDate" placeholder="完成时间"></span>
                    </div>
                </div>
            </li>
        </ul>
    </div>
    <div style="clear:both" class="form-horizontal">
        <hr />
        
        
        <%if (op == 1) {%>
        <div id="process_wrap">
            <div class="control-group">
                <label class="control-label">处理人员</label>
                <div class="controls">
                    
                    <span class="">
                        <input type="hidden" id="processUser" value="<%=data.user_id%>"/>
                        <input class="input-xlarge" readonly disabled value="<%=data.user_cn_name%>" type="text" id="iptProcessUser" placeholder="处理人">
                        <select id="_0_sel_duty_user" style="width:auto;display:none"></select>
                    </span> 
                    <% if (data.cstatus == 76 || data.cstatus == 74) {%><a href="#" cmd="change_process_user">转处理人</a><%}%>
                </div>
                
            </div>
            <div class="control-group hide change_process_user" >
                <label class="control-label">转给处理人员</label>
                <div class="controls">
                    <span class="">
                        <input type="hidden" id="changeProcessUser" value=""/>
                        <input class="input-xlarge" type="text" id="iptChangeProcessUser" placeholder="处理人">
                    </span> 
                </div>
                
            </div>
            <div class="control-group">
                <label class="control-label">处理时间</label>
                <div class="controls">
                    <span class="input-text"><input class="input-xlarge" value="<%=data.apply_time%>" type="text" id="iptProcessDate" placeholder="处理时间"></span>
                </div>
            </div>
        
            <div class="control-group">
                <label class="control-label">处理意见</label>
                <div class="controls">
                    <textarea rows="3" id="iptProcessNote" placeholder="处理意见"><%=data.process_note%></textarea>  
                </div>
            </div>
        </div>
            <%}%>
    </div>
    <div style="clear:both;">
        
        <%if (op == 1) {%>
            <% if (data.cstatus == 76) {%>
                <button cmd="start_exec" class="btn btn-primary" rid="<%=data.id%>">开始执行</button>
            <%} else if (data.cstatus == 74) {%>
                <button cmd="done_exec" class="btn btn-primary" rid="<%=data.id%>">完成</button>
            <%}%>
            <button cmd="del" class="btn hide" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>
        <%} else {%>
            <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>
        <%}%>
    </div>
</div>