//进入添加科目页面
console.log('进入添加科目页面');

// var subject_code = '2241' ;

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

var clicked_radio = false;

var sys_alert = false;

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        if((mutation.target.id == 'subject-debit' || mutation.target.id == 'subject-credit' || mutation.target.id == 'subject-code') && !clicked_radio){
            console.log('检测到radio');
            clicked_radio = true;
            Run(function(local){

                if(local.create_subject_code){

                    var type = local.create_subject_money <0 ? '-1':'1';

                    add_subject(local.create_subject_code.substr(0,4),local.subject_name,type);

                }

            });
        }

        if(mutation.target.className == 'ui_border ui_state_visible ui_state_focus ui_state_lock' && !sys_alert){

            console.log('监控到系统提醒');
            clue(mutation.target.innerText);
            sys_alert = true;

            stop_run();

        }
    }else if(mutation.type == 'childList'){

    }
});

//输入添加科目信息
function add_subject(code,name,type){

    if($("#parent-code").length > 0){
        writing($("#subject-name"),name,function(){
            if(type < 0){
                //点击贷
                clicking($("#subject-credit"));
            }else{
                clicking($("#subject-debit"));

            }
        },true)
    }else{

        writing($("#subject-code"),code,function(){
            writing($("#subject-name"),name,function(){
                if(type < 0){
                    //点击贷
                    clicking($("#subject-credit"));
                }else{
                    clicking($("#subject-debit"));
                }
            },true)
        },true)
    }

}









