# Vitest Configuration & Testing Guide

## Setup

Vitest has been configured for Module 006 with the following setup:

### Configuration File

- **`vite.config.ts`**: Main configuration combining Vite + Vitest
- **`tests/setupTests.ts`**: Global test setup with Testing Library utilities

### Environment

- **Environment**: `jsdom` (simulates browser environment)
- **Globals**: Enabled (no need for `import { describe, it, expect }`)
- **Setup Files**: `tests/setupTests.ts` runs before each test

## Running Tests

### Basic Test Execution

```bash
npm run test
```

This runs all tests in watch mode.

### Single Test Run

```bash
npm run test -- --run
```

Or using the npm script alias:

```bash
npm run test:watch
```

## Test Structure

Tests are organized into three layers:

### 1. Domain Layer Tests (`tests/domain/`)

Test domain entities, value objects, and business rules:

```typescript
import { describe, it, expect } from 'vitest'

describe('Entity', () => {
  it('should create instance', () => {
    // Arrange
    const expected = true

    // Act
    const result = expected

    // Assert
    expect(result).toBe(true)
  })
})
```

**Key Principles**:
- Test immutability
- Test business rule validation
- No implementation details

### 2. Application Layer Tests (`tests/application/`)

Test services, use cases, and DTOs:

```typescript
import { describe, it, expect } from 'vitest'

describe('Service', () => {
  it('should execute use case', () => {
    // Use mocks for dependencies
    expect(true).toBe(true)
  })
})
```

**Key Principles**:
- Test business logic
- Mock external dependencies
- Verify data transformations

### 3. Integration Tests (`tests/integration/`)

Test component interactions and end-to-end flows:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Feature Flow', () => {
  it('should complete user journey', () => {
    // Test full flow across layers
    expect(true).toBe(true)
  })
})
```

**Key Principles**:
- Test complete flows
- Test component interactions
- Limited mocking (only external APIs)

## Coverage Reports

Coverage is configured to generate reports in multiple formats:

```bash
npm run test -- --coverage
```

**Note**: Coverage generation requires the v8 provider and generates reports in:
- `coverage/` directory
- Formats: `text`, `json`, `html`, `lcov`
- Excluded: `node_modules/`, `dist/`, `tests/`

## Testing Library Integration

The following utilities from `@testing-library/react` are available:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Example test
it('should render component', () => {
  render(<YourComponent />)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

## Path Aliases

The following path aliases are configured in `vite.config.ts`:

```typescript
'@': './src'
'@domain': './src/domain'
'@application': './src/application'
'@presentation': './src/presentation'
'@infrastructure': './src/infrastructure'
'@tests': './tests'
```

Usage in tests:

```typescript
import { CuestionarioService } from '@application/services'
import { OpcionRespuesta } from '@domain/entities'
```

## Debugging Tests

### Run Single Test File

```bash
npm run test -- tests/domain/example.test.ts
```

### Run Tests Matching Pattern

```bash
npm run test -- --grep "should create"
```

### Debug Mode

```bash
npm run test -- --inspect-brk
```

## Common Issues

### Tests Not Running

1. Verify `tests/setupTests.ts` exists
2. Check `vite.config.ts` has `test` configuration
3. Ensure dependencies are installed: `npm install`

### Coverage Not Generating

1. Run with explicit flag: `npm run test -- --coverage`
2. Check `vite.config.ts` coverage configuration
3. Verify `@vitest/coverage-v8` is installed

### Import Errors

1. Use path aliases (`@domain`, `@application`, etc.)
2. Check TypeScript paths in `tsconfig.json`
3. Verify file extensions (`.ts`, `.tsx`)

## Next Steps

1. **Module 006 Tests**: Follow test templates in each layer
2. **Coverage Target**: Aim for >70% coverage on new code
3. **CI/CD**: Coverage reports can be integrated into CI/CD pipelines

---

**Last Updated**: October 19, 2026  
**Module**: 006 (Cuestionario de Intereses)
