export const documentEvents = {
  emit: (event: 'upload-complete' | 'category-updated') => {
    window.dispatchEvent(new CustomEvent('document-change', { detail: event }));
  },
  
  listen: (callback: () => void) => {
    const handler = () => callback();
    window.addEventListener('document-change', handler);
    return () => window.removeEventListener('document-change', handler);
  }
};