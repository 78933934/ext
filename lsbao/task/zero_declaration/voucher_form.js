//进入凭证保存
console.log('凭证保存');

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

var warned = false;//警告提示过

var vch_template_url = '/wages/voucher-template.jsp';


tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        if(mutation.target.className == 'ui-tips ui-tips-warning' && mutation.target.innerText.indexOf('您选择的日期太大了，请重新选择') != -1 && !warned){
            console.log('您选择的日期太大了，请重新选择');
            clue('您选择的日期太大了，请重新选择');
            warned = true;
            Run(stop);
        }


    }else if(mutation.type == 'childList'){

        if(mutation.target.className == 'page-voucher' && mutation.addedNodes.length >0 && !indexed){

            console.log('监控到凭证表单');

            Run(index);

            indexed = true;

        }
    }
});

function index(local){

    if(local.gz_finished){
        save();
    }else{
        //还未完成工资凭证生成，去检查凭证模板
        console.log('还未完成工资凭证生成，去检查凭证模板');

        location.href = vch_template_url;
    }

}

function save(){
    clicking($("#saveB"));

    setLocal({vch_created:true},function(){
        setTimeout(function(){
            if(!warned){
                top.location.reload()
            }
        },1*1000)
    })
}

function stop(){

    setLocal({isRunning:false},function(){
        clue('插件停止');
    })
}








