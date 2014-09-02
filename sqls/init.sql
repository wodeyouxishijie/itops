CREATE DATABASE IF NOT EXISTS ops_db DEFAULT CHARSET utf8 COLLATE utf8_general_ci;  

# 系统用户
CREATE TABLE IF NOT EXISTS user_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(20) NOT NULL,
    name VARCHAR(400),
    nick VARCHAR(400),
    pwd VARCHAR(400),
    type INT(10) NOT NULL,
    user_status INT(10), 
    cnname VARCHAR(400),
    role_id VARCHAR(127),
    dept_id VARCHAR(127),
    menu_id VARCHAR(127),
    telno VARCHAR(127),
    gender INT(10),
    ext1 VARCHAR(400),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 系统菜单
CREATE TABLE IF NOT EXISTS menu_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(400),
    codes VARCHAR(400),
    parent INT (10) UNSIGNED NOT NULL,
    href VARCHAR(400),
    is_enable INT(10),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 用户菜单
CREATE TABLE IF NOT EXISTS user_menu (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT(10),
    menu_id INT(10),
    ext VARCHAR(400),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 部门信息表
CREATE TABLE IF NOT EXISTS dept_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(400),
    codes VARCHAR(400),
    parent INT(10),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ext VARCHAR(400),
    tel1 VARCHAR(400),
    tel2 VARCHAR(400),
    fax VARCHAR(400),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 角色信息
CREATE TABLE IF NOT EXISTS role_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(400),
    note VARCHAR(400),
    power VARCHAR(1024),
    ext VARCHAR(400), 
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 故障处理角色信息
CREATE TABLE IF NOT EXISTS role_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    failure_type INT(10),
    role_id INT(10),
    note VARCHAR(1024),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 基础表单总表
CREATE TABLE IF NOT EXISTS key_value_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    _key VARCHAR(100),
    _value VARCHAR(100),
    type INT(10),
    typename VARCHAR(100), 
    note VARCHAR(100), 
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 故障上报
CREATE TABLE IF NOT EXISTS failure_report_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    repair_user INT(10),
    title VARCHAR(100),
    duty_user INT(10),
    process_user INT(10), 
    done_user INT(10), 
    cstatus INT(10),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    grade INT(10), 
    ftype INT(10), 
    note VARCHAR(400),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 软件需求上报
CREATE TABLE IF NOT EXISTS software_report_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    apply_user INT(10),
    apply_dept INT(10),
    related_dept INT(10),
    title VARCHAR(100),
    cstatus INT(10),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    apply_time DATETIME,
    note VARCHAR(400),
    contact INT(10),
    related_app VARCHAR(200),
    result VARCHAR(1024),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 任务分派
CREATE TABLE IF NOT EXISTS tasking_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    repair_user INT(10),
    repair_dept INT(10),
    title VARCHAR(100),
    duty_user INT(10),
    process_user INT(10), 
    done_user INT(10), 
    cstatus INT(10),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    grade INT(10), 
    ftype INT(10), 
    apply_time DATETIME,
    note VARCHAR(400),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 业务知识库
CREATE TABLE IF NOT EXISTS repository_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(100),
    cstatus INT(10),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ftype INT(10), 
    last_modify_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    note VARCHAR(400),
    add_user INT(10),
    ext VARCHAR(1024),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 操作日志
CREATE TABLE IF NOT EXISTS process_log_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    src VARCHAR(100),
    cstatus INT(10),
    dest_status INT(10),
    last_modify_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    note VARCHAR(400),
    add_user INT(10),
    ext VARCHAR(1024),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8 

# 个人工作任务上报
CREATE TABLE IF NOT EXISTS mytasking_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(100),
    cstatus INT(10),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ftype INT(10), 
    last_modify_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    note TEXT,
    add_user INT(10),
    ext VARCHAR(1024),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 领导任务分派
CREATE TABLE IF NOT EXISTS leader_tasking_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    repair_user INT(10),
    repair_dept INT(10),
    related_dept INT(10),
    done_user INT(10),
    title VARCHAR(100),
    cstatus INT(10),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_time DATETIME,
    end_time DATETIME,
    grade INT(10), 
    ftype INT(10), 
    apply_time DATETIME,
    note VARCHAR(400),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 值班呢休假
CREATE TABLE IF NOT EXISTS vacation_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(100),
    cstatus INT(10),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_time DATETIME,
    ftype INT(10), 
    note TEXT,
    apply_user INT(10),
    ext VARCHAR(1024),
    op_user INT(10),
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8

# 评论
CREATE TABLE IF NOT EXISTS score_list (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    typeid VARCHAR(100),
    mainid INT(10),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note text,
    op_user INT(10),
    ext text,
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8