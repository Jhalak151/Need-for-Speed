import * as THREE from 'three';
import { Camera, DoubleSide, IncrementStencilOp } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import carOpponent1Motion, { car1PathPoints as car1PathPoints } from './movement/car1motion';
import carOpponent2Motion, { car2PathPoints as car2PathPoints } from './movement/car2motion';
import carOpponent3Motion, { car3PathPoints as car3PathPoints } from './movement/car3motion';

function setupModel(data) {
  const model = data.scene.children[0];
  return model;
}

// 2pi radians = 360 degrees
// pi radians = 180 degrees

let carMainStats = {
  health : 500,
  fuel : 1000,
  score : 0,
  time : 0,
  flag: 0
};

let opp1CarStats = {
  health : 500,
  fuel : 1000,
  score : 0,
  time : 0,
  flag: 0
};

let opp2CarStats = {
  health : 500,
  fuel : 1000,
  score : 0,
  time : 0,
  flag: 0
};

let opp3CarStats = {
  health : 500,
  fuel : 1000,
  score : 0,
  time : 0,
  flag: 0
};



// camera main
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWcheckHistoryidth / window.innerHeight, 0.1, 1000);
camera.position.set(70, 50, 0);

// up: y
camera.up.set(0, 1, 0);

// follow camera
const followCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const followDistance = 1.5;
const followHeight = 1;

const topCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
topCamera.position.set(0, 70, 0);
topCamera.up.set(1, 0, 0);
topCamera.lookAt(0, 0, 0);


let whichCamera = "follow";
let followCameraDistance = -5;
let z_val = -0.4

function toggleCamera() {
  if (keyboardState['KeyL']) {

    if (whichCamera == "follow") {
      whichCamera = "first";
      followCameraDistance = -2;
      // z_val = 0;
      scene.remove(carMain);
    
    } else {
      whichCamera = "follow";
      // z_val = -0.4
      followCameraDistance = -5;
      scene.add(carMain);
    }
  }

}

// collision resolution structure
let collisionPointsArray = [];
let collisionResolutionArray = [];

function setItem(item, arr) {

  if (arr.length >= 1000) arr.shift();
  arr.push(item);
}

function checkHistory(posNew) {
  let res = false;
  collisionPointsArray.forEach((pos) => {
    if (posNew.distanceToSquared(pos) < 0.001) {
      res = true;
    }
  });
  return res;
}



// objects
const loader = new GLTFLoader();

// stadium
const loadedData_scene = await loader.loadAsync('models/compiled/combine-people-stad.glb');
const stadium = setupModel(loadedData_scene);
scene.add(stadium);

// people

const peoplePoints = [
  [33, 0, 0, Math.PI / 2],
  [-33, 0, 0, -Math.PI / 2],
  [0, 0, 33, 0],
  [0, 0, -33, Math.PI],
  [24, 0, 24, Math.PI/4],
  [-24, 0, -24, -Math.PI/4 - Math.PI/2 ],
  [24, 0, -24, -Math.PI/4 + Math.PI ],
  [-24, 0, 24, Math.PI/4 + Math.PI/2 + Math.PI ]
];

for ( let i=0; i<peoplePoints.length; i++) {
  const loadedData_people = await loader.loadAsync('models/people/scene.glb');
  const people = setupModel(loadedData_people);
  scene.add(people);
  
  people.rotateZ(peoplePoints[i][3]);
  people.position.set(peoplePoints[i][0], peoplePoints[i][1], peoplePoints[i][2]);
}

// main car
const loadedData_carMain = await loader.loadAsync('models/60s_muscle_car_orange/scene.gltf');
const carMain = setupModel(loadedData_carMain);
scene.add(carMain);

carMain.position.set(38.8, 0.45, 0);


// opponent car 1
const loadedData_carOpponent1 = await loader.loadAsync('models/opponent_car_1/scene.glb');
const carOpponent1 = setupModel(loadedData_carOpponent1);
scene.add(carOpponent1);
carOpponent1.position.set(44.8, -0.25, 2);

// opponent car 2
const loadedData_carOpponent2 = await loader.loadAsync('models/opponent_car_2/scene.glb');
const carOpponent2 = setupModel(loadedData_carOpponent2);
scene.add(carOpponent2);
// carOpponent2.rotateZ(Math.PI);
carOpponent2.position.set(40.8, 0, 1);

// opponent car 3
const loadedData_carOpponent3 = await loader.loadAsync('models/opponent_car_3/scene.glb');
const carOpponent3 = setupModel(loadedData_carOpponent3);
scene.add(carOpponent3);
carOpponent3.position.set(37, 0, 0.8);



// track
const trackTexture = new THREE.TextureLoader().load("/textures/black-road-texture.jpg");
trackTexture.wrapS = trackTexture.wrapT = THREE.RepeatWrapping;
trackTexture.repeat.set(6, 6);
trackTexture.anisotropy = 16;
trackTexture.encoding = THREE.sRGBEncoding;


const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide, map: trackTexture });

const circleTrack = new THREE.Mesh(new THREE.RingGeometry(35, 45, 100, 5, 0, Math.PI * 2), trackMaterial);
circleTrack.position.set(0, 0.05, 0);
circleTrack.rotateX(-Math.PI / 2);
scene.add(circleTrack);


function checkInCircle(radius, x, z) {

  if ( x**2 + z**2 < radius**2 ) {
    return true; // outside track
  }
  return false;
}

function checkOutCircle(radius, x, z) {
  if ( x**2 + z**2 > radius**2 ) {
    return true; // outside track
  }
  return false;
}



// fences
const fenceThickness = 0.3;
const fenceMaterial = new THREE.MeshPhongMaterial({ color: 0x151515 });

const outerFenceGeometry = new THREE.TorusGeometry(45 - 0.25, fenceThickness, 16, 100);
const outerFence = new THREE.Mesh(outerFenceGeometry, fenceMaterial);
outerFence.rotateX(-Math.PI / 2);
outerFence.position.y += 0.25;
scene.add(outerFence);

const innerFenceGeometry = new THREE.TorusGeometry(35 + 0.25, fenceThickness, 16, 100);
const innerFence = new THREE.Mesh(innerFenceGeometry, fenceMaterial);
innerFence.rotateX(-Math.PI / 2);
innerFence.position.y += 0.25;
scene.add(innerFence);



// movement, calibrate these values
let carSpeed = 0;
let acceleration = 0.004;
let dec = 0.003;
const maxSpeed = 0.4;
const rotateSpeed = 0.015;
const keyboardState = {};


document.addEventListener("keydown", (event) => {
  keyboardState[event.code] = true;
});

document.addEventListener("keyup", (event) => {
  keyboardState[event.code] = false;
});


function keyboardMovement(obj) {
  
  const directionForward = new THREE.Vector3(0, -1, 0);
  obj.localToWorld(directionForward);
  directionForward.sub(obj.position).normalize(); // direction vector from the car position to new position
  
  const posNew = obj.position.clone();
  posNew.addScaledVector(directionForward, carSpeed);
  
  if (!checkHistory(posNew)) obj.position.addScaledVector(directionForward, carSpeed);

  // forward
  if ( keyboardState['KeyW'] ) {
    if (carSpeed < maxSpeed) {
      carSpeed += acceleration;
    }
    carMainStats.fuel -= 1;
  }

  if (keyboardState['KeyA']) {
    obj.rotateZ(rotateSpeed);
  }
  
  // backward
  if (keyboardState['KeyS']) {
    if (carSpeed > 0) {
      carSpeed -= dec;
    }
    carMainStats.fuel -= 1;
  }
  
  if (keyboardState['KeyD']) {
    obj.rotateZ(-rotateSpeed);
  }

  if ( !keyboardState['KeyW'] && !keyboardState['KeyS'] ) {
    if (carSpeed > 0) {
      carSpeed -= dec;
    } else if (carSpeed < 0) {
      carSpeed += acceleration;
    }
  }

};


// checking collisions
function checkCollision() {

  const innerRadius = 36;
  const outerRadius = 44;

  const ch1 = checkInCircle(innerRadius, carMain.position.x, carMain.position.z);
  const ch2 = checkOutCircle(outerRadius, carMain.position.x, carMain.position.z);

  if (ch1 | ch2) {
    carSpeed = 0.0125;
    carMainStats.health -= 10;
    return true;
  } else {
    return false;
  }
};

function checkCarCollisions() {

  const cars = [carOpponent1, carOpponent2, carOpponent3];
  const carMainBB = new THREE.Box3( new THREE.Vector3() );
  carMainBB.setFromObject(carMain);

  for ( var i=0; i<cars.length; i++ ) {
    const carBB = new THREE.Box3( new THREE.Vector3() );
    carBB.setFromObject(cars[i]);

    if (carBB.intersectsBox(carMainBB)) {
      if (i == 1) {
        // car 1
        opp1CarStats.health -= 5;

      } else if (i == 2) {
        // car 2
        opp2CarStats.health -= 5;

      } else if (i == 3) {
        // car 3
        opp3CarStats.health -= 5;
      } 

      carMainStats.health -= 5;
    }
  }

}


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



// main controls
const controls = new OrbitControls(camera, renderer.domElement);

// lighting
const lightAmbient = new THREE.AmbientLight(0xffffff);
scene.add(lightAmbient);

const lightPoint1 = new THREE.PointLight(0xffffdd, 15, 150);
const lightPoint2 = new THREE.PointLight(0xffffdd, 15, 150);

lightPoint1.position.set(-20, 100, 20);
lightPoint2.position.set(20, 100, -20);

scene.add(lightPoint1);
scene.add(lightPoint2);

const pointLightHelper1 = new THREE.PointLightHelper(lightPoint1);
const pointLightHelper2 = new THREE.PointLightHelper(lightPoint2);
scene.add(pointLightHelper1);
scene.add(pointLightHelper2);


let saveCarPos = carMain.position.clone();
setItem(saveCarPos, collisionResolutionArray);



function moveOpponentCars() {
  carOpponent1Motion(carOpponent1);
  carOpponent2Motion(carOpponent2);
  carOpponent2.rotateZ(Math.PI);
  carOpponent3Motion(carOpponent3);
}


const allFuelPoints = car1PathPoints.concat(car2PathPoints).concat(car3PathPoints);

let maxFuelCans = 3;
let count = 0;
let fuelCansArr = [];

async function addFuelCan() {
  const loadedData_fuel = await loader.loadAsync('models/fuel/scene.glb');
  const fuel = setupModel(loadedData_fuel);
  scene.add(fuel);

  fuelCansArr.push(fuel);
  count += 1;

  var pos = allFuelPoints[Math.floor(Math.random() * allFuelPoints.length)];
  fuel.position.set(pos.x, pos.y, pos.z);
}

function fuelCanAnimation() {
  for (var i=0; i<fuelCansArr.length; i++) {
    fuelCansArr[i].rotateZ(0.03);
  }
}

function checkFuelCollisions() {
  
  const carMainBB = new THREE.Box3();
  carMainBB.setFromObject(carMain);
  
  for (var i=0; i<fuelCansArr.length; i++) {
    const fuelBB = new THREE.Box3();
    fuelBB.setFromObject(fuelCansArr[i]);

    if (fuelBB.intersectsBox(carMainBB)) {
      scene.remove(fuelCansArr[i]);
      count -= 1;

      carMainStats.fuel += 200;

      fuelCansArr = fuelCansArr.filter(function(item) {
        return item !== fuelCansArr[i];
      })
    }
  }
}

function getNextfuelCan() {

  try {
    let minDist = carMain.position.distanceToSquared(fuelCansArr[0].position);
    for (var i=0; i<fuelCansArr.length; i++) {
      let chkDist = carMain.position.distanceToSquared(fuelCansArr[i].position);
      if (chkDist < minDist) {
        minDist = chkDist;
      }
    }

    return Math.round(minDist**0.5);

  } catch {
    return "calculating";
  }
}



// SCORE LOGIC
const finishLineGeometry = new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3( 35, 0.45, -3 ), new THREE.Vector3( 44, 0.45, -3 )] );
const finishLine = new THREE.Line( finishLineGeometry, trackMaterial );
scene.add( finishLine );

const chkfinishLineGeometry = new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3( -35, 0.45, -3 ), new THREE.Vector3( -44, 0.45, -3 )] );
const chkfinishLine = new THREE.Line( chkfinishLineGeometry, trackMaterial );
scene.add( chkfinishLine );


function checkFinish() {

  const cars = [carMain, carOpponent1, carOpponent2, carOpponent3];

  const finishLineBB = new THREE.Box3( new THREE.Vector3() );
  finishLineBB.setFromObject(finishLine);
 
  const chkfinishLineBB = new THREE.Box3( new THREE.Vector3() );
  chkfinishLineBB.setFromObject(chkfinishLine);

  for (var i=0; i<cars.length; i++) {

    const carBB = new THREE.Box3( new THREE.Vector3() );
    carBB.setFromObject(cars[i]);
    
    if (carBB.intersectsBox(chkfinishLineBB)) {

      if (i == 0) {
          carMainStats.flag = 1;

      } else if (i == 1) {
          opp1CarStats.flag = 1;

      } else if (i == 2) {
          opp2CarStats.flag = 1;

      } else if (i == 3) {
          opp3CarStats.flag = 1;
      }
    }

    if (carBB.intersectsBox(finishLineBB)) {

      if (i == 0) {
        if (carMainStats.flag) {
          carMainStats.score += 1;
          carMainStats.flag = 0;
        }

      } else if (i == 1) {
        if (opp1CarStats.flag) {
          opp1CarStats.score += 1;
          opp1CarStats.flag = 0;
        }

      } else if (i == 2) {
        if (opp2CarStats.flag) {
          opp2CarStats.score += 1;
          opp2CarStats.flag = 0;
        }

      } else if (i == 3) {
        if (opp3CarStats.flag) {
          opp3CarStats.score += 1;
          opp3CarStats.flag = 0;
        }
      }
    }
  }
}



var GAME_STATE = "GAME_READY";

const startButton = document.getElementById('startButton');
const instructions = document.getElementById('instructions');
startButton.onclick = function() {
  GAME_STATE = "GAME_START";
  startButton.remove();
  instructions.remove();
};




// ANIMATE
function animate() {
  requestAnimationFrame(animate);

  if (GAME_STATE == "GAME_START") {
    checkFinish();
    toggleCamera();

    keyboardMovement(carMain);
    
    moveOpponentCars();

    if (count < maxFuelCans) {
      addFuelCan();
    }

    if (fuelCansArr.length) {
      checkFuelCollisions();
      fuelCanAnimation();
    }

    checkCarCollisions();
    
    if (!checkCollision()) {
      setItem(carMain.position.clone(), collisionResolutionArray);
    }
    if (checkCollision()) {
      
      setItem(carMain.position.clone(), collisionPointsArray);
      let resolutionPos = collisionResolutionArray.pop();
      
      while (checkCollision()) {
        resolutionPos = collisionResolutionArray.pop();
        carMain.position.set(resolutionPos.x, resolutionPos.y, resolutionPos.z);
      }
    }
  
    carMainStats.time += 1;
    
    document.getElementById("health").innerHTML = `Health: ${carMainStats.health}`;
    document.getElementById("fuel").innerHTML = `Fuel: ${carMainStats.fuel}`;
    document.getElementById("score").innerHTML = `Score: ${carMainStats.score}`;
    document.getElementById("time").innerHTML = `Time: ${carMainStats.time}`;
    document.getElementById("next").innerHTML = `Distance to next Fuel can: ${getNextfuelCan()}`;

    if (carMainStats.fuel <= 0 | carMainStats.health <= 0) {
      GAME_STATE = "GAME_OVER";
    }
  }

  const carMainForward = new THREE.Vector3(0, -1, z_val).applyQuaternion(carMain.quaternion);
  const followCameraPosition = carMain.position.clone().addScaledVector(carMainForward, followCameraDistance);
  
  followCamera.position.lerp(followCameraPosition, 0.1);
  // followCamera.position.set(followCameraPosition.x, followCameraPosition.y, followCameraPosition.z);
  followCamera.lookAt(carMain.position.clone().addScaledVector(carMainForward, -followCameraDistance));
  
  controls.update();

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight );
  renderer.render(scene, followCamera);

  // renderer.clearDepth();
  renderer.setScissorTest(true);
  renderer.setScissor(0, 0, window.innerWidth / 4, window.innerHeight / 4);

  renderer.setViewport(0, 0, window.innerWidth / 4, window.innerHeight / 4);
  renderer.render(scene, topCamera);

  renderer.setScissorTest(false);

  if (GAME_STATE == "GAME_OVER") {
    const stats = document.getElementById('stats');
    stats.remove();

    const allPlayers = [
      ["you", carMainStats.score], 
      ["Opponent1", opp1CarStats.score], 
      ["Opponent2", opp2CarStats.score], 
      ["Opponent3", opp3CarStats.score]];

    let winner = allPlayers[0];
    for (var i=0; i<allPlayers.length; i++) {

      if (allPlayers[i][1] > winner[1])
        winner = allPlayers[i];
    }
    
    document.getElementById("endScreen").innerHTML = `GAME OVER
    <br><br>
    ${allPlayers[0][0]}: ${allPlayers[0][1]} laps<br>
    ${allPlayers[1][0]}: ${allPlayers[1][1]} laps<br>
    ${allPlayers[2][0]}: ${allPlayers[2][1]} laps<br>
    ${allPlayers[3][0]}: ${allPlayers[3][1]} laps`;

    GAME_STATE = "EXIT";
  }
}


animate();