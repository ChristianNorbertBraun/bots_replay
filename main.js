var gl;
var vertexPositionAttribute;


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
        return null;  // Unbekannter Shadertyp
    }
    gl.shaderSource(shader, theSource);

    // Kompiliere das Shaderprogramm

    gl.compileShader(shader);

    // Überprüfe, ob die Kompilierung erfolgreich war

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Es ist ein Fehler beim Kompilieren der Shader aufgetaucht: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // Erzeuge Shader

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Wenn die das Aufrufen der Shader fehlschlägt,
    // gib eine Fehlermeldung aus:

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Initialisierung des Shaderprogramms nicht möglich.");
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
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

function createSquare() {
    var vertices = new Float32Array([
        -0.5,-0.5,  -0.5,0.5,  0.5,-0.5,
        -0.5,0.5,  0.5,0.5,  0.5,-0.5
        ]);
    glBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function start() {
    canvas = document.getElementById("glcanvas");

    gl = initWebGL(canvas);

    if (gl) {
        initShaders()
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        createSquare();
    }
}