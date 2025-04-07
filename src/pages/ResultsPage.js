import React from 'react';
import { Container, Button, Alert, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useECG } from '../context/ECGContext';
import ECGChart from '../components/ECGChart';

const ResultsPage = () => {
  const navigate = useNavigate();
  const {
    results,
    lead1Data,
    lead2Data,
    lead3Data,
    measurementHistory
  } = useECG();

  // If no analysis results exist, show alert
  if (!results) {
    return (
      <Container>
        <Alert variant="warning">
          <Alert.Heading>No Analysis Results</Alert.Heading>
          <p>Please measure and analyze ECG first</p>
          <hr />
          <div className="d-flex justify-content-between">
            <Link to="/measure">
              <Button variant="primary">Go to ECG Measurement</Button>
            </Link>
            
            {measurementHistory.length > 0 && (
              <Link to="/history">
                <Button variant="secondary">View Measurement History</Button>
              </Link>
            )}
          </div>
        </Alert>
      </Container>
    );
  }

  // Get heart rate, either from the API response or calculate it
  const heartRate = results.bpm || (results.heart_rate ? results.heart_rate : 72);
  
  // Get risk level or provide a default
  const riskLevel = results.risk_level || 
    (results.prediction === 'Normal' && results.confidence > 80 ? 'Low Risk' : 
     results.prediction === 'Normal' && results.confidence > 50 ? 'Medium Risk' : 'High Risk');

  return (
    <div className="results-page">
      <div className="app-header">
        <div className="app-logo">
          <span className="heart-icon">♥</span> WATJAI
        </div>
        <div className="settings-icon">⚙️</div>
      </div>
      
      <Container className="mt-3">
        <h1 className="result-title">Result ECG</h1>
        
        {/* Combined ECG Grid Display */}
        <div className="ecg-grid-card">
          <div className="ecg-grid">
            {[
              { data: lead1Data, label: 'I', color: '#000000' },
              { data: lead2Data, label: 'II', color: '#000000' },
              { data: lead3Data, label: 'III', color: '#000000' }
            ].map((lead, index) => (
              <div key={index} className="ecg-lead-container">
                <div className="lead-label">{lead.label}</div>
                <ECGChart 
                  data={lead.data.slice(0, 400)} 
                  label={`Lead ${lead.label}`} 
                  color={lead.color}
                  showGrid={index === 0}
                  height={index === 0 ? 120 : 100}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Key Metrics Display */}
        <div className="metrics-container">
          <div className="metric-box">
            <div className="metric-value">{heartRate}</div>
            <div className="metric-label">BPM</div>
          </div>
          
          <div className="metric-box">
            <div className="metric-value">{results.prediction}</div>
            <div className="metric-label">Rhythm</div>
          </div>
          
          <div className="metric-box">
            <div className="metric-value">{results.confidence.toFixed(0)}%</div>
            <div className="metric-label">Quality</div>
          </div>
        </div>
        
        {/* Risk Assessment */}
        <div className="risk-assessment">
          <h3>Heart Risk Assessment</h3>
          <div className="risk-meter-container">
            <div className="risk-meter">
              <div 
                className={`risk-indicator ${riskLevel ? riskLevel.toLowerCase().replace(' ', '-') : 'low-risk'}`}
                style={{ 
                  width: !riskLevel || riskLevel === 'Low Risk' ? '30%' : 
                         riskLevel === 'Medium Risk' ? '60%' : '90%' 
                }}
              ></div>
            </div>
            <div className="risk-labels">
              <span className="risk-label">Low Risk</span>
              <span className="risk-label">Medium Risk</span>
              <span className="risk-label">High Risk</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <Button 
          variant="primary" 
          size="lg" 
          className="action-button"
          onClick={() => alert('Sent to Telecardiology')}
        >
          Send to Telecardiology
        </Button>
        
        <div className="reports-count">Reports left: 6</div>
        
        <div className="action-buttons-secondary">
          <Button 
            variant="light" 
            className="secondary-button"
            onClick={() => alert('PDF downloading...')}
          >
            <span className="icon">📄</span> PDF
          </Button>
          <Button 
            variant="light" 
            className="secondary-button"
            onClick={() => alert('Printing...')}
          >
            <span className="icon">🖨️</span> Print
          </Button>
        </div>
        
        <Button 
          variant="outline-danger" 
          className="delete-button"
          onClick={() => navigate('/measure')}
        >
          <span className="icon">🗑️</span> Delete exam
        </Button>
        
        {/* Hidden Technical Details Section (collapsible or accessible via button) */}
        <div className="technical-details" style={{ display: 'none' }}>
          <h4>Technical Details</h4>
          
          {/* Spectrogram if available */}
          {results.spectrogram_base64 && (
            <div className="spectrogram-container">
              <h5>Spectrogram</h5>
              <img 
                src={`data:image/png;base64,${results.spectrogram_base64}`} 
                alt="ECG Spectrogram"
                className="img-fluid"
              />
            </div>
          )}
          
          {/* Class Probabilities */}
          <div className="probabilities-container">
            <h5>Class Probabilities</h5>
            {results.probabilities && Object.entries(results.probabilities)
              .sort(([, a], [, b]) => b - a)
              .map(([className, probability]) => (
                <div key={className} className="probability-item">
                  <div className="d-flex justify-content-between">
                    <span>{className}</span>
                    <span>{(probability * 100).toFixed(2)}%</span>
                  </div>
                  <div className="probability-bar">
                    <div 
                      className={`probability-fill ${className === results.prediction ? 'primary' : 'secondary'}`}
                      style={{ width: `${probability * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Processing Details */}
          <div className="processing-details">
            <p className="processing-timestamp">
              Analysis Date: {new Date(results.timestamp).toLocaleString()}
            </p>
            <p className="processing-time">
              Processing Time: {results.processing_time.toFixed(2)} seconds
            </p>
          </div>
        </div>
      </Container>
      
      <style jsx>{`
        .results-page {
          background-color: #f8f9fa;
          min-height: 100vh;
          padding-bottom: 30px;
        }
        
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .app-logo {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        
        .heart-icon {
          color: #e74c3c;
          margin-right: 5px;
        }
        
        .settings-icon {
          font-size: 20px;
        }
        
        .result-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .ecg-grid-card {
          border-radius: 15px;
          overflow: hidden;
          background-color: #ffeeee;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .ecg-grid {
          padding: 15px;
          background-image: linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
          position: relative;
        }
        
        .ecg-lead-container {
          position: relative;
          margin-bottom: 10px;
        }
        
        .lead-label {
          position: absolute;
          top: 5px;
          left: 5px;
          font-weight: bold;
          font-size: 14px;
          z-index: 10;
        }
        
        .metrics-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .metric-box {
          flex: 1;
          text-align: center;
        }
        
        .metric-value {
          font-size: 30px;
          font-weight: bold;
        }
        
        .metric-label {
          color: #666;
          font-size: 14px;
        }
        
        .risk-assessment {
          margin-bottom: 20px;
        }
        
        .risk-assessment h3 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .risk-meter-container {
          margin-bottom: 20px;
        }
        
        .risk-meter {
          height: 14px;
          background-color: #e9ecef;
          border-radius: 7px;
          overflow: hidden;
        }
        
        .risk-indicator {
          height: 100%;
          background-color: #4285f4;
          border-radius: 7px;
        }
        
        .risk-indicator.medium-risk {
          background-color: #fbbc05;
        }
        
        .risk-indicator.high-risk {
          background-color: #ea4335;
        }
        
        .risk-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 5px;
        }
        
        .risk-label {
          color: #666;
          font-size: 14px;
        }
        
        .action-button {
          width: 100%;
          padding: 15px;
          font-size: 18px;
          font-weight: bold;
          background-color: #4285f4;
          border: none;
          border-radius: 10px;
          margin-bottom: 15px;
        }
        
        .reports-count {
          text-align: center;
          color: #666;
          margin-bottom: 15px;
        }
        
        .action-buttons-secondary {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .secondary-button {
          flex: 1;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 12px;
          font-weight: bold;
        }
        
        .delete-button {
          width: 100%;
          color: #ea4335;
          border-color: #ea4335;
          border-radius: 10px;
          padding: 12px;
          font-weight: bold;
        }
        
        .icon {
          margin-right: 5px;
        }
        
        /* Technical Details Section */
        .technical-details {
          margin-top: 30px;
          padding: 20px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .probability-item {
          margin-bottom: 10px;
        }
        
        .probability-bar {
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 5px;
        }
        
        .probability-fill {
          height: 100%;
          border-radius: 4px;
        }
        
        .probability-fill.primary {
          background-color: #4285f4;
        }
        
        .probability-fill.secondary {
          background-color: #9e9e9e;
        }
        
        @media (max-width: 576px) {
          .metrics-container {
            flex-direction: column;
            gap: 15px;
          }
          
          .metric-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 15px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .metric-value {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;