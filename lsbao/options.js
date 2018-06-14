$(function(){

	//1.初始化信息
	load_config();

	//2.保存配置
	var $btnSave = $('#btnSave');
	$btnSave.click(function(){
	var items = {
		'env': $("#worm_env").val(),
		'host_code': $("#host_code").val(),
		'app_secret': $("#app_secret").val()

	};

	chrome.storage.local.set(items, function(result){
		alert('保存成功');
	});

	});

});


	//3.初始化信息
function load_config(){

	var items = [

            'env',
            'host_code',
            'app_secret',
		];

	chrome.storage.local.get(items, function(result){
        console.log(result);
	    var worm_env = (result['env'] == undefined) ? 0 : result['env'];
	    var host_code = (result['host_code'] == undefined) ? '' : result['host_code'];
	    var app_secret = (result['app_secret'] == undefined) ? '' : result['app_secret'];

        $("#worm_env option[value='"+worm_env+"']").prop("selected", true);
        $("#host_code").val(host_code);
        $("#app_secret").val(app_secret);


	});
}