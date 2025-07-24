-- Reset categories and assign existing tags to new categories

-- 1. Delete all category_tags and categories
DELETE FROM category_tags;
DELETE FROM categories;

-- 2. Insert new categories
WITH new_categories AS (
  INSERT INTO categories (name, description)
  VALUES
    ('Color', NULL),
    ('Feeling / Mood / Atmosphere', NULL),
    ('Interaction Patterns (UI / UX)', NULL),
    ('Visual Style / Aesthetic', NULL),
    ('Discipline / Craft / Medium', NULL),
    ('Profession / Role', NULL),
    ('Objects / Product Types', NULL),
    ('Beauty / Fashion / Lifestyle', NULL),
    ('Metaphor / Concept / Ideas', NULL),
    ('Technology / Tools / Systems', NULL),
    ('Place / Culture / Context', NULL)
  RETURNING id, name
)
-- 3. Assign tags to categories (only if tag exists)
, tag_map AS (
  SELECT id, LOWER(name) AS name FROM tags
)
INSERT INTO category_tags (category_id, tag_id)
SELECT nc.id, tm.id
FROM new_categories nc
JOIN LATERAL (
  SELECT unnest(ARRAY[
    CASE nc.name
      WHEN 'Color' THEN ARRAY['pink','lilac','brown','white','black','gray','lime','purple','pastel','gradient','monocolor','colorful','glowing','glow','transparent','blur','pixel','pixelated','background','accent color','primary colors']
      WHEN 'Feeling / Mood / Atmosphere' THEN ARRAY['romance','playful','serious','sad','humorous','heart-warming','vibe','mood','intention','slowing down','patience','subtle','dreams','sleeping','chaos to order','memories','magic','soft','touch','delight','airy']
      WHEN 'Interaction Patterns (UI / UX)' THEN ARRAY['bottom sheet','swipe','drawer','segmented control','tabs','pagination','hover','drag n drop','scroll','dynamic island','floating card','search','filters','gallery','list','checklist','calendar','to-do list','chips','card','action sheet','data visualization','dashboard','toggle','number pad','numpad','picker','date picker','slider','carousel','expand','collapse','reveal','overlay','progress','loading','feedback','confirmation','file download','desktop','mobile','immersive iphone app','ai interface','conversational','modality change','humane interface','non-interface interface','micro-interaction','ui animation','micro-animation','motion','transition','page transition','search box']
      WHEN 'Visual Style / Aesthetic' THEN ARRAY['swiss','minimal','swiss design','linework','nodes','grid','sketch','illustration','watercolor','paint to reveal','generative','illustrative','geometric','generative art','generative textile','texture','material','materiality','material effects','skeuomorphism','liquid glass','gradient','shadow','drop shadow','3d','3d space','3d interaction','bubbles','buoyant','gravity','glow','glowing','blur','transparent','pixel','pixelated','visual divider','divider','negative space','visual stimuli','force directed graph','spaghetti connection']
      WHEN 'Discipline / Craft / Medium' THEN ARRAY['typography','photography','film','crochet','knitting','painting','sculpture','graphic design','sound','3d sculpture','illustration','generative art','image editing','text editor','coding','web design tool','creative pure html','html inventory website','digital space','design system','journaling','knowledge management tool','mind mapping','block-based interface']
      WHEN 'Profession / Role' THEN ARRAY['jewelry designer','illustrator','industrial designer','fashion designer','digital designer','web designer','ui designer','creative']
      WHEN 'Objects / Product Types' THEN ARRAY['jewelry','socks','shoes','bag','sandals','furniture','toys','mug','smartwatch','wearable','app','website','desktop','mobile','card','poster','book','books','stickers','wallpaper','post-it','dock','gallery','gallery wall','dining table','desk','room','office','chair','wall','walls','decoration']
      WHEN 'Beauty / Fashion / Lifestyle' THEN ARRAY['eyeliner','mascara','nails','nail polish','lipstick','blush','gloss','glossy','glitter','skincare','fashion brand','lifestyle brand','hair','curly','braid','bun','ponytail','braids','scrunchie','straight hair','outfit types','summer style','winter style','layers','linen','white pants','jeans','bootcut','mini skirt','cotton pants','embroidered','overall','socks','maternity outfits','comfy style','makeup','no make up make up','earrings','rings','hoop','gold','silver','accessories']
      WHEN 'Metaphor / Concept / Ideas' THEN ARRAY['chaos to order','time machine','dreams','magic','immersion','touch','transparency','reveal','playful','slow living','patience','slowing down','intention','delight','humane interface','non-interface interface','conversational','immersive']
      WHEN 'Technology / Tools / Systems' THEN ARRAY['AI interface','AI company','knowledge management tool','journaling','web browser','mind mapping','block-based interface','OS','Mercury OS','creator tools','desktop','mobile','digital space','sourcing tool','sourcing','data','dashboard','file download','image search','visual search','chatgpt','google','are.na']
      WHEN 'Place / Culture / Context' THEN ARRAY['Japanese','Alps','Rio','San Francisco','provincial','vacation']
      ELSE ARRAY[]::text[]
    END
  ]) AS tag_name
) AS tag_names
JOIN tag_map tm ON tm.name = LOWER(tag_names.tag_name)
; 