//message 公用 action
M.global = {
	setHostStatus: function (request, sender) {
		setLocal({host_status: request.hostStatus}, function () {
			statusReport(request.hostStatus, request.timeout);
		});
	},
	startHost: startHost,
	hostStep: function(request){
		setHostStep(request);
	},
	resetHostByStep: watchDogTimeOut,
	notify: function (request, sender) {
		notify(request.message);
	},
	label: function(request, sender){
		hostRunningMessage(request.message, request.timeout);

		console.warn('label消息',request,sender);
        labelWatch.message = request.message;
        labelWatch.time = new Date().getTime();
        labelWatch.timeout = request.timeout||60;
        labelWatch.tab = sender.tab;

	},
	wangwang: function(){
		last_watchdog_time = new Date().getTime();
		labelWatch.time = new Date().getTime();
	},
	next_app_task: function (request, sender) {
		TC.done(sender, request);
	},
	taskDone: function (request, sender) {
		M.global.next_app_task(request, sender)
	},
	taskReset: function (request, sender) {
		TC.reset(request.taskName, sender);
	},
    taskRedo:function (request,sender) {
        TC.redo(request.taskName,request.condition,sender);
    },
    currentTaskReset: function (request, sender) {
        TC.resetCurrentTask(sender);
    },
    screenShot:function (request, sender){
        console.log('request screen capture');
        chrome.windows.getCurrent(function(window){
            if(window.id > 0){
                setTimeout(function(){
                    chrome.tabs.captureVisibleTab(window.id,{format:'png'},function(dataUrl){//截屏
                        // console.log('截屏地址',dataUrl);
                        smToTab(sender.tab.id,'screenShotResult',{img:dataUrl})
                    })
                },3000);
            }
        })
    },
    backgroundScreenShot:function (request, sender){
        console.log('request screen capture',request);
        chrome.windows.getCurrent(function(window){
            if(window.id > 0){
                setTimeout(function(){
                    chrome.tabs.captureVisibleTab(window.id,{format:'png'},function(dataUrl){//截屏
                        // console.log('截屏地址',dataUrl);
                        smToTab(sender.tab.id,'global.backgroundScreenShotResult',{img:dataUrl,order_id:request.order_id,task_type:request.task_type})
                    })
                },100);
            }
        })
    },
    imageUploadResult:function (request, sender) {
        console.log('saveImage', request);
        if (request.url) {
            var api = new Api();
            api.retryTimes = 3;
            api.saveScreenCaptureUrl(request.order_id, request.task_type, request.url)
        }
    },

	sendMessageToTab:function(request, sender){
		sendMessageToTab(request, sender);
	},

	closeOtherTabs:function(request, sender){
		closeOtherTabs(sender);
	},
	delCookies:function(request, sender){
		delCookies(sender);
	},

    create_tab_by_url:function(request,sender){
        create_tab_by_url(request);
    },



    /****新增****/
    //更新任务状态
    updateTaskStatus:function(val,sender){
        updateTaskStatus(val);
    },

    //保存报税金额
    save_tax_fee:function(data,sender){
        save_tax_fee(data,sender);
    },

    //进入账套
    enter_book:function(val,sender){
        enter_book(val);
    },

    //点击进入科目列表
    click_subject_list:function(){

    },

    //记录本地日志
    native_log:function(val){
        native_log(val);
    }




};