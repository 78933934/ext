//进入添加科目页面
console.log('进入科目列表页面');


var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

var tmp_url = '/wages/voucher-template.jsp';

var title = '';

var select_name = '';

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        if(mutation.target.className == 'cur'){

            Run(click_add_subject);
        }

        if(mutation.target.className == 'ui_border ui_state_visible ui_state_focus ui_state_lock' && mutation.target.innerText.indexOf('增加第一个下级科目') != -1){

            Run(save_tip);
        }


    }else if(mutation.type == 'childList'){
        if(mutation.target.id == 'sp_1_page' && mutation.addedNodes.length >0 && !indexed){
            indexed = true;
            Run(index);
        }
    }
});


function index(local){

    var sub_name = local.subject_name;

    var subject_names =  sub_name.indexOf('_') != -1 ? sub_name.split('_') : [ sub_name ];

    var types = ['资产','负债','权益','成本','损益'];

    var index = parseInt(local.create_subject_code.substr(0,1)) - 1;

    select_name = types[index];

    setLocal({subject_names:subject_names},function(){

        console.log($("#subject-category-select ul li").length);

        $("#subject-category-select ul li:contains('" + select_name +"')")[0].click()
    })

}

//点击添加科目操作
function click_add_subject(){

    useLocal(function(local){

        var subject_names = local.subject_names;

        //$("#add")[0].click();
        if($("#grid tr:contains('" + subject_names[0] +"')").length >0 && $("#grid tr:contains('" + local.create_subject_code +"')").length){
            //二级科目存在,添加三级科目
            if(subject_names.length >1){
                setLocal({subject_name:subject_names[1]},function(){
                    //点击添加下级科目
                    title = '新增下级科目';
                    $("#grid tr:contains('" + subject_names[0] +"')").find("td .operate-wrap .add")[0].click();
                    setTimeout(function(){
                        save(function(){
                            setTimeout(finish,2*1000)
                        });
                    },6*1000);
                })
            }else{
                clue('科目已存在');
                // setTimeout(finish,2*1000);
            }

        }else{
            //二级科目不存在,点击添加
            title = '新增' + select_name +'类科目';
            setLocal({subject_name:subject_names[0]},function(){
                $("#add")[0].click();
                setTimeout(function(){

                    if(subject_names[0] == '工资'){
                        //兼容老的
                        save(function(){
                            go_url(tmp_url);
                        });
                    }else{
                        save(function(){
                            setTimeout(click_add_subject,2*1000);
                        });
                    }

                },6*1000);

            })
        }

    })

}

//保存科目
function save(callback){

    if($(".ui_state_lock:contains('" + title +"')").find('.ui_state_highlight').length >0){
        $(".ui_state_lock:contains('" + title +"')").find('.ui_state_highlight')[0].click();
        callback && callback();
    }else{
        clue('找不到确认按钮');
    }
}

//点击提示框
function save_tip(){

    if($(".ui_state_focus .ui_buttons").find("input[value='确定']").length){
        $(".ui_state_focus .ui_buttons").find("input[value='确定']")[0].click();
    }
}

//增加科目完成
function finish(){
    clue('新增科目完成');
    tabCommon.sm('.sendMessageToTab',{url:top.location.href,data:'close_subject_list'});

}








