export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    cookies: req.cookies,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (result.data.body) {
    req.body = { ...req.body, ...result.data.body };
  }
  if (result.data.params) {
    req.params = { ...req.params, ...result.data.params };
  }
  if (result.data.cookies) {
    req.cookies = { ...req.cookies, ...result.data.cookies };
  }
  if (result.data.query) {
    req.query = { ...req.query, ...result.data.query };
  }
  next();
};
