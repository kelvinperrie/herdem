
var Mover = function(settings) {
    var self = this;

    self.current = { x: 100, y: 100 };
    self.target = { x: 100, y: 100 };
    self.threatDistance = 100;

    self.draw = function(ctx) {
        // temporarily draw the target
        ctx.save();
        ctx.translate(self.target.x, self.target.y);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 5, 5);
        ctx.restore();

        ctx.save();
        ctx.translate(self.current.x, self.current.y);
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(0, 0, 5, 5);
        ctx.restore();
    }
    self.notifyOfMouseMove = function(pointerLocation) {
        var a = self.current.x - pointerLocation.x;
        var b = self.current.y - pointerLocation.y;

        var distance = Math.sqrt( a*a + b*b );
        if(distance < self.threatDistance) {
            self.triggerFlee(pointerLocation);
        }
    }
    self.triggerFlee = function(threatLocation) {
        console.log("triggerFlee");
        // pick a target in the opposite direction of the threat
        // work out the angle between where we are and the current threat position
        var delta_x = threatLocation.x - self.current.x;
        var delta_y = threatLocation.y - self.current.y;
        var theta_radians = Math.atan2(delta_y, delta_x)

        var fleeDistance = 30;

        // what is the adjacent (X)
        var adjacent = Math.cos(theta_radians) * fleeDistance;
        // what is the opposite (Y)
        var opposite = Math.sin(theta_radians) * fleeDistance;

        self.target = { x: self.current.x - adjacent, y: self.current.y - opposite};
        console.log("my new target is ");
        console.log(self.target);
    }
    self.move = function() {
        if(self.target.x === self.current.x && self.target.y === self.current.y) {
            return;
        }

        var delta_x = self.target.x - self.current.x;
        var delta_y = self.target.y - self.current.y;
        var theta_radians = Math.atan2(delta_y, delta_x)

        var travelDistance = 2;

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
    var newMover = new Mover();
    self.movers.push(newMover);

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
var world = new World();
