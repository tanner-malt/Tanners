const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Mock GSAP
global.gsap = {
    to: jest.fn(),
    killTweensOf: jest.fn(),
    set: jest.fn()
};

describe('Animation Unit Tests', () => {
    let dom;
    let window;
    let document;
    let container;

    beforeAll(() => {
        // Load the animation.js file
        const animationScript = fs.readFileSync(
            path.join(__dirname, '../../static/js/animation.js'),
            'utf8'
        );

        // Create a new JSDOM instance
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div class="card-group">
                        <div class="card-inner">
                            <div class="sub-card">Sub 1</div>
                            <div class="sub-card">Sub 2</div>
                            <div class="sub-card">Sub 3</div>
                        </div>
                    </div>
                </body>
            </html>
        `, {
            runScripts: 'dangerously',
            resources: 'usable'
        });

        window = dom.window;
        document = window.document;

        // Mock window dimensions
        window.innerWidth = 1024;
        window.innerHeight = 768;

        // Execute the animation script
        const script = document.createElement('script');
        script.textContent = animationScript;
        document.body.appendChild(script);
    });

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
    });

    afterAll(() => {
        dom.window.close();
    });

    test('AnimationState should initialize correctly', () => {
        expect(AnimationState.isAnimating).toBe(false);
        expect(AnimationState.activeCard).toBeNull();
        expect(AnimationState.activeSubCards).toEqual([]);
    });

    test('calculateOrbitPositions should return correct positions', () => {
        const positions = calculateOrbitPositions(512, 384, 200);
        expect(positions).toHaveLength(3);
        positions.forEach(pos => {
            expect(pos).toHaveProperty('x');
            expect(pos).toHaveProperty('y');
        });
    });

    test('resetAll should clear all animations', () => {
        const cardGroup = document.querySelector('.card-group');
        cardGroup.classList.add('selected');
        document.body.classList.add('dimmed');

        resetAll();

        expect(cardGroup.classList.contains('selected')).toBe(false);
        expect(document.body.classList.contains('dimmed')).toBe(false);
        expect(gsap.killTweensOf).toHaveBeenCalled();
        expect(gsap.set).toHaveBeenCalled();
    });

    test('Card click should trigger animation sequence', () => {
        const cardGroup = document.querySelector('.card-group');
        const clickEvent = new window.MouseEvent('click');

        cardGroup.dispatchEvent(clickEvent);

        expect(gsap.to).toHaveBeenCalled();
        expect(cardGroup.classList.contains('selected')).toBe(true);
        expect(document.body.classList.contains('dimmed')).toBe(true);
    });

    test('Sub-card click should trigger pop-out animation', () => {
        const subCard = document.querySelector('.sub-card');
        const clickEvent = new window.MouseEvent('click');

        // First click the main card
        document.querySelector('.card-group').click();
        
        // Then click the sub-card
        subCard.dispatchEvent(clickEvent);

        expect(gsap.to).toHaveBeenCalled();
        expect(subCard.classList.contains('active')).toBe(true);
    });
}); 