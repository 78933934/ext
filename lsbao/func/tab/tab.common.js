var tabCommon = {

    /**
     * Promise简写
     * @param cb
     * @returns {Promise}
     */
    func: function (cb) {
        return new Promise(cb);
    },

    /**
     * background sendMessageTobackground ，tab发送数据到background
     * @param act
     * @param data
     */
    sm: function(action, val, callback) {
        // //处理需要传递的参数
        // var varList = ['uuid'];//参数白名单 除去前缀的命名部分
        // var _vars = {};
        // for (var i=0; i<varList.length; i++){
        //     _vars[varList[i]] = vars[varList[i]];
        // }

        useLocal(function(local){

            //.saveLogintype = global.saveLoginType   //公用的加 .
            //saveOrderInfo = submit_order.saveOrderInfo //默认不加

            if(action.indexOf('.')==0){
                action = 'global'+action;
            }else{
                action = local.taskType + '.' + action;
            }
            console.warn('sm', action);
            var data = {'act': action, 'val': val };
            chrome.runtime.sendMessage(data, function (response) {
                callback && callback(response);
            });
        });

    },
    messageListener:{
        global:{
            appTaskStart:function () {
                useLocal(function (local) {
                    // clue('收到了执行任务的通知 本页面如果不跳转 将在30s后关闭')
                    common__index(local);
                    setTimeout(function () {
                        // close_this_tab()
                    },30e3)
                })
            },
            backgroundScreenShotResult:function (request) {
                console.log('截屏结果',request);
                if(request.img){
                    uploadImage(request.img,
                        function(url){
                            tabCommon.sm(taskVars, '.imageUploadResult',{url:url,order_id:request.order_id,task_type:request.task_type});
                        },
                        function(){
                            tabCommon.sm(taskVars, '.imageUploadResult',{url:null});
                        }
                    );
                }else{
                    console.error('截图失败');
                }
            },
            labelTimeoutDefault:function () {
                getTaskWorks(function (local) {
                    clue('labelTimeoutDefault');
                    local.reflush = local.reflush ||0
                    local.reflush++;
                    if(local.reflush>3){
                        setTaskWorks({reflush:0},function () {
                            tabCommon.sm(taskVars, '.currentTaskReset');
                            clue('超时刷新3次喽。。')
                        })
                    }else{
                        setTaskWorks({reflush:local.reflush},function () {
                            top.location.reload()
                        })
                    }
                })
            }
        }
    },

    addMessageListener:function (act,cb) {
        useLocal(function (local) {
            tabCommon.messageListener[local.taskType] = tabCommon.messageListener[local.taskType] || {}
            tabCommon.messageListener[local.taskType][act] = cb
            console.log(tabCommon.messageListener)
        })
    },

    startCallback:{},

    
    observers:{},

    /**
     *
     * @param element
     * @param option
     */
    observer:function (element,option) {
        var observer_config = {
            attributes: true,
            childList: true,
            characterData: true,
            attributeOldValue: true,
            characterDataOldValue: true,
            subtree: true
        }
        var obId=randomString();
        tabCommon.observers[obId] = [];
        var option = option?option:observer_config
        addMutationObserver(element,function(mutation){
            tabCommon.observers[obId].push(mutation)
        },option);
        return obId;
    },

    mutation:function (obId,cb) {
        if(obId){
            while (tabCommon.observers[obId].length>0){
                cb(tabCommon.observers[obId].shift())
            }
            setTimeout(function () {
                tabCommon.mutation(obId,cb)
            },100)
        }
    },
    

    screenShot:function (callback,autoUpload){
        $('#panel-XSS').remove();
        $('#alertify-logs').remove();
        var autoUpload = autoUpload?autoUpload:false;
        tabCommon.addMessageListener('screenShotResult',function (request) {
            if(request.img){
                if(autoUpload){
                    uploadImage(request.img,
                        function(url){
                            callback && callback(url)
                        },
                        function(){
                            callback && callback();
                        }
                    );
                }else{
                    callback && callback(request.img);
                }
            }else{
                console.error('截图失败');
            }
        })
        tabCommon.sm(taskVars, '.screenShot');
    },

    

    /**
     * 任务中心汇报任务
     * @param taskType
     */
    report: function (taskVars, taskType) {
        tabCommon.sm(taskVars, '.next_app_task', {taskType:taskType});
    },

    gotoUrl: function (url) {
        window.location.href = url;
    },

    TabEnd: {}
}