import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import HealthOverlay from '../app/health-overlay';
import '../app/globals.css';
import '../app/health.css';
createRoot(document.getElementById('root')!).render(<><Home/><HealthOverlay/></>);
