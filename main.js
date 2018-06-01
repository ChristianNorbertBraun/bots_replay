"use strict";
var gl;
var vertexPositionAttribute;
var textureCoordAttribute;

var shaderProgram;

var texture;

var width;
var height;

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);

    if (!shaderScript) {
        return null;
    }

    var theSource = "";
    var currentChild = shaderScript.firstChild;

    while (currentChild) {
        if (currentChild.nodeType == 3) {
            theSource += currentChild.textContent;
        }

        currentChild = currentChild.nextSibling;
    }
    var shader;

    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }
    gl.shaderSource(shader, theSource);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Error while compiling the shader" + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Error while initialising shader program");
    }

    return shaderProgram
}

// Stays here
function configureShaders(shaderProgram) {
    gl.useProgram(shaderProgram);

    vertexPositionAttribute = getAndEnableGlVertexAttribArray(gl, shaderProgram, "aVertexPosition");
    textureCoordAttribute = getAndEnableGlVertexAttribArray(gl, shaderProgram, "aTextureCoord");
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
}

function getAndEnableGlVertexAttribArray(glContext, program, name) {
    var attribute = glContext.getAttribLocation(program, name);
    gl.enableVertexAttribArray(attribute);

    return attribute
}

function initWebGL(canvas) {
    gl = null;
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) {
        console.log(e);
    }

    if (!gl) {
        alert("Unable to initiate WebGL");
        gl = null;
    }

    return gl;
}

function createSquare(x, y) {
    var vertices = new Float32Array([
        -1.0, 1.0,
        -1.0, -1.0,
        1.0, 1.0,
        1.0, -1.0,
    ]);

    // var indices = [3, 2, 1, 3, 1, 0];

    var textureCoordinates = new Float32Array([
        0.0, 0.0,
        0.0, 1.0,
        1 / 4, 0.0,
        1 / 4, 1.0,

        0.5, 0.0,
        0.5, 1.0,
        1.0, 0.0,
        1.0, 1.0,
    ]);
    var glTextureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
    // This will change from frame to frame
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    var glBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    // Here i have to use other texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    var perspectiveMatrix = createPerspectiveMatrix();
    // This will change from frame to frame
    var translationMatrix = createTranslationMatrix(scaleFactor, scaleFactor, x, y);

    gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "perspective"), false, perspectiveMatrix);
    gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "transformation"), false, translationMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function createPerspectiveMatrix() {
    var perspectiveMat = new Float32Array([
        1, 0, 0,
        0, width / height, 0,
        0, 0, 1
    ]);

    return perspectiveMat;
}

function createTranslationMatrix(scaleFactorX, scaleFactorY, translationX, translationY) {
    var transMat = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]);

    transMat[0] = scaleFactorX;
    transMat[4] = scaleFactorY;

    transMat[6] = translationX * scaleFactorX;
    transMat[7] = translationY * scaleFactorY;

    return transMat;
}

var map = [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
];

var scaleFactor;
var mapDimension;

function resize() {
    width = gl.canvas.clientWidth
    height = gl.canvas.clientHeight
    gl.canvas.width = width
    gl.canvas.height = height
    gl.viewport(0, 0, width, height)
}

var last = Date.now();
function draw() {
    // requestAnimationFrame(draw);

    // var now = Date.now();
    // if (now - last < 100) {
    //     console.log("Not enough time gone")
    //     return
    // }
    // last = now;
   

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var startX = -(mapDimension - 1);
    var startY = -(mapDimension - 1);
    for (var y = 0; y < mapDimension; ++y) {
        for (var x = 0; x < mapDimension; ++x) {
            if (startX >= mapDimension) {
                var startX = -(mapDimension - 1);
            }
            createSquare(startX, startY);
            startX += 2;
        }
        startY += 2
    }
}

function initTexture(texture, image) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function init(image) {
    var canvas = document.getElementById("glcanvas");
    gl = initWebGL(canvas);
    scaleFactor = 1 / 32
    mapDimension = 32

    if (gl) {
        shaderProgram = initShaders();
        configureShaders(shaderProgram);
        texture = gl.createTexture();
        initTexture(texture, image)

        window.onresize = resize;
        resize();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        requestAnimationFrame(draw);
    }
}

function load() {
    var image = new Image();
    image.onload = function () { init(image) };
    image.src = "atlas.png";
} 

window.onload = load;