import 'jest-preset-angular/setup-jest';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
  [Symbol.iterator]: jest.fn()
} as Storage;

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
