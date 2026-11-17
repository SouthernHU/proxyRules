const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const scriptPath = path.join(__dirname, "..", "globalScript_claudeCode_strict.js");
const source = fs.readFileSync(scriptPath, "utf8");

function loadMain() {
  const context = vm.createContext({});
  vm.runInContext(source, context);
  return context.main;
}

function run(config) {
  return JSON.parse(JSON.stringify(loadMain()(config)));
}

function baseConfig() {
  return {
    "prepend-proxies": [{
      name: "ProxySeller-ISP-Node",
      type: "socks5",
      "dialer-proxy": "ProxySeller前置",
    }],
    "proxy-providers": { jms: { type: "http" } },
  };
}

test("两个规则目标都是代理组，节点源只保留 JMS", () => {
  const config = run({
    ...baseConfig(),
    proxies: [{ name: "Subscription" }],
    "proxy-providers": {
      jms: { type: "http", url: "https://example.invalid/jms" },
      other: { type: "http", url: "https://example.invalid/other" },
    },
    "proxy-groups": [{ name: "旧分组", type: "fallback" }],
    "rule-providers": { old: { type: "http" } },
    rules: ["MATCH,DIRECT"],
    "script-group-settings": [],
    "script-prepend-rules": [],
  });

  assert.equal(config.mode, "rule");
  assert.deepEqual(config.proxies.map((proxy) => proxy.name), ["ProxySeller-ISP-Node", "Subscription"]);
  assert.deepEqual(Object.keys(config["proxy-providers"]), ["jms"]);
  assert.deepEqual(config["proxy-groups"], [
    {
      name: "ChinaDomainLite",
      type: "select",
      proxies: ["DIRECT"],
    },
    {
      name: "ProxySeller-ISP",
      type: "select",
      proxies: ["ProxySeller-ISP-Node"],
    },
    {
      name: "ProxySeller前置",
      type: "select",
      use: ["jms"],
      filter: "^JustMySocks-",
    },
  ]);
  assert.deepEqual(Object.keys(config["rule-providers"]), ["ChinaDomainLite"]);
  assert.deepEqual(config.rules, [
    "RULE-SET,ChinaDomainLite,ChinaDomainLite,no-resolve",
    "MATCH,ProxySeller-ISP",
  ]);
  assert(!("prepend-proxies" in config));
  assert(!("script-group-settings" in config));
  assert(!("script-prepend-rules" in config));
});

test("DNS 使用国内策略和规则路由", () => {
  const config = run(baseConfig());

  assert.equal(config.dns["respect-rules"], true);
  assert.deepEqual(config.dns["nameserver-policy"], {
    "geosite:private": "system",
    "geosite:cn": ["119.29.29.29", "180.184.1.1"],
  });
});

test("缺少 ISP、前置链路或 JMS 时拒绝生成配置", () => {
  const main = loadMain();

  assert.throws(() => main({}), /缺少节点 ProxySeller-ISP-Node/);
  assert.throws(
    () => main({ ...baseConfig(), "prepend-proxies": {} }),
    /必须是节点列表/,
  );
  assert.throws(
    () => main({
      "prepend-proxies": [{
        name: "ProxySeller-ISP-Node",
        "dialer-proxy": "DIRECT",
      }],
      "proxy-providers": { jms: { type: "http" } },
    }),
    /dialer-proxy 必须是 ProxySeller前置/,
  );
  assert.throws(
    () => main({
      "prepend-proxies": [{
        name: "ProxySeller-ISP-Node",
        "dialer-proxy": "ProxySeller前置",
      }],
      "proxy-providers": { other: { type: "http" } },
    }),
    /缺少节点源 jms/,
  );
});