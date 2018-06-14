//任务控制中心
// var appTasks = [];
// var taskConfig={};
// var apiTaskConfig={};
var TC = {
    label: '',
    tasks: [],
    taskConfig: {},
    apiTaskConfig: {},
    addTask: function (taskName) {
        if (TC.tasks.indexOf(taskName) == -1) {
            console.log(fullDateTime()+' 新任务: ' + taskName);
            TC.tasks.push(taskName);
        }
    },
    'status': false, //是否可以初始化的标识
    'checkTaskType': function (_apiTaskType, task_id, task_detail, tasks) {



        //转换名称
        if(typeof TC.apiTaskConfig[_apiTaskType]=='undefined') return tasks;
        var apiTaskType = TC.apiTaskConfig[_apiTaskType].taskType
        var taskName = apiTaskType+"_"+task_id;

        if (TC.apiTaskConfig[_apiTaskType]) {
            //console.log(TC.apiTaskConfig[_apiTaskType])
            TC.addTask(taskName)
            tasks = tasks || {};
            if (taskName in tasks) {
                console.error('警告:推送了重复任务', taskName);
                notify('警告:推送了重复任务'+taskName, 15);
            } else {
                tasks[taskName] = $.extend({}, task_detail);
                tasks[taskName].uuid = '' + task_id;
                tasks[taskName].config = $.extend({}, TC.apiTaskConfig[_apiTaskType]);;

                //设置不同端初始页面
                taskTypes.forEach(function(tType){
                    if(tType.apiTaskType == _apiTaskType){
                        doSetStartPage(tType.taskType,task_detail);
                    }
                })
                


            }
            return tasks;
        } else {
            notify('不支持的任务类型 ' + _apiTaskType, 5)
            return tasks;
        }
    },
    init: function () {
        //重新初始化TC.tasks
        if (TC.status) {
            console.error('多次初始化任务中心, 错误');
            return false;
        }
        TC.status = true;
        TC.taskIndex = 0;
        TC.currentTask = "";
        TC.currentTaskType = "";
        TC.donelist = {};
        TC.watch = {};
        TC.uuids={};
        console.log('任务中心初始化')

        var __started=false;
        function __start() {
            if(__started) return;
            __started = true;
            TC.start();
        }

        __start();
        //20s后强制开始
        //setTimeout(__start, 20000);

        //create_incognito_window({url: "about:blank"},__start);
    },
    start: function (sender) {
        console.log('任务中心 start')
        useLocal(function (local) {

            // var taskType = local.tasks[TC.tasks[TC.taskIndex]].config.taskType;
            // var taskId = local.tasks[TC.tasks[TC.taskIndex]].uuid
            var taskType = 'zero_declaration';
            notify(taskType)
            TC.currentTaskType = taskType
            console.log('当前任务标识 ', taskType);
            setLocal({
                taskType: TC.currentTaskType,
                // taskId: TC.currentTask
            }, function () {
                // taskRequest.taskTimeout[TC.currentTask] = (new Date).getTime();
                app_start(local, sender);
            });
        });
    },
    next: function (sender) {
        console.log('任务中心 next')
        getSharedTaskWorks(function (shared) {
            if(shared.taskPoint){
                notify('有任务重做了 现在进行任务回归');
                setSharedTaskWorks({taskPoint:null},function () {
                    TC.taskIndex = shared.taskPoint;
                    if (TC.tasks.length <= TC.taskIndex) TC.end()
                    else TC.start(sender);
                })
            }else{
                //apptask next
                TC.taskIndex++;
                if (TC.tasks.length <= TC.taskIndex) TC.end()
                else TC.start(sender);
            }
        })

    },
    reset:function (taskName,sender) {
        console.log('任务中心 reset')
        if(TC.watch.resetIng==true){
            setTimeout(function () {
                TC.reset(taskName,sender);
            },1000);
            return false;
        }else{
            TC.watch.resetIng=true;
        }
        useLocal(function (local) {
            var _find = false;

             var _fIndex=-1;
            
            // local.tasks.forEach(function (localTasks) {
                for(var i in local.tasks){

                    _fIndex++;

                    var localTasks = local.tasks[TC.tasks[_fIndex]];//local.tasks[i];

                    if(localTasks.config.taskType == taskName){
                        _find = true;
                        notify('找到了需要重置的任务 开始准备重置')
                        // while(local.tasks[TC.tasks[TC.taskIndex]].config.taskType != taskName){
                        //     delete TC.donelist[local.tasks[TC.tasks[TC.taskIndex]].config.taskType];
                        //     TC.taskIndex--;
                        // }

                        while(TC.taskIndex != _fIndex){
                            console.error(TC.taskIndex +  '!=' + _fIndex);
                            delete TC.donelist[local.tasks[TC.tasks[TC.taskIndex]].config.taskType];
                            delete TC.uuids[local.tasks[TC.tasks[TC.taskIndex]].config.taskType +'#'+ TC.tasks[TC.taskIndex]];
                            TC.taskIndex--;
                        }
                        delete TC.donelist[local.tasks[TC.tasks[TC.taskIndex]].config.taskType];
                        delete TC.uuids[local.tasks[TC.tasks[TC.taskIndex]].config.taskType +'#'+ TC.tasks[TC.taskIndex]];
                        closeOtherTabs(sender);
                        TC.watch.resetIng = false;
                        TC.start(sender);
                        break;
                    }
                }
            // })
            if(_find==false){
                TC.watch.resetIng = false;
                notify('没有找到需要重置的任务 重置当前任务')
                // startHost();
                closeOtherTabs(sender);
                TC.start(sender);
            }
        })
    },
    resetCurrentTask:function (sender) {
        console.log('任务中心 resetCurrentTask')
        closeOtherTabs(sender);
        TC.start(sender);
    },
    redo:function (taskName,condition,sender) {
        useLocal(function (local) {
            var _find = false;
            var _tempTaskIndex = -1;//每次开始递增 从-1开始 方便第一个是0
            for(var i in local.tasks){

                if(!_find){
                    _tempTaskIndex++;
                }
                
                // var localTasks = local.tasks[i];
                var localTasks = local.tasks[TC.tasks[_tempTaskIndex]];
                if(localTasks.config.taskType == taskName){
                    //开始判断condition
                    for(var c in condition){
                        if(localTasks[c] && localTasks[c] == condition[c] && !_find){
                            _find = true;
                            setSharedTaskWorks({taskPoint:TC.taskIndex},function () {
                                //删除当前任务donelist 需要回归 防止错误
                                delete TC.donelist[local.tasks[TC.tasks[TC.taskIndex]].config.taskType];
                                delete TC.uuids[local.tasks[TC.tasks[TC.taskIndex]].config.taskType +'#'+ TC.tasks[TC.taskIndex]];
                                //删除需要重做的任务的donelist
                                delete TC.donelist[local.tasks[TC.tasks[_tempTaskIndex]].config.taskType];
                                delete TC.uuids[local.tasks[TC.tasks[_tempTaskIndex]].config.taskType +'#'+ TC.tasks[_tempTaskIndex]];
                                TC.taskIndex = _tempTaskIndex;
                                notify('找到了指定重做的任务 准备重做')
                                closeOtherTabs(sender);
                                TC.start(sender);
                                // break;
                            })

                            break;
                        }
                    }
                }
            }
            if(_find==false){
                notify('找不到指定重做的任务 重置当前任务')
                TC.resetCurrentTask(sender);
            }
        })
    },
    done: function (sender, val) {
        notify('taskDone ' + val.taskType + '|' + sender.bgTaskVars.uuid);
        //todo 当前任务是不是taskType 是的话 next 不是的话 忽略消息
        if(TC.uuids[sender.bgTaskVars.uuid]){
            notify('重复汇报完成 忽略');
            return false;
        }

        var filter_rear_task_types = ['rearReceipt','rearComment','rearShare','rearAppended'];

        if (TC.donelist[val.taskType] && val.taskType != 'search' && filter_rear_task_types.indexOf(val.taskType) == -1) {
            console.log('app task no done ', val.taskType);
        } else {
            TC.uuids[sender.bgTaskVars.uuid] = sender.bgTaskVars.uuid;
            TC.donelist[val.taskType] = val.taskType;

            setTimeout(function () {
                //next
                TC.next(sender);
            }, 5000);

            //关闭sender中其他的tab
            closeOtherTabs(sender);
        }
    },
    end: function () {
        console.log('task end');
        //todo 结束整个任务流程
        //app任务 全部执行完毕
        TC.tasks = [];
        TC.status = false;
        TC.watch = {};
        taskRequest.lastTime = (new Date).getTime();//防止任务清理之后超时
        startHost();

    },
    taskIndex: 0,
    currentTaskType: '',
    currentTask: '',
    watch:{},
    donelist: {}
}

function app_start(local, sender) {

    var task_types = ['zero_declaration'];

    // send_storage_to_tracker();
    closeOtherTabs(sender)
    if (sender) {

        // if(task_types.indexOf(TC.currentTaskType) != -1){
        //     doSetStartPage(local);
        // }
        
        chrome.tabs.sendMessage(sender.tab.id, {
            act: 'global.appTaskStart'
        });
    } else {

        var _startPage = getStartPage(TC.currentTaskType);

        console.warn('_startPage',_startPage);
        create_incognito_window({
            url: _startPage
        }, function (openTab) {
            console.warn('tabInfo ',openTab);
            // closeOtherTabs({tab:openTab})
        });
    }
}

function getStartPage(currentTaskType){
    var startPage = null;
    taskTypes.forEach(function(taskType){
        if(taskType.taskType == currentTaskType){
            startPage =  taskType.startPage;
        }
    })

    return startPage;
}

function showTcStatus() {
    console.info('任务状态:',TC.tasks,TC.currentTask);
    setTimeout(showTcStatus,30000);
}
showTcStatus();