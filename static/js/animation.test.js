// static/js/animation.test.js

// Test Reporter
const TestReporter = {
  log: (message, data) => {
    console.log(`\n📋 ${message}`);
    if (data) console.log(data);
  },
  
  error: (message, error) => {
    console.error(`\n❌ ${message}`);
    if (error) console.error(error);
  },
  
  success: (message) => {
    console.log(`\n✅ ${message}`);
  }
};

describe('Portfolio Animation Tests', () => {
  let container;
  let cardGroup;
  let subCards;

  beforeAll(() => {
    TestReporter.log('Starting Portfolio Animation Test Suite');
  });

  beforeEach(() => {
    TestReporter.log('Setting up test environment');
    
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
    
    TestReporter.success('Test environment setup complete');
  });

  afterEach(() => {
    document.body.removeChild(container);
    TestReporter.log('Cleaned up test environment');
  });

  afterAll(() => {
    TestReporter.log('Portfolio Animation Test Suite completed');
  });

  test('Card group click should trigger animation', () => {
    TestReporter.log('Testing card group click animation');
    
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });

    cardGroup.dispatchEvent(clickEvent);
    
    expect(cardGroup.classList.contains('selected')).toBe(true);
    expect(document.body.classList.contains('dimmed')).toBe(true);
    
    TestReporter.success('Card group click animation test passed');
  });

  test('Sub-cards should orbit around main card', () => {
    TestReporter.log('Testing sub-card orbit animation');
    
    // Trigger main card click
    cardGroup.click();

    // Check if sub-cards are visible and positioned
    subCards.forEach((card, index) => {
      expect(card.style.opacity).toBe('1');
      expect(card.style.transform).toBeTruthy();
      TestReporter.log(`Sub-card ${index + 1} orbit position verified`);
    });
    
    TestReporter.success('Sub-card orbit animation test passed');
  });

  test('Click outside should reset animations', () => {
    TestReporter.log('Testing click outside reset functionality');
    
    // First click the card
    cardGroup.click();
    
    // Then click outside
    document.body.click();

    expect(cardGroup.classList.contains('selected')).toBe(false);
    expect(document.body.classList.contains('dimmed')).toBe(false);
    expect(AnimationState.isAnimating).toBe(false);
    
    TestReporter.success('Click outside reset test passed');
  });

  test('Sub-card click should trigger pop-out', () => {
    TestReporter.log('Testing sub-card pop-out animation');
    
    // First click the main card
    cardGroup.click();

    // Then click a sub-card
    const subCard = subCards[0];
    subCard.click();

    expect(subCard.classList.contains('active')).toBe(true);
    expect(subCard.style.transform).toContain('scale(1.5)');
    
    TestReporter.success('Sub-card pop-out animation test passed');
  });

  test('Animation state should prevent multiple animations', () => {
    TestReporter.log('Testing animation state management');
    
    // First click
    cardGroup.click();
    
    // Try to click again while animating
    cardGroup.click();

    // Check if animation state prevented the second click
    expect(AnimationState.isAnimating).toBe(true);
    
    TestReporter.success('Animation state management test passed');
  });
}); 