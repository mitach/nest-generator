/* eslint-env jest */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

import '@testing-library/jest-dom';

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'blob:mock-url'),
    revokeObjectURL: jest.fn(),
  },
  writable: true,
});

global.console.warn = jest.fn();

const mockToast = jest.fn();
mockToast.success = jest.fn();
mockToast.error = jest.fn();
mockToast.loading = jest.fn();
mockToast.dismiss = jest.fn();

jest.mock('react-hot-toast', () => mockToast);

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));
