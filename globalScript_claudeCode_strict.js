/*
 * Claude Code 严格分流：ChinaDomainLite 组直连，其余流量全部使用 ProxySeller-ISP 组。
 * ProxySeller-ISP 组只包含 ISP 节点，该节点通过 JMS 前置组建立链式连接。
 * 不提供 DIRECT 回退或自动切换。
 */

const chinaDNS = ["119.29.29.29", "180.184.1.1"];
const foreignDNS = ["tls://8.8.8.8", "tls://1.1.1.1"];

const ruleProviders = {
  ChinaDomainLite: {
    type: "http",
    behavior: "classical",
    format: "text",
    interval: 1800,
    url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/rules/ChinaDomainLite.list",
    path: "./rulesets/southernhu/ChinaDomainLite.list",
  },
};

const dnsConfig = {
  enable: true,
  ipv6: true,
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": ["+.lan", "+.local", "+.internal"],
  "respect-rules": true,
  nameserver: [...foreignDNS],
  "proxy-server-nameserver": [...foreignDNS],
  "nameserver-policy": {
    "geosite:private": "system",
    "geosite:cn": chinaDNS,
  },
};

function main(config) {
  const prependProxies = config["prepend-proxies"] ?? [];
  if (!Array.isArray(prependProxies)) {
    throw new Error("prepend-proxies 必须是节点列表");
  }

  const proxies = Array.isArray(config.proxies) ? config.proxies : [];
  config.proxies = [...prependProxies, ...proxies];

  const isp = config.proxies.find((proxy) => proxy.name === "ProxySeller-ISP-Node");
  if (!isp) {
    throw new Error("缺少节点 ProxySeller-ISP-Node");
  }
  if (isp["dialer-proxy"] !== "ProxySeller前置") {
    throw new Error("ProxySeller-ISP-Node 的 dialer-proxy 必须是 ProxySeller前置");
  }

  const jms = config["proxy-providers"]?.jms;
  if (!jms || typeof jms !== "object") {
    throw new Error("缺少节点源 jms");
  }

  // 只保留 JMS 节点源，避免其他服务商继续下载或出现在界面中。
  config["proxy-providers"] = { jms };

  delete config["prepend-proxies"];
  delete config["script-group-settings"];
  delete config["script-prepend-rules"];

  config.mode = "rule";
  config.dns = dnsConfig;
  config["proxy-groups"] = [
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
  ];

  config["rule-providers"] = ruleProviders;
  config.rules = [
    "RULE-SET,ChinaDomainLite,ChinaDomainLite,no-resolve",
    "MATCH,ProxySeller-ISP",
  ];

  return config;
}