document.addEventListener('DOMContentLoaded', () => {


    const counter = document.getElementById('counter');
    const progressLine = document.getElementById('progress-line');
    const preloader = document.getElementById('preloader');
    const heroContent = document.querySelector('.hero-content');
    const chars = document.querySelectorAll('.preloader-char');

    let count = 0;

    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const canvas = document.getElementById('snow-canvas');
    let ctx, snowParticles = [], snowActive = false;
    if (canvas) {
        ctx = canvas.getContext('2d');
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        snowActive = true;

        for (let i = 0; i < 150; i++) {
            snowParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 0.5,
                speedY: Math.random() * 1 + 0.5,
                speedX: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        function drawSnow() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            snowParticles.forEach(p => {
                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                if (snowActive) {
                    p.y += p.speedY;
                    p.x += p.speedX;
                    if (p.y > canvas.height) p.y = 0;
                    if (p.x > canvas.width) p.x = 0;
                    if (p.x < 0) p.x = canvas.width;
                }
            });
            if (snowActive) {
                requestAnimationFrame(drawSnow);
            }
        }
        drawSnow();

        window.addEventListener('resize', () => {
            if (snowActive) resizeCanvas();
        });
    }

    chars.forEach((char, index) => {
        setTimeout(() => {
            char.classList.remove('translate-y-full');
        }, index * 100 + 100);
    });

    let startTime = null;

    function updateLoader(timestamp) {
        if (!startTime) startTime = timestamp;

        const progress = Math.min((timestamp - startTime) / 2000, 1);

        const easeOutProgress = Math.min(progress * (2 - progress), 1);

        count = easeOutProgress * 100;

        counter.innerText = Math.floor(count) + "%";
        if (progressLine) {
            progressLine.style.width = count + "%";
        }

        if (count < 100) {
            requestAnimationFrame(updateLoader);
        } else {
            if (counter) counter.innerText = "100%";

            setTimeout(() => {
                preloader.classList.add('slide-up');

                if (canvas) {
                    canvas.classList.replace('opacity-100', 'opacity-0');
                    setTimeout(() => snowActive = false, 1000);
                }
                const treeLeft = document.getElementById('tree-left');
                const treeRight = document.getElementById('tree-right');
                if (treeLeft) treeLeft.style.transform = 'translateX(-100%) scale(0.8)';
                if (treeLeft) treeLeft.classList.replace('opacity-100', 'opacity-0');
                if (treeRight) treeRight.style.transform = 'translateX(100%) scale(0.8)';
                if (treeRight) treeRight.classList.replace('opacity-100', 'opacity-0');

                const heroBg = document.getElementById('hero-bg-wrapper');
                if (heroBg) {
                    heroBg.classList.replace('scale-100', 'scale-110');
                }

                const nav = document.getElementById('navbar');
                if (nav) {
                    setTimeout(() => {
                        nav.classList.remove('opacity-0', '-translate-y-full');
                    }, 400);
                }

                if (heroContent) {
                    heroContent.classList.remove('opacity-0', 'translate-y-16');
                }

                setTimeout(() => {
                    document.body.style.overflow = '';
                }, 1200);

            }, 300);
        }
    }

    requestAnimationFrame(updateLoader);


    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
    });

    const menuScroll = document.getElementById('menu-scroll');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');

    if (menuScroll && scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            menuScroll.scrollBy({ left: -400, behavior: 'smooth' });
        });
        scrollRightBtn.addEventListener('click', () => {
            menuScroll.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }

    const loginModal = document.getElementById('login-modal');
    const openLoginBtn = document.getElementById('open-login');
    const closeLoginBtn = document.getElementById('close-login');
    const closeLoginBg = document.getElementById('close-login-bg');
    const loginBox = document.getElementById('login-box');

    function openLogin(e) {
        if (e) e.preventDefault();
        loginModal.classList.remove('opacity-0', 'pointer-events-none');
        loginBox.classList.remove('translate-y-10');
        loginBox.classList.add('translate-y-0', 'scale-100');
        document.body.style.overflow = 'hidden';
    }

    function closeLogin(e) {
        if (e) e.preventDefault();
        loginModal.classList.add('opacity-0', 'pointer-events-none');
        loginBox.classList.remove('translate-y-0', 'scale-100');
        loginBox.classList.add('translate-y-10');
        document.body.style.overflow = '';
    }

    if (openLoginBtn) openLoginBtn.addEventListener('click', openLogin);
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLogin);
    if (closeLoginBg) closeLoginBg.addEventListener('click', closeLogin);

    const cursorDot = document.createElement('div');
    cursorDot.classList.add('custom-cursor-dot');
    document.body.appendChild(cursorDot);

    const cursorOutline = document.createElement('div');
    cursorOutline.classList.add('custom-cursor');
    document.body.appendChild(cursorOutline);

    const foods = ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🧇', '🥞', '🧈', '🍞', '🥐', '🥨', '🥯', '🥖', '🧀', '🥗', '🥙', '🥪', '🌮', '🌯', '🥫', '🍖', '🍗', '🥩', '🍠', '🥟', '🥠', '🥡', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🦪', '🍣', '🍤', '🍥', '🥮', '🍢', '🧆', '🥘', '🍲', '🍝', '🥣', '🥧', '🍦', '🍧', '🍨', '🍩', '🍹', '🍷', '🥂'];

    let lastFoodTime = 0;

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });

        const now = Date.now();
        if (now - lastFoodTime > 100) {
            lastFoodTime = now;
            const food = document.createElement('div');
            food.classList.add('food-trail');
            food.innerText = foods[Math.floor(Math.random() * foods.length)];
            food.style.left = `${posX}px`;
            food.style.top = `${posY}px`;
            document.body.appendChild(food);

            setTimeout(() => {
                food.remove();
            }, 1000);
        }
    });

    const hoverElements = document.querySelectorAll('a, button, input');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorOutline.style.backgroundColor = 'rgba(224, 17, 95, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.backgroundColor = 'transparent';
        });
    });

    const bgMusic = document.getElementById('bg-music');
    const playStatus = document.getElementById('playStatus');
    const playerSpinDisc = document.getElementById('player-spin-disc');
    let isMusicPlaying = false;
    let fadeInterval = null;

    if (bgMusic && playStatus) {
        bgMusic.volume = 0;

        function fadeAudioIn(duration) {
            clearInterval(fadeInterval);
            const step = 0.05;
            const interval = duration / (1 / step);
            fadeInterval = setInterval(() => {
                if (bgMusic.volume < 0.6) {
                    bgMusic.volume = Math.min(bgMusic.volume + step, 0.6);
                } else {
                    clearInterval(fadeInterval);
                }
            }, interval);
        }

        function fadeAudioOut(duration, callback) {
            clearInterval(fadeInterval);
            const step = 0.05;
            const interval = duration / (bgMusic.volume / step);
            fadeInterval = setInterval(() => {
                if (bgMusic.volume > step) {
                    bgMusic.volume = Math.max(bgMusic.volume - step, 0);
                } else {
                    bgMusic.volume = 0;
                    clearInterval(fadeInterval);
                    if (callback) callback();
                }
            }, interval);
        }

        playStatus.addEventListener('change', (e) => {
            if (e.target.checked) {
                bgMusic.play().then(() => {
                    fadeAudioIn(800);
                    isMusicPlaying = true;
                    if (playerSpinDisc) playerSpinDisc.classList.add('animate-[spin_3s_linear_infinite]');
                }).catch(() => {
                    playStatus.checked = false;
                });
            } else {
                fadeAudioOut(600, () => {
                    bgMusic.pause();
                });
                isMusicPlaying = false;
                if (playerSpinDisc) playerSpinDisc.classList.remove('animate-[spin_3s_linear_infinite]');
            }
        });
    }

});