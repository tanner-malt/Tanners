// static/js/animation.js

// Animation state management
const AnimationState = {
  isAnimating: false,
  mainCardAnimating: false,
  activeCard: null,
  focusedSubCard: null,
  subCardOrbitTweens: [],
  orbitPathElement: null,
  centerPointElement: null,

  setActiveCard(card) {
    this.activeCard = card;
    this.isAnimating = true;
    this.mainCardAnimating = true;
  },
  setFocusedSubCard(subCard) {
    this.focusedSubCard = subCard;
    this.isAnimating = true;
  },
  clearFocusedSubCard() {
    if (this.focusedSubCard) {
      this.focusedSubCard.classList.remove('focused');
    }
    this.focusedSubCard = null;
    if (!this.mainCardAnimating) {
      this.isAnimating = false;
    }
  },
  reset() {
    this.subCardOrbitTweens.forEach(tween => tween.kill());
    this.subCardOrbitTweens = [];

    if (this.orbitPathElement) {
      gsap.to(this.orbitPathElement, {
        opacity: 0,
        scale: 0,
        duration: 0.3,
        ease: 'power1.in',
        onComplete: () => {
          if (this.orbitPathElement.parentNode) {
            this.orbitPathElement.parentNode.removeChild(this.orbitPathElement);
          }
          this.orbitPathElement = null;
        }
      });
    }

    if (this.centerPointElement) {
      if (this.centerPointElement.parentNode) {
        this.centerPointElement.parentNode.removeChild(this.centerPointElement);
      }
      this.centerPointElement = null;
    }

    if (this.focusedSubCard) {
      this.focusedSubCard.classList.remove('focused');
    }
    if (this.activeCard) {
      this.activeCard.classList.remove('selected');
    }
    this.activeCard = null;
    this.focusedSubCard = null;
    this.isAnimating = false;
    this.mainCardAnimating = false;
    document.body.classList.remove('dimmed', 'sub-card-focused');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') {
    console.error('GSAP library not loaded! Animation features will not work.');
    return;
  }

  const groups = Array.from(document.querySelectorAll('.card-group'));
  const subCards = Array.from(document.querySelectorAll('.sub-card'));

  // Store original positions & hide sub-cards
  groups.forEach(group => {
    const rect = group.getBoundingClientRect();
    group.originalLeft = rect.left + window.scrollX;
    group.originalTop = rect.top + window.scrollY;
    group.originalWidth = group.offsetWidth;
    group.originalHeight = group.offsetHeight;

    const subs = Array.from(group.querySelectorAll('.sub-card'));
    gsap.set(subs, { opacity: 0, scale: 0, visibility: 'hidden', display: 'block' });
  });

  // Main card click handler
  groups.forEach(group => {
    group.addEventListener('click', e => {
      e.stopPropagation();
      if (AnimationState.mainCardAnimating || AnimationState.isAnimating) return;
      if (AnimationState.focusedSubCard) return;
      if (AnimationState.activeCard === group) { resetAll(); return; }
      if (AnimationState.activeCard && AnimationState.activeCard !== group) {
        resetAll();
        setTimeout(() => processGroupClick(group), 100);
        return;
      }
      processGroupClick(group);
    });
  });

  function processGroupClick(group) {
    if (AnimationState.isAnimating || AnimationState.mainCardAnimating) return;

    AnimationState.setActiveCard(group);
    group.classList.add('selected');
    document.body.classList.add('dimmed');

    groups.forEach(g => {
      if (g !== group) {
        gsap.to(g, { opacity: 0.3, scale: 0.95, duration: 0.3, ease: 'power1.in', pointerEvents: 'none' });
      }
    });

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Center main card
    gsap.to(group, {
      duration: 0.6,
      scale: 1.2,
      x: centerX - (group.originalLeft + group.offsetWidth / 2),
      y: centerY - (group.originalTop + group.offsetHeight / 2),
      ease: 'power2.out',
      transformOrigin: 'center center',
      zIndex: 9999,
      onComplete: () => {
        AnimationState.mainCardAnimating = false;
        const inner = group.querySelector('.card-inner');
        // Flip
        gsap.to(inner, {
          duration: 0.6,
          rotationY: 180,
          ease: 'power2.inOut',
          delay: 0.4,
          onComplete: () => spawnSubCards(group, inner)
        });
      }
    });
  }

  function spawnSubCards(group, inner) {
    const subContainer = group.querySelector('.sub-cards');
    if (subContainer) gsap.set(subContainer, { display: 'block', visibility: 'visible' });

    const selectedSubs = Array.from(group.querySelectorAll('.sub-card'));
    const cardRect = group.getBoundingClientRect();
    const orbitRadius = Math.min(cardRect.width, cardRect.height) * 0.35;
    const orbitDiameter = orbitRadius * 2;
    const orbitSpeedBase = 30;

    // Orbit path
    if (AnimationState.orbitPathElement && AnimationState.orbitPathElement.parentNode) {
      AnimationState.orbitPathElement.parentNode.removeChild(AnimationState.orbitPathElement);
    }
    const orbitCircle = document.createElement('div');
    AnimationState.orbitPathElement = orbitCircle;
    Object.assign(orbitCircle.style, {
      position: 'absolute', width: `${orbitDiameter}px`, height: `${orbitDiameter}px`,
      border: '1px dotted rgba(255,255,255,0.1)', borderRadius: '50%', pointerEvents: 'none',
      zIndex: '9999', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
    });
    inner.appendChild(orbitCircle);
    gsap.set(orbitCircle, { scale: 0, opacity: 0 });
    gsap.to(orbitCircle, { duration: 0.7, scale: 1, opacity: 0, ease: 'power2.out', delay: 0.2 });

    selectedSubs.forEach((sub, index) => {
      gsap.killTweensOf(sub);
      const startAngle = (Math.PI * 2 / selectedSubs.length) * index;
      sub.orbitParams = { angle: startAngle, radius: orbitRadius, speed: orbitSpeedBase + Math.random() * 5, direction: 1 };

      gsap.set(sub, {
        position: 'absolute', left: '50%', top: '50%',
        scale: 0, opacity: 0, visibility: 'visible', transformOrigin: 'center center',
        zIndex: 10000, display: 'block'
      });

      // Spawn animation
      gsap.to(sub, {
        scale: 1, opacity: 1,
        x: Math.cos(startAngle) * orbitRadius,
        y: Math.sin(startAngle) * orbitRadius,
        transform: `translate(-50%, -50%) translate(${Math.cos(startAngle)*orbitRadius}px, ${Math.sin(startAngle)*orbitRadius}px)`,
        duration: 0.6, delay: 0.1 + index * 0.15, ease: 'power2.out',
        backgroundColor: 'var(--color-accent)', color: '#fff',
        onComplete: () => startOrbit(sub)
      });
    });
  }

  function startOrbit(sub) {
    const tween = gsap.to(sub.orbitParams, {
      angle: sub.orbitParams.angle + Math.PI * 2,
      duration: sub.orbitParams.speed,
      ease: 'none',
      repeat: -1,
      onUpdate() {
        if (AnimationState.focusedSubCard !== sub) {
          const { angle, radius } = sub.orbitParams;
          gsap.set(sub, { x: Math.cos(angle)*radius, y: Math.sin(angle)*radius,
            transform: `translate(-50%, -50%) translate(${Math.cos(angle)*radius}px, ${Math.sin(angle)*radius}px)` });
        }
      }
    });
    AnimationState.subCardOrbitTweens.push(tween);
  }

  // Sub-card click handler
  subCards.forEach(card => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      const parent = card.closest('.card-group');
      if (AnimationState.mainCardAnimating || AnimationState.isAnimating || !AnimationState.activeCard || parent !== AnimationState.activeCard) return;

      if (AnimationState.focusedSubCard === card) {
        focusExit(card);
        return;
      }
      if (AnimationState.focusedSubCard && AnimationState.focusedSubCard !== card) {
        focusExit(AnimationState.focusedSubCard);
      }
      focusSubCard(card);
    });
  });

  function focusSubCard(card) {
    AnimationState.setFocusedSubCard(card);
    card.classList.add('focused');
    document.body.classList.add('sub-card-focused');
    const tween = AnimationState.subCardOrbitTweens.find(t => t.targets()[0] === card.orbitParams);
    if (tween) tween.pause();
    const group = AnimationState.activeCard;
    const rect = group.getBoundingClientRect();
    gsap.to(card, {
      duration: 0.5, scale: 2, x: (window.innerWidth/2 - rect.left - rect.width/2),
      y: (window.innerHeight/2 - rect.top - rect.height/2), zIndex: 10002, ease: 'power2.out',
      onComplete: () => { AnimationState.isAnimating = false; }
    });
  }

  function focusExit(card) {
    AnimationState.isAnimating = true;
    const tween = AnimationState.subCardOrbitTweens.find(t => t.targets()[0] === card.orbitParams);
    if (tween) tween.pause();
    gsap.to(card, {
      duration: 0.4, scale: 1,
      x: Math.cos(card.orbitParams.angle)*card.orbitParams.radius,
      y: Math.sin(card.orbitParams.angle)*card.orbitParams.radius,
      zIndex: 10000, ease: 'power2.out',
      onComplete: () => {
        if (tween) tween.resume();
        AnimationState.clearFocusedSubCard();
        document.body.classList.remove('sub-card-focused');
      }
    });
  }

  // Click outside handler
  document.addEventListener('click', event => {
    if (AnimationState.mainCardAnimating || AnimationState.isAnimating) return;
    const onGroup = event.target.closest('.card-group');
    const onSub = event.target.closest('.sub-card');
    if (AnimationState.focusedSubCard && AnimationState.focusedSubCard !== onSub) {
      focusExit(AnimationState.focusedSubCard);
    } else if (AnimationState.activeCard && !onGroup && !AnimationState.focusedSubCard) {
      resetAll();
    }
  });

  // Reset all animations
  function resetAll() {
    AnimationState.mainCardAnimating = true;
    AnimationState.isAnimating = true;
    const card = AnimationState.activeCard;
    if (AnimationState.focusedSubCard) focusExit(AnimationState.focusedSubCard);
    AnimationState.subCardOrbitTweens.forEach(t => t.kill());
    AnimationState.subCardOrbitTweens = [];
    if (card) {
      card.classList.remove('selected');
      const inner = card.querySelector('.card-inner');
      gsap.to(inner, { duration: 0.4, rotationY: 0, ease: 'power1.in' });
      gsap.to(card, { duration: 0.5, delay: 0.1, scale: 1, x: 0, y: 0, zIndex: 1, ease: 'power2.inOut', clearProps: 'transform' });
      const subs = Array.from(card.querySelectorAll('.sub-card'));
      subs.forEach((sub, i) => {
        gsap.to(sub, { duration: 0.3, delay: 0.1 + i*0.05, scale: 0, opacity: 0, x: 0, y: 0, transform: 'translate(-50%, -50%)', ease: 'power1.in', onComplete: () => gsap.set(sub, { visibility: 'hidden' }) });
      });
    }
    const delay = card ? 0.6 : 0;
    gsap.delayedCall(delay, () => {
      groups.forEach(g => gsap.to(g, { opacity: 1, scale: 1, duration: 0.3, clearProps: 'pointerEvents' }));
      document.body.classList.remove('dimmed');
      AnimationState.reset();
    });
  }

  // Initialization complete
});
