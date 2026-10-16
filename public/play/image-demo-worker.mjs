import { compareImage } from './image-comparison.mjs';

self.onmessage = ({ data }) => {
  try { self.postMessage({ result: compareImage(data) }); }
  catch (error) { self.postMessage({ error: error.message }); }
};
