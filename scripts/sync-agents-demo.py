"""Export public, recorded UI inputs from an explicit madrid-delivery-sim checkout."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

source = Path(sys.argv[1]).resolve()
target = Path(__file__).resolve().parents[1] / 'public/projects/agents-demo'
target.mkdir(parents=True, exist_ok=True)
inputs = {}


def read(name):
    data = (source / name).read_bytes()
    inputs[name] = hashlib.sha256(data).hexdigest()
    return data


def save(name, data):
    (target / name).write_text(json.dumps(data, separators=(',', ':'), ensure_ascii=False) + '\n', encoding='utf-8')


save('city.json', json.loads(read('web/data/story-replay.json')))
save('agents.json', json.loads(read('web/data/reference/anatomy.json')))
recording = json.loads(read('web/data/examples/store.json'))
data = recording['data']
definition = data['definitions'][data['store']]
frames = []
for frame in data['frames']:
    if frame['time'] > 600:
        break
    state = next(s for s in frame['interior']['stores'] if s['store'] == data['store'])
    frames.append({'time': frame['time'], 'state': state})
save('store.json', {'recording': recording['recording'], 'duration': frames[-1]['time'],
                    'definition': definition, 'order': data['order'], 'frames': frames})

files = ['courier_motion.js', 'story-playback.js', 'store-3d.js', 'agent-anatomy-3d.js', 'agent-role-symbols.js']
files += ['vendor/three/' + name for name in ('three.module.js', 'three.core.js', 'OrbitControls.js',
          'GLTFLoader.js', 'SkeletonUtils.js', 'meshopt_decoder.module.js', 'BufferGeometryUtils.js', 'LICENSE', 'version.json')]
files += ['vendor/simready/' + p.name for p in (source / 'web/vendor/simready').iterdir() if p.is_file()]
for name in files:
    dest = target / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    content = read('web/' + name)
    if name == 'store-3d.js':
        content = content.replace(b"'/static/vendor/simready/'", b"new URL('./vendor/simready/', import.meta.url).href")
    dest.write_bytes(content)
for name in ('LICENSE', 'THIRD-PARTY-NOTICES.md'):
    (target / name).write_bytes(read(name))
save('provenance.json', {'repository': 'https://github.com/alejandrofrank/madrid-delivery-sim',
     'source_revision': subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip(),
     'inputs': inputs, 'transformations': ['Store recording cropped to its first 600 simulation seconds; city snapshots omitted.',
     'Store GLB paths made relative to this bundle. Other renderer modules copied unchanged.'],
     'synthetic': True, 'paid_model_calls': 0})
print('Exported', len(files), 'renderer/assets and three recorded datasets to', target)
