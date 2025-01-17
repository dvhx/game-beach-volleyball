// Ball (pos, speed, rendering, rules)
"use strict";
// global: document, window, Vector, Image, setTimeout, Plane, Line, setInterval, console
// linter: ngspicejs-lint

var SC = window.SC || {};

SC.ball = (function () {
    var self = {};
    self.groundTouches = 0;
    self.g = Vector.create([0, 0, -9]);
    //self.pos = Vector.create([0, 1, 0]);
    //self.speed = Vector.create([0.2, -1, 5.6]);
    self.pos = Vector.create([0.5, 1, 0]);
    self.speed = Vector.create([0, 0, 0]);
    self.net = Plane.create(Vector.create([0, 0, 0]), Vector.create([1, 0, 0]), Vector.create([0, 0, 1])); // doc/sketch/net_plane.png
    self.imageBall = new Image();
    self.imageBall.src = 'image/ball.png';
    self.imageBallShadow = new Image();
    self.imageBallShadow.src = 'image/ball_shadow.png';
    self.imageBallMark = new Image();
    self.imageBallMark.src = 'image/ball_mark.png';
    self.scorePlayer = 0;
    self.scoreBoy = 0;
    self.pause = true;
    self.endScore = 15;
    self.serveWentOverNet = false;

    self.onDialogButton = function (aButton) {
        // Handle dialog button
        console.log(aButton);
        if (aButton === 'Play again' || aButton === 'Play') {
            self.scorePlayer = 0;
            self.scoreBoy = 0;
            document.getElementById('score').textContent = '0:0';
            self.pause = false;
            self.prepareServe();
            return;
        }
        if (aButton === SC.quitLabel) {
            SC.quit(self.scorePlayer > self.scoreBoy);
            return;
        }
    };

    self.onEvent = function (aType) {
        // Handle various game play events
        // console.log(aType, aPoint && aPoint.elements);
        switch (aType) {
        case "lost":
            self.scoreBoy++;
            document.getElementById('score').textContent = self.scorePlayer + ':' + self.scoreBoy;
            if (self.scoreBoy >= self.endScore) {
                self.pause = true;
                SC.splash(
                    'Game over!',
                    SC.quitLabel ? ['Play again', SC.quitLabel] : ['Play again'],
                    '#77ff77',
                    'You lost ' + self.scorePlayer + ':' + self.scoreBoy + '. Do you want to play again?',
                    self.onDialogButton
                );
                SC.sound.play('gameover');
            }
            break;
        case "win":
            self.scorePlayer++;
            document.getElementById('score').textContent = self.scorePlayer + ':' + self.scoreBoy;
            if (self.scorePlayer >= self.endScore) {
                self.pause = true;
                SC.splash(
                    'Congratulation!',
                    SC.quitLabel ? ['Play again', SC.quitLabel] : ['Play again'],
                    '#77ff77',
                    'You won ' + self.scorePlayer + ':' + self.scoreBoy + '.  Do you want to play again?',
                    self.onDialogButton
                );
                SC.sound.play('achievement');
            }
            break;
        case "out":
            SC.sound.play('out');
            document.getElementById('out').style.visibility = 'visible';
            setTimeout(function () {
                document.getElementById('out').style.visibility = 'hidden';
            }, 1000);
            break;
        }
    };

    self.prepareServe = function () {
        // Prepare ball and then serve
        if (self.pause) {
            return;
        }
        setTimeout(function () {
            self.pos.elements[0] = SC.opponent.x;
            self.pos.elements[1] = 1;
            self.pos.elements[2] = 0;
            self.speed = Vector.create([0, 0, 0]);
        }, 700);
        setTimeout(self.serve, 1500);
    };

    self.serve = function () {
        // Let him serve ball from his pos on top line
        self.serveWentOverNet = false;
        var x = SC.opponent.x,
            left = 0.9 * x,
            right = 1 - 0.9 * x,
            serve_x = -left + Math.random() * (left + right),
            miny = -0.95 + 0.05,
            maxy = -1.5 - 0.1,
            y = miny + Math.random() * (maxy - miny);
        //y = -1.2;
        //console.log('serve', x, y);
        self.pos = Vector.create([x, 1, 0]);
        self.speed = Vector.create([serve_x, y, 5.6]);
        if (SC.swipe_canvas) {
            SC.swipe_canvas.clear();
        }
        self.groundTouches = 0;
        SC.sound.play('pop');
    };

    function lerp2(aValue, aX1, aY1, aX2, aY2) {
        // Single segment lerp (2 points)
        return aY1 + (aY2 - aY1) * (aValue - aX1) / (aX2 - aX1);
    }

    self.out = function (aX, aY) {
        // return true if ball is outside of field
        return aX < 0 || aX > 1 || aY < -1 || aY > 1;
    };

    self.update = function (aDt) {
        // Update ball
        if (self.pause) {
            return;
        }
        var old_pos = self.pos, line, net_point, xy, canvas, size;
        aDt = aDt || 0.05;
        if (self.pos.elements[2] !== 0) {
            self.speed = self.speed.add(self.g.multiply(aDt));
        }
        self.pos = self.pos.add(self.speed.multiply(aDt));
        // detect crossing the net (y=0)
        if (old_pos.elements[1] === 0 || self.pos.elements[1] === 0 || (old_pos.elements[1] / self.pos.elements[1] < 0)) {
            line = Line.create(old_pos, self.pos.subtract(old_pos));
            self.line = line;
            net_point = SC.ball.net.intersectionWith(SC.ball.line);
            if (net_point.elements[2] < 1) {
                self.onEvent('net-below', net_point);
                self.speed.elements[1] *= -0.5;
                self.pos.elements[1] = -self.pos.elements[1];
                if (self.pos.elements[1] > 0) {
                    SC.sound.play('argh');
                }
            } else {
                self.onEvent('net-above', net_point);
                self.serveWentOverNet = true;
            }
        }
        // ball is smaller further away
        size = lerp2(self.pos.elements[1], -1, Math.max(window.innerWidth, window.innerHeight) / 10, 1, Math.max(window.innerWidth, window.innerHeight) / 40);
        if (size < 1) {
            size = 1;
        }
        // don't go below ground
        if (self.pos.elements[2] < 0) {
            if (Math.abs(self.speed.elements[2]) < 0.3) {
                // self.onEvent('stopped', self.pos);
                self.pos.elements[2] = 0;
                self.speed.elements[0] = 0;
                self.speed.elements[1] = 0;
                self.speed.elements[2] = 0;
            } else {
                // console.log('g speed 2', self.speed.elements[2]);
                self.pos.elements[2] = 0.9 * (-self.pos.elements[2]);
                self.speed.elements[2] = -self.speed.elements[2];
                self.speed = self.speed.multiply(0.6);
                self.onEvent('ground', self.pos);

                // leave mark on ground
                if (self.groundTouches <= 3) {
                    SC.bg_canvas.context.drawImage(self.imageBallMark, self.xyBallGround.x - size / 2, self.xyBallGround.y - size / 2, size, size);
                }

                self.groundTouches++;
                if (self.groundTouches === 1) {
                    // whose side was it?
                    if (self.pos.elements[1] < 0) {
                        // my side
                        if (self.out(self.pos.elements[0], self.pos.elements[1])) {
                            // out
                            self.onEvent('out');
                            self.onEvent('win');
                        } else {
                            // in
                            self.onEvent('lost');
                        }
                    } else {
                        // his side
                        // his serve didn't went over net
                        if (!self.serveWentOverNet) {
                            self.onEvent('win');
                            return;
                        }
                        if (self.out(self.pos.elements[0], self.pos.elements[1])) {
                            // out
                            self.onEvent('out');
                            self.onEvent('lost');
                        } else {
                            // can bounce?
                            if (Math.abs(SC.opponent.x - self.pos.elements[0]) <= 0.03) {
                                self.onEvent('bounce');
                                self.serve();
                                return;
                            }
                            // he's too far away to bounce
                            self.onEvent('win');
                        }
                    }
                }
                // after third ground touch serve again
                if (self.groundTouches === 3) {
                    self.prepareServe();
                    return;
                }
                // play sound of ground touch
                if (self.groundTouches <= 4) {
                    SC.sound.play('sand');
                }
            }
        }
        // clear canvases
        if (!SC.ball1_canvas) {
            return;
        }
        SC.ball1_canvas.clear();
        SC.ball2_canvas.clear();

        // draw ball in front or behind net?
        canvas = self.pos.elements[1] > 0 ? SC.ball1_canvas : SC.ball2_canvas;

        // directly under ball
        self.xyBallGround = SC.projection(self.pos.elements[0], self.pos.elements[1], 0, 'silver');
        // ball shadow
        xy = SC.projection(self.pos.elements[0], self.pos.elements[1], 0, 'pink', true, self.pos.elements[2]);
        canvas.context.drawImage(self.imageBallShadow, xy.x - size / 2, xy.y - size / 2, size, size);
        // ball
        xy = SC.projection(self.pos.elements[0], self.pos.elements[1], self.pos.elements[2], 'white');
        canvas.context.drawImage(self.imageBall, xy.x - size / 2, xy.y - size / 2, size, size);
        self.xyBall = xy;
        // opponent
        SC.opponent.update(self.pos.elements[0], self.pos.elements[1]);
    };

    setInterval(function () { self.update(0.05); }, 50);

    return self;
}());

