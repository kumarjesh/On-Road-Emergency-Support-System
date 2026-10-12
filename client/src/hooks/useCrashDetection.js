import { useState, useEffect, useRef } from 'react';

export const useCrashDetection = (onConfirmedCrash) => {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [crashData, setCrashData] = useState(null);
  const [telemetry, setTelemetry] = useState({
    gForce: 1.0,
    peakGForce: 1.0,
    pitch: 0,
    roll: 0,
    isSensorsSupported: false,
    statusText: 'Standing by • Monitoring G-Force'
  });

  const countdownTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const beepIntervalRef = useRef(null);

  // Synthetic Siren Sound Generator via Web Audio API
  const playSirenBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(960, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.42);
    } catch (e) {}
  };

  // Real device motion & orientation listeners
  useEffect(() => {
    let supported = false;

    const handleMotion = (event) => {
      supported = true;
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;
      const ax = acc.x || 0;
      const ay = acc.y || 0;
      const az = acc.z || 0;

      // Calculate total G-Force magnitude: sqrt(ax^2 + ay^2 + az^2) / 9.81
      const magnitude = Math.sqrt(ax * ax + ay * ay + az * az) / 9.81;
      const currentG = parseFloat(magnitude.toFixed(2));

      setTelemetry(prev => ({
        ...prev,
        gForce: currentG,
        peakGForce: Math.max(prev.peakGForce, currentG),
        isSensorsSupported: true
      }));

      // Crash trigger threshold: sudden G-Force spike > 3.8G (violent collision)
      if (currentG >= 3.8 && !isAlertActive) {
        triggerCrashAlert({
          type: 'High-Impact Collision Detected',
          gForce: currentG,
          angle: 0,
          timestamp: new Date().toISOString()
        });
      }
    };

    const handleOrientation = (event) => {
      const beta = Math.round(event.beta || 0); // Pitch
      const gamma = Math.round(event.gamma || 0); // Roll

      setTelemetry(prev => ({
        ...prev,
        pitch: beta,
        roll: gamma,
        isSensorsSupported: true
      }));

      // Rollover detection threshold: vehicle pitch or roll exceeds 80 degrees
      if ((Math.abs(beta) > 80 || Math.abs(gamma) > 80) && !isAlertActive) {
        triggerCrashAlert({
          type: 'Highway Vehicle Rollover Detected',
          gForce: 3.5,
          angle: Math.max(Math.abs(beta), Math.abs(gamma)),
          timestamp: new Date().toISOString()
        });
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (window.DeviceMotionEvent) window.removeEventListener('devicemotion', handleMotion);
      if (window.DeviceOrientationEvent) window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isAlertActive]);

  // Activate Crash Alert & Countdown
  const triggerCrashAlert = (data) => {
    setIsAlertActive(true);
    setCrashData(data);
    setCountdown(15);

    // Audio alarm interval
    playSirenBeep();
    beepIntervalRef.current = setInterval(playSirenBeep, 800);
  };

  // Manage countdown timer
  useEffect(() => {
    if (!isAlertActive) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
      return;
    }

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
          // Autonomous trigger: User did not cancel, assumed unconscious/trapped!
          confirmAutonomousCrash();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    };
  }, [isAlertActive]);

  // User confirms they are okay (False Alarm)
  const cancelCrashAlert = () => {
    setIsAlertActive(false);
    setCrashData(null);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
  };

  // Autonomous trigger execution
  const confirmAutonomousCrash = () => {
    setIsAlertActive(false);
    if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    if (onConfirmedCrash && crashData) {
      onConfirmedCrash(crashData);
    }
  };

  // Immediate dispatch override (driver taps "DISPATCH NOW")
  const dispatchImmediately = () => {
    confirmAutonomousCrash();
  };

  // Hardware Simulation Testbed (For judges and desktop testing)
  const simulateImpact = (type = 'Severe Head-On Collision (55 km/h)', gForce = 4.2) => {
    const mockData = {
      type,
      gForce,
      angle: type.includes('Rollover') ? 115 : 12,
      timestamp: new Date().toISOString()
    };
    setTelemetry(prev => ({
      ...prev,
      gForce,
      peakGForce: Math.max(prev.peakGForce, gForce)
    }));
    triggerCrashAlert(mockData);
  };

  return {
    telemetry,
    isAlertActive,
    countdown,
    crashData,
    cancelCrashAlert,
    dispatchImmediately,
    simulateImpact
  };
};
