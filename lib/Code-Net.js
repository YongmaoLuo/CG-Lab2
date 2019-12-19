var container, stats;
var camera, scene, renderer;
var radius = 100,
    theta = 0;
var shaderConfig = null;
var duckMeshList = [];
var duckMat = null;
var shaders = [];
var gui = null;
var keyLight = null;
var fillLight = null;
var backLight = null;
var controls = null;
var renderer = null;


// create an AudioListener and add it to the camera
var listener = new THREE.AudioListener();
// create a global audio source
var sound = new THREE.Audio( listener );
var audioLoader = new THREE.AudioLoader();

init();
animate();

function init() {

    /*
    '0xffe100' 黄色
    ‘0x44dee8' 蓝色
    ’0xfa2c98' 粉色
    '0xffffff' 白色
    '0x69145a' 边缘
    ‘0xff2f6c’ 背景
    */



    container = document.createElement('div');
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.add(listener);
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    stats = new Stats();
    container.appendChild(stats.dom);
    scene.background = new THREE.Color(0xff2f6c);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.update();

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    keyLight = new THREE.SpotLight(0xffffff, 1, 5000, Math.PI / 6, 25);
    keyLight.position.set(1000, 1000, 500);
    keyLight.target.position.set(100, 0, 0);
    scene.add(keyLight);

    fillLight = new THREE.SpotLight(0xffffff, 0.4, 1000, Math.PI / 6, 25);
    fillLight.position.set(80, -20, -200);
    fillLight.target.position.set(0, 0, -200);
    scene.add(fillLight);

    backLight = new THREE.AmbientLight(0xffffff, 0.2);


    scene.add(backLight);


    //import duck
    const loader = new THREE.GLTFLoader();
    for (var i = 0; i < 2000; i++) {
        loader.load('https://raw.githubusercontent.com/big-panda/CG-Lab2/master/model/duck.gltf', (res) => {

            res.scene.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    duckMeshList.push(child);
                    duckMat = child.material;
                }
            });
            //res.scene.scale.set(1000, 1000, 1000);

            res.scene.children[0].position.x = Math.random() * 800 - 400;
            res.scene.children[0].position.y = Math.random() * 800 - 400;
            res.scene.children[0].position.z = Math.random() * 800 - 400;

            res.scene.children[0].rotation.x = Math.random() * 2 * Math.PI;
            res.scene.children[0].rotation.y = Math.random() * 2 * Math.PI;
            res.scene.children[0].rotation.z = Math.random() * 2 * Math.PI;

            res.scene.children[0].scale.x = Math.random() + 10;
            res.scene.children[0].scale.y = Math.random() + 10;
            res.scene.children[0].scale.z = Math.random() + 10;
            scene.add(res.scene.children[0]);



        }, function (xhr) {
            if ((xhr.loaded / xhr.total * 100) === 100) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            }
        }, function (error) {
            console.log('load error!' + error.getWebGLErrorMessage());
        });
    }

    // import control
    $.get('https://raw.githubusercontent.com/big-panda/CG-Lab2/master/shader/shader.config.json', function (data) {
        shaderConfig = JSON.parse(data);

        initControl();
    });
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown',onMouseclick,false);
}

function onMouseclick(event) {
    /*
        // 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
        var intersects = getIntersects(event);

        // 获取选中最近的 Mesh 对象
        if (intersects.length !== 0) {
            // load a sound and set it as the Audio object's buffer
            selectObject = intersects[0].object;
            audioLoader.load( 'sound/duck.mp3', function( buffer ) {
                sound.setBuffer( buffer );
                sound.setLoop( true );
                sound.setVolume( 0.5 );
                sound.play();
            });
        } else {
            alert("未选中 Mesh!");
        }

     */
    if(event.key==='d'){
        audioLoader.load( 'https://raw.githubusercontent.com/big-panda/CG-Lab2/master/sound/duck.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setLoop( false );
            sound.setVolume( 0.5 );
            sound.play();
        });
    }

}

// 获取与射线相交的对象数组
function getIntersects(event) {
    event.preventDefault();
    console.log("event.clientX:"+event.clientX)
    console.log("event.clientY:"+event.clientY)

    // 声明 raycaster 和 mouse 变量
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
    raycaster.setFromCamera(mouse, camera);

    // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前
    var intersects = raycaster.intersectObjects(scene.children);

    //返回选中的对象
    return intersects;
}



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
    stats.update();
}

function render() {
    theta += 0.1;
    camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
    camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
    camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
    camera.lookAt(scene.position);
    camera.updateMatrixWorld();

    renderer.render(scene, camera);
}

function useShader(name) {
    if (name === 'none') {
        for (let i = 0; i < 2000; i++) {
            duckMeshList[i].material = duckMat;
        }

        return;
    }

    if (!shaderConfig) {
        // try after a second
        setTimeout(function () {
            useShader(name);
        }, 1000);
        return;
    }

    var lightUniform = {
        type: 'v3',
        value: keyLight.position
    };

    var ranColor = ['#ffe100',
        '#44dee8', '#fa2c98',
        '#ffffff',
    ];

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    for (var i = 0; i < 2000; i++) {
        //console.log(duckMeshList[i]);
        setShader('duck', duckMeshList[i], {
            uniforms: {
                color: {
                    type: 'v3',
                    value: new THREE.Color(ranColor[i % 4]),
                },
                light: lightUniform
            }
        });


    }



    function setShader(meshName, mesh, qualifiers) {
        var config = shaderConfig[name][meshName];

        if (shaders[name]) {
            // use pre-loaded shader
            mesh.material = shaders[name][meshName];
        } else {
            // load
            $.get('https://raw.githubusercontent.com/big-panda/CG-Lab2/master/shader/' + config.path + '.vs', function (vs) {
                $.get(
                    'https://raw.githubusercontent.com/big-panda/CG-Lab2/master/shader/' + config.path + '.fs',
                    function (fs) {
                        duckShader(vs, fs);
                    }
                )
            })
        }

        function duckShader(vs, fs) {
            var material = new THREE.ShaderMaterial({
                vertexShader: vs,
                fragmentShader: fs,
                uniforms: qualifiers.uniforms
            });
            mesh.material = material;

            if (!shaders[name]) {
                shaders[name] = {};
            }
            shaders[name][meshName] = material;
        }
    }
}

function initControl() {
    gui = new dat.GUI();

    var shaderNames = ['none'];
    for (var shader in shaderConfig) {
        shaderNames.push(shader);
    }

    var option = {
        'Shader': 'none',
        'Light X': keyLight.position.x,
        'Light Y': keyLight.position.y,
        'Light Z': keyLight.position.z
    };

    // shader
    gui.add(option, 'Shader', shaderNames)
        .onChange(function (value) {
            useShader(value);
        });

    // light
    var lightFolder = gui.addFolder('Light');
    lightFolder.add(option, 'Light X')
        .min(-2000).max(2000)
        .onChange(function (value) {
            keyLight.position.x = value;

        });
    lightFolder.add(option, 'Light Y')
        .min(-2000).max(2000)
        .onChange(function (value) {
            keyLight.position.y = value;
        });
    lightFolder.add(option, 'Light Z')
        .min(-2000).max(2000)
        .onChange(function (value) {
            keyLight.position.z = value;
        });
}