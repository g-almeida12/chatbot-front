import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Element.prototype.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();