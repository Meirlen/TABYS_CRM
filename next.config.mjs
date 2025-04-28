/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/invite_etno',
        destination: '/admin/kz/invite_etno?site_id=:site_id',
        permanent: true,
        has: [
          {
            type: 'query',
            key: 'site_id',
            value: '(?<site_id>.*)'
          }
        ]
      },
      {
        source: '/invite_gray',
        destination: '/admin/kz/invite_gray?site_id=:site_id',
        permanent: true,
        has: [
          {
            type: 'query',
            key: 'site_id',
            value: '(?<site_id>.*)'
          }
        ]
      },
      {
        source: '/invite_photo',
        destination: '/admin/kz/invite_photo?site_id=:site_id',
        permanent: true,
        has: [
          {
            type: 'query',
            key: 'site_id',
            value: '(?<site_id>.*)'
          }
        ]
      },
      {
        source: '/invite_kz',
        destination: '/admin/kz/invite_kz?site_id=:site_id',
        permanent: true,
        has: [
          {
            type: 'query',
            key: 'site_id',
            value: '(?<site_id>.*)'
          }
        ]
      },
      {
        source: '/invite_digital',
        destination: '/admin/kz/invite_digital?site_id=:site_id',
        permanent: true,
        has: [
          {
            type: 'query',
            key: 'site_id',
            value: '(?<site_id>.*)'
          }
        ]
      },
    ];
  },
};

export default nextConfig;