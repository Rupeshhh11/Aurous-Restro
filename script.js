document.addEventListener('DOMContentLoaded', () => {


    const counter = document.getElementById('counter');
    const progressLine = document.getElementById('progress-line');
    const preloader = document.getElementById('preloader');
    const heroContent = document.querySelector('.hero-content');
    const chars = document.querySelectorAll('.preloader-char');

    let count = 0;

    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    // Initial stagger for letters
    chars.forEach((char, index) => {
        setTimeout(() => {
            char.classList.remove('translate-y-full');
        }, index * 100 + 100);
    });

    let startTime = null;

    function updateLoader(timestamp) {
        if (!startTime) startTime = timestamp;

        // Simulating load time (approx 2s)
        const progress = Math.min((timestamp - startTime) / 2000, 1);

        // Smooth easing out
        const easeOutProgress = Math.min(progress * (2 - progress), 1);

        count = easeOutProgress * 100;

        counter.innerText = Math.floor(count) + "%";
        if (progressLine) {
            progressLine.style.width = count + "%";
        }

        if (count < 100) {
            requestAnimationFrame(updateLoader);
        } else {
            counter.innerText = "100%";

            setTimeout(() => {
                // The Merge / Transition
                preloader.classList.add('slide-up');

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

                // Smoothly fade and slide up the hero h1/button simultaneously
                if (heroContent) {
                    heroContent.classList.remove('opacity-0', 'translate-y-16');
                }

                setTimeout(() => {
                    document.body.style.overflow = '';
                }, 1200);

            }, 300); // slight pause at 100%
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
        }, { duration: 150, fill: "forwards" });

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

});