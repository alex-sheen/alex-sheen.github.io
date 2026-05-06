import { defineCollection, z } from 'astro:content';

const featuredProjects = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      href: z.string(),
      img: image().optional(),
      video: z.string().optional(),
      imgObjectPosition: z.string().optional(),
      order: z.number(),
    }),
});

const csProjects = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      tech: z.string(),
      href: z.string(),
      img: image(),
      order: z.number(),
    }),
});

export const collections = { featuredProjects, csProjects };
