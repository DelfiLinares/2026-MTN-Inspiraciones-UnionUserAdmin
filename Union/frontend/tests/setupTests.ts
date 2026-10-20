import '@testing-library/jest-dom';import '@testing-library/jest-dom'

import { expect, afterEach } from 'vitest';import { expect, afterEach } from 'vitest'

import { cleanup } from '@testing-library/react';import { cleanup } from '@testing-library/react'



// Cleanup after each test// Cleanup after each test

afterEach(() => {afterEach(() => {

  cleanup();  cleanup()

});})


// Global test utilities
declare global {
  namespace Vi {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveAttribute(attr: string, value?: string): R
    }
  }
}

export {}
