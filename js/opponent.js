// Computer opponent playing as boy
"use strict";
// global: document, window
// linter: ngspicejs-lint

var SC = window.SC || {};

SC.opponent = (function () {
    var self = {};
    self.tic = 0;
    self.oldX = 0.5;
    self.x = 0.5;
    self.speed = 0.02;

    self.place = function (aX) {
        // Place opponent at given X position
        //console.log(window.innerWidth, SC.scene.tl.rx, aX, SC.scene.tr.rx, SC.scene.tl.rx, self.width);
        self.tic += 125 * Math.abs(aX - self.oldX);
        self.oldX = aX;
        self.div.style.left = ((window.innerWidth * (SC.scene.tl.rx + aX * (SC.scene.tr.rx - SC.scene.tl.rx)) - self.width / 2)) + 'px';
        self.div.style.top = (window.innerHeight * SC.scene.tl.ry - self.height / 2 + 0.02 * self.height * Math.sin(self.tic)) + 'px';
    };

    self.update = function () {
        // Move towards ball, render
        var x = Math.min(1.05, Math.max(-0.05, SC.ball.pos.elements[0]));
        // limit movement speed to self.speed
        if (x < self.x - self.speed) {
            x = self.x - self.speed;
        }
        if (x > self.x + self.speed) {
            x = self.x + self.speed;
        }
        self.x = x;
        self.place(self.x);
    };

    window.addEventListener('DOMContentLoaded', function () {
        self.div = document.getElementById('boy');
        self.width = window.innerWidth * 0.1;
        self.height = window.innerWidth * 0.1777;
        self.div.style.width = self.width + 'px';
        self.div.style.height = self.height + 'px';
        self.place(0.5);
    });

    return self;
}());


