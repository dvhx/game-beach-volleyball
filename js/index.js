// Main window
"use strict";
// global: document, requestAnimationFrame, window, setInterval, setTimeout, Vector2, lineLineIntersection, URL, console
// linter: ngspicejs-lint

var SC = window.SC || {};

SC.quitLabel = (new URL(document.location)).searchParams.get('quit');

SC.projectionRectangle = function (aTlX, aTlY, aTrX, aTrY, aMlX, aMlY, aMrX, aMrY, aX, aY, aZ, aColor, aShadow, aShadowZ) {
    // Calculate projection of one half of the playing field
    // doc/sketch/projection.png
    // if too far compress y so the don't end up in ocean
    if (aY > 1) {
        aY = 1 + (aY - 1) / 2;
    }
    if (aY > 1.1) {
        aY = 1.1 + (aY - 1.1) / 3;
    }
    if (aY > 1.2) {
        aY = 1.2 + (aY - 1.2) / 4;
    }
    var tl, tr, ml, mr, a, b, c, d, p, x, y, pole;
    tl = new Vector2(aTlX, aTlY);
    tr = new Vector2(aTrX, aTrY);
    ml = new Vector2(aMlX, aMlY);
    mr = new Vector2(aMrX, aMrY);
    a = ml.add(tl.sub(ml).scale(aY));
    b = mr.add(tr.sub(mr).scale(aY));
    c = ml.add(mr.sub(ml).scale(aX));
    d = tl.add(tr.sub(tl).scale(aX));
    p = lineLineIntersection(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
    /*
    console.log('tl', tl);
    console.log('tr', tr);
    console.log('ml', ml);
    console.log('mr', mr);
    console.log('a', a);
    console.log('b', b);
    console.log('c', c);
    console.log('d', d);
    console.log('p', p);
    */
    // scale to screen
    x = p.x * SC.scene.rw;
    y = p.y * SC.scene.rh - aZ * (SC.scene.ml.ry - SC.scene.nl.ry) * SC.scene.rh;
    if (aShadow) {
        pole = (new Vector2(SC.scene.pl.rx, SC.scene.pl.ry)).sub(new Vector2(SC.scene.ml.rx, SC.scene.ml.ry));
        //console.warn('sz', aShadowZ, 'pole', pole.x, pole.y);
        pole.x *= SC.scene.rw;
        pole.y *= SC.scene.rh;
        pole = pole.scale(aShadowZ);
        if (SC.debug) {
            SC.ball2.dot(x + pole.x, y + pole.y, aColor || 'lime');
        }
        return {x: x + pole.x, y: y + pole.y};
    }
    if (SC.debug) {
        SC.ball2.dot(x, y, aColor || 'lime');
    }
    return {x: x, y: y};
};

SC.projection = function (aX, aY, aZ, aColor, aShadow, aShadowZ) {
    // Calculate 3D projection
    // top half
    if (aY >= 0) {
        return SC.projectionRectangle(
            SC.scene.tl.rx,
            SC.scene.tl.ry,
            SC.scene.tr.rx,
            SC.scene.tr.ry,
            SC.scene.ml.rx,
            SC.scene.ml.ry,
            SC.scene.mr.rx,
            SC.scene.mr.ry,
            aX,
            aY,
            aZ,
            aColor,
            aShadow,
            aShadowZ
        );
    }
    // bottom half
    return SC.projectionRectangle(
        SC.scene.ml.rx,
        SC.scene.ml.ry,
        SC.scene.mr.rx,
        SC.scene.mr.ry,
        SC.scene.bl.rx,
        SC.scene.bl.ry,
        SC.scene.br.rx,
        SC.scene.br.ry,
        aX,
        1 + aY,
        aZ,
        aColor,
        aShadow,
        aShadowZ
    );
};

SC.quit = function (aWin) {
    // Close this iframe by telling parent window
    console.log('quit, win=', aWin);
    var msg = window.parent.postMessage({action: 'quit', data: {win: aWin, score: aWin ? 10 : 0}});
    console.log('msg', msg);
};

SC.pauseDialog = function () {
    // Show pause dialog
    SC.ball.pause = true;
    SC.splash(
        'Game paused',
        SC.quitLabel ? ['Continue', SC.quitLabel] : ['Continue'],
        '#77ff77',
        '',
        function (aButton) {
            if (aButton === SC.quitLabel) {
                SC.quit(false);
                return;
            }
            SC.ball.pause = false;
        }
    );
};

// initialize window
window.addEventListener('DOMContentLoaded', function () {
    SC.onResize();
    window.addEventListener('resize', SC.onResize);

    SC.ball1_canvas = new SC.canvas('ball1_canvas');
    SC.ball2_canvas = new SC.canvas('ball2_canvas');

    SC.bg_canvas = new SC.canvas('bg_canvas');
    SC.swipe_canvas = new SC.canvas('swipe_canvas');

    SC.projection(0, 0, 0, 'red');
    SC.projection(0, 1, 0, 'green');
    SC.projection(1, 0, 0, 'orange');
    SC.projection(1, 1, 0, 'lime');

    SC.sound.flat = true;
    SC.sound.add('sound/sand', 3, false);
    SC.sound.add('sound/pop', 1, false);
    SC.sound.add('sound/pop_deeper', 1, false);
    SC.sound.add('sound/achievement', 1, false);
    SC.sound.add('sound/gameover', 1, false);
    SC.sound.add('sound/ooh', 1, false);
    SC.sound.add('sound/out', 1, false);
    SC.sound.add('sound/argh', 1, false);

    SC.splash(
        'Volleyball',
        SC.quitLabel ? ['Play', SC.quitLabel] : ['Play'],
        '#77ff77',
        'Play beach volleyball with me. Swipe ball to bounce it back to my side, swipe left and right to control direction. If ball is moving right, make long left swipe to counter it\'s direction. Whoever scores 15 points first win.',
        SC.ball.onDialogButton
    );

    window.addEventListener('keydown', function (event) {
        // Pause on escape
        if (event.key === 'Escape' && !SC.ball.pause) {
            SC.pauseDialog();
        }
    });
});

