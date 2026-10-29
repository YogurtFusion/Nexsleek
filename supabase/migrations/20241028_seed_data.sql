-- Seed Blender open movies
INSERT INTO videos (title, description, poster_url, stream_url, source, is_public_domain)
VALUES
(
  'Sintel',
  'A lonely young woman, Sintel, is attacked and her dragon, Scales, is captured. She embarks on a quest to find him.',
  'https://i.imgur.com/7C4QY6c.jpg',
  'https://media.bigbuckbunny.org/wp-content/uploads/2023/10/18131853/sintel.mp4',
  'self-hosted',
  true
),
(
  'Tears of Steel',
  'A boy is trying to survive the zombie apocalypse. In his quest for survival, he comes across a camera that records his journey.',
  'https://i.imgur.com/1cBvY6N.jpg',
  'https://media.bigbuckbunny.org/wp-content/uploads/2023/10/18131853/tears-of-steel.mp4',
  'self-hosted',
  true
),
(
  'Big Buck Bunny',
  'Big Buck Bunny tells the story of a giant rabbit with a big heart that gets tormented by three tiny predators.',
  'https://i.imgur.com/9Ie5YUo.jpg',
  'https://media.bigbuckbunny.org/wp-content/uploads/2023/10/18131853/big-buck-bunny.mp4',
  'self-hosted',
  true
),
(
  'Elephants Dream',
  'The first open movie by the Blender Institute. Two men, Proog and Emo, travel through a surreal machine.',
  'https://i.imgur.com/8Z5h7Qv.jpg',
  'https://media.bigbuckbunny.org/wp-content/uploads/2023/10/18131853/elephants-dream.mp4',
  'self-hosted',
  true
),
(
  'Dream Movie',
  'A surreal journey through a dream world filled with strange creatures and impossible landscapes.',
  'https://i.imgur.com/L5Y8k1H.jpg',
  'https://media.bigbuckbunny.org/wp-content/uploads/2023/10/18131853/dream-movie.mp4',
  'self-hosted',
  true
)
ON CONFLICT DO NOTHING;
