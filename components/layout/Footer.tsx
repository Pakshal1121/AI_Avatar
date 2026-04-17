import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const resourceLinks = [
    { label: 'About IELTS', href: '/modules' },
    { label: 'How It Works', href: '/modules' },
    { label: 'FAQ', href: '/modules' },
  ];

  const moduleLinks = [
    { label: 'Speaking', href: '/speaking' },
    { label: 'Writing', href: '/writing' },
    { label: 'Listening', href: '/listening' },
    { label: 'Reading', href: '/reading' },
  ];

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <Link href="/" className="mb-6 inline-flex items-center">
              <div className="relative h-14 w-[210px] sm:w-[230px]">
                <Image
                  src="/images/login_signup_img.png"
                  alt="IELTS Tutor"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="max-w-[320px] text-sm leading-7 text-slate-500">
              Practice IELTS with a conversational AI examiner. Real feedback,
              stronger performance, and a more confident test experience.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Resources
            </h4>
            <ul className="space-y-2">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="h-1 w-1 rounded-full bg-slate-300 transition-colors duration-200 group-hover:bg-blue-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Modules
            </h4>
            <ul className="space-y-2">
              {moduleLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="h-1 w-1 rounded-full bg-slate-300 transition-colors duration-200 group-hover:bg-blue-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-xs text-slate-400">
            © 2024 IELTS AI Tutor. Educational demonstration purposes only.
          </p>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-xs text-slate-400">AI-Powered Learning</span>
          </div>
        </div>
      </div>
    </footer>
  );
}