const cleanNuclioFunctions = (functionsObj)=>  {
  const cleaned = {}

  for (const [key, functionsArray] of Object.entries(functionsObj)) {
    cleaned[key] = functionsArray.map(fn => {
      if (fn.spec?.build?.functionSourceCode) {
        const updatedFn = { ...fn }
        updatedFn.spec = { ...updatedFn.spec }
        updatedFn.spec.build = { ...updatedFn.spec.build }
        delete updatedFn.spec.build.functionSourceCode
        return updatedFn
      }
      return fn
    })
  }

  return cleaned
}


export const convertToArkRequest = (input, { projectList, projectsSummary, nuclioFunctions }) => {
  return{
    input,
    parameters: {
    payload: JSON.stringify({
      projects:projectList,
      projectsSummary:projectsSummary,
      nuclioFunctions:cleanNuclioFunctions(nuclioFunctions)
    })
  }}
}

export const convertToArkResponse = (response) => {
  return response.responses[0].content
    .replace(/\n+/g, ' ')
    .replace(/\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
