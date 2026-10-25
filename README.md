# smoosh.media

A small, buildless landing page for smoosh.media. Plain HTML and CSS, with the supplied logo stored in `assets/logo.jpg`; no package installation or JavaScript is required.

The page ends with a simple "Stay tuned..." message. It has no signup form, analytics, or cookies and does not collect visitor data.

## Local preview

From this directory, run `python -m http.server 5174 --bind 127.0.0.1`, then open `http://127.0.0.1:5174/`.

## Hosting

The public source repository is [someonelikeTIM/smoosh-media-website](https://github.com/someonelikeTIM/smoosh-media-website). GitHub Pages publishes the repository root from `main`; pushing a commit updates the website.

The `CNAME` file and Pages custom-domain setting both use `smoosh.media`, so visitors keep that domain in the address bar. Porkbun manages these records with a 600-second TTL:

| Type | Host | Target |
| --- | --- | --- |
| ALIAS | Root / blank | `someoneliketim.github.io` |
| CNAME | `www` | `someoneliketim.github.io` |

GitHub manages the HTTPS certificate. Enable Enforce HTTPS in Pages settings once the certificate is issued. The `www` address redirects to the canonical root domain. Keep the custom-domain setting and DNS records together when changing hosting.
