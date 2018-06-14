chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        useLocal(function (local) {
            console.log('tabListener',request, sender);
            try {
               if(request.act == 'tax_fee_saved'){

               }else if(request.act == 'click_subject_list'){

                   if($(".item-setting .sub-nav li a:contains('科目')").length >0){
                       $(".item-setting .sub-nav li a:contains('科目')")[0].click()
                   }

               }else if(request.act == 'click_vch_list'){
                   //切换tab
                   if($("#nav li a:contains('录凭证')").length >0){
                       $("#nav li a:contains('录凭证')")[0].click();
                   }
               }else if(request.act == 'close_subject_list'){
                   //关闭科目
                   if($(".l-tab-links li[tabid='setting-subjectList']").length >0){
                       $(".l-tab-links li[tabid='setting-subjectList']").find('.l-tab-links-item-close')[0].click()
                   }
                   //点击科目选择
                   if($("#voucher tbody").length >0){
                       setTimeout(click_target_tr,2*1000)
                   }
               }
            }catch (e){
                console.log(e);
            }
        })
    }
);