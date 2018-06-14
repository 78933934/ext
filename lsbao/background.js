//worm
$(function () {

    //初始化
    init_cfg(function () {
        //chrome系统设置
        chromeContentSetting();

        //页面消息 侦听
        backgroundMessageListener();

        //关闭所有下载
        // chromeDownloadsCancel();

        //background 开始执行 默认要执行的操作
        background_default();

        // labelWatcher();

        //记录超时
        lsBaoTimeout();

        //连接本地应用
        chrome_connect_native();

    });
});

/**
 * 初始化 stroage 数据
 * @param func
 */
function init_cfg(callback) {
    console.log('XSS background init...');
    chrome.storage.local.get(null, function(local) {
        console.log('local.isRunning' ,local.isRunning);
        if(!local.isRunning && local.isRunning == undefined){
            _cfg.isRunning = true;
        }else{
            _cfg.isRunning = local.isRunning;
        }

        if(local.env){
            _cfg.env = local.env;
        }

        setLocal(_cfg, function () {
            callback && callback();
        });
    });
}


/**
 * 记录
 * @param message
 */
function notes(message){
    console.log(message);
    // send_notes_to_tracker(message);
}

function send_notes_to_tracker(message){
    console.log('记录轨迹' + message);
}
/**
 * 桌面提醒
 * @param message
 * @param clear
 */
function notify(message, sec, callback) {
    console.log(message);
    // send_notes_to_tracker(message);
    var opt = {
        type: 'basic',
        title: notice_title,
        message: message,
        iconUrl: 'icon.png'
    };

    chrome.notifications.create('', opt, function (id) {
        sec = parseInt(sec) > 0 ? parseInt(sec) : 5;
        setTimeout(function () {
            chrome.notifications.clear(id, function(){
                callback && callback();
            });
        }, sec * 1000);
    });


    //桌面提醒增加状态报告
    //hostRunningMessage(message, 60);
}

/**
 * 确认ip格式
 * @param value
 * @returns {boolean}
 */
function validate_ip_address(value) {
    var re = new RegExp(/\d+\.\d+\.\d+\.\d+$/)
    return re.test(value)
}

function delCookies(){
    chrome.cookies.getAll({domain:'.jd.com'}, function(cookies){
        console.log(cookies);
        for(i=0; i<cookies.length;i++) {
           removeCookie(cookies[i]);
        }
    });
}

//删除cookie
function removeCookie(cookie) {
  var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
  console.log(url + cookie.name);
  chrome.cookies.remove({"url": url, "name": cookie.name});
}


//检测当前发送消息tab
function checkActiveTab(senderTabId){
    console.log('senderTabId',senderTabId);
    chrome.tabs.query({active:true},function(tab){
        console.log(tab);
        for(var i in tab){
            if(tab[i].id == senderTabId){
                closeTabsNotActive(tab[i].windowId,senderTabId,function(need_reload){
                    chrome.tabs.sendMessage(senderTabId,{act:'check_active_tab_result',is_active:true,need_reload:need_reload});
                })
                 
            }else{
                chrome.tabs.remove(tab[i].id);
                // chrome.tabs.sendMessage(senderTabId,{act:'check_active_tab_result',is_active:false}); 
            }
        }
    })
}

//关闭当前窗口活动tab之外的tabs
function closeTabsNotActive(windowId,senderTabId,callback){
    chrome.tabs.query({windowId: windowId},function(tabs){
        console.log('tabs',tabs);
        if(tabs.length > 1){
            for(var i = 0;i<tabs.length;i++){
                if(tabs[i].id != senderTabId){
                    chrome.tabs.remove(tabs[i].id);
                }
            }

            callback && callback(true);
        }else{
            callback && callback(false);
        }
    })
}

//截屏
function screenCapture(callback){
    console.log('request screen capture');

    chrome.windows.getCurrent(function(window){
        console.log(window);
        if(window.id > 0){
      
        setTimeout(function(){
            chrome.tabs.captureVisibleTab(window.id,{format:'png'},function(dataUrl){//截屏
                //console.log(dataUrl);
                if(dataUrl){
                    callback(dataUrl)
                    //上传图片文件
                    // uploadImage(dataUrl,
                    //     function(url){
                    //         callback(url);
                    //     },
                    //     function(){
                    //         screenCapture(callback);
                    //     }
                    // );
                }
            })
        },3000);
      }  
    })  
}

function client_task_order_operate(act) {
    if (act == 'client_host_status_reset') {
        //重新开始
        startHost();
    }
}

//连接本地应用
function chrome_connect_native(){

    // port = chrome.runtime.connectNative('sws.chrome.console');
    port = chrome.runtime.connectNative('chrome.beifeng.debug.console');

    port.onMessage.addListener(function(msg) {

        console.log(msg);

        var over_action = msg.key;

        var err_code = parseInt(msg.error || 0);

    })

    port.onDisconnect.addListener(function() {
        console.log("disconnect --");
    });


}