import '@testing-library/jest-dom';
import { enableFetchMocks } from 'jest-fetch-mock';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useLayoutEffect: jest.requireActual('react').useEffect,
}));

// eslint-disable-next-line @typescript-eslint/no-empty-function
Element.prototype.scrollTo = () => {};

enableFetchMocks();
