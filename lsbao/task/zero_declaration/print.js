//打印凭证设置页
console.log('打印凭证pdf页');
alert('abc');

var observerId = tabCommon.observer($('body')[0]);

var indexed = false;

tabCommon.mutation(observerId,function (mutation) {
    // console.log(mutation.type);
    console.log(mutation.target);
    console.log(mutation);
    if (mutation.type == "attributes") {


    }else if(mutation.type == 'childList'){



    }
});

function index(local){

}








