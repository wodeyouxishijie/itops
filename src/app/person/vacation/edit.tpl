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
                        <span class=""><select id="vacation_type" style="width:auto;"></select></span> 
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
                    <label class="control-label">描述</label>
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
                    <label class="control-label">申请人员</label>
                    <div class="controls">
                        <span class="input-text"><select id="ipt_apply_user" style="width:auto;"></select></span>
                    </div>
                </div>
            </li>
        </ul>
    </div>
    <div style="clear:both;">
        <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>
        <%if (op == 1) {%>
            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>
        <%}%>
    </div>
</div>