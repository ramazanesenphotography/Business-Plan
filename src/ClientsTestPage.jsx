import React, { useMemo, useState } from 'react';
import ClientsPage from './ClientsPage';

const initialClients = [
  {
    id: 'client-1',
    name: 'İlkin Aydın',
    phone: '+905551112233',
    email: 'ilkin@example.com',
    address: 'Üsküdar, İstanbul',
    notes: 'Portrait sessions should include vertical social media frames.',
    avatar: 'https://ui-avatars.com/api/?name=Ilkin+Aydin&background=ea580c&color=ffffff&bold=true'
  },
  {
    id: 'client-2',
    name: 'VakıfBank',
    phone: '+902165551010',
    email: 'media@vakifbank.example',
    address: 'VakıfBank Spor Sarayı, İstanbul',
    notes: 'Arrive before warm-up. Include coach talks and team photos.',
    avatar: 'https://ui-avatars.com/api/?name=VakifBank&background=f6b500&color=111111&bold=true'
  },
  {
    id: 'client-3',
    name: 'Fenerbahçe U16',
    phone: '+905322220011',
    email: 'academy@fenerbahce.example',
    address: 'Ülker Sports Arena, İstanbul',
    notes: 'Deliver player folders separately.',
    avatar: 'https://ui-avatars.com/api/?name=Fenerbahce+U16&background=ffed00&color=003b70&bold=true'
  },
  {
    id: 'client-4',
    name: 'Posh And Chic',
    phone: '+905300001122',
    email: 'studio@poshandchic.example',
    address: 'Merter, İstanbul',
    notes: 'Lookbook and detail shots are both required.',
    avatar: 'https://ui-avatars.com/api/?name=Posh+And+Chic&background=db2777&color=ffffff&bold=true'
  },
  {
    id: 'client-5',
    name: 'UNICEF Türkiye',
    phone: '+902122221234',
    email: 'events@unicef.example',
    address: 'Şişli, İstanbul',
    notes: 'Corporate delivery naming should follow event agenda order.',
    avatar: 'https://ui-avatars.com/api/?name=UNICEF+Turkiye&background=06b6d4&color=ffffff&bold=true'
  }
];

const initialShoots = [
  {
    id: 'shoot-1',
    client_id: 'client-1',
    title: 'Editorial Portrait Session',
    category: 'Portrait / Concept',
    shoot_date: '2026-07-20T14:00:00',
    location: 'Bomontiada',
    status: 'Completed',
    payment_status: 'Paid',
    gross_income: 12000,
    paid_amount: 12000,
    remaining_amount: 0,
    total_expense: 1700,
    net_profit: 10300,
    notes: 'Three outfits and vertical crops.',
    drive_link: 'https://drive.google.com/',
    gallery_link: 'https://drive.google.com/'
  },
  {
    id: 'shoot-2',
    client_id: 'client-1',
    title: 'Social Media Portraits',
    category: 'Portrait',
    shoot_date: '2026-08-04T13:30:00',
    location: 'Karaköy',
    status: 'Confirmed',
    payment_status: 'Partial Payment',
    gross_income: 10000,
    paid_amount: 3000,
    remaining_amount: 7000,
    total_expense: 900,
    net_profit: 9100,
    notes: 'Square and vertical framing.'
  },
  {
    id: 'shoot-3',
    client_id: 'client-2',
    title: 'League Match Coverage',
    category: 'Volleyball',
    shoot_date: '2026-07-28T18:30:00',
    location: 'VakıfBank Spor Sarayı',
    status: 'Completed',
    payment_status: 'Paid',
    gross_income: 6500,
    paid_amount: 6500,
    remaining_amount: 0,
    total_expense: 800,
    net_profit: 5700,
    notes: 'Warm-up, action, bench and celebrations.',
    drive_link: 'https://drive.google.com/',
    invoice_link: 'https://drive.google.com/'
  },
  {
    id: 'shoot-4',
    client_id: 'client-2',
    title: 'Team Training Session',
    category: 'Volleyball',
    shoot_date: '2026-08-06T17:00:00',
    location: 'VakıfBank Spor Sarayı',
    status: 'Planned',
    payment_status: 'Deposit Received',
    gross_income: 5000,
    paid_amount: 1500,
    remaining_amount: 3500,
    total_expense: 400,
    net_profit: 4600,
    notes: 'Focus on communication and coach moments.'
  },
  {
    id: 'shoot-5',
    client_id: 'client-3',
    title: 'Youth League Match',
    category: 'Basketball',
    shoot_date: '2026-07-27T17:00:00',
    location: 'Ülker Sports Arena',
    status: 'Confirmed',
    payment_status: 'Paid',
    gross_income: 5000,
    paid_amount: 5000,
    remaining_amount: 0,
    total_expense: 650,
    net_profit: 4350,
    notes: 'Arrive 45 minutes before warm-up.',
    contract_link: 'https://drive.google.com/'
  },
  {
    id: 'shoot-6',
    client_id: 'client-3',
    title: 'Player Portrait Day',
    category: 'Portrait',
    shoot_date: '2026-08-10T11:00:00',
    location: 'Dereağzı',
    status: 'Planned',
    payment_status: 'Unpaid',
    gross_income: 8000,
    paid_amount: 0,
    remaining_amount: 8000,
    total_expense: 1200,
    net_profit: 6800,
    notes: 'Individual portraits for 14 players.'
  },
  {
    id: 'shoot-7',
    client_id: 'client-4',
    title: 'Summer Lookbook',
    category: 'Fashion',
    shoot_date: '2026-07-18T09:00:00',
    location: 'Merter Studio',
    status: 'Completed',
    payment_status: 'Paid',
    gross_income: 18000,
    paid_amount: 18000,
    remaining_amount: 0,
    total_expense: 3600,
    net_profit: 14400,
    notes: 'Catalog and campaign frames.',
    drive_link: 'https://drive.google.com/',
    gallery_link: 'https://drive.google.com/',
    invoice_link: 'https://drive.google.com/'
  },
  {
    id: 'shoot-8',
    client_id: 'client-4',
    title: 'New Season Product Shoot',
    category: 'Fashion',
    shoot_date: '2026-08-12T10:30:00',
    location: 'Maslak Studio',
    status: 'Planned',
    payment_status: 'Partial Payment',
    gross_income: 17500,
    paid_amount: 9000,
    remaining_amount: 8500,
    total_expense: 3000,
    net_profit: 14500,
    notes: 'Two models and 30 combinations.'
  },
  {
    id: 'shoot-9',
    client_id: 'client-5',
    title: 'Corporate Conference',
    category: 'Corporate',
    shoot_date: '2026-07-15T10:00:00',
    location: 'Zorlu PSM',
    status: 'Completed',
    payment_status: 'Paid',
    gross_income: 20000,
    paid_amount: 20000,
    remaining_amount: 0,
    total_expense: 4200,
    net_profit: 15800,
    notes: 'Stage, speakers, audience and group photos.',
    drive_link: 'https://drive.google.com/',
    contract_link: 'https://drive.google.com/'
  },
  {
    id: 'shoot-10',
    client_id: 'client-5',
    title: 'Partner Meeting',
    category: 'Corporate',
    shoot_date: '2026-08-14T13:00:00',
    location: 'Swissôtel',
    status: 'Confirmed',
    payment_status: 'Unpaid',
    gross_income: 12500,
    paid_amount: 0,
    remaining_amount: 12500,
    total_expense: 1800,
    net_profit: 10700,
    notes: 'Meeting room and networking coverage.'
  }
];

function createMockSupabase(setClients, setShoots) {
  return {
    from(table) {
      if (table === 'clients') {
        return {
          update(patch) {
            return {
              async eq(field, id) {
                setClients((current) =>
                  current.map((item) =>
                    String(item[field]) === String(id)
                      ? { ...item, ...patch }
                      : item
                  )
                );
                return { error: null };
              }
            };
          },
          delete() {
            return {
              async eq(field, id) {
                setClients((current) =>
                  current.filter((item) => String(item[field]) !== String(id))
                );
                setShoots((current) =>
                  current.filter((item) => String(item.client_id) !== String(id))
                );
                return { error: null };
              }
            };
          },
          async insert(rows) {
            const values = Array.isArray(rows) ? rows : [rows];
            setClients((current) => [
              ...current,
              ...values.map((item, index) => ({
                ...item,
                id: `demo-client-${Date.now()}-${index}`
              }))
            ]);
            return { error: null };
          }
        };
      }

      if (table === 'shoots') {
        return {
          update(patch) {
            return {
              async eq(field, id) {
                setShoots((current) =>
                  current.map((item) =>
                    String(item[field]) === String(id)
                      ? { ...item, ...patch }
                      : item
                  )
                );
                return { error: null };
              }
            };
          },
          delete() {
            return {
              async eq(field, id) {
                setShoots((current) =>
                  current.filter((item) => String(item[field]) !== String(id))
                );
                return { error: null };
              }
            };
          },
          async insert(rows) {
            const values = Array.isArray(rows) ? rows : [rows];
            setShoots((current) => [
              ...current,
              ...values.map((item, index) => ({
                ...item,
                id: `demo-shoot-${Date.now()}-${index}`
              }))
            ]);
            return { error: null };
          }
        };
      }

      return {
        update: () => ({ eq: async () => ({ error: null }) }),
        delete: () => ({ eq: async () => ({ error: null }) }),
        insert: async () => ({ error: null })
      };
    }
  };
}

export default function ClientsTestPage({ theme }) {
  const [clients, setClients] = useState(initialClients);
  const [shoots, setShoots] = useState(initialShoots);

  const mockSupabase = useMemo(
    () => createMockSupabase(setClients, setShoots),
    []
  );

  const refresh = async () => {};

  return (
    <ClientsPage
      clients={clients}
      shoots={shoots}
      refresh={refresh}
      theme={theme}
      supabase={mockSupabase}
    />
  );
}
