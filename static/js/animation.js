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
  isAnimating: false,        // General lock during transitions
  mainCardAnimating: false, // Specific lock for main card select/flip/reset
  activeCard: null,
  focusedSubCard: null,    // Stores the currently enlarged sub-card
  subCardOrbitTweens: [],  // Store active orbit tweens for killing on reset
  orbitPathElement: null,  // Stores the dynamically created orbit circle
  centerPointElement: null, // Stores the center point marker
  
  setActiveCard(card) {
    this.activeCard = card;
    this.isAnimating = true;
    this.mainCardAnimating = true;
  },
  setFocusedSubCard(subCard) {
    this.focusedSubCard = subCard;
    this.isAnimating = true; // Lock while focusing/unfocusing sub-card
  },
  clearFocusedSubCard() {
    if (this.focusedSubCard) {
      this.focusedSubCard.classList.remove('focused');
    }
    this.focusedSubCard = null;
    // Only release general lock if main card isn't also animating
    if (!this.mainCardAnimating) {
      this.isAnimating = false;
    }
  },
  reset() {
    // Clear active orbit tweens explicitly
    this.subCardOrbitTweens.forEach(tween => tween.kill());
    this.subCardOrbitTweens = [];

    // Animate out and remove orbit path if it exists
    if (this.orbitPathElement) {
      gsap.to(this.orbitPathElement, {
        opacity: 0,
        scale: 0,
        duration: 0.3,
        ease: 'power1.in',
        onComplete: () => {
          if (this.orbitPathElement && this.orbitPathElement.parentNode) {
            this.orbitPathElement.parentNode.removeChild(this.orbitPathElement);
          }
          this.orbitPathElement = null;
        }
      });
    }

    // Remove center point if it exists
    if (this.centerPointElement) {
      if (this.centerPointElement.parentNode) {
        this.centerPointElement.parentNode.removeChild(this.centerPointElement);
      }
      this.centerPointElement = null;
    }

    // Reset other states
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
  // Check if GSAP is loaded
  if (typeof gsap === 'undefined') {
    console.error('GSAP library not loaded! Animation features will not work.');
    return;
  }

  const groups = Array.from(document.querySelectorAll('.card-group'));
  const subCards = Array.from(document.querySelectorAll('.sub-card'));
  Logger.info(`Found ${groups.length} card-groups and ${subCards.length} sub-cards`);

  // Store initial positions for reset
  groups.forEach(group => {
      const groupRect = group.getBoundingClientRect();
      group.originalLeft = groupRect.left + window.scrollX;
      group.originalTop = groupRect.top + window.scrollY;
      group.originalWidth = group.offsetWidth;
      group.originalHeight = group.offsetHeight;
      // Make sub-cards invisible by default and force visibility hidden (defensive)
      const groupSubs = Array.from(group.querySelectorAll('.sub-card'));
      gsap.set(groupSubs, { opacity: 0, scale: 0, visibility: 'hidden', display: 'block' }); 
  });

  // --- Event Handlers --- 

  // Main card click handler
  groups.forEach((group) => {
    group.addEventListener('click', e => {
      Logger.debug('GROUP CLICK EVENT TRIGGERED', group); 
      e.stopPropagation();
      Logger.debug(`Card group clicked`, group);

      if (AnimationState.mainCardAnimating || AnimationState.isAnimating) {
        Logger.debug('Animation in progress, ignoring click.');
        return;
      }
      if (AnimationState.focusedSubCard) {
        Logger.debug('A sub-card is focused. Click it or outside to dismiss first.');
        return; 
      }

      if (AnimationState.activeCard === group) {
        resetAll(); // Clicked active card, so reset
        return;
      }
      if (AnimationState.activeCard && AnimationState.activeCard !== group) {
        resetAll(); // A different card was active, reset it first
        // Add a slight delay before processing the new click to allow reset animation to start
        setTimeout(() => processGroupClick(group), 100); 
        return; 
      }
      
      processGroupClick(group);
    });
  });


  function processGroupClick(group) {
      if (AnimationState.isAnimating || AnimationState.mainCardAnimating) return; // Double check state

      AnimationState.setActiveCard(group);
      group.classList.add('selected');
      document.body.classList.add('dimmed');

      // Fade out non-selected groups (more robust than just sub-cards)
      groups.forEach(g => {
          if (g !== group) {
              gsap.to(g, { opacity: 0.3, scale: 0.95, duration: 0.3, ease: 'power1.in', pointerEvents: 'none' });
          }
      });

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Animate main card to center of the screen
      gsap.to(group, {
        duration: 0.6,
        scale: 1.2,
        x: centerX - (group.originalLeft + group.offsetWidth / 2),
        y: centerY - (group.originalTop + group.offsetHeight / 2),
        ease: 'power2.out',
        transformOrigin: 'center center',
        zIndex: 9999, // Bring selected card above dimmed layer
        onComplete: () => {
          Logger.debug('Main card centered');
          // Store the actual centered position for reference
          group.centeredX = centerX;
          group.centeredY = centerY;
        }
      });

      // Animate flip
      const inner = group.querySelector('.card-inner');
      gsap.to(inner, {
        duration: 0.6,
        rotationY: 180,
        ease: 'power2.inOut',
        delay: 0.4, 
        onComplete: () => {
          Logger.debug('Card flipped, starting sub-card orbits.');
          AnimationState.mainCardAnimating = false; // Flip complete
          
          // Force display of sub-cards
          const subCardsContainer = group.querySelector('.sub-cards');
          if (subCardsContainer) {
            gsap.set(subCardsContainer, { display: 'block', visibility: 'visible' });
            Logger.debug('Sub-cards container set to visible', subCardsContainer);
          }

          const selectedSubs = Array.from(group.querySelectorAll('.sub-card'));
          
          // Get the actual dimensions of the flipped card
          const cardBack = inner.querySelector('.card-back');
          
          // Calculate the center of the card in the DOM
          const cardRect = group.getBoundingClientRect();
          const cardCenterX = cardRect.width / 2;
          const cardCenterY = cardRect.height / 2;
          
          // Store these values for sub-card positioning
          group.actualCenterX = cardCenterX;
          group.actualCenterY = cardCenterY;
          
          // Calculate orbit radius based on card size
          const orbitRadius = Math.min(cardRect.width, cardRect.height) * 0.35;
          const orbitPathDiameter = orbitRadius * 2;
          const orbitSpeedBase = 30;
          
          Logger.debug('Card Dimensions:', {
            width: cardRect.width,
            height: cardRect.height,
            centerX: cardCenterX,
            centerY: cardCenterY,
            orbitRadius: orbitRadius
          });

          // Create and animate in the orbit path (invisible guide)
          if (AnimationState.orbitPathElement && AnimationState.orbitPathElement.parentNode) {
            AnimationState.orbitPathElement.parentNode.removeChild(AnimationState.orbitPathElement);
          }
          
          // Create orbit circle
          AnimationState.orbitPathElement = document.createElement('div');
          const orbitCircle = AnimationState.orbitPathElement;
          orbitCircle.style.position = 'absolute';
          orbitCircle.style.width = `${orbitPathDiameter}px`;
          orbitCircle.style.height = `${orbitPathDiameter}px`;
          orbitCircle.style.border = '1px dotted rgba(255, 255, 255, 0.1)'; // Nearly invisible border
          orbitCircle.style.borderRadius = '50%';
          orbitCircle.style.pointerEvents = 'none';
          orbitCircle.style.zIndex = '9999';
          
          // Position the orbit circle precisely in the center of the card
          orbitCircle.style.top = '50%';
          orbitCircle.style.left = '50%';
          orbitCircle.style.transform = 'translate(-50%, -50%)';
          
          inner.appendChild(orbitCircle);
          


          // Set the orbit circle to be invisible
          gsap.set(orbitCircle, { scale: 0, opacity: 0 });
          gsap.to(orbitCircle, {
            duration: 0.7,
            scale: 1,
            opacity: 0, // Keep it invisible
            ease: 'power2.out',
            delay: 0.2 // Slightly after flip
          });

          // Log the sub-cards we found
          Logger.debug(`Found ${selectedSubs.length} sub-cards to animate`, selectedSubs);
          
          // Calculate sub-card positions
          selectedSubs.forEach((sub, index) => {
              gsap.killTweensOf(sub); // Kill any previous positioning tweens

              // Calculate radius for sub-cards to orbit exactly on the circle's path
              const subCardEffectiveRadius = orbitRadius;

              // Calculate even distribution around the circle
              const startAngle = (Math.PI * 2 / selectedSubs.length) * index;
              const speed = orbitSpeedBase + (Math.random() * 5); // Less randomness for more uniform speed
              const direction = 1; // All cards orbit in the same direction for consistency

              sub.orbitParams = {
                  angle: startAngle,
                  radius: subCardEffectiveRadius,
                  speed: speed,
                  direction: direction
              };
              
              Logger.debug(`Setting up sub-card #${index}:`, sub.textContent);
              
              // Set initial state (center of parent, invisible)
              gsap.set(sub, {
                  position: 'absolute',
                  x: 0,
                  y: 0,
                  left: '50%',
                  top: '50%',
                  scale: 0,
                  opacity: 0,
                  visibility: 'visible',
                  transformOrigin: 'center center',
                  zIndex: 10000, // Sub-cards above orbit path and main card
                  display: 'block' // Ensure sub-cards are displayed
              });

              AnimationState.isAnimating = true; // Lock during spawn
              
              // Calculate initial position on the circle
              const initialOffsetX = Math.cos(startAngle) * subCardEffectiveRadius;
              const initialOffsetY = Math.sin(startAngle) * subCardEffectiveRadius;
              
              // 1. Animate spawn to starting orbit position
              gsap.to(sub, {
                  scale: 1,
                  opacity: 1,
                  x: initialOffsetX,
                  y: initialOffsetY,
                  transform: `translate(-50%, -50%) translate(${initialOffsetX}px, ${initialOffsetY}px)`,
                  duration: 0.6,
                  delay: 0.1 + index * 0.15,
                  ease: 'power2.out',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  onComplete: () => {
                      AnimationState.isAnimating = false; // Unlock after spawn
                      Logger.debug(`Sub-card #${index} spawned. Starting orbit.`);
                      
                      // 2. Start continuous orbit
                      const orbitTween = gsap.to(sub.orbitParams, {
                          angle: sub.orbitParams.angle + (sub.orbitParams.direction * Math.PI * 2),
                          duration: sub.orbitParams.speed,
                          ease: "none",
                          repeat: -1,
                          onUpdate: function() {
                              // Only update position if not focused
                              if (AnimationState.focusedSubCard !== sub) {
                                  const angle = this.targets()[0].angle;
                                  const radius = this.targets()[0].radius;
                                  
                                  // Calculate position on the circle
                                  const offsetX = Math.cos(angle) * radius;
                                  const offsetY = Math.sin(angle) * radius;
                                  
                                  // Position relative to center with transform
                                  gsap.set(sub, {
                                      x: offsetX,
                                      y: offsetY,
                                      transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`
                                  });
                              }
                          }
                      });
                      AnimationState.subCardOrbitTweens.push(orbitTween); // Store tween for cleanup
                  }
              });
          });
        }
      });
  }

  // Sub-card click handler
  subCards.forEach((card) => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      const parentGroup = card.closest('.card-group');
      // Only allow focus if parent card is the active selected card and no other animation is running
      if (AnimationState.mainCardAnimating || AnimationState.isAnimating || !AnimationState.activeCard || parentGroup !== AnimationState.activeCard) {
          Logger.debug('Ignoring sub-card click due to animation state or inactive parent.');
          return;
      }

      if (AnimationState.focusedSubCard === card) { // Clicked already focused card
          AnimationState.isAnimating = true;
          
          // Pause orbit tween
          const tween = AnimationState.subCardOrbitTweens.find(t => t.targets()[0] === card.orbitParams);
          if (tween) tween.pause();
          
          // Return to orbit
          gsap.to(card, {
              duration: 0.4,
              scale: 1,
              x: Math.cos(card.orbitParams.angle) * card.orbitParams.radius,
              y: Math.sin(card.orbitParams.angle) * card.orbitParams.radius,
              transform: `translate(-50%, -50%) translate(${Math.cos(card.orbitParams.angle) * card.orbitParams.radius}px, ${Math.sin(card.orbitParams.angle) * card.orbitParams.radius}px)`,
              zIndex: 10000,
              ease: 'power2.out',
              onComplete: () => {
                  // Resume orbit after returning
                  if (tween) tween.resume();
                  AnimationState.clearFocusedSubCard();
                  document.body.classList.remove('sub-card-focused');
              }
          });
          return;
      }

      // If another sub-card is focused, unfocus it first
      if (AnimationState.focusedSubCard && AnimationState.focusedSubCard !== card) {
          const currentlyFocused = AnimationState.focusedSubCard;
          
          // Pause orbit tween
          const tween = AnimationState.subCardOrbitTweens.find(t => t.targets()[0] === currentlyFocused.orbitParams);
          if (tween) tween.pause();
          
          // Return to orbit
          gsap.to(currentlyFocused, {
              scale: 1,
              x: Math.cos(currentlyFocused.orbitParams.angle) * currentlyFocused.orbitParams.radius,
              y: Math.sin(currentlyFocused.orbitParams.angle) * currentlyFocused.orbitParams.radius,
              transform: `translate(-50%, -50%) translate(${Math.cos(currentlyFocused.orbitParams.angle) * currentlyFocused.orbitParams.radius}px, ${Math.sin(currentlyFocused.orbitParams.angle) * currentlyFocused.orbitParams.radius}px)`,
              zIndex: 10000,
              duration: 0.2,
              onComplete: () => {
                  if (tween) tween.resume();
              }
          });
          currentlyFocused.classList.remove('focused');
      }

      AnimationState.setFocusedSubCard(card);
      card.classList.add('focused');
      document.body.classList.add('sub-card-focused');

      Logger.debug(`Sub-card clicked`, card);

      // Pause its orbit
      const tween = AnimationState.subCardOrbitTweens.find(t => t.targets()[0] === card.orbitParams);
      if (tween) tween.pause();

      const mainCardGroup = AnimationState.activeCard;
      const targetScale = 2;

      // Ensure the sub-card is centered on the screen when focused
      const windowCenterX = window.innerWidth / 2;
      const windowCenterY = window.innerHeight / 2;
      
      // Get the current position of the main card
      const mainCardRect = mainCardGroup.getBoundingClientRect();
      
      // Calculate the position to center the sub-card on screen
      gsap.to(card, {
          duration: 0.5,
          scale: targetScale,
          x: 0,
          y: 0,
          transform: `translate(-50%, -50%) translate(${windowCenterX - mainCardRect.left - mainCardRect.width/2}px, ${windowCenterY - mainCardRect.top - mainCardRect.height/2}px)`,
          zIndex: 10002, // Focused sub-card even higher
          ease: 'power2.out',
          onComplete: () => {
              Logger.debug('Sub-card popped out and focused');
              AnimationState.isAnimating = false; // Release lock
          }
      });
    });
  });

  // Click outside handler
  document.addEventListener('click', (event) => {
    if (AnimationState.mainCardAnimating || AnimationState.isAnimating) return; // Ignore clicks during transitions

    const clickedOnCardGroup = event.target.closest('.card-group');
    const clickedOnSubCard = event.target.closest('.sub-card');

    if (AnimationState.focusedSubCard && AnimationState.focusedSubCard !== clickedOnSubCard) {
      // Clicked outside a focused sub-card -> unfocus it
      const card = AnimationState.focusedSubCard;
      AnimationState.isAnimating = true;
      
      // Return to orbit
      gsap.to(card, {
          duration: 0.4,
          scale: 1,
          x: Math.cos(card.orbitParams.angle) * card.orbitParams.radius,
          y: Math.sin(card.orbitParams.angle) * card.orbitParams.radius,
          transform: `translate(-50%, -50%) translate(${Math.cos(card.orbitParams.angle) * card.orbitParams.radius}px, ${Math.sin(card.orbitParams.angle) * card.orbitParams.radius}px)`,
          zIndex: 10000,
          ease: 'power2.out',
          onComplete: () => {
              const tween = AnimationState.subCardOrbitTweens.find(t => t.targets()[0] === card.orbitParams);
              if (tween) tween.resume();
              AnimationState.clearFocusedSubCard();
              document.body.classList.remove('sub-card-focused');
          }
      });
    } else if (AnimationState.activeCard && !clickedOnCardGroup && !AnimationState.focusedSubCard) {
        // Clicked outside an active main card (and no sub-card is focused) -> reset all
        Logger.debug('Document click detected outside active elements, resetting animations');
        resetAll();
    }
  });

  // Reset function
  function resetAll() {
    Logger.debug('Resetting all animations...');
    if (AnimationState.isAnimating && !AnimationState.mainCardAnimating) {
        // Avoid interrupting reset if already resetting
        // Or if only a sub-card focus animation is happening (allow it to complete?)
        // This might need refinement based on desired behavior during rapid clicks.
        // For now, allow reset even if sub-card is focusing.
    }
    
    AnimationState.mainCardAnimating = true; // Lock during reset
    AnimationState.isAnimating = true;

    const cardToReset = AnimationState.activeCard;
    const focusedSubCardToReset = AnimationState.focusedSubCard;

    // If a sub-card was focused, animate it back towards center first
    if (focusedSubCardToReset) {
        gsap.to(focusedSubCardToReset, {
            duration: 0.3,
            scale: 0, // Scale down to disappear
            opacity: 0,
            x: 0,
            y: 0,
            transform: 'translate(-50%, -50%)',
            zIndex: 10000, // Keep sub-card zIndex consistent
            ease: 'power1.in'
        });
    }
    // Clear focused state now, the animation handles visual transition
    if (AnimationState.focusedSubCard) AnimationState.focusedSubCard.classList.remove('focused');
    AnimationState.focusedSubCard = null; 
    document.body.classList.remove('sub-card-focused');

    // Kill all active orbit tweens immediately
    AnimationState.subCardOrbitTweens.forEach(tween => tween.kill());
    AnimationState.subCardOrbitTweens = [];

    // Animate main card back if one was active
    if (cardToReset) {
      cardToReset.classList.remove('selected');
      const inner = cardToReset.querySelector('.card-inner');
      gsap.to(inner, { duration: 0.4, rotationY: 0, ease: 'power1.in' }); // Flip back
      gsap.to(cardToReset, { // Move back to original position
          duration: 0.5,
          delay: 0.1, 
          scale: 1,
          x: 0, 
          y: 0,
          zIndex: 1, // Reset z-index
          ease: 'power2.inOut',
          clearProps: "transform" 
      });

      // Animate selected sub-cards back towards center and hide
      const selectedSubs = Array.from(cardToReset.querySelectorAll('.sub-card'));
      selectedSubs.forEach((sub, index) => {
          gsap.to(sub, {
              duration: 0.3,
              delay: 0.1 + (index * 0.05),
              scale: 0,
              opacity: 0,
              x: 0,
              y: 0,
              transform: 'translate(-50%, -50%)',
              ease: 'power1.in',
              onComplete: () => { gsap.set(sub, { visibility: 'hidden' }); } // Hide after animation
          });
      });
    }

    // Restore non-selected groups after a delay
    const resetDelay = cardToReset ? 0.6 : 0; // Delay more if a card was active
    gsap.delayedCall(resetDelay, () => {
      groups.forEach(g => {
          // Only restore groups that weren't the active one
          if (!cardToReset || g !== cardToReset) {
            gsap.to(g, { opacity: 1, scale: 1, duration: 0.3, clearProps: "pointerEvents" });
          }
          // No need to resume default orbits here, they are killed and will be recreated on next load/init
      });
      document.body.classList.remove('dimmed');
      AnimationState.reset(); // Fully reset state variables
      Logger.debug('Reset complete.');
    });
  }

  Logger.info('Portfolio interactions initialized.'); // Removed default orbit mention
});
