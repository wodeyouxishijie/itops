<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentId" value="<%=data.id%>"/>
    
    <div class="form-horizontal">
                <div class="control-group">
                    <input class="input" value="<%=data.user_id%>" type="hidden" id="iptUserID">  
                    <input class="input" value="<%=data.user_dept%>" type="hidden" id="iptUserDept">
                    <div class="controls">
                        <span class="input-text">申请人：<%=data.user_cn_name%>&nbsp;所在科室：<%=data.user_dept_name%>&nbsp;IP:<%=data.clientip%></span>
                    </div>
                </div>
            
                <div class="control-group">
                    <label class="control-label">故障标题</label>
                    <div class="controls">
                        <input class="input-xlarge" value="<%=data.title%>" type="text" id="iptTitle" placeholder="故障标题">
                    </div>
                </div>
           
                <div class="control-group">
                    <label class="control-label">联系电话</label>
                    <div class="controls">
                        <span class="input-text"><input class="input" value="<%=data.tel%>" type="text" id="iptTelNo" placeholder="联系电话"></span>  
                    </div>
                </div>
            
                <div class="control-group">
                    <label class="control-label">故障类型</label>
                    <div class="controls">
                        <span class=""><select id="report_type" style="width:auto;"></select></span> 
                    </div>
                </div>
            
                <div class="control-group">
                    <label class="control-label">紧急程度</label>
                    <div class="controls">
                        <span class=""><select id="report_grade" style="width:auto;"></select></span>  
                    </div>
                </div>
            
                <div class="control-group">
                    <label class="control-label">故障描述</label>
                    <div class="controls">
                        <div id="editFailureNote"></div>
                        <textarea class="hide" rows="3" id="iptNote" placeholder="故障描述"><%=data.note%></textarea>  
                    </div>
                </div>
            
                
        <ul class="dialog_right">
            
        </ul>
    </div>
        
    <div style="clear:both;margin: 0 100px;" class="form-horizontal" style="">
        <%if (op == 1 && data.cstatus == 75) {%>
        <div id="process_wrap">
            
        </div>
        
        <div id="score_wrap" style="margin-top: 10px;border: 1px solid #ccc;width: 670px;padding: 20px;">
            <%if (data.score_grade == null && newscored[data.id] == null) { %>
            <div class="grade_item">
                <label><input type="radio" name="score_grade" value="5"/>很满意</label>
                <label><input type="radio" name="score_grade" value="4"/>满意</label>
                <label><input type="radio" name="score_grade" value="3"/>基本满意</label>
                <label><input type="radio" name="score_grade" value="2"/>一般</label>
                <label><input type="radio" name="score_grade" value="1"/>不满意</label>
            </div>
            <div id="score_note" class="hide"></div>
            <p><a href="#" class="btn" cmd="submit_score">提交</a></p>
            <% } else {%>
                您已经评论此故障单！
            <% }%>
        </div>
        
        
        <%}%>
        
    </div>
    <div style="clear:both;margin: 0 100px;" class="form-horizontal" style="">
        <%if (!data.cstatus || !data.process_user) {%>
            <a href="javascript:void 0;" cmd="save" class="btn btn-primary">确定</a>
            <%if (op == 1 && data.cstatus == 76) {%>
            <button cmd="del" class="btn" deptid="<%=data.id%>"><i class="icon-remove"></i>删除</button>
        <%} }%>
    </div>
</div>