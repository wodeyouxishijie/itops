<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentId" value="<%=data.id%>"/>
    
    <div class="drawer bs-docs-example form-horizontal">
        <ul class="dialog">
  
            <li>
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
                        <span class=""><select id="leadertask_type" style="width:auto;"></select></span> 
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">紧急程度</label>
                    <div class="controls">
                        <span class=""><select id="leadertask_grade" style="width:auto;"></select></span> 
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">相关科室</label>
                    <div class="controls">
                        <input value="<%=data.related_dept_id%>" type="hidden" id="relatedDept">
                        <input class="input-small" value="<%=data.related_dept_name%>" type="text" id="iptRelatedDept" placeholder="输入部门编码">输入部门编码检索
                    </div>
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
                    <label class="control-label">任务描述</label>
                    <div class="controls">
                        <div id="editToobar"></div>
                        <textarea class="hide" rows="3" id="iptNote" placeholder="任务描述"><%=data.note%></textarea>  
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">任务时间</label>
                    <div class="controls">
                        <span class="input-text"><input class="input-xlarge" value="<%=data.start_time%>" type="text" id="ipt_start_time" placeholder="处理时间"></span>
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">相关人员</label>
                    <div class="controls">
                        <span class="input-text"><select id="ipt_related_user" style="width:auto;"></select></span>
                    </div>
                </div>
            </li>
            <li>
                <div class="control-group">
                    <label class="control-label">联系方式</label>
                    <div class="controls">
                        <span class="input-text"><input class="input-xlarge" value="<%=data.telno%>" type="text" id="iptTelNo" placeholder="处理时间"></span>
                    </div>
                </div>
            </li>
        </ul>
    </div>
    <div style="clear:both" class="form-horizontal">
        <hr />
        <div id="leader_process_wrap" class="hide">
            <div class="control-group">
                <label class="control-label">状态</label>
                <div class="controls">
                    <span class=""><select id="leadertask_status" style="width:auto;"></select></span> 
                </div>
            </div>
            <div class="control-group">
                <label class="control-label">处理意见</label>
                <div class="controls">
                    <textarea rows="3" id="iptLeaderProcessNote" placeholder="处理意见"></textarea>  
                </div>
            </div>
            <div class="control-group">
                <label class="control-label"></label>
                <div class="controls">
                    <button cmd="process" class="btn btn-primary" rid="<%=data.id%>">处理</button> 
                </div>
            </div>
            
        </div>
    </div>
    <%if (data.cstatus != 75) {%>
    <div style="clear:both;">
        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>
        <%if (op == 1) {%>
            <button cmd="show_process" class="btn btn-primary">处理该单</button>
            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>
        <%}%>
    </div>
    <%}%>
</div>