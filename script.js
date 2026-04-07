document.addEventListener('DOMContentLoaded', () => {
    
    // --- Modern Preloader Logic ---
    const counter = document.getElementById('counter');
    const progressLine = document.getElementById('progress-line');
    const preloader = document.getElementById('preloader');
    const heroContent = document.querySelector('.hero-content');

    let count = 0;
    
    // Disable scroll during load
    document.body.style.overflow = 'hidden';
    // Reset window to top
    window.scrollTo(0, 0);
    
    function updateLoader() {
        // Fast at start, eases at end
        let increment = (101 - count) * Math.random() * 0.15 + 0.5;
        count += increment;
        
        if(count > 100) count = 100;
        
        counter.innerText = Math.floor(count) + "%";
        if(progressLine) {
            progressLine.style.width = count + "%";
        }

        if(count < 100) {
            requestAnimationFrame(updateLoader);
        } else {
            counter.innerText = "100%";
            // Finish loading
            setTimeout(() => {
                preloader.classList.add('fade-out');
                
                // Allow scroll
                document.body.style.overflow = '';
                
                // Animate Hero in
                setTimeout(() => {
                    if(heroContent) {
                        heroContent.classList.remove('opacity-0', 'translate-y-8');
                    }
                }, 400);

            }, 500); // Hold at 100% briefly
        }
    }
    
    // Start loader
    requestAnimationFrame(updateLoader);


    // --- Navbar Scroll Logic ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
    });

    // --- Horizontal Scroll Logic ---
    const menuScroll = document.getElementById('menu-scroll');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');

    if(menuScroll && scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            menuScroll.scrollBy({ left: -400, behavior: 'smooth' });
        });
        scrollRightBtn.addEventListener('click', () => {
            menuScroll.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }

    // --- Login Modal Logic ---
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
        document.body.style.overflow = 'hidden'; 
    }

    function closeLogin(e) {
        if(e) e.preventDefault();
        loginModal.classList.add('opacity-0', 'pointer-events-none');
        loginBox.classList.remove('translate-y-0', 'scale-100');
        loginBox.classList.add('translate-y-10');
        document.body.style.overflow = '';
    }

    if(openLoginBtn) openLoginBtn.addEventListener('click', openLogin);
    if(closeLoginBtn) closeLoginBtn.addEventListener('click', closeLogin);
    if(closeLoginBg) closeLoginBg.addEventListener('click', closeLogin);

    // --- Custom Cursor & Food Trail Logic ---
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
        // Drop food every 100ms when moving
        if(now - lastFoodTime > 100) {
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

    // Hover effect for interactive elements
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