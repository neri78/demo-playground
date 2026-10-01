import { CatalogPage } from "@/components/catalog-page";
import { getCatalogItems } from "@/lib/content";

export default function Home() {
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="eyebrow">Auth0 Developer Advocacy</p>
      <h1 className="h1 mt-4 max-w-3xl">Demos, skills, and presentations</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">
        Clone it, deploy it, take it to a booth. Filter by the identity problem you are
        teaching.
      </p>
      <div className="mt-14">
        <CatalogPage items={getCatalogItems()} />
      </div>
    </main>
  );
}
