import React, { useMemo } from 'react';
import DashboardPage from './DashboardPage';

const DAY = 24 * 60 * 60 * 1000;

const toDateInput = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const dateFromToday = (offset) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setTime(date.getTime() + offset * DAY);
  return toDateInput(date);
};

const TEST_CLIENTS = [
  {
    id: 'client-galatasaray',
    name: 'Galatasaray',
    avatar: 'https://ui-avatars.com/api/?name=Galatasaray&background=f5b400&color=9c0016&bold=true'
  },
  {
    id: 'client-fenerbahce',
    name: 'Fenerbahçe',
    avatar: 'https://ui-avatars.com/api/?name=Fenerbahce&background=ffed00&color=003b70&bold=true'
  },
  {
    id: 'client-vakifbank',
    name: 'VakıfBank',
    avatar: 'https://ui-avatars.com/api/?name=VakifBank&background=f6b500&color=111111&bold=true'
  },
  {
    id: 'client-eczacibasi',
    name: 'Eczacıbaşı Dynavit',
    avatar: 'https://ui-avatars.com/api/?name=Eczacibasi&background=f26a21&color=ffffff&bold=true'
  },
  {
    id: 'client-besiktas',
    name: 'Beşiktaş',
    avatar: 'https://ui-avatars.com/api/?name=Besiktas&background=111111&color=ffffff&bold=true'
  },
  {
    id: 'client-kuzey',
    name: 'Kuzey Işıkları',
    avatar: 'https://ui-avatars.com/api/?name=Kuzey+Isiklari&background=6d28d9&color=ffffff&bold=true'
  },
  {
    id: 'client-posh',
    name: 'Posh And Chic',
    avatar: 'https://ui-avatars.com/api/?name=Posh+And+Chic&background=db2777&color=ffffff&bold=true'
  },
  {
    id: 'client-ilko',
    name: 'İlko İlaç',
    avatar: 'https://ui-avatars.com/api/?name=Ilko+Ilac&background=0f766e&color=ffffff&bold=true'
  }
];

const makeShoot = ({
  id,
  clientId,
  title,
  offset,
  time,
  location,
  category,
  income,
  expense,
  status,
  paymentStatus = 'paid',
  photos = 0,
  driveLink = '',
  coverImage = ''
}) => ({
  id,
  client_id: clientId,
  title,
  shoot_date: dateFromToday(offset),
  shoot_time: time,
  location,
  category,
  shoot_type: category,
  gross_income: income,
  total_expense: expense,
  status,
  payment_status: paymentStatus,
  photo_count: photos,
  drive_link: driveLink,
  cover_image: coverImage
});

const TEST_SHOOTS = [
  makeShoot({
    id: 'shoot-01',
    clientId: 'client-galatasaray',
    title: 'Galatasaray – Preseason Match',
    offset: -150,
    time: '18:00',
    location: 'Burhan Felek Vestel',
    category: 'Sports',
    income: 9000,
    expense: 900,
    status: 'completed',
    photos: 425,
    driveLink: 'https://drive.google.com/',
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=500&q=80'
  }),
  makeShoot({
    id: 'shoot-02',
    clientId: 'client-galatasaray',
    title: 'Galatasaray – League Match',
    offset: -125,
    time: '20:00',
    location: 'TVF Burhan Felek',
    category: 'Sports',
    income: 10000,
    expense: 1100,
    status: 'completed',
    photos: 712,
    driveLink: 'https://drive.google.com/',
    coverImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=500&q=80'
  }),
  makeShoot({
    id: 'shoot-03',
    clientId: 'client-galatasaray',
    title: 'Galatasaray – Team Portraits',
    offset: -92,
    time: '14:00',
    location: 'Florya',
    category: 'Portrait',
    income: 12000,
    expense: 1700,
    status: 'completed',
    photos: 260,
    driveLink: 'https://drive.google.com/'
  }),
  makeShoot({
    id: 'shoot-04',
    clientId: 'client-galatasaray',
    title: 'Galatasaray – European Match',
    offset: -61,
    time: '19:30',
    location: 'Burhan Felek Vestel',
    category: 'Sports',
    income: 15000,
    expense: 1500,
    status: 'completed',
    photos: 930,
    driveLink: 'https://drive.google.com/'
  }),
  makeShoot({
    id: 'shoot-05',
    clientId: 'client-galatasaray',
    title: 'Galatasaray – Season Finale',
    offset: -22,
    time: '18:30',
    location: 'Burhan Felek Vestel',
    category: 'Sports',
    income: 14000,
    expense: 1200,
    status: 'completed',
    photos: 845,
    driveLink: 'https://drive.google.com/'
  }),

  makeShoot({
    id: 'shoot-06',
    clientId: 'client-fenerbahce',
    title: 'Fenerbahçe – EuroLeague',
    offset: -140,
    time: '20:45',
    location: 'Ülker Spor ve Etkinlik Salonu',
    category: 'Sports',
    income: 11000,
    expense: 1000,
    status: 'completed',
    photos: 820,
    driveLink: 'https://drive.google.com/'
  }),
  makeShoot({
    id: 'shoot-07',
    clientId: 'client-fenerbahce',
    title: 'Fenerbahçe – Media Day',
    offset: -101,
    time: '12:00',
    location: 'Dereağzı',
    category: 'Portrait',
    income: 12500,
    expense: 1800,
    status: 'completed',
    photos: 315,
    driveLink: 'https://drive.google.com/'
  }),
  makeShoot({
    id: 'shoot-08',
    clientId: 'client-fenerbahce',
    title: 'Fenerbahçe – Derby',
    offset: -54,
    time: '19:00',
    location: 'Ülker Spor ve Etkinlik Salonu',
    category: 'Sports',
    income: 14000,
    expense: 1450,
    status: 'completed',
    photos: 970,
    driveLink: 'https://drive.google.com/'
  }),
  makeShoot({
    id: 'shoot-09',
    clientId: 'client-fenerbahce',
    title: 'Fenerbahçe – Preseason Match',
    offset: 1,
    time: '14:00',
    location: 'Burhan Felek Vestel',
    category: 'Sports',
    income: 9000,
    expense: 750,
    status: 'planned',
    paymentStatus: 'pending'
  }),

  makeShoot({
    id: 'shoot-10',
    clientId: 'client-vakifbank',
    title: 'VakıfBank – VNL',
    offset: -115,
    time: '16:00',
    location: 'VakıfBank Spor Sarayı',
    category: 'Sports',
    income: 12000,
    expense: 950,
    status: 'completed',
    photos: 645,
    driveLink: 'https://drive.google.com/'
  }),
  makeShoot({
    id: 'shoot-11',
    clientId: 'client-vakifbank',
    title: 'VakıfBank – Training',
    offset: -73,
    time: '11:00',
    location: 'VakıfBank Spor Sarayı',
    category: 'Training',
    income: 7000,
    expense: 600,
    status: 'completed',
    photos: 380,
    driveLink: 'https://drive.google.com/'
  }),
  makeShoot({
    id: 'shoot-12',
    clientId: 'client-vakifbank',
    title: 'VakıfBank – Championship Celebration',
    offset: -31,
    time: '21:00',
    location: 'VakıfBank Spor Sarayı',
    category: 'Event',
    income: 16000,
    expense: 2100,
    status: 'completed',
    photos: 812,
    driveLink: 'https://drive.google.com/',
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80'
  }),

  makeShoot({
    id: 'shoot-13',
    clientId: 'client-eczacibasi',
    title: 'Eczacıbaşı – Team Shoot',
    offset: -88,
    time: '13:00',
    location: 'Eczacıbaşı Spor Salonu',
    category: 'Portrait',
    income: 13000,
    expense: 1600,
    status: 'completed',
    photos: 290,
    driveLink: 'https://drive.google.com/'
  }),
  makeShoot({
    id: 'shoot-14',
    clientId: 'client-eczacibasi',
    title: 'Eczacıbaşı – League Match',
    offset: 2,
    time: '16:00',
    location: 'Burhan Felek Vestel',
    category: 'Sports',
    income: 10000,
    expense: 850,
    status: 'planned',
    paymentStatus: 'pending'
  }),

  makeShoot({
    id: 'shoot-15',
    clientId: 'client-besiktas',
    title: 'Beşiktaş – Basketball Match',
    offset: -47,
    time: '18:00',
    location: 'BJK Emlakjet Spor Kompleksi',
    category: 'Sports',
    income: 9500,
    expense: 900,
    status: 'completed',
    photos: 760,
    driveLink: 'https://drive.google.com/'
  }),
  makeShoot({
    id: 'shoot-16',
    clientId: 'client-besiktas',
    title: 'Beşiktaş – Season Portraits',
    offset: 3,
    time: '11:30',
    location: 'Akatlar',
    category: 'Portrait',
    income: 11500,
    expense: 1400,
    status: 'planned',
    paymentStatus: 'pending'
  }),

  makeShoot({
    id: 'shoot-17',
    clientId: 'client-kuzey',
    title: 'Kuzey Işıkları – Youth Tournament',
    offset: -18,
    time: '10:00',
    location: '50. Yıl Deniz Esinduy',
    category: 'Tournament',
    income: 8000,
    expense: 650,
    status: 'completed',
    photos: 1120,
    driveLink: 'https://drive.google.com/'
  }),
  makeShoot({
    id: 'shoot-18',
    clientId: 'client-posh',
    title: 'Posh And Chic – Summer Collection',
    offset: 5,
    time: '13:00',
    location: 'Stüdyo',
    category: 'Fashion',
    income: 18000,
    expense: 3500,
    status: 'planned',
    paymentStatus: 'pending'
  }),
  makeShoot({
    id: 'shoot-19',
    clientId: 'client-ilko',
    title: 'İlko İlaç – Corporate Event',
    offset: 8,
    time: '09:30',
    location: 'İstanbul Kongre Merkezi',
    category: 'Corporate',
    income: 20000,
    expense: 4200,
    status: 'planned',
    paymentStatus: 'pending'
  }),
  makeShoot({
    id: 'shoot-20',
    clientId: 'client-kuzey',
    title: 'Kuzey Işıkları – Season Opening',
    offset: 12,
    time: '15:00',
    location: 'Halkalı Ata Sporları Merkezi',
    category: 'Sports',
    income: 8500,
    expense: 700,
    status: 'planned',
    paymentStatus: 'pending'
  })
];

export default function DashboardTestPage(props) {
  const testShoots = useMemo(() => TEST_SHOOTS, []);
  const testClients = useMemo(() => TEST_CLIENTS, []);

  return (
    <DashboardPage
      {...props}
      shoots={testShoots}
      clients={testClients}
      refresh={() => {
        console.info('Test modu: Veriler geçici dosyadan geliyor.');
      }}
    />
  );
}
