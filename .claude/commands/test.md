# Test Command

Run the email template test suite

## Usage

```
/test [suite]
```

## Options

- No arguments: Run basic validation tests
- `full`: Run complete test suite including Gmail compatibility and link validation
- `links`: Run link validation tests only
- `basic`: Run basic HTML validation tests only
- `gmail`: Run Gmail compatibility tests only
- `headed`: Run tests in headed mode (visible browser)
- `ui`: Run tests with Playwright UI mode

## Examples

```bash
# Run basic tests (default)
npm run test

# Run full test suite
npm run test:full

# Run specific test types
npm run test:links
npm run test:basic
npm run test:gmail

# Debug with browser visible
npm run test:headed

# Interactive test runner
npm run test:ui
```

## What it tests

- HTML validation and structure
- Gmail compatibility (table layouts, inline styles)
- Link validation and accessibility
- Mobile responsiveness
- Brand color compliance
- Email client compatibility