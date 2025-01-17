// Fullscreen canvas
"use strict";
// global: document, window
// linter: ngspicejs-lint

var SC = window.SC || {};

SC.canvas = function (aCanvasOrId) {
    // initialize canvas
    var t = this;
    this.canvas = typeof aCanvasOrId === 'string' ? document.getElementById(aCanvasOrId) : aCanvasOrId;
    this.context = this.canvas.getContext('2d');

    this.onResize = function () {
        // adjust canvas size after window resize
        t.w = t.canvas.clientWidth;
        t.h = t.canvas.clientHeight;
        t.canvas.width = t.w;
        t.canvas.height = t.h;
    };
    window.addEventListener('resize', this.onResize);
    this.onResize();
};

SC.canvas.prototype.clear = function () {
    // clear canvas
    this.context.clearRect(0, 0, this.w, this.h);
};

SC.canvas.prototype.line = function (aX1, aY1, aX2, aY2, aColor, aWidth) {
    // Handle window resize
    this.context.strokeStyle = aColor || 'red';
    this.context.lineWidth = aWidth || 1;
    this.context.beginPath();
    this.context.moveTo(aX1, aY1);
    this.context.lineTo(aX2, aY2);
    this.context.closePath();
    this.context.stroke();
};

SC.canvas.prototype.dot = function (aX, aY, aColor) {
    // Handle window resize
    this.context.fillStyle = aColor || 'red';
    this.context.fillRect(aX - 3, aY - 3, 6, 6);
};


