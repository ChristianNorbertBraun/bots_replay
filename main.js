"use strict";
var gl;
var vertexPositionAttribute;
var textureCoordAttribute;

var shaderProgram;

var texture;

var width;
var height;

// Stays here
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

    0.5, 0.0,
    0.5, 1.0,
    1.0, 0.0,
    1.0, 1.0,
]);

var glBuffer;
var glTextureBuffer;

function initBuffers() {
    glBuffer = gl.createBuffer();
    glTextureBuffer = gl.createBuffer();
}

function activateTexture() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
}

function createSquare(x, y) {
    gl.bindBuffer(gl.ARRAY_BUFFER, glTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
    // This will change from frame to frame
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

    // This will change from frame to frame
    var translationMatrix = createTranslationMatrix(scaleFactor, scaleFactor, x, y);
    gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "transformation"), false, translationMatrix);
    var perspectiveMatrix = createPerspectiveMatrix(width, height);

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
    width = gl.canvas.clientWidth
    height = gl.canvas.clientHeight
    gl.canvas.width = width
    gl.canvas.height = height
    gl.viewport(0, 0, width, height)
}

var last = Date.now();
function draw() {
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

    requestAnimationFrame(draw);
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
        initTexture(gl, texture, image)
        activateTexture();
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
    image.src = "atlas.png";
}

window.onload = load;