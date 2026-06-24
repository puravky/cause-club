import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-4">
          <div>
            <Link href="/" className="font-heading text-lg font-bold">
              causeClub
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">
              Play. Win. Give.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/#how" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/draws" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Winners
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/charities" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Charities
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} causeClub Ltd. All rights reserved.
          </p>
          <a
            href="mailto:hello@causeclub.com"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            hello@causeclub.com
          </a>
        </div>
      </div>
    </footer>
  );
}
