/* block alert */
if (!window.started) {
    window.started = !0;
    var namespace = "xss" + Math.random().toString().substr(2), key = Math.random().toString().substr(2);
    var _configBlockAlertSet = {"blockalert": true, "blockconfirm": true, "blockprompt": true, "renderalert": false};

    injectScript = function (b, d) {
        var a = document.createElement("script");
        a.innerHTML = "(" + b.toString() + ")(" + (d ? d.map(function (a) {
                return JSON.stringify(a)
            }).join(", ") : "") + ");";
        a.addEventListener("load", function () {
            document.documentElement.removeChild(a)
        }, !0);
        document.documentElement.insertBefore(a, document.documentElement.firstChild ||
            null)
    }

    injectScript(function (b, d, a) {
        window[b] = new function () {
            var f = window.alert
                , c = window.confirm
                , g = window.prompt
                , e = function (a) {
                    a.namespace = b;
                    window.postMessage(a, "*")
                }
                ;
            this.set = function (b, c) {
                b == d && (a = c)
            };
            window.alert = function (b) {
                var c = a.blockalert || a.renderalert || !1;
                e({
                    alert: {
                        blocked: c,
                        message: b ? b.toString() : ""
                    }
                });
                return c ? !1 : f(b)
            };
            window.confirm = function (b) {
                var d = a.blockconfirm || !1;
                e({
                    confirm: {
                        blocked: d,
                        message: b ? b.toString() : ""
                    }
                });
                return d ? !1 : c(b)
            };
            window.prompt = function (b, c) {
                var d = a.blockprompt || !1;
                e({
                    prompt: {
                        blocked: d,
                        message: b ?
                            b.toString() : "",
                        def: c
                    }
                });
                return d ? !1 : g(b, c)
            };
        }
    }, [namespace, key, _configBlockAlertSet])

}




//(function (b,d,a){
//    window[b]=new function(){
//        var f=window.alert,
//            c=window.confirm,
//            g=window.prompt,
//            e=function(a){a.namespace=b;window.postMessage(a,"*")};
//        this.set=function(b,c){b==d&&(a=c)};
//        window.alert=function(b){
//            var c=a.blockalert||a.renderalert||!1;
//            e({alert:{blocked:c,message:b?b.toString():""}});
//            return c?!1:f(b)
//        };
//        window.confirm=function(b){
//            var d=a.blockconfirm||!1;
//            e({confirm:{blocked:d,message:b?b.toString():""}});
//            return d?!1:c(b)
//        };
//        window.prompt=function(b,c){
//            var d=a.blockprompt||!1;
//            e({prompt:{blocked:d,message:b?b.toString():"",def:c}});
//            return d?!1:g(b,c)}
//    }
//})("nnnnn", "025544430485659797", {"blockalert":true,"blockconfirm":false,"blockprompt":false,"renderalert":false});