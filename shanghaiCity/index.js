//定义全局变量
var pointData;     		//----点的数据
var map;           		//-----地图
var littleMap;          //-----小地图
var markers=[];    		//-----点集
var littleMapCircleMarkers=[];        //-----小点集
var mapCircleMarkers=[];
var currentPoint;       //-----当前数据点，跳转时用
var color = d3.scaleThreshold()    //domain--定义域 range--值域 做的转换
    .domain([0,150,300,500,1000])
    .range(["rgb(77,255,90)","rgb(165,255,77)","rgb(249,255,77)","rgb(255,178,77)","rgb(255,77,77)"]);
var choose=[];   //当前有哪些点的名称
 
//将数据读取到全局变量——主函数
d3.csv('data/handmakecsv.csv').then(data=>{    
    pointData=data;
    pointData.forEach(d=>{
        choose.push(1);
        // 处理人流数据  
        let t=parseInt(d['人流量']);
        if(t>=0 && t<=150){
            d['人流类型']='1';
        }
        else if(t>150 && t<=300){
            d['人流类型']='2';
        }
        else if(t>300 && t<=500){
            d['人流类型']='3';
        }
        else{
            d['人流类型']='4';
        }
        //处理票价数据
        let p=parseInt(d['票价']);
        if(p==0){
            d['票价类型']='1';
        }
        else if(p<50){
            d['票价类型']='2';
        }
        else if(p<100){
            d['票价类型']='3';
        }
        else if(p<150){
            d['票价类型']='4';
        }
        else{
            d['票价类型']='5';
        }
    })    
    this.mapInit();
    this.littleMapInit();
    //柱状图的初始生成
    renderData(data);
})

//用vue来定义一下可视化区域中的函数
var leftViewer = new Vue({
    el: '#leftViewer',
    data: {
        // 样式对应数据
        picks1:[1,0,0,0,0],
        picks2:[1,0,0,0,0],
        picks3:[1,0,0,0,0],
        
        //文字绑定数据
        cata:"不限",
        humanFlow:"不限",
        sell:"不限",
        
        cataTexts:['博物馆','老洋房','故居','其他'],
        humanTexts:['0~150','151~300','301~500','>500'],
        sellTexts:['免费','低于50元','低于100元','低于150元'],

        //判断
        flag1:0,
        flag2:0,
        flag3:0
    },
    methods: {
    //移动到中心
    moveToCenter:function(){
        var zoom = 19;
        var lng = 121.545917;
        var lat = 31.263072;
        map.setZoomAndCenter(zoom, [lng, lat]); //同时设置地图层级与中心点
    },

    pickCata:function(index){
        //点击第二次取消
        if(this.picks1[index]==1){
            this.flag1=0;
            this.cata="不限";
            this.picks1=[1,0,0,0,0];
            for(var i=0;i<pointData.length;i++){
                if(pointData[i]['flag']=='0' && (parseInt(pointData[i]['票价类型'])<=this.flag3 || this.flag3==0) && (parseInt(pointData[i]['人流类型'])==this.flag2 || this.flag2 == 0)){
                    //添加回来
                    // barChartData.push(noSortData[i]);
                    map.add(markers[i]);
                    map.add(mapCircleMarkers[i]);
                    littleMap.add(littleMapCircleMarkers[i]);
                    pointData[i]['flag']='1';
                    choose[i]=1;
                }
            }
        }
        else{
            this.flag1=index;
            this.cata=this.cataTexts[index-1];
            this.picks1=[0,0,0,0,0];
            this.picks1[index]=1;
            //先将复合条件的添加回来
            for(var i=0;i<pointData.length;i++){
                if(pointData[i]['flag']=='0' && (parseInt(pointData[i]['票价类型'])<=this.flag3 || this.flag3==0) && (parseInt(pointData[i]['人流类型'])==this.flag2 || this.flag2 == 0)){
                    
                    //添加回来
                    // barChartData.push(noSortData[i]);
                    map.add(markers[i]);
                    map.add(mapCircleMarkers[i]);
                    littleMap.add(littleMapCircleMarkers[i]);
                    pointData[i]['flag']='1';
                    choose[i]=1;
                }
            }
            //再将不是当前条件下的去掉
            for(var i=0;i<pointData.length;i++){
                if(pointData[i]['flag']=='1'){
                    if(pointData[i]['类型']!=String(index)){
                    
                        map.remove(markers[i]);
                        map.remove(mapCircleMarkers[i]);
                        littleMap.remove(littleMapCircleMarkers[i]);
                        pointData[i]['flag']='0';
                        choose[i]=0;
                        // console.log(choose);
                    }
                }
            }
        }
        //将chart元素内设置为空，处理完之后重新绘制（获取一个新的去掉相关数据的pointData）
        var chartDiv=document.getElementById("chart");
        chartDiv.innerHTML="";
        //根据choose重新得到要生成的数据
        var barData=[];
        for(var i=0;i<choose.length;i++){
            if(choose[i]==1){
              barData.push(pointData[i]);   
            }
        }
        renderData(barData);
    },   
    pickHuman:function(index){
        if(this.picks2[index]==1){
            this.flag2=0;
            this.humanFlow="不限";
            this.picks2=[1,0,0,0,0];
            //还原
            for(var i=0;i<pointData.length;i++){
                //如果是删除了的，并且满足类型和票价条件的
                if(pointData[i]['flag']=='0'&& (parseInt(pointData[i]['票价类型'])<=this.flag3 || this.flag3==0) && (parseInt(pointData[i]['类型'])==this.flag1 || this.flag1 == 0)){
                    //添加回来
                    map.add(markers[i]);
                    map.add(mapCircleMarkers[i]);
                    littleMap.add(littleMapCircleMarkers[i]);
                    pointData[i]['flag']='1';
                    choose[i]=1;
                }
            }
        }
        else{
            this.humanFlow=this.humanTexts[index-1];
            this.flag2=index;
            this.picks2=[0,0,0,0,0];
            this.picks2[index]=1;
            for(var i=0;i<pointData.length;i++){
                //如果是删除了的，并且满足类型和票价条件的
                if(pointData[i]['flag']=='0'&& (parseInt(pointData[i]['票价类型'])<=this.flag3 || this.flag3==0) && (parseInt(pointData[i]['类型'])==this.flag1 || this.flag1 == 0)){
                    //添加回来
                    map.add(markers[i]);
                    map.add(mapCircleMarkers[i]);
                    littleMap.add(littleMapCircleMarkers[i]);
                    pointData[i]['flag']='1';
                    choose[i]=1;
                }
            }
            for(var i=0;i<pointData.length;i++){
                if(pointData[i]['flag']=='1'){
                    if(pointData[i]['人流类型']!=String(index)){
                        //将其移除
                        map.remove(markers[i]);
                        map.remove(mapCircleMarkers[i]);
                        littleMap.remove(littleMapCircleMarkers[i]);
                        pointData[i]['flag']='0';
                        choose[i]=0;
                    }
                }
            }
        }
        var chartDiv=document.getElementById("chart");
        chartDiv.innerHTML="";
        //根据choose重新得到要生成的数据
        var barData=[];
        for(var i=0;i<choose.length;i++){
            if(choose[i]==1){
              barData.push(pointData[i]);   
            }
        }
        renderData(barData);
    },
    pickSell:function(index){
        if(this.picks3[index]==1){
            this.sell="不限";
            this.picks3=[1,0,0,0,0];
            this.flag3=0;
            for(var i=0;i<pointData.length;i++){
                if(pointData[i]['flag']=='0'&& (parseInt(pointData[i]['人流类型'])==this.flag2 || this.flag2==0) && (parseInt(pointData[i]['类型'])==this.flag1 || this.flag1 == 0)){
                    //添加回来
                    map.add(markers[i]);
                    map.add(mapCircleMarkers[i]);
                    littleMap.add(littleMapCircleMarkers[i]);
                    pointData[i]['flag']='1';
                    choose[i]=1;
                }
            }
        }
        else{
            this.flag3=index;
            this.sell=this.sellTexts[index-1];
            this.picks3=[0,0,0,0,0];
            this.picks3[index]=1;
            for(var i=0;i<pointData.length;i++){
                if(pointData[i]['flag']=='0'&& (parseInt(pointData[i]['人流类型'])==this.flag2 || this.flag2==0) && (parseInt(pointData[i]['类型'])==this.flag1 || this.flag1 == 0)){
                    //添加回来
                    map.add(markers[i]);
                    map.add(mapCircleMarkers[i]);
                    littleMap.add(littleMapCircleMarkers[i]);
                    pointData[i]['flag']='1';
                    choose[i]=1;
                }
            }
            for(var i=0;i<pointData.length;i++){
                if(pointData[i]['flag']=='1'){
                    if(pointData[i]['票价类型']!=String(index)){
                        //将其移除
                        map.remove(markers[i]);
                        map.remove(mapCircleMarkers[i]);
                        littleMap.remove(littleMapCircleMarkers[i]);
                        pointData[i]['flag']='0';
                        choose[i]=0;
                    }
                }
            }
        }
        var chartDiv=document.getElementById("chart");
        chartDiv.innerHTML="";
        //根据choose重新得到要生成的数据
        var barData=[];
        for(var i=0;i<choose.length;i++){
            if(choose[i]==1){
              barData.push(pointData[i]);   
            }
        }
        renderData(barData);
    },
}
})

var rightViewer = new Vue({
    el: '#rightViewer',
    data: {
        isShowInfo:false,
        theName:'',
        theImg:'',
        theInfo:'',
        openTime:'',
        sell:''
    },
    methods:{
        //前往内部界面
        goIN:function(){
            window.localStorage.value=currentPoint;
            window.open('./inBuilding.html');   //新开一个界面
        },
        isShowMuseumInfo:function(t){
            if(t==1){
                this.isShowInfo=true;
            }
            else{
                this.isShowInfo=false;
            }
        },
        showHuman:function(){
        }
        //同理可以写一下票价和其他的
    }
})

function mapInit() {
    var opts = {
        subdistrict: 0,
        extensions: 'all',
        level: 'city'
    };
    //利用行政区查询获取边界构建mask路径
    var district = new AMap.DistrictSearch(opts);
    district.search('上海市', function(status, result) {
        var bounds = result.districtList[0].boundaries;
        var mask = []
        for(var i =0;i<bounds.length;i+=1){
            mask.push([bounds[i]])
        }
        // 创建地图实例
        map = new AMap.Map("container", {
        mask:mask,
        viewMode: '3D',
        pitch: 30,
        rotation: 25,
        zoom: 14.8,  //这个要放大到一定程度才会看到楼层如：18
        zooms:[12,25],
        center: [121.499809, 31.236666],
        showBuildingBlock: true,  //楼层
        buildingAnimation:false,//楼块出现是否带动画

        expandZoomRange:true,
        showIndoorMap: false,
        mapStyle: 'amap://styles/whitesmoke',
    });
    //添加高度面
    var object3Dlayer = new AMap.Object3DLayer({zIndex:1});
    map.add(object3Dlayer)
    var height = -8000;
    var color = '#1b427e';//rgba
    var wall = new AMap.Object3D.Wall({
        path:bounds,
        height:height,
        color:color
    });
    wall.transparent = true
    object3Dlayer.add(wall)
    //添加描边
    for(var i =0;i<bounds.length;i+=1){
        new AMap.Polyline({
            path:bounds[i],
            strokeColor:'#99ffff',
            strokeWeight:4,
            map:map
        })
    }
    //添加右上方3维控制器
    map.addControl(new AMap.ControlBar({
        showZoomBar:false,
        showControlButton:true,
        position:{
        right:'420px',
        top:'10px'
        }
    }))


    //定位点
    pointData.forEach(d => {
        var p = d['geometryPoint'].split(",");          
        p[0]=parseFloat(p[0]);
        p[1]=parseFloat(p[1]);  

        //添加底部圆圈
        var circle = new AMap.Circle({
            center:p,
            radius:200,
            // fillColor:color(human),
            fillColor:'red',
            strokeWeight:1,
            strokeColor:'white',
            fillOpacity:0.2
        })
        mapCircleMarkers.push(circle);
        circle.setMap(map)

        //表示地图级别与styles中样式对应关系的映射
        //表示14到15级使用styles中的第0个样式，16-20级使用第二个样式
        //之后可以在改变层级的时候直接让它没有了就可以，比如为1
        var zoomStyleMapping2 = {14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0,24:0,25:0,26:0,27:0,28:0}
        var marker = new AMap.ElasticMarker({
            position: p,
            zooms:[14,28],
            ancher:'center',
            styles:[{
                icon:{
                    img:d['marker'],
                    size:[50,50],  //图片的大小
                    ancher:[25,25],   

                    fitZoom:17, //最合适的级别，在此级别下显示为原始大小
                    scaleFactor:1, //地图放大一级的缩放比例系数
                    maxScale:1,//最大放大比例
                    minScale:1 //最小放大比例
                },
                label:{
                    content:d['名称'],
                    offset: [-18*d['名称'].length/2,0],//相对position的偏移量
                    position:'BM',
                    minZoom:14//label的最小显示级别
                    //文本位置相对于图标的基准点
                    //BL、BM、BR、ML、MR、TL、TM、TR分别代表左下角、底部中央、右下角、
                    //左侧中央、右侧中央、左上角、顶部中央、右上角。 
                    //缺省时代表相对图标的锚点位置
                }
            }],
            zoomStyleMapping:zoomStyleMapping2
        })


        //实例化信息窗体
        var title = d['名称'],
        content = [];
        content.push('<img src='+d['图片']+'>'+d['地址']);
        content.push(d['详情']);
        var infoWindow = new AMap.InfoWindow({
            isCustom: true,  //使用自定义窗体
            content: createInfoWindow(title, content.join("<br/>")),
            offset: new AMap.Pixel(16, -45)
        });

        //构建自定义信息窗体
        function createInfoWindow(title, content) {
            //创建div
            var info = document.createElement("div");
            //类名
            info.className = "custom-info input-card content-window-card";

            //可以通过下面的方式修改自定义窗体的宽高
            //info.style.width = "400px";
            // 定义顶部标题
            var top = document.createElement("div");
            var titleD = document.createElement("div");
            
            top.className = "info-top";
            titleD.innerHTML = title;
    

            top.appendChild(titleD);
            info.appendChild(top);

            // 定义中部内容
            var middle = document.createElement("div");
            middle.className = "info-middle";
            middle.style.backgroundColor = 'white';
            middle.innerHTML = content;
            info.appendChild(middle);

            // 定义底部内容
            var bottom = document.createElement("div");
            bottom.className = "info-bottom";
            bottom.style.position = 'relative';
            bottom.style.top = '0px';
            bottom.style.margin = '0 auto';

            info.appendChild(bottom);
            return info;
        }

        //添加悬浮事件
        AMap.event.addListener(marker, 'mouseover', function () {
            infoWindow.open(map, marker.getPosition());
        });
        AMap.event.addListener(marker, 'mouseout', function () {
            infoWindow.close();
        });
        //添加点击事件
        AMap.event.addListener(marker, 'click', function () { 
            //当前点击的是哪个点
            for(var i=0;i<markers.length;i++){
                if(marker==markers[i]){
                    if(pointData[i]['flag']!='0'){  //是显示的
                        //显示右侧区域(后期如果只是单纯的显示可以不用vue，改掉)
                        rightViewer.isShowMuseumInfo(1);
                        map.on('click', clickMap);
                        currentPoint=i;
                        rightViewer._data['theName']=pointData[i]['名称'];
                        rightViewer._data['theImg']=pointData[i]['图片'];
                        rightViewer._data['theInfo']=pointData[i]['详情'];
                        rightViewer._data['openTime']=pointData[i]['开放时间'];
                        if(pointData[i]['票价']!='0'){
                            rightViewer._data['sell']=pointData[i]['票价'];
                        }
                        else{
                            rightViewer._data['sell']='免费';
                        }
                        
                    }
                    break;	
                }
            }

        });

        markers.push(marker);
        map.add(marker)

    })
    
    });
}
function clickMap(){
    //点击地图区域的时候，显示回原先的
    rightViewer.isShowMuseumInfo(0);
    //解绑
    map.off('click', clickMap);
}
function littleMapInit(){
    var opts = {
        subdistrict: 0,
        extensions: 'all',
        level: 'city'
    };
    //利用行政区查询获取边界构建mask路径
    var district = new AMap.DistrictSearch(opts);
    district.search('上海市', function(status, result) {
        var bounds = result.districtList[0].boundaries;
        var mask = []
        for(var i =0;i<bounds.length;i+=1){
            mask.push([bounds[i]])
        }
        littleMap = new AMap.Map('littleMap', {
            mask:mask,
            center:[121.499809, 31.236666],
            disableSocket:true,
            viewMode:'3D',
            showLabel:false,
            labelzIndex:130,
            pitch:0,
            zoom:8.5,
            mapStyle: 'amap://styles/fresh',
        });

        //添加高度面
        var object3Dlayer = new AMap.Object3DLayer({zIndex:1});
        littleMap.add(object3Dlayer)
        var height = -8000;
        var color = 'black';//rgba
        var wall = new AMap.Object3D.Wall({
            path:bounds,
            height:height,
            color:color
        });
        wall.transparent = true
        object3Dlayer.add(wall)
        //添加描边
        for(var i =0;i<bounds.length;i+=1){
            new AMap.Polyline({
                path:bounds[i],
                strokeColor:'#99ffff',
                strokeWeight:4,
                map:littleMap
            })
        }
        //添加点
        pointData.forEach(d =>{
            var p = d['geometryPoint'].split(",");          
            p[0]=parseFloat(p[0]);
            p[1]=parseFloat(p[1]);  

            var circleMarker = new AMap.CircleMarker({
                center:p,
                radius:5,//3D视图下，CircleMarker半径不要超过64px
                strokeColor:'white',
                strokeWeight:2,
                strokeOpacity:0.5,
                fillColor:'red',
                fillOpacity:0.5,
                zIndex:10,
                bubble:true,
                cursor:'pointer',
                clickable: true
            })
            littleMapCircleMarkers.push(circleMarker);
            circleMarker.setMap(littleMap)
        })
        //添加可移动图标
        var marker = new AMap.Marker({
            position: littleMap.getCenter(),
            icon: 'https://img1.imgtp.com/2022/06/07/mz5IO9wk.png',
            anchor:'center',
            offset: new AMap.Pixel(0,0),
            // 设置是否可以拖拽
            draggable: true,
            cursor: 'move',
        });
        //添加松开事件，设定大地图的中心点
        AMap.event.addListener(marker, 'mouseup', function () {
            map.setCenter([marker['B']['a6']['R'],[marker['B']['a6']['Q']]]); //同时设置地图层级与中心点
        });
        
        marker.setMap(littleMap);
    });

}
    

