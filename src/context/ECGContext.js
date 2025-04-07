import React, { createContext, useState, useContext } from 'react';

const ECGContext = createContext(null);

export const useECG = () => {
  const context = useContext(ECGContext);
  if (!context) {
    throw new Error('useECG must be used within an ECGProvider');
  }
  return context;
};

export const ECGProvider = ({ children }) => {
  // ข้อมูลของแต่ละ lead
  const [lead1Data, setLead1Data] = useState([]);
  const [lead2Data, setLead2Data] = useState([]);
  const [lead3Data, setLead3Data] = useState([]);
  const [currentLead, setCurrentLead] = useState(1);
  const [results, setResults] = useState(null);
  const [measurementHistory, setMeasurementHistory] = useState([]);
  
  // เพิ่มสถานะการเชื่อมต่อและข้อมูล IP ของอุปกรณ์
  const [isConnected, setIsConnected] = useState(false);
  const [deviceIP, setDeviceIP] = useState(localStorage.getItem('watjaiIpAddress') || '');
  
  // เปลี่ยน lead ปัจจุบัน
  const switchLead = (leadNumber) => {
    setCurrentLead(leadNumber);
  };
  
  // บันทึกข้อมูล lead
  const saveLeadData = (leadNumber, data) => {
    switch (leadNumber) {
      case 1:
        setLead1Data(data);
        break;
      case 2:
        setLead2Data(data);
        break;
      case 3:
        setLead3Data(data);
        break;
      default:
        break;
    }
  };
  
  // รีเซ็ตข้อมูล lead ทั้งหมด
  const resetAllData = () => {
    setLead1Data([]);
    setLead2Data([]);
    setLead3Data([]);
    setResults(null);
  };
  
  // บันทึกผลการวิเคราะห์
  const saveResults = (resultData) => {
    setResults(resultData);
    
    // เพิ่มในประวัติ
    const historyItem = {
      ...resultData,
      id: Date.now(),
      date: new Date().toISOString(),
      lead1DataLength: lead1Data.length,
      lead2DataLength: lead2Data.length,
      lead3DataLength: lead3Data.length
    };
    
    setMeasurementHistory(prev => [historyItem, ...prev]);
  };
  
  // อัปเดตสถานะการเชื่อมต่อ
  const updateConnectionStatus = (status) => {
    setIsConnected(status);
  };
  
  // เก็บ IP address ของอุปกรณ์
  const updateDeviceIP = (ip) => {
    setDeviceIP(ip);
    if (ip) {
      localStorage.setItem('watjaiIpAddress', ip);
    }
  };
  
  const value = {
    lead1Data,
    lead2Data,
    lead3Data,
    currentLead,
    results,
    measurementHistory,
    isConnected,
    deviceIP,
    switchLead,
    saveLeadData,
    resetAllData,
    saveResults,
    updateConnectionStatus,
    updateDeviceIP
  };
  
  return <ECGContext.Provider value={value}>{children}</ECGContext.Provider>;
};