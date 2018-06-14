//接口类
function Api(){

    var _api_env = new Array;
    _api_env[0] = "https://crm.s.zzswshr.com/api/";
    _api_env[1] = "http://dev.sws/api/";
    _api_env[2] = "http://192.168.2.197";

    var _key = 'F$~((kb~AjO*xgn~';
    var _params = {};
    var _api = this;

    this.data = {version: chrome.runtime.getManifest().version, extension: chrome.runtime.id, extension_name: chrome.runtime.getManifest().name};

    //设置接口等信息
    this.func_init_cfg = function(){
        
    };

    this.retryTimes = 1;


    this.notify = function(message){

        if(typeof(notifyMessage) === 'function'){
            notifyMessage(message);
        }else if(typeof(notify) === 'function'){
            notify(message);
        }

    }
    // /**
    //  * 新的主机列表状态实时报告
    //  * @param data
    //  * @param success
    //  * @param error
    //  */
    // this.reportHostMessage = function(data, success, error){
    //     var url = "https://hostmessage.disi.se/users";
    //     $.post(url, data, function(ret){
    //         success && success(ret);
    //     }, "TEXT").error(function(){
    //         error && error();
    //     });
    // }
    // //这个接口不验证api_token
    // this.setHostRuningMessage = function(data, success, error){
    //     useLocal(function(local){
    //         // var url = "https://phpapi-1.disi.se/v1/host/"+local.host_id+"/update/running_expired_at";
    //         var url = "https://phpapi-1.disi.se/v1/host/update/running_expired_at";
    //         // var url = "http://192.168.2.21:3000/v1/host/update/running_expired_at";
    //
    //         $.ajax({
    //             type: "PATCH",
    //             url: url,
    //             data: $.extend(data, _api.data),
    //             dataType: "JSON",
    //             success: function (ret) {
    //                 console.log("request", ret);
    //                 success && success(ret);
    //             },
    //             error: function (Request, textStatus, errorThrown) {
    //                 error && error();
    //             }
    //         });
    //     });
    // }

    /***接口***/
    //领任务
    this.getTask = function(success,error){

        useLocal(function(local){
            var last_mobile_phone = local.last_mobile_phone || '';
            var url = '/manage_accounts/create?code=' + local.host_code + '&mobile_phone=' + last_mobile_phone;
            _api.request(url,'GET',{},success,error);
        })


    }
    //汇报任务接口
    this.updateTaskStatus = function( data, success, error){
        useLocal(function(local){
            var url = "/manage_accounts/" + local.task.id;
            var postData = {
                id : local.task.id,
                code:local.host_code,
                status: data.status,
                result: data.result,
                fee: local.fee
            }
            _api.request(url, 'PUT', postData, success, error);

        })
    }

    //获取报税金额
    this.save_tax_fee = function(data,success,error){

        useLocal(function (local) {
            data.code = local.host_code;
            var url = '/service_account_tasks/tax_declaration';
            _api.request(url,'PUT',data,success,error);
        })

    }

    this.request = function(url, type, data, success, error){
        chrome.storage.local.get(null, function(local) {

            if(url.indexOf('http') == -1){
                 var host_server = _api_env[local.env] == undefined ? _api_env[0] : _api_env[local.env];
                 url = host_server + url;
            }

            data = $.extend(data, {auth_code:local.app_secret});
            console.log('request data',data);

            ajaxSend();

            function ajaxSend() {
                _api.retryTimes--;
                console.warn('api请求数据','['+type+']','['+_api.retryTimes+']',url);
                $.ajax({
                    type: type,
                    url: url,
                    data: data,
                    dataType: "JSON",
                    timeout: 30000, //增加超时时间30s
                    success: function (ret) {
                        console.log("apiRequest", ret);
                        // send_notes_to_tracker('请求:' + request_url + ' 请求参数：' + JSON.stringify(data) + ' 返回结果:' + JSON.stringify(ret));
                        //success && success(ret);
                        if(_api.retryTimes<=0) {
                            success && success(ret);
                        }else{
                            if(ret.success==1){
                                success && success(ret);
                            }else{
                                setTimeout(ajaxSend,1000);
                            }
                        }
                    },
                    error: function (Request, textStatus, errorThrown) {
                        console.error('apiError:',Request, textStatus, errorThrown);
                        if(_api.retryTimes<=0) {
                            error && error();
                        }else{
                            setTimeout(ajaxSend,1000);
                        }
                    }
                });
            }
        });

    }


    //init
    this.func_init_cfg();
}