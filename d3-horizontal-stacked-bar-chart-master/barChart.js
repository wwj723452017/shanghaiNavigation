// import './main.css';
// import jsonData from './data.json';
// import * as d3 from 'd3';
// import "./lib/d3-tip.js"
// import "./lib/d3.v5.min.js"


// d3.csv("data.csv").then(d => chart(d))



// d3.csv("data.json").then(d => cal_data(d));



var files = ["all_info.csv"];
var promises = [];
promises.push(d3.csv(files[0]))

Promise.all(promises).then(function (values) {
    var buildings = values[0];
    renderData(buildings);
}).catch(err => console.log('Error loading or parsing data.'));

function renderData(data){

    //中心点121.499809, 31.236666
    //计算定点到某个博物馆距离
    var main_x=121.499809;
    var main_y=31.236666;
    var name=[];
    var dis=[];
    var fee=[];
    var people_num=[]
    var data1=[];
    data.forEach(function (d) {
        x=parseFloat(d["geometryPoint"].split(',')[0]);
        y=parseFloat(d["geometryPoint"].split(',')[1]);
        var distance=getDistance(main_x,main_y,x,y);//调用计算距离函数，在final_project\longitude and latitude.js中
        d["distance"]=distance;
        //存到单个数组里
        dis.push(distance);
        name.push(d["name"]);
        fee.push(parseFloat(d["price"]));
        people_num.push(parseFloat(d["stream"]));
    });

     //对数据加上比例尺进行归一化
        //  const x = d3.scaleLinear().rangeRound([margin.left, width - margin.right]);
//         var scale = d3.scaleLinear()
//    .domain([d3.min(data), d3.max(data)])
//    .range([100, 400]);
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
    var choose=["静安寺","鲁迅故居","上海博物馆","巴金故居"];

    data.forEach(function (d) {
        //选择筛选过后的数据加入需要显示数组data1
        for (var i=0;i<choose.length;i++)
        { 
            if(d["name"]==choose[i]){
                var row={};
                //比例尺放过后的
                row["name"]=d["name"];
                row["distance"]=dis_Scale(d["distance"]);
                row["fee"]=fee_Scale(parseFloat(d["price"]));
                row["stream"]=peo_Scale(parseFloat(d["stream"]));

                //原数字
                row["distance1"]=d["distance"];
                row["fee1"]=parseFloat(d["price"]);
                row["stream1"]=parseFloat(d["stream"]);
                data1.push(row);
            }
        }
             
    });

    chart(data1);
}

// d3.json("data.json").then(d => chart(d));


function chart(jsonData){

const keys = ['fee', 'distance', 'stream'];
// const year = [...new Set(jsonData.map(d => d.year))];
const names = [...new Set(jsonData.map(d => d.name))];

//通过修改left给文字腾出空间!!
const margin = { top: 35, left: 100, bottom: 0, right: 0 };
const svgWidth = 650;
const svgHeight = 400;
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// const options = d3
//     .select('#year')
//     .selectAll('option')
//     .data(year)
//     .enter()
//     .append('option')
//     .text(d => d);
const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

const x = d3.scaleLinear().rangeRound([margin.left, width - margin.right]);

const y = d3
    .scaleBand()
    .range([height - margin.bottom, margin.top])
    .padding(0.1);

const xAxis = svg
    .append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .attr('class', 'x-axis');

const yAxis = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .attr('class', 'y-axis');

const z = d3
    .scaleOrdinal()
    .range(['steelblue', 'darkorange', 'lightblue'])
    .domain(keys);

// const update = (inputVal, speed) => {
    var speed=0;
    // const input = +inputVal;
    const sumKeys = d => d3.sum(keys, curKey => +d[curKey]);
    const data = jsonData
        // .filter(f => f.year === input)
        .map(d => {
            d.total = parseInt(sumKeys(d));
            return d;
        });

    data.sort(
        // d3.select('#sort').property('checked')
        //     ? 
        (a, b) => b.total - a.total
        //     : (a, b) => states.indexOf(a.state) - states.indexOf(b.state)
    );

    y.domain(data.map(d => d.name));

    svg.selectAll('.y-axis')
        .transition()
        .duration(speed)
        .call(d3.axisLeft(y).tickSizeOuter(0));

    x.domain([0, d3.max(data, d => sumKeys(d))]).nice();

    svg.selectAll('.x-axis')
        .transition()
        .duration(speed)
        .call(d3.axisBottom(x).ticks(null, 's'));

    const group = svg
        .selectAll('g.layer')
        .data(d3.stack().keys(keys)(data), d => {
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

    const bars = svg
        .selectAll('g.layer')
        .selectAll('rect')
        .data(
            d => d,
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
        .attr('x', d => x(d[0]))
        .on("mouseover",function(d){
            /*
            鼠标移入时，
                （1）通过 selection.html() 来更改提示框的文字
                （2）通过更改样式 left 和 top 来设定提示框的位置
                （3）设定提示框的透明度为1.0（完全不透明）
                */    
            tooltip
            .html("人流量："+d.data.stream1+"<br />" + 
                  "票价："+d.data.fee1+"<br />" + 
                  "当前距离："+parseInt(d.data.distance1)+"km")
                        .style("left", (d3.event.pageX) + "px")
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

    const text = svg.selectAll('.text').data(data, d => d.name);
    text.exit().remove();
    text.enter()
        .append('text')
        .attr('class', 'text')
        .attr('text-anchor', 'middle')
        .merge(text)
        .transition()
        .duration(speed)
        .attr('x', d => x(d.total) +17)
        .attr('y', d => y(d.name) + y.bandwidth() / 2+3)
        .text(d => d.total);
// };

// update(d3.select('#year').property('value'), 0);

// const select = d3.select('#year').on('change', function() {
//     update(this.value, 750);
// });

// d3.select('#sort').on('click', () => {
//     update(select.property('value'), 750);
// });

}//function char()over