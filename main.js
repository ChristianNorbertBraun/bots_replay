"use strict";
var gl;
var vertexPositionAttribute;
var textureCoordAttribute;

var shaderProgram;

var texture;

var width;
var height;

function configureShaders(shaderProgram) {
    gl.useProgram(shaderProgram);

    vertexPositionAttribute = getAndEnableGlVertexAttribArray(gl, shaderProgram, "aVertexPosition");
    textureCoordAttribute = getAndEnableGlVertexAttribArray(gl, shaderProgram, "aTextureCoord");
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
}

var vertices = new Float32Array([
    -1.0, 1.0,
    -1.0, -1.0,
    1.0, 1.0,
    1.0, -1.0,
]);

var textureCoordinates = new Float32Array([
    0.0, 0.0,
    0.0, 1.0,
    1 / 4, 0.0,
    1 / 4, 1.0,

    1 / 4, 0.0,
    1 / 4, 1.0,
    2 / 4, 0.0,
    2 / 4, 1.0,

    2 / 4, 0.0,
    2 / 4, 1.0,
    3 / 4, 0.0,
    3 / 4, 1.0,

    3 / 4, 0.0,
    3 / 4, 1.0,
    4 / 4, 0.0,
    4 / 4, 1.0,
]);

var glBuffer;
var glTextureBuffer;

function initBuffers() {
    glBuffer = gl.createBuffer();
    glTextureBuffer = gl.createBuffer();
}

function createTile(x, y, index) {
    gl.bindBuffer(gl.ARRAY_BUFFER, glTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, index * 32);

    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

    var perspectiveMatrix = createPerspectiveMatrix(width, height);
    var translationMatrix = createTranslationMatrix(scaleFactor, scaleFactor, x, y);
    gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "transformation"), false, translationMatrix);

    gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "perspective"), false, perspectiveMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

var map = [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
];

var scaleFactor;
var mapDimension;

function resize() {
    width = gl.canvas.clientWidth;
    height = gl.canvas.clientHeight;
    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.viewport(0, 0, width, height);
    console.log(resize);
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var startX = -(mapDimension - 1);
    var startY = -(mapDimension - 1);
    for (var y = 0; y < mapDimension; ++y) {
        for (var x = 0; x < mapDimension; ++x) {
            if (startX >= mapDimension) {
                var startX = -(mapDimension - 1);
            }
            createTile(startX, startY, x % 4);
            startX += 2;
        }
        startY += 2
    }

    requestAnimationFrame(draw);
}

function init(image) {
    var canvas = document.getElementById("glcanvas");
    gl = initWebGL(canvas);
    scaleFactor = 1 / 16;
    mapDimension = 16;

    if (gl) {
        shaderProgram = initShaders();
        configureShaders(shaderProgram);

        texture = gl.createTexture();
        initTexture(gl, texture, image)
        activateTexture0(gl, texture);

        initBuffers();

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
    image.src = "resources/atlas.png";
}

window.onload = load;