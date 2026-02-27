import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ErrorBoundary from '../ErrorBoundary';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Hello World</Text>
      </ErrorBoundary>,
    );
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders fallback on error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
    consoleSpy.mockRestore();
  });
});
