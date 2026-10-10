import { BAKIANO } from '../content';

export interface Project {
  slug: string;
  title: string;
  category: 'Product' | 'Engineering lab' | 'Visual experiment' | 'In development';
  status: string;
  question: string;
  summary: string;
  problem: string;
  approach: string[];
  evidence: string;
  boundary: string;
  stack: string[];
  flow: string[];
  links: { label: string; href: string }[];
  repo?: string;
  port?: number;
}

// Order tells a story: product, engineering boundaries, creative work, next steps.
// The reading index and arcade share these identities and destinations.
export const PROJECTS: Project[] = [
  {
    slug: 'bakiano', title: 'Bakiano', category: 'Product', status: 'Live product',
    question: 'How do you make scattered market data useful?',
    summary: 'A market intelligence platform for Venezuela, from daily collection to historical prices and an AI analyst.',
    problem: 'Prices are scattered across stores, categories and currencies. A useful comparison needs both a trustworthy current price and the history behind it.',
    approach: [
      'Collect source snapshots and preserve the original observations before transforming them for the product.',
      'Keep catalog enrichment separate from prices, then join attributes to the current data. Derive USD prices using the relevant BCV exchange rate.',
      'Serve dashboards, alerts and an AI analyst through scoped tools and bounded warehouse queries.',
    ],
    evidence: 'Explore the live product and the public engineering case study. The three labs that follow isolate ingestion, product identity and query controls so those decisions can be inspected separately.',
    boundary: 'The product source is private. The public case study documents the system; the companion labs are standalone examples, not a copy of the production platform.',
    stack: ['GCP', 'BigQuery', 'Next.js', 'Vertex AI'],
    flow: ['Collect', 'Preserve', 'Enrich', 'Compare'],
    links: [
      { label: 'Visit bakiano.com', href: BAKIANO.href },
      { label: BAKIANO.access.label, href: BAKIANO.access.href },
      { label: 'Read the public case study', href: 'https://github.com/alejandrofrank/bakiano-showcase' },
    ],
  },
  {
    slug: 'gcp-ingestion-lab', title: 'GCP Ingestion Lab', category: 'Engineering lab', status: 'Runnable locally',
    question: 'What happens when the same event arrives twice?',
    summary: 'Break a file-ingestion pipeline, replay events, and inspect the rows and operations that survive.',
    problem: 'A collected file is not necessarily a published file. Once published, events can repeat or arrive late, and a change to identity rules can duplicate data that already exists.',
    approach: [
      'Compare one loader rule at a time using the same synthetic input, with source listings, operation counts and warehouse output visible together.',
      'Use a completed receipt to skip repeated downloads and merges. Read the exact object generation and compare observation time rather than arrival order.',
      'Expose the identity trap: name-based keys collapse listings; replaying with new keys can double-count them. Inspect an explicit partition repair.',
    ],
    evidence: 'Start with “Send it twice”, then try a late arrival or “Two URLs, one name”. The local browser invokes the loader core and reports its actual in-memory adapter operations.',
    boundary: 'Synthetic fixtures and in-memory adapters. Cloud timing, billing and IAM are not emulated. The cloud deployment has separate setup and operational requirements.',
    stack: ['JavaScript', 'GCS', 'Eventarc', 'BigQuery'],
    flow: ['Archive', 'Validate', 'Merge', 'Receipt'],
    links: [{ label: 'Inspect source & run the lab', href: 'https://github.com/alejandrofrank/gcp-ingestion-lab' }],
    repo: 'gcp-ingestion-lab', port: 4313,
  },
  {
    slug: 'catalog-match-lab', title: 'Catalog Match Lab', category: 'Engineering lab', status: 'Runnable locally',
    question: 'Are these actually the same product?',
    summary: 'Compare messy product names using explicit checks for brand, variant, size and pack count.',
    problem: 'Two names can share nearly every word and still describe different products. A cheap 200 ml carton must not be compared with a 1 L carton as if they were interchangeable.',
    approach: [
      'Put a simple keyword baseline beside identity checks so a visitor can see why similar words are not enough.',
      'Normalize a bounded vocabulary, inspect conflicting or missing attributes, and admit uncertainty when identity cannot be established.',
      'Include only accepted identities in the comparable-price range. Let visitors edit names, import a CSV and export the decisions.',
    ],
    evidence: 'The pair inspector exposes the normalized attributes and the reason for each decision. A 24-pair fixture evaluation checks deliberately chosen boundaries.',
    boundary: 'Brands, stores and prices are fictional. The offline rules cover the fixture vocabulary; this is neither a trained semantic model nor a representative market benchmark. Live Jev comparison is optional.',
    stack: ['JavaScript', 'Identity rules', 'CSV', 'Optional Jev'],
    flow: ['Name', 'Attributes', 'Identity', 'Price range'],
    links: [{ label: 'Inspect source & run the lab', href: 'https://github.com/alejandrofrank/catalog-match-lab' }],
    repo: 'catalog-match-lab', port: 4311,
  },
  {
    slug: 'bigquery-query-guard', title: 'BigQuery Query Guard', category: 'Engineering lab', status: 'Runnable locally',
    question: 'Can you explain a query’s cost before running it?',
    summary: 'Read recorded SQL comparisons, then inspect authorization, scoped caching and query byte limits.',
    problem: 'A small result does not imply a small scan. Applications also need to decide who may query, when a cached answer is valid and which requests must be stopped before execution.',
    approach: [
      'Compare SQL first, then its recorded scan estimate, runtime, billed bytes and output. Keep those measurements distinct.',
      'Authorize every request before cache lookup, scope reusable results and reject estimates that exceed a configured byte budget.',
      'Pass a byte limit to the query engine and expose a trace. Use a separate offline sandbox to inspect cache and authorization behavior.',
    ],
    evidence: 'The default lab replays eight Bakiano query scenarios with bundled SQL and execution evidence. The separate /guard sandbox exercises the query boundary with simulated adapters.',
    boundary: 'The browser replays recordings and makes no Google Cloud queries. Recorded timings are observations, not general performance promises. Sandbox billing and warehouse behavior are simulated.',
    stack: ['JavaScript', 'BigQuery', 'Query plans', 'Scoped caching'],
    flow: ['Authorize', 'Cache', 'Estimate', 'Execute with cap'],
    links: [{ label: 'Inspect source & run the lab', href: 'https://github.com/alejandrofrank/bigquery-query-guard' }],
    repo: 'bigquery-query-guard', port: 4312,
  },
  {
    slug: 'ascii-art', title: 'Image to ASCII', category: 'Visual experiment', status: 'Public experiment',
    question: 'How much of an image can a character carry?',
    summary: 'Python experiments turning images into text, with color, character sets and side-by-side examples.',
    problem: 'An image contains more detail than a grid of characters can retain. The interesting part is choosing what to keep: shape, brightness, texture or color.',
    approach: [
      'Represent image regions with characters and inspect the result next to the input.',
      'Explore different character sets and colored HTML output to see how those choices change the image.',
    ],
    evidence: 'The repository contains the Python experiments and visual examples. This is a smaller creative project alongside the data systems.',
    boundary: 'An experimental repository, not a hosted image-processing service.',
    stack: ['Python', 'Image processing', 'HTML'],
    flow: ['Image', 'Brightness', 'Characters', 'HTML'],
    links: [{ label: 'View code & visual examples', href: 'https://github.com/alejandrofrank/art_exploring' }],
  },
  {
    slug: 'vesti', title: 'Vesti', category: 'In development', status: 'In development',
    question: 'Can you replace one piece without losing the outfit?',
    summary: 'An outfit-search project exploring garment segmentation, visual similarity and alternative pieces.',
    problem: 'An outfit reference gives useful context, but a person may only want to replace one garment. Comparing whole images can lose that intent.',
    approach: [
      'The planned flow starts with a reference image and a selected piece.',
      'Use SAM 3.1 for garment segmentation and Marqo FashionSigLIP for visual comparison.',
      'Build the candidate-matching stage with Jev to connect the selected garment to available alternatives.',
    ],
    evidence: 'The proposed pipeline is documented below. There is no public demo or measured result to present yet.',
    boundary: 'Work in progress. The intended flow is a design direction, not a claim that the full experience is shipped.',
    stack: ['SAM 3.1', 'FashionSigLIP', 'Jev'],
    flow: ['Select piece', 'Segment', 'Compare', 'Find alternatives'],
    links: [],
  },
];

export const projectPath = (project: Project): string => `/projects/${project.slug}`;
