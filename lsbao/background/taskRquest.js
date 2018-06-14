//获取零申报任务

function getLsBaoTask(callback) {
    //console.log(callback);
    var xss = {};
    var tasks = {};
    var API = new Api();

    if (getTasksStaus) {
        notes('当前任务获取中,本次不执行获取任务')
        return false;
    }
    getTasksStaus = true;

    //领单计时
    var get_task_start_time = new Date().getTime();

    //领单
    setHostStatus(1);
    API.getTask(function (res) {
        //领单计时
        var get_task_end_time = new Date().getTime();
        var get_task_use_time = get_task_end_time - get_task_start_time;
        notes("自动领单耗时：" + get_task_use_time + "毫秒");

        taskRequest.lastTime = new Date().getTime();

        if(res.success && res.data){
            notify('领到任务');
            useLocal(function(local){

                var last_mobile_phone = local.last_mobile_phone;
                var curr_mobile_phone = res.data.mobile_phone;

                var vouchers = res.data.vouchers;

                var vchs = [];

                for(var key in vouchers){

                    vchs.push(vouchers[key]);
                }

                console.log(vchs);

                setLocal({task:res.data,last_mobile_phone:curr_mobile_phone,vouchers:vchs},function(){
                    if(last_mobile_phone == curr_mobile_phone){
                        //同一个会计账号,设置主页为起始页
                        var start_url = 'https://main.kdzwy.com/guanjia/#/home';
                        setStartPage('zero_declaration',start_url);
                        callback && callback();
                    }else{
                        //设置登录页面起始页
                        var start_url = 'http://gj.kdzwy.com/index_new.html';
                        setStartPage('zero_declaration',start_url);
                        //清除浏览器数据
                        clear_brower_cookies(callback);
                    }

                })
            })
        }else{
            //暂无任务
            notify(res.message + ',10秒后重新领任务');
            //暂无任务清除一次最后会计账号
            setTimeout(function(){
                delLocal(['last_mobile_phone'],function(){
                    checkTasks();
                })
            },10*1000)
            // setTimeout(checkTasks, 10000);
        }

    }, function (e) {
        console.error('获取任务失败', e);
        notify('分配任务失败');
        // callback();

        setTimeout(function(){
            checkTasks();
        },5*1000)
    });

    //获取任务
    //获取帐号
    //获取推广链接
    //获取xss的点点任务
}