

function generateChildren(node, categ_lib, categ_list, i) {
    if (i == maxDepth) {
        var summation = node.reduce(function (acc, val) { return acc + parseFloat(val[aggKey]); }, 0);
        return { [aggKey]: summation };
    }

    var grouped = _.groupBy(node, function (mvt) {
        return mvt[categ_list[i]];
    });

    var result = {};
    result['name'] = categ_lib;
    result['children'] = [];
    Object.keys(grouped).forEach(k => {
        result['children'].push(generateChildren(grouped[k], k, categ_list, i + 1))
    });
    return result;
}

function csvToZoomableJson(data, categChoices, allLib) {
    var result = generateChildren(data, allLib, categChoices, 0);
    return result;
}

class ZoomableChart {
    constructor(group) {
        this._ndx = null;
        this._chosenCategories = null;
        this._libForAll = null;
        dc.registerChart(this, group);
    }

    setNdx(groupAll) {
        if(!arguments.length)
            return this._ndx;
        this._ndx = groupAll;
        return this;
    }

    setChosenCategories(chosenCategories) {
        if(!arguments.length)
            return this._chosenCategories;
        this._chosenCategories = chosenCategories;
        return this;
    }

    setLibForAll(libForAll) {
        if(!arguments.length)
            return this._libForAll;
        this._libForAll = libForAll;
        return this;
    }

    render() {
        chart(this._ndx.allFiltered(), this._chosenCategories, this._libForAll);
    }

    redraw() {
        chart(this._ndx.allFiltered(), this._chosenCategories, this._libForAll);
    }
}

function chart(data_csv, categChoices, allLib) {
    
    $("#chart").html("");
    let data = csvToZoomableJson(data_csv, categChoices, allLib);
    color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    const height = 750;
    // const width = 975;
    const width = 1275;
    const format = d3.format(",d");

    function partition(d) {
        const root = d3.hierarchy(d)
            .sum(d => d[aggKey])
            .sort((a, b) => b.height - a.height || b.value - a.value);
        return d3.partition()
            .size([height, (root.height + 1) * width / 3])
            (root);
    }

    const root = partition(data);
    let focus = root;

    const svg = d3.select('#chart')
        .attr("viewBox", [0, 0, width, height])
        .style("font", "10px sans-serif");//调整整体字的大小

    const cell = svg
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y0},${d.x0})`);

    const rect = cell.append("rect")
        .attr("width", d => d.y1 - d.y0 - 1)
        .attr("height", d => rectHeight(d))
        .attr("fill-opacity", 1)
        .attr("fill", d => {
            if (!d.depth) return "#ccc";
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);
        })
        .style("cursor", "pointer")
        .on("click", clicked);

    const text = cell.append("text")
        .style("user-select", "none")
        .attr("pointer-events", "none")
        .attr('text-anchor', 'middle')//文字居中对齐
        .attr("x", d => (d.y1 - d.y0 - 1)/2)
         // .attr("y", 13)
         .attr("y", d => rectHeight(d)/2+5)
        .attr("fill-opacity", d => +labelVisible(d))
        .attr('font-size',25);

    text.append("tspan")
        .text(d => d.data.name);

        const tspan = text.append("tspan")
        .attr("fill-opacity", d => labelVisible(d) * 0.7)
        .text(d => (d.data.name==null)?` ${format(d.value)}`:" ");//判断是否要在名字后面加上数字

    //鼠标悬浮到方块上的提示
    cell.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}`);

    function clicked(event, p) {
        focus = focus === p ? p = p.parent : p;
        if(focus.data.name=='上海博物馆'){
            selectFloorDiv.choosemuseum();
        }
        if(focus.data.name=='1楼'){
            selectFloorDiv.chooseFloor(0);
        }
        if(focus.data.name=='2楼'){
            selectFloorDiv.chooseFloor(1);
        }
        if(focus.data.name=='3楼'){
            selectFloorDiv.chooseFloor(2);
        }
        if(focus.data.name=='4楼'){
            selectFloorDiv.chooseFloor(3);
        }
        if(focus.data.name=='中国古代青铜馆'){
            //模型
            selectFloorDiv.choosePavilions(0);
            //图表
            var Div=document.getElementById("my_dataviz");
            if(Div.innerHTML==''){
                var Div=document.getElementsByClassName("days-hours-heatmap");
                Div[0].innerHTML=''
                radialtree(pavilionsData);
            }
        }
        else{
            var Div=document.getElementsByClassName("days-hours-heatmap");
            if(Div[0].innerHTML==''){
                //显示的是热力图
                var Div=document.getElementById("my_dataviz");
                Div.innerHTML='';
                heatMap(); 
                
            }

        }
        if(focus.data.name=='中国古代陶瓷馆'){
            selectFloorDiv.choosePavilions(1);
        }

        //如果点击了文物名称,修改后面的元素内容
        if(focus.depth==3||focus.depth==4){ 
            var objectImg=document.getElementById("objectImg");
            var objectName=document.getElementById("objectName");
            var objectDescription=document.getElementById("objectDescription");
            //在数据中找到对应的内容
            if(focus.depth==3){
                //要是在馆的场景内
                selectFloorDiv.choosePavilions(0);
                for(var i=0;i<pavilionsData.length;i++){
                    if(pavilionsData[i]['文物']==focus.data.name){
                        // selectFloorDiv.F1_Bronze();  这里要处理一下如果是不同馆
                        objectImg.src=pavilionsData[i]['图片链接'];
                        objectName.innerHTML=pavilionsData[i]['文物'];
                        objectDescription.innerHTML=pavilionsData[i]['介绍'];
                        var m = pavilionsData[i]['方块坐标'].split(",");           
                        //移动到对应位置上
                        theCube.position.x = parseFloat(m[0]);
                        theCube.position.y = 5;  
                        theCube.position.z = parseFloat(m[2]);
                        //修改样式
                        labelImg.src=pavilionsData[i]['图片链接'];                        
                        labelText.textContent=pavilionsData[i]['文物'];
                        renderer.render(scene, camera);
                        labelRenderer.render(scene,camera);
                        break;
                    }
                }
            }
            else if(focus.depth==4){
                for(var i=0;i<pavilionsData.length;i++){
                    if(pavilionsData[i]['文物']==focus.parent.data.name){
                        objectImg.src=pavilionsData[i]['图片链接'];
                        objectName.innerHTML=pavilionsData[i]['文物'];
                        objectDescription.innerHTML=pavilionsData[i]['介绍'];

                        var m = pavilionsData[i]['方块坐标'].split(","); 
                        console.log(pavilionsData[i]['文物']);          
                        //移动到对应位置上
                        theCube.position.x = parseFloat(m[0]);
                        theCube.position.y = 5;  
                        theCube.position.z = parseFloat(m[2]);
                        //修改样式
                        labelImg.src=pavilionsData[i]['图片链接'];                        
                        labelText.textContent=pavilionsData[i]['文物'];
                        renderer.render(scene, camera);
                        labelRenderer.render(scene,camera);

                        break;
                    }
                }
            }

        }
        //focus的名字来显示
        root.each(d => d.target = {
            x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
            x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
            y0: d.y0 - p.y0,
            y1: d.y1 - p.y0
        });
        

        const t = cell.transition().duration(750)
            .attr("transform", d => `translate(
            ${d.target.y0},${d.target.x0}
            )`);
      
             rect.transition(t).attr("height", d => rectHeight(d.target));
                    text.transition(t).attr("fill-opacity", d => +labelVisible(d.target))
                                      .attr("y", d =>rectHeight(d.target)/2+5)
                                    //   .attr("font-size",13)
        tspan.transition(t).attr("fill-opacity", d => labelVisible(d.target) * 0.7);
    }

    function rectHeight(d) {
        return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
    }

    function labelVisible(d) {
        return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
    }
}