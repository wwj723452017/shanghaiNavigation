
function radialtree(data){
  // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 40, left: 50 },
    width = 600 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
  
    console.log('1')
    //文物   珍贵级别：一级，二级，三级  圆的颜色区分
    //年代    -1400，-200  x轴
    //尺寸cm    15，120   y轴
    //点赞数    10,500 圆的大小

    // Add X axis
    var x = d3.scaleLinear()
      .domain([-1600, -200])
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add X axis label:
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + margin.top + 25)
      .text("年代")
      .style("font-size", 15);

    // Y axis label:
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -margin.top)
      .text("文物高度")
      .style("font-size", 15);

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 140])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add a scale for bubble size
    var z = d3.scaleLinear()
      .domain([10, 500])
      .range([4, 40]);

    // Add a scale for bubble color
    var myColor = d3.scaleOrdinal()
      .domain(["一级", "二级", "三级"])
      .range(d3.schemeSet2);

    //加上图例
    svg.append("circle").attr("cx", width - margin.right - 30).attr("cy", margin.top - 10).attr("r", 6).style("fill", myColor("一级"))
    svg.append("circle").attr("cx", width - margin.right - 30).attr("cy", margin.top + 10).attr("r", 6).style("fill", myColor("二级"))
    svg.append("circle").attr("cx", width - margin.right - 30).attr("cy", margin.top + 30).attr("r", 6).style("fill", myColor("三级"))

    svg.append("text")
    .attr("x", width - margin.right - 20)
    .attr("y", margin.top - 10)
    .text("一级文物")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle")

    svg.append("text").attr("x", width - margin.right - 20).attr("y", margin.top + 10).text("二级文物").style("font-size", "15px").attr("alignment-baseline", "middle")
    svg.append("text").attr("x", width - margin.right - 20).attr("y", margin.top + 30).text("三级文物").style("font-size", "15px").attr("alignment-baseline", "middle")

    // -1- Create a tooltip div that is hidden by default:
    var tooltip = d3.select("#my_dataviz")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "#85ceb7")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "#2c2c2c")
      .style("width",'80%')

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    var showTooltip = function (event,d) {   //这里第二个参数才是数据
      tooltip
        .transition()
        .duration(200)
      tooltip
        .style("opacity", 1)
        .html(d.name + ":" + d.level + "文物，在公元前" + Math.abs(d.age) + "年发现，高" + d.cm + "厘米，共计游客点赞数量为" + d.like + "。")

    }
    var hideTooltip = function (d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }
    var clickCircle = function(event,d){
      //显示具体的文物
      for(var i=0;i<pavilionsData.length;i++){
				if(pavilionsData[i]['文物']==d.name){
					//修改样式
					labelImg.src=pavilionsData[i]['图片链接'];                        
					labelText.textContent=pavilionsData[i]['文物'];
					//移动到对应位置上
          var p=d.方块坐标.split(",");          
					theCube.position.x = parseFloat(p[0]);
					theCube.position.y = 5;  
					theCube.position.z = parseFloat(p[2]);
					renderer.render(scene, camera);
					labelRenderer.render(scene,camera);
					break;
				}
			}
    }
    // Add dots
    svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubbles")
      .attr("cx", function (d) { return x(d.age); })
      .attr("cy", function (d) { return y(d.cm); })
      .attr("r", function (d) { return z(d.like); })
      .style("fill", function (d) { return myColor(d.level); })
      .style("opacity", 0.8)
      // -3- Trigger the functions
      .on("mouseover", showTooltip)
      .on("mouseleave", hideTooltip)
      .on("click", clickCircle)
}
  

