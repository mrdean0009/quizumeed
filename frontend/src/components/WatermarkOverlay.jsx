import { useAuth } from '../contexts/AuthContext'

const WatermarkOverlay = () => {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="watermark-overlay">
      <div className="watermark-text">
        {user.name} - ID: {user.id}
      </div>
    </div>
  )
}

export default WatermarkOverlay
