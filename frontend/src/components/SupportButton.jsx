import './SupportButton.css';
import { FaHeadset } from 'react-icons/fa';

const SupportButton = () => {
  return (
    <div className="support-button-container">
      <a
        href="https://wa.me/5491157430301"
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
