document.addEventListener('DOMContentLoaded', () => {


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


    if (preloader) {
        const loaderTL = gsap.timeline({
            delay: 0.2,
            onUpdate: function() {
                const progress = Math.floor(this.progress() * 100);
                if (counter) counter.innerText = progress + "%";


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
        } catch(e) { resList = []; }


        const oldRes = localStorage.getItem('user_reservation');
        if (oldRes) {
            try {
                const p = JSON.parse(oldRes);
                if (p) resList.push(p);
            } catch(e){}
            localStorage.removeItem('user_reservation');
            localStorage.setItem('user_reservations', JSON.stringify(resList));
        }


        const now = new Date();
        now.setHours(0,0,0,0);
        resList = resList.filter(r => {
            if(!r.date) return false;
            const rDate = new Date(r.date);
            return rDate >= now;
        });


        resList.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;


            let hA = parseInt(a.hour); if(a.ampm === 'PM' && hA !== 12) hA+=12; else if(a.ampm === 'AM' && hA === 12) hA=0;
            let hB = parseInt(b.hour); if(b.ampm === 'PM' && hB !== 12) hB+=12; else if(b.ampm === 'AM' && hB === 12) hB=0;

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

    window.openResDetail = function(index) {
        const resList = getReservations();
        const resData = resList[index];
        if (!resData) return openMyRes();

        const dateObj = new Date(resData.date);
        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
        const formattedTime = `${resData.hour}:${resData.minute} ${resData.ampm}`;

        let headerBadgeHtml = '';
        let actionBtnHtml = '';
        let statusMessageHtml = '';
        let ticketStatusClass = '';
        let ticketGlowClass = '';

        if (resData.status === 'completed') {
            headerBadgeHtml = `
                <div class="w-11 h-11 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2.5 border border-green-500/20 shadow-[0_0_12px_rgba(46,204,113,0.15)]">
                    <i class="fa-solid fa-circle-check text-green-500 text-lg"></i>
                </div>
                <h3 class="text-base font-bold text-white uppercase tracking-tight">Done</h3>
                <p class="text-[8px] text-green-500 font-bold uppercase tracking-widest mt-0.5">Please visit us again</p>
            `;
            statusMessageHtml = `<p class="text-[9.5px] text-green-400/80 font-medium mt-3.5 leading-relaxed bg-green-500/5 border border-green-500/10 rounded-xl p-2.5"><i class="fas fa-sparkles text-green-400 mr-1"></i> Dining complete! Please visit us again.</p>`;
            actionBtnHtml = `
                <button onclick="window.deleteFromList(${index})" class="px-4.5 py-1.5 border border-white/10 bg-white/5 text-white/60 rounded-full text-[8.5px] uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all font-bold">
                    Delete Record
                </button>
            `;
            ticketStatusClass = 'border-l-4 border-l-green-500';
            ticketGlowClass = 'shadow-[0_0_15px_rgba(46,204,113,0.05)]';
        } else if (resData.status === 'cancelled') {
            headerBadgeHtml = `
                <div class="w-11 h-11 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-2.5 border border-rose-500/20">
                    <i class="fa-solid fa-circle-xmark text-rose-500 text-lg"></i>
                </div>
                <h3 class="text-base font-bold text-white uppercase tracking-tight">Cancelled</h3>
                <p class="text-[8px] text-rose-500 font-bold uppercase tracking-widest mt-0.5">Reservation Cancelled</p>
            `;
            statusMessageHtml = `<p class="text-[9.5px] text-white/50 mt-3.5 leading-relaxed">This reservation has been cancelled. If this was a mistake, feel free to book a new table.</p>`;
            actionBtnHtml = `
                <button onclick="window.deleteFromList(${index})" class="px-4.5 py-1.5 border border-white/10 bg-white/5 text-white/60 rounded-full text-[8.5px] uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all font-bold">
                    Delete Record
                </button>
            `;
            ticketStatusClass = 'border-l-4 border-l-rose-500/50';
        } else if (resData.status === 'confirmed') {
            headerBadgeHtml = `
                <div class="w-11 h-11 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2.5 border border-green-500/30 shadow-[0_0_12px_rgba(46,204,113,0.15)]">
                    <i class="fa-solid fa-check text-green-400 text-lg animate-pulse"></i>
                </div>
                <h3 class="text-base font-black text-white uppercase tracking-tighter">VIP Confirmed</h3>
                <p class="text-[8px] text-green-400 font-bold uppercase tracking-widest mt-0.5 animate-pulse">Ready For You</p>
            `;
            statusMessageHtml = `<p class="text-[9.5px] text-green-400/80 font-medium mt-3.5 leading-relaxed bg-green-500/5 border border-green-500/10 rounded-xl p-2.5"><i class="fas fa-sparkles text-green-400 mr-1"></i> Your VIP Table is fully confirmed! We look forward to welcoming you at Aurous.</p>`;
            actionBtnHtml = `
                <button id="cancel-res-btn" data-index="${index}" class="px-4.5 py-1.5 border border-rose-500/30 bg-rose-500/5 text-rose-500 rounded-full text-[8.5px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all font-bold">
                    Cancel Reservation
                </button>
            `;
            ticketStatusClass = 'border-l-4 border-l-green-500';
            ticketGlowClass = 'shadow-[0_0_20px_rgba(46,204,113,0.1)]';
        } else {
            headerBadgeHtml = `
                <div class="w-11 h-11 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2.5 border border-amber-500/20">
                    <i class="fa-solid fa-clock text-amber-500 text-lg animate-pulse"></i>
                </div>
                <h3 class="text-base font-bold text-white uppercase tracking-tight">Pending</h3>
                <p class="text-[8px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">Awaiting Host</p>
            `;
            statusMessageHtml = `<p class="text-[9.5px] text-white/40 mt-3.5 leading-relaxed">Our host will call you shortly to confirm your table. Keep your phone handy!</p>`;
            actionBtnHtml = `
                <button id="cancel-res-btn" data-index="${index}" class="px-4.5 py-1.5 border border-rose-500/30 bg-rose-500/5 text-rose-500 rounded-full text-[8.5px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all font-bold">
                    Cancel Reservation
                </button>
            `;
            ticketStatusClass = 'border-l-4 border-l-amber-500';
            ticketGlowClass = 'shadow-[0_0_15px_rgba(243,156,18,0.05)]';
        }

        myResContent.innerHTML = `
            <button onclick="openMyRes()" class="text-white/40 hover:text-white absolute top-4 left-4 text-[9px] tracking-widest uppercase font-bold transition-all flex items-center gap-1.5 active:scale-95">
                <i class="fas fa-arrow-left text-xs"></i> Back
            </button>

            <div class="mt-2.5">
                ${headerBadgeHtml}
            </div>

            <!-- VIP PASS TICKET CARD -->
            <div class="relative bg-white/[0.01] border border-white/10 rounded-2xl p-4 mt-4 overflow-hidden text-left ${ticketStatusClass} ${ticketGlowClass}">
                <!-- Ticket notches -->
                <div class="absolute -left-3 top-[54%] -translate-y-1/2 w-5 h-5 rounded-full bg-[#0a0a0a] border-r border-white/10 z-10"></div>
                <div class="absolute -right-3 top-[54%] -translate-y-1/2 w-5 h-5 rounded-full bg-[#0a0a0a] border-l border-white/10 z-10"></div>

                <!-- Ticket Header/Stub -->
                <div class="flex justify-between items-center mb-2.5">
                    <span class="text-[7.5px] uppercase tracking-[0.25em] text-[#E0115F] font-black">Aurous Restro Lounge</span>
                    <span class="text-[8.5px] uppercase font-bold text-white/30 tracking-wider">Pass #${resData.id || index + 100}</span>
                </div>
                <h4 class="text-sm font-black text-white tracking-tight uppercase mb-3">${resData.name}</h4>

                <!-- Dotted divider line -->
                <div class="border-t border-dashed border-white/10 my-2.5"></div>

                <!-- Ticket Body/Details -->
                <div class="grid grid-cols-2 gap-3 mt-1.5">
                    <div>
                        <span class="text-[7.5px] uppercase tracking-widest text-white/30 block mb-0.5">Date</span>
                        <div class="text-[10px] font-bold text-white flex items-center">
                            <i class="fa-regular fa-calendar-days text-[#E0115F] mr-1.2 text-[10px]"></i> ${formattedDate}
                        </div>
                    </div>
                    <div>
                        <span class="text-[7.5px] uppercase tracking-widest text-white/30 block mb-0.5">Time</span>
                        <div class="text-[10px] font-bold text-white flex items-center">
                            <i class="fa-regular fa-clock text-[#E0115F] mr-1.2 text-[10px]"></i> ${formattedTime}
                        </div>
                    </div>
                    <div>
                        <span class="text-[7.5px] uppercase tracking-widest text-white/30 block mb-0.5">Guests</span>
                        <div class="text-[10px] font-bold text-white flex items-center">
                            <i class="fa-solid fa-users text-[#E0115F] mr-1.2 text-[10px]"></i> ${resData.guest_count} Guests
                        </div>
                    </div>
                    <div>
                        <span class="text-[7.5px] uppercase tracking-widest text-white/30 block mb-0.5">Occasion</span>
                        <div class="text-[10px] font-bold text-white flex items-center capitalize">
                            <i class="fa-solid fa-martini-glass text-[#E0115F] mr-1.2 text-[10px]"></i> ${resData.occasion.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                <!-- Dotted divider line -->
                <div class="border-t border-dashed border-white/10 my-3"></div>

                <!-- Barcode simulation -->
                <div class="flex flex-col items-center justify-center mt-0.5 select-none opacity-45">
                    <div class="text-[10px] font-mono tracking-[0.22em] text-white/40">||||| | || ||| | ||| | ||</div>
                    <div class="text-[6.5px] font-mono tracking-widest text-white/30 mt-0.5">AUR-${resData.id || 'CONFIRMED'}</div>
                </div>
            </div>

            ${statusMessageHtml}

            <div class="mt-4.5 pt-3.5 border-t border-white/5">
                ${actionBtnHtml}
            </div>
        `;
    };

    window.openMyRes = async function() {
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
                <div class="mb-4">
                    <h3 class="text-lg font-black text-white uppercase tracking-tight">Your Reservations</h3>
                    <div class="w-6 h-[2px] bg-[#E0115F] mx-auto mt-1 rounded-full"></div>
                    <p class="text-[7.5px] text-white/40 font-bold uppercase tracking-[0.2em] mt-2">${resList.length} Active Bookings</p>
                </div>
                <div class="space-y-2 max-h-[300px] overflow-y-auto pr-0.5 custom-scroll text-left">
                    ${resList.map((res, i) => {
                        const d = new Date(res.date);
                        const day = d.getDate();
                        const month = d.toLocaleDateString('en-US', {month: 'short'});

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
                                <button onclick="event.stopPropagation(); window.cancelFromList(${i})" class="w-7.5 h-7.5 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500/30 transition-all flex items-center justify-center border border-rose-500/20 active:scale-90" title="Cancel Reservation">
                                    <i class="fas fa-ban text-[9px]"></i>
                                </button>
                            `;
                            borderStyle = 'border-l-4 border-l-green-500';
                            glowStyle = 'box-shadow: 0 0 10px rgba(46, 204, 113, 0.06);';
                        } else {
                            statusBadgeHtml = `<span style="color: #f39c12; font-weight: 700; text-transform: uppercase; font-size: 0.55rem; background: rgba(243,156,18,0.08); padding: 2px 6px; border-radius: 10px; display: inline-flex; align-items: center; gap: 2px; border: 1px solid rgba(243,156,18,0.15);"><i class="fas fa-clock animate-pulse"></i> Pending</span>`;
                            actionHtml = `
                                <button onclick="event.stopPropagation(); window.cancelFromList(${i})" class="w-7.5 h-7.5 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500/30 transition-all flex items-center justify-center border border-rose-500/20 active:scale-90" title="Cancel Reservation">
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
                    <h3 class="text-lg font-bold text-white uppercase tracking-tight">No Active Bookings</h3>
                    <p class="text-[10px] text-white/40 mt-2 max-w-[190px] mx-auto leading-relaxed">You haven't made any reservations yet. Ready to experience Aurous?</p>
                </div>
            `;
        }

        myResModal.classList.remove('opacity-0', 'pointer-events-none');
        myResBox.classList.remove('translate-y-10');
        myResBox.classList.add('translate-y-0');
        document.body.style.overflow = 'hidden';
    };

    window.cancelFromList = async function(index) {
        if (confirm('Are you sure you want to cancel this reservation?')) {
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

    window.deleteFromList = async function(index) {
        if (confirm('Are you sure you want to delete this booking from your list?')) {
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
            if (confirm('Are you sure you want to cancel your reservation?')) {
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
                if (window.showToast) window.showToast('Reservation Cancelled');
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
                                const dateObj = new Date(formData.date);
                                const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
                                const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
                                const formattedTime = `${formData.hour}:${formData.minute} ${formData.ampm}`;

                                const occasionText = formData.occasion !== 'casual' ? ` for your ${formData.occasion.replace('_', ' ')}` : '';
                                successMessage.innerHTML = `See you soon, ${name}${occasionText}!<br>Meet you on ${formattedDate} at ${formattedTime}.`;
                            }


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


                Object.values(navLinksMapping).forEach(link => link?.classList.remove('active'));


                if (navLinksMapping[activeId]) {
                    navLinksMapping[activeId].classList.add('active');
                }
            }
        });
    }, observerOptions);


    ['hero', 'vibe', 'menu', 'echoes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });


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