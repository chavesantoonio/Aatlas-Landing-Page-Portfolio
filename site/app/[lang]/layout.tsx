import type { Metadata } from "next";
import { Geist, Geist_Mono, Marcellus } from "next/font/google";
import Link from "next/link";
import { MotionFx } from "@/components/MotionFx";
import { Talk } from "@/components/Talk";
import { LangFloat } from "@/components/LangSwitch";
import { Tracking } from "@/components/Tracking";
import { ThemeProvider } from "next-themes";
import { getT } from "@/lib/i18n";
import { locales, htmlLang } from "@/lib/locales";
import { SITE, CONTACT } from "@/lib/site";
import "../tw.css";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const marcellus = Marcellus({ variable: "--font-marcellus", subsets: ["latin"], weight: "400" });

// Static build only (proxy.ts does this on a Node server): a pt-BR browser on another language's page goes to /pt-br.
// Same rule as pickLocale in lib/locales.ts.
const BR_LOCK = `(function(){var b="${process.env.NEXT_PUBLIC_BASE ?? ""}",L=navigator.languages||[navigator.language];for(var i=0;i<L.length;i++){var t=(L[i]||"").toLowerCase();if(/^(pt|es|en)/.test(t)){if(t.indexOf("pt-br")===0)location.replace(b+"/pt-br/"+location.pathname.slice(b.length).split("/").slice(2).join("/"));return}}})()`;

export const generateStaticParams = () => locales.map((lang) => ({ lang }));
export const dynamicParams = false;

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getT();
  return {
    metadataBase: new URL(SITE),
    title: d.meta.title,
    description: d.meta.description,
    authors: [{ name: "Antonio Chaves", url: CONTACT.linkedin }],
    creator: "Antonio Chaves",
    publisher: "Aatlas Company",
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { l, d, to } = await getT();
  return (
    <html lang={htmlLang[l]} suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${marcellus.variable}`}>
      <body>
        {process.env.NEXT_PUBLIC_STATIC && l !== "pt-br" && <script dangerouslySetInnerHTML={{ __html: BR_LOCK }} />}
        <a className="skip" href="#main">{d.nav.skip}</a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="ac-theme">{children}</ThemeProvider>
        <MotionFx />
        <Talk t={d.talk} />
        <Tracking t={d.consent} privacyHref={to("/privacy")} />
        <LangFloat label={d.nav.language} current={l} />
        <Link className="a11y" href={to("/accessibility")} aria-label={d.nav.a11y} title={d.footer.a11y}>
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" fill="#fff">
            <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm8 6.5-5.5.9v3.3l1.9 7.3-1.9.5L12 14.2l-2.5 6.3-1.9-.5 1.9-7.3V9.4L4 8.5l.3-2L12 7.6l7.7-1.1.3 2Z" />
          </svg>
        </Link>
      </body>
    </html>
  );
}
