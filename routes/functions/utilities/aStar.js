//adjust early game values
//just need to tweak values in checkSurround if it isn't getting the right results
var buildGrid = require('./buildGrid.js')
var contains = require('./contains.js')

module.exports = exports = function (board, mySnake, enemies, food) {
	var closedList = [];
	var openList = [];
	
	var grid = buildGrid(mySnake, board, enemies);
	var openGrid = buildGrid(mySnake, board, enemies);
	console.log(grid);

	var first = new aNode(mySnake.body[0].x, mySnake.body[0].y, -1, null, food, enemies, mySnake);
	openList.push(first);

	//------------------------------

	while(openList.length != 0) {

		openList.sort(function(a,b) {	//sort openList based on total cost
			return a.f - b.f;
		});

		var q = openList.shift();
		openGrid[q.x][q.y] = 0;
		closedList.push(q);
		grid[q.x][q.y] = 3;

		//if at destination, build route and finish
		if(q.x == food.x && q.y == food.y) {
			console.log("finished route!");
			return finishRoute(q, first);
		}

		var successors = [];

		//create successors
		for(var i = -1; i <= 1; i++) {
			for(var j = -1; j <= 1; j++) {
				var xCoord = (q.x+i);
				var yCoord = (q.y+j);

				//if we cant reach, skip. unless its our goal (say we're chasing an enemy tail or my tail)
				if(i==0 && j==0) {
					continue;
				}
				if(i != 0 && j != 0) {
					continue;
				}
				if(!isValid(xCoord, yCoord, enemies, mySnake, board, grid) && !(xCoord == food.x && yCoord == food.y)){
					continue;
				}
				var successor = new aNode(xCoord, yCoord, q.f, q, food, enemies, mySnake);
				console.log(successor.x + " " + successor.y + " added to  openList");
				successors.push(successor);
			}
		}

		for(var i = 0; i < successors.length; i++) {
			//if on closedList, ignore

			if(grid[successors[i].x][successors[i].y] == 3) {
				console.log(successors[i].x + " " + successors[i].y);
				console.log("already on closedList");
				continue;
			}

			//if not in openList, add it
			if(openGrid[successors[i].x][successors[i].y] == 0 ) {
				openGrid[successors[i].x][successors[i].y] == 4;
				openList.push(successors[i]);
				continue;
			}

			//if openList has same nodes cheaper than successor[i]: continue, else: push to openList
			if(openGrid[successors[i].x][successors[i].y] == 4) {
				var check = false;
				var spot = 0;

				for(var j = 0; j < openList.length; j++) {
					if(openList[j].x == successors[i].x && openList[j].y == successors[i].y) {
						if(openList[j].f < successors[i].f) {
							check = true;
						} else {
							spot = j;
						}
					}
				}
				if(check) {
					continue;
				} else {
					openList.splice(spot, 1);
					openList.push(successors[i]);
					openGrid[successors[i].x][successors[i].y] == 4;
				}
			}
		}
	}
	var sadness = [];	//return empty list if search failed
	return sadness;
}

//--------------------------------------------------

//checks if node is already covered by enemy or 
//friendly snake or if outside board
function isValid(x, y, enemies, mySnake, board, grid) {
	if (x <= board.width && x >= 0 && y <= board.height && y >= 0) {
		console.log("inside board");
	} else {
		console.log("outside board");
		return false;
	}
	if(grid[x][y] == 1) {
		console.log("my body there");
		return false;
	}
	if(grid[x][y] == 2) {
		console.log("enemy body there");
		return false;
	}
	return true;
}

//creates h based on cost to start and to finish from node along with dangers surrounding
function calc_h(x, y, dest) {
	return (Math.abs(x - dest.x) + Math.abs(y - dest.y));
}

function aNode(x, y, g, parent, dest, enemies, mySnake) {
	this.x = x;
	this.y = y;
	this.g = g + 1.0;
	this.h = calc_h(this.x, this.y, dest);// + checkSurround(x, y, enemies, mySnake);
	this.parent = parent;
	this.f = this.g + this.h;
}

//retraces back the first node, building the route along the way
var finishRoute = function (node, head) {
	var route = [];
	var temp = JSON.parse(JSON.stringify(node));

	while(temp.parent != null) {
		route.unshift(temp);
		temp = temp.parent;
	}
	route.unshift(head);
	return route;
}

//changes h (cost to destination) based on the dangerous stuff on the way to the food
var checkSurround = function (x, y, enemies, mySnake) {
	var price = 0;

	//if early game, dont worry about enemies
	var check = true;
	for(var i = 0; i < enemies.length; i++) {
		if(enemies[i].length < 7) {
			check = false;
		}
	}
	if(check) {
		return price;
	}

	for(var i = -1; i <= 1; i++) {
		for(var j = -1; j <= 1; j++) {
			//check if where we want to go has an ememy head beside with equal or larger length nearby
			// or for my body and other enemy snakes
			if(contains(mySnake.body, x+i, y+j)) {
				price++;
			}
			for(var k = 0; k < enemies.length; k++) {
				if(contains(enemies[k].body, x+i, y+j)) {
					price += 2;
				}
				if(enemies[k].body[0].x == x+i && enemies[k].body[0].y == y+j && enemies[k].length >= mySnake.length) {
					price += 5;
				}
			}
		}
	}
	return price;
}
