"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;
var nMatrix;
var instanceMatrix;
var modelViewMatrixLoc;
var rotationMatrixLoc;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var index = 0;
var numTimesToSubdivide = 2;
var buttonFlag = false;
var interval;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ), //0
    vec4( -0.5,  0.5,  0.5, 1.0 ),//1
    vec4( 0.5,  0.5,  0.5, 1.0 ),//2
    vec4( 0.5, -0.5,  0.5, 1.0 ),//3
    vec4( -0.5, -0.5, -0.5, 1.0 ),//4
    vec4( -0.5,  0.5, -0.5, 1.0 ),//5
    vec4( 0.5,  0.5, -0.5, 1.0 ),//6
    vec4( 0.5, -0.5, -0.5, 1.0 )//7
];

//BODY
var torsoId = 0;
var torso1Id = 0;
var torso2Id = 16;
var torsoHeight = 2.0;
var torsoWidth = 0.6;

//HEAD
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var headHeight = 0.5;
var headWidth = 0.5;

//LEGS
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var legWidth  = 0.2;
var lowerLegHeight = 0.3;
var upperLegHeight = 1.0;

//TAIL
var tailId = 11;
var tail1Id = 12;
var tail2Id = 13;
var tailHeight = 0.5;
var tailWidth = 0.2;
var tailHeight1 = 0.5;
var tailWidth1 = 0.15;
var tailHeight2 = 0.5;
var tailWidth2 = 0.1;

//CARPET
var carpetId = 14;
var carpetHeight = 0.5;
var carpetWidth = 30.0;

//TABLE
var tableId = 15;
var tableHeight = 0.5;
var tableWidth = 7.0;

//TABLE LEGS
var tableLeftUpperLegId = 17;
var tableLeftLowerLegId = 18;
var tableRightUpperLegId = 19;
var tableRightLowerLegId = 20;
var tableLegHeight = 2.5;
var tableLegWidth  = 0.5;

var catPos = [0.0 , -1.0, 13.0];

var numNodes = 21;

var theta = [90, -80, 90, -90, 90, -90, 90, -90, 90, -90, 180, 110, 55, 40, 0, 0, 0, 0, 0, 0, 0];

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var pointsArray = [];
var texCoordsArray = [];
var normalsArray = [];
var tangentsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

function configureTexture( textureImage, textureName, textureNumber ) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, textureImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, textureName), textureNumber);
    return texture;
}


var lightPosition = vec4(25.0, 25.0, -25.0, 1.0);
var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(0.1, 0.1, 0.1, 1.0);

var materialAmbient = vec4(0.25, 0.20725, 0.20725, 1.0);
var materialDiffuse = vec4(1.0 , 0.829, 0.829, 1.0);
var materialSpecular = vec4(0.296648, 0.296648, 0.296648, 1.0);
var materialShininess = 0.088;

var eye = vec3(0.0, 0.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var radius = 30.0;
var thetaEye = 20 * Math.PI/180.0;
var phi = 110 * Math.PI/180.0;

var near = 1.0;
var far = 100.0;

var fovy = 45.0;
var aspect = 1.0;

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}

function initNodes(Id) {

    //matrice cat
    var m = mat4();

    switch(Id) {
    
    //CAT

    case torsoId:
    case torso1Id:
    case torso2Id:

    m = translate(catPos[0] , catPos[1] , catPos[2]);
    m = mult(m, rotate(theta[torso2Id], vec3(0, 1, 0)));
    m = mult(m, rotate(theta[torso1Id], vec3(1, 0, 0)));
    figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:


    m = translate(0, torsoHeight+0.5*headHeight, 0.5 * torsoWidth);
	m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)));
	m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
    m = mult(m, translate(0.0, -0.7*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;

    case leftUpperArmId:

    m = translate(-(0.1 * torsoWidth + 0.9 * legWidth), 0.9*torsoHeight, -0.2);
	m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate((0.1 * torsoWidth + 0.9 * legWidth), 0.9*torsoHeight, -0.2);
	m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    m = translate(-(0.1 * torsoWidth+ 0.9 * legWidth), 0.1*upperLegHeight, 0.0);
	  m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    m = translate(0.1 * torsoWidth+ 0.9 * legWidth, 0.1*upperLegHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;

    case leftLowerArmId:

    m = translate(0.0, 0.9 * upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, 0.9 * upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, -0.14 * torsoWidth);
    m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, tailId, null);
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, -0.14 * torsoWidth);
    m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;

    case tailId:

    m = translate(0.1 * torsoWidth+ 0.9 * legWidth , -0.2 * upperLegHeight, -0.1 * torsoWidth);
    m = mult(m, rotate(theta[tailId], vec3(1, 0, 0)));
    figure[tailId] = createNode( m, tail, null, tail1Id );
    break;

    case tail1Id:

    m = translate(0.0 , 0.8 * tailHeight , -0.2 * tailWidth);
    m = mult(m, rotate(theta[tail1Id], vec3(1, 0, 0)));
    figure[tail1Id] = createNode( m, tail1, null, tail2Id );
    break;

    case tail2Id:

    m = translate(0.0 , 0.95 * tailHeight1 , 0.1 * tailWidth1);
    m = mult(m, rotate(theta[tail2Id], vec3(1, 0, 0)));
    figure[tail2Id] = createNode( m, tail2, null, null );
    break;

    case carpetId:

    m = translate(0.0 , 0.0 , 0.0);
    m = mult(m, rotate(theta[carpetId], vec3(1, 0, 0)));
    figure[carpetId] = createNode(m, carpet, null, null);
    break;

    case tableId:

    m = translate(0.0 , 3.0 , 0.0);
    m = mult(m, rotate(theta[tableId], vec3(1, 0, 0)));
    figure[tableId] = createNode(m, table, null, tableLeftLowerLegId);
    break;

    case tableLeftLowerLegId:

    m = translate(0.473 * tableWidth - 0.1*tableLegWidth, -2.04 * tableLegHeight, 0.1 * tableLegWidth + 0.45 * tableWidth);
    m = mult(m, rotate(theta[tableLeftLowerLegId], vec3(1, 0, 0)));
    figure[tableLeftLowerLegId] = createNode( m, tableLeftLowerLeg, tableRightLowerLegId, null);
    break;

    case tableRightLowerLegId:

    m = translate(0.473 * tableWidth - 0.1*tableLegWidth, -2.04 * tableLegHeight, 0.1 * tableLegWidth - 0.47*tableWidth);
    m = mult(m, rotate(theta[tableRightLowerLegId], vec3(1, 0, 0)));
    figure[tableRightLowerLegId] = createNode( m, tableRightLowerLeg, tableLeftUpperLegId, null );
    break;

    case tableLeftUpperLegId:

    m = translate(-0.45 * tableWidth - 0.1*tableLegWidth, -2.04 * tableLegHeight, 0.1 * tableLegWidth + 0.45*tableWidth);
    m = mult(m, rotate(theta[tableLeftUpperLegId], vec3(1, 0, 0)));
    figure[tableLeftUpperLegId] = createNode( m, tableLeftUpperLeg, tableRightUpperLegId, null );
    break;

    case tableRightUpperLegId:

    m = translate(-0.45 * tableWidth - 0.1*tableLegWidth, -2.04 * tableLegHeight, 0.1 * tableLegWidth - 0.47*tableWidth);
    m = mult(m, rotate(theta[tableRightUpperLegId], vec3(1, 0, 0)));
    figure[tableRightUpperLegId] = createNode( m, tableRightUpperLeg, null, null );
    break;

    }

}

var rotationMatrix = mat4();
function traverse(Id) {

   if(Id == null) return;
   stack.push(rotationMatrix);
   rotationMatrix = mult(rotationMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
   rotationMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );

    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), true);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(legWidth, upperLegHeight, legWidth) );
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.6 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(legWidth, lowerLegHeight, legWidth) );
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(legWidth, upperLegHeight, legWidth) );
  gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.6 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(legWidth, lowerLegHeight, legWidth) );
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(legWidth, upperLegHeight, legWidth) );
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(legWidth, lowerLegHeight, legWidth) );
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(legWidth, upperLegHeight, legWidth) );
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(legWidth, lowerLegHeight, legWidth) )
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * tailHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth) )
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail1() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * tailHeight1, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(tailWidth1, tailHeight1, tailWidth1) )
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail2() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * tailHeight2, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(tailWidth2, tailHeight2, tailWidth2) )
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function carpet() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), true);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), false);

    instanceMatrix = mult(rotationMatrix, translate(0.0, -2.35, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(carpetWidth, carpetHeight, carpetWidth) )
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function table() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), true);

    instanceMatrix = mult(rotationMatrix, translate(0.0, -2.35, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(tableWidth, tableHeight, tableWidth) )
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  tableLeftLowerLeg() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), true);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * tableLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(tableLegWidth, tableLegHeight, tableLegWidth) );
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tableRightLowerLeg() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), true);

    instanceMatrix = mult(rotationMatrix, translate( 0.0, 0.5 * tableLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(tableLegWidth, tableLegHeight, tableLegWidth) );
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tableRightUpperLeg() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), true);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * tableLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(tableLegWidth, tableLegHeight, tableLegWidth) );
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tableLeftUpperLeg() {
    gl.uniform1f( gl.getUniformLocation(program, "uBodyFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uFaceFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uCarpetFlag"), false);
    gl.uniform1f( gl.getUniformLocation(program, "uTableFlag"), true);

    instanceMatrix = mult(rotationMatrix, translate(0.0, 0.5 * tableLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(tableLegWidth, tableLegHeight, tableLegWidth) )
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function triangle(a, b, c) {

    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));

    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));
    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));
    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));

    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);

    index += 3;
}


function divideTriangle(a, b, c, count) {
   if (count > 0) {

       var ab = mix( a, b, 0.5);
       var ac = mix( a, c, 0.5);
       var bc = mix( b, c, 0.5);

       ab = normalize(ab, true);
       ac = normalize(ac, true);
       bc = normalize(bc, true);

       divideTriangle(a, ab, ac, count - 1);
       divideTriangle(ab, b, bc, count - 1);
       divideTriangle(bc, c, ac, count - 1);
       divideTriangle(ab, bc, ac, count - 1);
   }
   else {
       triangle(a, b, c);
   }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = normalize(cross(t1, t2));
    normal = vec4(normal[0], normal[1], normal[2], 0.0);
    var tangent = vec4(t1[0], t1[1], t1[2], 0.0);


    pointsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);
    normalsArray.push(normal);
    tangentsArray.push(tangent);

    pointsArray.push(vertices[b]);
    texCoordsArray.push(texCoord[1]);
    normalsArray.push(normal);
    tangentsArray.push(tangent);

    pointsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);
    normalsArray.push(normal);
    tangentsArray.push(tangent);

    pointsArray.push(vertices[d]);
    texCoordsArray.push(texCoord[3]);
    normalsArray.push(normal);
    tangentsArray.push(tangent);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.529, 0.808, 0.922, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);
    gl.enable(gl.DEPTH_TEST);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix")
    rotationMatrixLoc = gl.getUniformLocation(program, "uRotationMatrix")

    //TEXTURE

    var bodyTextureImage = document.getElementById("bodyTexture");
    var textureBody = configureTexture(bodyTextureImage, "uTextureBody", 0);

    var faceTextureImage = document.getElementById("faceTexture");
    var textureFace = configureTexture(faceTextureImage, "uTextureFace", 1);
    
    var carpetTextureImage = document.getElementById("carpetTexture");
    var textureCarpet = configureTexture(carpetTextureImage, "uTextureCarpet", 2);

    var tableTextureImage = document.getElementById("tableTexture");
    var textureTable = configureTexture(tableTextureImage, "uTextureTable", 5);
    

    //BUMPMAP

    var bodyBumpMapImage = document.getElementById("bodyNormal");
    var bumpMapBody = configureTexture(bodyBumpMapImage, "uBumpMapBody", 3);

    var carpetBumpMapImage = document.getElementById("carpetNormal");
    var bumpMapCarpet = configureTexture(carpetBumpMapImage, "uBumpMapCarpet", 4);

    var tableBumpMapImage = document.getElementById("tableNormal");
    var bumpMapTable = configureTexture(tableBumpMapImage, "uBumpMapTable", 6);
    

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureBody);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureFace);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, textureCarpet);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, bumpMapBody);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, bumpMapCarpet);
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, textureTable);
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, bumpMapTable);

    cube();

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    var texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tangentsArray), gl.STATIC_DRAW);
    var tangentLoc = gl.getAttribLocation(program, "aTangent");
    gl.vertexAttribPointer(tangentLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(tangentLoc);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"),flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"),flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),flatten(lightPosition));


    // CAMERA SLIDER
    document.getElementById("zFarSlider").onchange = function (event) {
        far = parseFloat(event.target.value);
    };
    document.getElementById("zNearSlider").onchange = function (event) {
        near = parseFloat(event.target.value);
    };
    document.getElementById("radiusSlider").onchange = function (event) {
        radius = parseFloat(event.target.value);
    };
    document.getElementById("thetaSlider").onchange = function (event) {
        thetaEye = parseFloat(event.target.value) * Math.PI/180.0;
    };
    document.getElementById("phiSlider").onchange = function (event) {
        phi = parseFloat(event.target.value) * Math.PI/180.0;
    };
    document.getElementById("aspectSlider").onchange = function (event) {
        aspect = parseFloat(event.target.value);
    };
    document.getElementById("fovSlider").onchange = function (event) {
        fovy = parseFloat(event.target.value);
    };

    document.getElementById("Play").onclick = function (event) {
        movement=true;
        interval = setInterval(function() {
            catAnimation(); }, 20);
                
    };

    document.getElementById("Reset").onclick = function (event) {
        //window.location.reload();
        catPos[0] = 0.0;
        catPos[1] = -1.0;
        catPos[2] = 13.0;
        initNodes(torsoId);
        theta = [90, -80, 90, -90, 90, -90, 90, -90, 90, -90, 180, 110, 55, 40, 0, 0, 0, 0, 0, 0, 0];
        initNodes(leftUpperArmId);
        initNodes(rightUpperArmId);
        initNodes(rightUpperLegId);
        initNodes(leftUpperLegId);
        movement = false;
        setInterval(interval);
    };

    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}

var time = 0;
var movement=true;

function catAnimation(){
    if(movement){
        if(catPos[2] > 8){
            time += 0.2;
            catPos[2] -= 0.02;
            initNodes(torsoId);

            if(time <= 5){
                if(theta[leftUpperArmId] == 91){
                    theta[leftUpperArmId] -= 1.0;
                    initNodes(leftUpperArmId);
                    theta[rightUpperArmId] += 1.0;
                    initNodes(rightUpperArmId);

                    theta[rightUpperLegId] -= 1.0;
                    initNodes(rightUpperLegId);
                    theta[leftUpperLegId] += 1.0;
                    initNodes(leftUpperLegId);
                }else{
                    theta[leftUpperArmId] -= 2.0;
                    initNodes(leftUpperArmId);
                    theta[rightUpperArmId] += 2.0;
                    initNodes(rightUpperArmId);

                    theta[rightUpperLegId] -= 2.0;
                    initNodes(rightUpperLegId);
                    theta[leftUpperLegId] += 2.0;
                    initNodes(leftUpperLegId);
                }

            }else{
                if(theta[leftUpperArmId] == 91){
                    theta[leftUpperArmId] += 1.0;
                    initNodes(leftUpperArmId);
                    theta[rightUpperArmId] -= 1.0;
                    initNodes(rightUpperArmId);
                    theta[rightUpperLegId] += 1.0;
                    initNodes(rightUpperLegId);
                    theta[leftUpperLegId] -= 1.0;
                    initNodes(leftUpperLegId);
                }else{
                    theta[leftUpperArmId] += 2.0;
                    initNodes(leftUpperArmId);
                    theta[rightUpperArmId] -= 2.0;
                    initNodes(rightUpperArmId);
                    theta[rightUpperLegId] += 2.0;
                    initNodes(rightUpperLegId);
                    theta[leftUpperLegId] -= 2.0;
                    initNodes(leftUpperLegId);
                }
            }
            if(time > 10) time=0;

        }else if(catPos[2] < 8 && catPos[2]>5.58){
            if(catPos[2] > 5){
                theta[leftUpperArmId] += 3.0;
                initNodes(leftUpperArmId);
                theta[rightUpperArmId] += 3.0;
                initNodes(rightUpperArmId);
                theta[rightUpperLegId] += 3.0;
                initNodes(rightUpperLegId);
                theta[leftUpperLegId] += 3.0;
                initNodes(leftUpperLegId);

                theta[torsoId] -= 1.0;
                initNodes(torsoId);
                catPos[2] -= 0.2;
                catPos[1] += 0.23;
                initNodes(torsoId);
            }
        }else{
            if(catPos[2] > 4.0){
                catPos[2] -= 0.2;
                theta[torsoId] += 1.0;
                initNodes(torsoId);
                theta[leftUpperArmId] -= 3.0;
                initNodes(leftUpperArmId);
                theta[rightUpperArmId] -= 3.0;
                initNodes(rightUpperArmId);
                theta[rightUpperLegId] -= 3.0;
                initNodes(rightUpperLegId);
                theta[leftUpperLegId] -= 3.0;
                initNodes(leftUpperLegId);
            }else if(catPos[2] > 2.0){
                time += 0.2;
                catPos[2] -= 0.02;
                initNodes(torsoId);
                if(time <= 5){
                    if(theta[leftUpperArmId] == 91){
                        theta[leftUpperArmId] -= 1.0;
                        initNodes(leftUpperArmId);
                        theta[rightUpperArmId] += 1.0;
                        initNodes(rightUpperArmId);
        
                        theta[rightUpperLegId] -= 1.0;
                        initNodes(rightUpperLegId);
                        theta[leftUpperLegId] += 1.0;
                        initNodes(leftUpperLegId);
                    }else{
                        theta[leftUpperArmId] -= 2.0;
                        initNodes(leftUpperArmId);
                        theta[rightUpperArmId] += 2.0;
                        initNodes(rightUpperArmId);
        
                        theta[rightUpperLegId] -= 2.0;
                        initNodes(rightUpperLegId);
                        theta[leftUpperLegId] += 2.0;
                        initNodes(leftUpperLegId);
                    }
        
                }else{
                    if(theta[leftUpperArmId] == 91){
                        theta[leftUpperArmId] += 1.0;
                        initNodes(leftUpperArmId);
                        theta[rightUpperArmId] -= 1.0;
                        initNodes(rightUpperArmId);
                        theta[rightUpperLegId] += 1.0;
                        initNodes(rightUpperLegId);
                        theta[leftUpperLegId] -= 1.0;
                        initNodes(leftUpperLegId);
                    }else{
                        theta[leftUpperArmId] += 2.0;
                        initNodes(leftUpperArmId);
                        theta[rightUpperArmId] -= 2.0;
                        initNodes(rightUpperArmId);
                        theta[rightUpperLegId] += 2.0;
                        initNodes(rightUpperLegId);
                        theta[leftUpperLegId] -= 2.0;
                        initNodes(leftUpperLegId);
                    }
                }
                if(time > 10) time=0;

            }else if(catPos[2] > 0.5){
                catPos[2] -= 0.02;
                theta[torsoId] += 0.02;
                initNodes(torsoId);
                theta = [90, -80, 90, -90, 90, -90, 90, -90, 90, -90, 180, 110, 55, 40, 0, 0, 0, 0, 0, 0, 0];
                initNodes(leftUpperArmId);
                initNodes(rightUpperArmId);
                initNodes(rightUpperLegId);
                initNodes(leftUpperLegId);
                movement = false;
            }
        }
        
    }
    
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye =  vec3(radius * Math.sin(phi), radius * Math.sin(thetaEye), radius * Math.cos(phi));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    nMatrix = normalMatrix(modelViewMatrix, true);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(gl.getUniformLocation(program, "uNormalMatrix"), false, flatten(nMatrix));
   
    traverse(torsoId);
    traverse(carpetId);
    traverse(tableId);
    requestAnimationFrame(render);
}
