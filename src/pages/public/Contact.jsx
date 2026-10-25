import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

function Info({ icon: Icon, label, value, href }) {
  const content = value || 'To be supplied';
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-muted/30 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
        {href && value ? (
          <a href={href} className="mt-1 block break-words font-semibold text-foreground hover:text-brand-700">{content}</a>
        ) : (
          <div className="mt-1 whitespace-pre-line break-words font-semibold text-foreground">{content}</div>
        )}
      </div>
    </div>
  );
}

export default function Contact() {
  const { settings, loading } = useSiteSettings();
  return (
    <section className="section grid gap-8 lg:grid-cols-2">
      <div>
        <p className="text-sm font-semibold text-brand-red">CONTACT</p>
        <h1 className="mt-2 text-4xl font-bold text-brand-ink">Talk to our team.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Reach Trans Roadway Logistics Inc. using the official contact information below.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Info icon={Phone} label="Phone" value={loading ? '' : settings.phone} href={settings.phone ? `tel:${settings.phone.replace(/\s+/g, '')}` : undefined} />
          <Info icon={Mail} label="Email" value={loading ? '' : settings.email} href={settings.email ? `mailto:${settings.email}` : undefined} />
          <Info icon={MapPin} label="Office" value={loading ? '' : settings.office} />
          <Info icon={Clock3} label="Operating Hours" value={loading ? '' : settings.operatingHours} />
        </div>
      </div>

      <form className="card space-y-4 p-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Send an inquiry</h2>
          <p className="mt-1 text-sm text-muted-foreground">Contact form submission can be connected to your preferred support workflow later.</p>
        </div>
        <input className="input" placeholder="Your name" />
        <input className="input" placeholder="Email address" type="email" />
        <input className="input" placeholder="Company" />
        <textarea className="input min-h-36" placeholder="Message" />
        <button type="button" className="btn-primary">Send Message</button>
      </form>
    </section>
  );
}
