var bgPage = chrome.extension.getBackgroundPage()

$(function () {
    chrome.storage.local.get(null, function (data) {
        console.log(data)

        if ("isRunning" in data && data.isRunning) {

            $('#task-span').html($("<a href='javascript:;'></a>").text('停止')
                .on('click', function () {

                    bgPage.updateLastRequestTime();

                    chrome.storage.local.set({
                        isRunning: false
                    }, function () {
                        window.location.reload()
                    })
                }))
        } else {
            $('#task-span').html($("<a href='javascript:;'></a>").text('开始')
                .on('click', function () {

                    bgPage.updateLastRequestTime();

                    chrome.storage.local.set({
                        isRunning: true
                    }, function () {
                        // bgPage.startHost();
                        window.location.reload()
                    })

                })
            )
        }

    })

    $("#tasks-link").on("click", function () {
        var url = "https://www2017.disi.se/index.php/Admin/Task/my_task_orders"
        chrome.tabs.query({
            url: url
        }, function (tabs) {
            for (var i = 0, tab; tab = tabs[i]; i++) {
                if (tab.url && tab.url.indexOf(url) == 0) {
                    chrome.tabs.update(tab.id, {
                        highlighted: true
                    });
                    return
                }
            }
            chrome.tabs.create({
                url: url
            })
        })
    })

    $('#client_host_step_timeout').on("click", function () {
        bgPage.watchDogTimeOut();
    });


    $("#restart_task_span").click(function () {
        if (confirm("确定重新开始吗")) {
            orderOperateSendMessage('client_host_status_reset');
        }
    });

    // $("#task_promotion_url .promotion").on('click', open_promotion_url);

    $("#notice_title").text(notice_title);

})


function append_tr(title, value) {
    $("#task").append("<tr><th>" + title + "</th><td>" + value + "</td></tr>")
}


//订单操作  
function orderOperateSendMessage(v) {
    var msg = {
        act: 'order_operate',
        val: v
    };
    chrome.runtime.sendMessage(msg, function (response) {

    });
}

function open_promotion_url() {
    chrome.storage.local.get(null, function (local) {
        var task = local.task;
        if (task) {
            bgPage.setHostStatus(1401000);//打开连接
            chrome.tabs.create({
                url: task.promotion_url
            }, function () {

            });
        }
    });
}
