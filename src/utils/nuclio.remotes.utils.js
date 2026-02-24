import { loadRemote, registerRemotes } from '@module-federation/runtime'

let registerPromise = null

const ensureNuclioRemote = async () => {
  if (registerPromise) return registerPromise

  // Hardcoded value for the nuclio remote as requested. to be removed
  // const remoteEntryUrl = 'https://nuclio-ui.iguazio.vmdev210ig4.lab.iguazeng.com'

  const remoteEntryUrl = window?.mlrunConfig?.nuclioRemoteEntryUrl

  registerPromise = (async () => {
    try {
      registerRemotes([
        {
          name: 'nuclio',
          entry: `${remoteEntryUrl}/remoteEntry.js`,
          type: 'module',
          shareScope: 'default'
        }
      ])
    } catch (err) {
      registerPromise = null
      console.error('[MF] Registration failed:', err)
      throw err
    }
  })()

  return registerPromise
}

// Strips internal route `id` fields and filters out index/catch-all routes
// under `projects/:projectName` so Nuclio routes integrate cleanly into MLRun's router.
const cleanRoutes = routes =>
  routes.map(({ id, ...route }) => {
    if (route.children) {
      route.children = route.path === 'projects/:projectName'
        ? cleanRoutes(route.children.filter(child => !child.index && child.path !== '*'))
        : cleanRoutes(route.children)
    }
    return route
  })

const loadNuclioRoutes = async () => {
  await ensureNuclioRemote()
  const mod = await loadRemote('nuclio/router')

  if (!mod?.router?.routes) {
    throw new Error('[MF] Failed to load Nuclio router module')
  }

  return cleanRoutes(mod.router.routes)
}

const getNuclioItemName = pathname => {
  const segments = pathname.split('/').filter(Boolean)
  const functionsSegmentIndex = segments.indexOf('real-time-functions')

  if (functionsSegmentIndex !== -1 && segments[functionsSegmentIndex + 1] && segments[functionsSegmentIndex + 1] !== 'new') {
    return segments[functionsSegmentIndex + 1]
  }

  return ''
}

export { ensureNuclioRemote, loadNuclioRoutes, getNuclioItemName }
