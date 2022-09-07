var files = ["topic_lavoro.json"];
var promises = [];

promises.push(d3.json(files[0]))
const radius = 317.7777777777777;

Promise.all(promises).then(function (values) {
    var topicLavoro = values[0];
    maxValue= name => {
        const topics = name === 'scuola'? topicScuola : topicLavoro;
        return d3.max(d3.values(topics)[1].map(d=> d.children.map(e=>+e.value)).flat())
    }

    scaleCircle = (name, value) => {
        return d3.scaleSqrt().domain([0,69.9]).range([0,30])(value); // min max dei valori che puà assumere il cerchio.
            //这里69.9可能会因为数据改变出现问题
    }
    tree = data => d3.tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent == b.parent ? 1 : 3) / a.depth)
  (d3.hierarchy(data))

//调用
    renderData2(topicLavoro);

})

function renderData2(topicLavoro){
    radialTree(topicLavoro, "");
}

function radialTree (dataTree, topicName)
{ 
   
    scaleCircle = (name, value) => {
        return d3.scaleSqrt().domain([0,69.9]).range([0,30])(value); // min max dei valori che puà assumere il cerchio.
    
    }
    radialColor  = d3.scaleOrdinal(["#ffd65a","#CF8140","#e6574e","#e85ebc","#e8855e","#6EB3B7","#7b91e5","#dfe2e1","#4a9554"]);

    const width = 932;
    const height = width;

    // DOM = evt.target.getOwnerDocument();
    const svg = d3.select("#circleTree").append("svg")//.attr(svg(width, width))
    .style("width", "90%")
    .style("height", "100%")
    .style("padding", "10px")
    .style("box-sizing", "border-box")
    .style("font", "32px sans-serif");


    const g = svg.append("g");
      
    const linkgroup = g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 3);
  
    const nodegroup = g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3);
  
    function newdata (animate = true) {
      let root = tree(dataTree);
      let links_data = root.links();
      let links = linkgroup
        .selectAll("path")
        .data(links_data, d => d.source.data.name+"_"+d.target.data.name);
      
      links.exit().remove();
      
      let newlinks = links
        .enter()
        .append("path")
        .attr("d", d3.linkRadial()
          .angle(d => d.x)
          .radius(0.1));
  
      
      let t = d3.transition()
        .duration(animate ? 400 : 0)
        .ease(d3.easeLinear)
        .on("end", function() {
            const box = g.node().getBBox();
            svg.transition().duration(1000).attr("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
        });
      
      let alllinks = linkgroup.selectAll("path")
      alllinks
          .transition(t)
          .attr("stroke", d => d.target.data.children? radialColor(d.target.data.name) : radialColor(d.source.data.name))
          .attr("d", d3.linkRadial()
              .angle(d => d.x)
              .radius(d => d.y));
  
      let nodes_data = root.descendants().reverse();
      let nodes = nodegroup
        .selectAll("g")
        .data(nodes_data, function (d) { 
          if (d.parent) {
            return d.parent.data.name+d.data.name;
          }
          return d.data.name});
      
      nodes.exit().remove();
  
      let newnodes = nodes
        .enter().append("g");
      
      let allnodes = animate ? nodegroup.selectAll("g").transition(t) : nodegroup.selectAll("g");
      allnodes
        .attr("transform", d => `
          rotate(${d.x * 180 / Math.PI - 90})
          translate(${d.y},0)
        `);
      
      newnodes.append("circle")
          .attr("r", d => d.data.children ? scaleCircle(topicName, d.data.children.reduce((accumulator, current) => accumulator + parseFloat(current.value),0)) : scaleCircle(topicName,d.data.value))
          .on ("click", function (d) {
              //交换d.data.children，d.data.altChildren
              let altChildren = d.data.altChildren || [];
              let children = d.data.children;
              d.data.children = altChildren;
              d.data.altChildren = children;
              //这里要判断选择了地点，选择之后要定位到那里和pointData对应
              pointData.forEach(pd=>{
                if(pd['名称']==d.data.name){
                  //设置地图中心
                  var p = pd['geometryPoint'].split(",");          
                  p[0]=parseFloat(p[0]);
                  p[1]=parseFloat(p[1]);  
                  console.log(p[0]);
                  console.log(p[1]);
                  map.setCenter(p);
                }
              })
              newdata (); 
          });
          
      nodegroup.selectAll("g circle").attr("fill", d => d.data.children ? radialColor(d.data.name) : radialColor(d.parent.data.name))
      .attr("fill-opacity",0.9)
      .attr("stroke",d => d.data.children ? radialColor(d.data.name) : radialColor(d.parent.data.name))
      .attr("stroke-width",0.5)
  
      newnodes.append("text")
          .attr("dy", "0.31em")
          .text(d => d.data.name)
          .clone(true).lower()
          .attr("stroke", "white");
      
      nodegroup.selectAll("g text")
        .attr("x", d => d.x < Math.PI === !d.children ? scaleCircle(topicName, d.data.value)+3: -scaleCircle(topicName,d.data.value)-3)
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null);//使得文字方向正确
  
    }
    
    newdata (false); 

    d3.select("#circleTree").appendChild(svg.node());
    
    const box = g.node().getBBox();
    // box.width = box.height = Math.max(box.width, box.height)*1.2;
    svg.remove()
        .attr("width", box.width)
        .attr("height", box.height)
        .attr("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
  
    return svg.node();
  }