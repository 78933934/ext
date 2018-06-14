//打印凭证设置页
console.log('打印凭证设置页');

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {


    }else if(mutation.type == 'childList'){

        if(mutation.target.className == 'ui-dialog-body' && !indexed){

            Run(index);
        }

    }
});

function index(local){

    $("#printSelect li:contains('专业套打')")[0].click();

    $(".template-list").find('.list-item:contains("友商在线记账凭证模板记账凭证模板")')[0].click();

    $("#taodaStartY").val('5');
}








