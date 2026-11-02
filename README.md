# smoosh.media

The smoosh.media website. Plain HTML, CSS, and vanilla JavaScript, served directly from GitHub Pages. No framework, package installation, build step, or backend is needed to serve the site.

The visual direction follows [React Doctor](https://www.react.doctor/): near-black surfaces, Inter typography, a compact centered hero, an automatically running product sequence, and large media sections followed by short explanations. Product visuals use flat, square-edged interfaces and thin rules.

The landing page includes:

- A looping processing sequence with video, audio, and image workflows, replay, and pause controls.
- A twelve-second, 960 × 540, 24 fps montage of audition preparation, rough-cut editing, client delivery, and creator recording in `assets/creative-workflows.mp4`, with scene labels, a static poster, and playback control. Source credits are in [assets/media-credits.md](assets/media-credits.md).
- Animated workflow connections, delivery activity, and batch results.
- Linked use cases for client reviews, web publishing, and recurring deliveries.
- Native HTML FAQ disclosures, keyboard focus styles, and reduced-motion support. Core content is readable without JavaScript.

All assets are local. Inter is self-hosted with its license in `assets/Inter-LICENSE.txt`. The header, footer, and workflow graphic use `assets/logo-dark.svg`. It embeds the original supplied JPEG and uses an SVG filter to remove the white background and show the film strips in off-white while retaining the teal. The source `assets/logo.jpg` remains unchanged and is still used for the favicon and social image. There are no forms, analytics, cookies, or third-party media requests.

## Local preview

From this directory, run `python -m http.server 5174 --bind 127.0.0.1`, then open `http://127.0.0.1:5174/`.

## Hosting

The public source repository is [someonelikeTIM/smoosh-media-website](https://github.com/someonelikeTIM/smoosh-media-website). GitHub Pages publishes the repository root from `main`; pushing a commit updates the website.

The `CNAME` file and Pages custom-domain setting both use `smoosh.media`, so visitors keep that domain in the address bar. Porkbun manages these records with a 600-second TTL:

| Type | Host | Target |
| --- | --- | --- |
| ALIAS | Root / blank | `someoneliketim.github.io` |
| CNAME | `www` | `someoneliketim.github.io` |

GitHub manages the HTTPS certificate. The `www` address redirects to the canonical root domain. Keep the custom-domain setting and DNS records together when changing hosting.
