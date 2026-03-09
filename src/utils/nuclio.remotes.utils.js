/*
Copyright 2019 Iguazio Systems Ltd.

Licensed under the Apache License, Version 2.0 (the "License") with
an addition restriction as set forth herein. You may not use this
file except in compliance with the License. You may obtain a copy of
the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing
permissions and limitations under the License.

In addition, you may not use the software for any purposes that are
illegal under applicable law, and the grant of the foregoing license
under the Apache 2.0 license is conditioned upon your compliance with
such restriction.
*/
import { loadRemote, registerRemotes } from '@module-federation/runtime'

let registerPromise = null

const ensureNuclioRemote = async () => {
  if (registerPromise) return registerPromise

  const config = window?.mlrunConfig
  let remoteEntryUrl = config?.nuclioRemoteEntryUrl

  if (!remoteEntryUrl) {
    throw new Error('[MF] Missing window.mlrunConfig.nuclioRemoteEntryUrl')
  }

  /**
   * FIX: Ensure the URL contains the /nuclio-ui proxy path.
   * If it's just the domain, append the required prefix.
   */
  if (!remoteEntryUrl.includes('/nuclio-ui')) {
    remoteEntryUrl = `${remoteEntryUrl.replace(/\/$/, '')}/nuclio-ui`
  }

  registerPromise = (async () => {
    try {
      registerRemotes([
        {
          name: 'nuclio',
          entry: `${remoteEntryUrl.replace(/\/$/, '')}/remoteEntry.js`,
          type: 'module',
          shareScope: 'default'
        }
      ])
    } catch (err) {
      registerPromise = null
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
