document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const counter = document.getElementById('counter');
    const progressLine = document.getElementById('progress-line');
    const preloader = document.getElementById('preloader');
    const preloaderEmoji = document.getElementById('preloader-emoji');
    const heroContent = document.querySelector('.hero-content');

    const foods = ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🧇', '🥞', '🧈', '🍞', '🥐', '🥨', '🥯', '🥖', '🧀', '🥗', '🥙', '🥪', '🌮', '🌯', '🥫', '🍖', '🍗', '🥩', '🍠', '🥟', '🥠', '🥡', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🦪', '🍣', '🍤', '🍥', '🥮', '🍢', '🧆', '🥘', '🍲', '🍝', '🥣', '🥧', '🍦', '🍧', '🍨', '🍩', '🍹', '🍷', '🥂'];
    let lastEmojiUpdate = 0;
    let count = 0;
    
    lenis.stop();
    window.scrollTo(0, 0);
    
    function updateLoader() {
        let increment = (101 - count) * Math.random() * 0.12 + 0.3;
        count += increment;
        
        if(count > 100) count = 100;
        
        counter.innerText = Math.floor(count) + "%";
        if(progressLine) progressLine.style.width = count + "%";

        const now = Date.now();
        if(now - lastEmojiUpdate > 200 && preloaderEmoji) {
            preloaderEmoji.innerText = foods[Math.floor(Math.random() * foods.length)];
            lastEmojiUpdate = now;
        }

        if(count < 100) {
            requestAnimationFrame(updateLoader);
        } else {
            counter.innerText = "100%";
            
            gsap.to(preloader, {
                opacity: 0,
                duration: 1,
                delay: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    preloader.style.display = 'none';
                    lenis.start();
                    gsap.to(".hero-content", {
                        opacity: 1,
                        y: 0,
                        duration: 1.5,
                        ease: "power4.out"
                    });
                }
            });
        }
    }
    
    requestAnimationFrame(updateLoader);

    gsap.from("#vibe h2, #vibe p", {
        scrollTrigger: {
            trigger: "#vibe",
            start: "top 80%",
        },
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    });

    gsap.from(".review-card", {
        scrollTrigger: {
            trigger: "#echoes",
            start: "top 70%",
        },
        opacity: 0,
        y: 60,
        duration: 1,
        stagger: 0.15,
        ease: "back.out(1.7)"
    });

    const filterBtns = document.querySelectorAll('.review-filter');
    const reviewCards = document.querySelectorAll('.review-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            filterBtns.forEach(b => b.classList.remove('active', 'bg-[#E0115F]'));
            btn.classList.add('active', 'bg-[#E0115F]');

            gsap.to(reviewCards, {
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                onComplete: () => {
                    reviewCards.forEach(card => {
                        const category = card.dataset.category;
                        if(filter === 'all' || category === filter) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    });

                    gsap.to(reviewCards, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        stagger: 0.1,
                        ease: "power2.out"
                    });
                }
            });
        });
    });

    const stars = document.querySelectorAll('#star-rating i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = star.dataset.value;
            stars.forEach((s, idx) => {
                if(idx < val) {
                    s.classList.add('text-[#E0115F]');
                    s.classList.remove('text-white/10');
                } else {
                    s.classList.remove('text-[#E0115F]');
                    s.classList.add('text-white/10');
                }
            });
        });
    });

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) navbar.classList.add('nav-scrolled');
        else navbar.classList.remove('nav-scrolled');
    });

    const menuScroll = document.getElementById('menu-scroll');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');
    if(menuScroll && scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => menuScroll.scrollBy({ left: -400, behavior: 'smooth' }));
        scrollRightBtn.addEventListener('click', () => menuScroll.scrollBy({ left: 400, behavior: 'smooth' }));
    }

    const loginModal = document.getElementById('login-modal');
    const openLoginBtn = document.getElementById('open-login');
    const closeLoginBtn = document.getElementById('close-login');
    const closeLoginBg = document.getElementById('close-login-bg');
    const loginBox = document.getElementById('login-box');

    function openLogin(e) {
        if(e) e.preventDefault();
        loginModal.classList.remove('opacity-0', 'pointer-events-none');
        loginBox.classList.remove('translate-y-10');
        loginBox.classList.add('translate-y-0', 'scale-100');
        lenis.stop();
    }

    function closeLogin(e) {
        if(e) e.preventDefault();
        loginModal.classList.add('opacity-0', 'pointer-events-none');
        loginBox.classList.remove('translate-y-0', 'scale-100');
        loginBox.classList.add('translate-y-10');
        lenis.start();
    }

    if(openLoginBtn) openLoginBtn.addEventListener('click', openLogin);
    if(closeLoginBtn) closeLoginBtn.addEventListener('click', closeLogin);
    if(closeLoginBg) closeLoginBg.addEventListener('click', closeLogin);

    const foodsList = ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🧇', '🥞', '🧈', '🍞', '🥐', '🥨', '🥯', '🥖', '🧀', '🥗', '🥙', '🥪', '🌮', '🌯', '🥫', '🍖', '🍗', '🥩', '🍠', '🥟', '🥠', '🥡', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🦪', '🍣', '🍤', '🍥', '🥮', '🍢', '🧆', '🥘', '🍲', '🍝', '🥣', '🥧', '🍦', '🍧', '🍨', '🍩', '🍹', '🍷', '🥂'];
    const cursorOutline = document.createElement('div');
    cursorOutline.classList.add('custom-cursor');
    document.body.appendChild(cursorOutline);

    let lastFoodTime = 0;
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        gsap.to(cursorOutline, {
            left: posX,
            top: posY,
            duration: 0.15,
            ease: "power2.out"
        });

        const now = Date.now();
        if(now - lastFoodTime > 100) {
            lastFoodTime = now;
            const food = document.createElement('div');
            food.classList.add('food-trail');
            food.innerText = foodsList[Math.floor(Math.random() * foodsList.length)];
            food.style.left = `${posX}px`;
            food.style.top = `${posY}px`;
            document.body.appendChild(food);
            setTimeout(() => food.remove(), 1000);
        }
    });

});