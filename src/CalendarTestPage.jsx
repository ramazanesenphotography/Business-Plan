import React, { useMemo, useState } from 'react';
import CalendarPage from './CalendarPage';

const demoClients = [
  { id: 'client-1', name: 'Fenerbahçe U16' },
  { id: 'client-2', name: 'VakıfBank' },
  { id: 'client-3', name: 'Eczacıbaşı' },
  { id: 'client-4', name: 'Nike Türkiye' },
  { id: 'client-5', name: 'Galatasaray U18' },
  { id: 'client-6', name: 'Zehra Güneş' },
  { id: 'client-7', name: 'Hande Baladın' },
  { id: 'client-8', name: 'Posh & Chic' },
  { id: 'client-9', name: 'UNICEF Türkiye' },
  { id: 'client-10', name: 'Vetta Collection' }
];

const initialShoots = [
  {
    id: 'shoot-1',
    client_id: 'client-1',
    title: 'League Match Coverage',
    category: 'Basketball',
    shoot_date: '2026-07-27T17:00:00',
    location: 'Ülker Sports Arena',
    city: 'Istanbul',
    status: 'Confirmed',
    payment_status: 'Paid',
    paid_amount: 5000,
    remaining_amount: 0,
    gross_income: 5000,
    total_expense: 650,
    net_profit: 4350,
    notes: 'Arrive 45 minutes before warm-up.'
  },
  {
    id: 'shoot-2',
    client_id: 'client-2',
    title: 'Team Training Session',
    category: 'Volleyball',
    shoot_date: '2026-07-28T18:30:00',
    location: 'VakıfBank Sports Palace',
    city: 'Istanbul',
    status: 'Planned',
    payment_status: 'Deposit Received',
    paid_amount: 2000,
    remaining_amount: 4500,
    gross_income: 6500,
    total_expense: 800,
    net_profit: 5700,
    notes: 'Warm-up, coach talk and team photo.'
  },
  {
    id: 'shoot-3',
    client_id: 'client-3',
    title: 'Player Portrait Session',
    category: 'Portrait / Concept',
    shoot_date: '2026-07-29T14:00:00',
    location: 'Burhan Felek',
    city: 'Istanbul',
    status: 'Confirmed',
    payment_status: 'Unpaid',
    paid_amount: 0,
    remaining_amount: 8000,
    gross_income: 8000,
    total_expense: 1200,
    net_profit: 6800,
    notes: 'Black and orange background variations.'
  },
  {
    id: 'shoot-4',
    client_id: 'client-4',
    title: 'Product Campaign',
    category: 'Product',
    shoot_date: '2026-07-31T10:00:00',
    location: 'Studio',
    city: 'Istanbul',
    status: 'Planned',
    payment_status: 'Paid',
    paid_amount: 18000,
    remaining_amount: 0,
    gross_income: 18000,
    total_expense: 4200,
    net_profit: 13800,
    notes: 'White background and lifestyle setup.'
  },
  {
    id: 'shoot-5',
    client_id: 'client-5',
    title: 'Youth League Match',
    category: 'Basketball',
    shoot_date: '2026-08-02T16:00:00',
    location: 'TBGM',
    city: 'Istanbul',
    status: 'Completed',
    payment_status: 'Paid',
    paid_amount: 5000,
    remaining_amount: 0,
    gross_income: 5000,
    total_expense: 550,
    net_profit: 4450,
    notes: 'Delivered 720 photos.'
  },
  {
    id: 'shoot-6',
    client_id: 'client-6',
    title: 'Editorial Portrait',
    category: 'Portrait / Concept',
    shoot_date: '2026-08-04T13:30:00',
    location: 'Bomontiada',
    city: 'Istanbul',
    status: 'Planned',
    payment_status: 'Partial Payment',
    paid_amount: 4500,
    remaining_amount: 8000,
    gross_income: 12500,
    total_expense: 2200,
    net_profit: 10300,
    notes: 'Three outfits, indoor and outdoor.'
  },
  {
    id: 'shoot-7',
    client_id: 'client-7',
    title: 'Social Media Portraits',
    category: 'Portrait / Concept',
    shoot_date: '2026-08-06T15:00:00',
    location: 'Karaköy',
    city: 'Istanbul',
    status: 'Confirmed',
    payment_status: 'Paid',
    paid_amount: 10000,
    remaining_amount: 0,
    gross_income: 10000,
    total_expense: 1800,
    net_profit: 8200,
    notes: 'Vertical and square framing.'
  },
  {
    id: 'shoot-8',
    client_id: 'client-8',
    title: 'Summer Lookbook',
    category: 'Fashion',
    shoot_date: '2026-08-08T09:00:00',
    location: 'Merter',
    city: 'Istanbul',
    status: 'Completed',
    payment_status: 'Paid',
    paid_amount: 15000,
    remaining_amount: 0,
    gross_income: 15000,
    total_expense: 3200,
    net_profit: 11800,
    notes: 'Catalog and campaign frames.'
  },
  {
    id: 'shoot-9',
    client_id: 'client-9',
    title: 'Corporate Event',
    category: 'Corporate',
    shoot_date: '2026-08-10T11:00:00',
    location: 'Zorlu PSM',
    city: 'Istanbul',
    status: 'In Progress',
    payment_status: 'Unpaid',
    paid_amount: 0,
    remaining_amount: 20000,
    gross_income: 20000,
    total_expense: 4500,
    net_profit: 15500,
    notes: 'Stage, speakers, audience and group photos.'
  },
  {
    id: 'shoot-10',
    client_id: 'client-10',
    title: 'New Season Lookbook',
    category: 'Fashion',
    shoot_date: '2026-08-12T10:30:00',
    location: 'Maslak Studio',
    city: 'Istanbul',
    status: 'Planned',
    payment_status: 'Unpaid',
    paid_amount: 0,
    remaining_amount: 17500,
    gross_income: 17500,
    total_expense: 3600,
    net_profit: 13900,
    notes: 'Two models, 30 combinations.'
  }
];

function createMockSupabase(setShoots) {
  return {
    from(table) {
      if (table !== 'shoots') {
        return {
          update: () => ({ eq: async () => ({ error: null }) }),
          delete: () => ({ eq: async () => ({ error: null }) }),
          insert: async () => ({ error: null })
        };
      }

      return {
        update(patch) {
          return {
            async eq(field, id) {
              setShoots((current) =>
                current.map((shoot) =>
                  String(shoot[field]) === String(id)
                    ? { ...shoot, ...patch }
                    : shoot
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
                current.filter(
                  (shoot) => String(shoot[field]) !== String(id)
                )
              );
              return { error: null };
            }
          };
        },

        async insert(rows) {
          const items = Array.isArray(rows) ? rows : [rows];

          setShoots((current) => [
            ...current,
            ...items.map((item, index) => ({
              ...item,
              id: `demo-${Date.now()}-${index}`
            }))
          ]);

          return { error: null };
        }
      };
    }
  };
}

export default function CalendarTestPage({ theme }) {
  const [shoots, setShoots] = useState(initialShoots);

  const mockSupabase = useMemo(
    () => createMockSupabase(setShoots),
    []
  );

  const refresh = async () => {};

  return (
    <CalendarPage
      shoots={shoots}
      clients={demoClients}
      refresh={refresh}
      theme={theme}
      supabase={mockSupabase}
    />
  );
}
