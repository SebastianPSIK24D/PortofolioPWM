// frontend/src/components/Alert.jsx
import { useEffect } from 'react';

const Alert = ({ alert, setAlert }) => {
  // Hilang otomatis setelah 2 detik
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ show: false, type: '', message: '' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [alert, setAlert]);

  if (!alert.show) return null;

  return (
    <div className={`alert ${alert.type}`}>
      <div className="alert-content">
        <div className="alert-title">{alert.type.toUpperCase()}</div>
        <div className="alert-message">{alert.message}</div>
      </div>
    </div>
  );
};

export default Alert;