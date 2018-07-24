function checkOrX (complete) {
  return '<strong class="' + (complete ? 'check' : 'x') + '">' + (complete ? '✓' : 'x') + '</strong> '
}

function getChecks (key) {
  let checks = localStorage.getItem(key)

  try {
    checks = JSON.parse(checks)
  }
  catch {
    checks = []
  }

  checks = checks || []

  const cutoff = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).getTime()
  checks = checks
    .filter((a) => {
      const time = new Date(a.time).getTime()
      return time > (cutoff)
    })
    .sort((a, b) => {
      return a.time > b.time ? -1 : 1
    })

  return checks
}
