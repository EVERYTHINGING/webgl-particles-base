window.onload = function(){
    init();
}

var container;
var renderer;
var simScene, simCamera, simUniforms, simMaterial, simMesh, simRenderTarget1, simRenderTarget2;
var renderScene, renderCamera, renderUniforms, renderMaterial, renderParticles;

var SIM_RES = 512;

function init() {
    container = document.getElementById('container');

    ////// SIM SETUP
    simCamera = new THREE.Camera();
    simCamera.position.z = 1;

    simScene = new THREE.Scene();

    simRenderTarget1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { 
        minFilter: THREE.NearestFilter, 
        magFilter: THREE.NearestFilter, 
        format: THREE.RGBAFormat, 
        type: THREE.FloatType, 
        stencilBuffer: false 
    });
    simRenderTarget2 = simRenderTarget1.clone();

    simUniforms = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() },
        mouse: { type: "v2", value: new THREE.Vector2() },
        positionsTexture: { type: "t", value: simRenderTarget2.texture }
    };

    simMaterial = new THREE.ShaderMaterial( {
        uniforms: simUniforms,
        vertexShader: document.getElementById('simVS').textContent,
        fragmentShader: document.getElementById('simFS').textContent
    } );

    simMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), simMaterial);
    simScene.add(simMesh);


    /// RENDER SETUP
    renderCamera = new THREE.OrthographicCamera(window.innerWidth/ - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2);
    renderCamera.position.z = 2;
    renderScene = new THREE.Scene();

    renderUniforms = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() },
        positionsTexture: { type: "t", value: simRenderTarget2.texture }
    };

    renderMaterial = new THREE.ShaderMaterial({
        uniforms: renderUniforms,
        vertexShader: document.getElementById('renderVS').textContent,
        fragmentShader: document.getElementById('renderFS').textContent
    });

    var geo = createLookupGeometry(SIM_RES);
    renderParticles = new THREE.Points(geo, renderMaterial);
    renderParticles.frustumCulled = false;
    renderScene.add(renderParticles);

    renderer = new THREE.WebGLRenderer();
    renderer.autoClear = false;

    container.appendChild(renderer.domElement);

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);

    document.onmousemove = function(e){
        simUniforms.mouse.value.x = (e.pageX/window.innerWidth);
        simUniforms.mouse.value.y = (e.pageY/window.innerHeight);
    }

    animate();
}

function onWindowResize(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    simUniforms.resolution.value.x = renderer.domElement.width;
    simUniforms.resolution.value.y = renderer.domElement.height;
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    simUniforms.time.value += 0.05;
    renderUniforms.time.value += 0.05;
    simUniforms.positionsTexture.value = simRenderTarget2.texture;
    renderer.render(simScene, simCamera, simRenderTarget1, false);

    renderUniforms.positionsTexture.value = simRenderTarget1.texture;
    renderer.render(renderScene, renderCamera);

    var tmpRT = simRenderTarget1;
    simRenderTarget1 = simRenderTarget2;
    simRenderTarget2 = tmpRT;
}


function createLookupGeometry(size){        
    var geo = new THREE.BufferGeometry();
    var positions = new Float32Array(size * size * 3);

    for (var i = 0, j = 0, l = positions.length / 3; i < l; i ++, j += 3) {
      positions[j] = Math.random();
      positions[j+1] = Math.random();
    }

    geo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }