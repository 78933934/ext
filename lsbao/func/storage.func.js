/*****************worm*****************
 * @describe	storage操作
 * @file 		storage.func.js
 * @version		2015-5-29 10:57:05 1.0
 *****************worm*****************/


/**
 * 获取storage.local返回到callback
 * @param callback
 */
function useLocal(callback) {
    chrome.storage.local.get(null, function (local) {
        callback(local);
    });
}

/**
 * 保存数据到storage.local
 * @param item
 * @param callback
 */
function setLocal(item, callback) {
    chrome.storage.local.set(item, function () {
        callback && callback();
    });
}
//删除storage内容 针对单个内容
/**
 * 删除storage.local数据
 * @param key
 * @param callback
 */
function delLocal(key, callback) {
    chrome.storage.local.remove(key, function () {
        callback && callback();
    });
}

function clearLocal(callback){
    chrome.storage.local.clear(function () {
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
 * local 输出
 */
function consoleLocal(){
    useLocal(function(local){
        console.log('Local');
        console.log(local);
    })
}

/**
 * 获取当前任务配置
 * @param cb
 */
function getTaskWorks (cb) {
    useLocal(function (local) {
        var _result = {};
        local.taskWorks = local.taskWorks || {};
        local.taskWorks[local.taskId] = local.taskWorks[local.taskId] || {};
        if(Object.keys(local.taskWorks[local.taskId]).length == 0){
            _result  = local.tasks[local.taskId];
        }else{
            _result = $.extend(local.tasks[local.taskId],local.taskWorks[local.taskId]);
        }
        cb(_result)
    })
}

/**
 * 对当前任务写入配置
 * @param item
 * @param cb
 */
var setTaskWorksLock = false;
function setTaskWorks (item,cb) {
    item = item?item:{}
    if(setTaskWorksLock){
        setTimeout(function () {
            setTaskWorks(item,cb);
        },100)
    }else{
        setTaskWorksLock = true;
        useLocal(function (local) {
            local.taskWorks = local.taskWorks || {};
            local.taskWorks[local.taskId] = local.taskWorks[local.taskId] || {};
            local.taskWorks[local.taskId] = $.extend(local.taskWorks[local.taskId],item);
            local.task = $.extend(local.task?local.task:{},item);
            setLocal({taskWorks:local.taskWorks,task:local.task},function () {
                setTaskWorksLock = false;
                cb(local.taskWorks[local.taskId]);
            })
        })
    }
}


/**
 * 获取共享任务配置
 * @param cb
 */
function getSharedTaskWorks (cb) {
    useLocal(function (local) {
        local.sharedTaskWorks = local.sharedTaskWorks || {};
        cb(local.sharedTaskWorks)
    })
}

/**
 * 对任务写入共享配置
 * @param item
 * @param cb
 */
var setSharedTaskWorksLock = false;
function setSharedTaskWorks (item,cb) {
    if(setSharedTaskWorksLock){
        setTimeout(function () {
            setSharedTaskWorks(item,cb);
        },100)
    }else{
        setSharedTaskWorksLock = true;
        useLocal(function (local) {
            local.sharedTaskWorks = local.sharedTaskWorks || {};
            local.sharedTaskWorks = $.extend(local.sharedTaskWorks,item)
            setLocal({sharedTaskWorks:local.sharedTaskWorks},function () {
                setSharedTaskWorksLock = false;
                cb && cb(local.sharedTaskWorks);
            })
        })
    }
}