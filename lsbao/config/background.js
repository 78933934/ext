// config/background.js
var UserAgent = '';//useragent
var GetTaskStatus = false;//去服务器领单状态
var StartTaskOpenUrl = false;//
var jd_ad_tab_id = 0;//jd广告窗口
var ADSLAfterConnectNubmber = 0;//adsl连接后,获取ip次数
var url_used_nums = 0;//使用拨号地址计数
var url_repeat_nums = 0;//拨号重复次数

var last_watchdog_time = new Date().getTime();
var watchdog_timeout_count = 0;
var watchdog_timeout_time = 60000;
var last_watchdog_timeout_step = null;

var yiqifaReferrer = null;

var request_task_order_nums = 0;//请求领单次数
var request_assign_account_nums = 0;//请求分配账号次数
var request_assign_url_nums = 0;//请求分配推广链接次数
var request_block_cnts = 0;//请求获取阻止链接次数
var request_check_update_nums = 0;//请求检查版本接口次数

var app_task_check_tracker_start = 0;//app领单请求赤兔更新记录开始时间
var app_checked_tracker = false;

var checkActiveExtensionFinished = true;
var login_type = null;//登录方式

//当前任务名称
var applicationName = null;

var notice_title = '零申报';

//message function
var M = {global: {}};

var tracker_env = [
    'npogbneglgfmgafpepecdconkgapppkd',
    'npogbneglgfmgafpepecdconkgapppkd',
    'emeffelceoodhoogpjnngindlklklgdn'
    //'codckobblnkmfcpaknmcpbjmfcfhminf'
];


//需要阻止打开的链接
var requestBlockUrls = [
    "*://ccc-x.jd.com/*",
    "*://sale.jd.com/*",
    "*://c-nfa.jd.com/*",
    "*://*.bijiatu.com/*",
    "*://*.juutuu.com/*",
    "*://*.jiafe.com/*"
];

//默认配置信息，设置到storage
var _cfg = {
	
	// 'host_status': 40001,
    // 'reported_status': 0,
    // 'isRunning': true,
    //'last_ip':'',
    'env':2,
    'worker': null,
	'host_status': 0,
    'host_step': 0,
	'reported_status': 0,
	'isRunning': false
};

//超时需要重新开始
var appTimeOutRestartTaskLists = [
    'lookOrder'
]

//默认推广链接地址
var defaultPromotionUrls = {
    //pc
    '0': {
        '0': 'https://www.jd.com',
        '1': 'https://www.jd.hk'
    },
    //m
    '1': {
        '0': 'https://m.jd.com',
        '1': 'https://m.jd.hk'
    }
};

var labelWatch={
    message:'',
    time:'',
    timeout:60,
    tab:{},
    isSend:false,
    retryTimes:{}
}

//插件支持的任务类型
var taskTypes= [


    {
        'apiTaskType':'test',
        'taskType':'test',
        'detail':{},
        'steps':{},
        'startPage':'https://www.jd.com/',
         disableAccount: 'appDisableAccount'
         // timeout:900e3
    },
    {
        'apiTaskType':'zero_declaration',
        'taskType':'zero_declaration',
        'detail':{},
        'steps':{},
        'startPage':'http://gj.kdzwy.com/index_new.html',
         disableAccount: 'appDisableAccount',
         timeout:300e3
    },

    {
        'apiTaskType':'receipt',
        'taskType':'rearReceipt',
        'detail':{},
        'steps':{},
        'startPage':'https://www.jd.com/',
        'urlMatch':['*://order.jd.com/center/list.action*','*://order.jd.com/center/search.action?keyword=*'],
        disableAccount: 'appDisableAccount',
        timeout:300e3
    }
]

var _host_status = {
    "1": {text: "开始"},
    "2": {text: "暂停"},

    "3": {text: "完成"},

    '200':{text:''},
};

