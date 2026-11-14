export const SITE_NAME = "ZBRoux Wiki";
export const TAGLINE = "Guides and full algorithm lists for the ZBRoux speedsolving method.";

export interface NavItem { href: string; label: string; children?: NavItem[] }
export interface NavSection { title: string; items: NavItem[] }

export const TOP = [
  { href: "/methods/zbroux/", label: "Guide", match: ["/methods/zbroux/"] },
  { href: "/algs/", label: "Algorithms", match: ["/algs/"] },
  { href: "/tools/", label: "Tools", match: ["/tools/"] },
  { href: "/methods/", label: "Methods", match: ["/methods/leor/", "/methods/$"] },
];

export const SIDEBAR: NavSection[] = [
  {
    title: "ZBRoux",
    items: [
      { href: "/methods/zbroux/", label: "What is ZBRoux?" },
      { href: "/methods/zbroux/learning-path/", label: "Start here: learning path" },
      { href: "/methods/zbroux/first-block/", label: "1. First block" },
      { href: "/methods/zbroux/second-block/", label: "2. Second block" },
      { href: "/methods/zbroux/eodfdb/", label: "3. EODFDB" },
      { href: "/methods/zbroux/zbll/", label: "4. ZBLL" },
      { href: "/methods/zbroux/zbll-recognition/", label: "ZBLL recognition" },
      { href: "/methods/zbroux/example-solves/", label: "Example solves" },
    ],
  },
  {
    title: "Algorithms",
    items: [
      { href: "/algs/eodfdb/", label: "EODFDB: find your case" },
      { href: "/algs/zbll/", label: "ZBLL: find your case" },
      { href: "/tools/trainer/", label: "Trainer" },
      { href: "/tools/breakdown/", label: "Solve breakdown" },
      {
        href: "/algs/zbll/t/", label: "ZBLL by set",
        children: [
          { href: "/algs/zbll/t/", label: "T" }, { href: "/algs/zbll/u/", label: "U" }, { href: "/algs/zbll/l/", label: "L" },
          { href: "/algs/zbll/h/", label: "H" }, { href: "/algs/zbll/pi/", label: "Pi" }, { href: "/algs/zbll/s/", label: "Sune" },
          { href: "/algs/zbll/as/", label: "Antisune" }, { href: "/algs/zbll/pll/", label: "PLL" },
        ],
      },
    ],
  },
  {
    title: "Other methods",
    items: [
      { href: "/methods/leor/", label: "LEOR" },
      { href: "/methods/leor/eostripe/", label: "LEOR: EOStripe" },
      { href: "/tools/eostripe-solver/", label: "EOStripe solver" },
    ],
  },
  {
    title: "About",
    items: [
      { href: "/about/", label: "How the algorithms are made" },
      { href: "/changelog/", label: "Changelog" },
    ],
  },
];

export function pagePath(url: URL): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  let p = url.pathname;
  if (base && p.startsWith(base)) p = p.slice(base.length) || "/";
  return p.endsWith("/") ? p : p + "/";
}

export const SEQUENCE = SIDEBAR[0].items.map((i) => i.href);
