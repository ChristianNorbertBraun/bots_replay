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

function getAndEnableGlVertexAttribArray(glContext, program, name) {
    var attribute = glContext.getAttribLocation(program, name);
    gl.enableVertexAttribArray(attribute);

    return attribute
}

function initWebGL(canvas) {
    var gl = null;
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

function initTexture(gl, texture, image) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function activateTexture0(gl, texture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
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

function createPerspectiveMatrix(width, height) {
    var perspectiveMat = new Float32Array([
        1, 0, 0,
        0, width / height, 0,
        0, 0, 1
    ]);

    return perspectiveMat;
}