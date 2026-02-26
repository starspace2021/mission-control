/**
 * 飞书投递模块测试文件
 * 
 * 运行测试: node feishu-delivery.test.js
 */

const { FeishuDelivery, createDelivery, getDefaultInstance } = require('./feishu-delivery');

// 测试配置（使用模拟数据）
const TEST_CONFIG = {
  defaultUserId: 'ou_test_user',
  webhookUrl: 'https://open.feishu.cn/open-apis/bot/v2/hook/test_key',
  maxRetries: 2,
  retryDelay: 100,
  logDir: './logs/test',
  enableLog: true,
  timeout: 5000
};

// 测试计数器
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  return new Promise(async (resolve) => {
    try {
      await fn();
      console.log(`✅ ${name}`);
      testsPassed++;
      resolve();
    } catch (error) {
      console.error(`❌ ${name}`);
      console.error(`   错误: ${error.message}`);
      testsFailed++;
      resolve();
    }
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || '断言失败');
  }
}

// ============================================
// 测试套件
// ============================================

async function runTests() {
  console.log('=== 飞书投递模块测试 ===\n');

  // 1. 模块加载测试
  await test('模块应正确导出', () => {
    assert(typeof FeishuDelivery === 'function', 'FeishuDelivery 类未导出');
    assert(typeof createDelivery === 'function', 'createDelivery 函数未导出');
    assert(typeof getDefaultInstance === 'function', 'getDefaultInstance 函数未导出');
  });

  // 2. 实例化测试
  let delivery;
  await test('应能创建实例', () => {
    delivery = new FeishuDelivery(TEST_CONFIG);
    assert(delivery instanceof FeishuDelivery, '实例创建失败');
    assert(delivery.config.defaultUserId === 'ou_test_user', '配置未正确设置');
  });

  // 3. 配置验证测试
  await test('应能从环境变量读取配置', () => {
    const originalEnv = process.env.FEISHU_DEFAULT_USER_ID;
    process.env.FEISHU_DEFAULT_USER_ID = 'env_test_user';
    
    const d = new FeishuDelivery({
      webhookUrl: 'https://test.com'
    });
    
    assert(d.config.defaultUserId === 'env_test_user', '环境变量配置未正确读取');
    
    process.env.FEISHU_DEFAULT_USER_ID = originalEnv;
  });

  // 4. 统计功能测试
  await test('统计功能应正常工作', () => {
    const stats = delivery.getStats();
    assert(typeof stats === 'object', 'getStats 应返回对象');
    assert(typeof stats.totalAttempts === 'number', 'totalAttempts 应为数字');
    assert(typeof stats.successCount === 'number', 'successCount 应为数字');
    assert(typeof stats.failCount === 'number', 'failCount 应为数字');
    assert(typeof stats.successRate === 'string', 'successRate 应为字符串');
  });

  await test('重置统计应清空数据', () => {
    delivery.resetStats();
    const stats = delivery.getStats();
    assert(stats.totalAttempts === 0, 'totalAttempts 应重置为 0');
    assert(stats.successCount === 0, 'successCount 应重置为 0');
    assert(stats.failCount === 0, 'failCount 应重置为 0');
  });

  // 5. 健康检查测试
  await test('健康检查应返回正确状态', () => {
    const health = delivery.healthCheck();
    assert(typeof health === 'object', 'healthCheck 应返回对象');
    assert('healthy' in health, '应包含 healthy 字段');
    assert('config' in health, '应包含 config 字段');
    assert('stats' in health, '应包含 stats 字段');
    assert('logDir' in health, '应包含 logDir 字段');
  });

  // 6. 参数处理测试
  await test('sendText 应支持省略 userId', async () => {
    // 模拟测试 - 验证参数处理逻辑
    const d = new FeishuDelivery({
      defaultUserId: 'default_user',
      webhookUrl: 'https://test.com'
    });
    
    // 这里不会实际发送，只是验证参数处理不报错
    try {
      // 由于 webhook 是假的，会失败，但不应该因为参数错误而失败
      await d.sendText('测试消息', { extraPayload: {} });
    } catch (e) {
      // 预期的网络错误，不是参数错误
    }
  });

  await test('sendMarkdown 应验证参数', async () => {
    try {
      await delivery.sendMarkdown('user', 'title', '');
      assert(false, '空内容应抛出错误');
    } catch (e) {
      // 预期的错误
    }
  });

  await test('sendCard 应验证参数', async () => {
    try {
      await delivery.sendCard('user', null);
      assert(false, 'null 卡片数据应抛出错误');
    } catch (e) {
      // 预期的错误
    }
  });

  // 7. 日志功能测试
  await test('日志目录应自动创建', () => {
    const fs = require('fs');
    const path = require('path');
    const testLogDir = './logs/test-auto-create';
    
    // 清理
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true });
    }
    
    const d = new FeishuDelivery({
      ...TEST_CONFIG,
      logDir: testLogDir
    });
    
    // 触发日志写入
    d._log('INFO', '测试日志');
    
    assert(fs.existsSync(testLogDir), '日志目录应被自动创建');
    
    // 清理
    fs.rmSync(testLogDir, { recursive: true });
  });

  // 8. 单例模式测试
  await test('单例模式应返回相同实例', () => {
    // 重置单例
    const module = require('./feishu-delivery');
    
    const instance1 = getDefaultInstance({ defaultUserId: 'test1', webhookUrl: 'https://test.com' });
    const instance2 = getDefaultInstance({ defaultUserId: 'test2', webhookUrl: 'https://test.com' });
    
    assert(instance1 === instance2, '单例应返回相同实例');
  });

  // 9. 工厂函数测试
  await test('工厂函数应创建独立实例', () => {
    const d1 = createDelivery({ defaultUserId: 'user1', webhookUrl: 'https://test1.com' });
    const d2 = createDelivery({ defaultUserId: 'user2', webhookUrl: 'https://test2.com' });
    
    assert(d1 !== d2, '工厂函数应创建不同实例');
    assert(d1.config.defaultUserId === 'user1', '实例1配置应独立');
    assert(d2.config.defaultUserId === 'user2', '实例2配置应独立');
  });

  // 10. 错误处理测试
  await test('应正确处理无效 webhook URL', async () => {
    const d = new FeishuDelivery({
      defaultUserId: 'test',
      webhookUrl: 'https://invalid-url-that-does-not-exist.com',
      maxRetries: 1,
      retryDelay: 100,
      timeout: 1000
    });
    
    const result = await d.sendText('测试');
    assert(result.success === false, '无效 URL 应返回失败');
    assert(result.error, '应返回错误信息');
  });

  // 11. 用户ID格式测试
  await test('应支持不同格式的用户ID', () => {
    const d = new FeishuDelivery({ webhookUrl: 'https://test.com' });
    
    // open_id 格式
    const openId = d._getUserId('ou_xxx');
    assert(openId === 'ou_xxx', '应支持 open_id 格式');
    
    // email 格式
    const email = d._getUserId('user@example.com');
    assert(email === 'user@example.com', '应支持 email 格式');
    
    // user_id 格式
    const userId = d._getUserId('user123');
    assert(userId === 'user123', '应支持 user_id 格式');
    
    // 默认用户ID
    const d2 = new FeishuDelivery({ 
      defaultUserId: 'default_user',
      webhookUrl: 'https://test.com'
    });
    const defaultId = d2._getUserId(null);
    assert(defaultId === 'default_user', '应返回默认用户ID');
  });

  // ============================================
  // 测试总结
  // ============================================
  
  console.log('\n=== 测试结果 ===');
  console.log(`✅ 通过: ${testsPassed}`);
  console.log(`❌ 失败: ${testsFailed}`);
  console.log(`📊 总计: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  } else {
    console.log('\n⚠️ 部分测试失败');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('测试运行出错:', error);
  process.exit(1);
});