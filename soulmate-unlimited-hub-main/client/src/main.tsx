
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'
import './index.css'
import './i18n'

console.log('main.tsx starting...');

const container = document.getElementById("root");
console.log('Container:', container);

if (container) {
  console.log('Creating root...');
  try {
    const root = createRoot(container);
    console.log('Root created, rendering...');
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.log('Render complete');
  } catch (error) {
    console.error('Error in main.tsx:', error);
  }
} else {
  console.error('Root element not found!');
}
