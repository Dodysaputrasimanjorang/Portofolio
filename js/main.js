(function () {
    "use strict";

    const doc = document;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const header = doc.getElementById("siteHeader");
    const navToggle = doc.getElementById("navToggle");
    const mobileNav = doc.getElementById("mobileNav");
    const year = doc.getElementById("year");
    const form = doc.getElementById("contactForm");
    const formNote = doc.getElementById("formNote");

    /* ---------- 8-bit sound ---------- */

    let soundOn = false;
    try {
        soundOn = localStorage.getItem("dody_sfx") === "on";
    } catch (error) {
        soundOn = false;
    }

    let audioCtx = null;

    function ensureAudio() {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            audioCtx = new Ctx();
        }
        if (audioCtx.state === "suspended") audioCtx.resume();
        return audioCtx;
    }

    function blip(freq, duration, type, volume) {
        if (!soundOn) return;
        const ctx = ensureAudio();
        if (!ctx) return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const dur = duration || 0.05;
            const vol = volume || 0.035;
            osc.type = type || "square";
            osc.frequency.value = freq || 520;
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + dur + 0.02);
        } catch (error) {
            /* audio is best-effort */
        }
    }

    function updateSoundUI() {
        doc.querySelectorAll("[data-sound-toggle]").forEach(function (btn) {
            btn.setAttribute("aria-pressed", String(soundOn));
            const label = btn.querySelector(".sound-label");
            if (label) label.textContent = soundOn ? "SFX ON" : "SFX OFF";
        });
    }

    doc.querySelectorAll("[data-sound-toggle]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            soundOn = !soundOn;
            try {
                localStorage.setItem("dody_sfx", soundOn ? "on" : "off");
            } catch (error) {
                /* ignore */
            }
            updateSoundUI();
            if (soundOn) {
                ensureAudio();
                blip(660, 0.05);
                window.setTimeout(function () {
                    blip(880, 0.06);
                }, 70);
            }
        });
    });

    updateSoundUI();

    doc.addEventListener("click", function (event) {
        if (!soundOn) return;
        if (event.target.closest("[data-sound-toggle]")) return;
        if (event.target.closest("a, button, .inv-item, .quest-card")) {
            blip(520, 0.035, "square", 0.028);
        }
    });

    doc.querySelectorAll(".btn, .nav-link, .inv-item, .socials a").forEach(function (el) {
        el.addEventListener("pointerenter", function () {
            blip(920, 0.018, "square", 0.012);
        });
    });

    /* ---------- Header + navigation ---------- */

    const scrollBar = doc.getElementById("scrollBar");
    const pixelSun = doc.querySelector(".pixel-sun");
    let scrollQueued = false;

    function updateScrollEffects() {
        if (header) header.classList.toggle("scrolled", window.scrollY > 18);

        if (scrollBar) {
            const max = doc.documentElement.scrollHeight - window.innerHeight;
            const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
            scrollBar.style.width = (progress * 100).toFixed(2) + "%";
        }

        if (pixelSun && !reduce) {
            doc.documentElement.style.setProperty("--sun-y", (window.scrollY * 0.07).toFixed(1) + "px");
        }
    }

    function onScroll() {
        if (scrollQueued) return;
        scrollQueued = true;
        window.requestAnimationFrame(function () {
            scrollQueued = false;
            updateScrollEffects();
        });
    }

    updateScrollEffects();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    function closeNav() {
        if (!mobileNav || !navToggle) return;
        mobileNav.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        doc.body.classList.remove("nav-open");
    }

    if (navToggle && mobileNav) {
        navToggle.addEventListener("click", function () {
            const open = mobileNav.classList.toggle("open");
            navToggle.classList.toggle("open", open);
            navToggle.setAttribute("aria-expanded", String(open));
            doc.body.classList.toggle("nav-open", open);
            blip(open ? 620 : 420, 0.04);
        });

        mobileNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeNav);
        });

        doc.addEventListener("keydown", function (event) {
            if (event.key === "Escape") closeNav();
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 900) closeNav();
        });
    }

    const navLinks = Array.prototype.slice.call(doc.querySelectorAll(".nav-link[data-section]"));
    if (navLinks.length && "IntersectionObserver" in window) {
        const sections = navLinks
            .map(function (link) {
                return doc.getElementById(link.dataset.section);
            })
            .filter(Boolean);

        if (sections.length) {
            const spy = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) return;
                        navLinks.forEach(function (link) {
                            link.classList.toggle("active", link.dataset.section === entry.target.id);
                        });
                    });
                },
                { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
            );
            sections.forEach(function (section) {
                spy.observe(section);
            });
        }
    }

    /* ---------- Motion details ---------- */

    const staggerGroups = [
        ".inv-items",
        ".about-tags",
        ".fact-list",
        ".char-tags",
        ".quest-tags",
        ".contact-list",
        ".socials",
        ".mini-stats",
    ];

    staggerGroups.forEach(function (selector) {
        doc.querySelectorAll(selector).forEach(function (group) {
            Array.prototype.forEach.call(group.children, function (child, index) {
                child.style.setProperty("--i", String(index));
            });
        });
    });

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (finePointer && !reduce) {
        doc.querySelectorAll(".btn").forEach(function (btn) {
            let frame = null;

            btn.addEventListener("pointermove", function (event) {
                if (frame) return;
                const cx = event.clientX;
                const cy = event.clientY;

                frame = window.requestAnimationFrame(function () {
                    frame = null;
                    const rect = btn.getBoundingClientRect();
                    const max = 6;
                    const x = cx - rect.left - rect.width / 2;
                    const y = cy - rect.top - rect.height / 2;
                    const tx = Math.max(-max, Math.min(max, (x / (rect.width / 2)) * max));
                    const ty = Math.max(-max, Math.min(max, (y / (rect.height / 2)) * max));
                    btn.style.translate = tx.toFixed(1) + "px " + ty.toFixed(1) + "px";
                });
            });

            btn.addEventListener("pointerleave", function () {
                if (frame) {
                    window.cancelAnimationFrame(frame);
                    frame = null;
                }
                btn.style.translate = "0px 0px";
            });
        });
    }

    const burstColors = ["#2f6bff", "#ffd43b", "#2fd3a0", "#ff6b6b", "#0a1b3d"];

    function spawnBurst(x, y) {
        const burst = doc.createElement("span");
        burst.className = "pixel-burst";
        burst.style.left = x + "px";
        burst.style.top = y + "px";

        for (let i = 0; i < 10; i += 1) {
            const bit = doc.createElement("i");
            const angle = (Math.PI * 2 * i) / 10 + (i % 2 ? 0.28 : 0);
            const distance = 26 + (i % 4) * 9;
            bit.style.setProperty("--bx", Math.round(Math.cos(angle) * distance) + "px");
            bit.style.setProperty("--by", Math.round(Math.sin(angle) * distance) + "px");
            bit.style.setProperty("--c", burstColors[i % burstColors.length]);
            bit.style.animationDelay = (i % 3) * 0.02 + "s";
            burst.appendChild(bit);
        }

        doc.body.appendChild(burst);
        window.setTimeout(function () {
            if (burst.parentNode) burst.parentNode.removeChild(burst);
        }, 650);
    }

    if (!reduce) {
        doc.addEventListener("click", function (event) {
            if (event.target.closest("input, textarea, select")) return;
            spawnBurst(event.clientX, event.clientY);
        });
    }

    /* ---------- Counters ---------- */

    function animateCounters(scope) {
        scope.querySelectorAll("[data-count]").forEach(function (el) {
            if (el.dataset.done) return;
            el.dataset.done = "1";
            const target = parseInt(el.dataset.count, 10) || 0;
            if (reduce) {
                el.textContent = String(target);
                return;
            }
            let current = 0;
            const step = Math.max(1, Math.round(target / 22));
            const timer = window.setInterval(function () {
                current += step;
                if (current >= target) {
                    current = target;
                    window.clearInterval(timer);
                }
                el.textContent = String(current);
            }, 36);
        });
    }

    /* ---------- Highlight decode ---------- */

    const decodeChars = "abcdefghijklmnopqrstuvwxyz#%&*";

    function scrambleHighlight(scope) {
        if (reduce) return;

        scope.querySelectorAll(".section-title .hl").forEach(function (el) {
            if (el.dataset.decoded) return;
            el.dataset.decoded = "1";

            const original = el.textContent;
            const total = 15;
            let tick = 0;
            el.classList.add("decoding");

            const timer = window.setInterval(function () {
                tick += 1;
                const resolved = Math.floor((tick / total) * original.length);
                let output = "";

                for (let i = 0; i < original.length; i += 1) {
                    const char = original.charAt(i);
                    if (i < resolved || char === " ") {
                        output += char;
                    } else {
                        output += decodeChars.charAt(Math.floor(Math.random() * decodeChars.length));
                    }
                }

                el.textContent = output;

                if (tick >= total) {
                    window.clearInterval(timer);
                    el.textContent = original;
                    el.classList.remove("decoding");
                }
            }, 34);
        });
    }

    /* ---------- Reveal on scroll ---------- */

    let revealsStarted = false;

    function startReveals() {
        if (revealsStarted) return;
        revealsStarted = true;

        const items = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));

        if (!("IntersectionObserver" in window) || reduce) {
            items.forEach(function (el) {
                el.classList.add("in");
                scrambleHighlight(el);
            });
            doc.querySelectorAll(".hero-stats").forEach(animateCounters);
            return;
        }

        const io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("in");
                    scrambleHighlight(entry.target);
                    if (entry.target.matches(".hero-stats")) animateCounters(entry.target);
                    io.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
        );

        items.forEach(function (el) {
            io.observe(el);
        });

        let ticking = false;

        function revealPassed() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                ticking = false;
                const viewport = window.innerHeight;
                doc.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
                    if (el.getBoundingClientRect().top < viewport * 0.92) {
                        el.classList.add("in");
                        scrambleHighlight(el);
                        if (el.matches(".hero-stats")) animateCounters(el);
                    }
                });
            });
        }

        window.addEventListener("scroll", revealPassed, { passive: true });
        window.addEventListener("resize", revealPassed, { passive: true });
    }

    /* ---------- Typewriter ---------- */

    let typed = false;

    function typeRole() {
        const el = doc.getElementById("typeRole");
        if (!el || typed) return;
        typed = true;

        const text = "AI ENGINEER // FULLSTACK DEVELOPER";
        if (reduce) {
            el.textContent = text;
            return;
        }

        el.textContent = "";
        let index = 0;
        window.setTimeout(function () {
            const timer = window.setInterval(function () {
                index += 1;
                el.textContent = text.slice(0, index);
                if (index % 3 === 0) blip(760, 0.012, "square", 0.008);
                if (index >= text.length) window.clearInterval(timer);
            }, 42);
        }, 220);
    }

    /* ---------- Boot screen ---------- */

    const boot = doc.getElementById("boot");
    const bootBar = doc.getElementById("bootBar");
    const bootText = doc.getElementById("bootText");
    const bootStart = doc.getElementById("bootStart");

    let bootDone = false;
    let bootedBefore = false;
    let forceBoot = false;
    try {
        bootedBefore = sessionStorage.getItem("dody_booted") === "1";
        forceBoot = new URLSearchParams(window.location.search).get("boot") === "1";
    } catch (error) {
        bootedBefore = false;
    }

    function dismissBoot() {
        if (bootDone) return;
        bootDone = true;

        if (boot) {
            boot.classList.add("done");
            window.setTimeout(function () {
                if (boot.parentNode) boot.parentNode.removeChild(boot);
            }, 380);
        }

        try {
            sessionStorage.setItem("dody_booted", "1");
        } catch (error) {
            /* ignore */
        }

        startReveals();
        typeRole();
        blip(520, 0.08);
        window.setTimeout(function () {
            blip(780, 0.09);
        }, 90);
    }

    function initBoot() {
        if (!boot || reduce || (bootedBefore && !forceBoot)) {
            if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
            startReveals();
            typeRole();
            return;
        }

        window.setTimeout(function () {
            if (bootBar) bootBar.style.width = "100%";
        }, 140);

        window.setTimeout(function () {
            if (bootText) bootText.textContent = "SYSTEM READY";
            boot.classList.add("ready");
        }, 1080);

        if (bootStart) bootStart.addEventListener("click", dismissBoot);

        doc.addEventListener("keydown", function (event) {
            if (bootDone) return;
            if (event.key === "Enter" || event.key === " " || event.key.length === 1) {
                event.preventDefault();
                dismissBoot();
            }
        });
    }

    initBoot();

    /* ---------- Contact form ---------- */

    if (year) year.textContent = String(new Date().getFullYear());

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = form.elements.name.value.trim();
            const email = form.elements.email.value.trim();
            const subject = "Lets unlock your true potential";
            const body = [
                "Hello Dody,",
                "",
                "I'd love to connect with you and explore potential opportunities for collaboration, projects, or professional discussions.",
                "",
                "Looking forward to getting in touch!",
                "",
                "Best regards,",
                name,
                email
            ].join("\r\n");
            const gmailUrl =
                "https://mail.google.com/mail/?view=cm&fs=1&to=" +
                encodeURIComponent("dodysaputraa03@gmail.com") +
                "&su=" +
                encodeURIComponent(subject) +
                "&body=" +
                encodeURIComponent(body);

            if (formNote) {
                formNote.textContent = "Opening Gmail with your message ready to send...";
            }

            blip(660, 0.06);
            window.setTimeout(function () {
                blip(990, 0.08);
            }, 80);

            window.location.href = gmailUrl;
        });
    }
})();
