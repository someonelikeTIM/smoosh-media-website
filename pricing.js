// US/USD monthly storage prices, verified from official sources on 2026-11-02.
// Keep subscription tiers whole: occupying less of a plan does not reduce its fee.
const STORAGE_PROVIDERS = {
  r2: {
    name: 'Cloudflare R2 Standard', type: 'usage', rate: 0.015, freeGB: 10,
    source: 'https://developers.cloudflare.com/r2/pricing/',
    description: '$0.015/GB-month, with 10 GB-month free each month.',
  },
  google: {
    name: 'Google Drive / Google One', type: 'subscription',
    source: 'https://one.google.com/about/plans',
    additionalSource: 'https://one.google.com/about/google-ai-plans/?gl=US',
    tiers: [
      { name: 'Free', capacity: 15, monthly: 0 },
      { name: '100 GB', capacity: 100, monthly: 1.99 },
      { name: '2 TB', capacity: 2000, monthly: 9.99 },
      { name: '5 TB', capacity: 5000, monthly: 19.99 },
      { name: '20 TB', capacity: 20000, monthly: 99.99 },
    ],
  },
  icloud: {
    name: 'Apple iCloud+', type: 'subscription',
    source: 'https://support.apple.com/en-us/108047',
    tiers: [
      { name: 'Free', capacity: 5, monthly: 0 },
      { name: '50 GB', capacity: 50, monthly: 0.99 },
      { name: '200 GB', capacity: 200, monthly: 2.99 },
      { name: '2 TB', capacity: 2000, monthly: 9.99 },
      { name: '6 TB', capacity: 6000, monthly: 29.99 },
      { name: '12 TB', capacity: 12000, monthly: 59.99 },
    ],
  },
  dropbox: {
    name: 'Dropbox', type: 'subscription', source: 'https://www.dropbox.com/plans',
    tiers: [
      { name: 'Basic · 2 GB', capacity: 2, monthly: 0 },
      { name: 'Plus · 2 TB', capacity: 2000, monthly: 11.99 },
      { name: 'Standard · 3 TB · 1 seat', capacity: 3000, monthly: 18 },
      { name: 'Advanced · 15 TB · 3 seats', capacity: 15000, monthly: 90 },
    ],
  },
  custom: { name: 'Your usage rate', type: 'usage', rate: 0.015, freeGB: 0 },
};

function quoteStorage(gigabytes, provider, customRate) {
  if (provider.type === 'usage') {
    const rate = customRate === undefined ? provider.rate : customRate;
    return { monthly: Math.max(0, gigabytes - provider.freeGB) * rate, name: 'Usage based' };
  }
  return provider.tiers.filter(tier => gigabytes <= tier.capacity + 1e-8)
    .reduce((best, tier) => !best || tier.monthly < best.monthly ? tier : best, null);
}

function estimateStorage({ existingGB, monthlyGB, otherGB, reductionPercent, provider, customRate }) {
  const retained = 1 - reductionPercent / 100;
  const originalGB = existingGB + monthlyGB * 12;
  const compressedGB = originalGB * retained;
  const months = Array.from({ length: 12 }, (_, index) => {
    const stored = existingGB + monthlyGB * (index + 1);
    return {
      original: quoteStorage(stored + otherGB, provider, customRate),
      compressed: quoteStorage(stored * retained + otherGB, provider, customRate),
    };
  });
  const sum = side => months.every(month => month[side])
    ? months.reduce((total, month) => total + month[side].monthly, 0) : null;
  const originalCost = sum('original');
  const compressedCost = sum('compressed');
  return {
    originalGB, compressedGB, savedGB: originalGB - compressedGB,
    originalCost, compressedCost,
    savedCost: originalCost === null || compressedCost === null ? null : Math.max(0, originalCost - compressedCost),
    originalPlan: months[11].original,
    compressedPlan: months[11].compressed,
    sameFees: months.every(month => month.original && month.compressed && Math.abs(month.original.monthly - month.compressed.monthly) < 1e-8),
  };
}

function formatStorage(gigabytes) {
  const units = ['GB', 'TB', 'PB'];
  let value = gigabytes, unit = 0;
  while (value >= 1000 && unit < units.length - 1) { value /= 1000; unit += 1; }
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)} ${units[unit]}`;
}

function formatMoney(value) {
  if (value === null) return 'Add plan';
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2, maximumFractionDigits: 2,
  }).format(rounded);
}

// Page controls. All calculations stay in this page; no account or upload is used.
const byId = id => document.getElementById(id);
const setText = (id, value) => { byId(id).textContent = value; };
const providerInput = byId('storage-provider');
const existingInput = byId('storage-existing');
const volumeInput = byId('storage-volume');
const reductionInput = byId('storage-reduction');
const otherInput = byId('storage-other');
const rateInput = byId('storage-rate');
const quotedCapacityInput = byId('storage-quoted-capacity');
const quotedPriceInput = byId('storage-quoted-price');
let quotedProviderId = providerInput.value;
const numberOrZero = input => input.value.trim() === '' ? 0 : input.valueAsNumber;

function updateStorageCalculator() {
  const providerId = providerInput.value;
  const baseProvider = STORAGE_PROVIDERS[providerId];
  const flat = baseProvider.type === 'subscription';
  if (quotedProviderId !== providerId) {
    quotedCapacityInput.value = '';
    quotedPriceInput.value = '';
    byId('storage-custom-plan').open = false;
    quotedProviderId = providerId;
  }
  byId('storage-custom-plan').hidden = !flat;
  const quoteStarted = quotedCapacityInput.value !== '' || quotedPriceInput.value !== '';
  const hasQuote = flat && quotedCapacityInput.value !== '' && quotedPriceInput.value !== ''
    && quotedCapacityInput.validity.valid && quotedPriceInput.validity.valid
    && Number.isFinite(quotedCapacityInput.valueAsNumber) && Number.isFinite(quotedPriceInput.valueAsNumber);
  const provider = hasQuote ? { ...baseProvider, tiers: [...baseProvider.tiers, {
    name: `Your ${formatStorage(quotedCapacityInput.valueAsNumber)} plan`,
    capacity: quotedCapacityInput.valueAsNumber, monthly: quotedPriceInput.valueAsNumber,
  }] } : baseProvider;
  byId('storage-rate-control').hidden = flat;
  byId('storage-flat-control').hidden = !flat;
  rateInput.readOnly = providerId !== 'custom';
  if (providerId === 'r2') rateInput.value = String(provider.rate);
  setText('storage-reduction-value', `${reductionInput.value}%`);
  const mediaInputs = [existingInput, volumeInput, otherInput];
  if (mediaInputs.some(input => !input.validity.valid || !Number.isFinite(numberOrZero(input)))
    || (!flat && (!rateInput.validity.valid || !Number.isFinite(rateInput.valueAsNumber)))) {
    setText('storage-input-status', 'Enter valid media volumes and a storage rate to update the calculation.');
    return;
  }
  setText('storage-input-status', flat && quoteStarted && !hasQuote ? 'Enter both the capacity and monthly price of your subscription tier.' : '');
  const existingGB = numberOrZero(existingInput);
  const monthlyGB = numberOrZero(volumeInput);
  const otherGB = numberOrZero(otherInput);
  const reduction = reductionInput.valueAsNumber;
  const rate = rateInput.valueAsNumber;
  const totals = estimateStorage({ existingGB, monthlyGB, otherGB, reductionPercent: reduction, provider, customRate: flat ? undefined : rate });
  const aboveVerifiedCapacity = flat && totals.originalGB + otherGB > Math.max(...baseProvider.tiers.map(tier => tier.capacity));
  if (aboveVerifiedCapacity) byId('storage-custom-plan').open = true;
  setText('storage-provider-details', flat
    ? `${provider.name}: monthly flat fees. Compare whole plan prices for your media plus other cloud files.`
    : providerId === 'r2' ? `${provider.name}: ${provider.description}` : 'Enter your own contracted per-GB monthly rate.');
  setText('storage-original-total', formatStorage(totals.originalGB));
  setText('storage-compressed-total', formatStorage(totals.compressedGB));
  setText('storage-space-saved', formatStorage(totals.savedGB));
  setText('storage-original-cost', formatMoney(totals.originalCost));
  setText('storage-compressed-cost', formatMoney(totals.compressedCost));
  setText('storage-cost-saved', formatMoney(totals.savedCost));
  setText('storage-cost-context', flat ? 'lowest-priced listed plan that fits each month' : 'one cloud copy, including the free allowance');
  if (flat) setText('storage-monthly-plan-price', `${formatMoney(totals.originalPlan?.monthly ?? null)} → ${formatMoney(totals.compressedPlan?.monthly ?? null)} / month`);
  setText('storage-savings-context', totals.savedCost === null ? 'add your larger plan to calculate the saving' : flat && totals.sameFees ? 'same subscription fees; more headroom' : 'over the first year');
  const planName = quote => quote ? `${quote.name} (${formatMoney(quote.monthly)}/month)` : 'Enter a larger plan';
  setText('storage-plan-result', flat
    ? `Month 12: ${planName(totals.originalPlan)} → ${planName(totals.compressedPlan)}.${totals.sameFees ? ' Your subscription bill stays the same; the recovered capacity can postpone an upgrade.' : ''}${totals.savedCost === null ? ' Add your subscription tier below to calculate these volumes.' : ''}`
    : 'Usage-based storage charges fall with billable GB. The selected allowance is applied separately each month.');
  const max = Math.max(totals.originalGB, 1);
  const startY = 192 - 164 * existingGB / max;
  const compressedStartY = 192 - 164 * existingGB * (1 - reduction / 100) / max;
  const endY = 192 - 164 * totals.compressedGB / max;
  const originalEndY = 192 - 164 * totals.originalGB / max;
  document.querySelector('.storage-original-line').setAttribute('d', `M49 ${startY}L649 ${originalEndY}`);
  document.querySelector('.storage-original-dot').setAttribute('cy', String(originalEndY));
  byId('storage-compressed-line').setAttribute('d', `M49 ${compressedStartY}L649 ${endY}`);
  byId('storage-compressed-dot').setAttribute('cy', String(endY));
  byId('storage-saved-area').setAttribute('d', `M49 ${startY}L649 ${originalEndY}L649 ${endY}L49 ${compressedStartY}Z`);
  setText('storage-axis-top', formatStorage(max));
  setText('storage-axis-middle', formatStorage(max / 2));
  const number = value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  setText('storage-chart-description', `${formatStorage(existingGB)} already stored plus ${formatStorage(monthlyGB)} each month reaches ${formatStorage(totals.originalGB)} in twelve months. At ${reduction}% smaller: ${formatStorage(totals.compressedGB)}. Other cloud files are included in costs, not in this media-only chart.`);
  setText('storage-space-equation', `${number(existingGB)} GB + (${number(monthlyGB)} GB/month × 12) = ${formatStorage(totals.originalGB)}. At ${reduction}% smaller: ${formatStorage(totals.compressedGB)}.`);
  setText('storage-cost-equation', flat
    ? `Add all 12 monthly plan fees: ${formatMoney(totals.originalCost)} with originals → ${formatMoney(totals.compressedCost)} with smoosh. Smaller files change fees only when they fit a cheaper tier.`
    : `Each month: max(media + other files − ${provider.freeGB} GB free, 0) × $${rate}/GB-month. Sum 12 months: ${formatMoney(totals.originalCost)} → ${formatMoney(totals.compressedCost)}.`);
}

[providerInput, existingInput, volumeInput, reductionInput, otherInput, rateInput, quotedCapacityInput, quotedPriceInput].forEach(input => input.addEventListener('input', updateStorageCalculator));
updateStorageCalculator();

for (const provider of Object.values(STORAGE_PROVIDERS).filter(item => item.source)) {
  const row = document.createElement('tr');
  const name = document.createElement('th'); name.scope = 'row'; name.textContent = provider.name;
  const amounts = document.createElement('td');
  amounts.textContent = provider.type === 'usage' ? provider.description
    : provider.tiers.map(tier => `${tier.name}: ${formatMoney(tier.monthly)}/mo`).join(' · ');
  const citation = document.createElement('td');
  const link = document.createElement('a'); link.href = provider.source; link.textContent = 'Official pricing ↗';
  link.target = '_blank'; link.rel = 'noopener'; citation.append(link);
  if (provider.additionalSource) {
    const largerLink = document.createElement('a'); largerLink.href = provider.additionalSource;
    largerLink.textContent = 'Larger plans ↗'; largerLink.target = '_blank'; largerLink.rel = 'noopener';
    citation.append(document.createElement('br'), largerLink);
  }
  row.append(name, amounts, citation); byId('storage-rate-rows').append(row);
}

const PLAN_PRICES = {
  creator: { monthly: 39, annual: 360 },
  studio: { monthly: 109, annual: 1080 },
};
const billingButtons = document.querySelectorAll('[data-billing]');
billingButtons.forEach(button => button.addEventListener('click', () => {
  const annual = button.dataset.billing === 'annual';
  billingButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  for (const [plan, prices] of Object.entries(PLAN_PRICES)) {
    document.querySelector(`[data-plan="${plan}"]`).textContent = formatMoney(annual ? prices.annual / 12 : prices.monthly);
    document.querySelector(`[data-billing-note="${plan}"]`).textContent = annual
      ? `${formatMoney(prices.annual)} billed yearly. ${formatMoney(prices.annual / 12)}/month equivalent.`
      : `${formatMoney(prices.monthly)} billed monthly.`;
  }
}));
