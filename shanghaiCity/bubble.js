//模拟的数据
var monidata = {
    //这个name值可以随便写
    //不同区下面的博物馆，大小表示
    "name": "root",
    "children": [
        {
            "name": "浦东新区",
            "count": 1406,
            "maxchild": 967,
            "child": [
                {
                    "name": "吴昌硕纪念馆",
                    "count": 967,
                },
                {
                    "name": "中国航海博物馆",
                    "count": 332,
                },
                {
                    "name": "新场历史文化陈列馆",
                    "count": 107,
                }
            ]
        },
        {
            "name": "闸北区",
            "count": 867,
            "maxchild": 567,
            "child": [
                {
                    "name": "铁路博物馆",
                    "count": 567,
                },
                {
                    "name": "眼镜博物馆",
                    "count": 220,
                },
                {
                    "name": "闸北革命史料陈列馆",
                    "count": 80,
                }
            ]
        },
        {
            "name": "黄浦区",
            "count": 2135,
            "maxchild": 1367,
            "child": [
                {
                    "name": "上海博物馆",
                    "count": 1367,
                },
                {
                    "name": "孙中山故居纪念馆",
                    "count": 220,
                },
                {
                    "name": "琉璃艺术博物馆",
                    "count": 380,
                },
                {
                    "name": "民政博物馆",
                    "count": 134,
                },
                {
                    "name": "隧道科技馆",
                    "count": 34,
                }
            ]
        },
        {
            "name": "静安区",
            "count": 1187,
            "maxchild": 220,
            "child": [
                {
                    "name": "二大会会址纪念馆",
                    "count": 220,
                },
                {
                    "name": "蔡元培故居陈列馆",
                    "count": 320,
                },
                {
                    "name": "毛泽东旧居陈列馆",
                    "count": 647,
                }
            ]
        },
        {
            "name": "徐汇区",
            "count": 1287,
            "maxchild": 547,
            "child": [
                {
                    "name": "宋庆龄故居纪念馆",
                    "count": 420,
                },
                {
                    "name": "昆虫博物馆",
                    "count": 320,
                },
                {
                    "name": "钱学森图书馆",
                    "count": 547,
                }
            ]
        },
        {
            "name": "宝山区",
            "count": 440,
            "maxchild": 420,
            "child": [ 
                {
                    "name": "玻璃",
                    "count": 220,
                },]

        },
    ]
};

/*
* 绘制泡泡
* id,绘制泡泡的dom的id
* width,绘制泡泡的dom的宽度
* height,绘制泡泡的dom的高度
* bubblesData,输入的数据，格式同模拟数据一样
* 注意，d3的版本是3.5.6,使用v4或者v5的版本的话不能正常显示
* */
function drawBubbles(width,height,bubblesData,id) {

    //泡泡的颜色数据
    var colors = [
        {
            pfill: 'rgba(255, 44, 0,0.04)',
            pstroke: 'rgba(255, 44, 0,0.4)',
            fill: 'rgba(255, 44, 0,0.1)',
            stroke: 'rgba(255, 44, 0,1)',
        },
        {
            pfill: 'rgba(23, 0, 255,0.04)',
            pstroke: 'rgba(23, 0, 255,0.4)',
            fill: 'rgba(23, 0, 255,0.1)',
            stroke: 'rgba(23, 0, 255,1)',
        },
        {
            pfill: 'rgba(255, 188, 3,0.04)',
            pstroke: 'rgba(255, 188, 3,0.4)',
            fill: 'rgba(255, 188, 3,0.1)',
            stroke: 'rgba(255, 188, 3,1)',
        },
        {
            pfill: 'rgba(226, 119, 175,0.04)',
            pstroke: 'rgba(226, 119, 175,0.4)',
            fill: 'rgba(226, 119, 175,0.1)',
            stroke: 'rgba(226, 119, 175,1)',
        },
        {
            pfill: 'rgba(35, 15, 192,0.04)',
            pstroke: 'rgba(35, 15, 192,0.4)',
            fill: 'rgba(35, 15, 192,0.1)',
            stroke: 'rgba(35, 15, 192,1)',
        },
        {
            pfill: 'rgba(187, 238, 36,0.04)',
            pstroke: 'rgba(187, 238, 36,0.4)',
            fill: 'rgba(187, 238, 36,0.1)',
            stroke: 'rgba(187, 238, 36,1)',
        }
    ];

    //生成随机数，运动泡泡的似一次的位置
    var random = function(min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };


    //全局的r标尺
    var rmin = 1,
        rmax = 30;
    //全局的子泡泡的标尺，使用指数标尺
    var rScale = d3version3.scale.pow().exponent(0.5)
        .domain([0, monidata.children[0].maxchild])
        .rangeRound([rmin, rmax]);

    //因为参赛者来源的省份人数差异实在太大了，可视化出来不美观，所以对参赛者来源的省份人数进行映射
    var countArr = [];
    for(var i = 0;i<bubblesData.children.length;i++){
        countArr.push(bubblesData.children[i].count);
    }
    //所以对参赛者来源的省份人数进行映射  比例尺
    var countScale = d3version3.scale.pow().exponent(0.5)
        .domain(d3version3.extent(countArr))
        .rangeRound([d3version3.extent(countArr)[1]/10, d3version3.extent(countArr)[1]]);


    //绘制泡泡的画布尺寸
    var width = width,
        height = height;

    var pack = d3version3.layout.pack()
        .sort(null)
        .size([width, height])
        .padding(2);

    var svg = d3version3.select("#"+id).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")

    var node = svg.selectAll(".node")
        .data(pack.nodes(flatten(bubblesData))
            .filter(function(d) {
                return !d.children;
            }))
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
        .attr("r", function(d) {
            return d.r*0.8;
        })
        .style("fill", function (d,i) {
            return colors[i].pfill;
        })
        .style("stroke", function (d,i) {
            //绘制其对应的子泡泡
            drawChildBubble(d,i)
            return colors[i].pstroke;
        })
        .attr("stroke-width","2")
        .style("stroke-dasharray", '10, 10');

    node.append("text")
        .text(function(d) { return d.name; })
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .attr("dy", ".35em");


    // 返回一个展平的层次结构，其中包含根目录下的所有叶节点。
    function flatten(root) {
        var nodes = [];

        function recurse(node) {
            if (node.children) node.children.forEach(recurse);
            else nodes.push({name: node.name, value: countScale(node.count),child:node.child});
        }

        recurse(root);
        return {children: nodes};
    }


    //绘制每个大泡泡里边的子泡泡
    function drawChildBubble(d,index) {
        //如果子泡泡只有1个，则不显示
        if(d.child.length == 1){
            return;
        }
        // 初始化
        var containerWidth;
        var containerHeight;
        var container = d3version3.select('#'+id).select('svg');
        var svgContainer = container
            .append('g')
            .attr('width', containerWidth)
            .attr('height', containerHeight)

        if(d.r < 70){
            containerWidth = 2*d.r+160;
            containerHeight = 2*d.r+160;
            svgContainer
                .attr("transform", "translate(" + (d.x-d.r-80) + "," + (d.y-d.r-80) + ")")
        }else if(d.r >= 70 && d.r < 120){
            containerWidth = 2*d.r+140;
            containerHeight = 2*d.r+140;
            svgContainer
                .attr("transform", "translate(" + (d.x-d.r-70) + "," + (d.y-d.r-70) + ")")
        }else{
            containerWidth = 2*d.r+120;
            containerHeight = 2*d.r+120;
            svgContainer
                .attr("transform", "translate(" + (d.x-d.r-60) + "," + (d.y-d.r-60) + ")")
        }

        var data = [];

        var topWordCount = d.child;
        if(topWordCount.length == 0){
            return;
        }
        //初始化泡泡的位置、半径、颜色、速度
        for(var i = 0;i < topWordCount.length;i ++){
            var count = topWordCount[i].count;
            data.push({
                text: topWordCount[i].name,
                category: count,
                x: random(containerWidth/2 - rmax, containerWidth/2 + rmax),
                y: random(containerHeight/2 - rmax, containerHeight/2 + rmax),
                r: rScale(count),
                fill: colors[index].fill,
                stroke: colors[index].stroke,
                get v() {
                    var d = this;
                    return {x: d.x - d.px || 0, y: d.y - d.py || 0}
                },
                set v(v) {
                    var d = this;
                    d.px = d.x - v.x;
                    d.py = d.y - v.y;
                },
                get s() {
                    var v = this.v;
                    return Math.sqrt(v.x * v.x + v.y * v.y)
                },
                set s(s1){
                    var s0 = this.s, v0 = this.v;
                    if(!v0 || s0 == 0) {
                        var theta = Math.random() * Math.PI * 2;
                        this.v = {x: Math.cos(theta) * s1, y: Math.sin(theta) * s1}
                    } else this.v = {x: v0.x * s1/s0, y: v0.y * s1/s0};
                },
                set sx(s) {
                    this.v = {x: s, y: this.v.y}
                },
                set sy(s) {
                    this.v = {y: s, x: this.v.x}
                },
            });
        }

        // 碰撞检测
        function collide(alpha, s0) {
            var quadtree = d3version3.geom.quadtree(data);
            return function(d) {
                var drt = d.rt;
                boundaries(d, drt);
                var r = drt + rmax,
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = drt + quad.point.rt;
                        if (l < r) {
                            l = (l - r) / l * (1 + alpha);
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            };

            function boundaries(d, _drt) {
                var moreThanX,moreThanY, v0;

                //计算是否超出边界
                function exceed(origin,target,r) {
                    var distance = Math.sqrt(Math.pow((origin[0]-target[0]),2)+Math.pow((origin[1]-target[1]),2));
                    return distance > r?true:false;
                }
                //如果超出边界，计算应该放置的位置
                function place(origin,target,r) {
                    var newPos = [];
                    var angle = Math.atan2((target[1]-origin[1]), (target[0]-origin[0]));
                    newPos[0] = origin[0] + r*Math.cos(angle);
                    newPos[1] = origin[1] + r*Math.sin(angle);
                    return newPos;
                }

                var origin = [containerWidth/2,containerHeight/2];
                var target = [d.x,d.y];
                var r = containerWidth/2-100;

                moreThanX = target[0] > origin[0];
                moreThanY = target[1] > origin[1];

                //圆形边界
                if(exceed(origin,target,r)){
                    d.escaped |= 1;
                    // 如果物体在边界之外
                    // 管理其x速度分量的符号，以确保其移回边界
                    //~~它代表双非按位取反运算符，如果你想使用比Math.floor()更快的方法，那就是它了。需要注意，对于正数，它向下取整；对于负数，向上取整；非数字取值为0;
                    if(~~d.v.x) d.sx = d.v.x /** (moreThanX ? -1 : 1)*/;
                    //如果vx太小，则将其引导回
                    else d.sx = (~~Math.abs(d.v.y) || Math.min(s0, 1)*2) * (moreThanX ? -1 : 1);

                    d.x = place(origin,target,r)[0];

                    if(~~d.v.y) d.sy = d.v.y /** (moreThanY ? -1 : 1)*/;
                    else d.sy = (~~Math.abs(d.v.x) || Math.min(s0, 1)*2) * (moreThanY ? -1 : 1);
                    d.y = place(origin,target,r)[1];
                    //清除边界而不影响速度
                    v0 = d.v;

                    //给予速度值
                    d.v = v0;
                }else {
                    d.escaped &= ~1;
                }
            }
        }
        //准备布局
        var force = d3version3.layout
            .force()
            .size([containerWidth, containerHeight])
            .gravity(0.0001)
            .charge(-20)
            .friction(.8)

        //加载数据
        force.nodes(data)
            .start();

        // 创建group
        var node = svgContainer.selectAll('.node')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'node')
            .call(force.drag);

        // 创建圆
        var circles = node.append('circle')
            .classed('circle', true)
            .attr('r', function (d) {
                return d.r;
            })
            .style('fill', function (d) {
                return d.fill;
            })
            .style('stroke', function (d) {
                return d.stroke;
            })
            .style('cursor','pointer')
            .attr("stroke-width","2")
            .each(function(d){
                // 添加动态获取器
                var n= d3version3.select(this);
                Object.defineProperty(d, "rt", {get: function(){
                        return +n.attr("r")
                    }})
            });

        // 创建标签
        node.append('text')
            .text(function(d) {
                return d.text
            })
            .style({
                'fill': '#000000',
                'text-anchor': 'middle',
                'font-size': '10px',
                'font-weight': 'bold',
                'text-transform': 'uppercase',
                'font-family': 'Tahoma, Arial, sans-serif',
            })
            .attr('x', function (d) {
                return 0;
            })
            .attr('y', function (d) {
                return 6;
            })

        // 使圆运动
        force.on('tick', function t(e){
            var s0 = 0.25, k = 0.3;

            // var a = e.alpha ? e.alpha : force.alpha();
            var a = 0.002;

            for ( var i = 0; i < 2; i++) {
                circles
                    .each(collide(a, s0));
            }

            //调节圆的运动速度
            data.forEach(function reg(d){
                if(!d.escaped) d.s =  (s0 - d.s * k) / (1 - k);
            });

            node.attr("transform", function position(d){return "translate(" + [d.x, d.y] + ")"});

            force.alpha(0.01);
        });
    }
}

drawBubbles(400,520,monidata,"bubbles");