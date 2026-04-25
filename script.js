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
                    heroBg.classList.replace('scale-100', 'scale-110');
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
        bgMusic.volume = 0.6;

        const playToggleLabel = playStatus.closest('label');
        
        playToggleLabel.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent double-firing from the checkbox
            playStatus.checked = !playStatus.checked; // Manually toggle state

            if (playStatus.checked) {
                bgMusic.volume = 0.6; // Ensure instant full volume
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

        let allReviews = [...getStoredReviews(), ...defaultReviews];
        
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

        // Determine if it's the grid layout (reviews page) or staggered layout (homepage)
        const isGrid = containerId === 'all-reviews-container';

        allReviews.forEach((review, index) => {
            const reviewImage = review.image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000';
            const avatarHtml = review.avatar 
                ? `<img src="${review.avatar}" alt="${review.name}" class="w-12 h-12 rounded-full object-cover border-2 border-[#E0115F]">`
                : `<div class="w-12 h-12 rounded-full bg-[#E0115F] flex items-center justify-center text-white font-bold text-lg border-2 border-[#E0115F] flex-shrink-0">${review.name.charAt(0)}</div>`;

            const deleteBtn = review.id.startsWith('r_') ? `
                <button onclick="deleteReview('${review.id}')" class="text-white/40 hover:text-[#E0115F] transition-colors" title="Delete Review"><i class="fa-solid fa-trash-can"></i></button>
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
                        <p class="text-white/60 text-sm leading-relaxed font-light mb-8 flex-grow">"${review.text}"</p>
                        <div class="flex items-center gap-4 mt-auto">
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
                            <p class="text-white/60 text-base leading-relaxed font-light mb-8">"${review.text}"</p>
                            <div class="flex items-center gap-4">
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

    if (document.getElementById('reviews-container')) {
        window.renderReviews('reviews-container', 3);
    }

    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        // UI for file input
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

        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('review-name').value;
            const locationInput = document.getElementById('review-location');
            const location = locationInput ? locationInput.value : 'Guest';
            let ratingInputObj = document.getElementById('review-rating');
            const rating = ratingInputObj ? parseInt(ratingInputObj.value) : 5;
            const text = document.getElementById('review-text').value;
            
            let imageUrl = 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1470';
            const imageFile = document.getElementById('review-image')?.files[0];

            function finishSubmission(imgSrc) {
                const newReview = {
                    id: 'r_' + Date.now(),
                    name: name,
                    tag: location,
                    rating: rating,
                    title: rating === 5 ? 'Exceptional Experience' : (rating >= 4 ? 'Great Time' : 'My Experience'),
                    text: text,
                    image: imgSrc,
                    avatar: '',
                    timestamp: new Date().toISOString()
                };

                saveReview(newReview);
                
                if (document.getElementById('reviews-container')) {
                    window.renderReviews('reviews-container', 3);
                }
                if (document.getElementById('all-reviews-container')) {
                    window.renderReviews('all-reviews-container', null, window.currentReviewFilter || 0);
                }
                
                closeReview();
                reviewForm.reset();
                if(starInputs.length > 0) starInputs[4].click();
                if (fileLabel) {
                    fileLabel.innerHTML = '<i class="fa-solid fa-cloud-arrow-up text-lg mb-1"></i><span>Upload</span>';
                    fileLabel.classList.remove('border-[#E0115F]/50');
                }
            }

            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    finishSubmission(event.target.result);
                };
                reader.readAsDataURL(imageFile);
            } else {
                finishSubmission(imageUrl);
            }
        });
    }

    // ── Footer Brand: Character-level Hover ──
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

                // Sync with existing custom cursor — scale up on interactive element
                const cursorOutline = document.querySelector('.custom-cursor');
                if (cursorOutline) {
                    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.8)';
                    cursorOutline.style.backgroundColor = 'rgba(224, 17, 95, 0.1)';
                    cursorOutline.style.borderColor = '#E0115F';
                }
            });

            span.addEventListener('mouseleave', () => {
                span.classList.remove('hovered');

                // Reset cursor
                const cursorOutline = document.querySelector('.custom-cursor');
                if (cursorOutline) {
                    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
                    cursorOutline.style.backgroundColor = 'transparent';
                    cursorOutline.style.borderColor = 'var(--primary)';
                }
            });
        });
    }

});