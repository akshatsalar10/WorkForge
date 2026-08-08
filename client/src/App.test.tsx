import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Component', () => {
  it('renders authentication login screen by default when unauthenticated', async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(await screen.findByText(/Sign in to WorkForge/i)).toBeInTheDocument();
  });
});
