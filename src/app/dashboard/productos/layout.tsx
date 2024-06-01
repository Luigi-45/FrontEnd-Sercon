import { config } from '@/config';
import type { Metadata } from 'next';
import pages from "./page";
export const metadata = { title: `Productos | ${config.site.name}` } satisfies Metadata;
export default pages;