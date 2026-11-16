// Lanza una tarea de Gradle del proyecto Android (assembleDebug, bundleRelease…) con el
// gradlew de cada sistema. Sin JAVA_HOME, usa el JDK que trae Android Studio si lo encuentra.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const android = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'android');
const tarea = process.argv[2];
if (!tarea) throw new Error('Falta la tarea de Gradle');
const windows = process.platform === 'win32';

/** El JDK incluido en Android Studio, en sus rutas habituales. */
function javaDeAndroidStudio() {
  const rutas = windows
    ? ['C:\\Program Files\\Android\\Android Studio\\jbr']
    : ['/Applications/Android Studio.app/Contents/jbr/Contents/Home', '/opt/android-studio/jbr'];
  return rutas.find((ruta) => existsSync(ruta));
}

const java = process.env.JAVA_HOME ?? javaDeAndroidStudio();
execFileSync(resolve(android, windows ? 'gradlew.bat' : 'gradlew'), [tarea], {
  cwd: android,
  stdio: 'inherit',
  shell: windows,
  env: java ? { ...process.env, JAVA_HOME: java } : process.env,
});
