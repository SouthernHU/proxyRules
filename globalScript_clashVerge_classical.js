/**
 * 全局扩展脚本：读取订阅和私有 Merge，生成交给 Mihomo 的配置。
 * 本脚本整体替换 DNS、代理组、规则源和分流规则，其他配置字段继续保留。
 * 私有订阅地址和可信节点筛选条件应在 private/Merge.yaml 中维护。
 */
// 用于解析加密 DNS 服务器的域名，地址中的主机部分使用 IP，避免循环解析。
const defaultDNS = ["tls://1.12.12.12", "tls://223.5.5.5"];

// 指定国内和部分服务域名使用的 DNS。
const chinaDNS = ["119.29.29.29", "180.184.1.1"];

// 其余域名及代理节点域名使用的默认 DNS。
const foreignDNS = ["tls://8.8.8.8", "tls://1.1.1.1", "tls://9.9.9.9"];


/**
 * 域名解析配置
 */
const dnsConfig = {
  enable: true,
  listen: ":53",
  ipv6: true,
  "prefer-h3": true,
  "use-hosts": true,
  "use-system-hosts": true,
  "respect-rules": true,
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": ["*", "+.lan", "+.local", "+.market.xiaomi.com"],
  "default-nameserver": [...defaultDNS],
  nameserver: [...foreignDNS],
  "proxy-server-nameserver": [...foreignDNS],
  // 按域名类别选择解析服务器，私有域名交给系统 DNS。
  "nameserver-policy": {
    "geosite:private": "system",
    "geosite:cn,steam@cn,category-games@cn,microsoft@cn,apple@cn": chinaDNS,
  },
};

  // 规则集通用配置
  const ruleProviderCommon = {
    type: "http",
    format: "yaml",
    interval: 1800, // 规则源每 30 分钟更新一次；脚本本身仍需手动粘贴。
  };
  // 规则源提供匹配条件，具体使用哪个代理组由下方规则列表指定。
  const ruleProviders = {
    Academic: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      // 规则下载地址
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/rules/Academic.list",
      // 本地缓存路径
      path: "./rulesets/southernhu/Academic.list",
    },
    ChinaDomainLite: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      // 规则下载地址
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/rules/ChinaDomainLite.list",
      // 本地缓存路径
      path: "./rulesets/southernhu/ChinaDomainLite.list",
    },
    GFWLite: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/rules/GFWLite.list",
      path: "./rulesets/southernhu/GFWLite.list",
    },
    Ai: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/rules/Ai.list",
      path: "./rulesets/southernhu/Ai.list",
    },
    Claude: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/rules/Claude.list",
      path: "./rulesets/southernhu/Claude.list",
    },
    GFWMedia: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/rules/GFWMedia.list",
      path: "./rulesets/southernhu/GFWMedia.list",
    },
    ADBlocking: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/rules/ADBlocking.list",
      path: "./rulesets/southernhu/ADBlocking.list",
    },
    GFW_ACL4SSR: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list",
      path: "./rulesets/southernhu/GFW_ACL4SSR.list",
    },
    GFWPatch: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/rules/GFWPatch.list",
      path: "./rulesets/southernhu/GFWPatch.list",
    },
    Game:{
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/rules/Game.list",
      path: "./rulesets/southernhu/Game.list",
    },
    Apple: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Apple/Apple.list",  
    }
  
  };
  // 分流规则按从上到下匹配，Claude 专用规则放在通用规则之前。
  const rules = [
    // 先拒绝 Claude 的 UDP 请求，避免节点不支持 UDP 时继续匹配后续规则。
    "AND,((NETWORK,udp),(RULE-SET,Claude)),REJECT",
    "RULE-SET,Claude,Ai优选",
    // Antigravity 登录与服务请求使用同一代理组
    "DOMAIN,oauth2.googleapis.com,Ai",
    "DOMAIN,accounts.google.com,Ai",
    "DOMAIN,aicode.googleapis.com,Ai",
    // 自定义规则
    "DOMAIN-SUFFIX,googleapis.cn,节点选择", // Google 服务
    "DOMAIN-SUFFIX,gstatic.com,节点选择", // Google 静态资源
    "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,节点选择", // Google Play 下载服务
    "DOMAIN-SUFFIX,github.io,节点选择", // GitHub 页面服务
    "DOMAIN,v2rayse.com,节点选择", // V2rayse 节点工具
    // 局域网流量直连；后续规则再按服务类别分流。
    "GEOIP,LAN,DIRECT,no-resolve",
    // "GEOIP,CN,DIRECT,no-resolve",
    // 分类规则沿用列表顺序，前面的规则优先。
    "RULE-SET,ChinaDomainLite,国内常用,no-resolve",
    "RULE-SET,Apple,国内常用,no-resolve",
    "RULE-SET,Academic,学术网站,no-resolve",
    "RULE-SET,Ai,Ai,no-resolve",
    "RULE-SET,GFWLite,海外常用,no-resolve",
    "RULE-SET,GFWMedia,海外流媒体,no-resolve",
    "RULE-SET,GFWPatch,海外完整,no-resolve",
    "RULE-SET,Game,游戏,no-resolve",
    "RULE-SET,GFW_ACL4SSR,海外完整,no-resolve",
    "RULE-SET,ADBlocking,全局拦截",
  
  ];
  // 各组共用的检查参数；具体生效字段取决于代理组类型。
  const groupBaseOption = {
    interval: 10,
    timeout: 3000,
    url: "https://www.google.com/generate_204",
    lazy: true,
    "max-failed-times": 3,
    hidden: false,
  };
  
  // 程序入口
  function main(config) {
    // 将私有 Merge 提供的附加节点放到订阅节点之前。
    if (config["prepend-proxies"] && Array.isArray(config["prepend-proxies"])) {
      if (!config.proxies) config.proxies = [];
      config.proxies = [...config["prepend-proxies"], ...config.proxies];
    }
    const proxyCount = config?.proxies?.length ?? 0;
    const proxyProviderCount =
      typeof config?.["proxy-providers"] === "object"
        ? Object.keys(config["proxy-providers"]).length
        : 0;
    if (proxyCount === 0 && proxyProviderCount === 0) {
      throw new Error("配置文件中未找到任何代理");
    }
    // 保留旧版区域筛选表达式，当前分组未使用该变量。
    const gptRegion = "(US|🇺🇸|美国|SG|🇸🇬|新加坡|KR|🇰🇷|韩国|AU|澳大利亚|TW|🇹🇼|台湾|日本|🇯🇵|JP|德国|🇩🇪|DE)(?!.*(0\.1x|x0\.1))";
    // 保留旧版倍率筛选表达式，当前分组未使用该变量。
    const fastFillter = "x3|x2|2x|3x|1.5x|x1.5";

    // 从私有 Merge 读取 Ai优选 的节点源和筛选条件，缺少任一项则只保留阻断。
    const aiSelection = (config["proxy-groups"] || []).find(g => g.name === "Ai优选") || {};
    const aiUse = typeof aiSelection.filter === "string" && aiSelection.filter.length > 0 && Array.isArray(aiSelection.use)
      ? aiSelection.use.filter(name => Object.prototype.hasOwnProperty.call(config["proxy-providers"] || {}, name))
      : [];

    // 使用统一的 DNS 配置，替换订阅和 Merge 中已有的 DNS 设置。
    config["dns"] = dnsConfig;
  
    // 重建代理组；私有 Ai优选 的节点源和筛选条件已在上方读取。
    config["proxy-groups"] = [
      // 代理组: Ai
      {
        ...groupBaseOption,
        // 通用 AI 手动选择组；Claude 由前置规则直接进入 Ai优选。
        name: "Ai",
        "type": "select",
        "tolerance": 500,
        "fallback": 5,
        "interval": 3,  // 每3秒测速一次
        "include-all": false,
        proxies: ["Ai优选","美国节点","新加坡节点","日本节点","负载均衡(轮询)","负载均衡(哈希)"],
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg",
      },
      // 代理组: Ai优选（允许的节点由私有 Merge 指定）
      {
        ...groupBaseOption,
        name: "Ai优选",
        type: "select",
        proxies: ["REJECT"], // 无有效的已保存选择时，默认选中阻断项。
        use: aiUse,
        filter: aiSelection.filter || "^$",
        "empty-fallback": "REJECT",
        "include-all": false,

        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg",
      },
       // 代理组: 学术网站
      {
        ...groupBaseOption,
        name: "学术网站",
        type: "select",
        proxies: ["SchoolComputers","DIRECT","负载均衡(哈希)"],
        "include-all": false,
        icon: "https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/categorybook.png",
      },
      // 代理组: 国内常用
      {
        ...groupBaseOption,
        name: "国内常用",
        type: "select",
        proxies: ["DIRECT","负载均衡(哈希)"],
        "include-all": false,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/cn.svg",
      },
      // 代理组: 海外常用
      {
        ...groupBaseOption,
        // 按候选顺序使用可用项，当前项不可用时允许故障转移。
        name: "海外常用",
        "type": "fallback",
        proxies: ["负载均衡(轮询)","负载均衡(哈希)","故障转移","美国节点","日本节点","新加坡节点"],
        "interval": 5,  // 每5秒测速一次
        "include-all": false,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg",
      },
      // 代理组: 海外流媒体
      {
        ...groupBaseOption,
        // 故障转移组，候选项可包含负载均衡组。
        name: "海外流媒体",
        "type": "fallback",
        proxies: ["负载均衡(轮询)","负载均衡(哈希)","故障转移","美国节点","日本节点","新加坡节点"],
        "interval": 5,  // 每5秒测速一次
        "include-all": false,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg",
      },
      // 代理组: 游戏
      {
        ...groupBaseOption,
        // 自动选择延迟较低的日本节点。
        name: "游戏",
        "type": "url-test",
        "tolerance": 100,  // 自动选点时的延迟切换容差，单位为毫秒。
        "fallback": 10,
        "interval": 3,  // 每3秒测速一次
        "filter": "日本|🇯🇵|JP", // 按节点名称匹配日本地区。
        "strategy": "sticky-sessions",
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Xbox.png",
      },
      // 代理组: 海外完整
      {
        ...groupBaseOption,
        // 按候选顺序故障转移，供其他海外规则使用。
        name: "海外完整",
        "type": "fallback",
        proxies: ["负载均衡(轮询)","负载均衡(哈希)","故障转移","美国节点","日本节点","新加坡节点"],
        "interval": 5,  // 每5秒测速一次
        "include-all": false,
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/World_Map.png",
      },
      // 代理组: 全局拦截
      {
        ...groupBaseOption,
        name: "全局拦截",
        type: "select",
        proxies: ["REJECT", "DIRECT"],
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg",
      },
      // 代理组: 节点选择
      {
        ...groupBaseOption,
        name: "节点选择",
        "type": "url-test",
        proxies: ["负载均衡(哈希)","延迟选优","负载均衡(轮询)","故障转移"],
        "include-all": true,
        url: "http://www.gstatic.com/generate_204",
        interval: 5,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
      },
      // 代理组: 延迟选优
      {
        ...groupBaseOption,
        name: "延迟选优",
        type: "url-test",
        tolerance: 100,
        "hidden": true,
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg",
      },
      // 代理组: 故障转移
      {
        ...groupBaseOption,
        name: "故障转移",
        type: "fallback",
        "include-all": true,
        "hidden": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg",
      },
      // 代理组: 负载均衡(哈希)
      {
        ...groupBaseOption,
        name: "负载均衡(哈希)",
        type: "load-balance",
        strategy: "consistent-hashing",
        "include-all": true,
        "hidden": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/merry_go.svg",
      },
      // 代理组: 负载均衡(轮询)
      {
        ...groupBaseOption,
        name: "负载均衡(轮询)",
        type: "load-balance",
        strategy: "round-robin",
        "include-all": true,
        "hidden": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/balance.svg",
      },
      {
        ...groupBaseOption,
        // 美国节点中选择延迟最低的
        name: "美国节点",
        "type": "url-test",
        "tolerance": 100,  // 自动选点时的延迟切换容差，单位为毫秒。
        "fallback": 10,
        "interval": 5,  // 每5秒测速一次
        "filter": "US|🇺🇸|美国",
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/us.svg",
      },
      {
        ...groupBaseOption,
        // 日本节点中选择延迟最低的
        name: "日本节点",
        "type": "url-test",
        "tolerance": 100,  // 自动选点时的延迟切换容差，单位为毫秒。
        "fallback": 10,
        "interval": 5,  // 每5秒测速一次
        "filter": "JP|🇯🇵|日本",
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/jp.svg",
      },
      {
        ...groupBaseOption,
        // 新加坡节点中选择延迟最低的
        name: "新加坡节点",
        "type": "url-test",
        "tolerance": 100,  // 自动选点时的延迟切换容差，单位为毫秒。
        "fallback": 10,
        "interval": 5,  // 每5秒测速一次
        "filter": "SG|🇸🇬|新加坡",
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/sg.svg",
      },
      {
        ...groupBaseOption,
        // 澳大利亚节点中选择延迟最低的
        name: "澳大利亚节点",
        "type": "url-test",
        "tolerance": 100,  // 自动选点时的延迟切换容差，单位为毫秒。
        "fallback": 10,
        "interval": 5,  // 每5秒测速一次
        "filter": "AU|🇦🇺|澳大利亚",
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/au.svg",
      }
    ];
  
    // 普通自动分组只纳入当前订阅的直接节点，私有节点源仅由显式引用的组使用。
    config["proxy-groups"].forEach((g) => {
      if (g["include-all"] === true) {
        delete g["include-all"];
        g["include-all-proxies"] = true;
      }
    });

    // 使用统一的规则源和分流顺序，替换此前的同名配置字段。
    config["rule-providers"] = ruleProviders;
    config["rules"] = rules;
  
    // 返回最终配置，由 Clash Verge 继续处理订阅扩展并交给内核。
    return config;
  }
