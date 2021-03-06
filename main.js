"use strict";

var gl;
var vertexPositionAttribute;
var textureCoordAttribute;

var shaderProgram;

var texture;
var textureLoaded = false;

var width;
var height;

var currentTurn = 0;
var gameRecord;

var playerMoves = [];

var spriteIndices = {
    '.': 0,
    '~': 1,
    'X': 2,
    '#': 3,
    'o': 4,
    '@': 5,

    'A': 8,
    'B': 12,
    'C': 16,
    'D': 20,
    'E': 24,
    'F': 28,
    'G': 32,
    'H': 36,
    'I': 40,
    'J': 44,
    'K': 48,
    'L': 52,
    'M': 56,
    'N': 60,
    'O': 64,
    'P': 68,

    'a': 72,
    'b': 73,
    'c': 74,
    'd': 75,
    'e': 76,
    'f': 77,
    'g': 78,
    'h': 79,
    'i': 80,
    'j': 81,
    'k': 82,
    'l': 83,
    'm': 84,
    'n': 85,
    // 'o': 83,
    'p': 87,
    'q': 88,
    'r': 89,
    's': 90,
    't': 91,
    'u': 92,
    'v': 93,
    'w': 94,
    'x': 95,
    'y': 96,
    'z': 97,
    '*': 98
}

var explosionIndices = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111];

var playerDirectionIndices = {
    'v': 0,
    '<': 1,
    '>': 2,
    '^': 3,
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

function generateTextureCoordinates(x, y) {
    var coordinates = [];
    for (var i = 0; i < y; ++i) {
        for (var k = 0; k < x; ++k) {
            coordinates.push(
                k / x, i / y,
                k / x, (i + 1) / y,
                (k + 1) / x, i / y,
                (k + 1) / x, (i + 1) / y,
            )
        }
    }

    textureCoordinates = new Float32Array(coordinates);
}

generateTextureCoordinates(4, 32);

var textureCoordinates;
//  = new Float32Array([
//     // First row sprites
//     0.0, 0.0,
//     0.0, 1 / 4,
//     1 / 4, 0.0,
//     1 / 4, 1 / 4,

//     1 / 4, 0.0,
//     1 / 4, 1 / 4,
//     2 / 4, 0.0,
//     2 / 4, 1 / 4,

//     2 / 4, 0.0,
//     2 / 4, 1 / 4,
//     3 / 4, 0.0,
//     3 / 4, 1 / 4,

//     3 / 4, 0.0,
//     3 / 4, 1 / 4,
//     4 / 4, 0.0,
//     4 / 4, 1 / 4,

//     // Second row sprites

//     0.0, 1 / 4,
//     0.0, 2 / 4,
//     1 / 4, 1 / 4,
//     1 / 4, 2 / 4,

//     1 / 4, 1 / 4,
//     1 / 4, 2 / 4,
//     2 / 4, 1 / 4,
//     2 / 4, 2 / 4,

//     2 / 4, 1 / 4,
//     2 / 4, 2 / 4,
//     3 / 4, 1 / 4,
//     3 / 4, 2 / 4,

//     3 / 4, 1 / 4,
//     3 / 4, 2 / 4,
//     4 / 4, 1 / 4,
//     4 / 4, 2 / 4,

//     // Third row sprites
//     0.0, 2 / 4,
//     0.0, 3 / 4,
//     1 / 4, 2 / 4,
//     1 / 4, 3 / 4,

//     1 / 4, 2 / 4,
//     1 / 4, 3 / 4,
//     2 / 4, 2 / 4,
//     2 / 4, 3 / 4,

//     2 / 4, 2 / 4,
//     2 / 4, 3 / 4,
//     3 / 4, 2 / 4,
//     3 / 4, 3 / 4,

//     3 / 4, 2 / 4,
//     3 / 4, 3 / 4,
//     4 / 4, 2 / 4,
//     4 / 4, 3 / 4,

//     // Fourth row sprites
//     0.0, 3 / 4,
//     0.0, 4 / 4,
//     1 / 4, 3 / 4,
//     1 / 4, 4 / 4,

//     1 / 4, 3 / 4,
//     1 / 4, 4 / 4,
//     2 / 4, 3 / 4,
//     2 / 4, 4 / 4,

//     2 / 4, 3 / 4,
//     2 / 4, 4 / 4,
//     3 / 4, 3 / 4,
//     3 / 4, 4 / 4,

//     3 / 4, 3 / 4,
//     3 / 4, 4 / 4,
//     4 / 4, 3 / 4,
//     4 / 4, 4 / 4,
// ]);

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

    setTranslation(scaleFactor, x, y)
    gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "transformation"), false, translationMatrix);

    gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "perspective"), false, perspectiveMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

var currentExplosions = [];
// Just a demo

function drawDot(x, y) {
    createTile(x, y, 99);
}

function drawExplosions() {
    for (var i = 0; i < currentExplosions.length; ++i) {
        var explosion = currentExplosions[i];
        var explosionIndex = currentTurn - explosion.startTurn

        if (explosionIndex < 0 || explosionIndex > explosionIndices.length) {
            currentExplosions.splice(i, 1);
            --i;
            continue
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, glTextureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
        gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, explosionIndices[explosionIndex] * 32);

        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

        var offset = mapDimension;
        var x = (explosion.x - offset) * 2;
        var y = (offset - explosion.y) * 2;
        var translationMatrix = createTranslationMatrix(scaleFactor, (x + mapDimension + 1), (y - mapDimension - 1));
        gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "transformation"), false, translationMatrix);

        gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "perspective"), false, perspectiveMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

function drawPlayerMoves() {

    for (var i = startTurn; i < currentTurn; ++i) {
        var player = findPlayer(selectedPlayerName, i);
        var currentPlayer = findPlayer(selectedPlayerName, currentTurn)
        if (player.x === currentPlayer.x && player.y === currentPlayer.y) {
            continue;
        }
        var turn = gameRecord.turns[i];

        if (turn == undefined) {
            return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, glTextureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
        var textureIndex = showSelectedPlayerViewHistory ? 6 : 7
        gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, textureIndex * 32);

        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

        var offset = mapDimension;
        var x = (player.x - offset) * 2;
        var y = (offset - player.y) * 2;
        var multiplier = showSelectedPlayerViewHistory ? viewDimension : 1;
        var translationMatrix = createTranslationMatrix(scaleFactor * multiplier, (x + mapDimension + 1) / multiplier, (y - mapDimension - 1) / multiplier);
        gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "transformation"), false, translationMatrix);

        gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "perspective"), false, perspectiveMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
// TODO: This is just a workaround make this pretty
function createPlayerView() {
    var turn = gameRecord.turns[currentTurn];

    if (turn == undefined) {
        return;
    }

    var players = turn.players;

    for (var i = 0; i < players.length; ++i) {
        var player = players[i];
        if (player.life == 0) {
            continue;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, glTextureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
        gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 6 * 32);

        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

        var offset = mapDimension;
        var x = (player.x - offset) * 2;
        var y = (offset - player.y) * 2;
        var translationMatrix = createTranslationMatrix(scaleFactor * viewDimension, (x + mapDimension + 1) / viewDimension, (y - mapDimension - 1) / viewDimension);
        gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "transformation"), false, translationMatrix);

        gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "perspective"), false, perspectiveMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

function draw() {
    var turn = gameRecord.turns[currentTurn];

    if (turn == undefined) {
        return;
    }

    var map = turn.map;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var startX = -(mapDimension - 1);
    var startY = (mapDimension - 1);
    for (var y = 0; y < mapDimension; ++y) {
        for (var x = 0; x < mapDimension; ++x) {
            if (startX >= mapDimension) {
                var startX = -(mapDimension - 1);
            }
            var currentSymbol = map.charAt(y * mapDimension + x)
            var spriteIndex = spriteIndices[currentSymbol];

            if (spriteIndex > 7 && spriteIndex < 69) {
                var player = findPlayer(currentSymbol, currentTurn);
                spriteIndex += playerDirectionIndices[player.bearing.charAt(0)];
            }
            createTile(startX, startY, spriteIndex);
            if (showDots) {
                drawDot(startX, startY)
            }
            startX += 2;
        }
        startY -= 2
    }

    if (showPlayerView) {
        createPlayerView();
    }
    if (selectedPlayerName != undefined) {
        drawPlayerMoves();
    }

    getNewExplosionsForCurrentTurn(currentTurn);
    drawExplosions();
}

function getNewExplosionsForCurrentTurn(currenTurn) {
    var turn = gameRecord.turns[currentTurn];
    var players = turn.players;

    for (var i = 0; i < players.length; ++i) {
        var player = players[i];
        if (player.killed_by != undefined) {
            var previousTurn = gameRecord.turns[currentTurn - 1];
            if (previousTurn.players[i].killed_by == undefined) {
                console.log("Added explosion")
                currentExplosions.push({
                    x: player.x,
                    y: player.y,
                    startTurn: currentTurn
                })
            }
        }
    }

}

var scaleFactor;
var mapDimension;

function resize() {
    width = gl.canvas.clientWidth;
    height = gl.canvas.clientHeight;
    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.viewport(0, 0, width, height);

    var aspect = height / width;
    scaleFactor = Math.min(1, aspect) / mapDimension;
    initPerspectiveMatrix(width, height);
    initTranslationMatrix(scaleFactor);
}

function findPlayer(playerSymbol, turn) {
    var players = gameRecord.turns[turn].players
    for (var i = 0; i < players.length; ++i) {
        if (players[i].name === playerSymbol) {
            return players[i];
        }
    }
    console.log(players);
    console.error("Can't find player with playerSymbol: " + playerSymbol);
    return undefined;
}

var viewDimension;
function init(image) {
    textureLoaded = true;
    var canvas = document.getElementById("glcanvas");
    gl = null;
    gl = initWebGL(canvas);
    mapDimension = gameRecord["map_width"];
    viewDimension = gameRecord["view_radius"] * 2 + 1;


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
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

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
    ++currentTurn;
    updateControls();
    setTimeout(input, replaySpeedInMs);
}

function updateControls() {
    currentTurnInput.value = currentTurn;

    var turn = gameRecord.turns[currentTurn];

    if (turn == undefined) {
        replayInProgress = false;
        displayResults();
        return;
    }

    var players = turn.players;

    var numberOfRows = playerTable.rows.length;


    for (var i = 0; i < players.length; ++i) {
        updateTableRow(players[i])
    }

    draw();
}

function startRecord() {
    var image = new Image();
    image.onload = function () { init(image) };
    image.src = "resources/atlas.png";
}

function returnToRecord() {
    if (gamePaused) {
        gamePaused = false;
        input()
    }
}

var recordUpload;

var replayButton;
var pauseButton;
var playButton;
var backwardButton;
var forwardButton;

var rawButton;

var playerTable;
var resultsTable;

var currentTurnInput;
var replaySpeedInput;

var showPlayerViewInput;
var showPlayerViewHistoryInput;
var showDotsInput;

var gamePaused = false;
var replaySpeedInMs = 200;
var replayInProgress = false;
var showPlayerView = false;
var showDots = false

var startTurn = 0;
var selectedPlayerName;
var showSelectedPlayerViewHistory = false;

var singlePlayerControlsDiv;
var resultsDiv;

function load() {
    recordUpload = document.getElementById("record-upload");
    recordUpload.onchange = onRecordUpload;

    replayButton = document.getElementById("replay-button");
    pauseButton = document.getElementById("pause-button");
    playButton = document.getElementById("play-button");
    backwardButton = document.getElementById("backward-button");
    forwardButton = document.getElementById("forward-button");
    playerTable = document.getElementById("player-table");
    resultsTable = document.getElementById("results-table");
    currentTurnInput = document.getElementById("current-turn-input");
    replaySpeedInput = document.getElementById("replay-speed-input");
    showPlayerViewInput = document.getElementById("player-view-input");
    showPlayerViewHistoryInput = document.getElementById("continous-player-view-input");
    singlePlayerControlsDiv = document.getElementById("single-player-controls");
    resultsDiv = document.getElementById("results");
    rawButton = document.getElementById("raw-button");
    showDotsInput = document.getElementById("dot-view-input");

    disableAllRecordButtons(true);
    replaySpeedInput.onchange = function (event) {
        var value = event.target.value
        if (value > 0) {
            replaySpeedInMs = value;
        }
        updateControls()
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

    showPlayerViewInput.onchange = function (event) {
        showPlayerView = event.target.checked;
        updateControls()
    }

    showPlayerViewHistoryInput.onchange = function (event) {
        showSelectedPlayerViewHistory = event.target.checked;
        updateControls()
    }

    showDotsInput.onchange = function (event) {
        showDots = event.target.checked
        updateControls()
    }

    if (lastGame != undefined) {
        gameRecord = lastGame;
        gameRecordLoaded();
    }
}

window.onload = load;

var fileReader = new FileReader();
fileReader.onload = function (file) {

    currentTurn = 0;
    gameRecord = JSON.parse(file.target.result);

    gameRecordLoaded();
}

function gameRecordLoaded() {
    // Initiate Table for game
    var turn = gameRecord.turns[0];
    var players = turn.players;

    var numberOfRows = playerTable.rows.length;
    // Start at 1 and keep tableHeader
    for (var i = 1; i < numberOfRows; ++i) {
        playerTable.deleteRow(1);
    }

    for (var i = 0; i < players.length; ++i) {
        addTableRow(playerTable, players[i])
    }
    disableAllRecordButtons(false);
}

function onRecordUpload(event) {
    // Check for the various File API support.
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        alert('The File APIs are not fully supported in this browser.');
        return
    }
    disableAllRecordButtons(true);

    var file = event.srcElement.files[0]

    fileReader.readAsText(file);
}

function replay() {
    currentTurn = 0;
    startTurn = 0;
    startOrReturnToReplay();
}

function play() {
    startOrReturnToReplay();
}

function getRawData() {
    if (gameRecord == undefined) {
        return;
    }
    var turn = gameRecord.turns[currentTurn];
    var map = turn.map;
    var mapWithNewLines = "";
    var mapDimension = gameRecord["map_width"];

    for (var i = 0; i < mapDimension; ++i) {
        mapWithNewLines += map.slice(i * mapDimension, (i + 1) * mapDimension);
        mapWithNewLines += "<br>";
    }
    var commandString = "-c customMap -A \"";
    for (var i = 0; i < turn.players.length; ++i) {
        if (i != 0) {
            commandString += ":"
        }
        commandString += turn.players[i].x + "," + turn.players[i].y + "," + turn.players[i].bearing;
    }
    commandString += "\""

    var myWindow = window.open();
    myWindow.document.write(
        "<html>" +
        "<head>" +
        "<style>body {font-family: Courier New} </style>" +
        "</head>" +
        "<body>" + commandString + "<br><br>" + mapWithNewLines + "</body>" +
        "</html>"
    );
}

function startOrReturnToReplay() {
    if (replayInProgress) {
        returnToRecord();
        gamePaused = false
    } else {
        replayInProgress = true;
        startRecord();
        gamePaused = false
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
    rawButton.disabled = disable;
}

function displayResults() {
    var results = gameRecord.results
    resultsDiv.classList.remove("hidden")

    var numberOfRows = resultsTable.rows.length;
    // Start at 1 and keep tableHeader
    for (var i = 1; i < numberOfRows; ++i) {
        resultsTable.deleteRow(1);
    }

    for (var i = 0; i < results.length; ++i) {
        addTableRow(resultsTable, results[i])
    }
}

function addTableRow(table, player) {

    var tr = document.createElement("TR");
    tr.id = player.name
    var id = document.createElement("TD");
    var life = document.createElement("TD");
    var score = document.createElement("TD");
    var moves = document.createElement("TD");
    id.appendChild(document.createTextNode(player.name));
    tr.appendChild(id);

    score.appendChild(document.createTextNode(player.score));
    tr.appendChild(score);

    moves.appendChild(document.createTextNode(player.moves));
    tr.appendChild(moves);

    var lastCellContent;
    if (player.life == undefined) {
        lastCellContent = player.killer
    } else {
        player.life
    }
    life.appendChild(document.createTextNode(lastCellContent));
    tr.appendChild(life);

    tr.onclick = function (e) {
        if (selectedPlayerName === player.name) {
            selectedPlayerName = undefined
            tr.classList.remove("selected");
            singlePlayerControlsDiv.classList.add("hidden");
        } else {
            selectedPlayerName = player.name;
            startTurn = currentTurn;
            tr.classList.add("selected");
            singlePlayerControlsDiv.classList.remove("hidden");
        }
        updateControls();
    };

    table.appendChild(tr);
}

function updateTableRow(player) {
    var playerTR = document.getElementById(player.name);

    if (selectedPlayerName != player.name) {
        playerTR.classList.remove("selected");
    }
    playerTR.cells[1].innerHTML = player.score;
    playerTR.cells[2].innerHTML = player.moves;
    playerTR.cells[3].innerHTML = player.life;
}
