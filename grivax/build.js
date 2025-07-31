// build.js
import { execSync } from 'child_process';

try {
  console.log('📦 Running `prisma generate`...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🛠️  Running `next build`...');
  execSync('next build', { stdio: 'inherit' });

} catch (err) {
  console.error('❌ Build script failed:', err);
  process.exit(1);
}
