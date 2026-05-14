document.addEventListener('DOMContentLoaded', () => {
    
    // Toast Notification System
    window.showToast = function(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };



    const counter = document.getElementById('counter');
    const progressLine = document.getElementById('progress-line');
    const preloader = document.getElementById('preloader');
    const heroContent = document.querySelector('.hero-content');
    const chars = document.querySelectorAll('.preloader-char');

    let count = 0;

    if (preloader) {
        document.body.style.overflow = 'hidden';
    }
    
    // Force scroll to top and clear hash on refresh
    if (window.location.hash) {
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 10);

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

    const preloaderEmoji = document.getElementById('preloader-emoji');
    const emojiInner = preloaderEmoji?.querySelector('.emoji-bounce');
    const emojis = ['👨‍🍳', '🍲', '🥘', '🍳', '🍱', '🍽️', '😋'];

    // Ultra-smooth GSAP Loader
    if (preloader) {
        const loaderTL = gsap.timeline({
            delay: 0.2,
            onUpdate: function() {
                const progress = Math.floor(this.progress() * 100);
                if (counter) counter.innerText = progress + "%";
                
                // Update Emoji Sequence
                if (emojiInner) {
                    const emojiIndex = Math.floor(this.progress() * (emojis.length - 1));
                    if (emojiInner.innerText !== emojis[emojiIndex]) {
                        emojiInner.innerText = emojis[emojiIndex];
                        gsap.fromTo(emojiInner, { scale: 1.4 }, { scale: 1, duration: 0.3 });
                    }
                }
            },
            onComplete: () => {
                if (counter) counter.innerText = "100%";
                setTimeout(() => {
                    preloader.classList.add('slide-up');

                    if (canvas) {
                        canvas.classList.replace('opacity-100', 'opacity-0');
                        setTimeout(() => snowActive = false, 1000);
                    }

                    const heroBg = document.getElementById('hero-bg-wrapper');
                    if (heroBg) heroBg.classList.replace('scale-100', 'scale-105');

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
                }, 400);
            }
        });

        loaderTL.to(progressLine, { width: "100%", duration: 2.5, ease: "power2.inOut" });
        loaderTL.to(preloaderEmoji, { left: "100%", duration: 2.5, ease: "power2.inOut" }, 0);
    }


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
    const openListViewBtn = document.getElementById('open-list-view');
    const closeLoginBtn = document.getElementById('close-login');
    const closeLoginBg = document.getElementById('close-login-bg');
    const loginBox = document.getElementById('login-box');
    const resBadge = document.getElementById('res-badge');
    
    // My Reservation Modal Elements
    const myResModal = document.getElementById('my-res-modal');
    const myResBox = document.getElementById('my-res-box');
    const myResContent = document.getElementById('my-res-content');
    const closeMyResBtn = document.getElementById('close-my-res');
    const closeMyResBg = document.getElementById('close-my-res-bg');
    const resToAdminBtn = document.getElementById('res-to-admin');

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

    function checkResStatus() {
        const resData = localStorage.getItem('user_reservation');
        if (resData && resBadge) {
            resBadge.classList.remove('hidden');
        } else if (resBadge) {
            resBadge.classList.add('hidden');
        }
    }
    checkResStatus();

    function openMyRes() {
        const resData = JSON.parse(localStorage.getItem('user_reservation') || 'null');
        
        if (resData) {
            const dateObj = new Date(resData.date);
            const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
            const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
            const formattedTime = `${resData.hour}:${resData.minute} ${resData.ampm}`;
            
            myResContent.innerHTML = `
                <div class="mb-6">
                    <div class="w-16 h-16 bg-[#E0115F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-calendar-check text-[#E0115F] text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white uppercase tracking-tight">Your Reservation</h3>
                    <p class="text-[10px] text-[#E0115F] font-bold uppercase tracking-widest mt-1">Confirmed & Ready</p>
                </div>
                
                <div class="space-y-4 text-left bg-white/5 p-5 rounded-2xl border border-white/5">
                    <div>
                        <span class="text-[9px] uppercase tracking-widest text-white/40 block mb-1">Date & Time</span>
                        <p class="text-sm font-bold text-white">${formattedDate} @ ${formattedTime}</p>
                    </div>
                    <div>
                        <span class="text-[9px] uppercase tracking-widest text-white/40 block mb-1">Guests & Occasion</span>
                        <p class="text-sm font-bold text-white">${resData.guest_count} People • ${resData.occasion.replace('_', ' ')}</p>
                    </div>
                </div>
                
                <p class="text-[10px] text-white/40 mt-6 italic">Looking forward to seeing you at Aurous!</p>
            `;
        } else {
            myResContent.innerHTML = `
                <div class="py-6">
                    <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-calendar-xmark text-white/20 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white uppercase tracking-tight">No Reservation Yet</h3>
                    <p class="text-xs text-white/40 mt-2">Book your table now to experience the best of Aurous.</p>
                </div>
            `;
        }

        myResModal.classList.remove('opacity-0', 'pointer-events-none');
        myResBox.classList.remove('translate-y-10');
        myResBox.classList.add('translate-y-0');
        document.body.style.overflow = 'hidden';
    }

    function closeMyRes() {
        myResModal.classList.add('opacity-0', 'pointer-events-none');
        myResBox.classList.remove('translate-y-0');
        myResBox.classList.add('translate-y-10');
        document.body.style.overflow = '';
    }

    if (openLoginBtn) openLoginBtn.addEventListener('click', openLogin);
    if (openListViewBtn) openListViewBtn.addEventListener('click', openMyRes);
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLogin);
    if (closeLoginBg) closeLoginBg.addEventListener('click', closeLogin);
    
    if (closeMyResBtn) closeMyResBtn.addEventListener('click', closeMyRes);
    if (closeMyResBg) closeMyResBg.addEventListener('click', closeMyRes);
    if (resToAdminBtn) {
        resToAdminBtn.addEventListener('click', () => {
            closeMyRes();
            setTimeout(openLogin, 400);
        });
    }

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
            // Click to toggle on mobile/desktop
            musicPlayerWidget.addEventListener('click', (e) => {
                // Don't trigger if clicking child controls (progress bar, skip buttons)
                if (e.target.closest('input[type="range"]') || e.target.closest('.space-x-5')) return;
                
                playStatus.checked = !playStatus.checked;
                if (playStatus.checked) {
                    bgMusic.volume = 0.6;
                    bgMusic.play().then(() => {
                        isMusicPlaying = true;
                        if (playerSpinDisc) playerSpinDisc.classList.add('animate-[spin_3s_linear_infinite]');
                    }).catch(err => console.warn("Play prevented:", err));
                } else {
                    bgMusic.pause();
                    isMusicPlaying = false;
                    if (playerSpinDisc) playerSpinDisc.classList.remove('animate-[spin_3s_linear_infinite]');
                }
            });

            // Keep hover for desktop if desired, but click is primary now
            musicPlayerWidget.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768 && !isMusicPlaying) {
                    // Optional: keep auto-play on hover for desktop
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
        if (reviewModal && reviewBox) {
            reviewModal.classList.remove('opacity-0', 'pointer-events-none');
            reviewBox.classList.remove('translate-y-10');
            reviewBox.classList.add('translate-y-0', 'scale-100');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeReview(e) {
        if (e) e.preventDefault();
        if (reviewModal && reviewBox) {
            reviewModal.classList.add('opacity-0', 'pointer-events-none');
            reviewBox.classList.remove('translate-y-0', 'scale-100');
            reviewBox.classList.add('translate-y-10');
            document.body.style.overflow = '';
        }
    }

    if (openReviewBtn) openReviewBtn.addEventListener('click', openReview);
    if (closeReviewBtn) closeReviewBtn.addEventListener('click', closeReview);
    if (closeReviewBg) closeReviewBg.addEventListener('click', closeReview);

    const guestPlus = document.getElementById('guest-plus');
    const guestMinus = document.getElementById('guest-minus');
    const guestCountDisplay = document.getElementById('guest-count');
    const guestInput = document.getElementById('guest-input');

    if (guestPlus && guestMinus && guestCountDisplay && guestInput) {
        guestPlus.addEventListener('click', () => {
            let count = parseInt(guestInput.value);
            if (count < 20) {
                count++;
                guestCountDisplay.innerText = count;
                guestInput.value = count;
            }
        });

        guestMinus.addEventListener('click', () => {
            let count = parseInt(guestInput.value);
            if (count > 1) {
                count--;
                guestCountDisplay.innerText = count;
                guestInput.value = count;
            }
        });
    }

    const starInputs = document.querySelectorAll('#star-rating-input i');
    const ratingInput = document.getElementById('review-rating');

    if (starInputs.length > 0) {
        starInputs.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.getAttribute('data-value'));
                if (ratingInput) ratingInput.value = value;
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
        for (let i = 1; i <= 5; i++) {
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

    window.deleteReview = async function (id) {
        if (!confirm('Are you sure you want to delete this review?')) return;

        // Try deleting from API first (numeric IDs are from backend)
        if (typeof id === 'number' || !isNaN(parseInt(id))) {
            try {
                const response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    // Remove from apiReviews cache
                    if (window.apiReviews) {
                        window.apiReviews = window.apiReviews.filter(r => r.id != id);
                    }
                }
            } catch (err) {
                console.log('API delete failed, trying local:', err);
            }
        }

        // Also try local storage delete
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

    window.renderReviews = function (containerId, limit = null, filterStars = 0) {
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
            let images = [];
            if (review.image) {
                images = review.image.split(',');
            } else {
                images = ['https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000'];
            }
            const firstImage = images[0];
            const hasMultipleImages = images.length > 1;

            if (!window.reviewGalleries) window.reviewGalleries = {};
            window.reviewGalleries[review.id] = { images: images, text: review.text };

            const galleryOverlay = hasMultipleImages ? `
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center z-20 cursor-pointer backdrop-blur-sm" onclick="openGallery('${review.id}')">
                    <div class="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3 transform scale-75 group-hover:scale-100 transition-transform duration-500 delay-100">
                        <i class="fa-regular fa-images text-white text-xl"></i>
                    </div>
                    <span class="text-white text-xs font-bold uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">+${images.length - 1} Photos</span>
                </div>
            ` : '';

            const avatarHtml = review.avatar
                ? `<img src="${review.avatar}" alt="${review.name}" class="w-12 h-12 rounded-full object-cover border-2 border-[#E0115F]">`
                : `<div class="w-12 h-12 rounded-full bg-[#E0115F] flex items-center justify-center text-white font-bold text-lg border-2 border-[#E0115F] flex-shrink-0">${review.name.charAt(0)}</div>`;

            const canDelete = review.id.toString().startsWith('r_') || (typeof review.id === 'number');
            const deleteBtn = canDelete ? `
                <button onclick="deleteReview('${review.id}')" class="text-white/40 hover:text-[#E0115F] transition-colors" title="Delete Review"><i class="fa-solid fa-trash-can"></i></button>
            ` : '';

            const replyHtml = review.reply_text ? `
                <div class="mt-6 flex gap-3 items-end">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E0115F] to-[#ff4d85] flex flex-shrink-0 items-center justify-center shadow-[0_0_15px_rgba(224,17,95,0.4)] z-10">
                        <i class="fa-solid fa-crown text-white text-[10px]"></i>
                    </div>
                    <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl rounded-bl-sm p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-[85%]">
                        <span class="text-[10px] uppercase tracking-widest text-[#ff4d85] font-bold mb-1.5 block">Aurous Admin</span>
                        <p class="text-white/90 text-sm leading-relaxed font-medium tracking-wide">"${review.reply_text}"</p>
                    </div>
                </div>
            ` : '';

            let html = '';

            if (isGrid) {
                html = `
                    <div class="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors group flex flex-col h-full relative overflow-hidden">
                        <div class="w-full h-48 rounded-2xl overflow-hidden mb-6 relative shrink-0 bg-black">
                            <img src="${firstImage}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt="Review Image">
                            ${galleryOverlay}
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
                        <div class="flex items-center gap-4 mt-auto">
                            ${avatarHtml}
                            <div class="flex flex-col">
                                <h4 class="font-bold text-sm tracking-wide uppercase">${review.name}</h4>
                                <span class="text-[10px] text-white/40 uppercase tracking-widest mt-1">${review.tag}</span>
                            </div>
                        </div>
                        ${replyHtml}
                    </div>
                `;
            } else {
                const isReverse = index % 2 !== 0;
                html = `
                    <div class="flex flex-col md:${isReverse ? 'flex-row-reverse' : 'flex-row'} items-center gap-4 md:gap-0 relative group">
                        <div class="w-full md:w-3/5 h-[160px] md:h-[500px] rounded-[1rem] md:rounded-[2rem] overflow-hidden relative shadow-2xl bg-black">
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-700 z-10 w-full h-full pointer-events-none"></div>
                            <img src="${firstImage}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" alt="Review Image">
                            ${galleryOverlay}
                        </div>
                        <div class="w-[96%] mx-auto -mt-[60px] md:-mt-0 relative z-40 md:w-[45%] md:absolute ${isReverse ? 'md:left-0' : 'md:right-0'} bg-black/98 md:bg-[#050505]/70 backdrop-blur-[20px] p-3 md:p-12 rounded-[1.2rem] md:rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:-translate-y-8 md:group-hover:-translate-y-12 transition-all duration-700">
                            <div class="flex justify-between items-start mb-6">
                                <div class="flex gap-1 text-[#E0115F] text-lg">${getStarsHtml(review.rating)}</div>
                                <div class="flex items-center gap-4">
                                    <span class="text-xs text-white/40 tracking-widest uppercase">${getRelativeTime(review.timestamp)}</span>
                                    ${deleteBtn}
                                </div>
                            </div>
                            <h3 class="text-sm md:text-2xl font-bold mb-1 md:mb-4 tracking-tight">"${review.title}"</h3>
                            <p class="text-[10px] md:text-base leading-relaxed font-light mb-4">"${review.text}"</p>
                            <div class="flex items-center gap-4 mt-6">
                                ${avatarHtml}
                                <div class="flex flex-col">
                                    <h4 class="font-bold text-sm tracking-wide uppercase">${review.name}</h4>
                                    <span class="text-[10px] text-white/40 uppercase tracking-widest mt-1">${review.tag}</span>
                                </div>
                            </div>
                            ${replyHtml}
                        </div>
                    </div>
                `;
            }
            container.innerHTML += html;
        });
    };

    // Load reviews from API
    window.loadReviewsFromAPI = async function () {
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
            fileInput.addEventListener('change', function () {
                if (this.files && this.files.length > 0) {
                    const count = this.files.length;
                    fileLabel.innerHTML = `<i class="fa-solid fa-check text-[#E0115F] text-lg mb-1"></i><span class="text-[#E0115F]">${count} Photo${count > 1 ? 's' : ''} Selected</span>`;
                    fileLabel.classList.add('border-[#E0115F]/50');
                } else {
                    fileLabel.innerHTML = '<i class="fa-solid fa-cloud-arrow-up text-lg mb-1"></i><span>Upload Photos</span>';
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
            const imageFiles = document.getElementById('review-image')?.files;

            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Submitting...";
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('name', name);
            formData.append('location', location);
            formData.append('rating', rating);
            formData.append('review_text', text);
            if (imageFiles && imageFiles.length > 0) {
                for (let i = 0; i < imageFiles.length; i++) {
                    formData.append('images', imageFiles[i]);
                }
            }

            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    closeReview();
                    reviewForm.reset();
                    if (starInputs.length > 0) starInputs[4].click();
                    if (fileLabel) {
                        fileLabel.innerHTML = '<i class="fa-solid fa-cloud-arrow-up text-lg mb-1"></i><span>Upload</span>';
                        fileLabel.classList.remove('border-[#E0115F]/50');
                    }

                    // Reload reviews from API
                    await loadReviewsFromAPI();
                    window.showToast("Review submitted successfully! ✨");
                } else {
                    window.showToast("❌ Failed to submit review.");
                }
            } catch (error) {
                console.error("Error submitting review:", error);
                window.showToast("❌ Connection error.");
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
        if (reservationModal && reservationBox && typeof gsap !== 'undefined') {
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
        if (reservationModal && reservationBox && typeof gsap !== 'undefined') {
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
            div.className = 'snap-center h-[37px] flex flex-col items-center justify-center text-white/50 cursor-pointer transition-all duration-300 wheel-item select-none';
            div.dataset.value = dateStr;
            div.innerHTML = `<span class="text-[7.5px] md:text-[8px] uppercase tracking-widest font-black mb-0.5">${dayName}</span><span class="text-[9.5px] md:text-[10px] font-bold">${monthName} ${dateNum}</span>`;
            wheelDate.appendChild(div);
        }

        for (let i = 1; i <= 12; i++) {
            const div = document.createElement('div');
            div.className = 'snap-center h-[37px] flex items-center justify-center text-white/50 text-[13px] md:text-base font-black cursor-pointer transition-all duration-300 wheel-item select-none';
            div.dataset.value = i.toString();
            div.innerHTML = i.toString();
            wheelHour.appendChild(div);
        }

        const minutes = ['00', '15', '30', '45'];
        minutes.forEach(m => {
            const div = document.createElement('div');
            div.className = 'snap-center h-[37px] flex items-center justify-center text-white/50 text-[13px] md:text-base font-black cursor-pointer transition-all duration-300 wheel-item select-none';
            div.dataset.value = m;
            div.innerHTML = m;
            wheelMinute.appendChild(div);
        });

        const ampmValues = ['AM', 'PM'];
        ampmValues.forEach(v => {
            const div = document.createElement('div');
            div.className = 'snap-center h-[37px] flex items-center justify-center text-white/50 text-[13px] md:text-base font-black cursor-pointer transition-all duration-300 wheel-item select-none';
            div.dataset.value = v;
            div.innerHTML = v;
            wheelAmpm.appendChild(div);
        });

        // Phone number 10-digit limit
        const phoneInput = document.getElementById('reserve-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
            });
        }

        function setupWheelScroll(wheelContainer, inputElement) {
            const items = wheelContainer.querySelectorAll('.wheel-item');

            function onScroll() {
                const containerCenter = wheelContainer.scrollTop + (wheelContainer.offsetHeight / 2);

                items.forEach(item => {
                    const itemCenter = item.offsetTop + (item.offsetHeight / 2);
                    const dist = Math.abs(containerCenter - itemCenter);

                    if (dist < (item.offsetHeight / 2)) {
                        gsap.to(item, { scale: 1.15, opacity: 1, color: '#E0115F', textShadow: '0 0 10px rgba(224,17,95,0.6)', duration: 0.2 });
                        if (inputElement) inputElement.value = item.dataset.value;
                    } else {
                        gsap.to(item, { scale: 0.85, opacity: 0.4, color: 'rgba(255,255,255,0.5)', textShadow: 'none', duration: 0.2 });
                    }
                });
            }

            wheelContainer.addEventListener('scroll', onScroll);

            onScroll();

            items.forEach(item => {
                item.addEventListener('click', () => {
                    const scrollPos = item.offsetTop - (wheelContainer.offsetHeight / 2) + (item.offsetHeight / 2);
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
                date: document.getElementById('selected-date').value || document.querySelector('#wheel-date .wheel-item')?.dataset.value || '',
                hour: document.getElementById('selected-hour').value || document.querySelector('#wheel-hour .wheel-item')?.dataset.value || '',
                minute: document.getElementById('selected-minute').value || document.querySelector('#wheel-minute .wheel-item')?.dataset.value || '',
                ampm: document.getElementById('selected-ampm').value || document.querySelector('#wheel-ampm .wheel-item')?.dataset.value || '',
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
                        const successModal = document.getElementById('success-modal');
                        const successMessage = document.getElementById('success-message');
                        if (successModal) {
                            if (successMessage) {
                                const name = formData.name.split(' ')[0]; // Use first name
                                const dateObj = new Date(formData.date);
                                const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
                                const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
                                const formattedTime = `${formData.hour}:${formData.minute} ${formData.ampm}`;
                                
                                const occasionText = formData.occasion !== 'casual' ? ` for your ${formData.occasion.replace('_', ' ')}` : '';
                                successMessage.innerHTML = `See you soon, ${name}${occasionText}!<br>Meet you on ${formattedDate} at ${formattedTime}.`;
                            }
                            
                            // Save reservation locally
                            localStorage.setItem('user_reservation', JSON.stringify(formData));
                            checkResStatus();

                            successModal.classList.add('active');

                            // Party Pops (Confetti) - Mobile Only
                            if (window.innerWidth <= 768) {
                                for (let i = 0; i < 50; i++) {
                                    const confetti = document.createElement('div');
                                    confetti.className = 'confetti';
                                    confetti.style.left = Math.random() * 100 + 'vw';
                                    confetti.style.backgroundColor = ['#22c55e', '#ffffff', '#E0115F', '#facc15'][Math.floor(Math.random() * 4)];
                                    confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
                                    document.body.appendChild(confetti);
                                    setTimeout(() => confetti.remove(), 5000);
                                }
                            }
                            
                            // Allow clicking to close
                            const closeSuccess = () => {
                                successModal.classList.remove('active');
                                successModal.removeEventListener('click', closeSuccess);
                            };
                            successModal.addEventListener('click', closeSuccess);

                            // Hide after 7 seconds automatically
                            setTimeout(() => {
                                if (successModal.classList.contains('active')) {
                                    successModal.classList.remove('active');
                                }
                            }, 7000);
                        }
                        
                        reservationForm.reset();
                        guestInput.value = 2;
                        guestCountDisplay.innerText = 2;
                        const wheelDate = document.getElementById('wheel-date');
                        if (wheelDate) wheelDate.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 600);
                } else {
                    window.showToast("❌ Failed to reserve table.");
                }
            } catch (error) {
                console.error("Error submitting reservation:", error);
                window.showToast("❌ Connection error.");
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    window.openGallery = function (reviewId) {
        const galleryData = window.reviewGalleries[reviewId];
        if (!galleryData || !galleryData.images || galleryData.images.length === 0) return;

        const images = galleryData.images;
        const text = galleryData.text;

        let currentIndex = 0;

        const modalHtml = `
            <div id="gallery-modal" class="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center opacity-0 transition-opacity duration-300">
                <button onclick="closeGallery()" class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-[#E0115F] transition-colors z-50 group">
                    <i class="fa-solid fa-xmark text-lg group-hover:scale-110 transition-transform"></i>
                </button>
                
                <div class="relative w-full h-[80vh] flex flex-col items-center justify-center px-4 md:px-16 mt-4">
                    <img id="gallery-image" src="${images[0]}" class="max-w-full max-h-[85%] object-contain rounded-xl shadow-2xl transition-all duration-300 transform scale-95">
                    
                    <div id="gallery-review-text" class="mt-6 px-6 max-w-3xl text-center text-white/80 text-sm md:text-base italic font-light transition-opacity duration-300">
                        "${text}"
                    </div>
                    
                    <button id="gallery-prev" class="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#E0115F] backdrop-blur-md transition-all z-50 ${images.length <= 1 ? 'hidden' : ''}">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    
                    <button id="gallery-next" class="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#E0115F] backdrop-blur-md transition-all z-50 ${images.length <= 1 ? 'hidden' : ''}">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="absolute bottom-8 flex gap-3" id="gallery-dots">
                    ${images.map((_, i) => `<div class="w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-[#E0115F] scale-125' : 'bg-white/30'} transition-all duration-300"></div>`).join('')}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';

        const modal = document.getElementById('gallery-modal');
        const img = document.getElementById('gallery-image');
        const textDiv = document.getElementById('gallery-review-text');
        const dots = document.getElementById('gallery-dots').children;

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            img.classList.remove('scale-95');
            img.classList.add('scale-100');
        });

        const updateImage = (index) => {
            img.classList.add('opacity-0', 'scale-95');
            img.classList.remove('scale-100');
            
            if (textDiv) {
                if (index === 0) textDiv.classList.remove('opacity-0');
                else textDiv.classList.add('opacity-0');
            }
            
            setTimeout(() => {
                img.src = images[index];
                Array.from(dots).forEach((dot, i) => {
                    dot.className = `w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === index ? 'bg-[#E0115F] scale-125' : 'bg-white/30'}`;
                });
                img.classList.remove('opacity-0', 'scale-95');
                img.classList.add('scale-100');
            }, 200);
        };
        
        document.getElementById('gallery-prev').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateImage(currentIndex);
        });
        
        document.getElementById('gallery-next').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateImage(currentIndex);
        });

        // Swipe Support for Gallery
        let touchStartX = 0;
        let touchEndX = 0;
        
        modal.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        modal.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const threshold = 50;
            if (touchEndX < touchStartX - threshold) {
                currentIndex = (currentIndex + 1) % images.length;
                updateImage(currentIndex);
            } else if (touchEndX > touchStartX + threshold) {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateImage(currentIndex);
            }
        }
    };
    
    // Active Section Tracking for Mobile Nav
    const navLinksMapping = {
        'hero': document.getElementById('nav-home'),
        'vibe': document.getElementById('nav-vibe'),
        'menu': document.getElementById('nav-menu'),
        'echoes': document.getElementById('nav-echoes')
    };

    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0
    };

    let activeId = 'hero';

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeId = entry.target.id;
                
                // Remove active from all
                Object.values(navLinksMapping).forEach(link => link?.classList.remove('active'));
                
                // Add active to current
                if (navLinksMapping[activeId]) {
                    navLinksMapping[activeId].classList.add('active');
                }
            }
        });
    }, observerOptions);

    // Watch sections
    ['hero', 'vibe', 'menu', 'echoes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });

    // Special case for top/bottom of page
    window.addEventListener('scroll', () => {
        if (window.scrollY < 50) {
            Object.values(navLinksMapping).forEach(link => link?.classList.remove('active'));
            navLinksMapping['hero']?.classList.add('active');
        } else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            Object.values(navLinksMapping).forEach(link => link?.classList.remove('active'));
            navLinksMapping['echoes']?.classList.add('active');
        }
    });

    window.closeGallery = function() {
        const modal = document.getElementById('gallery-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            const img = document.getElementById('gallery-image');
            if (img) img.classList.add('scale-95');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    };

});