//进入首页
console.log('首页');

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

//工资页面
var wages_url = '/wages/wages.jsp';
var checkout_url = '/checkout/checkout.jsp';
var vch_list_url = '/voucher/voucher.jsp';

var success_statu = 2;

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {


    }else if(mutation.type == 'childList'){

        if(mutation.target.id == 'data-status-1' && !indexed){
            console.log('监控到资产总计金额');

            var total_money = parseFloat(mutation.target.innerText.replace(/,/g,''));

            indexed = true;

            Run(function(local){
                index(local,total_money)
            });
        }

    }
});

function index(local,total_money){

    if(local.task_finished) {
        //任务完成
        clue('任务已完成');
        tabCommon.sm('.updateTaskStatus',{status:success_statu,result:'任务执行成功'});

    }else if(local.vouchers && local.vouchers.length >0){

        //进入录凭证页面
        go_url(vch_list_url);
        
    }else if(!local.gz_finished){
        setLocal({total_money:total_money},function(){
            //进入工资页面
            location.href = wages_url;
        });
    }else{
        //进入结账
        location.href = checkout_url;
    }

}









