// static/js/animation.test.js

describe('Portfolio Animation Tests', () => {
  let container;
  let cardGroup;
  let subCards;

  beforeEach(() => {
    // Setup DOM
    container = document.createElement('div');
    container.innerHTML = `
      <div class="card-group">
        <div class="card-inner">
          <div class="sub-card">Sub 1</div>
          <div class="sub-card">Sub 2</div>
          <div class="sub-card">Sub 3</div>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    // Initialize elements
    cardGroup = container.querySelector('.card-group');
    subCards = Array.from(container.querySelectorAll('.sub-card'));

    // Mock window dimensions
    window.innerWidth = 1024;
    window.innerHeight = 768;
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('Card group click should trigger animation', () => {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });

    cardGroup.dispatchEvent(clickEvent);
    
    expect(cardGroup.classList.contains('selected')).toBe(true);
    expect(document.body.classList.contains('dimmed')).toBe(true);
  });

  test('Sub-cards should orbit around main card', () => {
    // Trigger main card click
    cardGroup.click();

    // Check if sub-cards are visible and positioned
    subCards.forEach(card => {
      expect(card.style.opacity).toBe('1');
      expect(card.style.transform).toBeTruthy();
    });
  });

  test('Click outside should reset animations', () => {
    // First click the card
    cardGroup.click();
    
    // Then click outside
    document.body.click();

    expect(cardGroup.classList.contains('selected')).toBe(false);
    expect(document.body.classList.contains('dimmed')).toBe(false);
    expect(AnimationState.isAnimating).toBe(false);
  });

  test('Sub-card click should trigger pop-out', () => {
    // First click the main card
    cardGroup.click();

    // Then click a sub-card
    const subCard = subCards[0];
    subCard.click();

    expect(subCard.classList.contains('active')).toBe(true);
    expect(subCard.style.transform).toContain('scale(1.5)');
  });

  test('Animation state should prevent multiple animations', () => {
    // First click
    cardGroup.click();
    
    // Try to click again while animating
    cardGroup.click();

    // Check if animation state prevented the second click
    expect(AnimationState.isAnimating).toBe(true);
  });
}); 