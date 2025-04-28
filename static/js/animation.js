// static/js/animation.js

document.addEventListener('DOMContentLoaded', () => {
  // 1️⃣ Grab and log
  const groups   = Array.from(document.querySelectorAll('.card-group'));
  const subCards = Array.from(document.querySelectorAll('.sub-card'));
  console.log(`🔍 Found ${groups.length} card-groups and ${subCards.length} sub-cards`);

  // Pre-defined scatter offsets
  const scatterPositions = [
    { x: -150, y: -80 },
    { x:  150, y: -80 },
    { x:    0, y: 150 }
  ];

  // 2️⃣ Main card click → center, flip, scatter sub-cards
  groups.forEach((group, i) => {
    group.addEventListener('click', e => {
      e.stopPropagation();
      console.log(`➡️ [group #${i}] click detected`, group);

      resetAll();
      group.classList.add('selected');
      document.body.classList.add('dimmed');


      // Center & scale the card
      gsap.to(group, {
        duration: 0.5,
        scale: 1.2,
        x: () => window.innerWidth/2  - (group.getBoundingClientRect().left + group.offsetWidth/2),
        y: () => window.innerHeight/2 - (group.getBoundingClientRect().top  + group.offsetHeight/2),
        ease: 'power2.out',
        transformOrigin: 'center center'
      });

      // Flip it
      const inner = group.querySelector('.card-inner');
      console.log('   ↪️ Flipping inner element', inner);
      gsap.to(inner, {
        duration: 0.6,
        rotationY: 180,
        ease: 'power2.inOut',
        delay: 0.5
      });

      // Scatter its sub-cards
      const subs = subCards.filter(sc => group.contains(sc));
      console.log('   ↪️ Scattering sub-cards:', subs);
      gsap.to(subs, {
        duration: 0.4,
        opacity: 1,
        scale: 1,
        x: (idx) => scatterPositions[idx].x,
        y: (idx) => scatterPositions[idx].y,
        ease: 'back.out(1.7)',
        delay: 1.1,
        stagger: 0.15
      });
    });
  });

  // 3️⃣ Sub-card click → pop-out + dim
  subCards.forEach((card, ci) => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      console.log(`🔍 [sub#${ci}] click detected`, card);

      gsap.to(card, {
        duration: 0.5,
        scale: 1.5,
        x: () => window.innerWidth/2  - (card.getBoundingClientRect().left + card.offsetWidth/2),
        y: () => window.innerHeight/2 - (card.getBoundingClientRect().top  + card.offsetHeight/2),
        ease: 'power2.out'
      });

      document.body.classList.add('dimmed');
      card.classList.add('active');
    });
  });

  // 4️⃣ Click outside → reset everything
  document.addEventListener('click', () => {
    console.log('⏪ Document click → resetAll()');
    resetAll();
  });

  // 🔄 Helper to clear all classes & tweens
  function resetAll() {
    groups.forEach(g => {
      g.classList.remove('selected');
      gsap.killTweensOf(g);
      gsap.set(g, { clearProps: 'all' });

      const inner = g.querySelector('.card-inner');
      gsap.killTweensOf(inner);
      gsap.set(inner, { clearProps: 'all' });
    });

    subCards.forEach(sc => {
      sc.classList.remove('active');
      gsap.killTweensOf(sc);
      gsap.set(sc, { clearProps: 'all' });
    });
  }

  console.log('✅ Portfolio interactions ready.');
});
