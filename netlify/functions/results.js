const pairs = [
  { order: 1, before: '/img/work/before1.jpg', after: '/img/work/after1.jpg' },
  { order: 3, before: '/img/work/before3.PNG', after: '/img/work/after3.png' },
  { order: 4, before: '/img/work/before4.jpg', after: '/img/work/after4.jpg' },
  { order: 5, before: '/img/work/before5.jpg', after: '/img/work/after5.jpg' },
  { order: 6, before: '/img/work/before6.jpg', after: '/img/work/after6.jpg' },
  { order: 8, before: '/img/work/before8.jpg', after: '/img/work/after8.jpg' },
  { order: 12, before: '/img/work/before12.jpg', after: '/img/work/after12.jpg' },
  { order: 14, before: '/img/work/before14.jpg', after: '/img/work/after14.jpg' },
];

exports.handler = async () => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
  },
  body: JSON.stringify({ pairs }),
});
