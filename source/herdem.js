
var Mover = function(settings) {
    var self = this;

    self.world = settings.world;
    self.width = 40;
    self.height = 40;
    // put this somewhere within the bound of the page
    var x = getRandomInt(0 + self.width / 2,self.world.width - self.width / 2)
    var y = getRandomInt(0 + self.height / 2,self.world.height - self.height / 2)
    self.current = { x: x, y: y };
    self.target = { x: x, y: y };
    self.threatDistance = 100;
    self.lastSawThreatAt = null;

    self.vibe = "idle";
    self.currentVibeTime = 0;
    self.currentVibeTimeLimit = 0;

    self.draw = function(ctx) {
        ctx.save();
        ctx.translate(self.current.x , self.current.y );
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(- (self.width / 2), - (self.height / 2), self.width, self.height);
        ctx.restore();

        // temporarily draw the target
        ctx.save();
        ctx.translate(self.target.x, self.target.y);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();
    }
    self.notifyOfMouseMove = function(pointerLocation) {
        self.lastSawThreatAt = pointerLocation;
    }
    self.checkIfNeedToFlee = function() {
        if(!self.lastSawThreatAt) return;
        var a = self.current.x - self.lastSawThreatAt.x;
        var b = self.current.y - self.lastSawThreatAt.y;

        var distance = Math.sqrt( a*a + b*b );
        if(distance < self.threatDistance) {
            self.setFleeTarget(self.lastSawThreatAt);
        }
    }
    self.setFleeTarget = function(threatLocation) {
        self.vibe = "fleeing";
        // pick a target in the opposite direction of the threat
        // work out the angle between where we are and the current threat position
        var delta_x = threatLocation.x - self.current.x;
        var delta_y = threatLocation.y - self.current.y;
        var theta_radians = Math.atan2(delta_y, delta_x)

        var fleeDistance = 200;

        // what is the adjacent (X)
        var adjacent = Math.cos(theta_radians) * fleeDistance;
        // what is the opposite (Y)
        var opposite = Math.sin(theta_radians) * fleeDistance;

        // don't let the target be closer to the edge than this object will fit
        var targetX = self.current.x - adjacent;
        if(targetX < self.width / 2) {
            targetX = self.width / 2;
        } else if(targetX > self.world.width - (self.width / 2)) {
            targetX = self.world.width - (self.width / 2);
        }
        var targetY = self.current.y - opposite;
        if(targetY < self.height / 2) {
            targetY = self.height / 2;
        } else if(targetY > (self.world.height - (self.height / 2))) {
            targetY = self.world.height - (self.height / 2);
        }
        self.target = { x: targetX, y: targetY };
    }
    self.process = function() {
        self.checkIfNeedToFlee();
        self.currentVibeTime += self.world.processIncrement;
        self.checkIfNewVibeNeeded();
        self.move();
    }
    self.move = function() {
        if(self.vibe=="idle") return;
        if(self.target.x === self.current.x && self.target.y === self.current.y) {
            self.getNewVibe();
            return;
        }

        var delta_x = self.target.x - self.current.x;
        var delta_y = self.target.y - self.current.y;
        var theta_radians = Math.atan2(delta_y, delta_x)

        var travelDistance = self.getSpeed();

        var distanceToTarget = Math.sqrt( delta_x*delta_x + delta_y*delta_y );
        // if we're very close then set us at the target
        if(distanceToTarget < travelDistance) {
            self.current.x = self.target.x;
            self.current.y = self.target.y;
            self.getNewVibe();
            return;
        }
        //console.log(distanceToTarget);

        // what is the adjacent (X)
        var adjacent = Math.cos(theta_radians) * travelDistance;
        // what is the opposite (Y)
        var opposite = Math.sin(theta_radians) * travelDistance;
        self.current.x = self.current.x + adjacent;
        self.current.y = self.current.y + opposite;
    }
    self.getSpeed = function() {
        if(self.vibe === "wandering") {
            return 3;
        } else if (self.vibe === "fleeing") {
            return 6;
        } else {
            console.log("ruh roh");
        }
    }

    self.checkIfNewVibeNeeded = function() {
        // at the moment this really only applies if they've been idle ...
        // when movement to a target is complete then they will automatically get a new vibe
        if(self.vibe === "idle") {
            if(self.currentVibeTime > self.currentVibeTimeLimit) {
                self.getNewVibe();
            }
        }
    }
    self.getNewVibe = function() {
        var choice = getRandomInt(1, 2);
        if(choice === 1) {
            self.vibe= "idle";
            self.currentVibeTime = 0;
            self.currentVibeTimeLimit = getRandomInt(1000, 10000);
        } else if (choice === 2) {
            self.vibe= "wandering";
            var x = getRandomInt(self.width/2, self.world.width - self.width/2);
            var y = getRandomInt(self.height/2, self.world.height - self.height/2);
            self.target = { x:x, y:y};
        } else {
            console.log("uh oh");
        }
        console.log("vibe is now: " + self.vibe);
    }
};


var World = function(settings){
    var self = this;

    self.movers = [];
    self.width = 800;
    self.height = 600;
    self.processIncrement = 100;
    var moverSettings = {
        world : this
    }

    for (var i = 0; i < 100; i++) {
        var newMover = new Mover(moverSettings);
        self.movers.push(newMover);
    }
    self.draw = function(context) {
        for(var i = 0; i < self.movers.length; i++) {
            self.movers[i].draw(context);
        }
    }
    self.process = function () {
        for(var i = 0; i < self.movers.length; i++) {
            self.movers[i].process();
        }
        setTimeout(function () { self.process(); }, self.processIncrement);
    }
    self.process();

    self.notifyOfMouseMove = function(event) {
        var pointer = { x: event.pageX, y: event.pageY };
        for(var i = 0; i < self.movers.length; i++) {
            self.movers[i].notifyOfMouseMove(pointer);
        }
    }
    $("html").mousemove(function(event) {
        self.notifyOfMouseMove(event);
    });
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}