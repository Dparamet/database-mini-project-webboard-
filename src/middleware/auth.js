export function mustAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.redirect("/login?next=" + encodeURIComponent(req.originalUrl || "/"));
}
export function injectUser(req, res, next) {
  res.locals.me = req.session?.user || null;
  next();
}