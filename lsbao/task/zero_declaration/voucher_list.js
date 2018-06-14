//进入查凭证首页
console.log('查凭证首页');

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;
var warned = false;

//结算页面
var checkout_url = '/checkout/checkout.jsp';

//收入
var income = 0;
var income_subjects = ['5001','5051'];
//成本费用
var cost = 0;
var cost_subjects = ['5401','5402','5601','5602','5603'];

//个税
var individual_income_tax = 0;
var individual_income_tax_subjects = ['222121'];

//城建税
var urban_construction_tax = 0;
var urban_construction_tax_subjects = ['222117'];
//教育附加费
var additional_education_tax = 0;
var additional_education_tax_subjects = ['222122'];
//地方教育费
var local_education_fee = 0;
var local_education_fee_subjects = ['222126'];

//印花税
var stamp_duty_tax = 0;
var stamp_duty_tax_subjects = ['222125'];
//增值税
var added_value_tax = 0;
var added_value_tax_subjects = ['222102'];
//所得税
var income_tax = 0;
var income_tax_subjects = ['222115'];

//工会经费
var labor_union_dues_fee = 0;
//文化事业建设费
var cultural_construction_tax = 0;
//其它费用
var other_fee = 0;


tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    // console.log(mutation.target);
    // console.log(mutation);
    if (mutation.type == "attributes") {

        if(mutation.target.className == 'ui-tips ui-tips-warning' && !warned){
            warned = true;
            Run(function(){
                clue(mutation.target.innerText,'error');
                stop_run()
            })
        }

    }else if(mutation.type == 'childList'){

        if(mutation.target.tagName == 'BODY' && mutation.addedNodes.length >0 && !indexed){
            console.log('监控到查凭证表格');
            indexed = true;
            change_page_size();
            Run(index);
        }
    }
});

function index(){

    console.log('获取报税金额信息');

    var target_tds = $("#grid tr[tabindex='-1']").find("td[aria-describedby='grid_subject']");

    target_tds.find('p').each(function(i){
        //科目标号
        var subject_number = $(this).text().split(' ')[0];
        //科目名称
        var subject_name = $(this).text().split(' ')[1];
        //摘要描述
        var describe = target_tds.siblings("td[aria-describedby='grid_summary']").find('p').eq(i).text();
        //借款金额
        var money_jie = target_tds.siblings("td[aria-describedby='grid_debit']").find('p').eq(i).text();
        //贷款金额
        var money_dai = target_tds.siblings("td[aria-describedby='grid_credit']").find('p').eq(i).text();

        var money = money_jie ? money_jie : money_dai;

        console.log(describe,subject_number,subject_name,parseFloat(money.replace(',','')));

        if(describe.indexOf('结转本期损益') == -1){
            money_sum(subject_number,subject_name,parseFloat(money.replace(',','')));
        }

    })

    //保存报税金额
    native_log('获取报税金额');
    save_tax();

}

//汇总
function money_sum(subject_number,subject_name,money){

    if(subject_number.length ==4){
        //刚好是四位一级科目
        if(income_subjects.indexOf(subject_number) != -1){
            //收入
            income += money;
        }else if(cost_subjects.indexOf(subject_number) != -1){
            //成本
            cost += money;
        }
    }else if(subject_number.length == 6){
        //二级科目
        //获取截取前四位
        var sub_first_four = subject_number.substr(0,4);

        if(income_subjects.indexOf(sub_first_four) != -1){
            //收入
            income += money;
        }else if(cost_subjects.indexOf(sub_first_four) != -1){
            //成本
            cost += money;
        }

        if(individual_income_tax_subjects.indexOf(subject_number) !=-1){
            //个税
            individual_income_tax += money;
        }else if(urban_construction_tax_subjects.indexOf(subject_number) != -1) {
            //城建税
            urban_construction_tax += money;
        }else if(additional_education_tax_subjects.indexOf(subject_number) != -1){
            //教育附加费
            additional_education_tax += money;

        }else if(local_education_fee_subjects.indexOf(subject_number) != -1){
            //地方教育费
            local_education_fee += money;
        }else if(stamp_duty_tax_subjects.indexOf(subject_number) != -1){
            //印花税
            stamp_duty_tax += money;
        }else if(added_value_tax_subjects.indexOf(subject_number) != -1){
            //增值税
            added_value_tax += money;
        }else if(income_tax_subjects.indexOf(subject_number) != -1){
            //所得税
            income_tax += money;
        }

    }else if(subject_number.length == 8){
        //各种税
        //截取前6位
        // var sub_first_six = subject_number.substr(0,6);
        //
        // if(stamp_duty_tax_subjects.indexOf(sub_first_six) != -1 && subject_name.indexOf('印花税') != -1){
        //     stamp_duty_tax += money;
        // }else if(added_value_tax_subjects.indexOf(sub_first_six) != -1 && subject_name.indexOf('增值税') != -1){
        //     added_value_tax += money;
        // }else if(income_tax_subjects.indexOf(sub_first_six) != -1 && subject_name.indexOf('所得税') != -1){
        //     income_tax += money;
        // }

        console.log('8位科目',subject_number);

    }
}

function save_tax(){

    useLocal(function(local){

        var fee = {
            income : income,
            cost : cost,
            added_value_tax:added_value_tax,
            income_tax:income_tax,
            urban_construction_tax:urban_construction_tax,
            additional_education_tax:additional_education_tax,
            individual_income_tax:individual_income_tax,
            local_education_fee:local_education_fee,
            stamp_duty_tax:stamp_duty_tax,
            labor_union_dues_fee:labor_union_dues_fee,
            cultural_construction_tax:cultural_construction_tax,
            other_fee:other_fee
        };

        // var data = {
        //     'fee' : fee,
        //     'tax_sn' : local.tax_sn,
        //     'account_date' : local.task.account_date
        // };

        // console.log(data);

        //保存
        // tabCommon.sm('.save_tax_fee',data,function(){
        //     // go_url(checkout_url);
        // });

        setLocal({fee:fee},function(){
            go_url(checkout_url);
        })
    })
}

//切换分页条数500
function change_page_size(){
    // $(".ui-pg-selbox option[value='500']").attr('selected',true)
    $(".ui-pg-selbox option").each(function(i){
        if($(this).val() == '500'){
            $(this).attr('selected',true)
        }else{
            $(this).attr('selected',false)
        }
    })
    change_event($(".ui-pg-selbox")[0])
}