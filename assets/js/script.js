document.addEventListener('DOMContentLoaded', () => {


    window.showToast = function (message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-circle-check';
        const text = document.createElement('span');
        text.textContent = message;
        toast.append(icon, text);
        container.appendChild(toast);


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
    const preloadLocationMap = (() => {
        let started = false;
        return () => {
            if (started) return;
            const mapFrame = document.getElementById('location-map');
            if (!mapFrame || mapFrame.src) return;
            const src = mapFrame.dataset.src;
            if (src) {
                started = true;
                mapFrame.src = src;
            }
        };
    })();

    let count = 0;

    if (preloader) {
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(preloadLocationMap);
    }


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
    const emojis = ['\u{1F468}\u200D\u{1F373}', '\u{1F372}', '\u{1F958}', '\u{1F373}', '\u{1F371}', '\u{1F37D}\uFE0F', '\u{1F60B}'];

    // GPU-accelerated smooth preloader — zero GSAP dependency
    if (preloader) {
        // Make progress line use transform instead of width (GPU composited)
        if (progressLine) {
            progressLine.style.width = '100%';
            progressLine.style.transformOrigin = 'left center';
            progressLine.style.transform = 'scaleX(0)';
            progressLine.style.transition = 'none';
        }
        if (preloaderEmoji) {
            preloaderEmoji.style.left = '0%';
            preloaderEmoji.style.transform = 'translate(-50%, -50%)';
        }

        const DURATION = 2800; // ms total
        const DELAY = 250; // ms before start
        let startTime = null;
        let lastEmojiIndex = -1;

        // Smooth ease-in-out curve
        const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const preloaderDone = () => {
            if (counter) counter.innerText = '100%';
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
            }, 300);
        };

        const animatePreloader = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const raw = Math.min(elapsed / DURATION, 1);
            const progress = easeInOut(raw);

            // Update counter
            const displayVal = Math.floor(progress * 100);
            if (counter) counter.innerText = displayVal + '%';

            // Move progress line via GPU transform (scaleX = no reflow)
            if (progressLine) {
                progressLine.style.transform = `scaleX(${progress})`;
            }

            // Move emoji via GPU transform
            if (preloaderEmoji) {
                preloaderEmoji.style.left = `${progress * 100}%`;
            }

            // Swap emojis without triggering GSAP
            if (emojiInner) {
                const emojiIndex = Math.min(Math.floor(progress * emojis.length), emojis.length - 1);
                if (emojiIndex !== lastEmojiIndex) {
                    lastEmojiIndex = emojiIndex;
                    emojiInner.innerText = emojis[emojiIndex];
                    emojiInner.style.transition = 'transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275)';
                    emojiInner.style.transform = 'scale(1.35)';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            emojiInner.style.transform = 'scale(1)';
                        });
                    });
                }
            }

            if (raw < 1) {
                requestAnimationFrame(animatePreloader);
            } else {
                preloaderDone();
            }
        };

        setTimeout(() => requestAnimationFrame(animatePreloader), DELAY);
    }


    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
    });

    // ===== SCROLL REVEAL ANIMATIONS =====
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, entry.target.dataset.delay ? parseInt(entry.target.dataset.delay) : 0);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

    const menuScroll = document.getElementById('menu-scroll');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');

    if (menuScroll && scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            menuScroll.scrollBy({ left: -302, behavior: 'smooth' });
        });
        scrollRightBtn.addEventListener('click', () => {
            menuScroll.scrollBy({ left: 302, behavior: 'smooth' });
        });
    }

    const loginModal = document.getElementById('login-modal');
    const openLoginBtn = document.getElementById('open-login');
    const openListViewBtn = document.getElementById('open-list-view');
    const closeLoginBtn = document.getElementById('close-login');
    const closeLoginBg = document.getElementById('close-login-bg');
    const loginBox = document.getElementById('login-box');
    const resBadge = document.getElementById('res-badge');


    const myResModal = document.getElementById('my-res-modal');
    const myResBox = document.getElementById('my-res-box');
    const myResContent = document.getElementById('my-res-content');
    const closeMyResBtn = document.getElementById('close-my-res');
    const closeMyResBg = document.getElementById('close-my-res-bg');
    const cancelResBtn = document.getElementById('cancel-res');

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

    function getReservations() {
        let resList = [];
        try {
            resList = JSON.parse(localStorage.getItem('user_reservations') || '[]');
            if (!Array.isArray(resList)) resList = [];
        } catch (e) { resList = []; }


        const oldRes = localStorage.getItem('user_reservation');
        if (oldRes) {
            try {
                const p = JSON.parse(oldRes);
                if (p) resList.push(p);
            } catch (e) { }
            localStorage.removeItem('user_reservation');
            localStorage.setItem('user_reservations', JSON.stringify(resList));
        }


        const now = new Date();
        now.setHours(0, 0, 0, 0);
        resList = resList.filter(r => {
            if (!r.date) return false;
            const [y, m, d] = r.date.split('-').map(Number);
            const rDate = new Date(y, m - 1, d);
            return rDate >= now;
        });


        resList.sort((a, b) => {
            const [yA, mA, dA] = a.date.split('-').map(Number);
            const dateA = new Date(yA, mA - 1, dA);
            const [yB, mB, dB] = b.date.split('-').map(Number);
            const dateB = new Date(yB, mB - 1, dB);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;


            let hA = parseInt(a.hour); if (a.ampm === 'PM' && hA !== 12) hA += 12; else if (a.ampm === 'AM' && hA === 12) hA = 0;
            let hB = parseInt(b.hour); if (b.ampm === 'PM' && hB !== 12) hB += 12; else if (b.ampm === 'AM' && hB === 12) hB = 0;

            if (hA !== hB) return hA - hB;
            return parseInt(a.minute) - parseInt(b.minute);
        });

        localStorage.setItem('user_reservations', JSON.stringify(resList));
        return resList;
    }

    function checkResStatus() {
        const resList = getReservations();
        if (resList.length > 0 && resBadge) {
            resBadge.classList.remove('hidden');
        } else if (resBadge) {
            resBadge.classList.add('hidden');
        }
    }
    checkResStatus();

    function buildBookingOrderList(resData) {
        if (!resData.orders || resData.orders.length === 0) return '';
        const total = resData.orders.reduce((sum, o) => sum + o.total_amount, 0);
        const itemCount = resData.orders.reduce((sum, o) => sum + o.items.reduce((n, i) => n + i.quantity, 0), 0);
        const itemsHtml = resData.orders.flatMap(o => o.items.map(i => `
            <div class="flex justify-between gap-1.5 text-[7px] leading-tight text-white/75 py-0.5">
                <span class="truncate">${i.quantity} ${i.item_name}</span>
                <span class="shrink-0 font-medium text-white/90">${i.price_per_item * i.quantity}</span>
            </div>
        `)).join('');
        return `
            <details class="mt-2 group">
                <summary class="list-none flex items-center justify-between gap-1.5 cursor-pointer bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-lg px-2 py-1.5 text-left [&::-webkit-details-marker]:hidden">
                    <span class="flex items-center gap-1 text-[7.5px] font-semibold uppercase tracking-wide text-white/70">
                        <i class="fas fa-list text-[#E0115F] text-[7px]"></i> Order list
                    </span>
                    <span class="text-[7px] text-white/40">${itemCount} · <span class="text-[#E0115F] font-semibold text-[7px]">₹${total}</span></span>
                    <i class="fas fa-chevron-down text-[6px] text-white/30 shrink-0 group-open:rotate-180 transition-transform"></i>
                </summary>
                <div class="mt-1 px-1.5 pb-1.5 pt-0.5 border border-white/5 rounded-lg bg-black/25 max-h-[88px] overflow-y-auto">
                    ${itemsHtml}
                    <div class="flex justify-between text-[7px] font-semibold text-white/90 pt-1 mt-0.5 border-t border-white/10">
                        <span>Total</span>
                        <span class="text-[#E0115F] text-[7px]">₹${total}</span>
                    </div>
                </div>
            </details>
        `;
    }

    window.openResDetail = function (index) {
        const resList = getReservations();
        const resData = resList[index];
        if (!resData) return openMyRes();

        const [y, m_val, d_val] = resData.date.split('-').map(Number);
        const dateObj = new Date(y, m_val - 1, d_val);
        const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const formattedTime = `${resData.hour}:${resData.minute} ${resData.ampm}`;

        let headerBadgeHtml = '';
        let actionBtnHtml = '';
        let statusMessageHtml = '';
        let ticketStatusClass = '';

        if (resData.status === 'completed') {
            headerBadgeHtml = `
                <div class="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-1 border border-green-500/20">
                    <i class="fa-solid fa-circle-check text-green-500 text-sm"></i>
                </div>
                <h3 class="text-sm font-bold text-white">All done</h3>
                <p class="text-[7px] text-green-500/90 font-semibold uppercase tracking-wider mt-0.5">Thanks for visiting</p>
            `;
            statusMessageHtml = `<p class="text-[9px] text-green-400/75 mt-2 leading-snug px-1">Hope you had a great time at Aurous. See you again soon!</p>`;
            actionBtnHtml = `
                <button onclick="window.deleteFromList(${index})" class="px-4 py-1.5 border border-white/10 bg-white/5 text-white/60 rounded-full text-[8px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all font-bold">
                    Delete record
                </button>
            `;
            ticketStatusClass = 'border-l-[3px] border-l-green-500';
        } else if (resData.status === 'cancelled') {
            headerBadgeHtml = `
                <div class="w-8 h-8 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-1 border border-rose-500/20">
                    <i class="fa-solid fa-circle-xmark text-rose-500 text-sm"></i>
                </div>
                <h3 class="text-sm font-bold text-white">Cancelled</h3>
                <p class="text-[7px] text-rose-500/90 font-semibold uppercase tracking-wider mt-0.5">Visit cancelled</p>
            `;
            statusMessageHtml = `<p class="text-[9px] text-white/45 mt-2 leading-snug px-1">This visit was cancelled. You can plan a new table anytime.</p>`;
            actionBtnHtml = `
                <button onclick="window.deleteFromList(${index})" class="px-4 py-1.5 border border-white/10 bg-white/5 text-white/60 rounded-full text-[8px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all font-bold">
                    Delete record
                </button>
            `;
            ticketStatusClass = 'border-l-[3px] border-l-rose-500/50';
        } else if (resData.status === 'confirmed') {
            headerBadgeHtml = `
                <div class="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-1 border border-green-500/25">
                    <i class="fa-solid fa-check text-green-400 text-sm"></i>
                </div>
                <h3 class="text-sm font-bold text-white">You're all set</h3>
                <p class="text-[7px] text-green-400/90 font-semibold uppercase tracking-wider mt-0.5">Table confirmed</p>
            `;
            statusMessageHtml = `<p class="text-[9px] text-green-400/75 mt-2 leading-snug px-1">Table confirmed ” we can't wait to welcome you at Aurous.</p>`;
            actionBtnHtml = `
                <button id="cancel-res-btn" data-index="${index}" class="px-4 py-1.5 border border-rose-500/30 bg-rose-500/5 text-rose-500 rounded-full text-[8px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all font-bold">
                    Cancel visit
                </button>
            `;
            ticketStatusClass = 'border-l-[3px] border-l-green-500';
        } else {
            headerBadgeHtml = `
                <div class="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-1 border border-amber-500/20">
                    <i class="fa-solid fa-clock text-amber-500 text-sm"></i>
                </div>
                <h3 class="text-sm font-bold text-white">Pending</h3>
                <p class="text-[7px] text-amber-500/90 font-semibold uppercase tracking-wider mt-0.5">We'll confirm soon</p>
            `;
            statusMessageHtml = `<p class="text-[9px] text-white/40 mt-2 leading-snug px-1">Our team will reach out shortly. Keep your phone handy.</p>`;
            actionBtnHtml = `
                <button id="cancel-res-btn" data-index="${index}" class="px-4 py-1.5 border border-rose-500/30 bg-rose-500/5 text-rose-500 rounded-full text-[8px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all font-bold">
                    Cancel visit
                </button>
            `;
            ticketStatusClass = 'border-l-[3px] border-l-amber-500';
        }

        myResContent.innerHTML = `
            <button onclick="openMyRes()" class="text-white/40 hover:text-white sticky top-0 left-0 z-10 mb-2 text-[8px] tracking-widest uppercase font-bold transition-all flex items-center gap-1 active:scale-95 bg-[#0a0a0a]/90 py-1">
                <i class="fas fa-arrow-left text-[10px]"></i> Back
            </button>

            <div class="pt-1 pb-1">
                ${headerBadgeHtml}
            </div>

            <div class="relative bg-white/[0.02] border border-white/10 rounded-xl p-3 mt-2 overflow-hidden text-left ${ticketStatusClass}">
                <div class="flex justify-between items-center gap-2 mb-1.5">
                    <span class="text-[7px] uppercase tracking-[0.2em] text-[#E0115F] font-bold">Aurous Restro</span>
                    <span class="text-[7px] uppercase font-semibold text-white/25">#${resData.id || index + 1}</span>
                </div>
                <h4 class="text-xs font-bold text-white uppercase mb-2">${resData.name}</h4>

                <div class="border-t border-dashed border-white/10 my-2"></div>

                <div class="grid grid-cols-2 gap-x-2 gap-y-2">
                    <div>
                        <span class="text-[6.5px] uppercase tracking-wider text-white/30 block">Date</span>
                        <div class="text-[9px] font-semibold text-white leading-tight mt-0.5">
                            <i class="fa-regular fa-calendar-days text-[#E0115F] mr-0.5 text-[8px]"></i>${formattedDate}
                        </div>
                    </div>
                    <div>
                        <span class="text-[6.5px] uppercase tracking-wider text-white/30 block">Time</span>
                        <div class="text-[9px] font-semibold text-white leading-tight mt-0.5">
                            <i class="fa-regular fa-clock text-[#E0115F] mr-0.5 text-[8px]"></i>${formattedTime}
                        </div>
                    </div>
                    <div>
                        <span class="text-[6.5px] uppercase tracking-wider text-white/30 block">Guests</span>
                        <div class="text-[9px] font-semibold text-white leading-tight mt-0.5">
                            <i class="fa-solid fa-users text-[#E0115F] mr-0.5 text-[8px]"></i>${resData.guest_count}
                        </div>
                    </div>
                    <div>
                        <span class="text-[6.5px] uppercase tracking-wider text-white/30 block">Occasion</span>
                        <div class="text-[9px] font-semibold text-white capitalize leading-tight mt-0.5">
                            <i class="fa-solid fa-martini-glass text-[#E0115F] mr-0.5 text-[8px]"></i>${resData.occasion.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                ${buildBookingOrderList(resData)}
            </div>

            ${statusMessageHtml}

            <div class="mt-3 pt-2.5 border-t border-white/5">
                ${actionBtnHtml}
            </div>
        `;
    };

    window.openMyRes = async function () {
        const localList = getReservations();


        if (localList.length > 0) {
            const ids = localList.map(r => r.id).filter(id => id !== undefined);
            if (ids.length > 0) {
                try {
                    const response = await fetch('/api/reservations/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids })
                    });
                    if (response.ok) {
                        const updatedList = await response.json();
                        const mergedList = localList.map(localRes => {
                            const match = updatedList.find(u => u.id === localRes.id);
                            if (match) {
                                return { ...localRes, ...match };
                            }
                            return localRes;
                        });
                        const activeList = mergedList.filter(r => r.deleted_by_user !== 1);
                        localStorage.setItem('user_reservations', JSON.stringify(activeList));
                    }
                } catch (err) {
                    console.error('Failed to sync reservations:', err);
                }
            }
        }

        const resList = getReservations();

        if (resList.length > 0) {
            myResContent.innerHTML = `
                <div class="mb-3">
                    <h3 class="text-base font-black text-white tracking-tight">At Aurous</h3>
                    <div class="w-5 h-[2px] bg-[#E0115F] mx-auto mt-1 rounded-full"></div>
                    <p class="text-[7px] text-white/35 font-medium mt-1.5">${resList.length} upcoming visit${resList.length > 1 ? 's' : ''}</p>
                </div>
                <div class="space-y-2 max-h-[300px] overflow-y-auto pr-0.5 custom-scroll text-left">
                    ${resList.map((res, i) => {
                const [y, m_idx, d_idx] = res.date.split('-').map(Number);
                const d = new Date(y, m_idx - 1, d_idx);
                const day = d.getDate();
                const month = d.toLocaleDateString('en-US', { month: 'short' });

                let actionHtml = '';
                let statusBadgeHtml = '';
                let borderStyle = '';
                let glowStyle = '';

                if (res.status === 'completed') {
                    statusBadgeHtml = `<span style="color: #2ecc71; font-weight: 700; text-transform: uppercase; font-size: 0.55rem; background: rgba(46,204,113,0.08); padding: 2px 6px; border-radius: 10px; display: inline-flex; align-items: center; gap: 2px; border: 1px solid rgba(46,204,113,0.15);"><i class="fas fa-check-circle"></i> Done</span>`;
                    actionHtml = `
                                <button onclick="event.stopPropagation(); window.deleteFromList(${i})" class="w-7.5 h-7.5 rounded-full bg-white/5 text-white/40 hover:bg-[#ff4444]/20 hover:text-[#ff4444] hover:border-[#ff4444]/30 transition-all flex items-center justify-center border border-white/10 active:scale-90" title="Delete Record">
                                    <i class="fas fa-trash-alt text-[9px]"></i>
                                </button>
                            `;
                    borderStyle = 'border-l-4 border-l-green-500/50';
                } else if (res.status === 'cancelled') {
                    statusBadgeHtml = `<span style="color: #e74c3c; font-weight: 700; text-transform: uppercase; font-size: 0.55rem; background: rgba(231,76,60,0.08); padding: 2px 6px; border-radius: 10px; display: inline-flex; align-items: center; gap: 2px; border: 1px solid rgba(231,76,60,0.15);"><i class="fas fa-times-circle"></i> Cancelled</span>`;
                    actionHtml = `
                                <button onclick="event.stopPropagation(); window.deleteFromList(${i})" class="w-7.5 h-7.5 rounded-full bg-white/5 text-white/40 hover:bg-[#ff4444]/20 hover:text-[#ff4444] hover:border-[#ff4444]/30 transition-all flex items-center justify-center border border-white/10 active:scale-90" title="Delete Record">
                                    <i class="fas fa-trash-alt text-[9px]"></i>
                                </button>
                            `;
                    borderStyle = 'border-l-4 border-l-rose-500/30';
                } else if (res.status === 'confirmed') {
                    statusBadgeHtml = `<span style="color: #2ecc71; font-weight: 700; text-transform: uppercase; font-size: 0.55rem; background: rgba(46,204,113,0.1); padding: 2px 6px; border-radius: 10px; display: inline-flex; align-items: center; gap: 2px; border: 1px solid rgba(46,204,113,0.25); box-shadow: 0 0 6px rgba(46,204,113,0.12);"><i class="fas fa-circle-check animate-pulse text-green-400"></i> Confirmed</span>`;
                    actionHtml = `
                                <button onclick="event.stopPropagation(); window.cancelFromList(${i})" class="w-7.5 h-7.5 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500/30 transition-all flex items-center justify-center border border-rose-500/20 active:scale-90" title="Cancel visit">
                                    <i class="fas fa-ban text-[9px]"></i>
                                </button>
                            `;
                    borderStyle = 'border-l-4 border-l-green-500';
                    glowStyle = 'box-shadow: 0 0 10px rgba(46, 204, 113, 0.06);';
                } else {
                    statusBadgeHtml = `<span style="color: #f39c12; font-weight: 700; text-transform: uppercase; font-size: 0.55rem; background: rgba(243,156,18,0.08); padding: 2px 6px; border-radius: 10px; display: inline-flex; align-items: center; gap: 2px; border: 1px solid rgba(243,156,18,0.15);"><i class="fas fa-clock animate-pulse"></i> Pending</span>`;
                    actionHtml = `
                                <button onclick="event.stopPropagation(); window.cancelFromList(${i})" class="w-7.5 h-7.5 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500/30 transition-all flex items-center justify-center border border-rose-500/20 active:scale-90" title="Cancel visit">
                                    <i class="fas fa-ban text-[9px]"></i>
                                </button>
                            `;
                    borderStyle = 'border-l-4 border-l-amber-500';
                }

                return `
                        <div class="bg-white/[0.015] border border-white/5 hover:border-white/10 p-2.5 rounded-xl transition-all flex items-center justify-between group active:scale-[0.99] ${borderStyle}" style="${glowStyle}">
                            <div class="flex items-center gap-3 cursor-pointer flex-1" onclick="openResDetail(${i})">
                                <div class="w-8.5 h-8.5 rounded-lg bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center flex-shrink-0">
                                    <span class="text-[7px] uppercase font-bold text-[#E0115F] leading-none">${month}</span>
                                    <span class="text-xs font-black text-white leading-none mt-0.5">${day}</span>
                                </div>
                                <div class="min-w-0">
                                    <div class="text-[11px] font-bold text-white tracking-wide">${res.hour}:${res.minute} ${res.ampm}</div>
                                    <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
                                        <span class="text-[7.5px] text-white/30 font-bold uppercase tracking-wider"><i class="fas fa-users text-[#E0115F]/70 mr-0.5"></i> ${res.guest_count} PPL</span>
                                        ${statusBadgeHtml}
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5 flex-shrink-0">
                                ${actionHtml}
                            </div>
                        </div>
                        `;
            }).join('')}
                </div>
            `;
        } else {
            myResContent.innerHTML = `
                <div class="py-10">
                    <div class="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-5 border border-white/5">
                        <i class="fa-solid fa-calendar-xmark text-white/10 text-2xl"></i>
                    </div>
                    <h3 class="text-base font-bold text-white tracking-tight">No visits yet</h3>
                    <p class="text-[9px] text-white/40 mt-2 max-w-[190px] mx-auto leading-relaxed">Plan a table at Aurous ” we'd love to host you.</p>
                </div>
            `;
        }

        myResModal.classList.remove('opacity-0', 'pointer-events-none');
        myResBox.classList.remove('translate-y-10');
        myResBox.classList.add('translate-y-0');
        document.body.style.overflow = 'hidden';
    };

    window.cancelFromList = async function (index) {
        if (confirm('Cancel this visit at Aurous?')) {
            let resList = getReservations();
            const resData = resList[index];

            if (resData && resData.id) {
                try {
                    const response = await fetch(`/api/reservations/${resData.id}/cancel`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (response.ok) {
                        resList[index].status = 'cancelled';
                        localStorage.setItem('user_reservations', JSON.stringify(resList));
                    }
                } catch (err) {
                    console.error('Error cancelling reservation:', err);
                }
            } else {
                resList.splice(index, 1);
                localStorage.setItem('user_reservations', JSON.stringify(resList));
            }

            checkResStatus();
            openMyRes();
        }
    };

    window.deleteFromList = async function (index) {
        if (confirm('Remove this visit from your list?')) {
            let resList = getReservations();
            const resData = resList[index];

            if (resData && resData.id) {
                try {
                    await fetch(`/api/reservations/${resData.id}/user-delete`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' }
                    });
                } catch (err) {
                    console.error('Error deleting reservation:', err);
                }
            }

            resList.splice(index, 1);
            localStorage.setItem('user_reservations', JSON.stringify(resList));
            checkResStatus();
            openMyRes();
        }
    };

    function closeMyRes() {
        myResModal.classList.add('opacity-0', 'pointer-events-none');
        myResBox.classList.remove('translate-y-0');
        myResBox.classList.add('translate-y-10');
        document.body.style.overflow = '';
    }

    if (openLoginBtn) openLoginBtn.addEventListener('click', openLogin);
    if (openListViewBtn) openListViewBtn.addEventListener('click', window.openMyRes);
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLogin);
    if (closeLoginBg) closeLoginBg.addEventListener('click', closeLogin);

    if (closeMyResBtn) closeMyResBtn.addEventListener('click', closeMyRes);
    if (closeMyResBg) closeMyResBg.addEventListener('click', closeMyRes);


    document.addEventListener('click', async (e) => {
        if (e.target && e.target.closest('#cancel-res-btn')) {
            const btn = e.target.closest('#cancel-res-btn');
            const index = parseInt(btn.dataset.index);
            if (confirm('Cancel this visit at Aurous?')) {
                let resList = getReservations();
                const resData = resList[index];

                if (resData && resData.id) {
                    try {
                        const response = await fetch(`/api/reservations/${resData.id}/cancel`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        if (response.ok) {
                            resList[index].status = 'cancelled';
                            localStorage.setItem('user_reservations', JSON.stringify(resList));
                        }
                    } catch (err) {
                        console.error('Error cancelling reservation:', err);
                    }
                } else {
                    resList.splice(index, 1);
                    localStorage.setItem('user_reservations', JSON.stringify(resList));
                }

                checkResStatus();
                if (window.showToast) window.showToast('Visit cancelled');
                openMyRes();
            }
        }
    });


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

    const foods = ['🍅', '🥒', '🥬', '🌭', '🌮', '🧂', '🥓', '🥚', '🧇', '🥞', '🧈', '🥨', '🥟', '🥨', '🥯', '🥖', '🧀', '🥗', '🥙', '🥪', '🌮', '🌯', '🥫', '🥘', '🍗', '🥩', '🍠', '🥟', '🥠', '🥡', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🦪', '🍣', '🍤', '🍥', '🥮', '🍢', '🧆', '🥘', '🍲', '🥣', '🥧', '🍦', '🍧', '🍨', '🍩', '🍹', '🍷', '🥂'];

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
    }

    const musicPlayerWidget = document.getElementById('music-player-widget');
    if (musicPlayerWidget) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > window.innerHeight * 0.5) {
                musicPlayerWidget.classList.add('opacity-0', 'pointer-events-none');
                musicPlayerWidget.classList.remove('opacity-100', 'pointer-events-auto');
            } else {
                musicPlayerWidget.classList.remove('opacity-0', 'pointer-events-none');
                musicPlayerWidget.classList.add('opacity-100', 'pointer-events-auto');
            }
        });

        musicPlayerWidget.addEventListener('click', (e) => {

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


        musicPlayerWidget.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768 && !isMusicPlaying) {

            }
        });
    }

    if (bgMusic && playStatus) {
        const playToggleLabel = playStatus.closest('label');

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


        if (typeof id === 'number' || !isNaN(parseInt(id))) {
            try {
                const response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
                if (response.ok) {

                    if (window.apiReviews) {
                        window.apiReviews = window.apiReviews.filter(r => r.id != id);
                    }
                }
            } catch (err) {
                console.log('API delete failed, trying local:', err);
            }
        }


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

        let allReviews = [...(window.apiReviews || []), ...getStoredReviews()];

        let deletedDefaults = JSON.parse(localStorage.getItem('deleted_default_reviews') || '[]');
        allReviews = allReviews.filter(r => !deletedDefaults.includes(r.id));
        allReviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (filterStars > 0) {
            allReviews = allReviews.filter(r => Math.floor(r.rating) === filterStars);
        }

        if (containerId === 'reviews-container') {
            allReviews = allReviews.filter(r => r.is_pinned).slice(0, 2);
        } else if (limit) {
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
                    reply_text: r.reply_text,
                    is_pinned: r.is_pinned
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


                    await loadReviewsFromAPI();
                    window.showToast("Review submitted successfully! âœ¨");
                } else {
                    window.showToast("âŒ Failed to submit review.");
                }
            } catch (error) {
                console.error("Error submitting review:", error);
                window.showToast("âŒ Connection error.");
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
        if (reservationModal && reservationBox) {
            reservationModal.classList.remove('opacity-0', 'pointer-events-none');
            document.body.style.overflow = 'hidden';

            // Set today as min date
            const dateInput = document.getElementById('reserve-date');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.min = today;
                if (!dateInput.value) dateInput.value = today;
            }

            if (typeof gsap !== 'undefined') {
                gsap.fromTo(reservationBox,
                    { y: 60, opacity: 0, scale: 0.96 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'power4.out' }
                );
            } else {
                reservationBox.style.opacity = '1';
            }
        }
    }

    function closeReservation(e) {
        if (e) e.preventDefault();
        if (reservationModal && reservationBox) {
            if (typeof gsap !== 'undefined') {
                gsap.to(reservationBox, {
                    y: 40, opacity: 0, scale: 0.96, duration: 0.3, ease: 'power3.in',
                    onComplete: () => {
                        reservationModal.classList.add('opacity-0', 'pointer-events-none');
                        document.body.style.overflow = '';
                        gsap.set(reservationBox, { clearProps: 'all' });
                    }
                });
            } else {
                reservationModal.classList.add('opacity-0', 'pointer-events-none');
                document.body.style.overflow = '';
            }
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


            const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
            const parts = new Intl.DateTimeFormat('en-IN', options).formatToParts(d);
            const istYear = parts.find(p => p.type === 'year').value;
            const istMonth = parts.find(p => p.type === 'month').value;
            const istDay = parts.find(p => p.type === 'day').value;

            const dateStr = `${istYear}-${istMonth}-${istDay}`;


            const istDateObj = new Date(istYear, parseInt(istMonth) - 1, parseInt(istDay));
            const dayName = days[istDateObj.getDay()];
            const monthName = months[istDateObj.getMonth()];
            const dateNum = istDateObj.getDate();

            const div = document.createElement('div');
            div.className = 'snap-center h-[37px] flex flex-col md:flex-row items-center justify-center text-white/50 cursor-pointer transition-all duration-300 wheel-item select-none gap-0 md:gap-1.5';
            div.dataset.value = dateStr;
            div.innerHTML = `<span class="text-[7.5px] md:text-[11px] uppercase tracking-widest font-black md:font-bold mb-0.5 md:mb-0">${dayName}</span><span class="text-[9.5px] md:text-[11px] font-bold">${monthName} ${dateNum}</span>`;
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

        const ampmValues = ['PM'];
        ampmValues.forEach(v => {
            const div = document.createElement('div');
            div.className = 'snap-center h-[37px] flex items-center justify-center text-white/50 text-[13px] md:text-base font-black cursor-pointer transition-all duration-300 wheel-item select-none';
            div.dataset.value = v;
            div.innerHTML = v;
            wheelAmpm.appendChild(div);
        });


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
                    const responseData = await response.json();
                    formData.id = responseData.id;
                    closeReservation();
                    setTimeout(() => {
                        const successModal = document.getElementById('success-modal');
                        const successMessage = document.getElementById('success-message');
                        if (successModal) {
                            if (successMessage) {
                                const name = formData.name.split(' ')[0];
                                const [y, m_idx, d_idx] = formData.date.split('-').map(Number);
                                const dateObj = new Date(y, m_idx - 1, d_idx);
                                const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
                                const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
                                const formattedTime = `${formData.hour}:${formData.minute} ${formData.ampm}`;

                                const occasionText = formData.occasion !== 'casual' ? ` for your ${formData.occasion.replace('_', ' ')}` : '';
                                successMessage.innerHTML = `See you soon, ${name}${occasionText}!<br>Meet you on ${formattedDate} at ${formattedTime}.`;
                            }


                            formData.status = responseData.status || 'pending';
                            formData.created_at = responseData.created_at || null;


                            const resList = getReservations();
                            resList.push(formData);
                            localStorage.setItem('user_reservations', JSON.stringify(resList));

                            checkResStatus();

                            successModal.classList.add('active');


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


                            const closeSuccess = () => {
                                successModal.classList.remove('active');
                                successModal.removeEventListener('click', closeSuccess);
                            };
                            successModal.addEventListener('click', closeSuccess);


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
                    window.showToast("âŒ Failed to reserve table.");
                }
            } catch (error) {
                console.error("Error submitting reservation:", error);
                window.showToast("âŒ Connection error.");
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
            <div id="gallery-modal" class="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between py-12 md:py-16 opacity-0 transition-opacity duration-300">
                <button onclick="closeGallery()" class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-[#E0115F] transition-colors z-50 group">
                    <i class="fa-solid fa-xmark text-lg group-hover:scale-110 transition-transform"></i>
                </button>

                <!-- Centered Image Container -->
                <div class="relative w-full flex-grow flex items-center justify-center px-4 md:px-16 mt-8">
                    <img id="gallery-image" src="${images[0]}" class="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl transition-all duration-300 transform scale-95">

                    <button id="gallery-prev" class="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#E0115F] backdrop-blur-md transition-all z-50 ${images.length <= 1 ? 'hidden' : ''}">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>

                    <button id="gallery-next" class="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#E0115F] backdrop-blur-md transition-all z-50 ${images.length <= 1 ? 'hidden' : ''}">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>

                <!-- Bottom Wrapper for Text and Dots -->
                <div class="w-full flex flex-col items-center gap-4 px-6 mt-4 shrink-0">
                    <div class="flex gap-3" id="gallery-dots">
                        ${images.map((_, i) => `<div class="w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-[#E0115F] scale-125' : 'bg-white/30'} transition-all duration-300"></div>`).join('')}
                    </div>
                    
                    <div id="gallery-review-text" class="max-w-3xl text-center text-white/80 text-xs md:text-sm italic font-light transition-opacity duration-300 leading-relaxed px-4">
                        "${text}"
                    </div>
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


    const navLinksMapping = {
        'hero': document.getElementById('nav-home'),
        'vibe': document.getElementById('nav-vibe'),
        'menu': document.getElementById('nav-menu'),
        'location': document.getElementById('nav-map'),
        'echoes': document.getElementById('nav-echoes')
    };

    const sections = ['hero', 'vibe', 'menu', 'location', 'echoes'];

    window.addEventListener('scroll', () => {
        let currentActive = 'hero';
        const scrollPosition = window.scrollY + window.innerHeight / 2;

        for (const id of sections) {
            const el = document.getElementById(id);
            if (el) {
                const top = el.offsetTop;
                if (scrollPosition >= top) {
                    currentActive = id;
                }
            }
        }

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 120) {
            currentActive = 'echoes';
        }

        if (window.scrollY < 50) {
            currentActive = 'hero';
        }

        Object.keys(navLinksMapping).forEach(key => {
            if (key === currentActive) {
                navLinksMapping[key]?.classList.add('active');
            } else {
                navLinksMapping[key]?.classList.remove('active');
            }
        });
    });

    window.closeGallery = function () {
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

    // Signature Items 
    async function loadSignatures() {
        const menuScroll = document.getElementById('menu-scroll');
        if (!menuScroll) return;

        try {
            const response = await fetch('/api/menu');
            if (response.ok) {
                const data = await response.json();
                const signatures = data.filter(item => item.is_signature && item.is_available);

                menuScroll.innerHTML = '';

                if (signatures.length === 0) {
                    menuScroll.innerHTML = '<div class="text-white/50 text-center w-full py-10">No signature items available at the moment.</div>';
                    return;
                }

                signatures.forEach(item => {
                    const price = typeof item.price === 'number' ? `₹${item.price}` : '';
                    const imgUrl = item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1469';
                    const desc = item.description || '';

                    const html = `
                        <div class="snap-center shrink-0 w-[85vw] md:w-[400px] bg-white/5 rounded-3xl p-4 border border-white/5 group hover:border-white/20 transition-all">
                            <div class="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-4 md:mb-6 relative">
                                <img src="${imgUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${item.name}">
                                <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/10">${price}</div>
                            </div>
                            <div class="px-2 pb-2">
                                <h3 class="text-2xl font-bold mb-2">${item.name}</h3>
                                <p class="text-white/50 text-sm font-light">${desc}</p>
                            </div>
                        </div>
                    `;
                    menuScroll.insertAdjacentHTML('beforeend', html);
                });
            }
        } catch (error) {
            console.error('Error loading signatures:', error);
            menuScroll.innerHTML = '<div class="text-white/50 text-center w-full py-10">Failed to load signatures.</div>';
        }
    }

    // Call loadSignatures if we are on a page with the menu-scroll container
    if (document.getElementById('menu-scroll')) {
        loadSignatures();
    }

    // VIBE GALLERY COMPONENT
    const vibeContainer = document.getElementById('vibe-gallery-container');
    console.log('ðŸŽ¬ Vibe Gallery Component Initializing...');
    if (vibeContainer) {
        let vibePhotos = [];
        let currentVibeIndex = 0;
        let vibeAutoPlayTimer = null;
        let isVibeExpanded = false;

        const bgBlurImg = document.getElementById('vibe-bg-blur');
        const activeImg = document.getElementById('vibe-active-img');
        const activeCard = document.getElementById('vibe-active-card');
        const captionTextEl = document.getElementById('vibe-caption-text');
        const activeSub = document.getElementById('vibe-active-sub');
        const likesCountSpan = document.getElementById('vibe-likes-count');
        const likeBtn = document.getElementById('like-vibe-btn');
        const heartIcon = document.getElementById('vibe-heart-icon');
        const bigHeart = document.getElementById('big-vibe-heart');
        const prevBtn = document.getElementById('vibe-prev');
        const nextBtn = document.getElementById('vibe-next');

        function escapeVibeHtml(str) {
            if (!str) return '';
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        const likedVibeStorageKey = 'aurous_vibe_liked_photos_v4';
        const getLikedVibeIds = () => {
            try {
                const stored = localStorage.getItem(likedVibeStorageKey);
                return stored ? JSON.parse(stored) : [];
            } catch (err) {
                return [];
            }
        };
        const likedVibeIds = new Set(getLikedVibeIds());

        const getPhotoKey = (photo) => {
            if (!photo) return '';
            return photo.id ? `id_${photo.id}` : `url_${photo.image_url}`;
        };

        const hasLikedVibePhoto = (photo) => {
            const key = getPhotoKey(photo);
            return key ? likedVibeIds.has(key) : false;
        };

        const rememberLikedVibePhoto = (photo) => {
            const key = getPhotoKey(photo);
            if (key) {
                likedVibeIds.add(key);
                try {
                    localStorage.setItem(likedVibeStorageKey, JSON.stringify(Array.from(likedVibeIds)));
                } catch (err) {
                    console.warn('Unable to save liked vibes locally.', err);
                }
            }
        };

        const updateLikeButtonState = (photo) => {
            if (!likeBtn || !heartIcon) return;
            const isLiked = hasLikedVibePhoto(photo);
            if (isLiked) {
                heartIcon.className = "fa-solid fa-heart text-[#E0115F] scale-110";
                likeBtn.classList.add('border-[#E0115F]/60', 'bg-[#E0115F]/25');
                likeBtn.classList.remove('bg-black/60', 'border-white/20');
            } else {
                heartIcon.className = "fa-regular fa-heart text-white";
                likeBtn.classList.remove('border-[#E0115F]/60', 'bg-[#E0115F]/25');
                likeBtn.classList.add('bg-black/60', 'border-white/20');
            }
        };

        // Pre-cache queue — always keep next & previous image loaded in memory
        const imageCache = new Map();
        let isRendering = false;

        const preloadImage = (url) => {
            if (!url || imageCache.has(url)) return;
            const img = new Image();
            img.src = url;
            imageCache.set(url, img);
        };

        const preCacheNeighbours = (index) => {
            const prev = (index - 1 + vibePhotos.length) % vibePhotos.length;
            const next = (index + 1) % vibePhotos.length;
            if (vibePhotos[prev]) preloadImage(vibePhotos[prev].image_url);
            if (vibePhotos[next]) preloadImage(vibePhotos[next].image_url);
        };

        const fallbackVibePhotos = [
            { id: 1, image_url: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1470", likes: 142, caption: "Aurous Moments \u2022 Experience the extraordinary vibe \u2728" },
            { id: 2, image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1470", likes: 98, caption: "Crafted to perfection \u2022 Every sip a memory \u{1F378}" },
            { id: 3, image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1470", likes: 75, caption: "Warm ambience & golden nights \u2022 Welcome to Aurous \u{1F942}" }
        ];

        const fetchVibePhotos = async () => {
            try {
                // Fetch with limit for initial load; rest loads lazily if user scrolls to next
                const res = await fetch('/api/vibe-photos?limit=50&offset=0');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        vibePhotos = data;
                    }
                }
            } catch (err) {
                console.warn("Vibe photos fetch warning:", err);
            }

            if (!vibePhotos || vibePhotos.length === 0) {
                vibePhotos = fallbackVibePhotos;
            }

            // Pre-cache first 3 images immediately
            preloadImage(vibePhotos[0]?.image_url);
            preloadImage(vibePhotos[1]?.image_url);
            preloadImage(vibePhotos[2]?.image_url);
            renderVibePhoto(0);
            startVibeAutoplay();
        };

        const renderVibePhoto = (index) => {
            if (!vibePhotos[index] || isRendering) return;
            isRendering = true;
            const photo = vibePhotos[index];

            // Fade out — only opacity+transform (GPU composited, zero layout cost)
            activeCard.style.opacity = '0';
            activeCard.style.transform = 'scale(0.97) translateY(6px)';

            // Pre-cache neighbours in background while fading
            preCacheNeighbours(index);

            const applyPhoto = () => {
                // Update main image
                activeImg.src = photo.image_url;

                // Update background blur only if already cached (prevents freeze)
                if (bgBlurImg) {
                    if (imageCache.has(photo.image_url)) {
                        bgBlurImg.src = photo.image_url;
                    } else {
                        // Set after load to avoid decode block
                        const tmpImg = new Image();
                        tmpImg.onload = () => { bgBlurImg.src = photo.image_url; };
                        tmpImg.src = photo.image_url;
                    }
                }

                if (likesCountSpan) likesCountSpan.textContent = photo.likes || 0;

                if (captionTextEl) {
                    if (photo.caption && photo.caption.trim()) {
                        captionTextEl.textContent = photo.caption.trim();
                    } else {
                        captionTextEl.textContent = 'Aurous Moments \u2022 Experience the extraordinary vibe \u2728';
                    }
                }

                if (activeSub) {
                    activeSub.textContent = photo.created_at
                        ? '\u2022 ' + new Date(photo.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : '\u2022 Featured';
                }

                updateLikeButtonState(photo);

                // Fade in — requestAnimationFrame guarantees DOM painted before transition
                requestAnimationFrame(() => {
                    activeCard.style.opacity = '1';
                    activeCard.style.transform = 'scale(1) translateY(0)';
                    isRendering = false;
                });
            };

            // If image is already cached, apply instantly after fade-out
            if (imageCache.has(photo.image_url)) {
                setTimeout(applyPhoto, 200);
            } else {
                // Preload, then apply — prevents blank flash
                const img = new Image();
                img.onload = () => {
                    imageCache.set(photo.image_url, img);
                    setTimeout(applyPhoto, 200);
                };
                img.onerror = () => setTimeout(applyPhoto, 200);
                img.src = photo.image_url;
                imageCache.set(photo.image_url, img);
            }
        };

        let isLikingInProgress = false;
        const handleVibeLike = async () => {
            if (vibePhotos.length === 0 || isLikingInProgress) return;
            const photo = vibePhotos[currentVibeIndex];
            if (!photo) return;

            // Check if 1 device already liked (1 Phone 1 Like)
            if (hasLikedVibePhoto(photo)) {
                if (bigHeart) {
                    bigHeart.style.transform = 'scale(1)';
                    bigHeart.style.opacity = '1';
                    setTimeout(() => {
                        bigHeart.style.transform = 'scale(0)';
                        bigHeart.style.opacity = '0';
                    }, 400);
                }
                if (window.showToast) window.showToast('❤️ You already liked this photo!');
                return;
            }

            isLikingInProgress = true;
            rememberLikedVibePhoto(photo);
            updateLikeButtonState(photo);

            // Optimistic update
            photo.likes = (photo.likes || 0) + 1;
            if (likesCountSpan) {
                likesCountSpan.textContent = photo.likes;
                likesCountSpan.classList.add('count-pop');
                setTimeout(() => likesCountSpan.classList.remove('count-pop'), 400);
            }

            // Big heart animation
            if (bigHeart) {
                bigHeart.style.transform = 'scale(1.2)';
                bigHeart.style.opacity = '1';
                setTimeout(() => {
                    bigHeart.style.transform = 'scale(0)';
                    bigHeart.style.opacity = '0';
                }, 600);
            }

            try {
                const res = await fetch(`/api/vibe-photos/${photo.id}/like`, { method: 'POST' });
                if (res.ok) {
                    const updatedPhoto = await res.json();
                    photo.likes = updatedPhoto.likes;
                    if (photo.id < 0 && updatedPhoto.id > 0) {
                        photo.id = updatedPhoto.id;
                        rememberLikedVibePhoto(photo);
                    }
                    if (likesCountSpan) likesCountSpan.textContent = photo.likes;
                }
            } catch (err) {
                console.error("Failed to persist like:", err);
            } finally {
                isLikingInProgress = false;
            }
        };

        const startVibeAutoplay = () => {
            stopVibeAutoplay();
            if (isVibeExpanded) return;
            vibeAutoPlayTimer = setInterval(() => {
                if (vibePhotos.length > 0) {
                    currentVibeIndex = (currentVibeIndex + 1) % vibePhotos.length;
                    renderVibePhoto(currentVibeIndex);
                }
            }, 5000);
        };

        const stopVibeAutoplay = () => {
            if (vibeAutoPlayTimer) clearInterval(vibeAutoPlayTimer);
        };

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stopVibeAutoplay();
            currentVibeIndex = (currentVibeIndex - 1 + vibePhotos.length) % vibePhotos.length;
            renderVibePhoto(currentVibeIndex);
            startVibeAutoplay();
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stopVibeAutoplay();
            currentVibeIndex = (currentVibeIndex + 1) % vibePhotos.length;
            renderVibePhoto(currentVibeIndex);
            startVibeAutoplay();
        });

        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleVibeLike();
        });

        let lastTap = 0;
        let suppressNextClick = false;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        const handleSwipeNavigation = (deltaX) => {
            if (!vibePhotos.length) return;
            if (Math.abs(deltaX) < 55) return;
            suppressNextClick = true;
            stopVibeAutoplay();
            currentVibeIndex = deltaX < 0
                ? (currentVibeIndex + 1) % vibePhotos.length
                : (currentVibeIndex - 1 + vibePhotos.length) % vibePhotos.length;
            renderVibePhoto(currentVibeIndex);
            startVibeAutoplay();
        };

        activeCard.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
            console.log('ðŸ‘‰ Touch START:', { x: touchStartX, y: touchStartY });
        }, { passive: true });

        activeCard.addEventListener('touchmove', (e) => {
            // Allow swipe to work by not preventing default on horizontal moves
        }, { passive: true });

        activeCard.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;

            console.log('âœ‹ Touch END:', { deltaX, deltaY, deltaTime });

            // Swipe detection: if horizontal distance > vertical and > threshold
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 55 && deltaTime < 500) {
                console.log('ðŸ‘ˆðŸ‘‰ SWIPE detected!', { deltaX });
                handleSwipeNavigation(deltaX);
            }
        }, { passive: true });

        activeCard.addEventListener('click', (e) => {
            console.log('activeCard clicked');
            // Don't trigger expand if we just swiped
            if (suppressNextClick) {
                console.log('Suppressing click due to swipe');
                suppressNextClick = false;
                return;
            }

            const now = Date.now();
            // Double tap to like
            if (now - lastTap < 300) {
                console.log(' Double tap detected - liking');
                handleVibeLike();
                lastTap = 0;
            } else {
                lastTap = now;
                // Single tap to expand
                console.log('Single tap detected. isVibeExpanded:', isVibeExpanded);
                if (!isVibeExpanded) {
                    console.log('Expanding gallery...');
                    expandVibeGallery();
                }
            }
        });

        vibeContainer.addEventListener('click', (e) => {
            // Only expand if clicking on the card itself, not on controls
            if (e.target.closest('#like-vibe-btn') ||
                e.target.closest('#vibe-prev') ||
                e.target.closest('#vibe-next') ||
                e.target.closest('#vibe-collapse-btn') ||
                e.target.closest('#vibe-upload-label')) {
                return;
            }
            // Clicking outside card area also expands if not already expanded
            if (!isVibeExpanded) {
                expandVibeGallery();
            }
        });


        // ===== EXPAND / COLLAPSE GALLERY LOGIC =====
        const textCard = document.getElementById('vibe-text-card');
        const collapseBtn = document.getElementById('vibe-collapse-btn');
        const uploadLabel = document.getElementById('vibe-upload-label');
        const handHint = document.getElementById('vibe-hand-hint');
        const userUploadInput = document.getElementById('vibe-user-upload');


        const expandVibeGallery = () => {
            console.log(' expandVibeGallery called, isVibeExpanded:', isVibeExpanded);
            if (isVibeExpanded) return;
            isVibeExpanded = true;

            console.log(' Adding expanded class to vibeContainer');
            // Add expanded class which makes it fixed and fullscreen
            vibeContainer.classList.add('expanded');

            console.log('vibeContainer classes:', vibeContainer.className);
            console.log(' vibeContainer.classList contains expanded:', vibeContainer.classList.contains('expanded'));

            // Show like button and overlay while expanded
            const overlayBottom = vibeContainer.querySelector('.vibe-overlay-bottom');
            if (overlayBottom) {
                overlayBottom.style.pointerEvents = 'auto';
            }
            if (likeBtn) {
                likeBtn.style.pointerEvents = 'auto';
            }

            // Stop autoplay when expanded
            stopVibeAutoplay();

            // Hide hand hint
            if (handHint) handHint.style.opacity = '0';

            // Disable page scroll
            document.body.style.overflow = 'hidden';
            console.log(' Gallery expanded successfully!');
        };

        window.collapseVibeGallery = (e) => {
            if (e) e.stopPropagation();
            if (!isVibeExpanded) return;
            isVibeExpanded = false;

            // Remove expanded class to restore normal positioning
            vibeContainer.classList.remove('expanded');

            // Hide like button and overlay when collapsed
            const overlayBottom = vibeContainer.querySelector('.vibe-overlay-bottom');
            if (overlayBottom) {
                overlayBottom.style.pointerEvents = 'none';
            }
            if (likeBtn) {
                likeBtn.style.pointerEvents = 'none';
            }

            // Show hand hint on collapse if needed
            if (handHint) {
                handHint.style.opacity = '1';
                handHint.style.display = 'flex';
            }

            // Re-enable page scroll
            document.body.style.overflow = '';
            startVibeAutoplay();
        };

        // Collapse when scrolling away
        window.addEventListener('scroll', () => {
            // If expanded, clicking outside should collapse
        }, { passive: true });

        // Hand hint stays visible and gently fades after user starts viewing/scrolling
        if (handHint) {
            setTimeout(() => {
                if (!isVibeExpanded && handHint) {
                    handHint.style.transition = 'opacity 1s ease';
                    handHint.style.opacity = '0.85';
                }
            }, 5000);
        }

        // User upload handler
        if (userUploadInput) {
            userUploadInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                const maxSize = 5 * 1024 * 1024;
                if (!allowedTypes.includes(file.type) || file.size > maxSize) {
                    if (window.showToast) window.showToast('Please upload a JPG, PNG, or WebP image under 5 MB.');
                    e.target.value = '';
                    return;
                }

                const formData = new FormData();
                formData.append('file', file);

                // Ask user for optional caption/post text
                try {
                    const caption = window.prompt('Add a caption or post text for your memory (optional):');
                    if (caption !== null && caption !== undefined && caption.trim() !== '') {
                        formData.append('caption', caption.trim());
                    }
                } catch (err) {
                    // ignore prompt errors
                }

                try {
                    const res = await fetch('/api/vibe-photos/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (res.ok) {
                        // Show nice popup instead of toast
                        const popup = document.getElementById('upload-success-popup');
                        const box = document.getElementById('upload-popup-box');
                        if (popup) {
                            popup.classList.remove('opacity-0', 'pointer-events-none');
                            popup.classList.add('opacity-100');
                            if (box) {
                                box.classList.remove('scale-90');
                                box.classList.add('scale-100');
                            }
                        }
                    } else {
                        const errorText = await res.text();
                        console.error('Upload failed:', errorText);
                        if (window.showToast) window.showToast('Upload failed. Please try again.');
                    }
                } catch (err) {
                    console.error('Upload error:', err);
                    if (window.showToast) window.showToast('Upload failed. Please try again.');
                }
                e.target.value = '';
            });
        }

        // Close upload popup
        window.closeUploadPopup = () => {
            const popup = document.getElementById('upload-success-popup');
            const box = document.getElementById('upload-popup-box');
            if (popup) {
                popup.classList.add('opacity-0', 'pointer-events-none');
                popup.classList.remove('opacity-100');
                if (box) {
                    box.classList.add('scale-90');
                    box.classList.remove('scale-100');
                }
            }
        };

        // ======================================================
        // VIBE BANNER — Multi-image carousel + Lightbox
        // ======================================================
        let bannerUrls = [];
        let bannerCurrentIdx = 0;
        let bannerAutoTimer = null;

        function buildBannerDots(container, count, activeIdx) {
            if (!container) return;
            container.innerHTML = '';
            if (count <= 1) return;
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.className = 'w-2 h-2 rounded-full transition-all duration-300 ' +
                    (i === activeIdx ? 'bg-white scale-125' : 'bg-white/30');
                dot.onclick = (e) => { e.stopPropagation(); bannerGoTo(i); };
                container.appendChild(dot);
            }
        }

        function buildBannerSlides(slidesEl, urls) {
            if (!slidesEl) return;
            slidesEl.innerHTML = '';
            slidesEl.style.width = (urls.length * 100) + '%';
            urls.forEach(url => {
                const slide = document.createElement('div');
                slide.style.width = (100 / urls.length) + '%';
                slide.className = 'flex-shrink-0 flex items-center justify-center bg-black/60 overflow-hidden h-[200px] sm:h-[280px] md:h-[385px]';
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Aurous Banner';
                img.className = 'w-full h-full object-contain select-none';
                slide.appendChild(img);
                slidesEl.appendChild(slide);
            });
        }

        function bannerGoTo(idx) {
            if (!bannerUrls.length) return;
            bannerCurrentIdx = (idx + bannerUrls.length) % bannerUrls.length;
            const slidesEl = document.getElementById('vibe-banner-slides');
            const dotsEl = document.getElementById('vibe-banner-dots');
            if (slidesEl) {
                slidesEl.style.transform = `translateX(-${bannerCurrentIdx * (100 / bannerUrls.length)}%)`;
            }
            buildBannerDots(dotsEl, bannerUrls.length, bannerCurrentIdx);
        }

        window.bannerSlide = function(dir) {
            bannerGoTo(bannerCurrentIdx + dir);
            resetBannerAutoTimer();
        };

        function startBannerAutoTimer() {
            if (bannerUrls.length <= 1) return;
            bannerAutoTimer = setInterval(() => {
                bannerGoTo(bannerCurrentIdx + 1);
            }, 2000);
        }

        function resetBannerAutoTimer() {
            clearInterval(bannerAutoTimer);
            startBannerAutoTimer();
        }

        // Touch swipe on the small banner card
        (function setupBannerCardSwipe() {
            const card = document.getElementById('vibe-banner-card');
            if (!card) return;
            let startX = 0;
            card.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
            card.addEventListener('touchend', e => {
                const dx = e.changedTouches[0].clientX - startX;
                if (Math.abs(dx) > 40) {
                    bannerSlide(dx < 0 ? 1 : -1);
                }
            }, { passive: true });
        })();

        const fetchVibeBanner = async () => {
            try {
                const res = await fetch('/api/vibe-banner');
                if (res.ok) {
                    const banner = await res.json();
                    if (banner) {
                        const bannerDesc = document.getElementById('vibe-banner-desc');
                        if (bannerDesc && banner.description) {
                            bannerDesc.textContent = banner.description;
                        }
                        if (banner.image_url) {
                            bannerUrls = banner.image_url.split(',').map(u => u.trim()).filter(Boolean);
                        } else {
                            // Fallback single image
                            bannerUrls = ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200'];
                        }
                        const slidesEl = document.getElementById('vibe-banner-slides');
                        const dotsEl = document.getElementById('vibe-banner-dots');
                        buildBannerSlides(slidesEl, bannerUrls);
                        buildBannerDots(dotsEl, bannerUrls.length, 0);
                        bannerCurrentIdx = 0;
                        if (slidesEl) slidesEl.style.transform = 'translateX(0%)';
                        startBannerAutoTimer();

                        // Seed lightbox slides too
                        buildLightboxSlides(bannerUrls);
                    }
                }
            } catch (err) {
                console.error("Error loading vibe banner:", err);
            }
        };

        // ======================================================
        // BANNER LIGHTBOX
        // ======================================================
        let lbCurrentIdx = 0;

        function buildLightboxSlides(urls) {
            const lbSlides = document.getElementById('banner-lightbox-slides');
            const lbDots = document.getElementById('banner-lightbox-dots');
            if (!lbSlides) return;
            lbSlides.innerHTML = '';
            lbSlides.style.width = (urls.length * 100) + '%';
            urls.forEach(url => {
                const slide = document.createElement('div');
                slide.style.width = (100 / urls.length) + '%';
                slide.className = 'flex-shrink-0 flex items-center justify-center';
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Aurous Banner';
                img.className = 'w-full h-auto object-contain rounded-2xl';
                img.style.maxHeight = '85vh';
                slide.appendChild(img);
                lbSlides.appendChild(slide);
            });
            buildLightboxDots(lbDots, urls.length, 0);
        }

        function buildLightboxDots(container, count, activeIdx) {
            if (!container) return;
            container.innerHTML = '';
            if (count <= 1) return;
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.className = 'w-2 h-2 rounded-full transition-all duration-300 ' +
                    (i === activeIdx ? 'bg-white scale-125' : 'bg-white/30');
                dot.onclick = (e) => { e.stopPropagation(); lightboxGoTo(i); };
                container.appendChild(dot);
            }
        }

        function lightboxGoTo(idx) {
            lbCurrentIdx = (idx + bannerUrls.length) % bannerUrls.length;
            const lbSlides = document.getElementById('banner-lightbox-slides');
            const lbDots = document.getElementById('banner-lightbox-dots');
            const counter = document.getElementById('banner-lightbox-counter');
            if (lbSlides) lbSlides.style.transform = `translateX(-${lbCurrentIdx * (100 / bannerUrls.length)}%)`;
            buildLightboxDots(lbDots, bannerUrls.length, lbCurrentIdx);
            if (counter) counter.textContent = `${lbCurrentIdx + 1} / ${bannerUrls.length}`;
        }

        window.lightboxSlide = function(dir) { lightboxGoTo(lbCurrentIdx + dir); };

        window.openBannerLightbox = function(startIdx) {
            if (!bannerUrls.length) return;
            const lb = document.getElementById('banner-lightbox');
            if (!lb) return;
            lb.classList.remove('opacity-0', 'pointer-events-none');
            lb.classList.add('opacity-100');
            document.body.style.overflow = 'hidden';
            clearInterval(bannerAutoTimer);
            lbCurrentIdx = startIdx || bannerCurrentIdx;
            lightboxGoTo(lbCurrentIdx);
        };

        window.closeBannerLightbox = function() {
            const lb = document.getElementById('banner-lightbox');
            if (!lb) return;
            lb.classList.add('opacity-0', 'pointer-events-none');
            lb.classList.remove('opacity-100');
            document.body.style.overflow = '';
            startBannerAutoTimer();
        };

        // Touch swipe inside lightbox (mobile)
        (function setupLightboxSwipe() {
            const wrapper = document.getElementById('banner-lightbox-slides-wrapper');
            if (!wrapper) return;
            let startX = 0;
            wrapper.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
            wrapper.addEventListener('touchend', e => {
                const dx = e.changedTouches[0].clientX - startX;
                if (Math.abs(dx) > 40) lightboxSlide(dx < 0 ? 1 : -1);
            }, { passive: true });
        })();

        // Keyboard arrow navigation for lightbox
        document.addEventListener('keydown', e => {
            const lb = document.getElementById('banner-lightbox');
            if (!lb || lb.classList.contains('opacity-0')) return;
            if (e.key === 'ArrowRight') lightboxSlide(1);
            if (e.key === 'ArrowLeft') lightboxSlide(-1);
            if (e.key === 'Escape') closeBannerLightbox();
        });

        fetchVibePhotos();
        fetchVibeBanner();
    }

});



