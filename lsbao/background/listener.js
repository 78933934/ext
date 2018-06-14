
/**
 * bg接收tab的message
 */
function backgroundMessageListener() {
	console.log('XSS background message listener');
	chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
		last_watchdog_time = new Date().getTime();
		//console.log('message receive:', msg, sender);
        sender.bgTaskVars = msg.bgTaskVars;
        console.warn('message: ',msg.act, msg.val, sender);
        try{
			var request = msg;
			//global.saveLoginType, submit_order.saveOrderInfo
			new Function('request','sender', 'M.'+request.act+"(request,sender)")(request.val,sender);
		}catch(e){
			
			var request = msg;

			console.log('global方法:' + request.act +' 未定义');
			//兼容sm方法的.
            msg.act = msg.act.replace('global.','',msg.act);

			switch (msg.act) {

				case 'order_operate':
					//订单操作 重置，异常
					client_task_order_operate(msg.val);
					break;
				case 'drop_order':
					orderGroupException('XSS 手动踢单',sender,msg.val);
					break;
				// case 'curr_task_reset':
				// 	M.global.currentTaskReset(request,sender);
				// 	break;
				case 'https_tabs_verify_code': //https打码，传入img地址
					httpsTabsVerifyCode(msg, sender);
					break;
				case 'https_tabs_verify_code_from_uuyun': //https打码，传入img地址
					httpsTabsVerifyCodeFromUUYun(msg, sender);
					break;
				// case 'https_tabs_verify_code_for_chat': //聊天打码，传入img地址
				// 	httpsTabsVerifyCodeForChat(msg, sender);
				// 	break;
				case 'get_chat_msg': //获取聊天信息
					getChatMsg(sender);
					break;
				case 'https_tabs_verify_code_by_base': //https打码，传入base64编码
					httpsTabsVerifyCodeByase64(msg, sender);
					break;
				case 'https_tabs_verify_code_by_base_from_youyouyun': //https打码，传入base64编码
					httpsTabsVerifyCodeByase64FromYouyouYun(msg, sender);
					break;
				case 'https_tabs_verify_fail': //https打码错误，报错
					httpsTabsVerifyFail(msg);
					break;
				case 'https_tabs_verify_fail_to_youyouyun': //优优云打码结果错误，报错
					httpsTabsVerifyFailToYouyouYun(msg);
					break;
				case 'save_host_task_order_detail': //保存订单详情数据
					useLocal(function(local){
						local.task.business_slug
						if(local.task.business_slug == 'jd'){
							// saveHostTaskOrderDetail();
							// saveUserCookiesToRemote('jd.com', saveHostTaskOrderDetail);
							saveUserCookiesToRemote('jd.com', function(){
								getSharedTaskWorks(function(sTask){
									if(sTask.is_group){
										saveGroupHostTaskOrderDetail(sender,msg.val);
									}else{
										saveHostTaskOrderDetail(sender);
									}
								})
								
							});
						}else if(local.task.business_slug == 'yhd'){
							saveUserCookiesToRemote('yhd.com', saveHostTaskOrderDetail);
						}else{
							// saveHostTaskOrderDetail(sender);
							getSharedTaskWorks(function(sTask){
								if(sTask.is_group){
									saveGroupHostTaskOrderDetail(sender,msg.val);
								}else{
									saveHostTaskOrderDetail(sender);
								}
							})
						}
					})
					break;
				case 'order_exception': //订单标记异常 + 备注信息
					getSharedTaskWorks(function(sTask){
						if(sTask.is_group){
							var order_ids = msg.order_ids ? msg.order_ids : '';
							var task_order_id = msg.task_order_id ? msg.task_order_id : '';
							orderGroupException(msg.val,sender,task_order_id,order_ids);
						}else{
							orderException(msg.val,sender);
						}
					})
					
					break;
				case 'set_cookies_to_windows':
					setUserCookiesToWindows(msg.val);sendResponse();
					break;
				case 'remove_domain_cookies_but_str':
					removeDomainCookies(msg.val.domain, msg.val.but_str, function(){
						//chrome.tabs.sendMessage(sender.tab.id, {act: 'https_tabs_verify_code_result', cid: 123, text: 'text'});
						setHostStep(3, function(){
							useLocal(function(local){
								var task = local.task;
								if(task.is_mobile == '1'){
									task.promotion_url = 'http://m.jd.com/?utm_source=';
								}else{
									task.promotion_url = 'http://www.jd.com/?utm_source=';
								}
								setLocal({task: task}, function(){
									watchDogTimeOut();
								});
							});

						});

					});
					break;
				case 'change_id_card':
					var reason = msg.val;
					changeIdCard(reason,function(identity){
						chrome.tabs.sendMessage(sender.tab.id, {act: 'id_card_changed', identity: identity});
					});
					break;
				case 'storage_to_tracker': //发送storage给赤兔
					send_storage_to_tracker();
					break;
				case 'search_keyword_exception'://搜索关键词异常
					keywordsException();
					break;
				case 'add_360hk_cookie_thor'://补上hk登录状态
					add360hkCookieThor(function(){
						chrome.tabs.sendMessage(sender.tab.id, {act: 'created_360hk_cookie_thor'});
					});
					break;
				case 'check_active_tab':
					checkActiveTab(sender.tab.id);
					break;
				case 'save_order_info'://保存订单信息
					getSharedTaskWorks(function(sTask){
						if(sTask.is_group){
							saveGroupOrderInfo(msg.val,sender.tab.id);
						}else{
							saveOrderInfo(msg.val,sender.tab.id);
						}
					})
					
					break;
				case 'get_payment_info'://保存订单信息
					getPaymentInfo(sender);
					break;
				//save_bank_form_to_remote
				case 'save_bank_form_to_remote'://保存银行表单信息
					console.log(msg);
					getSharedTaskWorks(function(sTask){
						if(sTask.is_group){
							saveGroupBankFormToRemote(msg.data.bank,msg.data.bank_order_id,msg.data.body,msg.amount);
						}else{
							saveBankFormToRemote(msg.data.bank,msg.data.bank_order_id,msg.data.body,msg.amount);
						}
					})
					
				case 'change_proxy'://再次拨号更换代理
				                    //openAdslForChangeProxy(sender);
				                    // changeProxy(sender);
					break;
				case 'get_pay_state':
					getSharedTaskWorks(function(sTask){
						if(sTask.is_group){
							getGroupPayState(sender);
						}else{
							getPayState(sender);
						}
					})
					
					break;
				case 'set_exception':
					getSharedTaskWorks(function(sTask){
						if(sTask.is_group){
							reportGroupProductStockout(msg.val,sender,msg.task_order_id ? msg.task_order_id : '');
						}else{
							reportProductStockout(msg.val,sender);
						}
					})
					// reportProductStockout(msg.val,sender);
					break;
				case 'add_remark':
					getSharedTaskWorks(function(sTask){
						if(sTask.is_group){
							addGroupTaskOrderRemark(msg.val,sender);
						}else{
							addTaskOrderRemark(msg.val,sender);
						}
					})
					// addTaskOrderRemark(msg.val,sender);
					break;
				case 'get_order_payment_info':
					getOrderPaymentInfo(sender);
					break;
				case 'save_business_check_order':
					saveBusinessCheckOrder(msg.val);
					break;
				case 'save_comment_state':
					// saveCommentState(msg.val);
					break;
				case 'next_app_task':
					TC.done(sender,msg.val)
					break;
				case 'disable_account':
					//禁用账号
					//config/background.js taskTypes配置每个任务执行的禁用账号操作
					// taskConfig[TC.currentTaskType].disableAccount(msg.val, sender);

					M.global.disableAccount(msg.val,sender);
					break;

					console.log(M)

					M[TC.currentTaskType].accountFail(msg, sender);

					//先执行帐号禁用 之后执行各自的accountFail
                    appDisableAccount(msg.val,sender,function (msg, sender) {
                        M[TC.currentTaskType].accountFail(msg, sender)
                    });

					var task_type = TC.currentTaskType;

					if(task_type == 'xss' || task_type == 'payment'){
						appDisableAccountOrderReset(msg.val, sender);
					}else{
						appDisableAccount(msg.val, sender);
					}
					break;
				case 'save_no_found_order':
					saveNoFoundOrder(msg.val);
					break;

				default:
					break;


			}
		};
		//消息完成
		sendResponse();
	});
}


/**
 * 取消所有下载任务
 */
function chromeDownloadsCancel(){
	console.log('XSS background download cancel listener');
	chrome.downloads.onCreated.addListener(function(data){
		console.log(data);
		chrome.downloads.cancel(data.id);

		//if(data.url.indexOf('jd.com') != -1){
		//    chrome.downloads.cancel(data.id);
		//}
	})
}


/**
 * 阻止部分请求
 * 涉及到相关请求(已知固定) 直接取消
 */
function impede_request_listener(){
	chrome.webRequest.onBeforeRequest.addListener(function(details){

		//console.log('阻止google相关地址&JD广告');
		//console.log(details);
		return {cancel: true};

	}, {urls: [
		"*://www.googleadservices.com/*", //google
		"*://www.googletagmanager.com/*", //google
		"*://*.360buyimg.com/n1/*",
		"*://*.360buyimg.com/n2/*",
		"*://*.360buyimg.com/n3/*",
		"*://*.360buyimg.com/n4/*",
		"*://*.360buyimg.com/n5/*",
		"*://*.360buyimg.com/n6/*",
		"*://*.360buyimg.com/n7/*",
		"*://*.360buyimg.com/n8/*",
		"*://*.360buyimg.com/n9/*",
		"*://*.360buyimg.com/n0/*",
		"*://*.360buyimg.com/n11/*",
		"*://*.360buyimg.com/n12/*",
		//"*://*.360buyimg.com/m/*",
		"*://*.360buyimg.com/cms/*",
		"*://*.360buyimg.com/mobilecms/*",
		"*://*.360buyimg.com/imgzone/*",
		"*://*.360buyimg.com/da/*",
		"*://*.360buyimg.com/vclist/*",
		"*://*.360buyimg.com/popWaterMark/*",
		"*://payrisk.jd.com/*"

	], types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
	}, ["blocking", "requestBody"]);
}

/**
 * 防劫持
 * 阻止打开部分链接地址
 */
function intercept_ad_request_listener(request_cnts){

	request_cnts ? request_cnts : 0;
	chrome.webRequest.onBeforeRequest.removeListener(adRequestListener);
	var API = new Api();
	API.getRequestBlockUrl(function(ret){
		// if(ret.success == 1 && ret.data.length>0){
		//     requestBlockUrls = ret.data;
		// }
		requestBlockUrls = ret;
		chrome.webRequest.onBeforeRequest.addListener(adRequestListener, {urls: requestBlockUrls, types: ["main_frame"]}, ["blocking", "requestBody"]);
	}, function(){
		setTimeout(function(){
			request_cnts++;
			if(request_cnts >1){
				//请求失败超过2次
				console.log('请求cnapi的阻止链接接口失败超过2次，换api');
				API.getRequestBlockUrlAPI(function(ret){
					if(ret.success == 1 && ret.data.length>0){
					    requestBlockUrls = ret.data;
					}
					chrome.webRequest.onBeforeRequest.addListener(adRequestListener, {urls: requestBlockUrls, types: ["main_frame"]}, ["blocking", "requestBody"]);
				},
				function(){
					//请求失败
					intercept_ad_request_listener(request_cnts);
				})
			}else{
				setTimeout(function(){
					intercept_ad_request_listener(request_cnts);
				},3*1000)
				
			}
			
		}, 1000);
	});
}

function adRequestListener(details){
	console.log('阻止JD广告');
	console.log(details);
	if(details.tabId != jd_ad_tab_id){
		setTimeout(function(){
			watchDogTimeOut();
		}, 2000);
	}
	return {cancel: true};
}


/**
 * 获取jd登陆验证码跨域问题
 * @constructor
 */
function JdLoginAuthCodeCrossOriginListener(){
	chrome.webRequest.onHeadersReceived.addListener(
		JdLoginAuthCodeCrossOriginDetails , {
			urls: ["*://authcode.jd.com/*","*://captcha.jd.com/*"]
		}, ['blocking', 'responseHeaders']);
}
function JdLoginAuthCodeCrossOriginDetails(details) {
	console.log("JdLoginAuthCodeCrossOriginDetails");
	details.responseHeaders.push({
		'name': 'Access-Control-Allow-Origin',
		'value': '*'
	});

	return {
		responseHeaders: details.responseHeaders
	}
}
/**
 * 京东登陆验证码listen 去掉
 * @constructor
 */
function JdLoginAuthCodeCrossOriginRemoveListener(){
	chrome.webRequest.onHeadersReceived.removeListener(JdLoginAuthCodeCrossOriginDetails);
}