//进入首页
console.log('home首页');

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

var table_loaded = false;

var customer_edited = false;

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        if(mutation.target.className == 'el-dialog__wrapper editCustomer' && !customer_edited){
            customer_edited = true;
            console.log('监控到客户基本信息编辑');
            //保存税务标号
            Run(function(){
                save_tax_sn(enter_book);
            })
        }

        if(mutation.target.className == 'el-message' && mutation.target.innerText.indexOf('没有登录或会话超时') != -1){
            go_url('http://gj.kdzwy.com/index_new.html');
        }


    }else if(mutation.type == 'childList'){

            if(mutation.target.tagName == 'BODY' && mutation.addedNodes.length >0 && !indexed){
                console.log('监控到主页');
                indexed = true;
                Run(index);
            }

            if(mutation.target.className == 'table_con' && mutation.addedNodes.length >0 && !table_loaded){
                console.log('检测到账户列表');

                table_loaded = true;

                Run(get_nodeId);//检测目标账户
            }
    }
});

Run(time_out);

//列表未加载出来
function time_out(){
    setTimeout(function(){
        if(!table_loaded){
            window.location.reload();
        }
    },10*1000)
}

//点击代账任务
function index(local){

    $("#nav-wraper li:contains('代账服务')")[0].click();
}

//获取服务类型
function get_nodeId(){

    var url = 'https://main.kdzwy.com/guanjia/acctflow/selfnode';

    $.ajax({
        type:'GET',
        url:url,
        dataType:'json',
        success:function(msg){
            var data = msg.data;
            if(data){
                for(var i =0;i<data.length;i++){
                    if(data[i].nodeName == '服务管理'){
                        var nodeId = data[i].id;
                        setLocal({nodeId:nodeId},function(){
                            console.log('nodeId=',nodeId);
                            //筛选目标公司
                            target_name_filter(nodeId);
                        })
                    }
                }
            }else{
                clue('获取服务类型失败');

                setTimeout(get_nodeId,10*1000);
            }
        }
    })
}

//筛选公司
function target_name_filter(nodeId){

    useLocal(function (local) {

        var name = local.task.company_name;

        var url = 'https://main.kdzwy.com/guanjia/acctflow/nodecustomer?nodeId=' + nodeId +'&page=1&limit=10&orderProperty=acctCreateDate&orderDirection=desc&fromDate=&toDate=&taxType=&taxCycle=&dispatchRole=&acctType=&valuate=&followUpStartTime=&followUpEndTime=&followUpType=1&followUp=&customerSource=&condition=&condition1=&condition2=&nodeType=&nodeValue=&tagId=&name=' + name +'&dispatchStartTime=&dispatchEndTime=&operator=&acctPeriod=&noFollowUpOperator=&noFollowUpDays=';

        $.ajax({
            type:'GET',
            url:url,
            dataType:'json',
            success:function(msg){
                var data = msg.data;
                if(data && data.items && data.items.length >0){

                    var sys_company_info = data.items[0];

                    setLocal({sys_company_info:sys_company_info},function(){
                        console.log('获取公司信息成功',sys_company_info);

                        check_account_date(sys_company_info.accountDate,function(){
                            //获取账套token
                            get_login_token(sys_company_info.companyId);
                        })
                    })

                }else{

                    var target_name_filter_nums = local.target_name_filter_nums || 0;

                    if(target_name_filter_nums <3){
                        clue('公司不存在,3S后再次搜索;当前搜索次数：' + target_name_filter_nums);
                        setLocal({target_name_filter_nums:++target_name_filter_nums},function(){
                            setTimeout(function(){
                                target_name_filter(nodeId)
                            },3*1000)
                        })
                    }else{
                        err_log_report('任务公司不存在');
                    }

                }
            }
        })

    })
}

//检查账期
function check_account_date(sys_account_date,callback){

    useLocal(function (local) {
        if(local.task.account_date.indexOf(sys_account_date) != -1){
            //账期正确
            callback && callback()
        }else{
            clue('任务账期不一致');
            err_log_report('任务账期不一致,任务账期：' + local.task.account_date + ', 系统内账期：' + sys_account_date );
        }
    })
}


//获取税务编号
function get_tax_sn(customerId){

    var url = 'https://main.kdzwy.com/guanjia/customer/' + customerId;

    $.ajax({
        type:'GET',
        url:url,
        dataType:'json',
        success:function(msg){
            var data = msg.data;
            if(data){
                setLocal({tax_sn:data.taxpayerCode},function(){
                    console.log('获取税务编号成功');
                    //进账簿
                    // enter_book();
                })
            }else{
                clue('获取税务编号失败');
            }

        }

    })
}

//进账簿
function enter_book(url){

   tabCommon.sm('.enter_book',url);
}

//获取登录Token
function get_login_token(companyId){
    var url = 'https://main.kdzwy.com/guanjia/customer/accounturl?companyId=' + companyId;

    $.ajax({
        type:'GET',
        url:url,
        dataType:'json',
        success:function(msg){
            if(msg.code == 200){
                console.log('port login sucess');
                if(msg.data){
                    enter_book(msg.data);
                }else{
                    clue('账套token获取失败');
                }

            }else{
                console.log('获取账套登录TOKEN失败');

                setTimeout(function(){
                    get_login_token(companyId);
                },5*1000)
            }
        }
    })
}

//汇报失败状态
function err_log_report(err_msg){

    tabCommon.sm('.updateTaskStatus',{status:3,result:err_msg},function(){
        clue(err_msg);
    });

}









