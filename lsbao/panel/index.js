//操作面板 panel/index.js
panelIndex();

function panelIndex(){
    var position_html = '<div id="panel-XSS" class="position-XSS">\
							<div class="title-XSS"><b id="extension_name">测试插件</b> <b id="extension_version"></b> <span id="pageTime"></span></div>\
							<div class="panel-XSS">\
							<h2>test这是一个测试</h2>\
							  <div>\
						</div>';

    $("body").append(position_html);
    $(".title-XSS").click(function(){
        $(".panel-XSS").slideToggle(0);
    });

    var extension_name_arr = ['测试插件'];

}