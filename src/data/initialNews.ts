import { Article } from '../types/news';
import { AUTHORS } from './authors';
import { BATCH_1_ARTICLES } from './batches/batch1_latest';
import { BATCH_2_ARTICLES } from './batches/batch2_nov16';
import { BATCH_3_ARTICLES } from './batches/batch3_nov15';
import { BATCH_4_ARTICLES } from './batches/batch4_nov14';
import { BATCH_5A_ARTICLES } from './batches/batch5a_oct';
import { BATCH_5B_ARTICLES } from './batches/batch5b_oct';

export { AUTHORS };

export const INITIAL_ARTICLES: Article[] = [
  ...BATCH_1_ARTICLES,
  ...BATCH_2_ARTICLES,
  ...BATCH_3_ARTICLES,
  ...BATCH_4_ARTICLES,
  ...BATCH_5A_ARTICLES,
  ...BATCH_5B_ARTICLES,
];
