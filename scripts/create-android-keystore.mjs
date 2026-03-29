/**
 * Genere un keystore PKCS12 pour signer des APK/AAB Android (hors credentials EAS auto).
 * Fichiers (non versionnes) : credentials/husko-upload.keystore + android-keystore.secrets.txt
 *
 * Usage : npm run android:keystore
 * Requiert : keytool (JDK 17+). Windows : Microsoft OpenJDK ou JAVA_HOME.
 */
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const credDir = join(root, 'credentials');
const ksPath = join(credDir, 'husko-upload.keystore');
const secretsPath = join(credDir, 'android-keystore.secrets.txt');
const alias = 'husko-upload';

function findKeytoolSync() {
  const name = process.platform === 'win32' ? 'keytool.exe' : 'keytool';
  if (process.env.JAVA_HOME) {
    const p = join(process.env.JAVA_HOME, 'bin', name);
    if (existsSync(p)) return p;
  }
  if (process.platform === 'win32') {
    const base = 'C:\\Program Files\\Microsoft';
    try {
      const dirs = readdirSync(base).filter((d) => d.startsWith('jdk-'));
      dirs.sort();
      const last = dirs[dirs.length - 1];
      if (last) {
        const p = join(base, last, 'bin', name);
        if (existsSync(p)) return p;
      }
    } catch {
      /* ignore */
    }
  }
  return name;
}

if (existsSync(ksPath)) {
  console.error('[Husko] Keystore deja present :', ksPath);
  console.error('Supprime-le ou renomme-le avant de regenerer.');
  process.exit(1);
}

mkdirSync(credDir, { recursive: true });
const password = randomBytes(18).toString('base64url');
const keytool = findKeytoolSync();
const dname =
  'CN=Husko By Night, OU=Mobile, O=Husko, L=Angers, ST=France, C=FR';

const args = [
  '-genkeypair',
  '-v',
  '-storetype',
  'PKCS12',
  '-keystore',
  ksPath,
  '-alias',
  alias,
  '-keyalg',
  'RSA',
  '-keysize',
  '2048',
  '-validity',
  '10000',
  '-storepass',
  password,
  '-keypass',
  password,
  '-dname',
  dname,
];

const r = spawnSync(keytool, args, { stdio: 'inherit', encoding: 'utf8' });
if (r.status !== 0) {
  console.error('[Husko] keytool a echoue. Installe un JDK 17+ ou definis JAVA_HOME.');
  process.exit(r.status ?? 1);
}

const secrets = `# NE PAS COMMITER - deja dans .gitignore
KEYSTORE_PATH=credentials/husko-upload.keystore
KEY_ALIAS=${alias}
STORE_PASSWORD=${password}
KEY_PASSWORD=${password}
`;

writeFileSync(secretsPath, secrets, 'utf8');
console.log('\n[Husko] Keystore cree :', ksPath);
console.log('[Husko] Mots de passe enregistres (local) :', secretsPath);
console.log(
  '\nPour EAS (credentials manuels) : eas credentials -p android\nPour Play Console : utiliser la meme empreinte SHA1 que ce keystore.\n'
);
