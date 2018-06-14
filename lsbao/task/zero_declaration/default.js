//进入默认首页
console.log('默认首页');

// $("#main-hd").append("<a id='go' style='color:blue'>&nbsp;点这里开始零申报>><a/>");

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

var successed = false;

var success_statu = 2;
var fail_statu = 3;

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        if(mutation.target.className == 'ui-tips ui-tips-success' && mutation.target.innerText.indexOf('恭喜您，结账到') != -1 && !successed){
            successed = true;
            console.log('监控到结账下一期成功');
            Run(task_finish);
        }


    }else if(mutation.type == 'childList'){

        if(mutation.target.tagName == 'BODY' && !indexed){
            if($("#period").length >0){
                setLocal({year_week:$("#period").text()},function(){
                    indexed = true;
                })
            }

            // index();
        }

    }
});

Run(index);

function index(local){

    //获取职员名称
    get_first_employee_name();
}

// $(function(){
//     $("#go").on('click',function(){
//         delLocal(['gz_finished','vch_created','checkout_finished','total_money','subject_name','year_week','vch_printted','jtgz_finished'],function(){
//             setLocal({isRunning:true},function(){
//                 window.location.reload();
//             })
//         })
//
//     })
// });


function task_finish(){

    //汇报任务结束
    tabCommon.sm('.updateTaskStatus',{status:success_statu,result:'任务执行成功'},function(){
        // clue('汇报任务完成');
    });
}









