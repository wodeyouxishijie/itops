<div class="drawer-wrapper" style="">
    <div class="drawer-title"><i class="drawer-close"></i><span class="drawer-title-content">&nbsp;</span></div>
    <input type="hidden" id="currentId" value="<%=data.id%>"/>
    <div class="form-horizontal">
        <ul class="dialog">
  
        <li class="current_status">
                <h4>基本信息</h4>
              </li>
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">用户工号</label>
                    <div class="controls"><input class="input" value="<%=data.user_id%>" readonly disabled type="text" id="iptUserID" placeholder="用户工号"></div>  
                    <div class="input_tips"></div>
                </div>
            </li>
                 
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">用户中文名</label>
                    <div class="controls"><input class="input" value="<%=data.cnname%>" readonly disabled type="text" id="iptCnName" placeholder="用户中文名"></div>  
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
                    <label class="control-label">qq号</label>
                    <div class="controls"><input class="input" value="<%=data.qq%>" type="text" id="iptqq" placeholder="qq号"></div>  
                    <div class="input_tips"></div>
                </div>
            </li>
            
              <li class="current_status">
                  <div class="control-group">
                    <label class="control-label"></label>
                      <div class="controls">
                        <a href="javascript:void 0;" cmd="save_user_base" class="btn btn-primary">确定</a>
                    </div>
                </div>
              </li>
            
            <li class="current_status">
                  <hr/>
                <h4>修改密码</h4>
              </li>
            
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">原有密码</label>
                    <div class="controls"><input class="input" type="text" id="iptOldPwd" placeholder="输入原有密码"></div>  
                    <div class="input_tips"></div>
                </div>
            </li>
            
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">密码</label>
                    <div class="controls"><input class="input" type="text" id="iptPwd1" placeholder="输入新密码"></div>  
                    <div class="input_tips"></div>
                </div>
            </li>
            <li class="clearfix">
                <div class="control-group">
                    <label class="control-label">确认密码</label>
                    <div class="controls"><input class="input" type="text" id="iptPwd2" placeholder="再次输入新密码"></div>  
                    <div class="input_tips"></div>
                </div>
            </li>
            <li class="clearfix">
                <div class="alert hide" cmd="alert_tip">
                </div>
            </li>
              <li class="current_status">
                  <div class="control-group">
                    <label class="control-label"></label>
                      <div class="controls">
                        <a href="javascript:void 0;" cmd="change_pwd" class="btn btn-primary">确定</a>
                    </div>
                </div>
              </li>
        </ul>
</div></div>