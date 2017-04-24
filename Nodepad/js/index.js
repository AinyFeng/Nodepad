/**
 * Created by anxiaofeng on 2017/3/1.
 */
$(function () {
    addData();
    //添加数据的方法
    function addData(){
        var name = prompt('请输入姓名;');
        if (name == 'store'){
            var tag = '<div class="manage">' +
                '<h2>数据管理</h2>' +
                '<ul></ul>' +
                '<span class="quit">退出管理</span>' +
                '</div>';
            $("body").prepend(tag);

            for(var user in store.getAll()){
                var li = '<li data-name="'+ user +'">'+ user
                    +'<span class="del">删除</span></li>';

                $(".manage ul").prepend(li);
            }

            $("body").on("click",".del", function () {
                if (confirm("确定删除吗?")){
                    store.remove($(this).parent().data("name"));
                    $(this).parent().remove();
                }
            })

            $(".quit").on("click", function () {
                $(".manage").remove();

                addData();

            })

        }
        else if ($.trim(name) !=''){

            $(".name p").text(name);

            /*-------------设置吸顶效果------------------*/
            var offset_top = $(".nav").offset().top;
            $(window).on("scroll", function () {
                var scroll_top = $(window).scrollTop();
                //alert(scroll_top)
                if (scroll_top >= offset_top){
                    $(".nav").css({
                        "position":"fixed",
                        "top":0,
                        "box-shadow": "0 1px 2px #888"
                    });
                    $(".nav_left").css("opacity",1);
                    $(".back_top").fadeIn(200);
                }else{
                    $(".nav").css({
                        "position":"absolute",
                        "top":100,
                        "box-shadow": ""
                    });
                    $(".nav_left").css("opacity",0);
                    $(".back_top").fadeOut(200);
                }
            })

            /*-----------------点击图标返回顶部-------------------------*/
            $(".back_top").click(function () {
                $("html body").animate({
                    scrollTop:0
                })
            })

            /*---------------添加li---------------------*/
            var itemArray = [];
            itemArray = store.get(name)||[];
            render_view();
            $("input[type=submit]").on("click", function () {
                var text_val = $("input[type=text]").val();
                if ($.trim(text_val) == ""){
                    text_val = "";
                    alert("请输入内容");
                    return;
                }else{
                    var item = {
                        title:"",
                        createTime:"",
                        content:"",
                        isChecked:false,
                        remind_time:"",
                        isNotice:false,
                        currColor:""
                    }
                }
                var curr_date = new Date();
                var curr_year = curr_date.getFullYear();
                var curr_month = curr_date.getMonth() + 1;
                var curr_day = curr_date.getDate();
                var curr_hour = curr_date.getHours() < 10 ? "0" + curr_date.getHours():curr_date.getHours();
                var curr_min = curr_date.getMinutes() < 10 ? "0" + curr_date.getMinutes():curr_date.getMinutes();

                item.title = text_val;
                item.createTime = curr_year + "/" + curr_month + "/" + curr_day + " " + curr_hour + ":" + curr_min;
                item.currColor = "black";
                itemArray.push(item);
                render_view();

                $(".content_top li:eq(0)").addClass("curr").siblings().removeClass("curr");
                $(".content_bottom").eq(0).addClass("active").siblings().removeClass("active");
                $(".task li").eq(0).hide().slideDown(200);
            })

            /*--------------------渲染--------------------------*/
            function render_view(){
                store.set(name,itemArray);

                $("input[type=text]").val("");
                $(".task").empty();
                $(".finish_task").empty();

                for(var i = 0;i < itemArray.length;i ++){
                    var item = itemArray[i];
                    if (item == undefined || !item){
                        continue;
                    }
                    var tag = '<li data-index='+ i +'>' +
                        '<input type="checkbox" '+ (item.isChecked?'checked':'') +'>' +
                        '<span class="create_time">'+ item.createTime +'</span>' +
                        '<span class="item_title">'+ item.title +'</span>' +
                        '<span class="delete">删除</span>' +
                        '<span class="detail">详情</span>' +
                        '</li>';

                    if (item.isChecked){
                        $(".finish_task").prepend(tag);
                        $(".finish_task li:eq(0)").css("color",item.currColor);
                    }else{
                        $(".task").prepend(tag);
                        $(".task li:eq(0)").css("color",item.currColor);
                    }
                }
            }

            /*------------------切换tab-----------------------*/
            $(".content_top li").on("click", function () {
                $(this).addClass("curr").siblings().removeClass("curr");
                var index = $(this).index();
                $(".content_bottom").eq(index).addClass("active").siblings().removeClass("active");
            })


            /*-----------------操作任务事项------------------*/
            //删除
            $("body").on("click",".delete", function () {
                var item = $(this).parent();
                var index = item.data("index");

                item.slideUp(200, function () {
                    item.remove();
                });
                delete itemArray[index];

                store.set(name,itemArray);
            });
            //详情
            var curr_index = 0;
            $("body").on("click",".detail", function () {

                var item = $(this).parent();
                var index = item.data("index");
                var obj = itemArray[index];

                curr_index = index;

                $(".detail_title").text(obj.title);
                $(".detail_content textarea").val(obj.content);
                $(".detail_content input").val(obj.remind_time);

                $(".mask").fadeIn(200);

            })
            //完成
            $("body").on("click","input[type=checkbox]", function () {
                var item = $(this).parent();
                var index = item.data("index");
                var obj = itemArray[index];

                obj.isChecked = $(this).is(":checked");

                render_view();
            })

            /*--------------------操作详情页--------------------*/
            //$(".mask").click(function () {
            //    $(this).fadeOut(200);
            //});
            $(".close").click(function () {

                $(".mask").fadeOut(200);
            });
            $(".detail_content").on("click", function (event) {
                event.stopPropagation();
            })

            $.datetimepicker.setLocale("ch");
            $("#remain_time").datetimepicker();

            $(".mask button").click(function () {
                var item = itemArray[curr_index];

                item.content = $(".mask textarea").val();
                item.remind_time = $("#remain_time").val();
                item.isNotice = false;
                item.currColor = "black";

                itemArray[curr_index] = item;


                render_view();

                $(".mask").fadeOut(200);
            })

            /*----------------设置提醒--------------------*/
            setInterval(function () {
                var curr_time = (new Date()).getTime();

                for(var i = 0;i < itemArray.length;i ++){
                    var item = itemArray[i];

                    if (item == undefined || !item || item.isChecked || item.remind_time < 1 || item.isNotice){
                        continue;
                    }

                    var remind_time = (new Date(item.remind_time)).getTime();

                    if (curr_time > remind_time){
                        var lis = $(".task").children();
                        $("audio").get(0).play();
                        item.isNotice = true;
                        for(var j = 0;j < lis.length;j ++){
                            //if(lis[j].data("index") == i){
                            //    lis[j].style.color = "red";
                            //}
                            if(lis[j].getAttribute("data-index") == i){
                                lis[j].style.color = "red";
                                item.currColor = "red";
                            }
                        }

                        itemArray[i] = item;

                        store.set(name,itemArray);
                    }

                }

            },3000)


        }
        else if (name != null){
            addData();
        }
        else{

            alert("谢谢使用");
            $("body").remove();
        }
    }



});