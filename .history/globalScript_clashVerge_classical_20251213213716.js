  /**
 * 其实两组DNS就够了,一组国内,一组国外
 * defaultDNS是用来解析DNS的,必须为IP
 * DNS最好不要超过两个,从业界某知名APP的文档里学的
 */
const defaultDNS = ["tls://1.12.12.12", "tls://223.5.5.5"];

const chinaDNS = ["119.29.29.29", "180.184.1.1"];

const foreignDNS = ["tls://8.8.8.8", "tls://1.1.1.1", "tls://9.9.9.9"];

/**
 * DNS相关配置
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
  /**
   * 这里对域名解析进行分流
   * 由于默认dns是国外的了,只需要把国内ip和域名分流到国内dns
   */
  "nameserver-policy": {
    "geosite:private": "system",
    "geosite:cn,steam@cn,category-games@cn,microsoft@cn,apple@cn": chinaDNS,
  },
};

  // 规则集通用配置
  const ruleProviderCommon = {
    type: "http",
    format: "yaml",
    interval: 1800, //半小时更新一次规则
  };
  // 规则集配置
  const ruleProviders = {
    ChinaDomainLite: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/behavior_classical/ChinaDomainLite.list",
      path: "./rulesets/southernhu/ChinaDomainLite.list",
    },
    GFWLite: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/behavior_classical/GFWLite.list",
      path: "./rulesets/southernhu/GFWLite.list",
    },
    Ai: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/behavior_classical/Ai.list",
      path: "./rulesets/southernhu/Ai.list",
    },
    GFWMedia: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/behavior_classical/GFWMedia.list",
      path: "./rulesets/southernhu/GFWMedia.list",
    },
    ADBlocking: {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/behavior_classical/ADBlocking.list",
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
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/behavior_classical/GFWPatch.list",
      path: "./rulesets/southernhu/GFWPatch.list",
    },
    Game:{
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/main/behavior_classical/Game.list",
      path: "./rulesets/southernhu/Game.list",
    }  
  
  };
  // 规则
  const rules = [
    // 自定义规则
    "DOMAIN-SUFFIX,googleapis.cn,节点选择", // Google服务
    "DOMAIN-SUFFIX,gstatic.com,节点选择", // Google静态资源
    "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,节点选择", // Google Play下载服务
    "DOMAIN-SUFFIX,github.io,节点选择", // Github Pages
    "DOMAIN,v2rayse.com,节点选择", // V2rayse节点工具
    // 其他规则
    "GEOIP,LAN,DIRECT,no-resolve",
    "GEOIP,CN,DIRECT,no-resolve",
    //自定义规则
    "RULE-SET,ChinaDomainLite,国内常用,no-resolve",
    "RULE-SET,Ai,Ai,no-resolve",
    "RULE-SET,GFWLite,海外常用,no-resolve",
    "RULE-SET,GFWMedia,海外流媒体,no-resolve",
    "RULE-SET,GFWPatch,海外完整,no-resolve",
    "RULE-SET,Game,海外完整,no-resolve",
    "RULE-SET,GFW_ACL4SSR,海外完整,no-resolve",
    "RULE-SET,ADBlocking,全局拦截",
  
  ];
  // 代理组通用配置
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
    
    const proxyCount = config?.proxies?.length ?? 0;
    const proxyProviderCount =
      typeof config?.["proxy-providers"] === "object"
        ? Object.keys(config["proxy-providers"]).length
        : 0;
    if (proxyCount === 0 && proxyProviderCount === 0) {
      throw new Error("配置文件中未找到任何代理");
    }
    // GPT区域
    const gptRegion = "(US|🇺🇸|美国|SG|🇸🇬|新加坡|KR|🇰🇷|韩国|AU|澳大利亚|TW|🇹🇼|台湾|日本|🇯🇵|JP|德国|🇩🇪|DE)(?!.*(0\.1x|x0\.1))";
    // 速度筛选
    const fastFillter = "x3|x2|2x|3x|1.5x|x1.5";
    //
    const regionFillter = "US|🇺🇸|美国";
    
    // 覆盖原配置中DNS配置
    config["dns"] = dnsConfig;
  
    // 覆盖原配置中的代理组
    config["proxy-groups"] = [
      {
        ...groupBaseOption,
        // 手动选择支持的国家的节点
        name: "Ai",
        "type": "select",
        "tolerance": 100,  // 延迟容忍度,超过100ms的节点将被淘汰
        "fallback": 5,  // 备用节点数量,保留延迟最低的5个节点
        "interval": 3,  // 每3秒测速一次
        "include-all": false,
        proxies: ["美国节点","日本节点","新加坡节点"],
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg",
      },
      {
        ...groupBaseOption,
        name: "国内常用",
        type: "select",
        proxies: ["DIRECT"],
        "include-all": false,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/cn.svg",
      },
      {
        ...groupBaseOption,
        // 海外常用域名
        name: "海外常用",
        "type": "select",
        proxies: ["节点选择","负载均衡(轮询)","负载均衡(哈希)","故障转移","美国节点","日本节点","新加坡节点"],
        "interval": 5,  // 每5秒测速一次
        "include-all": false,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg",
      },
      {
        ...groupBaseOption,
        // 海外流媒体域名
        name: "海外流媒体",
        "type": "select",
        proxies: ["节点选择","负载均衡(轮询)","负载均衡(哈希)","故障转移","美国节点","日本节点","新加坡节点"],
        "interval": 5,  // 每5秒测速一次
        "include-all": false,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg",
      },
      {
        ...groupBaseOption,
        // 海外域名(完整)
        name: "海外完整",
        "type": "select",
        proxies: ["节点选择","负载均衡(轮询)","负载均衡(哈希)","故障转移","美国节点","日本节点","新加坡节点"],
        "interval": 5,  // 每5秒测速一次
        "include-all": false,
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/World_Map.png",
      },
      {
        ...groupBaseOption,
        // 高速节点中进行负载均衡
        name: "游戏",
        "type": "load-balance",
        "tolerance": 100,  // 延迟容忍度,超过150ms的节点将被淘汰
        "fallback": 10,  // 备用节点数量,保留延迟最低的10个节点
        "interval": 3,  // 每300秒测速一次
        "filter": regionFillter, // 匹配高速节点
        "strategy": "sticky-sessions",
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Xbox.png",
      },
      {
        ...groupBaseOption,
        name: "全局拦截",
        type: "select",
        proxies: ["REJECT", "DIRECT"],
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg",
      },
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
      {
        ...groupBaseOption,
        name: "延迟选优",
        type: "url-test",
        tolerance: 100,
        "hidden": true,
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg",
      },
      {
        ...groupBaseOption,
        name: "故障转移",
        type: "fallback",
        interval: 3,
        "include-all": true,
        "hidden": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg",
      },
      {
        ...groupBaseOption,
        name: "负载均衡(哈希)",
        type: "load-balance",
        strategy: "consistent-hashing",
        "include-all": true,
        "hidden": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/merry_go.svg",
      },
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
        "tolerance": 100,  // 延迟容忍度,超过150ms的节点将被淘汰
        "fallback": 10,  // 备用节点数量,保留延迟最低的10个节点
        "interval": 5,  // 每5秒测速一次
        // 美国
        "filter": "US|🇺🇸|美国",
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/us.svg",
      },
      {
        ...groupBaseOption,
        // 日本节点中选择延迟最低的
        name: "日本节点",
        "type": "url-test",
        "tolerance": 100,  // 延迟容忍度,超过150ms的节点将被淘汰
        "fallback": 10,  // 备用节点数量,保留延迟最低的10个节点
        "interval": 5,  // 每5秒测速一次
        // 美国
        "filter": "JP|🇯🇵|日本",
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/jp.svg",
      },
      {
        ...groupBaseOption,
        // 新加坡节点中选择延迟最低的
        name: "新加坡节点",
        "type": "url-test",
        "tolerance": 100,  // 延迟容忍度,超过150ms的节点将被淘汰
        "fallback": 10,  // 备用节点数量,保留延迟最低的10个节点
        "interval": 5,  // 每5秒测速一次
        // 美国
        "filter": "SG|🇸🇬|新加坡",
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/sg.svg",
      },
      {
        ...groupBaseOption,
        // 支筛选极速机场
        name: "极速机场",
        "type": "url-test",
        "tolerance": 100,  // 延迟容忍度,超过150ms的节点将被淘汰
        "fallback": 10,  // 备用节点数量,保留延迟最低的10个节点
        "interval": 5,  // 每5秒测速一次
        "filter": "SG|🇸🇬|新加坡",
        "include-all": true,
        icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/sg.svg",
      },
    ];
  
    // 覆盖原配置中的规则
    config["rule-providers"] = ruleProviders;
    config["rules"] = rules;
  
    // 返回修改后的配置
    return config;
  }