/* ==========================================================================
   MAIN JAVASCRIPT (script.js)
   Handles Mobile Menu, Scrolling, Animations, and Dynamic Features
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Auto-update Footer Year
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ==========================================================================
    // 2. MOBILE MENU TOGGLE LOGIC
    // ==========================================================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const menuIcon = document.getElementById('menu-icon');

    function toggleMenu() {
        if (!mobileDrawer || !drawerOverlay) return;

        const isHidden = drawerOverlay.classList.contains('hidden');
        
        if (isHidden) {
            // Open Menu
            drawerOverlay.classList.remove('hidden');
            // Small delay to ensure display:block applies before opacity transition
            setTimeout(() => drawerOverlay.classList.remove('opacity-0'), 10);
            
            mobileDrawer.classList.remove('translate-x-full');
            if (menuIcon) {
                menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>';
            }
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            // Close Menu
            mobileDrawer.classList.add('translate-x-full');
            drawerOverlay.classList.add('opacity-0');
            
            // Wait for transition to finish before hiding
            setTimeout(() => drawerOverlay.classList.add('hidden'), 500);
            
            if (menuIcon) {
                menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/>';
            }
            document.body.style.overflow = ''; // Restore background scrolling
        }
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMenu);
    if (drawerOverlay) drawerOverlay.addEventListener('click', toggleMenu);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', toggleMenu);


    // ==========================================================================
    // 3. SMOOTH SCROLLING & NAVBAR EFFECTS
    // ==========================================================================
    const nav = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scroll-progress');
    let ticking = false;

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Close mobile menu if open
                if (drawerOverlay && !drawerOverlay.classList.contains('hidden')) {
                    toggleMenu();
                }
            }
        });
    });

    // High-performance scroll listener using requestAnimationFrame
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Navbar Shadow Effect
                if (window.scrollY > 20) {
                    if(nav) {
                        nav.classList.add('shadow-luxury-soft', 'bg-white/95');
                        nav.classList.remove('bg-white/80');
                    }
                } else {
                    if(nav) {
                        nav.classList.remove('shadow-luxury-soft', 'bg-white/95');
                        nav.classList.add('bg-white/80');
                    }
                }
                
                // Top Scroll Progress Bar Update
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                if (scrollProgress && height > 0) {
                    scrollProgress.style.width = ((winScroll / height) * 100) + "%";
                }
                
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });


    // ==========================================================================
    // 4. SIMPLE ANIMATIONS (Scroll Reveal via IntersectionObserver)
    // ==========================================================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -30px 0px', // Trigger slightly before the element enters the viewport
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); // Triggers CSS transition
                observer.unobserve(entry.target); // Stop observing once revealed for performance
            }
        });
    }, observerOptions);

    // Attach observer to all elements with reveal classes
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach((element) => {
        scrollObserver.observe(element);
    });


    // ==========================================================================
    // 5. LIVE SHOP TIMING ENGINE
    // ==========================================================================
    function updateShopStatus() {
        const statusElements = document.querySelectorAll('.shop-status-badge');
        if (!statusElements.length) return;

        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 4 = Thursday
        const timeInMinutes = now.getHours() * 60 + now.getMinutes();
        
        // Timings: 8:00 AM (480 mins) to 10:30 PM (1350 mins)
        const openTime = 480; 
        const closeTime = 1350; 

        let isOpen = false;
        let statusText = "Closed Now";
        let statusClass = "bg-red-500/10 text-red-600 border-red-500/20";
        let dotClass = "bg-red-500";

        // Logic check: Not Thursday AND within time limits
        if (day !== 4 && timeInMinutes >= openTime && timeInMinutes < closeTime) {
            isOpen = true; 
            statusText = "Open Today until 10:30 PM"; 
            statusClass = "bg-accent-500/10 text-accent-600 border-accent-500/20"; 
            dotClass = "bg-accent-500";
        } else if (day === 4) { 
            statusText = "Closed Today (Thursday)"; 
        }

        // Render the badge HTML dynamically
        const html = `
            <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full ${statusClass} text-xs font-bold border backdrop-blur-md transition-colors">
                <span class="relative flex h-2.5 w-2.5">
                    ${isOpen ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full ${dotClass} opacity-75"></span>` : ''}
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 ${dotClass}"></span>
                </span>
                ${statusText}
            </div>
        `;
        
        statusElements.forEach(el => el.innerHTML = html);
    }
    
    // Run immediately, then check every minute
    updateShopStatus(); 
    setInterval(updateShopStatus, 60000);


    // ==========================================================================
    // 6. BUTTON CLICK EFFECTS (Tactile Feedback)
    // ==========================================================================
    // Adds a temporary scale down effect to simulate a physical button press
    const interactiveButtons = document.querySelectorAll('button, .btn-primary, a[href^="tel:"], a[href^="https://wa.me"]');
    
    interactiveButtons.forEach(btn => {
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.96)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
        
        // Touch support for mobile devices
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.96)';
            this.style.transition = 'transform 0.1s ease';
        }, { passive: true });
        
        btn.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });

});
document.getElementById("appointmentForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("patientName").value;
    const phone = document.getElementById("patientPhone").value;
    const doctor = document.getElementById("doctorSelect").value;
    const date = document.getElementById("appointmentDate").value;

    const data = {
        name,
        phone,
        doctor,
        date
    };

    // Send to backend
    fetch("https://sribalajimedical.onrender.com/api/form", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
        console.log("Saved:", res);

        // WhatsApp message
        const message = `Name: ${name}%0APhone: ${phone}%0ADoctor: ${doctor}%0ADate: ${date}`;

        window.location.href = `https://wa.me/918981777440?text=${message}`;
    })
    .catch(err => console.error(err));
});
