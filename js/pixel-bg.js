(function () {
    "use strict";

    const canvas = document.getElementById("pixel-bg");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SCALE = 4;

    let w = 1;
    let h = 1;
    let stars = [];
    let sparks = [];
    let shooting = [];
    let raf = null;
    let last = 0;
    let nextShoot = 2400;

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function buildStars() {
        stars = [];
        const count = Math.min(220, Math.round((w * h) / 1500));
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.floor(rand(0, w)),
                y: Math.floor(rand(0, h)),
                size: Math.random() > 0.85 ? 2 : 1,
                color: Math.random() > 0.68 ? "#2f6bff" : "#ffd43b",
                phase: rand(0, Math.PI * 2),
                speed: rand(0.4, 1.2)
            });
        }
    }

    function resize() {
        w = Math.max(1, Math.ceil(window.innerWidth / SCALE));
        h = Math.max(1, Math.ceil(window.innerHeight / SCALE));
        canvas.width = w;
        canvas.height = h;
        buildStars();
        if (reduce) draw(0);
    }

    function spawn(x, y) {
        for (let i = 0; i < 2; i++) {
            sparks.push({
                x: x,
                y: y,
                vx: rand(-9, 9),
                vy: rand(-9, 9),
                life: 1,
                color: Math.random() > 0.6 ? "#ffd43b" : "#2f6bff",
                size: Math.random() > 0.7 ? 2 : 1
            });
        }
        if (sparks.length > 90) sparks.splice(0, sparks.length - 90);
    }

    function spawnShooting(t) {
        if (t < nextShoot) return;
        nextShoot = t + rand(7000, 14000);
        if (shooting.length > 2) return;

        const dir = Math.random() > 0.5 ? 1 : -1;
        shooting.push({
            x: rand(w * 0.15, w * 0.85),
            y: rand(h * 0.08, h * 0.4),
            vx: dir * rand(2.2, 4.2),
            vy: rand(1.4, 2.4),
            life: 1,
            color: Math.random() > 0.5 ? "#ffd43b" : "#2f6bff"
        });
    }

    function draw(t) {
        ctx.clearRect(0, 0, w, h);

        const time = t / 1000;

        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase));
            ctx.globalAlpha = tw * 0.5;
            ctx.fillStyle = s.color;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        }
        ctx.globalAlpha = 1;

        for (let i = sparks.length - 1; i >= 0; i--) {
            const p = sparks[i];
            p.x += p.vx * 0.1;
            p.y += p.vy * 0.1;
            p.vy += 0.3;
            p.life -= 0.035;
            if (p.life <= 0) {
                sparks.splice(i, 1);
                continue;
            }
            ctx.globalAlpha = p.life * 0.9;
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        }
        ctx.globalAlpha = 1;

        spawnShooting(t);

        for (let i = shooting.length - 1; i >= 0; i--) {
            const s = shooting[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.018;

            if (s.life <= 0 || s.x < -24 || s.x > w + 24 || s.y > h + 24) {
                shooting.splice(i, 1);
                continue;
            }

            for (let j = 0; j < 6; j += 1) {
                ctx.globalAlpha = s.life * (1 - j / 6) * 0.85;
                ctx.fillStyle = s.color;
                const size = j === 0 ? 2 : 1;
                ctx.fillRect(Math.round(s.x - s.vx * j * 1.4), Math.round(s.y - s.vy * j * 1.4), size, size);
            }
        }
        ctx.globalAlpha = 1;
    }

    function loop(t) {
        if (!last) last = t;
        last = t;
        draw(t);
        raf = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize, { passive: true });

    window.addEventListener(
        "pointermove",
        function (event) {
            if (reduce) return;
            spawn(event.clientX / SCALE, event.clientY / SCALE);
        },
        { passive: true }
    );

    document.addEventListener("visibilitychange", function () {
        if (reduce) return;
        if (document.hidden) {
            if (raf) cancelAnimationFrame(raf);
            raf = null;
        } else if (!raf) {
            last = 0;
            raf = requestAnimationFrame(loop);
        }
    });

    resize();
    if (!reduce) raf = requestAnimationFrame(loop);
})();
