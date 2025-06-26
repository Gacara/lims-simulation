import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        userAgent: ''
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent;

    // Mobile detection based on user agent and screen size
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isMobileSize = width <= 768;
    const isMobile = isMobileUA || isMobileSize;

    // Tablet detection
    const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const isTabletSize = width > 768 && width <= 1024;
    const isTablet = isTabletUA || (isTabletSize && !isMobile);

    return {
      isMobile: isMobile && !isTablet,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      screenWidth: width,
      screenHeight: height,
      userAgent
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;

      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isMobileSize = width <= 768;
      const isMobile = isMobileUA || isMobileSize;

      const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent);
      const isTabletSize = width > 768 && width <= 1024;
      const isTablet = isTabletUA || (isTabletSize && !isMobile);

      setDeviceInfo({
        isMobile: isMobile && !isTablet,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        screenWidth: width,
        screenHeight: height,
        userAgent
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
} 