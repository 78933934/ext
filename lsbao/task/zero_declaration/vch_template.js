//进入首页
console.log('凭证模板首页');

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;
var ffgz_tmp_edited = false;
var saved = false;
var subject_selected = false;
var jtgz_tmp_edit = false;
var ffgz_tmp_edit = false;


var check_subject = '221101';

//工资页面
var wages_url = '/wages/wages.jsp';
var checkout_url = '/checkout/checkout.jsp';

var vchTemplate = '';
var kmNumber = '';


tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        // if(mutation.target.name == 'wage' && mutation.target.type == 'radio' && !ffgz_tmp_edited ){
        //     console.log('监控到发放工资模板');
        //     ffgz_tmp_edited = true;
        //     //修改模板
        //     Run(edit_ffzg);
        // }

        if(mutation.target.className == 'ui-tips ui-tips-success' && mutation.target.innerText.indexOf('模板保存成功') != -1 && !mutation.oldValue && !saved){
            console.log('监控到保存成功');
            // Run(go_url);
            if(vchTemplate == 'jtgz'){
                console.log('计提工资编辑成功');
                Run(click_ffgz_tmp);
            }else if(vchTemplate == 'ffgz'){
                console.log('发放工资编辑成功');
                Run(function(){
                    go_url();
                });

            }
        }

        if(mutation.target.className == 'km_dialog'){
            console.log('监控到选择科目窗口');
            if(kmNumber=='560201'){
                $("#select-km-hd span:contains('损益')")[0].click();
            }else if(kmNumber=="221101"){
                $("#select-km-hd span:contains('负债')")[0].click();
            }

        }

    }else if(mutation.type == 'childList'){

        if(mutation.target.tagName == 'BODY' && mutation.target.innerText.indexOf('同步至其他账套') != -1 && !indexed){
            console.log('监控到凭证模板表单');
            indexed = true;

            Run(function(local){
                if(local.jtgz_finished){
                    click_ffgz_tmp();
                }else{
                    click_jtgz_tmp();
                }
            });
        }

        if(mutation.target.id == 'select-km-list' && mutation.addedNodes.length >0 && mutation.target.innerText.indexOf('库存现金') == -1){
            console.log('监控到负债切换');
            subject_selected = true;
            Run(select_subject);
        }
        if(mutation.target.id == 'select-km-list' && mutation.addedNodes.length >0 && mutation.addedNodes[0].textContent=="5001 主营业务收入"){
            console.log('监控到损益切换');
            subject_selected = true;
            Run(select_subject);
        }

        if(mutation.target.id == 'template-instruction' && mutation.target.defaultValue == '用于计提当月工资' && !jtgz_tmp_edit){
            console.log('进入计提工资模板编辑');
            jtgz_tmp_edit = true;
            Run(edit_jtgz);
        }

        if(mutation.target.id == 'template-instruction' && mutation.target.defaultValue.indexOf('用于发放') !=-1 && mutation.target.defaultValue.indexOf('工资') !=-1 && !ffgz_tmp_edit){
            console.log('进入发放工资模板编辑');
            ffgz_tmp_edit = true;
            Run(edit_ffzg);
        }

    }
});

function index(local){

}

function click_jtgz_tmp(){
    if($(".table_line .table_line_item:contains('计提工资')").length >0){
        native_log('点击计提工资模板');
        $(".table_line .table_line_item:contains('计提工资')").siblings().find('.edit')[0].click()
    }else{
        clue('找不到计提工资模板');
    }
}

function click_ffgz_tmp(){
    if($(".table_line .table_line_item:contains('发放工资')").length >0){
        native_log('点击发放工资模板');
        $(".table_line .table_line_item:contains('发放工资')").siblings().find('.edit')[0].click()
    }else{
        clue('找不到发放工资模板');
    }
}

function edit_jtgz(){
    vchTemplate = 'jtgz';

    //第一个是 560201
    var km0 = $("#voucher-template-list .table_line .km_box").eq(0);
    if(km0.text().indexOf("560201")==-1){
        kmShowList(km0, "560201");
        return false;
    }

    // 第二个是 221101
    var km1 = $("#voucher-template-list .table_line .km_box").eq(1);
    if(km1.text().indexOf("221101")==-1){
        kmShowList(km1, "221101");
        return false;
    }

    save();

}

function edit_ffzg(){
    vchTemplate = 'ffgz';

    if($('input[name="wage"]').length >0){
        $('input[name="wage"]')[0].click();
    }

    var run = true;

    $("#withdrawingWages .table_line").each(function(i){

        if($(this).find('input[data-value="debit"]').val() == '应发工资') {

        }else if($(this).find('input[data-value="credit"]').val() == '实发工资' ){

        }else{
            //删除多余项
            var delete_item = $(this).find('.table_line_item .delete');

            if(delete_item.length >0){
                clicking($(this).find('.table_line_item .delete'));
            }
        }
    })



    //第一个是 221101
    var km0 = $("#voucher-template-list .table_line .km_box").eq(0);
    if(km0.text().indexOf("221101")==-1){
        kmShowList(km0, "221101");
        return false;
    }

    // 第二个是 221101
    var km1 = $("#voucher-template-list .table_line .km_box").eq(1);
    if(km1.text().indexOf("1001")==-1){
        kmShowList(km1, "1001");
        return false;
    }

    save();

}

// function check_tmp(index){
//
//     if($("#withdrawingWages .table_line").length == 2){
//
//         if($("#withdrawingWages .table_line").eq(index).find('span[data-type="subject"]').text().indexOf(check_subject) == -1){
//             clue('未使用' + check_subject +'科目，重新选择科目');
//
//             //点击设置科目
//             click_set_subject();
//
//         }else{
//             save();
//         }
//
//     }else{
//         clue('模板不标准，插件停止');
//         stop_run();
//     }
// }

function save(){
    if($("#save-withdrawingWages").length >0){
        $("#save-withdrawingWages")[0].click();

    }else{
        clue('找不到保存按钮');
    }
}

function go_url(){
    window.location.href = wages_url;
}

// function click_set_subject(){
//
//     $("#withdrawingWages .table_line").first().find(".km_btn")[0].click();
//
// }

// 选择科目
function select_subject(){
    var number = kmNumber;

    if($("#select-km-list p:contains('"+ number +"')").length >0){

        // $("#select-km-list p:contains('" + number +"')").find('input')[0].click();

        clicking($("#select-km-list p:contains('" + number +"')").find('input'));

        setTimeout(function(){

            // $("#select-km-btn")[0].click();
            clicking($("#select-km-btn"));
            clue(vchTemplate + '选择' + number);
            kmChangeOver();

        },2*1000)
    }else{
        clue(number + '科目不存在');
        // clue(number + '科目不存在,插件停止');
        if(parseInt(number) == 221101){
            //创建221101
            setLocal({create_subject_code:number,subject_name:'工资'},function(){
                console.log('去创建科目');
                window.location.href = '/settings/subject-list.jsp'
            })
        }
        // stop_run();
    }
}

function kmShowList(target, number){
    kmNumber = number;
    target.find(".km_btn")[0].click();
}

function kmChangeOver(){
    if(vchTemplate=='jtgz'){
        edit_jtgz();
    }else if(vchTemplate=="ffgz"){
        edit_ffzg();
    }
}









