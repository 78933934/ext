//进入工资首页
console.log('工资首页');

var voucher_url = '/voucher/voucher.jsp';
var checkout_url = '/checkout/checkout.jsp';
var template_url= '/wages/voucher-template.jsp';

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

var jtgz_clicked = false;
var ffgz_clicked = false;

var click_errored = false;

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        if(mutation.target.className == 'ui-tips ui-tips-success' && mutation.target.innerText.indexOf('计提工资生成凭证成功') != -1 && !jtgz_clicked){
            //计提工资生成凭证成功
            jtgz_clicked = true;

            Run(function(){
                setLocal({jtgz_finished:true},function(){
                    setTimeout(click_ffgz,3000);
                    // click_ffgz();
                })
            });

        }

        if(mutation.target.className == 'ui-tips ui-tips-success' && mutation.target.innerText.indexOf('发放工资生成凭证成功') != -1 && !ffgz_clicked){
            //发放工资生成凭证成功
            ffgz_clicked = true;

            //完成了，跳转吧
            setLocal({ffgz_finished:true},function () {

                clue('工资凭证都已生成');

                Run(go_checkout);
            })


        }else if(mutation.target.className == 'ui-tips ui-tips-error' && !click_errored){
            click_errored = true;

            Run(function(){
                if(mutation.target.innerText.indexOf('凭证已存在') == -1){
                    clue(mutation.target.innerText + '，进入修改模板');

                    go_url(template_url);

                }else{
                    useLocal(function(local){

                        if(local.jtgz_finished && local.ffgz_finished){
                            go_checkout();
                        }else{

                            if(!local.jtgz_finished){
                                setLocal({jtgz_finished:true},function(){
                                    click_ffgz();
                                })
                            }else{
                                setLocal({ffgz_finished:true},function(){
                                    click_ffgz();
                                })

                            }

                            click_errored = false;
                        }

                    })
                }
            })

        }



    }else if(mutation.type == 'childList'){

        if(mutation.target.id == 'wages-con' && mutation.addedNodes.length >0){
            console.log('监控到工资表单');

            Run(get_sfgz);
        }
    }
});

function index(local){

}

//获取实发工资
function get_sfgz(local){

    var target_dom = $("#wages-con .table_line");

    var gz = 0;

    if(target_dom.length){

        var subject_name = $("#wages-con .table_line").first().find('input[data-type="employee"]').val();

        if(!subject_name){
            err_log_report('未找到公司职员');
        }else{
            
            target_dom.each(function(i){
                var sfgz = $(this).find('.table_line_item span[data-value="sfgz"]').text();
                if(sfgz){
                    gz += parseFloat(sfgz);
                }
            })

            console.log(gz);
        }



    }else{
        clue('暂无实发工资');
    }

    if(gz == 0){
        clue('未获取到工资金额，插件停止');
        stop_run();
        return false;
    }

    if((local.total_money - gz) >=0){
        console.log('总金额够发工资了');

        if(local.jtgz_finished && local.ffgz_finished){
            go_checkout();
        }else{

            //点击计提工资
            if(!local.jtgz_finished){
                click_jtgz();
            }else{
                click_ffgz();
            }
        }


    }else{
        console.log('总金额不足，去借款吧');

        var vouchers = local.vouchers;

        if(subject_name){

            create_borrow_vch();
            // var vch_list = [
            //     {code:'1001',subject_name:'库存现金',summary:'贷款',money:-16800},
            //     {code:'2241',subject_name:'其他应付款_' + subject_name,summary:'借款',money:16800}
            // ];
            //
            // vouchers.push(vch_list);
            //
            // setLocal({vouchers:vouchers},function(){
            //     location.href = voucher_url;
            // })
        }else{
            clue('找不到工资职员第一个人');
            // stop_run();
            err_log_report('未找到公司职员');
            return false;
        }
    }

}

//点击计提工资
function click_jtgz(){
    native_log('点击计提工资');
    clicking($("#jtgz"));
}

//点击发放工资
function click_ffgz() {
    native_log('点击发放工资');
    clicking($("#ffgz"));
}

//跳转总账
function go_checkout() {
    native_log('跳转结转页面');
    setLocal({gz_finished:true},function(){
        location.href = checkout_url;
    })
}









