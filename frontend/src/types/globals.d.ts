// Global type declarations for VTellTales
declare global {
  function gtag(...args: any[]): void;
  
  interface Window {
    gtag?: (...args: any[]) => void;
    analytics: any;
  }
}