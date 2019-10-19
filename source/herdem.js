
var Mover = function(settings) {
    var self = this;

    self.world = settings.world;
    console.log("hi - " + self.world.height);
    self.width = 40;
    self.height = 40;
    // put this somewhere within the bound of the page
    var x = getRandomInt(0 + self.width / 2,self.world.width - self.width / 2)
    var y = getRandomInt(0 + self.height / 2,self.world.height - self.height / 2)
    self.current = { x: x, y: y };
    self.target = { x: x, y: y };
    self.threatDistance = 100;
    self.lastSawThreatAt = null;


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
        console.log("triggerFlee");
        // pick a target in the opposite direction of the threat
        // work out the angle between where we are and the current threat position
        var delta_x = threatLocation.x - self.current.x;
        var delta_y = threatLocation.y - self.current.y;
        var theta_radians = Math.atan2(delta_y, delta_x)

        var fleeDistance = 50;

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
        console.log("my new target is ");
        console.log(self.target);
    }
    self.move = function() {
        self.checkIfNeedToFlee();
        if(self.target.x === self.current.x && self.target.y === self.current.y) {
            return;
        }

        var delta_x = self.target.x - self.current.x;
        var delta_y = self.target.y - self.current.y;
        var theta_radians = Math.atan2(delta_y, delta_x)

        var travelDistance = 5;

        var distanceToTarget = Math.sqrt( delta_x*delta_x + delta_y*delta_y );
        // if we're very close then set us at the target
        if(distanceToTarget < travelDistance) {
            self.current.x = self.target.x;
            self.current.y = self.target.y;
            return;
        }
        console.log(distanceToTarget);

        // what is the adjacent (X)
        var adjacent = Math.cos(theta_radians) * travelDistance;
        // what is the opposite (Y)
        var opposite = Math.sin(theta_radians) * travelDistance;
        self.current.x = self.current.x + adjacent;
        self.current.y = self.current.y + opposite;


    }

};


var World = function(settings){
    var self = this;

    self.movers = [];
    self.width = 800;
    self.height = 600;
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
    self.move = function () {
        for(var i = 0; i < self.movers.length; i++) {
            self.movers[i].move();
        }
        setTimeout(function () { self.move(); }, 100);
    }
    self.move();

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