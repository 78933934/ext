//进入创建账套页
console.log('创建账套页');

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {



    }else if(mutation.type == 'childList'){


    }
});

Run(index);

function index(local){


    err_log_report('还没创建账套');

    // if($("#btn-establish").length >0){
    //     $("#btn-establish")[0].click();
    // }
}

