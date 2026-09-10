export interface OfficeLocation {
  city: string
  country: string
  address: string
  contact: string
  email: string
  hours?: string
  isHeadquarters?: boolean
}

export const LOCATIONS_DATA: Record<string, OfficeLocation[]> = {
  INDIA: [
    {
      city: "Gurgaon",
      country: "India",
      address: "B-16 Ground Floor, Mayfield Garden, Sector 50, Gurugram, Haryana, India 122002",
      contact: "+91-9818560331",
      email: "info@educationmalaysia.in",
      hours: "Mon - Sat: 9:30 AM - 6:30 PM",
      isHeadquarters: true,
    },
    {
      city: "Gwalior",
      country: "India",
      address: "F-103, First Floor, Alaknanda Tower, City Center, Gwalior-474011 (MP)",
      contact: "+91-9818560331",
      email: "info@educationmalaysia.in",
      hours: "Mon - Sat: 9:30 AM - 6:30 PM",
    },
  ],
  MALAYSIA: [
    {
      city: "Kuala Lumpur",
      country: "Malaysia",
      address: "8, Jalan Tun Sambanthan, Wilayah Persekutuan Kuala Lumpur, Malaysia 50470",
      contact: "+60-3-12345678",
      email: "kl@educationmalaysia.in",
      hours: "Mon - Fri: 9:00 AM - 6:00 PM",
      isHeadquarters: false,
    },
  ],
  BANGLADESH: [
    {
      city: "Uttara Dhaka",
      country: "Bangladesh",
      address: "H-16, Road-09, Sector-01, (Flat-A5/B), Uttara, Dhaka, Bangladesh 1230",
      contact: "+60-11-1778-4424",
      email: "info@educationmalaysia.in",
      hours: "Mon - Sat: 10:00 AM - 6:00 PM",
    },
  ],
  PAKISTAN: [
    {
      city: "Lahore",
      country: "Pakistan",
      address: "#311, Garden Heights, Garden Town, Lahore, Pakistan 54000",
      contact: "+60-11-1778-4424",
      email: "info@educationmalaysia.in",
      hours: "Mon - Sat: 10:00 AM - 6:00 PM",
    },
  ],
}

