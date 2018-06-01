"use strict";
var gl;
var vertexPositionAttribute;
var textureCoordAttribute;

var shaderProgram;

var texture;
var textureLoaded = false;

var width;
var height;

var currentTurn = 1;
var gameRecord;

var spriteIndices = {
    '.': 0,
    'A': 1,
    'o': 2,
    '#': 3
}

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

var scaleFactor;
var mapDimension;

function resize() {
    width = gl.canvas.clientWidth;
    height = gl.canvas.clientHeight;
    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.viewport(0, 0, width, height);
}

function draw() {
    var turn = gameRecord.turns[currentTurn];
    if (turn == undefined) {
        replayInProgress = false;
        alert("Replay ended");
        return;
    }

    var map = turn.map;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var startX = -(mapDimension - 1);
    var startY = -(mapDimension - 1);
    for (var y = 0; y < mapDimension; ++y) {
        for (var x = 0; x < mapDimension; ++x) {
            if (startX >= mapDimension) {
                var startX = -(mapDimension - 1);
            }
            var currentSymbol = map.charAt(y * mapDimension + x)
            createTile(startX, startY, spriteIndices[currentSymbol]);
            startX += 2;
        }
        startY += 2
    }

    requestAnimationFrame(draw);
}

function init(image) {
    textureLoaded = true;
    var canvas = document.getElementById("glcanvas");
    gl = null;
    gl = initWebGL(canvas);
    mapDimension = gameRecord["map_width"];
    scaleFactor = 1 / mapDimension;

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

        draw();
        input();
    }
}

function input() {
    if (gamePaused) {
        return;
    }
    if (gameRecord.turns[currentTurn] == undefined) {
        return;
    }
    updateControls();
    setTimeout(input, replaySpeedInMs);
    ++currentTurn;
}

function updateControls() {
    currentTurnInput.value = currentTurn;

    var turn = gameRecord.turns[currentTurn];
    var players = turn.players;

    var numberOfRows = playerTable.rows.length;

    // Start at 1 and keep tableHeader
    for (var i = 1; i < numberOfRows; ++i) {
        playerTable.deleteRow(i);
    }

    for (var i = 0; i < players.length; ++i) {
        addTableRow(players[i])
    }
}

function startRecord() {
    var image = new Image();
    image.onload = function () { init(image) };
    image.src = "resources/atlas.png";
}

function returnToRecord() {
    input()
}

var recordUpload;

var replayButton;
var pauseButton;
var playButton;
var backwardButton;
var forwardButton;

var playerTable;

var currentTurnInput;
var replaySpeedInput;

var gamePaused = false;

var replaySpeedInMs = 200;

var replayInProgress = false;

function load() {
    recordUpload = document.getElementById("record-upload");
    recordUpload.onchange = onRecordUpload;

    replayButton = document.getElementById("replay-button");
    pauseButton = document.getElementById("pause-button");
    playButton = document.getElementById("play-button");
    backwardButton = document.getElementById("backward-button");
    forwardButton = document.getElementById("forward-button");
    playerTable = document.getElementById("player-table");
    currentTurnInput = document.getElementById("current-turn-input");
    replaySpeedInput = document.getElementById("replay-speed-input");

    disableAllRecordButtons(true);
    replaySpeedInput.onchange = function (event) {
        var value = event.target.value
        if (value > 0) {
            replaySpeedInMs = value;
        }
    }

    currentTurnInput.onchange = function (event) {
        var value = event.target.value
        if (value >= 0) {
            currentTurn = value;
            updateControls();
        } else {
            alert("Cant change turn to lower then 0")
            updateControls();
        }
    }
}
window.onload = load;

function onRecordUpload(event) {
    // Check for the various File API support.
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        alert('The File APIs are not fully supported in this browser.');
        return
    }
    disableAllRecordButtons(true);

    var file = event.srcElement.files[0]
    var fileReader = new FileReader();

    fileReader.onload = function (file) {
        disableAllRecordButtons(false);

        currentTurn = 0;
        gameRecord = JSON.parse(file.target.result);
    }

    fileReader.readAsText(file);
}

function replay() {
    currentTurn = 0;
    gamePaused = false
    startOrReturnToReplay();
}

function play() {
    gamePaused = false
    startOrReturnToReplay();
}

function startOrReturnToReplay() {
    if (replayInProgress) {
        returnToRecord();
    } else {
        replayInProgress = true;
        startRecord();
    }
}

function pause() {
    gamePaused = true;
}

function forward() {
    ++currentTurn;
    updateControls();
}

function backward() {
    --currentTurn;
    updateControls();
}

function disableAllRecordButtons(disable) {
    replayButton.disabled = disable;
    pauseButton.disabled = disable;
    playButton.disabled = disable;
    backwardButton.disabled = disable;
    forwardButton.disabled = disable;
}

function addTableRow(player) {
    var tr = document.createElement("TR");
    var id = document.createElement("TD");
    var life = document.createElement("TD");
    var score = document.createElement("TD");
    var moves = document.createElement("TD");
    id.appendChild(document.createTextNode(player.name));
    tr.appendChild(id);
    life.appendChild(document.createTextNode(player.life));
    tr.appendChild(life);
    score.appendChild(document.createTextNode(player.score));
    tr.appendChild(score);
    moves.appendChild(document.createTextNode(player.moves));
    tr.appendChild(moves);
    playerTable.appendChild(tr);
}