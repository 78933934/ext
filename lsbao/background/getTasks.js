/**
 * 任务开始引导
 */
var topTaskConfig={taskAutoStart:false};
var TaskRunInfo={};
var taskRequest={times:0,lastTime:0,restartTime:0,startTime:0,timeout:720,taskTimeout:{}};
taskRequest.startTime = (new Date).getTime();
function taskTimeout() {
    //如果长时间没有发起第一次任务请求 reload一次
    //如果发起过请求 监控更换为 任务监控
    //  如果没有任务 且长时间不继续请求 start一次
    //  如果有任务 但是超过了该任务类型的超时时间 start一次
    useLocal(function (local) {
        if(local.isRunning){
            if(taskRequest.lastTime===0){
                if((new Date).getTime() - taskRequest.startTime >300e3){
                    setLocal({update_check: true}, function(){
                        chrome.runtime.reload();
                    })
                }
            }else{
                if(TC.tasks.length==0){
                    if((new Date).getTime() - taskRequest.lastTime > 1000*300){
                        taskRequest.lastTime = (new Date).getTime();
                        console.warn('taskRequest 无任务 领取超时');
                        startHost();
                    }
                }else{
                    var _timeout = +(TC.taskConfig[TC.currentTaskType].timeout||0);
                    if(_timeout && taskRequest.taskTimeout[TC.currentTask]){
                        if((new Date).getTime() - taskRequest.taskTimeout[TC.currentTask] > _timeout){
                            console.warn('当期任务超时');
                            startHost();
                        }
                    }else{
                        //如果配置了超时时间 再加一个最大时间
                        if(_timeout){
                            if((new Date).getTime() - taskRequest.lastTime > _timeout*3){
                                console.warn('当期任务开始时间丢失 ,超时3倍时间');
                                setLocal({update_check: true}, function(){
                                    chrome.runtime.reload();
                                })
                            }
                        }else{
                            console.warn('当期任务未正确开始或者当前任务不存在超时定义');
                        }
                    }
                }
            }
        }
        setTimeout(taskTimeout,60e3);
    })
}
// taskTimeout();
function taskStartBoot() {
    //去获取任务
    TaskRunInfo = {};
    TaskRunInfo = $.extend(TaskRunInfo,{taskTypes:taskTypes});
    labelWatch.retryTimes={};
    taskRequest.times++;
    taskRequest.lastTime = (new Date).getTime();
    taskRequest.taskTimeout = {};
    var API = new Api();
    API.retryTimes = 10;
    // API.getClientTaskType({}, function (data) {
    //     if (data.success == 1) {
    //
    //     } else {
    //         notify('没有获取到主机任务类型');
    //     }
    // })

    requestTasks({});

    function requestTasks(task_list) {
        useLocal(function (local) {
            getTasks();
        });
    }
}

function initTaskConfig() {
    //获取任务配置信息
    notes('任务初始化配置');
    TC.tasks = [];
    TC.status = false;
    taskTypes.forEach(function (p1, p2, p3) {
        TC.taskConfig[p1.taskType] = p1;
        TC.apiTaskConfig[p1.apiTaskType] = p1;
    })
    console.log(TC)
}

var getTasksStaus = false;

function getTasks(task_list) {
    if (getTasksStaus) {
        notes('当前任务获取中,本次不执行获取任务')
    }
    // getTasksStaus = true;
    //初始化任务配置
    // notify('开始获取任务');
    initTaskConfig();

    function check() {
        // var taskName = task_list.shift();
        var taskName = 'zero_declaration';
        if (taskName) {
            run(taskName, function () {
                useLocal(function (local) {
                    checkTasks();return false;
                    if (local.task && Object.keys(local.task)) {
                        checkTasks()
                    } else {
                        //没有任务，延迟10s
                        setTimeout(check, 10*1000);
                    }
                })
            })
        } else {
            checkTasks()
        }
    }

    function run(t_name, cb) {
        topTaskConfig.taskAutoStart = false;

        setSharedTaskWorks({hostMessageType:t_name},function () {

            runTask(t_name,cb);
        });
        function runTask(t_name,cb){
            switch (t_name) {

                case 'zero_declaration':
                    getLsBaoTask(cb);
                    break;


                default:
                    chrome.browserAction.setBadgeText({text:'stop'});
                    notify('不支持的顶级任务类型' + t_name, 5);
                    cb();
            }
        }

    }

    //开始请求任务
    statusReport('1', 60, check);
}

function checkTasks() {
    getTasksStaus = false;
    notes('开始检测需要完成的任务');
    // TC.init();
    // return false;
    useLocal(function (local) {
        if (local.task && Object.keys(local.task).length) {
            notify('有任务');
            console.log(local.task)
            // setLocal({clearCookies:false},function(){ })
                TC.init();


        } else {
            setTimeout(function () {
                select_task_by_usage(local);
            }, 1000)
        }
    })
}

// lsBaoTimeout();
//零申报任务超时发送钉钉
function lsBaoTimeout(){

    useLocal(function (local) {
        if(local.isRunning) {

            var _timeout =  300e3;

            if(!taskRequest.lastTime){
                console.log('最后访问时间为0');
                return false;
            }

            console.log('目前执行时长：',new Date().getTime() - taskRequest.lastTime);


            //超过5分钟超时
            if (new Date().getTime() - taskRequest.lastTime > _timeout) {

                var msg = '做账超时';

                notes('做账超时');
                //发送钉钉
                dingdingHookSend(msg);
            }
        }

        setTimeout(lsBaoTimeout,60e3);
    })

}

//钉钉通知
function dingdingHookSend(content, autoJumpHref){
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://oapi.dingtalk.com/robot/send?access_token=a5628e2668b082b344cdfbf7ad76138d6731fae464af4c4cab6d2b56f6a899de",
        "method": "POST",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache"
        },

        "data": '{ "msgtype": "text", "text": { "content": "'+content+'" } }'
    }

    $.ajax(settings).done(function (response) {
        console.log(response);

        console.log('推送钉钉成功,更新最后访问时间');
        taskRequest.lastTime = new Date().getTime();

        if(autoJumpHref){
            setTimeout(function(){
                location.href = autoJumpHref;
            }, 2000);
        }
    });
}