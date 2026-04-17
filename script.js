/* ================================================
   ROMANTIC BIRTHDAY WEBSITE — Script
   ================================================ */
(function () {
    'use strict';

    // ——— CONFIG ———
    const PASSWORD = 'bangaram';

    // ——— DOM REFS ———
    const passwordInput  = document.getElementById('password-input');
    const unlockBtn      = document.getElementById('unlock-btn');
    const errorMsg       = document.getElementById('error-msg');
    const successMsg     = document.getElementById('success-msg');
    const lockIcon       = document.getElementById('lock-icon');
    const agreeBtn       = document.getElementById('agree-btn');
    const agreeResponse  = document.getElementById('agree-response');
    const flirtyNextBtn  = document.getElementById('flirty-next-btn');
    const revealBtn      = document.getElementById('reveal-btn');
    const hiddenMessage  = document.getElementById('hidden-message');
    const hiddenNextBtn  = document.getElementById('hidden-next-btn');
    const musicToggle    = document.getElementById('music-toggle');
    const heartsCanvas   = document.getElementById('hearts-canvas');
    const ctx            = heartsCanvas.getContext('2d');

    let currentScreen  = 'lock-screen';
    let isMusicPlaying = false;

    // ===================================================
    //  SECTION NAVIGATION
    // ===================================================
    function showScreen(targetId) {
        const current = document.getElementById(currentScreen);
        const target  = document.getElementById(targetId);
        if (!target || targetId === currentScreen) return;

        // Fade out current
        current.classList.remove('active');

        // After fade out, fade in next
        setTimeout(() => {
            target.classList.add('active');
            currentScreen = targetId;
            onScreenEnter(target);
        }, 700);
    }

    /** Trigger per-screen entrance animations */
    function onScreenEnter(screen) {
        if (screen.id === 'opening-screen') {
            const lines = screen.querySelectorAll('.opening-line');
            lines.forEach((line, i) => {
                setTimeout(() => line.classList.add('visible'), 350 + i * 500);
            });
        }
    }

    // Wire up every .next-btn
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.next;
            if (targetId) showScreen(targetId);
        });
    });

    // Wire up every .quit-btn
    document.querySelectorAll('.quit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const response = btn.nextElementSibling;
            if (response && response.classList.contains('quit-response')) {
                response.classList.add('show');
            }
            btn.style.opacity = '0.35';
            btn.style.pointerEvents = 'none';
        });
    });

    // ===================================================
    //  LOCK SCREEN
    // ===================================================
    function handleUnlock() {
        const val = passwordInput.value.trim().toLowerCase();
        errorMsg.classList.remove('show');
        successMsg.classList.remove('show');

        if (!val) { passwordInput.focus(); return; }

        if (val === PASSWORD) {
            // Success
            lockIcon.textContent = '🔓';
            successMsg.textContent = 'I knew you would get it. 😌';
            successMsg.classList.add('show');
            errorMsg.classList.remove('show');
            passwordInput.disabled = true;
            unlockBtn.disabled = true;

            setTimeout(() => showScreen('opening-screen'), 2200);
        } else {
            // Wrong password
            errorMsg.textContent = "Hmm… that's not it. You're supposed to know this 😏";
            errorMsg.classList.add('show');

            // Shake the input
            passwordInput.style.animation = 'none';
            void passwordInput.offsetHeight;          // reflow
            passwordInput.style.animation = 'shake 0.5s ease';
            setTimeout(() => { passwordInput.style.animation = ''; }, 550);
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    unlockBtn.addEventListener('click', handleUnlock);
    passwordInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleUnlock();
    });

    // ===================================================
    //  FLIRTY SECTION — "Do you agree?" interaction
    // ===================================================
    agreeBtn.addEventListener('click', () => {
        agreeResponse.classList.add('show');
        agreeBtn.style.opacity = '0.45';
        agreeBtn.style.pointerEvents = 'none';

        setTimeout(() => {
            flirtyNextBtn.classList.add('show');
        }, 900);
    });

    // ===================================================
    //  HIDDEN MESSAGE — Reveal interaction
    // ===================================================
    revealBtn.addEventListener('click', () => {
        hiddenMessage.classList.add('show');
        revealBtn.classList.add('clicked');

        setTimeout(() => {
            hiddenNextBtn.classList.add('show');
        }, 1100);
    });

    // ===================================================
    //  MUSIC PLAYER (YouTube IFrame API)
    // ===================================================
    const YOUTUBE_VIDEO_ID = 'Gy0kSws4JQs';
    let ytPlayer = null;
    let ytReady  = false;

    // Load YouTube IFrame API
    const ytScript  = document.createElement('script');
    ytScript.src    = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(ytScript);

    // Called automatically by YouTube API when ready
    window.onYouTubeIframeAPIReady = function () {
        ytPlayer = new YT.Player('yt-player', {
            videoId: YOUTUBE_VIDEO_ID,
            playerVars: {
                autoplay: 0,
                loop: 1,
                playlist: YOUTUBE_VIDEO_ID,   // required for loop
            },
            events: {
                onReady: function () { ytReady = true; },
            },
        });
    };

    musicToggle.addEventListener('click', () => {
        if (!ytReady) return;

        if (isMusicPlaying) {
            ytPlayer.pauseVideo();
            musicToggle.classList.remove('playing');
        } else {
            ytPlayer.playVideo();
            musicToggle.classList.add('playing');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // ===================================================
    //  FLOATING HEARTS  (Canvas)
    // ===================================================
    const hearts = [];
    const HEART_COLORS = [
        'rgba(240, 161, 180, ##)',   // pink
        'rgba(196, 167, 215, ##)',   // lavender
        'rgba(232, 133, 154, ##)',   // rose
        'rgba(252, 213, 223, ##)',   // light pink
        'rgba(232, 213, 240, ##)',   // light lavender
    ];

    function resizeCanvas() {
        heartsCanvas.width  = window.innerWidth;
        heartsCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    /** Spawn a heart object */
    function spawnHeart() {
        return {
            x:      Math.random() * heartsCanvas.width,
            y:      heartsCanvas.height + 20,
            size:   Math.random() * 10 + 7,
            vy:     Math.random() * 0.55 + 0.18,
            vx:     (Math.random() - 0.5) * 0.28,
            alpha:  Math.random() * 0.25 + 0.08,
            color:  HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
            wobble: Math.random() * Math.PI * 2,
            wSpeed: Math.random() * 0.018 + 0.005,
        };
    }

    /** Draw a tiny heart shape */
    function drawHeart(x, y, s, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = color;
        ctx.beginPath();
        const t = s * 0.3;
        ctx.moveTo(0, t);
        ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, t);
        ctx.bezierCurveTo(-s / 2, (s + t) / 2, 0, (s + t) / 1.5, 0, s);
        ctx.bezierCurveTo(0, (s + t) / 1.5, s / 2, (s + t) / 2, s / 2, t);
        ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, t);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /** Main render loop */
    function animateHearts() {
        ctx.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);

        // Spawn occasionally
        if (hearts.length < 18 && Math.random() < 0.022) {
            hearts.push(spawnHeart());
        }

        for (let i = hearts.length - 1; i >= 0; i--) {
            const h = hearts[i];
            h.wobble += h.wSpeed;
            h.x += h.vx + Math.sin(h.wobble) * 0.28;
            h.y -= h.vy;

            // Fade near top
            let a = h.alpha;
            if (h.y < heartsCanvas.height * 0.18) {
                a *= h.y / (heartsCanvas.height * 0.18);
            }

            if (h.y < -30 || a < 0.005) {
                hearts.splice(i, 1);
                continue;
            }

            const c = h.color.replace('##', a.toFixed(3));
            drawHeart(h.x, h.y, h.size, c);
        }

        requestAnimationFrame(animateHearts);
    }
    animateHearts();

    // ===================================================
    //  FOCUS PASSWORD INPUT ON LOAD
    // ===================================================
    setTimeout(() => passwordInput.focus(), 600);

})();
