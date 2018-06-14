/*****************worm*****************
 * @describe	页面公用方法库文件
 * @file 		common.func.js
 * @version		2015-5-7 16:40:28 1.0
 *****************worm*****************/
var checkedLoginType = false;
var observers=[];
var taskVars={};
/**
 * 页面开始运行任务
 * @param callback
 * @constructor
 */
function Task(callback) {
    chrome.storage.local.get(null, function (local) {
        if (local.isRunning) {
            console.log("XSS init ... ");
            if (local.task) {
                console.log('XSS task init ... ');

                callback && callback(local);
            } else {
                console.log("XSS 没有任务");
            }
        } else {
            console.log("XSS task 暂停");
        }

    });
}




/**
 * 页面监控 继续执行使用 ，增加有延迟时间
 * @param func
 * @constructor
 */
function Run(func) {
    chrome.storage.local.get(null, function (local) {
        if (local.isRunning) {//运行中
            // lazy(function () {});
                func(local);

        } else {
            console.log("暂停，监控操作停止-Run");
        }

    });
}

/**
 * 页面监控 继续执行使用 ，不增加有延迟时间
 * @param func
 * @constructor
 */
function r(callback) {
    chrome.storage.local.get(null, function (local) {
        if (local.isRunning) {//运行中
            callback(local);
        } else {
            console.log("暂停-r");
        }

    });
}

/**
 * 暂停操作
 * @param callback
 */
function pauseRun(callback){
    setLocal({isRunning: false}, function(){
        callback && callback();
    });
}

/**
 * 使用stroage中的local数据
 * @param callback
 */
function useLocal(callback){
    chrome.storage.local.get(null, function (local) {
        callback && callback(local);
    });
}

/**
 * 向storage的local中保存数据
 * @param i
 * @param callback
 */
function setLocal(i, callback) {
    chrome.storage.local.set(i, function () {
        callback && callback();
    });
}
function setLocalTask(item, callback){
    useLocal(function(local){
        var task = local.task;
        task = $.extend(task, item);
        setLocal({task: task}, function(){
            callback && callback();
        })
    })
}
/**
 * 删除storage中local里的某一个数据
 * @param k
 * @param callback
 */
function localDel(k, callback) {
    chrome.storage.local.remove(k, function () {
        callback && callback();
    });
}

/**
 * local 输出
 */
function consoleLocal(){
    useLocal(function(local){
        console.log('Local');
        console.log(local);
    })
}

/**
 * 当前任务进度 标记
 * @param message
 * @param timeout
 */
function label(message, timeout, func){
    if(message){
        var value = {message: message};
        if(timeout && parseInt(timeout)>=0) {
            value.timeout = parseInt(timeout);
        }
        tabCommon.messageListener.global.labelTimeout = func || tabCommon.messageListener.global.labelTimeoutDefault;
        tabCommon.sm(taskVars, '.label', value);
    }else{
        console.log('label message null');
    }
}

/**
 * 生成一个随机数
 * @param {start} [随机数的开始值]
 * @param {end} [随机数的结束值]
 * @returns {number} [返回随机的结果]
 */
function random(start, end) {
    return Math.round(Math.random() * (end - start) + start);
}
//延迟操作
function lazy(callback, time) {
    if (time == undefined) {
        var t = random(_t.lazy_rand_time_start, _t.lazy_rand_time_end);
    } else {
        var t = time;
    }

    alertify.log(':)  ' + t, 'log', t * 1000);
    setTimeout(function () {
        callback();
    }, t * 1000);
}

//是否在数组中
function in_array(find, array) {
    for (var i = 0; i < array.length; i++) {
        if (find == array[i]) {
            return true;
        }
    }
    return false;
}

/**
 * background sendMessageTobackground ，tab发送数据到background
 * @param act
 * @param val
 */
function sendMessageToBackground(act, val, callback) {
    var data = {
        'act': act,
        'val': val == undefined ? 'val' : val
    };
    chrome.runtime.sendMessage(data, function (response) {
        callback && callback(response);
    });
}
/**
 * background sendMessageTobackground ，tab发送数据到background
 * @param act
 * @param val
 */
function sendDataToBackground(act, data, callback) {
    data.act = act;
    chrome.runtime.sendMessage(data, function (response) {
        callback && callback(response);
    });
}

function sendMessageToTabByUrl(url, act, data, callback){
    data = data ? data : {};
    data.act = act;
    var message = {act: 'send_message_to_tab', url: url, data: data};
    chrome.runtime.sendMessage(message, function (response) {
        callback && callback(response);
    });
}
function sendMessageToTabByTabId(tabId, act, data, callback){
    data = data ? data : {};
    data.act = act;
    var message = {act: 'send_message_to_tab', tabId: tabId, data: data};
    chrome.runtime.sendMessage(message, function (response) {
        callback && callback(response);
    });
}
/**
 * 发送数据到background 关闭当前的tab页面
 */
function close_this_tab() {
    tabCommon.sm(taskVars, '.closeThisTab');
}





/**
 * 重置看门狗计时器
 */
function wangwang(){
    tabCommon.sm(taskVars, '.wangwang');
}
function resetWatchDogTimer() {
    wangwang();
}

function closeMe(seconds){
    if(seconds){
        setTimeout(function () {
            tabCommon.sm(taskVars, '.closeThisTab');
        },seconds*1000);
    }else{
        tabCommon.sm(taskVars, '.closeThisTab');
    }
}


/**
 * 发送消息到background 进行桌面提醒
 * @param v
 */
function notifyMessage(v) {
    //chrome.runtime.sendMessage({act: 'notify', val: v}, function (response) {  });
    tabCommon.sm(taskVars, '.notify', {message: v});
}

/**
 * tabs页面增加message监听，
 * @param {callback}
 */
function addListenerMessage(callback) {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
            callback && callback(request);
        }
    );
}

/**
 * 页面元素变动监控
 * @param target
 * @param callback
 * @param config
 */
function addMutationObserver(target,callback,config){
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // console.log(mutation.type);
            // console.log(mutation.target);
            // console.log(mutation);

            callback(mutation);

        });
    });

    if(config){
        var observer_config = config;
    }else{
        var observer_config = {
            attributes: true,
            childList: true,
            characterData: true,
            attributeOldValue: true,
            characterDataOldValue: true,
            subtree: true
        }
    }

    observer.observe(target, observer_config);

    //var observer_config = {
    //    attributes: true,
    //    childList: true,
    //    characterData: true,
    //    attributeOldValue: true,
    //    characterDataOldValue: true,
    //    subtree: true
    //}
    //addMutationObserver($("#p-box")[0],function(mutation){
    //    // console.log(mutation.type);
    //    // console.log(mutation.target);
    //    // console.log(mutation);
    //},observer_config);
}

/**
 * 页面直接插入js
 * @param b
 */
function insertScript(b){
    var a = document.createElement("script");
    a.innerHTML = "(" + b.toString() + ")(1);";
    a.addEventListener("load", function () {
        document.documentElement.removeChild(a)
    }, !0);
    document.documentElement.insertBefore(a, document.documentElement.firstChild || null)
}

/**
 * 提示信息 alertify
 * @param {message} [提示内容]
 * @param {type} [提示类型，log，error，success]
 * @param {sec} [提示停留时间，默认不关]
 */
function clue(message, type, sec) {
    type = type ? type : 'log';
    sec = sec && sec > 0 ? sec : 0;
    //记录本地日志
    native_log(message);
    alertify.log(message, type, sec);
    // tabCommon.sm(taskVars, '.sendNotesToTracker', {message: message});
}

//触发 对象的change事件，js原生对象
function change_event(o) {
    var changeEvent = document.createEvent("MouseEvents");
    changeEvent.initEvent("change", true, true);
    o.dispatchEvent(changeEvent);
}
function click_event(o) {
    var changeEvent = document.createEvent("MouseEvents");
    changeEvent.initEvent("click", true, true);
    o.dispatchEvent(changeEvent);
}

function mouseover_event(o) {
    var changeEvent = document.createEvent("MouseEvents");
    changeEvent.initEvent("mouseover", true, true);
    o.dispatchEvent(changeEvent);
}



/**
 * 输入内容
 * @param {target} [需要输入内容的对象jq]
 * @param {string} [输入的字符串]
 * @param {callback} [输入完成后，回调函数]
 * @returns {boolean} [错误，]
 */
function writing(target, string, callback,delay) {
    //string = "伊子凡2015春装新款 春秋装 韩版女装衣服时尚修身两件套雪纺条纹背心连衣裙";

    var delay = delay ? true : false;

    if (target.length <= 0) {
        console.log("wirte object not exist.", 'error');
        return false;
    }

    if (string.length <= 0) {
        console.log("string error", 'error');
        return false;
    }

    var arr = string.split('');
    var len = string.length;

    var eventClick = new MouseEvent('click', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventMove = new MouseEvent('mousemove', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventDown = new MouseEvent('mousedown', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventUp = new MouseEvent('mouseup', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventBlur = new MouseEvent('blur', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventKeydown = new MouseEvent('keydown', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventKeyup = new MouseEvent('keyup', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventchange = new MouseEvent('change', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventfocus = new MouseEvent('focus', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventInput = new MouseEvent('input', {'view': window, 'bubbles': true, 'cancelable': true});

    this.get = function () {
        if (arr.length > 0) {
            var str = arr.shift();
            useLocal(function(local){
                if(delay){

                    setTimeout(function () {
                        this.setValue(str);
                    }, random(100, 200));

                }else{

                    setTimeout(function () {
                        this.setValue(str);
                    }, random(_t.write_rand_msec_start, _t.write_rand_msec_end));
                }
            })

        } else {
            target[0].dispatchEvent(eventBlur);
            callback && callback();
        }
    };
    this.setValue = function (str) {
        var value = target.val();
        if(value.length < len && string.indexOf(value) == 0){
            var val = value + str;
        }else{
            var val = string.substr(0,string.indexOf(arr.toString().replace(/,/g,""))) + str;
        }

        //target.val(value.length < len && string.indexOf(value) == 0 ? value + str : str);
        target.val(val);

        target[0].dispatchEvent(eventKeydown);
        target[0].dispatchEvent(eventKeyup);

        this.get();
    };

    target[0].dispatchEvent(eventMove);
    target[0].dispatchEvent(eventDown);
    target[0].dispatchEvent(eventClick);
    target[0].dispatchEvent(eventUp);
    target[0].dispatchEvent(eventfocus);
    target[0].dispatchEvent(eventInput);

    target.val('');
    setTimeout(function () {
        target.val('');
        this.get();
    }, 2000);
}

/**
 * 点击
 * @param {object} [需要点击的对象]
 */
function clicking(object) {

    var evt_over = document.createEvent("MouseEvents");
    evt_over.initEvent("mouseover", true, true);

    //鼠标按下事件
    var evt_down = document.createEvent("MouseEvents");
    evt_down.button = 0;
    evt_down.initEvent("mousedown", true, true);
    //click
    var evt_click = document.createEvent("MouseEvents");
    evt_click.initEvent("click", true, true);

    //鼠标 弹起
    var evt_up = document.createEvent("MouseEvents");
    evt_up.button = 0;
    evt_up.initEvent("mouseup", true, true);

    if (object.length > 0) {
        object[0].dispatchEvent(evt_over);
        //去掉点击延迟,立即执行
        //setTimeout(function () {
            object[0].dispatchEvent(evt_down);
            object[0].dispatchEvent(evt_click);
            object[0].dispatchEvent(evt_up);
        //}, 500);


    } else {
        console.log("clicking object not exist.", 'error');
    }
}




/**
 * 获取url get参数信息，返回对象
 * @returns {{}}
 */
function urlGet(){
    var url = window.document.location.href.toString();
    var u = url.split("?");
    if(typeof(u[1]) == "string"){
        u = u[1].split("&");
        var get = {};
        for(var i in u){
            var j = u[i].toString().split("=");
            get[j[0]] = j[1];
        }
        return get;
    } else {
        return {};
    }
}


/**
 * 获取插件version
 * @returns {*}
 */
function extensionVersion(){
    var manifest = chrome.runtime.getManifest();
    return manifest.version;
}

/**
 * 当前所在页面是否在iframe中
 */
function windowsTopNotSelf(){
    if(top != self){
        //步骤重置
        notifyMessage('页面 嵌入框架 错误，步骤重置');
        resetHostByStep();
    }
}


function reloadHttps(){
    var href = document.location.href;
    document.location.href = href.replace('http://', 'https://');
}
/**
 * 黄金比例 61.8%的比例返回true
 * @returns {boolean}
 */
function isGoldenRatio(){
    var r = random(1,1000);
    return r>618?!1:!0;
}

function common__index(local) {
    lazy(function () {
            console.log('common_index');
    })
}

function randomString() {
    return Math.random().toString(36).substr(2);
}

function array_remove_unit(arr,val){

        var index = arr.indexOf(val);
        if (index > -1) {
            arr.splice(index, 1);
        }

        return arr;
}

//停止
function stop_run(callback){
    setLocal({isRunning:false},function(){
        callback && callback()
    });
}

function go_url(url){
    window.location.href = url;
}


//汇报失败
function err_log_report(err_msg){
    tabCommon.sm('.updateTaskStatus',{status:3,result:err_msg},function(){
        clue(err_msg);
    });
}

//获取第一个职员名称
function get_first_employee_name(callback){

    useLocal(function(local) {

        var account_date = local.task.account_date;

        var yearperiod = account_date.replace('-', '').substr(0, 6);

        var url = 'http://main.kdzwy.com:81/ws/wage?m=query&period=' + yearperiod;

        $.ajax({
            type:'GET',
            url:url,
            dataType:'json',
            success:function(msg){

                if(!msg.data){

                    err_log_report('未找到公司职员');
                    return false;
                }else{

                    var items = msg.data.items;

                    if(items && items.length > 0){

                        var name = items[0].employee;

                        setLocal({employee_name:name},function(){

                            callback && callback();
                        })



                    }else{

                        console.log('职员信息不存在');

                        err_log_report('未找到公司职员');

                        // go_url('/wages/wages.jsp');
                    }
                }


            }
        })

    })
}

//创建一条借款凭证数据
function create_borrow_vch(){

    useLocal(function (local) {

        if(local.employee_name){

            var vch_list = [
                {code:'1001',subject_name:'库存现金',summary:'借款',money:30000},
                {code:'2241',subject_name:'其他应付款_' + local.employee_name,summary:'借款',money:-30000}
            ];

            var vouchers = local.vouchers;

            vouchers.unshift(vch_list);

            setLocal({vouchers:vouchers},function(){

                go_url('/voucher/voucher.jsp');
            })

        }else{
            clue('未获取到公司职员','error');
        }
    })
}

//记录本地日志
function native_log(msg){

    tabCommon.sm('.native_log',msg);

}

