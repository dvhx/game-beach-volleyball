// Draw path made from trapezoid segments
"use strict";
// global: document, window
// linter: ngspicejs-lint

var SC = window.SC || {};

SC.trapezoid = function (aContext, aPath, aStartWidth, aEndWidth) {
    // Draw path made from trapezoid segments, path: [{x: 10, y: 20, lineWidth: 3}, ...]
    function one(aX1, aY1, aW1, aX2, aY2, aW2) {
        // One trapezoid segment (seamlesly glued to previous)
        var sx = aX2 - aX1,
            sy = aY2 - aY1,
            sl = Math.sqrt(sx * sx + sy * sy),
            sxn = sx / sl,
            syn = sy / sl,
            wxn = syn,
            wyn = -sxn,
            x1a = aX1 + wxn * aW1,
            y1a = aY1 + wyn * aW1,
            x1b = aX1 - wxn * aW1,
            y1b = aY1 - wyn * aW1,
            x2a = aX2 + wxn * aW2,
            y2a = aY2 + wyn * aW2,
            x2b = aX2 - wxn * aW2,
            y2b = aY2 - wyn * aW2;
        return [x1a, y1a, x1b, y1b, x2a, y2a, x2b, y2b];
    }
    var i, p, a = [], b = [];
    // defined taper
    if (typeof aStartWidth === 'number' && typeof aEndWidth === 'number') {
        for (i = 0; i < aPath.length; i++) {
            aPath[i].lineWidth = aStartWidth + (aEndWidth - aStartWidth) * (i / (aPath.length - 1));
        }
    }
    // find outline
    for (i = 1; i < aPath.length; i++) {
        p = one(
            aPath[i - 1].x,
            aPath[i - 1].y,
            aPath[i - 1].lineWidth / 2,
            aPath[i].x,
            aPath[i].y,
            aPath[i].lineWidth / 2
        );
        a.push({x: p[0], y: p[1]});
        b.push({x: p[2], y: p[3]});
    }
    a.push({x: p[4], y: p[5]});
    b.push({x: p[6], y: p[7]});
    // fill outline
    aContext.beginPath();
    for (i = 0; i < a.length; i++) {
        aContext.lineTo(a[i].x, a[i].y);
    }
    for (i = b.length - 1; i >= 0; i--) {
        aContext.lineTo(b[i].x, b[i].y);
    }
    aContext.closePath();
    return {a: a, b: b};
};


