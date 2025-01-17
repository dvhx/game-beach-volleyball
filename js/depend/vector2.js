// Simple 2D vector library
"use strict";
// globals: document, window

function Vector2(aX, aY) {
    this.x = aX || 0;
    this.y = aY || 0;
}

Vector2.prototype.clone = function () {
    return new Vector2(this.x, this.y);
};

Vector2.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector2.prototype.add = function (aVector2) {
    return new Vector2(this.x + aVector2.x, this.y + aVector2.y);
};

Vector2.prototype.sub = function (aVector2) {
    return new Vector2(this.x - aVector2.x, this.y - aVector2.y);
};

Vector2.prototype.scale = function (aKoef) {
    return new Vector2(this.x * aKoef, this.y * aKoef);
};

Vector2.prototype.neg = function () {
    return new Vector2(-this.x, -this.y);
};

Vector2.prototype.right = function () {
    return new Vector2(this.y, -this.x);
};

Vector2.prototype.left = function () {
    return new Vector2(-this.y, this.x);
};

Vector2.prototype.str = function (aDigits) {
    return '[' + this.x.toFixed(aDigits || 0) + ',' + this.y.toFixed(aDigits || 0) + ']';
};

Vector2.prototype.unit = function () {
    var d = this.length();
    if (d !== 0) {
        return new Vector2(this.x / d, this.y / d);
    }
    return new Vector2(1, 0);
};

Vector2.prototype.angle = function (aOther) {
    var a = this.clone().unit(),
        b,
        angle = Math.atan2(a.y, a.x);
    if (aOther) {
        b = aOther.clone().unit();
        angle = angle - Math.atan2(b.y, b.x);
        if (angle < -Math.PI) {
            angle += 2 * Math.PI;
        }
        if (angle > Math.PI) {
            angle -= 2 * Math.PI;
        }
    }
    return angle;
};

Vector2.prototype.target = function (aTarget) {
    return new Vector2(aTarget.x - this.x, aTarget.y - this.y);
};

Vector2.prototype.precision = function (aDigits) {
    // Reduce precision to aDigits (usually before save)
    this.x = parseFloat(this.x.toFixed(aDigits || 4));
    this.y = parseFloat(this.y.toFixed(aDigits || 4));
};

