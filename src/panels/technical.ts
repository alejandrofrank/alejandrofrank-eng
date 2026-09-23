import { esc } from './helpers';

type TechnicalTopic = { title: string; body: string };

export function technicalDetails(flow: string[], topics: TechnicalTopic[], planned = false): string {
  return `<details class="technical-details">
    <summary><span>Technical details</span><span class="technical-toggle" aria-hidden="true">+</span></summary>
    <div class="technical-body">
      <p class="technical-intro">${planned ? 'The pipeline we’re building.' : 'How the data becomes a product.'}</p>
      <ol class="technical-flow" aria-label="Processing stages">${flow.map(step => `<li>${esc(step)}</li>`).join('')}</ol>
      <div class="technical-topics">${topics.map(topic => `<section><h4>${esc(topic.title)}</h4><p>${esc(topic.body)}</p></section>`).join('')}</div>
    </div>
  </details>`;
}

export const bakianoTechnical = () => technicalDetails(
  ['Source data', 'USD normalization', 'Historical comparisons', 'Analysis & search'],
  [
    { title: 'Collection & refresh cadence', body: 'The data covers supermarkets, retail, property listings, and telecom plans. Supermarket and retail prices refresh daily; telecom plans are tracked monthly. Real estate brings sale and rental listings from five platforms into one searchable view.' },
    { title: 'Currency normalization', body: 'Prices are normalized to USD using the official BCV exchange rate. This provides a common basis for comparisons across sources. The alerts distinguish price movements from currency noise, rather than treating every nominal price change as a market signal.' },
    { title: 'History & traceability', body: 'Recorded price movements support comparisons with yesterday and the previous fortnight. Product charts expose medians, daily minimums, ranges, and distributions, with each point traceable to the underlying products. Property search includes more than a million historical records.' },
    { title: 'Cross-source analysis', body: 'The AI analyst connects signals across the four data domains to help explain Venezuela’s economy. The chat experience works with live prices, while basket comparisons evaluate both product coverage and total cost across stores.' },
  ],
);

export const vestiTechnical = () => technicalDetails(
  ['Outfit image', 'Garment segmentation', 'Visual comparison', 'Candidate matching'],
  [
    { title: 'Segmentation · SAM 3.1', body: 'The planned first stage separates clothing items within an outfit image. Working with an individual garment makes it possible to search for a replacement piece while keeping the rest of the outfit as context.' },
    { title: 'Visual comparison · Marqo FashionSigLIP', body: 'The comparison stage uses Marqo FashionSigLIP to find clothing that looks similar to the selected piece. This stage answers which items resemble the reference; the matching stage then considers which available options could work in the outfit.' },
    { title: 'Matching · building with Jev', body: 'We’re building the final stage with Jev to connect a selected garment to available alternatives. The intended experience lets someone keep a look they like and swap individual pieces, instead of starting the entire search again.' },
    { title: 'End-to-end interaction', body: 'The intended flow is to choose an outfit, isolate a piece, compare it with clothing options, and explore replacements. Segmentation, visual comparison, and matching remain distinct stages so each part of the experience can be developed and improved separately.' },
  ], true,
);
