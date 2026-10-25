import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'Trans Roadway Logistics Inc.',
  '/services': 'Services | Trans Roadway Logistics Inc.',
  '/rates': 'Rates | Trans Roadway Logistics Inc.',
  '/about': 'About | Trans Roadway Logistics Inc.',
  '/contact': 'Contact | Trans Roadway Logistics Inc.',
  '/login': 'Client Login | Trans Roadway Logistics Inc.',
  '/register': 'Client Registration | Trans Roadway Logistics Inc.',
  '/portal': 'Client Portal | Trans Roadway Logistics Inc.',
  '/portal/pre-advice': 'Bookings | Trans Roadway Logistics Inc.',
  '/portal/company': 'Company Profile | Trans Roadway Logistics Inc.',
  '/portal/documents': 'Documents | Trans Roadway Logistics Inc.',
  '/portal/account': 'Account Settings | Trans Roadway Logistics Inc.',
}

export default function PageHelmet(){
  const { pathname } = useLocation()
  const title = titles[pathname] || (pathname.startsWith('/portal/pre-advice/') ? 'Container Details | Trans Roadway Logistics Inc.' : 'Trans Roadway Logistics Inc.')
  const description = pathname.startsWith('/portal') ? 'Trans Roadway Logistics Inc. client portal for container booking, gate scheduling, tracking, and account services.' : 'Trans Roadway Logistics Inc. container yard and logistics services.'
  return <Helmet><title>{title}</title><meta name="description" content={description}/><meta name="robots" content={pathname.startsWith('/portal') ? 'noindex,nofollow' : 'index,follow'}/></Helmet>
}
