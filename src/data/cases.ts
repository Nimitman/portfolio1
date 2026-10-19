export interface Beat {
  key: 'stakes' | 'knot' | 'reframe' | 'decisions' | 'cost' | 'aftermath';
  title: string;
  question: string;
  /** Prompt shown while content is missing. */
  prompt: string;
  body?: string[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  kicker: string;
  tier: string;
  doorway: 'journey' | 'business';
  summary: string;
  beats: Beat[];
}

const rubric: Omit<Beat, 'body'>[] = [
  {
    key: 'stakes',
    title: 'The stakes',
    question: 'Why did this matter?',
    prompt: 'Open on one concrete moment. Business numbers in paragraph two.',
  },
  {
    key: 'knot',
    title: 'The knot',
    question: 'Why was it difficult?',
    prompt: 'Why the obvious fix fails. Conflicting incentives across sales, brokers, consumers.',
  },
  {
    key: 'reframe',
    title: 'The reframe',
    question: 'What did you uniquely understand?',
    prompt: 'The single insight that changed the question.',
  },
  {
    key: 'decisions',
    title: 'The decisions',
    question: 'Why these decisions?',
    prompt: '3–5 decisions: options considered → choice → reason. Show rejected directions.',
  },
  {
    key: 'cost',
    title: 'The cost',
    question: 'What were the trade-offs and constraints?',
    prompt: 'What was given up, who was disappointed, what you would do differently.',
  },
  {
    key: 'aftermath',
    title: 'The aftermath',
    question: 'What changed?',
    prompt: 'Metrics plus an org behaviour change (process, team, precedent). Pending Q14: publishable numbers.',
  },
];

const beats = (overrides: Partial<Record<Beat['key'], string[]>> = {}): Beat[] =>
  rubric.map((b) => ({ ...b, body: overrides[b.key] }));

export const cases: CaseStudy[] = [
  {
    slug: 'horizon',
    title: 'Project Horizon',
    kicker: 'Credits',
    tier: 'Deep — lead',
    doorway: 'business',
    summary: 'Credits flow to seller actions; listing quality rises. Design shaped how the business makes money.',
    beats: beats(),
  },
  {
    slug: 'super-broker',
    title: 'Super Broker',
    kicker: 'Trust signals',
    tier: 'Deep',
    doorway: 'journey',
    summary: 'A listing covered in badges. Which one signal earns the call?',
    beats: beats({
      stakes: ['A consumer facing eight badges on one listing, none of which tell them who to trust.'],
    }),
  },
  {
    slug: 'events',
    title: 'Housing Events',
    kicker: 'Event slots',
    tier: 'Deep / medium',
    doorway: 'business',
    summary: 'Event slots fill; revenue accumulates.',
    beats: beats(),
  },
];

export const caseBySlug = (slug: string) => cases.find((c) => c.slug === slug);
