export const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res)
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}