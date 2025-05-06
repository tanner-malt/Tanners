// static/js/animation.js

// Logger utility
const Logger = {
  info: (message, data) => {
    console.log(`ℹ️ ${message}`, data || '');
  },
  error: (message, error) => {
    console.error(`❌ ${message}`, error || '');
  },
  debug: (message, data) => {
    console.debug(`🔍 ${message}`, data || '');
  }
};

// Animation state management
const AnimationState = {
  isAnimating: false,
  activeCard: null,
  activeSubCards: [],
  
  setActiveCard(card) {
    this.activeCard = card;
    this.isAnimating = true;
  },
  
  reset() {
    this.activeCard = null;
    this.activeSubCards = [];
    this.isAnimating = false;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize elements
  const groups = Array.from(document.querySelectorAll('.card-group'));
  const subCards = Array.from(document.querySelectorAll('.sub-card'));
  Logger.info(`Found ${groups.length} card-groups and ${subCards.length} sub-cards`);

  // Calculate orbit positions based on screen size
  const calculateOrbitPositions = (centerX, centerY, radius = 200) => {
    const positions = [];
    const numPositions = 3;
    
    for (let i = 0; i < numPositions; i++) {
      const angle = (i * (2 * Math.PI / numPositions));
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    return positions;
  };

  // Main card click handler
  groups.forEach((group, i) => {
    group.addEventListener('click', e => {
      e.stopPropagation();
      Logger.debug(`Card group #${i} clicked`, group);

      if (AnimationState.isAnimating) {
        Logger.debug('Animation in progress, ignoring click');
        return;
      }

      resetAll();
      AnimationState.setActiveCard(group);
      group.classList.add('selected');
      document.body.classList.add('dimmed');

      // Get center position for orbit
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const orbitPositions = calculateOrbitPositions(centerX, centerY);

      // Center and scale the main card
      gsap.to(group, {
        duration: 0.5,
        scale: 1.2,
        x: centerX - (group.getBoundingClientRect().left + group.offsetWidth/2),
        y: centerY - (group.getBoundingClientRect().top + group.offsetHeight/2),
        ease: 'power2.out',
        transformOrigin: 'center center',
        onComplete: () => Logger.debug('Main card centered')
      });

      // Flip animation
      const inner = group.querySelector('.card-inner');
      gsap.to(inner, {
        duration: 0.6,
        rotationY: 180,
        ease: 'power2.inOut',
        delay: 0.5,
        onComplete: () => Logger.debug('Card flipped')
      });

      // Orbit sub-cards
      const subs = subCards.filter(sc => group.contains(sc));
      Logger.debug('Orbiting sub-cards', subs);

      subs.forEach((sub, index) => {
        const pos = orbitPositions[index];
        gsap.to(sub, {
          duration: 0.8,
          opacity: 1,
          scale: 1,
          x: pos.x - (sub.getBoundingClientRect().left + sub.offsetWidth/2),
          y: pos.y - (sub.getBoundingClientRect().top + sub.offsetHeight/2),
          ease: 'back.out(1.7)',
          delay: 1.1 + (index * 0.15),
          onComplete: () => {
            if (index === subs.length - 1) {
              Logger.debug('All sub-cards orbited');
            }
          }
        });
      });
    });
  });

  // Sub-card click handler
  subCards.forEach((card, ci) => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      Logger.debug(`Sub-card #${ci} clicked`, card);

      if (!AnimationState.activeCard) {
        Logger.error('No active card found');
        return;
      }

      gsap.to(card, {
        duration: 0.5,
        scale: 1.5,
        x: window.innerWidth/2 - (card.getBoundingClientRect().left + card.offsetWidth/2),
        y: window.innerHeight/2 - (card.getBoundingClientRect().top + card.offsetHeight/2),
        ease: 'power2.out',
        onComplete: () => Logger.debug('Sub-card popped out')
      });

      card.classList.add('active');
    });
  });

  // Click outside handler
  document.addEventListener('click', () => {
    if (!AnimationState.isAnimating) return;
    
    Logger.debug('Document click detected, resetting animations');
    resetAll();
  });

  // Reset function
  function resetAll() {
    // Reset animation state
    AnimationState.reset();
    
    // Remove dimming from body
    document.body.classList.remove('dimmed');
    
    // Reset all card groups
    groups.forEach(g => {
        g.classList.remove('selected');
        gsap.killTweensOf(g);
        gsap.set(g, { 
            clearProps: 'all',
            scale: 1,
            x: 0,
            y: 0
        });

        const inner = g.querySelector('.card-inner');
        gsap.killTweensOf(inner);
        gsap.set(inner, { 
            clearProps: 'all',
            rotationY: 0
        });
    });

    // Reset all sub-cards
    subCards.forEach(sc => {
        sc.classList.remove('active');
        gsap.killTweensOf(sc);
        gsap.set(sc, { 
            clearProps: 'all',
            scale: 0.5,
            opacity: 0,
            x: 0,
            y: 0
        });
    });

    // Force a reflow to ensure styles are applied
    document.body.offsetHeight;
  }

  Logger.info('Portfolio interactions initialized');
});
