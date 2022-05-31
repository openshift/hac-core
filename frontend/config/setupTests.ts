import '@testing-library/jest-dom';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useLayoutEffect: jest.requireActual('react').useEffect,
}));

// eslint-disable-next-line @typescript-eslint/no-empty-function
Element.prototype.scrollTo = () => {};
