//进入凭证首页
console.log('凭证首页');

var target_sub_code = '224101';

var target_tr_index = '';

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

var dropped = false;

var saved = false;
var added_subject = false;

var borrow_money = 30000;

var vch_warned = false;

var add_subject_noticed = false;

var current_subject_input = 0;


tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        if(mutation.target.className == 'edit_summary'){
            console.log('监控到点击');
            // $("#voucher tbody tr").eq(0).find('.col_summary input').val('借款');
        }

        if(mutation.target.className == 'ui_content' && mutation.target.innerText.indexOf('余额小于0,是否继续保存') != -1 && !saved){
            $(".ui_buttons input")[0].click();
            saved = true;
        }

        if(mutation.target.className == 'ui_border ui_state_visible ui_state_focus ui_state_lock' && mutation.target.innerText.indexOf('新增科目') != -1 && !added_subject ){

            added_subject = true;

            Run(function(){

                setTimeout(save_selected,8*1000);

            })

        }

        if(mutation.target.className == 'ui_border ui_state_visible ui_state_focus ui_state_lock' && !add_subject_noticed && mutation.target.innerText.indexOf('增加第一个下级科目') != -1){
            add_subject_noticed = true;
            console.log('监控到科目添加提示',mutation.target.innerText);
            Run(sub_notice);
        }

        if(mutation.target.className == 'ui-tips ui-tips-warning' && mutation.target.innerText.indexOf('您选择的日期太大了，请重新选择') != -1 && !vch_warned){
            console.log('您选择的日期太大了，请重新选择');
            clue('您选择的日期太大了，请重新选择');
            vch_warned = true;
            clue('插件停止');
            Run(stop_run);

        }


    }else if(mutation.type == 'childList'){

        if(mutation.target.className == 'page-voucher' && mutation.addedNodes.length >0 && !indexed){

            console.log('监控到凭证表单');

            Run(function(){
                check_vch_tr(check_list);
            });

            indexed = true;

        }
        //当前下拉输入框所在行
         current_subject_input = $("#voucher tbody tr").eq(target_tr_index).find('.col_subject input:visible').length;

        if(mutation.target.className == 'droplist' && current_subject_input && !dropped){

            console.log('监控到下拉');

            dropped = true;

            Run(function(local){

                setTimeout(select,1*1000);

            });
        }
    }
});

//检测列表
function check_list(callback){

    useLocal(function (local) {

        var vch_list = local.vch_list;

        if(vch_list.length){

            //当前操作行
            target_tr_index = parseInt(vch_list.length - 1);

            //当前行要写入数据
            target_tr_info = vch_list.pop();

            setLocal({vch_list:vch_list},function(){
                click_target_tr();
            })

        }else{

            clue('没有可添加的凭证信息');
            //保存凭证
            // setTimeout(save,3*1000);
        }

    })

}

//检测准备数据
function check_vch_tr(callback){

    useLocal(function (local) {

        var vouchers = local.vouchers;

        if(vouchers && vouchers.length >0){

            var vch_list = vouchers.shift();

            check_blance(vch_list,function(){

                // var vch_list = [
                //     {code:'1001',subject_name:'制造费用',summary:'摘要一',money:16800,type:'jie'},
                //     {code:'2241',subject_name:'管理费用_办公费_外勤费',summary:'摘要二',money:-16800,type:'dai'},
                //     {code:'1001',subject_name:'库存现金',summary:'摘要一',money:16800,type:'jie'},
                //     {code:'224111',subject_name:'其他应付款_二级凭证1',summary:'摘要二',money:-16800,type:'dai'},
                //     // {code:'1001',subject_name:'库存现金',summary:'摘要一',money:16800,type:'jie'},
                //     // {code:'224112',subject_name:'其他应付款_二级凭证12',summary:'摘要二',money:-16800,type:'dai'}
                // ];

                var vch_tr_length = $("#voucher tbody tr").length;

                if(vch_tr_length >= parseInt(vch_list.length)){

                    setLocal({vouchers:vouchers,vch_list:vch_list},callback);

                }else{

                    $("#voucher tbody tr").last().find('.operate .add')[0].click();

                    check_vch_tr(callback);

                }

            })

        }else{

            clue('添加凭证数据不存在');

            go_index();
        }

    })

}

//检测对应余额够不够
function check_blance(vch_list,callback){

    useLocal(function (local) {

        if(local.create_borrow_vch){
            //本身需要创建凭证，跳过验证
            callback();

        }else{

            var filter_names = ['库存现金','银行存款'];

            var money = 0;

            var target_name = '';

            for(var i in vch_list){

                var name = vch_list[i].subject_name.split('_')[0];

                if(filter_names.indexOf(name) != -1){
                    //计入金额
                    money += parseFloat(vch_list[i].money);

                    target_name = name;
                }
            }

            get_account_detail(target_name,money,callback);
        }
    })
}

//获取总账的相关金额数据
// function get_index_value(name,money,callback){
//
//     useLocal(function(local){
//
//         var account_date = local.task.account_date;
//
//         var yearperiod = account_date.replace('-','').substr(0,6);
//
//         var url = 'http://main.kdzwy.com:81/report/report?m=getIndexValue&reporttype=index&yearperiod=' + yearperiod;
//
//         $.ajax({
//             type:'GET',
//             url:url,
//             dataType:'json',
//             success:function(msg){
//
//                 var items = msg.data.items;
//
//                 if(items.length >0){
//
//                     for (var i in items){
//
//                         if(name.indexOf(items[i].name) != -1){
//                             //比对金额
//                             var balance = items[i].balance ? parseFloat(items[i].balance.replace(',','')) : 0;
//
//                             if(parseFloat(money + balance) >= 0){
//                                 // callback && callback();
//                                 setLocal({create_borrow_vch:false},callback);
//                             }else{
//
//                                 if(name == '库存现金'){
//
//                                     console.log(name + '余额不足，创建借款凭证');
//
//                                     setLocal({create_borrow_vch:true},create_borrow_vch);
//
//                                 }else{
//
//                                     clue(name + '余额不足');
//
//                                     err_log_report(name + '余额不足');
//
//                                 }
//                             }
//                         }
//                     }
//                 }
//
//             }
//         })
//     })
// }

//获取库存现金||银行存款对应rootid
function get_account_detail(name,money,callback){

    var url = 'http://main.kdzwy.com:81/gl/account?m=findAll&isdetail=0';

    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function (msg) {

            if(msg.status == 200 && msg.data){

                var items = msg.data.items;

                for(var i in items){

                    if(items[i].fullName == name){

                        //找到rootId
                        var rootId = items[i].rootId;

                        get_balance(rootId,items[i].number,money,name,callback)
                    }
                }
            }else{

                clue('获取账户余额信息失败');
            }
        }

    })

}

//获取账户对应余额
function get_balance(rootId,number,money,name,callback){

    useLocal(function(local){

        var url = 'http://main.kdzwy.com:81/report/report?m=getAccountBal';

        var account_date = local.task.account_date;

        var yearperiod = account_date.replace('-','').substr(0,6);

        var data = {
            id: rootId,
            number: number,
            currency: 0,
            yearperiod: yearperiod
        };

        $.ajax({
            type: 'POST',
            url: url,
            data:data,
            dataType: 'json',
            success: function (msg) {

                if(msg.status == 200 && msg.data) {

                    var balance = parseFloat(msg.data.bal ? msg.data.bal : 0);

                    if (parseFloat(money + balance) >= 0) {
                        // callback && callback();
                        setLocal({create_borrow_vch: false}, callback);
                    } else {

                        if (name == '库存现金') {

                            // console.log(name + '余额不足，创建借款凭证');

                            native_log(name + '余额不足，创建借款凭证');

                            setLocal({create_borrow_vch: true}, create_borrow_vch);

                        } else {

                            clue(name + '余额不足');

                            err_log_report(name + '余额不足');

                        }
                    }

                }else{

                    clue('未获取到余额信息');
                }

            }

        })

    })


}

//点击索引行
function click_target_tr(){

    $("#voucher tbody tr").eq(target_tr_index).find('.col_summary')[0].click();
    $("#voucher tbody tr").eq(target_tr_index).find('.col_summary input').val(target_tr_info.summary);
    clicking($("#voucher tbody tr").eq(target_tr_index).find('.col_subject'));

}

//选择查找目标科目
function select(){

    if(current_subject_input){

        if($(".droplist .list-item:contains(" + target_tr_info.subject_name  + ")").length >0){

            clicking($(".droplist .list-item:contains('" + target_tr_info.subject_name +"')"));

            check_next_tr();

        }else{

            console.log('找不到' + target_tr_info.subject_name + ',添加科目');

            check_subject_name(target_tr_info.subject_name);
        }
    }
}

//检测管理费用是否是5602
function check_first_level_subject(sub_first_level_name,callback){

    var item = $(".droplist .list-item:contains(" + sub_first_level_name  + ")").first().text();

    if(item){
        var create_subject_code = item.split(' ')[0].substr(0,4);
        if(create_subject_code != '5602'){
            clue('科目编号不是5602');
        }else{
            callback && callback();
        }
    }else{
        clue('未找到一级科目' + sub_first_level_name);
    }


}

//设置借贷金额
function set_borrowing(){

    var money = parseFloat(target_tr_info.money);

    if(money > 0){
        $("#voucher tbody tr").eq(target_tr_index).find('.col_debite')[0].click();
        $("#voucher tbody tr").eq(target_tr_index).find('.col_debite input').val(Math.abs(money));
    }else{
        $("#voucher tbody tr").eq(target_tr_index).find('.col_credit')[0].click();
        $("#voucher tbody tr").eq(target_tr_index).find('.col_credit input').val(Math.abs(money));
    }
}

//检查下一行
function check_next_tr(){

    added_subject = false;

    set_borrowing();

    if(!target_tr_index){
        //最后一个
        setTimeout(save,2*1000);
    }else{
        //执行下一行
        dropped = false;
        check_list();
    }
}

//检测名称
function check_subject_name(name){

    var sub_names = name.split('_');

    if(sub_names.length == 1){

        clue('找不到一级科目:' + name);

        return false;

    }else if(sub_names.length == 2){

        subject_name = sub_names[1];

        //如果是二级科目找不到，保存一级科目，创建二级科目
        var cb = function(){
            //点击新增科目
            if($("#quickAddSubject:contains('新增科目')").length){

                $("#quickAddSubject:contains('新增科目')")[0].click();

            }else{
                console.log('找不到新增科目');
            }
        }

    }else if(sub_names.length >= 3){

        subject_name = sub_names[1] + '_' + sub_names[2];

        //找不到三级科目,保存一级科目
        var cb = function(){
            //点回摘要
            dropped = false;
            $("#voucher tbody tr").eq(target_tr_index).find('.col_summary')[0].click();

            //去科目列表
            tabCommon.sm('.sendMessageToTab',{url:top.location.href,data:'click_subject_list'});

        }
    }

    save_subject_info(sub_names[0],subject_name,cb);
}

//保存科目信息
function save_subject_info(sub_first_level_name,subject_name,cb){

    var item = $(".droplist .list-item:contains(" + sub_first_level_name  + ")").first().text();

    if(item){
        //获取科目编号
        var create_subject_code = item.split(' ')[0].substr(0,4);

        target_tr_info.code = create_subject_code;

        var money = parseFloat(target_tr_info.money);

        setLocal({
            create_subject_code:create_subject_code,
            subject_name:subject_name,
            create_subject_money:money
        },function(){

            cb && cb();

        })

    }else{

        console.log('未找到一级科目:' + sub_first_level_name + '，继续搜索');

        writing($("#voucher tbody tr").eq(target_tr_index).find('.col_subject input'),sub_first_level_name,function(){

            if(sub_first_level_name == '管理费用'){
                // check_first_level_subject(sub_first_level_name,select);
                select();
            }else{
                select();
            }
        })
    }

}

//保存选择的科目
function save_selected(){

    if($(".ui_state_focus .ui_buttons").find("input[value='保存']").length){
        $(".ui_state_focus .ui_buttons").find("input[value='保存']")[0].click();
        setTimeout(check_next_tr,2*1000);
    }
}

//保存凭证按钮
function save(){

    useLocal(function(local){

        setLocal({create_borrow_vch:false},function(){

            if(local.vouchers && local.vouchers.length >0){
                //继续新增
                dropped = false;
                clicking($("#renewB"));

                setTimeout(function(){
                    check_vch_tr(check_list);
                },1*1000)

            }else{
                clicking($("#saveB"));

                setTimeout(function(){
                    Run(go_index);
                },1*1000);
            }
        })
    })
}

function go_index(){
    top.location.reload()
}

//点击确定
function sub_notice(){
    $(".ui_buttons").find("input[value='确定']")[0].click();

    // save();
}
//
// //点击科目树形框
// function click_select_subject(){
//
//     $("#voucher tbody tr").eq(target_tr_index).find(".option a:contains('科目')")[0].click();
//     setTimeout(save_selected,5*1000);
// }









