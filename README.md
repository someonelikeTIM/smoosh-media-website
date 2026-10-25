# smoosh.media

A small, buildless landing page for smoosh.media. Plain HTML and CSS, with the supplied logo stored in `assets/logo.jpg`; no package installation or JavaScript is required.

The update button opens an email request to the owner-confirmed address `anactualhuman@duck.com`. It does not automatically subscribe visitors or store their data. No analytics or cookies are used.

## Local preview

From this directory, run `python -m http.server 5174 --bind 127.0.0.1`, then open `http://127.0.0.1:5174/`.

## Hosting

Publish the repository root from `main` with GitHub Pages. The `CNAME` file identifies `smoosh.media` as the custom domain. Configure that domain in the repository's Pages settings, point its DNS at GitHub Pages, and enforce HTTPS after GitHub issues the certificate.

GitHub Pages must be eligible for the account's plan to serve a public website from a private repository. Keep the source repository private as requested.
