# Need-for-Speed

This is a 3D car racing game built using Three.js library. In this game, players race on a closed loop track in a stadium against three opponent cars. The objective of the game is to finish the race with the highest possible number of laps while avoiding collisions with the opponent cars and collecting fuel cans to keep the car's fuel level up.


### Gameplay
The game has several features, including car control, collisions, fuel cans, different camera views, and display elements. The game starts with a start button and instructions on how to control the car. 

The game has two types of cars: the player's car (Mcqueen) and three opponent cars. Fuel cans are randomly spawned on the road, and when the player's car hits them, the car's fuel level is increased. When the car's fuel is over, the game displays a "player out of fuel" message and a "game over" window. Collisions between cars reduce the health of both cars.


### World
The world has a stadium with audience and a racing track on a closed loop. Textures are used to enhance the visual appeal of the world.


### Car Features
The game has features that allow the player to control their car, such as moving left and right, increasing speed, and applying brakes. 


The player controls their car by moving left or right using the left and right arrow keys or the A and D keys. The car's speed increases when the up arrow key or the W key is pressed, while applying brakes is done using the down arrow key or the S key. 

Each car has its own health, fuel, score, and time that are tracked during the game. Opponent cars have a random motion logic to add variety to the game. The game also has friction between the car wheels and the ground.


### Camera Views
The game has two windows: a player window and a map window. The player window displays view 3, which is the third-person view of the player's car. The map window is a small window in one of the corners of the main window, showing the top view or view 1. The game also allows toggling between views 2 and 3.

### Display
The game has a start button and instructions for controlling the car at the start of the game. At the end of the game, a "game over window" is displayed, followed by the ranking of the player's score in a dashboard. The dashboard displays the player's health, fuel, score, time, and the distance to the next fuel can, which are updated dynamically.
