// Mobile detection hook for RestoHub
import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface MobileDetectResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  userAgent: string;
}

export function useMobile(): MobileDetectResult {
  const [result, setResult] = useState<MobileDetectResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: 'desktop',
    userAgent: '',
  });

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
      const isTablet = /Tablet|iPad/i.test(ua);
      
      return {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        deviceType: (isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop') as DeviceType,
        userAgent: ua,
      };
    };

    // Set initial device detection
    
    setResult(detectDevice());

    // Handle resize for responsive detection
    const handleResize = () => {
      setResult(detectDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return result;
}

// Capacitor platform detection
export function isCapacitorApp(): boolean {
  return typeof window !== 'undefined' && 
         'Capacitor' in window;
}

// Check if running as PWA
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}
