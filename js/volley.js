// Detecting time, position and direction of volley from user's swipe
"use strict";
// global: document, window, Vector, Line, setTimeout
// linter: ngspicejs-lint

var SC = window.SC || {};

SC.volley = (function () {
    var self = {};
    self.x1 = 0;
    self.y1 = 0;
    self.x2 = 0;
    self.y2 = 0;
    self.stroke = [];

    function reflection(aBallX, aBallY, aX1, aY1, aX2, aY2) {
        // Calculate reflection
        // doc/sketch/volley_reflection_on_swipe.png
        // ignore while on his side
        if (SC.ball.pos.elements[1] >= 0) {
            //console.warn('on his side');
            return;
        }
        // get ball screen pos
        var bxy = Vector.create([aBallX, aBallY]),
            s = Vector.create([aX2 - aX1, aY2 - aY1]),
            line = Line.create(Vector.create([aX1, aY1]), s),
            d = line && line.distanceFrom(bxy),
            k,
            k2;
        if (!line) {
            return;
        }
        if (d > 0.3 * SC.scene.rw) {
            //console.warn('missed', d);
            return;
        }
        k = 0.4 * s.modulus() / SC.scene.rh;
        // reflect ball y
        SC.ball.speed.elements[1] = -SC.ball.speed.elements[1];
        SC.ball.speed.elements[2] = -SC.ball.speed.elements[2];
        // add swipe direction
        k2 = 3;
        SC.ball.speed = SC.ball.speed.add(Vector.create([s.elements[0], 0, 0]).toUnitVector().multiply(k2).multiply(k * SC.ball.speed.modulus()));
        SC.sound.play('pop_deeper');
        self.debug = {aBallX, aBallY, aX1, aY1, aX2, aY2,bxy,s,line,d,k,k2};
    }

    function onStart(x, y) {
        // start swipe
        self.x1 = x;
        self.y1 = y;
        self.stroke = [];
        self.stroke.push({x: self.x1, y: self.y1, lineWidth: 10});
    }
    function onMove(x, y) {
        // Continue swipe
        self.stroke.push({x: x, y: y, lineWidth: 10});
    }
    function onEnd(x, y) {
        // End swipe
        self.x2 = x;
        self.y2 = y;
        self.stroke.push({x: self.x2, y: self.y2, lineWidth: 10});
        SC.swipe_canvas.context.fillStyle = 'rgba(0,255,255,0.5)';
        SC.trapezoid(SC.swipe_canvas.context, self.stroke, 30, 1);
        SC.swipe_canvas.context.fill();
        setTimeout(function () {
            SC.swipe_canvas.clear();
        }, 500);
        if (SC.ball && SC.ball.xyBall) {
            reflection(SC.ball.xyBall.x, SC.ball.xyBall.y, self.x1, self.y1, self.x2, self.y2);
        }
    }

    // touch controls
    window.addEventListener('touchstart', function (event) {
        onStart(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
    });
    window.addEventListener('touchmove', function (event) {
        onMove(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
        event.preventDefault();
    }, {passive: false});
    window.addEventListener('touchend', function (event) {
        onEnd(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    });

    // mouse controls
    var moving = false;
    window.addEventListener('mousedown', function (event) {
        onStart(event.clientX, event.clientY);
        moving = true;
    });
    window.addEventListener('mousemove', function (event) {
        if (moving) {
            onMove(event.clientX, event.clientY);
            event.preventDefault();
        }
    });
    window.addEventListener('mouseup', function (event) {
        onEnd(event.clientX, event.clientY);
        moving = false;
    });

    return self;
}());

