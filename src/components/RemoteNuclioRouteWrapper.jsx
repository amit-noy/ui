import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Breadcrumbs from '../common/Breadcrumbs/Breadcrumbs'
import { ensureNuclioRemote, getNuclioItemName } from '../utils/nuclio.remotes.utils'

const RemoteNuclioRouteWrapper = () => {
  const location = useLocation()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        await ensureNuclioRemote()
        setReady(true)
      } catch (err) {
        setError(true)
      }
    }
    void init()
  }, [])

  const itemName = useMemo(() => getNuclioItemName(location.pathname), [location.pathname])

  if (error) return <div>Failed to load Nuclio UI</div>
  if (!ready) return <div>Loading Nuclio...</div>

  return (
    <div className="nuclio-wrapper">
      <div className="content__header">
        <Breadcrumbs itemName={itemName} />
      </div>
      <Outlet />
    </div>
  )
}

export default RemoteNuclioRouteWrapper
