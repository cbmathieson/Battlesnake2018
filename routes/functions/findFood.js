//test to figure what amount of openSpace works best

var aStar = require('./aStar.js')
var floodFill = require('./floodFill.js')
var contains = require('./contains.js')

//uses A* algorithm to find good routes to food. Looks at best route to each peice of food
// and decides which is the best based cost of route (lowest cost of destination.f)

module.exports = exports = function(mySnake, enemies, board, decision) {
	
	var food = board.food;
	var routes = [];

	for(var i = 0; i < food.length; i++) {
		var temp = aStar(board, mySnake, enemies, food[i]);
		// if there is no route to the food, ignore
		if(temp.length > 0) {
			routes.push(temp);
		}
	}

	//debugging, prints out list of routes
	console.log(routes.length);
	for(var i = 0; i < routes.length; i++) {
		console.log("weight: " + routes[i][routes[i].length-1].f);
		for(var j = 0; j < routes[i].length; j++) {
			console.log("move #" + j + ": " + routes[i][j].x + " " + routes[i][j].y);
		}
		console.log("dest: " + food[i].x + " " + food[i].y);
		console.log();
	}

	//sorts based on cost of each route
	routes.sort(function(a, b) {
		return a[a.length-1].f - b[b.length-1].f;
	});

	//checks before returning if there is enough room for the move.
	//makes a variable (temp) equal mySnake and push the direction we want to go onto the head
	//rotates through all options until success or failure

	//-----------------------------------------------------------------------

	//lowers value of each decision in order of priority (if floodfill succeeds)
	var decreaseVal = 2000;

	while(routes.length > 0) {

		var topRoute = routes.shift();

		//acts as if the head is one forward and the tail is too
		var temp = JSON.parse(JSON.stringify(mySnake));
		temp.body.unshift(topRoute[1]);
		temp.body.pop();

		var space = floodFill(temp, enemies, board);

		//debugging
		console.log("OPEN SPACE:");
		console.log("room: " + space.length);
		for(var i = 0; i < space.length; i++) {
			console.log(space[i].x + " " + space[i].y);
		}

		//CONSTRUCTION
		//-----------------------------------------------
		//if theres more than enough space to fit; go for it or if absolutely desparate for food
		if(space.length > mySnake.length || (space.length*(4/3) > mySnake.length && mySnake.health < 15)) {
		//-----------------------------------------------
			console.log("direction: " + temp.body[0].x + " " + temp.body[0].y + " passed floodfill criteria");
			console.log("my head is: " + mySnake.body[0].x + " " + mySnake.body[0].y);

			if(temp.body[0].x > mySnake.body[0].x) {
				decision.right += decreaseVal;
				decreaseVal = decreaseVal*(1/3);
			}
			if(temp.body[0].x < mySnake.body[0].x) {
				decision.left += decreaseVal;
				decreaseVal = decreaseVal*(1/3);
			}
			if(temp.body[0].y > mySnake.body[0].y) {
				decision.down += decreaseVal;
				decreaseVal = decreaseVal*(1/3);
			}
			if(temp.body[0].y < mySnake.body[0].y) {
				decision.up += decreaseVal;
				decreaseVal = decreaseVal*(1/3);
			}
			continue;
		} 
		console.log("direction: " + temp.body[0].x + " " + temp.body[0].y + " failed floodfill criteria");
	}

	//returns decision with no new direction values if all food options fail
	return;
}