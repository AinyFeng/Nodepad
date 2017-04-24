/**
 * Created by Administrator on 2017/3/6.
 */
$(function () {
    /*一.设置吸顶效果*/
    /*1.1获取.nav距离顶部的距离*/
    var off_top = $('.nav').offset().top;
    /*1.2监听滚动,获取滚动的距离*/
    $(window).on('scroll', function () {
        var scr_top = $(window).scrollTop();
        /*1.3判断比较设置样式*/
        if (scr_top >= off_top) {
            $('.nav').css({
                'position': 'fixed',
                'top': 0,
                'box-shadow': '0 1px 3px rgba(0,0,0,0.5)'
            });
            $('.nav img').css({
                'opacity': 1
            });
        } else {
            $('.nav').css({
                'position': 'absolute',
                'top': off_top,
                'box-shadow': 'none'
            });
            $('.nav img').css({
                'opacity': 0
            });
        }
    });
    /*二.设置返回顶部*/
    /*2.1判断滚动的距离,设置对应的样式*/
    $(window).on('scroll', function () {
        var scr_top = $(window).scrollTop();
        if (scr_top >= off_top) {
            $('.back_top').fadeIn(200);
        } else {
            $('.back_top').fadeOut(200);
        }
    });
    /*2.2点击back_top返回顶部*/
    $('.back_top').on('click', function () {
        /*2.21让返回顶部*/
        $('html body').animate({
            scrollTop: 0
        });
    });

    /*三.添加li*/
    /*3.0创建一个数组用来记录事项*/
    var itemArray;
    /*3.10当页面加载进来的时候,(获取数据)就去从存储的数据中拿出对应的数据,如果没有就去加载*/
    itemArray = store.get('itemArray') || [];

    /*3.11渲染界面,目的是为了让下一次加载页面的时候上一次的数据还保留下来*/
    render_view();

    /*3.1点击ipnut添加后,创建事项*/
    $('input[type=submit]').on('click', function (event) {
        /*3.11去掉默认行为*/
        event.preventDefault();
        /*3.2获取input的内容,然后进行判断*/
        var inp_content = $('input[type=text]').val();
        if ($.trim(inp_content) == '') {
            alert('请输入内容');
            return;
        } else {
            /*3.3创建事项*/
            var item = {
                title: '',
                content: '',
                isCheck: false,
                remind_time: '',
                is_notice: false
            }
            /*3.4设置事件的相关属性*/
            item.title = inp_content;
            /*3.5把事项添加到数组中保存起来*/
            itemArray.push(item);
            /*3.5根据数组的长度,添加节点并且把节点显示出来*/
            render_view();
            /*3.6存储数据,方法在render_view()里面*/
        }
    });

    /*进行界面设置(渲染界面)*/
    function render_view() {
        /*存储数据:第一个参数用来表示存储的数据的标识，任何值都可以，只是用这个值来取出数据
         * 第二个参数表示要存储的数据*/
        store.set('itemArray',itemArray);
        /*把上一次的内容清空*/
        $('.task').empty();
        /*由于设置了isCheck,所以也要清空上一次的内容*/
        /*注意：为了让对应的checkBox点击的时候，让对应的不同的事项中添加不同的li
         * 所以我们需要改造渲染方法*/
        $('.finish_task').empty();
        /*3.51根据数组的长度,来添加节点*/
        for (var i = 0; i < itemArray.length; i++) {
            var obj = itemArray[i];
            if (obj == undefined || !obj) {//为了规范和严格要求进行元素的判定
                continue;//结束本次程序
            }

            //3.6创建节点li
            //data-index:用来给li绑定索引值
            var tag = '<lib data-index=' + i + '>' +
                '<input type="checkbox"'+(obj.isCheck?'checked':'')+' >' +
                '<span class="item_title">' + obj.title + ' </span>' +
                '<span class="del">删除</span>' +
                '<span class="detail">详情</span>' +
                '</lib>';

            /*3.7添加li*/
            /*3.71根据是否检查过,来确定添加到待办事项还是完成事项*/
            if(obj.isCheck){
                $('.finish_task').prepend(tag);
            }else{
                $('.task').prepend(tag);
            }
        }
    }

    /*四.切换tab*/
    /*4.1点击li切换tab*/
    $('.header lib').on('click',function (){
        $(this).addClass('cur').siblings().removeClass('cur');

        /*4.2获取点击li的索引值*/
        var index = $(this).index();
        /*4.3切换下面的div*/
        $('.body').eq(index).addClass('active').siblings().removeClass('active');
    });

    /*五.点击删除按钮,删除对应的li,需要使用代理模式*/
    $('body').on('click','.del',function (){
        /*5.1获取.del所在的li*/
        var item = $(this).parent();
        /*5.2获取li对应的索引值*/
        var index = item.data('index');

        /*5.3为了代码的严格,我们可以对索引进行判断*/
        if(index == undefined || !itemArray[index])return;
        /*5.4删除数组中对应的元素*/
        delete itemArray[index];
        /*5.5删除对应的节点*/
        item.slideUp(200,function (){
            item.remove();
        });
        /*5.6存储数据*/
        store.set('itemArray',itemArray);

    });
    /*六.点击(选中)待办事项,让对应的待办事件由待办事件变为已完成事件*/
    /*(可以设置checkbox的值来进行判断)*/
    $('body').on('click','input[type=checkbox]',function (){
        /*6.1确定勾选中点击li的索引*/
        var item = $(this).parent();
        var index = item.data('index');
        if(index == undefined || !itemArray[index])return;
        /*6.2拿出index对应数组中的元素*/
        var obj = itemArray[index];
        /*6.3设置obj中的isCheck为选中*/
        obj.isCheck = $(this).is(':checked');
        /*6.4用修改过后的obj替换原来的数组中的元素*/
        itemArray[index] = obj;
        /*6.5设置界面(也就是添加li),调用函数*/
        render_view();
        /*6.6注意:只要有添加和删除的地方就要存储数据*/

    });

    /*七.点击详情按钮的相关的设置*/
    /*设置一个值来记录当前点击的li是哪一个,记录索引*/
    var cur_index = 0;
    $('body').on('click','.detail',function (){
        /*7.1设置让对应的mask出来*/
        $('.mask').fadeIn();

        /*7.2获取点击的详情所在的li的索引值*/
        var item = $(this).parent();
        var index = item.data('index');
        /*7.21获取当前li对应的索引值*/
        cur_index = index;
        if(index == undefined || !itemArray[index])return;
        /*7.3根据索引值获取数组中对应的事项元素*/
        var obj = itemArray[index];
        /*7.4根据对应的事项设置我们具体的内容*/
        /*7.41设置标题*/
        $('.detail_header .title').text(obj.title);
        /*7.42设置内容*/
        $('.detail_header textarea').val(obj.content);
        /*7.43设置提醒时间*/
        $('.detail_body input[type=text]').val(obj.remind_time);
    });
    /*八.处理事件的相关点击*/
    $('.mask').click(function (){
        $(this).fadeOut();
    });
    $('.close').click(function (){
        $('.mask').fadeOut();
    });

    /*8.1点击内容阻止事件冒泡*/
    $('.detail_content').click(function (event){
        event.stopPropagation();
    });

    /*8.2设置当光标移动到input上设置时间的时候,让对应的时间选择器显示出来*/
    /*8.21设置本地化时间(设置中国时间)*/
    $.datetimepicker.setLocale('ch');
    /*8.22给对应的标签设置时间选择器*/
    $('#date_time').datetimepicker();

    /*九.详情的更新数据和界面*/
    $('.detail_content button').click(function (){
        /*9.1获取点击详情按钮对应的索引值*/
        /*9.2获取对应索引值在数组中对应的事项元素*/
        var item = itemArray[cur_index];
        /*9.3设置元素的数据*/
        item.content = $('.detail_body textarea').val();
        item.remind_time = $('.detail_body input[type=text]').val();
        /*is_notice：表示有没有提醒去做对应事项*/
        item.is_notice = false;
        /*9.4赋值回原来的位置*/
        itemArray[cur_index] = item;
        /*9.5存储数据*/
        /*store.set('itemArray',itemArray);*/
        /*9.6更新界面*/
        render_view();
        //9.7让当前的.mask消失
        $('.mask').fadeOut();
    });

    /*十.提醒设置*/
    /*10.1我们需要时时刻刻比较当前的时间和设置的时间，所以要使用定时器*/
    setInterval(function (){
        /*10.2获取当前的时间*/
        var cur_time = (new Date()).getTime();//转化为毫秒数
        /*10.21获取每一个元素的提醒时间,和当前时间进行比较,我们需要遍历*/
        for(var i = 0;i<itemArray.length;i++){
            /*获取当前的元素*/
            var item = itemArray[i];
            if(item == undefined ||!item ||item.remind_time.length<1||item.is_notice){
                continue;
            };
            /*10.22获取当前的元素的提醒时间*/
            var rem_time = (new Date(item.remind_time)).getTime();
            /*10.23判断当前时间是否大于提醒时间*/
            if(cur_time - rem_time >1){
                //需要提醒,应让铃声响起
                /*获取的对象是jQuery对象我们需要转化成js对象*/
                $('video').get(0).play();
                $('video').get(0).currentTime = 0;
                /*10.24当铃声响起后表示已经提醒过了,我们需要设置is_notice为true*/
                item.is_notice = true;
                /*10.25重新赋值*/
                itemArray[i] = item;
                /*10.26存储数据*/
                store.set('itemArray',itemArray);
            }

        }
    },2000);

});