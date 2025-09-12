import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Storage } from '@google-cloud/storage';

// Env required:
// - GCS_BUCKET: target bucket name (public bucket recommended)
// - GOOGLE_APPLICATION_CREDENTIALS: path to service account JSON (for local/dev)
// Optional:
// - PORT: default 8787

const PORT = process.env.PORT || 8787;
const BUCKET = process.env.GCS_BUCKET;

if (!BUCKET) {
  console.error('Missing GCS_BUCKET env');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const storage = new Storage();
const bucket = storage.bucket(BUCKET);

app.get('/health', (_, res) => res.json({ ok: true }));

app.post('/upload', async (req, res) => {
  try {
    const { path, dataUrl } = req.body || {};
    if (!path || !dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const [header, base64] = dataUrl.split(',');
    const match = header.match(/data:(.*?);base64/);
    const contentType = match?.[1] || 'image/jpeg';
    const file = bucket.file(path.replace(/^\/+/, ''));
    const buffer = Buffer.from(base64, 'base64');

    await file.save(buffer, { contentType, validation: false, resumable: false });
    await file.makePublic().catch(() => {});

    return res.json({ objectPath: `/${BUCKET}/${file.name}` });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

app.listen(PORT, () => console.log(`Upload service running on http://localhost:${PORT}`));
