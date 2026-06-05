// wrangler's `Text` module rule (wrangler.toml) imports *.html as a string.
declare module '*.html' {
  const content: string
  export default content
}
