document.addEventListener('DOMContentLoaded', () => {


    const counter = document.getElementById('counter');
    const progressLine = document.getElementById('progress-line');
    const preloader = document.getElementById('preloader');
    const heroContent = document.querySelector('.hero-content');
    const chars = document.querySelectorAll('.preloader-char');

    let count = 0;

    if (preloader) {
        document.body.style.overflow = 'hidden';
    }
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
                if (preloader) preloader.classList.add('slide-up');

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
                    heroBg.classList.replace('scale-100', 'scale-105');
                }

                const nav = document.getElementById('navbar');
                if (nav) {
                    setTimeout(() => {
                        nav.classList.remove('opacity-0', '-translate-y-full');
                    }, 400);
                }

                const mobileNav = document.getElementById('mobile-nav');
                if (mobileNav) {
                    setTimeout(() => {
                        mobileNav.classList.remove('translate-y-full');
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

    // Admin Login Logic for Main Page
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const btn = document.getElementById('login-btn');
            const loader = document.getElementById('login-loader');
            const error = document.getElementById('login-error');

            btn.disabled = true;
            loader.classList.remove('hidden');
            error.classList.add('hidden');

            try {
                const formData = new URLSearchParams();
                formData.append('username', username);
                formData.append('password', password);

                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('aurous_token', data.access_token);
                    window.location.href = '/dashboard';
                } else {
                    error.classList.remove('hidden');
                }
            } catch (err) {
                console.error('Login error:', err);
                error.textContent = 'Connection error';
                error.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                loader.classList.add('hidden');
            }
        });
    }

    const foods = ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🧇', '🥞', '🧈', '🍞', '🥐', '🥨', '🥯', '🥖', '🧀', '🥗', '🥙', '🥪', '🌮', '🌯', '🥫', '🍖', '🍗', '🥩', '🍠', '🥟', '🥠', '🥡', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🦪', '🍣', '🍤', '🍥', '🥮', '🍢', '🧆', '🥘', '🍲', '🍝', '🥣', '🥧', '🍦', '🍧', '🍨', '🍩', '🍹', '🍷', '🥂'];

    let lastFoodTime = 0;

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

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

    const bgMusic = document.getElementById('bg-music');
    const playStatus = document.getElementById('playStatus');
    const playerSpinDisc = document.getElementById('player-spin-disc');
    let isMusicPlaying = false;
    let fadeInterval = null;

    if (bgMusic && playStatus) {
        bgMusic.volume = 0.6;

        const playToggleLabel = playStatus.closest('label');
        const musicPlayerWidget = document.querySelector('.group\\/he');
        
        if (musicPlayerWidget) {
            musicPlayerWidget.addEventListener('mouseenter', () => {
                if (!isMusicPlaying) {
                    playStatus.checked = true;
                    bgMusic.volume = 0.6;
                    bgMusic.play().then(() => {
                        isMusicPlaying = true;
                        if (playerSpinDisc) playerSpinDisc.classList.add('animate-[spin_3s_linear_infinite]');
                    }).catch((err) => {
                        console.warn("Autoplay prevented:", err);
                        playStatus.checked = false;
                    });
                } else {
                    bgMusic.pause();
                    isMusicPlaying = false;
                    playStatus.checked = false;
                    if (playerSpinDisc) playerSpinDisc.classList.remove('animate-[spin_3s_linear_infinite]');
                }
            });
        }

        playToggleLabel.addEventListener('click', (e) => {
            e.preventDefault();
            playStatus.checked = !playStatus.checked;

            if (playStatus.checked) {
                bgMusic.volume = 0.6;
                bgMusic.play().then(() => {
                    isMusicPlaying = true;
                    if (playerSpinDisc) playerSpinDisc.classList.add('animate-[spin_3s_linear_infinite]');
                }).catch((err) => {
                    console.warn("Autoplay prevented:", err);
                    playStatus.checked = false;
                });
            } else {
                bgMusic.pause();
                isMusicPlaying = false;
                if (playerSpinDisc) playerSpinDisc.classList.remove('animate-[spin_3s_linear_infinite]');
            }
        });

        const musicCurrentTime = document.getElementById('music-current-time');
        const musicDuration = document.getElementById('music-duration');
        const musicProgress = document.getElementById('music-progress');

        function formatTime(seconds) {
            if (isNaN(seconds)) return '0:00';
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        bgMusic.addEventListener('loadedmetadata', () => {
            if (musicDuration) musicDuration.innerText = formatTime(bgMusic.duration);
            if (musicProgress) musicProgress.max = bgMusic.duration;
        });

        bgMusic.addEventListener('timeupdate', () => {
            if (musicCurrentTime) musicCurrentTime.innerText = formatTime(bgMusic.currentTime);
            if (musicProgress && !musicProgress.dataset.isDragging) {
                musicProgress.value = bgMusic.currentTime;
            }
        });

        if (musicProgress) {
            musicProgress.addEventListener('mousedown', () => musicProgress.dataset.isDragging = 'true');
            musicProgress.addEventListener('touchstart', () => musicProgress.dataset.isDragging = 'true');
            
            musicProgress.addEventListener('input', (e) => {
                if (musicCurrentTime) musicCurrentTime.innerText = formatTime(e.target.value);
            });
            
            musicProgress.addEventListener('change', (e) => {
                bgMusic.currentTime = e.target.value;
                musicProgress.dataset.isDragging = 'false';
            });
            musicProgress.addEventListener('mouseup', () => musicProgress.dataset.isDragging = 'false');
            musicProgress.addEventListener('touchend', () => musicProgress.dataset.isDragging = 'false');
        }
    }

    const reviewModal = document.getElementById('review-modal');
    const openReviewBtn = document.getElementById('open-review-modal');
    const closeReviewBtn = document.getElementById('close-review');
    const closeReviewBg = document.getElementById('close-review-bg');
    const reviewBox = document.getElementById('review-box');

    function openReview(e) {
        if (e) e.preventDefault();
        if(reviewModal && reviewBox) {
            reviewModal.classList.remove('opacity-0', 'pointer-events-none');
            reviewBox.classList.remove('translate-y-10');
            reviewBox.classList.add('translate-y-0', 'scale-100');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeReview(e) {
        if (e) e.preventDefault();
        if(reviewModal && reviewBox) {
            reviewModal.classList.add('opacity-0', 'pointer-events-none');
            reviewBox.classList.remove('translate-y-0', 'scale-100');
            reviewBox.classList.add('translate-y-10');
            document.body.style.overflow = '';
        }
    }

    if (openReviewBtn) openReviewBtn.addEventListener('click', openReview);
    if (closeReviewBtn) closeReviewBtn.addEventListener('click', closeReview);
    if (closeReviewBg) closeReviewBg.addEventListener('click', closeReview);

    const starInputs = document.querySelectorAll('#star-rating-input i');
    const ratingInput = document.getElementById('review-rating');

    if (starInputs.length > 0) {
        starInputs.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.getAttribute('data-value'));
                if(ratingInput) ratingInput.value = value;
                starInputs.forEach((s, idx) => {
                    if (idx < value) {
                        s.classList.add('text-[#E0115F]');
                        s.classList.remove('text-white/20');
                    } else {
                        s.classList.remove('text-[#E0115F]');
                        s.classList.add('text-white/20');
                    }
                });
            });
        });
        starInputs[4].click();
    }

    const defaultReviews = [
        {
            id: '1',
            name: 'Ritika Verma',
            tag: 'Local',
            rating: 5,
            title: 'A Culinary Masterpiece',
            text: 'The Roasted Chicken Chilli is perfectly balanced with flavors that dance on your palate. The presentation here is as stunning as the taste. Best Restro Lounge in Bistupur without a doubt.',
            image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=1000',
            avatar: '',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: '2',
            name: 'Aman Singh',
            tag: 'Food Enthusiast',
            rating: 4.5,
            title: 'The Premium Sizzler Experience',
            text: 'Their Chef\'s Special Sizzler is an absolute showstopper. Smoked perfectly with a rich aroma that takes over the room. The luxury interiors combined with top-notch food is an unbeatable combo.',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1000',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: '3',
            name: 'Neha Sharma',
            tag: 'Jamshedpur Resident',
            rating: 5,
            title: 'Vibrant Evenings & Mixology',
            text: 'One of the best evening spots in Jamshedpur! The signature cocktails are a must-try. The music, the crowd, the drinks—everything is curated for a truly premium experience.',
            image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    function getRelativeTime(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    }

    function getStarsHtml(rating) {
        let stars = '';
        for(let i=1; i<=5; i++) {
            if (i <= rating) {
                stars += '<i class="fa-solid fa-star"></i>';
            } else if (i - 0.5 === rating) {
                stars += '<i class="fa-solid fa-star-half-stroke"></i>';
            } else {
                stars += '<i class="fa-regular fa-star"></i>';
            }
        }
        return stars;
    }

    function getStoredReviews() {
        const stored = localStorage.getItem('aurous_reviews');
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    }

    function saveReview(review) {
        const reviews = getStoredReviews();
        reviews.unshift(review);
        localStorage.setItem('aurous_reviews', JSON.stringify(reviews));
    }

    window.deleteReview = function(id) {
        if (!confirm('Are you sure you want to delete this review?')) return;
        
        let stored = getStoredReviews();
        let initialLength = stored.length;
        stored = stored.filter(r => r.id !== id);
        
        if (stored.length !== initialLength) {
            localStorage.setItem('aurous_reviews', JSON.stringify(stored));
        } else {
            let deletedDefaults = JSON.parse(localStorage.getItem('deleted_default_reviews') || '[]');
            if (!deletedDefaults.includes(id)) {
                deletedDefaults.push(id);
                localStorage.setItem('deleted_default_reviews', JSON.stringify(deletedDefaults));
            }
        }
        
        if (document.getElementById('reviews-container')) {
            window.renderReviews('reviews-container', 3);
        }
        if (document.getElementById('all-reviews-container')) {
            window.renderReviews('all-reviews-container', null, window.currentReviewFilter || 0);
        }
    };

    window.renderReviews = function(containerId, limit = null, filterStars = 0) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let allReviews = [...(window.apiReviews || []), ...getStoredReviews(), ...defaultReviews];
        
        let deletedDefaults = JSON.parse(localStorage.getItem('deleted_default_reviews') || '[]');
        allReviews = allReviews.filter(r => !deletedDefaults.includes(r.id));
        allReviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (filterStars > 0) {
            allReviews = allReviews.filter(r => Math.floor(r.rating) === filterStars);
        }

        if (limit) {
            allReviews = allReviews.slice(0, limit);
        }

        container.innerHTML = '';

        if (allReviews.length === 0) {
            container.innerHTML = '<p class="text-white/50 text-center py-10">No reviews found matching this filter.</p>';
            return;
        }

        const isGrid = containerId === 'all-reviews-container';

        allReviews.forEach((review, index) => {
            const reviewImage = review.image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000';
            const avatarHtml = review.avatar 
                ? `<img src="${review.avatar}" alt="${review.name}" class="w-12 h-12 rounded-full object-cover border-2 border-[#E0115F]">`
                : `<div class="w-12 h-12 rounded-full bg-[#E0115F] flex items-center justify-center text-white font-bold text-lg border-2 border-[#E0115F] flex-shrink-0">${review.name.charAt(0)}</div>`;

            const canDelete = review.id.toString().startsWith('r_') || (typeof review.id === 'number');
            const deleteBtn = canDelete ? `
                <button onclick="deleteReview('${review.id}')" class="text-white/40 hover:text-[#E0115F] transition-colors" title="Delete Review"><i class="fa-solid fa-trash-can"></i></button>
            ` : '';

            const replyHtml = review.reply_text ? `
                <div class="mt-6 p-4 bg-[#E0115F]/5 border-l-2 border-[#E0115F] rounded-r-xl">
                    <p class="text-[10px] uppercase tracking-widest text-[#E0115F] font-bold mb-1">Owner's Response</p>
                    <p class="text-white/70 text-xs italic">"${review.reply_text}"</p>
                </div>
            ` : '';

            let html = '';

            if (isGrid) {
                html = `
                    <div class="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors group flex flex-col h-full relative overflow-hidden">
                        <div class="w-full h-48 rounded-2xl overflow-hidden mb-6 relative shrink-0">
                            <img src="${reviewImage}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Review Image">
                        </div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex gap-1 text-[#E0115F] text-sm">${getStarsHtml(review.rating)}</div>
                            <div class="flex items-center gap-3">
                                <span class="text-[10px] text-white/40 tracking-widest uppercase">${getRelativeTime(review.timestamp)}</span>
                                ${deleteBtn}
                            </div>
                        </div>
                        <h3 class="text-xl font-bold mb-3 tracking-tight">"${review.title}"</h3>
                        <p class="text-white/60 text-sm leading-relaxed font-light mb-4 flex-grow">"${review.text}"</p>
                        ${replyHtml}
                        <div class="flex items-center gap-4 mt-6">
                            ${avatarHtml}
                            <div class="flex flex-col">
                                <h4 class="font-bold text-sm tracking-wide uppercase">${review.name}</h4>
                                <span class="text-[10px] text-white/40 uppercase tracking-widest mt-1">${review.tag}</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                const isReverse = index % 2 !== 0;
                html = `
                    <div class="flex flex-col md:${isReverse ? 'flex-row-reverse' : 'flex-row'} items-center gap-10 md:gap-0 relative group">
                        <div class="w-full md:w-3/5 h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden relative shadow-2xl">
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-700 z-10 w-full h-full"></div>
                            <img src="${reviewImage}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Review Image">
                        </div>
                        <div class="w-[90%] mx-auto -mt-[220px] relative z-40 md:mt-0 md:w-[45%] md:absolute ${isReverse ? 'md:left-0' : 'md:right-0'} bg-black/70 md:bg-[#050505]/60 backdrop-blur-[15px] md:backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:-translate-y-8 md:group-hover:-translate-y-12 transition-all duration-700">
                            <div class="flex justify-between items-start mb-6">
                                <div class="flex gap-1 text-[#E0115F] text-lg">${getStarsHtml(review.rating)}</div>
                                <div class="flex items-center gap-4">
                                    <span class="text-xs text-white/40 tracking-widest uppercase">${getRelativeTime(review.timestamp)}</span>
                                    ${deleteBtn}
                                </div>
                            </div>
                            <h3 class="text-2xl font-bold mb-4 tracking-tight">"${review.title}"</h3>
                            <p class="text-white/60 text-base leading-relaxed font-light mb-4">"${review.text}"</p>
                            ${replyHtml}
                            <div class="flex items-center gap-4 mt-8">
                                ${avatarHtml}
                                <div class="flex flex-col">
                                    <h4 class="font-bold text-sm tracking-wide uppercase">${review.name}</h4>
                                    <span class="text-[10px] text-white/40 uppercase tracking-widest mt-1">${review.tag}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            container.innerHTML += html;
        });
    };

    // Load reviews from API
    window.loadReviewsFromAPI = async function() {
        try {
            const response = await fetch('/api/reviews');
            if (response.ok) {
                const apiData = await response.json();
                window.apiReviews = apiData.map(r => ({
                    id: r.id,
                    name: r.name,
                    tag: r.location,
                    rating: r.rating,
                    title: r.rating === 5 ? 'Exceptional Experience' : (r.rating >= 4 ? 'Great Time' : 'My Experience'),
                    text: r.review_text,
                    image: r.image_url || 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1470',
                    avatar: '',
                    timestamp: r.created_at,
                    reply_text: r.reply_text
                }));
            }
        } catch (err) {
            console.log('API not available, using local reviews');
            window.apiReviews = [];
        }

        if (document.getElementById('reviews-container')) {
            window.renderReviews('reviews-container', 3);
        }
        if (document.getElementById('all-reviews-container')) {
            window.renderReviews('all-reviews-container', null, window.currentReviewFilter || 0);
        }
    };

    // Initial load
    loadReviewsFromAPI();

    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        const fileInput = document.getElementById('review-image');
        const fileLabel = document.getElementById('review-image-label');
        if (fileInput && fileLabel) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    fileLabel.innerHTML = '<i class="fa-solid fa-check text-[#E0115F] text-lg mb-1"></i><span class="text-[#E0115F]">Selected</span>';
                    fileLabel.classList.add('border-[#E0115F]/50');
                } else {
                    fileLabel.innerHTML = '<i class="fa-solid fa-cloud-arrow-up text-lg mb-1"></i><span>Upload</span>';
                    fileLabel.classList.remove('border-[#E0115F]/50');
                }
            });
        }

        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('review-name').value;
            const locationInput = document.getElementById('review-location');
            const location = locationInput ? locationInput.value : 'Guest';
            let ratingInputObj = document.getElementById('review-rating');
            const rating = ratingInputObj ? parseInt(ratingInputObj.value) : 5;
            const text = document.getElementById('review-text').value;
            const imageFile = document.getElementById('review-image')?.files[0];

            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Submitting...";
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('name', name);
            formData.append('location', location);
            formData.append('rating', rating);
            formData.append('review_text', text);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    closeReview();
                    reviewForm.reset();
                    if(starInputs.length > 0) starInputs[4].click();
                    if (fileLabel) {
                        fileLabel.innerHTML = '<i class="fa-solid fa-cloud-arrow-up text-lg mb-1"></i><span>Upload</span>';
                        fileLabel.classList.remove('border-[#E0115F]/50');
                    }
                    
                    // Reload reviews from API
                    await loadReviewsFromAPI();
                } else {
                    alert("Failed to submit review. Please try again.");
                }
            } catch (error) {
                console.error("Error submitting review:", error);
                alert("An error occurred. Please try again.");
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    const footerBrand = document.getElementById('footer-brand');
    if (footerBrand) {
        const text = footerBrand.textContent.trim();
        footerBrand.innerHTML = text
            .split('')
            .map(char => `<span class="brand-char">${char}</span>`)
            .join('');

        const chars = footerBrand.querySelectorAll('.brand-char');

        chars.forEach(span => {
            span.addEventListener('mouseenter', () => {
                span.classList.add('hovered');
            });

            span.addEventListener('mouseleave', () => {
                span.classList.remove('hovered');
            });
        });
    }

    const reservationModal = document.getElementById('reservation-modal');
    const openReservationBtn = document.getElementById('open-reservation-modal');
    const closeReservationBtn = document.getElementById('close-reservation');
    const closeReservationBg = document.getElementById('close-reservation-bg');
    const reservationBox = document.getElementById('reservation-box');

    function openReservation(e) {
        if (e) e.preventDefault();
        if(reservationModal && reservationBox && typeof gsap !== 'undefined') {
            reservationModal.classList.remove('opacity-0', 'pointer-events-none');
            document.body.style.overflow = 'hidden';
            
            gsap.fromTo(reservationBox, 
                { y: '100%', filter: 'blur(20px)', opacity: 0 },
                { y: '0%', filter: 'blur(0px)', opacity: 1, duration: 1, ease: 'elastic.out(1, 0.8)' }
            );
        }
    }

    function closeReservation(e) {
        if (e) e.preventDefault();
        if(reservationModal && reservationBox && typeof gsap !== 'undefined') {
            gsap.to(reservationBox, {
                y: '100%', filter: 'blur(10px)', opacity: 0, duration: 0.6, ease: 'power3.in',
                onComplete: () => {
                    reservationModal.classList.add('opacity-0', 'pointer-events-none');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    if (openReservationBtn) openReservationBtn.addEventListener('click', openReservation);
    if (closeReservationBtn) closeReservationBtn.addEventListener('click', closeReservation);
    if (closeReservationBg) closeReservationBg.addEventListener('click', closeReservation);

    const guestMinus = document.getElementById('guest-minus');
    const guestPlus = document.getElementById('guest-plus');
    const guestCountDisplay = document.getElementById('guest-count');
    const guestInput = document.getElementById('guest-input');

    if (guestMinus && guestPlus && guestCountDisplay && guestInput) {
        guestMinus.addEventListener('click', () => {
            let current = parseInt(guestInput.value);
            if (current > 1) {
                current--;
                guestInput.value = current;
                guestCountDisplay.innerText = current;
            }
        });

        guestPlus.addEventListener('click', () => {
            let current = parseInt(guestInput.value);
            if (current < 20) {
                current++;
                guestInput.value = current;
                guestCountDisplay.innerText = current;
            }
        });
    }

    const reservationForm = document.getElementById('reservation-form');
    
    const wheelDate = document.getElementById('wheel-date');
    const wheelHour = document.getElementById('wheel-hour');
    const wheelMinute = document.getElementById('wheel-minute');
    const wheelAmpm = document.getElementById('wheel-ampm');
    const selectedDateInput = document.getElementById('selected-date');
    const selectedHourInput = document.getElementById('selected-hour');
    const selectedMinuteInput = document.getElementById('selected-minute');
    const selectedAmpmInput = document.getElementById('selected-ampm');

    if (wheelDate && wheelHour && wheelMinute && wheelAmpm) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = days[d.getDay()];
            const monthName = months[d.getMonth()];
            const dateNum = d.getDate();

            const div = document.createElement('div');
            div.className = 'snap-center h-12 flex items-center justify-center text-white/50 text-base md:text-lg font-bold cursor-pointer transition-all duration-300 wheel-item select-none';
            div.dataset.value = dateStr;
            div.innerHTML = `${dayName}, ${monthName} ${dateNum}`;
            wheelDate.appendChild(div);
        }

        for (let i = 1; i <= 12; i++) {
            const div = document.createElement('div');
            div.className = 'snap-center h-12 flex items-center justify-center text-white/50 text-xl md:text-2xl font-extrabold cursor-pointer transition-all duration-300 wheel-item select-none';
            div.dataset.value = i.toString();
            div.innerHTML = i.toString();
            wheelHour.appendChild(div);
        }

        const minutes = ['00', '15', '30', '45'];
        minutes.forEach(m => {
            const div = document.createElement('div');
            div.className = 'snap-center h-12 flex items-center justify-center text-white/50 text-xl md:text-2xl font-extrabold cursor-pointer transition-all duration-300 wheel-item select-none';
            div.dataset.value = m;
            div.innerHTML = m;
            wheelMinute.appendChild(div);
        });

        const ampmValues = ['AM', 'PM'];
        ampmValues.forEach(v => {
            const div = document.createElement('div');
            div.className = 'snap-center h-12 flex items-center justify-center text-white/50 text-xl md:text-2xl font-extrabold cursor-pointer transition-all duration-300 wheel-item select-none';
            div.dataset.value = v;
            div.innerHTML = v;
            wheelAmpm.appendChild(div);
        });

        function setupWheelScroll(wheelContainer, inputElement) {
            const items = wheelContainer.querySelectorAll('.wheel-item');
            
            function onScroll() {
                const containerCenter = wheelContainer.scrollTop + 96;
                
                items.forEach(item => {
                    const itemCenter = item.offsetTop + 24;
                    const dist = Math.abs(containerCenter - itemCenter);
                    
                    if (dist < 24) {
                        gsap.to(item, { scale: 1.15, opacity: 1, color: '#E0115F', textShadow: '0 0 10px rgba(224,17,95,0.6)', duration: 0.2 });
                        if(inputElement) inputElement.value = item.dataset.value;
                    } else {
                        gsap.to(item, { scale: 0.85, opacity: 0.4, color: 'rgba(255,255,255,0.5)', textShadow: 'none', duration: 0.2 });
                    }
                });
            }
            
            wheelContainer.addEventListener('scroll', onScroll);
            
            onScroll();
            
            items.forEach(item => {
                item.addEventListener('click', () => {
                    const scrollPos = item.offsetTop - 72;
                    wheelContainer.scrollTo({ top: scrollPos, behavior: 'smooth' });
                });
            });
        }

        setTimeout(() => {
            setupWheelScroll(wheelDate, selectedDateInput);
            setupWheelScroll(wheelHour, selectedHourInput);
            setupWheelScroll(wheelMinute, selectedMinuteInput);
            setupWheelScroll(wheelAmpm, selectedAmpmInput);
        }, 100);
    }

    if (reservationForm) {
        reservationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = reservationForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Reserving...";
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('reserve-name').value,
                phone: document.getElementById('reserve-phone').value,
                occasion: document.getElementById('occasion').value,
                date: document.getElementById('selected-date').value,
                hour: document.getElementById('selected-hour').value,
                minute: document.getElementById('selected-minute').value,
                ampm: document.getElementById('selected-ampm').value,
                guest_count: parseInt(document.getElementById('guest-input').value)
            };

            console.log("Submitting reservation:", formData);

            try {
                const response = await fetch('/api/reservations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    closeReservation();
                    setTimeout(() => {
                        alert("Your exclusive experience has been reserved!");
                        reservationForm.reset();
                        guestInput.value = 2;
                        guestCountDisplay.innerText = 2;
                        const wheelDate = document.getElementById('wheel-date');
                        if(wheelDate) wheelDate.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 600);
                } else {
                    alert("Failed to reserve table. Please try again.");
                }
            } catch (error) {
                console.error("Error submitting reservation:", error);
                alert("An error occurred. Please try again.");
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

});