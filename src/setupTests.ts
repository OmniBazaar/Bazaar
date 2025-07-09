import '@testing-library/jest-dom';

// Mock fetch for all tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock chrome extension APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
} as any;

// Setup after each test
afterEach(() => {
  mockFetch.mockClear();
}); 