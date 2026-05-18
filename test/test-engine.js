const assert = require('assert');
const StrategyVault = require('../engine');
let p=0,f=0;
function t(n,fn){try{fn();p++;console.log(`  ✅ ${n}`)}catch(e){f++;console.log(`  ❌ ${n}: ${e.message}`)}}
console.log('\n📋 测试部 — Freqtrade Strategy Vault\n');
const v = new StrategyVault();
const strategy = "def buy_signal(df):\n    return df['rsi'] < 30";
t('策略加密',()=>{const r=v.encrypt(strategy,'test','key');assert.equal(r.magic,'FREQVAULT');assert.ok(r.encrypted)});
t('解密还原',()=>{const p=v.encrypt(strategy,'t','k');assert.equal(v.decrypt(p,'k'),strategy)});
t('错误密钥失败',()=>{const p=v.encrypt(strategy,'t','ka');try{v.decrypt(p,'kb');assert.fail()}catch(e){assert.ok(true)}});
t('License生成',()=>{const l=v.generateLicense('my-strategy');assert.equal(l.split('-').length,2)});
t('License有效',()=>{assert.ok(v.validateLicense(v.generateLicense('s1'),'s1'))});
t('License无效',()=>{assert.ok(!v.validateLicense('WRONG-1234','s1'))});
t('空License',()=>{assert.ok(!v.validateLicense('','t'))});
t('篡改检测',()=>{const p=v.encrypt(strategy,'t','k');p.data='ff'+p.data.substring(2);try{v.decrypt(p,'k');assert.fail()}catch(e){assert.ok(true)}});
console.log(`\n📊 测试部: ${p} ✅ / ${f} ❌ / ${p+f} 总计\n`);
process.exit(f>0?1:0);
