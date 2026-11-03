# smoosh.media

The smoosh.media website. Plain HTML, CSS, and vanilla JavaScript, served directly from GitHub Pages. No framework, package installation, build step, or backend is needed to serve the site.

The visual direction follows [React Doctor](https://www.react.doctor/): near-black surfaces, Inter typography, a compact centered hero, an automatically running product sequence, and large media sections followed by short explanations. Product visuals use flat, square-edged interfaces and thin rules. Alternating full-width dark-grey section bands distinguish sections on both pages.

The homepage includes:

- A looping processing sequence with video, audio, and image workflows, replay, and pause controls.
- A twelve-second, 960 × 540, 24 fps montage of audition preparation, rough-cut editing, client delivery, and creator recording in `assets/creative-workflows.mp4`, with scene labels, a static poster, and playback control. Source credits are in [assets/media-credits.md](assets/media-credits.md).
- Animated workflow connections, delivery activity, and batch results. Each outgoing packet splits into three synchronized destination packets; incoming media uses a larger, slower pulse.
- Linked use cases for client reviews, web publishing, and recurring deliveries.
- Links to the separate pricing page and free media-health scanner.
- Native HTML FAQ disclosures, keyboard focus styles, and reduced-motion support. Core content is readable without JavaScript.

All assets are local. Inter is self-hosted with its license in `assets/Inter-LICENSE.txt`. The header, footer, and workflow graphic use `assets/logo-dark.svg`. It embeds the original supplied JPEG and uses an SVG filter to remove the white background and show the film strips in off-white while retaining the teal. The source `assets/logo.jpg` remains unchanged and is still used for the favicon and social image. There are no forms, analytics, cookies, or third-party media requests.

## Pricing page

`pricing.html` shares `styles.css` and the homepage's brand assets, hero, buttons, tabs, columns, report window, and FAQ styling. `pricing.js` handles the billing toggle and storage calculator without loading homepage animation code.

The Smoosh plans are Creator ($39 monthly or $360 yearly), Studio ($109 monthly or $1,080 yearly), and Enterprise (contact for pricing based on business needs). The free scanner is promoted separately from the paid-plan comparison. These prices and feature groupings were approved on November 2, 2026. Enterprise enquiries go to `pricing@smoosh.media`. Creator includes up to 25 GB of source media, 100 processing credits, and 25 GB of delivery transfer per month; Studio includes up to 75 GB of source media, 300 processing credits, and 75 GB of delivery transfer per month. Prepared files have a 48-hour delivery window. Enterprise allowances are agreed in the quote. The free scanner remains separate. Monthly allowances are the same on yearly billing. The macOS and Windows 11 download buttons use the requested placeholder URLs at `downloads.smoosh.media`; replace these two links when installer URLs are supplied.

The storage calculator lives only on the pricing page. It models existing media, monthly additions, compression, and non-media cloud usage. Usage-based fees apply each month's allowance before calculating storage charges. Subscription fees use whole capacity tiers; smaller files do not lower a flat fee unless they fit a cheaper tier. Google capacity pricing includes the verified 20 TB monthly plan. Above listed capacities, the calculator asks for the capacity and monthly price of the customer's actual subscription tier; it does not substitute a dash or invent an unverified price. Empty media-volume fields count as zero.

US/USD monthly prices were verified on November 2, 2026:

- [Cloudflare R2 Standard](https://developers.cloudflare.com/r2/pricing/): $0.015/GB-month, including a 10 GB-month monthly free allowance.
- [Google One / Drive](https://one.google.com/about/plans): 15 GB free; 100 GB $1.99, 2 TB $9.99, 5 TB $19.99, and [20 TB $99.99 monthly](https://one.google.com/about/google-ai-plans/?gl=US).
- [Apple iCloud+](https://support.apple.com/en-us/108047): 5 GB free; 50 GB $0.99, 200 GB $2.99, 2 TB $9.99, 6 TB $29.99, and 12 TB $59.99 monthly.
- [Dropbox](https://www.dropbox.com/plans), with monthly billing selected: Basic 2 GB free; Plus 2 TB $11.99; Standard starts at 3 TB and $18 for one seat; Advanced starts at 15 TB, with three seats at $30 each ($90 monthly minimum).

The model compares storage capacity only and uses month-end snapshots for 12 months. It excludes taxes, transfer/request charges, and Smoosh fees. Actual provider bundles include other features. Source links and the verification date are also shown in the calculator. Update `STORAGE_PROVIDERS` in `pricing.js` and reverify the provider pages when refreshing these benchmarks.

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
