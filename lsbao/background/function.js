//background.func.js

//message 公用 action
M.global = {
	setHostStatus: function(request, sender){
		setLocal({host_status: request.hostStatus}, function () {
			statusReport(request.hostStatus, request.timeout);
		});
	},
	startHost: startHost,
	hostStep: setHostStep,
	resetHostByStep: watchDogTimeOut,
	notify: function(request, sender){
		notify(request.message);
	},
	next_app_task: function(request, sender){
		TC.done(sender, request);
	},
    taskDone:function(request,sender){
		M.global.next_app_task(request,sender)
	},
	taskReset:function (request,sender) {
        TC.reset(request.taskName, sender);
    }

};


function background_default(){
	console.log("XSS background default func");

	useLocal(function(local){

		if(local.task && local.host_code){

			notify(local.host_code);

		}else{
            startHost();
		}



	});


}

/**
 * chrome content setting
 */
function chromeContentSetting(){
    console.log('XSS Content Settings');
    //允许下载弹窗
    chrome.contentSettings.popups.set({primaryPattern: '*://main.kdzwy.com:*/*', setting: 'allow'});
}


//global.saveLoginType, submit_order.saveOrderInfo



//监听更新事件
function update_check_available_listener(){
	chrome.runtime.onUpdateAvailable.addListener(function(details){
		console.log("update check available");
		chrome.runtime.reload();
	});
}

function extensionsAutoUpdateCheck(callback){
	chrome.runtime.requestUpdateCheck(function(status, details){
		//"throttled", "no_update", or "update_available"
		console.log('update status:',status);
		if(status == 'update_available'){

            update_check_available_listener();
			//防止更新失败导致插件停止
			setTimeout(function () {
				notify('插件没有自动更新 ,手动刷新');
				chrome.runtime.reload();
            },60e3)

			setLocal({host_step:0},function(){
				watchdog_timeout_count = 0;//超时次数清空
			})
			notify('XSS版本自动升级' + details.version);
		}else{
			setLocal({update_check: true, extension_reload: true}, function(){
				console.log('XSS NO UPDATE');
				notify('XSS 没有进行更新');
				callback && callback();
			});

		}

	});
}


function smToTab(tabId, action, value, callback){
	chrome.tabs.sendMessage(tabId, {'act': action, 'val': value || {} }, function(){
		callback && callback();
	});
}


/**
 * 插件 自动关闭
 */
function extension_self_disabled(){
	chrome.management.getSelf(function(selfInfo){
		chrome.management.setEnabled(selfInfo.id, false, null);
	});
}

/**
 * 获取对应域cookie
 * @param details
 * @param callback
 */
function getCookies(details,callback){
	//details = {domain: "taobao.com"}
	chrome.cookies.getAll(details, function(cookies) {
		console.log(cookies);
		callback && callback(cookies);
	});
}

/**
 * 设置对应域cookie
 * @param details
 * @param callback
 */
function setCookies(details,callback){
	chrome.cookies.set(details, function (cookie){
		console.log('set cookies result', cookie);
		callback && callback();
	});
}

/**
 * 删除对应域cookie
 * @param details
 * @param callback
 */
function removeCookies(details, callback){
	chrome.cookies.remove(details, function (cookie){
		console.log('remove cookies result', cookie);
		callback && callback();
	});
}




/**
 * 设置任务运行状态
 * @param status
 */
function setHostStatus(status, callback){
	setLocal({host_status: status}, function () {
		statusReport(status,60, callback);
	});
}
/**
 * 设置主机运行步骤
 * @param step
 */
function setHostStep(step, callback){
	setLocal({host_step: step}, function(){
		callback && callback();
	});
}

/**
 * 插件状态报告，发送
 * @param callback
 */
function statusReport(status, timeout, callback) {

	var API = new Api();

	last_watchdog_time = new Date().getTime();

	useLocal(function(local){

		var host_status_result = _host_status[status].text;
		var host_status_timeout = _host_status[status].timeout;
		host_status_timeout = timeout===undefined?(host_status_timeout===undefined?60:host_status_timeout):timeout;//没有设置超时时间默认60

		console.log(status,host_status_result,local);

		callback && callback();

		hostRunningMessage(host_status_result, host_status_timeout);
	});
}

/**
 * 汇报主机及时状态
 * @param message
 * @param timeout
 */
var oldMessage,oldTimeout,oldReportHostMessageTime;
function hostRunningMessage(message, timeout){

	//发送提示信息到tracker
	// send_notes_to_tracker("["+timeout+"]"+message);

	var nowTime = $.now();
	if(oldMessage==message&&timeout==oldTimeout&&(oldReportHostMessageTime-nowTime)<oldTimeout){
		console.log("消息重复不报告给服务器");
		return null;
	}
	oldMessage=message,oldTimeout=timeout;
	oldReportHostMessageTime= $.now();

	// reportHostMessage(message, timeout);

	 //reportHostRunningMessage(message, timeout);

}
/**
 * 状态设置为0的时候需要执行的，开始或重新开始或下一单
 */
function startHost(){
	useLocal(function(local){

		//最后一单否
		if (local.last_order) {


		} else {
			//不是最后一单继续领单，
			GetTaskStatus = false;
			StartTaskOpenUrl = false;

			//清空 app任务
			taskRequest.lastTime=(new Date).getTime();//防止任务超时
			TC.tasks = [];

			//停止label超时
			labelWatch.time='';

			//初始化客户端  关闭所有窗口 准备开始任务
			setHostStatus(1, function(local){

                CloseWindowsAll(select_task_by_usage)

			});
		}
	});

}

/**
 * 任务开始
 */
function taskStart(){

    //任务需要自动开始
    setLocal({isRunning: true}, function(){
        useLocal(function(local){
            taskStartBoot();
        })

    });
}


function select_task_by_usage(){

    taskStart();//任务开始,

	//获取任务前 先检查插件是否需要更新
	// var API = new Api();

	// API.get_extension_update_status_api(local.host_id,function(ret){
	// 	if(ret.data){
	// 		var usage = local.usage;
	// 		if(!compare_versions(local.version_env, chrome.runtime.getManifest().version, ret.data)){
	// 			setLocal({update_check: true, extension_reload: true}, function(){
	// 				extensionsAutoUpdateCheck(function(){
	// 					taskStart();//任务开始,
	// 				});
	// 			});
	// 		}else{
    //
	// 			notes("已经是最新版本! bangbang 哒！");
    //
	// 			taskStart();//任务开始,
	// 		}
	// 	}else{
	// 		notify("插件未知");
	// 	}

	// }, function(){
	// 	setTimeout(function(){
	// 		select_task_by_usage(local);
	//
	// 	}, 5000);
	// });

}


//关闭所有窗口
function CloseWindowsAll(callback) {

    console.log('close window all');
    chrome.windows.getAll(function (wins) {
        var winsLength = wins.length;
        var index = 0;
        if(winsLength > 0){
            for (var i = 0; i < winsLength; i++) {
                chrome.windows.remove(wins[i].id, function () {
                    index++;
                    if (winsLength == index) {
                        //清除local
                        setTimeout(function () {
                            clearCookies(function () {
								callback();
                            });
                        }, 3000);

                    }

                });

            };
        }else{
            callback();
        }
    });
}

//清除storage
function clearCookies(func) {
    useLocal( function (data) {
        var removeLocal = [
        	'task',
			'sharedTaskWorks',
			'login_reload_nums',
            'gz_finished',
			'vch_created',
			'checkout_finished',
			'total_money',
			'subject_name',
			'year_week',
			'vch_printted',
			'jtgz_finished',
			'ffgz_finished',
			'task_finished',
			'tax_fee_saved',
            'tax_sn',
            'target_name',
			'sys_company_info',
			'nodeId',
			'fee',
			'target_name_filter_nums',
			'create_subject_code',
			'subject_name',
			'subject_names',
			'vouchers',
			'vch_list',
			'create_subject_money',
			'create_borrow_vch',
			'employee_name'
        ];
        chrome.storage.local.remove(removeLocal, function() {

            // clear_brower_cookies();
            notes('清理storage成功');
            func && func();
    	});

	})
}

function clear_brower_cookies(func){

    chrome.browsingData.remove(
        {
            originTypes: {
                unprotectedWeb: true,
                protectedWeb: true
            }
        }, {
            cookies: true,
            appcache: true,
            cache: true,
            history: true,
            indexedDB: true,
            localStorage: true
        },
        function () {
            notes('清理浏览器成功')
            setLocal({clearCookies:true},function(){
                func && func();
            })

        }
    );
}


/**
 * 插件重新按照当前步骤自动处理（看门狗计时器超出时执行）
 */
function watchDogTimeOut(){
	TC.tasks.length && TC.resetCurrentTask();
	console.log('watchDogTimeOut 不处理');
	return false;

}

function updateLastRequestTime(){
	console.log('更新最后请求时间');
    taskRequest.lastTime = new Date().getTime();
}

function currTaskReset(){
	TC.resetCurrentTask();
}

function sendMessageToTab(msg, sender){

    if(msg.tabId>0){
        msg.data.sender = sender;
        chrome.tabs.sendMessage(msg.tabId, msg.data);
    }else{
        console.log(msg);
        chrome.tabs.query({url: msg.url}, function(tabs){
            console.log(tabs);
            if(tabs.length > 0){
                var tabId = tabs[0].id;
                msg.data.sender = sender;
                chrome.tabs.sendMessage(tabId, {act:msg.data});
            }else{
                chrome.tabs.sendMessage(sender.tab.id, {act: 'url_error', data: msg.data});
            }
            //chrome.tabs.sendMessage(sender.tab.id, {act: 'https_tabs_verify_code_result', cid: 123, text: 'text'});
        });
    }
}



function closeOtherTabs(sender){
    //关闭sender中其他的tab
    if (sender && sender.tab) {
		//console.log(sender);
        chrome.windows.getAll({populate:true},function(wins){
            //console.log(wins);
            if(wins.length >0){
	            wins.forEach(function(win){
		            //console.log(win);
		            if(win.id != sender.tab.windowId){
			            //console.log('remove window', win);
			            chrome.windows.remove(win.id);
		            }else{
			            win.tabs.forEach(function(tab){
				            if(tab.id != sender.tab.id ){
					            //console.log('remove tab', tab);
					            chrome.tabs.remove(tab.id);
				            }
			            });
		            }
	            })
            }
        })
    }
}

function create_incognito_window(config,callback) {
    chrome.windows.create({
        url: config.url
        // incognito: true
    },function (w) {
        chrome.windows.update(w.id, {state: "maximized"});
        chrome.windows.getAll({}, function (windows) {
            for(var i=0;i<windows.length;i++){
                if(windows[i].id!=w.id){
                    chrome.windows.remove(windows[i].id)
                }
            }
            // setCookiesAndUA(function () {
            //     chrome.windows.update(w.id, {state: "maximized"});
            //     chrome.tabs.create($.extend(config,{windowId:w.id}), function (incognitoWindow) {
            //         callback && callback(incognitoWindow);
            //     });
            // });
        })
    })
}

function create_tab_by_url(url){
    chrome.windows.getCurrent(function(window){
			if(window.id > 0) {
                chrome.tabs.create({windowId:window.id,url:url},function(tab){
                    console.log('进入账套页面',tab);

                    setTimeout(function(){
                        // chrome.tabs.remove(tab.id);
                    },3*1000)
                });
			}
    })

}

//打印完成，关闭tab
function close_tab_ignore_url(){

    var url = 'main.kdzwy.com/guanjia/#/home';

    chrome.tabs.query({},function(tabs){
        tabs.forEach(function(tab){
            if(tab.url.indexOf(url) != -1){
                //刷新主页
                chrome.tabs.reload(tab.id);
            }else{
                //关闭多余tab
                chrome.tabs.remove(tab.id);
            }
        })
    })
}

//任务结束
function updateTaskStatus(data){

    var API = new Api();

	API.updateTaskStatus(data,function(res){

		console.log(res);

		if(res.success){
			notify('做账任务状态汇报成功');
			startHost();
		}else{
			notify(res.message);

            setTimeout(function(){
                updateTaskStatus(data);
            },5*1000)
		}

	},function(){
		notify('请求更新任务状态接口失败');

		setTimeout(function(){
            updateTaskStatus(data);
		},5*1000)
	})

}

//保存报税金额
function save_tax_fee(data,sender){
    var API = new Api();
    API.save_tax_fee(data,function(ret){
        if(ret.success){
            notify('保存报税金额成功');
            setLocal({tax_fee_saved:true},function(){
                chrome.tabs.sendMessage(sender.tab.id,{act:'tax_fee_saved'});
			})
        }else{

            notify(ret.message);

            setTimeout(function(){
                save_tax_fee(data);
            },3*1000)
        }
    },function(){
        console.log('请求保存报税金额失败,3S后重新请求');
        setTimeout(function(){
            save_tax_fee(data);
        },3*1000)
    })

}

function enter_book(open_url){

    useLocal(function (local) {

        create_tab_by_url(open_url);


    })
}

//设置主页为起始页
function setStartPage(taskType,url) {
    TaskRunInfo.taskTypes.forEach(function (tType) {
        if(tType.taskType == taskType){
            tType.startPage = url;
        }
    })
}

//记录本地日志
function native_log(msg){

	if(msg){
        port.postMessage({key:'debugconsole', data:msg});
	}

}