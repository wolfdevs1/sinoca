import { useEffect, useState } from 'react';
import './SupportButton.css';
import { FaHeadset } from 'react-icons/fa';
import { getVariablesPublic } from '../services/auth'; // Importa la función para obtener las variables

const SupportButton = () => {

  const [supportNumber, setSupportNumber] = useState('');

  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const response = await getVariablesPublic();
        setSupportNumber(response.data.supportNumber);
      } catch (error) {
        console.error('Error fetching variables:', error);
      }
    };

    fetchVariables();
  }, []);

  return (
    <div className="support-button-container">
      <a
        href={`https://wa.me/${supportNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="support-button"
      >
        <FaHeadset className="icon" />
        <span className="support-text">¿Necesitás ayuda?</span>
      </a>
    </div>
  );
};

export default SupportButton;
