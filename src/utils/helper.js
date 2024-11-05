// Helper function to extract public_id from path or filename
const getPublicIdFromPath = (path) => {
  // Method 1: Extract from path
  const matches = path.match(/upload\/v\d+\/(.+)\./)
  if (matches && matches[1]) {
    return matches[1]
  }

  // Method 2: Use filename directly
  return path.split('/').slice(-2).join('/').split('.')[0]
}

module.exports = { getPublicIdFromPath }
