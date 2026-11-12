const puppeteer = require('puppeteer');
const path = require('path');

describe('Animation Integration Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });
    });

    beforeEach(async () => {
        page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ width: 1024, height: 768 });
        
        // Load the test page
        await page.goto(`file:${path.join(__dirname, '../../static/index.html')}`);
        
        // Wait for animations to be ready
        await page.waitForSelector('.card-group');
    });

    afterEach(async () => {
        await page.close();
    });

    afterAll(async () => {
        await browser.close();
    });

    test('Card group animation sequence', async () => {
        // Click the first card group
        await page.click('.card-group');
        
        // Wait for animation
        await page.waitForTimeout(1000);
        
        // Check if card is centered and scaled
        const cardGroup = await page.$('.card-group');
        const transform = await page.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.transform;
        }, cardGroup);
        
        expect(transform).toContain('scale(1.2)');
        
        // Check if sub-cards are visible
        const subCards = await page.$$('.sub-card');
        expect(subCards.length).toBe(3);
        
        // Check if sub-cards are positioned in orbit
        for (const card of subCards) {
            const opacity = await page.evaluate(el => {
                const style = window.getComputedStyle(el);
                return style.opacity;
            }, card);
            expect(parseFloat(opacity)).toBe(1);
        }
    });

    test('Sub-card pop-out animation', async () => {
        // Click the main card
        await page.click('.card-group');
        await page.waitForTimeout(1000);
        
        // Click a sub-card
        await page.click('.sub-card');
        await page.waitForTimeout(500);
        
        // Check if sub-card is scaled up
        const subCard = await page.$('.sub-card');
        const transform = await page.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.transform;
        }, subCard);
        
        expect(transform).toContain('scale(1.5)');
    });

    test('Click outside reset', async () => {
        // Click the main card
        await page.click('.card-group');
        await page.waitForTimeout(1000);
        
        // Click outside
        await page.mouse.click(0, 0);
        await page.waitForTimeout(500);
        
        // Check if everything is reset
        const cardGroup = await page.$('.card-group');
        const transform = await page.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.transform;
        }, cardGroup);
        
        expect(transform).not.toContain('scale(1.2)');
        
        // Check if sub-cards are hidden
        const subCards = await page.$$('.sub-card');
        for (const card of subCards) {
            const opacity = await page.evaluate(el => {
                const style = window.getComputedStyle(el);
                return style.opacity;
            }, card);
            expect(parseFloat(opacity)).toBe(0);
        }
    });

    test('Performance metrics', async () => {
        const metrics = [];
        
        // Start performance measurement
        await page.evaluateOnNewDocument(() => {
            window.performance.mark('start');
        });
        
        // Perform animation sequence
        await page.click('.card-group');
        await page.waitForTimeout(1000);
        await page.click('.sub-card');
        await page.waitForTimeout(500);
        
        // End performance measurement
        const performanceMetrics = await page.evaluate(() => {
            window.performance.mark('end');
            window.performance.measure('animation', 'start', 'end');
            const measure = window.performance.getEntriesByName('animation')[0];
            return {
                duration: measure.duration,
                startTime: measure.startTime
            };
        });
        
        expect(performanceMetrics.duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
}); 