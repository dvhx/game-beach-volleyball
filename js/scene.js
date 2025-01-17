// Custom scene layout
"use strict";
// global: document, window
// linter: ngspicejs-lint

var SC = window.SC || {};

SC.scene = { // doc/sketch/scene_field_layout.png
    w: 720,
    h: 1280,
    rw: 0,
    rh: 0,
    tl: {x: 128, y: 417},   // top left line corner
    tr: {x: 557, y: 417},
    nl: {x: 44, y: 478},    // net left (top of the net)
    nr: {x: 648, y: 478},
    ml: {x: 88, y: 710},    // middle left (ground)
    mr: {x: 610, y: 711},
    bl: {x: 21, y: 1167},  // bottom left line corner
    br: {x: 690, y: 1167},
    pl: {x: 144, y: 557} // pole shadow left top
};

SC.onResize = function () {
    // Resize scene
    var k;
    // calculate relative coords
    for (k in SC.scene) {
        if (SC.scene.hasOwnProperty(k)) {
            if (SC.scene[k].hasOwnProperty('y')) {
                SC.scene[k].rx = SC.scene[k].x / SC.scene.w;
                SC.scene[k].ry = SC.scene[k].y / SC.scene.h;
                //console.log(k, SC.scene[k].rx.toFixed(3), SC.scene[k].ry.toFixed(3));
            }
        }
    }
    // update real w/h
    SC.scene.rw = window.innerWidth;
    SC.scene.rh = window.innerHeight;
};

SC.onResize();
