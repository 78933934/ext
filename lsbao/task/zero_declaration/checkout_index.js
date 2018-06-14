//进入结账首页
console.log('结账首页');

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

var created_vch = false;

var confirmed = false;

var voucher_list_url = '/voucher/voucher-list.jsp';

var success_statu = 2;
var fail_statu = 3;

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        if(mutation.target.className == 'box selected' && mutation.target.innerText.indexOf('结转损益') != -1 && !created_vch){

            console.log('监控到生成凭证');
            Run(click_create_vch);
            created_vch = true;

        }

        //box box-check-enable selected

        if(mutation.target.className == 'box box-check-enable selected' && mutation.target.innerText.indexOf('结转损益') != -1 && !created_vch){

            console.log('监控到查看凭证');
            Run(click_create_vch);
            created_vch = true;

        }

        if(mutation.target.className == "ui_border ui_state_visible ui_state_focus ui_state_lock" && mutation.target.innerText.indexOf('请确认要结账到') != -1 && !confirmed){
            console.log('监控到确认提示框');

            confirmed = true;
            //任务结束
            Run(finish);
        }


    }else if(mutation.type == 'childList'){

        if(mutation.target.tagName == 'BODY' && mutation.addedNodes.length >0 && !indexed){
            console.log('监控到body');
            Run(click_cesuan);
            indexed = true;
        }



        // console.log(mutation.target);
        // console.log(mutation);
    }
});

function index(local){

}

//点击测算金额
function click_cesuan(local){

    $("#btn-calculate:contains('测算金额')")[0].click();

    //超时判断
    setTimeout(function () {
        if(!created_vch){
            //刷新页面
            window.location.reload();
        }
    },20*1000)

}

//点击生成凭证
function click_create_vch(local){

    if($("#ul-box li[data-box-name='plVchData']").find(".box-content a:contains('查看凭证')").length >0){
        console.log('凭证已生成,任务结束');
        // clue('结转到下期');
        next_period(local);

    }else{
        native_log('点击生成凭证');
        $("#ul-box li[data-box-name='plVchData']").find(".box-content a:contains('生成凭证')")[0].click()
    }
}

function finish(){

    delLocal(['gz_finished','vch_created','checkout_finished','total_money','subject_name','year_week','vch_printted','jtgz_finished'],function(){
        // $(".ui_buttons input")[0].click();
        //任务结束 暂停
        setLocal({task_finished:true},function(){
            clue('本次任务结束,结转下一期');
            if($(".ui_state_lock:contains('支持跨期结账')").find('.ui_state_highlight').length >0){
                $(".ui_state_lock:contains('支持跨期结账')").find('.ui_state_highlight')[0].click();
            }else{
                clue('找不到确认按钮');
            }

        })
    })

}

function next_period(local){

    if(local.fee){
        clue('结转到下期');
        $("#close-period:contains('结转到下期')")[0].click();
    }else{
        //跳转查凭证页面
        native_log('跳转查凭证页面');
        go_url(voucher_list_url);
    }

}










