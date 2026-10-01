export const SITE = {
  name: "Auth0 DevRel Demo Library",
  tagline: "Demos, skills, and presentations — not hello-world snippets.",
  description:
    "Runnable Auth0 demos, agent skills, and presentations you can clone, deploy, and take to a booth. Maintained by Auth0 Developer Advocacy.",
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "mtliendo/demo-playground",
  codeSamplesUrl: "https://developer.auth0.com/resources/code-samples",
} as const;

export function issueTemplateUrl(
  template: "submit-demo.yml" | "submit-skill.yml" | "submit-presentation.yml",
) {
  return `https://github.com/${SITE.githubRepo}/issues/new?template=${template}`;
}
