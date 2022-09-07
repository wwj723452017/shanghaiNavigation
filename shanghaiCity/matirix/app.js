(function(){
    //UI configuration
    var itemSize = 18,
      cellSize = itemSize-1,
      width = 800,
      height = 800,
      margin = {top:20,right:20,bottom:20,left:25};
  
    //formats
    var hourFormat = d3version3.time.format('%H'),
      dayFormat = d3version3.time.format('%j'),
      timeFormat = d3version3.time.format('%Y-%m-%dT%X'),
      monthDayFormat = d3version3.time.format('%m.%d');
  
    //data vars for rendering
    var dateExtent = null,
      data = null,
      dayOffset = 0,
      colorCalibration = ['#f6faaa','#FEE08B','#FDAE61','#F46D43','#D53E4F','#9E0142'],
      dailyValueExtent = {};
  
    //axises and scales
    var axisWidth = 0 ,
      axisHeight = itemSize*15,
      xAxisScale = d3version3.time.scale(),
      xAxis = d3version3.svg.axis()
        .orient('top')
        .ticks(d3version3.time.weeks,1)
        .tickFormat(monthDayFormat),
    
      yAxisScale = d3version3.scale.linear()
        .range([0,axisHeight])
        .domain([7,20]),
      yAxis = d3version3.svg.axis()
        .orient('left')
        .ticks(5)
        .tickFormat(d3version3.format('02d'))
        .scale(yAxisScale);
  
    initCalibration();
  
    var svg = d3version3.select('[role="heatmap"]');
    var heatmap = svg
      .attr('width',width)
      .attr('height',height)
    .append('g')
      .attr('width',width-margin.left-margin.right)
      .attr('height',height-margin.top-margin.bottom)
      .attr('transform','translate('+margin.left+','+margin.top+')');
    var rect = null;
  
    d3version3.json('data_day1.json',function(err,data){
      data = data.data;
      data.forEach(function(valueObj){
        valueObj['date'] = timeFormat.parse(valueObj['timestamp']);
        var day = valueObj['day'] = monthDayFormat(valueObj['date']);
  
        var dayData = dailyValueExtent[day] = (dailyValueExtent[day] || [1000,-1]);
        var pmValue = valueObj['value']['peoplenum'];
        dayData[0] = d3version3.min([dayData[0],pmValue]);
        dayData[1] = d3version3.max([dayData[1],pmValue]);
      });
  
      dateExtent = d3version3.extent(data,function(d){
        return d.date;
      });
  
      axisWidth = itemSize*(dayFormat(dateExtent[1])-dayFormat(dateExtent[0])+1);
  
      //render axises
      xAxis.scale(xAxisScale.range([0,axisWidth]).domain([dateExtent[0],dateExtent[1]]));  
      // xAxis.scale(xAxisScale.range([0,axisWidth]).domain([1,7]));  
      
 

      svg.append('g')
        .attr('transform','translate('+margin.left+','+(margin.top+18)+')')
        .attr('class','x axis')
        .call(xAxis)
      .append('text')
        .text('星期')
        .attr('transform','translate('+axisWidth+',-5)');
  
      svg.append('g')
        .attr('transform','translate('+margin.left+','+margin.top+')')
        .attr('class','y axis')
        .call(yAxis)
      .append('text')
        .text('小时')
        // .attr('transform','translate(-10,'+axisHeight+') rotate(-90)');
        .attr('transform','translate(-25,'+(axisHeight+25)+')');



      days = ["Fri"]
      // days1 = ["一", "二", "三", "四", "五", "六", "天"]
      w = width - margin.left - margin.right
      gridSize = Math.floor(w / 22 )/2;
      svg.append('g').selectAll(".day")
          .data(days)
          .enter().append("text")
          .text(d => d)
          .attr('class','x axis')
          .attr("x", (d, i) => i * gridSize)
          .attr("y", margin.top)
          // .style("text-anchor", "end")
          // .attr("transform", "translate(35," - gridSize / 8 + ")")
          .attr("transform", "translate(20,10)")
          // .attr('transform','translate('+margin.left+','+margin.top+')')
          // .attr('transform','translate('+axisWidth+',-10)');
  
      //render heatmap rects
      dayOffset = dayFormat(dateExtent[0]);
      rect = heatmap.selectAll('rect')
        .data(data)
      .enter().append('rect')
        .attr('width',cellSize)
        .attr('height',cellSize)
        .attr('x',function(d){
          return itemSize*(dayFormat(d.date)-dayOffset);
        })
        .attr('y',function(d){            
          return hourFormat(d.date)*itemSize-107;
        })
        .attr('fill','#ffffff');
  
      rect.filter(function(d){ return d.value['peoplenum']>0;})
        .append('title')
        .text(function(d){
          return monthDayFormat(d.date)+' '+d.value['peoplenum'];
        });
  
      renderColor();
    });
  
    function initCalibration(){
      d3version3.select('[role="calibration"] [role="example"]').select('svg')
        .selectAll('rect').data(colorCalibration).enter()
      .append('rect')
        .attr('width',cellSize)
        .attr('height',cellSize)
        .attr('x',function(d,i){
          return i*itemSize;
        })
        .attr('fill',function(d){
          return d;
        });
  
      //bind click event点击切换事件
      d3version3.selectAll('[role="calibration"] [name="displayType"]').on('click',function(){
        renderColor();
      });
    }
  
    function renderColor(){
      var renderByCount = document.getElementsByName('displayType')[0].checked;
  
      rect
        .filter(function(d){
          return (d.value['peoplenum']>=0);
        })
        .transition()
        .delay(function(d){      
          return (dayFormat(d.date)-dayOffset)*15;
        })
        .duration(500)
        .attrTween('fill',function(d,i,a){
          //choose color dynamicly      
          var colorIndex = d3version3.scale.quantize()
            .range([0,1,2,3,4,5])
            .domain((renderByCount?[0,500]:dailyValueExtent[d.day]));
  
          return d3version3.interpolate(a,colorCalibration[colorIndex(d.value['peoplenum'])]);
        });
    }
    
    //extend frame height in `http://bl.ocks.org/`
    d3version3.select(self.frameElement).style("height", "600px");  
  })();