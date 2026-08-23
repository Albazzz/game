import { createRoot } from 'react-dom/client'
import AirDefenseGame from './AirDefenseGame'
import './styles.css'

const root = document.getElementById('air-defense-root')
if (!root) throw new Error('Không tìm thấy #air-defense-root')
const sessionId = root.dataset.sessionId
if (!sessionId) throw new Error('Thiếu sessionId Air Defense')
createRoot(root).render(<AirDefenseGame sessionId={sessionId} />)
