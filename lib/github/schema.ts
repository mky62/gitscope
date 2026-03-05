import { z } from "zod";

export const GithubRepoSchema = z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    html_url: z.string(),
    language: z.string(),
    stargazers_count: z.number().int().nonnegative().default(0),
    watchers_count: z.number().int().nonnegative().default(0),
})

export const GithubRepoArraySchema = z.array(GithubRepoSchema)

export type GithubRepo = z.infer<typeof GithubRepoSchema>