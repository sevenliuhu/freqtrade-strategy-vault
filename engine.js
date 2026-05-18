/**
 * HOMO Freqtrade Strategy Vault — 交易策略加密引擎
 * 复用 Skill Vault 的 vault.js 加密逻辑
 * 闭源C++二进制交付（原型Node.js）
 */
const crypto = require('crypto');

class StrategyVault {
  encrypt(strategyCode, strategyName, masterKey) {
    const salt = crypto.randomBytes(32);
    const key = crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha512');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(strategyCode, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    return {
      magic: 'FREQVAULT',
      version: 1,
      name: strategyName,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      data: encrypted.toString('hex'),
      algorithm: 'aes-256-gcm',
      kdf: 'pbkdf2-sha512-100k',
      encrypted: true
    };
  }

  decrypt(packet, masterKey) {
    const key = crypto.pbkdf2Sync(masterKey, Buffer.from(packet.salt, 'hex'), 100000, 32, 'sha512');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(packet.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(packet.tag, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(packet.data, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
  }

  validateLicense(licenseKey, strategyName) {
    if (!licenseKey || !strategyName) return false;
    const parts = licenseKey.split('-');
    const expected = crypto.createHash('md5').update(strategyName + 'freqtrade-secret').digest('hex').substring(0, 8);
    return parts.length >= 2 && parts[0] === strategyName.toUpperCase().replace(/[^A-Z0-9]/g, '') && parts[1] === expected;
  }

  generateLicense(strategyName) {
    const tag = strategyName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const hash = crypto.createHash('md5').update(strategyName + 'freqtrade-secret').digest('hex').substring(0, 8);
    return `${tag}-${hash}`;
  }
}

module.exports = StrategyVault;
