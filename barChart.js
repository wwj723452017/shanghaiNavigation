//处理数据，将真实数值变为比例尺上的数值
function renderData(data){
    //中心点121.499809, 31.236666
    //计算定点到某个博物馆距离
    var main_x=121.499809;
    var main_y=31.236666;
    var name=[];
    var dis=[];
    var fee=[];
    var people_num=[];
    var noSortData=[];  
    data.forEach(function (d) {
        x=parseFloat(d["geometryPoint"].split(',')[0]);
        y=parseFloat(d["geometryPoint"].split(',')[1]);
        var distance=getDistance(main_x,main_y,x,y);//调用计算距离函数，在final_project\longitude and latitude.js中
        d["距离"]=distance;
        //存到单个数组里
        dis.push(distance);
        name.push(d["名称"]);
        fee.push(parseFloat(d["票价"]));
        people_num.push(parseFloat(d["人流量"]));
    });

    //对数据加上比例尺进行归一化
    var dis_Scale = d3.scaleLinear()
        .domain([d3.min(dis), d3.max(dis)])  
        .range([1, 50]);  
    var fee_Scale = d3.scaleLinear()
    .domain([d3.min(fee), d3.max(fee)])  
    .range([1, 20]);  
    var peo_Scale = d3.scaleLinear()
    .domain([d3.min(people_num), d3.max(people_num)])  
    .range([1, 30]);  
    
    //假设只需要显示
    data.forEach(function (d) {
        //选择筛选过后的数据加入需要显示数组data1
        // for (var i=0;i<choose.length;i++)
        // { 
            // if(d["name"]==choose[i]){
        var row={};
        //比例尺放过后的
        row["name"]=d["名称"];
        row["distance"]=dis_Scale(d["距离"]);
        row["fee"]=fee_Scale(parseFloat(d["票价"]));
        row["stream"]=peo_Scale(parseFloat(d["人流量"]));

        //原数字
        row["rowDistance"]=d["距离"];
        row["rowFee"]=parseFloat(d["票价"]);
        row["rowStream"]=parseFloat(d["人流量"]);
        noSortData.push(row);             
    });

    chart(noSortData);
}

function chart(noSortData){

    const keys = ['fee', 'distance', 'stream'];
    //通过修改left给文字腾出空间!!
    const margin = { top: 0, left: 180, bottom: 0, right: 0 };
    const svgWidth = 480;
    const svgHeight = 350;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;


    var svg = d3
        .select('#chart')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    var x = d3.scaleLinear().rangeRound([margin.left, width - margin.right]);

    var y = d3
        .scaleBand()
        .range([height - margin.bottom, margin.top])
        .padding(0.1);

    var xAxis = svg
        .append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .attr('class', 'x-axis');

    var yAxis = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr('class', 'y-axis');

    var z = d3
        .scaleOrdinal()
        .range(['steelblue', 'darkorange', 'lightblue'])
        .domain(keys);

        var speed=0;
        var sumKeys = d => d3.sum(keys, curKey => +d[curKey]);  //一个函数
        var barChartData = noSortData
            .map(d => {
                d.total = 100-parseInt(sumKeys(d));    //给barChartData加了一个total分数，并且排序了
                return d;
            });
        //如果直接改data比如加入和去除，这个sort应该也会起作用吧
        barChartData.sort(
            (a, b) => b.total - a.total
        );
        //要改变这个data才能够实时改变表的数据
    
        y.domain(barChartData.map(d => d.name));   //名字对应y轴

        svg.selectAll('.y-axis')
            .transition()
            .duration(speed)
            .call(d3.axisLeft(y).tickSizeOuter(0));

        x.domain([0, d3.max(barChartData, d => sumKeys(d))]).nice();

        svg.selectAll('.x-axis')
            .transition()
            .duration(speed)
            .call(d3.axisBottom(x).ticks(null, 's'));
        
        var barData=d3.stack().keys(keys)(barChartData);
        var group = svg
            .selectAll('g.layer')
            .data(barData, d => {
                return d.key;
            });
  
        group.exit().remove();

        group
            .enter()
            .append('g')
            .classed('layer', true)
            .attr('fill', d => {
                return z(d.key);
            });

        var bars = svg
            .selectAll('g.layer')
            .selectAll('rect')
            .data(
                d => {
                   return d;
                },
                e => {
                   return e.data.name;
                }
            );

        bars.exit().remove();
        
        
        var tooltip = d3.select("body")
        .append("div")
        .attr("class","tooltip")
        .style("opacity",0.0);
        

        bars.enter()
            .append('rect')
            .attr('height', y.bandwidth())
            .merge(bars)
            .attr('y', d => y(d.data.name))
            .attr('x', d => x(d[0]))   //d的[0]代表了位置
            .on("mouseover",function(d){
                /*
                鼠标移入时，
                    （1）通过 selection.html() 来更改提示框的文字
                    （2）通过更改样式 left 和 top 来设定提示框的位置
                    （3）设定提示框的透明度为1.0（完全不透明）
                    */    
                var t=d3.event.pageX-1000;
                tooltip
                .html("人流量："+d.data.rowStream+"<br />" + 
                    "票价："+d.data.rowFee+"<br />" + 
                    "当前距离："+parseInt(d.data.rowDistance)+"km")
                            .style("position",'absolute')
                            .style("left", String(t) + "px")
                            .style("top", (d3.event.pageY + 20) + "px")
                            .style("opacity",1.0);
                })
            .on("mousemove",function(d){
                /* 鼠标移动时，更改样式 left 和 top 来改变提示框的位置 */
                
                    tooltip.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 20) + "px");
                })
            .on("mouseout",function(d){
                /* 鼠标移出时，将透明度设定为0.0（完全透明）*/
                
                    tooltip.style("opacity",0.0);
                })
            .transition()
            .duration(750)
            // .delay(20)
            .attr('width', d => x(d[1]) - x(d[0]))

        var text = svg.selectAll('.text').data(barChartData, d => d.name);
        text.exit().remove();
        text.enter()
            .append('text')
            .attr('class', 'text')
            .attr('text-anchor', 'middle')
            .merge(text)
            .transition()
            .duration(speed)
            .attr('x', d => x(100-d.total) +17)
            .attr('y', d => y(d.name) + y.bandwidth() / 2+3)
            .text(d => 100-d.total);
}