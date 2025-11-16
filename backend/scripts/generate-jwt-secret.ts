import * as crypto from 'crypto';

const secret = crypto.randomBytes(64).toString('hex');
console.log('\n🔐 Новый JWT_SECRET:');
console.log(secret);
console.log('\nДобавь в .env файл:');
console.log(`JWT_SECRET="${secret}"`);
console.log('\n⚠️  После изменения все пользователи должны будут войти заново!\n');
