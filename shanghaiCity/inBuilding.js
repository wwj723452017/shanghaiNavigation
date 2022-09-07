// 全局变量
var scene;          //----场景
var camera;         //----摄像机
var renderer;       //----渲染器
var labelRenderer;

//外壳
var museumOut;    
//楼层
var Floors=[];
//馆
var Pavilions=[];
//馆内方块
var inPavilionsCubes=[];

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

//文物标记模型
var theCube;   
var labelDiv;
var labelImg;
var labelText;

var pavilionsData;

d3.csv('data/pavilions.csv').then(data=>{ 
    pavilionsData=data;
	var max=0;
	var min=400;
	data.forEach(d=>{
		if(max<parseInt(d['点赞数'])){
			max=parseInt(d['点赞数']);
		}
		if(min>parseInt(d['点赞数'])){
			min=parseInt(d['点赞数']);
		}
	})

	data.forEach(d=>{
		//创建方块并加入场景
		var littleCubeGeometry = new THREE.BoxGeometry(parseFloat(d['长']),parseFloat(d['朝代']),parseFloat(d['宽']));
		//色彩根据数值从白色到红色变换
		//找到最大值g和b设置为0，最小值设置为200  
        var t=String(255-parseInt(225*(parseInt(d['点赞数'])-min)/max));

		var littleCubeMaterial = new THREE.MeshLambertMaterial({ color: "rgb(255,"+t+","+t+")" })
		var littleCube = new THREE.Mesh(littleCubeGeometry, littleCubeMaterial);
		var p=d['方块坐标'].split(",");          
		littleCube.position.x = parseFloat(p[0]);
		littleCube.position.y = parseFloat(p[1]);
		littleCube.position.z = parseFloat(p[2]);
		// 对象是否渲染到阴影贴图当中
		littleCube.castShadow = true;
        littleCube.name=d['文物'];
		inPavilionsCubes.push(littleCube);
		// scene.add(littleCube);
	})

	//调用函数来绘制热力图
	heatMap();
})



function onMouseClick( event ) {
	//通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1
	mouse.x = ( event.clientX / (window.innerWidth*0.6) ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// 通过鼠标点的位置和当前相机的矩阵计算出raycaster
	raycaster.setFromCamera( mouse, camera );

	// 获取raycaster直线和所有模型相交的数组集合
	var intersects = raycaster.intersectObjects( scene.children );

	if(intersects.length){
		if(intersects[0].object.name!=''){
		
			for(var i=0;i<pavilionsData.length;i++){
				if(pavilionsData[i]['文物']==intersects[0].object.name){
					//修改样式
					labelImg.src=pavilionsData[i]['图片链接'];                        
					labelText.textContent=pavilionsData[i]['文物'];
					//移动到对应位置上
					theCube.position.x = intersects[0].object.position.x;
					theCube.position.y = 5;  
					theCube.position.z = intersects[0].object.position.z;
					renderer.render(scene, camera);
					labelRenderer.render(scene,camera);
					break;
				}
			}

		}
	}
}

window.addEventListener( 'click', onMouseClick, false );


//显示
var selectFloorDiv = new Vue({
	el: '#selectFloorDiv',
	data: {
		picks:[1,0,0,0],
	},
	methods: {
		//选择楼层显示
		chooseFloor:function(index){
			console.log(index)
			this.picks.forEach(d => {
				d=0;
			});
            this.picks[index]=1;
			Floors.forEach(d=>{
				scene.remove(d);
			});
			Pavilions.forEach(d=>{
				scene.remove(d);
			});
			inPavilionsCubes.forEach(d=>{
				scene.remove(d);
			})
			scene.remove(museumOut);
			scene.add(Floors[index]);
			//移开提示器
			theCube.position.y=1000;
			renderer.render(scene, camera);
			labelRenderer.render(scene,camera);
		},
		//选择馆显示
		choosePavilions:function(index){
			Floors.forEach(d=>{
				scene.remove(d);
			});
			Pavilions.forEach(d=>{
				scene.remove(d);
			});
			inPavilionsCubes.forEach(d=>{
				scene.add(d);
			})
			scene.remove(museumOut);
			scene.add(Pavilions[index]);
			renderer.render(scene, camera);
			labelRenderer.render(scene,camera);
		},
		//博物馆全景
		choosemuseum:function(){
			Floors.forEach(d=>{
				scene.remove(d);
			});
			Pavilions.forEach(d=>{
				scene.remove(d);
			});
			scene.add(museumOut);
			renderer.render(scene, camera);
			labelRenderer.render(scene,camera);
		}
	}
})

function init() {
	var innerWidth=window.innerWidth*0.6;   //占60%
	var innerHeight=window.innerHeight;

	// 创建场景
	scene = new THREE.Scene();
	// 设置摄像机
	camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 2000)
	// 创建渲染器
	renderer = new THREE.WebGLRenderer();

	// 设置渲染器的初始颜色
	renderer.setClearColor(new THREE.Color(0xeeeeee));
	// 设置输出canvas画面的大小
	renderer.setSize(innerWidth, innerHeight)
	// 设置渲染物体阴影
	renderer.shadowMapEnabled = true;

	labelRenderer = new THREE.CSS2DRenderer();
	labelRenderer.setSize( innerWidth, innerHeight);
	labelRenderer.domElement.style.position = 'absolute';
	labelRenderer.domElement.style.top = 0;
	document.body.appendChild( labelRenderer.domElement );

	// 显示三维坐标系
	var axes = new THREE.AxisHelper(20)

	// 添加坐标系到场景中
	// scene.add(axes);
	
	var loader = new THREE.GLTFLoader();

	//外壳
	loader.load('model/museum/waike/out.gltf', function (gltf) {
		gltf.scene.scale.set(0.15, 0.15, 0.15);
		gltf.scene.position.set(0,0,00);
        museumOut=gltf.scene;
		scene.add(museumOut);  
		renderer.render(scene, camera) 
	});
	// 一楼
	loader.load('model/museum/one/one.gltf', function (gltf) {
		gltf.scene.scale.set(0.47, 0.47, 0.47);
		gltf.scene.position.set(0,10,-15);
        Floors[0]=gltf.scene;
		// scene.add(Floors[0]);  
		renderer.render(scene, camera) //这里先给它渲染一下，不然就要移动了才会渲染
	});
	
	//二楼
	loader.load('model/museum/two/two.gltf', function (gltf) {
		gltf.scene.scale.set(0.47, 0.47, 0.47);
		gltf.scene.position.set(-5,-10,-10);
		Floors[1]=gltf.scene;
	});
    //三楼
	loader.load('model/museum/four/four.gltf', function (gltf) {
		gltf.scene.scale.set(0.47, 0.47, 0.47);
		gltf.scene.position.set(-2,20,-10);
		Floors[2]=gltf.scene;
	});
    //四楼
	loader.load('model/museum/three/three.gltf', function (gltf) {
		gltf.scene.scale.set(0.47, 0.47, 0.47);
		gltf.scene.position.set(3,60,-5);
		Floors[3]=gltf.scene;
	});
	
	//青铜馆
	loader.load('model/museum/one/qingtongguan/qing.gltf', function (gltf) {
		gltf.scene.scale.set(1, 1, 1);
		gltf.scene.position.set(-36,-10,-7);
		Pavilions[0]=gltf.scene;
		// scene.add(Pavilions[0]);
	});

	//陶瓷馆
	loader.load('model/museum/two/taociguan/tao.gltf', function (gltf) {
		gltf.scene.scale.set(0.6, 0.6, 0.6);
		gltf.scene.position.set(0,0,-10);
		Pavilions[1]=gltf.scene;
	});

	var cubeGeometry = new THREE.BoxGeometry(0.5, 25, 0.5);
	var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfac472 })
	theCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	theCube.position.x = 7.1;
	theCube.position.y = 1000;
	theCube.position.z = 28;
	// 对象是否渲染到阴影贴图当中
	theCube.castShadow = true;

	scene.add(theCube)

	//给球体添加标签
	labelDiv = document.createElement( 'div' );
	labelDiv.className = 'label';
	//文字div
    labelText = document.createElement( 'div' );
	labelText.className = 'labelText';
	labelText.textContent = '文物';

	labelDiv.appendChild(labelText);
	labelDiv.style.marginTop = '-1em';
	//图片
	labelImg = document.createElement( 'img' );
	labelImg.src='https://img1.imgtp.com/2022/06/04/sJm1C40F.jpg';
	labelImg.className = 'labelImg';
	labelDiv.appendChild(labelImg);

	var objectLabel = new THREE.CSS2DObject( labelDiv );
	objectLabel.position.set( 0, 9, 0 );
	// 4、将 label 挂载到 3d 物品上
	theCube.add( objectLabel );


	//创建平行光

	var ambientLight = new THREE.AmbientLight('#1f1f1f'); 
	scene.add(ambientLight);

	directionalLight = new THREE.DirectionalLight("#858585");
	directionalLight.position.set(-20, 60, 40);

	directionalLight.shadow.camera.near = 20; //产生阴影的最近距离
	directionalLight.shadow.camera.far = 200; //产生阴影的最远距离
	directionalLight.shadow.camera.left = -50; //产生阴影距离位置的最左边位置
	directionalLight.shadow.camera.right = 50; //最右边
	directionalLight.shadow.camera.top = 50; //最上边
	directionalLight.shadow.camera.bottom = -50; //最下面

	//这两个值决定使用多少像素生成阴影 默认512
	directionalLight.shadow.mapSize.height = 1024;
	directionalLight.shadow.mapSize.width = 1024;

	//告诉平行光需要开启阴影投射
	directionalLight.castShadow = true;
	scene.add(directionalLight);


	directionalLight = new THREE.DirectionalLight("#858585");
	directionalLight.position.set(20, 60, -40);

	directionalLight.shadow.camera.near = 20; //产生阴影的最近距离
	directionalLight.shadow.camera.far = 200; //产生阴影的最远距离
	directionalLight.shadow.camera.left = -50; //产生阴影距离位置的最左边位置
	directionalLight.shadow.camera.right = 50; //最右边
	directionalLight.shadow.camera.top = 50; //最上边
	directionalLight.shadow.camera.bottom = -50; //最下面

	//这两个值决定使用多少像素生成阴影 默认512
	directionalLight.shadow.mapSize.height = 1024;
	directionalLight.shadow.mapSize.width = 1024;

	//告诉平行光需要开启阴影投射
	directionalLight.castShadow = true;
	scene.add(directionalLight);

	// 定位相机，并且指向场景中心
	camera.position.x = -35;
	camera.position.y = 65;
	camera.position.z = 35;
	camera.lookAt(scene.position)

	// 将渲染器输出添加html元素中
	document.getElementById('webgl-output').appendChild(renderer.domElement);
	renderer.render(scene, camera)

	// 创建controls对象-----移动摄像头
	// var controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	//这个绑定标签也是可以的
	var controls = new THREE.OrbitControls( camera, labelRenderer.domElement );

	controls.enablePan = false; //禁止右键拖拽平移

	//控制缩放范围
	controls.minDistance = 60;
	//相机距离观察目标点极大距离——模型最小状态
	controls.maxDistance = 250;

	// 上下旋转范围
	controls.minPolarAngle = 0;
	controls.maxPolarAngle = Math.PI/2;
	// 左右旋转范围
	// controls.minAzimuthAngle = -Math.PI * (100 / 180);
	// controls.maxAzimuthAngle = Math.PI * (100 / 180);

	renderer.render(scene, camera);
	labelRenderer.render(scene,camera);
	// 监听控制器的鼠标事件，执行渲染内容
	controls.addEventListener('change', () => {
		renderer.render(scene, camera);
		labelRenderer.render(scene,camera);
	})

}
window.onload = init