// Animation state management
const AnimationState = {
  isAnimating: false,        // General lock for any animation transition
  mainCardAnimating: false, // Lock for main card selection, flip, centering, reset
  subCardAnimating: false,   // Lock for sub-card focus/unfocus animations
  activeCard: null,          // The currently selected .card-group element
  focusedSubCard: null,    // The currently focused .sub-card element
  subCardOrbitTweens: [],  // Stores GSAP tweens for sub-card orbits to kill them on reset
  // orbitPathElement and centerPointElement from old state are not used in this version
  
  // --- Mutators with logging for easier debugging ---
  setActiveCard(cardElement) {
    console.debug('[StateChange] Setting active card:', cardElement);
    this.activeCard = cardElement;
    if (cardElement) {
      this.mainCardAnimating = true; // Main card interaction starts
      this.isAnimating = true;       // General lock
    } else { // Clearing active card
      // mainCardAnimating and isAnimating will be reset by the function calling this (e.g., resetAllAnimations)
    }
  },

  clearActiveCard() {
    console.debug('[StateChange] Clearing active card.');
    if (this.activeCard) {
      this.activeCard.classList.remove('selected');
    }
    this.activeCard = null;
    // mainCardAnimating and isAnimating are typically reset at the end of a sequence like resetAllAnimations
  },

  setFocusedSubCard(subCardElement) {
    console.debug('[StateChange] Setting focused sub-card:', subCardElement);
    this.focusedSubCard = subCardElement;
    if (subCardElement) {
      this.subCardAnimating = true;
      this.isAnimating = true;
      document.body.classList.add('sub-card-interaction-lock');
    } else { // Clearing focused sub-card
      this.subCardAnimating = false; 
      if (!this.mainCardAnimating) {
        this.isAnimating = false;
      }
      document.body.classList.remove('sub-card-interaction-lock');
    }
  },

  clearFocusedSubCard(keepInteractionLock = false) {
    console.debug('[StateChange] Clearing focused sub-card.');
    if (this.focusedSubCard) {
      this.focusedSubCard.classList.remove('focused');
    }
    this.focusedSubCard = null;
    this.subCardAnimating = false;
    if (!this.mainCardAnimating) { // Only release general lock if main card isn't busy
        this.isAnimating = false;
    }
    if (!keepInteractionLock) {
        document.body.classList.remove('sub-card-interaction-lock');
    }
  },

  releaseGeneralLock() {
    if (!this.mainCardAnimating && !this.subCardAnimating) {
      console.debug('[StateChange] Releasing general animation lock.');
      this.isAnimating = false;
    }
  },
  
  resetAllStateFlags() {
    console.debug('[StateChange] Resetting ALL animation state flags.');
    this.activeCard = null;
    this.focusedSubCard = null;
    this.isAnimating = false;
    this.mainCardAnimating = false;
    this.subCardAnimating = false;
    this.subCardOrbitTweens.forEach(tween => tween.kill());
    this.subCardOrbitTweens = [];
    // CSS class cleanup is handled by resetAllAnimations or specific state clearers
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') {
    console.error('GSAP library not loaded! Animations will not work.');
    return;
  }

  const cardGroups = Array.from(document.querySelectorAll('.card-group'));
  const allSubCards = Array.from(document.querySelectorAll('.sub-card'));

  cardGroups.forEach(group => {
    const rect = group.getBoundingClientRect();
    group.originalState = {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      opacity: 1,
      scale: 1,
      zIndex: getComputedStyle(group).zIndex || 1
    };

    const subCardContainer = group.querySelector('.sub-cards-container');
    if (subCardContainer) {
        const subs = Array.from(subCardContainer.querySelectorAll('.sub-card'));
        gsap.set(subs, {
            opacity: 0, 
            scale: 0, 
            x: 0, 
            y: 0,
            visibility: 'hidden',
            transformOrigin: 'center center'
        });
    }
  });

  cardGroups.forEach(group => {
    group.addEventListener('click', () => {
      console.debug('Card group clicked:', group, 'Current state:', { ...AnimationState });
      if (AnimationState.focusedSubCard) {
        console.debug('A sub-card is focused. Ignoring main card click.');
        return;
      }
      if (AnimationState.mainCardAnimating || (AnimationState.isAnimating && AnimationState.activeCard !== group)) {
        console.debug('Animation in progress, ignoring click.');
        return;
      }
      if (AnimationState.activeCard === group) {
        console.debug('Clicked active card. Resetting all.');
        resetAllAnimations();
      } else {
        if (AnimationState.activeCard) {
          console.debug('Another card is active. Resetting before selecting new one.');
          resetAllAnimations(() => processCardSelection(group));
        } else {
          processCardSelection(group);
        }
      }
    });
  });

  allSubCards.forEach(subCard => {
    subCard.addEventListener('click', (e) => {
      e.stopPropagation();
      console.debug('Sub-card clicked:', subCard, 'Current state:', { ...AnimationState });
      const parentCardGroup = subCard.closest('.card-group');
      if (!parentCardGroup || parentCardGroup !== AnimationState.activeCard || AnimationState.mainCardAnimating) {
        console.debug('Sub-card click ignored: Parent not active or main card animating.');
        return;
      }
      if (AnimationState.subCardAnimating && AnimationState.focusedSubCard !== subCard) {
        console.debug('Sub-card click ignored: Another sub-card is currently animating.');
        return;
      }
      if (AnimationState.focusedSubCard === subCard) {
        console.debug('Clicked focused sub-card. Unfocusing.');
        unfocusSubCard(subCard);
      } else {
        if (AnimationState.focusedSubCard) {
            console.debug('Another sub-card was focused. Unfocusing it first.');
            unfocusSubCard(AnimationState.focusedSubCard, () => focusSubCard(subCard));
        } else {
            focusSubCard(subCard);
        }
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (AnimationState.mainCardAnimating || AnimationState.subCardAnimating) return;
    const clickedOnCardGroup = event.target.closest('.card-group');
    const clickedOnSubCard = event.target.closest('.sub-card');
    if (AnimationState.focusedSubCard && !clickedOnSubCard) {
      console.debug('Clicked outside a focused sub-card. Unfocusing.');
      unfocusSubCard(AnimationState.focusedSubCard);
    } else if (AnimationState.activeCard && !clickedOnCardGroup && !clickedOnSubCard) {
      console.debug('Clicked outside active card. Resetting all.');
      resetAllAnimations();
    }
  });

  function processCardSelection(groupElement) {
    console.debug('Processing card selection for:', groupElement);
    AnimationState.setActiveCard(groupElement);
    groupElement.classList.add('selected');
    document.body.classList.add('dimmed-background', 'active');
    cardGroups.forEach(g => {
      if (g !== groupElement) {
        g.classList.add('deselected');
      }
    });
    const targetX = (window.innerWidth / 2) - (groupElement.originalState.left + groupElement.originalState.width / 2);
    const targetY = (window.innerHeight / 2) - (groupElement.originalState.top + groupElement.originalState.height / 2);
    const targetScale = 1.2;
    gsap.to(groupElement, {
      x: targetX,
      y: targetY,
      scale: targetScale,
      duration: 0.6,
      ease: 'power2.out',
      zIndex: 9995,
      onComplete: () => {
        console.debug('Main card centered and scaled.');
        const innerCard = groupElement.querySelector('.card-inner');
        gsap.to(innerCard, {
          rotationY: 180,
          duration: 0.6,
          ease: 'power2.inOut',
          delay: 0.1,
          onComplete: () => {
            console.debug('Main card flipped. Revealing sub-cards.');
            AnimationState.mainCardAnimating = false;
            revealSubCards(groupElement);
            AnimationState.releaseGeneralLock();
          }
        });
      }
    });
  }

  function revealSubCards(parentGroup) {
    const subCardContainer = parentGroup.querySelector('.sub-cards-container');
    if (!subCardContainer) {
      console.warn('No sub-cards-container found in parent:', parentGroup);
      AnimationState.mainCardAnimating = false;
      AnimationState.releaseGeneralLock();
      return;
    }
    const subs = Array.from(subCardContainer.querySelectorAll('.sub-card'));
    console.debug(`Found ${subs.length} sub-cards to reveal in:`, parentGroup);
    if (subs.length === 0) {
      AnimationState.mainCardAnimating = false;
      AnimationState.releaseGeneralLock();
      return;
    }
    gsap.set(subCardContainer, { display: 'block', visibility: 'visible' });
    void subCardContainer.offsetHeight;
    const orbitRadius = Math.min(parentGroup.offsetWidth, parentGroup.offsetHeight) * 0.30;
    const orbitSpeedBase = 30;
    const tl = gsap.timeline({
        onStart: () => { 
            AnimationState.isAnimating = true;
        },
        onComplete: () => {
            AnimationState.isAnimating = false;
            console.debug('All sub-cards revealed and orbiting.');
        }
    });
    subs.forEach((sub, index) => {
      gsap.killTweensOf(sub);
      if (sub.orbitParams) gsap.killTweensOf(sub.orbitParams); 
      const startAngle = (Math.PI * 2 / subs.length) * index;
      const speed = orbitSpeedBase + (Math.random() * 10 - 5);
      sub.orbitParams = {
        angle: startAngle,
        radius: orbitRadius * (1.2 * 0.4),
        speed: Math.max(10, speed),
        direction: 1
      };
      const initialX = Math.cos(startAngle) * sub.orbitParams.radius;
      const initialY = Math.sin(startAngle) * sub.orbitParams.radius;
      gsap.set(sub, { visibility: 'visible'});
      tl.add(gsap.delayedCall(0, () => {
        gsap.fromTo(sub, 
          { opacity: 0, scale: 0, x: 0, y: 0 },
          {
            opacity: 1,
            scale: 1,
            x: initialX,
            y: initialY,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
              const orbitTween = gsap.to(sub.orbitParams, {
                angle: sub.orbitParams.angle + (sub.orbitParams.direction * Math.PI * 2),
                duration: sub.orbitParams.speed,
                ease: 'none',
                repeat: -1,
                onUpdate: function() {
                  if (AnimationState.focusedSubCard !== sub) {
                    gsap.set(sub, {
                      x: Math.cos(this.targets()[0].angle) * this.targets()[0].radius,
                      y: Math.sin(this.targets()[0].angle) * this.targets()[0].radius
                    });
                  }
                }
              });
              AnimationState.subCardOrbitTweens.push(orbitTween);
            }
          }
        );
      }), index * 0.1);
    });
  }

  function focusSubCard(subCard) {
    console.debug('Focusing sub-card:', subCard);
    AnimationState.setFocusedSubCard(subCard);
    subCard.classList.add('focused');
    const existingOrbitTween = AnimationState.subCardOrbitTweens.find(t => t.targets()[0] === subCard.orbitParams);
    if (existingOrbitTween) existingOrbitTween.pause();
    const mainCardGroup = AnimationState.activeCard;
    const containerRect = mainCardGroup.querySelector('.sub-cards-container').getBoundingClientRect();
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;
    const targetX = windowCenterX - containerRect.left;
    const targetY = windowCenterY - containerRect.top;
    const targetScale = 1.5;
    gsap.to(subCard, {
      x: targetX,
      y: targetY,
      scale: targetScale,
      duration: 0.4,
      ease: 'power2.out',
      zIndex: 10000,
      onComplete: () => {
        console.debug('Sub-card focused.');
        AnimationState.subCardAnimating = false;
        AnimationState.releaseGeneralLock();
      }
    });
  }

  function unfocusSubCard(subCard, callback) {
    console.debug('Unfocusing sub-card:', subCard);
    AnimationState.subCardAnimating = true;
    AnimationState.isAnimating = true;
    subCard.classList.remove('focused');
    const targetX = Math.cos(subCard.orbitParams.angle) * subCard.orbitParams.radius;
    const targetY = Math.sin(subCard.orbitParams.angle) * subCard.orbitParams.radius;
    gsap.to(subCard, {
      x: targetX,
      y: targetY,
      scale: 1,
      duration: 0.4,
      ease: 'power2.out',
      zIndex: 10,
      onComplete: () => {
        console.debug('Sub-card unfocused.');
        const existingOrbitTween = AnimationState.subCardOrbitTweens.find(t => t.targets()[0] === subCard.orbitParams);
        if (existingOrbitTween) existingOrbitTween.resume();
        if(AnimationState.focusedSubCard === subCard) {
            AnimationState.clearFocusedSubCard(); 
        } else {
            AnimationState.subCardAnimating = false;
            AnimationState.releaseGeneralLock();
        }
        if (callback) callback();
      }
    });
  }

 function resetAllAnimations(onCompleteCallback) {
    console.debug('Resetting all animations.');
    if (!AnimationState.activeCard && !AnimationState.focusedSubCard) {
        console.debug('Nothing to reset.');
        if(onCompleteCallback) onCompleteCallback();
        return;
    }
    AnimationState.mainCardAnimating = true;
    AnimationState.isAnimating = true;
    const cardToReset = AnimationState.activeCard;
    const focusedSub = AnimationState.focusedSubCard;
    const tl = gsap.timeline({
        onComplete: () => {
            console.debug('All reset animations complete.');
            if (cardToReset) {
                gsap.set(cardToReset, { clearProps: 'x,y,scale,zIndex' });
                const innerCard = cardToReset.querySelector('.card-inner');
                if (innerCard) gsap.set(innerCard, { clearProps: 'rotationY'});
            }
            AnimationState.resetAllStateFlags();
            cardGroups.forEach(g => { 
                g.classList.remove('selected', 'deselected');
                gsap.set(g, { opacity: 1, scale: 1, x:0, y:0, clearProps: 'pointerEvents,x,y,scale,opacity,zIndex'});
            });
            document.body.classList.remove('dimmed-background', 'active', 'sub-card-interaction-lock');
            if (onCompleteCallback) onCompleteCallback();
        }
    });
    if (focusedSub) {
        focusedSub.classList.remove('focused');
        tl.to(focusedSub, {
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
            duration: 0.3,
            ease: 'power1.in'
        }, "resetStart");
    }
    if (cardToReset) {
        const subCardContainer = cardToReset.querySelector('.sub-cards-container');
        if (subCardContainer) {
            const subs = Array.from(subCardContainer.querySelectorAll('.sub-card'));
            subs.forEach(sub => {
                gsap.killTweensOf(sub);
                if(sub.orbitParams) gsap.killTweensOf(sub.orbitParams);
                tl.to(sub, {
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0,
                    duration: 0.3,
                    ease: 'power1.in',
                    onComplete: () => gsap.set(sub, {visibility: 'hidden'})
                }, "resetStart+=0.1");
            });
            tl.set(subCardContainer, {visibility:'hidden', display:'none'}, ">+=0.1");
        }
        const innerCard = cardToReset.querySelector('.card-inner');
        if (innerCard) {
            tl.to(innerCard, {
                rotationY: 0,
                duration: 0.4,
                ease: 'power1.inOut'
            }, "resetStart+=0.1");
        }
        tl.to(cardToReset, {
            x: 0,
            y: 0,
            scale: cardToReset.originalState.scale,
            opacity: cardToReset.originalState.opacity,
            zIndex: cardToReset.originalState.zIndex,
            duration: 0.5,
            ease: 'power2.inOut',
        }, "resetStart+=0.2");
    }
    tl.call(() => {
        cardGroups.forEach(g => {
            if (g !== cardToReset) {
                g.classList.remove('deselected');
            }
        });
        document.body.classList.remove('dimmed-background', 'active');
    }, null, ">-=0.2");
    if (!cardToReset && focusedSub) {
         AnimationState.resetAllStateFlags();
    }
  }
});
