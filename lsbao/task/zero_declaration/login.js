//进入登录首页
console.log('登录首页');

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

var account_pwd_err = false;

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        if(mutation.target.id == 'log-submit-prompt' && !indexed){

            indexed = true;

            var err_msg = mutation.target.innerText;

            Run(function(){

                if(err_msg.indexOf('账号或密码有误') != -1){
                    err_log_report(err_msg);
                }

            })

        }else if(mutation.target.id == 'MEIQIA-BTN-HOLDER'){
            //mutation.target.id == 'MEIQIA-INVITE' || 
            Run(index);
        }

    }else if(mutation.type == 'childList'){

        if((mutation.target.id == 'log-account-p' || mutation.target.id == 'log-pwd-p') && !account_pwd_err){

            account_pwd_err = true;

            var err_msg = mutation.target.innerText;



            Run(function(local){

                if(err_msg.indexOf('手机号码格式错误') != -1){
                    var login_reload_nums = local.login_reload_nums || 0;
                    setLocal({login_reload_nums:++login_reload_nums},function(){
                        if(login_reload_nums >2){
                            err_log_report(err_msg);
                        }else{
                            window.location.reload();
                        }
                    })

                }else{
                    err_log_report(err_msg);
                }


            })

        }


    }
});

function index(local){

    var account = local.task.mobile_phone;
    var pwd = local.task.mobile_password;

    console.log(account + ':' + pwd);

    if(account && pwd){

        // $("#log-account").focus();

        // $("#log-account").val(account);
        // $("#log-pwd").val(pwd);

        writing($("#log-account"),account,function(){

            // $("#log-pwd").focus();

            writing($("#log-pwd"),pwd,function(){

                //检测输入的账号密码是否正确
                if($("#log-account").val() != account){
                    $("#log-account").val(account);
                }

                if($("#log-pwd").val() != pwd){
                    $("#log-pwd").val(pwd);
                }

                setTimeout(function(){
                    //提交
                    clicking($("#sub-btn"));
                },1000)

            })
        })

    }else{
        var err_msg = '账号或密码不存在';
        setTimeout(function(){
            clue(err_msg);
            err_log_report(err_msg);
        },3*1000)

    }
}

function err_log_report(err_msg){

    //登录不成功的 清除最后一次手机号

    delLocal([
        'last_mobile_phone'
    ],function(){
        tabCommon.sm('.updateTaskStatus',{status:3,result:err_msg},function(){
            clue(err_msg);
        });
    })



}









