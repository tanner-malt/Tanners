// tests/report.js
const fs = require('fs');
const path = require('path');

class TestReporter {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    addResult(test) {
        this.results.total++;
        if (test.status === 'passed') {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
        this.results.details.push({
            name: test.name,
            status: test.status,
            duration: test.duration,
            error: test.error
        });
    }

    generateReport() {
        const report = `
Test Results Report
==================
Total Tests: ${this.results.total}
Passed: ${this.results.passed}
Failed: ${this.results.failed}

Details:
${this.results.details.map(test => `
${test.name}
Status: ${test.status}
Duration: ${test.duration}ms
${test.error ? `Error: ${test.error}` : ''}
`).join('\n')}
        `;

        // Save report to file
        const reportPath = path.join(__dirname, '../reports/test-report.txt');
        fs.writeFileSync(reportPath, report);

        // Also save as JSON for programmatic access
        const jsonPath = path.join(__dirname, '../reports/test-report.json');
        fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));

        return report;
    }
}

module.exports = TestReporter; 