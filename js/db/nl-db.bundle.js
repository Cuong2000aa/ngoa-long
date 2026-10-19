// Auto-generated offline DB bundle v2
// Source: /data/*.json
// Rebuild: py -3 scripts/rebuild-bundle-utf8.py
(function(g){g.NL_DB={"meta": {
  "id": "ngoa-long-offline-db",
  "version": "3.1.0",
  "inspiredBy": "Ngọa Long / 卧龙吟 (UQEE→VNG 2011) ",
  "locale": "vi-VN",
  "wiki": {
    "hub": "https://ngoalong.vnggames.com/ngoa-long-wiki",
    "hieuUng": "https://ngoalong.vnggames.com/ngoa-long-wiki/hieu-ung",
    "binhChung": "https://ngoalong.vnggames.com/ngoa-long-wiki/binh-chung",
    "docs": "docs/wiki/SOURCES.md",
    "importEffects": "scripts/import-wiki-effects.py"
  },
  "modules": [
    "qualities",
    "troops",
    "formation",
    "formations",
    "formulas",
    "factions",
    "skills",
    "generals",
    "recruit",
    "items",
    "buildings",
    "campaign",
    "arena",
    "progression",
    "statusEffects"
  ],
  "progression": {
    "engine": "NLCampaign + NLRecruit",
    "rules": "Danh vọng mở quan hàm + slot tướng; first-clear ải thu phục tướng theo phe; Tửu Quán khóa theo ải+danh vọng+Ty Vũ"
  },
  "combatEngine": {
    "version": 3,
    "morale": "start 50; +25 attack; +15 hit; >=100 skill then reset 0",
    "grid": "front 0-2 protect back 3-4",
    "counter": "cavalry>infantry>spear>cavalry; archer/strategist ranged"
  },
  "statKeys": {
    "tongLinh": "Thống lĩnh — thủ binh, giảm dame nhận, miss chance",
    "vuLuc": "Vũ lực — dame vật lý, tốc độ hành động gần đúng",
    "triLuc": "Trí lực — dame mưu lược / chiến pháp strategy",
    "hp": "Khí huyết tối đa lúc cấp 1 (scale theo level)"
  },
  "refs": {
    "general.skillId": "skills.skills.*",
    "general.quality": "qualities.tiers.*",
    "general.troop": "troops.types.*",
    "general.faction": "factions.list.*",
    "campaign.enemies.generalId": "generals.list.id",
    "items.dropTables.itemId": "items.list.id | null",
    "recruit.pools.generalId": "generals.list.id"
  },
  "conventions": {
    "id": "snake hoặc chữ thường không dấu, ổn định không đổi",
    "npcOnly": "true = không vào kho tướng người chơi",
    "baseStatsRange": {
      "white": {
        "min": 28,
        "max": 48
      },
      "green": {
        "min": 40,
        "max": 58
      },
      "blue": {
        "min": 52,
        "max": 72
      },
      "purple": {
        "min": 65,
        "max": 88
      },
      "orange": {
        "min": 75,
        "max": 96
      },
      "red": {
        "min": 85,
        "max": 100
      }
    },
    "hpByQuality": {
      "white": [
        1200,
        1800
      ],
      "green": [
        1600,
        2200
      ],
      "blue": [
        2000,
        2800
      ],
      "purple": [
        2400,
        3400
      ],
      "orange": [
        2800,
        4000
      ],
      "red": [
        3000,
        5200
      ]
    }
  },
  "tick": {
    "resourceIntervalMs": 1000,
    "offlineCapHours": 48
  },
  "city": {
    "engine": "NLCityEconomy",
    "playerState": "NLPlayer v3",
    "coreBuildings": [
      "ty_vu",
      "mo_bac",
      "nong_trai",
      "doanh_trai",
      "kho"
    ],
    "rules": "Ty Vũ = trần cấp nhà khác; sản xuất /phút; nâng cấp có countdown; Kho clamp; offline delta"
  },
  "campaign": {
    "engine": "NLCampaign",
    "schemaVersion": 3,
    "rules": "unlock tuần tự; staminaCost lương thực; thắng=thưởng+mở ải; thua=mất 50% lương; boss unlockFeatures"
  }
},
"qualities": {
  "order": ["white", "green", "blue", "purple", "orange", "red"],
  "wikiMap": {
    "comment": "Map bậc remake ↔ tab phẩm wiki VNG (vo-tuong quality=)",
    "white": "Thường",
    "green": "Chiến*",
    "blue": "Chiến",
    "purple": "Thần",
    "orange": "Truyền thuyết",
    "red": "Thần Hoàng"
  },
  "tiers": {
    "white": {
      "id": "white",
      "name": "Trắng",
      "nameFull": "Phàm tướng",
      "wikiName": "Thường",
      "color": "#d4d4d4",
      "border": "#9ca3af",
      "maxLevel": 20,
      "growth": { "tongLinh": 1.0, "vuLuc": 1.0, "triLuc": 1.0 },
      "starCap": 1,
      "recruitWeight": 42,
      "statBand": { "min": 28, "max": 50 },
      "hpBand": { "min": 1200, "max": 1900 }
    },
    "green": {
      "id": "green",
      "name": "Xanh lá",
      "nameFull": "Năng tướng",
      "wikiName": "Chiến",
      "color": "#86efac",
      "border": "#16a34a",
      "maxLevel": 40,
      "growth": { "tongLinh": 1.15, "vuLuc": 1.15, "triLuc": 1.15 },
      "starCap": 2,
      "recruitWeight": 26,
      "statBand": { "min": 40, "max": 60 },
      "hpBand": { "min": 1600, "max": 2300 }
    },
    "blue": {
      "id": "blue",
      "name": "Xanh dương",
      "nameFull": "Dũng tướng",
      "wikiName": "Chiến",
      "color": "#93c5fd",
      "border": "#2563eb",
      "maxLevel": 60,
      "growth": { "tongLinh": 1.3, "vuLuc": 1.3, "triLuc": 1.3 },
      "starCap": 3,
      "recruitWeight": 16,
      "statBand": { "min": 52, "max": 74 },
      "hpBand": { "min": 2000, "max": 2900 }
    },
    "purple": {
      "id": "purple",
      "name": "Tím",
      "nameFull": "Danh tướng",
      "wikiName": "Thần",
      "color": "#c4b5fd",
      "border": "#7c3aed",
      "maxLevel": 80,
      "growth": { "tongLinh": 1.5, "vuLuc": 1.5, "triLuc": 1.5 },
      "starCap": 4,
      "recruitWeight": 10,
      "statBand": { "min": 65, "max": 90 },
      "hpBand": { "min": 2400, "max": 3600 }
    },
    "orange": {
      "id": "orange",
      "name": "Cam",
      "nameFull": "Thần tướng",
      "wikiName": "Truyền thuyết",
      "color": "#fdba74",
      "border": "#ea580c",
      "maxLevel": 100,
      "growth": { "tongLinh": 1.75, "vuLuc": 1.75, "triLuc": 1.75 },
      "starCap": 5,
      "recruitWeight": 5,
      "statBand": { "min": 75, "max": 98 },
      "hpBand": { "min": 2800, "max": 4200 }
    },
    "red": {
      "id": "red",
      "name": "Đỏ",
      "nameFull": "Vương tướng",
      "wikiName": "Thần Hoàng",
      "color": "#fca5a5",
      "border": "#dc2626",
      "maxLevel": 120,
      "growth": { "tongLinh": 2.0, "vuLuc": 2.0, "triLuc": 2.0 },
      "starCap": 5,
      "recruitWeight": 1,
      "statBand": { "min": 85, "max": 100 },
      "hpBand": { "min": 3000, "max": 5500 }
    }
  }
},
"troops": {
  "schemaVersion": 6,
  "rule": "Cận chiến tam giác: Kỵ > Bộ > Thương > Kỵ. Cung/Mưu đánh xa riêng. Bậc binh chủng tăng hệ số (bám Ngọa Long).",
  "meleeTriangle": [
    "cavalry",
    "infantry",
    "spear"
  ],
  "counterMul": 1.25,
  "weakMul": 0.8,
  "neutralMul": 1.0,
  "dualTroop": {
    "enabled": true,
    "switchOncePerBattle": true,
    "note": "troop = chính; troop2 = phụ. Counter theo troop active."
  },
  "tierByLevel": [
    {
      "maxLevel": 19,
      "tier": 1
    },
    {
      "maxLevel": 39,
      "tier": 2
    },
    {
      "maxLevel": 54,
      "tier": 3
    },
    {
      "maxLevel": 74,
      "tier": 4
    },
    {
      "maxLevel": 89,
      "tier": 5
    },
    {
      "maxLevel": 999,
      "tier": 6
    }
  ],
  "tierMods": {
    "1": {
      "atk": 1.0,
      "def": 1.0,
      "label": "Sơ cấp"
    },
    "2": {
      "atk": 1.2,
      "def": 1.15,
      "label": "Trung cấp"
    },
    "3": {
      "atk": 1.45,
      "def": 1.35,
      "label": "Cao cấp"
    },
    "4": {
      "atk": 1.7,
      "def": 1.55,
      "label": "Tinh nhuệ"
    },
    "5": {
      "atk": 2.0,
      "def": 1.8,
      "label": "Hổ Báo"
    },
    "6": {
      "atk": 2.4,
      "def": 2.1,
      "label": "Thiên binh"
    }
  },
  "types": {
    "cavalry": {
      "id": "cavalry",
      "name": "Kỵ binh",
      "short": "Kỵ",
      "range": "melee",
      "beats": "infantry",
      "beatenBy": "spear",
      "desc": "Khắc Bộ binh; bị Thương binh khắc.",
      "tierNames": [
        "Kỵ",
        "Kim Kỵ",
        "Bạch Kỵ",
        "Bạch Hổ Kỵ",
        "Hổ Báo Kỵ",
        "Băng Kỵ"
      ],
      "statBias": {
        "vuLuc": 1.032,
        "tongLinh": 1.012,
        "triLuc": 1.016
      },
      "wikiStatBias": {
        "vuLuc": 1.028,
        "tongLinh": 1.028,
        "triLuc": 1.045
      },
      "wikiTierNames": [
        "Kỵ",
        "Kim Kỵ",
        "Bạch Kỵ",
        "Bạch Hổ Kỵ",
        "Hổ Báo Kỵ",
        "Băng Kỵ"
      ],
      "wikiTiers": {
        "1": {
          "name": "Kỵ",
          "desc": "Kỵ Binh có thể khắc chế Bộ Binh nhưng lại bị Thương Binh uy hiếp.",
          "statTags": [
            "beatsInfantry",
            "weakToSpear"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.0
          }
        },
        "2": {
          "name": "Kim Kỵ",
          "desc": "Toàn lực mạnh.",
          "statTags": [],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.0
          }
        },
        "5": {
          "name": "Hổ Báo Kỵ",
          "desc": "Khả năng tổng hợp mạnh, giỏi Tấn công thường.",
          "statTags": [],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.0
          }
        },
        "3": {
          "name": "Bạch Kỵ",
          "desc": "Mạnh về phòng thủ, đánh thường có 10% khiến địch Hỗn Loạn 1 lượt.",
          "statTags": [
            "physAtk",
            "physDef"
          ],
          "statBias": {
            "vuLuc": 1.12,
            "tongLinh": 1.12,
            "triLuc": 1.0
          }
        },
        "4": {
          "name": "Bạch Hổ Kỵ",
          "desc": "Tấn công thường mạnh, lực phòng thủ ưu tú, giảm phòng thủ thường của đối phương.",
          "statTags": [
            "physDef",
            "defFocus"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.12,
            "triLuc": 1.0
          }
        },
        "6": {
          "name": "Băng Kỵ",
          "desc": "Tấn công mạnh, phòng thủ ưu tú, đánh thường khiến mục tiêu -50% phòng thủ trong 2 lượt.",
          "statTags": [
            "physAtk",
            "physDef",
            "defFocus"
          ],
          "statBias": {
            "vuLuc": 1.12,
            "tongLinh": 1.12,
            "triLuc": 1.0
          }
        }
      },
      "wikiDesc": "Kỵ Binh có thể khắc chế Bộ Binh nhưng lại bị Thương Binh uy hiếp."
    },
    "infantry": {
      "id": "infantry",
      "name": "Bộ binh",
      "short": "Bộ",
      "range": "melee",
      "beats": "spear",
      "beatenBy": "cavalry",
      "desc": "Khắc Thương binh; bị Kỵ binh khắc.",
      "tierNames": [
        "Bộ",
        "Kim Bộ",
        "Giáp Bộ",
        "Điện Sĩ",
        "Hàn Giáp Bộ",
        "Trấn Ngục Giáp"
      ],
      "statBias": {
        "vuLuc": 1.031,
        "tongLinh": 1.037,
        "triLuc": 1.024
      },
      "wikiStatBias": {
        "vuLuc": 1.039,
        "tongLinh": 1.033,
        "triLuc": 1.043
      },
      "wikiTierNames": [
        "Bộ",
        "Kim Bộ",
        "Giáp Bộ",
        "Điện Sĩ",
        "Hàn Giáp Bộ",
        "Trấn Ngục Giáp"
      ],
      "wikiTiers": {
        "1": {
          "name": "Bộ",
          "desc": "Bộ Binh có thể khắc chế Thương Binh nhưng lại bị Kỵ Binh uy hiếp.",
          "statTags": [
            "beatsSpear",
            "weakToCavalry"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.0
          }
        },
        "2": {
          "name": "Kim Bộ",
          "desc": "Toàn lực mạnh.",
          "statTags": [],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.0
          }
        },
        "3": {
          "name": "Giáp Bộ",
          "desc": "Đánh thường và Chiến pháp mạnh, nhưng sợ Mưu Công.",
          "statTags": [
            "physAtk",
            "stratAtk"
          ],
          "statBias": {
            "vuLuc": 1.12,
            "tongLinh": 1.0,
            "triLuc": 1.15
          }
        },
        "4": {
          "name": "Điện Sĩ",
          "desc": "Năng lực tổng hợp mạnh, bạo kích và phản kích ưu tú.",
          "statTags": [
            "crit",
            "counter",
            "balanced"
          ],
          "statBias": {
            "vuLuc": 1.05,
            "tongLinh": 1.05,
            "triLuc": 1.05
          }
        },
        "5": {
          "name": "Hàn Giáp Bộ",
          "desc": "Kế Sách mạnh, đánh thường có 20% khiến mục tiêu Mất Sĩ Khí 1 lượt.",
          "statTags": [
            "physAtk",
            "stratAtk"
          ],
          "statBias": {
            "vuLuc": 1.12,
            "tongLinh": 1.0,
            "triLuc": 1.15
          }
        },
        "6": {
          "name": "Băng Giáp",
          "desc": "Đánh thường và phòng thủ cực cao, đánh thường giúp bản thân +50 sĩ khí, không tăng sĩ khí đối phương, có 15% khiến đối phương đóng băng 1 lượt.",
          "statTags": [
            "physAtk",
            "physDef",
            "defFocus"
          ],
          "statBias": {
            "vuLuc": 1.12,
            "tongLinh": 1.12,
            "triLuc": 1.0
          }
        }
      },
      "wikiDesc": "Bộ Binh có thể khắc chế Thương Binh nhưng lại bị Kỵ Binh uy hiếp."
    },
    "spear": {
      "id": "spear",
      "name": "Thương binh",
      "short": "Thương",
      "range": "melee",
      "beats": "cavalry",
      "beatenBy": "infantry",
      "desc": "Khắc Kỵ binh; bị Bộ binh khắc.",
      "tierNames": [
        "Thương",
        "Kim Thương",
        "Hoàng Thương",
        "Linh Thương",
        "Diệm Thương",
        "Băng Thương"
      ],
      "statBias": {
        "vuLuc": 1.03,
        "tongLinh": 1.051,
        "triLuc": 1.018
      },
      "wikiStatBias": {
        "vuLuc": 1.038,
        "tongLinh": 1.064,
        "triLuc": 1.036
      },
      "wikiTierNames": [
        "Thương",
        "Kim Thương",
        "Hoàng Thương",
        "Linh Thương",
        "Diệm Thương",
        "Băng Thương"
      ],
      "wikiTiers": {
        "1": {
          "name": "Thương",
          "desc": "Thương Binh có thể khắc chế Kỵ Binh nhưng lại bị Bộ Binh uy hiếp.",
          "statTags": [
            "beatsCavalry",
            "weakToInfantry"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.0
          }
        },
        "2": {
          "name": "Kim Thương",
          "desc": "Năng lực chungưu tú.",
          "statTags": [],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.0
          }
        },
        "3": {
          "name": "Hoàng Thương",
          "desc": "Năng lực tổng hợp mạnh, bạo kích và phản kích xuất sắc.",
          "statTags": [
            "crit",
            "counter",
            "balanced"
          ],
          "statBias": {
            "vuLuc": 1.05,
            "tongLinh": 1.05,
            "triLuc": 1.05
          }
        },
        "4": {
          "name": "Linh Thương",
          "desc": "Năng lực tổng hợp mạnh, ưu tú về bạo kích và phản kích.",
          "statTags": [
            "crit",
            "counter",
            "balanced"
          ],
          "statBias": {
            "vuLuc": 1.05,
            "tongLinh": 1.05,
            "triLuc": 1.05
          }
        },
        "5": {
          "name": "Diệm Thương",
          "desc": "Năng lực chung ưu tú, sau khi tấn công thường, lần kế hút HP và thiêu đốt 2 lượt.",
          "statTags": [],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.0
          }
        },
        "6": {
          "name": "Băng Thương",
          "desc": "Khả năng phòng thủ tuyệt vời, đánh thường bản thân tăng Thủ Hộ, tăng Thủ Hộ và Hộ Thuẫn 1 lượt cho đồng đội sinh lực nhấp nhất.",
          "statTags": [
            "physAtk",
            "physDef"
          ],
          "statBias": {
            "vuLuc": 1.12,
            "tongLinh": 1.12,
            "triLuc": 1.0
          }
        }
      },
      "wikiDesc": "Thương Binh có thể khắc chế Kỵ Binh nhưng lại bị Bộ Binh uy hiếp."
    },
    "archer": {
      "id": "archer",
      "name": "Cung binh",
      "short": "Cung",
      "range": "ranged",
      "beats": null,
      "beatenBy": null,
      "armorCoef": 0.85,
      "canTargetBack": true,
      "desc": "Đánh xa — không vào vòng khắc cận chiến; xuyên hàng sau nếu skill/pattern cho phép.",
      "tierNames": [
        "Cung",
        "Hỏa Cung",
        "Diệm Cung",
        "Xích Cung",
        "Tu La Cung",
        "Băng Cung"
      ],
      "statBias": {
        "vuLuc": 1.049,
        "tongLinh": 1.0,
        "triLuc": 1.019
      },
      "wikiStatBias": {
        "vuLuc": 1.023,
        "tongLinh": 1.038,
        "triLuc": 1.037
      },
      "wikiTierNames": [
        "Cung",
        "Hỏa Cung",
        "Diệm Cung",
        "Xích Cung",
        "Tu La Cung",
        "Băng Cung"
      ],
      "wikiTiers": {
        "1": {
          "name": "Cung",
          "desc": "Tấn công khá cao nhưng phòng thủ yếu.",
          "statTags": [
            "physDef"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.12,
            "triLuc": 1.0
          }
        },
        "2": {
          "name": "Hỏa Cung",
          "desc": "Giỏi Mưu công và Phòng thủ.",
          "statTags": [
            "physDef",
            "stratAtk"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.12,
            "triLuc": 1.15
          }
        },
        "3": {
          "name": "Diệm Cung",
          "desc": "Sở trường Kế sách.",
          "statTags": [
            "stratAtk"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.15
          }
        },
        "4": {
          "name": "Xích Cung",
          "desc": "Binh chủng có sở trường về kế sách, tấn công thường kèm theo trạng thái thiêu đốt.",
          "statTags": [
            "stratAtk"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.15
          }
        },
        "5": {
          "name": "Tu La Cung",
          "desc": "Tấn công theo đường thẳng và giảm vật phòng, chỉ tăng sĩ khí đơn lẻ.",
          "statTags": [
            "physDef"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.12,
            "triLuc": 1.0
          }
        },
        "6": {
          "name": "Băng Cung",
          "desc": "Tấn công cực cao, nhận hiệu quả Hội Tâm và Nguyệt Hồn 2 lượt.",
          "statTags": [
            "physAtk",
            "atkFocus"
          ],
          "statBias": {
            "vuLuc": 1.12,
            "tongLinh": 1.0,
            "triLuc": 1.0
          }
        }
      },
      "wikiDesc": "Tấn công khá cao nhưng phòng thủ yếu."
    },
    "strategist": {
      "id": "strategist",
      "name": "Mưu sĩ",
      "short": "Mưu",
      "range": "ranged",
      "beats": null,
      "beatenBy": null,
      "armorCoef": 0.75,
      "canTargetBack": true,
      "desc": "Mưu lược — dame theo Trí lực; không vào vòng khắc cận chiến.",
      "tierNames": [
        "Sách Sĩ",
        "Hỏa Sách Sĩ",
        "Lôi Cổ",
        "Khống Vân",
        "Hỏa Sứ",
        "Băng Hồ"
      ],
      "statBias": {
        "vuLuc": 0.963,
        "tongLinh": 0.976,
        "triLuc": 1.089
      },
      "wikiStatBias": {
        "vuLuc": 1.017,
        "tongLinh": 1.021,
        "triLuc": 1.048
      },
      "wikiTierNames": [
        "Sách Sĩ",
        "Hỏa Sách Sĩ",
        "Lôi Cổ",
        "Khống Vân",
        "Hỏa Sứ",
        "Băng Hồ"
      ],
      "wikiTiers": {
        "1": {
          "name": "Quan văn",
          "desc": "Mưu công khá cao nhưng phòng thủ yếu.",
          "statTags": [
            "physDef",
            "stratAtk"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.12,
            "triLuc": 1.15
          }
        },
        "2": {
          "name": "Hỏa Sách Sĩ",
          "desc": "Mưu công cao.",
          "statTags": [
            "stratAtk"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.15
          }
        },
        "3": {
          "name": "Lôi Cổ",
          "desc": "Mỗi lượt tăng Sĩ khí phe mình.",
          "statTags": [],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.0
          }
        },
        "4": {
          "name": "Địa Sư",
          "desc": "Mưu công toàn diện, chỉ tăng sĩ khí đơn thể, phòng thủ thường tương đối cao.",
          "statTags": [
            "physDef",
            "stratAtk"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.12,
            "triLuc": 1.15
          }
        },
        "5": {
          "name": "Hỏa Sứ",
          "desc": "Mưu công, tấn công thường cao, kèm theo sát thương kế sách, pháp phòng tương đối thấp.",
          "statTags": [
            "magicDef",
            "stratAtk"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.15
          }
        },
        "6": {
          "name": "Băng Hồ",
          "desc": "Tấn công đường thẳng, khiến mục tiêu -50 sĩ khí, bản thân +40% Mưu Công trong 2 lượt.",
          "statTags": [
            "stratAtk"
          ],
          "statBias": {
            "vuLuc": 1.0,
            "tongLinh": 1.0,
            "triLuc": 1.15
          }
        }
      },
      "wikiDesc": "Mưu công khá cao nhưng phòng thủ yếu."
    }
  },
  "wikiSource": "https://ngoalong.vnggames.com/ngoa-long-wiki/binh-chung",
  "wikiNote": "Chỉ số/tên bậc lấy từ wiki player units; NPC không đưa vào types."
},
"formation": {
  "schemaVersion": 2,
  "id": "nl_default_5",
  "name": "Trận hình cơ bản",
  "maxSlots": 5,
  "rows": [
    {
      "id": "front",
      "name": "Hàng trước",
      "slots": [
        { "index": 0, "row": 0, "col": 0, "label": "Tiền 1" },
        { "index": 1, "row": 0, "col": 1, "label": "Tiền 2" },
        { "index": 2, "row": 0, "col": 2, "label": "Tiền 3" }
      ]
    },
    {
      "id": "back",
      "name": "Hàng sau",
      "slots": [
        { "index": 3, "row": 1, "col": 0, "label": "Hậu 1" },
        { "index": 4, "row": 1, "col": 1, "label": "Hậu 2" }
      ]
    }
  ],
  "morale": {
    "max": 100,
    "start": 50,
    "gainOnAttack": 25,
    "gainOnHit": 15,
    "skillThreshold": 100,
    "resetAfterSkill": 0,
    "gainPerHit": 25,
    "gainPerDamageTaken": 15,
    "gainPerKill": 0,
    "skillCost": 100
  },
  "turnOrder": "by_speed_then_random",
  "speedStat": "vuLuc"
},
"formations": {
  "schemaVersion": 3,
  "defaultId": "crane_wing",
  "slots": {
    "front": [
      { "slot": 0, "label": "Ô 1 — Trước Trên" },
      { "slot": 1, "label": "Ô 2 — Trước Giữa" },
      { "slot": 2, "label": "Ô 3 — Trước Dưới" }
    ],
    "back": [
      { "slot": 3, "label": "Ô 4 — Sau Giữa" },
      { "slot": 4, "label": "Ô 5 — Sau Dưới" }
    ]
  },
  "list": {
    "crane_wing": {
      "id": "crane_wing",
      "name": "Hạc Dực",
      "desc": "Hai cánh mạnh công, giữa vững.",
      "slotMods": {
        "0": { "atk": 1.1, "def": 0.95 },
        "1": { "atk": 1.0, "def": 1.1 },
        "2": { "atk": 1.1, "def": 0.95 },
        "3": { "atk": 1.05, "def": 1.0 },
        "4": { "atk": 1.05, "def": 1.0 }
      }
    },
    "long_snake": {
      "id": "long_snake",
      "name": "Trường Xà",
      "desc": "Xuyên kích theo cột; hàng trước áp lực cao.",
      "slotMods": {
        "0": { "atk": 1.15, "def": 0.9 },
        "1": { "atk": 1.15, "def": 0.9 },
        "2": { "atk": 1.15, "def": 0.9 },
        "3": { "atk": 1.0, "def": 1.05 },
        "4": { "atk": 1.0, "def": 1.05 }
      }
    },
    "square": {
      "id": "square",
      "name": "Phương Viên",
      "desc": "Phòng thủ vững; công giảm nhẹ.",
      "slotMods": {
        "0": { "atk": 0.95, "def": 1.15 },
        "1": { "atk": 0.95, "def": 1.2 },
        "2": { "atk": 0.95, "def": 1.15 },
        "3": { "atk": 0.9, "def": 1.1 },
        "4": { "atk": 0.9, "def": 1.1 }
      }
    },
    "fish_scale": {
      "id": "fish_scale",
      "name": "Ngư Lân",
      "desc": "Cân bằng công thủ.",
      "slotMods": {
        "0": { "atk": 1.05, "def": 1.05 },
        "1": { "atk": 1.05, "def": 1.05 },
        "2": { "atk": 1.05, "def": 1.05 },
        "3": { "atk": 1.0, "def": 1.0 },
        "4": { "atk": 1.0, "def": 1.0 }
      }
    },
    "arrow": {
      "id": "arrow",
      "name": "Nhuệ Tiễn",
      "desc": "Hàng sau tăng công (cung/mưu); hàng trước mỏng hơn.",
      "slotMods": {
        "0": { "atk": 1.0, "def": 0.95 },
        "1": { "atk": 1.0, "def": 0.95 },
        "2": { "atk": 1.0, "def": 0.95 },
        "3": { "atk": 1.2, "def": 0.9 },
        "4": { "atk": 1.2, "def": 0.9 }
      }
    }
  }
},
"formulas": {
  "id": "nl_formulas_v3",
  "schemaVersion": 3,
  "level": {
    "statPerLevel": 0.04,
    "hpPerLevel": 0.045
  },
  "combat": {
    "physCoef": 1.0,
    "stratCoef": 1.0,
    "skillNormalPower": 1.0,
    "minDamage": 25,
    "damageRandomMin": 0.95,
    "damageRandomMax": 1.05,
    "missBase": 0.05,
    "missClamp": [0.02, 0.18],
    "critBase": 0.08,
    "critMul": 1.5,
    "critClamp": [0.05, 0.4],
    "maxRounds": 40,
    "counterMul": 1.25,
    "weakMul": 0.8,
    "rangedArmorDefault": 0.85,
    "turnOrder": "speed_then_slot",
    "speedWeights": { "vuLuc": 0.55, "tongLinh": 0.25, "triLuc": 0.2 }
  },
  "morale": {
    "start": 50,
    "max": 100,
    "gainOnAttack": 25,
    "gainOnHit": 15,
    "skillThreshold": 100,
    "resetAfterSkill": 0
  },
  "economy": {
    "buildingCostGrowthDefault": 1.52,
    "offlineCapHours": 48,
    "tickMs": 1000,
    "defaultFormationId": "crane_wing"
  },
  "city": {
    "starting": {
      "silver": 5000,
      "food": 4000,
      "gem": 50,
      "buildings": {
        "ty_vu": 1,
        "mo_bac": 1,
        "nong_trai": 1,
        "doanh_trai": 1,
        "kho": 1
      }
    },
    "upgrade": {
      "note": "cost = baseCost * costGrowth^level; timeSec = upgradeBaseSec * upgradeGrowth^level"
    }
  },
  "campaign": {
    "loseFoodRatio": 0.5,
    "staminaByType": { "normal": 80, "elite": 150, "boss": 250 },
    "defaultEnemyFormation": "square",
    "startingUnlocked": ["campaign"],
    "featureLabels": {
      "arena": "Đấu Trường / Lôi đài",
      "recruit_advanced": "Chiêu mộ tướng cao cấp",
      "tower_hard": "Tháp thí luyện (Khó)",
      "equip_enhance_plus": "Cường hóa trang bị+",
      "campaign_hard": "Phó bản Khó",
      "legend_recruit": "Chiêu mộ Huyền thoại"
    }
  }
},
"factions": {
  "list": {
    "shu": {
      "id": "shu",
      "name": "Thục",
      "nameFull": "Thục Hán",
      "color": "#b91c1c",
      "bonus": {
        "food": 1.12,
        "silver": 1.0,
        "gold": 1.0,
        "exp": 1.05
      },
      "starterGeneralIds": [
        "liaohua",
        "guanying",
        "zhangbao_shu"
      ],
      "desc": "Nhân nghĩa · lợi lương · danh tướng Ngũ Hổ (mở dần theo tiến trình)"
    },
    "wei": {
      "id": "wei",
      "name": "Ngụy",
      "nameFull": "Tào Ngụy",
      "color": "#1d4ed8",
      "bonus": {
        "food": 1.0,
        "silver": 1.12,
        "gold": 1.0,
        "exp": 1.05
      },
      "starterGeneralIds": [
        "yuejin",
        "licadian",
        "caoren"
      ],
      "desc": "Quyền mưu · lợi bạc · hổ tướng (mở dần theo tiến trình)"
    },
    "wu": {
      "id": "wu",
      "name": "Ngô",
      "nameFull": "Đông Ngô",
      "color": "#0f766e",
      "bonus": {
        "food": 1.0,
        "silver": 1.0,
        "gold": 1.1,
        "exp": 1.05
      },
      "starterGeneralIds": [
        "chengpu",
        "handang",
        "zhouzhi"
      ],
      "desc": "Thủy chiến · lợi vàng · hỏa công (mở dần theo tiến trình)"
    },
    "yellow": {
      "id": "yellow",
      "name": "Khăn Vàng",
      "playable": false,
      "color": "#ca8a04",
      "desc": "NPC — loạn khởi 184"
    },
    "dongzhuo": {
      "id": "dongzhuo",
      "name": "Đổng Trác",
      "playable": false,
      "color": "#7f1d1d",
      "desc": "NPC — loạn Trác"
    },
    "yuan": {
      "id": "yuan",
      "name": "Viên",
      "playable": false,
      "color": "#a16207",
      "desc": "NPC — Viên Thiệu / Viên Thuật"
    },
    "other": {
      "id": "other",
      "name": "Chư hầu",
      "playable": false,
      "color": "#78716c",
      "desc": "NPC / generic / chư hầu khác"
    }
  },
  "playable": [
    "shu",
    "wei",
    "wu"
  ]
},
"skills": {
  "schemaVersion": 2,
  "damageTypes": {
    "physical": {
      "id": "physical",
      "name": "Vật lý",
      "stat": "vuLuc"
    },
    "strategy": {
      "id": "strategy",
      "name": "Mưu lược",
      "stat": "triLuc"
    }
  },
  "targetPatterns": {
    "single": "Một mục tiêu",
    "row": "Cả hàng ngang",
    "column": "Cả cột dọc",
    "all": "Toàn quân địch",
    "self": "Bản thân",
    "ally_all": "Toàn quân ta",
    "front_row": "Hàng trước địch"
  },
  "skills": {
    "basic_strike": {
      "id": "basic_strike",
      "name": "Mãnh Kích",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.5,
      "moraleCost": 100,
      "fx": {
        "flash": "white",
        "text": "MẠNH KÍCH"
      },
      "desc": "Chiến pháp vật lý cơ bản."
    },
    "basic_scheme": {
      "id": "basic_scheme",
      "name": "Kỳ Mưu",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.5,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "KỲ MƯU"
      },
      "desc": "Chiến pháp mưu lược cơ bản."
    },
    "wu_sheng": {
      "id": "wu_sheng",
      "name": "Vũ Thánh",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_red",
        "text": "VŨ THÁNH"
      },
      "desc": "Chém thẳng hàng dọc địch."
    },
    "gam_thet": {
      "id": "gam_thet",
      "name": "Gầm Thét",
      "damageType": "physical",
      "pattern": "front_row",
      "power": 1.25,
      "moraleCost": 100,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ],
      "fx": {
        "flash": "brown",
        "text": "GẦM THÉT"
      },
      "desc": "Gầm thét hàng trước, tỷ lệ Choáng."
    },
    "long_dam": {
      "id": "long_dam",
      "name": "Long Đảm",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.1,
      "moraleCost": 100,
      "fx": {
        "flash": "white_blue",
        "text": "LONG ĐẢM"
      },
      "desc": "Đâm một mục tiêu chí mạng."
    },
    "khong_thanh": {
      "id": "khong_thanh",
      "name": "Không Thành",
      "damageType": "strategy",
      "pattern": "all",
      "power": 0.95,
      "moraleCost": 100,
      "effects": [
        {
          "type": "def_down",
          "value": 0.15,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "cyan",
        "text": "KHÔNG THÀNH"
      },
      "desc": "Giảm phòng toàn quân địch + dame Trí lực."
    },
    "ho_khi": {
      "id": "ho_khi",
      "name": "Hổ Khí",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 0,
      "moraleCost": 100,
      "effects": [
        {
          "type": "morale_boost",
          "value": 35
        },
        {
          "type": "atk_up",
          "value": 0.2,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "orange",
        "text": "HỔ KHÍ"
      },
      "desc": "Buff sĩ khí và tấn công phe ta."
    },
    "hoa_cong": {
      "id": "hoa_cong",
      "name": "Hỏa Công",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.45,
      "moraleCost": 100,
      "effects": [
        {
          "type": "burn",
          "value": 0.08,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "red_fire",
        "text": "HỎA CÔNG"
      },
      "desc": "Thiêu một hàng địch."
    },
    "an_muu": {
      "id": "an_muu",
      "name": "Ẩn Mưu",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.8,
      "moraleCost": 100,
      "effects": [
        {
          "type": "silence",
          "chance": 0.4,
          "duration": 1
        }
      ],
      "fx": {
        "flash": "purple",
        "text": "ẨN MƯU"
      },
      "desc": "Đòn mưu + tỷ lệ Câm lặng."
    },
    "bach_bo": {
      "id": "bach_bo",
      "name": "Bách Bộ Xuyên Dương",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.9,
      "moraleCost": 100,
      "critBonus": 0.35,
      "fx": {
        "flash": "yellow",
        "text": "BÁCH BỘ"
      },
      "desc": "Bắn tỉa, tăng Crit."
    },
    "tay_luong": {
      "id": "tay_luong",
      "name": "Tây Lương Thiết Kỵ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.4,
      "moraleCost": 100,
      "fx": {
        "flash": "silver",
        "text": "THIẾT KỴ"
      },
      "desc": "Xung phong hàng dọc."
    },
    "co_chien": {
      "id": "co_chien",
      "name": "Cổ Chiến",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.7,
      "moraleCost": 100,
      "effects": [
        {
          "type": "self_def_up",
          "value": 0.25,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "iron",
        "text": "CỔ CHIẾN"
      },
      "desc": "Đánh mạnh + tăng phòng bản thân."
    },
    "ho_si": {
      "id": "ho_si",
      "name": "Hổ Si",
      "damageType": "physical",
      "pattern": "front_row",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "brown",
        "text": "HỔ SI"
      },
      "desc": "Đập hàng trước."
    },
    "dong_ngo": {
      "id": "dong_ngo",
      "name": "Đông Ngô Bá Nghiệp",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 0,
      "moraleCost": 100,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12
        },
        {
          "type": "tonglinh_up",
          "value": 0.15,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "teal",
        "text": "ĐÔNG NGÔ"
      },
      "desc": "Hồi máu nhẹ + tăng Thống lĩnh."
    },
    "doc_muu": {
      "id": "doc_muu",
      "name": "Độc Mưu",
      "damageType": "strategy",
      "pattern": "all",
      "power": 0.85,
      "moraleCost": 100,
      "effects": [
        {
          "type": "poison",
          "value": 0.1,
          "duration": 3
        }
      ],
      "fx": {
        "flash": "green_poison",
        "text": "ĐỘC MƯU"
      },
      "desc": "Gieo độc toàn quân địch."
    },
    "phung_so": {
      "id": "phung_so",
      "name": "Phụng Sồ",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "violet",
        "text": "PHỤNG SỒ"
      },
      "desc": "Mưu kế đánh cả hàng."
    },
    "lua_luc": {
      "id": "lua_luc",
      "name": "Lửa Lục",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.15,
      "moraleCost": 100,
      "effects": [
        {
          "type": "burn",
          "value": 0.06,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "fire_green",
        "text": "LỬA LỤC"
      },
      "desc": "Hỏa công diện rộng."
    },
    "phan_cot": {
      "id": "phan_cot",
      "name": "Phản Cốt",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.6,
      "moraleCost": 100,
      "effects": [
        {
          "type": "atk_up",
          "value": 0.3,
          "duration": 2,
          "self": true
        }
      ],
      "fx": {
        "flash": "dark_red",
        "text": "PHẢN CỐT"
      },
      "desc": "Đòn mạnh + tăng công bản thân."
    },
    "nhan_duc": {
      "id": "nhan_duc",
      "name": "Nhân Đức",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 0,
      "moraleCost": 100,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.15
        },
        {
          "type": "morale_boost",
          "value": 25
        }
      ],
      "fx": {
        "flash": "gold_soft",
        "text": "NHÂN ĐỨC"
      },
      "desc": "Hồi máu + sĩ khí phe ta."
    },
    "huang_tian": {
      "id": "huang_tian",
      "name": "Hoàng Thiên Đương Lập",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.3,
      "moraleCost": 100,
      "effects": [
        {
          "type": "atk_down",
          "value": 0.12,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "yellow_cult",
        "text": "HOÀNG THIÊN"
      },
      "desc": "Tà thuật Khăn Vàng."
    },
    "hoa_hung_slash": {
      "id": "hoa_hung_slash",
      "name": "Hổ Lao Trảm",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "red",
        "text": "HỔ LAO"
      },
      "desc": "Chém mạnh một tướng."
    },
    "lu_bu_fury": {
      "id": "lu_bu_fury",
      "name": "Phong Hầu Nộ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "crimson",
        "text": "PHONG HẦU"
      },
      "desc": "Xung kích hàng dọc tối thượng."
    },
    "xiaoyaojin": {
      "id": "xiaoyaojin",
      "name": "Tiêu Dao Tân",
      "damageType": "physical",
      "pattern": "front_row",
      "power": 1.5,
      "moraleCost": 100,
      "effects": [
        {
          "type": "atk_down",
          "value": 0.1,
          "duration": 1
        }
      ],
      "fx": {
        "flash": "steel",
        "text": "TIÊU DAO TÂN"
      },
      "desc": "Tập kích hàng trước — Trương Liêu."
    },
    "shui_jian": {
      "id": "shui_jian",
      "name": "Thủy Chiến",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.3,
      "moraleCost": 100,
      "fx": {
        "flash": "blue_water",
        "text": "THỦY CHIẾN"
      },
      "desc": "Đòn hàng ngang kiểu Giang Đông."
    },
    "bailian": {
      "id": "bailian",
      "name": "Bạch Mã Nghĩa Tòng",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.45,
      "moraleCost": 100,
      "fx": {
        "flash": "white",
        "text": "BẠCH MÃ"
      },
      "desc": "Kỵ binh Bạch Mã xung phong."
    },
    "lianhuan": {
      "id": "lianhuan",
      "name": "Liên Hoàn Kế",
      "damageType": "strategy",
      "pattern": "all",
      "power": 0.7,
      "moraleCost": 100,
      "effects": [
        {
          "type": "def_down",
          "value": 0.2,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "chain",
        "text": "LIÊN HOÀN"
      },
      "desc": "Giảm phòng diện rộng."
    },
    "bagua_zhen": {
      "id": "bagua_zhen",
      "name": "Bát Quái Trận",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.15,
      "moraleCost": 100,
      "effects": [
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        },
        {
          "type": "atk_down",
          "value": 0.08,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "bagua",
        "text": "BÁT QUÁI TRẬN"
      },
      "desc": "Triệu hồi trận đồ Âm Dương, sát thương toàn quân + giảm công/thủ."
    },
    "thien_hoa": {
      "id": "thien_hoa",
      "name": "Thiên Hỏa",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.6,
      "moraleCost": 100,
      "effects": [
        {
          "type": "burn",
          "value": 0.1,
          "duration": 3
        }
      ],
      "fx": {
        "flash": "fire_rain",
        "text": "THIÊN HỎA"
      },
      "desc": "Mưa lửa từ trời thiêu cả hàng địch."
    },
    "long_nu": {
      "id": "long_nu",
      "name": "Long Nỗ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "critBonus": 0.15,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "LONG NỖ"
      },
      "desc": "Nỏ rồng xuyên thủng cả cột địch, tăng chí mạng."
    },
    "phong_van": {
      "id": "phong_van",
      "name": "Phong Vân Biến",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 0,
      "moraleCost": 100,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40
        },
        {
          "type": "heal_pct",
          "value": 0.1
        },
        {
          "type": "atk_up",
          "value": 0.15,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "wind",
        "text": "PHONG VÂN"
      },
      "desc": "Gió mây đổi hướng — hồi máu, sĩ khí và công phe ta."
    },
    "sam_set": {
      "id": "sam_set",
      "name": "Lôi Kích",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "effects": [
        {
          "type": "stun",
          "chance": 0.45,
          "duration": 1
        }
      ],
      "fx": {
        "flash": "thunder",
        "text": "LÔI KÍCH"
      },
      "desc": "Sét đánh một mục tiêu, tỷ lệ Choáng."
    },
    "hoa_long": {
      "id": "hoa_long",
      "name": "Hỏa Long",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.85,
      "moraleCost": 100,
      "effects": [
        {
          "type": "burn",
          "value": 0.08,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "dragon",
        "text": "HỎA LONG",
        "motif": "dragon"
      },
      "desc": "Hỏa long thiêu cột địch — [Thiêu đốt] (wiki hiệu ứng)."
    },
    "doc_xa": {
      "id": "doc_xa",
      "name": "Độc Xà",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.2,
      "moraleCost": 100,
      "effects": [
        {
          "type": "poison",
          "value": 0.12,
          "duration": 3
        },
        {
          "type": "atk_down",
          "value": 0.1,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "snake",
        "text": "ĐỘC XÀ"
      },
      "desc": "Rắn độc — [Trúng độc] + giảm công (wiki hiệu ứng)."
    },
    "basic_strike_chien": {
      "id": "basic_strike_chien",
      "name": "Mãnh Kích · Chiến",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.7,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "MẠNH KÍCH"
      },
      "desc": "Chiến pháp vật lý — bậc Chiến."
    },
    "basic_strike_than": {
      "id": "basic_strike_than",
      "name": "Mãnh Kích · Thần",
      "damageType": "physical",
      "pattern": "front_row",
      "power": 1.45,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_red",
        "text": "MẠNH KÍCH"
      },
      "desc": "Chiến pháp vật lý — bậc Thần, quét hàng trước."
    },
    "basic_strike_legend": {
      "id": "basic_strike_legend",
      "name": "Mãnh Kích · Truyền thuyết",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "crimson",
        "text": "MẠNH KÍCH"
      },
      "desc": "Chiến pháp vật lý — Truyền thuyết, hàng dọc."
    },
    "basic_strike_king": {
      "id": "basic_strike_king",
      "name": "Mãnh Kích · Thần Hoàng",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.35,
      "hits": 2,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "MẠNH KÍCH·HOÀNG"
      },
      "desc": "Chiến pháp vật lý tối thượng — 2 nhịp hàng dọc."
    },
    "basic_scheme_chien": {
      "id": "basic_scheme_chien",
      "name": "Kỳ Mưu · Chiến",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.7,
      "moraleCost": 100,
      "fx": {
        "flash": "cyan",
        "text": "KỲ MƯU"
      },
      "desc": "Chiến pháp mưu — bậc Chiến."
    },
    "basic_scheme_than": {
      "id": "basic_scheme_than",
      "name": "Kỳ Mưu · Thần",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "bagua",
        "text": "KỲ MƯU"
      },
      "desc": "Chiến pháp mưu — bậc Thần, hàng ngang."
    },
    "basic_scheme_legend": {
      "id": "basic_scheme_legend",
      "name": "Kỳ Mưu · Truyền thuyết",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.5,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "KỲ MƯU"
      },
      "desc": "Chiến pháp mưu — Truyền thuyết, hàng dọc."
    },
    "basic_scheme_king": {
      "id": "basic_scheme_king",
      "name": "Kỳ Mưu · Thần Hoàng",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.15,
      "hits": 2,
      "moraleCost": 100,
      "fx": {
        "flash": "bagua",
        "text": "KỲ MƯU·HOÀNG"
      },
      "desc": "Chiến pháp mưu tối thượng — 2 nhịp toàn quân."
    },
    "tl_thuong": {
      "id": "tl_thuong",
      "name": "Hổ Xung",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.55,
      "moraleCost": 100,
      "effects": [
        {
          "type": "silence",
          "chance": 0.4,
          "duration": 2
        },
        {
          "type": "morale_boost",
          "target": "self",
          "value": 45
        }
      ],
      "fx": {
        "flash": "steel",
        "text": "HỔ XUNG"
      },
      "desc": "Wiki Thường — 1 địch pháp công, tỷ lệ Tỏa Binh, hồi sĩ khí."
    },
    "tl_chien": {
      "id": "tl_chien",
      "name": "Hổ Xung · Chiến",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.45,
      "moraleCost": 100,
      "effects": [
        {
          "type": "silence",
          "chance": 0.4,
          "duration": 2
        },
        {
          "type": "morale_boost",
          "target": "self",
          "value": 45
        }
      ],
      "fx": {
        "flash": "steel",
        "text": "HỔ XUNG"
      },
      "desc": "Wiki Chiến — hàng dọc pháp công + Tỏa Binh."
    },
    "tl_than": {
      "id": "tl_than",
      "name": "Hổ Sát",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.65,
      "moraleCost": 100,
      "effects": [
        {
          "type": "silence",
          "chance": 0.55,
          "duration": 2
        },
        {
          "type": "morale_boost",
          "target": "self",
          "value": 45
        }
      ],
      "fx": {
        "flash": "crimson",
        "text": "HỔ SÁT"
      },
      "desc": "Wiki Thần — hàng dọc mạnh hơn, Tỏa Binh cao."
    },
    "tl_truyen": {
      "id": "tl_truyen",
      "name": "Hổ Sát · Truyền thuyết",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.9,
      "moraleCost": 100,
      "effects": [
        {
          "type": "silence",
          "chance": 0.8,
          "duration": 2
        },
        {
          "type": "atk_down",
          "value": 0.12,
          "duration": 2
        },
        {
          "type": "morale_boost",
          "target": "self",
          "value": 45
        }
      ],
      "fx": {
        "flash": "gold_red",
        "text": "HỔ SÁT"
      },
      "desc": "Wiki Truyền thuyết — hàng dọc + Tỏa Binh / Huyết Cúc (atk_down)."
    },
    "tl_thanhoang": {
      "id": "tl_thanhoang",
      "name": "Lướt Nhanh Như Gió",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.55,
      "hits": 2,
      "moraleCost": 100,
      "effects": [
        {
          "type": "silence",
          "chance": 0.8,
          "duration": 2
        },
        {
          "type": "atk_down",
          "value": 0.15,
          "duration": 2
        },
        {
          "type": "morale_boost",
          "target": "self",
          "value": 45
        }
      ],
      "fx": {
        "flash": "fire_rain",
        "text": "LƯỚT NHƯ GIÓ"
      },
      "desc": "Wiki Thần Hoàng — 2 nhịp pháp công hàng dọc."
    },
    "wu_sheng_chien": {
      "id": "wu_sheng_chien",
      "name": "Vũ Thánh · Chiến",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.7,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_red",
        "text": "VŨ THÁNH"
      },
      "desc": "Quan Vũ — bậc Chiến."
    },
    "wu_sheng_legend": {
      "id": "wu_sheng_legend",
      "name": "Vũ Thánh · Truyền thuyết",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "crimson",
        "text": "VŨ THÁNH"
      },
      "desc": "Quan Vũ — Truyền thuyết."
    },
    "wu_sheng_king": {
      "id": "wu_sheng_king",
      "name": "Vũ Thánh · Thần Hoàng",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.5,
      "hits": 2,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "VŨ THÁNH·HOÀNG"
      },
      "desc": "Quan Vũ — Thần Hoàng, 2 nhịp."
    },
    "gam_thet_legend": {
      "id": "gam_thet_legend",
      "name": "Gầm Thét · Truyền thuyết",
      "damageType": "physical",
      "pattern": "front_row",
      "power": 1.45,
      "moraleCost": 100,
      "effects": [
        {
          "type": "stun",
          "chance": 0.7,
          "duration": 1
        }
      ],
      "fx": {
        "flash": "brown",
        "text": "GẦM THÉT"
      },
      "desc": "Trương Phi — Truyền thuyết."
    },
    "gam_thet_king": {
      "id": "gam_thet_king",
      "name": "Gầm Thét · Thần Hoàng",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.2,
      "moraleCost": 100,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ],
      "fx": {
        "flash": "thunder",
        "text": "GẦM THÉT·HOÀNG"
      },
      "desc": "Trương Phi — Thần Hoàng, gầm toàn quân."
    },
    "khong_thanh_legend": {
      "id": "khong_thanh_legend",
      "name": "Không Thành · Truyền thuyết",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.15,
      "moraleCost": 100,
      "effects": [
        {
          "type": "def_down",
          "value": 0.2,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "bagua",
        "text": "KHÔNG THÀNH"
      },
      "desc": "Gia Cát — Truyền thuyết."
    },
    "khong_thanh_king": {
      "id": "khong_thanh_king",
      "name": "Không Thành · Thần Hoàng",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "hits": 2,
      "moraleCost": 100,
      "effects": [
        {
          "type": "def_down",
          "value": 0.25,
          "duration": 2
        }
      ],
      "fx": {
        "flash": "bagua",
        "text": "KHÔNG THÀNH·HOÀNG"
      },
      "desc": "Gia Cát — Thần Hoàng, 2 nhịp."
    },
    "hieu_lenh": {
      "id": "hieu_lenh",
      "name": "Hiệu Lệnh",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HIỆU LỆNH",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Toàn phe địch giảm 15 sĩ khí, toàn phe ta hồi 55 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "thien_menh": {
      "id": "thien_menh",
      "name": "Thiên Mệnh",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.45,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIÊN MỆNH",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta hồi 75 sĩ khí, toàn phe địch giảm 15 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "thien_chinh": {
      "id": "thien_chinh",
      "name": "Thiên Chinh",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIÊN CHINH",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta hồi 85+{6} sĩ khí, toàn phe địch giảm 20 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "quan_lam": {
      "id": "quan_lam",
      "name": "Quân Lâm",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "QUÂN LÂM",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Tòng Long] (Khi chiến đấu với người chơi khác, sát thương tăng 12%), duy trì 2 lượt, tướng khác của phe ta hồi 85+{6} sĩ khí, toàn phe địch giảm 20 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "thien_ha_chia_ba": {
      "id": "thien_ha_chia_ba",
      "name": "Thiên Hạ Chia Ba",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIÊN HẠ CHIA BA",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta tăng 85+{6} sĩ khí, giảm 20 sĩ khí toàn phe địch, toàn phe ta nhận [Tòng Long], duy trì 2 lượt (Khi chiến đấu với người chơi khác, sát thương tăng 15%).",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero"
    },
    "yen_nguyet": {
      "id": "yen_nguyet",
      "name": "Yển Nguyệt",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "YỂN NGUYỆT",
        "motif": "shadow"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 230% Pháp Công, mục tiêu bị [Ám Tế], duy trì 3 lượt, bản thân nhận [Phản Kích], duy trì 2 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "thanh_long": {
      "id": "thanh_long",
      "name": "Thanh Long",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "THANH LONG",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 267% Pháp Công, khiến 1 kẻ địch bị [Ám Tế], duy trì 3 lượt, bản thân nhận [Phản Kích], duy trì 3 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "vo_thanh": {
      "id": "vo_thanh",
      "name": "Võ Thánh",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "VÕ THÁNH",
        "motif": "shadow"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 500% sát thương vật lý, khiến 1 kẻ địch bị [Ám Tế], duy trì 3 lượt, Vật Công của bản thân tăng 100%, duy trì 3 lượt, bản thân nhận [Phục Thù], [Kích Nộ], duy trì 3 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "thanh_long_tram": {
      "id": "thanh_long_tram",
      "name": "Thanh Long Trảm",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "THANH LONG TRẢM",
        "motif": "dragon"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 160% sát thương vật lý, khiến 1 kẻ địch bị [Ám Tế], duy trì 3 lượt. Bản thân nhận [Nghĩa Tuyệt] không thể giải trừ, duy trì đến khi kết thúc chiến đấu. Bản thân nhận [Hấp Huyết], [Kiên Thủ], duy trì 3 lượt. (Khi chiến đấu với người chơi khác, khôn",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "thanh_long_yen_nguyet": {
      "id": "thanh_long_yen_nguyet",
      "name": "Thanh Long Yển Nguyệt",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "THANH LONG YỂN NGU",
        "motif": "dragon"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 500% sát thương vật lý, khiến 1 kẻ địch bị [Ám Tế], duy trì 3 lượt. Bản thân nhận [Nghĩa Tuyệt], duy trì đến khi kết thúc chiến đấu. Bản thân nhận [Hấp Huyết] và [Kiên Thủ] không thể giải trừ, duy trì 3 lượt. (Khi chiến đấu với người chơi khác, kh",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "thien_ly_don_ky": {
      "id": "thien_ly_don_ky",
      "name": "Thiên Lý Đơn Kỵ",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "THIÊN LÝ ĐƠN KỴ",
        "motif": "shadow"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 300% sát thương vật lý, khiến 1 kẻ địch bị [Ám Tế], duy trì 3 lượt. Bản thân vào trạng thái [Nghĩa Tuyệt], duy trì đến khi kết thúc chiến đấu. Bản thân vào trạng thái [Hấp Huyết], nhận hiệu quả [Kiên Thủ] không thể giải trừ, duy trì 3 lượt.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "uy_chan_hoa_ha": {
      "id": "uy_chan_hoa_ha",
      "name": "Uy Chấn Hoa Hạ",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "UY CHẤN HOA HẠ",
        "motif": "shadow"
      },
      "desc": "[Thường] Khiến bản thân rơi vào trạng thái [Nghĩa Tuyệt] không thể giải trừ, duy trì đến khi kết thúc chiến đấu, sau đó gây 300% sát thương vật lý cho địch trên hàng dọc, khiến địch trên hàng dọc vào trạng thái [Ám Tế], duy trì 3 lượt, bản thân vào trạng thái [Hấp Huyết] và [Kiên",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "no_sat": {
      "id": "no_sat",
      "name": "Nộ Sát",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.26,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NỘ SÁT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 126% Pháp Công, giảm 100 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "bao_hao": {
      "id": "bao_hao",
      "name": "Bào Hao",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.78,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BÀO HAO",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 178% Pháp Công, giảm 120 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "manh_ho": {
      "id": "manh_ho",
      "name": "Mãnh Hổ",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "MÃNH HỔ",
        "motif": "tiger"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 300% Pháp Công, giảm 150+{2} sĩ khí, sĩ khí mục tiêu càng cao sát thương càng cao.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "ho_khieu": {
      "id": "ho_khieu",
      "name": "Hổ Khiếu",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "HỔ KHIẾU",
        "motif": "tiger"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2000% Pháp Công, giảm 150+{2} sĩ khí, gây giảm càng nhiều sĩ khí sát thương càng cao, địch trên hàng dọc chịu 2000% Pháp Công, sĩ khí mục tiêu càng thấp sát thương càng cao, nếu địch trước mặt có [Nguyệt Hồn], sẽ gây Hỗn Loạn, không thể hành động,",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "van_nguoi_kho_do": {
      "id": "van_nguoi_kho_do",
      "name": "Vạn Người Khó Đỡ",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "VẠN NGƯỜI KHÓ ĐỠ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho địch hàng thẳng 4000% Pháp Công và giảm 150+{2} Sĩ Khí, Sĩ Khí giảm càng nhiều, ST càng cao, và gây thêm cho địch hàng thẳng 6800% Pháp Công, Sĩ Khí mục tiêu càng thấp, ST càng cao, nếu cá nhân địch phía trước có [Nguyệt Hồn] sẽ rơi vào Hỗn Loạn, không thể hành đ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "ba_vuong_kich_dinh": {
      "id": "ba_vuong_kich_dinh",
      "name": "Bá Vương Kích Đỉnh",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BÁ VƯƠNG KÍCH ĐỈNH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho địch hàng thẳng 16500% Pháp Công và giảm 150+{2} Sĩ Khí, Sĩ Khí giảm càng nhiều, ST càng cao, và gây thêm cho địch hàng thẳng 21500% Pháp Công, Sĩ Khí mục tiêu càng thấp, ST càng cao, nếu cá nhân địch phía trước có [Nguyệt Hồn] hoặc [Nguyệt Huy] sẽ rơi vào Hỗn Lo",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "manh_ho_liet_son": {
      "id": "manh_ho_liet_son",
      "name": "Mãnh Hổ Liệt Sơn",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "MÃNH HỔ LIỆT SƠN",
        "motif": "tiger"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 32500% Pháp Côngvà giảm 150+{2} sĩ khí, sĩ khí giảm càng nhiều sát thương càng cao. Sau đó khiến địch trên hàng dọc chịu 41000% Pháp Công, sĩ khí mục tiêu càng thấp sát thương càng cao. Nếu địch trên hàng dọc mang hiệu quả [Nguyệt Hồn] hoặc [Nguyệ",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "don_ky": {
      "id": "don_ky",
      "name": "Đơn Kỵ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ĐƠN KỴ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 160% Pháp Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "than_phong": {
      "id": "than_phong",
      "name": "Thần Phong",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "THẦN PHONG",
        "motif": "whirlwind"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 255% Pháp Công, Pháp Phòng của mục tiêu giảm 25%, duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "bach_long": {
      "id": "bach_long",
      "name": "Bạch Long",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "BẠCH LONG",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 400% Pháp Công, sĩ khí mục tiêu càng cao sát thương càng cao, Pháp Phòng của mục tiêu giảm 40%, duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "ngan_long": {
      "id": "ngan_long",
      "name": "Ngân Long",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "NGÂN LONG",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2200% Pháp Công, sĩ khí mục tiêu càng cao sát thương càng cao, khiến Pháp Phòng của mục tiêu giảm 40%, duy trì 2 lượt. Bản thân nhận [Anh Dũng], duy trì 3 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "ngan_long_tuong": {
      "id": "ngan_long_tuong",
      "name": "Ngân Long Tường",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "NGÂN LONG TƯỜNG",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 4500% Pháp Công, sĩ khí mục tiêu càng cao sát thương càng cao, Pháp Phòng của mục tiêu giảm 40%, duy trì 2 lượt, bản thân nhận [Anh Dũng], duy trì 3 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "ngan_long_that_thiem": {
      "id": "ngan_long_that_thiem",
      "name": "Ngân Long Thất Thiểm",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "NGÂN LONG THẤT THI",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Khiến Pháp Phòng của địch trên hàng dọc giảm 40%, duy trì 2 lượt, sau đó khiến mục tiêu chịu 14000% Pháp Công, sĩ khí mục tiêu càng cao sát thương càng cao. Bản thân nhận [Anh Dũng], duy trì 3 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "thien_long_thuc_tinh": {
      "id": "thien_long_thuc_tinh",
      "name": "Thiên Long Thức Tỉnh",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "THIÊN LONG THỨC TỈ",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Khiến Pháp Phòng của địch trên hàng dọc giảm 40%, duy trì 2 lượt, sau đó khiến mục tiêu chịu 29500% Pháp Công, sĩ khí mục tiêu càng cao sát thương càng cao. Bản thân nhận [Bá Chủ 2] [Võ Dũng 2], duy trì 3 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "dong_phong": {
      "id": "dong_phong",
      "name": "Đông Phong",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.32,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "ĐÔNG PHONG",
        "motif": "whirlwind"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 132% Mưu Công, toàn phe ta hồi 25 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "phuc_long": {
      "id": "phuc_long",
      "name": "Phục Long",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.93,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "PHỤC LONG",
        "motif": "dragon"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 193% Mưu Công, giảm 10 sĩ khí, toàn phe ta hồi 25 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "than_toan": {
      "id": "than_toan",
      "name": "Thần Toán",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THẦN TOÁN",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 255% Mưu Công, giảm 25 sĩ khí, bản thân nhận [Nguyệt Hồn], duy trì 2 lượt, toàn phe ta hồi 25 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "bat_tran_do": {
      "id": "bat_tran_do",
      "name": "Bát Trận Đồ",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "bagua",
        "text": "BÁT TRẬN ĐỒ",
        "motif": "bagua"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 2600% Mưu Công, giảm 25 sĩ khí, bản thân và đơn vị lính nhiều nhất phe ta nhận [Nguyệt Hồn], duy trì 2 lượt, Mưu Công của bản thân tăng 60%, duy trì 2 lượt, mục tiêu lính ít nhất phe ta nhận [Bát Quái], duy trì 2 lượt, toàn phe ta hồi 25+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "thien_dia_van_tuong": {
      "id": "thien_dia_van_tuong",
      "name": "Thiên Địa Vạn Tượng",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "bagua",
        "text": "THIÊN ĐỊA VẠN TƯỢN",
        "motif": "bagua"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 2 lần 5000% Mưu Công, giảm 30 sĩ khí, bản thân và đồng đội lính nhiều nhất nhận [Nguyệt Hồn], các tướng khác trong phe ta nhận [Thiên Tượng] (Khi chiến đấu với người chơi khác sẽ giảm hiệu quả), tướng lính ít nhất phe ta nhận [Bát Quái]. Tất cả hiệu q",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "ky_mon_bat_tran_do": {
      "id": "ky_mon_bat_tran_do",
      "name": "Kỳ Môn Bát Trận Đồ",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "bagua",
        "text": "KỲ MÔN BÁT TRẬN ĐỒ",
        "motif": "bagua"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 2 lần 10800% Mưu Công, giảm 30 sĩ khí. Bản thân và đồng đội lính nhiều nhất nhận [Nguyệt Hồn], các đồng đội khác nhận [Thiên Tượng] (Khi chiến đấu với người chơi khác sẽ giảm hiệu quả). Bản thân và đồng đội lính ít nhất nhận [Bát Quái]. Tất cả hiệu qu",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "loi_tien": {
      "id": "loi_tien",
      "name": "Lôi Tiễn",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "LÔI TIỄN",
        "motif": "thunder"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 160% Pháp Công, bản thân nhận [Hội Tâm], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "liet_thi": {
      "id": "liet_thi",
      "name": "Liệt Thỉ",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LIỆT THỈ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 245% Pháp Công, bản thân nhận [Hội Tâm], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "nghe_xa": {
      "id": "nghe_xa",
      "name": "Nghệ Xạ",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NGHỆ XẠ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 460% Pháp Công, sĩ khí mục tiêu càng cao sát thương càng cao, bản thân nhận [Hội Tâm], duy trì 2 lượt, bản thân nhận [Nguyệt Hồn], duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "truy_nguyet": {
      "id": "truy_nguyet",
      "name": "Truy Nguyệt",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TRUY NGUYỆT",
        "motif": "slash"
      },
      "desc": "[Thường] Khiến đơn vị địch lính ít nhất chịu 2300% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao, bản thân nhận [Hội Tâm], [Anh Dũng], duy trì 3 lượt. Nếu diệt được mục tiêu, hồi 500 sĩ khí, nếu không sẽ khiến mục tiêu bị Hư Nhược, không thể nhận hiệu quả có lợi tr",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "bach_ly_truy_hon": {
      "id": "bach_ly_truy_hon",
      "name": "Bách Lý Truy Hồn",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BÁCH LÝ TRUY HỒN",
        "motif": "slash"
      },
      "desc": "[Thường] Tấn công mục tiêu địch Lính ít nhất, Lính càng ít sát thương càng cao. Nếu diệt được mục tiêu sẽ hồi 500 sĩ khí, nếu không sẽ khiến địch Hư Nhược trong 5 lượt, bản thân hồi 145 sĩ khí và nhận hiệu quả Hội Tâm và Anh Dũng trong 3 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "lac_nhat_than_tien": {
      "id": "lac_nhat_than_tien",
      "name": "Lạc Nhật Thần Tiễn",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LẠC NHẬT THẦN TIỄN",
        "motif": "slash"
      },
      "desc": "[Thường] Khiến đơn vị địch lính ít nhất chịu 17000% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao, bản thân nhận [Hội Tâm], [Anh Dũng], duy trì 3 lượt. Nếu diệt được mục tiêu, sẽ hồi 500 sĩ khí; nếu không, sẽ khiến mục tiêu bị [Hư Nhược] không thể giải trừ, duy trì",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "xich_vu_quan_hong": {
      "id": "xich_vu_quan_hong",
      "name": "Xích Vũ Quán Hồng",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "XÍCH VŨ QUÁN HỒNG",
        "motif": "fire"
      },
      "desc": "[Thường] Khiến tướng địch lính ít nhất chịu 30800% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Hội Tâm], [Anh Dũng], duy trì 3 lượt. Nếu đánh bại mục tiêu, bản thân hồi 700 sĩ khí. Nếu không, khiến mục tiêu bị [Hư Nhược] không thể giải trừ, duy tr",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "pha_quan": {
      "id": "pha_quan",
      "name": "Phá Quân",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "PHÁ QUÂN",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 135% Pháp Công. Bản thân hồi 145 sĩ khí. Bản thân nhận trị liệu (Mức trị liệu bằng 90% Mưu Công).",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thi_quan": {
      "id": "thi_quan",
      "name": "Thí Quân",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THÍ QUÂN",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 175% Pháp Công. Bản thân nhận trị liệu (Mức trị liệu bằng 90% Mưu Công). Bản thân nhận [Thủ Hộ], duy trì 2 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ky_than": {
      "id": "ky_than",
      "name": "Kỵ Thần",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "KỴ THẦN",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 400% Pháp Công. Bản thân nhận trị liệu 2 lần (Mức trị liệu lần lượt bằng 30% và 10% Pháp Công). Bản thân nhận [Thủ Hộ], duy trì 2 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "phong_loi": {
      "id": "phong_loi",
      "name": "Phong Lôi",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "PHONG LÔI",
        "motif": "whirlwind"
      },
      "desc": "[C.Pháp] Tấn công 500 sĩ khí, khiến địch trên hàng dọc chịu 2200% Pháp Công, 40% khiến mục tiêu bị [Tê Liệt], duy trì 3 lượt. Bản thân nhận [Thần Tốc], duy trì 3 lượt. Trị liệu đồng đội lính ít nhất 2 lần (Mức trị liệu lần lượt bằng 30% và 10% Pháp Công). Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bach_hong_quan_nhat": {
      "id": "bach_hong_quan_nhat",
      "name": "Bạch Hồng Quán Nhật",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "BẠCH HỒNG QUÁN NHẬ",
        "motif": "fire"
      },
      "desc": "[C.Pháp] Tấn công 500 sĩ khí, khiến địch trên hàng dọc chịu 2 lần 5400% Pháp Công, 40% khiến mục tiêu bị [Tê Liệt], duy trì 3 lượt. Bản thân nhận [Thần Tốc] và [Thủ Hộ], duy trì 3 lượt. Trị liệu tướng có lính ít nhất phe ta 2-3 lần (Mức trị liệu bằng 20% Pháp Công). Bản thân hồi ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "te_nhat_thien_ky": {
      "id": "te_nhat_thien_ky",
      "name": "Tế Nhật Thiên Kỵ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TẾ NHẬT THIÊN KỴ",
        "motif": "heal"
      },
      "desc": "[C.Pháp] tấn công 500 sĩ khí, khiến địch trên hàng dọc chịu 2 lần 10600% Pháp Công. Có 40% khiến mục tiêu bị [Tê Liệt], duy trì 3 lượt. Bản thân nhận [Thần Tốc] và [Thủ Hộ], duy trì 3 lượt. Trị liệu cho đồng đội lính ít nhất 3 lần (Mức trị liệu bằng 20% Pháp Công). Bản thân hồi 1",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tu_dien": {
      "id": "tu_dien",
      "name": "Tử Điện",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.4,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "TỬ ĐIỆN",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 4 lần sát thương, lần lượt là 140%, 120%, 80%, 60% Mưu Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "hits": 4
    },
    "than_loi": {
      "id": "than_loi",
      "name": "Thần Lôi",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.8,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "THẦN LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 4 lần sát thương, lần lượt là 180%, 160%, 120%, 100% Mưu Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "hits": 4
    },
    "loi_oanh": {
      "id": "loi_oanh",
      "name": "Lôi Oanh",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "LÔI OANH",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 5 lần sát thương, lần lượt là 220%, 209%, 198%, 181%, 165% Mưu Công, lính mục tiêu càng ít sát thương càng cao, mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "hits": 5
    },
    "cuu_thien_than_loi": {
      "id": "cuu_thien_than_loi",
      "name": "Cửu Thiên Thần Lôi",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "CỬU THIÊN THẦN LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Khiến đơn vị địch lính ít nhất chịu 5 lần 1200% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Khiến mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu. Nếu diệt được mục tiêu, bản thân hồi 500 sĩ khí. Nếu không, bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 5,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "diet_the_thien_loi": {
      "id": "diet_the_thien_loi",
      "name": "Diệt Thế Thiên Lôi",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "DIỆT THẾ THIÊN LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Khiến đơn vị địch lính ít nhất chịu 5 lần 3000% Mưu Công, lính mục tiêu càng ít sát thương càng cao, mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu. Nếu diệt được mục tiêu, bản thân hồi 500 sĩ khí, nếu không bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 5,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "kinh_thien_bao_loi": {
      "id": "kinh_thien_bao_loi",
      "name": "Kinh Thiên Bạo Lôi",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "KINH THIÊN BẠO LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Khiến đơn vị địch lính ít nhất chịu 5 lần 6500% Mưu Công, lính mục tiêu càng ít sát thương càng cao, khiến mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu. Nếu diệt được mục tiêu, bản thân hồi 500 sĩ khí, nếu không bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 5,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "cuu_tieu_than_loi": {
      "id": "cuu_tieu_than_loi",
      "name": "Cửu Tiêu Thần Lôi",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "CỬU TIÊU THẦN LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Khiến đơn vị địch lính ít nhất chịu 5 lần 12500% Mưu Công, lính mục tiêu càng ít sát thương càng cao, khiến mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu. Nếu diệt được mục tiêu, bản thân hồi 500 sĩ khí, nếu không bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 5,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hoanh_hoa": {
      "id": "hoanh_hoa",
      "name": "Hoành Họa",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.33,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HOÀNH HỌA",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 133% Pháp Công, 25% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "tau_sat": {
      "id": "tau_sat",
      "name": "Tấu Sát",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.9,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TẤU SÁT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 190% Pháp Công, mục tiêu bị [Đào Binh], duy trì 3 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "dang_long": {
      "id": "dang_long",
      "name": "Đằng Long",
      "damageType": "physical",
      "pattern": "row",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "ĐẰNG LONG",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 400% Pháp Công, Pháp Phòng của mục tiêu giảm 40%, duy trì 2 lượt, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "tinh_ngu": {
      "id": "tinh_ngu",
      "name": "Tinh Ngự",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TINH NGỰ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 2250% Pháp Công, Pháp Phòng của mục tiêu giảm 40%, duy trì 2 lượt, khiến toàn phe địch chịu 1350% Pháp Công, lần tấn công này 50% tính là sát thương 500 sĩ khí, bản thân hồi 50+{8} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "long_dang_tu_hai": {
      "id": "long_dang_tu_hai",
      "name": "Long Đằng Tứ Hải",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "LONG ĐẰNG TỨ HẢI",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 6300% Pháp Công, khiến Pháp Phòng của mục tiêu giảm 40%, duy trì 2 lượt. Tấn công 500 sĩ khí, khiến toàn phe địch chịu 3000% Pháp Công. Bản thân hồi 50+{8} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "troi_roi_sao_sang": {
      "id": "troi_roi_sao_sang",
      "name": "Trời Rơi Sao Sáng",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TRỜI RƠI SAO SÁNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 11000% Pháp Công, khiến Pháp Phòng của mục tiêu giảm 40%, duy trì 2 lượt. Tấn công 500 sĩ khí, khiến toàn phe địch chịu 5000% Pháp Công. Bản thân hồi 50+{8} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "tinh_van_dia_liep": {
      "id": "tinh_van_dia_liep",
      "name": "Tinh Vẫn Địa Liệp",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TINH VẪN ĐỊA LIỆP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 20500% Pháp Công, khiến Pháp Phòng của mục tiêu giảm 40%, duy trì 2 lượt. Tấn công 700 sĩ khí, khiến toàn phe địch chịu 9400% Pháp Công, bản thân hồi 75+{8} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "thu_kich": {
      "id": "thu_kich",
      "name": "Thư Kích",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THƯ KÍCH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 185% Pháp Công, bản thân nhận [Hội Tâm], duy trì 2 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "phan_kich": {
      "id": "phan_kich",
      "name": "Phản Kích",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHẢN KÍCH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 100% Pháp Công, bản thân nhận [Phản Kích], duy trì 2 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "nghich_chuyen": {
      "id": "nghich_chuyen",
      "name": "Nghịch Chuyển",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.4,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NGHỊCH CHUYỂN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 140% Pháp Công, bản thân nhận [Phản Kích], duy trì 1 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "bac_sat": {
      "id": "bac_sat",
      "name": "Bác Sát",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BÁC SÁT",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 400% sát thương vật lý, bản thân nhận [Phản Kích], duy trì 3 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "thanh_long_hon": {
      "id": "thanh_long_hon",
      "name": "Thanh Long Hồn",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "THANH LONG HỒN",
        "motif": "dragon"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 2400% sát thương vật lý, Vật Công của bản thân tăng 100%. Bản thân nhận [Phục Thù] không thể giải trừ, duy trì 3 lượt, toàn phe ta nhận [Bạch Nhẫn], duy trì 5 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "thanh_long_nguyen": {
      "id": "thanh_long_nguyen",
      "name": "Thanh Long Nguyện",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "THANH LONG NGUYỆN",
        "motif": "dragon"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 550% sát thương vật lý. Bản thân nhận [Nghĩa Tuyệt] không thể giải trừ, duy trì 3 lượt, toàn phe ta nhận [Bạch Nhẫn], duy trì 31 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero"
    },
    "thanh_long_khieu_nguyet": {
      "id": "thanh_long_khieu_nguyet",
      "name": "Thanh Long Khiếu Nguyệt",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "THANH LONG KHIẾU N",
        "motif": "dragon"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 550% sát thương vật lý, bản thân nhận hiệu quả [Nghĩa Tuyệt] [Thanh Long 2] không thể giải trừ (Mỗi tầng tăng 5% công phòng, tối đa cộng dồn 7 tầng), duy trì 3 lượt, toàn phe ta nhận [Bạch Nhẫn], duy trì 31 lượt.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero"
    },
    "ngu_giap": {
      "id": "ngu_giap",
      "name": "Ngự Giáp",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "NGỰ GIÁP",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Bản thân nhận trị liệu (Mức trị liệu bằng 11% Pháp Công). Toàn phe ta nhận [Thủ Hộ], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "than_ngu": {
      "id": "than_ngu",
      "name": "Thần Ngự",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THẦN NGỰ",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Thủ Hộ], duy trì 2 lượt, toàn phe ta nhận [Hồi Phục], duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "an_nghia": {
      "id": "an_nghia",
      "name": "Ân Nghĩa",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "ÂN NGHĨA",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Thủ Hộ], [Hồi Phục], duy trì 2 lượt, tướng khác của phe ta hồi 10+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "bac_vong": {
      "id": "bac_vong",
      "name": "Bắc Vọng",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "BẮC VỌNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách+Thường] Phát động 1 lần Mưu Công sát thương càng cao khi lính càng ít và 1 lần Vật Công sát thương càng cao khi lính càng ít cho mục tiêu có lính ít nhất phe địch, đội nhận ngẫu nhiên hiệu quả Đồn Điền 2 lượt, bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nghia_dam_hung_tam": {
      "id": "nghia_dam_hung_tam",
      "name": "Nghĩa Đảm Hùng Tâm",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "NGHĨA ĐẢM HÙNG TÂM",
        "motif": "arcane"
      },
      "desc": "[Kế+Thường] Khiến đơn vị địch lính ít nhất chịu 32000% Mưu Công và 32000% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao, khiến mục tiêu bị [Tàn Tạ], duy trì 31 lượt, đồng đội ngẫu nhiên nhận hiệu quả [Đồn Điền], duy trì 2 lượt, bản thân hồi 100 +{6} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "son_bang": {
      "id": "son_bang",
      "name": "Sơn Băng",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "SƠN BĂNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 90% Mưu Công, 25% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "thap_thien": {
      "id": "thap_thien",
      "name": "Tháp Thiên",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.5,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THÁP THIÊN",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 150% Mưu Công, 15% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "thien_bang": {
      "id": "thien_bang",
      "name": "Thiên Băng",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.0,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THIÊN BĂNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 200% Mưu Công, 30% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "liet_thien": {
      "id": "liet_thien",
      "name": "Liệt Thiên",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "LIỆT THIÊN",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 1300% Mưu Công, mục tiêu bị [Tan Vỡ], bản thân hồi 0+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thien_bang_dia_liep": {
      "id": "thien_bang_dia_liep",
      "name": "Thiên Băng Địa Liệp",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THIÊN BĂNG ĐỊA LIỆ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 6800% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Khiến mục tiêu bị [Tan Vỡ]. Bản thân hồi 0+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "troi_tru_dat_diet": {
      "id": "troi_tru_dat_diet",
      "name": "Trời Tru Đất Diệt",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "TRỜI TRU ĐẤT DIỆT",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 7000% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Khiến mục tiêu bị [Tan Vỡ] và [E Sợ], bản thân hồi 0+{4} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hu_vo": {
      "id": "hu_vo",
      "name": "Hư Vô",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "HƯ VÔ",
        "motif": "shadow"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 2 lần 48% Mưu Công, 22% khiến mục tiêu bị [Ám Tế], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "hac_dong": {
      "id": "hac_dong",
      "name": "Hắc Động",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.6,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "HẮC ĐỘNG",
        "motif": "shadow"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 160% Mưu Công, 22% khiến mục tiêu bị [Ám Tế], duy trì 1 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "tham_uyen": {
      "id": "tham_uyen",
      "name": "Thâm Uyên",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.1,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "THÂM UYÊN",
        "motif": "shadow"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 210% Mưu Công, 40% khiến mục tiêu bị [Ám Tế], duy trì 1 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "doc_dia": {
      "id": "doc_dia",
      "name": "Độc Địa",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "ĐỘC ĐỊA",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 1600% Mưu Công, sĩ khí mục tiêu càng thấp sát thương càng cao. Sau đó khiến toàn phe địch chịu 1600% Mưu Công, sĩ khí mục tiêu càng cao sát thương càng cao. 30% khiến mục tiêu bị [Ám Tế], duy trì 1 lượt. Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "loan_the_ky_muu": {
      "id": "loan_the_ky_muu",
      "name": "Loạn Thế Kỳ Mưu",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "LOẠN THẾ KỲ MƯU",
        "motif": "shadow"
      },
      "desc": "[Kế Sách] Gây 2 lần 7000% Mưu Công cho toàn bộ địch, lần 1, Sĩ Khí mục tiêu càng thấp thì sát thương càng cao, lần 2, Sĩ Khí mục tiêu càng cao sát thương càng cao, có 20% xác suất khiến mục tiêu rơi vào [Ám Tế], duy trì 1 lượt; gây ra 8000% Mưu Công và giảm 50 Sĩ Khí cho địch có ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thao_luoc_tung_hoanh": {
      "id": "thao_luoc_tung_hoanh",
      "name": "Thao Lược Tung Hoành",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "THAO LƯỢC TUNG HOÀ",
        "motif": "shadow"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 2 lần 8500% Mưu Công, lần 1 sĩ khí mục tiêu càng thấp sát thương càng cao, lần 2 sĩ khí mục tiêu càng cao sát thương càng cao. Có 20% khiến mục tiêu bị [Ám Tế], duy trì 1 lượt. Khiến tướng địch sĩ khí thấp nhất chịu 9600% Mưu Công, giảm 50 sĩ khí, sĩ ",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "muu_doan_can_khon": {
      "id": "muu_doan_can_khon",
      "name": "Mưu Đoạn Càn Khôn",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "MƯU ĐOẠN CÀN KHÔN",
        "motif": "shadow"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 2 lần 16500% Mưu Công, lần 1 sĩ khí mục tiêu càng thấp sát thương càng cao, lần 2 sĩ khí mục tiêu càng cao sát thương càng cao. Có 24% khiến mục tiêu bị [Ám Tế], duy trì 1 lượt. Khiến tướng địch sĩ khí thấp nhất chịu 20000% Mưu Công, giảm 100 sĩ khí, ",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "uy_phong": {
      "id": "uy_phong",
      "name": "Uy Phong",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.5,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "UY PHONG",
        "motif": "whirlwind"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 150% Pháp Công, giảm 34 sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tang_phong": {
      "id": "tang_phong",
      "name": "Tang Phong",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.82,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "TANG PHONG",
        "motif": "whirlwind"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 182% Pháp Công, giảm 75 sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "khu_truc": {
      "id": "khu_truc",
      "name": "Khu Trục",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KHU TRỤC",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 288% Pháp Công, giảm 100+{2} sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "kiem_ham": {
      "id": "kiem_ham",
      "name": "Kiềm Hãm",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KIỀM HÃM",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 600% Pháp Công, giảm 120 sĩ khí, Vật Công của mục tiêu giảm 100%, duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "dap_pha": {
      "id": "dap_pha",
      "name": "Đạp Phá",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.32,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ĐẠP PHÁ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 132% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "ky_liep": {
      "id": "ky_liep",
      "name": "Kỵ Liệp",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KỴ LIỆP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 240% Pháp Công, Pháp Công của bản thân tăng 15%, duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "kieu_hung": {
      "id": "kieu_hung",
      "name": "Kiêu Hùng",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KIÊU HÙNG",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Tất cả tấn công của toàn phe ta tăng 20%, duy trì 2 lượt, tướng khác của phe ta hồi 55 sĩ khí, toàn phe địch giảm 15 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "kinh_loi": {
      "id": "kinh_loi",
      "name": "Kinh Lôi",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.6,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "KINH LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 160% Mưu Công, 30% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "tu_than": {
      "id": "tu_than",
      "name": "Tử Thần",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "TỬ THẦN",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Khiến đơn vị địch lính ít nhất chịu 900% Mưu Công, lính mục tiêu càng ít sát thương càng cao, bản thân hồi 50 sĩ khí. Nếu diệt được mục tiêu, bản thân hồi 500 sĩ khí, nếu không sẽ khiến mục tiêu bị Hỗn Loạn, không thể hành động, duy trì 1 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "sinh_sat": {
      "id": "sinh_sat",
      "name": "Sinh Sát",
      "damageType": "strategy",
      "pattern": "self",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "SINH SÁT",
        "motif": "buff"
      },
      "desc": "[Kế Sách] Chọn mục tiêu ít lính nhất, giải trừ tất cả hiệu quả có lợi và gây sát thương Kế Sách lính càng ít sát thương càng cao, nếu diệt thành công sẽ hồi 500 sĩ khí, nếu không gây Hỗn Loạn cho mục tiêu 1 lượt và bản thân hồi 50 sĩ khí, sau khi tấn công nhận Thấu Suốt 3 lượt, g",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tu_than_giang_lam": {
      "id": "tu_than_giang_lam",
      "name": "Tử Thần Giáng Lâm",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "TỬ THẦN GIÁNG LÂM",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Giải trừ hiệu quả có lợi của mục tiêu địch lính ít nhất, gây 20000% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Thấu Suốt] không thể giải trừ, duy trì 3 lượt. Nếu diệt được mục tiêu, bản thân hồi 500 sĩ khí. Nếu không, bản thân hồi 100 sĩ khí, kh",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thu_hon_doat_phach": {
      "id": "thu_hon_doat_phach",
      "name": "Thu Hồn Đoạt Phách",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THU HỒN ĐOẠT PHÁCH",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Giải trừ hiệu quả có lợi của mục tiêu địch lính ít nhất, gây 26000% Mưu Công, lính mục tiêu càng ít sát thương càng cao, bản thân nhận hiệu quả [Thấu Suốt] không thể giải trừ, duy trì 3 lượt. Nếu diệt được mục tiêu, bản thân hồi 500 sĩ khí; nếu không, bản thân hồi 100 s",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "cuong_bao": {
      "id": "cuong_bao",
      "name": "Cuồng Bạo",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CUỒNG BẠO",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 220% Pháp Công, bản thân chịu 52% Pháp Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "chien_cuong": {
      "id": "chien_cuong",
      "name": "Chiến Cuồng",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CHIẾN CUỒNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 240% Pháp Công, bản thân chịu 100% Pháp Công, bản thân hồi 145 sĩ khí, Pháp Công của bản thân tăng 50%, duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "cuong_loan": {
      "id": "cuong_loan",
      "name": "Cuồng Loạn",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CUỒNG LOẠN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 672% Pháp Công, lính mục tiêu càng ít sát thương càng cao, bản thân chịu 150% Pháp Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ho_tri": {
      "id": "ho_tri",
      "name": "Hổ Tri",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "HỔ TRI",
        "motif": "tiger"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 3000% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Tỏ Chí] không thể giải trừ, [Cô Độc] không thể giải trừ, duy trì 3 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "poison",
          "duration": 2
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ho_hau_san_no": {
      "id": "ho_hau_san_no",
      "name": "Hổ Hầu Sân Nộ",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "HỔ HẦU SÂN NỘ",
        "motif": "tiger"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 2 lần 9350% Pháp Công, trước khi gây sát thương sẽ giải trừ 2 hiệu quả có lợi của mục tiêu, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Tỏ Chí] không thể giải trừ, [Cô Độc] không thể giải trừ, duy trì 3 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "poison",
          "duration": 2
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "loa_y_no_tap": {
      "id": "loa_y_no_tap",
      "name": "Lõa Y Nộ Tập",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "LÕA Y NỘ TẬP",
        "motif": "poison"
      },
      "desc": "[C.Pháp] cung cấp cho bản thân hiệu quả [Vô Tình], gây cho 1 kẻ địch 2 lần 13000% Pháp Công trong đó lính mục tiêu càng ít sát thương càng cao, mỗi lần kèm 5% sát thương bỏ qua phòng thủ từ lính hiện tại của bản thân, trước khi gây sát thương sẽ giải trừ 2 hiệu quả có lợi của mục",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "poison",
          "duration": 2
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "huyet_chien_bat_phuong": {
      "id": "huyet_chien_bat_phuong",
      "name": "Huyết Chiến Bát Phương",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HUYẾT CHIẾN BÁT PH",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 1550% sát thương vật lý, khiến đơn vị địch lính ít nhất chịu 2000% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao, bản thân nhận [Thị Huyết], duy trì 3 lượt, bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ac_lai": {
      "id": "ac_lai",
      "name": "Ác Lai",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ÁC LAI",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 4600% sát thương vật lý, khiến đơn vị địch lính ít nhất chịu 4800% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Thị Huyết] không thể giải trừ, duy trì 3 lượt. Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ac_quy_trien_than": {
      "id": "ac_quy_trien_than",
      "name": "Ác Quỷ Triền Thân",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ÁC QUỶ TRIỀN THÂN",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 9000% sát thương vật lý, sau đó khiến đơn vị địch lính ít nhất chịu 18000% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Thị Huyết], [Hấp Huyết] không thể giải trừ, duy trì 3 lượt. Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ac_lai_liet_phach": {
      "id": "ac_lai_liet_phach",
      "name": "Ác Lai Liệt Phách",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ÁC LAI LIỆT PHÁCH",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 18000% sát thương vật lý, sau đó khiến đơn vị địch lính ít nhất chịu 2 lần 22000% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Thị Huyết], [Hấp Huyết] không thể giải trừ, duy trì 3 lượt. Bản thân hồi 50 +{6} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ho_xung": {
      "id": "ho_xung",
      "name": "Hổ Xung",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.95,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "HỔ XUNG",
        "motif": "tiger"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 195% Pháp Công, 40% khiến mục tiêu bị [Tỏa Binh], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ho_sat": {
      "id": "ho_sat",
      "name": "Hổ Sát",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "HỔ SÁT",
        "motif": "tiger"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 235% Pháp Công, 40% khiến 1 kẻ địch bị [Tỏa Binh], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "quy_sat": {
      "id": "quy_sat",
      "name": "Quỷ Sát",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "QUỶ SÁT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 400% Pháp Công, sĩ khí mục tiêu càng cao sát thương càng cao, 50% khiến mục tiêu bị [Tỏa Binh], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "huyet_quy_nhan": {
      "id": "huyet_quy_nhan",
      "name": "Huyết Quỷ Nhẫn",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HUYẾT QUỶ NHẪN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2600% Pháp Công, sĩ khí mục tiêu càng cao sát thương càng cao. Có 80% khiến mục tiêu bị [Tỏa Binh], [Huyết Cúc] không thể giải trừ, duy trì 2 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "uy_chan_tieu_dao": {
      "id": "uy_chan_tieu_dao",
      "name": "Uy Chấn Tiêu Dao",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "UY CHẤN TIÊU DAO",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu lần lượt 2 lần 8000% và 8000% Pháp Công, lần thứ 1 sĩ khí mục tiêu càng cao sát thương càng cao, lần thứ 2 lính mục tiêu càng ít sát thương càng cao, 80% khiến mục tiêu bị [Tỏa Binh], [Huyết Cúc] không thể giải trừ, duy trì 2 lượt, bản thân vào tr",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "luot_nhanh_nhu_gio": {
      "id": "luot_nhanh_nhu_gio",
      "name": "Lướt Nhanh Như Gió",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LƯỚT NHANH NHƯ GIÓ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu lần lượt 2 lần 16500% và 16500% Pháp Công, lần thứ 1 sĩ khí mục tiêu càng cao sát thương càng cao, lần thứ 2 lính mục tiêu càng ít sát thương càng cao, khiến mục tiêu bị [Tỏa Binh], [Huyết Cúc] không thể giải trừ, duy trì 2 lượt, bản thân vào trạn",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "trieu_ho_pha_tran": {
      "id": "trieu_ho_pha_tran",
      "name": "Triệu Hổ Phá Trận",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "TRIỆU HỔ PHÁ TRẬN",
        "motif": "tiger"
      },
      "desc": "[C.Pháp] Gây cho địch trên hàng dọc hai lần sát thương pháp công 29500% mỗi lần. Lần thứ nhất, sĩ khí mục tiêu càng cao sát thương càng cao. Lần thứ hai, lính mục tiêu càng ít sát thương càng cao. Có 80% xác suất khiến mục tiêu rơi vào trạng thái [Tỏa Binh], [Huyết Cúc] và [E Sợ ",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "man_nguu": {
      "id": "man_nguu",
      "name": "Man Ngưu",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "MAN NGƯU",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 90% Pháp Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "cuong_nguu": {
      "id": "cuong_nguu",
      "name": "Cuồng Ngưu",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.25,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CUỒNG NGƯU",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 125% Pháp Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "dia_long": {
      "id": "dia_long",
      "name": "Địa Long",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "ĐỊA LONG",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 155% Pháp Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hoa_nguu_dap": {
      "id": "hoa_nguu_dap",
      "name": "Hỏa Ngưu Đạp",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HỎA NGƯU ĐẠP",
        "motif": "fire"
      },
      "desc": "[C.Pháp] Chiến Pháp liên tục, tấn công toàn phe địch, gây hiệu quả Giẫm Đạp không thể giải trừ trong 2 lượt. Giẫm Đạp cộng dồn 3 lần, sẽ gây Hôn Mê 1 lượt (Khi chiến đấu với người chơi khác, cần cộng dồn 4 lần), hiệu quả Hôn Mê không thể giải trừ.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "man_nguu_khai_son": {
      "id": "man_nguu_khai_son",
      "name": "Man Ngưu Khai Sơn",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "MAN NGƯU KHAI SƠN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Chiến Pháp liên tục, tấn công toàn phe địch, gây hiệu quả Giẫm Đạp không thể giải trừ trong 2 lượt. Giẫm Đạp cộng dồn 3 lần, sẽ gây Hôn Mê 1 lượt (Khi chiến đấu với người chơi khác, cần cộng dồn 4 lần), hiệu quả Hôn Mê không thể giải trừ.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "troi_long_dat_lo": {
      "id": "troi_long_dat_lo",
      "name": "Trời Long Đất Lở",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "TRỜI LONG ĐẤT LỞ",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 18000% Pháp Công, khiến toàn phe địch chịu hiệu quả [Giẫm Đạp] không thể giải trừ, duy trì 2 lượt, cộng dồn 3 tầng (Khi chiến đấu với người chơi khác, cần cộng dồn 4 tầng) sẽ khiến mục tiêu bị [Hỗn Loạn] 1 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "chien_ky": {
      "id": "chien_ky",
      "name": "Chiến Kỵ",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CHIẾN KỴ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 245% Pháp Công, khiến 1 kẻ địch bị [Đào Binh], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ho_uy": {
      "id": "ho_uy",
      "name": "Hổ Uy",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "HỔ UY",
        "motif": "tiger"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 400% Pháp Công, lính mục tiêu càng ít sát thương càng cao, binh lực tối đa của bản thân tăng 10%, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thien_bien": {
      "id": "thien_bien",
      "name": "Thiện Biến",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIỆN BIẾN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 1700% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Giải trừ hiệu quả có lợi của mục tiêu (Khi chiến đấu với người chơi khác, giải trừ tối đa 2 hiệu quả có lợi của mỗi tướng địch). Bản thân nhận [Thiên Vận], duy trì 3 lượt. Bản thân hồi 14",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tien_co_chien_tran": {
      "id": "tien_co_chien_tran",
      "name": "Tiên Cơ Chiến Trận",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TIÊN CƠ CHIẾN TRẬN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 3500% Pháp Công, lính mục tiêu càng ít sát thương càng cao, giải trừ trạng thái có lợi của mục tiêu (Khi chiến đấu với người chơi khác, giải trừ tối đa 2 hiệu quả có lợi của mỗi tướng địch), bản thân nhận [Thiên Vận], duy trì 3 lượt, bản thân hồi ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "binh_vo_thuong_hinh": {
      "id": "binh_vo_thuong_hinh",
      "name": "Binh Vô Thường Hình",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BINH VÔ THƯỜNG HÌN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Bản thân nhận [Thiên Vận], duy trì 3 lượt, giải trừ hiệu quả có lợi của địch trên hàng dọc (Khi chiến đấu với người chơi khác, tối đa giải trừ 2 hiệu quả có lợi của mỗi tướng địch), sau đó khiến mục tiêu chịu 12000% Pháp Công, lính mục tiêu càng ít sát thương càng cao. B",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "binh_hinh_cuu_don": {
      "id": "binh_hinh_cuu_don",
      "name": "Binh Hình Cửu Độn",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BINH HÌNH CỬU ĐỘN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Bản thân nhận [Thiên Vận] và trạng thái [Kỳ Trận] không thể giải trừ, duy trì 3 lượt. Giải trừ hiệu quả có lợi của địch trên hàng dọc (khi chiến đấu với người chơi khác, tối đa giải trừ 4 hiệu quả có lợi mỗi tướng địch), mỗi hiệu quả có lợi bị giải trừ giảm 15 sĩ khí đối",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "kich_thich": {
      "id": "kich_thich",
      "name": "Kích Thích",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KÍCH THÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Gây cho 1 kẻ địch 165% sát thương vật lý.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "pha_kich": {
      "id": "pha_kich",
      "name": "Phá Kích",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHÁ KÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Gây cho 1 kẻ địch 240% sát thương vật lý.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "huy_diet": {
      "id": "huy_diet",
      "name": "Hủy Diệt",
      "damageType": "strategy",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "HỦY DIỆT",
        "motif": "arcane"
      },
      "desc": "[Thường+Kế] Địch trên hàng dọc chịu 300% sát thương vật lý, địch trên hàng dọc chịu 370% Mưu Công, Vật Phòng và Mưu Phòng của mục tiêu giảm 30%, duy trì 2 lượt, 60% giải trừ hiệu quả có lợi của mục tiêu, bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "viem_loi": {
      "id": "viem_loi",
      "name": "Viêm Lôi",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.76,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "VIÊM LÔI",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 176% Mưu Công, 70% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "xich_loi": {
      "id": "xich_loi",
      "name": "Xích Lôi",
      "damageType": "strategy",
      "pattern": "row",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "XÍCH LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 220% Mưu Công, 80% khiến 1 kẻ địch bị [Hỗn Loạn], duy trì 1 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "quy_muu": {
      "id": "quy_muu",
      "name": "Quỷ Mưu",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "QUỶ MƯU",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Tấn công ngang liên tục, có xác suất gây choáng cho kẻ địch đứng đầu, bản thân +145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "quy_ke": {
      "id": "quy_ke",
      "name": "Quỷ Kế",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "QUỶ KẾ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Tấn công ngang liên tục, lính địch càng ít sát thương càng cao, khiến địch trước mặt bị Hỗn Loạn (Khi đấu với người khác giảm xác suất gây Hỗn Loạn), gây hiệu quả Âm Hồn. Bản thân nhận Di Kế (Khi chiến đấu với người chơi sẽ nhận Ma Ám, mỗi tầng giảm Lính tối đa của bản ",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "quyet_thang_thien_ly": {
      "id": "quyet_thang_thien_ly",
      "name": "Quyết Thắng Thiên Lý",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "QUYẾT THẮNG THIÊN ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 6500% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Gây cho 1 đơn vị địch 2 lần 7700% Mưu Công, khiến 1 kẻ địch bị [Hỗn Loạn], duy trì 1 lượt, khiến 1 kẻ địch bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu. Bản thân nhận [Di Kế] không t",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bien_sao_lap_lanh": {
      "id": "bien_sao_lap_lanh",
      "name": "Biển Sao Lấp Lánh",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "BIỂN SAO LẤP LÁNH",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 8500% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Gây cho 1 đơn vị địch 2 lần 12800% Mưu Công, khiến 1 kẻ địch bị [Hỗn Loạn], duy trì 1 lượt, khiến 1 kẻ địch bị [Âm Hồn], giảm vĩnh viễn 12 điểm Trí. Bản thân vào trạng thái [Di Kế] khôn",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "dia_liep": {
      "id": "dia_liep",
      "name": "Địa Liệp",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "ĐỊA LIỆP",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 185% Mưu Công, 35% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "dia_nha": {
      "id": "dia_nha",
      "name": "Địa Nha",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "ĐỊA NHA",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 2 lần 135% Mưu Công. Mỗi lần sát thương, 25% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "bang_chuy": {
      "id": "bang_chuy",
      "name": "Băng Chùy",
      "damageType": "strategy",
      "pattern": "row",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "BĂNG CHÙY",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 400% Mưu Công, 65% khiến mục tiêu bị [Đóng Băng], duy trì 1 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "bang_phong": {
      "id": "bang_phong",
      "name": "Băng Phong",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "BĂNG PHONG",
        "motif": "whirlwind"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 550% Mưu Công, sĩ khí mục tiêu càng cao sát thương càng cao, 65% khiến mục tiêu bị [Đóng Băng] (Khi chiến đấu với người chơi khác, xác suất Đóng Băng là 39%), duy trì 1 lượt, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thien_han_dia_bang": {
      "id": "thien_han_dia_bang",
      "name": "Thiên Hàn Địa Băng",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THIÊN HÀN ĐỊA BĂNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 1250% Mưu Công, giảm 25 sĩ khí, sĩ khí mục tiêu càng cao sát thương càng cao, 65% khiến mục tiêu bị [Đóng Băng] (Khi chiến đấu với người chơi khác, xác suất [Đóng Băng] là 39%), duy trì 1 lượt, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thien_ly_bang_phong": {
      "id": "thien_ly_bang_phong",
      "name": "Thiên Lý Băng Phong",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "THIÊN LÝ BĂNG PHON",
        "motif": "whirlwind"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 4000% Mưu Công, gây giảm 25 sĩ khí, sĩ khí mục tiêu càng cao sát thương càng cao, có xác suất 65% khiến mục tiêu bị [Đóng Băng] (Khi chiến đấu với người chơi khác, xác suất [Đóng Băng] là 39%), duy trì 1 lượt. Trong thời gian bị Đóng Băng, khi ",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "su_hong": {
      "id": "su_hong",
      "name": "Sư Hống",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "SƯ HỐNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 100% Pháp Công, giảm 24 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "cuong_hao": {
      "id": "cuong_hao",
      "name": "Cuồng Hào",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CUỒNG HÀO",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 155% Pháp Công, giảm 40+{2} sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "de_hon": {
      "id": "de_hon",
      "name": "Đế Hồn",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ĐẾ HỒN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 600% Pháp Công, giảm 40+{2} sĩ khí, 30% giải trừ 1 hiệu quả có lợi của mục tiêu (Khi chiến đấu với người chơi khác, không có hiệu quả Giải Trừ).",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "bao_no_hong": {
      "id": "bao_no_hong",
      "name": "Bạo Nộ Hống",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BẠO NỘ HỐNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 2600% Pháp Công, giảm 40+{2} sĩ khí, 80% giải trừ 1 hiệu quả có lợi của mục tiêu (Khi chiến đấu với người chơi khác, không có hiệu quả Giải Trừ).",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero"
    },
    "pha_dam_no_hong": {
      "id": "pha_dam_no_hong",
      "name": "Phá Đảm Nộ Hống",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHÁ ĐẢM NỘ HỐNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] 50% tăng cho bản thân hiệu quả [Trảm Tiên], sau đó khiến toàn phe địch chịu 6800% Pháp Công, gây giảm 40 +{8} sĩ khí, 80% giải trừ 1 hiệu quả có lợi của mục tiêu (Khi chiến đấu với người chơi khác, sẽ không có hiệu quả Giải Trừ, sau khi gây sát thương, 50% tăng cho bản t",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero"
    },
    "cong_tam": {
      "id": "cong_tam",
      "name": "Công Tâm",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.76,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CÔNG TÂM",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 176% Mưu Công. Bản thân nhận trị liệu (Mức trị liệu bằng 50% Mưu Công).",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "tu_lap": {
      "id": "tu_lap",
      "name": "Tự Lập",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.26,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TỰ LẬP",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 126% Mưu Công. Bản thân nhận trị liệu (Mức trị liệu bằng 50% Mưu Công).",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "dang_co": {
      "id": "dang_co",
      "name": "Đăng Cơ",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "ĐĂNG CƠ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 240% Mưu Công. Khiến mục tiêu bị [Đào Binh], duy trì 2 lượt. Bản thân nhận trị liệu (Mức trị liệu bằng 30% Mưu Công).",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "quy_tam": {
      "id": "quy_tam",
      "name": "Quy Tâm",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "QUY TÂM",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 380% Mưu Công, sĩ khí mục tiêu càng cao sát thương càng cao. Khiến mục tiêu bị [Đào Binh], duy trì 2 lượt. Bản thân nhận trị liệu (Mức trị liệu bằng 30% Mưu Công).",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "uy_ap": {
      "id": "uy_ap",
      "name": "Uy Áp",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "UY ÁP",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 2000% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Khiến mục tiêu bị [Đào Binh], duy trì 2 lượt. Bản thân nhận trị liệu (Mức trị liệu bằng 30% Mưu Công).",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "binh_tien": {
      "id": "binh_tien",
      "name": "Binh Tiển",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.54,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "BINH TIỂN",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 154% Mưu Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "phong_tien": {
      "id": "phong_tien",
      "name": "Phong Tiễn",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "PHONG TIỄN",
        "motif": "whirlwind"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 225% Mưu Công, mục tiêu bị [Thiêu Đốt], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "burn",
          "duration": 2
        }
      ]
    },
    "hoa_than": {
      "id": "hoa_than",
      "name": "Hỏa Thần",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HỎA THẦN",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 282% Mưu Công, mục tiêu bị [Thiêu Đốt], duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "burn",
          "duration": 2
        }
      ]
    },
    "dai_viem_de": {
      "id": "dai_viem_de",
      "name": "Đại Viêm Đế",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "ĐẠI VIÊM ĐẾ",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 1350% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao. Khiến toàn phe địch chịu 1600% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Hỏa Thần], duy trì 4 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "hong_lien_nghiep_hoa": {
      "id": "hong_lien_nghiep_hoa",
      "name": "Hồng Liên Nghiệp Hỏa",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HỒNG LIÊN NGHIỆP H",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Bản thân nhận [Hỏa Thần] 3 lượt, khiến toàn phe địch chịu 3750% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao. Tiếp tục khiến toàn phe địch chịu 2 lần 6750% Mưu Công, lính mục tiêu càng ít sát thương càng cao.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2
    },
    "luyen_nguc_hoa_hai": {
      "id": "luyen_nguc_hoa_hai",
      "name": "Luyện Ngục Hỏa Hải",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "LUYỆN NGỤC HỎA HẢI",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Bản thân nhận [Hỏa Thần] 3 lượt, khiến toàn phe địch chịu 4100% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao. Tiếp tục khiến toàn phe địch chịu 2 lần 7200% Mưu Công, lính mục tiêu càng ít sát thương càng cao. 35% kích hoạt tất cả hiệu quả [Thiêu Đốt] và [Thiên",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "burn",
          "duration": 2
        }
      ]
    },
    "hong_viem": {
      "id": "hong_viem",
      "name": "Hồng Viêm",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.1,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HỒNG VIÊM",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 210% Mưu Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hac_viem": {
      "id": "hac_viem",
      "name": "Hắc Viêm",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HẮC VIÊM",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 380% Mưu Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nhien_tan": {
      "id": "nhien_tan",
      "name": "Nhiên Tận",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "NHIÊN TẬN",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 580% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao, mục tiêu bị [Thiêu Đốt], duy trì 2 lượt, bản thân nhận [Thần Binh], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "burn",
          "duration": 2
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hoa_thieu_lien_doanh": {
      "id": "hoa_thieu_lien_doanh",
      "name": "Hỏa Thiêu Liên Doanh",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HỎA THIÊU LIÊN DOA",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 1000% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao, khiến mục tiêu bị [Thiên Hỏa] không thể giải trừ, duy trì 2 lượt. Bản thân nhận [Thần Binh], duy trì 2 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "burn",
          "duration": 2
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nghiep_viem_bao": {
      "id": "nghiep_viem_bao",
      "name": "Nghiệp Viêm Bạo",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "NGHIỆP VIÊM BẠO",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 6000% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao, khiến 1 kẻ địch bị [Thiên Hỏa] không thể giải trừ, duy trì 2 lượt. Bản thân nhận [Thần Binh], [Hỏa Thần], duy trì 2 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "burn",
          "duration": 2
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hoa_the_ngut_troi": {
      "id": "hoa_the_ngut_troi",
      "name": "Hỏa Thế Ngút Trời",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HỎA THẾ NGÚT TRỜI",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 2 lần 10800% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao, khiến mục tiêu bị [Thiên Hỏa], duy trì 2 lượt, bản thân nhận hiệu quả [Liên Tục] [Thần Binh], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "burn",
          "duration": 2
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "xich_lua_tri_tue": {
      "id": "xich_lua_tri_tue",
      "name": "Xích Lửa Trí Tuệ",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "XÍCH LỬA TRÍ TUỆ",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 2 lần 14500% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao, khiến mục tiêu chịu hiệu quả [Thiên Hỏa], duy trì 2 lượt, bản thân nhận hiệu quả [Liên Tục], [Thần Binh], duy trì 2 lượt, bản thân hồi 145 sĩ khí. Khi đánh trúng mục tiêu mang [Thiên ",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "burn",
          "duration": 2
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nghich_tap": {
      "id": "nghich_tap",
      "name": "Nghịch Tập",
      "damageType": "physical",
      "pattern": "front_row",
      "power": 1.5,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NGHỊCH TẬP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 150% Pháp Công, khiến 1 kẻ địch hàng sau chịu 140% Pháp Công, khiến 1 kẻ địch hàng trước chịu 130% Pháp Công",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "nghich_luu": {
      "id": "nghich_luu",
      "name": "Nghịch Lưu",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.0,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NGHỊCH LƯU",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 200% Pháp Công, khiến 1 kẻ địch hàng sau chịu 170% Pháp Công, khiến 1 kẻ địch hàng trước chịu 150% Pháp Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "lang_tuyen": {
      "id": "lang_tuyen",
      "name": "Lang Tuyền",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "crimson",
        "text": "LANG TUYỀN",
        "motif": "wolf"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 360% Pháp Công, lính mục tiêu càng ít sát thương càng cao, bản thân nhận [Thiết Bích], duy trì 1 lượt, bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "to_luu_nghich_tap": {
      "id": "to_luu_nghich_tap",
      "name": "Tố Lưu Nghịch Tập",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TỐ LƯU NGHỊCH TẬP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 1500% Pháp Công, lính mục tiêu càng ít sát thương càng cao. 80% Khiến 1 kẻ địch hàng sau chịu 1900% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Thiết Bích], duy trì 1 lượt. Bản thân hồi 50+{8} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thuong_long_xuat_hai": {
      "id": "thuong_long_xuat_hai",
      "name": "Thương Long Xuất Hải",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "THƯƠNG LONG XUẤT H",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 3500% Pháp Công, lính mục tiêu càng ít sát thương càng cao, khiến 1 kẻ địch hàng sau chịu 4500% Pháp Công, lính mục tiêu càng ít sát thương càng cao, bản thân nhận [Thiết Bích], duy trì 1 lượt, bản thân hồi 50+{8} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "lung_hoan_tang_dich": {
      "id": "lung_hoan_tang_dich",
      "name": "Lung Hoàn Táng Địch",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LUNG HOÀN TÁNG ĐỊC",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 7800% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Khiến 1 kẻ địch hàng sau chịu 10200% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Thiết Bích], duy trì 1 lượt. Bản thân hồi 50+{8} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "lang_tuyen_khon_tran": {
      "id": "lang_tuyen_khon_tran",
      "name": "Lang Tuyền Khốn Trận",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "crimson",
        "text": "LANG TUYỀN KHỐN TR",
        "motif": "wolf"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 12800% Pháp Công và bị [Khóa Vây] trong 1 lượt, lính mục tiêu càng ít sát thương càng cao. Sau đó, gây 16800% Pháp Công lên 1 kẻ địch ở hàng sau, lính mục tiêu càng ít sát thương càng cao. Bản thân nhận [Thiết Bích], duy trì 1 lượt. Bản thân",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        },
        {
          "type": "stun",
          "chance": 1.0,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "kho_ke": {
      "id": "kho_ke",
      "name": "Khổ Kế",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "KHỔ KẾ",
        "motif": "tiger"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 230% Pháp Công, bản thân chịu 52% Pháp Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "hy_sinh": {
      "id": "hy_sinh",
      "name": "Hy Sinh",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HY SINH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 360% Pháp Công, bản thân chịu 100% Pháp Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "the_tu": {
      "id": "the_tu",
      "name": "Thệ Tử",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THỆ TỬ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 600% Pháp Công, bản thân chịu 150% Pháp Công.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "ngoc_thach_cu_diet": {
      "id": "ngoc_thach_cu_diet",
      "name": "Ngọc Thạch Cụ Diệt",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NGỌC THẠCH CỤ DIỆT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 1600% Pháp Công, lính mục tiêu càng nhiều sát thương càng cao, khiến mục tiêu nhận [Âm Hồn], duy trì 3 lượt, bản thân chịu sát thương bằng 300% Pháp Công. Bản thân nhận [Bất Khuất] không thể giải trừ, duy trì 4 lượt. Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "xa_than_cuong_tap": {
      "id": "xa_than_cuong_tap",
      "name": "Xả Thân Cường Tập",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "XẢ THÂN CƯỜNG TẬP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 4800% Pháp Công, lính mục tiêu càng nhiều sát thương càng cao, khiến mục tiêu nhận [Âm Hồn], duy trì 3 lượt. Bản thân nhận [Bất Khuất] không thể giải trừ, duy trì 4 lượt. Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "cang_gia_cang_cay": {
      "id": "cang_gia_cang_cay",
      "name": "Càng Già Càng Cay",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CÀNG GIÀ CÀNG CAY",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 5500% Pháp Công, lính mục tiêu càng nhiều sát thương càng cao, khiến mục tiêu bị [Âm Hồn], duy trì 3 lượt, bản thân nhận hiệu quả [Bất Khuất 2] không thể giải trừ, duy trì 4 lượt, bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "huyet_chinh": {
      "id": "huyet_chinh",
      "name": "Huyết Chinh",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HUYẾT CHINH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 310% Pháp Công, bản thân chịu 100% Pháp Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "dung_manh": {
      "id": "dung_manh",
      "name": "Dũng Mãnh",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "DŨNG MÃNH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 500% Pháp Công, mục tiêu bị [Áp Ức], duy trì 2 lượt, bản thân chịu 150% sát thương, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "phan_chien": {
      "id": "phan_chien",
      "name": "Phấn Chiến",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.43,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHẤN CHIẾN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 143% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "chien_than_can_dam": {
      "id": "chien_than_can_dam",
      "name": "Chiến Thần Can Đảm",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CHIẾN THẦN CAN ĐẢM",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 6300% Pháp Công, lính bản thân càng ít sát thương càng cao, mục tiêu bị [Áp Ức], duy trì 2 lượt, bản thân nhận [Dục Huyết], duy trì 3 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "chien_than_bat_khuat": {
      "id": "chien_than_bat_khuat",
      "name": "Chiến Thần Bất Khuất",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CHIẾN THẦN BẤT KHU",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 18000% Pháp Công, lính bản thân càng thấp sát thương càng cao, khiến mục tiêu nhận [Áp Ức], [Thương Tích], duy trì 2 lượt. Bản thân nhận [Huyết Thuẫn] không thể giải trừ, duy trì 31 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "lay_than_lam_giap": {
      "id": "lay_than_lam_giap",
      "name": "Lấy Thân Làm Giáp",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LẤY THÂN LÀM GIÁP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 20000% Pháp Công, lính bản thân càng thấp sát thương càng cao. Khiến mục tiêu bị [Áp Ức], [Thương Tích], duy trì 2 lượt. Bản thân nhận [Huyết Thuẫn 2] không thể giải trừ, duy trì 31 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "doc_tieu": {
      "id": "doc_tieu",
      "name": "Độc Tiêu",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.58,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "ĐỘC TIÊU",
        "motif": "poison"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 158% Pháp Công, mục tiêu bị [Trúng Độc], duy trì 3 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "xa_doc": {
      "id": "xa_doc",
      "name": "Xà Độc",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.58,
      "moraleCost": 100,
      "fx": {
        "flash": "snake",
        "text": "XÀ ĐỘC",
        "motif": "snake"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 158% Pháp Công, 75% khiến mục tiêu bị [Trúng Độc], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "thu_ho": {
      "id": "thu_ho",
      "name": "Thủ Hộ",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THỦ HỘ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 55% Mưu Công, toàn phe ta nhận [Thủ Hộ], duy trì 2 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "han_ve": {
      "id": "han_ve",
      "name": "Hãn Vệ",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.45,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "HÃN VỆ",
        "motif": "shield"
      },
      "desc": "[Hỗ Trợ] Bản thân nhận [Thiết Bích], duy trì 1 lượt, toàn phe ta nhận [Thủ Hộ], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        }
      ]
    },
    "bich_luy": {
      "id": "bich_luy",
      "name": "Bích Lũy",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "BÍCH LŨY",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Thủ Hộ], duy trì 2 lượt, 85% khiến toàn phe ta nhận [Hộ Thuẫn], duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "thuan_tuong": {
      "id": "thuan_tuong",
      "name": "Thuẫn Tường",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THUẪN TƯỜNG",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Hộ Thuẫn], [Thủ Hộ], duy trì 2 lượt, bản thân hồi 0+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tuong_dong_vach_sat": {
      "id": "tuong_dong_vach_sat",
      "name": "Tường Đồng Vách Sắt",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TƯỜNG ĐỒNG VÁCH SẮ",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Trị liệu đồng đội khác 1 lần, toàn phe ta nhận [Hộ Thuẫn], [Thủ Hộ], duy trì 2 lượt, bản thân hồi 0+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "vung_nhu_ban_thach": {
      "id": "vung_nhu_ban_thach",
      "name": "Vững Như Bàn Thạch",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "VỮNG NHƯ BÀN THẠCH",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Trị liệu đồng đội khác 1 lần, giúp mục tiêu giải trừ 2 hiệu quả bất lợi, toàn phe ta nhận [Hộ Thuẫn], [Thủ Hộ], duy trì 2 lượt, bản thân hồi 0+{4} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "xung_ba": {
      "id": "xung_ba",
      "name": "Xưng Bá",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.25,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "XƯNG BÁ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 125% Pháp Công, toàn phe ta hồi 25 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "ba_vuong": {
      "id": "ba_vuong",
      "name": "Bá Vương",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BÁ VƯƠNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 9000% Pháp Công, toàn phe ta nhận [Tịnh Hóa], duy trì 2 lượt, toàn phe ta nhận [Tòng Long], duy trì 3 lượt, toàn phe ta hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero"
    },
    "thien_uy": {
      "id": "thien_uy",
      "name": "Thiên Uy",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIÊN UY",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 220% Pháp Công, bản thân nhận [Tịnh Hóa], duy trì 2 lượt, toàn phe ta hồi 50 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "ba_vuong_than_uy": {
      "id": "ba_vuong_than_uy",
      "name": "Bá Vương Thần Uy",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BÁ VƯƠNG THẦN UY",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 2000% Pháp Công, toàn phe ta nhận [Tịnh Hóa], duy trì 2 lượt, toàn phe ta nhận [Tòng Long], duy trì 3 lượt, toàn phe ta hồi 50+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "than_uy_pha_tran": {
      "id": "than_uy_pha_tran",
      "name": "Thần Uy Phá Trận",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THẦN UY PHÁ TRẬN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 9500% Pháp Công, toàn phe ta nhận [Tịnh Hóa], duy trì 2 lượt, toàn phe ta nhận [Tòng Long], [Võ Dũng], duy trì 3 lượt, toàn phe ta hồi 50 +{4} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero"
    },
    "ba_vuong_liet_phach": {
      "id": "ba_vuong_liet_phach",
      "name": "Bá Vương Liệt Phách",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "BÁ VƯƠNG LIỆT PHÁC",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 15500% Pháp Công, toàn phe ta nhận [Tịnh Hóa], duy trì 2 lượt, toàn phe ta nhận [Tòng Long 2], [Võ Dũng], duy trì 3 lượt, toàn phe ta hồi 50 +{4} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero"
    },
    "ham_dia": {
      "id": "ham_dia",
      "name": "Hám Địa",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.9,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HÁM ĐỊA",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 190% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "san_bang": {
      "id": "san_bang",
      "name": "San Bằng",
      "damageType": "physical",
      "pattern": "row",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "SAN BẰNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 250% Pháp Công, Pháp Phòng của mục tiêu giảm 25%, duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "co_vu": {
      "id": "co_vu",
      "name": "Cổ Vũ",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CỔ VŨ",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta hồi 45 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "kich_duong": {
      "id": "kich_duong",
      "name": "Kích Dương",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.45,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "KÍCH DƯƠNG",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta hồi 50 sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ngang_duong": {
      "id": "ngang_duong",
      "name": "Ngang Dương",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "NGANG DƯƠNG",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta hồi 55+{4} sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "uy_duong": {
      "id": "uy_duong",
      "name": "Uy Dương",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "UY DƯƠNG",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] 25% giải trừ hiệu quả bất lợi toàn phe ta (Khi chiến đấu với người chơi khác, giải trừ tối đa 2 hiệu quả bất lợi cho mỗi tướng phe ta), giúp tướng khác phe ta hồi 60+{4} sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tung_ca": {
      "id": "tung_ca",
      "name": "Tụng Ca",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TỤNG CA",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] 25% giải trừ hiệu quả có lợi của toàn phe địch (Khi chiến đấu với người chơi khác, giải trừ tối đa 2 hiệu quả có lợi của mỗi tướng địch). Giúp các đồng đội khác hồi 60+{4} sĩ khí. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "phan_chan_long_quan": {
      "id": "phan_chan_long_quan",
      "name": "Phấn Chấn Lòng Quân",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "PHẤN CHẤN LÒNG QUÂ",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Giúp các đồng đội khác hồi 60 +{4} sĩ khí, bản thân nhận [Nguyệt Hồn], duy trì 2 lượt, 25% giải trừ hiệu quả bất lợi cho toàn phe ta (Khi chiến đấu với người chơi khác, giải trừ tối đa 2 hiệu quả bất lợi cho mỗi tướng phe ta), tăng cho đồng đội lính nhiều nhất hiệu quả [",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ca_tung_cong_duc": {
      "id": "ca_tung_cong_duc",
      "name": "Ca Tụng Công Đức",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CA TỤNG CÔNG ĐỨC",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Các tướng khác của phe ta hồi 60+{4} sĩ khí. Bản thân nhận [Nguyệt Hồn], duy trì 2 lượt, có xác suất 25% giải trừ tất cả hiệu quả bất lợi cho toàn phe ta (Khi chiến đấu với người chơi khác, tối đa giải trừ 2 hiệu quả bất lợi cho mỗi tướng phe ta), các tướng khác của phe ",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tuong_dong": {
      "id": "tuong_dong",
      "name": "Tường Đồng",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "TƯỜNG ĐỒNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 55% Mưu Công, 35% giúp toàn phe ta nhận [Thiết Bích], duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        }
      ]
    },
    "lac_thuy_tien": {
      "id": "lac_thuy_tien",
      "name": "Lạc Thủy Tiên",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "LẠC THỦY TIÊN",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Hoạt Lực], duy trì 2 lượt, tướng khác của phe ta hồi 80+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "lac_than_mac": {
      "id": "lac_than_mac",
      "name": "Lạc Thần Mạc",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "LẠC THẦN MẠC",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công). Khiến mục tiêu bị [Hoạt Lực], duy trì 3 lượt. Giúp các đồng đội khác hồi 80+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "khuynh_the_giai_nhan": {
      "id": "khuynh_the_giai_nhan",
      "name": "Khuynh Thế Giai Nhân",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "KHUYNH THẾ GIAI NH",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Hoạt Lực], duy trì 3 lượt, Trị Liệu toàn phe ta 1 lần, sau đó Trị Liệu tướng phe ta ngẫu nhiên 2-3 lần (Mức Trị Liệu bằng 20% Mưu Công), giúp các đồng đội khác hồi 80 +{10} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "vu_dieu_lac_than": {
      "id": "vu_dieu_lac_than",
      "name": "Vũ Điệu Lạc Thần",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "VŨ ĐIỆU LẠC THẦN",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận hiệu quả [Hoạt Lực], duy trì 3 lượt, trị liệu toàn phe ta 2 lần, sau đó trị liệu tiếp cho đồng đội ngẫu nhiên 1-2 lần (Mức trị liệu bằng 20% Mưu Công), giúp các đồng đội khác hồi 80+{10} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "nhuc_ma": {
      "id": "nhuc_ma",
      "name": "Nhục Mạ",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "NHỤC MẠ",
        "motif": "shadow"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 49% Mưu Công, 30% khiến mục tiêu bị [Ám Tế], duy trì 1 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "ky_kich": {
      "id": "ky_kich",
      "name": "Kỵ Kích",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.26,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KỴ KÍCH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 126% Pháp Công, 35% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "ky_chien": {
      "id": "ky_chien",
      "name": "Kỵ Chiến",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KỴ CHIẾN",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 350% sát thương vật lý, Vật Phòng của mục tiêu giảm 30%, duy trì 2 lượt, bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "am_sat": {
      "id": "am_sat",
      "name": "Ám Sát",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.54,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "ÁM SÁT",
        "motif": "shadow"
      },
      "desc": "[C.Pháp] Khiến 1 kẻ địch hàng sau chịu 154% Pháp Công, 75% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "thich_sat": {
      "id": "thich_sat",
      "name": "Thích Sát",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.1,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THÍCH SÁT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Khiến 1 kẻ địch hàng sau chịu 210% Pháp Công, mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "hanh_thich": {
      "id": "hanh_thich",
      "name": "Hành Thích",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HÀNH THÍCH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Khiến 1 kẻ địch hàng sau chịu 350% Pháp Công, mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "diet_gon": {
      "id": "diet_gon",
      "name": "Diệt Gọn",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "DIỆT GỌN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Khiến 1 kẻ địch hàng sau chịu 3000% Pháp Công, mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, mục tiêu bị [Đào Binh], duy trì 3 lượt, mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "am_da_thich_sat": {
      "id": "am_da_thich_sat",
      "name": "Ám Dạ Thích Sát",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ÁM DẠ THÍCH SÁT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Khiến 1 kẻ địch hàng sau chịu 12000% Pháp Công, khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, khiến mục tiêu bị [Đào Binh], duy trì 3 lượt, khiến mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "huyen_thuat": {
      "id": "huyen_thuat",
      "name": "Huyễn Thuật",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "bagua",
        "text": "HUYỄN THUẬT",
        "motif": "bagua"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 52% Mưu Công, giảm 10 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "huyen_phap": {
      "id": "huyen_phap",
      "name": "Huyễn Pháp",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "bagua",
        "text": "HUYỄN PHÁP",
        "motif": "bagua"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 70% Mưu Công, giảm 15 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "huyet_lo": {
      "id": "huyet_lo",
      "name": "Huyết Lộ",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HUYẾT LỘ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 262% Pháp Công, bản thân chịu 52% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "yeu_thuat": {
      "id": "yeu_thuat",
      "name": "Yêu Thuật",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "YÊU THUẬT",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 52% Mưu Công, 15% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "yeu_phap": {
      "id": "yeu_phap",
      "name": "Yêu Pháp",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "YÊU PHÁP",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 70% Mưu Công, 20% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "binh_thuat": {
      "id": "binh_thuat",
      "name": "Bình Thuật",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "BÌNH THUẬT",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 3 lần sát thương, lần lượt là 100%, 150%, 150% Mưu Công, kẻ địch lính nhiều nhất bị [Hỗn Loạn], duy trì 1 lượt, kẻ địch lính ít nhất bị [Treo Thưởng], duy trì 2 lượt, bản thân hồi 50+{8} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hoang_thien_duong_lap": {
      "id": "hoang_thien_duong_lap",
      "name": "Hoàng Thiên Đương Lập",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.5,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "HOÀNG THIÊN ĐƯƠNG ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 3 lần 150% Mưu Công, khiến mục tiêu địch lính nhiều nhất bị [Hỗn Loạn], duy trì 1 lượt, khiến mục tiêu địch lính ít nhất bị [Treo Thưởng không thể giải trừ (Nếu mục tiêu mang [Treo Thưởng] tử vong, toàn phe ta tăng 50 +{11} sĩ khí), duy trì 2 lượt, bả",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thuong_thien_di_tu": {
      "id": "thuong_thien_di_tu",
      "name": "Thương Thiên Dĩ Tử",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.5,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THƯƠNG THIÊN DĨ TỬ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 4 lần 150% Mưu Công, khiến mục tiêu địch lính nhiều nhất bị [Hỗn Loạn], duy trì 1 lượt, khiến mục tiêu địch lính ít nhất bị [Treo Thưởng] không thể giải trừ (Nếu mục tiêu mang [Treo Thưởng] tử vong, toàn phe ta tăng 50 +{13} sĩ khí), duy trì 2 lượt, b",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 4,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "dot_kich": {
      "id": "dot_kich",
      "name": "Đột Kích",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.92,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ĐỘT KÍCH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 192% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "giao_chien": {
      "id": "giao_chien",
      "name": "Giao Chiến",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.54,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "GIAO CHIẾN",
        "motif": "shadow"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 154% Pháp Công, mục tiêu bị [Ám Tế], duy trì 3 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "bac_kich": {
      "id": "bac_kich",
      "name": "Bác Kích",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BÁC KÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 165% sát thương vật lý.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "dung_manh_dot_kich": {
      "id": "dung_manh_dot_kich",
      "name": "Dũng Mãnh Đột Kích",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "DŨNG MÃNH ĐỘT KÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Tấn công 500 sĩ khí, khiến địch trên hàng ngang chịu 920% sát thương vật lý, lính mục tiêu càng nhiều sát thương càng cao. Bản thân nhận [Dũng Tuyệt] không thể giải trừ, duy trì đến khi kết thúc chiến đấu.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "vo_cung_dung_manh": {
      "id": "vo_cung_dung_manh",
      "name": "Vô Cùng Dũng Mãnh",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "VÔ CÙNG DŨNG MÃNH",
        "motif": "slash"
      },
      "desc": "[Thường] Tấn công 500 sĩ khí, khiến địch trên hàng ngang chịu 1600% sát thương vật lý, lính mục tiêu càng nhiều sát thương càng cao. Bản thân nhận [Dũng Tuyệt] không thể giải trừ, duy trì đến khi kết thúc chiến đấu.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero"
    },
    "can_quet_bao_luc": {
      "id": "can_quet_bao_luc",
      "name": "Càn Quét Bạo Lực",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CÀN QUÉT BẠO LỰC",
        "motif": "slash"
      },
      "desc": "[Thường] Tấn công 500 sĩ khí, khiến địch trên hàng ngang chịu 5800% sát thương vật lý, lính mục tiêu càng nhiều sát thương càng cao. Bản thân nhận [Dũng Tuyệt] không thể giải trừ, duy trì đến khi kết thúc chiến đấu.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero"
    },
    "hung_ho_tien_phong": {
      "id": "hung_ho_tien_phong",
      "name": "Hùng Hổ Tiên Phong",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "HÙNG HỔ TIÊN PHONG",
        "motif": "whirlwind"
      },
      "desc": "[Thường] Tấn công 500 sĩ khí, khiến địch trên hàng ngang chịu 10800% sát thương vật lý, lính mục tiêu càng nhiều sát thương càng cao. Bản thân vào [Dũng Tuyệt] [Áp Chế 2] không thể giải trừ, duy trì đến khi kết thúc chiến đấu.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero"
    },
    "vo_song": {
      "id": "vo_song",
      "name": "Vô Song",
      "damageType": "physical",
      "pattern": "self",
      "power": 1.98,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "VÔ SONG",
        "motif": "buff"
      },
      "desc": "[C.Pháp] Tất cả đơn vị trên sân ngoại trừ bản thân chịu 198% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "ma_than": {
      "id": "ma_than",
      "name": "Ma Thần",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "MA THẦN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 185% Pháp Công, bản thân nhận [Hội Tâm], duy trì 2 lượt, bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "minh_vuong": {
      "id": "minh_vuong",
      "name": "Minh Vương",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "MINH VƯƠNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 235% Pháp Công, bản thân nhận [Điên Cuồng], [Hội Tâm], duy trì 2 lượt, bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thien_ha_vo_song": {
      "id": "thien_ha_vo_song",
      "name": "Thiên Hạ Vô Song",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIÊN HẠ VÔ SONG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 1400% Pháp Công, 18% khiến mục tiêu bị [Sợ Hãi] (Khi chiến đấu với người chơi khác, xác suất là 4.5%), duy trì 2 lượt. Gây thêm 3 lần sát thương lên 1 mục tiêu ngẫu nhiên 2000% Pháp Công, bản thân nhận [Điên Cuồng] (Khi chiến đấu với người chơi khác, s",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "quy_than_nhat_kich": {
      "id": "quy_than_nhat_kich",
      "name": "Quỷ Thần Nhất Kích",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "QUỶ THẦN NHẤT KÍCH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 4000% Pháp Công, 18% khiến mục tiêu bị [Sợ Hãi] (Khi chiến đấu với người chơi khác, xác suất là 4.5%), duy trì 2 lượt, khiến mục tiêu ngẫu nhiên chịu 3 lần 6500% Pháp Công. Bản thân nhận [Điên Cuồng], [Phá Thánh], duy trì 3 lượt. Bản thân hồi 50+{10} s",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ma_than_no_hoa": {
      "id": "ma_than_no_hoa",
      "name": "Ma Thần Nộ Hỏa",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "MA THẦN NỘ HỎA",
        "motif": "fire"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 10000% Pháp Công, có 18% khiến mục tiêu bị [Sợ Hãi] (Khi chiến đấu với người chơi khác, xác suất là 4.5%), duy trì 2 lượt, khiến mục tiêu ngẫu nhiên chịu 3 lần 13000% Pháp Công. Bản thân nhận [Điên Cuồng], [Phá Thánh], duy trì 3 lượt, bản thân hồi 50+{",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "quy_than_loan_vu": {
      "id": "quy_than_loan_vu",
      "name": "Quỷ Thần Loạn Vũ",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "blue_water",
        "text": "QUỶ THẦN LOẠN VŨ",
        "motif": "water"
      },
      "desc": "[C.Pháp] Bản thân nhận hiệu quả [Điên Cuồng 2], [Phá Thánh], duy trì 3 lượt, sau đó gây 15500% Pháp Công lên toàn bộ phe địch, có 18% xác suất khiến mục tiêu bị [Sợ Hãi] (Khi chiến đấu với người chơi khác, xác suất là 4.5%), duy trì 2 lượt. Tiếp theo gây 3 lần 22000% Pháp Công lê",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "no_hong": {
      "id": "no_hong",
      "name": "Nộ Hống",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.15,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NỘ HỐNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 115% Pháp Công, giảm 100 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "bang_hoai": {
      "id": "bang_hoai",
      "name": "Băng Hoại",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BĂNG HOẠI",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 330% Pháp Công, lính mục tiêu càng ít sát thương càng cao, bản thân chịu 100% Pháp Công, bản thân nhận [Tử Thủ], duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "bao_le": {
      "id": "bao_le",
      "name": "Bạo Lệ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BẠO LỆ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 910% Pháp Công, lính mục tiêu càng ít sát thương càng cao, bản thân chịu 100% Pháp Công, bản thân nhận [Tử Thủ], [Bạo Nộ], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bao_tran": {
      "id": "bao_tran",
      "name": "Bạo Trấn",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BẠO TRẤN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 5750% Pháp Công, tỉ lệ lính bản thân càng thấp sát thương càng cao, bản thân nhận [Tử Thủ], [Bạo Nộ], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tuu_tri_nhuc_lam": {
      "id": "tuu_tri_nhuc_lam",
      "name": "Tửu Trì Nhục Lâm",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TỬU TRÌ NHỤC LÂM",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 14000% Pháp Công, tỉ lệ lính bản thân càng thấp sát thương càng cao, bản thân vào trạng thái [Tử Thủ], [Bạo Nộ], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thien_uy_bao_nguoc": {
      "id": "thien_uy_bao_nguoc",
      "name": "Thiên Uy Bạo Ngược",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIÊN UY BẠO NGƯỢC",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Bản thân nhận hiệu quả [Bạo Nộ], duy trì 2 lượt, khiến địch trên hàng dọc chịu 2 lần 21000% Pháp Công, tỉ lệ lính bản thân càng thấp sát thương càng cao, bản thân nhận hiệu quả [Tử Thủ 2] không thể giải trừ, duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "lac_loi": {
      "id": "lac_loi",
      "name": "Lạc Lôi",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.13,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "LẠC LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 213% Mưu Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "am_loi": {
      "id": "am_loi",
      "name": "Âm Lôi",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "ÂM LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 600% Mưu Công, 30% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "doc_loi": {
      "id": "doc_loi",
      "name": "Độc Lôi",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "ĐỘC LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 2200% Mưu Công, kèm hiệu quả [Kịch Độc], duy trì 2 lượt, 30% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, bản thân hồi 50 +{6} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "poison",
          "duration": 2
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tuyet_sach_doc_ke": {
      "id": "tuyet_sach_doc_ke",
      "name": "Tuyệt Sách Độc Kế",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "TUYỆT SÁCH ĐỘC KẾ",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 7000% Mưu Công, kèm hiệu quả [Kịch Độc], duy trì 2 lượt, 30% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, bản thân hồi 50 +{6} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "poison",
          "duration": 2
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nao_loan_kinh_thanh": {
      "id": "nao_loan_kinh_thanh",
      "name": "Náo Loạn Kinh Thành",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "NÁO LOẠN KINH THÀN",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 14000% Mưu Công, lập tức kích hoạt hiệu quả [Kịch Độc] trên người kẻ địch trên hàng dọc 1 lần, kèm hiệu quả [Kịch Độc], duy trì 2 lượt, 30% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, bản thân hồi 50 +{8} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "poison",
          "duration": 2
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "lien_thanh": {
      "id": "lien_thanh",
      "name": "Liên Thành",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LIÊN THÀNH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 75% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "yeu_thuan": {
      "id": "yeu_thuan",
      "name": "Yêu Thuẫn",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "YÊU THUẪN",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công). Toàn phe ta binh lực tối đa tăng 20%, duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "dong_quan_phong_thu": {
      "id": "dong_quan_phong_thu",
      "name": "Đóng Quân Phòng Thủ",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "ĐÓNG QUÂN PHÒNG TH",
        "motif": "heal"
      },
      "desc": "[Hỗ trợ] Trị liệu toàn phe ta (lượng trị liệu bằng 20% Mưu Công, giúp toàn phe ta vào [Đề Kháng], duy trì 3 lượt, toàn phe ta hồi 25 +{4} Sĩ Khí",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "loan_the_hao_kiet": {
      "id": "loan_the_hao_kiet",
      "name": "Loạn Thế Hào Kiệt",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LOẠN THẾ HÀO KIỆT",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Toàn phe địch bị [Tỏa Binh], duy trì 3 lượt, toàn phe ta nhận [Đề Kháng], duy trì 3 lượt, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hung_cu": {
      "id": "hung_cu",
      "name": "Hùng Cứ",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "HÙNG CỨ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công) và hồi 25+{4} sĩ khí. Toàn phe ta nhận [Kiên Thủ] và [Đề Kháng], duy trì 3 lượt, 1 đồng đội ngẫu nhiên nhận được [Đồn Điền], duy trì 2 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "vang_danh_thien_ha": {
      "id": "vang_danh_thien_ha",
      "name": "Vang Danh Thiên Hạ",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "VANG DANH THIÊN HẠ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công) và hồi 25+{4} sĩ khí. Toàn phe ta nhận [Kiên Thủ] và [Đề Kháng], duy trì 3 lượt, 1 đồng đội ngẫu nhiên nhận được [Đồn Điền], duy trì 2 lượt.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "mon_sinh_tu_hai": {
      "id": "mon_sinh_tu_hai",
      "name": "Môn Sinh Tứ Hải",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "MÔN SINH TỨ HẢI",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công) và hồi 25+{4} sĩ khí. Toàn phe ta nhận [Kiên Thủ] và [Đề Kháng], duy trì 3 lượt, 1 đồng đội ngẫu nhiên nhận được [Đồn Điền], duy trì 2 lượt.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "doc_chu": {
      "id": "doc_chu",
      "name": "Độc Chú",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "ĐỘC CHÚ",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 17% Mưu Công, 40% khiến mục tiêu bị [Trúng Độc], duy trì 3 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "thuong_tran": {
      "id": "thuong_tran",
      "name": "Thương Trận",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THƯƠNG TRẬN",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 560% sát thương vật lý, toàn phe ta nhận [Phản Kích], duy trì 3 lượt, bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "rung_giao_tua_tua": {
      "id": "rung_giao_tua_tua",
      "name": "Rừng Giáo Tua Tủa",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "RỪNG GIÁO TUA TỦA",
        "motif": "slash"
      },
      "desc": "[Vật Lý] Địch trên hàng dọc chịu 6400% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao. Toàn phe ta nhận hiệu quả [Thần Binh], [Kiêu Binh], duy trì 3 lượt. Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bach_ma_tuong_quan": {
      "id": "bach_ma_tuong_quan",
      "name": "Bạch Mã Tướng Quân",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BẠCH MÃ TƯỚNG QUÂN",
        "motif": "slash"
      },
      "desc": "[Vật Lý] Địch trên hàng dọc chịu 2 lần 8400% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao. Toàn phe ta nhận hiệu quả [Thần Binh], [Kiêu Binh], duy trì 3 lượt. Bản thân hồi 50+{8} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bach_ky_duong_ky": {
      "id": "bach_ky_duong_ky",
      "name": "Bạch Kỵ Dương Kỳ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BẠCH KỴ DƯƠNG KỲ",
        "motif": "slash"
      },
      "desc": "[Vật Lý] Địch trên hàng dọc chịu 2 lần 19000% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao. Toàn phe ta nhận hiệu quả [Thần Binh], [Kiêu Binh], duy trì 3 lượt. Bản thân hồi 75+{8} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "loi_co": {
      "id": "loi_co",
      "name": "Lôi Cổ",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.45,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "LÔI CỔ",
        "motif": "thunder"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta hồi 75 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "hieu_trieu": {
      "id": "hieu_trieu",
      "name": "Hiệu Triệu",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "HIỆU TRIỆU",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta hồi 85+{4} sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "dinh_quan_co": {
      "id": "dinh_quan_co",
      "name": "Định Quân Cổ",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "ĐỊNH QUÂN CỔ",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Bản thân nhận [Thủ Hộ], duy trì 3 lượt, tướng khác của phe ta hồi 85+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "tu_thu_giu_minh": {
      "id": "tu_thu_giu_minh",
      "name": "Tự Thủ Giữ Mình",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TỰ THỦ GIỮ MÌNH",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Tăng cho đồng đội 85+{4} sĩ khí, toàn phe ta nhận hiệu quả [Kiên Thủ], duy trì 3 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero"
    },
    "bao_ve_kinh_giang": {
      "id": "bao_ve_kinh_giang",
      "name": "Bảo Vệ Kinh Giang",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "BẢO VỆ KINH GIANG",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Tăng cho đồng đội 85+{4} sĩ khí, toàn phe ta nhận hiệu quả [Anh Dũng], [Kiên Thủ], duy trì 3 lượt.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "te_xa": {
      "id": "te_xa",
      "name": "Tề Xạ",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.24,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TỀ XẠ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 124% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "vo_ngai": {
      "id": "vo_ngai",
      "name": "Vô Ngại",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.45,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "VÔ NGẠI",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Miễn Dịch], duy trì 2 lượt, toàn phe ta hồi 25 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "no_tram": {
      "id": "no_tram",
      "name": "Nộ Trảm",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.4,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NỘ TRẢM",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 140% Pháp Công, gây cho 1 đơn vị địch 2 lần sát thương, lần lượt là 125%, 100% Pháp Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "hits": 2
    },
    "tram_sat": {
      "id": "tram_sat",
      "name": "Trảm Sát",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TRẢM SÁT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 450% Pháp Công, lính mục tiêu càng ít sát thương càng cao.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "kieu_tuong": {
      "id": "kieu_tuong",
      "name": "Kiêu Tướng",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KIÊU TƯỚNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 445% Pháp Công, đơn vị lính ít nhất phe ta nhận [Hộ Thuẫn], duy trì 2 lượt, 2 kẻ địch ngẫu nhiên bị [Treo Thưởng], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nhat_ky_pha_thanh": {
      "id": "nhat_ky_pha_thanh",
      "name": "Nhất Kỵ Phá Thánh",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NHẤT KỴ PHÁ THÁNH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 2000% Pháp Công, đồng đội lính ít nhất nhận [Hộ Thuẫn], duy trì 2 lượt. Khiến 2 kẻ địch ngẫu nhiên bị [Treo Thưởng] không thể giải trừ, duy trì 2 lượt. Bản thân nhận [Thấu Suốt] không thể giải trừ, duy trì 3 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "quy_tuong_pha_thanh": {
      "id": "quy_tuong_pha_thanh",
      "name": "Quỷ Tướng Phá Thánh",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "QUỶ TƯỚNG PHÁ THÁN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 6000% Pháp Công, lính địch càng nhiều sát thương càng cao, giúp tướng phe ta có lính ít nhất nhận [Hộ Thuẫn], duy trì 2 lượt, khiến 2 kẻ địch ngẫu nhiên nhận [Treo Thưởng] không thể giải trừ, duy trì 2 lượt. Bản thân nhận [Phá Thánh] và [Thấu Suốt] khô",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thiet_ky": {
      "id": "thiet_ky",
      "name": "Thiết Kỵ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIẾT KỴ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 135% Pháp Công. Mỗi lần sát thương, 25% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "phu_do": {
      "id": "phu_do",
      "name": "Phù Đồ",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHÙ ĐỒ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 230% Pháp Công. Mỗi lần sát thương, 25% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "dung_tuong": {
      "id": "dung_tuong",
      "name": "Dũng Tướng",
      "damageType": "physical",
      "pattern": "self",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "DŨNG TƯỚNG",
        "motif": "buff"
      },
      "desc": "[C.Pháp] Tấn công 500 sĩ khí 4 lần, lần lượt gây ra 300%, 400%, 500%, 600% Pháp Công lên mục tiêu ngẫu nhiên, bản thân nhận [Thấu Suốt], duy trì 1 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 4,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nhat_ky_duong_thien": {
      "id": "nhat_ky_duong_thien",
      "name": "Nhất Kỵ Đương Thiên",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NHẤT KỴ ĐƯƠNG THIÊ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Pháp Công liên tục 5 lần 500 sĩ khí lên mục tiêu địch ngẫu nhiên, gây sát thương x2.5 cho mục tiêu có Treo Thưởng, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 5,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "quy_tuong_tru_than": {
      "id": "quy_tuong_tru_than",
      "name": "Quỷ Tướng Tru Thần",
      "damageType": "physical",
      "pattern": "self",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "QUỶ TƯỚNG TRU THẦN",
        "motif": "buff"
      },
      "desc": "[C.Pháp] Tấn công 500 sĩ khí. Gây 5 lần 9000% Pháp Công. Bản thân nhận [Tru Thần] và [Thấu Suốt] không thể giải trừ, duy trì 1 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 5,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "quy_mon": {
      "id": "quy_mon",
      "name": "Quỷ Môn",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "QUỶ MÔN",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 205% Mưu Công. Có 12% khiến mục tiêu bị [Khống Chế], duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "ky_mon": {
      "id": "ky_mon",
      "name": "Kỳ Môn",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "KỲ MÔN",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 320% Mưu Công, 24% khiến mục tiêu bị [Treo Thưởng], duy trì 2 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "quyen_muu": {
      "id": "quyen_muu",
      "name": "Quyền Mưu",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "QUYỀN MƯU",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 2 lần 5500% Mưu Công, 40% khiến tướng địch bị [Treo Thưởng] không thể giải trừ, duy trì 2 lượt, bản thân nhận [Tước Đoạt], duy trì 2 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2
    },
    "quyen_bien": {
      "id": "quyen_bien",
      "name": "Quyền Biến",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "QUYỀN BIẾN",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 2 lần 9000% Mưu Công, gây cho mục tiêu lính ít nhất 1 lần 29000% Mưu Công, chênh lệch điểm Trí giữa bản thân và mục tiêu càng lớn sát thương càng cao, 40% khiến tướng địch bị [Treo Thưởng] không thể giải trừ ((Nếu mục tiêu bị [Treo Thưởng] tử vong, cả",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2
    },
    "kich_no": {
      "id": "kich_no",
      "name": "Kích Nộ",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KÍCH NỘ",
        "motif": "slash"
      },
      "desc": "[Thường] Gây cho 1 kẻ địch 500% sát thương vật lý, bản thân nhận [Kích Nộ], duy trì 3 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "am_te": {
      "id": "am_te",
      "name": "Ám Tế",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.28,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "ÁM TẾ",
        "motif": "shadow"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 2 lần 128% Mưu Công, mục tiêu bị [Ám Tế], duy trì 2 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "hu_thuc": {
      "id": "hu_thuc",
      "name": "Hư Thực",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "purple",
        "text": "HƯ THỰC",
        "motif": "shadow"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 2 lần 220% Mưu Công, giải trừ trạng thái có lợi của mục tiêu, mục tiêu bị [Ám Tế], duy trì 3 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "silence",
          "chance": 0.7,
          "duration": 2
        }
      ]
    },
    "thuan_kich": {
      "id": "thuan_kich",
      "name": "Thuẫn Kích",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.25,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THUẪN KÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Gây cho 1 kẻ địch 125% sát thương vật lý, bản thân nhận [Thủ Hộ], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "mui_nhon": {
      "id": "mui_nhon",
      "name": "Mũi Nhọn",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.3,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "MŨI NHỌN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 130% Pháp Công, khiến 1 kẻ địch hàng sau chịu 130% Pháp Công, bản thân nhận [Hội Tâm], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "dot_tien": {
      "id": "dot_tien",
      "name": "Đột Tiến",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.54,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ĐỘT TIẾN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 154% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "xa_sat": {
      "id": "xa_sat",
      "name": "Xạ Sát",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "XẠ SÁT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Khiến 1 kẻ địch hàng sau chịu 235% Pháp Công, bản thân nhận [Hội Tâm], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "dot_tap": {
      "id": "dot_tap",
      "name": "Đột Tập",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.92,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ĐỘT TẬP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 192% Pháp Công, Vật Công của bản thân tăng 25%, duy trì 2 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "ly_gian": {
      "id": "ly_gian",
      "name": "Ly Gián",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "LY GIÁN",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 92% Mưu Công. Bản thân nhận trị liệu (Mức trị liệu bằng 50% Mưu Công).",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "yeu_giap": {
      "id": "yeu_giap",
      "name": "Yêu Giáp",
      "damageType": "physical",
      "pattern": "self",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "YÊU GIÁP",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Bản thân nhận trị liệu (Mức trị liệu bằng 40% Pháp Công). Binh lực tối đa của bản thân tăng 20%, duy trì 2 lượt. Bản thân nhận [Kinh Cúc], [Hồi Phục], duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "hai_tieu": {
      "id": "hai_tieu",
      "name": "Hải Tiếu",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "HẢI TIẾU",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 98% Mưu Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "mai_lang": {
      "id": "mai_lang",
      "name": "Mai Lãng",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.25,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "MAI LÃNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 125% Mưu Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "long_dao": {
      "id": "long_dao",
      "name": "Long Đào",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "LONG ĐÀO",
        "motif": "dragon"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 245% Mưu Công.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "thuy_cong": {
      "id": "thuy_cong",
      "name": "Thủy Công",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THỦY CÔNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 385% Mưu Công.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "chan_kich": {
      "id": "chan_kich",
      "name": "Chấn Kích",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CHẤN KÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Gây cho 1 kẻ địch 550% sát thương vật lý. Khiến Vật Phòng toàn phe địch giảm 50+{3%}%, duy trì 3 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "phi_xa": {
      "id": "phi_xa",
      "name": "Phi Xạ",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHI XẠ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Tướng hàng ngang chịu 135% Pháp Công, bản thân nhận [Miễn Dịch], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "lien_no": {
      "id": "lien_no",
      "name": "Liên Nỏ",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LIÊN NỎ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 2 lần 135% Pháp Công, bản thân nhận [Miễn Dịch], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "huyet_nhan": {
      "id": "huyet_nhan",
      "name": "Huyết Nhẫn",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HUYẾT NHẪN",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 350% sát thương vật lý, Vật Công của toàn phe ta tăng 100%, duy trì 3 lượt, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nhue_nhan": {
      "id": "nhue_nhan",
      "name": "Nhuệ Nhẫn",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NHUỆ NHẪN",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 650% sát thương vật lý, Vật Công của toàn phe ta tăng 200%, duy trì 3 lượt, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "lien_hoan": {
      "id": "lien_hoan",
      "name": "Liên Hoàn",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LIÊN HOÀN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 70% Pháp Công, 20% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "lien_kich": {
      "id": "lien_kich",
      "name": "Liên Kích",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.54,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LIÊN KÍCH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 154% Pháp Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "con_thach": {
      "id": "con_thach",
      "name": "Cổn Thạch",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.57,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "CỔN THẠCH",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 157% Mưu Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "phien_dong": {
      "id": "phien_dong",
      "name": "Phiến Động",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.93,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "PHIẾN ĐỘNG",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 193% Mưu Công. Bản thân nhận trị liệu (Mức trị liệu bằng 20% Mưu Công).",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "muu_thu": {
      "id": "muu_thu",
      "name": "Mưu Thủ",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "MƯU THỦ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 270% Mưu Công. Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công). Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "loan_the_pho_do": {
      "id": "loan_the_pho_do",
      "name": "Loạn Thế Phổ Độ",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "orange",
        "text": "LOẠN THẾ PHỔ ĐỘ",
        "motif": "tiger"
      },
      "desc": "[Kế Sách] Sát thương Mưu Công toàn phe địch 3 lần, giảm Mưu Phòng toàn phe địch 2 lượt, hồi lính toàn phe ta, bản thân hồi 50 +{10} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "te_the_chi_qua": {
      "id": "te_the_chi_qua",
      "name": "Tế Thế Chỉ Qua",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TẾ THẾ CHỈ QUA",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 2 lần 5200% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Chuyển 100% sát thương thành trị liệu cho toàn phe ta (không vượt quá 10% binh lực tối đa), bản thân nhận hiệu quả [Áp Chế], duy trì 3 lượt, sau đó hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "kim_quy_yeu_luoc": {
      "id": "kim_quy_yeu_luoc",
      "name": "Kim Quý Yếu Lược",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "KIM QUÝ YẾU LƯỢC",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 2 lần 12000% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Chuyển 100% sát thương thành trị liệu cho toàn phe ta (không vượt quá 10% binh lực tối đa), bản thân nhận hiệu quả [Áp Chế], duy trì 3 lượt, sau đó hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "tu_sanh": {
      "id": "tu_sanh",
      "name": "Tử Sanh",
      "damageType": "strategy",
      "pattern": "self",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TỬ SANH",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Bản thân nhận trị liệu (Mức trị liệu bằng 294% Mưu Công).",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "ky_xa": {
      "id": "ky_xa",
      "name": "Kỵ Xạ",
      "damageType": "physical",
      "pattern": "row",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KỴ XẠ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 400% Pháp Công, Pháp Công của bản thân tăng 40%, duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "phi_ngua_giuong_cung": {
      "id": "phi_ngua_giuong_cung",
      "name": "Phi Ngựa Giương Cung",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHI NGỰA GIƯƠNG CU",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Pháp Công tăng 60%+{7%}%, duy trì 2 lượt, khiến địch trên hàng ngang chịu 3000% Pháp Công, tướng địch lính ít nhất bị [Sợ Hãi], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "minh_hoa_lieu_nguyen": {
      "id": "minh_hoa_lieu_nguyen",
      "name": "Minh Hỏa Liêu Nguyên",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "MINH HỎA LIÊU NGUY",
        "motif": "fire"
      },
      "desc": "[C.Pháp] Khiến toàn phe địch chịu [Vong Đoạn], Pháp Công tăng 60%+{11%}%, duy trì 2 lượt, khiến địch trên hàng ngang chịu 10000% Pháp Công, tướng địch lính ít nhất bị [Sợ Hãi], có xác suất 70% khiến tướng địch lính nhiều nhất bị [Ngủ Say], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tru_than_diet_ma": {
      "id": "tru_than_diet_ma",
      "name": "Tru Thần Diệt Ma",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TRU THẦN DIỆT MA",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Khiến toàn phe địch chịu [Vong Đoạn], Pháp Công tăng 80% +{11%}%, duy trì 2 lượt, khiến địch trên hàng ngang chịu 16000% Pháp Công, có xác suất 70% khiến tướng địch lính ít nhất bị [Sợ Hãi], có xác suất 70% khiến tướng địch lính nhiều nhất bị [Ngủ Say], duy trì 2 lượt, b",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "no_kiem": {
      "id": "no_kiem",
      "name": "Nộ Kiếm",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.4,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NỘ KIẾM",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 140% Pháp Công, gây cho 1 đơn vị địch 125% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "thiet_bich": {
      "id": "thiet_bich",
      "name": "Thiết Bích",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THIẾT BÍCH",
        "motif": "shield"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 35% Pháp Công, bản thân nhận [Thiết Bích], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        }
      ]
    },
    "dong_xoay": {
      "id": "dong_xoay",
      "name": "Dòng Xoáy",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.7,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "DÒNG XOÁY",
        "motif": "whirlwind"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 3 lần sát thương, lần lượt là 170%, 150%, 130% Pháp Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "hits": 3
    },
    "phan_tan": {
      "id": "phan_tan",
      "name": "Phấn Tấn",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.68,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHẤN TẤN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 168% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "vien_binh": {
      "id": "vien_binh",
      "name": "Viện Binh",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "VIỆN BINH",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 85% Pháp Công. Trị liệu 1 đồng đội ngẫu nhiên (Mức trị liệu bằng 13% Mưu Công).",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "cuong_tap": {
      "id": "cuong_tap",
      "name": "Cường Tập",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.43,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CƯỜNG TẬP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 143% Pháp Công, 75% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "boc_viem": {
      "id": "boc_viem",
      "name": "Bộc Viêm",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.04,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "BỘC VIÊM",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 204% Mưu Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "xuyen_thich": {
      "id": "xuyen_thich",
      "name": "Xuyên Thích",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "XUYÊN THÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 400% sát thương vật lý.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "hoang_thien_quy_dao": {
      "id": "hoang_thien_quy_dao",
      "name": "Hoàng Thiên Quỷ Đạo",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HOÀNG THIÊN QUỶ ĐẠ",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 800% sát thương vật lý. Bản thân nhận [Thiết Bích] và [Loại Bỏ] không thể giải trừ, duy trì 1 lượt. Bản thân nhận [Liên Kích] không thể giải trừ, [Tử Chiến] không thể giải trừ, duy trì 4 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        }
      ]
    },
    "quy_coc_sach": {
      "id": "quy_coc_sach",
      "name": "Quỷ Cốc Sách",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "QUỶ CỐC SÁCH",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 8800% sát thương vật lý. Bản thân nhận [Thiết Bích] và [Loại Bỏ] không thể giải trừ, duy trì 1 lượt. Bản thân nhận [Hội Tâm], [Liên Kích] không thể giải trừ, [Tử Chiến] không thể giải trừ, duy trì 4 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        }
      ]
    },
    "ngu_hanh_pha_tran": {
      "id": "ngu_hanh_pha_tran",
      "name": "Ngũ Hành Phá Trận",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NGŨ HÀNH PHÁ TRẬN",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 19000% sát thương vật lý, bản thân nhận [Thiết Bích] và [Loại Bỏ] không thể giải trừ, duy trì 1 lượt, bản thân nhận [Hội Tâm], [Liên Kích], [Tử Chiến] không thể giải trừ, duy trì 4 lượt. Mỗi lượt giới hạn tối đa của hiệu quả [Điệp Nhẫn] của bản thân tă",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        }
      ]
    },
    "huyet_tram": {
      "id": "huyet_tram",
      "name": "Huyết Trảm",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.8,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "HUYẾT TRẢM",
        "motif": "heal"
      },
      "desc": "[Thường] Toàn phe địch chịu 180% sát thương vật lý. Trị liệu toàn phe ta (Mức trị liệu bằng 20% Vật Công).",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "pha_dich": {
      "id": "pha_dich",
      "name": "Phá Địch",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "PHÁ ĐỊCH",
        "motif": "heal"
      },
      "desc": "[Thường] Toàn phe địch chịu 320% sát thương vật lý. Toàn phe ta Vật Công tăng 30%, duy trì 2 lượt. Trị liệu toàn phe ta (Mức trị liệu bằng 20% Vật Công). Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "the_pha_dich": {
      "id": "the_pha_dich",
      "name": "Thế Phá Địch",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THẾ PHÁ ĐỊCH",
        "motif": "heal"
      },
      "desc": "[Thường] Toàn phe địch chịu 4500% sát thương vật lý, trị liệu toàn phe ta (Mức trị liệu bằng 20% Vật Công). Vật Công toàn phe ta tăng 30%, duy trì 2 lượt, giúp các đồng đội khác hồi 25 sĩ khí. Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thong_quan_pha_dich": {
      "id": "thong_quan_pha_dich",
      "name": "Thống Quân Phá Địch",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THỐNG QUÂN PHÁ ĐỊC",
        "motif": "heal"
      },
      "desc": "[Thường] Toàn phe địch chịu 19000% sát thương vật lý, trị liệu toàn phe ta (Mức trị liệu bằng 20% Vật Công), toàn phe ta nhận [Tăng Vật Công] và [Thống Quân], duy trì 2 lượt, giúp các đồng đội khác hồi 25 sĩ khí, bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bay_tran_nhu_nui": {
      "id": "bay_tran_nhu_nui",
      "name": "Bày Trận Như Núi",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "BÀY TRẬN NHƯ NÚI",
        "motif": "heal"
      },
      "desc": "[Thường] Toàn phe địch chịu 36000% sát thương vật lý, trị liệu toàn phe ta 1 lần (Mức trị liệu bằng 20% Vật Công). Toàn phe ta nhận hiệu quả [Tăng Vật Công] và [Thống Quân], duy trì 2 lượt, Giúp các đồng đội khác hồi 25 sĩ khí, bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thiet_thuong": {
      "id": "thiet_thuong",
      "name": "Thiết Thương",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.3,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIẾT THƯƠNG",
        "motif": "slash"
      },
      "desc": "[Thường] Gây cho 1 kẻ địch 130% sát thương vật lý, bản thân nhận [Thiết Bích], duy trì 1 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        }
      ]
    },
    "hoanh_tao": {
      "id": "hoanh_tao",
      "name": "Hoành Tảo",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.41,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HOÀNH TẢO",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 141% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "doc_nhan": {
      "id": "doc_nhan",
      "name": "Độc Nhẫn",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.58,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "ĐỘC NHẪN",
        "motif": "poison"
      },
      "desc": "[Thường] Gây cho 1 kẻ địch 158% sát thương vật lý, mục tiêu bị [Trúng Độc], duy trì 3 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "xa_thich": {
      "id": "xa_thich",
      "name": "Xà Thích",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.58,
      "moraleCost": 100,
      "fx": {
        "flash": "snake",
        "text": "XÀ THÍCH",
        "motif": "snake"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 158% sát thương vật lý, 75% khiến mục tiêu bị [Trúng Độc], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "liet_nhan": {
      "id": "liet_nhan",
      "name": "Liệt Nhẫn",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LIỆT NHẪN",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 320% sát thương vật lý, bản thân nhận [Kích Nộ], duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "phan_thien": {
      "id": "phan_thien",
      "name": "Phần Thiên",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHẦN THIÊN",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 1000% sát thương vật lý, khiến đơn vị địch lính nhiều nhất chịu 1400% sát thương vật lý, lính mục tiêu càng nhiều sát thương càng cao, khiến đơn vị địch lính ít nhất chịu 1400% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao, bản thân nhận",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "no_nguc_viem": {
      "id": "no_nguc_viem",
      "name": "Nộ Ngục Viêm",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "NỘ NGỤC VIÊM",
        "motif": "fire"
      },
      "desc": "[Thường] Toàn phe địch chịu 9000% sát thương vật lý, khiến đơn vị địch lính nhiều nhất chịu 10500% sát thương vật lý, lính mục tiêu càng nhiều sát thương càng cao, sau đó khiến đơn vị địch lính ít nhất chịu 10500% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao. Bản ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "hong_hoang_no_hoa": {
      "id": "hong_hoang_no_hoa",
      "name": "Hồng Hoang Nộ Hỏa",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HỒNG HOANG NỘ HỎA",
        "motif": "fire"
      },
      "desc": "[Thường] Toàn phe địch chịu 11000% sát thương vật lý, khiến đơn vị địch lính nhiều nhất chịu 11000% sát thương vật lý, lính mục tiêu càng nhiều sát thương càng cao, sau đó khiến đơn vị địch lính ít nhất chịu 11000% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao. Bản",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "than_hoa_hien_the": {
      "id": "than_hoa_hien_the",
      "name": "Thần Hỏa Hiện Thế",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "THẦN HỎA HIỆN THẾ",
        "motif": "fire"
      },
      "desc": "[Thường] Toàn phe địch chịu 23000% sát thương vật lý, khiến đơn vị địch lính nhiều nhất chịu 25000% sát thương vật lý, lính mục tiêu càng nhiều sát thương càng cao. Sau đó khiến đơn vị địch lính ít nhất chịu 25000% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao. Bản",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "xa_thu": {
      "id": "xa_thu",
      "name": "Xạ Thủ",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.37,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "XẠ THỦ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 137% Pháp Công, tướng khác của phe ta chịu 54% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "gio_loc": {
      "id": "gio_loc",
      "name": "Gió Lốc",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "GIÓ LỐC",
        "motif": "whirlwind"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 37% Mưu Công, mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "pha_phu": {
      "id": "pha_phu",
      "name": "Phá Phủ",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.8,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHÁ PHỦ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 180% Pháp Công, lính địch càng ít sát thương càng cao.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "kich_doc": {
      "id": "kich_doc",
      "name": "Kịch Độc",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.3,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "KỊCH ĐỘC",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 130% Mưu Công, mục tiêu bị [Trúng Độc], duy trì 5 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "doc_ke": {
      "id": "doc_ke",
      "name": "Độc Kế",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.05,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "ĐỘC KẾ",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 205% Mưu Công, mục tiêu bị [Đào Binh], duy trì 3 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "tien_vu": {
      "id": "tien_vu",
      "name": "Tiễn Vũ",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue_water",
        "text": "TIỄN VŨ",
        "motif": "water"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 87% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "thi_huyet": {
      "id": "thi_huyet",
      "name": "Thị Huyết",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THỊ HUYẾT",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 300% sát thương vật lý, bản thân nhận [Hấp Huyết], duy trì 3 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "cuong_no": {
      "id": "cuong_no",
      "name": "Cuồng Nộ",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CUỒNG NỘ",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 2000% sát thương vật lý, khiến Vật Phòng toàn phe địch giảm 20%, duy trì 3 lượt, khiến tướng địch lính nhiều nhất và 1 tướng địch ngẫu nhiên khác bị [Treo Thưởng] không thể giải trừ, duy trì 2 lượt. Bản thân nhận [Thấu Suốt] không thể giải trừ, du",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "man_no_hong": {
      "id": "man_no_hong",
      "name": "Man Nộ Hống",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "MAN NỘ HỐNG",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 7000% sát thương vật lý, khiến mục tiêu bị [Treo Thưởng] không thể giải trừ, duy trì 2 lượt. Khiến 1 kẻ địch hàng sau chịu 7000% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao, khiến Vật Phòng toàn phe địch giảm 20%, duy trì 3 lượt. ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "di_toc_xam_nhap": {
      "id": "di_toc_xam_nhap",
      "name": "Dị Tộc Xâm Nhập",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "DỊ TỘC XÂM NHẬP",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 9000% sát thương vật lý, khiến mục tiêu bị [Treo Thưởng] không thể giải trừ, duy trì 2 lượt. Khiến 1 kẻ địch hàng sau chịu 2 lần 7000% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao, khiến Vật Phòng toàn phe địch giảm 20%, duy trì 3 ",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "dai_vuong_than_chinh": {
      "id": "dai_vuong_than_chinh",
      "name": "Đại Vương Thân Chinh",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ĐẠI VƯƠNG THÂN CHI",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 18500% sát thương vật lý, khiến mục tiêu bị [Treo Thưởng] không thể giải trừ, duy trì 2 lượt. Sau đó khiến 1 kẻ địch hàng sau 2 lần14500% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao, khiến Vật Phòng của toàn phe địch giảm 20+{13%}",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "binh_phat": {
      "id": "binh_phat",
      "name": "Binh Phạt",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.1,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BINH PHẠT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 110% Pháp Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "cuu_vien": {
      "id": "cuu_vien",
      "name": "Cứu Viện",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.8,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CỨU VIỆN",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 180% Pháp Công. Trị liệu toàn phe ta (Mức trị liệu bằng 20% Pháp Công).",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "tran_hon": {
      "id": "tran_hon",
      "name": "Trấn Hồn",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TRẤN HỒN",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Tấn công toàn phe địch, trị liệu Toàn phe đội phe ta và tăng 25 +{6} sĩ khí, bản thân nhận Nguyệt Hồn 3 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "phong_ngu_can_than": {
      "id": "phong_ngu_can_than",
      "name": "Phòng Ngự Cẩn Thận",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "PHÒNG NGỰ CẨN THẬN",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 2000% Pháp Công, trị liệu toàn phe ta (Mức trị liệu bằng 20% Pháp Công), giúp Pháp Phòng của đồng đội khác tăng 10%, duy trì 2 lượt. Bản thân nhận [Nguyệt Hồn], duy trì 3 lượt, giúp các đồng đội khác hồi 25+{6} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "che_ngu_quan_dich": {
      "id": "che_ngu_quan_dich",
      "name": "Chế Ngự Quân Địch",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CHẾ NGỰ QUÂN ĐỊCH",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 17000% Pháp Công, trị liệu toàn phe ta 2 lần (Mức trị liệu bằng 20% Pháp Công), giúp tướng khác phe ta tăng pháp phòng 40%, duy trì 2 lượt. Bản thân nhận [Nguyệt Hồn], duy trì 3 lượt, toàn bộ tướng phe ta hồi 25+{8} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "tran_thu_han_thuy": {
      "id": "tran_thu_han_thuy",
      "name": "Trấn Thủ Hán Thủy",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "blue_water",
        "text": "TRẤN THỦ HÁN THỦY",
        "motif": "water"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 32000% Pháp Công, trị liệu toàn phe ta 3 lần (Mức trị liệu bằng 20% Pháp Công), giúp tướng khác phe ta tăng pháp phòng 40%, duy trì 2 lượt. Bản thân nhận [Nguyệt Hồn], duy trì 3 lượt, toàn bộ tướng phe ta hồi 25 +{10} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "no_tap": {
      "id": "no_tap",
      "name": "Nộ Tập",
      "damageType": "physical",
      "pattern": "row",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NỘ TẬP",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng ngang chịu 310% sát thương vật lý, bản thân nhận [Anh Dũng], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "phan_diet": {
      "id": "phan_diet",
      "name": "Phần Diệt",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "PHẦN DIỆT",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 400% Mưu Công, toàn phe ta chịu 52% Mưu Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "khai_trieu_thua_van": {
      "id": "khai_trieu_thua_van",
      "name": "Khai Triều Thừa Vận",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "KHAI TRIỀU THỪA VẬ",
        "motif": "thunder"
      },
      "desc": "[Hỗ Trợ] [200 Sĩ Khí] Tăng toàn bộ Chỉ Huy, Võ, Trí của ta 50+{4} điểm, hiệu quả không thể giải trừ, tất cả tướng phe ta nhận [Đóng Đô], bản thân nhận [Lôi Cổ 2], tất cả hiệu quả duy trì 3 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero"
    },
    "tran_dinh_son_ha": {
      "id": "tran_dinh_son_ha",
      "name": "Trấn Định Sơn Hà",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "TRẤN ĐỊNH SƠN HÀ",
        "motif": "thunder"
      },
      "desc": "[Hỗ Trợ] [200 Sĩ Khí] Hồi phục toàn bộ lính của ta 1 lần, tăng toàn bộ Chỉ Huy, Võ, Trí của ta 60+{8} điểm, hiệu quả không thể giải trừ, tất cả tướng phe ta nhận [Đóng Đô], bản thân nhận [Lôi Cổ 2], tất cả hiệu quả duy trì 3 lượt.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "thinh_the_vuong_quyen": {
      "id": "thinh_the_vuong_quyen",
      "name": "Thịnh Thế Vương Quyền",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.95,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "THỊNH THẾ VƯƠNG QU",
        "motif": "thunder"
      },
      "desc": "[Hỗ Trợ] [200 Sĩ Khí] Hồi phục toàn bộ lính của ta 2 lần, tăng toàn bộ Chỉ Huy, Võ, Trí của ta 70+{10} điểm, hiệu quả không thể giải trừ, tất cả tướng phe ta nhận [Đóng Đô], bản thân nhận [Lôi Cổ 2], tất cả hiệu quả duy trì 3 lượt.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "huy_hoai": {
      "id": "huy_hoai",
      "name": "Hủy Hoại",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HỦY HOẠI",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 92% Pháp Công, tấn công của mục tiêu giảm 35%, duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "tuyen_muc_uy_nghi": {
      "id": "tuyen_muc_uy_nghi",
      "name": "Tuyên Mục Uy Nghi",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "TUYÊN MỤC UY NGHI",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Khiến đơn vị địch lính ít nhất chịu 3 lần 8000% Mưu Công, khiến mục tiêu bị [Treo Thưởng] không thể giải trừ, duy trì 2 lượt. Khiến tướng địch sĩ khí tối đa bị [Vô Ngôn], duy trì 2 lượt. Bản thân hồi 50+{8} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tuyet_tinh_vo_hoi": {
      "id": "tuyet_tinh_vo_hoi",
      "name": "Tuyệt Tình Vô Hối",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "TUYỆT TÌNH VÔ HỐI",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Khiến đơn vị địch lính ít nhất chịu 3 lần 18000% Mưu Công, khiến mục tiêu bị [Treo Thưởng] không thể giải trừ. Nếu mục tiêu bị [Treo Thưởng] tử vong, toàn phe ta tăng 50+{9} sĩ khí, duy trì cả trận. Khiến tướng địch sĩ khí cao nhất bị [Vô Ngôn], duy trì 2 lượt. Bản thân",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "no_xich": {
      "id": "no_xich",
      "name": "Nộ Xích",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NỘ XÍCH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 370% Pháp Công, giảm 125 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "khich_le": {
      "id": "khich_le",
      "name": "Khích Lệ",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "KHÍCH LỆ",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Một đơn vị phe ta ngãu nhiên hồi 100 sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thi_doc": {
      "id": "thi_doc",
      "name": "Thi Độc",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "THI ĐỘC",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 400% Mưu Công, 80% khiến mục tiêu bị [Thi Độc], duy trì 2 lượt, mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "thuc_tam": {
      "id": "thuc_tam",
      "name": "Thực Tâm",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "THỰC TÂM",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Tấn công 1 kẻ địch, gây Choáng 1 lượt, có xác suất gây hiệu quả Thi Độc trong 2 lượt. Bản thân nhận hiệu quả Thủ Hộ trong 2 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "hu_thi_doc": {
      "id": "hu_thi_doc",
      "name": "Hủ Thi Độc",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "HỦ THI ĐỘC",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 12000% Mưu Công, khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, khiến mục tiêu bị [Thi Độc], duy trì 2 lượt, bản thân nhận [Thủ Hộ], duy trì 2 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "quy_mon_thi_doc": {
      "id": "quy_mon_thi_doc",
      "name": "Quỷ Môn Thi Độc",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "QUỶ MÔN THI ĐỘC",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 22000% Mưu Công, khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, khiến mục tiêu bị [Thi Độc], duy trì 2 lượt, bản thân vào trạng thái [Thủ Hộ], duy trì 2 lượt.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "on_dich": {
      "id": "on_dich",
      "name": "Ôn Dịch",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "green_poison",
        "text": "ÔN DỊCH",
        "motif": "poison"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 2 lần 100% Mưu Công, mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, mục tiêu bị [Trúng Độc], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "poison",
          "duration": 2
        }
      ]
    },
    "thiet_no": {
      "id": "thiet_no",
      "name": "Thiết Nõ",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.15,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIẾT NÕ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 2 lần 115% Pháp Công. Bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hoa_no": {
      "id": "hoa_no",
      "name": "Hỏa Nỏ",
      "damageType": "physical",
      "pattern": "row",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HỎA NỎ",
        "motif": "fire"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 2 lần 235% Pháp Công, bản thân nhận [Miễn Dịch], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "kinh_no": {
      "id": "kinh_no",
      "name": "Kình Nỏ",
      "damageType": "physical",
      "pattern": "row",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KÌNH NỎ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 2 lần 390% Pháp Công, bản thân nhận [Loại Bỏ], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "than_co_no": {
      "id": "than_co_no",
      "name": "Thần Cơ Nỏ",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THẦN CƠ NỎ",
        "motif": "slash"
      },
      "desc": "[Chiến+Kế] Địch trên hàng ngang chịu 2 lần 2000% Pháp Công và 1 lần 2000% Mưu Công, bản thân nhận [Loại Bỏ], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ngu_say": {
      "id": "ngu_say",
      "name": "Ngủ Say",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NGỦ SAY",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] 20% khiến toàn phe địch bị [Ngủ Say], duy trì 3 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "tat_xung": {
      "id": "tat_xung",
      "name": "Tật Xung",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.3,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TẬT XUNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 130% Pháp Công, khiến 1 kẻ địch hàng sau chịu 130% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "ham_tran_tien_dang": {
      "id": "ham_tran_tien_dang",
      "name": "Hãm Trận Tiên Đăng",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HÃM TRẬN TIÊN ĐĂNG",
        "motif": "slash"
      },
      "desc": "[Vật Lý] Dùng 500 sĩ khí gây 6500% sát thương lên địch trên hàng dọc, tỉ lệ lính bản thân càng thấp sát thương càng cao, sau đó nhận [Lực Đoạn], [Huyết Nhẫn 2], duy trì 4 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero"
    },
    "ham_doanh_thoi_nhue": {
      "id": "ham_doanh_thoi_nhue",
      "name": "Hãm Doanh Thôi Nhuệ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HÃM DOANH THÔI NHU",
        "motif": "slash"
      },
      "desc": "[Vật Lý] Dùng 500 sĩ khí gây 20000% sát thương lên địch trên hàng dọc, tỉ lệ lính bản thân càng thấp sát thương càng cao, sau đó nhận [Lực Đoạn], [Huyết Nhẫn 2], [Bền Bỉ], duy trì 4 lượt.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero"
    },
    "tien_dang_tu_si": {
      "id": "tien_dang_tu_si",
      "name": "Tiên Đăng Tử Sĩ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TIÊN ĐĂNG TỬ SĨ",
        "motif": "slash"
      },
      "desc": "[Vật Lý] Dùng 700 sĩ khí gây 25000% sát thương lên địch trên hàng dọc, tỉ lệ lính bản thân càng thấp sát thương càng cao, sau đó nhận [Lực Đoạn], [Huyết Nhẫn 2], [Bền Bỉ], duy trì 4 lượt.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero"
    },
    "ten_lac": {
      "id": "ten_lac",
      "name": "Tên Lạc",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TÊN LẠC",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 92% Pháp Công, gây cho 1 đơn vị địch 160% Pháp Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "cu_ma": {
      "id": "cu_ma",
      "name": "Cự Mã",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.28,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CỰ MÃ",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng ngang chịu 128% sát thương vật lý, 75% khiến Pháp Công của địch giảm 25%, duy trì 2 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "chuoc_gioi": {
      "id": "chuoc_gioi",
      "name": "Chước Giới",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.5,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CHƯỚC GIỚI",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 150% Pháp Công, tấn công của mục tiêu giảm 100%, duy trì 1 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "tien_dap": {
      "id": "tien_dap",
      "name": "Tiễn Đạp",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TIỄN ĐẠP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 250% Pháp Công, 50% khiến mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nhieu_tap": {
      "id": "nhieu_tap",
      "name": "Nhiễu Tập",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.0,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NHIỄU TẬP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 200% Pháp Công, mục tiêu bị [Hỗn Loạn], duy trì 1 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "npc_troi_tru_dat_diet": {
      "id": "npc_troi_tru_dat_diet",
      "name": "[NPC] Trời Tru Đất Diệt",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.4300000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "[NPC] TRỜI TRU ĐẤT",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 7000% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Khiến mục tiêu bị [Tan Vỡ] và [E Sợ], bản thân hồi 0+{4} sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bao_ho": {
      "id": "bao_ho",
      "name": "Bảo Hộ",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "BẢO HỘ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 85% Mưu Công. Trị liệu tướng có lính ít nhất phe ta (Mức trị liệu bằng 50% Mưu Công). Toàn phe ta nhận [Thủ Hộ], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "cau_phuc": {
      "id": "cau_phuc",
      "name": "Cầu Phúc",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.77,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CẦU PHÚC",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 177% Mưu Công. Trị liệu cho bản thân và đồng đội lính ít nhất (Mức trị liệu bằng 50% Mưu Công). Toàn phe ta nhận [Thủ Hộ], duy trì 2 lượt. Bản thân hồi 50+{8} sĩ khí",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "chien_ca": {
      "id": "chien_ca",
      "name": "Chiến Ca",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CHIẾN CA",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 350% Mưu Công. Khiến tất cả tấn công của mục tiêu giảm 100%, duy trì 1 lượt. Bản thân nhận trị liệu (Mức trị liệu bằng 50% Mưu Công). Trị liệu tướng có lính ít nhất phe ta 2 lần (Mức trị liệu bằng 50% Mưu Công). Toàn phe ta nhận [Thủ Hộ], duy trì 2 lượ",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nguyet_loan_vu": {
      "id": "nguyet_loan_vu",
      "name": "Nguyệt Loạn Vũ",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "NGUYỆT LOẠN VŨ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 600% Mưu Công. Khiến tấn công của mục tiêu giảm 100%, duy trì 1 lượt. Bản thân nhận trị liệu (Mức trị liệu bằng 50% Mưu Công), sau đó trị liệu đồng đội lính ít nhất 2 lần (Mức trị liệu bằng 50% Mưu Công). toàn phe ta nhận [Thủ Hộ], duy trì 2 lượt. Bản ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "song_sao_ruc_ro": {
      "id": "song_sao_ruc_ro",
      "name": "Sông Sao Rực Rỡ",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "SÔNG SAO RỰC RỠ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 2000% Mưu Công, khiến tấn công của mục tiêu giảm 100%, duy trì 1 lượt. Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công), sau đó trị liệu đồng đội lính ít nhất 2 lần (Mức trị liệu bằng 20% Mưu Công), toàn phe ta nhận [Thủ Hộ], duy trì 2 lượt. Bản t",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bi_ngan_tinh_kieu": {
      "id": "bi_ngan_tinh_kieu",
      "name": "Bỉ Ngạn Tinh Kiều",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "BỈ NGẠN TINH KIỀU",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Khiến toàn bộ phe địch chịu 2000% mưu công, khiến tấn công của mục tiêu đơn giảm 200%, duy trì 1 lượt. Trị liệu 2 lần cho toàn bộ phe ta (Mức trị liệu bằng 20% mưu công), sau đó trị liệu đồng đội lính ít nhất 2 lần (Mức trị liệu bằng 20% mưu công), toàn bộ phe ta nhận [",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ba_thuong": {
      "id": "ba_thuong",
      "name": "Bá Thương",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BÁ THƯƠNG",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 400% sát thương vật lý, bản thân nhận [Thiết Bích], duy trì 1 lượt, bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "long_thuong": {
      "id": "long_thuong",
      "name": "Long Thương",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "LONG THƯƠNG",
        "motif": "dragon"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 1400% sát thương vật lý, bản thân nhận [Thiết Bích], duy trì 1 lượt, bản thân nhận [Tòng Long], duy trì 4 lượt, bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ngam_tho_giai_sau": {
      "id": "ngam_tho_giai_sau",
      "name": "Ngâm Thơ Giải Sầu",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "NGÂM THƠ GIẢI SẦU",
        "motif": "shield"
      },
      "desc": "[Kế Sách] Bản thân nhận trị liệu (Mức trị liệu bằng 20% Mưu Công). Có 20% khiến các tướng khác trong phe ta nhận [Thiết Bích], duy trì 2 lượt, các tướng khác trong phe ta hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "bai_ca_bien_ai": {
      "id": "bai_ca_bien_ai",
      "name": "Bài Ca Biên Ải",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "BÀI CA BIÊN ẢI",
        "motif": "shield"
      },
      "desc": "[Kế Sách] Bản thân nhận trị liệu 1 lần, sau đó trị liệu cho đồng đội ngẫu nhiên 1 lần (Mức trị liệu bằng 20% Mưu Công). Có xác suất 20% tăng cho các đồng đội khác hiệu quả [Thiết Bích], duy trì 2 lượt, giúp đồng đội hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "thien_khai": {
      "id": "thien_khai",
      "name": "Thiên Khải",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.1,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THIÊN KHẢI",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 210% Mưu Công, lính mục tiêu càng ít sát thương càng cao, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "xua_duoi": {
      "id": "xua_duoi",
      "name": "Xua Đuổi",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "XUA ĐUỔI",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Giải trừ hiệu quả có lợi toàn phe địch (Khí chiến đấu với người chơi khác, giải trừ tối đa 2 hiệu quả có lợi của mỗi tướng địch), giúp tướng khác phe ta hồi 25+{4} sĩ khí, bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thanh_tam": {
      "id": "thanh_tam",
      "name": "Thanh Tâm",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THANH TÂM",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Giải trừ hiệu quả có lợi toàn phe địch (Khi chiến đấu với người chơi khác, giải trừ tối đa 2 hiệu quả có lợi của mỗi tướng địch, sau đó giải trừ 1 hiệu quả có lợi của hai tướng địch ngẫu nhiên), giúp tướng khác phe ta hồi 25+{4} sĩ khí, bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thanh_nha_can_chinh": {
      "id": "thanh_nha_can_chinh",
      "name": "Thanh Nhã Cần Chính",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THANH NHÃ CẦN CHÍN",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Giải trừ tất cả hiệu quả có lợi của toàn phe địch (Khi chiến đấu với người chơi khác, tối đa giải trừ 4 hiệu quả có lợi của mỗi mục tiêu địch), giúp các tướng khác trong phe ta hồi 50 +{4} sĩ khí, toàn phe ta nhận hiệu quả [Bền Bỉ], duy trì 2 lượt. Bản thân hồi 100 sĩ kh",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tri_lieu": {
      "id": "tri_lieu",
      "name": "Trị Liệu",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TRỊ LIỆU",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta (Mức trị liệu bằng 75% Mưu Công).",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "tri_du": {
      "id": "tri_du",
      "name": "Trị Dũ",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TRỊ DŨ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta (Mức trị liệu bằng 75% Mưu Công). Bản thân nhận [Miễn Dịch], duy trì 3 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "du_hop": {
      "id": "du_hop",
      "name": "Dũ Hợp",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "DŨ HỢP",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta 2 lần (Mức trị liệu lần lượt bằng 75% và 15% Mưu Công). Bản thân nhận [Loại Bỏ] không thể giải trừ, duy trì 3 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "an_hue_chi_vu": {
      "id": "an_hue_chi_vu",
      "name": "Ân Huệ Chi Vũ",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "ÂN HUỆ CHI VŨ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta 2 lần (Mức trị liệu lần lượt là 75% và 15% Mưu Công). Bản thân nhận [Loại Bỏ], duy trì 3 lượt, đồng đội khác nhận được [Phấn Chấn], duy trì 3 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "mua_han": {
      "id": "mua_han",
      "name": "Mưa Hạn",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "MƯA HẠN",
        "motif": "heal"
      },
      "desc": "[Kế Sách] [Thi Triển 200 Sĩ Khí] Trị liệu toàn phe ta 4~5 lần (Mức trị liệu bằng 25% Mưu Công) và bản thân hồi 50 Sĩ Khí, khiến bản thân vào [Loại Bỏ] không thể giải trừ, duy trì 3 lượt, khiến Tướng khác của phe ta vào [Phấn Chấn], duy trì 3 lượt.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 5,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "lac_thach": {
      "id": "lac_thach",
      "name": "Lạc Thạch",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.1,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "LẠC THẠCH",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 210% Mưu Công, mục tiêu mất hết sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "sat_khi": {
      "id": "sat_khi",
      "name": "Sát Khí",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "SÁT KHÍ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 230% Pháp Công, Vật Công của mục tiêu giảm 35%, duy trì 1 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "xich_long": {
      "id": "xich_long",
      "name": "Xích Long",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "XÍCH LONG",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 410% Pháp Công. Khiến Pháp Phòng của mục tiêu giảm 40%, duy trì 2 lượt. Bản thân nhận trị liệu (Mức trị liệu bằng 10% Pháp Công).",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "viem_long_pha": {
      "id": "viem_long_pha",
      "name": "Viêm Long Phá",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "VIÊM LONG PHÁ",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Khiến kẻ địch ngẫu nhiên chịu 2 lần 2600% Pháp Công. Khiến Pháp Phòng của mục tiêu giảm 40%, duy trì 2 lượt. Bản thân nhận trị liệu 2 lần (Mức trị liệu bằng 20% Pháp Công). Bản thân hồi 50+{10} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "viem_long_sat": {
      "id": "viem_long_sat",
      "name": "Viêm Long Sát",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "VIÊM LONG SÁT",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc ngẫu nhiên chịu 3 lần 5500% Pháp Công, khiến Pháp Phòng toàn phe địch giảm 30%, duy trì 2 lượt. Bản thân nhận trị liệu 2 lần (Mức trị liệu bằng 20% Pháp Công). Bản thân hồi 50+{10} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "viem_long_ky_tap": {
      "id": "viem_long_ky_tap",
      "name": "Viêm Long Kỳ Tập",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "VIÊM LONG KỲ TẬP",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Toàn phe địch Pháp Phòng giảm 30%, duy trì 2 lượt, sau đó khiến địch trên hàng dọc ngẫu nhiên chịu 4 lần 8500% Pháp Công, bản thân nhận trị liệu bằng 2 lần (Mức trị liệu bằng 20% Pháp Công). Bản thân hồi 50+{16} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 4,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "tan_ra": {
      "id": "tan_ra",
      "name": "Tan Rã",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "TAN RÃ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 550% Mưu Công, giải trừ hiệu quả có lợi của mục tiêu, Mưu Phòng của mục tiêu giảm 20%, duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "pha_hoang_sach": {
      "id": "pha_hoang_sach",
      "name": "Phá Hoàng Sách",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "PHÁ HOÀNG SÁCH",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 4800% Mưu Công, giải trừ hiệu quả có lợi của mục tiêu, Mưu Phòng của mục tiêu giảm 20%, duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "dao_phap_thien_dia": {
      "id": "dao_phap_thien_dia",
      "name": "Đạo Pháp Thiên Địa",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "ĐẠO PHÁP THIÊN ĐỊA",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang phía sau chịu 7000% Mưu Công, giảm 25 sĩ khí, lính mục tiêu càng nhiều sát thương càng cao, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thien_dia_vo_cuc": {
      "id": "thien_dia_vo_cuc",
      "name": "Thiên Địa Vô Cực",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "THIÊN ĐỊA VÔ CỰC",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Khiến địch trên hàng ngang phía sau chịu 9000% Mưu Công và giảm 25 sĩ khí, lính mục tiêu càng nhiều sát thương càng cao, bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "can_khon_ta_phap": {
      "id": "can_khon_ta_phap",
      "name": "Càn Khôn Tá Pháp",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "CÀN KHÔN TÁ PHÁP",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 2 lần 16000% Mưu Công, mỗi lần giảm 25 sĩ khí, lính mục tiêu càng nhiều sát thương càng cao, khiến mục tiêu vào trạng thái [Huyết Cúc], duy trì 3 lượt, bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tieu_sat": {
      "id": "tieu_sat",
      "name": "Tiễu Sát",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.95,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TIỄU SÁT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 195% Pháp Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tien_tran": {
      "id": "tien_tran",
      "name": "Tiễn Trận",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TIỄN TRẬN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 320% Pháp Công. Bản thân nhận [Độ Hiểm] [Đề Kháng], duy trì 3 lượt, chống đỡ sát thương bằng 15% binh lực tối đa.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "hoa_long_tien": {
      "id": "hoa_long_tien",
      "name": "Hỏa Long Tiễn",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "HỎA LONG TIỄN",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 2 lần 2000% sát thương. Bản thân nhận [Độ Hiểm] [Đề Kháng], duy trì 3 lượt, chống đỡ sát thương bằng 15% binh lực tối đa. Bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "man_thien_tien_vu": {
      "id": "man_thien_tien_vu",
      "name": "Mạn Thiên Tiễn Vũ",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue_water",
        "text": "MẠN THIÊN TIỄN VŨ",
        "motif": "water"
      },
      "desc": "[C.Pháp] Tấn công 500 sĩ khí, khiến toàn phe địch chịu 2 lần 4800% Pháp Công. Bản thân nhận [Độ Hiểm], [Đề Kháng], duy trì 3 lượt, chống đỡ sát thương bằng 15% binh lực tối đa. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "that_tinh_tien_tran": {
      "id": "that_tinh_tien_tran",
      "name": "Thất Tinh Tiễn Trận",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THẤT TINH TIỄN TRẬ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Tấn công 500 sĩ khí, khiến toàn phe địch chịu 2 lần 6800% Pháp Công. Bản thân nhận [Độ Hiểm] [Đề Kháng], duy trì 3 lượt, chống đỡ 15% sát thương binh lực tối đa, duy trì 3 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bai_nhieu": {
      "id": "bai_nhieu",
      "name": "Bài Nhiễu",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "BÀI NHIỄU",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Giải trừ hiệu quả trạng thái toàn phe ta, giúp tướng khác phe ta hồi 25 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "giai_nan": {
      "id": "giai_nan",
      "name": "Giải Nan",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.45,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "GIẢI NAN",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Giải trừ hiệu quả trạng thái toàn phe ta, giúp tướng khác phe ta hồi 25 sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "giai_tru": {
      "id": "giai_tru",
      "name": "Giải Trừ",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "GIẢI TRỪ",
        "motif": "buff"
      },
      "desc": "Giải trừ tất cả hiệu quả bất lợi cho toàn phe ta (Khi chiến đấu với người chơi khác, tối đa giải trừ 2 hiệu quả bất lợi cho mỗi tướng phe ta), đồng đội tăng 25 + {4} sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "phan_ke": {
      "id": "phan_ke",
      "name": "Phản Kế",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "PHẢN KẾ",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Giải trừ hiệu quả bất lợi toàn phe ta (Khi chiến đấu với người chơi khác, giải trừ tối đa 2 hiệu quả bất lợi cho mỗi tướng phe ta), giúp tướng khác phe ta hồi 25+{4} sĩ khí. Mỗi giải trừ một trạng thái bất lợi, giúp tướng tương ứng hồi 10 sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nho_thanh_ho_the": {
      "id": "nho_thanh_ho_the",
      "name": "Nho Thánh Hộ Thể",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "NHO THÁNH HỘ THỂ",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Giải trừ hiệu quả bất lợi toàn phe ta (Khi chiến đấu với người chơi khác, giải trừ tối đa 3 hiệu quả bất lợi cho mỗi tướng phe ta), tăng cho toàn phe ta hiệu quả [Minh Triết], duy trì 2 lượt, giúp các đồng đội khác hồi 50 +{4} sĩ khí, mỗi giải trừ 1 hiệu quả bất lợi, tướ",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "xuyen_duong": {
      "id": "xuyen_duong",
      "name": "Xuyên Dương",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.19,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "XUYÊN DƯƠNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 119% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "thanh_huy": {
      "id": "thanh_huy",
      "name": "Thanh Huy",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THANH HUY",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Nguyệt Hồn], duy trì 2 lượt, tướng khác của phe ta hồi 25+{2} sĩ khí, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "giao_nguyet_thanh_huy": {
      "id": "giao_nguyet_thanh_huy",
      "name": "Giảo Nguyệt Thanh Huy",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "GIẢO NGUYỆT THANH ",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Nguyệt Hồn], duy trì 2 lượt, các tướng khác trong phe ta hồi 25+{2} sĩ khí. Trị liệu toàn phe ta 1 lần (Mức trị liệu bằng 20% Mưu Công). Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tu_huy": {
      "id": "tu_huy",
      "name": "Tự Hủy",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.4300000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TỰ HỦY",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 600% Pháp Công, bản thân chịu 1000% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "huyet_che": {
      "id": "huyet_che",
      "name": "Huyết Chế",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "HUYẾT CHẾ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 12% Mưu Công, mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, bản thân chịu 85% Mưu Công, bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "kim_ham": {
      "id": "kim_ham",
      "name": "Kìm Hãm",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "KÌM HÃM",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 250% Mưu Công, mục tiêu bị [Hỗn Loạn], duy trì 1 lượt, bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "sach_phan": {
      "id": "sach_phan",
      "name": "Sách Phản",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "SÁCH PHẢN",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 350% Mưu Công, khiến mục tiêu bị [Khống Chế], duy trì 1 lượt. Bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bo_toi_theo_sang": {
      "id": "bo_toi_theo_sang",
      "name": "Bỏ Tối Theo Sáng",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "BỎ TỐI THEO SÁNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 1000% Mưu Công, giải trừ 2 hiệu quả có lợi của mục tiêu, khiến mục tiêu bị [Khống Chế], duy trì 1 lượt, bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "long_minh": {
      "id": "long_minh",
      "name": "Long Minh",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "LONG MINH",
        "motif": "dragon"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 85% Pháp Công, địch trên hàng dọc chịu 110% Pháp Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "long_uy": {
      "id": "long_uy",
      "name": "Long Uy",
      "damageType": "physical",
      "pattern": "row",
      "power": 2.05,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "LONG UY",
        "motif": "dragon"
      },
      "desc": "[Chiến+Kế] Địch trên hàng ngang chịu 205% Pháp Công, địch trên hàng dọc chịu 235% Mưu Công, bản thân nhận [Tịnh Hóa], duy trì 2 lượt, bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "no_long": {
      "id": "no_long",
      "name": "Nộ Long",
      "damageType": "physical",
      "pattern": "row",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "NỘ LONG",
        "motif": "dragon"
      },
      "desc": "[Chiến+Kế] Địch trên hàng ngang chịu 390% Pháp Công, địch trên hàng dọc chịu 430% Mưu Công, bản thân nhận [Tịnh Hóa], [Loại Bỏ], duy trì 2 lượt, bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "than_binh_xuat_hien": {
      "id": "than_binh_xuat_hien",
      "name": "Thần Binh Xuất Hiện",
      "damageType": "physical",
      "pattern": "self",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THẦN BINH XUẤT HIỆ",
        "motif": "buff"
      },
      "desc": "[Chiến Pháp+Kế Sách+Thường] Nhận Loại Bỏ và Tịnh Hóa, sau đó tấn công 500 sĩ khí không cùng loại 3 lần, bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hanh_binh": {
      "id": "hanh_binh",
      "name": "Hành Binh",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HÀNH BINH",
        "motif": "slash"
      },
      "desc": "[Chiến+Kế+Thường] Tấn công 500 sĩ khí gây cho địch trên hàng ngang 3000% Pháp Công. Tấn công 500 sĩ khí gây cho địch trên hàng dọc 3000% Mưu Công. Tấn công 500 sĩ khí gây cho đơn vị địch lính ít nhất 1700% sát thương vật lý, lính mục tiêu càng ít sát thương càng cao, bản thân nhậ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "than_binh_am_do": {
      "id": "than_binh_am_do",
      "name": "Thần Binh Ám Độ",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THẦN BINH ÁM ĐỘ",
        "motif": "slash"
      },
      "desc": "[Chiến+Kế+Thường] Bản thân nhận [Tịnh Hóa], duy trì 2 lượt. Tấn công 500 sĩ khí, khiến địch trên hàng ngang chịu 7000% Pháp Công. Tấn công 500 sĩ khí, khiến địch trên hàng dọc chịu 7000% Mưu Công. Tấn công 500 sĩ khí, khiến đơn vị địch lính ít nhất chịu 4000% sát thương vật lý, l",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ky_binh_pha_thuc": {
      "id": "ky_binh_pha_thuc",
      "name": "Kỳ Binh Phá Thục",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KỲ BINH PHÁ THỤC",
        "motif": "slash"
      },
      "desc": "[Chiến Pháp + Kế Sách + Thường] khiến bản thân vào [Tịnh Hóa], [Độ Hiểm] và [Loại Bỏ] không thể giải trừ, duy trì 3 lượt, sau đó tiêu hao 700 sĩ khí lần lượt gây 12000% Pháp Công lên kẻ địch trên hàng ngang, gây 12000% Mưu Công lên kẻ địch trên hàng dọc, gây 7300% sát thương vật ",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "loi_nhan": {
      "id": "loi_nhan",
      "name": "Lợi Nhẫn",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "LỢI NHẪN",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Vật Công của toàn phe ta tăng 25%, duy trì 2 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "ban_ly": {
      "id": "ban_ly",
      "name": "Bạn Ly",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "BẠN LY",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 205% Mưu Công. Khiến mục tiêu bị [Đào Binh], duy trì 2 lượt. Bản thân nhận trị liệu (Mức trị liệu bằng 30% Mưu Công).",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "me_tran": {
      "id": "me_tran",
      "name": "Mê Trận",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "MÊ TRẬN",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 340% Mưu Công, sĩ khí mục tiêu càng cao sát thương càng cao. Khiến mục tiêu bị [Đào Binh], duy trì 2 lượt. Bản thân nhận trị liệu (Mức trị liệu bằng 30% Mưu Công).",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "cu_ngao_uy_ap": {
      "id": "cu_ngao_uy_ap",
      "name": "Cư Ngạo Uy Áp",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CƯ NGẠO UY ÁP",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 15000% Mưu Công, lính mục tiêu càng ít sát thương càng cao. Khiến mục tiêu bị [Đào Binh], duy trì 2 lượt, 1 lần trị liệu toàn bộ lính phe ta (Mức trị liệu bằng 30% Mưu Công).",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "tap_kich": {
      "id": "tap_kich",
      "name": "Tập Kích",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TẬP KÍCH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Đơn vị địch lính ít nhất chịu 400% Pháp Công, lính mục tiêu càng ít sát thương càng cao.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "loan_kich": {
      "id": "loan_kich",
      "name": "Loạn Kích",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LOẠN KÍCH",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 315% Pháp Công, lính mục tiêu càng ít sát thương càng cao.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "chuyen_chu": {
      "id": "chuyen_chu",
      "name": "Chuyên Chú",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CHUYÊN CHÚ",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Mưu Công của toàn phe ta tăng 25%, duy trì 3 lượt.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "dia_thich": {
      "id": "dia_thich",
      "name": "Địa Thích",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.5,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ĐỊA THÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 150% sát thương vật lý, lính bản thân càng ít sát thương càng cao.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "cot_thich": {
      "id": "cot_thich",
      "name": "Cốt Thích",
      "damageType": "physical",
      "pattern": "self",
      "power": 1.55,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CỐT THÍCH",
        "motif": "buff"
      },
      "desc": "[Thường] Đánh nhóm, lính ít sẽ gây nhiều sát thương, bản thân tăng bạo kích 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "diem_la_kich": {
      "id": "diem_la_kich",
      "name": "Diêm La Kích",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "DIÊM LA KÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Tấn công 200 sĩ khí, khiến toàn phe địch chịu 300% sát thương vật lý, lính bản thân càng ít sát thương càng cao, bản thân nhận [Hội Tâm], [Thiên Vận], duy trì 2 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "thap_phuong_diet": {
      "id": "thap_phuong_diet",
      "name": "Thập Phương Diệt",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THẬP PHƯƠNG DIỆT",
        "motif": "slash"
      },
      "desc": "[Thường] Tấn công 500 sĩ khí gây cho toàn phe địch 700% sát thương vật lý, lính bản thân càng ít sát thương càng cao, bản thân nhận [Hội Tâm], [Thiên Vận], duy trì 2 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero"
    },
    "nghich_chuyen_sinh_tu": {
      "id": "nghich_chuyen_sinh_tu",
      "name": "Nghịch Chuyển Sinh Tử",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NGHỊCH CHUYỂN SINH",
        "motif": "slash"
      },
      "desc": "[Thường] Tấn công 500 sĩ khí. Toàn phe địch chịu 1800% sát thương vật lý, lính bản thân càng ít sát thương càng cao. Bản thân nhận [Hội Tâm], [Thiên Vận], duy trì 2 lượt.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero"
    },
    "lang_dao": {
      "id": "lang_dao",
      "name": "Lãng Đào",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.71,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "LÃNG ĐÀO",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 171% Mưu Công.",
      "wikiQuality": "Thường",
      "source": "wiki-hero"
    },
    "vong_xoay": {
      "id": "vong_xoay",
      "name": "Vòng Xoáy",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "VÒNG XOÁY",
        "motif": "whirlwind"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 72% Mưu Công, bản thân hồi 100 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "ma_quan": {
      "id": "ma_quan",
      "name": "Ma Quân",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "MA QUÂN",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 480% sát thương vật lý, toàn phe ta nhận [Hấp Huyết], duy trì 3 lượt, bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bac_thay_u_mich": {
      "id": "bac_thay_u_mich",
      "name": "Bậc Thầy U Mịch",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BẬC THẦY U MỊCH",
        "motif": "slash"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 9000% sát thương vật lý, toàn phe ta nhận [Hấp Huyết], duy trì 2 lượt, toàn phe địch tốc độ hồi sĩ khí giảm 40%, duy trì 2 lượt. Bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "huyet_ach_su": {
      "id": "huyet_ach_su",
      "name": "Huyết Ách Sư",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "HUYẾT ÁCH SƯ",
        "motif": "heal"
      },
      "desc": "[Thường] Địch trên hàng dọc chịu 18000% sát thương vật lý, toàn phe ta nhận hiệu quả [Chuyển Đổi] (Chuyển 50% sát thương bản thân gây ra thành trị liệu toàn phe ta, mỗi lần trị liệu không vượt quá 10% binh lực tối đa), duy trì 2 lượt. Tốc độ hồi sĩ khí của toàn phe địch giảm 40%,",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "phan_chan": {
      "id": "phan_chan",
      "name": "Phấn Chấn",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.35,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "PHẤN CHẤN",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta hồi 34 sĩ khí, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hoa_tien": {
      "id": "hoa_tien",
      "name": "Hỏa Tiễn",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.4,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HỎA TIỄN",
        "motif": "fire"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 140% Pháp Công, 80% khiến mục tiêu bị [Thiêu Đốt], duy trì 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "burn",
          "duration": 2
        }
      ]
    },
    "tien_lam": {
      "id": "tien_lam",
      "name": "Tiễn Lam",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TIỄN LAM",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Toàn phe địch chịu 380% Pháp Công.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "trung_nghia_ho_chu": {
      "id": "trung_nghia_ho_chu",
      "name": "Trung Nghĩa Hộ Chủ",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TRUNG NGHĨA HỘ CHỦ",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Tấn công 500 sĩ khí, khiến toàn phe địch chịu 7000% Pháp Công, bản thân vào trạng thái [Hộ Chủ], duy trì đến khi kết thúc chiến đấu, khiến tướng có lính ít nhất phe ta (ngoài bản thân) vào trạng thái [Bảo Hộ], duy trì 2 lượt, bản thân nhận trị liệu 1 lần (Mức trị liệu bằ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "than_tien_ho_chu": {
      "id": "than_tien_ho_chu",
      "name": "Thần Tiễn Hộ Chủ",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THẦN TIỄN HỘ CHỦ",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Tấn công 500 sĩ khí, khiến toàn phe địch chịu 13000% Pháp Công, bản thân vào trạng thái [Hộ Chủ], duy trì đến khi kết thúc chiến đấu, giúp tướng có lính ít nhất phe ta (ngoài bản thân) giải trừ tất cả hiệu quả bất lợi và vào trạng thái [Bảo Hộ], duy trì 2 lượt, giúp mục ",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bao_loi": {
      "id": "bao_loi",
      "name": "Bạo Lôi",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "thunder",
        "text": "BẠO LÔI",
        "motif": "thunder"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 300% Mưu Công, sĩ khí mục tiêu càng cao sát thương càng cao, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "dia_trach_van_vat": {
      "id": "dia_trach_van_vat",
      "name": "Địa Trạch Vạn Vật",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "ĐỊA TRẠCH VẠN VẬT",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Thủ Hộ], [Hồi Phục], [Hồi Xuân], duy trì 2 lượt. Giúp các đồng đội khác hồi 10+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero"
    },
    "than_huu_mot_phuong": {
      "id": "than_huu_mot_phuong",
      "name": "Thần Hữu Một Phương",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.85,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THẦN HỮU MỘT PHƯƠN",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Toàn phe ta nhận [Thủ Hộ], [Hồi Phục], nhận 2 tầng [Hồi Xuân], duy trì 2 lượt, các tướng khác trong phe ta hồi 20+{4} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero"
    },
    "tru_tam": {
      "id": "tru_tam",
      "name": "Tru Tâm",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.8,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TRU TÂM",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 180% Mưu Công, giảm 10 sĩ khí, hiệu quả trị liệu của mục tiêu giảm 50%, duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "toa_hon": {
      "id": "toa_hon",
      "name": "Tỏa Hồn",
      "damageType": "strategy",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TỎA HỒN",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 268% Mưu Công, giảm 10 sĩ khí, hiệu quả trị liệu của mục tiêu giảm 75% (Khi chiến đấu với người chơi khác, hiệu quả trị liệu giảm còn 25%), duy trì 2 lượt, mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu, bản thân hồi 50 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "am_van": {
      "id": "am_van",
      "name": "Ám Vân",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "ÁM VÂN",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 800% Mưu Công, giảm 10 sĩ khí, hiệu quả trị liệu của mục tiêu giảm 85% (Khi chiến đấu với người chơi khác, hiệu quả trị liệu giảm 35%), duy trì 2 lượt, mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "quyen_hanh": {
      "id": "quyen_hanh",
      "name": "Quyền Hành",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "QUYỀN HÀNH",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 1500% Mưu Công và giảm 15 sĩ khí, khiến mục tiêu bị giảm hiệu quả trị liệu 90% (Khi chiến đấu với người chơi khác, hiệu quả trị liệu giảm 60%), duy trì 2 lượt. Khiến mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu. Bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "vuong_trieu_tan_ra": {
      "id": "vuong_trieu_tan_ra",
      "name": "Vương Triều Tan Rã",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "VƯƠNG TRIỀU TAN RÃ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 4500% Mưu Công, gây giảm 20 sĩ khí, khiến mục tiêu giảm 100% hiệu quả Trị Liệu (Khi chiến đấu với người chơi khác, hiệu quả Trị Liệu giảm 60%), duy trì 2 lượt, khiến mục tiêu bị [Âm Hồn], duy trì đến khi kết thúc chiến đấu, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "han_bang": {
      "id": "han_bang",
      "name": "Hàn Băng",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "HÀN BĂNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Tấn công hàng ngang, hiệu quả hồi sĩ khí phe địch giảm (50+{3%})% trong 2 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "bong_lanh": {
      "id": "bong_lanh",
      "name": "Bỏng Lạnh",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "BỎNG LẠNH",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 2500% Mưu Công, sĩ khí mục tiêu càng thấp sát thương phải chịu càng cao, khiến mục tiêu nhận [Áp Ức], duy trì 2 lượt, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nhieu_loan_quan_dich": {
      "id": "nhieu_loan_quan_dich",
      "name": "Nhiễu Loạn Quân Địch",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "NHIỄU LOẠN QUÂN ĐỊ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 16500% Mưu Công, sĩ khí mục tiêu càng thấp sát thương càng cao, khiến mục tiêu bị [Áp Ức], [Hủ Thực], duy trì 2 lượt, bản thân hồi 50 +{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bon_be_bua_vay": {
      "id": "bon_be_bua_vay",
      "name": "Bốn Bề Bủa Vây",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "BỐN BỀ BỦA VÂY",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 2 lần 17500% Mưu Công, sĩ khí mục tiêu càng thấp sát thương càng cao, khiến mục tiêu bị [Áp Ức], [Hủ Thực], duy trì 2 lượt, bản thân hồi 50 +{6} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "phong_hac": {
      "id": "phong_hac",
      "name": "Phong Hạc",
      "damageType": "strategy",
      "pattern": "row",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "wind",
        "text": "PHONG HẠC",
        "motif": "whirlwind"
      },
      "desc": "[Kế Sách] Địch trên hàng ngang chịu 2 lần 29500% Mưu Công, sĩ khí đối phương càng thấp sát thương phải chịu càng cao, khiến mục tiêu bị [Mây Đen], [Áp Ức], [Hủ Thực], duy trì 2 lượt, bản thân hồi 75+{8} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bai_lang": {
      "id": "bai_lang",
      "name": "Bài Lãng",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.9,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "BÀI LÃNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 190% Mưu Công, giải trừ tất cả hiệu quả trạng thái trên 1 kẻ địch.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "tat_tri": {
      "id": "tat_tri",
      "name": "Tật Trì",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TẬT TRÌ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2 lần 230% Pháp Công, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tan_ca": {
      "id": "tan_ca",
      "name": "Tán Ca",
      "damageType": "physical",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TÁN CA",
        "motif": "buff"
      },
      "desc": "[Hỗ Trợ] Tất cả tấn công của toàn phe ta tăng 25%, duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "khuynh_quoc": {
      "id": "khuynh_quoc",
      "name": "Khuynh Quốc",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KHUYNH QUỐC",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Tất cả tấn công của toàn phe ta tăng 55+{3%}% (Khi chiến đấu với người chơi khác, tăng 41.25% tất cả tấn công ), duy trì 2 lượt, 25% toàn phe địch bị [Mê Hoặc], duy trì 2 lượt (Khi chiến đấu với người chơi khác, xác suất Mê Hoặc là 7.5%).",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "be_nguyet": {
      "id": "be_nguyet",
      "name": "Bế Nguyệt",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "BẾ NGUYỆT",
        "motif": "slash"
      },
      "desc": "Toàn phe ta tăng 60% + {3%}% tấn công (Khi chiến đấu với người chơi khác, giảm hiệu quả Tăng Công), giảm tấn công của toàn phe địch (Ban đầu 20%), duy trì 2 lượt, có xác suất Mê Hoặc địch 2 lượt (Khi chiến đấu với người chơi khác, giảm xác suất Mê Hoặc).",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "vu_dieu_duoi_trang": {
      "id": "vu_dieu_duoi_trang",
      "name": "Vũ Điệu Dưới Trăng",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "VŨ ĐIỆU DƯỚI TRĂNG",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Tất cả tấn công của toàn phe ta tăng 60+{3%}% (Khi chiến đấu với người chơi khác, tất cả tấn công tăng 45%), duy trì 2 lượt, tất cả tấn công của toàn phe địch giảm 24+{5%}%, duy trì 2 lượt, 25% toàn phe địch bị [Mê Hoặc], duy trì 2 lượt (Khi chiến đấu với người chơi khác",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "thien_vu_khuynh_thanh": {
      "id": "thien_vu_khuynh_thanh",
      "name": "Thiên Vũ Khuynh Thành",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THIÊN VŨ KHUYNH TH",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Tất cả tấn công của toàn phe ta tăng 75+{3%}%, duy trì 2 lượt, khiến tấn công của tất cả địch giảm 24+{5%}%, duy trì 2 lượt, 25% khiến tất cả địch nhận [Mê Hoặc], duy trì 2 lượt (Khi chiến đấu với người chơi khác, xác suất [Mê Hoặc] là 7.5%).",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "nghe_thuong_thien_vu": {
      "id": "nghe_thuong_thien_vu",
      "name": "Nghê Thường Thiên Vũ",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NGHÊ THƯỜNG THIÊN ",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Tất cả tấn công của toàn phe ta tăng 95+{3%}%, duy trì 2 lượt, khiến tấn công của tất cả địch giảm 30+{5%}%, duy trì 2 lượt, 25% khiến tất cả địch nhận [Mê Hoặc], duy trì 2 lượt (Khi chiến đấu với người chơi khác, xác suất [Mê Hoặc] là 9.5%).",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "cung_ma": {
      "id": "cung_ma",
      "name": "Cung Mã",
      "damageType": "physical",
      "pattern": "row",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "CUNG MÃ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 350% Pháp Công. Khiến tướng địch lính ít nhất chịu 2 lần 220% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "doat_tam_tien": {
      "id": "doat_tam_tien",
      "name": "Đoạt Tâm Tiễn",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ĐOẠT TÂM TIỄN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 3100% Pháp Công. Khiến tướng địch lính ít nhất chịu 2 lần 2400% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Mỗi lần tấn công sẽ khiến mục tiêu giảm 10+{2} sĩ khí. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "phuong_vu_cuu_thien": {
      "id": "phuong_vu_cuu_thien",
      "name": "Phượng Vũ Cửu Thiên",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue_water",
        "text": "PHƯỢNG VŨ CỬU THIÊ",
        "motif": "water"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 7000% Pháp Công, lính mục tiêu càng nhiều sát thương càng cao, khiến tướng địch lính ít nhất chịu 2 lần 10000% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Mỗi lần tấn công sẽ khiến mục tiêu giảm 10+{2} sĩ khí. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "loan_hoi_phuong_vu": {
      "id": "loan_hoi_phuong_vu",
      "name": "Loan Hồi Phượng Vũ",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue_water",
        "text": "LOAN HỒI PHƯỢNG VŨ",
        "motif": "water"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 11000% Pháp Công, lính mục tiêu càng nhiều sát thương càng cao, khiến tướng địch lính ít nhất chịu 14500% Pháp Công, lính mục tiêu càng ít sát thương càng cao, mỗi lần tấn công sẽ khiến mục tiêu giảm 15+{2} sĩ khí. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "phan_no": {
      "id": "phan_no",
      "name": "Phẫn Nộ",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "PHẪN NỘ",
        "motif": "slash"
      },
      "desc": "[Thường] Gây cho 1 kẻ địch 500% sát thương vật lý, bản thân nhận [Hội Tâm], duy trì 3 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "hoa_nham": {
      "id": "hoa_nham",
      "name": "Hỏa Nham",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "HỎA NHAM",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 290% Mưu Công, mục tiêu bị [Thiêu Đốt], duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "burn",
          "duration": 2
        }
      ]
    },
    "pha_ke": {
      "id": "pha_ke",
      "name": "Phá Kế",
      "damageType": "strategy",
      "pattern": "column",
      "power": 1.43,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "PHÁ KẾ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Địch trên hàng dọc chịu 143% Mưu Công, khiến Mưu Công của mục tiêu giảm 25%, duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "ho_chu": {
      "id": "ho_chu",
      "name": "Hộ Chủ",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "HỘ CHỦ",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 360% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Khiến toàn phe địch bị [Đào Binh], duy trì 2 lượt. Trị liệu cho bản thân 1 lần (Mức trị liệu bằng 20% Pháp Công). Bản thân nhận Thủ Hộ trong 3 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "vien_ho": {
      "id": "vien_ho",
      "name": "Viện Hộ",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "VIỆN HỘ",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 1700% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Khiến toàn phe địch bị [Đào Binh], duy trì 2 lượt. Trị liệu cho bản thân và đồng đội có lính ít nhất 1 lần (Mức trị liệu bằng 20% Pháp Công). Bản thân nhận [Tử Thủ], duy trì 3 lượt. Bản",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "sa_truong_ngu_dich": {
      "id": "sa_truong_ngu_dich",
      "name": "Sa Trường Ngự Địch",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "SA TRƯỜNG NGỰ ĐỊCH",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 9000% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Khiến toàn phe địch bị trúng [Đào Binh], duy trì 2 lượt. Trị liệu cho bản thân và đồng đội lính ít nhất 1 lần (Mức trị liệu bằng 20% Pháp Công). Bản thân nhận [Tử Thủ], duy trì 3 lượt. ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "muc_huyet_ho_chu": {
      "id": "muc_huyet_ho_chu",
      "name": "Mục Huyết Hộ Chủ",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "MỤC HUYẾT HỘ CHỦ",
        "motif": "heal"
      },
      "desc": "[C.Pháp] Địch trên hàng ngang chịu 14000% Pháp Công, lính mục tiêu càng ít sát thương càng cao. Khiến toàn phe địch bị [Đào Binh], duy trì 2 lượt. Trị liệu cho bản thân 2 lần và đồng đội lính ít nhất 1 lần (Mức trị liệu bằng 20% Pháp Công). Bản thân nhận [Tử Thủ], duy trì 3 lượt,",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thanh_u_thu_tuyet": {
      "id": "thanh_u_thu_tuyet",
      "name": "Thanh U Thù Tuyệt",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THANH U THÙ TUYỆT",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công), giải trừ 2 hiệu quả có lợi của toàn phe địch. Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "hien_thuc_luu_phuong": {
      "id": "hien_thuc_luu_phuong",
      "name": "Hiền Thục Lưu Phương",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "HIỀN THỤC LƯU PHƯƠ",
        "motif": "heal"
      },
      "desc": "[Hỗ Trợ] Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công), giải trừ 3 hiệu quả có lợi của toàn phe địch, bản thân nhận [Nguyệt Hồn], duy trì 2 lượt. Bản thân hồi 50+{6} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "dinh_ke_nhat_thong": {
      "id": "dinh_ke_nhat_thong",
      "name": "Định Kế Nhất Thống",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "ĐỊNH KẾ NHẤT THỐNG",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta tăng 40 sĩ khí, nhận hiệu quả [Điên Cuồng], duy trì 3 lượt, lân lượt có xác suất 50% khiến toàn phe địch bị [Vô Lực], [Do Dự] (Khi chiến đấu với người chơi khác, hiệu quả [Do Dự] đổi thành [Tê Liệt], khi bắt đầu lượt có xác suất bị Hỗn Loạn 1 lượt),",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "thau_tom_thien_ha": {
      "id": "thau_tom_thien_ha",
      "name": "Thâu Tóm Thiên Hạ",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "THÂU TÓM THIÊN HẠ",
        "motif": "slash"
      },
      "desc": "[Hỗ Trợ] Tướng khác của phe ta tăng 60 sĩ khí, nhận hiệu quả [Điên Cuồng], duy trì 3 lượt, lân lượt có xác suất 50% khiến toàn phe địch bị [Vô Lực], [Do Dự] (Khi chiến đấu với người chơi khác, hiệu quả [Do Dự] đổi thành [Tê Liệt], khi bắt đầu lượt có xác suất bị Hỗn Loạn 1 lượt),",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        }
      ]
    },
    "long_chien_vu_da": {
      "id": "long_chien_vu_da",
      "name": "Long Chiến Vu Dã",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "LONG CHIẾN VU DÃ",
        "motif": "dragon"
      },
      "desc": "[Chiến+Thường] Tấn công 500 sĩ khí, khiến toàn phe địch chịu 5760% Pháp Công. Khiến địch trên hàng dọc chịu 10800% Pháp Công, sĩ khí mục tiêu càng cao sát thương càng cao. Địch trên hàng dọc chịu 21600% sát thương vật lý. Bản thân nhận [Tru Thần], duy trì 2 lượt. Bản thân hồi 50+",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "phi_long_tai_thien": {
      "id": "phi_long_tai_thien",
      "name": "Phi Long Tại Thiên",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "dragon",
        "text": "PHI LONG TẠI THIÊN",
        "motif": "dragon"
      },
      "desc": "[Chiến+Thường] Tấn công 500 sĩ khí, khiến toàn phe địch chịu 6400% Pháp Công, địch trên hàng dọc chịu 12000% Pháp Công, sĩ khí mục tiêu càng cao sát thương càng cao, địch trên hàng dọc chịu tiếp 24000% Vật Công, bản thân nhận [Tru Thần] và [Bá Chủ], duy trì 2 lượt, bản thân hồi 5",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "khi_gioi": {
      "id": "khi_gioi",
      "name": "Khí Giới",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.0,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KHÍ GIỚI",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 200% Pháp Công, tấn công của mục tiêu giảm 100%, duy trì 1 lượt.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "duong_cong": {
      "id": "duong_cong",
      "name": "Dương Công",
      "damageType": "physical",
      "pattern": "column",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "DƯƠNG CÔNG",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 400% Pháp Công, giải trừ hiệu quả có lợi của 1 kẻ địch, tấn công của mục tiêu giảm 100%, duy trì 1 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "nhieu_loan_dot_tap": {
      "id": "nhieu_loan_dot_tap",
      "name": "Nhiễu Loạn Đột Tập",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NHIỄU LOẠN ĐỘT TẬP",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 2400% Pháp Công, giải trừ hiệu quả có lợi của địch trên hàng dọc, khiến mục tiêu giảm 100% tất cả tấn công, khiến mục tiêu trên hàng dọc bị Hư Nhược (có thể giải trừ), không thể nhận hiệu quả có lợi, duy trì 1 lượt.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero"
    },
    "sat_y": {
      "id": "sat_y",
      "name": "Sát Ý",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.4,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "SÁT Ý",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 140% Pháp Công, tất cả tấn công của bản thân tăng 100%, duy trì 2 lượt.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "am_duong_diet": {
      "id": "am_duong_diet",
      "name": "Âm Dương Diệt",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "ÂM DƯƠNG DIỆT",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 5500% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao, khiến mục tiêu bị [Ma Ám] không thể giải trừ, duy trì 3 lượt. Bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "bua_phep_tran_ta": {
      "id": "bua_phep_tran_ta",
      "name": "Bùa Phép Trấn Tà",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "BÙA PHÉP TRẤN TÀ",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 6600% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao, khiến mục tiêu bị [Ma Ám] không thể giải trừ, duy trì 3 lượt, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "dao_thuat_huyen_thong": {
      "id": "dao_thuat_huyen_thong",
      "name": "Đạo Thuật Huyền Thông",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.9100000000000001,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "ĐẠO THUẬT HUYỀN TH",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 11000% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao, khiến mục tiêu bị [Dị Nhiễu] không thể giải trừ, duy trì 3 lượt, bản thân nhận [Phá Thánh], duy trì 3 lượt, bản thân hồi 50+{4} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "no_thich": {
      "id": "no_thich",
      "name": "Nộ Thích",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "NỘ THÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 105% sát thương vật lý.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "lien_thich": {
      "id": "lien_thich",
      "name": "Liên Thích",
      "damageType": "physical",
      "pattern": "all",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "LIÊN THÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 355% sát thương vật lý, gây cho 1 đơn vị địch 2 lần 300% sát thương vật lý.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 2
    },
    "xuyen_van_thich": {
      "id": "xuyen_van_thich",
      "name": "Xuyên Vân Thích",
      "damageType": "physical",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "XUYÊN VÂN THÍCH",
        "motif": "slash"
      },
      "desc": "[Thường] Toàn phe địch chịu 2000% sát thương vật lý, gây cho 1 đơn vị địch 3 lần 2500% sát thương vật lý.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 3
    },
    "doat_tam": {
      "id": "doat_tam",
      "name": "Đoạt Tâm",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "ĐOẠT TÂM",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 600% Mưu Công, đoạt hết sĩ khí của mục tiêu, tấn công của mục tiêu giảm 50%, duy trì 2 lượt.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero"
    },
    "bach_y_do_giang": {
      "id": "bach_y_do_giang",
      "name": "Bạch Y Độ Giang",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "BẠCH Y ĐỘ GIANG",
        "motif": "fire"
      },
      "desc": "[Chiến+Kế] Tấn công 500 sĩ khí lên hàng sau phe địch, gây 1000% Pháp Công và 1000% Mưu Công, nếu mục tiêu có [Thiên Hỏa], sẽ bị [Vỡ Trận], duy trì 1 lượt, bản thân nhận [Thiên Vận], duy trì 3 lượt, bản thân hồi 50+{10} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "burn",
          "duration": 2
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thien_nhan": {
      "id": "thien_nhan",
      "name": "Thiên Nhẫn",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "THIÊN NHẪN",
        "motif": "fire"
      },
      "desc": "[Chiến Pháp+Kế Sách] Phát động 2 lần Chiến Pháp và Mưu Công 500 sĩ khí, tấn công địch hàng sau ở phía đối diện với bản thân, đồng thời gây hiệu quả Vỡ Trận cho địch có Thiên Hỏa 1 lượt, bản thân nhận Thiên Vận 3 lượt (Có xác suất gây sát thương gấp 1-3 lần) và hồi phục 50+{10} sĩ",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "burn",
          "duration": 2
        }
      ]
    },
    "bach_y_pha_lang": {
      "id": "bach_y_pha_lang",
      "name": "Bạch Y Phá Lãng",
      "damageType": "physical",
      "pattern": "row",
      "power": 1.83,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "BẠCH Y PHÁ LÃNG",
        "motif": "fire"
      },
      "desc": "[Chiến+Kế] Tấn công 500 sĩ khí, khiến địch trên hàng ngang phía sau chịu 14000% Pháp Công và Mưu Công,. Nếu mục tiêu có [Thiên Hỏa], sẽ bị [Vỡ Trận] (Sát thương và trị liệu đều là 1 điểm, duy trì 1 lượt) và [Tỏa Binh] (Mục tiêu không thể tăng binh lực, duy trì 2 lượt), bản thân v",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "burn",
          "duration": 2
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "huyen_bang": {
      "id": "huyen_bang",
      "name": "Huyền Băng",
      "damageType": "strategy",
      "pattern": "single",
      "power": 2.1,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "HUYỀN BĂNG",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 210% Mưu Công, lính bản thân càng ít sát thương càng cao.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "thien_hoa_thieu": {
      "id": "thien_hoa_thieu",
      "name": "Thiên Hỏa Thiêu",
      "damageType": "strategy",
      "pattern": "single",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "fire_rain",
        "text": "THIÊN HỎA THIÊU",
        "motif": "fire"
      },
      "desc": "[Kế Sách] Gây cho 1 kẻ địch 1000% Mưu Công, lính mục tiêu càng nhiều sát thương càng cao, mục tiêu bị [Thiên Hỏa], duy trì 2 lượt, bản thân nhận [Thần Binh], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "burn",
          "duration": 2
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "truong_ca": {
      "id": "truong_ca",
      "name": "Trường Ca",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "TRƯỜNG CA",
        "motif": "shield"
      },
      "desc": "[Kế Sách] Bản thân nhận trị liệu (Mức trị liệu bằng 20% Mưu Công), 25% giúp toàn phe ta nhận [Thiết Bích], duy trì 2 lượt. Giúp các đồng đội khác hồi 25+{4} sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "def_up",
          "value": 0.35,
          "duration": 1,
          "target": "self"
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        }
      ]
    },
    "chuy_kich": {
      "id": "chuy_kich",
      "name": "Chùy Kích",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CHÙY KÍCH",
        "motif": "heal"
      },
      "desc": "[Thường] Gây cho 1 kẻ địch 500% sát thương vật lý, 70% khiến mục tiêu bị [Hỗn Loạn]. Bản thân nhận trị liệu (Mức trị liệu bằng 20% Vật Công). Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "stun",
          "chance": 0.55,
          "duration": 1
        },
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "huyet_chien": {
      "id": "huyet_chien",
      "name": "Huyết Chiến",
      "damageType": "physical",
      "pattern": "single",
      "power": 2.2,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "HUYẾT CHIẾN",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 320% Pháp Công, bản thân chịu 100% Pháp Công.",
      "wikiQuality": "Chiến",
      "source": "wiki-hero"
    },
    "loan_the_muu": {
      "id": "loan_the_muu",
      "name": "Loạn Thế Mưu",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.65,
      "moraleCost": 100,
      "fx": {
        "flash": "blue",
        "text": "LOẠN THẾ MƯU",
        "motif": "arcane"
      },
      "desc": "[Kế Sách] Sát thương Mưu Công toàn phe địch 3 lần, giảm Mưu Phòng toàn phe địch 2 lượt, hồi lính toàn phe ta, bản thân hồi 50 +{10} sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "ngao_nghe_thien_ha": {
      "id": "ngao_nghe_thien_ha",
      "name": "Ngạo Nghễ Thiên Hạ",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "NGẠO NGHỄ THIÊN HẠ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe địch chịu 3 lần sát thương, lần lượt bằng 4000%, 300%, 300% Mưu Công, khiến Mưu Phòng của mục tiêu giảm 30%, duy trì 2 lượt. Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công). Bản thân hồi 50+{10} sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "cu_cong_ngao_thuong": {
      "id": "cu_cong_ngao_thuong",
      "name": "Cư Công Ngạo Thượng",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CƯ CÔNG NGẠO THƯỢN",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Giảm 30% Mưu Phòng toàn phe địch, duy trì 2 lượt, sau đó gây 3 lần tấn công lần lượt bằng 10000%, 5000%, 5000% Mưu Công cho kẻ địch, trị liệu bản thân và toàn phe ta 1 lần (Trị liệu bằng 20% Mưu Công), bản thân hồi 50+{12} sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "gia_chieu_cu_binh": {
      "id": "gia_chieu_cu_binh",
      "name": "Giả Chiếu Cử Binh",
      "damageType": "strategy",
      "pattern": "all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "GIẢ CHIẾU CỬ BINH",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Giảm 30% Mưu Phòng toàn phe địch, duy trì 2 lượt, sau đó gây 4 lần tấn công, lần lượt bằng 10000%, 10000%, 10000%, 10000% Mưu Công, trị liệu toàn phe ta 2 lần (Mức trị liệu bằng 20% Mưu Công). Bản thân hồi 50+{14} sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 4,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "def_down",
          "value": 0.12,
          "duration": 2
        }
      ]
    },
    "do_chung_sinh": {
      "id": "do_chung_sinh",
      "name": "Độ Chúng Sinh",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "ĐỘ CHÚNG SINH",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Toàn phe ta (nhận trị liệu bằng 35% Mưu Công), tất cả tân công của đơn vị lính nhiều nhất phe ta tăng 20%, không thể giải trừ, duy trì 2 lượt, đơn vị lính ít nhất phe ta nhận [Hộ Thuẫn], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "kinh_anh_son_ha": {
      "id": "kinh_anh_son_ha",
      "name": "Kính Ánh Sơn Hà",
      "damageType": "strategy",
      "pattern": "front_row",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "KÍNH ÁNH SƠN HÀ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công), trị liệu thêm 1 lần cho hàng trước phe ta, khiến đồng đội lính nhiều nhất tăng 40% tất cả tấn công, không thể giải trừ, duy trì 2 lượt, đồng đội lính ít nhất nhận [Hộ Thuẫn], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "kinh_dien_luan_hoi": {
      "id": "kinh_dien_luan_hoi",
      "name": "Kính Diễn Luân Hồi",
      "damageType": "strategy",
      "pattern": "front_row",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "bagua",
        "text": "KÍNH DIỄN LUÂN HỒI",
        "motif": "bagua"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta (Mức trị liệu bằng 20% Mưu Công), trị liệu thêm 2 lần cho hàng trước phe ta, khiến đồng đội lính nhiều nhất tăng 80% tất cả tấn công, không thể giải trừ, duy trì 3 lượt, đồng đội lính ít nhất nhận [Bát Quái], duy trì 2 lượt, bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        },
        {
          "type": "atk_up",
          "value": 0.12,
          "duration": 2,
          "target": "ally"
        }
      ]
    },
    "cam_vu": {
      "id": "cam_vu",
      "name": "Cam Vũ",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "CAM VŨ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu toàn phe ta (Mức trị liệu bằng 54% Mưu Công). Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thường",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "nhan_y": {
      "id": "nhan_y",
      "name": "Nhân Y",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "NHÂN Y",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu đồng đội lính ít nhất (Mức trị liệu bằng 80% Mưu Công), giúp mục tiêu hồi 20+{2} sĩ khí. Mục tiêu nhận [Tử Thủ] (Khi chiến đấu với người chơi khác, phòng thủ tăng 10%), duy trì 3 lượt. Trị liệu toàn phe ta (Mức trị liệu bằng 55% Mưu Công). Bản thân hồi 145 sĩ k",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thanh_thu_hoi_xuan": {
      "id": "thanh_thu_hoi_xuan",
      "name": "Thánh Thủ Hồi Xuân",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THÁNH THỦ HỒI XUÂN",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu đồng đội lính ít nhất (Mức trị liệu bằng 80% Mưu Công), hồi 20+{4} sĩ khí, khiến mục tiêu nhận [Tử Thủ] (Khi chiến đấu với người chơi khác, phòng thủ tăng 10%), duy trì 3 lượt. Khiến mục tiêu nhận 2 tầng [Hồi Xuân], duy trì 2 lượt. Trị liệu toàn phe ta (Mức trị",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "thanh_thu_te_the": {
      "id": "thanh_thu_te_the",
      "name": "Thánh Thủ Tề Thế",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "THÁNH THỦ TỀ THẾ",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu đồng đội lính ít nhất (Mức trị liệu bằng 20% Mưu Công), hồi 20+{4} sĩ khí, khiến mục tiêu nhận [Tử Thủ], nhận 2 tầng [Hồi Xuân], duy trì 3 lượt. Trị liệu toàn phe ta 2 lần (Mức trị liệu bằng 20% Mưu Công). Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thái Sơ",
      "source": "wiki-hero",
      "hits": 2,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "huyen_ho_te_chung": {
      "id": "huyen_ho_te_chung",
      "name": "Huyền Hồ Tế Chúng",
      "damageType": "strategy",
      "pattern": "ally_all",
      "power": 1.05,
      "moraleCost": 100,
      "fx": {
        "flash": "gold_soft",
        "text": "HUYỀN HỒ TẾ CHÚNG",
        "motif": "heal"
      },
      "desc": "[Kế Sách] Trị liệu đồng đội lính ít nhất (Mức trị liệu bằng 20% mưu công) và hồi phục 20+{2} sĩ khí, tổng cộng 3 lần, sau đó khiến tướng phe ta có lính thấp nhất vào trạng thái [Tử Thủ], kéo dài 3 lượt, rồi trị liệu toàn bộ phe ta 2 lần (Mức trị liệu bằng 20% mưu công), khiến toà",
      "wikiQuality": "Thần Hoàng",
      "source": "wiki-hero",
      "hits": 3,
      "effects": [
        {
          "type": "heal_pct",
          "value": 0.12,
          "target": "ally"
        },
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "tuyet_sat": {
      "id": "tuyet_sat",
      "name": "Tuyệt Sát",
      "damageType": "physical",
      "pattern": "single",
      "power": 1.59,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "TUYỆT SÁT",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Gây cho 1 kẻ địch 1200% Pháp Công, đoạt hết sĩ khí của mục tiêu.",
      "wikiQuality": "Thần",
      "source": "wiki-hero"
    },
    "khai_son_huyet_phu": {
      "id": "khai_son_huyet_phu",
      "name": "Khai Sơn Huyết Phủ",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.6700000000000002,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "KHAI SƠN HUYẾT PHỦ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 1600% Pháp Công, gây cho 1 đơn vị địch 1500% Pháp Công. Bản thân nhận [Tăng Uy] không thể giải trừ, duy trì đến khi kết thúc chiến đấu. Bản thân nhận [Hấp Huyết], duy trì 3 lượt. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Truyền thuyết",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    },
    "vo_song_thuong_tuong": {
      "id": "vo_song_thuong_tuong",
      "name": "Vô Song Thượng Tướng",
      "damageType": "physical",
      "pattern": "column",
      "power": 1.75,
      "moraleCost": 100,
      "fx": {
        "flash": "steel",
        "text": "VÔ SONG THƯỢNG TƯỚ",
        "motif": "slash"
      },
      "desc": "[C.Pháp] Địch trên hàng dọc chịu 3200% Pháp Công, gây cho 1 đơn vị địch 3000% Pháp Công. Bản thân nhận [Hấp Huyết], duy trì 3 lượt. Bản thân nhận [Tăng Uy] không thể giải trừ, duy trì đến khi kết thúc chiến đấu. Bản thân hồi 145 sĩ khí.",
      "wikiQuality": "Thượng Cổ",
      "source": "wiki-hero",
      "effects": [
        {
          "type": "morale_boost",
          "value": 40,
          "target": "self"
        }
      ]
    }
  },
  "qualityLadders": {
    "basic_strike": {
      "white": "basic_strike",
      "green": "basic_strike",
      "blue": "basic_strike_chien",
      "purple": "basic_strike_than",
      "orange": "basic_strike_legend",
      "red": "basic_strike_king"
    },
    "basic_scheme": {
      "white": "basic_scheme",
      "green": "basic_scheme",
      "blue": "basic_scheme_chien",
      "purple": "basic_scheme_than",
      "orange": "basic_scheme_legend",
      "red": "basic_scheme_king"
    },
    "xiaoyaojin": {
      "white": "tl_thuong",
      "green": "tl_thuong",
      "blue": "tl_chien",
      "purple": "tl_than",
      "orange": "tl_truyen",
      "red": "tl_thanhoang"
    },
    "wu_sheng": {
      "white": "wu_sheng",
      "green": "wu_sheng",
      "blue": "wu_sheng_chien",
      "purple": "wu_sheng_chien",
      "orange": "wu_sheng_legend",
      "red": "wu_sheng_king"
    },
    "gam_thet": {
      "white": "gam_thet",
      "green": "gam_thet",
      "blue": "gam_thet",
      "purple": "gam_thet",
      "orange": "gam_thet_legend",
      "red": "gam_thet_king"
    },
    "khong_thanh": {
      "white": "khong_thanh",
      "green": "khong_thanh",
      "blue": "khong_thanh",
      "purple": "khong_thanh",
      "orange": "khong_thanh_legend",
      "red": "khong_thanh_king"
    },
    "hieu_lenh": {
      "white": "hieu_lenh",
      "green": "thien_menh",
      "blue": "thien_chinh",
      "purple": "quan_lam",
      "orange": "thien_ha_chia_ba",
      "red": "thien_ha_chia_ba"
    },
    "yen_nguyet": {
      "white": "yen_nguyet",
      "green": "thanh_long",
      "blue": "vo_thanh",
      "purple": "thanh_long_tram",
      "orange": "thien_ly_don_ky",
      "red": "uy_chan_hoa_ha"
    },
    "no_sat": {
      "white": "no_sat",
      "green": "bao_hao",
      "blue": "manh_ho",
      "purple": "ho_khieu",
      "orange": "ba_vuong_kich_dinh",
      "red": "manh_ho_liet_son"
    },
    "don_ky": {
      "white": "don_ky",
      "green": "ky_liep",
      "blue": "ky_xa",
      "purple": "ky_xa",
      "orange": "ky_xa",
      "red": "ky_xa"
    },
    "dong_phong": {
      "white": "dong_phong",
      "green": "phuc_long",
      "blue": "than_toan",
      "purple": "bat_tran_do",
      "orange": "ky_mon_bat_tran_do",
      "red": "ky_mon_bat_tran_do"
    },
    "loi_tien": {
      "white": "loi_tien",
      "green": "loi_tien",
      "blue": "nghe_xa",
      "purple": "truy_nguyet",
      "orange": "lac_nhat_than_tien",
      "red": "xich_vu_quan_hong"
    },
    "pha_quan": {
      "white": "pha_quan",
      "green": "thi_quan",
      "blue": "ky_than",
      "purple": "phong_loi",
      "orange": "te_nhat_thien_ky",
      "red": "te_nhat_thien_ky"
    },
    "tu_dien": {
      "white": "tu_dien",
      "green": "than_loi",
      "blue": "loi_oanh",
      "purple": "cuu_thien_than_loi",
      "orange": "kinh_thien_bao_loi",
      "red": "cuu_tieu_than_loi"
    },
    "hoanh_hoa": {
      "white": "hoanh_hoa",
      "green": "san_bang",
      "blue": "ho_chu",
      "purple": "vien_ho",
      "orange": "muc_huyet_ho_chu",
      "red": "muc_huyet_ho_chu"
    },
    "thu_kich": {
      "white": "thu_kich",
      "green": "thiet_no",
      "blue": "hoa_no",
      "purple": "kinh_no",
      "orange": "than_co_no",
      "red": "than_co_no"
    },
    "phan_kich": {
      "white": "phan_kich",
      "green": "nghich_chuyen",
      "blue": "huyet_tram",
      "purple": "pha_dich",
      "orange": "thong_quan_pha_dich",
      "red": "bay_tran_nhu_nui"
    },
    "ngu_giap": {
      "white": "ngu_giap",
      "green": "ngu_giap",
      "blue": "than_ngu",
      "purple": "bach_y_do_giang",
      "orange": "bach_y_pha_lang",
      "red": "bach_y_pha_lang"
    },
    "son_bang": {
      "white": "son_bang",
      "green": "thap_thien",
      "blue": "thien_bang",
      "purple": "liet_thien",
      "orange": "troi_tru_dat_diet",
      "red": "troi_tru_dat_diet"
    },
    "hu_vo": {
      "white": "hu_vo",
      "green": "hac_dong",
      "blue": "quy_mon",
      "purple": "ky_mon",
      "orange": "quyen_bien",
      "red": "quyen_bien"
    },
    "uy_phong": {
      "white": "uy_phong",
      "green": "tang_phong",
      "blue": "khu_truc",
      "purple": "kiem_ham",
      "orange": "kiem_ham",
      "red": "kiem_ham"
    },
    "dap_pha": {
      "white": "dap_pha",
      "green": "ky_kich",
      "blue": "tat_tri",
      "purple": "ky_than",
      "orange": "ky_than",
      "red": "ky_than"
    },
    "kinh_loi": {
      "white": "kinh_loi",
      "green": "thap_thien",
      "blue": "kich_no",
      "purple": "kich_no",
      "orange": "kich_no",
      "red": "kich_no"
    },
    "cuong_bao": {
      "white": "cuong_bao",
      "green": "chien_cuong",
      "blue": "thi_huyet",
      "purple": "cuong_no",
      "orange": "di_toc_xam_nhap",
      "red": "dai_vuong_than_chinh"
    },
    "ho_xung": {
      "white": "ho_xung",
      "green": "ho_sat",
      "blue": "quy_sat",
      "purple": "huyet_quy_nhan",
      "orange": "luot_nhanh_nhu_gio",
      "red": "trieu_ho_pha_tran"
    },
    "man_nguu": {
      "white": "man_nguu",
      "green": "cuong_nguu",
      "blue": "dia_long",
      "purple": "hoa_nguu_dap",
      "orange": "troi_long_dat_lo",
      "red": "troi_long_dat_lo"
    },
    "kich_thich": {
      "white": "kich_thich",
      "green": "bac_kich",
      "blue": "thi_huyet",
      "purple": "ma_quan",
      "orange": "huyet_ach_su",
      "red": "huyet_ach_su"
    },
    "viem_loi": {
      "white": "viem_loi",
      "green": "xich_loi",
      "blue": "quy_muu",
      "purple": "quy_ke",
      "orange": "bien_sao_lap_lanh",
      "red": "bien_sao_lap_lanh"
    },
    "dia_liep": {
      "white": "dia_liep",
      "green": "dia_nha",
      "blue": "bang_chuy",
      "purple": "bang_phong",
      "orange": "thien_ly_bang_phong",
      "red": "thien_ly_bang_phong"
    },
    "ho_khieu": {
      "white": "ho_khieu",
      "green": "su_hong",
      "blue": "cuong_hao",
      "purple": "de_hon",
      "orange": "pha_dam_no_hong",
      "red": "pha_dam_no_hong"
    },
    "cong_tam": {
      "green": "cong_tam",
      "blue": "cong_tam",
      "purple": "ly_gian",
      "orange": "tuyet_tinh_vo_hoi",
      "red": "tuyet_tinh_vo_hoi"
    },
    "binh_tien": {
      "white": "binh_tien",
      "green": "phong_tien",
      "blue": "hoa_than",
      "purple": "dai_viem_de",
      "orange": "luyen_nguc_hoa_hai",
      "red": "luyen_nguc_hoa_hai"
    },
    "hong_viem": {
      "white": "hong_viem",
      "green": "hac_viem",
      "blue": "nhien_tan",
      "purple": "thien_hoa_thieu",
      "orange": "hoa_the_ngut_troi",
      "red": "xich_lua_tri_tue"
    },
    "nghich_tap": {
      "white": "nghich_tap",
      "green": "dong_xoay",
      "blue": "lang_tuyen",
      "purple": "to_luu_nghich_tap",
      "orange": "lung_hoan_tang_dich",
      "red": "lang_tuyen_khon_tran"
    },
    "kho_ke": {
      "white": "kho_ke",
      "green": "kho_ke",
      "blue": "kho_ke",
      "purple": "kho_ke",
      "orange": "kho_ke",
      "red": "kho_ke"
    },
    "doc_tieu": {
      "white": "doc_tieu",
      "green": "xa_doc",
      "blue": "xa_doc",
      "purple": "xa_doc",
      "orange": "xa_doc",
      "red": "xa_doc"
    },
    "thu_ho": {
      "white": "thu_ho",
      "green": "bao_ho",
      "blue": "cau_phuc",
      "purple": "chien_ca",
      "orange": "song_sao_ruc_ro",
      "red": "bi_ngan_tinh_kieu"
    },
    "xung_ba": {
      "white": "xung_ba",
      "green": "ba_vuong",
      "blue": "thien_uy",
      "purple": "ba_vuong_than_uy",
      "orange": "than_uy_pha_tran",
      "red": "ba_vuong_liet_phach"
    },
    "ham_dia": {
      "white": "ham_dia",
      "green": "no_tram",
      "blue": "tram_sat",
      "purple": "kieu_tuong",
      "orange": "quy_tuong_pha_thanh",
      "red": "quy_tuong_pha_thanh"
    },
    "co_vu": {
      "white": "co_vu",
      "green": "loi_co",
      "blue": "hieu_trieu",
      "purple": "dinh_quan_co",
      "orange": "dinh_quan_co",
      "red": "dinh_quan_co"
    },
    "tuong_dong": {
      "white": "tuong_dong",
      "green": "tuong_dong",
      "blue": "truong_ca",
      "purple": "truong_ca",
      "orange": "truong_ca",
      "red": "truong_ca"
    },
    "nhuc_ma": {
      "white": "nhuc_ma",
      "green": "nhuc_ma",
      "blue": "xua_duoi",
      "purple": "xua_duoi",
      "orange": "thanh_nha_can_chinh",
      "red": "thanh_nha_can_chinh"
    },
    "ky_kich": {
      "white": "ky_kich",
      "green": "don_ky",
      "blue": "cuu_vien",
      "purple": "tran_hon",
      "orange": "che_ngu_quan_dich",
      "red": "tran_thu_han_thuy"
    },
    "am_sat": {
      "white": "am_sat",
      "green": "thich_sat",
      "blue": "hanh_thich",
      "purple": "hanh_thich",
      "orange": "am_da_thich_sat",
      "red": "am_da_thich_sat"
    },
    "huyen_thuat": {
      "white": "huyen_thuat",
      "green": "huyen_thuat",
      "blue": "huyen_thuat",
      "purple": "huyen_thuat",
      "orange": "huyen_thuat",
      "red": "huyen_thuat"
    },
    "huyet_lo": {
      "white": "huyet_lo",
      "green": "huyet_chien",
      "blue": "huyet_chien",
      "purple": "huyet_chien",
      "orange": "huyet_chien",
      "red": "huyet_chien"
    },
    "yeu_thuat": {
      "white": "yeu_thuat",
      "green": "phan_diet",
      "blue": "phan_diet",
      "purple": "phan_diet",
      "orange": "phan_diet",
      "red": "phan_diet"
    },
    "dot_kich": {
      "white": "dot_kich",
      "green": "chuoc_gioi",
      "blue": "khi_gioi",
      "purple": "duong_cong",
      "orange": "nhieu_loan_dot_tap",
      "red": "nhieu_loan_dot_tap"
    },
    "vo_song": {
      "white": "vo_song",
      "green": "ma_than",
      "blue": "minh_vuong",
      "purple": "thien_ha_vo_song",
      "orange": "ma_than_no_hoa",
      "red": "quy_than_loan_vu"
    },
    "no_hong": {
      "white": "no_hong",
      "green": "no_hong",
      "blue": "no_xich",
      "purple": "no_xich",
      "orange": "no_xich",
      "red": "no_xich"
    },
    "lac_loi": {
      "white": "lac_loi",
      "green": "lac_loi",
      "blue": "lac_loi",
      "purple": "lac_loi",
      "orange": "lac_loi",
      "red": "lac_loi"
    },
    "phan_chien": {
      "white": "phan_chien",
      "green": "phan_chien",
      "blue": "phan_chien",
      "purple": "phan_chien",
      "orange": "phan_chien",
      "red": "phan_chien"
    },
    "lien_thanh": {
      "white": "lien_thanh",
      "green": "huy_hoai",
      "blue": "huy_hoai",
      "purple": "huy_hoai",
      "orange": "huy_hoai",
      "red": "huy_hoai"
    },
    "doc_chu": {
      "white": "doc_chu",
      "green": "tru_tam",
      "blue": "toa_hon",
      "purple": "am_van",
      "orange": "vuong_trieu_tan_ra",
      "red": "vuong_trieu_tan_ra"
    },
    "te_xa": {
      "white": "te_xa",
      "green": "te_xa",
      "blue": "te_xa",
      "purple": "te_xa",
      "orange": "te_xa",
      "red": "te_xa"
    },
    "dot_tien": {
      "white": "dot_tien",
      "green": "dot_tien",
      "blue": "dot_tien",
      "purple": "dot_tien",
      "orange": "dot_tien",
      "red": "dot_tien"
    },
    "thiet_bich": {
      "white": "thiet_bich",
      "green": "no_thich",
      "blue": "dot_kich",
      "purple": "lien_thich",
      "orange": "xuyen_van_thich",
      "red": "xuyen_van_thich"
    },
    "hoanh_tao": {
      "white": "hoanh_tao",
      "green": "hoanh_hoa",
      "blue": "tap_kich",
      "purple": "loan_kich",
      "orange": "loan_kich",
      "red": "loan_kich"
    },
    "phan_tan": {
      "white": "phan_tan",
      "green": "phan_tan",
      "blue": "phan_tan",
      "purple": "phan_tan",
      "orange": "phan_tan",
      "red": "phan_tan"
    },
    "giao_chien": {
      "white": "giao_chien",
      "green": "giao_chien",
      "blue": "giao_chien",
      "purple": "giao_chien",
      "orange": "giao_chien",
      "red": "giao_chien"
    },
    "cuong_tap": {
      "white": "cuong_tap",
      "green": "nhieu_tap",
      "blue": "nhieu_tap",
      "purple": "nhieu_tap",
      "orange": "nhieu_tap",
      "red": "nhieu_tap"
    },
    "kich_doc": {
      "white": "kich_doc",
      "green": "on_dich",
      "blue": "on_dich",
      "purple": "on_dich",
      "orange": "on_dich",
      "red": "on_dich"
    },
    "gio_loc": {
      "white": "gio_loc",
      "green": "gio_loc",
      "blue": "gio_loc",
      "purple": "gio_loc",
      "orange": "gio_loc",
      "red": "gio_loc"
    },
    "tri_lieu": {
      "white": "tri_lieu",
      "green": "tri_lieu",
      "blue": "bich_luy",
      "purple": "thuan_tuong",
      "orange": "vung_nhu_ban_thach",
      "red": "vung_nhu_ban_thach"
    },
    "am_te": {
      "white": "am_te",
      "green": "am_te",
      "blue": "am_te",
      "purple": "lac_thuy_tien",
      "orange": "khuynh_the_giai_nhan",
      "red": "vu_dieu_lac_than"
    },
    "boc_viem": {
      "white": "boc_viem",
      "green": "hoa_nham",
      "blue": "hoa_nham",
      "purple": "hoa_nham",
      "orange": "hoa_nham",
      "red": "hoa_nham"
    },
    "tu_sanh": {
      "white": "tu_sanh",
      "green": "tu_sanh",
      "blue": "yeu_giap",
      "purple": "yeu_giap",
      "orange": "tran_dinh_son_ha",
      "red": "thinh_the_vuong_quyen"
    },
    "tu_huy": {
      "white": "tu_huy",
      "green": "tu_huy",
      "blue": "tuyet_sat",
      "purple": "khai_son_huyet_phu",
      "orange": "vo_song_thuong_tuong",
      "red": "vo_song_thuong_tuong"
    },
    "xuyen_duong": {
      "white": "xuyen_duong",
      "green": "xuyen_duong",
      "blue": "xuyen_duong",
      "purple": "xuyen_duong",
      "orange": "xuyen_duong",
      "red": "xuyen_duong"
    },
    "lien_kich": {
      "white": "lien_kich",
      "green": "tieu_sat",
      "blue": "tieu_sat",
      "purple": "tieu_sat",
      "orange": "tieu_sat",
      "red": "tieu_sat"
    },
    "hoa_long": {
      "white": "hoa_long",
      "green": "bao_loi",
      "blue": "than_ngu",
      "purple": "an_nghia",
      "orange": "than_huu_mot_phuong",
      "red": "than_huu_mot_phuong"
    },
    "xa_thu": {
      "white": "xa_thu",
      "green": "xa_thu",
      "blue": "xa_thu",
      "purple": "xa_thu",
      "orange": "xa_thu",
      "red": "xa_thu"
    },
    "tien_vu": {
      "white": "tien_vu",
      "green": "ten_lac",
      "blue": "hoa_tien",
      "purple": "tien_lam",
      "orange": "than_tien_ho_chu",
      "red": "than_tien_ho_chu"
    },
    "con_thach": {
      "white": "con_thach",
      "green": "lac_thach",
      "blue": "quy_ke",
      "purple": "doat_tam",
      "orange": "doat_tam",
      "red": "doat_tam"
    },
    "ly_gian": {
      "white": "ly_gian",
      "green": "phien_dong",
      "blue": "muu_thu",
      "purple": "loan_the_muu",
      "orange": "cu_cong_ngao_thuong",
      "red": "gia_chieu_cu_binh"
    },
    "thuan_kich": {
      "white": "thuan_kich",
      "green": "thuan_kich",
      "blue": "yeu_giap",
      "purple": "yeu_giap",
      "orange": "yeu_giap",
      "red": "yeu_giap"
    },
    "lien_hoan": {
      "white": "lien_hoan",
      "green": "ten_lac",
      "blue": "tien_tran",
      "purple": "hoa_long_tien",
      "orange": "that_tinh_tien_tran",
      "red": "that_tinh_tien_tran"
    },
    "dot_tap": {
      "white": "dot_tap",
      "green": "dot_tap",
      "blue": "dot_tap",
      "purple": "dot_tap",
      "orange": "dot_tap",
      "red": "dot_tap"
    },
    "cu_ma": {
      "white": "cu_ma",
      "green": "cu_ma",
      "blue": "cu_ma",
      "purple": "cu_ma",
      "orange": "cu_ma",
      "red": "cu_ma"
    },
    "pha_phu": {
      "white": "pha_phu",
      "green": "pha_phu",
      "blue": "pha_phu",
      "purple": "pha_phu",
      "orange": "pha_phu",
      "red": "pha_phu"
    },
    "chuyen_chu": {
      "white": "chuyen_chu",
      "green": "chuyen_chu",
      "blue": "chuyen_chu",
      "purple": "chuyen_chu",
      "orange": "chuyen_chu",
      "red": "chuyen_chu"
    },
    "loi_nhan": {
      "white": "loi_nhan",
      "green": "loi_nhan",
      "blue": "loi_nhan",
      "purple": "loi_nhan",
      "orange": "loi_nhan",
      "red": "loi_nhan"
    },
    "lang_dao": {
      "white": "lang_dao",
      "green": "huyen_bang",
      "blue": "huyen_bang",
      "purple": "huyen_bang",
      "orange": "huyen_bang",
      "red": "huyen_bang"
    },
    "hai_tieu": {
      "white": "hai_tieu",
      "green": "mai_lang",
      "blue": "long_dao",
      "purple": "thuy_cong",
      "orange": "thuy_cong",
      "red": "thuy_cong"
    },
    "tat_xung": {
      "white": "tat_xung",
      "green": "sat_khi",
      "blue": "xich_long",
      "purple": "viem_long_pha",
      "orange": "viem_long_ky_tap",
      "red": "viem_long_ky_tap"
    },
    "chuoc_gioi": {
      "white": "chuoc_gioi",
      "green": "tien_dap",
      "blue": "tien_dap",
      "purple": "tien_dap",
      "orange": "tien_dap",
      "red": "tien_dap"
    },
    "npc_troi_tru_dat_diet": {
      "white": "npc_troi_tru_dat_diet",
      "green": "lien_no",
      "blue": "hoa_no",
      "purple": "hoa_no",
      "orange": "hoa_no",
      "red": "hoa_no"
    },
    "no_kiem": {
      "white": "no_kiem",
      "green": "no_tram",
      "blue": "dang_long",
      "purple": "tinh_ngu",
      "orange": "troi_roi_sao_sang",
      "red": "tinh_van_dia_liep"
    },
    "huyet_che": {
      "white": "huyet_che",
      "green": "huyet_che",
      "blue": "kim_ham",
      "purple": "sach_phan",
      "orange": "bo_toi_theo_sang",
      "red": "bo_toi_theo_sang"
    },
    "phi_xa": {
      "white": "phi_xa",
      "green": "lien_no",
      "blue": "cung_ma",
      "purple": "doat_tam_tien",
      "orange": "loan_hoi_phuong_vu",
      "red": "loan_hoi_phuong_vu"
    },
    "kich_duong": {
      "blue": "kich_duong",
      "purple": "thanh_huy",
      "orange": "giao_nguyet_thanh_huy",
      "red": "giao_nguyet_thanh_huy"
    },
    "xuyen_thich": {
      "blue": "xuyen_thich",
      "purple": "hoang_thien_quy_dao",
      "orange": "ngu_hanh_pha_tran",
      "red": "ngu_hanh_pha_tran"
    },
    "kinh_anh_son_ha": {
      "orange": "kinh_anh_son_ha",
      "red": "kinh_dien_luan_hoi"
    },
    "bai_nhieu": {
      "white": "bai_nhieu",
      "green": "giai_nan",
      "blue": "giai_tru",
      "purple": "phan_ke",
      "orange": "nho_thanh_ho_the",
      "red": "nho_thanh_ho_the"
    },
    "toa_hon": {
      "blue": "toa_hon",
      "purple": "am_van",
      "orange": "thau_tom_thien_ha",
      "red": "thau_tom_thien_ha"
    },
    "khich_le": {
      "white": "khich_le",
      "green": "khich_le",
      "blue": "thi_doc",
      "purple": "thuc_tam",
      "orange": "quy_mon_thi_doc",
      "red": "quy_mon_thi_doc"
    },
    "xua_duoi": {
      "blue": "xua_duoi",
      "purple": "xua_duoi",
      "orange": "hien_thuc_luu_phuong",
      "red": "hien_thuc_luu_phuong"
    },
    "lac_nhat_than_tien": {
      "orange": "lac_nhat_than_tien",
      "red": "lac_nhat_than_tien"
    },
    "lung_hoan_tang_dich": {
      "orange": "lung_hoan_tang_dich",
      "red": "lung_hoan_tang_dich"
    },
    "kinh_thien_bao_loi": {
      "orange": "kinh_thien_bao_loi",
      "red": "kinh_thien_bao_loi"
    },
    "thiet_thuong": {
      "white": "thiet_thuong",
      "green": "dia_thich",
      "blue": "cot_thich",
      "purple": "diem_la_kich",
      "orange": "nghich_chuyen_sinh_tu",
      "red": "nghich_chuyen_sinh_tu"
    },
    "bai_ca_bien_ai": {
      "orange": "bai_ca_bien_ai",
      "red": "bai_ca_bien_ai"
    },
    "phi_long_tai_thien": {
      "orange": "phi_long_tai_thien",
      "red": "phi_long_tai_thien"
    },
    "phan_chan": {
      "white": "phan_chan",
      "green": "kich_duong",
      "blue": "ngang_duong",
      "purple": "tung_ca",
      "orange": "phan_chan_long_quan",
      "red": "ca_tung_cong_duc"
    },
    "tan_ra": {
      "blue": "tan_ra",
      "purple": "pha_hoang_sach",
      "orange": "thien_dia_vo_cuc",
      "red": "can_khon_ta_phap"
    },
    "doc_nhan": {
      "white": "doc_nhan",
      "green": "xa_thich",
      "blue": "liet_nhan",
      "purple": "phan_thien",
      "orange": "hong_hoang_no_hoa",
      "red": "than_hoa_hien_the"
    },
    "tran_dinh_son_ha": {
      "orange": "tran_dinh_son_ha",
      "red": "thinh_the_vuong_quyen"
    },
    "long_minh": {
      "white": "long_minh",
      "green": "long_uy",
      "blue": "no_long",
      "purple": "than_binh_xuat_hien",
      "orange": "than_binh_am_do",
      "red": "ky_binh_pha_thuc"
    },
    "bua_phep_tran_ta": {
      "orange": "bua_phep_tran_ta",
      "red": "dao_thuat_huyen_thong"
    },
    "cam_vu": {
      "white": "cam_vu",
      "green": "cam_vu",
      "blue": "cam_vu",
      "purple": "nhan_y",
      "orange": "thanh_thu_te_the",
      "red": "huyen_ho_te_chung"
    }
  }
},
"generals": {
  "schemaVersion": 2,
  "schema": {
    "id": "stable key",
    "name": "Tên Việt",
    "faction": "factions.list.*",
    "quality": "qualities.tiers.*",
    "troop": "troops.types.*",
    "base": "tongLinh, vuLuc, triLuc, hp @ level 1",
    "skillId": "skills.skills.* (base; chiêu thực tế = qualityLadders / skillsByQuality)",
    "skillsByQuality": "optional map white|…|red → skillId (wiki phẩm)",
    "tags": "string[]",
    "obtain": "starter|recruit|campaign|event",
    "npcOnly": "optional bool",
    "troop2": "optional second troop type"
  },
  "startersByFaction": {
    "shu": [
      "liaohua",
      "guanying",
      "zhangbao_shu"
    ],
    "wei": [
      "yuejin",
      "licadian",
      "caoren"
    ],
    "wu": [
      "chengpu",
      "handang",
      "zhouzhi"
    ]
  },
  "list": [
    {
      "id": "liubei",
      "name": "Lưu Bị",
      "faction": "shu",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 92,
        "vuLuc": 68,
        "triLuc": 78,
        "hp": 3200
      },
      "skillId": "hieu_lenh",
      "tags": [
        "minh_chu"
      ],
      "obtain": "prestige",
      "wikiHeroId": "3834",
      "skillsByQuality": {
        "white": "hieu_lenh",
        "green": "thien_menh",
        "blue": "thien_chinh",
        "purple": "quan_lam",
        "orange": "thien_ha_chia_ba",
        "red": "thien_ha_chia_ba"
      }
    },
    {
      "id": "guanyu",
      "name": "Quan Vũ",
      "faction": "shu",
      "quality": "red",
      "troop": "cavalry",
      "base": {
        "tongLinh": 85,
        "vuLuc": 98,
        "triLuc": 72,
        "hp": 3400
      },
      "skillId": "yen_nguyet",
      "tags": [
        "ngu_ho_tuong"
      ],
      "obtain": "prestige",
      "troop2": "spear",
      "wikiHeroId": "4230",
      "skillsByQuality": {
        "white": "yen_nguyet",
        "green": "thanh_long",
        "blue": "vo_thanh",
        "purple": "thanh_long_tram",
        "orange": "thien_ly_don_ky",
        "red": "uy_chan_hoa_ha"
      }
    },
    {
      "id": "zhangfei",
      "name": "Trương Phi",
      "faction": "shu",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 78,
        "vuLuc": 96,
        "triLuc": 45,
        "hp": 3600
      },
      "skillId": "no_sat",
      "tags": [
        "ngu_ho_tuong"
      ],
      "obtain": "prestige",
      "troop2": "spear",
      "wikiHeroId": "4076",
      "skillsByQuality": {
        "white": "no_sat",
        "green": "bao_hao",
        "blue": "manh_ho",
        "purple": "ho_khieu",
        "orange": "ba_vuong_kich_dinh",
        "red": "manh_ho_liet_son"
      }
    },
    {
      "id": "zhaoyun",
      "name": "Triệu Vân",
      "faction": "shu",
      "quality": "red",
      "troop": "cavalry",
      "base": {
        "tongLinh": 88,
        "vuLuc": 94,
        "triLuc": 70,
        "hp": 3300
      },
      "skillId": "don_ky",
      "tags": [
        "ngu_ho_tuong"
      ],
      "obtain": "recruit",
      "troop2": "spear",
      "wikiHeroId": "4124",
      "skillsByQuality": {
        "white": "don_ky",
        "green": "than_phong",
        "blue": "bach_long",
        "purple": "ngan_long",
        "orange": "ngan_long_that_thiem",
        "red": "thien_long_thuc_tinh"
      }
    },
    {
      "id": "zhugeliang",
      "name": "Gia Cát Lượng",
      "faction": "shu",
      "quality": "red",
      "troop": "archer",
      "base": {
        "tongLinh": 80,
        "vuLuc": 42,
        "triLuc": 100,
        "hp": 2600
      },
      "skillId": "dong_phong",
      "tags": [
        "quan_su",
        "ngoa_long"
      ],
      "obtain": "campaign",
      "troop2": "strategist",
      "wikiHeroId": "3969",
      "skillsByQuality": {
        "white": "dong_phong",
        "green": "phuc_long",
        "blue": "than_toan",
        "purple": "bat_tran_do",
        "orange": "ky_mon_bat_tran_do",
        "red": "ky_mon_bat_tran_do"
      }
    },
    {
      "id": "huangzhong",
      "name": "Hoàng Trung",
      "faction": "shu",
      "quality": "orange",
      "troop": "archer",
      "base": {
        "tongLinh": 70,
        "vuLuc": 93,
        "triLuc": 55,
        "hp": 2800
      },
      "skillId": "loi_tien",
      "tags": [
        "ngu_ho_tuong"
      ],
      "obtain": "recruit",
      "troop2": "infantry",
      "wikiHeroId": "4170",
      "skillsByQuality": {
        "white": "loi_tien",
        "green": "liet_thi",
        "blue": "nghe_xa",
        "purple": "truy_nguyet",
        "orange": "lac_nhat_than_tien",
        "red": "xich_vu_quan_hong"
      }
    },
    {
      "id": "machao",
      "name": "Mã Siêu",
      "faction": "shu",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 75,
        "vuLuc": 95,
        "triLuc": 48,
        "hp": 3100
      },
      "skillId": "pha_quan",
      "tags": [
        "ngu_ho_tuong"
      ],
      "obtain": "recruit",
      "troop2": "spear",
      "wikiHeroId": "3983",
      "skillsByQuality": {
        "white": "pha_quan",
        "green": "thi_quan",
        "blue": "ky_than",
        "purple": "phong_loi",
        "orange": "te_nhat_thien_ky",
        "red": "te_nhat_thien_ky"
      }
    },
    {
      "id": "pangtong",
      "name": "Bàng Thống",
      "faction": "shu",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 72,
        "vuLuc": 40,
        "triLuc": 94,
        "hp": 2500
      },
      "skillId": "tu_dien",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "4115",
      "skillsByQuality": {
        "white": "tu_dien",
        "green": "than_loi",
        "blue": "loi_oanh",
        "purple": "cuu_thien_than_loi",
        "orange": "kinh_thien_bao_loi",
        "red": "cuu_tieu_than_loi"
      }
    },
    {
      "id": "weiyan",
      "name": "Ngụy Diên",
      "faction": "shu",
      "quality": "purple",
      "troop": "spear",
      "base": {
        "tongLinh": 74,
        "vuLuc": 88,
        "triLuc": 52,
        "hp": 3000
      },
      "skillId": "hoanh_hoa",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "3542",
      "skillsByQuality": {
        "white": "hoanh_hoa",
        "green": "tau_sat",
        "blue": "dang_long",
        "purple": "tinh_ngu",
        "orange": "troi_roi_sao_sang",
        "red": "tinh_van_dia_liep"
      }
    },
    {
      "id": "liufeng",
      "name": "Lưu Phong",
      "faction": "shu",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 70,
        "triLuc": 48,
        "hp": 2400
      },
      "skillId": "thu_kich",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "1002",
      "skillsByQuality": {
        "white": "thu_kich",
        "green": "loi_tien",
        "blue": "loi_tien",
        "purple": "loi_tien",
        "orange": "loi_tien",
        "red": "loi_tien"
      }
    },
    {
      "id": "guanying",
      "name": "Quan Bình",
      "faction": "shu",
      "quality": "blue",
      "troop": "cavalry",
      "base": {
        "tongLinh": 60,
        "vuLuc": 72,
        "triLuc": 50,
        "hp": 2350
      },
      "skillId": "phan_kich",
      "tags": [],
      "obtain": "starter",
      "wikiHeroId": "3801",
      "skillsByQuality": {
        "white": "phan_kich",
        "green": "nghich_chuyen",
        "blue": "bac_sat",
        "purple": "thanh_long_hon",
        "orange": "thanh_long_khieu_nguyet",
        "red": "thanh_long_khieu_nguyet"
      }
    },
    {
      "id": "zhangbao_shu",
      "name": "Trương Bào",
      "faction": "shu",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 58,
        "vuLuc": 74,
        "triLuc": 42,
        "hp": 2450
      },
      "skillId": "basic_strike",
      "tags": [],
      "obtain": "starter"
    },
    {
      "id": "jiangwei",
      "name": "Khương Duy",
      "faction": "shu",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 82,
        "vuLuc": 84,
        "triLuc": 88,
        "hp": 3000
      },
      "skillId": "ngu_giap",
      "tags": [
        "quan_su"
      ],
      "obtain": "campaign",
      "wikiHeroId": "3944",
      "skillsByQuality": {
        "white": "ngu_giap",
        "green": "ngu_giap",
        "blue": "than_ngu",
        "purple": "an_nghia",
        "orange": "nghia_dam_hung_tam",
        "red": "nghia_dam_hung_tam"
      }
    },
    {
      "id": "fazheng",
      "name": "Pháp Chính",
      "faction": "shu",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 70,
        "vuLuc": 45,
        "triLuc": 92,
        "hp": 2480
      },
      "skillId": "son_bang",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "3852",
      "skillsByQuality": {
        "white": "son_bang",
        "green": "thap_thien",
        "blue": "thien_bang",
        "purple": "liet_thien",
        "orange": "troi_tru_dat_diet",
        "red": "troi_tru_dat_diet"
      }
    },
    {
      "id": "xushu",
      "name": "Từ Thứ",
      "faction": "shu",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 74,
        "vuLuc": 48,
        "triLuc": 90,
        "hp": 2520
      },
      "skillId": "hu_vo",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "3606",
      "skillsByQuality": {
        "white": "hu_vo",
        "green": "hac_dong",
        "blue": "tham_uyen",
        "purple": "doc_dia",
        "orange": "thao_luoc_tung_hoanh",
        "red": "muu_doan_can_khon"
      }
    },
    {
      "id": "madai",
      "name": "Mã Đại",
      "faction": "shu",
      "quality": "blue",
      "troop": "cavalry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 78,
        "triLuc": 45,
        "hp": 2500
      },
      "skillId": "uy_phong",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "1968",
      "skillsByQuality": {
        "white": "uy_phong",
        "green": "tang_phong",
        "blue": "khu_truc",
        "purple": "kiem_ham",
        "orange": "kiem_ham",
        "red": "kiem_ham"
      }
    },
    {
      "id": "liaohua",
      "name": "Liêu Hóa",
      "faction": "shu",
      "quality": "green",
      "troop": "spear",
      "base": {
        "tongLinh": 55,
        "vuLuc": 62,
        "triLuc": 40,
        "hp": 2100
      },
      "skillId": "dap_pha",
      "tags": [],
      "obtain": "starter",
      "wikiHeroId": "1470",
      "skillsByQuality": {
        "white": "dap_pha",
        "green": "don_ky",
        "blue": "ky_liep",
        "purple": "ky_liep",
        "orange": "ky_liep",
        "red": "ky_liep"
      }
    },
    {
      "id": "wangping",
      "name": "Vương Bình",
      "faction": "shu",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 65,
        "triLuc": 58,
        "hp": 2550
      },
      "skillId": "basic_strike",
      "tags": [],
      "obtain": "recruit"
    },
    {
      "id": "caocao",
      "name": "Tào Tháo",
      "faction": "wei",
      "quality": "red",
      "troop": "cavalry",
      "base": {
        "tongLinh": 95,
        "vuLuc": 78,
        "triLuc": 90,
        "hp": 3350
      },
      "skillId": "hieu_lenh",
      "tags": [
        "minh_chu"
      ],
      "obtain": "prestige",
      "wikiHeroId": "3836",
      "skillsByQuality": {
        "white": "hieu_lenh",
        "green": "kieu_hung",
        "blue": "thien_chinh",
        "purple": "quan_lam",
        "orange": "thien_ha_chia_ba",
        "red": "thien_ha_chia_ba"
      }
    },
    {
      "id": "simayi",
      "name": "Tư Mã Ý",
      "faction": "wei",
      "quality": "red",
      "troop": "archer",
      "base": {
        "tongLinh": 82,
        "vuLuc": 48,
        "triLuc": 98,
        "hp": 2700
      },
      "skillId": "kinh_loi",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "3771",
      "skillsByQuality": {
        "white": "kinh_loi",
        "green": "than_loi",
        "blue": "tu_than",
        "purple": "sinh_sat",
        "orange": "thu_hon_doat_phach",
        "red": "thu_hon_doat_phach"
      }
    },
    {
      "id": "xuchu",
      "name": "Hứa Chử",
      "faction": "wei",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 97,
        "triLuc": 30,
        "hp": 3800
      },
      "skillId": "cuong_bao",
      "tags": [],
      "obtain": "prestige",
      "troop2": "infantry",
      "wikiHeroId": "3799",
      "skillsByQuality": {
        "white": "cuong_bao",
        "green": "chien_cuong",
        "blue": "cuong_loan",
        "purple": "ho_tri",
        "orange": "loa_y_no_tap",
        "red": "loa_y_no_tap"
      }
    },
    {
      "id": "dianwei",
      "name": "Điển Vi",
      "faction": "wei",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 96,
        "triLuc": 35,
        "hp": 3700
      },
      "skillId": "ngu_giap",
      "tags": [],
      "obtain": "prestige",
      "troop2": "spear",
      "wikiHeroId": "4172",
      "skillsByQuality": {
        "white": "ngu_giap",
        "green": "ngu_giap",
        "blue": "than_ngu",
        "purple": "huyet_chien_bat_phuong",
        "orange": "ac_quy_trien_than",
        "red": "ac_lai_liet_phach"
      }
    },
    {
      "id": "jiaxu",
      "name": "Giả Hủ",
      "faction": "wei",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 76,
        "vuLuc": 38,
        "triLuc": 96,
        "hp": 2550
      },
      "skillId": "hu_vo",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "3604",
      "skillsByQuality": {
        "white": "hu_vo",
        "green": "hac_dong",
        "blue": "tham_uyen",
        "purple": "doc_dia",
        "orange": "thao_luoc_tung_hoanh",
        "red": "muu_doan_can_khon"
      }
    },
    {
      "id": "zhangliao",
      "name": "Trương Liêu",
      "faction": "wei",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 86,
        "vuLuc": 90,
        "triLuc": 68,
        "hp": 3150
      },
      "skillId": "ho_xung",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "4228",
      "skillsByQuality": {
        "white": "ho_xung",
        "green": "ho_sat",
        "blue": "quy_sat",
        "purple": "huyet_quy_nhan",
        "orange": "luot_nhanh_nhu_gio",
        "red": "trieu_ho_pha_tran"
      }
    },
    {
      "id": "xuhuang",
      "name": "Từ Hoảng",
      "faction": "wei",
      "quality": "purple",
      "troop": "spear",
      "base": {
        "tongLinh": 84,
        "vuLuc": 86,
        "triLuc": 60,
        "hp": 3200
      },
      "skillId": "man_nguu",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "3808",
      "skillsByQuality": {
        "white": "man_nguu",
        "green": "cuong_nguu",
        "blue": "dia_long",
        "purple": "hoa_nguu_dap",
        "orange": "troi_long_dat_lo",
        "red": "troi_long_dat_lo"
      }
    },
    {
      "id": "zhanghe",
      "name": "Trương Cáp",
      "faction": "wei",
      "quality": "purple",
      "troop": "cavalry",
      "base": {
        "tongLinh": 80,
        "vuLuc": 85,
        "triLuc": 70,
        "hp": 3050
      },
      "skillId": "don_ky",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "4126",
      "skillsByQuality": {
        "white": "don_ky",
        "green": "chien_ky",
        "blue": "ho_uy",
        "purple": "thien_bien",
        "orange": "binh_vo_thuong_hinh",
        "red": "binh_hinh_cuu_don"
      }
    },
    {
      "id": "yuejin",
      "name": "Nhạc Tiến",
      "faction": "wei",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 68,
        "vuLuc": 80,
        "triLuc": 42,
        "hp": 2700
      },
      "skillId": "phan_kich",
      "tags": [],
      "obtain": "starter",
      "troop2": "spear",
      "wikiHeroId": "933",
      "skillsByQuality": {
        "white": "phan_kich",
        "green": "nghich_chuyen",
        "blue": "nghich_chuyen",
        "purple": "nghich_chuyen",
        "orange": "nghich_chuyen",
        "red": "nghich_chuyen"
      }
    },
    {
      "id": "licadian",
      "name": "Lý Điển",
      "faction": "wei",
      "quality": "blue",
      "troop": "spear",
      "base": {
        "tongLinh": 70,
        "vuLuc": 72,
        "triLuc": 75,
        "hp": 2600
      },
      "skillId": "kich_thich",
      "tags": [],
      "obtain": "starter",
      "troop2": "strategist",
      "wikiHeroId": "1928",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "pha_kich",
        "blue": "huy_diet",
        "purple": "huy_diet",
        "orange": "huy_diet",
        "red": "huy_diet"
      }
    },
    {
      "id": "guojia",
      "name": "Quách Gia",
      "faction": "wei",
      "quality": "orange",
      "troop": "archer",
      "base": {
        "tongLinh": 72,
        "vuLuc": 40,
        "triLuc": 97,
        "hp": 2450
      },
      "skillId": "viem_loi",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "3971",
      "skillsByQuality": {
        "white": "viem_loi",
        "green": "xich_loi",
        "blue": "quy_muu",
        "purple": "quy_ke",
        "orange": "bien_sao_lap_lanh",
        "red": "bien_sao_lap_lanh"
      }
    },
    {
      "id": "xunyu",
      "name": "Tuân Úc",
      "faction": "wei",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 78,
        "vuLuc": 35,
        "triLuc": 93,
        "hp": 2400
      },
      "skillId": "tu_dien",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "4116",
      "skillsByQuality": {
        "white": "tu_dien",
        "green": "than_loi",
        "blue": "loi_oanh",
        "purple": "cuu_thien_than_loi",
        "orange": "kinh_thien_bao_loi",
        "red": "cuu_tieu_than_loi"
      }
    },
    {
      "id": "xunyou",
      "name": "Tuân Du",
      "faction": "wei",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 74,
        "vuLuc": 38,
        "triLuc": 91,
        "hp": 2380
      },
      "skillId": "dia_liep",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "3818",
      "skillsByQuality": {
        "white": "dia_liep",
        "green": "dia_nha",
        "blue": "bang_chuy",
        "purple": "bang_phong",
        "orange": "thien_ly_bang_phong",
        "red": "thien_ly_bang_phong"
      }
    },
    {
      "id": "caoren",
      "name": "Tào Nhân",
      "faction": "wei",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 88,
        "vuLuc": 78,
        "triLuc": 55,
        "hp": 3300
      },
      "skillId": "ho_khieu",
      "tags": [],
      "obtain": "starter",
      "troop2": "spear",
      "wikiHeroId": "3788",
      "skillsByQuality": {
        "white": "ho_khieu",
        "green": "su_hong",
        "blue": "cuong_hao",
        "purple": "de_hon",
        "orange": "pha_dam_no_hong",
        "red": "pha_dam_no_hong"
      }
    },
    {
      "id": "caopi",
      "name": "Tào Phi",
      "faction": "wei",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 85,
        "vuLuc": 72,
        "triLuc": 80,
        "hp": 3000
      },
      "skillId": "cong_tam",
      "tags": [
        "minh_chu"
      ],
      "obtain": "campaign",
      "wikiHeroId": "2758",
      "skillsByQuality": {
        "white": "cong_tam",
        "green": "tu_lap",
        "blue": "dang_co",
        "purple": "quy_tam",
        "orange": "uy_ap",
        "red": "uy_ap"
      }
    },
    {
      "id": "xiahou_dun",
      "name": "Hạ Hầu Đôn",
      "faction": "wei",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 82,
        "vuLuc": 88,
        "triLuc": 58,
        "hp": 3200
      },
      "skillId": "no_sat",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "4077",
      "skillsByQuality": {
        "white": "no_sat",
        "green": "bao_hao",
        "blue": "manh_ho",
        "purple": "ho_khieu",
        "orange": "ba_vuong_kich_dinh",
        "red": "manh_ho_liet_son"
      }
    },
    {
      "id": "xiahou_yuan",
      "name": "Hạ Hầu Uyên",
      "faction": "wei",
      "quality": "purple",
      "troop": "cavalry",
      "base": {
        "tongLinh": 76,
        "vuLuc": 87,
        "triLuc": 55,
        "hp": 3000
      },
      "skillId": "pha_quan",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "3984",
      "skillsByQuality": {
        "white": "pha_quan",
        "green": "thi_quan",
        "blue": "ky_than",
        "purple": "phong_loi",
        "orange": "te_nhat_thien_ky",
        "red": "te_nhat_thien_ky"
      }
    },
    {
      "id": "sunquan",
      "name": "Tôn Quyền",
      "faction": "wu",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 90,
        "vuLuc": 70,
        "triLuc": 82,
        "hp": 3100
      },
      "skillId": "hieu_lenh",
      "tags": [
        "minh_chu"
      ],
      "obtain": "prestige",
      "troop2": "cavalry",
      "wikiHeroId": "3835",
      "skillsByQuality": {
        "white": "hieu_lenh",
        "green": "thien_menh",
        "blue": "thien_chinh",
        "purple": "quan_lam",
        "orange": "thien_ha_chia_ba",
        "red": "thien_ha_chia_ba"
      }
    },
    {
      "id": "zhouyu",
      "name": "Chu Du",
      "faction": "wu",
      "quality": "red",
      "troop": "archer",
      "base": {
        "tongLinh": 78,
        "vuLuc": 72,
        "triLuc": 96,
        "hp": 2750
      },
      "skillId": "binh_tien",
      "tags": [
        "quan_su"
      ],
      "obtain": "prestige",
      "troop2": "strategist",
      "wikiHeroId": "3970",
      "skillsByQuality": {
        "white": "binh_tien",
        "green": "phong_tien",
        "blue": "hoa_than",
        "purple": "dai_viem_de",
        "orange": "luyen_nguc_hoa_hai",
        "red": "luyen_nguc_hoa_hai"
      }
    },
    {
      "id": "luxun",
      "name": "Lục Tốn",
      "faction": "wu",
      "quality": "orange",
      "troop": "archer",
      "base": {
        "tongLinh": 80,
        "vuLuc": 55,
        "triLuc": 93,
        "hp": 2650
      },
      "skillId": "hong_viem",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "4117",
      "skillsByQuality": {
        "white": "hong_viem",
        "green": "hac_viem",
        "blue": "nhien_tan",
        "purple": "hoa_thieu_lien_doanh",
        "orange": "hoa_the_ngut_troi",
        "red": "xich_lua_tri_tue"
      }
    },
    {
      "id": "taishici",
      "name": "Thái Sử Từ",
      "faction": "wu",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 74,
        "vuLuc": 89,
        "triLuc": 58,
        "hp": 2900
      },
      "skillId": "nghich_tap",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "4143",
      "skillsByQuality": {
        "white": "nghich_tap",
        "green": "nghich_luu",
        "blue": "lang_tuyen",
        "purple": "to_luu_nghich_tap",
        "orange": "lung_hoan_tang_dich",
        "red": "lang_tuyen_khon_tran"
      }
    },
    {
      "id": "ganning",
      "name": "Cam Ninh",
      "faction": "wu",
      "quality": "purple",
      "troop": "cavalry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 91,
        "triLuc": 50,
        "hp": 2950
      },
      "skillId": "no_sat",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "4078",
      "skillsByQuality": {
        "white": "no_sat",
        "green": "bao_hao",
        "blue": "manh_ho",
        "purple": "ho_khieu",
        "orange": "ba_vuong_kich_dinh",
        "red": "manh_ho_liet_son"
      }
    },
    {
      "id": "huanggai",
      "name": "Hoàng Cái",
      "faction": "wu",
      "quality": "blue",
      "troop": "spear",
      "base": {
        "tongLinh": 76,
        "vuLuc": 82,
        "triLuc": 55,
        "hp": 3000
      },
      "skillId": "kho_ke",
      "tags": [],
      "obtain": "campaign",
      "wikiHeroId": "3800",
      "skillsByQuality": {
        "white": "kho_ke",
        "green": "hy_sinh",
        "blue": "the_tu",
        "purple": "ngoc_thach_cu_diet",
        "orange": "cang_gia_cang_cay",
        "red": "cang_gia_cang_cay"
      }
    },
    {
      "id": "zhouzhi",
      "name": "Chu Thái",
      "faction": "wu",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 80,
        "triLuc": 40,
        "hp": 2850
      },
      "skillId": "don_ky",
      "tags": [],
      "obtain": "starter",
      "wikiHeroId": "4125",
      "skillsByQuality": {
        "white": "don_ky",
        "green": "huyet_chinh",
        "blue": "dung_manh",
        "purple": "phan_chien",
        "orange": "chien_than_bat_khuat",
        "red": "lay_than_lam_giap"
      }
    },
    {
      "id": "lingtong",
      "name": "Lăng Thống",
      "faction": "wu",
      "quality": "blue",
      "troop": "cavalry",
      "base": {
        "tongLinh": 68,
        "vuLuc": 82,
        "triLuc": 48,
        "hp": 2750
      },
      "skillId": "doc_tieu",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "974",
      "skillsByQuality": {
        "white": "doc_tieu",
        "green": "xa_doc",
        "blue": "xa_doc",
        "purple": "xa_doc",
        "orange": "xa_doc",
        "red": "xa_doc"
      }
    },
    {
      "id": "lusu",
      "name": "Lỗ Túc",
      "faction": "wu",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 80,
        "vuLuc": 42,
        "triLuc": 88,
        "hp": 2500
      },
      "skillId": "hu_vo",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "3605",
      "skillsByQuality": {
        "white": "hu_vo",
        "green": "hac_dong",
        "blue": "tham_uyen",
        "purple": "doc_dia",
        "orange": "thao_luoc_tung_hoanh",
        "red": "muu_doan_can_khon"
      }
    },
    {
      "id": "zhugejin",
      "name": "Gia Cát Cẩn",
      "faction": "wu",
      "quality": "blue",
      "troop": "archer",
      "base": {
        "tongLinh": 72,
        "vuLuc": 40,
        "triLuc": 82,
        "hp": 2400
      },
      "skillId": "thu_ho",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "4067",
      "skillsByQuality": {
        "white": "thu_ho",
        "green": "han_ve",
        "blue": "bich_luy",
        "purple": "thuan_tuong",
        "orange": "vung_nhu_ban_thach",
        "red": "vung_nhu_ban_thach"
      }
    },
    {
      "id": "sunce",
      "name": "Tôn Sách",
      "faction": "wu",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 78,
        "vuLuc": 92,
        "triLuc": 60,
        "hp": 3200
      },
      "skillId": "xung_ba",
      "tags": [
        "minh_chu"
      ],
      "obtain": "campaign",
      "wikiHeroId": "4229",
      "skillsByQuality": {
        "white": "xung_ba",
        "green": "ba_vuong",
        "blue": "thien_uy",
        "purple": "ba_vuong_than_uy",
        "orange": "than_uy_pha_tran",
        "red": "ba_vuong_liet_phach"
      }
    },
    {
      "id": "sunjian",
      "name": "Tôn Kiên",
      "faction": "wu",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 80,
        "vuLuc": 86,
        "triLuc": 55,
        "hp": 3100
      },
      "skillId": "ham_dia",
      "tags": [],
      "obtain": "campaign",
      "wikiHeroId": "3543",
      "skillsByQuality": {
        "white": "ham_dia",
        "green": "san_bang",
        "blue": "dang_long",
        "purple": "tinh_ngu",
        "orange": "troi_roi_sao_sang",
        "red": "tinh_van_dia_liep"
      }
    },
    {
      "id": "xiaoqiao",
      "name": "Tiểu Kiều",
      "faction": "wu",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 55,
        "vuLuc": 30,
        "triLuc": 85,
        "hp": 2200
      },
      "skillId": "co_vu",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "4080",
      "skillsByQuality": {
        "white": "co_vu",
        "green": "kich_duong",
        "blue": "ngang_duong",
        "purple": "tung_ca",
        "orange": "phan_chan_long_quan",
        "red": "ca_tung_cong_duc"
      }
    },
    {
      "id": "daqiao",
      "name": "Đại Kiều",
      "faction": "wu",
      "quality": "blue",
      "troop": "archer",
      "base": {
        "tongLinh": 52,
        "vuLuc": 28,
        "triLuc": 80,
        "hp": 2100
      },
      "skillId": "tuong_dong",
      "tags": [],
      "obtain": "recruit",
      "wikiHeroId": "4100",
      "skillsByQuality": {
        "white": "tuong_dong",
        "green": "tuong_dong",
        "blue": "tuong_dong",
        "purple": "lac_thuy_tien",
        "orange": "khuynh_the_giai_nhan",
        "red": "vu_dieu_lac_than"
      }
    },
    {
      "id": "zhangzhao",
      "name": "Trương Chiêu",
      "faction": "wu",
      "quality": "blue",
      "troop": "archer",
      "base": {
        "tongLinh": 75,
        "vuLuc": 25,
        "triLuc": 84,
        "hp": 2300
      },
      "skillId": "nhuc_ma",
      "tags": [
        "quan_su"
      ],
      "obtain": "recruit",
      "wikiHeroId": "972",
      "skillsByQuality": {
        "white": "nhuc_ma",
        "green": "nhuc_ma",
        "blue": "nhuc_ma",
        "purple": "nhuc_ma",
        "orange": "nhuc_ma",
        "red": "nhuc_ma"
      }
    },
    {
      "id": "chengpu",
      "name": "Trình Phổ",
      "faction": "wu",
      "quality": "green",
      "troop": "spear",
      "base": {
        "tongLinh": 60,
        "vuLuc": 68,
        "triLuc": 45,
        "hp": 2300
      },
      "skillId": "ky_kich",
      "tags": [],
      "obtain": "starter",
      "wikiHeroId": "1905",
      "skillsByQuality": {
        "white": "ky_kich",
        "green": "ky_kich",
        "blue": "ky_chien",
        "purple": "ky_chien",
        "orange": "ky_chien",
        "red": "ky_chien"
      }
    },
    {
      "id": "handang",
      "name": "Hàn Đương",
      "faction": "wu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 58,
        "vuLuc": 70,
        "triLuc": 40,
        "hp": 2250
      },
      "skillId": "am_sat",
      "tags": [],
      "obtain": "starter",
      "wikiHeroId": "3769",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "thich_sat",
        "blue": "hanh_thich",
        "purple": "hanh_thich",
        "orange": "am_da_thich_sat",
        "red": "am_da_thich_sat"
      }
    },
    {
      "id": "recruit_guard",
      "name": "Thủ Vệ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 40,
        "vuLuc": 42,
        "triLuc": 30,
        "hp": 1600
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "recruit_scout",
      "name": "Do Thám",
      "faction": "other",
      "quality": "white",
      "troop": "archer",
      "base": {
        "tongLinh": 35,
        "vuLuc": 38,
        "triLuc": 45,
        "hp": 1400
      },
      "skillId": "basic_scheme",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "recruit_militia",
      "name": "Dân Binh",
      "faction": "other",
      "quality": "white",
      "troop": "spear",
      "base": {
        "tongLinh": 38,
        "vuLuc": 40,
        "triLuc": 28,
        "hp": 1550
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "recruit_porter",
      "name": "Phu Dịch",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 32,
        "vuLuc": 30,
        "triLuc": 25,
        "hp": 1300
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "recruit_rider",
      "name": "Kỵ Binh",
      "faction": "other",
      "quality": "green",
      "troop": "cavalry",
      "base": {
        "tongLinh": 48,
        "vuLuc": 55,
        "triLuc": 32,
        "hp": 1900
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "recruit_spearman",
      "name": "Thương Thủ",
      "faction": "other",
      "quality": "green",
      "troop": "spear",
      "base": {
        "tongLinh": 52,
        "vuLuc": 50,
        "triLuc": 35,
        "hp": 2000
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "recruit_crossbow",
      "name": "Nỏ Thủ",
      "faction": "other",
      "quality": "green",
      "troop": "archer",
      "base": {
        "tongLinh": 45,
        "vuLuc": 48,
        "triLuc": 50,
        "hp": 1800
      },
      "skillId": "basic_scheme",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "recruit_blade",
      "name": "Đao Phủ",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 50,
        "vuLuc": 58,
        "triLuc": 30,
        "hp": 1950
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "veteran_guard",
      "name": "Lão Binh",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 65,
        "triLuc": 40,
        "hp": 2400
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "veteran_rider",
      "name": "Thiết Kỵ",
      "faction": "other",
      "quality": "blue",
      "troop": "cavalry",
      "base": {
        "tongLinh": 60,
        "vuLuc": 72,
        "triLuc": 38,
        "hp": 2500
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "veteran_spear",
      "name": "Trường Thương",
      "faction": "other",
      "quality": "blue",
      "troop": "spear",
      "base": {
        "tongLinh": 66,
        "vuLuc": 68,
        "triLuc": 42,
        "hp": 2550
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "veteran_archer",
      "name": "Thiện Xạ",
      "faction": "other",
      "quality": "blue",
      "troop": "archer",
      "base": {
        "tongLinh": 55,
        "vuLuc": 60,
        "triLuc": 68,
        "hp": 2300
      },
      "skillId": "bach_bo",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "elite_vanguard",
      "name": "Tinh Nhuệ",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 74,
        "vuLuc": 80,
        "triLuc": 50,
        "hp": 3000
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "elite_raider",
      "name": "Kỳ Binh",
      "faction": "other",
      "quality": "purple",
      "troop": "cavalry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 86,
        "triLuc": 48,
        "hp": 2950
      },
      "skillId": "basic_strike",
      "tags": [
        "generic"
      ],
      "obtain": "recruit"
    },
    {
      "id": "zhangbao",
      "name": "Trương Bảo",
      "faction": "yellow",
      "quality": "blue",
      "troop": "spear",
      "base": {
        "tongLinh": 60,
        "vuLuc": 70,
        "triLuc": 75,
        "hp": 2400
      },
      "skillId": "huyen_thuat",
      "tags": [
        "boss_ch1"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "742",
      "skillsByQuality": {
        "white": "huyen_thuat",
        "green": "huyen_phap",
        "blue": "huyen_phap",
        "purple": "huyen_phap",
        "orange": "huyen_phap",
        "red": "huyen_phap"
      }
    },
    {
      "id": "zhangliang",
      "name": "Trương Lương",
      "faction": "yellow",
      "quality": "blue",
      "troop": "archer",
      "base": {
        "tongLinh": 58,
        "vuLuc": 65,
        "triLuc": 80,
        "hp": 2300
      },
      "skillId": "huyet_lo",
      "tags": [
        "boss_ch1"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "743",
      "skillsByQuality": {
        "white": "huyet_lo",
        "green": "kho_ke",
        "blue": "kho_ke",
        "purple": "kho_ke",
        "orange": "kho_ke",
        "red": "kho_ke"
      }
    },
    {
      "id": "zhangjiao",
      "name": "Trương Giác",
      "faction": "yellow",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 70,
        "vuLuc": 55,
        "triLuc": 92,
        "hp": 4200
      },
      "skillId": "yeu_thuat",
      "tags": [
        "boss_ch1",
        "chapter_boss"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "4156",
      "skillsByQuality": {
        "white": "yeu_thuat",
        "green": "yeu_phap",
        "blue": "thien_bang",
        "purple": "binh_thuat",
        "orange": "hoang_thien_duong_lap",
        "red": "thuong_thien_di_tu"
      }
    },
    {
      "id": "yellow_zealot",
      "name": "Khăn Vàng Tử Sĩ",
      "faction": "yellow",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 48,
        "vuLuc": 55,
        "triLuc": 40,
        "hp": 2000
      },
      "skillId": "basic_strike",
      "tags": [
        "boss_ch1"
      ],
      "obtain": "campaign",
      "npcOnly": true
    },
    {
      "id": "yellow_shaman",
      "name": "Khăn Vàng Vu",
      "faction": "yellow",
      "quality": "green",
      "troop": "archer",
      "base": {
        "tongLinh": 42,
        "vuLuc": 35,
        "triLuc": 62,
        "hp": 1750
      },
      "skillId": "basic_scheme",
      "tags": [
        "boss_ch1"
      ],
      "obtain": "campaign",
      "npcOnly": true
    },
    {
      "id": "yellow_captain",
      "name": "Khăn Vàng Hiệu",
      "faction": "yellow",
      "quality": "blue",
      "troop": "spear",
      "base": {
        "tongLinh": 58,
        "vuLuc": 68,
        "triLuc": 50,
        "hp": 2300
      },
      "skillId": "basic_strike",
      "tags": [
        "boss_ch1"
      ],
      "obtain": "campaign",
      "npcOnly": true
    },
    {
      "id": "huaxiong",
      "name": "Hoa Hùng",
      "faction": "dongzhuo",
      "quality": "purple",
      "troop": "cavalry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 90,
        "triLuc": 40,
        "hp": 3800
      },
      "skillId": "dot_kich",
      "tags": [
        "boss_ch2"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "4249",
      "skillsByQuality": {
        "white": "dot_kich",
        "green": "giao_chien",
        "blue": "bac_kich",
        "purple": "dung_manh_dot_kich",
        "orange": "can_quet_bao_luc",
        "red": "hung_ho_tien_phong"
      }
    },
    {
      "id": "lubu",
      "name": "Lã Bố",
      "faction": "dongzhuo",
      "quality": "red",
      "troop": "cavalry",
      "base": {
        "tongLinh": 88,
        "vuLuc": 100,
        "triLuc": 45,
        "hp": 5200
      },
      "skillId": "vo_song",
      "tags": [
        "boss_ch2",
        "chapter_boss"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "4128",
      "skillsByQuality": {
        "white": "vo_song",
        "green": "ma_than",
        "blue": "minh_vuong",
        "purple": "thien_ha_vo_song",
        "orange": "ma_than_no_hoa",
        "red": "quy_than_loan_vu"
      }
    },
    {
      "id": "dongzhuo",
      "name": "Đổng Trác",
      "faction": "dongzhuo",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 65,
        "vuLuc": 80,
        "triLuc": 50,
        "hp": 4500
      },
      "skillId": "no_hong",
      "tags": [
        "boss_ch2"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "4102",
      "skillsByQuality": {
        "white": "no_hong",
        "green": "no_hong",
        "blue": "bang_hoai",
        "purple": "bao_le",
        "orange": "tuu_tri_nhuc_lam",
        "red": "thien_uy_bao_nguoc"
      }
    },
    {
      "id": "liru",
      "name": "Lý Nho",
      "faction": "dongzhuo",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 70,
        "vuLuc": 40,
        "triLuc": 88,
        "hp": 2600
      },
      "skillId": "lac_loi",
      "tags": [
        "boss_ch2"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "3957",
      "skillsByQuality": {
        "white": "lac_loi",
        "green": "kinh_loi",
        "blue": "am_loi",
        "purple": "doc_loi",
        "orange": "nao_loan_kinh_thanh",
        "red": "nao_loan_kinh_thanh"
      }
    },
    {
      "id": "liuru",
      "name": "Lý Thôi",
      "faction": "dongzhuo",
      "quality": "blue",
      "troop": "cavalry",
      "base": {
        "tongLinh": 60,
        "vuLuc": 75,
        "triLuc": 40,
        "hp": 2700
      },
      "skillId": "basic_strike",
      "tags": [
        "boss_ch2"
      ],
      "obtain": "campaign",
      "npcOnly": true
    },
    {
      "id": "guosi",
      "name": "Quách Dĩ",
      "faction": "dongzhuo",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 58,
        "vuLuc": 78,
        "triLuc": 35,
        "hp": 2750
      },
      "skillId": "basic_strike",
      "tags": [
        "boss_ch2"
      ],
      "obtain": "campaign",
      "npcOnly": true
    },
    {
      "id": "fancho",
      "name": "Phàn Trù",
      "faction": "dongzhuo",
      "quality": "green",
      "troop": "spear",
      "base": {
        "tongLinh": 52,
        "vuLuc": 70,
        "triLuc": 30,
        "hp": 2200
      },
      "skillId": "phan_chien",
      "tags": [
        "boss_ch2"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "23",
      "skillsByQuality": {
        "white": "phan_chien",
        "green": "phan_chien",
        "blue": "phan_chien",
        "purple": "phan_chien",
        "orange": "phan_chien",
        "red": "phan_chien"
      }
    },
    {
      "id": "zhangji_dz",
      "name": "Trương Tế",
      "faction": "dongzhuo",
      "quality": "green",
      "troop": "cavalry",
      "base": {
        "tongLinh": 50,
        "vuLuc": 68,
        "triLuc": 32,
        "hp": 2150
      },
      "skillId": "lien_thanh",
      "tags": [
        "boss_ch2"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "22",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "lien_thanh",
        "blue": "lien_thanh",
        "purple": "lien_thanh",
        "orange": "lien_thanh",
        "red": "lien_thanh"
      }
    },
    {
      "id": "yuanshao",
      "name": "Viên Thiệu",
      "faction": "yuan",
      "quality": "orange",
      "troop": "archer",
      "base": {
        "tongLinh": 88,
        "vuLuc": 70,
        "triLuc": 75,
        "hp": 4000
      },
      "skillId": "ngu_giap",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "4157",
      "skillsByQuality": {
        "white": "ngu_giap",
        "green": "ngu_giap",
        "blue": "yeu_thuan",
        "purple": "loan_the_hao_kiet",
        "orange": "vang_danh_thien_ha",
        "red": "mon_sinh_tu_hai"
      }
    },
    {
      "id": "yuan_shu",
      "name": "Viên Thuật",
      "faction": "yuan",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 72,
        "triLuc": 60,
        "hp": 3400
      },
      "skillId": "doc_chu",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "63",
      "skillsByQuality": {
        "white": "doc_chu",
        "green": "doc_chu",
        "blue": "doc_chu",
        "purple": "doc_chu",
        "orange": "doc_chu",
        "red": "doc_chu"
      }
    },
    {
      "id": "gongsunzan",
      "name": "Công Tôn Toản",
      "faction": "other",
      "quality": "purple",
      "troop": "cavalry",
      "base": {
        "tongLinh": 78,
        "vuLuc": 86,
        "triLuc": 55,
        "hp": 3600
      },
      "skillId": "kich_thich",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "3994",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "bac_kich",
        "blue": "bac_sat",
        "purple": "thuong_tran",
        "orange": "bach_ma_tuong_quan",
        "red": "bach_ky_duong_ky"
      }
    },
    {
      "id": "liubiao",
      "name": "Lưu Biểu",
      "faction": "other",
      "quality": "purple",
      "troop": "archer",
      "base": {
        "tongLinh": 82,
        "vuLuc": 50,
        "triLuc": 78,
        "hp": 3200
      },
      "skillId": "co_vu",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "3999",
      "skillsByQuality": {
        "white": "co_vu",
        "green": "loi_co",
        "blue": "hieu_trieu",
        "purple": "dinh_quan_co",
        "orange": "bao_ve_kinh_giang",
        "red": "bao_ve_kinh_giang"
      }
    },
    {
      "id": "liuzhang",
      "name": "Lưu Chương",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 65,
        "vuLuc": 45,
        "triLuc": 70,
        "hp": 2800
      },
      "skillId": "te_xa",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "885",
      "skillsByQuality": {
        "white": "te_xa",
        "green": "vo_ngai",
        "blue": "vo_ngai",
        "purple": "vo_ngai",
        "orange": "vo_ngai",
        "red": "vo_ngai"
      }
    },
    {
      "id": "yanliang",
      "name": "Nhan Lương",
      "faction": "yuan",
      "quality": "purple",
      "troop": "cavalry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 92,
        "triLuc": 40,
        "hp": 3400
      },
      "skillId": "ham_dia",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "3694",
      "skillsByQuality": {
        "white": "ham_dia",
        "green": "no_tram",
        "blue": "tram_sat",
        "purple": "kieu_tuong",
        "orange": "quy_tuong_pha_thanh",
        "red": "quy_tuong_pha_thanh"
      }
    },
    {
      "id": "wenchou",
      "name": "Văn Xú",
      "faction": "yuan",
      "quality": "purple",
      "troop": "cavalry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 90,
        "triLuc": 42,
        "hp": 3350
      },
      "skillId": "ky_kich",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "3695",
      "skillsByQuality": {
        "white": "ky_kich",
        "green": "thiet_ky",
        "blue": "phu_do",
        "purple": "dung_tuong",
        "orange": "quy_tuong_tru_than",
        "red": "quy_tuong_tru_than"
      }
    },
    {
      "id": "tianfeng",
      "name": "Điền Phong",
      "faction": "yuan",
      "quality": "blue",
      "troop": "archer",
      "base": {
        "tongLinh": 68,
        "vuLuc": 35,
        "triLuc": 85,
        "hp": 2400
      },
      "skillId": "hu_vo",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "4049",
      "skillsByQuality": {
        "white": "hu_vo",
        "green": "hac_dong",
        "blue": "quy_mon",
        "purple": "ky_mon",
        "orange": "quyen_bien",
        "red": "quyen_bien"
      }
    },
    {
      "id": "jushou",
      "name": "Thư Thụ",
      "faction": "yuan",
      "quality": "blue",
      "troop": "archer",
      "base": {
        "tongLinh": 70,
        "vuLuc": 32,
        "triLuc": 84,
        "hp": 2380
      },
      "skillId": "kinh_loi",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "1412",
      "skillsByQuality": {
        "white": "kinh_loi",
        "green": "thap_thien",
        "blue": "kich_no",
        "purple": "kich_no",
        "orange": "kich_no",
        "red": "kich_no"
      }
    },
    {
      "id": "kongrong",
      "name": "Khổng Dung",
      "faction": "other",
      "quality": "green",
      "troop": "archer",
      "base": {
        "tongLinh": 55,
        "vuLuc": 25,
        "triLuc": 75,
        "hp": 2000
      },
      "skillId": "basic_scheme",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true
    },
    {
      "id": "taogian",
      "name": "Đào Khiêm",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 60,
        "vuLuc": 40,
        "triLuc": 65,
        "hp": 2100
      },
      "skillId": "basic_scheme",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true
    },
    {
      "id": "hanxuan",
      "name": "Hàn Huyền",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 48,
        "vuLuc": 50,
        "triLuc": 45,
        "hp": 2000
      },
      "skillId": "doc_chu",
      "tags": [
        "boss_ch3"
      ],
      "obtain": "campaign",
      "npcOnly": true,
      "wikiHeroId": "103",
      "skillsByQuality": {
        "white": "doc_chu",
        "green": "doc_chu",
        "blue": "doc_chu",
        "purple": "doc_chu",
        "orange": "doc_chu",
        "red": "doc_chu"
      }
    },
    {
      "id": "w1",
      "name": "Nghiêm Chính",
      "faction": "wei",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 52,
        "vuLuc": 59,
        "triLuc": 38,
        "hp": 2136
      },
      "skillId": "dot_tien",
      "skillsByQuality": {
        "white": "dot_tien",
        "green": "dot_tien",
        "blue": "dot_tien",
        "purple": "dot_tien",
        "orange": "dot_tien",
        "red": "dot_tien"
      },
      "wikiHeroId": "1",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w2",
      "name": "Triệu Hoằng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 59,
        "vuLuc": 73,
        "triLuc": 45,
        "hp": 2262
      },
      "skillId": "phan_chien",
      "skillsByQuality": {
        "white": "phan_chien",
        "green": "phan_chien",
        "blue": "phan_chien",
        "purple": "phan_chien",
        "orange": "phan_chien",
        "red": "phan_chien"
      },
      "wikiHeroId": "2",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w3",
      "name": "Trương Khải",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 36,
        "vuLuc": 63,
        "triLuc": 45,
        "hp": 1848
      },
      "skillId": "dot_tien",
      "skillsByQuality": {
        "white": "dot_tien",
        "green": "dot_tien",
        "blue": "dot_tien",
        "purple": "dot_tien",
        "orange": "dot_tien",
        "red": "dot_tien"
      },
      "wikiHeroId": "3",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w4",
      "name": "Cao Thăng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 68,
        "vuLuc": 72,
        "triLuc": 42,
        "hp": 2424
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_bich",
        "blue": "thiet_bich",
        "purple": "thiet_bich",
        "orange": "thiet_bich",
        "red": "thiet_bich"
      },
      "wikiHeroId": "4",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w6",
      "name": "Trương Man Thành",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 83,
        "vuLuc": 71,
        "triLuc": 61,
        "hp": 2694
      },
      "skillId": "hoanh_tao",
      "skillsByQuality": {
        "white": "hoanh_tao",
        "green": "hoanh_tao",
        "blue": "hoanh_tao",
        "purple": "hoanh_tao",
        "orange": "hoanh_tao",
        "red": "hoanh_tao"
      },
      "wikiHeroId": "6",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w10",
      "name": "Đặng Mậu",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 68,
        "vuLuc": 75,
        "triLuc": 37,
        "hp": 2424
      },
      "skillId": "phan_tan",
      "skillsByQuality": {
        "white": "phan_tan",
        "green": "phan_tan",
        "blue": "phan_tan",
        "purple": "phan_tan",
        "orange": "phan_tan",
        "red": "phan_tan"
      },
      "wikiHeroId": "10",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w12",
      "name": "Quản Hợi",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 69,
        "vuLuc": 80,
        "triLuc": 47,
        "hp": 2442
      },
      "skillId": "thu_kich",
      "skillsByQuality": {
        "white": "thu_kich",
        "green": "thu_kich",
        "blue": "thu_kich",
        "purple": "thu_kich",
        "orange": "thu_kich",
        "red": "thu_kich"
      },
      "wikiHeroId": "12",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w13",
      "name": "Hà Nghi",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 59,
        "vuLuc": 67,
        "triLuc": 42,
        "hp": 2262
      },
      "skillId": "giao_chien",
      "skillsByQuality": {
        "white": "giao_chien",
        "green": "giao_chien",
        "blue": "giao_chien",
        "purple": "giao_chien",
        "orange": "giao_chien",
        "red": "giao_chien"
      },
      "wikiHeroId": "13",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w14",
      "name": "Hàn Trung",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 67,
        "vuLuc": 68,
        "triLuc": 44,
        "hp": 2406
      },
      "skillId": "hoanh_tao",
      "skillsByQuality": {
        "white": "hoanh_tao",
        "green": "hoanh_tao",
        "blue": "hoanh_tao",
        "purple": "hoanh_tao",
        "orange": "hoanh_tao",
        "red": "hoanh_tao"
      },
      "wikiHeroId": "14",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w15",
      "name": "Lưu Tích",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 73,
        "vuLuc": 70,
        "triLuc": 43,
        "hp": 2514
      },
      "skillId": "cuong_tap",
      "skillsByQuality": {
        "white": "cuong_tap",
        "green": "cuong_tap",
        "blue": "cuong_tap",
        "purple": "cuong_tap",
        "orange": "cuong_tap",
        "red": "cuong_tap"
      },
      "wikiHeroId": "15",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w16",
      "name": "Cung Đô",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 72,
        "triLuc": 48,
        "hp": 2352
      },
      "skillId": "phan_tan",
      "skillsByQuality": {
        "white": "phan_tan",
        "green": "phan_tan",
        "blue": "phan_tan",
        "purple": "phan_tan",
        "orange": "phan_tan",
        "red": "phan_tan"
      },
      "wikiHeroId": "16",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w19",
      "name": "Ngưu Phụ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 42,
        "vuLuc": 60,
        "triLuc": 40,
        "hp": 1956
      },
      "skillId": "cuong_tap",
      "skillsByQuality": {
        "white": "cuong_tap",
        "green": "cuong_tap",
        "blue": "cuong_tap",
        "purple": "cuong_tap",
        "orange": "cuong_tap",
        "red": "cuong_tap"
      },
      "wikiHeroId": "19",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w20",
      "name": "Hồ Chẩn",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 77,
        "triLuc": 47,
        "hp": 2316
      },
      "skillId": "dot_tien",
      "skillsByQuality": {
        "white": "dot_tien",
        "green": "dot_tien",
        "blue": "dot_tien",
        "purple": "dot_tien",
        "orange": "dot_tien",
        "red": "dot_tien"
      },
      "wikiHeroId": "20",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w28",
      "name": "Đổng Mân",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 52,
        "vuLuc": 60,
        "triLuc": 47,
        "hp": 2136
      },
      "skillId": "te_xa",
      "skillsByQuality": {
        "white": "te_xa",
        "green": "te_xa",
        "blue": "te_xa",
        "purple": "te_xa",
        "orange": "te_xa",
        "red": "te_xa"
      },
      "wikiHeroId": "28",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w30",
      "name": "Lý Túc",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 47,
        "vuLuc": 68,
        "triLuc": 61,
        "hp": 2046
      },
      "skillId": "kich_doc",
      "skillsByQuality": {
        "white": "kich_doc",
        "green": "kich_doc",
        "blue": "kich_doc",
        "purple": "kich_doc",
        "orange": "kich_doc",
        "red": "kich_doc"
      },
      "wikiHeroId": "30",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w31",
      "name": "Quách Tị",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 63,
        "vuLuc": 74,
        "triLuc": 48,
        "hp": 2334
      },
      "skillId": "am_sat",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "am_sat",
        "blue": "am_sat",
        "purple": "am_sat",
        "orange": "am_sat",
        "red": "am_sat"
      },
      "wikiHeroId": "31",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w32",
      "name": "Lý Giác",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 66,
        "vuLuc": 72,
        "triLuc": 49,
        "hp": 2388
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_bich",
        "blue": "thiet_bich",
        "purple": "thiet_bich",
        "orange": "thiet_bich",
        "red": "thiet_bich"
      },
      "wikiHeroId": "32",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w37",
      "name": "Trần Hoành",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 69,
        "vuLuc": 66,
        "triLuc": 48,
        "hp": 2442
      },
      "skillId": "gio_loc",
      "skillsByQuality": {
        "white": "gio_loc",
        "green": "gio_loc",
        "blue": "gio_loc",
        "purple": "gio_loc",
        "orange": "gio_loc",
        "red": "gio_loc"
      },
      "wikiHeroId": "37",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w39",
      "name": "Chu Hân",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 68,
        "vuLuc": 69,
        "triLuc": 71,
        "hp": 2424
      },
      "skillId": "cong_tam",
      "skillsByQuality": {
        "white": "cong_tam",
        "green": "cong_tam",
        "blue": "cong_tam",
        "purple": "cong_tam",
        "orange": "cong_tam",
        "red": "cong_tam"
      },
      "wikiHeroId": "39",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w40",
      "name": "Lưu Dao",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 54,
        "vuLuc": 67,
        "triLuc": 40,
        "hp": 2172
      },
      "skillId": "co_vu",
      "skillsByQuality": {
        "white": "co_vu",
        "green": "co_vu",
        "blue": "co_vu",
        "purple": "co_vu",
        "orange": "co_vu",
        "red": "co_vu"
      },
      "wikiHeroId": "40",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w41",
      "name": "Trách Dung",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 65,
        "vuLuc": 71,
        "triLuc": 48,
        "hp": 2370
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_bich",
        "blue": "thiet_bich",
        "purple": "thiet_bich",
        "orange": "thiet_bich",
        "red": "thiet_bich"
      },
      "wikiHeroId": "41",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w42",
      "name": "Nghiêm Dư",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 65,
        "vuLuc": 78,
        "triLuc": 57,
        "hp": 2370
      },
      "skillId": "ky_kich",
      "skillsByQuality": {
        "white": "ky_kich",
        "green": "ky_kich",
        "blue": "ky_kich",
        "purple": "ky_kich",
        "orange": "ky_kich",
        "red": "ky_kich"
      },
      "wikiHeroId": "42",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w43",
      "name": "Nghiêm Bạch Hổ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 66,
        "vuLuc": 69,
        "triLuc": 48,
        "hp": 2388
      },
      "skillId": "phan_kich",
      "skillsByQuality": {
        "white": "phan_kich",
        "green": "phan_kich",
        "blue": "phan_kich",
        "purple": "phan_kich",
        "orange": "phan_kich",
        "red": "phan_kich"
      },
      "wikiHeroId": "43",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w45",
      "name": "Ngu Tị",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 48,
        "triLuc": 80,
        "hp": 2496
      },
      "skillId": "lac_loi",
      "skillsByQuality": {
        "white": "lac_loi",
        "green": "lac_loi",
        "blue": "lac_loi",
        "purple": "lac_loi",
        "orange": "lac_loi",
        "red": "lac_loi"
      },
      "wikiHeroId": "45",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w46",
      "name": "Hứa Cống",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 45,
        "vuLuc": 68,
        "triLuc": 72,
        "hp": 2010
      },
      "skillId": "tri_lieu",
      "skillsByQuality": {
        "white": "tri_lieu",
        "green": "tri_lieu",
        "blue": "tri_lieu",
        "purple": "tri_lieu",
        "orange": "tri_lieu",
        "red": "tri_lieu"
      },
      "wikiHeroId": "46",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w47",
      "name": "Vương Túc",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 47,
        "vuLuc": 46,
        "triLuc": 81,
        "hp": 2046
      },
      "skillId": "am_te",
      "skillsByQuality": {
        "white": "am_te",
        "green": "am_te",
        "blue": "am_te",
        "purple": "am_te",
        "orange": "am_te",
        "red": "am_te"
      },
      "wikiHeroId": "47",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w49",
      "name": "Lưu Huân",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 48,
        "vuLuc": 63,
        "triLuc": 45,
        "hp": 2064
      },
      "skillId": "lien_thanh",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "lien_thanh",
        "blue": "lien_thanh",
        "purple": "lien_thanh",
        "orange": "lien_thanh",
        "red": "lien_thanh"
      },
      "wikiHeroId": "49",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w51",
      "name": "Dương Hoằng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 55,
        "vuLuc": 54,
        "triLuc": 75,
        "hp": 2190
      },
      "skillId": "boc_viem",
      "skillsByQuality": {
        "white": "boc_viem",
        "green": "boc_viem",
        "blue": "boc_viem",
        "purple": "boc_viem",
        "orange": "boc_viem",
        "red": "boc_viem"
      },
      "wikiHeroId": "51",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w52",
      "name": "Du Thiệp",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 68,
        "vuLuc": 79,
        "triLuc": 40,
        "hp": 2424
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_bich",
        "blue": "thiet_bich",
        "purple": "thiet_bich",
        "orange": "thiet_bich",
        "red": "thiet_bich"
      },
      "wikiHeroId": "52",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w53",
      "name": "Trần Lan",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 67,
        "vuLuc": 72,
        "triLuc": 56,
        "hp": 2406
      },
      "skillId": "no_hong",
      "skillsByQuality": {
        "white": "no_hong",
        "green": "no_hong",
        "blue": "no_hong",
        "purple": "no_hong",
        "orange": "no_hong",
        "red": "no_hong"
      },
      "wikiHeroId": "53",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w54",
      "name": "Trần Kỷ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 68,
        "triLuc": 41,
        "hp": 2352
      },
      "skillId": "phan_chien",
      "skillsByQuality": {
        "white": "phan_chien",
        "green": "phan_chien",
        "blue": "phan_chien",
        "purple": "phan_chien",
        "orange": "phan_chien",
        "red": "phan_chien"
      },
      "wikiHeroId": "54",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w55",
      "name": "Trương Huân",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 71,
        "triLuc": 46,
        "hp": 2496
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "kich_thich",
        "blue": "kich_thich",
        "purple": "kich_thich",
        "orange": "kich_thich",
        "red": "kich_thich"
      },
      "wikiHeroId": "55",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w56",
      "name": "Kiều Nhuy",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 68,
        "vuLuc": 72,
        "triLuc": 45,
        "hp": 2424
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "kich_thich",
        "blue": "kich_thich",
        "purple": "kich_thich",
        "orange": "kich_thich",
        "red": "kich_thich"
      },
      "wikiHeroId": "56",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w57",
      "name": "Hàn Dận",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 47,
        "vuLuc": 40,
        "triLuc": 64,
        "hp": 2046
      },
      "skillId": "boc_viem",
      "skillsByQuality": {
        "white": "boc_viem",
        "green": "boc_viem",
        "blue": "boc_viem",
        "purple": "boc_viem",
        "orange": "boc_viem",
        "red": "boc_viem"
      },
      "wikiHeroId": "57",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w59",
      "name": "Viên Diệu",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 45,
        "vuLuc": 52,
        "triLuc": 53,
        "hp": 2010
      },
      "skillId": "boc_viem",
      "skillsByQuality": {
        "white": "boc_viem",
        "green": "boc_viem",
        "blue": "boc_viem",
        "purple": "boc_viem",
        "orange": "boc_viem",
        "red": "boc_viem"
      },
      "wikiHeroId": "59",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w61",
      "name": "Viên Dận",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 47,
        "vuLuc": 48,
        "triLuc": 42,
        "hp": 2046
      },
      "skillId": "tu_sanh",
      "skillsByQuality": {
        "white": "tu_sanh",
        "green": "tu_sanh",
        "blue": "tu_sanh",
        "purple": "tu_sanh",
        "orange": "tu_sanh",
        "red": "tu_sanh"
      },
      "wikiHeroId": "61",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w65",
      "name": "Điền Khải",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 71,
        "vuLuc": 65,
        "triLuc": 53,
        "hp": 2478
      },
      "skillId": "giao_chien",
      "skillsByQuality": {
        "white": "giao_chien",
        "green": "giao_chien",
        "blue": "giao_chien",
        "purple": "giao_chien",
        "orange": "giao_chien",
        "red": "giao_chien"
      },
      "wikiHeroId": "65",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w66",
      "name": "Đơn Kinh",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 72,
        "triLuc": 59,
        "hp": 2460
      },
      "skillId": "tu_huy",
      "skillsByQuality": {
        "white": "tu_huy",
        "green": "tu_huy",
        "blue": "tu_huy",
        "purple": "tu_huy",
        "orange": "tu_huy",
        "red": "tu_huy"
      },
      "wikiHeroId": "66",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w67",
      "name": "Trâu Đan",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 68,
        "vuLuc": 71,
        "triLuc": 36,
        "hp": 2424
      },
      "skillId": "gio_loc",
      "skillsByQuality": {
        "white": "gio_loc",
        "green": "gio_loc",
        "blue": "gio_loc",
        "purple": "gio_loc",
        "orange": "gio_loc",
        "red": "gio_loc"
      },
      "wikiHeroId": "67",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w71",
      "name": "Nghiêm Cương",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 70,
        "triLuc": 42,
        "hp": 2496
      },
      "skillId": "xuyen_duong",
      "skillsByQuality": {
        "white": "xuyen_duong",
        "green": "xuyen_duong",
        "blue": "xuyen_duong",
        "purple": "xuyen_duong",
        "orange": "xuyen_duong",
        "red": "xuyen_duong"
      },
      "wikiHeroId": "71",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w72",
      "name": "Quan Tịnh",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 49,
        "vuLuc": 61,
        "triLuc": 75,
        "hp": 2082
      },
      "skillId": "cong_tam",
      "skillsByQuality": {
        "white": "cong_tam",
        "green": "cong_tam",
        "blue": "cong_tam",
        "purple": "cong_tam",
        "orange": "cong_tam",
        "red": "cong_tam"
      },
      "wikiHeroId": "72",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w73",
      "name": "Vương Môn",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 66,
        "vuLuc": 69,
        "triLuc": 47,
        "hp": 2388
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_bich",
        "blue": "thiet_bich",
        "purple": "thiet_bich",
        "orange": "thiet_bich",
        "red": "thiet_bich"
      },
      "wikiHeroId": "73",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w74",
      "name": "Công Tôn Độ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 55,
        "triLuc": 72,
        "hp": 2460
      },
      "skillId": "hoanh_tao",
      "skillsByQuality": {
        "white": "hoanh_tao",
        "green": "hoanh_tao",
        "blue": "hoanh_tao",
        "purple": "hoanh_tao",
        "orange": "hoanh_tao",
        "red": "hoanh_tao"
      },
      "wikiHeroId": "74",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w76",
      "name": "Công Tôn Uyên",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 71,
        "triLuc": 55,
        "hp": 2352
      },
      "skillId": "lien_kich",
      "skillsByQuality": {
        "white": "lien_kich",
        "green": "lien_kich",
        "blue": "lien_kich",
        "purple": "lien_kich",
        "orange": "lien_kich",
        "red": "lien_kich"
      },
      "wikiHeroId": "76",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w78",
      "name": "Giả Phạm",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 65,
        "vuLuc": 59,
        "triLuc": 71,
        "hp": 2370
      },
      "skillId": "hoa_long",
      "skillsByQuality": {
        "white": "hoa_long",
        "green": "hoa_long",
        "blue": "hoa_long",
        "purple": "hoa_long",
        "orange": "hoa_long",
        "red": "hoa_long"
      },
      "wikiHeroId": "78",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w81",
      "name": "Dương Nhiệm",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 71,
        "vuLuc": 77,
        "triLuc": 53,
        "hp": 2478
      },
      "skillId": "te_xa",
      "skillsByQuality": {
        "white": "te_xa",
        "green": "te_xa",
        "blue": "te_xa",
        "purple": "te_xa",
        "orange": "te_xa",
        "red": "te_xa"
      },
      "wikiHeroId": "81",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w82",
      "name": "Dương Tùng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 42,
        "vuLuc": 51,
        "triLuc": 44,
        "hp": 1956
      },
      "skillId": "tu_sanh",
      "skillsByQuality": {
        "white": "tu_sanh",
        "green": "tu_sanh",
        "blue": "tu_sanh",
        "purple": "tu_sanh",
        "orange": "tu_sanh",
        "red": "tu_sanh"
      },
      "wikiHeroId": "82",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w83",
      "name": "Dương Ngang",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 66,
        "vuLuc": 70,
        "triLuc": 44,
        "hp": 2388
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_bich",
        "blue": "thiet_bich",
        "purple": "thiet_bich",
        "orange": "thiet_bich",
        "red": "thiet_bich"
      },
      "wikiHeroId": "83",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w86",
      "name": "Trương Lỗ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 41,
        "vuLuc": 43,
        "triLuc": 69,
        "hp": 1938
      },
      "skillId": "tri_lieu",
      "skillsByQuality": {
        "white": "tri_lieu",
        "green": "tri_lieu",
        "blue": "tri_lieu",
        "purple": "tri_lieu",
        "orange": "tri_lieu",
        "red": "tri_lieu"
      },
      "wikiHeroId": "86",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w88",
      "name": "Vương Uy",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 65,
        "vuLuc": 70,
        "triLuc": 55,
        "hp": 2370
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_bich",
        "blue": "thiet_bich",
        "purple": "thiet_bich",
        "orange": "thiet_bich",
        "red": "thiet_bich"
      },
      "wikiHeroId": "88",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w89",
      "name": "Hàn Tung",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 51,
        "vuLuc": 46,
        "triLuc": 72,
        "hp": 2118
      },
      "skillId": "lac_loi",
      "skillsByQuality": {
        "white": "lac_loi",
        "green": "lac_loi",
        "blue": "lac_loi",
        "purple": "lac_loi",
        "orange": "lac_loi",
        "red": "lac_loi"
      },
      "wikiHeroId": "89",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w92",
      "name": "Khoái Việt",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 42,
        "vuLuc": 42,
        "triLuc": 82,
        "hp": 1956
      },
      "skillId": "hoa_long",
      "skillsByQuality": {
        "white": "hoa_long",
        "green": "hoa_long",
        "blue": "hoa_long",
        "purple": "hoa_long",
        "orange": "hoa_long",
        "red": "hoa_long"
      },
      "wikiHeroId": "92",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w94",
      "name": "Thái Hòa",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 43,
        "vuLuc": 50,
        "triLuc": 43,
        "hp": 1974
      },
      "skillId": "xa_thu",
      "skillsByQuality": {
        "white": "xa_thu",
        "green": "xa_thu",
        "blue": "xa_thu",
        "purple": "xa_thu",
        "orange": "xa_thu",
        "red": "xa_thu"
      },
      "wikiHeroId": "94",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w95",
      "name": "Thái Trung",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 45,
        "vuLuc": 53,
        "triLuc": 44,
        "hp": 2010
      },
      "skillId": "tien_vu",
      "skillsByQuality": {
        "white": "tien_vu",
        "green": "tien_vu",
        "blue": "tien_vu",
        "purple": "tien_vu",
        "orange": "tien_vu",
        "red": "tien_vu"
      },
      "wikiHeroId": "95",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w98",
      "name": "Lưu Kỳ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 46,
        "vuLuc": 40,
        "triLuc": 56,
        "hp": 2028
      },
      "skillId": "con_thach",
      "skillsByQuality": {
        "white": "con_thach",
        "green": "con_thach",
        "blue": "con_thach",
        "purple": "con_thach",
        "orange": "con_thach",
        "red": "con_thach"
      },
      "wikiHeroId": "98",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w99",
      "name": "Hoàng Tổ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 68,
        "triLuc": 50,
        "hp": 2460
      },
      "skillId": "dot_kich",
      "skillsByQuality": {
        "white": "dot_kich",
        "green": "dot_kich",
        "blue": "dot_kich",
        "purple": "dot_kich",
        "orange": "dot_kich",
        "red": "dot_kich"
      },
      "wikiHeroId": "99",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w101",
      "name": "Lưu Độ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 41,
        "vuLuc": 55,
        "triLuc": 49,
        "hp": 1938
      },
      "skillId": "tu_sanh",
      "skillsByQuality": {
        "white": "tu_sanh",
        "green": "tu_sanh",
        "blue": "tu_sanh",
        "purple": "tu_sanh",
        "orange": "tu_sanh",
        "red": "tu_sanh"
      },
      "wikiHeroId": "101",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w102",
      "name": "Hình Đạo Vinh",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 77,
        "triLuc": 45,
        "hp": 2316
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "kich_thich",
        "blue": "kich_thich",
        "purple": "kich_thich",
        "orange": "kich_thich",
        "red": "kich_thich"
      },
      "wikiHeroId": "102",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w104",
      "name": "Hàn Hạo",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 71,
        "triLuc": 67,
        "hp": 2316
      },
      "skillId": "tu_huy",
      "skillsByQuality": {
        "white": "tu_huy",
        "green": "tu_huy",
        "blue": "tu_huy",
        "purple": "tu_huy",
        "orange": "tu_huy",
        "red": "tu_huy"
      },
      "wikiHeroId": "104",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w109",
      "name": "Vương Lũy",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 49,
        "vuLuc": 41,
        "triLuc": 77,
        "hp": 2082
      },
      "skillId": "boc_viem",
      "skillsByQuality": {
        "white": "boc_viem",
        "green": "boc_viem",
        "blue": "boc_viem",
        "purple": "boc_viem",
        "orange": "boc_viem",
        "red": "boc_viem"
      },
      "wikiHeroId": "109",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w110",
      "name": "Ngô Lan",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 69,
        "vuLuc": 76,
        "triLuc": 38,
        "hp": 2442
      },
      "skillId": "phan_chien",
      "skillsByQuality": {
        "white": "phan_chien",
        "green": "phan_chien",
        "blue": "phan_chien",
        "purple": "phan_chien",
        "orange": "phan_chien",
        "red": "phan_chien"
      },
      "wikiHeroId": "110",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w111",
      "name": "Đổng Hòa",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 65,
        "vuLuc": 41,
        "triLuc": 74,
        "hp": 2370
      },
      "skillId": "lac_loi",
      "skillsByQuality": {
        "white": "lac_loi",
        "green": "lac_loi",
        "blue": "lac_loi",
        "purple": "lac_loi",
        "orange": "lac_loi",
        "red": "lac_loi"
      },
      "wikiHeroId": "111",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w115",
      "name": "Lưu Tuân",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 41,
        "vuLuc": 56,
        "triLuc": 40,
        "hp": 1938
      },
      "skillId": "am_sat",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "am_sat",
        "blue": "am_sat",
        "purple": "am_sat",
        "orange": "am_sat",
        "red": "am_sat"
      },
      "wikiHeroId": "115",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w120",
      "name": "Hoàng Quyền",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 74,
        "vuLuc": 59,
        "triLuc": 83,
        "hp": 2532
      },
      "skillId": "lac_loi",
      "skillsByQuality": {
        "white": "lac_loi",
        "green": "lac_loi",
        "blue": "lac_loi",
        "purple": "lac_loi",
        "orange": "lac_loi",
        "red": "lac_loi"
      },
      "wikiHeroId": "120",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w122",
      "name": "Bàng Nghĩa",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 42,
        "triLuc": 66,
        "hp": 2352
      },
      "skillId": "am_sat",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "am_sat",
        "blue": "am_sat",
        "purple": "am_sat",
        "orange": "am_sat",
        "red": "am_sat"
      },
      "wikiHeroId": "122",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w123",
      "name": "Dương Hoài",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 71,
        "triLuc": 62,
        "hp": 2460
      },
      "skillId": "no_hong",
      "skillsByQuality": {
        "white": "no_hong",
        "green": "no_hong",
        "blue": "no_hong",
        "purple": "no_hong",
        "orange": "no_hong",
        "red": "no_hong"
      },
      "wikiHeroId": "123",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w125",
      "name": "Hoàng Sùng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 65,
        "triLuc": 76,
        "hp": 2460
      },
      "skillId": "phan_chien",
      "skillsByQuality": {
        "white": "phan_chien",
        "green": "phan_chien",
        "blue": "phan_chien",
        "purple": "phan_chien",
        "orange": "phan_chien",
        "red": "phan_chien"
      },
      "wikiHeroId": "125",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w128",
      "name": "Lưu Nhàn",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 67,
        "vuLuc": 72,
        "triLuc": 49,
        "hp": 2406
      },
      "skillId": "lien_thanh",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "lien_thanh",
        "blue": "lien_thanh",
        "purple": "lien_thanh",
        "orange": "lien_thanh",
        "red": "lien_thanh"
      },
      "wikiHeroId": "128",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w133",
      "name": "Lương Hưng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 66,
        "vuLuc": 68,
        "triLuc": 42,
        "hp": 2388
      },
      "skillId": "dot_kich",
      "skillsByQuality": {
        "white": "dot_kich",
        "green": "dot_kich",
        "blue": "dot_kich",
        "purple": "dot_kich",
        "orange": "dot_kich",
        "red": "dot_kich"
      },
      "wikiHeroId": "133",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w134",
      "name": "Lý Kham",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 70,
        "triLuc": 42,
        "hp": 2316
      },
      "skillId": "dap_pha",
      "skillsByQuality": {
        "white": "dap_pha",
        "green": "dap_pha",
        "blue": "dap_pha",
        "purple": "dap_pha",
        "orange": "dap_pha",
        "red": "dap_pha"
      },
      "wikiHeroId": "134",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w135",
      "name": "Dương Thu",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 67,
        "triLuc": 53,
        "hp": 2352
      },
      "skillId": "phan_tan",
      "skillsByQuality": {
        "white": "phan_tan",
        "green": "phan_tan",
        "blue": "phan_tan",
        "purple": "phan_tan",
        "orange": "phan_tan",
        "red": "phan_tan"
      },
      "wikiHeroId": "135",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w137",
      "name": "Thành Nghi",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 74,
        "vuLuc": 70,
        "triLuc": 38,
        "hp": 2532
      },
      "skillId": "xa_thu",
      "skillsByQuality": {
        "white": "xa_thu",
        "green": "xa_thu",
        "blue": "xa_thu",
        "purple": "xa_thu",
        "orange": "xa_thu",
        "red": "xa_thu"
      },
      "wikiHeroId": "137",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w138",
      "name": "Hậu Tuyển",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 66,
        "vuLuc": 71,
        "triLuc": 47,
        "hp": 2388
      },
      "skillId": "dot_kich",
      "skillsByQuality": {
        "white": "dot_kich",
        "green": "dot_kich",
        "blue": "dot_kich",
        "purple": "dot_kich",
        "orange": "dot_kich",
        "red": "dot_kich"
      },
      "wikiHeroId": "138",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w141",
      "name": "Trình Ngân",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 73,
        "vuLuc": 71,
        "triLuc": 49,
        "hp": 2514
      },
      "skillId": "lien_kich",
      "skillsByQuality": {
        "white": "lien_kich",
        "green": "lien_kich",
        "blue": "lien_kich",
        "purple": "lien_kich",
        "orange": "lien_kich",
        "red": "lien_kich"
      },
      "wikiHeroId": "141",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w142",
      "name": "Trương Hoành",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 67,
        "vuLuc": 68,
        "triLuc": 46,
        "hp": 2406
      },
      "skillId": "dot_tien",
      "skillsByQuality": {
        "white": "dot_tien",
        "green": "dot_tien",
        "blue": "dot_tien",
        "purple": "dot_tien",
        "orange": "dot_tien",
        "red": "dot_tien"
      },
      "wikiHeroId": "142",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w145",
      "name": "Mã Ngoạn",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 63,
        "vuLuc": 73,
        "triLuc": 41,
        "hp": 2334
      },
      "skillId": "lien_thanh",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "lien_thanh",
        "blue": "lien_thanh",
        "purple": "lien_thanh",
        "orange": "lien_thanh",
        "red": "lien_thanh"
      },
      "wikiHeroId": "145",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w149",
      "name": "Lữ Tường",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 61,
        "vuLuc": 68,
        "triLuc": 49,
        "hp": 2298
      },
      "skillId": "dot_kich",
      "skillsByQuality": {
        "white": "dot_kich",
        "green": "dot_kich",
        "blue": "dot_kich",
        "purple": "dot_kich",
        "orange": "dot_kich",
        "red": "dot_kich"
      },
      "wikiHeroId": "149",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w150",
      "name": "Lữ Khoáng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 64,
        "triLuc": 44,
        "hp": 2352
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_bich",
        "blue": "thiet_bich",
        "purple": "thiet_bich",
        "orange": "thiet_bich",
        "red": "thiet_bich"
      },
      "wikiHeroId": "150",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w151",
      "name": "Lữ Uy Hoàng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 66,
        "triLuc": 42,
        "hp": 2352
      },
      "skillId": "am_sat",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "am_sat",
        "blue": "am_sat",
        "purple": "am_sat",
        "orange": "am_sat",
        "red": "am_sat"
      },
      "wikiHeroId": "151",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w152",
      "name": "Phùng Kỷ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 46,
        "vuLuc": 49,
        "triLuc": 83,
        "hp": 2028
      },
      "skillId": "ly_gian",
      "skillsByQuality": {
        "white": "ly_gian",
        "green": "ly_gian",
        "blue": "ly_gian",
        "purple": "ly_gian",
        "orange": "ly_gian",
        "red": "ly_gian"
      },
      "wikiHeroId": "152",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w156",
      "name": "Trần Lâm",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 49,
        "vuLuc": 49,
        "triLuc": 80,
        "hp": 2082
      },
      "skillId": "nhuc_ma",
      "skillsByQuality": {
        "white": "nhuc_ma",
        "green": "nhuc_ma",
        "blue": "nhuc_ma",
        "purple": "nhuc_ma",
        "orange": "nhuc_ma",
        "red": "nhuc_ma"
      },
      "wikiHeroId": "156",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w157",
      "name": "Trần Chấn",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 46,
        "vuLuc": 48,
        "triLuc": 68,
        "hp": 2028
      },
      "skillId": "boc_viem",
      "skillsByQuality": {
        "white": "boc_viem",
        "green": "boc_viem",
        "blue": "boc_viem",
        "purple": "boc_viem",
        "orange": "boc_viem",
        "red": "boc_viem"
      },
      "wikiHeroId": "157",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w158",
      "name": "Tô Do",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 56,
        "vuLuc": 65,
        "triLuc": 48,
        "hp": 2208
      },
      "skillId": "cuong_tap",
      "skillsByQuality": {
        "white": "cuong_tap",
        "green": "cuong_tap",
        "blue": "cuong_tap",
        "purple": "cuong_tap",
        "orange": "cuong_tap",
        "red": "cuong_tap"
      },
      "wikiHeroId": "158",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w160",
      "name": "Tưởng Nghĩa Cừ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 66,
        "vuLuc": 65,
        "triLuc": 52,
        "hp": 2388
      },
      "skillId": "phan_tan",
      "skillsByQuality": {
        "white": "phan_tan",
        "green": "phan_tan",
        "blue": "phan_tan",
        "purple": "phan_tan",
        "orange": "phan_tan",
        "red": "phan_tan"
      },
      "wikiHeroId": "160",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w162",
      "name": "Thôi Diễm",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 55,
        "vuLuc": 65,
        "triLuc": 87,
        "hp": 2190
      },
      "skillId": "am_te",
      "skillsByQuality": {
        "white": "am_te",
        "green": "am_te",
        "blue": "am_te",
        "purple": "am_te",
        "orange": "am_te",
        "red": "am_te"
      },
      "wikiHeroId": "162",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w164",
      "name": "Cao Nhu",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 61,
        "vuLuc": 59,
        "triLuc": 72,
        "hp": 2298
      },
      "skillId": "kich_doc",
      "skillsByQuality": {
        "white": "kich_doc",
        "green": "kich_doc",
        "blue": "kich_doc",
        "purple": "kich_doc",
        "orange": "kich_doc",
        "red": "kich_doc"
      },
      "wikiHeroId": "164",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w165",
      "name": "Cao Can",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 71,
        "vuLuc": 65,
        "triLuc": 55,
        "hp": 2478
      },
      "skillId": "giao_chien",
      "skillsByQuality": {
        "white": "giao_chien",
        "green": "giao_chien",
        "blue": "giao_chien",
        "purple": "giao_chien",
        "orange": "giao_chien",
        "red": "giao_chien"
      },
      "wikiHeroId": "165",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w166",
      "name": "Hứa Du",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 48,
        "vuLuc": 46,
        "triLuc": 82,
        "hp": 2064
      },
      "skillId": "gio_loc",
      "skillsByQuality": {
        "white": "gio_loc",
        "green": "gio_loc",
        "blue": "gio_loc",
        "purple": "gio_loc",
        "orange": "gio_loc",
        "red": "gio_loc"
      },
      "wikiHeroId": "166",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w167",
      "name": "Cúc Nghĩa",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 77,
        "vuLuc": 72,
        "triLuc": 63,
        "hp": 2586
      },
      "skillId": "dap_pha",
      "skillsByQuality": {
        "white": "dap_pha",
        "green": "dap_pha",
        "blue": "dap_pha",
        "purple": "dap_pha",
        "orange": "dap_pha",
        "red": "dap_pha"
      },
      "wikiHeroId": "167",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w169",
      "name": "Quách Đồ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 41,
        "vuLuc": 45,
        "triLuc": 83,
        "hp": 1938
      },
      "skillId": "lac_loi",
      "skillsByQuality": {
        "white": "lac_loi",
        "green": "lac_loi",
        "blue": "lac_loi",
        "purple": "lac_loi",
        "orange": "lac_loi",
        "red": "lac_loi"
      },
      "wikiHeroId": "169",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w170",
      "name": "Viên Đàm",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 58,
        "vuLuc": 70,
        "triLuc": 47,
        "hp": 2244
      },
      "skillId": "hoanh_tao",
      "skillsByQuality": {
        "white": "hoanh_tao",
        "green": "hoanh_tao",
        "blue": "hoanh_tao",
        "purple": "hoanh_tao",
        "orange": "hoanh_tao",
        "red": "hoanh_tao"
      },
      "wikiHeroId": "170",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w171",
      "name": "Viên Thượng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 73,
        "triLuc": 44,
        "hp": 2316
      },
      "skillId": "lien_kich",
      "skillsByQuality": {
        "white": "lien_kich",
        "green": "lien_kich",
        "blue": "lien_kich",
        "purple": "lien_kich",
        "orange": "lien_kich",
        "red": "lien_kich"
      },
      "wikiHeroId": "171",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w172",
      "name": "Viên Hi",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 65,
        "vuLuc": 55,
        "triLuc": 64,
        "hp": 2370
      },
      "skillId": "thu_kich",
      "skillsByQuality": {
        "white": "thu_kich",
        "green": "thu_kich",
        "blue": "thu_kich",
        "purple": "thu_kich",
        "orange": "thu_kich",
        "red": "thu_kich"
      },
      "wikiHeroId": "172",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w174",
      "name": "Ung Khải",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 74,
        "vuLuc": 71,
        "triLuc": 63,
        "hp": 2532
      },
      "skillId": "te_xa",
      "skillsByQuality": {
        "white": "te_xa",
        "green": "te_xa",
        "blue": "te_xa",
        "purple": "te_xa",
        "orange": "te_xa",
        "red": "te_xa"
      },
      "wikiHeroId": "174",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w175",
      "name": "Mạnh Ưu",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 63,
        "vuLuc": 63,
        "triLuc": 43,
        "hp": 2334
      },
      "skillId": "dot_kich",
      "skillsByQuality": {
        "white": "dot_kich",
        "green": "dot_kich",
        "blue": "dot_kich",
        "purple": "dot_kich",
        "orange": "dot_kich",
        "red": "dot_kich"
      },
      "wikiHeroId": "175",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w178",
      "name": "Mang Nha Trường",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 78,
        "triLuc": 46,
        "hp": 2316
      },
      "skillId": "lien_thanh",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "lien_thanh",
        "blue": "lien_thanh",
        "purple": "lien_thanh",
        "orange": "lien_thanh",
        "red": "lien_thanh"
      },
      "wikiHeroId": "178",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w179",
      "name": "Đổng Trà Na",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 68,
        "vuLuc": 72,
        "triLuc": 47,
        "hp": 2424
      },
      "skillId": "huyet_lo",
      "skillsByQuality": {
        "white": "huyet_lo",
        "green": "huyet_lo",
        "blue": "huyet_lo",
        "purple": "huyet_lo",
        "orange": "huyet_lo",
        "red": "huyet_lo"
      },
      "wikiHeroId": "179",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w182",
      "name": "Chu Bao",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 65,
        "vuLuc": 71,
        "triLuc": 40,
        "hp": 2370
      },
      "skillId": "hoanh_tao",
      "skillsByQuality": {
        "white": "hoanh_tao",
        "green": "hoanh_tao",
        "blue": "hoanh_tao",
        "purple": "hoanh_tao",
        "orange": "hoanh_tao",
        "red": "hoanh_tao"
      },
      "wikiHeroId": "182",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w184",
      "name": "Ngột Đột Cốt",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 71,
        "vuLuc": 81,
        "triLuc": 40,
        "hp": 2478
      },
      "skillId": "phan_kich",
      "skillsByQuality": {
        "white": "phan_kich",
        "green": "phan_kich",
        "blue": "phan_kich",
        "purple": "phan_kich",
        "orange": "phan_kich",
        "red": "phan_kich"
      },
      "wikiHeroId": "184",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w185",
      "name": "Cao Định",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 54,
        "vuLuc": 63,
        "triLuc": 43,
        "hp": 2172
      },
      "skillId": "lien_kich",
      "skillsByQuality": {
        "white": "lien_kich",
        "green": "lien_kich",
        "blue": "lien_kich",
        "purple": "lien_kich",
        "orange": "lien_kich",
        "red": "lien_kich"
      },
      "wikiHeroId": "185",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w188",
      "name": "A Hội Nam",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 66,
        "vuLuc": 73,
        "triLuc": 40,
        "hp": 2388
      },
      "skillId": "giao_chien",
      "skillsByQuality": {
        "white": "giao_chien",
        "green": "giao_chien",
        "blue": "giao_chien",
        "purple": "giao_chien",
        "orange": "giao_chien",
        "red": "giao_chien"
      },
      "wikiHeroId": "188",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w189",
      "name": "Dương Sửu",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 56,
        "vuLuc": 64,
        "triLuc": 42,
        "hp": 2208
      },
      "skillId": "tu_sanh",
      "skillsByQuality": {
        "white": "tu_sanh",
        "green": "tu_sanh",
        "blue": "tu_sanh",
        "purple": "tu_sanh",
        "orange": "tu_sanh",
        "red": "tu_sanh"
      },
      "wikiHeroId": "189",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w191",
      "name": "Trương Dương",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 72,
        "triLuc": 65,
        "hp": 2460
      },
      "skillId": "dot_kich",
      "skillsByQuality": {
        "white": "dot_kich",
        "green": "dot_kich",
        "blue": "dot_kich",
        "purple": "dot_kich",
        "orange": "dot_kich",
        "red": "dot_kich"
      },
      "wikiHeroId": "191",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w192",
      "name": "Trương Mạc",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 46,
        "vuLuc": 50,
        "triLuc": 70,
        "hp": 2028
      },
      "skillId": "boc_viem",
      "skillsByQuality": {
        "white": "boc_viem",
        "green": "boc_viem",
        "blue": "boc_viem",
        "purple": "boc_viem",
        "orange": "boc_viem",
        "red": "boc_viem"
      },
      "wikiHeroId": "192",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w196",
      "name": "Hầu Thành",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 73,
        "vuLuc": 72,
        "triLuc": 65,
        "hp": 2514
      },
      "skillId": "phan_kich",
      "skillsByQuality": {
        "white": "phan_kich",
        "green": "phan_kich",
        "blue": "phan_kich",
        "purple": "phan_kich",
        "orange": "phan_kich",
        "red": "phan_kich"
      },
      "wikiHeroId": "196",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w197",
      "name": "Ngụy Tục",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 75,
        "triLuc": 49,
        "hp": 2460
      },
      "skillId": "lien_kich",
      "skillsByQuality": {
        "white": "lien_kich",
        "green": "lien_kich",
        "blue": "lien_kich",
        "purple": "lien_kich",
        "orange": "lien_kich",
        "red": "lien_kich"
      },
      "wikiHeroId": "197",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w396",
      "name": "Văn Khâm",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 76,
        "vuLuc": 82,
        "triLuc": 56,
        "hp": 2568
      },
      "skillId": "thuan_kich",
      "skillsByQuality": {
        "white": "thuan_kich",
        "green": "thuan_kich",
        "blue": "thuan_kich",
        "purple": "thuan_kich",
        "orange": "thuan_kich",
        "red": "thuan_kich"
      },
      "wikiHeroId": "396",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w413",
      "name": "Vô Khâu Kiệm",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 81,
        "vuLuc": 76,
        "triLuc": 47,
        "hp": 2658
      },
      "skillId": "tu_sanh",
      "skillsByQuality": {
        "white": "tu_sanh",
        "green": "tu_sanh",
        "blue": "tu_sanh",
        "purple": "tu_sanh",
        "orange": "tu_sanh",
        "red": "tu_sanh"
      },
      "wikiHeroId": "413",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w533",
      "name": "Phàn Thị",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 46,
        "vuLuc": 52,
        "triLuc": 72,
        "hp": 2028
      },
      "skillId": "co_vu",
      "skillsByQuality": {
        "white": "co_vu",
        "green": "co_vu",
        "blue": "co_vu",
        "purple": "co_vu",
        "orange": "co_vu",
        "red": "co_vu"
      },
      "wikiHeroId": "533",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w637",
      "name": "Kim Hoàn",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 75,
        "triLuc": 58,
        "hp": 2352
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "kich_thich",
        "blue": "kich_thich",
        "purple": "kich_thich",
        "orange": "kich_thich",
        "red": "kich_thich"
      },
      "wikiHeroId": "637",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w639",
      "name": "Triệu Phạm",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 48,
        "vuLuc": 50,
        "triLuc": 61,
        "hp": 2064
      },
      "skillId": "tu_huy",
      "skillsByQuality": {
        "white": "tu_huy",
        "green": "tu_huy",
        "blue": "tu_huy",
        "purple": "tu_huy",
        "orange": "tu_huy",
        "red": "tu_huy"
      },
      "wikiHeroId": "639",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w640",
      "name": "Trần Ưng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 65,
        "vuLuc": 70,
        "triLuc": 46,
        "hp": 2370
      },
      "skillId": "lien_thanh",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "lien_thanh",
        "blue": "lien_thanh",
        "purple": "lien_thanh",
        "orange": "lien_thanh",
        "red": "lien_thanh"
      },
      "wikiHeroId": "640",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w648",
      "name": "Nga Hà Thiêu",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 87,
        "triLuc": 44,
        "hp": 2496
      },
      "skillId": "lien_hoan",
      "skillsByQuality": {
        "white": "lien_hoan",
        "green": "lien_hoan",
        "blue": "lien_hoan",
        "purple": "lien_hoan",
        "orange": "lien_hoan",
        "red": "lien_hoan"
      },
      "wikiHeroId": "648",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w649",
      "name": "Phạt Đồng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 83,
        "vuLuc": 88,
        "triLuc": 55,
        "hp": 2694
      },
      "skillId": "phan_tan",
      "skillsByQuality": {
        "white": "phan_tan",
        "green": "phan_tan",
        "blue": "phan_tan",
        "purple": "phan_tan",
        "orange": "phan_tan",
        "red": "phan_tan"
      },
      "wikiHeroId": "649",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w650",
      "name": "Mang Trung",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 88,
        "vuLuc": 73,
        "triLuc": 67,
        "hp": 2784
      },
      "skillId": "dot_kich",
      "skillsByQuality": {
        "white": "dot_kich",
        "green": "dot_kich",
        "blue": "dot_kich",
        "purple": "dot_kich",
        "orange": "dot_kich",
        "red": "dot_kich"
      },
      "wikiHeroId": "650",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w651",
      "name": "A Quý",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 67,
        "vuLuc": 68,
        "triLuc": 74,
        "hp": 2406
      },
      "skillId": "lien_kich",
      "skillsByQuality": {
        "white": "lien_kich",
        "green": "lien_kich",
        "blue": "lien_kich",
        "purple": "lien_kich",
        "orange": "lien_kich",
        "red": "lien_kich"
      },
      "wikiHeroId": "651",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w655",
      "name": "Triệt Lý Cát",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 61,
        "vuLuc": 62,
        "triLuc": 66,
        "hp": 2298
      },
      "skillId": "no_hong",
      "skillsByQuality": {
        "white": "no_hong",
        "green": "no_hong",
        "blue": "no_hong",
        "purple": "no_hong",
        "orange": "no_hong",
        "red": "no_hong"
      },
      "wikiHeroId": "655",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w656",
      "name": "Nghị Già Tắc",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 87,
        "vuLuc": 75,
        "triLuc": 52,
        "hp": 2766
      },
      "skillId": "thu_kich",
      "skillsByQuality": {
        "white": "thu_kich",
        "green": "thu_kich",
        "blue": "thu_kich",
        "purple": "thu_kich",
        "orange": "thu_kich",
        "red": "thu_kich"
      },
      "wikiHeroId": "656",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w658",
      "name": "Phan Lâm",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 81,
        "vuLuc": 78,
        "triLuc": 46,
        "hp": 2658
      },
      "skillId": "lien_thanh",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "lien_thanh",
        "blue": "lien_thanh",
        "purple": "lien_thanh",
        "orange": "lien_thanh",
        "red": "lien_thanh"
      },
      "wikiHeroId": "658",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w661",
      "name": "Phù Kiện",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 76,
        "vuLuc": 81,
        "triLuc": 58,
        "hp": 2568
      },
      "skillId": "cuong_tap",
      "skillsByQuality": {
        "white": "cuong_tap",
        "green": "cuong_tap",
        "blue": "cuong_tap",
        "purple": "cuong_tap",
        "orange": "cuong_tap",
        "red": "cuong_tap"
      },
      "wikiHeroId": "661",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w663",
      "name": "Thành Luật Quy",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 72,
        "triLuc": 70,
        "hp": 2316
      },
      "skillId": "dap_pha",
      "skillsByQuality": {
        "white": "dap_pha",
        "green": "dap_pha",
        "blue": "dap_pha",
        "purple": "dap_pha",
        "orange": "dap_pha",
        "red": "dap_pha"
      },
      "wikiHeroId": "663",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w664",
      "name": "Tố Lợi",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 86,
        "vuLuc": 88,
        "triLuc": 54,
        "hp": 2748
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_bich",
        "blue": "thiet_bich",
        "purple": "thiet_bich",
        "orange": "thiet_bich",
        "red": "thiet_bich"
      },
      "wikiHeroId": "664",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w666",
      "name": "Kha Tỉ Năng",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 73,
        "vuLuc": 72,
        "triLuc": 63,
        "hp": 2514
      },
      "skillId": "gio_loc",
      "skillsByQuality": {
        "white": "gio_loc",
        "green": "gio_loc",
        "blue": "gio_loc",
        "purple": "gio_loc",
        "orange": "gio_loc",
        "red": "gio_loc"
      },
      "wikiHeroId": "666",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w667",
      "name": "Bộ Độ Căn",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 79,
        "vuLuc": 85,
        "triLuc": 65,
        "hp": 2622
      },
      "skillId": "tien_vu",
      "skillsByQuality": {
        "white": "tien_vu",
        "green": "tien_vu",
        "blue": "tien_vu",
        "purple": "tien_vu",
        "orange": "tien_vu",
        "red": "tien_vu"
      },
      "wikiHeroId": "667",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w669",
      "name": "Lâu Ban",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 87,
        "vuLuc": 78,
        "triLuc": 60,
        "hp": 2766
      },
      "skillId": "hoanh_hoa",
      "skillsByQuality": {
        "white": "hoanh_hoa",
        "green": "hoanh_hoa",
        "blue": "hoanh_hoa",
        "purple": "hoanh_hoa",
        "orange": "hoanh_hoa",
        "red": "hoanh_hoa"
      },
      "wikiHeroId": "669",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w674",
      "name": "Vu Phù La",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 85,
        "vuLuc": 65,
        "triLuc": 87,
        "hp": 2730
      },
      "skillId": "huyen_thuat",
      "skillsByQuality": {
        "white": "huyen_thuat",
        "green": "huyen_thuat",
        "blue": "huyen_thuat",
        "purple": "huyen_thuat",
        "orange": "huyen_thuat",
        "red": "huyen_thuat"
      },
      "wikiHeroId": "674",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w675",
      "name": "Khứ Ti",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 78,
        "vuLuc": 91,
        "triLuc": 54,
        "hp": 2604
      },
      "skillId": "huyet_lo",
      "skillsByQuality": {
        "white": "huyet_lo",
        "green": "huyet_lo",
        "blue": "huyet_lo",
        "purple": "huyet_lo",
        "orange": "huyet_lo",
        "red": "huyet_lo"
      },
      "wikiHeroId": "675",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w741",
      "name": "Trương Yên",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 79,
        "vuLuc": 83,
        "triLuc": 51,
        "hp": 2622
      },
      "skillId": "dap_pha",
      "skillsByQuality": {
        "white": "dap_pha",
        "green": "ky_kich",
        "blue": "ky_kich",
        "purple": "ky_kich",
        "orange": "ky_kich",
        "red": "ky_kich"
      },
      "wikiHeroId": "741",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w768",
      "name": "Quản Lộ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 85,
        "vuLuc": 76,
        "triLuc": 76,
        "hp": 2730
      },
      "skillId": "dot_tap",
      "skillsByQuality": {
        "white": "dot_tap",
        "green": "dot_tap",
        "blue": "dot_tap",
        "purple": "dot_tap",
        "orange": "dot_tap",
        "red": "dot_tap"
      },
      "wikiHeroId": "768",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w769",
      "name": "Hà Tiến",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 78,
        "vuLuc": 68,
        "triLuc": 55,
        "hp": 2604
      },
      "skillId": "cu_ma",
      "skillsByQuality": {
        "white": "cu_ma",
        "green": "cu_ma",
        "blue": "cu_ma",
        "purple": "cu_ma",
        "orange": "cu_ma",
        "red": "cu_ma"
      },
      "wikiHeroId": "769",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w770",
      "name": "Đinh Nguyên",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 78,
        "vuLuc": 89,
        "triLuc": 61,
        "hp": 2604
      },
      "skillId": "pha_phu",
      "skillsByQuality": {
        "white": "pha_phu",
        "green": "pha_phu",
        "blue": "pha_phu",
        "purple": "pha_phu",
        "orange": "pha_phu",
        "red": "pha_phu"
      },
      "wikiHeroId": "770",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w775",
      "name": "Trần Đam",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 66,
        "vuLuc": 68,
        "triLuc": 71,
        "hp": 2388
      },
      "skillId": "chuyen_chu",
      "skillsByQuality": {
        "white": "chuyen_chu",
        "green": "chuyen_chu",
        "blue": "chuyen_chu",
        "purple": "chuyen_chu",
        "orange": "chuyen_chu",
        "red": "chuyen_chu"
      },
      "wikiHeroId": "775",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w779",
      "name": "Trịnh Thái",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 69,
        "triLuc": 75,
        "hp": 2352
      },
      "skillId": "loi_nhan",
      "skillsByQuality": {
        "white": "loi_nhan",
        "green": "loi_nhan",
        "blue": "loi_nhan",
        "purple": "loi_nhan",
        "orange": "loi_nhan",
        "red": "loi_nhan"
      },
      "wikiHeroId": "779",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w853",
      "name": "Ba Tài",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 78,
        "vuLuc": 65,
        "triLuc": 88,
        "hp": 2604
      },
      "skillId": "boc_viem",
      "skillsByQuality": {
        "white": "boc_viem",
        "green": "hoa_nham",
        "blue": "hoa_nham",
        "purple": "hoa_nham",
        "orange": "hoa_nham",
        "red": "hoa_nham"
      },
      "wikiHeroId": "853",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w854",
      "name": "Trình Viễn Chí",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 74,
        "vuLuc": 76,
        "triLuc": 55,
        "hp": 2532
      },
      "skillId": "huyet_lo",
      "skillsByQuality": {
        "white": "huyet_lo",
        "green": "huyet_chien",
        "blue": "huyet_chien",
        "purple": "huyet_chien",
        "orange": "huyet_chien",
        "red": "huyet_chien"
      },
      "wikiHeroId": "854",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w855",
      "name": "Từ Vinh",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 71,
        "triLuc": 66,
        "hp": 2496
      },
      "skillId": "thu_kich",
      "skillsByQuality": {
        "white": "thu_kich",
        "green": "sat_y",
        "blue": "sat_y",
        "purple": "sat_y",
        "orange": "sat_y",
        "red": "sat_y"
      },
      "wikiHeroId": "855",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w856",
      "name": "Cao Thuận",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 142,
        "vuLuc": 129,
        "triLuc": 110,
        "hp": 3756
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "bac_kich",
        "blue": "bac_sat",
        "purple": "thuong_tran",
        "orange": "ham_doanh_thoi_nhue",
        "red": "tien_dang_tu_si"
      },
      "wikiHeroId": "856",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "spear"
    },
    {
      "id": "w857",
      "name": "Đổng Thừa",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 57,
        "vuLuc": 61,
        "triLuc": 78,
        "hp": 2226
      },
      "skillId": "cong_tam",
      "skillsByQuality": {
        "white": "cong_tam",
        "green": "ly_gian",
        "blue": "ly_gian",
        "purple": "ly_gian",
        "orange": "ly_gian",
        "red": "ly_gian"
      },
      "wikiHeroId": "857",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w858",
      "name": "Trương Anh",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 82,
        "vuLuc": 79,
        "triLuc": 46,
        "hp": 2676
      },
      "skillId": "lien_kich",
      "skillsByQuality": {
        "white": "lien_kich",
        "green": "thuan_kich",
        "blue": "thuan_kich",
        "purple": "thuan_kich",
        "orange": "thuan_kich",
        "red": "thuan_kich"
      },
      "wikiHeroId": "858",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w859",
      "name": "Ngu Phiên",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 55,
        "vuLuc": 53,
        "triLuc": 85,
        "hp": 2190
      },
      "skillId": "lang_dao",
      "skillsByQuality": {
        "white": "lang_dao",
        "green": "vong_xoay",
        "blue": "vong_xoay",
        "purple": "vong_xoay",
        "orange": "vong_xoay",
        "red": "vong_xoay"
      },
      "wikiHeroId": "859",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w860",
      "name": "Vương Lãng",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 63,
        "vuLuc": 53,
        "triLuc": 78,
        "hp": 2334
      },
      "skillId": "doc_chu",
      "skillsByQuality": {
        "white": "doc_chu",
        "green": "doc_chu",
        "blue": "doc_chu",
        "purple": "doc_chu",
        "orange": "doc_chu",
        "red": "doc_chu"
      },
      "wikiHeroId": "860",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w861",
      "name": "Lôi Bạc",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 71,
        "vuLuc": 76,
        "triLuc": 54,
        "hp": 2478
      },
      "skillId": "cuong_tap",
      "skillsByQuality": {
        "white": "cuong_tap",
        "green": "pha_phu",
        "blue": "pha_phu",
        "purple": "pha_phu",
        "orange": "pha_phu",
        "red": "pha_phu"
      },
      "wikiHeroId": "861",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w862",
      "name": "Lạc Tựu",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 74,
        "vuLuc": 75,
        "triLuc": 54,
        "hp": 2532
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "bac_kich",
        "blue": "bac_kich",
        "purple": "bac_kich",
        "orange": "bac_kich",
        "red": "bac_kich"
      },
      "wikiHeroId": "862",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w863",
      "name": "Diêm Tượng",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 69,
        "vuLuc": 56,
        "triLuc": 72,
        "hp": 2442
      },
      "skillId": "hong_viem",
      "skillsByQuality": {
        "white": "hong_viem",
        "green": "hong_viem",
        "blue": "hong_viem",
        "purple": "hong_viem",
        "orange": "hong_viem",
        "red": "hong_viem"
      },
      "wikiHeroId": "863",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w864",
      "name": "Kỷ Linh",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 76,
        "vuLuc": 84,
        "triLuc": 57,
        "hp": 2568
      },
      "skillId": "lien_thanh",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "binh_phat",
        "blue": "binh_phat",
        "purple": "binh_phat",
        "orange": "binh_phat",
        "red": "binh_phat"
      },
      "wikiHeroId": "864",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w865",
      "name": "Điền Dự",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 77,
        "vuLuc": 71,
        "triLuc": 82,
        "hp": 2586
      },
      "skillId": "lang_dao",
      "skillsByQuality": {
        "white": "lang_dao",
        "green": "vong_xoay",
        "blue": "vong_xoay",
        "purple": "vong_xoay",
        "orange": "vong_xoay",
        "red": "vong_xoay"
      },
      "wikiHeroId": "865",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w868",
      "name": "Trương Vệ",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 77,
        "vuLuc": 75,
        "triLuc": 54,
        "hp": 2586
      },
      "skillId": "phan_kich",
      "skillsByQuality": {
        "white": "phan_kich",
        "green": "nghich_chuyen",
        "blue": "nghich_chuyen",
        "purple": "nghich_chuyen",
        "orange": "nghich_chuyen",
        "red": "nghich_chuyen"
      },
      "wikiHeroId": "868",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w869",
      "name": "Diêm Phố",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 54,
        "vuLuc": 61,
        "triLuc": 86,
        "hp": 2172
      },
      "skillId": "lang_dao",
      "skillsByQuality": {
        "white": "lang_dao",
        "green": "bai_lang",
        "blue": "bai_lang",
        "purple": "bai_lang",
        "orange": "bai_lang",
        "red": "bai_lang"
      },
      "wikiHeroId": "869",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w871",
      "name": "Lưu Tông",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 54,
        "vuLuc": 54,
        "triLuc": 72,
        "hp": 2172
      },
      "skillId": "con_thach",
      "skillsByQuality": {
        "white": "con_thach",
        "green": "lac_thach",
        "blue": "lac_thach",
        "purple": "lac_thach",
        "orange": "lac_thach",
        "red": "lac_thach"
      },
      "wikiHeroId": "871",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w873",
      "name": "Thái Mạo",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 83,
        "vuLuc": 76,
        "triLuc": 76,
        "hp": 2694
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "pha_kich",
        "blue": "pha_kich",
        "purple": "pha_kich",
        "orange": "pha_kich",
        "red": "pha_kich"
      },
      "wikiHeroId": "873",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w874",
      "name": "Trương Doãn",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 73,
        "vuLuc": 74,
        "triLuc": 55,
        "hp": 2514
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "bai_lang",
        "blue": "bai_lang",
        "purple": "bai_lang",
        "orange": "bai_lang",
        "red": "bai_lang"
      },
      "wikiHeroId": "874",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w875",
      "name": "Lưu Hiền",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 64,
        "vuLuc": 62,
        "triLuc": 58,
        "hp": 2352
      },
      "skillId": "huyet_lo",
      "skillsByQuality": {
        "white": "huyet_lo",
        "green": "kho_ke",
        "blue": "kho_ke",
        "purple": "kho_ke",
        "orange": "kho_ke",
        "red": "kho_ke"
      },
      "wikiHeroId": "875",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w876",
      "name": "Ngô Ban",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 73,
        "vuLuc": 74,
        "triLuc": 69,
        "hp": 2514
      },
      "skillId": "kich_doc",
      "skillsByQuality": {
        "white": "kich_doc",
        "green": "doc_tieu",
        "blue": "doc_tieu",
        "purple": "doc_tieu",
        "orange": "doc_tieu",
        "red": "doc_tieu"
      },
      "wikiHeroId": "876",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w877",
      "name": "Lôi Đồng",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 81,
        "vuLuc": 82,
        "triLuc": 48,
        "hp": 2658
      },
      "skillId": "hoanh_tao",
      "skillsByQuality": {
        "white": "hoanh_tao",
        "green": "ham_dia",
        "blue": "ham_dia",
        "purple": "ham_dia",
        "orange": "ham_dia",
        "red": "ham_dia"
      },
      "wikiHeroId": "877",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w878",
      "name": "Lý Nghiêm",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 87,
        "vuLuc": 83,
        "triLuc": 72,
        "hp": 2766
      },
      "skillId": "lien_thanh",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "vien_binh",
        "blue": "vien_binh",
        "purple": "vien_binh",
        "orange": "vien_binh",
        "red": "vien_binh"
      },
      "wikiHeroId": "878",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w879",
      "name": "Nghiêm Nhan",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 79,
        "vuLuc": 82,
        "triLuc": 77,
        "hp": 2622
      },
      "skillId": "thu_ho",
      "skillsByQuality": {
        "white": "thu_ho",
        "green": "ngu_giap",
        "blue": "ngu_giap",
        "purple": "ngu_giap",
        "orange": "ngu_giap",
        "red": "ngu_giap"
      },
      "wikiHeroId": "879",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w882",
      "name": "Cao Bái",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 69,
        "triLuc": 68,
        "hp": 2496
      },
      "skillId": "thu_kich",
      "skillsByQuality": {
        "white": "thu_kich",
        "green": "loi_tien",
        "blue": "loi_tien",
        "purple": "loi_tien",
        "orange": "loi_tien",
        "red": "loi_tien"
      },
      "wikiHeroId": "882",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w883",
      "name": "Trương Tùng",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 61,
        "vuLuc": 62,
        "triLuc": 92,
        "hp": 2298
      },
      "skillId": "hoa_long",
      "skillsByQuality": {
        "white": "hoa_long",
        "green": "dia_liep",
        "blue": "dia_liep",
        "purple": "dia_liep",
        "orange": "dia_liep",
        "red": "dia_liep"
      },
      "wikiHeroId": "883",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w894",
      "name": "Thuần Vu Quỳnh",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 73,
        "vuLuc": 76,
        "triLuc": 59,
        "hp": 2514
      },
      "skillId": "lien_hoan",
      "skillsByQuality": {
        "white": "lien_hoan",
        "green": "lien_hoan",
        "blue": "lien_hoan",
        "purple": "lien_hoan",
        "orange": "lien_hoan",
        "red": "lien_hoan"
      },
      "wikiHeroId": "894",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w899",
      "name": "Mộc Lộc Vương",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 73,
        "vuLuc": 72,
        "triLuc": 67,
        "hp": 2514
      },
      "skillId": "yeu_thuat",
      "skillsByQuality": {
        "white": "yeu_thuat",
        "green": "phan_diet",
        "blue": "phan_diet",
        "purple": "phan_diet",
        "orange": "phan_diet",
        "red": "phan_diet"
      },
      "wikiHeroId": "899",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w900",
      "name": "Đóa Tư Vương",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 66,
        "triLuc": 77,
        "hp": 2460
      },
      "skillId": "am_te",
      "skillsByQuality": {
        "white": "am_te",
        "green": "pha_ke",
        "blue": "pha_ke",
        "purple": "pha_ke",
        "orange": "pha_ke",
        "red": "pha_ke"
      },
      "wikiHeroId": "900",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w903",
      "name": "Trương Hổ",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 80,
        "vuLuc": 83,
        "triLuc": 60,
        "hp": 2640
      },
      "skillId": "hoanh_tao",
      "skillsByQuality": {
        "white": "hoanh_tao",
        "green": "san_bang",
        "blue": "san_bang",
        "purple": "san_bang",
        "orange": "san_bang",
        "red": "san_bang"
      },
      "wikiHeroId": "903",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w904",
      "name": "Tào Tính",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 76,
        "vuLuc": 83,
        "triLuc": 61,
        "hp": 2568
      },
      "skillId": "am_sat",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "xa_sat",
        "blue": "xa_sat",
        "purple": "xa_sat",
        "orange": "xa_sat",
        "red": "xa_sat"
      },
      "wikiHeroId": "904",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w905",
      "name": "Tống Hiến",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 74,
        "vuLuc": 80,
        "triLuc": 49,
        "hp": 2532
      },
      "skillId": "cuong_tap",
      "skillsByQuality": {
        "white": "cuong_tap",
        "green": "nhieu_tap",
        "blue": "nhieu_tap",
        "purple": "nhieu_tap",
        "orange": "nhieu_tap",
        "red": "nhieu_tap"
      },
      "wikiHeroId": "905",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w906",
      "name": "Chu Chỉ",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 79,
        "vuLuc": 86,
        "triLuc": 55,
        "hp": 2622
      },
      "skillId": "ky_kich",
      "skillsByQuality": {
        "white": "ky_kich",
        "green": "don_ky",
        "blue": "don_ky",
        "purple": "don_ky",
        "orange": "don_ky",
        "red": "don_ky"
      },
      "wikiHeroId": "906",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w907",
      "name": "Ngưu Kim",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 82,
        "vuLuc": 80,
        "triLuc": 58,
        "hp": 2676
      },
      "skillId": "lien_hoan",
      "skillsByQuality": {
        "white": "lien_hoan",
        "green": "xa_sat",
        "blue": "xa_sat",
        "purple": "xa_sat",
        "orange": "xa_sat",
        "red": "xa_sat"
      },
      "wikiHeroId": "907",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w908",
      "name": "Tang Bá",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 81,
        "vuLuc": 78,
        "triLuc": 58,
        "hp": 2658
      },
      "skillId": "dap_pha",
      "skillsByQuality": {
        "white": "dap_pha",
        "green": "vien_binh",
        "blue": "vien_binh",
        "purple": "vien_binh",
        "orange": "vien_binh",
        "red": "vien_binh"
      },
      "wikiHeroId": "908",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w910",
      "name": "Bào Long",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 75,
        "vuLuc": 74,
        "triLuc": 52,
        "hp": 2550
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "chuoc_gioi",
        "blue": "chuoc_gioi",
        "purple": "chuoc_gioi",
        "orange": "chuoc_gioi",
        "red": "chuoc_gioi"
      },
      "wikiHeroId": "910",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w920",
      "name": "Thạp Đốn",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 76,
        "vuLuc": 82,
        "triLuc": 56,
        "hp": 2568
      },
      "skillId": "kho_ke",
      "skillsByQuality": {
        "white": "kho_ke",
        "green": "kho_ke",
        "blue": "kho_ke",
        "purple": "kho_ke",
        "orange": "kho_ke",
        "red": "kho_ke"
      },
      "wikiHeroId": "920",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w921",
      "name": "Cốt Tiến",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 86,
        "vuLuc": 89,
        "triLuc": 61,
        "hp": 2748
      },
      "skillId": "am_sat",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "tat_xung",
        "blue": "tat_xung",
        "purple": "tat_xung",
        "orange": "tat_xung",
        "red": "tat_xung"
      },
      "wikiHeroId": "921",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w924",
      "name": "Chung Dao",
      "faction": "wei",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 72,
        "vuLuc": 58,
        "triLuc": 83,
        "hp": 2496
      },
      "skillId": "gio_loc",
      "skillsByQuality": {
        "white": "gio_loc",
        "green": "gio_loc",
        "blue": "gio_loc",
        "purple": "gio_loc",
        "orange": "gio_loc",
        "red": "gio_loc"
      },
      "wikiHeroId": "924",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w925",
      "name": "Lưu Diệp",
      "faction": "wei",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 52,
        "vuLuc": 70,
        "triLuc": 90,
        "hp": 2136
      },
      "skillId": "kich_doc",
      "skillsByQuality": {
        "white": "kich_doc",
        "green": "doc_ke",
        "blue": "doc_ke",
        "purple": "doc_ke",
        "orange": "doc_ke",
        "red": "doc_ke"
      },
      "wikiHeroId": "925",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w928",
      "name": "Lý Thông",
      "faction": "wei",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 85,
        "vuLuc": 84,
        "triLuc": 52,
        "hp": 2730
      },
      "skillId": "thu_kich",
      "skillsByQuality": {
        "white": "thu_kich",
        "green": "loi_tien",
        "blue": "loi_tien",
        "purple": "loi_tien",
        "orange": "loi_tien",
        "red": "loi_tien"
      },
      "wikiHeroId": "928",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w929",
      "name": "Đặng Trung",
      "faction": "wei",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 80,
        "vuLuc": 88,
        "triLuc": 68,
        "hp": 2640
      },
      "skillId": "dap_pha",
      "skillsByQuality": {
        "white": "dap_pha",
        "green": "don_ky",
        "blue": "don_ky",
        "purple": "don_ky",
        "orange": "don_ky",
        "red": "don_ky"
      },
      "wikiHeroId": "929",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w931",
      "name": "Trần Quần",
      "faction": "wei",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 58,
        "triLuc": 89,
        "hp": 2316
      },
      "skillId": "hoa_long",
      "skillsByQuality": {
        "white": "hoa_long",
        "green": "dia_liep",
        "blue": "dia_liep",
        "purple": "dia_liep",
        "orange": "dia_liep",
        "red": "dia_liep"
      },
      "wikiHeroId": "931",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w932",
      "name": "Vu Cấm",
      "faction": "wei",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 87,
        "vuLuc": 83,
        "triLuc": 72,
        "hp": 2766
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_thuong",
        "blue": "thiet_thuong",
        "purple": "thiet_thuong",
        "orange": "thiet_thuong",
        "red": "thiet_thuong"
      },
      "wikiHeroId": "932",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w934",
      "name": "Dương Tu",
      "faction": "wei",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 62,
        "vuLuc": 58,
        "triLuc": 85,
        "hp": 2316
      },
      "skillId": "tri_lieu",
      "skillsByQuality": {
        "white": "tri_lieu",
        "green": "tri_lieu",
        "blue": "tri_lieu",
        "purple": "tri_lieu",
        "orange": "tri_lieu",
        "red": "tri_lieu"
      },
      "wikiHeroId": "934",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w936",
      "name": "Hoa Hâm",
      "faction": "wei",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 78,
        "vuLuc": 72,
        "triLuc": 90,
        "hp": 2604
      },
      "skillId": "nhuc_ma",
      "skillsByQuality": {
        "white": "nhuc_ma",
        "green": "nhuc_ma",
        "blue": "nhuc_ma",
        "purple": "nhuc_ma",
        "orange": "nhuc_ma",
        "red": "nhuc_ma"
      },
      "wikiHeroId": "936",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w943",
      "name": "Hí Chí Tài",
      "faction": "wei",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 62,
        "triLuc": 91,
        "hp": 2460
      },
      "skillId": "hai_tieu",
      "skillsByQuality": {
        "white": "hai_tieu",
        "green": "mai_lang",
        "blue": "mai_lang",
        "purple": "mai_lang",
        "orange": "mai_lang",
        "red": "mai_lang"
      },
      "wikiHeroId": "943",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w944",
      "name": "Hạ Hầu Bá",
      "faction": "wei",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 82,
        "vuLuc": 89,
        "triLuc": 77,
        "hp": 2676
      },
      "skillId": "tat_xung",
      "skillsByQuality": {
        "white": "tat_xung",
        "green": "tat_xung",
        "blue": "tat_xung",
        "purple": "tat_xung",
        "orange": "tat_xung",
        "red": "tat_xung"
      },
      "wikiHeroId": "944",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w962",
      "name": "Tôn Hưu",
      "faction": "wu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 68,
        "vuLuc": 50,
        "triLuc": 83,
        "hp": 2424
      },
      "skillId": "tri_lieu",
      "skillsByQuality": {
        "white": "tri_lieu",
        "green": "tri_lieu",
        "blue": "tri_lieu",
        "purple": "tri_lieu",
        "orange": "tri_lieu",
        "red": "tri_lieu"
      },
      "wikiHeroId": "962",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w963",
      "name": "Tổ Mậu",
      "faction": "wu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 76,
        "vuLuc": 78,
        "triLuc": 64,
        "hp": 2568
      },
      "skillId": "dot_tap",
      "skillsByQuality": {
        "white": "dot_tap",
        "green": "dot_tap",
        "blue": "dot_tap",
        "purple": "dot_tap",
        "orange": "dot_tap",
        "red": "dot_tap"
      },
      "wikiHeroId": "963",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w965",
      "name": "Tưởng Khâm",
      "faction": "wu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 82,
        "vuLuc": 88,
        "triLuc": 56,
        "hp": 2676
      },
      "skillId": "hoanh_tao",
      "skillsByQuality": {
        "white": "hoanh_tao",
        "green": "ham_dia",
        "blue": "ham_dia",
        "purple": "ham_dia",
        "orange": "ham_dia",
        "red": "ham_dia"
      },
      "wikiHeroId": "965",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w967",
      "name": "Lăng Tháo",
      "faction": "wu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 88,
        "vuLuc": 86,
        "triLuc": 62,
        "hp": 2784
      },
      "skillId": "giao_chien",
      "skillsByQuality": {
        "white": "giao_chien",
        "green": "giao_chien",
        "blue": "giao_chien",
        "purple": "giao_chien",
        "orange": "giao_chien",
        "red": "giao_chien"
      },
      "wikiHeroId": "967",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w968",
      "name": "Trần Võ",
      "faction": "wu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 82,
        "vuLuc": 85,
        "triLuc": 48,
        "hp": 2676
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_thuong",
        "blue": "thiet_thuong",
        "purple": "thiet_thuong",
        "orange": "thiet_thuong",
        "red": "thiet_thuong"
      },
      "wikiHeroId": "968",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w971",
      "name": "Đinh Phụng",
      "faction": "wu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 80,
        "vuLuc": 87,
        "triLuc": 75,
        "hp": 2640
      },
      "skillId": "lien_kich",
      "skillsByQuality": {
        "white": "lien_kich",
        "green": "tau_sat",
        "blue": "tau_sat",
        "purple": "tau_sat",
        "orange": "tau_sat",
        "red": "tau_sat"
      },
      "wikiHeroId": "971",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w983",
      "name": "Đổng Tập",
      "faction": "wu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 77,
        "vuLuc": 85,
        "triLuc": 52,
        "hp": 2586
      },
      "skillId": "tat_xung",
      "skillsByQuality": {
        "white": "tat_xung",
        "green": "mui_nhon",
        "blue": "mui_nhon",
        "purple": "mui_nhon",
        "orange": "mui_nhon",
        "red": "mui_nhon"
      },
      "wikiHeroId": "983",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1005",
      "name": "Triệu Thống",
      "faction": "shu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 77,
        "vuLuc": 82,
        "triLuc": 69,
        "hp": 2586
      },
      "skillId": "lien_thanh",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "binh_phat",
        "blue": "binh_phat",
        "purple": "binh_phat",
        "orange": "binh_phat",
        "red": "binh_phat"
      },
      "wikiHeroId": "1005",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1007",
      "name": "Quan Sách",
      "faction": "shu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 76,
        "vuLuc": 87,
        "triLuc": 60,
        "hp": 2568
      },
      "skillId": "huyet_lo",
      "skillsByQuality": {
        "white": "huyet_lo",
        "green": "huyet_chien",
        "blue": "huyet_chien",
        "purple": "huyet_chien",
        "orange": "huyet_chien",
        "red": "huyet_chien"
      },
      "wikiHeroId": "1007",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1008",
      "name": "Phó Thiêm",
      "faction": "shu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 84,
        "vuLuc": 83,
        "triLuc": 73,
        "hp": 2712
      },
      "skillId": "thuan_kich",
      "skillsByQuality": {
        "white": "thuan_kich",
        "green": "thuan_kich",
        "blue": "thuan_kich",
        "purple": "thuan_kich",
        "orange": "thuan_kich",
        "red": "thuan_kich"
      },
      "wikiHeroId": "1008",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1009",
      "name": "Phí Huy",
      "faction": "shu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 74,
        "vuLuc": 51,
        "triLuc": 83,
        "hp": 2532
      },
      "skillId": "kich_doc",
      "skillsByQuality": {
        "white": "kich_doc",
        "green": "on_dich",
        "blue": "on_dich",
        "purple": "on_dich",
        "orange": "on_dich",
        "red": "on_dich"
      },
      "wikiHeroId": "1009",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1014",
      "name": "Lý Khôi",
      "faction": "shu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 80,
        "vuLuc": 80,
        "triLuc": 81,
        "hp": 2640
      },
      "skillId": "lien_kich",
      "skillsByQuality": {
        "white": "lien_kich",
        "green": "tieu_sat",
        "blue": "tieu_sat",
        "purple": "tieu_sat",
        "orange": "tieu_sat",
        "red": "tieu_sat"
      },
      "wikiHeroId": "1014",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1015",
      "name": "Trần Đăng",
      "faction": "shu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 80,
        "vuLuc": 67,
        "triLuc": 82,
        "hp": 2640
      },
      "skillId": "nhuc_ma",
      "skillsByQuality": {
        "white": "nhuc_ma",
        "green": "nhuc_ma",
        "blue": "nhuc_ma",
        "purple": "nhuc_ma",
        "orange": "nhuc_ma",
        "red": "nhuc_ma"
      },
      "wikiHeroId": "1015",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1018",
      "name": "Triệu Quảng",
      "faction": "shu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 84,
        "vuLuc": 87,
        "triLuc": 58,
        "hp": 2712
      },
      "skillId": "tat_xung",
      "skillsByQuality": {
        "white": "tat_xung",
        "green": "tat_xung",
        "blue": "tat_xung",
        "purple": "tat_xung",
        "orange": "tat_xung",
        "red": "tat_xung"
      },
      "wikiHeroId": "1018",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1021",
      "name": "Mạnh Đạt",
      "faction": "shu",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 84,
        "vuLuc": 80,
        "triLuc": 80,
        "hp": 2712
      },
      "skillId": "thu_ho",
      "skillsByQuality": {
        "white": "thu_ho",
        "green": "han_ve",
        "blue": "han_ve",
        "purple": "han_ve",
        "orange": "han_ve",
        "red": "han_ve"
      },
      "wikiHeroId": "1021",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1068",
      "name": "Vu Độc",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 88,
        "vuLuc": 82,
        "triLuc": 74,
        "hp": 2784
      },
      "skillId": "lien_thanh",
      "skillsByQuality": {
        "white": "lien_thanh",
        "green": "huy_hoai",
        "blue": "huy_hoai",
        "purple": "huy_hoai",
        "orange": "huy_hoai",
        "red": "huy_hoai"
      },
      "wikiHeroId": "1068",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1138",
      "name": "Tân Tì",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 71,
        "vuLuc": 64,
        "triLuc": 82,
        "hp": 2478
      },
      "skillId": "lang_dao",
      "skillsByQuality": {
        "white": "lang_dao",
        "green": "huyen_bang",
        "blue": "huyen_bang",
        "purple": "huyen_bang",
        "orange": "huyen_bang",
        "red": "huyen_bang"
      },
      "wikiHeroId": "1138",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1249",
      "name": "Vương Cơ",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 87,
        "vuLuc": 85,
        "triLuc": 82,
        "hp": 2766
      },
      "skillId": "chuoc_gioi",
      "skillsByQuality": {
        "white": "chuoc_gioi",
        "green": "tien_dap",
        "blue": "tien_dap",
        "purple": "tien_dap",
        "orange": "tien_dap",
        "red": "tien_dap"
      },
      "wikiHeroId": "1249",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1405",
      "name": "Ngô Ý",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 84,
        "vuLuc": 88,
        "triLuc": 77,
        "hp": 2712
      },
      "skillId": "cuong_bao",
      "skillsByQuality": {
        "white": "cuong_bao",
        "green": "chien_cuong",
        "blue": "cuong_loan",
        "purple": "cuong_loan",
        "orange": "cuong_loan",
        "red": "cuong_loan"
      },
      "wikiHeroId": "1405",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1418",
      "name": "Ngạc Hoán",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 70,
        "vuLuc": 84,
        "triLuc": 57,
        "hp": 2460
      },
      "skillId": "no_hong",
      "skillsByQuality": {
        "white": "no_hong",
        "green": "no_hong",
        "blue": "no_xich",
        "purple": "no_xich",
        "orange": "no_xich",
        "red": "no_xich"
      },
      "wikiHeroId": "1418",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1420",
      "name": "Việt Cát",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 84,
        "vuLuc": 91,
        "triLuc": 73,
        "hp": 2712
      },
      "skillId": "don_ky",
      "skillsByQuality": {
        "white": "don_ky",
        "green": "ky_liep",
        "blue": "ky_xa",
        "purple": "ky_xa",
        "orange": "ky_xa",
        "red": "ky_xa"
      },
      "wikiHeroId": "1420",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1423",
      "name": "Hoàng Loạn",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 95,
        "vuLuc": 86,
        "triLuc": 62,
        "hp": 2910
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "pha_kich",
        "blue": "chan_kich",
        "purple": "chan_kich",
        "orange": "chan_kich",
        "red": "chan_kich"
      },
      "wikiHeroId": "1423",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1427",
      "name": "Ô Diên",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 95,
        "vuLuc": 92,
        "triLuc": 74,
        "hp": 2910
      },
      "skillId": "cuong_bao",
      "skillsByQuality": {
        "white": "cuong_bao",
        "green": "chien_cuong",
        "blue": "phan_no",
        "purple": "phan_no",
        "orange": "phan_no",
        "red": "phan_no"
      },
      "wikiHeroId": "1427",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1435",
      "name": "Hách Chiêu",
      "faction": "wei",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 88,
        "vuLuc": 93,
        "triLuc": 88,
        "hp": 2784
      },
      "skillId": "loi_tien",
      "skillsByQuality": {
        "white": "loi_tien",
        "green": "mui_nhon",
        "blue": "nghe_xa",
        "purple": "nghe_xa",
        "orange": "nghe_xa",
        "red": "nghe_xa"
      },
      "wikiHeroId": "1435",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1463",
      "name": "Tôn Hoàn",
      "faction": "wu",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 89,
        "vuLuc": 93,
        "triLuc": 82,
        "hp": 2802
      },
      "skillId": "npc_troi_tru_dat_diet",
      "skillsByQuality": {
        "white": "npc_troi_tru_dat_diet",
        "green": "lien_no",
        "blue": "hoa_no",
        "purple": "hoa_no",
        "orange": "hoa_no",
        "red": "hoa_no"
      },
      "wikiHeroId": "1463",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1477",
      "name": "Sa Ma Kha",
      "faction": "shu",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 87,
        "vuLuc": 96,
        "triLuc": 61,
        "hp": 2766
      },
      "skillId": "cuong_bao",
      "skillsByQuality": {
        "white": "cuong_bao",
        "green": "chien_cuong",
        "blue": "cuong_loan",
        "purple": "cuong_loan",
        "orange": "cuong_loan",
        "red": "cuong_loan"
      },
      "wikiHeroId": "1477",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1502",
      "name": "Kha Ngô",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 81,
        "vuLuc": 73,
        "triLuc": 92,
        "hp": 2658
      },
      "skillId": "hai_tieu",
      "skillsByQuality": {
        "white": "hai_tieu",
        "green": "mai_lang",
        "blue": "ngu_say",
        "purple": "ngu_say",
        "orange": "ngu_say",
        "red": "ngu_say"
      },
      "wikiHeroId": "1502",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1567",
      "name": "Dương Nghi",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "base": {
        "tongLinh": 76,
        "vuLuc": 62,
        "triLuc": 89,
        "hp": 2568
      },
      "skillId": "nhuc_ma",
      "skillsByQuality": {
        "white": "nhuc_ma",
        "green": "ngu_say",
        "blue": "ngu_say",
        "purple": "ngu_say",
        "orange": "ngu_say",
        "red": "ngu_say"
      },
      "wikiHeroId": "1567",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1604",
      "name": "Dương Cổ",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 93,
        "vuLuc": 78,
        "triLuc": 99,
        "hp": 2874
      },
      "skillId": "hong_viem",
      "skillsByQuality": {
        "white": "hong_viem",
        "green": "hong_viem",
        "blue": "thien_khai",
        "purple": "thien_khai",
        "orange": "thien_khai",
        "red": "thien_khai"
      },
      "wikiHeroId": "1604",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1904",
      "name": "Vương Song",
      "faction": "wei",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 88,
        "vuLuc": 94,
        "triLuc": 64,
        "hp": 2784
      },
      "skillId": "thuan_kich",
      "skillsByQuality": {
        "white": "thuan_kich",
        "green": "thuan_kich",
        "blue": "chuy_kich",
        "purple": "chuy_kich",
        "orange": "chuy_kich",
        "red": "chuy_kich"
      },
      "wikiHeroId": "1904",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1906",
      "name": "Quan Hưng",
      "faction": "shu",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 86,
        "vuLuc": 90,
        "triLuc": 72,
        "hp": 2748
      },
      "skillId": "no_kiem",
      "skillsByQuality": {
        "white": "no_kiem",
        "green": "no_tram",
        "blue": "no_tap",
        "purple": "no_tap",
        "orange": "no_tap",
        "red": "no_tap"
      },
      "wikiHeroId": "1906",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1909",
      "name": "Dương Bách",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 67,
        "vuLuc": 54,
        "triLuc": 61,
        "hp": 2406
      },
      "skillId": "huyet_che",
      "skillsByQuality": {
        "white": "huyet_che",
        "green": "huyet_che",
        "blue": "kim_ham",
        "purple": "kim_ham",
        "orange": "kim_ham",
        "red": "kim_ham"
      },
      "wikiHeroId": "1909",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1926",
      "name": "Tào Hưu",
      "faction": "wei",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 86,
        "vuLuc": 95,
        "triLuc": 65,
        "hp": 2748
      },
      "skillId": "lien_hoan",
      "skillsByQuality": {
        "white": "lien_hoan",
        "green": "ten_lac",
        "blue": "yeu_giap",
        "purple": "yeu_giap",
        "orange": "yeu_giap",
        "red": "yeu_giap"
      },
      "wikiHeroId": "1926",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1927",
      "name": "Tôn Thiều",
      "faction": "wu",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 91,
        "vuLuc": 90,
        "triLuc": 82,
        "hp": 2838
      },
      "skillId": "thuan_kich",
      "skillsByQuality": {
        "white": "thuan_kich",
        "green": "thuan_kich",
        "blue": "yeu_giap",
        "purple": "yeu_giap",
        "orange": "yeu_giap",
        "red": "yeu_giap"
      },
      "wikiHeroId": "1927",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1929",
      "name": "Trương Thừa",
      "faction": "wu",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 95,
        "vuLuc": 82,
        "triLuc": 85,
        "hp": 2910
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "pha_kich",
        "blue": "huy_diet",
        "purple": "huy_diet",
        "orange": "huy_diet",
        "red": "huy_diet"
      },
      "wikiHeroId": "1929",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1930",
      "name": "Bào Tam Nương",
      "faction": "shu",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 95,
        "vuLuc": 84,
        "triLuc": 79,
        "hp": 2910
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "bac_kich",
        "blue": "huy_diet",
        "purple": "huy_diet",
        "orange": "huy_diet",
        "red": "huy_diet"
      },
      "wikiHeroId": "1930",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1934",
      "name": "Công Tôn Phạm",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 81,
        "vuLuc": 80,
        "triLuc": 73,
        "hp": 2658
      },
      "skillId": "am_sat",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "thich_sat",
        "blue": "hanh_thich",
        "purple": "hanh_thich",
        "orange": "hanh_thich",
        "red": "hanh_thich"
      },
      "wikiHeroId": "1934",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1935",
      "name": "Lãnh Bao",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 84,
        "vuLuc": 91,
        "triLuc": 73,
        "hp": 2712
      },
      "skillId": "am_sat",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "thich_sat",
        "blue": "hanh_thich",
        "purple": "hanh_thich",
        "orange": "hanh_thich",
        "red": "hanh_thich"
      },
      "wikiHeroId": "1935",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1952",
      "name": "Hàn Toại",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 96,
        "vuLuc": 90,
        "triLuc": 81,
        "hp": 2928
      },
      "skillId": "con_thach",
      "skillsByQuality": {
        "white": "con_thach",
        "green": "lac_thach",
        "blue": "quy_ke",
        "purple": "doat_tam",
        "orange": "doat_tam",
        "red": "doat_tam"
      },
      "wikiHeroId": "1952",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1953",
      "name": "Phí Sạn",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 93,
        "vuLuc": 76,
        "triLuc": 99,
        "hp": 2874
      },
      "skillId": "hoa_long",
      "skillsByQuality": {
        "white": "hoa_long",
        "green": "lac_thach",
        "blue": "quy_ke",
        "purple": "doat_tam",
        "orange": "doat_tam",
        "red": "doat_tam"
      },
      "wikiHeroId": "1953",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1954",
      "name": "Khoái Lương",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 77,
        "vuLuc": 67,
        "triLuc": 95,
        "hp": 2586
      },
      "skillId": "hai_tieu",
      "skillsByQuality": {
        "white": "hai_tieu",
        "green": "mai_lang",
        "blue": "long_dao",
        "purple": "thuy_cong",
        "orange": "thuy_cong",
        "red": "thuy_cong"
      },
      "wikiHeroId": "1954",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1957",
      "name": "Mã Thiết",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 77,
        "vuLuc": 89,
        "triLuc": 71,
        "hp": 2586
      },
      "skillId": "hoanh_tao",
      "skillsByQuality": {
        "white": "hoanh_tao",
        "green": "hoanh_hoa",
        "blue": "tap_kich",
        "purple": "loan_kich",
        "orange": "loan_kich",
        "red": "loan_kich"
      },
      "wikiHeroId": "1957",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1958",
      "name": "Mã Đằng",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 88,
        "vuLuc": 97,
        "triLuc": 71,
        "hp": 2784
      },
      "skillId": "dap_pha",
      "skillsByQuality": {
        "white": "dap_pha",
        "green": "ky_kich",
        "blue": "tat_tri",
        "purple": "ky_than",
        "orange": "ky_than",
        "red": "ky_than"
      },
      "wikiHeroId": "1958",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1966",
      "name": "Xa Trụ",
      "faction": "wei",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 86,
        "vuLuc": 88,
        "triLuc": 67,
        "hp": 2748
      },
      "skillId": "uy_phong",
      "skillsByQuality": {
        "white": "uy_phong",
        "green": "tang_phong",
        "blue": "khu_truc",
        "purple": "kiem_ham",
        "orange": "kiem_ham",
        "red": "kiem_ham"
      },
      "wikiHeroId": "1966",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1967",
      "name": "Lữ Đại",
      "faction": "wu",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 85,
        "vuLuc": 95,
        "triLuc": 79,
        "hp": 2730
      },
      "skillId": "uy_phong",
      "skillsByQuality": {
        "white": "uy_phong",
        "green": "tang_phong",
        "blue": "khu_truc",
        "purple": "kiem_ham",
        "orange": "kiem_ham",
        "red": "kiem_ham"
      },
      "wikiHeroId": "1967",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w1969",
      "name": "Tưởng Uyển",
      "faction": "shu",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 94,
        "vuLuc": 81,
        "triLuc": 102,
        "hp": 2892
      },
      "skillId": "con_thach",
      "skillsByQuality": {
        "white": "con_thach",
        "green": "lac_thach",
        "blue": "quy_ke",
        "purple": "doat_tam",
        "orange": "doat_tam",
        "red": "doat_tam"
      },
      "wikiHeroId": "1969",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w2013",
      "name": "Tỏa Nô",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 87,
        "vuLuc": 97,
        "triLuc": 86,
        "hp": 2766
      },
      "skillId": "phi_xa",
      "skillsByQuality": {
        "white": "phi_xa",
        "green": "lien_no",
        "blue": "hoa_no",
        "purple": "kinh_no",
        "orange": "kinh_no",
        "red": "kinh_no"
      },
      "wikiHeroId": "2013",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w2015",
      "name": "Mê Đương",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 91,
        "vuLuc": 93,
        "triLuc": 79,
        "hp": 2838
      },
      "skillId": "co_vu",
      "skillsByQuality": {
        "white": "co_vu",
        "green": "loi_co",
        "blue": "hieu_trieu",
        "purple": "dinh_quan_co",
        "orange": "dinh_quan_co",
        "red": "dinh_quan_co"
      },
      "wikiHeroId": "2015",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w2018",
      "name": "Tiên Vu Phụ",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 93,
        "vuLuc": 91,
        "triLuc": 84,
        "hp": 2874
      },
      "skillId": "phi_xa",
      "skillsByQuality": {
        "white": "phi_xa",
        "green": "lien_no",
        "blue": "huyet_nhan",
        "purple": "nhue_nhan",
        "orange": "nhue_nhan",
        "red": "nhue_nhan"
      },
      "wikiHeroId": "2018",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w2075",
      "name": "Lục Kháng",
      "faction": "wu",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 100,
        "vuLuc": 78,
        "triLuc": 102,
        "hp": 3000
      },
      "skillId": "am_te",
      "skillsByQuality": {
        "white": "am_te",
        "green": "am_te",
        "blue": "am_te",
        "purple": "hu_thuc",
        "orange": "hu_thuc",
        "red": "hu_thuc"
      },
      "wikiHeroId": "2075",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w2076",
      "name": "Nha Đan",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 89,
        "vuLuc": 81,
        "triLuc": 100,
        "hp": 2802
      },
      "skillId": "am_te",
      "skillsByQuality": {
        "white": "am_te",
        "green": "am_te",
        "blue": "am_te",
        "purple": "hu_thuc",
        "orange": "hu_thuc",
        "red": "hu_thuc"
      },
      "wikiHeroId": "2076",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w2200",
      "name": "Thái Diễm",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "base": {
        "tongLinh": 74,
        "vuLuc": 68,
        "triLuc": 84,
        "hp": 2532
      },
      "skillId": "tuong_dong",
      "skillsByQuality": {
        "white": "tuong_dong",
        "green": "tuong_dong",
        "blue": "truong_ca",
        "purple": "truong_ca",
        "orange": "truong_ca",
        "red": "truong_ca"
      },
      "wikiHeroId": "2200",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w2418",
      "name": "Thẩm Phối",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 90,
        "vuLuc": 70,
        "triLuc": 103,
        "hp": 2820
      },
      "skillId": "thu_ho",
      "skillsByQuality": {
        "white": "thu_ho",
        "green": "han_ve",
        "blue": "bich_luy",
        "purple": "thuan_tuong",
        "orange": "thuan_tuong",
        "red": "thuan_tuong"
      },
      "wikiHeroId": "2418",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w2424",
      "name": "Bùi Nguyên Thiệu",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "base": {
        "tongLinh": 91,
        "vuLuc": 84,
        "triLuc": 74,
        "hp": 2838
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "thiet_thuong",
        "blue": "ba_thuong",
        "purple": "long_thuong",
        "orange": "long_thuong",
        "red": "long_thuong"
      },
      "wikiHeroId": "2424",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w2759",
      "name": "Chu Thương",
      "faction": "shu",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 102,
        "vuLuc": 97,
        "triLuc": 80,
        "hp": 3036
      },
      "skillId": "thiet_bich",
      "skillsByQuality": {
        "white": "thiet_bich",
        "green": "no_thich",
        "blue": "dot_kich",
        "purple": "lien_thich",
        "orange": "xuyen_van_thich",
        "red": "xuyen_van_thich"
      },
      "wikiHeroId": "2759",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "spear"
    },
    {
      "id": "w2760",
      "name": "Chu Nhiên",
      "faction": "wu",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 94,
        "vuLuc": 104,
        "triLuc": 84,
        "hp": 2892
      },
      "skillId": "thu_kich",
      "skillsByQuality": {
        "white": "thu_kich",
        "green": "thiet_no",
        "blue": "hoa_no",
        "purple": "kinh_no",
        "orange": "than_co_no",
        "red": "than_co_no"
      },
      "wikiHeroId": "2760",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w3077",
      "name": "Phan Phượng",
      "faction": "other",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 88,
        "vuLuc": 105,
        "triLuc": 70,
        "hp": 2784
      },
      "skillId": "tu_huy",
      "skillsByQuality": {
        "white": "tu_huy",
        "green": "tu_huy",
        "blue": "tuyet_sat",
        "purple": "khai_son_huyet_phu",
        "orange": "vo_song_thuong_tuong",
        "red": "vo_song_thuong_tuong"
      },
      "wikiHeroId": "3077",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "spear"
    },
    {
      "id": "w3488",
      "name": "Mã Hưu",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 110,
        "vuLuc": 117,
        "triLuc": 89,
        "hp": 3180
      },
      "skillId": "dot_kich",
      "skillsByQuality": {
        "white": "dot_kich",
        "green": "chuoc_gioi",
        "blue": "khi_gioi",
        "purple": "duong_cong",
        "orange": "nhieu_loan_dot_tap",
        "red": "nhieu_loan_dot_tap"
      },
      "wikiHeroId": "3488",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w3531",
      "name": "Vương Nguyên Cơ",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 113,
        "vuLuc": 107,
        "triLuc": 134,
        "hp": 3234
      },
      "skillId": "kich_duong",
      "skillsByQuality": {
        "blue": "kich_duong",
        "purple": "thanh_huy",
        "orange": "giao_nguyet_thanh_huy",
        "red": "giao_nguyet_thanh_huy"
      },
      "wikiHeroId": "3531",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3541",
      "name": "Tào Chương",
      "faction": "wei",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 133,
        "vuLuc": 138,
        "triLuc": 101,
        "hp": 3594
      },
      "skillId": "no_kiem",
      "skillsByQuality": {
        "white": "no_kiem",
        "green": "no_tram",
        "blue": "dang_long",
        "purple": "tinh_ngu",
        "orange": "troi_roi_sao_sang",
        "red": "tinh_van_dia_liep"
      },
      "wikiHeroId": "3541",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w3553",
      "name": "Gia Cát Đản",
      "faction": "other",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 111,
        "vuLuc": 106,
        "triLuc": 116,
        "hp": 3198
      },
      "skillId": "hoa_long",
      "skillsByQuality": {
        "white": "hoa_long",
        "green": "bao_loi",
        "blue": "than_ngu",
        "purple": "an_nghia",
        "orange": "than_huu_mot_phuong",
        "red": "than_huu_mot_phuong"
      },
      "wikiHeroId": "3553",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3557",
      "name": "Trương Ninh",
      "faction": "other",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 129,
        "vuLuc": 106,
        "triLuc": 98,
        "hp": 3522
      },
      "skillId": "xuyen_thich",
      "skillsByQuality": {
        "blue": "xuyen_thich",
        "purple": "hoang_thien_quy_dao",
        "orange": "ngu_hanh_pha_tran",
        "red": "ngu_hanh_pha_tran"
      },
      "wikiHeroId": "3557",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w3603",
      "name": "Văn Ương",
      "faction": "other",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 110,
        "vuLuc": 123,
        "triLuc": 91,
        "hp": 3180
      },
      "skillId": "tat_xung",
      "skillsByQuality": {
        "white": "tat_xung",
        "green": "sat_khi",
        "blue": "xich_long",
        "purple": "viem_long_pha",
        "orange": "viem_long_ky_tap",
        "red": "viem_long_ky_tap"
      },
      "wikiHeroId": "3603",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w3726",
      "name": "Vương Doãn",
      "faction": "other",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 108,
        "vuLuc": 95,
        "triLuc": 125,
        "hp": 3144
      },
      "skillId": "ly_gian",
      "skillsByQuality": {
        "white": "ly_gian",
        "green": "ly_gian",
        "blue": "ban_ly",
        "purple": "me_tran",
        "orange": "cu_ngao_uy_ap",
        "red": "cu_ngao_uy_ap"
      },
      "wikiHeroId": "3726",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3729",
      "name": "Trần Cung",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 117,
        "vuLuc": 92,
        "triLuc": 139,
        "hp": 3306
      },
      "skillId": "dia_liep",
      "skillsByQuality": {
        "white": "dia_liep",
        "green": "dia_nha",
        "blue": "han_bang",
        "purple": "bong_lanh",
        "orange": "bon_be_bua_vay",
        "red": "phong_hac"
      },
      "wikiHeroId": "3729",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3748",
      "name": "Mã Vân Lộc",
      "faction": "shu",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 114,
        "vuLuc": 127,
        "triLuc": 88,
        "hp": 3252
      },
      "skillId": "phi_xa",
      "skillsByQuality": {
        "white": "phi_xa",
        "green": "lien_no",
        "blue": "cung_ma",
        "purple": "doat_tam_tien",
        "orange": "loan_hoi_phuong_vu",
        "red": "loan_hoi_phuong_vu"
      },
      "wikiHeroId": "3748",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w3749",
      "name": "Tào Hồng",
      "faction": "wei",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 111,
        "vuLuc": 111,
        "triLuc": 88,
        "hp": 3198
      },
      "skillId": "hoanh_hoa",
      "skillsByQuality": {
        "white": "hoanh_hoa",
        "green": "san_bang",
        "blue": "ho_chu",
        "purple": "vien_ho",
        "orange": "muc_huyet_ho_chu",
        "red": "muc_huyet_ho_chu"
      },
      "wikiHeroId": "3749",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w3750",
      "name": "Từ Thịnh",
      "faction": "wu",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 117,
        "vuLuc": 123,
        "triLuc": 103,
        "hp": 3306
      },
      "skillId": "lien_hoan",
      "skillsByQuality": {
        "white": "lien_hoan",
        "green": "ten_lac",
        "blue": "tien_tran",
        "purple": "hoa_long_tien",
        "orange": "that_tinh_tien_tran",
        "red": "that_tinh_tien_tran"
      },
      "wikiHeroId": "3750",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w3767",
      "name": "Trương Nghi",
      "faction": "shu",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 107,
        "vuLuc": 125,
        "triLuc": 94,
        "hp": 3126
      },
      "skillId": "am_sat",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "thich_sat",
        "blue": "hanh_thich",
        "purple": "hanh_thich",
        "orange": "am_da_thich_sat",
        "red": "am_da_thich_sat"
      },
      "wikiHeroId": "3767",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w3768",
      "name": "Trần Thái",
      "faction": "wei",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 110,
        "vuLuc": 124,
        "triLuc": 106,
        "hp": 3180
      },
      "skillId": "am_sat",
      "skillsByQuality": {
        "white": "am_sat",
        "green": "thich_sat",
        "blue": "hanh_thich",
        "purple": "hanh_thich",
        "orange": "am_da_thich_sat",
        "red": "am_da_thich_sat"
      },
      "wikiHeroId": "3768",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w3775",
      "name": "Tư Mã Huy",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 122,
        "vuLuc": 126,
        "triLuc": 129,
        "hp": 3396
      },
      "skillId": "kinh_anh_son_ha",
      "skillsByQuality": {
        "orange": "kinh_anh_son_ha",
        "red": "kinh_dien_luan_hoi"
      },
      "wikiHeroId": "3775",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3786",
      "name": "Trương Bao",
      "faction": "shu",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 109,
        "vuLuc": 121,
        "triLuc": 71,
        "hp": 3162
      },
      "skillId": "ho_khieu",
      "skillsByQuality": {
        "white": "ho_khieu",
        "green": "su_hong",
        "blue": "cuong_hao",
        "purple": "de_hon",
        "orange": "pha_dam_no_hong",
        "red": "pha_dam_no_hong"
      },
      "wikiHeroId": "3786",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w3787",
      "name": "Phan Chương",
      "faction": "wu",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 110,
        "vuLuc": 117,
        "triLuc": 83,
        "hp": 3180
      },
      "skillId": "ho_khieu",
      "skillsByQuality": {
        "white": "ho_khieu",
        "green": "su_hong",
        "blue": "cuong_hao",
        "purple": "de_hon",
        "orange": "pha_dam_no_hong",
        "red": "pha_dam_no_hong"
      },
      "wikiHeroId": "3787",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w3789",
      "name": "Lư Thực",
      "faction": "other",
      "quality": "orange",
      "troop": "archer",
      "base": {
        "tongLinh": 114,
        "vuLuc": 97,
        "triLuc": 110,
        "hp": 3252
      },
      "skillId": "bai_nhieu",
      "skillsByQuality": {
        "white": "bai_nhieu",
        "green": "giai_nan",
        "blue": "giai_tru",
        "purple": "phan_ke",
        "orange": "nho_thanh_ho_the",
        "red": "nho_thanh_ho_the"
      },
      "wikiHeroId": "3789",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3802",
      "name": "Vương Dị",
      "faction": "other",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 94,
        "vuLuc": 82,
        "triLuc": 120,
        "hp": 2892
      },
      "skillId": "tri_lieu",
      "skillsByQuality": {
        "white": "tri_lieu",
        "green": "tri_du",
        "blue": "tri_du",
        "purple": "du_hop",
        "orange": "mua_han",
        "red": "mua_han"
      },
      "wikiHeroId": "3802",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3816",
      "name": "Mã Lương",
      "faction": "shu",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 107,
        "vuLuc": 97,
        "triLuc": 123,
        "hp": 3126
      },
      "skillId": "dia_liep",
      "skillsByQuality": {
        "white": "dia_liep",
        "green": "dia_nha",
        "blue": "bang_chuy",
        "purple": "bang_phong",
        "orange": "thien_ly_bang_phong",
        "red": "thien_ly_bang_phong"
      },
      "wikiHeroId": "3816",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3817",
      "name": "Cố Ung",
      "faction": "wu",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 103,
        "vuLuc": 93,
        "triLuc": 122,
        "hp": 3054
      },
      "skillId": "dia_liep",
      "skillsByQuality": {
        "white": "dia_liep",
        "green": "dia_nha",
        "blue": "bang_chuy",
        "purple": "bang_phong",
        "orange": "thien_ly_bang_phong",
        "red": "thien_ly_bang_phong"
      },
      "wikiHeroId": "3817",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3824",
      "name": "Trương Trọng Cảnh",
      "faction": "other",
      "quality": "orange",
      "troop": "archer",
      "base": {
        "tongLinh": 110,
        "vuLuc": 89,
        "triLuc": 131,
        "hp": 3180
      },
      "skillId": "ly_gian",
      "skillsByQuality": {
        "white": "ly_gian",
        "green": "phien_dong",
        "blue": "muu_thu",
        "purple": "loan_the_pho_do",
        "orange": "kim_quy_yeu_luoc",
        "red": "kim_quy_yeu_luoc"
      },
      "wikiHeroId": "3824",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3840",
      "name": "Tư Mã Viêm",
      "faction": "other",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 101,
        "vuLuc": 77,
        "triLuc": 112,
        "hp": 3018
      },
      "skillId": "toa_hon",
      "skillsByQuality": {
        "blue": "toa_hon",
        "purple": "am_van",
        "orange": "thau_tom_thien_ha",
        "red": "thau_tom_thien_ha"
      },
      "wikiHeroId": "3840",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3841",
      "name": "Tư Mã Chiêu",
      "faction": "other",
      "quality": "orange",
      "troop": "archer",
      "base": {
        "tongLinh": 106,
        "vuLuc": 91,
        "triLuc": 124,
        "hp": 3108
      },
      "skillId": "doc_chu",
      "skillsByQuality": {
        "white": "doc_chu",
        "green": "tru_tam",
        "blue": "toa_hon",
        "purple": "am_van",
        "orange": "vuong_trieu_tan_ra",
        "red": "vuong_trieu_tan_ra"
      },
      "wikiHeroId": "3841",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3853",
      "name": "Gia Cát Khác",
      "faction": "wu",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 94,
        "vuLuc": 95,
        "triLuc": 128,
        "hp": 2892
      },
      "skillId": "son_bang",
      "skillsByQuality": {
        "white": "son_bang",
        "green": "thap_thien",
        "blue": "thien_bang",
        "purple": "liet_thien",
        "orange": "troi_tru_dat_diet",
        "red": "troi_tru_dat_diet"
      },
      "wikiHeroId": "3853",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3854",
      "name": "Trình Dục",
      "faction": "wei",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 104,
        "vuLuc": 87,
        "triLuc": 126,
        "hp": 3072
      },
      "skillId": "son_bang",
      "skillsByQuality": {
        "white": "son_bang",
        "green": "thap_thien",
        "blue": "thien_bang",
        "purple": "liet_thien",
        "orange": "troi_tru_dat_diet",
        "red": "troi_tru_dat_diet"
      },
      "wikiHeroId": "3854",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3855",
      "name": "Tư Mã Du",
      "faction": "other",
      "quality": "orange",
      "troop": "archer",
      "base": {
        "tongLinh": 107,
        "vuLuc": 87,
        "triLuc": 122,
        "hp": 3126
      },
      "skillId": "nhuc_ma",
      "skillsByQuality": {
        "white": "nhuc_ma",
        "green": "nhuc_ma",
        "blue": "xua_duoi",
        "purple": "xua_duoi",
        "orange": "thanh_nha_can_chinh",
        "red": "thanh_nha_can_chinh"
      },
      "wikiHeroId": "3855",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3943",
      "name": "Lữ Mông",
      "faction": "wu",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 107,
        "vuLuc": 121,
        "triLuc": 115,
        "hp": 3126
      },
      "skillId": "ngu_giap",
      "skillsByQuality": {
        "white": "ngu_giap",
        "green": "ngu_giap",
        "blue": "than_ngu",
        "purple": "bach_y_do_giang",
        "orange": "bach_y_pha_lang",
        "red": "bach_y_pha_lang"
      },
      "wikiHeroId": "3943",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w3945",
      "name": "Trương Nhiệm",
      "faction": "other",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 104,
        "vuLuc": 123,
        "triLuc": 92,
        "hp": 3072
      },
      "skillId": "tien_vu",
      "skillsByQuality": {
        "white": "tien_vu",
        "green": "ten_lac",
        "blue": "hoa_tien",
        "purple": "tien_lam",
        "orange": "than_tien_ho_chu",
        "red": "than_tien_ho_chu"
      },
      "wikiHeroId": "3945",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w3958",
      "name": "Mao Giới",
      "faction": "wei",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 96,
        "vuLuc": 81,
        "triLuc": 114,
        "hp": 2928
      },
      "skillId": "khich_le",
      "skillsByQuality": {
        "white": "khich_le",
        "green": "khich_le",
        "blue": "thi_doc",
        "purple": "thuc_tam",
        "orange": "quy_mon_thi_doc",
        "red": "quy_mon_thi_doc"
      },
      "wikiHeroId": "3958",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3959",
      "name": "Y Tịch",
      "faction": "shu",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 94,
        "vuLuc": 82,
        "triLuc": 113,
        "hp": 2892
      },
      "skillId": "khich_le",
      "skillsByQuality": {
        "white": "khich_le",
        "green": "khich_le",
        "blue": "thi_doc",
        "purple": "thuc_tam",
        "orange": "quy_mon_thi_doc",
        "red": "quy_mon_thi_doc"
      },
      "wikiHeroId": "3959",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3960",
      "name": "Chu Trị",
      "faction": "wu",
      "quality": "orange",
      "troop": "archer",
      "base": {
        "tongLinh": 102,
        "vuLuc": 88,
        "triLuc": 106,
        "hp": 3036
      },
      "skillId": "khich_le",
      "skillsByQuality": {
        "white": "khich_le",
        "green": "khich_le",
        "blue": "thi_doc",
        "purple": "thuc_tam",
        "orange": "quy_mon_thi_doc",
        "red": "quy_mon_thi_doc"
      },
      "wikiHeroId": "3960",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3972",
      "name": "Phục Thọ",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 109,
        "vuLuc": 100,
        "triLuc": 131,
        "hp": 3162
      },
      "skillId": "xua_duoi",
      "skillsByQuality": {
        "blue": "xua_duoi",
        "purple": "xua_duoi",
        "orange": "hien_thuc_luu_phuong",
        "red": "hien_thuc_luu_phuong"
      },
      "wikiHeroId": "3972",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3973",
      "name": "Tào Tiết",
      "faction": "wei",
      "quality": "red",
      "troop": "cavalry",
      "base": {
        "tongLinh": 137,
        "vuLuc": 124,
        "triLuc": 104,
        "hp": 3666
      },
      "skillId": "lac_nhat_than_tien",
      "skillsByQuality": {
        "orange": "lac_nhat_than_tien",
        "red": "lac_nhat_than_tien"
      },
      "wikiHeroId": "3973",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w3974",
      "name": "Trương Tinh Thái",
      "faction": "shu",
      "quality": "red",
      "troop": "spear",
      "base": {
        "tongLinh": 117,
        "vuLuc": 134,
        "triLuc": 103,
        "hp": 3306
      },
      "skillId": "lung_hoan_tang_dich",
      "skillsByQuality": {
        "orange": "lung_hoan_tang_dich",
        "red": "lung_hoan_tang_dich"
      },
      "wikiHeroId": "3974",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w3975",
      "name": "Bộ Luyện Sư",
      "faction": "wu",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 124,
        "vuLuc": 91,
        "triLuc": 138,
        "hp": 3432
      },
      "skillId": "kinh_thien_bao_loi",
      "skillsByQuality": {
        "orange": "kinh_thien_bao_loi",
        "red": "kinh_thien_bao_loi"
      },
      "wikiHeroId": "3975",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w3976",
      "name": "Trương Xuân Hoa",
      "faction": "other",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 101,
        "vuLuc": 78,
        "triLuc": 122,
        "hp": 3018
      },
      "skillId": "cong_tam",
      "skillsByQuality": {
        "green": "cong_tam",
        "blue": "cong_tam",
        "purple": "ly_gian",
        "orange": "tuyet_tinh_vo_hoi",
        "red": "tuyet_tinh_vo_hoi"
      },
      "wikiHeroId": "3976",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w3985",
      "name": "Chu Hoàn",
      "faction": "wu",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 113,
        "vuLuc": 122,
        "triLuc": 108,
        "hp": 3234
      },
      "skillId": "pha_quan",
      "skillsByQuality": {
        "white": "pha_quan",
        "green": "thi_quan",
        "blue": "ky_than",
        "purple": "phong_loi",
        "orange": "te_nhat_thien_ky",
        "red": "te_nhat_thien_ky"
      },
      "wikiHeroId": "3985",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w3986",
      "name": "Trương Tú",
      "faction": "other",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 120,
        "vuLuc": 98,
        "triLuc": 88,
        "hp": 3360
      },
      "skillId": "kich_thich",
      "skillsByQuality": {
        "white": "kich_thich",
        "green": "bac_kich",
        "blue": "thi_huyet",
        "purple": "ma_quan",
        "orange": "huyet_ach_su",
        "red": "huyet_ach_su"
      },
      "wikiHeroId": "3986",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w4000",
      "name": "Công Tôn Tu",
      "faction": "other",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 124,
        "vuLuc": 98,
        "triLuc": 83,
        "hp": 3432
      },
      "skillId": "thiet_thuong",
      "skillsByQuality": {
        "white": "thiet_thuong",
        "green": "dia_thich",
        "blue": "cot_thich",
        "purple": "diem_la_kich",
        "orange": "nghich_chuyen_sinh_tu",
        "red": "nghich_chuyen_sinh_tu"
      },
      "wikiHeroId": "4000",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w4001",
      "name": "Thái Văn Cơ",
      "faction": "other",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 101,
        "vuLuc": 91,
        "triLuc": 113,
        "hp": 3018
      },
      "skillId": "bai_ca_bien_ai",
      "skillsByQuality": {
        "orange": "bai_ca_bien_ai",
        "red": "bai_ca_bien_ai"
      },
      "wikiHeroId": "4001",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4036",
      "name": "Củng Chí",
      "faction": "other",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 87,
        "vuLuc": 84,
        "triLuc": 100,
        "hp": 2766
      },
      "skillId": "huyet_che",
      "skillsByQuality": {
        "white": "huyet_che",
        "green": "huyet_che",
        "blue": "kim_ham",
        "purple": "sach_phan",
        "orange": "bo_toi_theo_sang",
        "red": "bo_toi_theo_sang"
      },
      "wikiHeroId": "4036",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4038",
      "name": "Đồng Uyên",
      "faction": "other",
      "quality": "orange",
      "troop": "spear",
      "base": {
        "tongLinh": 122,
        "vuLuc": 128,
        "triLuc": 96,
        "hp": 3396
      },
      "skillId": "phi_long_tai_thien",
      "skillsByQuality": {
        "orange": "phi_long_tai_thien",
        "red": "phi_long_tai_thien"
      },
      "wikiHeroId": "4038",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w4063",
      "name": "Tôn Càn",
      "faction": "shu",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 92,
        "vuLuc": 86,
        "triLuc": 111,
        "hp": 2856
      },
      "skillId": "tri_lieu",
      "skillsByQuality": {
        "white": "tri_lieu",
        "green": "tri_lieu",
        "blue": "bich_luy",
        "purple": "thuan_tuong",
        "orange": "vung_nhu_ban_thach",
        "red": "vung_nhu_ban_thach"
      },
      "wikiHeroId": "4063",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w4066",
      "name": "Mãn Sủng",
      "faction": "wei",
      "quality": "orange",
      "troop": "cavalry",
      "base": {
        "tongLinh": 107,
        "vuLuc": 94,
        "triLuc": 114,
        "hp": 3126
      },
      "skillId": "thu_ho",
      "skillsByQuality": {
        "white": "thu_ho",
        "green": "han_ve",
        "blue": "bich_luy",
        "purple": "thuan_tuong",
        "orange": "vung_nhu_ban_thach",
        "red": "vung_nhu_ban_thach"
      },
      "wikiHeroId": "4066",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4070",
      "name": "Lữ Linh Khởi",
      "faction": "other",
      "quality": "orange",
      "troop": "infantry",
      "base": {
        "tongLinh": 109,
        "vuLuc": 128,
        "triLuc": 102,
        "hp": 3162
      },
      "skillId": "ky_kich",
      "skillsByQuality": {
        "white": "ky_kich",
        "green": "ky_liep",
        "blue": "ky_xa",
        "purple": "phi_ngua_giuong_cung",
        "orange": "tru_than_diet_ma",
        "red": "tru_than_diet_ma"
      },
      "wikiHeroId": "4070",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w4079",
      "name": "Tào Thực",
      "faction": "wei",
      "quality": "red",
      "troop": "spear",
      "base": {
        "tongLinh": 100,
        "vuLuc": 107,
        "triLuc": 131,
        "hp": 3000
      },
      "skillId": "phan_chan",
      "skillsByQuality": {
        "white": "phan_chan",
        "green": "kich_duong",
        "blue": "ngang_duong",
        "purple": "tung_ca",
        "orange": "phan_chan_long_quan",
        "red": "ca_tung_cong_duc"
      },
      "wikiHeroId": "4079",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4081",
      "name": "Giản Ung",
      "faction": "shu",
      "quality": "red",
      "troop": "archer",
      "base": {
        "tongLinh": 108,
        "vuLuc": 100,
        "triLuc": 129,
        "hp": 3144
      },
      "skillId": "phan_chan",
      "skillsByQuality": {
        "white": "phan_chan",
        "green": "kich_duong",
        "blue": "ngang_duong",
        "purple": "tung_ca",
        "orange": "phan_chan_long_quan",
        "red": "ca_tung_cong_duc"
      },
      "wikiHeroId": "4081",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4083",
      "name": "Tả Từ",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 91,
        "vuLuc": 133,
        "triLuc": 145,
        "hp": 2838
      },
      "skillId": "tan_ra",
      "skillsByQuality": {
        "blue": "tan_ra",
        "purple": "pha_hoang_sach",
        "orange": "thien_dia_vo_cuc",
        "red": "can_khon_ta_phap"
      },
      "wikiHeroId": "4083",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4084",
      "name": "Mạnh Hoạch",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 137,
        "vuLuc": 120,
        "triLuc": 89,
        "hp": 3666
      },
      "skillId": "cuong_bao",
      "skillsByQuality": {
        "white": "cuong_bao",
        "green": "chien_cuong",
        "blue": "thi_huyet",
        "purple": "cuong_no",
        "orange": "di_toc_xam_nhap",
        "red": "dai_vuong_than_chinh"
      },
      "wikiHeroId": "4084",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "spear"
    },
    {
      "id": "w4085",
      "name": "Chúc Dung",
      "faction": "other",
      "quality": "red",
      "troop": "cavalry",
      "base": {
        "tongLinh": 141,
        "vuLuc": 116,
        "triLuc": 100,
        "hp": 3738
      },
      "skillId": "doc_nhan",
      "skillsByQuality": {
        "white": "doc_nhan",
        "green": "xa_thich",
        "blue": "liet_nhan",
        "purple": "phan_thien",
        "orange": "hong_hoang_no_hoa",
        "red": "than_hoa_hien_the"
      },
      "wikiHeroId": "4085",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w4099",
      "name": "Hoàng Nguyệt Anh",
      "faction": "shu",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 110,
        "vuLuc": 106,
        "triLuc": 138,
        "hp": 3180
      },
      "skillId": "am_te",
      "skillsByQuality": {
        "white": "am_te",
        "green": "am_te",
        "blue": "am_te",
        "purple": "lac_thuy_tien",
        "orange": "khuynh_the_giai_nhan",
        "red": "vu_dieu_lac_than"
      },
      "wikiHeroId": "4099",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4101",
      "name": "Chân Cơ",
      "faction": "wei",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 126,
        "vuLuc": 103,
        "triLuc": 126,
        "hp": 3468
      },
      "skillId": "am_te",
      "skillsByQuality": {
        "white": "am_te",
        "green": "am_te",
        "blue": "am_te",
        "purple": "lac_thuy_tien",
        "orange": "khuynh_the_giai_nhan",
        "red": "vu_dieu_lac_than"
      },
      "wikiHeroId": "4101",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4127",
      "name": "Điêu Thuyền",
      "faction": "other",
      "quality": "red",
      "troop": "archer",
      "base": {
        "tongLinh": 112,
        "vuLuc": 106,
        "triLuc": 123,
        "hp": 3216
      },
      "skillId": "ly_gian",
      "skillsByQuality": {
        "white": "ly_gian",
        "green": "tan_ca",
        "blue": "khuynh_quoc",
        "purple": "be_nguyet",
        "orange": "thien_vu_khuynh_thanh",
        "red": "nghe_thuong_thien_vu"
      },
      "wikiHeroId": "4127",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4141",
      "name": "Mã Tốc",
      "faction": "shu",
      "quality": "red",
      "troop": "archer",
      "base": {
        "tongLinh": 101,
        "vuLuc": 101,
        "triLuc": 137,
        "hp": 3018
      },
      "skillId": "hong_viem",
      "skillsByQuality": {
        "white": "hong_viem",
        "green": "hac_viem",
        "blue": "nhien_tan",
        "purple": "thien_hoa_thieu",
        "orange": "hoa_the_ngut_troi",
        "red": "xich_lua_tri_tue"
      },
      "wikiHeroId": "4141",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4142",
      "name": "Bàng Đức",
      "faction": "wei",
      "quality": "red",
      "troop": "spear",
      "base": {
        "tongLinh": 118,
        "vuLuc": 138,
        "triLuc": 96,
        "hp": 3324
      },
      "skillId": "nghich_tap",
      "skillsByQuality": {
        "white": "nghich_tap",
        "green": "dong_xoay",
        "blue": "lang_tuyen",
        "purple": "to_luu_nghich_tap",
        "orange": "lung_hoan_tang_dich",
        "red": "lang_tuyen_khon_tran"
      },
      "wikiHeroId": "4142",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "cavalry"
    },
    {
      "id": "w4149",
      "name": "Lưu Thiện",
      "faction": "shu",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 138,
        "vuLuc": 86,
        "triLuc": 128,
        "hp": 3684
      },
      "skillId": "tu_sanh",
      "skillsByQuality": {
        "white": "tu_sanh",
        "green": "tu_sanh",
        "blue": "yeu_giap",
        "purple": "yeu_giap",
        "orange": "tran_dinh_son_ha",
        "red": "thinh_the_vuong_quyen"
      },
      "wikiHeroId": "4149",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w4152",
      "name": "Tào Duệ",
      "faction": "wei",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 117,
        "vuLuc": 129,
        "triLuc": 132,
        "hp": 3306
      },
      "skillId": "tran_dinh_son_ha",
      "skillsByQuality": {
        "orange": "tran_dinh_son_ha",
        "red": "thinh_the_vuong_quyen"
      },
      "wikiHeroId": "4152",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w4155",
      "name": "Tôn Lượng",
      "faction": "wu",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 110,
        "vuLuc": 103,
        "triLuc": 139,
        "hp": 3180
      },
      "skillId": "tran_dinh_son_ha",
      "skillsByQuality": {
        "orange": "tran_dinh_son_ha",
        "red": "thinh_the_vuong_quyen"
      },
      "wikiHeroId": "4155",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true
    },
    {
      "id": "w4171",
      "name": "Tôn Thượng Hương",
      "faction": "wu",
      "quality": "red",
      "troop": "archer",
      "base": {
        "tongLinh": 136,
        "vuLuc": 122,
        "triLuc": 95,
        "hp": 3648
      },
      "skillId": "loi_tien",
      "skillsByQuality": {
        "white": "loi_tien",
        "green": "loi_tien",
        "blue": "nghe_xa",
        "purple": "truy_nguyet",
        "orange": "lac_nhat_than_tien",
        "red": "xich_vu_quan_hong"
      },
      "wikiHeroId": "4171",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "spear"
    },
    {
      "id": "w4173",
      "name": "Đặng Ngải",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 129,
        "vuLuc": 132,
        "triLuc": 130,
        "hp": 3522
      },
      "skillId": "long_minh",
      "skillsByQuality": {
        "white": "long_minh",
        "green": "long_uy",
        "blue": "no_long",
        "purple": "than_binh_xuat_hien",
        "orange": "than_binh_am_do",
        "red": "ky_binh_pha_thuc"
      },
      "wikiHeroId": "4173",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w4205",
      "name": "Chung Hội",
      "faction": "other",
      "quality": "red",
      "troop": "archer",
      "base": {
        "tongLinh": 121,
        "vuLuc": 101,
        "triLuc": 137,
        "hp": 3378
      },
      "skillId": "ly_gian",
      "skillsByQuality": {
        "white": "ly_gian",
        "green": "phien_dong",
        "blue": "muu_thu",
        "purple": "loan_the_muu",
        "orange": "cu_cong_ngao_thuong",
        "red": "gia_chieu_cu_binh"
      },
      "wikiHeroId": "4205",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4206",
      "name": "Cao Lãm",
      "faction": "other",
      "quality": "red",
      "troop": "spear",
      "base": {
        "tongLinh": 137,
        "vuLuc": 119,
        "triLuc": 88,
        "hp": 3666
      },
      "skillId": "phan_kich",
      "skillsByQuality": {
        "white": "phan_kich",
        "green": "nghich_chuyen",
        "blue": "huyet_tram",
        "purple": "pha_dich",
        "orange": "thong_quan_pha_dich",
        "red": "bay_tran_nhu_nui"
      },
      "wikiHeroId": "4206",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w4207",
      "name": "Văn Sính",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 116,
        "vuLuc": 133,
        "triLuc": 105,
        "hp": 3288
      },
      "skillId": "ky_kich",
      "skillsByQuality": {
        "white": "ky_kich",
        "green": "don_ky",
        "blue": "cuu_vien",
        "purple": "tran_hon",
        "orange": "che_ngu_quan_dich",
        "red": "tran_thu_han_thuy"
      },
      "wikiHeroId": "4207",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "archer"
    },
    {
      "id": "w4231",
      "name": "Văn Phượng Khanh",
      "faction": "other",
      "quality": "red",
      "troop": "archer",
      "base": {
        "tongLinh": 116,
        "vuLuc": 97,
        "triLuc": 126,
        "hp": 3288
      },
      "skillId": "thu_ho",
      "skillsByQuality": {
        "white": "thu_ho",
        "green": "bao_ho",
        "blue": "cau_phuc",
        "purple": "chien_ca",
        "orange": "song_sao_ruc_ro",
        "red": "bi_ngan_tinh_kieu"
      },
      "wikiHeroId": "4231",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4232",
      "name": "Vu Cát",
      "faction": "other",
      "quality": "red",
      "troop": "infantry",
      "base": {
        "tongLinh": 95,
        "vuLuc": 129,
        "triLuc": 147,
        "hp": 2910
      },
      "skillId": "bua_phep_tran_ta",
      "skillsByQuality": {
        "orange": "bua_phep_tran_ta",
        "red": "dao_thuat_huyen_thong"
      },
      "wikiHeroId": "4232",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    },
    {
      "id": "w4248",
      "name": "Hoa Đà",
      "faction": "other",
      "quality": "red",
      "troop": "archer",
      "base": {
        "tongLinh": 114,
        "vuLuc": 95,
        "triLuc": 122,
        "hp": 3252
      },
      "skillId": "cam_vu",
      "skillsByQuality": {
        "white": "cam_vu",
        "green": "cam_vu",
        "blue": "cam_vu",
        "purple": "nhan_y",
        "orange": "thanh_thu_te_the",
        "red": "huyen_ho_te_chung"
      },
      "wikiHeroId": "4248",
      "tags": [
        "wiki"
      ],
      "obtain": "wiki",
      "npcOnly": true,
      "troop2": "strategist"
    }
  ]
},
"recruit": {
  "schemaVersion": 3,
  "cost": {
    "white": {
      "silver": 50,
      "food": 20
    },
    "green": {
      "silver": 120,
      "food": 40
    },
    "blue": {
      "silver": 280,
      "food": 80
    },
    "purple": {
      "silver": 600,
      "food": 150,
      "gold": 1
    },
    "orange": {
      "silver": 1200,
      "food": 300,
      "gold": 5
    },
    "red": {
      "silver": 2500,
      "food": 500,
      "gold": 15
    }
  },
  "dailyFree": 3,
  "pools": {
    "white": [
      "recruit_guard",
      "recruit_scout",
      "recruit_militia",
      "recruit_porter"
    ],
    "green": [
      "recruit_rider",
      "recruit_spearman",
      "recruit_crossbow",
      "recruit_blade",
      "liaohua",
      "chengpu",
      "handang"
    ],
    "blue": [
      "veteran_guard",
      "veteran_rider",
      "veteran_spear",
      "veteran_archer",
      "liufeng",
      "guanying",
      "zhangbao_shu",
      "madai",
      "wangping",
      "yuejin",
      "licadian",
      "zhouzhi",
      "lingtong",
      "zhugejin",
      "zhangzhao",
      "huanggai"
    ],
    "purple": [
      "pangtong",
      "weiyan",
      "fazheng",
      "xushu",
      "jiaxu",
      "xuhuang",
      "zhanghe",
      "xunyu",
      "xunyou",
      "caoren",
      "xiahou_yuan",
      "taishici",
      "ganning",
      "lusu",
      "xiaoqiao",
      "sunjian",
      "elite_vanguard",
      "elite_raider"
    ],
    "orange": [
      "huangzhong",
      "machao",
      "jiangwei",
      "xuchu",
      "dianwei",
      "zhangliao",
      "guojia",
      "caopi",
      "xiahou_dun",
      "luxun",
      "sunce",
      "sunquan"
    ],
    "red": [
      "guanyu",
      "zhaoyun",
      "zhugeliang",
      "caocao",
      "simayi",
      "zhouyu"
    ]
  },
  "note": "Chỉ general !npcOnly. Weight theo qualities.recruitWeight khi random phẩm.",
  "maxHeroSlotsBase": 8,
  "maxHeroSlotsPerTyVu": 1,
  "list": [
    {
      "recruit_id": "rec_001",
      "hero_id": "liubei",
      "hero_alias": "h_002",
      "name": "Lưu Bị",
      "faction": "shu",
      "quality": "orange",
      "troop": "infantry",
      "source": "prestige",
      "cost_silver": 39550,
      "required_prestige": 3500,
      "required_player_level": 14,
      "required_ty_vu_level": 10,
      "required_stage": "ch2_s6",
      "note": "Ngọa Long gốc: minh chủ mở muộn theo uy danh."
    },
    {
      "recruit_id": "rec_002",
      "hero_id": "guanyu",
      "hero_alias": "h_001",
      "name": "Quan Vũ",
      "faction": "shu",
      "quality": "red",
      "troop": "cavalry",
      "source": "prestige",
      "cost_silver": 50000,
      "required_prestige": 5000,
      "required_player_level": 16,
      "required_ty_vu_level": 12,
      "required_stage": "ch3_s4",
      "note": "Danh tướng đỏ — không mở đầu."
    },
    {
      "recruit_id": "rec_003",
      "hero_id": "zhangfei",
      "hero_alias": "h_003",
      "name": "Trương Phi",
      "faction": "shu",
      "quality": "orange",
      "troop": "infantry",
      "source": "prestige",
      "cost_silver": 36400,
      "required_prestige": 3500,
      "required_player_level": 14,
      "required_ty_vu_level": 10,
      "required_stage": "ch2_s6"
    },
    {
      "recruit_id": "rec_004",
      "hero_id": "zhaoyun",
      "hero_alias": "h_004",
      "name": "Triệu Vân",
      "faction": "shu",
      "quality": "red",
      "troop": "cavalry",
      "source": "campaign_defeat",
      "cost_silver": 72000,
      "required_prestige": 1200,
      "required_player_level": 12,
      "required_ty_vu_level": 8,
      "required_stage": "ch3_s3",
      "note": "Thường nhận free khi first-clear ch3_s3 (Thục); Tửu Quán là đường dự phòng."
    },
    {
      "recruit_id": "rec_005",
      "hero_id": "zhugeliang",
      "hero_alias": "h_005",
      "name": "Gia Cát Lượng",
      "faction": "shu",
      "quality": "red",
      "troop": "archer",
      "source": "campaign_defeat",
      "cost_silver": 63600,
      "required_prestige": 5000,
      "required_player_level": 18,
      "required_ty_vu_level": 12,
      "required_stage": "ch3_s6",
      "note": "Ngọa Long: danh tướng muộn — sau chính tuyến v1."
    },
    {
      "recruit_id": "rec_006",
      "hero_id": "huangzhong",
      "hero_alias": "h_006",
      "name": "Hoàng Trung",
      "faction": "shu",
      "quality": "orange",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 36400,
      "required_prestige": 2000,
      "required_player_level": 14,
      "required_ty_vu_level": 10,
      "required_stage": "ch2_s5"
    },
    {
      "recruit_id": "rec_007",
      "hero_id": "machao",
      "hero_alias": "h_007",
      "name": "Mã Siêu",
      "faction": "shu",
      "quality": "orange",
      "troop": "cavalry",
      "source": "prestige",
      "cost_silver": 36400,
      "required_prestige": 2000,
      "required_player_level": 14,
      "required_ty_vu_level": 10,
      "required_stage": "ch2_s5"
    },
    {
      "recruit_id": "rec_008",
      "hero_id": "pangtong",
      "hero_alias": "h_008",
      "name": "Bàng Thống",
      "faction": "shu",
      "quality": "purple",
      "troop": "archer",
      "source": "campaign_defeat",
      "cost_silver": 14700,
      "required_prestige": 800,
      "required_player_level": 10,
      "required_ty_vu_level": 7,
      "required_stage": "ch3_s6",
      "note": "First-clear ch3_s6 (Thục) thường đã thu phục."
    },
    {
      "recruit_id": "rec_009",
      "hero_id": "weiyan",
      "hero_alias": "h_009",
      "name": "Ngụy Diên",
      "faction": "shu",
      "quality": "purple",
      "troop": "spear",
      "source": "prestige",
      "cost_silver": 15300,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_010",
      "hero_id": "liufeng",
      "hero_alias": "h_010",
      "name": "Lưu Phong",
      "faction": "shu",
      "quality": "blue",
      "troop": "infantry",
      "source": "tavern",
      "cost_silver": 4300,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_011",
      "hero_id": "guanying",
      "hero_alias": "h_011",
      "name": "Quan Bình",
      "faction": "shu",
      "quality": "blue",
      "troop": "cavalry",
      "source": "tavern",
      "cost_silver": 4350,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_012",
      "hero_id": "zhangbao_shu",
      "hero_alias": "h_012",
      "name": "Trương Bào",
      "faction": "shu",
      "quality": "blue",
      "troop": "infantry",
      "source": "tavern",
      "cost_silver": 4250,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_013",
      "hero_id": "jiangwei",
      "hero_alias": "h_013",
      "name": "Khương Duy",
      "faction": "shu",
      "quality": "orange",
      "troop": "spear",
      "source": "campaign_defeat",
      "cost_silver": 42350,
      "required_prestige": 800,
      "required_player_level": 14,
      "required_ty_vu_level": 7,
      "required_stage": "ch2_s3"
    },
    {
      "recruit_id": "rec_014",
      "hero_id": "fazheng",
      "hero_alias": "h_014",
      "name": "Pháp Chính",
      "faction": "shu",
      "quality": "purple",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 14850,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_015",
      "hero_id": "xushu",
      "hero_alias": "h_015",
      "name": "Từ Thứ",
      "faction": "shu",
      "quality": "purple",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 15150,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_016",
      "hero_id": "madai",
      "hero_alias": "h_016",
      "name": "Mã Đại",
      "faction": "shu",
      "quality": "blue",
      "troop": "cavalry",
      "source": "tavern",
      "cost_silver": 4450,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_017",
      "hero_id": "liaohua",
      "hero_alias": "h_017",
      "name": "Liêu Hóa",
      "faction": "shu",
      "quality": "green",
      "troop": "spear",
      "source": "tavern",
      "cost_silver": 1550,
      "required_prestige": 40,
      "required_player_level": 2,
      "required_ty_vu_level": 2,
      "required_stage": null
    },
    {
      "recruit_id": "rec_018",
      "hero_id": "wangping",
      "hero_alias": "h_018",
      "name": "Vương Bình",
      "faction": "shu",
      "quality": "blue",
      "troop": "infantry",
      "source": "tavern",
      "cost_silver": 4650,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_019",
      "hero_id": "caocao",
      "hero_alias": "h_019",
      "name": "Tào Tháo",
      "faction": "wei",
      "quality": "red",
      "troop": "cavalry",
      "source": "prestige",
      "cost_silver": 75000,
      "required_prestige": 5000,
      "required_player_level": 16,
      "required_ty_vu_level": 12,
      "required_stage": "ch3_s4"
    },
    {
      "recruit_id": "rec_020",
      "hero_id": "simayi",
      "hero_alias": "h_020",
      "name": "Tư Mã Ý",
      "faction": "wei",
      "quality": "red",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 65400,
      "required_prestige": 3500,
      "required_player_level": 20,
      "required_ty_vu_level": 15,
      "required_stage": "ch2_s5"
    },
    {
      "recruit_id": "rec_021",
      "hero_id": "xuchu",
      "hero_alias": "h_021",
      "name": "Hứa Chử",
      "faction": "wei",
      "quality": "orange",
      "troop": "infantry",
      "source": "prestige",
      "cost_silver": 32900,
      "required_prestige": 2000,
      "required_player_level": 12,
      "required_ty_vu_level": 8,
      "required_stage": "ch2_s3"
    },
    {
      "recruit_id": "rec_022",
      "hero_id": "dianwei",
      "hero_alias": "h_022",
      "name": "Điển Vi",
      "faction": "wei",
      "quality": "orange",
      "troop": "infantry",
      "source": "prestige",
      "cost_silver": 33950,
      "required_prestige": 2000,
      "required_player_level": 12,
      "required_ty_vu_level": 8,
      "required_stage": "ch2_s3"
    },
    {
      "recruit_id": "rec_023",
      "hero_id": "jiaxu",
      "hero_alias": "h_023",
      "name": "Giả Hủ",
      "faction": "wei",
      "quality": "purple",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 15000,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_024",
      "hero_id": "zhangliao",
      "hero_alias": "h_024",
      "name": "Trương Liêu",
      "faction": "wei",
      "quality": "orange",
      "troop": "cavalry",
      "source": "prestige",
      "cost_silver": 40600,
      "required_prestige": 1500,
      "required_player_level": 14,
      "required_ty_vu_level": 10,
      "required_stage": "ch1_s6"
    },
    {
      "recruit_id": "rec_025",
      "hero_id": "xuhuang",
      "hero_alias": "h_025",
      "name": "Từ Hoảng",
      "faction": "wei",
      "quality": "purple",
      "troop": "spear",
      "source": "prestige",
      "cost_silver": 16500,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_026",
      "hero_id": "zhanghe",
      "hero_alias": "h_026",
      "name": "Trương Cáp",
      "faction": "wei",
      "quality": "purple",
      "troop": "cavalry",
      "source": "prestige",
      "cost_silver": 16800,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_027",
      "hero_id": "yuejin",
      "hero_alias": "h_027",
      "name": "Nhạc Tiến",
      "faction": "wei",
      "quality": "blue",
      "troop": "infantry",
      "source": "tavern",
      "cost_silver": 4500,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_028",
      "hero_id": "licadian",
      "hero_alias": "h_028",
      "name": "Lý Điển",
      "faction": "wei",
      "quality": "blue",
      "troop": "spear",
      "source": "tavern",
      "cost_silver": 5150,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_029",
      "hero_id": "guojia",
      "hero_alias": "h_029",
      "name": "Quách Gia",
      "faction": "wei",
      "quality": "orange",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 35000,
      "required_prestige": 1500,
      "required_player_level": 14,
      "required_ty_vu_level": 10,
      "required_stage": "ch1_s6"
    },
    {
      "recruit_id": "rec_030",
      "hero_id": "xunyu",
      "hero_alias": "h_030",
      "name": "Tuân Úc",
      "faction": "wei",
      "quality": "purple",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 14700,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_031",
      "hero_id": "xunyou",
      "hero_alias": "h_031",
      "name": "Tuân Du",
      "faction": "wei",
      "quality": "purple",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 14550,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_032",
      "hero_id": "caoren",
      "hero_alias": "h_032",
      "name": "Tào Nhân",
      "faction": "wei",
      "quality": "purple",
      "troop": "infantry",
      "source": "prestige",
      "cost_silver": 15750,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_033",
      "hero_id": "caopi",
      "hero_alias": "h_033",
      "name": "Tào Phi",
      "faction": "wei",
      "quality": "orange",
      "troop": "infantry",
      "source": "campaign_defeat",
      "cost_silver": 39550,
      "required_prestige": 800,
      "required_player_level": 14,
      "required_ty_vu_level": 7,
      "required_stage": "ch2_s3"
    },
    {
      "recruit_id": "rec_034",
      "hero_id": "xiahou_dun",
      "hero_alias": "h_034",
      "name": "Hạ Hầu Đôn",
      "faction": "wei",
      "quality": "orange",
      "troop": "infantry",
      "source": "prestige",
      "cost_silver": 38150,
      "required_prestige": 1500,
      "required_player_level": 14,
      "required_ty_vu_level": 10,
      "required_stage": "ch1_s6"
    },
    {
      "recruit_id": "rec_035",
      "hero_id": "xiahou_yuan",
      "hero_alias": "h_035",
      "name": "Hạ Hầu Uyên",
      "faction": "wei",
      "quality": "purple",
      "troop": "cavalry",
      "source": "prestige",
      "cost_silver": 15600,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_036",
      "hero_id": "sunquan",
      "hero_alias": "h_036",
      "name": "Tôn Quyền",
      "faction": "wu",
      "quality": "orange",
      "troop": "infantry",
      "source": "prestige",
      "cost_silver": 40250,
      "required_prestige": 3500,
      "required_player_level": 14,
      "required_ty_vu_level": 10,
      "required_stage": "ch2_s6"
    },
    {
      "recruit_id": "rec_037",
      "hero_id": "zhouyu",
      "hero_alias": "h_037",
      "name": "Chu Du",
      "faction": "wu",
      "quality": "red",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 70200,
      "required_prestige": 5000,
      "required_player_level": 16,
      "required_ty_vu_level": 12,
      "required_stage": "ch3_s4"
    },
    {
      "recruit_id": "rec_038",
      "hero_id": "luxun",
      "hero_alias": "h_038",
      "name": "Lục Tốn",
      "faction": "wu",
      "quality": "orange",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 38150,
      "required_prestige": 1500,
      "required_player_level": 14,
      "required_ty_vu_level": 10,
      "required_stage": "ch1_s6"
    },
    {
      "recruit_id": "rec_039",
      "hero_id": "taishici",
      "hero_alias": "h_039",
      "name": "Thái Sử Từ",
      "faction": "wu",
      "quality": "purple",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 15750,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_040",
      "hero_id": "ganning",
      "hero_alias": "h_040",
      "name": "Cam Ninh",
      "faction": "wu",
      "quality": "purple",
      "troop": "cavalry",
      "source": "prestige",
      "cost_silver": 15150,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_041",
      "hero_id": "huanggai",
      "hero_alias": "h_041",
      "name": "Hoàng Cái",
      "faction": "wu",
      "quality": "blue",
      "troop": "spear",
      "source": "campaign_defeat",
      "cost_silver": 5050,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 5,
      "required_stage": "ch1_s6"
    },
    {
      "recruit_id": "rec_042",
      "hero_id": "zhouzhi",
      "hero_alias": "h_042",
      "name": "Chu Thái",
      "faction": "wu",
      "quality": "blue",
      "troop": "infantry",
      "source": "tavern",
      "cost_silver": 4500,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_043",
      "hero_id": "lingtong",
      "hero_alias": "h_043",
      "name": "Lăng Thống",
      "faction": "wu",
      "quality": "blue",
      "troop": "cavalry",
      "source": "tavern",
      "cost_silver": 4700,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_044",
      "hero_id": "lusu",
      "hero_alias": "h_044",
      "name": "Lỗ Túc",
      "faction": "wu",
      "quality": "purple",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 15000,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_045",
      "hero_id": "zhugejin",
      "hero_alias": "h_045",
      "name": "Gia Cát Cẩn",
      "faction": "wu",
      "quality": "blue",
      "troop": "archer",
      "source": "tavern",
      "cost_silver": 4600,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_046",
      "hero_id": "sunce",
      "hero_alias": "h_046",
      "name": "Tôn Sách",
      "faction": "wu",
      "quality": "orange",
      "troop": "cavalry",
      "source": "campaign_defeat",
      "cost_silver": 38500,
      "required_prestige": 800,
      "required_player_level": 14,
      "required_ty_vu_level": 7,
      "required_stage": "ch2_s3"
    },
    {
      "recruit_id": "rec_047",
      "hero_id": "sunjian",
      "hero_alias": "h_047",
      "name": "Tôn Kiên",
      "faction": "wu",
      "quality": "purple",
      "troop": "infantry",
      "source": "campaign_defeat",
      "cost_silver": 15750,
      "required_prestige": 800,
      "required_player_level": 8,
      "required_ty_vu_level": 7,
      "required_stage": "ch2_s3"
    },
    {
      "recruit_id": "rec_048",
      "hero_id": "xiaoqiao",
      "hero_alias": "h_048",
      "name": "Tiểu Kiều",
      "faction": "wu",
      "quality": "purple",
      "troop": "archer",
      "source": "prestige",
      "cost_silver": 12750,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_049",
      "hero_id": "daqiao",
      "hero_alias": "h_049",
      "name": "Đại Kiều",
      "faction": "wu",
      "quality": "blue",
      "troop": "archer",
      "source": "tavern",
      "cost_silver": 4250,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_050",
      "hero_id": "zhangzhao",
      "hero_alias": "h_050",
      "name": "Trương Chiêu",
      "faction": "wu",
      "quality": "blue",
      "troop": "archer",
      "source": "tavern",
      "cost_silver": 4400,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_051",
      "hero_id": "chengpu",
      "hero_alias": "h_051",
      "name": "Trình Phổ",
      "faction": "wu",
      "quality": "green",
      "troop": "spear",
      "source": "tavern",
      "cost_silver": 1550,
      "required_prestige": 40,
      "required_player_level": 2,
      "required_ty_vu_level": 2,
      "required_stage": null
    },
    {
      "recruit_id": "rec_052",
      "hero_id": "handang",
      "hero_alias": "h_052",
      "name": "Hàn Đương",
      "faction": "wu",
      "quality": "green",
      "troop": "infantry",
      "source": "tavern",
      "cost_silver": 1550,
      "required_prestige": 40,
      "required_player_level": 2,
      "required_ty_vu_level": 2,
      "required_stage": null
    },
    {
      "recruit_id": "rec_053",
      "hero_id": "recruit_guard",
      "hero_alias": "h_053",
      "name": "Thủ Vệ",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "source": "tavern",
      "cost_silver": 500,
      "required_prestige": 0,
      "required_player_level": 1,
      "required_ty_vu_level": 1,
      "required_stage": null
    },
    {
      "recruit_id": "rec_054",
      "hero_id": "recruit_scout",
      "hero_alias": "h_054",
      "name": "Do Thám",
      "faction": "other",
      "quality": "white",
      "troop": "archer",
      "source": "tavern",
      "cost_silver": 500,
      "required_prestige": 0,
      "required_player_level": 1,
      "required_ty_vu_level": 1,
      "required_stage": null
    },
    {
      "recruit_id": "rec_055",
      "hero_id": "recruit_militia",
      "hero_alias": "h_055",
      "name": "Dân Binh",
      "faction": "other",
      "quality": "white",
      "troop": "spear",
      "source": "tavern",
      "cost_silver": 500,
      "required_prestige": 0,
      "required_player_level": 1,
      "required_ty_vu_level": 1,
      "required_stage": null
    },
    {
      "recruit_id": "rec_056",
      "hero_id": "recruit_porter",
      "hero_alias": "h_056",
      "name": "Phu Dịch",
      "faction": "other",
      "quality": "white",
      "troop": "infantry",
      "source": "tavern",
      "cost_silver": 500,
      "required_prestige": 0,
      "required_player_level": 1,
      "required_ty_vu_level": 1,
      "required_stage": null
    },
    {
      "recruit_id": "rec_057",
      "hero_id": "recruit_rider",
      "hero_alias": "h_057",
      "name": "Kỵ Binh",
      "faction": "other",
      "quality": "green",
      "troop": "cavalry",
      "source": "tavern",
      "cost_silver": 1550,
      "required_prestige": 40,
      "required_player_level": 2,
      "required_ty_vu_level": 2,
      "required_stage": null
    },
    {
      "recruit_id": "rec_058",
      "hero_id": "recruit_spearman",
      "hero_alias": "h_058",
      "name": "Thương Thủ",
      "faction": "other",
      "quality": "green",
      "troop": "spear",
      "source": "tavern",
      "cost_silver": 1550,
      "required_prestige": 40,
      "required_player_level": 2,
      "required_ty_vu_level": 2,
      "required_stage": null
    },
    {
      "recruit_id": "rec_059",
      "hero_id": "recruit_crossbow",
      "hero_alias": "h_059",
      "name": "Nỏ Thủ",
      "faction": "other",
      "quality": "green",
      "troop": "archer",
      "source": "tavern",
      "cost_silver": 1550,
      "required_prestige": 40,
      "required_player_level": 2,
      "required_ty_vu_level": 2,
      "required_stage": null
    },
    {
      "recruit_id": "rec_060",
      "hero_id": "recruit_blade",
      "hero_alias": "h_060",
      "name": "Đao Phủ",
      "faction": "other",
      "quality": "green",
      "troop": "infantry",
      "source": "tavern",
      "cost_silver": 1550,
      "required_prestige": 40,
      "required_player_level": 2,
      "required_ty_vu_level": 2,
      "required_stage": null
    },
    {
      "recruit_id": "rec_061",
      "hero_id": "veteran_guard",
      "hero_alias": "h_061",
      "name": "Lão Binh",
      "faction": "other",
      "quality": "blue",
      "troop": "infantry",
      "source": "tavern",
      "cost_silver": 4250,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_062",
      "hero_id": "veteran_rider",
      "hero_alias": "h_062",
      "name": "Thiết Kỵ",
      "faction": "other",
      "quality": "blue",
      "troop": "cavalry",
      "source": "tavern",
      "cost_silver": 4250,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_063",
      "hero_id": "veteran_spear",
      "hero_alias": "h_063",
      "name": "Trường Thương",
      "faction": "other",
      "quality": "blue",
      "troop": "spear",
      "source": "tavern",
      "cost_silver": 4250,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_064",
      "hero_id": "veteran_archer",
      "hero_alias": "h_064",
      "name": "Thiện Xạ",
      "faction": "other",
      "quality": "blue",
      "troop": "archer",
      "source": "tavern",
      "cost_silver": 4350,
      "required_prestige": 150,
      "required_player_level": 4,
      "required_ty_vu_level": 4,
      "required_stage": "ch1_s2"
    },
    {
      "recruit_id": "rec_065",
      "hero_id": "elite_vanguard",
      "hero_alias": "h_065",
      "name": "Tinh Nhuệ",
      "faction": "other",
      "quality": "purple",
      "troop": "infantry",
      "source": "prestige",
      "cost_silver": 14550,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    },
    {
      "recruit_id": "rec_066",
      "hero_id": "elite_raider",
      "hero_alias": "h_066",
      "name": "Kỳ Binh",
      "faction": "other",
      "quality": "purple",
      "troop": "cavalry",
      "source": "prestige",
      "cost_silver": 14550,
      "required_prestige": 500,
      "required_player_level": 8,
      "required_ty_vu_level": 6,
      "required_stage": "ch1_s4"
    }
  ]
},
"items": {
  "schemaVersion": 2,
  "slots": [
    "weapon",
    "armor",
    "horse",
    "book",
    "accessory"
  ],
  "slotNames": {
    "weapon": "Vũ khí",
    "armor": "Giáp",
    "horse": "Ngựa",
    "book": "Sách",
    "accessory": "Đồ phổ"
  },
  "rarities": [
    "white",
    "green",
    "blue",
    "purple",
    "orange",
    "red"
  ],
  "list": [
    {
      "id": "sword_common",
      "name": "Thanh Phong Kiếm",
      "slot": "weapon",
      "rarity": "white",
      "bonuses": {
        "vuLuc": 5
      },
      "desc": "Kiếm lính."
    },
    {
      "id": "sword_iron",
      "name": "Thiết Kiếm",
      "slot": "weapon",
      "rarity": "green",
      "bonuses": {
        "vuLuc": 10
      },
      "desc": "Kiếm sắt."
    },
    {
      "id": "blade_steel",
      "name": "Cương Đao",
      "slot": "weapon",
      "rarity": "blue",
      "bonuses": {
        "vuLuc": 18,
        "tongLinh": 3
      },
      "desc": "Đao thép."
    },
    {
      "id": "spear_long",
      "name": "Trường Thương",
      "slot": "weapon",
      "rarity": "blue",
      "bonuses": {
        "vuLuc": 16,
        "tongLinh": 5
      },
      "desc": "Thương dài."
    },
    {
      "id": "bow_composite",
      "name": "Củng Nỏ",
      "slot": "weapon",
      "rarity": "blue",
      "bonuses": {
        "vuLuc": 17,
        "triLuc": 4
      },
      "desc": "Nỏ cứng."
    },
    {
      "id": "blade_qinglong",
      "name": "Thanh Long Yển Nguyệt",
      "slot": "weapon",
      "rarity": "orange",
      "bonuses": {
        "vuLuc": 35,
        "tongLinh": 8
      },
      "desc": "Đại đao danh tướng."
    },
    {
      "id": "spear_fangtian",
      "name": "Phương Thiên Họa Kích",
      "slot": "weapon",
      "rarity": "red",
      "bonuses": {
        "vuLuc": 48,
        "tongLinh": 10
      },
      "desc": "Kích Lã Bố."
    },
    {
      "id": "sword_yitian",
      "name": "Ỷ Thiên Kiếm",
      "slot": "weapon",
      "rarity": "orange",
      "bonuses": {
        "vuLuc": 30,
        "triLuc": 12
      },
      "desc": "Kiếm Ỷ Thiên."
    },
    {
      "id": "halberd_snake",
      "name": "Xà Mâu",
      "slot": "weapon",
      "rarity": "purple",
      "bonuses": {
        "vuLuc": 26,
        "tongLinh": 6
      },
      "desc": "Mâu Xà."
    },
    {
      "id": "armor_cloth",
      "name": "Bố Bào",
      "slot": "armor",
      "rarity": "white",
      "bonuses": {
        "tongLinh": 4,
        "hp": 80
      },
      "desc": "Áo vải."
    },
    {
      "id": "armor_leather",
      "name": "Bì Giáp",
      "slot": "armor",
      "rarity": "green",
      "bonuses": {
        "tongLinh": 8,
        "hp": 150
      },
      "desc": "Giáp da."
    },
    {
      "id": "armor_scale",
      "name": "Lân Giáp",
      "slot": "armor",
      "rarity": "blue",
      "bonuses": {
        "tongLinh": 14,
        "hp": 280
      },
      "desc": "Giáp vảy."
    },
    {
      "id": "armor_tiger",
      "name": "Hổ Báo Khôi",
      "slot": "armor",
      "rarity": "purple",
      "bonuses": {
        "tongLinh": 22,
        "hp": 450
      },
      "desc": "Giáp hổ."
    },
    {
      "id": "armor_dragon",
      "name": "Long Lân Khôi",
      "slot": "armor",
      "rarity": "orange",
      "bonuses": {
        "tongLinh": 30,
        "hp": 600
      },
      "desc": "Giáp long."
    },
    {
      "id": "armor_imperial",
      "name": "Đế Vương Khôi",
      "slot": "armor",
      "rarity": "red",
      "bonuses": {
        "tongLinh": 40,
        "hp": 800,
        "triLuc": 8
      },
      "desc": "Giáp đế."
    },
    {
      "id": "horse_grey",
      "name": "Thanh Kỵ",
      "slot": "horse",
      "rarity": "white",
      "bonuses": {
        "vuLuc": 4,
        "tongLinh": 3
      },
      "desc": "Ngựa thường."
    },
    {
      "id": "horse_brown",
      "name": "Hoàng Bưu",
      "slot": "horse",
      "rarity": "green",
      "bonuses": {
        "vuLuc": 8,
        "tongLinh": 6
      },
      "desc": "Ngựa tốt."
    },
    {
      "id": "horse_white",
      "name": "Bạch Long",
      "slot": "horse",
      "rarity": "blue",
      "bonuses": {
        "vuLuc": 12,
        "tongLinh": 10
      },
      "desc": "Ngựa trắng."
    },
    {
      "id": "horse_red",
      "name": "Xích Thố",
      "slot": "horse",
      "rarity": "orange",
      "bonuses": {
        "vuLuc": 15,
        "tongLinh": 12
      },
      "desc": "Xích Thố."
    },
    {
      "id": "horse_jueying",
      "name": "Tuyệt Ảnh",
      "slot": "horse",
      "rarity": "red",
      "bonuses": {
        "vuLuc": 20,
        "tongLinh": 18
      },
      "desc": "Tuyệt Ảnh."
    },
    {
      "id": "horse_dilu",
      "name": "Đích Lư",
      "slot": "horse",
      "rarity": "purple",
      "bonuses": {
        "tongLinh": 16,
        "hp": 200
      },
      "desc": "Đích Lư."
    },
    {
      "id": "book_primer",
      "name": "Tam Tự Kinh",
      "slot": "book",
      "rarity": "white",
      "bonuses": {
        "triLuc": 6
      },
      "desc": "Sách nhập môn."
    },
    {
      "id": "book_bingfa",
      "name": "Tôn Tử Binh Pháp",
      "slot": "book",
      "rarity": "blue",
      "bonuses": {
        "triLuc": 18
      },
      "desc": "Binh pháp."
    },
    {
      "id": "book_24",
      "name": "Nhị Thập Tứ Thiên",
      "slot": "book",
      "rarity": "purple",
      "bonuses": {
        "triLuc": 28,
        "tongLinh": 6
      },
      "desc": "Binh thư cao."
    },
    {
      "id": "book_mengde",
      "name": "Mạnh Đức Tân Thư",
      "slot": "book",
      "rarity": "orange",
      "bonuses": {
        "triLuc": 32,
        "vuLuc": 8
      },
      "desc": "Thư Tào."
    },
    {
      "id": "book_kongming",
      "name": "Long Trung Đối",
      "slot": "book",
      "rarity": "red",
      "bonuses": {
        "triLuc": 42,
        "tongLinh": 10
      },
      "desc": "Sách Khổng Minh."
    },
    {
      "id": "acc_jade",
      "name": "Ngọc Bội",
      "slot": "accessory",
      "rarity": "green",
      "bonuses": {
        "hp": 200,
        "triLuc": 5
      },
      "desc": "Ngọc."
    },
    {
      "id": "acc_ring",
      "name": "Ngân Giới",
      "slot": "accessory",
      "rarity": "blue",
      "bonuses": {
        "vuLuc": 8,
        "hp": 150
      },
      "desc": "Nhẫn bạc."
    },
    {
      "id": "acc_amulet",
      "name": "Hộ Thân Phù",
      "slot": "accessory",
      "rarity": "purple",
      "bonuses": {
        "tongLinh": 12,
        "hp": 300
      },
      "desc": "Bùa hộ."
    },
    {
      "id": "acc_seal",
      "name": "Ngọc Tỷ",
      "slot": "accessory",
      "rarity": "orange",
      "bonuses": {
        "tongLinh": 15,
        "triLuc": 15,
        "vuLuc": 10
      },
      "desc": "Ấn tín."
    },
    {
      "id": "acc_imperial_seal",
      "name": "Truyền Quốc Ngọc Tỷ",
      "slot": "accessory",
      "rarity": "red",
      "bonuses": {
        "tongLinh": 25,
        "triLuc": 25,
        "vuLuc": 15,
        "hp": 400
      },
      "desc": "Ngọc tỷ truyền quốc."
    }
  ],
  "dropTables": {
    "common": [
      {
        "itemId": "sword_common",
        "weight": 18
      },
      {
        "itemId": "armor_cloth",
        "weight": 18
      },
      {
        "itemId": "horse_grey",
        "weight": 12
      },
      {
        "itemId": "book_primer",
        "weight": 12
      },
      {
        "itemId": "sword_iron",
        "weight": 12
      },
      {
        "itemId": "armor_leather",
        "weight": 12
      },
      {
        "itemId": "acc_jade",
        "weight": 10
      },
      {
        "itemId": null,
        "weight": 6
      }
    ],
    "elite": [
      {
        "itemId": "blade_steel",
        "weight": 14
      },
      {
        "itemId": "spear_long",
        "weight": 12
      },
      {
        "itemId": "bow_composite",
        "weight": 12
      },
      {
        "itemId": "armor_scale",
        "weight": 14
      },
      {
        "itemId": "horse_white",
        "weight": 10
      },
      {
        "itemId": "book_bingfa",
        "weight": 12
      },
      {
        "itemId": "acc_ring",
        "weight": 10
      },
      {
        "itemId": "armor_tiger",
        "weight": 8
      },
      {
        "itemId": "halberd_snake",
        "weight": 5
      },
      {
        "itemId": null,
        "weight": 3
      }
    ],
    "boss": [
      {
        "itemId": "blade_qinglong",
        "weight": 10
      },
      {
        "itemId": "sword_yitian",
        "weight": 8
      },
      {
        "itemId": "armor_tiger",
        "weight": 14
      },
      {
        "itemId": "armor_dragon",
        "weight": 8
      },
      {
        "itemId": "horse_red",
        "weight": 12
      },
      {
        "itemId": "horse_dilu",
        "weight": 8
      },
      {
        "itemId": "book_24",
        "weight": 12
      },
      {
        "itemId": "book_mengde",
        "weight": 6
      },
      {
        "itemId": "acc_seal",
        "weight": 8
      },
      {
        "itemId": "acc_amulet",
        "weight": 8
      },
      {
        "itemId": "spear_fangtian",
        "weight": 3
      },
      {
        "itemId": "horse_jueying",
        "weight": 2
      },
      {
        "itemId": "acc_imperial_seal",
        "weight": 1
      },
      {
        "itemId": null,
        "weight": 0
      }
    ]
  }
},
"buildings": {
  "schemaVersion": 3,
  "note": "Thành chính NL — Ty Vũ giới hạn cấp nhà khác. Sản lượng theo phút. Nâng cấp có thời gian chờ.",
  "levelBands": [
    {
      "min": 1,
      "max": 9,
      "assetSuffix": "lv1",
      "label": "Sơ cấp"
    },
    {
      "min": 10,
      "max": 19,
      "assetSuffix": "lv10",
      "label": "Trung cấp"
    },
    {
      "min": 20,
      "max": 39,
      "assetSuffix": "lv20",
      "label": "Cao cấp"
    },
    {
      "min": 40,
      "max": 59,
      "assetSuffix": "lv40",
      "label": "Tinh xảo"
    },
    {
      "min": 60,
      "max": 99,
      "assetSuffix": "lv60",
      "label": "Hùng tráng"
    },
    {
      "min": 100,
      "max": 180,
      "assetSuffix": "lv100",
      "label": "Đỉnh phong"
    }
  ],
  "coreIds": [
    "ty_vu",
    "mo_bac",
    "nong_trai",
    "doanh_trai",
    "kho"
  ],
  "list": [
    {
      "id": "ty_vu",
      "aliases": [
        "b_tyvu",
        "hall"
      ],
      "name": "Ty Vũ",
      "slot": {
        "col": 2,
        "row": 1
      },
      "maxLevel": 180,
      "baseCost": {
        "silver": 200,
        "food": 100
      },
      "costGrowth": 1.55,
      "upgradeBaseSec": 20,
      "upgradeGrowth": 1.38,
      "effect": {
        "type": "hall_cap",
        "otherMaxLevel": "ty_vu_level"
      },
      "desc": "Nhà chính — cấp Ty Vũ = trần cấp mọi công trình khác."
    },
    {
      "id": "mo_bac",
      "aliases": [
        "b_mobac",
        "mine"
      ],
      "name": "Mỏ Bạc",
      "slot": {
        "col": 4,
        "row": 2
      },
      "maxLevel": 180,
      "baseCost": {
        "silver": 80,
        "food": 60
      },
      "costGrowth": 1.5,
      "upgradeBaseSec": 25,
      "upgradeGrowth": 1.35,
      "effect": {
        "type": "silver_per_min",
        "base": 8,
        "perLevel": 4
      },
      "desc": "Sản xuất Bạc theo thời gian thực (mỗi phút)."
    },
    {
      "id": "nong_trai",
      "aliases": [
        "b_nongtrai",
        "farm",
        "kho_lua"
      ],
      "name": "Nông Trại",
      "slot": {
        "col": 0,
        "row": 2
      },
      "maxLevel": 180,
      "baseCost": {
        "silver": 70,
        "food": 50
      },
      "costGrowth": 1.5,
      "upgradeBaseSec": 25,
      "upgradeGrowth": 1.35,
      "effect": {
        "type": "food_per_min",
        "base": 10,
        "perLevel": 5
      },
      "desc": "Sản xuất Lương thực theo thời gian thực (mỗi phút)."
    },
    {
      "id": "doanh_trai",
      "aliases": [
        "b_doanhtrai",
        "barracks"
      ],
      "name": "Doanh Trại",
      "slot": {
        "col": 1,
        "row": 3
      },
      "maxLevel": 180,
      "baseCost": {
        "silver": 120,
        "food": 90
      },
      "costGrowth": 1.52,
      "upgradeBaseSec": 30,
      "upgradeGrowth": 1.36,
      "effect": {
        "type": "troops",
        "maxBase": 500,
        "maxPerLevel": 200,
        "regenPerMinBase": 2,
        "regenPerMinPerLevel": 1,
        "atkPctPerLevel": 0.5
      },
      "desc": "Giới hạn & hồi phục binh lực; tăng nhẹ sát thương xuất trận."
    },
    {
      "id": "kho",
      "aliases": [
        "b_kho",
        "warehouse",
        "kho_trang"
      ],
      "name": "Kho",
      "slot": {
        "col": 3,
        "row": 3
      },
      "maxLevel": 180,
      "baseCost": {
        "silver": 100,
        "food": 80
      },
      "costGrowth": 1.5,
      "upgradeBaseSec": 28,
      "upgradeGrowth": 1.34,
      "effect": {
        "type": "warehouse",
        "silverBase": 20000,
        "silverPerLevel": 8000,
        "foodBase": 20000,
        "foodPerLevel": 8000
      },
      "desc": "Giới hạn dung tích Bạc và Lương thực."
    },
    {
      "id": "quan_vien",
      "aliases": [],
      "name": "Quân Viện",
      "slot": {
        "col": 3,
        "row": 2
      },
      "maxLevel": 120,
      "baseCost": {
        "silver": 110,
        "food": 90
      },
      "costGrowth": 1.52,
      "upgradeBaseSec": 30,
      "upgradeGrowth": 1.35,
      "effect": {
        "type": "troop_hp_pct",
        "perLevel": 1.0
      },
      "desc": "+% HP tướng khi xuất trận."
    },
    {
      "id": "san_tap",
      "aliases": [
        "academy"
      ],
      "name": "Sân Tập",
      "slot": {
        "col": 2,
        "row": 4
      },
      "maxLevel": 120,
      "baseCost": {
        "silver": 90,
        "food": 70
      },
      "costGrowth": 1.5,
      "upgradeBaseSec": 26,
      "upgradeGrowth": 1.34,
      "effect": {
        "type": "train_discount_pct",
        "perLevel": 0.5,
        "cap": 40
      },
      "desc": "Giảm phí huấn luyện tướng."
    },
    {
      "id": "tuong_quan",
      "aliases": [],
      "name": "Tướng Quán",
      "slot": {
        "col": 2,
        "row": 2
      },
      "maxLevel": 100,
      "baseCost": {
        "silver": 140,
        "food": 120
      },
      "costGrowth": 1.55,
      "upgradeBaseSec": 35,
      "upgradeGrowth": 1.36,
      "effect": {
        "type": "general_slot",
        "base": 8,
        "perLevel": 0.2
      },
      "desc": "Sức chứa danh tướng."
    }
  ]
},
"campaign": {
  "schemaVersion": 3,
  "id": "main_campaign_v3",
  "name": "Tam Quốc Chí — Chính tuyến",
  "formationRef": "nl_default_5",
  "chapters": [
    {
      "id": "ch1_khan_vang",
      "index": 1,
      "name": "Khăn Vàng nổi dậy",
      "yearHint": "184",
      "summary": "Trương Giác phất cờ Hoàng Thiên. Quan quân dẹp loạn.",
      "unlockRequire": null,
      "stages": [
        {
          "id": "ch1_s1",
          "index": 1,
          "name": "Loạn khởi Trác Châu",
          "type": "normal",
          "powerHint": 1.0,
          "enemies": [
            {
              "generalId": "recruit_militia",
              "level": 3,
              "slot": 0
            },
            {
              "generalId": "recruit_guard",
              "level": 4,
              "slot": 1
            },
            {
              "generalId": "recruit_scout",
              "level": 3,
              "slot": 3
            }
          ],
          "rewards": {
            "silver": 180,
            "food": 50,
            "exp": 60,
            "dropTable": "common",
            "dropChance": 0.2
          },
          "aliases": [
            "st_01_01"
          ],
          "staminaCost": 90,
          "stamina_cost": 90,
          "enemyFormationId": "square",
          "enemy_formation_id": "ef_ch1_s1"
        },
        {
          "id": "ch1_s2",
          "index": 2,
          "name": "Khăn Vàng tập kết",
          "type": "normal",
          "powerHint": 1.1,
          "enemies": [
            {
              "generalId": "yellow_zealot",
              "level": 6,
              "slot": 0
            },
            {
              "generalId": "yellow_zealot",
              "level": 6,
              "slot": 1
            },
            {
              "generalId": "yellow_shaman",
              "level": 6,
              "slot": 2
            },
            {
              "generalId": "recruit_scout",
              "level": 5,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 270,
            "food": 70,
            "exp": 90,
            "dropTable": "common",
            "dropChance": 0.25
          },
          "aliases": [
            "st_01_02"
          ],
          "staminaCost": 100,
          "stamina_cost": 100,
          "enemyFormationId": "crane_wing",
          "enemy_formation_id": "ef_ch1_s2"
        },
        {
          "id": "ch1_s3",
          "index": 3,
          "name": "Trương Bảo xuất trận",
          "type": "elite",
          "powerHint": 1.3,
          "enemies": [
            {
              "generalId": "zhangbao",
              "level": 12,
              "slot": 1
            },
            {
              "generalId": "yellow_zealot",
              "level": 9,
              "slot": 0
            },
            {
              "generalId": "yellow_captain",
              "level": 10,
              "slot": 2
            },
            {
              "generalId": "yellow_shaman",
              "level": 9,
              "slot": 3
            }
          ],
          "rewards": {
            "silver": 540,
            "food": 120,
            "exp": 180,
            "dropTable": "elite",
            "dropChance": 0.4
          },
          "aliases": [
            "st_01_03"
          ],
          "staminaCost": 150,
          "stamina_cost": 150,
          "enemyFormationId": "long_snake",
          "enemy_formation_id": "ef_ch1_s3"
        },
        {
          "id": "ch1_s4",
          "index": 4,
          "name": "Trương Lương phục binh",
          "type": "elite",
          "powerHint": 1.45,
          "enemies": [
            {
              "generalId": "zhangliang",
              "level": 14,
              "slot": 1
            },
            {
              "generalId": "recruit_rider",
              "level": 11,
              "slot": 0
            },
            {
              "generalId": "yellow_captain",
              "level": 12,
              "slot": 2
            },
            {
              "generalId": "yellow_shaman",
              "level": 11,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 660,
            "food": 150,
            "exp": 220,
            "dropTable": "elite",
            "dropChance": 0.45
          },
          "aliases": [
            "st_01_04"
          ],
          "staminaCost": 150,
          "stamina_cost": 150,
          "enemyFormationId": "long_snake",
          "enemy_formation_id": "ef_ch1_s4"
        },
        {
          "id": "ch1_s5",
          "index": 5,
          "name": "Áp sát Quảng Tông",
          "type": "normal",
          "powerHint": 1.55,
          "enemies": [
            {
              "generalId": "yellow_captain",
              "level": 14,
              "slot": 0
            },
            {
              "generalId": "yellow_captain",
              "level": 14,
              "slot": 1
            },
            {
              "generalId": "yellow_zealot",
              "level": 13,
              "slot": 2
            },
            {
              "generalId": "yellow_shaman",
              "level": 13,
              "slot": 3
            },
            {
              "generalId": "recruit_crossbow",
              "level": 12,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 780,
            "food": 170,
            "exp": 260,
            "dropTable": "elite",
            "dropChance": 0.35
          },
          "aliases": [
            "st_01_05"
          ],
          "staminaCost": 130,
          "stamina_cost": 130,
          "enemyFormationId": "square",
          "enemy_formation_id": "ef_ch1_s5"
        },
        {
          "id": "ch1_s6",
          "index": 6,
          "name": "Trương Giác — Hoàng Thiên",
          "type": "boss",
          "powerHint": 1.8,
          "enemies": [
            {
              "generalId": "zhangjiao",
              "level": 18,
              "slot": 1
            },
            {
              "generalId": "zhangbao",
              "level": 15,
              "slot": 0
            },
            {
              "generalId": "zhangliang",
              "level": 15,
              "slot": 2
            },
            {
              "generalId": "yellow_captain",
              "level": 13,
              "slot": 3
            },
            {
              "generalId": "yellow_shaman",
              "level": 13,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 1500,
            "food": 300,
            "exp": 500,
            "gold": 5,
            "dropTable": "boss",
            "dropChance": 0.7,
            "firstClearBonus": {
              "silver": 300,
              "itemId": "book_bingfa"
            }
          },
          "aliases": [
            "st_01_06"
          ],
          "staminaCost": 250,
          "stamina_cost": 250,
          "enemyFormationId": "long_snake",
          "enemy_formation_id": "ef_ch1_s6",
          "unlockFeatures": [
            "arena",
            "recruit_advanced"
          ]
        }
      ],
      "aliases": [
        "ch_01"
      ]
    },
    {
      "id": "ch2_dong_trac",
      "index": 2,
      "name": "Loạn Đổng Trác",
      "yearHint": "189–192",
      "summary": "Đổng Trác nắm triều. Hoa Hùng — Lã Bố tại Hổ Lao Quan.",
      "unlockRequire": {
        "chapterId": "ch1_khan_vang",
        "stageId": "ch1_s6"
      },
      "stages": [
        {
          "id": "ch2_s1",
          "index": 1,
          "name": "Tiến quân Dương Nhân",
          "type": "normal",
          "powerHint": 1.6,
          "enemies": [
            {
              "generalId": "recruit_rider",
              "level": 16,
              "slot": 0
            },
            {
              "generalId": "recruit_guard",
              "level": 16,
              "slot": 1
            },
            {
              "generalId": "recruit_spearman",
              "level": 15,
              "slot": 2
            },
            {
              "generalId": "recruit_scout",
              "level": 15,
              "slot": 3
            }
          ],
          "rewards": {
            "silver": 600,
            "food": 140,
            "exp": 240,
            "dropTable": "common",
            "dropChance": 0.3
          },
          "aliases": [
            "st_02_01"
          ],
          "staminaCost": 110,
          "stamina_cost": 110,
          "enemyFormationId": "square",
          "enemy_formation_id": "ef_ch2_s1"
        },
        {
          "id": "ch2_s2",
          "index": 2,
          "name": "Phàn Trù chặn đường",
          "type": "normal",
          "powerHint": 1.7,
          "enemies": [
            {
              "generalId": "fancho",
              "level": 18,
              "slot": 1
            },
            {
              "generalId": "zhangji_dz",
              "level": 17,
              "slot": 0
            },
            {
              "generalId": "recruit_spearman",
              "level": 16,
              "slot": 2
            },
            {
              "generalId": "recruit_crossbow",
              "level": 16,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 720,
            "food": 160,
            "exp": 280,
            "dropTable": "elite",
            "dropChance": 0.35
          },
          "aliases": [
            "st_02_02"
          ],
          "staminaCost": 120,
          "stamina_cost": 120,
          "enemyFormationId": "crane_wing",
          "enemy_formation_id": "ef_ch2_s2"
        },
        {
          "id": "ch2_s3",
          "index": 3,
          "name": "Hoa Hùng — Ải Hổ Lao",
          "type": "elite",
          "powerHint": 1.95,
          "enemies": [
            {
              "generalId": "huaxiong",
              "level": 22,
              "slot": 1
            },
            {
              "generalId": "recruit_rider",
              "level": 18,
              "slot": 0
            },
            {
              "generalId": "recruit_rider",
              "level": 18,
              "slot": 2
            },
            {
              "generalId": "veteran_guard",
              "level": 17,
              "slot": 3
            }
          ],
          "rewards": {
            "silver": 1050,
            "food": 200,
            "exp": 360,
            "dropTable": "elite",
            "dropChance": 0.5
          },
          "aliases": [
            "st_02_03"
          ],
          "staminaCost": 180,
          "stamina_cost": 180,
          "enemyFormationId": "long_snake",
          "enemy_formation_id": "ef_ch2_s3"
        },
        {
          "id": "ch2_s4",
          "index": 4,
          "name": "Lý Thôi · Quách Dĩ",
          "type": "elite",
          "powerHint": 2.05,
          "enemies": [
            {
              "generalId": "liuru",
              "level": 22,
              "slot": 0
            },
            {
              "generalId": "guosi",
              "level": 22,
              "slot": 1
            },
            {
              "generalId": "veteran_spear",
              "level": 20,
              "slot": 2
            },
            {
              "generalId": "veteran_archer",
              "level": 20,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 1200,
            "food": 220,
            "exp": 400,
            "dropTable": "elite",
            "dropChance": 0.5
          },
          "aliases": [
            "st_02_04"
          ],
          "staminaCost": 180,
          "stamina_cost": 180,
          "enemyFormationId": "long_snake",
          "enemy_formation_id": "ef_ch2_s4"
        },
        {
          "id": "ch2_s5",
          "index": 5,
          "name": "Tam Anh chiến Lã Bố",
          "type": "boss",
          "powerHint": 2.35,
          "enemies": [
            {
              "generalId": "lubu",
              "level": 28,
              "slot": 1
            },
            {
              "generalId": "huaxiong",
              "level": 22,
              "slot": 0
            },
            {
              "generalId": "veteran_rider",
              "level": 21,
              "slot": 2
            },
            {
              "generalId": "veteran_spear",
              "level": 20,
              "slot": 3
            },
            {
              "generalId": "veteran_archer",
              "level": 20,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 2100,
            "food": 400,
            "exp": 640,
            "gold": 8,
            "dropTable": "boss",
            "dropChance": 0.75,
            "firstClearBonus": {
              "silver": 400,
              "itemId": "horse_red"
            }
          },
          "aliases": [
            "st_02_05"
          ],
          "staminaCost": 300,
          "stamina_cost": 300,
          "enemyFormationId": "long_snake",
          "enemy_formation_id": "ef_ch2_s5"
        },
        {
          "id": "ch2_s6",
          "index": 6,
          "name": "Đổng Trác bỏ Lạc Dương",
          "type": "boss",
          "powerHint": 2.2,
          "enemies": [
            {
              "generalId": "dongzhuo",
              "level": 26,
              "slot": 1
            },
            {
              "generalId": "liru",
              "level": 24,
              "slot": 4
            },
            {
              "generalId": "liuru",
              "level": 22,
              "slot": 0
            },
            {
              "generalId": "guosi",
              "level": 22,
              "slot": 2
            },
            {
              "generalId": "veteran_guard",
              "level": 21,
              "slot": 3
            }
          ],
          "rewards": {
            "silver": 1950,
            "food": 380,
            "exp": 600,
            "gold": 6,
            "dropTable": "boss",
            "dropChance": 0.65,
            "firstClearBonus": {
              "itemId": "acc_seal"
            }
          },
          "aliases": [
            "st_02_06"
          ],
          "staminaCost": 300,
          "stamina_cost": 300,
          "enemyFormationId": "long_snake",
          "enemy_formation_id": "ef_ch2_s6",
          "unlockFeatures": [
            "tower_hard",
            "equip_enhance_plus"
          ]
        }
      ],
      "aliases": [
        "ch_02"
      ]
    },
    {
      "id": "ch3_quan_hung",
      "index": 3,
      "name": "Quần Hùng Trục Lộc",
      "yearHint": "191–200",
      "summary": "Chư hầu phân tranh. Tào khởi nghiệp, Lưu lưu vong, Viên Thiệu Hà Bắc.",
      "unlockRequire": {
        "chapterId": "ch2_dong_trac",
        "stageId": "ch2_s6"
      },
      "stages": [
        {
          "id": "ch3_s1",
          "index": 1,
          "name": "Tào Tháo khởi binh Trần Lưu",
          "type": "normal",
          "powerHint": 2.15,
          "enemies": [
            {
              "generalId": "veteran_rider",
              "level": 24,
              "slot": 0
            },
            {
              "generalId": "veteran_guard",
              "level": 24,
              "slot": 1
            },
            {
              "generalId": "veteran_spear",
              "level": 23,
              "slot": 2
            },
            {
              "generalId": "veteran_archer",
              "level": 23,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 840,
            "food": 180,
            "exp": 320,
            "dropTable": "common",
            "dropChance": 0.35
          },
          "aliases": [
            "st_03_01"
          ],
          "staminaCost": 130,
          "stamina_cost": 130,
          "enemyFormationId": "square",
          "enemy_formation_id": "ef_ch3_s1"
        },
        {
          "id": "ch3_s2",
          "index": 2,
          "name": "Đào Khiêm Từ Châu",
          "type": "normal",
          "powerHint": 2.25,
          "enemies": [
            {
              "generalId": "taogian",
              "level": 26,
              "slot": 1
            },
            {
              "generalId": "veteran_guard",
              "level": 24,
              "slot": 0
            },
            {
              "generalId": "veteran_guard",
              "level": 24,
              "slot": 2
            },
            {
              "generalId": "recruit_crossbow",
              "level": 22,
              "slot": 3
            }
          ],
          "rewards": {
            "silver": 960,
            "food": 200,
            "exp": 360,
            "dropTable": "elite",
            "dropChance": 0.4
          },
          "aliases": [
            "st_03_02"
          ],
          "staminaCost": 140,
          "stamina_cost": 140,
          "enemyFormationId": "crane_wing",
          "enemy_formation_id": "ef_ch3_s2"
        },
        {
          "id": "ch3_s3",
          "index": 3,
          "name": "Công Tôn Toản — Bạch Mã",
          "type": "elite",
          "powerHint": 2.45,
          "enemies": [
            {
              "generalId": "gongsunzan",
              "level": 30,
              "slot": 1
            },
            {
              "generalId": "veteran_rider",
              "level": 26,
              "slot": 0
            },
            {
              "generalId": "veteran_rider",
              "level": 26,
              "slot": 2
            },
            {
              "generalId": "veteran_archer",
              "level": 25,
              "slot": 3
            }
          ],
          "rewards": {
            "silver": 1260,
            "food": 260,
            "exp": 440,
            "dropTable": "elite",
            "dropChance": 0.5
          },
          "aliases": [
            "st_03_03"
          ],
          "staminaCost": 210,
          "stamina_cost": 210,
          "enemyFormationId": "long_snake",
          "enemy_formation_id": "ef_ch3_s3"
        },
        {
          "id": "ch3_s4",
          "index": 4,
          "name": "Nhan Lương · Văn Xú",
          "type": "elite",
          "powerHint": 2.6,
          "enemies": [
            {
              "generalId": "yanliang",
              "level": 32,
              "slot": 0
            },
            {
              "generalId": "wenchou",
              "level": 32,
              "slot": 1
            },
            {
              "generalId": "veteran_spear",
              "level": 28,
              "slot": 2
            },
            {
              "generalId": "tianfeng",
              "level": 28,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 1440,
            "food": 300,
            "exp": 520,
            "dropTable": "elite",
            "dropChance": 0.55
          },
          "aliases": [
            "st_03_04"
          ],
          "staminaCost": 210,
          "stamina_cost": 210,
          "enemyFormationId": "long_snake",
          "enemy_formation_id": "ef_ch3_s4"
        },
        {
          "id": "ch3_s5",
          "index": 5,
          "name": "Lưu Biểu Kinh Châu",
          "type": "elite",
          "powerHint": 2.7,
          "enemies": [
            {
              "generalId": "liubiao",
              "level": 34,
              "slot": 1
            },
            {
              "generalId": "veteran_guard",
              "level": 30,
              "slot": 0
            },
            {
              "generalId": "veteran_spear",
              "level": 30,
              "slot": 2
            },
            {
              "generalId": "veteran_archer",
              "level": 29,
              "slot": 3
            },
            {
              "generalId": "elite_vanguard",
              "level": 28,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 1560,
            "food": 320,
            "exp": 560,
            "dropTable": "elite",
            "dropChance": 0.55
          },
          "aliases": [
            "st_03_05"
          ],
          "staminaCost": 210,
          "stamina_cost": 210,
          "enemyFormationId": "square",
          "enemy_formation_id": "ef_ch3_s5"
        },
        {
          "id": "ch3_s6",
          "index": 6,
          "name": "Viên Thiệu — Bá chủ Hà Bắc",
          "type": "boss",
          "powerHint": 2.95,
          "enemies": [
            {
              "generalId": "yuanshao",
              "level": 36,
              "slot": 1
            },
            {
              "generalId": "yanliang",
              "level": 32,
              "slot": 0
            },
            {
              "generalId": "wenchou",
              "level": 32,
              "slot": 2
            },
            {
              "generalId": "jushou",
              "level": 30,
              "slot": 3
            },
            {
              "generalId": "tianfeng",
              "level": 30,
              "slot": 4
            }
          ],
          "rewards": {
            "silver": 2700,
            "food": 500,
            "exp": 800,
            "gold": 12,
            "dropTable": "boss",
            "dropChance": 0.8,
            "firstClearBonus": {
              "silver": 500,
              "itemId": "blade_qinglong"
            }
          },
          "aliases": [
            "st_03_06"
          ],
          "staminaCost": 350,
          "stamina_cost": 350,
          "enemyFormationId": "long_snake",
          "enemy_formation_id": "ef_ch3_s6",
          "unlockFeatures": [
            "campaign_hard",
            "legend_recruit"
          ]
        }
      ],
      "aliases": [
        "ch_03"
      ]
    }
  ],
  "defaults": {
    "loseFoodRatio": 0.5
  }
},
"arena": {
  "schemaVersion": 3,
  "id": "nl_arena_v3",
  "dailyChallenges": 5,
  "playerInitialRank": 36,
  "evolution": {
    "tickIntervalHours": 1,
    "maxCatchupHours": 72,
    "maxTyVuLevel": 180,
    "tiers": {
      "WEAK": {
        "statGrowthPerHour": 0.004,
        "levelHours": 12,
        "silverPerHour": 1200,
        "maxLevel": 40
      },
      "MEDIUM": {
        "statGrowthPerHour": 0.007,
        "levelHours": 8,
        "silverPerHour": 4000,
        "maxLevel": 90
      },
      "STRONG": {
        "statGrowthPerHour": 0.01,
        "levelHours": 6,
        "silverPerHour": 9000,
        "maxLevel": 180
      }
    }
  },
  "scaling": {
    "neighborWindow": 4,
    "minRatioToPlayer": 0.78,
    "maxRatioToPlayer": 1.35
  },
  "rewards": {
    "winBaseSilver": 300,
    "winSilverPerTier": 150,
    "winHonor": 25,
    "winPrestige": 20,
    "loseSilver": 60,
    "loseHonor": 5,
    "rankBonusTop10Gem": 5
  },
  "bots": [
    {
      "bot_id": "bot_npc_01",
      "name": "Lã Bố (NPC)",
      "rank": 1,
      "tier": "STRONG",
      "level": 45,
      "resources": {
        "silver": 1125000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 45
        }
      ],
      "deployed_formation": {
        "formation_id": "long_snake",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "lubu",
            "hero_alias": "h_lubu",
            "hero_level": 45,
            "equip_level": 43
          },
          {
            "slot": 2,
            "hero_id": "huaxiong",
            "hero_alias": "h_huaxiong",
            "hero_level": 45,
            "equip_level": 43
          },
          {
            "slot": 3,
            "hero_id": "zhangliao",
            "hero_alias": "h_zhangliao",
            "hero_level": 45,
            "equip_level": 43
          },
          {
            "slot": 4,
            "hero_id": "veteran_rider",
            "hero_alias": "h_veteran_rider",
            "hero_level": 45,
            "equip_level": 43
          },
          {
            "slot": 5,
            "hero_id": "veteran_archer",
            "hero_alias": "h_veteran_archer",
            "hero_level": 45,
            "equip_level": 43
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_02",
      "name": "Tào Tháo (NPC)",
      "rank": 2,
      "tier": "STRONG",
      "level": 42,
      "resources": {
        "silver": 1050000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 42
        }
      ],
      "deployed_formation": {
        "formation_id": "crane_wing",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "caocao",
            "hero_alias": "h_caocao",
            "hero_level": 42,
            "equip_level": 40
          },
          {
            "slot": 2,
            "hero_id": "simayi",
            "hero_alias": "h_simayi",
            "hero_level": 42,
            "equip_level": 40
          },
          {
            "slot": 3,
            "hero_id": "xuchu",
            "hero_alias": "h_xuchu",
            "hero_level": 42,
            "equip_level": 40
          },
          {
            "slot": 4,
            "hero_id": "dianwei",
            "hero_alias": "h_dianwei",
            "hero_level": 42,
            "equip_level": 40
          },
          {
            "slot": 5,
            "hero_id": "guojia",
            "hero_alias": "h_guojia",
            "hero_level": 42,
            "equip_level": 40
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_03",
      "name": "Gia Cát Lượng (NPC)",
      "rank": 3,
      "tier": "STRONG",
      "level": 40,
      "resources": {
        "silver": 1000000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 40
        }
      ],
      "deployed_formation": {
        "formation_id": "crane_wing",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "zhugeliang",
            "hero_alias": "h_zhugeliang",
            "hero_level": 40,
            "equip_level": 38
          },
          {
            "slot": 2,
            "hero_id": "guanyu",
            "hero_alias": "h_guanyu",
            "hero_level": 40,
            "equip_level": 38
          },
          {
            "slot": 3,
            "hero_id": "zhangfei",
            "hero_alias": "h_zhangfei",
            "hero_level": 40,
            "equip_level": 38
          },
          {
            "slot": 4,
            "hero_id": "zhaoyun",
            "hero_alias": "h_zhaoyun",
            "hero_level": 40,
            "equip_level": 38
          },
          {
            "slot": 5,
            "hero_id": "huangzhong",
            "hero_alias": "h_huangzhong",
            "hero_level": 40,
            "equip_level": 38
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_04",
      "name": "Chu Du (NPC)",
      "rank": 4,
      "tier": "STRONG",
      "level": 38,
      "resources": {
        "silver": 950000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 38
        }
      ],
      "deployed_formation": {
        "formation_id": "arrow",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "zhouyu",
            "hero_alias": "h_zhouyu",
            "hero_level": 38,
            "equip_level": 36
          },
          {
            "slot": 2,
            "hero_id": "sunce",
            "hero_alias": "h_sunce",
            "hero_level": 38,
            "equip_level": 36
          },
          {
            "slot": 3,
            "hero_id": "taishici",
            "hero_alias": "h_taishici",
            "hero_level": 38,
            "equip_level": 36
          },
          {
            "slot": 4,
            "hero_id": "ganning",
            "hero_alias": "h_ganning",
            "hero_level": 38,
            "equip_level": 36
          },
          {
            "slot": 5,
            "hero_id": "luxun",
            "hero_alias": "h_luxun",
            "hero_level": 38,
            "equip_level": 36
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_05",
      "name": "Quan Vũ (NPC)",
      "rank": 5,
      "tier": "STRONG",
      "level": 36,
      "resources": {
        "silver": 900000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 36
        }
      ],
      "deployed_formation": {
        "formation_id": "long_snake",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "guanyu",
            "hero_alias": "h_guanyu",
            "hero_level": 36,
            "equip_level": 34
          },
          {
            "slot": 2,
            "hero_id": "guanying",
            "hero_alias": "h_guanying",
            "hero_level": 36,
            "equip_level": 34
          },
          {
            "slot": 3,
            "hero_id": "liaohua",
            "hero_alias": "h_liaohua",
            "hero_level": 36,
            "equip_level": 34
          },
          {
            "slot": 4,
            "hero_id": "wangping",
            "hero_alias": "h_wangping",
            "hero_level": 36,
            "equip_level": 34
          },
          {
            "slot": 5,
            "hero_id": "madai",
            "hero_alias": "h_madai",
            "hero_level": 36,
            "equip_level": 34
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_06",
      "name": "Tư Mã Ý (NPC)",
      "rank": 6,
      "tier": "STRONG",
      "level": 35,
      "resources": {
        "silver": 875000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 35
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "simayi",
            "hero_alias": "h_simayi",
            "hero_level": 35,
            "equip_level": 33
          },
          {
            "slot": 2,
            "hero_id": "zhanghe",
            "hero_alias": "h_zhanghe",
            "hero_level": 35,
            "equip_level": 33
          },
          {
            "slot": 3,
            "hero_id": "xuhuang",
            "hero_alias": "h_xuhuang",
            "hero_level": 35,
            "equip_level": 33
          },
          {
            "slot": 4,
            "hero_id": "caoren",
            "hero_alias": "h_caoren",
            "hero_level": 35,
            "equip_level": 33
          },
          {
            "slot": 5,
            "hero_id": "jiaxu",
            "hero_alias": "h_jiaxu",
            "hero_level": 35,
            "equip_level": 33
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_07",
      "name": "Triệu Vân (NPC)",
      "rank": 7,
      "tier": "STRONG",
      "level": 34,
      "resources": {
        "silver": 850000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 34
        }
      ],
      "deployed_formation": {
        "formation_id": "fish_scale",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "zhaoyun",
            "hero_alias": "h_zhaoyun",
            "hero_level": 34,
            "equip_level": 32
          },
          {
            "slot": 2,
            "hero_id": "machao",
            "hero_alias": "h_machao",
            "hero_level": 34,
            "equip_level": 32
          },
          {
            "slot": 3,
            "hero_id": "weiyan",
            "hero_alias": "h_weiyan",
            "hero_level": 34,
            "equip_level": 32
          },
          {
            "slot": 4,
            "hero_id": "fazheng",
            "hero_alias": "h_fazheng",
            "hero_level": 34,
            "equip_level": 32
          },
          {
            "slot": 5,
            "hero_id": "xushu",
            "hero_alias": "h_xushu",
            "hero_level": 34,
            "equip_level": 32
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_08",
      "name": "Tôn Sách (NPC)",
      "rank": 8,
      "tier": "STRONG",
      "level": 32,
      "resources": {
        "silver": 800000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 32
        }
      ],
      "deployed_formation": {
        "formation_id": "long_snake",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "sunce",
            "hero_alias": "h_sunce",
            "hero_level": 32,
            "equip_level": 30
          },
          {
            "slot": 2,
            "hero_id": "zhouyu",
            "hero_alias": "h_zhouyu",
            "hero_level": 32,
            "equip_level": 30
          },
          {
            "slot": 3,
            "hero_id": "chengpu",
            "hero_alias": "h_chengpu",
            "hero_level": 32,
            "equip_level": 30
          },
          {
            "slot": 4,
            "hero_id": "huanggai",
            "hero_alias": "h_huanggai",
            "hero_level": 32,
            "equip_level": 30
          },
          {
            "slot": 5,
            "hero_id": "handang",
            "hero_alias": "h_handang",
            "hero_level": 32,
            "equip_level": 30
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_09",
      "name": "Viên Thiệu (NPC)",
      "rank": 9,
      "tier": "STRONG",
      "level": 30,
      "resources": {
        "silver": 750000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 30
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "yuanshao",
            "hero_alias": "h_yuanshao",
            "hero_level": 30,
            "equip_level": 28
          },
          {
            "slot": 2,
            "hero_id": "yanliang",
            "hero_alias": "h_yanliang",
            "hero_level": 30,
            "equip_level": 28
          },
          {
            "slot": 3,
            "hero_id": "wenchou",
            "hero_alias": "h_wenchou",
            "hero_level": 30,
            "equip_level": 28
          },
          {
            "slot": 4,
            "hero_id": "tianfeng",
            "hero_alias": "h_tianfeng",
            "hero_level": 30,
            "equip_level": 28
          },
          {
            "slot": 5,
            "hero_id": "jushou",
            "hero_alias": "h_jushou",
            "hero_level": 30,
            "equip_level": 28
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_10",
      "name": "Đổng Trác (NPC)",
      "rank": 10,
      "tier": "STRONG",
      "level": 29,
      "resources": {
        "silver": 725000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 29
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "dongzhuo",
            "hero_alias": "h_dongzhuo",
            "hero_level": 29,
            "equip_level": 27
          },
          {
            "slot": 2,
            "hero_id": "huaxiong",
            "hero_alias": "h_huaxiong",
            "hero_level": 29,
            "equip_level": 27
          },
          {
            "slot": 3,
            "hero_id": "liru",
            "hero_alias": "h_liru",
            "hero_level": 29,
            "equip_level": 27
          },
          {
            "slot": 4,
            "hero_id": "liuru",
            "hero_alias": "h_liuru",
            "hero_level": 29,
            "equip_level": 27
          },
          {
            "slot": 5,
            "hero_id": "guosi",
            "hero_alias": "h_guosi",
            "hero_level": 29,
            "equip_level": 27
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_11",
      "name": "Trương Liêu (NPC)",
      "rank": 11,
      "tier": "MEDIUM",
      "level": 27,
      "resources": {
        "silver": 675000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 27
        }
      ],
      "deployed_formation": {
        "formation_id": "crane_wing",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "zhangliao",
            "hero_alias": "h_zhangliao",
            "hero_level": 27,
            "equip_level": 25
          },
          {
            "slot": 2,
            "hero_id": "yuejin",
            "hero_alias": "h_yuejin",
            "hero_level": 27,
            "equip_level": 25
          },
          {
            "slot": 3,
            "hero_id": "licadian",
            "hero_alias": "h_licadian",
            "hero_level": 27,
            "equip_level": 25
          },
          {
            "slot": 4,
            "hero_id": "veteran_rider",
            "hero_alias": "h_veteran_rider",
            "hero_level": 27,
            "equip_level": 25
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_12",
      "name": "Mã Siêu (NPC)",
      "rank": 12,
      "tier": "MEDIUM",
      "level": 26,
      "resources": {
        "silver": 650000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 26
        }
      ],
      "deployed_formation": {
        "formation_id": "long_snake",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "machao",
            "hero_alias": "h_machao",
            "hero_level": 26,
            "equip_level": 24
          },
          {
            "slot": 2,
            "hero_id": "madai",
            "hero_alias": "h_madai",
            "hero_level": 26,
            "equip_level": 24
          },
          {
            "slot": 3,
            "hero_id": "recruit_guard",
            "hero_alias": "h_recruit_guard",
            "hero_level": 26,
            "equip_level": 24
          },
          {
            "slot": 4,
            "hero_id": "veteran_rider",
            "hero_alias": "h_veteran_rider",
            "hero_level": 26,
            "equip_level": 24
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_13",
      "name": "Lục Tốn (NPC)",
      "rank": 13,
      "tier": "MEDIUM",
      "level": 25,
      "resources": {
        "silver": 625000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 25
        }
      ],
      "deployed_formation": {
        "formation_id": "arrow",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "luxun",
            "hero_alias": "h_luxun",
            "hero_level": 25,
            "equip_level": 23
          },
          {
            "slot": 2,
            "hero_id": "lusu",
            "hero_alias": "h_lusu",
            "hero_level": 25,
            "equip_level": 23
          },
          {
            "slot": 3,
            "hero_id": "zhugejin",
            "hero_alias": "h_zhugejin",
            "hero_level": 25,
            "equip_level": 23
          },
          {
            "slot": 4,
            "hero_id": "veteran_archer",
            "hero_alias": "h_veteran_archer",
            "hero_level": 25,
            "equip_level": 23
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_14",
      "name": "Lưu Bị (NPC)",
      "rank": 14,
      "tier": "MEDIUM",
      "level": 24,
      "resources": {
        "silver": 600000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 24
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "liubei",
            "hero_alias": "h_liubei",
            "hero_level": 24,
            "equip_level": 22
          },
          {
            "slot": 2,
            "hero_id": "zhangfei",
            "hero_alias": "h_zhangfei",
            "hero_level": 24,
            "equip_level": 22
          },
          {
            "slot": 3,
            "hero_id": "pangtong",
            "hero_alias": "h_pangtong",
            "hero_level": 24,
            "equip_level": 22
          },
          {
            "slot": 4,
            "hero_id": "liufeng",
            "hero_alias": "h_liufeng",
            "hero_level": 24,
            "equip_level": 22
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_15",
      "name": "Tôn Quyền (NPC)",
      "rank": 15,
      "tier": "MEDIUM",
      "level": 20,
      "resources": {
        "silver": 500000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 20
        }
      ],
      "deployed_formation": {
        "formation_id": "crane_wing",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "sunquan",
            "hero_alias": "h_sunquan",
            "hero_level": 20,
            "equip_level": 18
          },
          {
            "slot": 2,
            "hero_id": "zhouzhi",
            "hero_alias": "h_zhouzhi",
            "hero_level": 20,
            "equip_level": 18
          },
          {
            "slot": 3,
            "hero_id": "lingtong",
            "hero_alias": "h_lingtong",
            "hero_level": 20,
            "equip_level": 18
          },
          {
            "slot": 4,
            "hero_id": "zhangzhao",
            "hero_alias": "h_zhangzhao",
            "hero_level": 20,
            "equip_level": 18
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_16",
      "name": "Hứa Chử (NPC)",
      "rank": 16,
      "tier": "MEDIUM",
      "level": 21,
      "resources": {
        "silver": 525000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 21
        }
      ],
      "deployed_formation": {
        "formation_id": "fish_scale",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "xuchu",
            "hero_alias": "h_xuchu",
            "hero_level": 21,
            "equip_level": 19
          },
          {
            "slot": 2,
            "hero_id": "dianwei",
            "hero_alias": "h_dianwei",
            "hero_level": 21,
            "equip_level": 19
          },
          {
            "slot": 3,
            "hero_id": "caopi",
            "hero_alias": "h_caopi",
            "hero_level": 21,
            "equip_level": 19
          },
          {
            "slot": 4,
            "hero_id": "veteran_guard",
            "hero_alias": "h_veteran_guard",
            "hero_level": 21,
            "equip_level": 19
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_17",
      "name": "Hoàng Trung (NPC)",
      "rank": 17,
      "tier": "MEDIUM",
      "level": 20,
      "resources": {
        "silver": 500000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 20
        }
      ],
      "deployed_formation": {
        "formation_id": "arrow",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "huangzhong",
            "hero_alias": "h_huangzhong",
            "hero_level": 20,
            "equip_level": 18
          },
          {
            "slot": 2,
            "hero_id": "weiyan",
            "hero_alias": "h_weiyan",
            "hero_level": 20,
            "equip_level": 18
          },
          {
            "slot": 3,
            "hero_id": "wangping",
            "hero_alias": "h_wangping",
            "hero_level": 20,
            "equip_level": 18
          },
          {
            "slot": 4,
            "hero_id": "veteran_archer",
            "hero_alias": "h_veteran_archer",
            "hero_level": 20,
            "equip_level": 18
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_18",
      "name": "Cam Ninh (NPC)",
      "rank": 18,
      "tier": "MEDIUM",
      "level": 19,
      "resources": {
        "silver": 475000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 19
        }
      ],
      "deployed_formation": {
        "formation_id": "long_snake",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "ganning",
            "hero_alias": "h_ganning",
            "hero_level": 19,
            "equip_level": 17
          },
          {
            "slot": 2,
            "hero_id": "lingtong",
            "hero_alias": "h_lingtong",
            "hero_level": 19,
            "equip_level": 17
          },
          {
            "slot": 3,
            "hero_id": "taishici",
            "hero_alias": "h_taishici",
            "hero_level": 19,
            "equip_level": 17
          },
          {
            "slot": 4,
            "hero_id": "veteran_spear",
            "hero_alias": "h_veteran_spear",
            "hero_level": 19,
            "equip_level": 17
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_19",
      "name": "Hạ Hầu Đ惇 (NPC)",
      "rank": 19,
      "tier": "MEDIUM",
      "level": 18,
      "resources": {
        "silver": 450000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 18
        }
      ],
      "deployed_formation": {
        "formation_id": "crane_wing",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "xiahou_dun",
            "hero_alias": "h_xiahou_dun",
            "hero_level": 18,
            "equip_level": 16
          },
          {
            "slot": 2,
            "hero_id": "xiahou_yuan",
            "hero_alias": "h_xiahou_yuan",
            "hero_level": 18,
            "equip_level": 16
          },
          {
            "slot": 3,
            "hero_id": "caoren",
            "hero_alias": "h_caoren",
            "hero_level": 18,
            "equip_level": 16
          },
          {
            "slot": 4,
            "hero_id": "veteran_rider",
            "hero_alias": "h_veteran_rider",
            "hero_level": 18,
            "equip_level": 16
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_20",
      "name": "Khương Duy (NPC)",
      "rank": 20,
      "tier": "MEDIUM",
      "level": 17,
      "resources": {
        "silver": 425000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 17
        }
      ],
      "deployed_formation": {
        "formation_id": "fish_scale",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "jiangwei",
            "hero_alias": "h_jiangwei",
            "hero_level": 17,
            "equip_level": 15
          },
          {
            "slot": 2,
            "hero_id": "liaohua",
            "hero_alias": "h_liaohua",
            "hero_level": 17,
            "equip_level": 15
          },
          {
            "slot": 3,
            "hero_id": "zhangbao_shu",
            "hero_alias": "h_zhangbao_shu",
            "hero_level": 17,
            "equip_level": 15
          },
          {
            "slot": 4,
            "hero_id": "veteran_spear",
            "hero_alias": "h_veteran_spear",
            "hero_level": 17,
            "equip_level": 15
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_21",
      "name": "Công Tôn Toản (NPC)",
      "rank": 21,
      "tier": "MEDIUM",
      "level": 16,
      "resources": {
        "silver": 400000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 16
        }
      ],
      "deployed_formation": {
        "formation_id": "long_snake",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "gongsunzan",
            "hero_alias": "h_gongsunzan",
            "hero_level": 16,
            "equip_level": 14
          },
          {
            "slot": 2,
            "hero_id": "veteran_rider",
            "hero_alias": "h_veteran_rider",
            "hero_level": 16,
            "equip_level": 14
          },
          {
            "slot": 3,
            "hero_id": "veteran_rider",
            "hero_alias": "h_veteran_rider",
            "hero_level": 16,
            "equip_level": 14
          },
          {
            "slot": 4,
            "hero_id": "veteran_archer",
            "hero_alias": "h_veteran_archer",
            "hero_level": 16,
            "equip_level": 14
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_22",
      "name": "Trương Giác (NPC)",
      "rank": 22,
      "tier": "MEDIUM",
      "level": 15,
      "resources": {
        "silver": 375000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 15
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "zhangjiao",
            "hero_alias": "h_zhangjiao",
            "hero_level": 15,
            "equip_level": 13
          },
          {
            "slot": 2,
            "hero_id": "zhangbao",
            "hero_alias": "h_zhangbao",
            "hero_level": 15,
            "equip_level": 13
          },
          {
            "slot": 3,
            "hero_id": "zhangliang",
            "hero_alias": "h_zhangliang",
            "hero_level": 15,
            "equip_level": 13
          },
          {
            "slot": 4,
            "hero_id": "yellow_shaman",
            "hero_alias": "h_yellow_shaman",
            "hero_level": 15,
            "equip_level": 13
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_23",
      "name": "Lưu Biểu (NPC)",
      "rank": 23,
      "tier": "WEAK",
      "level": 13,
      "resources": {
        "silver": 325000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 13
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "liubiao",
            "hero_alias": "h_liubiao",
            "hero_level": 13,
            "equip_level": 11
          },
          {
            "slot": 2,
            "hero_id": "veteran_guard",
            "hero_alias": "h_veteran_guard",
            "hero_level": 13,
            "equip_level": 11
          },
          {
            "slot": 3,
            "hero_id": "veteran_spear",
            "hero_alias": "h_veteran_spear",
            "hero_level": 13,
            "equip_level": 11
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_24",
      "name": "Đào Khiêm (NPC)",
      "rank": 24,
      "tier": "WEAK",
      "level": 12,
      "resources": {
        "silver": 300000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 12
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "taogian",
            "hero_alias": "h_taogian",
            "hero_level": 12,
            "equip_level": 10
          },
          {
            "slot": 2,
            "hero_id": "veteran_guard",
            "hero_alias": "h_veteran_guard",
            "hero_level": 12,
            "equip_level": 10
          },
          {
            "slot": 3,
            "hero_id": "recruit_crossbow",
            "hero_alias": "h_recruit_crossbow",
            "hero_level": 12,
            "equip_level": 10
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_25",
      "name": "Hoa Hùng (NPC)",
      "rank": 25,
      "tier": "WEAK",
      "level": 11,
      "resources": {
        "silver": 275000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 11
        }
      ],
      "deployed_formation": {
        "formation_id": "long_snake",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "huaxiong",
            "hero_alias": "h_huaxiong",
            "hero_level": 11,
            "equip_level": 9
          },
          {
            "slot": 2,
            "hero_id": "recruit_rider",
            "hero_alias": "h_recruit_rider",
            "hero_level": 11,
            "equip_level": 9
          },
          {
            "slot": 3,
            "hero_id": "recruit_spearman",
            "hero_alias": "h_recruit_spearman",
            "hero_level": 11,
            "equip_level": 9
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_26",
      "name": "Nhan Lương (NPC)",
      "rank": 26,
      "tier": "WEAK",
      "level": 10,
      "resources": {
        "silver": 250000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 10
        }
      ],
      "deployed_formation": {
        "formation_id": "crane_wing",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "yanliang",
            "hero_alias": "h_yanliang",
            "hero_level": 10,
            "equip_level": 8
          },
          {
            "slot": 2,
            "hero_id": "wenchou",
            "hero_alias": "h_wenchou",
            "hero_level": 10,
            "equip_level": 8
          },
          {
            "slot": 3,
            "hero_id": "recruit_guard",
            "hero_alias": "h_recruit_guard",
            "hero_level": 10,
            "equip_level": 8
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_27",
      "name": "Trình Phổ (NPC)",
      "rank": 27,
      "tier": "WEAK",
      "level": 9,
      "resources": {
        "silver": 225000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 9
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "chengpu",
            "hero_alias": "h_chengpu",
            "hero_level": 9,
            "equip_level": 7
          },
          {
            "slot": 2,
            "hero_id": "handang",
            "hero_alias": "h_handang",
            "hero_level": 9,
            "equip_level": 7
          },
          {
            "slot": 3,
            "hero_id": "recruit_spearman",
            "hero_alias": "h_recruit_spearman",
            "hero_level": 9,
            "equip_level": 7
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_28",
      "name": "Nhạc Tiến (NPC)",
      "rank": 28,
      "tier": "WEAK",
      "level": 8,
      "resources": {
        "silver": 200000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 8
        }
      ],
      "deployed_formation": {
        "formation_id": "fish_scale",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "yuejin",
            "hero_alias": "h_yuejin",
            "hero_level": 8,
            "equip_level": 6
          },
          {
            "slot": 2,
            "hero_id": "licadian",
            "hero_alias": "h_licadian",
            "hero_level": 8,
            "equip_level": 6
          },
          {
            "slot": 3,
            "hero_id": "recruit_blade",
            "hero_alias": "h_recruit_blade",
            "hero_level": 8,
            "equip_level": 6
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_29",
      "name": "Liêu Hóa (NPC)",
      "rank": 29,
      "tier": "WEAK",
      "level": 7,
      "resources": {
        "silver": 175000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 7
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "liaohua",
            "hero_alias": "h_liaohua",
            "hero_level": 7,
            "equip_level": 5
          },
          {
            "slot": 2,
            "hero_id": "liufeng",
            "hero_alias": "h_liufeng",
            "hero_level": 7,
            "equip_level": 5
          },
          {
            "slot": 3,
            "hero_id": "recruit_guard",
            "hero_alias": "h_recruit_guard",
            "hero_level": 7,
            "equip_level": 5
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_30",
      "name": "Trương Bảo (NPC)",
      "rank": 30,
      "tier": "WEAK",
      "level": 6,
      "resources": {
        "silver": 150000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 6
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "zhangbao",
            "hero_alias": "h_zhangbao",
            "hero_level": 6,
            "equip_level": 4
          },
          {
            "slot": 2,
            "hero_id": "yellow_zealot",
            "hero_alias": "h_yellow_zealot",
            "hero_level": 6,
            "equip_level": 4
          },
          {
            "slot": 3,
            "hero_id": "yellow_shaman",
            "hero_alias": "h_yellow_shaman",
            "hero_level": 6,
            "equip_level": 4
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_31",
      "name": "Phàn Trù (NPC)",
      "rank": 31,
      "tier": "WEAK",
      "level": 5,
      "resources": {
        "silver": 125000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 5
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "fancho",
            "hero_alias": "h_fancho",
            "hero_level": 5,
            "equip_level": 3
          },
          {
            "slot": 2,
            "hero_id": "zhangji_dz",
            "hero_alias": "h_zhangji_dz",
            "hero_level": 5,
            "equip_level": 3
          },
          {
            "slot": 3,
            "hero_id": "recruit_rider",
            "hero_alias": "h_recruit_rider",
            "hero_level": 5,
            "equip_level": 3
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_32",
      "name": "ừ Cừ帥 Khăn Vàng (NPC)",
      "rank": 32,
      "tier": "WEAK",
      "level": 4,
      "resources": {
        "silver": 100000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 4
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "yellow_captain",
            "hero_alias": "h_yellow_captain",
            "hero_level": 4,
            "equip_level": 2
          },
          {
            "slot": 2,
            "hero_id": "yellow_zealot",
            "hero_alias": "h_yellow_zealot",
            "hero_level": 4,
            "equip_level": 2
          },
          {
            "slot": 3,
            "hero_id": "recruit_militia",
            "hero_alias": "h_recruit_militia",
            "hero_level": 4,
            "equip_level": 2
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_33",
      "name": "Đô Úy Kỵ Binh (NPC)",
      "rank": 33,
      "tier": "WEAK",
      "level": 3,
      "resources": {
        "silver": 75000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 3
        }
      ],
      "deployed_formation": {
        "formation_id": "long_snake",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "veteran_rider",
            "hero_alias": "h_veteran_rider",
            "hero_level": 3,
            "equip_level": 1
          },
          {
            "slot": 2,
            "hero_id": "recruit_rider",
            "hero_alias": "h_recruit_rider",
            "hero_level": 3,
            "equip_level": 1
          },
          {
            "slot": 3,
            "hero_id": "recruit_scout",
            "hero_alias": "h_recruit_scout",
            "hero_level": 3,
            "equip_level": 1
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_34",
      "name": "Hiệu Úy Tuần Thành (NPC)",
      "rank": 34,
      "tier": "WEAK",
      "level": 2,
      "resources": {
        "silver": 50000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 2
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "recruit_blade",
            "hero_alias": "h_recruit_blade",
            "hero_level": 2,
            "equip_level": 1
          },
          {
            "slot": 2,
            "hero_id": "recruit_guard",
            "hero_alias": "h_recruit_guard",
            "hero_level": 2,
            "equip_level": 1
          },
          {
            "slot": 3,
            "hero_id": "recruit_spearman",
            "hero_alias": "h_recruit_spearman",
            "hero_level": 2,
            "equip_level": 1
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    },
    {
      "bot_id": "bot_npc_35",
      "name": "Đội Trưởng Tân Binh (NPC)",
      "rank": 35,
      "tier": "WEAK",
      "level": 1,
      "resources": {
        "silver": 25000
      },
      "buildings": [
        {
          "building_id": "b_tyvu",
          "level": 1
        }
      ],
      "deployed_formation": {
        "formation_id": "square",
        "formation_alias": "f_hacdieu",
        "slots": [
          {
            "slot": 1,
            "hero_id": "recruit_guard",
            "hero_alias": "h_recruit_guard",
            "hero_level": 1,
            "equip_level": 1
          },
          {
            "slot": 2,
            "hero_id": "recruit_militia",
            "hero_alias": "h_recruit_militia",
            "hero_level": 1,
            "equip_level": 1
          }
        ]
      },
      "last_updated_timestamp": 1711900000
    }
  ]
},
"progression": {
  "schemaVersion": 1,
  "id": "main_progression_v1",
  "name": "Tiến trình Tam Quốc",
  "inspiredBy": "Ngọa Long / 卧龙吟 — uy danh mở slot tướng; phó bản thu phục; tửu quán hội đàm theo điều kiện",
  "notes": [
    "Danh vọng (prestige) ≈ Uy danh: mở thêm chỗ chứa tướng + mở chiêu mộ mốc.",
    "Qua ải lần đầu có thể nhận tướng (dã tướng) hoặc mở khóa Tửu Quán (required_stage).",
    "Tướng mở đầu theo phe — không trùng thưởng first-clear."
  ],
  "starters": {
    "note": "Giống 卧龙吟: mở đầu tướng phụ (xanh/lam), minh chủ & ngũ hổ mở muộn bằng uy danh / phó bản — không tặng Quan Vũ/Tào Tháo lúc tạo nhân vật.",
    "shu": {
      "generalIds": [
        "liaohua",
        "guanying",
        "zhangbao_shu"
      ],
      "blurb": "Thục: Liêu Hóa · Quan Bình · Trương Bào — tướng trẻ / phụ ban đầu."
    },
    "wei": {
      "generalIds": [
        "yuejin",
        "licadian",
        "caoren"
      ],
      "blurb": "Ngụy: Nhạc Tiến · Lý Điển · Tào Nhân — ngũ tử lương tướng / thủ thành sớm."
    },
    "wu": {
      "generalIds": [
        "chengpu",
        "handang",
        "zhouzhi"
      ],
      "blurb": "Ngô: Trình Phổ · Hàn Đương · Chu Thái — kỳ cựu Giang Đông thời sơ."
    }
  },
  "prestigeRanks": [
    {
      "rank": 1,
      "prestige": 0,
      "title": "Bạch Đinh",
      "heroSlotsBonus": 0
    },
    {
      "rank": 2,
      "prestige": 100,
      "title": "Hiệu Úy I",
      "heroSlotsBonus": 1,
      "unlockNote": "Mở thêm 1 chỗ kho tướng"
    },
    {
      "rank": 3,
      "prestige": 300,
      "title": "Hiệu Úy II",
      "heroSlotsBonus": 1
    },
    {
      "rank": 4,
      "prestige": 500,
      "title": "Hiệu Úy III",
      "heroSlotsBonus": 2,
      "unlockNote": "Mở chiêu mộ theo danh vọng (tím)"
    },
    {
      "rank": 5,
      "prestige": 800,
      "title": "Hiệu Úy IV",
      "heroSlotsBonus": 2
    },
    {
      "rank": 6,
      "prestige": 1200,
      "title": "Hộ Quân I",
      "heroSlotsBonus": 3,
      "unlockNote": "Mở slot trận linh hoạt hơn"
    },
    {
      "rank": 7,
      "prestige": 2000,
      "title": "Hộ Quân II",
      "heroSlotsBonus": 3
    },
    {
      "rank": 8,
      "prestige": 3500,
      "title": "Trấn Quân",
      "heroSlotsBonus": 4
    },
    {
      "rank": 9,
      "prestige": 5000,
      "title": "Tướng Quân",
      "heroSlotsBonus": 5
    },
    {
      "rank": 10,
      "prestige": 8000,
      "title": "Đô Đốc",
      "heroSlotsBonus": 6
    }
  ],
  "howToGainPrestige": [
    "Thắng phó bản (thưởng danh vọng theo ải + first-clear)",
    "Thắng lãnh địa Thế giới",
    "Thắng Lôi đài"
  ],
  "stageLinks": {
    "ch1_s1": {
      "story": "Loạn Khăn Vàng bùng ở Trác Châu. Quan quân tập kết.",
      "mission": "Dẹp toán nghĩa quân đầu tiên — làm quen bày trận 5 ô.",
      "firstClear": {
        "prestige": 25,
        "hint": "Tửu Quán: mở chiêu mộ lính trắng / xanh cơ bản (danh vọng thấp)."
      }
    },
    "ch1_s2": {
      "story": "Khăn Vàng tập kết. Có thể thu phục nghĩa sĩ quy thuận.",
      "mission": "Phá vòng vây — thu phục tướng phụ đầu tiên theo phe.",
      "firstClear": {
        "prestige": 40,
        "grantByFaction": {
          "shu": "liufeng",
          "wei": "veteran_guard",
          "wu": "lingtong"
        },
        "hint": "Thu phục thêm 1 tướng phụ. Tửu Quán mở thêm xanh/lam."
      }
    },
    "ch1_s3": {
      "story": "Trương Bảo dùng yêu thuật. Elite đầu tiên.",
      "mission": "Hạ Trương Bảo — học ưu tiên mục tiêu.",
      "firstClear": {
        "prestige": 55,
        "hint": "Mở thêm chiêu mộ tướng lam sớm tại Tửu Quán."
      }
    },
    "ch1_s4": {
      "story": "Trương Lương phục binh. Mưu sĩ bắt đầu lộ diện.",
      "mission": "Phá phục binh — mở chiêu mộ mưu sĩ (tím, cần danh vọng).",
      "firstClear": {
        "prestige": 70,
        "grantByFaction": {
          "shu": "madai",
          "wei": "zhanghe",
          "wu": "huanggai"
        },
        "hint": "Tửu Quán: mưu sĩ tím cần vượt ải này + ~500 danh vọng."
      }
    },
    "ch1_s5": {
      "story": "Áp sát Quảng Tông — trước cửa đại doanh Trương Giác.",
      "mission": "Giữ đội hình, chuẩn bị boss chương.",
      "firstClear": {
        "prestige": 80
      }
    },
    "ch1_s6": {
      "story": "Trương Giác — Hoàng Thiên đã chết. Loạn Khăn Vàng tạm dẹp.",
      "mission": "Boss chương 1 — mở Lôi đài + chiêu mộ nâng cao.",
      "firstClear": {
        "prestige": 150,
        "grantByFaction": {
          "shu": "wangping",
          "wei": "xiahou_yuan",
          "wu": "daqiao"
        },
        "hint": "Mở Lôi đài. Minh chủ / ngũ hổ vẫn khóa danh vọng cao."
      }
    },
    "ch2_s1": {
      "story": "Đổng Trác loạn chính. Liên quân tiến Dương Nhân.",
      "mission": "Bước vào chương Đổng Trác.",
      "firstClear": {
        "prestige": 60
      }
    },
    "ch2_s2": {
      "story": "Phàn Trù chặn đường.",
      "firstClear": {
        "prestige": 70,
        "grantByFaction": {
          "shu": "fazheng",
          "wei": "xuchu",
          "wu": "lusu"
        }
      }
    },
    "ch2_s3": {
      "story": "Hoa Hùng tại Hổ Lao — ải danh tướng.",
      "mission": "Hạ Hoa Hùng — mở khóa danh tướng trung kỳ.",
      "firstClear": {
        "prestige": 120,
        "hint": "Tửu Quán: mở thêm cam/tím (Khương Duy, Trương Liêu, Cam Ninh…) nếu đủ danh vọng."
      }
    },
    "ch2_s4": {
      "story": "Lý Thôi · Quách Dĩ quấy phá.",
      "firstClear": {
        "prestige": 90
      }
    },
    "ch2_s5": {
      "story": "Tam Anh chiến Lã Bố — đỉnh chương 2.",
      "mission": "Sống sót trước Lã Bố — mở chiêu mộ cao cấp.",
      "firstClear": {
        "prestige": 180,
        "grantByFaction": {
          "shu": "weiyan",
          "wei": "zhangliao",
          "wu": "ganning"
        },
        "hint": "Mở thêm tướng cam. Lưu Bị / Tào Tháo / Tôn Quyền cần danh vọng rất cao."
      }
    },
    "ch2_s6": {
      "story": "Đổng Trác bỏ Lạc Dương. Liên quân tan.",
      "mission": "Boss chương 2 — mở tính năng cao hơn.",
      "firstClear": {
        "prestige": 200,
        "hint": "Chuẩn bị chương Quần Hùng — Thế giới & chiêu mộ rộng."
      }
    },
    "ch3_s1": {
      "story": "Tào Tháo khởi binh Trần Lưu — quần hùng phân tranh.",
      "firstClear": {
        "prestige": 100,
        "grantByFaction": {
          "shu": "xushu",
          "wei": "guojia",
          "wu": "xiaoqiao"
        }
      }
    },
    "ch3_s2": {
      "story": "Đào Khiêm Từ Châu — nhân nghĩa hay quyền mưu.",
      "firstClear": {
        "prestige": 110
      }
    },
    "ch3_s3": {
      "story": "Công Tôn Toản — Bạch Mã nghĩa tòng.",
      "firstClear": {
        "prestige": 120,
        "grantByFaction": {
          "shu": "zhaoyun",
          "wei": "zhanghe",
          "wu": "taishici"
        },
        "hint": "Thục nhận Triệu Vân (đỏ). Ngụy/Ngô nhận danh tướng tương ứng."
      }
    },
    "ch3_s4": {
      "story": "Nhan Lương · Văn Xú — hổ tướng Hà Bắc.",
      "firstClear": {
        "prestige": 130
      }
    },
    "ch3_s5": {
      "story": "Lưu Biểu Kinh Châu — đất dụng nhân.",
      "firstClear": {
        "prestige": 140,
        "grantByFaction": {
          "shu": "xushu",
          "wei": "jiaxu",
          "wu": "zhugejin"
        }
      }
    },
    "ch3_s6": {
      "story": "Viên Thiệu — bá chủ Hà Bắc. Kết thúc chính tuyến v1.",
      "mission": "Boss chương 3 — mở endgame nhẹ (tháp / chiêu mộ huyền thoại).",
      "firstClear": {
        "prestige": 250,
        "grantByFaction": {
          "shu": "pangtong",
          "wei": "xunyu",
          "wu": "luxun"
        },
        "hint": "Mở thêm tính năng cao. Danh tướng đỏ còn lại: Tửu Quán + danh vọng rất cao."
      }
    }
  },
  "tavernRules": {
    "summary": "Chiêu mộ = đủ Bạc + Danh vọng + cấp Ty Vũ + đã vượt required_stage (nếu có).",
    "early": "Ải ch1_s2 trở đi mở tướng xanh/lam phe mình.",
    "mid": "Ải ch1_s4 / ch1_s6 mở tím và nâng cao.",
    "late": "Ải ch2_s3+ và ch3 mở cam; đỏ cần danh vọng 1000+ và Ty Vũ cao.",
    "prestigeGenerals": "Một số entry source=prestige: chủ yếu khóa theo mốc danh vọng (giống uy danh gốc)."
  }
},
"statusEffects": {
  "schemaVersion": 2,
  "source": "https://ngoalong.vnggames.com/ngoa-long-wiki/hieu-ung",
  "sourceNews": "https://ngoalong.vnggames.com/tin-tuc/tin-tuc/hieu-ung-chien-dau.html",
  "importedAt": "2026-10-19",
  "note": "effects = map engine combat; wikiCatalog = snapshot tên wiki (fan remake).",
  "effects": {
    "stun": {
      "id": "stun",
      "wiki": "Hỗn loạn",
      "label": "Hỗn loạn",
      "short": "Loạn",
      "kind": "control",
      "desc": "Một lượt không thể hành động.",
      "wikiId": "hon_loan"
    },
    "silence": {
      "id": "silence",
      "wiki": "Ám tế",
      "label": "Ám tế",
      "short": "Ám",
      "kind": "debuff",
      "desc": "Tướng ở trạng thái BUFF, không thể tăng sĩ khí",
      "wikiId": "am_te"
    },
    "poison": {
      "id": "poison",
      "wiki": "Trúng độc",
      "label": "Trúng độc",
      "short": "Độc",
      "kind": "debuff",
      "desc": "Mỗi lượt, tướng đang Trúng Độc sẽ mất một lượng sinh lực nhất định.",
      "wikiId": "trung_doc"
    },
    "burn": {
      "id": "burn",
      "wiki": "Thiêu đốt",
      "label": "Thiêu đốt",
      "short": "Thiêu",
      "kind": "debuff",
      "desc": "Gây sát thương kế sách kéo dài theo lượt.",
      "wikiId": "thieu_dot"
    },
    "atk_up": {
      "id": "atk_up",
      "wiki": "Anh dũng",
      "label": "Anh dũng",
      "short": "Dũng",
      "kind": "buff",
      "desc": "Tất cả các tấn công tăng x% có thể được cộng dồn.",
      "wikiId": "anh_dung"
    },
    "atk_down": {
      "id": "atk_down",
      "wiki": "Giảm tấn công",
      "label": "Giảm công",
      "short": "Yếu",
      "kind": "debuff",
      "desc": "Giảm tất cả lực tấn công của tướng",
      "wikiId": "giam_tan_cong"
    },
    "def_up": {
      "id": "def_up",
      "wiki": "Kiên thủ",
      "label": "Kiên thủ",
      "short": "Thủ",
      "kind": "buff",
      "desc": "Tất cả các phòng thủ tăng x% và có thể được cộng dồn.",
      "wikiId": "kien_thu"
    },
    "def_down": {
      "id": "def_down",
      "wiki": "Hạ thấp phòng thủ",
      "label": "Phá thủ",
      "short": "Phá",
      "kind": "debuff",
      "desc": "Giảm tất cả phòng thủ của tướng",
      "wikiId": "ha_thap_phong_thu"
    },
    "heal_pct": {
      "id": "heal_pct",
      "wiki": "Hồi phục",
      "label": "Hồi phục",
      "short": "Hồi",
      "kind": "buff",
      "desc": "Khi bắt đầu lượt thi triển trị liệu bằng x% mưu công",
      "wikiId": "hoi_phuc"
    },
    "morale_boost": {
      "id": "morale_boost",
      "wiki": "Phấn Chấn",
      "label": "Phấn chấn",
      "short": "Khí",
      "kind": "buff",
      "desc": "Sĩ khí nhận được mỗi lượt tăng điểm X.",
      "wikiId": "phan_chan"
    }
  },
  "wikiCatalog": [
    {
      "id": "anh_dung",
      "wikiBuffId": 49,
      "name": "Anh Dũng",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tất cả các tấn công tăng x% có thể được cộng dồn.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/6e49dbe9-0706-4c57-a198-6461dc1dc9ec.51415.png",
      "source": "news+wiki-html"
    },
    {
      "id": "anh_dung_2",
      "wikiBuffId": 56,
      "name": "Anh Dũng 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Tất cả công tăng, có thể tích lũy, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/6e49dbe9-0706-4c57-a198-6461dc1dc9ec.51415.png",
      "source": "news+wiki-html"
    },
    {
      "id": "bai_uu",
      "wikiBuffId": 162,
      "name": "Bài Ưu",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giải trừ tất cả BUFF trên người đối phương",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "ba_chu",
      "wikiBuffId": 270,
      "name": "Bá Chủ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng C.Huy, Võ, Trí, có thể cộng dồn",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/f37715fe-47ed-4694-a881-2e684127e7a8.c4bec.png",
      "source": "wiki-html"
    },
    {
      "id": "ba_chu_2",
      "wikiBuffId": 287,
      "name": "Bá Chủ 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Tăng C.Huy, Võ, Trí, có thể cộng dồn, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/f37715fe-47ed-4694-a881-2e684127e7a8.c4bec.png",
      "source": "wiki-html"
    },
    {
      "id": "bat_quai",
      "wikiBuffId": 123,
      "name": "Bát Quái",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Chống đỡ 1 lần sát thương và chuyển sát thương lên một mục tiêu địch ngẫu nhiên",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1f6bb23b-30c2-4839-a676-6d0a82a4cb63.96435.png",
      "source": "news+wiki-html"
    },
    {
      "id": "bac_nhuoc",
      "wikiBuffId": 248,
      "name": "Bạc Nhược",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Sát thương cuối phải chịu từ mục tiêu mang Trúng Độc, Thiêu Đốt, Thi Độc, Thiên Hỏa, Huyết Cúc, Kịch Độc tăng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d76ea859-d971-408f-9be4-a52cc0257d28.293b6.png",
      "source": "news+wiki-html"
    },
    {
      "id": "bach_nhan",
      "wikiBuffId": 120,
      "name": "Bạch Nhẫn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi lần tấn công và phản kích cộng dồn một tầng, mỗi tầng tăng sát thương kỹ năng [giá trị hiệu quả], tầng tối đa cộng thêm tầng [giá trị hiệu quả].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2160836f-a810-4f69-aa68-e180472e4d31.af770.png",
      "source": "news+wiki-html"
    },
    {
      "id": "bao",
      "wikiBuffId": 102,
      "name": "Bạo",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5ded801b-a5f9-435a-ace0-4f16a8dc02a9.348ef.png",
      "source": "wiki-html"
    },
    {
      "id": "bao_no",
      "wikiBuffId": 64,
      "name": "Bạo Nộ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giá trị hiệu quả tăng sát thương cuối của bản thân tăng lên, bản thân chịu sát thương cuối tăng giá trị hiệu quả của hiệu ứng này.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/cde8cadc-4fc4-446f-9a45-2976d430effe.f1e62.png",
      "source": "news+wiki-html"
    },
    {
      "id": "bao_phat",
      "wikiBuffId": 194,
      "name": "Bạo Phát",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Vào cuối mỗi lượt, nếu sĩ khí của bạn thấp hơn X, nó sẽ nhận được 1 tầng Bạo phát, sau khi có lớp Y Bạo phát, sát thương kỹ năng tiếp theo gây ra thiệt hại thêm Z.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/fc8ef3ec-a038-4283-a85c-50b38fc8ad1b.2b5e6.png",
      "source": "news+wiki-html"
    },
    {
      "id": "bao_thuong",
      "wikiBuffId": 127,
      "name": "Bạo Thương",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sát thương bạo kích tăng [giá trị hiệu quả] (cơ sở sát thương bạo kích là 150%, cộng tăng).",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ea29a01e-f80c-46a4-9d66-379c68d9ec0f.85934.png",
      "source": "news+wiki-html"
    },
    {
      "id": "bao_ve",
      "wikiBuffId": 200,
      "name": "Bảo Vệ",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "BUFF đánh dấu, không có tác dụng trực tiếp.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/6e94251e-cd25-4f4d-a4d2-8466ed2ce880.7dd0c.png",
      "source": "news+wiki-html"
    },
    {
      "id": "bat_khuat",
      "wikiBuffId": 66,
      "name": "Bất Khuất",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Không thể tử vong, sinh lực giảm còn 1 sẽ hồi phục lượng lính nhất định, chỉ có hiệu lực 1 lần",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/f88eccb6-f728-44b4-88f1-0316f6add786.6a081.png",
      "source": "news+wiki-html"
    },
    {
      "id": "bat_khuat_chuyen_dung_bac_7",
      "wikiBuffId": 310,
      "name": "Bất Khuất (Chuyên dụng bậc 7)",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi thấp hơn X% binh lực tối đa, sát thương phải chịu của bản thân giảm X%",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "bat_khuat_2",
      "wikiBuffId": 133,
      "name": "Bất Khuất 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sau khi sinh lực giảm còn 1 sẽ hồi phục số lính nhất định và nhận Vô Địch 1 lượt, chỉ hiệu lực 1 lần",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/f88eccb6-f728-44b4-88f1-0316f6add786.6a081.png",
      "source": "news+wiki-html"
    },
    {
      "id": "ben_bi",
      "wikiBuffId": 242,
      "name": "Bền Bỉ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Gia tăng khả năng chống lại các hiệu ứng như kiểm soát, sợ hãi, v.v. và giảm xác suất bị trúng BUFF tiêu cực.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d13703b5-094f-4b7f-9ecb-d789d215856e.84065.png",
      "source": "news+wiki-html"
    },
    {
      "id": "bong_lanh",
      "wikiBuffId": 237,
      "name": "Bỏng Lạnh",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi bị Đóng Băng sẽ cộng dồn 1 tầng. Đạt từ 3 tầng trở lên, gây sát thương theo tỉ lệ lính dựa trên số tầng hiện tại rồi xóa toàn bộ tầng.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/47bd581f-56bd-4f3b-83ec-2ee3e842c705.63db2.png",
      "source": "wiki-html"
    },
    {
      "id": "boi_thuy",
      "wikiBuffId": 28,
      "name": "Bối Thủy",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Bản thân khi hành động, nếu binh lực thấp hơn binh lực tối đa 60%, thì tăng nhất định phần trăm tấn công, có thể cộng dồn",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/314b832c-46f5-489c-8fc2-bd4074a17346.06dba.png",
      "source": "wiki-html"
    },
    {
      "id": "bo_phong_2",
      "wikiBuffId": 259,
      "name": "Bộ Phòng 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi dùng Bộ Binh, bản thân tăng phòng thủ.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "c_huy",
      "wikiBuffId": 244,
      "name": "C.Huy",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Bản thân tăng C.Huy",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/3fb4879b-0e43-45d7-a9f8-7287d32e1dce.0e41b.png",
      "source": "wiki-html"
    },
    {
      "id": "chien_than",
      "wikiBuffId": 104,
      "name": "Chiến Thần",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tướng phe ta càng nhiều, sát thương càng cao",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2a42c078-213e-4136-bfce-1bd33084a42c.9b4e3.png",
      "source": "wiki-html"
    },
    {
      "id": "chuyen_doi",
      "wikiBuffId": 236,
      "name": "Chuyển đổi",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Một phần sát thương gây ra sẽ trị liệu đều cho toàn bộ phe ta",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/975d385b-0a9c-4d0e-9704-4b8a910560c1.41bac.png",
      "source": "wiki-html"
    },
    {
      "id": "cham_ngoi",
      "wikiBuffId": 300,
      "name": "Châm Ngòi",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Mỗi lượt chịu một lượng Mưu Công nhất định. Khi cộng dồn từ 3 tầng trở lên, đến lượt hành động của bản thân sẽ khiến mình và toàn bộ đồng đội chịu Mưu Công theo số tầng hiện tại.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/b5fb7deb-6ecd-4b66-a1b5-7489e4a0d500.514a5.png",
      "source": "wiki-html"
    },
    {
      "id": "chem_giet",
      "name": "Chém giết",
      "category": "Giảm",
      "kind": "debuff",
      "desc": "Trong thời gian liên tục, tỷ lệ phần trăm máu mục tiêu thấp hơn giá trị hiệu quả và tử vong trực tiếp.",
      "source": "news"
    },
    {
      "id": "chuoc_gioi_chuyen_dung_bac_7",
      "wikiBuffId": 312,
      "name": "Chước Giới (Chuyên dụng bậc 7)",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi bản thân hành động, có X% xác suất khiến 1 mục tiêu địch không thể đánh thường.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "chi_huy_2",
      "wikiBuffId": 253,
      "name": "Chỉ Huy 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Bản thân tăng C.Huy, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/3fb4879b-0e43-45d7-a9f8-7287d32e1dce.0e41b.png",
      "source": "wiki-html"
    },
    {
      "id": "chong_do",
      "wikiBuffId": 107,
      "name": "Chống Đỡ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Nhận 1 Hộ Thuẫn chống đỡ sát thương",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e08b0593-37d3-46f3-a372-f736b5e94952.354a8.png",
      "source": "wiki-html"
    },
    {
      "id": "cung_cong_2",
      "wikiBuffId": 260,
      "name": "Cung Công 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi dùng Cung Binh, bản thân tăng Vật Công.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "cuong_bao",
      "wikiBuffId": 119,
      "name": "Cuồng Bạo",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sát thương cuối bản thân gây ra và phải chịu đều tăng theo tỉ lệ nhất định",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ce8a3c6a-1660-4efd-93fa-515b2e391cbf.056a2.png",
      "source": "wiki-html"
    },
    {
      "id": "cuong_chien",
      "wikiBuffId": 294,
      "name": "Cuồng Chiến",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Cách vài lượt sẽ tăng công phòng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/6c09ee33-38c0-43fb-891e-98d8a3c06163.395b7.png",
      "source": "wiki-html"
    },
    {
      "id": "co_doc",
      "wikiBuffId": 88,
      "name": "Cô Độc",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi tầng [Cô Độc] tăng tấn công [giá trị hiệu quả] và lực phòng thủ [giá trị hiệu quả], mỗi lần chết một đội tướng đồng minh cộng thêm 1 tầng, mỗi lần chết một đội tướng địch cộng thêm 2 tầng, phòng thủ tối đa tăng 80%.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/fe7dd52a-9452-45d9-89d1-be532ad80c78.41f32.png",
      "source": "news+wiki-html"
    },
    {
      "id": "cong_tam",
      "wikiBuffId": 116,
      "name": "Công Tâm",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Nếu mục tiêu đang mang BUFF X thì sinh thêm BUFF Y, duy trì bằng số lượt còn lại của Công Tâm.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "cuong_tap",
      "wikiBuffId": 206,
      "name": "Cường Tập",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "X đòn sát thương tiếp theo tăng Y%; sau khi gây đủ X đòn thì ngừng. (Khi cộng dồn, BUFF mới thay thế BUFF cũ.)",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "cuong_vo_2",
      "wikiBuffId": 281,
      "name": "Cường Võ 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Bản thân tăng Võ, không thể giải trừ, có thể cộng dồn.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/c03e7c81-e3bd-44c9-987d-0effe863f8bd.1c2a5.png",
      "source": "wiki-html"
    },
    {
      "id": "cam_quan",
      "wikiBuffId": 195,
      "name": "Cấm quân",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi khi có một đơn vị hữu phương, lực tấn công tăng lên X%, lực phòng thủ tăng lên Y%.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/97b3cd6a-c6b8-44ff-bb53-cc4ebb26c86d.8f9f7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "cap_cuu",
      "wikiBuffId": 215,
      "name": "Cấp Cứu",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng X% hiệu quả trị liệu trực tiếp bản thân gây ra",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1094d0c9-b998-4496-a8aa-d59a6af5a8c1.f1efc.png",
      "source": "wiki-html"
    },
    {
      "id": "cap_cuu_2",
      "wikiBuffId": 217,
      "name": "Cấp Cứu 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Tăng hiệu quả trị liệu trực tiếp bản thân gây ra, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1094d0c9-b998-4496-a8aa-d59a6af5a8c1.f1efc.png",
      "source": "wiki-html"
    },
    {
      "id": "di_ke",
      "wikiBuffId": 121,
      "name": "Di Kế",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi lần thi triển kỹ năng kỹ năng cộng dồn 1 tầng, khi tử vong tạo thành sát thương kế sách nhân với tầng cộng dồn được lên toàn bộ địch, không thể bị phản kích.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/29776874-15eb-4cf9-bf4f-524455c7320e.62e9d.png",
      "source": "news+wiki-html"
    },
    {
      "id": "dieu_ke",
      "wikiBuffId": 145,
      "name": "Diệu Kế",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Với hiệu ứng này, khi hành động kết thúc sẽ làm tăng sĩ khí điểm X của chính nó.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/bece3313-ab55-4333-be29-aefc1bf7fdaa.64855.png",
      "source": "news+wiki-html"
    },
    {
      "id": "do_du",
      "wikiBuffId": 240,
      "name": "Do Dự",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Làm giảm hiệu quả sát thương gây ra",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/3e9b81e3-46ee-4472-bf34-26cae6335eee.0161e.png",
      "source": "news+wiki-html"
    },
    {
      "id": "do_du_2",
      "wikiBuffId": 219,
      "name": "Do Dự 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm sát thương kỹ năng của địch, không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/3e9b81e3-46ee-4472-bf34-26cae6335eee.0161e.png",
      "source": "wiki-html"
    },
    {
      "id": "du_hop_2",
      "wikiBuffId": 299,
      "name": "Dũ Hợp 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Mỗi lần nhận sát thương, khi lính ít hơn 50%, sẽ hồi máu và giảm 1 tầng dũ hợp",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/9884e789-618e-451b-97d2-4064ecd1afcc.887e1.png",
      "source": "news+wiki-html"
    },
    {
      "id": "dung_tuyet",
      "wikiBuffId": 94,
      "name": "Dũng Tuyệt",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Lượt đầu tăng tất cả lực tấn công, sau đó mỗi lượt lực tấn công giảm [giá trị hiệu quả] sau 5 lượt, trở về tấn công bình thường sau khi kết thúc.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/4ac12faa-43bb-4b51-bf42-d6931e75f500.93441.png",
      "source": "news+wiki-html"
    },
    {
      "id": "dung_tuyet_2",
      "name": "Dũng tuyệt 2",
      "category": "Không thể giải trừ",
      "kind": "unremovable",
      "desc": "Bắt đầu từ lượt thứ tư, mỗi lượt tăng sức tấn công [giá trị hiệu quả].",
      "source": "news"
    },
    {
      "id": "deo_dai",
      "wikiBuffId": 52,
      "name": "Dẻo Dai",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giảm xác suất trúng buff bất lợi.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2cc5b867-bcd2-49c4-a911-0dbd085ed871.9d540.png",
      "source": "wiki-html"
    },
    {
      "id": "duc_huyet",
      "wikiBuffId": 148,
      "name": "Dục Huyết",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Chuyển hóa sát thương phải chịu thành tấn công theo tỉ lệ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/65867070-d65a-4511-aaf0-2f5e4785ae9a.ed1ef.png",
      "source": "news+wiki-html"
    },
    {
      "id": "e_so",
      "wikiBuffId": 241,
      "name": "E Sợ",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi tỉ lệ phần trăm lính của mục tiêu thấp, sẽ giảm 1% tấn công của mục tiêu, không vượt quá 40%",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/c40042aa-e263-4141-b6d3-540db2db6968.4394b.png",
      "source": "news+wiki-html"
    },
    {
      "id": "e_so_2",
      "wikiBuffId": 306,
      "name": "E Sợ 2",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi tỉ lệ phần trăm lính của bản thân thấp, sẽ giảm tấn công của mục tiêu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/c40042aa-e263-4141-b6d3-540db2db6968.4394b.png",
      "source": "wiki-html"
    },
    {
      "id": "giem_pha",
      "wikiBuffId": 188,
      "name": "Gièm Pha",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Trước mỗi lần hành động, sẽ giải trừ số hiệu quả có lợi nhất định",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1910fb91-c521-4968-ad62-56f15d8f1c7c.caf0d.png",
      "source": "news+wiki-html"
    },
    {
      "id": "giai_tru",
      "wikiBuffId": 43,
      "name": "Giải Trừ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giải trừ tất cả hiệu quả bất lợi có thể giải trừ",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "giai_tru_bao_ho",
      "wikiBuffId": 96,
      "name": "Giải Trừ (Bảo Hộ)",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Xóa 1 lần BUFF có lợi của mục tiêu, tối đa X",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "giai_tru_0",
      "wikiBuffId": 90,
      "name": "Giải Trừ 0",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Xóa 1 BUFF tăng lợi ích của mục tiêu",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "giai_tru_2",
      "wikiBuffId": 82,
      "name": "Giải Trừ 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giải trừ hiệu quả bất lợi cho phe ta và hồi thêm sĩ khí; lượng sĩ khí hồi phục là X.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "giai_tru_2_bao_ho",
      "wikiBuffId": 97,
      "name": "Giải Trừ 2 (Bảo Hộ)",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Phiên bản Bảo Hộ của Giải Trừ 2, giải trừ tối đa X hiệu quả bất lợi",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "giai_tru_3",
      "wikiBuffId": 212,
      "name": "Giải Trừ 3",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Xóa hiệu quả bất lợi X cho đồng đội, mỗi xóa 1 hiệu quả bất lợi, hồi 2 sĩ khí hiệu quả mục tiêu",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "giam_chien_cong",
      "name": "Giảm chiến công",
      "category": "Giảm",
      "kind": "debuff",
      "desc": "Giảm lực tấn công chiến pháp của tướng",
      "source": "news"
    },
    {
      "id": "giam_chien_phong",
      "wikiBuffId": 19,
      "name": "Giảm Chiến Phòng",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm năng lực pháp phòng thường cho đối phương",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/527b161a-c6e9-46a5-bc80-3316101a864c.63ea7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "giam_cong_2",
      "wikiBuffId": 142,
      "name": "Giảm Công 2",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm tất cả tấn công của mục tiêu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/aa1867a4-2c5d-42c9-95cf-f88f59e7bfd4.249a6.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_muu_cong",
      "wikiBuffId": 15,
      "name": "Giảm Mưu Công",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm lực tấn công mưu công của tướng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/4399866a-feeb-4b47-ba16-63428a5fe0fb.d715f.png",
      "source": "news+wiki-html"
    },
    {
      "id": "giam_muu_cong_2",
      "wikiBuffId": 285,
      "name": "Giảm Mưu Công 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm Mưu Công của tướng, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/4399866a-feeb-4b47-ba16-63428a5fe0fb.d715f.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_muu_phong",
      "wikiBuffId": 20,
      "name": "Giảm Mưu Phòng",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm khả năng phòng thủ mưu công tướng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/987b2a74-7eb8-4721-b320-8e4f5726cab6.b49e7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "giam_muu_phong_2",
      "wikiBuffId": 134,
      "name": "Giảm Mưu Phòng 2",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm khả năng phòng thủ mưu công tướng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/987b2a74-7eb8-4721-b320-8e4f5726cab6.b49e7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "giam_phap_cong",
      "wikiBuffId": 14,
      "name": "Giảm Pháp Công",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm pháp công của tướng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/7e56bdbd-6bb2-4413-9cae-1d5b6ea7c88b.14291.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_phap_cong_2",
      "wikiBuffId": 284,
      "name": "Giảm Pháp Công 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm Pháp Công của tướng, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/7e56bdbd-6bb2-4413-9cae-1d5b6ea7c88b.14291.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_phap_phong_2",
      "wikiBuffId": 234,
      "name": "Giảm Pháp Phòng 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm Pháp Phòng thường của mục tiêu. Hiệu quả không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/527b161a-c6e9-46a5-bc80-3316101a864c.63ea7.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_phong_2",
      "wikiBuffId": 79,
      "name": "Giảm Phòng 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm tất cả thủ của mục tiêu, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ab504160-f8dd-40a0-a26c-aed1aaea94bb.ad107.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_phong_thu",
      "wikiBuffId": 21,
      "name": "Giảm Phòng Thủ",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm tất cả năng lực phòng thủ cho mục tiêu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ab504160-f8dd-40a0-a26c-aed1aaea94bb.ad107.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_phong_thu_2",
      "name": "Giảm phòng thủ 2",
      "category": "Không thể giải trừ",
      "kind": "unremovable",
      "desc": "Giảm tất cả phòng thủ của tướng",
      "source": "news"
    },
    {
      "id": "giam_sat_thuong",
      "wikiBuffId": 218,
      "name": "Giảm Sát Thương",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giảm sát thương bản thân gây ra",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d9259f46-c7da-4da5-816a-64c8fec27f97.3a96d.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_thuong",
      "name": "Giảm thương",
      "category": "Không thể giải trừ",
      "kind": "unremovable",
      "desc": "Giảm sát thương gây ra X% của đợn vị có buff này.",
      "source": "news"
    },
    {
      "id": "giam_tri_lieu",
      "wikiBuffId": 30,
      "name": "Giảm Trị Liệu",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm hiệu quả Trị Liệu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/47b84fed-906f-4f6d-8af4-504226245937.8df0d.png",
      "source": "news+wiki-html"
    },
    {
      "id": "giam_tan_cong",
      "wikiBuffId": 16,
      "name": "Giảm Tấn Công",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm tất cả lực tấn công của tướng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/aa1867a4-2c5d-42c9-95cf-f88f59e7bfd4.249a6.png",
      "source": "news+wiki-html"
    },
    {
      "id": "giam_vo_2",
      "wikiBuffId": 280,
      "name": "Giảm Võ 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm điểm Võ của địch, có thể cộng dồn, không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/fe9d9ead-55e0-4331-be62-08ab01ddeb8d.84b4e.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_vat_cong",
      "wikiBuffId": 13,
      "name": "Giảm Vật Công",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm lực tấn công vật lý của tướng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/675cab9e-06d8-4c33-882e-e357222c2a59.d5223.png",
      "source": "news+wiki-html"
    },
    {
      "id": "giam_vat_cong_2",
      "wikiBuffId": 283,
      "name": "Giảm Vật Công 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm Vật Công của tướng, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/675cab9e-06d8-4c33-882e-e357222c2a59.d5223.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_vat_phong",
      "wikiBuffId": 18,
      "name": "Giảm Vật Phòng",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm năng lực phòng thủ thường cho đối phương",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5d194b87-f43a-4012-b9cd-21be5017bca4.550ab.png",
      "source": "news+wiki-html"
    },
    {
      "id": "giam_vat_phong_2",
      "wikiBuffId": 282,
      "name": "Giảm Vật Phòng 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm năng lực Vật Phòng, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5d194b87-f43a-4012-b9cd-21be5017bca4.550ab.png",
      "source": "wiki-html"
    },
    {
      "id": "giam_dap",
      "wikiBuffId": 75,
      "name": "Giẫm Đạp",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Sau khi cộng dồn 3 lần tiến vào [Hỗn loạn], (đối chiến với người chơi cần phải cộng dồn 4 lần).",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/95c9c2e1-98a2-4d9e-813f-080320e0092d.15508.png",
      "source": "news+wiki-html"
    },
    {
      "id": "hoat_luc",
      "wikiBuffId": 74,
      "name": "Hoạt Lực",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Hiệu quả trị liệu nhận được tăng x%",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/35feca92-5f4c-4c27-b174-9ae7d582182d.8d2fe.png",
      "source": "news+wiki-html"
    },
    {
      "id": "hoat_luc_2",
      "wikiBuffId": 208,
      "name": "Hoạt Lực 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Hiệu quả trị liệu nhận được tăng x%",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/35feca92-5f4c-4c27-b174-9ae7d582182d.8d2fe.png",
      "source": "news+wiki-html"
    },
    {
      "id": "huyet_cuc",
      "wikiBuffId": 105,
      "name": "Huyết Cúc",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi được trị liệu, chịu 1 lần sát thương theo mức Mưu Công của người trị liệu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/6c45858b-1ce5-479d-a5b6-17388e381bac.216f6.png",
      "source": "news+wiki-html"
    },
    {
      "id": "huyet_nhan_2",
      "wikiBuffId": 318,
      "name": "Huyết Nhẫn 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi đánh thường, hồi phục một phần binh lực đã tổn thất; giới hạn là X.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/a1b84685-79c7-4b09-89f7-245031bec6b7.4421d.png",
      "source": "wiki-html"
    },
    {
      "id": "huyet_thuan_2",
      "wikiBuffId": 166,
      "name": "Huyết Thuẫn 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Mỗi lần nhận được sát thương, tăng tất cả lực phòng thủ của bản thân, có thể cộng dồn và hiệu quả này không thể bị giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5c55692d-7e5f-4174-8488-904ba9a19f3b.82fac.png",
      "source": "news+wiki-html"
    },
    {
      "id": "huyen_giap",
      "wikiBuffId": 72,
      "name": "Huyền Giáp",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi có hiệu ứng này, lượng dame nhận vào không vượt quá [giá trị hiệu ứng].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/79e86339-4fee-44d3-b5bb-3c5bd645ab62.3f77d.png",
      "source": "news+wiki-html"
    },
    {
      "id": "ham_tran_chuyen_dung_bac_7",
      "wikiBuffId": 311,
      "name": "Hãm Trận (Chuyên dụng bậc 7)",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi thấp hơn X% binh lực tối đa, sát thương gây ra của bản thân tăng X%",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "hon_me",
      "wikiBuffId": 76,
      "name": "Hôn Mê",
      "category": "Khống chế",
      "loai": "trung-lap khong-che",
      "kind": "control",
      "desc": "1 lượt không thể hành động, không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2292a825-c85d-40e7-a099-202ee97c3151.841c4.png",
      "source": "wiki-html"
    },
    {
      "id": "hu_nhuoc",
      "wikiBuffId": 227,
      "name": "Hư Nhược",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Đơn vị này không thể nhận thêm hiệu quả có lợi, các hiệu quả đã nhận không bị ảnh hưởng.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d9c1e599-6d5e-44c6-8eed-79779b4751ee.494b4.png",
      "source": "news+wiki-html"
    },
    {
      "id": "hu_nhuoc_2",
      "wikiBuffId": 77,
      "name": "Hư Nhược 2",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Đơn vị này không thể nhận thêm hiệu quả có lợi, các hiệu quả đã nhận không bị ảnh hưởng.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d9c1e599-6d5e-44c6-8eed-79779b4751ee.494b4.png",
      "source": "wiki-html"
    },
    {
      "id": "ha_thap_phong_thu",
      "name": "Hạ thấp phòng thủ",
      "category": "Giảm",
      "kind": "debuff",
      "desc": "Giảm tất cả phòng thủ của tướng",
      "source": "news"
    },
    {
      "id": "hap_dan",
      "wikiBuffId": 297,
      "name": "Hấp Dẫn",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Mục tiêu mang [Khiêu Khích] tấn công mục tiêu mang [Hấp Dẫn], sát thương không đổi",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "hap_huyet",
      "wikiBuffId": 31,
      "name": "Hấp Huyết",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Bản thân nhận trị liệu bằng 25% sát thương gây ra, tối đa hồi 30% lính",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/975d385b-0a9c-4d0e-9704-4b8a910560c1.41bac.png",
      "source": "news+wiki-html"
    },
    {
      "id": "hap_huyet_2",
      "wikiBuffId": 196,
      "name": "Hấp Huyết 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Bản thân nhận trị liệu bằng 25% sát thương gây ra, tối đa hồi 30% lính",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/975d385b-0a9c-4d0e-9704-4b8a910560c1.41bac.png",
      "source": "news+wiki-html"
    },
    {
      "id": "hoa_than",
      "wikiBuffId": 124,
      "name": "Hỏa Thần",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Đánh trúng một kẻ địch có [Thiên Hỏa] hoặc [Thiêu Đốt] liền khôi phục sĩ khí [Giá trị hiệu quả], đối với địch nhân có hiệu quả này tạo thành thương tổn [giá trị hiệu quả].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/88f0ff6e-5fe5-4062-a7a2-1230f0e45b2e.9ce5d.png",
      "source": "news+wiki-html"
    },
    {
      "id": "hoi_phuc",
      "wikiBuffId": 109,
      "name": "Hồi Phục",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi bắt đầu lượt thi triển trị liệu bằng x% mưu công",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/bb39f256-52c1-44b1-a2a4-09ff2025003e.ae99f.png",
      "source": "news+wiki-html"
    },
    {
      "id": "hoi_xuan",
      "wikiBuffId": 152,
      "name": "Hồi Xuân",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Nhận số tầng Hồi Xuân nhất định, khi chịu sát thương mất 1 tầng, và hồi phục lính",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/bb39f256-52c1-44b1-a2a4-09ff2025003e.ae99f.png",
      "source": "wiki-html"
    },
    {
      "id": "hon_loan",
      "wikiBuffId": 2,
      "name": "Hỗn loạn",
      "category": "Bất lợi",
      "loai": "bat-loi khong-che",
      "kind": "debuff",
      "desc": "Một lượt không thể hành động.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2292a825-c85d-40e7-a099-202ee97c3151.841c4.png",
      "source": "news+wiki-html"
    },
    {
      "id": "ho_chu",
      "wikiBuffId": 199,
      "name": "Hộ Chủ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Bản thân chịu sát thương từ mục tiêu được [Bảo Hộ]",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/acd426fe-ae8a-4bdf-a8c9-04d3a03b00e7.12121.png",
      "source": "news+wiki-html"
    },
    {
      "id": "ho_thuan",
      "wikiBuffId": 37,
      "name": "Hộ Thuẫn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Lá chắn chặn một lần sát thương ngẫu nhiên.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e08b0593-37d3-46f3-a372-f736b5e94952.354a8.png",
      "source": "news+wiki-html"
    },
    {
      "id": "ho_the",
      "wikiBuffId": 276,
      "name": "Hộ Thể",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm sát thương phải chịu từ kỹ năng toàn thể, không thể giải trừ.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "hoi_tam",
      "wikiBuffId": 5,
      "name": "Hội Tâm",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng xác suất bạo kích của mục tiêu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d1cc03ab-4cfc-4f35-aef9-dbe96cb4149e.131e3.png",
      "source": "news+wiki-html"
    },
    {
      "id": "hoi_tam_2",
      "wikiBuffId": 201,
      "name": "Hội Tâm 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Xác suất bạo kích của bản thân +X%, hiệu quả không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d1cc03ab-4cfc-4f35-aef9-dbe96cb4149e.131e3.png",
      "source": "wiki-html"
    },
    {
      "id": "hu_thuc",
      "wikiBuffId": 179,
      "name": "Hủ Thực",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm phòng thủ [giá trị hiệu quả] khi đơn vị có X buff bất lợi.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/a2698aa7-c1a9-4288-a132-02fb6cd49e74.78af1.png",
      "source": "news+wiki-html"
    },
    {
      "id": "hu_thuc_2",
      "wikiBuffId": 186,
      "name": "Hủ Thực 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm tỉ lệ phòng thủ theo số hiệu quả bất lợi của bản thân, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/a2698aa7-c1a9-4288-a132-02fb6cd49e74.78af1.png",
      "source": "wiki-html"
    },
    {
      "id": "khieu_khich",
      "wikiBuffId": 296,
      "name": "Khiêu Khích",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Hiệu quả bất lợi, sát thương cuối mà mục tiêu có Khiêu khích gây cho mục tiêu ngoài người thi triển Khiêu khích giảm x%",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/97848e42-cf2f-47fd-b77a-20ec12f867c5.005ae.png",
      "source": "news+wiki-html"
    },
    {
      "id": "khat_mau",
      "name": "Khát máu",
      "category": "Không thể giải trừ",
      "kind": "unremovable",
      "desc": "Không thể giải trừ, khi gây sát thương, nếu binh lực mục tiêu dưới 75%, đạt được [Cuồng Bạo]: sát thương gây ra tăng lên [giá trị hiệu quả], sát thương bị tăng lên [giá trị hiệu quả]; Nếu binh lực mục tiêu dưới 50%, thêm [Liên kích] có thể tiến hành 2 tấn công vật lý/kỹ năng.",
      "source": "news"
    },
    {
      "id": "khoa_vay",
      "wikiBuffId": 262,
      "name": "Khóa Vây",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi mục tiêu thi triển hành động tốn sĩ khí trên một mức nhất định, lượt sau sẽ Hỗn Loạn 1 lượt.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/9cc3da50-32d5-4f4e-94c3-2421612bbd2a.4eba0.png",
      "source": "news+wiki-html"
    },
    {
      "id": "khac_bo",
      "wikiBuffId": 291,
      "name": "Khắc Bộ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Bản thân giảm sát thương cuối phải chịu từ Bộ Binh, số lượng là X",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d6ad5dbe-99df-44e8-9a19-1fd9d7cd6f5b.49981.png",
      "source": "wiki-html"
    },
    {
      "id": "khac_cung",
      "wikiBuffId": 289,
      "name": "Khắc Cung",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Bản thân giảm sát thương cuối phải chịu từ Cung Binh, số lượng là X",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d6ad5dbe-99df-44e8-9a19-1fd9d7cd6f5b.49981.png",
      "source": "wiki-html"
    },
    {
      "id": "khac_ky",
      "wikiBuffId": 288,
      "name": "Khắc Kỵ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Bản thân giảm sát thương cuối phải chịu từ Kỵ Binh, số lượng là X",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d6ad5dbe-99df-44e8-9a19-1fd9d7cd6f5b.49981.png",
      "source": "wiki-html"
    },
    {
      "id": "khac_thuong",
      "wikiBuffId": 290,
      "name": "Khắc Thương",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Bản thân giảm sát thương cuối phải chịu từ Thương Binh, số lượng là X",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d6ad5dbe-99df-44e8-9a19-1fd9d7cd6f5b.49981.png",
      "source": "wiki-html"
    },
    {
      "id": "khong_che",
      "wikiBuffId": 27,
      "name": "Khống Chế",
      "category": "Bất lợi",
      "loai": "bat-loi khong-che",
      "kind": "debuff",
      "desc": "Tấn công ngẫu nhiên vào chính đồng đội của mình.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1aa32375-a106-408a-8532-7dbc69a22994.f998c.png",
      "source": "wiki-html"
    },
    {
      "id": "khong_hoa",
      "wikiBuffId": 128,
      "name": "Khống Hỏa",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Các đơn vị có đốt hoặc lửa làm giảm thiệt hại gây ra cho các đơn vị có ngọn lửa kiểm soát [giá trị hiệu quả].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/8efb5706-d303-4c8d-8bd3-e4aac5d1d929.d6358.png",
      "source": "news+wiki-html"
    },
    {
      "id": "kinh_cuc",
      "wikiBuffId": 36,
      "name": "Kinh Cúc",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Phản đòn sát thương theo tỉ lệ phần trăm",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e9581b4b-8b71-4bfa-966c-189003663cb4.2705c.png",
      "source": "news+wiki-html"
    },
    {
      "id": "kinh_cuc_2",
      "wikiBuffId": 91,
      "name": "Kinh Cúc 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Hiệu quả Kinh Cúc không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e9581b4b-8b71-4bfa-966c-189003663cb4.2705c.png",
      "source": "wiki-html"
    },
    {
      "id": "kinh_hon",
      "wikiBuffId": 126,
      "name": "Kinh Hồn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi có được buff này, mỗi lần kỹ năng tạo thành sát thương đều chồng lên một tầng âm hồn, hiệu quả cộng dồn là giá trị hiệu quả 1, lượt chồng lên là giá trị hiệu quả 2.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/79ce70d7-8472-4dae-8395-0a845ac1576d.cbcc1.png",
      "source": "news+wiki-html"
    },
    {
      "id": "kinh_hon_2",
      "wikiBuffId": 272,
      "name": "Kinh Hồn 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Mỗi lần bản thân gây sát thương, sẽ tăng sát thương cuối, không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/958083df-03fb-40a7-ac45-59b75487b29d.23f08.png",
      "source": "wiki-html"
    },
    {
      "id": "kien_nghi_2",
      "wikiBuffId": 177,
      "name": "Kiên Nghị 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giải trừ hiệu quả bất lợi, đồng thời tăng phòng thủ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/6a48f217-4497-4805-ab0e-267305d7bd3e.3036a.png",
      "source": "wiki-html"
    },
    {
      "id": "kien_thu",
      "wikiBuffId": 50,
      "name": "Kiên Thủ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tất cả các phòng thủ tăng x% và có thể được cộng dồn.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5f863408-a83c-4982-878d-ef05d48106d0.62488.png",
      "source": "news+wiki-html"
    },
    {
      "id": "kien_thu_2",
      "wikiBuffId": 71,
      "name": "Kiên Thủ 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Tăng tất cả phòng, có thể tích lũy, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5f863408-a83c-4982-878d-ef05d48106d0.62488.png",
      "source": "news+wiki-html"
    },
    {
      "id": "kien_tri_2",
      "name": "Kiên trì 2",
      "category": "Không thể giải trừ",
      "kind": "unremovable",
      "desc": "Loại bỏ các buff bất lợi trong khi tăng phòng thủ.",
      "source": "news"
    },
    {
      "id": "kien_dinh",
      "wikiBuffId": 53,
      "name": "Kiên Định",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giảm xác suất trúng Mê Hoặc",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/bdbd1c72-e8e8-441e-8bf9-cb56cd6cced7.a0681.png",
      "source": "news+wiki-html"
    },
    {
      "id": "kieu_binh",
      "wikiBuffId": 258,
      "name": "Kiêu Binh",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi bản thân đầy lính, tăng tấn công và sát thương phải chịu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/988d9852-a244-48df-be03-b2de7b88095f.85295.png",
      "source": "wiki-html"
    },
    {
      "id": "kieu_binh_2",
      "wikiBuffId": 160,
      "name": "Kiêu Binh 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Khi binh lực của bản thân đầy đủ, lực tấn công tăng lên X, nhưng bị thương tổn tăng lên Y%.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/3242a534-478e-409f-aebd-396db2d17549.82b94.png",
      "source": "news+wiki-html"
    },
    {
      "id": "kich_duong",
      "wikiBuffId": 202,
      "name": "Kích Dương",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Hiệu quả hồi sĩ khí tăng x%",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/0d90b45f-a50e-40ed-a6e8-9707c2cef7c5.ef5b8.png",
      "source": "news+wiki-html"
    },
    {
      "id": "kich_hoat_kich_doc",
      "wikiBuffId": 249,
      "name": "Kích hoạt Kịch Độc",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Lập tức kích nổ Kịch Độc đang có trên mục tiêu, gây sát thương theo số tầng hiện tại (tính là sát thương bất lợi); kích nổ X lần.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "kich_hoat_thien_hoa",
      "wikiBuffId": 252,
      "name": "Kích hoạt Thiên Hỏa",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Lập tức kích nổ Thiên Hỏa đang có trên mục tiêu, gây sát thương theo số tầng hiện tại (tính là sát thương bất lợi); kích nổ Y lần.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "kich_hoat_thieu_dot",
      "wikiBuffId": 251,
      "name": "Kích hoạt Thiêu Đốt",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi thi triển lên mục tiêu, lập tức gây sát thương Thiêu Đốt (tính là sát thương bất lợi). X là số lần gây sát thương (0 hoặc 1 đều tính 1 lần).",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "kich_no",
      "wikiBuffId": 35,
      "name": "Kích Nộ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi chịu bất kỳ sát thương nào, tăng X sĩ khí.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/9c619805-8b48-4024-a89d-d287d2b76212.adcf6.png",
      "source": "wiki-html"
    },
    {
      "id": "kich_no_2",
      "wikiBuffId": 139,
      "name": "Kích Nộ 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi chịu sát thương sẽ tăng sĩ khí.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/9c619805-8b48-4024-a89d-d287d2b76212.adcf6.png",
      "source": "wiki-html"
    },
    {
      "id": "kich_doc",
      "wikiBuffId": 247,
      "name": "Kịch Độc",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Trước khi mục tiêu bắt đầu hành động sẽ nhận sát thương Mưu Công theo tỉ lệ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/cce223c6-e111-47e4-a80f-9978059d1a66.b9fcd.png",
      "source": "wiki-html"
    },
    {
      "id": "ky_tran",
      "wikiBuffId": 233,
      "name": "Kỳ Trận",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi có BUFF này, trong lượt lẻ tấn công tăng X%, trong lượt chẵn phòng thủ tăng X%",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/127258b9-34ae-444a-9460-6a44d6b930f7.79ff8.png",
      "source": "wiki-html"
    },
    {
      "id": "ky_tran_2",
      "wikiBuffId": 165,
      "name": "Kỳ Trận 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Khi có BUFF này, khi ở lượt số lẻ, sức tấn công của bản thân tăng X%, khi ở lượt chẵn, khả năng phòng thủ của bản thân tăng X%.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/127258b9-34ae-444a-9460-6a44d6b930f7.79ff8.png",
      "source": "news+wiki-html"
    },
    {
      "id": "ky_tap_2",
      "wikiBuffId": 257,
      "name": "Kỳ Tập 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Mỗi lần bản thân thi triển hiệu quả Khống Chế lên địch, tăng sát thương cuối bản thân gây ra, không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/89e27ae6-c8c1-45b7-b3de-0e051bafd0b2.d9ba4.png",
      "source": "wiki-html"
    },
    {
      "id": "lay_dong",
      "wikiBuffId": 223,
      "name": "Lay Động",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Tăng thêm hiệu quả giảm sĩ khí",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/22319cd1-c787-478f-aebe-254dc354325c.1a874.png",
      "source": "news+wiki-html"
    },
    {
      "id": "lay_dong_2",
      "wikiBuffId": 224,
      "name": "Lay Động 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm hiệu quả Tăng Sĩ Khí, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/22319cd1-c787-478f-aebe-254dc354325c.1a874.png",
      "source": "wiki-html"
    },
    {
      "id": "li_thuong",
      "wikiBuffId": 135,
      "name": "Li Thương",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi bản thân đang mang một hiệu quả nhất định, sát thương phải chịu giảm 10%; nếu không thì tăng 10%.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/569dfb81-a87a-409d-b550-890b5eb12b42.bd6f7.png",
      "source": "wiki-html"
    },
    {
      "id": "lien_hoan",
      "wikiBuffId": 216,
      "name": "Liên Hoàn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Chuyển x% sát thương tướng đó phải chịu lên toàn phe.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/0278e5a3-a42b-4d81-9b0d-2cf37e5b1bbd.3eca4.png",
      "source": "news+wiki-html"
    },
    {
      "id": "lien_kich",
      "wikiBuffId": 155,
      "name": "Liên Kích",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Kích hoạt khi trong đội có tướng chỉ định, tung một đòn tấn công liên kết.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/b93de812-c239-430b-9a06-0dbe713eeeaa.dcc00.png",
      "source": "news+wiki-html"
    },
    {
      "id": "lien_tuc",
      "wikiBuffId": 204,
      "name": "Liên Tục",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi thi triển kỹ năng , làm cho lực tấn công của bản thân tăng X%, có thể cộng dồn, nếu như không thi triển kỹ năng thì mất số tầng cộng dồn.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/4ab6aaa1-b2cd-46a7-8549-6fe17ffa7030.6afdc.png",
      "source": "news+wiki-html"
    },
    {
      "id": "long_hon",
      "wikiBuffId": 137,
      "name": "Long Hồn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Nếu bản thân bị khống chế, thì khôi phục binh lực [giá trị hiệu quả] (hệ số là -0,2 kế sách cộng máu) và ngẫu nhiên giải trừ [giá trị hiệu quả] một hiệu ứng bất lợi.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/06218e2b-0e51-4300-8dce-bbc83618e5db.0b4df.png",
      "source": "news+wiki-html"
    },
    {
      "id": "loai_bo",
      "wikiBuffId": 42,
      "name": "Loại Bỏ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Miễn dịch hiệu quả bất lợi",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/a710f98b-a72a-47c8-b153-58da870b5f8b.29e49.png",
      "source": "news+wiki-html"
    },
    {
      "id": "loai_bo_may_tinh",
      "wikiBuffId": 301,
      "name": "Loại bỏ máy tính",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "ly_roi",
      "name": "Ly rời",
      "category": "Không thể giải trừ",
      "kind": "unremovable",
      "desc": "Khi bản thân có hiệu ứng XX, thiệt hại giảm 10%, không có hiệu ứng XX thì sát thương tăng 10%.",
      "source": "news"
    },
    {
      "id": "loi_co",
      "wikiBuffId": 192,
      "name": "Lôi Cổ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi lần bản thân Đánh Thường hoặc Phản Kích, đều sẽ tăng sĩ khí cho bản thân và đồng đội",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/753b09fb-6a79-4c26-a55b-638cd914d1d2.8b594.png",
      "source": "news+wiki-html"
    },
    {
      "id": "loi_co_2",
      "wikiBuffId": 193,
      "name": "Lôi Cổ 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Mỗi lần bản thân Đánh Thường hoặc Phản Kích, sẽ tăng sĩ khí cho bản thân và đồng đội, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/753b09fb-6a79-4c26-a55b-638cd914d1d2.8b594.png",
      "source": "news+wiki-html"
    },
    {
      "id": "lac_nguyet",
      "wikiBuffId": 78,
      "name": "Lạc Nguyệt",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Xếu diệt được địch sẽ hồi phục 500 sĩ khí, nếu không sẽ gây Hư Nhược 1 lượt",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "loi_don",
      "wikiBuffId": 229,
      "name": "Lời Đồn",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi tấn công mục tiêu sĩ khí dưới mức nhất định, sẽ khiến mục tiêu bị Hỗn Loạn 1 lượt.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "luc_doan",
      "wikiBuffId": 317,
      "name": "Lực Đoạn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Không thể hồi phục sĩ khí, mỗi lượt gây sát thương toàn phe địch",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/390c79a5-4a8b-489b-974b-8e74e958a953.c16d4.png",
      "source": "wiki-html"
    },
    {
      "id": "ma_am",
      "wikiBuffId": 122,
      "name": "Ma Ám",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Mỗi tầng Ma Ám giảm tỉ lệ binh lực tối đa, có thể cộng dồn",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e48836e6-29f8-4dca-8fe5-f40c4947787e.d50be.png",
      "source": "news+wiki-html"
    },
    {
      "id": "minh_triet",
      "wikiBuffId": 222,
      "name": "Minh Triết",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Nếu bản thân không có buff bất lợi, tấn công tăng X%, phòng thủ tăng Y%.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/55ad2cb7-6479-4470-8d2e-aebaacc6f5b5.f48c4.png",
      "source": "news+wiki-html"
    },
    {
      "id": "minh_tam",
      "wikiBuffId": 113,
      "name": "Minh Tâm",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giảm xác suất bị Băng Phong",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e0d91b19-4d44-4b44-9432-5852f841ec88.db293.png",
      "source": "news+wiki-html"
    },
    {
      "id": "mien_dich",
      "wikiBuffId": 220,
      "name": "Miễn Dịch",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Miễn dịch tất cả các tác dụng tăng và giảm.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d6ad5dbe-99df-44e8-9a19-1fd9d7cd6f5b.49981.png",
      "source": "news+wiki-html"
    },
    {
      "id": "mien_dich_ma_am",
      "wikiBuffId": 174,
      "name": "Miễn Dịch Ma Ám",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Miễn dịch hiệu quả Ma Ám.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "mien_thuong",
      "wikiBuffId": 129,
      "name": "Miễn Thương",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Các tướng có hiệu ứng này không thể giải trừ trên cơ thể làm giảm sát thương [giá trị hiệu quả] nhận vào.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/66e43afc-922b-4122-9d66-52e358f39807.c8db1.png",
      "source": "news+wiki-html"
    },
    {
      "id": "may_den",
      "name": "Mây đen",
      "category": "Giảm",
      "kind": "debuff",
      "desc": "Nếu mục tiêu là kẻ thù, sau đó giảm sĩ khí [giá trị hiệu quả] mỗi lượt; Nếu mục tiêu là đồng đội, sau đó mỗi lượt tăng [giá trị hiệu quả] sĩ khí.",
      "source": "news"
    },
    {
      "id": "me_hoac",
      "wikiBuffId": 51,
      "name": "Mê Hoặc",
      "category": "Bất lợi",
      "loai": "bat-loi khong-che",
      "kind": "debuff",
      "desc": "Trong trạng thái BUFF này ko thể hành động và tấn công đồng đội ngẫu nhiên",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/a72fafe5-a1f7-4a71-936e-7bdea2b20411.708df.png",
      "source": "news+wiki-html"
    },
    {
      "id": "muu_cong",
      "wikiBuffId": 61,
      "name": "Mưu Công",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Trong thời gian duy trì, đòn đánh thường được tăng thêm một lần đánh bằng mưu công, đồng thời không thể hồi lại sĩ khí.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/480a3cee-12df-44be-bf22-e6e026c245fd.67158.png",
      "source": "news+wiki-html"
    },
    {
      "id": "muu_dinh",
      "wikiBuffId": 210,
      "name": "Mưu Định",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Không thể hồi phục sĩ khí, mỗi lượt đối với toàn bộ địch nhân tạo thành sát thương kế sách X lần Y%.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/62928d64-f505-4326-a578-d40470a25742.2f924.png",
      "source": "news+wiki-html"
    },
    {
      "id": "met_moi",
      "wikiBuffId": 67,
      "name": "Mệt Mỏi",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Có hiệu lực sau khi Bất khuất có hiệu lực.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/fbd6b052-1410-43e5-90fe-820382f4fba6.5d834.png",
      "source": "news+wiki-html"
    },
    {
      "id": "nghia_dung",
      "wikiBuffId": 266,
      "name": "Nghĩa Dũng",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng X cả 3 thuộc tính, mỗi lượt giảm Y cả 3 thuộc tính",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "nghia_dung_1",
      "wikiBuffId": 267,
      "name": "Nghĩa Dũng 1",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng X thuộc tính C.Huy, mỗi lượt giảm Y thuộc tính C.Huy",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "nghia_dung_2",
      "wikiBuffId": 268,
      "name": "Nghĩa Dũng 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng X thuộc tính Võ, mỗi lượt giảm Y thuộc tính Võ",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "nghia_dung_3",
      "wikiBuffId": 269,
      "name": "Nghĩa Dũng 3",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng X thuộc tính Trí, mỗi lượt giảm Y thuộc tính Trí",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "nghia_tuyet",
      "wikiBuffId": 99,
      "name": "Nghĩa Tuyệt",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Vật Công tăng 7000%, nhận sát thương bất kỳ đều Phản Kích, mỗi lần Phản Kích khiến Vật Công tăng 400%",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ea2816de-3127-44e1-abeb-72fac141a5ca.05e05.png",
      "source": "news+wiki-html"
    },
    {
      "id": "nghich_chien_2",
      "wikiBuffId": 169,
      "name": "Nghịch Chiến 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Binh lực bản thân càng ít tấn công càng cao.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d49073a9-ba26-4203-abea-7121c8adbdc4.ea0c9.png",
      "source": "news+wiki-html"
    },
    {
      "id": "nghich_chuyen",
      "wikiBuffId": 114,
      "name": "Nghịch Chuyển",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sau khi bị tấn công sẽ phản lại một buff; Y là số lượt duy trì buff đó.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e9581b4b-8b71-4bfa-966c-189003663cb4.2705c.png",
      "source": "wiki-html"
    },
    {
      "id": "nghich_chuyen_2",
      "wikiBuffId": 198,
      "name": "Nghịch Chuyển 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi bản thân bị tấn công, khiến kẻ địch chịu 1 tầng giẫm đạp, cộng dồn 5 tầng sẽ khiến địch hỗn loạn không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e9581b4b-8b71-4bfa-966c-189003663cb4.2705c.png",
      "source": "news+wiki-html"
    },
    {
      "id": "nguyet_huy",
      "wikiBuffId": 203,
      "name": "Nguyệt Huy",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Hiệu quả giảm sĩ khí giảm X%.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/eaf4e170-5da1-43ca-8cca-0a69f5ce9328.bc4c3.png",
      "source": "news+wiki-html"
    },
    {
      "id": "nguyet_huy_2",
      "wikiBuffId": 235,
      "name": "Nguyệt Huy 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Hiệu quả giảm sĩ khí giảm, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/eaf4e170-5da1-43ca-8cca-0a69f5ce9328.bc4c3.png",
      "source": "wiki-html"
    },
    {
      "id": "nguyet_hon",
      "wikiBuffId": 33,
      "name": "Nguyệt Hồn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Không chịu ảnh hưởng từ hiệu quả giảm sĩ khí",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/fde66ab0-3042-44e7-91ca-63fa9697eb15.257a7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "nguyet_hon_2",
      "wikiBuffId": 89,
      "name": "Nguyệt Hồn 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Nguyệt Hồn không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/fde66ab0-3042-44e7-91ca-63fa9697eb15.257a7.png",
      "source": "wiki-html"
    },
    {
      "id": "ngu_say",
      "wikiBuffId": 26,
      "name": "Ngủ Say",
      "category": "Bất lợi",
      "loai": "bat-loi khong-che",
      "kind": "debuff",
      "desc": "Trong trạng thái BUFF này, mục tiêu sẽ rơi vào trạng thái không thể tấn công, BUFF sẽ biến mất khi bị sát thương.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/7643ebbd-1a68-4cf3-b3ec-200ccca8670a.52d22.png",
      "source": "news+wiki-html"
    },
    {
      "id": "ngu_hoanh",
      "wikiBuffId": 277,
      "name": "Ngự Hoành",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm sát thương phải chịu từ kỹ năng hàng dọc/hàng ngang, không thể giải trừ.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "nhue_kich",
      "wikiBuffId": 273,
      "name": "Nhuệ Kích",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Tăng sát thương kỹ năng lên 1 mục tiêu, không thể giải trừ.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "nhan_tam_bo",
      "wikiBuffId": 207,
      "name": "Nhân Tâm (Bỏ)",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Trị liệu cuối cùng bản thân tạo ra (không gồm BUFF) tăng X%. Nếu đạt giới hạn tối đa, trị liệu cuối = Giới hạn × (100% + X%).",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/0d90b45f-a50e-40ed-a6e8-9707c2cef7c5.ef5b8.png",
      "source": "wiki-html"
    },
    {
      "id": "pha_thanh",
      "wikiBuffId": 87,
      "name": "Phá Thánh",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi phát động một cuộc tấn công, nếu mục tiêu có [miễn dịch] hoặc [loại bỏ], thiệt hại gây ra cho mục tiêu cộng thêm[giá trị hiệu quả].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5589d389-b9dd-4218-ac4a-9bf9fee1b66b.94c91.png",
      "source": "news+wiki-html"
    },
    {
      "id": "pha_dich",
      "wikiBuffId": 293,
      "name": "Phá Địch",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm hiệu quả Đào Binh phải chịu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/67b9b697-fafc-4e84-9d0b-8d075cc565d5.8d8ed.png",
      "source": "wiki-html"
    },
    {
      "id": "phan",
      "wikiBuffId": 101,
      "name": "Phản",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng xác suất phản kích của mục tiêu.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/7fd8912d-c869-42f0-bc25-23f98b9f6841.1d3d1.png",
      "source": "wiki-html"
    },
    {
      "id": "phan_cong",
      "name": "Phản công",
      "category": "Tăng",
      "kind": "buff",
      "desc": "Xác suất phản công tăng lên 100%.",
      "source": "news"
    },
    {
      "id": "phan_chan",
      "wikiBuffId": 171,
      "name": "Phấn Chấn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sĩ khí nhận được mỗi lượt tăng điểm X.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/7ef92aca-d0e5-4937-abdf-efcc04c71802.e82c4.png",
      "source": "news+wiki-html"
    },
    {
      "id": "phuc_thu",
      "wikiBuffId": 44,
      "name": "Phục Thù",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi chịu sát thương sẽ Phản Kích",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ea2816de-3127-44e1-abeb-72fac141a5ca.05e05.png",
      "source": "wiki-html"
    },
    {
      "id": "phuc_thu_3",
      "wikiBuffId": 100,
      "name": "Phục Thù 3",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi lần phản kích tấn công địch trên đường thẳng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ea2816de-3127-44e1-abeb-72fac141a5ca.05e05.png",
      "source": "wiki-html"
    },
    {
      "id": "quy_phong",
      "wikiBuffId": 180,
      "name": "Quỷ Phong",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng khả năng kháng hiệu quả Khống Chế, giảm xác suất trúng Khống Chế",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1aa32375-a106-408a-8532-7dbc69a22994.f998c.png",
      "source": "wiki-html"
    },
    {
      "id": "song_hung",
      "wikiBuffId": 154,
      "name": "Song Hùng",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tính toán quân đội bạn có hiệu ứng song hùng khác hay không, mỗi lượt tăng tấn công X% của mình (tương tự như anh dũng), hiệu quả có thể cộng dồn.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d428b7bf-7f62-4acc-bf24-cff33ea18e34.d79e5.png",
      "source": "news+wiki-html"
    },
    {
      "id": "suy_yeu",
      "wikiBuffId": 231,
      "name": "Suy Yếu",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm phe địch X Chỉ Huy, Võ và Trí.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/614cb152-a462-4221-838a-20f5e4e23fae.05fd0.png",
      "source": "news+wiki-html"
    },
    {
      "id": "sach_thuan",
      "wikiBuffId": 298,
      "name": "Sách Thuẫn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng phòng thủ, điểm Trí đối phương càng thấp so với bản thân, sát thương phải chịu càng ít",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/c427d071-6ebe-4eaf-a325-38a8d582bf34.887e7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "soi_suc",
      "wikiBuffId": 83,
      "name": "Sôi Sục",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi khi mục tiêu nhận trị liệu, người thi triển cũng sẽ nhận trị liệu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/6c45858b-1ce5-479d-a5b6-17388e381bac.216f6.png",
      "source": "wiki-html"
    },
    {
      "id": "sung_kiem",
      "wikiBuffId": 157,
      "name": "Sùng Kiệm",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi bắt đầu lượt, giải trừ x hiệu quả bất lợi, mỗi hiệu quả được giải trù hồi phục 50000 lính lợi của bản thân x2.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/452d1a51-461b-46b9-8b4a-d14ecfa9cd1d.b524f.png",
      "source": "news+wiki-html"
    },
    {
      "id": "so_hai",
      "wikiBuffId": 85,
      "name": "Sợ Hãi",
      "category": "Bất lợi",
      "loai": "bat-loi khong-che",
      "kind": "debuff",
      "desc": "Không thể hành động, tấn công ngẫu nhiên 1 đồng minh, xóa bỏ khi bị nhận sát thương .",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/6c09ee33-38c0-43fb-891e-98d8a3c06163.395b7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tan_vo",
      "wikiBuffId": 92,
      "name": "Tan Vỡ",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "( giá trị hiệu quả ) xác suất tiến vào [Hỗn Loạn], liên tục [giá trị hiệu quả] một lượt, binh lực càng ít [Hỗn Loạn] xác suất càng cao.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2292a825-c85d-40e7-a099-202ee97c3151.841c4.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thanh_long_2",
      "wikiBuffId": 175,
      "name": "Thanh Long 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Tăng x% công phòng của bản thân, hiệu ứng này không thể bị giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/400bfefe-b5fa-4ca5-8dff-dd6d94608029.37869.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thi_ky",
      "wikiBuffId": 115,
      "name": "Thi Kỹ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi tấn công, áp thêm 1 buff lên mục tiêu.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e9581b4b-8b71-4bfa-966c-189003663cb4.2705c.png",
      "source": "wiki-html"
    },
    {
      "id": "thi_ky_2",
      "wikiBuffId": 178,
      "name": "Thi Kỹ 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi tấn công, gây thêm sát thương và tự nhận 1 buff.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e9581b4b-8b71-4bfa-966c-189003663cb4.2705c.png",
      "source": "wiki-html"
    },
    {
      "id": "thi_doc",
      "wikiBuffId": 34,
      "name": "Thi Độc",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi bắt đầu lượt, chịu x% mưu công của người thi triển, sát thương phải chịu sẽ lan cho tướng cùng phe.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/9a8cf6c0-f8ac-41cd-a460-4adddf596ae7.c8193.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thien_cam",
      "wikiBuffId": 181,
      "name": "Thiên Cấm",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng khả năng kháng hiệu quả Tan Vỡ, giảm xác suất trúng Tan Vỡ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2292a825-c85d-40e7-a099-202ee97c3151.841c4.png",
      "source": "wiki-html"
    },
    {
      "id": "thien_hoa",
      "wikiBuffId": 68,
      "name": "Thiên Hỏa",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Khi kết thúc lượt, chịu 15000% sát thương mưu công của người thi triển, sát thương phải chịu lan cho tướng cùng phe",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/05df3c9f-bdff-4edf-9b48-5b38e5a75207.4055a.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thien_tuong",
      "wikiBuffId": 183,
      "name": "Thiên Tượng",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi thi triển kỹ năng, bộ phận sĩ khí cao hơn 100 sẽ tăng sát thương thêm",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/fd1d764b-0e16-4f7e-b1e3-dd2097c4e2fd.4852b.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thien_van",
      "wikiBuffId": 65,
      "name": "Thiên Vận",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi lượt tăng sát thương cho bản thân theo bội số ngẫu nhiên (từ 1 đến X lần).",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ac54579b-1973-48d2-8212-1c7e6168ce67.3dd56.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thieu_thuong",
      "wikiBuffId": 147,
      "name": "Thiêu Thương",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Tăng sát thương do Thiêu Đốt và Thiên Hỏa gây ra",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "thieu_dot",
      "wikiBuffId": 22,
      "name": "Thiêu Đốt",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Gây sát thương kế sách kéo dài theo lượt.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/66a94d42-a050-46ab-ac1d-dbb2e54d8c8c.4cd5a.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thiet_bich",
      "wikiBuffId": 3,
      "name": "Thiết bích",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tất cả các chấn thương phải chịu giảm xuống còn 1 điểm.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d6ad5dbe-99df-44e8-9a19-1fd9d7cd6f5b.49981.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thiet_y",
      "wikiBuffId": 146,
      "name": "Thiết Ý",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Với hiệu ứng này, trong vòng liên tục có thể chống lại hiệu ứng kiểm soát thứ cấp [giá trị hiệu ứng] (hỗn loạn, hôn mê, sợ hãi, đóng băng, sợ hãi).",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1a0a7370-7171-43b7-ba99-e948c816eb5c.1e25a.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thiet_y_chuyen_dung_bac_7",
      "wikiBuffId": 309,
      "name": "Thiết Ý (Chuyên dụng bậc 7)",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Có thể chống đỡ số lần hiệu quả khống chế nhất định (Hỗn Loạn, Hôn Mê, Sợ Hãi, Băng Phong, Mê Hoặc)",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "thien_chien_2",
      "wikiBuffId": 256,
      "name": "Thiện Chiến 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Tăng tất cả tấn công, có thể cộng dồn, có giới hạn tối đa.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/fdeddfa9-2c03-494e-8119-6a30f3ce59eb.0c8e4.png",
      "source": "wiki-html"
    },
    {
      "id": "them_binh_linh",
      "name": "Thêm binh lính",
      "category": "Tăng",
      "kind": "buff",
      "desc": "Binh lực và binh lực giới hạn hiện có tăng lên.",
      "source": "news"
    },
    {
      "id": "them_linh",
      "wikiBuffId": 40,
      "name": "Thêm Lính",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Thêm lính theo tỉ lệ phần trăm",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/4406d9b8-728e-4956-a86e-91a7eb7abada.53245.png",
      "source": "wiki-html"
    },
    {
      "id": "thi_quan",
      "wikiBuffId": 225,
      "name": "Thí Quân",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Phá hoại Thiết Bích của mục tiêu và gây thêm sát thương theo tỉ lệ phần trăm của sát thương hiện tại",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/57a20b99-3736-4b2c-802e-7cc999fbeab5.d8937.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thi_quan_2",
      "wikiBuffId": 226,
      "name": "Thí Quân 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Phá hoại Thiết Bích của mục tiêu và gây thêm sát thương theo tỉ lệ phần trăm của sát thương hiện tại, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/57a20b99-3736-4b2c-802e-7cc999fbeab5.d8937.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thoi_mien",
      "wikiBuffId": 106,
      "name": "Thôi Miên",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Máu của đối phương càng nhiều thì xác suất bị ngủ càng cao.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/7643ebbd-1a68-4cf3-b3ec-200ccca8670a.52d22.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thuong_tich",
      "wikiBuffId": 211,
      "name": "Thương Tích",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Mỗi lần bị thương, tổn thất X binh lực hiện tại, tối đa có hiệu lực Y.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/687724dc-5d5b-4e6b-a38f-bacb8915b34a.1ea4e.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thau_suot",
      "wikiBuffId": 55,
      "name": "Thấu Suốt",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sát thương gây cho mục tiêu có BUFF Treo Thưởng tăng hoặc giảm",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/3fafe65f-44e1-435d-9dc9-7d1dae25a367.0fa28.png",
      "source": "news+wiki-html"
    },
    {
      "id": "than_binh",
      "wikiBuffId": 38,
      "name": "Thần Binh",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Dựa theo binh lực bản thân gia tăng lực tấn công, tối đa không vượt quá 160%.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5a6251c9-443d-4ce7-8f94-d150b0bcc5c4.e3a46.png",
      "source": "news+wiki-html"
    },
    {
      "id": "than_loi",
      "wikiBuffId": 69,
      "name": "Thần Lôi",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Diệt mục tiêu sẽ hồi phục sĩ khí",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "than_toc",
      "wikiBuffId": 93,
      "name": "Thần Tốc",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Gây sát thương [giá trị hiệu quả] cho kẻ thù bị Tê liệt.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/0ce6f563-0377-44ad-9489-d5f6727755c7.d56a3.png",
      "source": "news+wiki-html"
    },
    {
      "id": "than_toc_2",
      "wikiBuffId": 149,
      "name": "Thần Tốc 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Gây sát thương gấp bội cho địch bị khống chế, không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/0ce6f563-0377-44ad-9489-d5f6727755c7.d56a3.png",
      "source": "wiki-html"
    },
    {
      "id": "thi_huyet",
      "wikiBuffId": 118,
      "name": "Thị Huyết",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Xếu mục tiêu có tỉ lệ Lính dưới 75%/50%, bản thân nhận Cuồng Bạo/Liên Chiến, duy trì 30 lượt.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/9c619805-8b48-4024-a89d-d287d2b76212.adcf6.png",
      "source": "wiki-html"
    },
    {
      "id": "thinh_no",
      "name": "Thịnh nộ",
      "category": "Tăng",
      "kind": "buff",
      "desc": "Khi bị thương, hồi phục sĩ khí",
      "source": "news"
    },
    {
      "id": "thong_quan",
      "wikiBuffId": 214,
      "name": "Thống Quân",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Vật công gây ra tăng X%, có thể cộng dồn.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/3b2303f3-dee5-4249-8ef3-57bab6de3abd.689ae.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thu_ho",
      "wikiBuffId": 4,
      "name": "Thủ Hộ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giảm sát thương cho mục tiêu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2bfb6cf6-ebb2-4803-9a1d-1bd442e60775.6fd5a.png",
      "source": "news+wiki-html"
    },
    {
      "id": "thu_ho_2",
      "wikiBuffId": 81,
      "name": "Thủ Hộ 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Tăng phòng thủ, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2bfb6cf6-ebb2-4803-9a1d-1bd442e60775.6fd5a.png",
      "source": "wiki-html"
    },
    {
      "id": "thu_nghia",
      "wikiBuffId": 132,
      "name": "Thủ Nghĩa",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giảm sát thương phải chịu khi không trong lượt bản thân",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/f50d8789-9a74-41b3-9eef-47a40f5f74c6.5f71e.png",
      "source": "wiki-html"
    },
    {
      "id": "thu_ngu",
      "wikiBuffId": 278,
      "name": "Thủ Ngự",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Giảm sát thương phải chịu từ kỹ năng toàn thể, không thể giải trừ.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "thuy_kinh_2",
      "wikiBuffId": 173,
      "name": "Thủy Kính 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng tất cả phòng thủ, sau đó giảm theo số lượt. về 0 sau 5 lượt hành động",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/c577aba9-9ed9-4bc6-bf84-08f5e62d245e.74449.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tin_gia",
      "wikiBuffId": 292,
      "name": "Tin Giả",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giảm sát thương Thi Độc phải chịu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ff66d095-f66f-4b72-92e5-f8a1affd5750.81b51.png",
      "source": "wiki-html"
    },
    {
      "id": "tien_cong",
      "wikiBuffId": 60,
      "name": "Tiến Công",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Đánh thường tăng Pháp Công, trong thời gian đó không thể hồi sĩ khí",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/9d6a251e-0f54-40da-9391-184cf8e8b60d.a54c6.png",
      "source": "wiki-html"
    },
    {
      "id": "toan_nang",
      "wikiBuffId": 238,
      "name": "Toàn Năng",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng C.Huy, Võ, Trí, không thể cộng dồn.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/f37715fe-47ed-4694-a881-2e684127e7a8.c4bec.png",
      "source": "news+wiki-html"
    },
    {
      "id": "toan_nang_chuyen_dung_bac_7",
      "wikiBuffId": 307,
      "name": "Toàn Năng (Chuyên dụng bậc 7)",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng C.Huy, Võ, Trí, không thể cộng dồn.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "toan_nang_2",
      "wikiBuffId": 279,
      "name": "Toàn Năng 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng C.Huy, Võ, Trí, không thể cộng dồn.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/f37715fe-47ed-4694-a881-2e684127e7a8.c4bec.png",
      "source": "wiki-html"
    },
    {
      "id": "treo_thuong",
      "wikiBuffId": 54,
      "name": "Treo Thưởng",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng sát thương từ tướng có Thấu Suốt, khi tướng mang hiệu quả này tử trận, toàn phe ta tăng x sĩ khí.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5228c82f-fb6d-481c-88af-36df47a4c4a2.3dc68.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tru_than",
      "wikiBuffId": 185,
      "name": "Tru Thần",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Khi tấn công địch nhân có [hộ nhậnẫn] và [chống đỡ], lập tức phá bỏ tất cả lá chắn và hiệu quả chống đỡ, đồng thời gây thêm sát thương [giá trị hiệu quả].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/29c87b45-70c7-4dcd-8dcd-71d76456d8c2.b1faa.png",
      "source": "news+wiki-html"
    },
    {
      "id": "truy_kich_2",
      "wikiBuffId": 176,
      "name": "Truy Kích 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Gây sát thương X lần cho các đơn vị có buff cụ thể.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/a3707020-dc59-4f8b-b86a-da8ebc6a4b05.d3554.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tri",
      "wikiBuffId": 246,
      "name": "Trí",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Bản thân tăng Trí",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/dff1e976-13c2-44ac-a80b-f7ae221e84a2.f023b.png",
      "source": "wiki-html"
    },
    {
      "id": "tri_luc_2",
      "wikiBuffId": 255,
      "name": "Trí Lực 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Bản thân tăng Trí, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/dff1e976-13c2-44ac-a80b-f7ae221e84a2.f023b.png",
      "source": "wiki-html"
    },
    {
      "id": "tri_tue",
      "wikiBuffId": 167,
      "name": "Trí Tuệ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng sát thương kế sách, hiệu quả có thể cộng dồn.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ccd3a94f-edb2-486d-8968-feafb766a429.02678.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tri_tue_2",
      "wikiBuffId": 205,
      "name": "Trí Tuệ 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng Mưu Công, có thể cộng dồn",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ccd3a94f-edb2-486d-8968-feafb766a429.02678.png",
      "source": "wiki-html"
    },
    {
      "id": "tru_sach_chuyen_dung_bac_7",
      "wikiBuffId": 316,
      "name": "Trù Sách (Chuyên dụng bậc 7)",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sát thương kế sách cuối cùng gây ra tăng X%",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "trung_doc",
      "wikiBuffId": 1,
      "name": "Trúng độc",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Mỗi lượt, tướng đang Trúng Độc sẽ mất một lượng sinh lực nhất định.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ff66d095-f66f-4b72-92e5-f8a1affd5750.81b51.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tram_sat",
      "wikiBuffId": 57,
      "name": "Trảm Sát",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi tỉ lệ sinh lực của mục tiêu thấp hơn X%, lập tức tử vong.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/72459c82-139f-42a5-a053-3a6da7301281.186e6.png",
      "source": "wiki-html"
    },
    {
      "id": "tram_tien",
      "wikiBuffId": 221,
      "name": "Trảm Tiên",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Lập tức xóa bỏ hiệu quả Nguyệt Hồn và Nguyệt Hồn 2, tăng sát thương gây ra",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/705e1df3-ba4a-4564-96a2-2b42cd2a2ae7.13004.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tran_quoc",
      "name": "Trấn Quốc",
      "category": "Tăng",
      "kind": "buff",
      "desc": "Toàn phe ta tăng pháp phòng mưu phòng x%.",
      "source": "news"
    },
    {
      "id": "tung_hoanh",
      "wikiBuffId": 274,
      "name": "Tung Hoành",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Tăng sát thương kỹ năng hàng dọc/hàng ngang, không thể giải trừ.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "tan_ta",
      "wikiBuffId": 243,
      "name": "Tàn Tạ",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm C.Huy, Võ và Trí",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1b211fea-7678-4a07-aa17-33f7787dceff.d218a.png",
      "source": "wiki-html"
    },
    {
      "id": "tan_ta_2",
      "wikiBuffId": 304,
      "name": "Tàn Tạ 2",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Giảm C.Huy, Võ và Trí",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1b211fea-7678-4a07-aa17-33f7787dceff.d218a.png",
      "source": "wiki-html"
    },
    {
      "id": "tai_sinh",
      "wikiBuffId": 110,
      "name": "Tái Sinh",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi lần bị tấn công hồi lượng Lính nhất định",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/bb39f256-52c1-44b1-a2a4-09ff2025003e.ae99f.png",
      "source": "wiki-html"
    },
    {
      "id": "te_liet",
      "wikiBuffId": 86,
      "name": "Tê Liệt",
      "category": "Bất lợi",
      "loai": "bat-loi khong-che",
      "kind": "debuff",
      "desc": "Khi bắt đầu lượt có xác suất 50% tiến vào [Hỗn loạn",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/9c1dba9c-ea7b-4c83-848d-f37f90280a85.13be7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tong_long",
      "wikiBuffId": 70,
      "name": "Tòng Long",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Hiệu quả có lợi, tăng tất cả công của bản thân, hiệu quả có lợi càng nhiều, tấn công tăng càng nhiều",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/26599b19-db65-4627-8e32-74bb6af4bf15.e21f1.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tong_long_2",
      "wikiBuffId": 239,
      "name": "Tòng Long 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Hiệu quả có lợi, tăng tất cả công của bản thân, hiệu quả có lợi càng nhiều, tấn công tăng càng nhiều. Hiệu quả không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/26599b19-db65-4627-8e32-74bb6af4bf15.e21f1.png",
      "source": "wiki-html"
    },
    {
      "id": "tang_chien_cong",
      "name": "Tăng chiến công",
      "category": "Tăng",
      "kind": "buff",
      "desc": "Tăng chiến công của tướng",
      "source": "news"
    },
    {
      "id": "tang_cong_2",
      "wikiBuffId": 80,
      "name": "Tăng Công 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Tăng tất cả công, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/b248c1a1-26ee-4fcf-acc4-573a0cb823d3.f6214.png",
      "source": "wiki-html"
    },
    {
      "id": "tang_cuong",
      "wikiBuffId": 187,
      "name": "Tăng Cường",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Bản thân thi triển buff đặc biệt sẽ nhận được hiệu quả tăng cường có thể cộng dồn.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "tang_muu_cong",
      "wikiBuffId": 11,
      "name": "Tăng Mưu Công",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng mưu công của tướng.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5ee8a2fd-9406-4cc2-821a-6918b21e8a3d.09a51.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tang_muu_cong_2",
      "wikiBuffId": 141,
      "name": "Tăng Mưu Công 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khiến mục tiêu tăng Mưu Công",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/5ee8a2fd-9406-4cc2-821a-6918b21e8a3d.09a51.png",
      "source": "wiki-html"
    },
    {
      "id": "tang_muu_phong_2",
      "wikiBuffId": 153,
      "name": "Tăng Mưu Phòng 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng Mưu Phòng.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/89ab7c3a-d7db-4e1d-949a-609b86907dfe.728e6.png",
      "source": "wiki-html"
    },
    {
      "id": "tang_phap_cong",
      "wikiBuffId": 10,
      "name": "Tăng Pháp Công",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng pháp công của tướng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/bea274f3-1f54-4466-b6cc-0c6b85a52013.9941a.png",
      "source": "wiki-html"
    },
    {
      "id": "tang_phap_cong_2",
      "wikiBuffId": 140,
      "name": "Tăng Pháp Công 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khiến mục tiêu tăng Pháp Công",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/bea274f3-1f54-4466-b6cc-0c6b85a52013.9941a.png",
      "source": "wiki-html"
    },
    {
      "id": "tang_phap_phong_2",
      "wikiBuffId": 156,
      "name": "Tăng Pháp Phòng 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng Pháp Phòng.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/6ecc5c49-f318-492c-a20e-82864f496d2e.4e91f.png",
      "source": "wiki-html"
    },
    {
      "id": "tang_st_chien_phap_2",
      "wikiBuffId": 264,
      "name": "Tăng ST Chiến Pháp 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi khi bản thân chịu cùng một loại sát thương (Vật Lý, Kế Sách, Chiến Pháp), phòng thủ loại đó sẽ giảm X%, tối đa cộng dồn đến Y%. Mỗi loại được tính riêng.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "tang_st_ke_sach_2",
      "wikiBuffId": 265,
      "name": "Tăng ST Kế Sách 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi khi bản thân chịu cùng một loại sát thương (Vật Lý, Kế Sách, Chiến Pháp), phòng thủ loại đó sẽ giảm X%, tối đa cộng dồn đến Y%. Mỗi loại được tính riêng.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "tang_st_vat_ly_2",
      "wikiBuffId": 263,
      "name": "Tăng ST Vật Lý 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi khi bản thân chịu cùng một loại sát thương (Vật Lý, Kế Sách, Chiến Pháp), phòng thủ loại đó sẽ giảm X%, tối đa cộng dồn đến Y%. Mỗi loại được tính riêng.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "tang_tan_cong",
      "wikiBuffId": 12,
      "name": "Tăng Tấn Công",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng tất cả công của tướng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/b248c1a1-26ee-4fcf-acc4-573a0cb823d3.f6214.png",
      "source": "wiki-html"
    },
    {
      "id": "tang_tat_ca_cong",
      "name": "Tăng tất cả công",
      "category": "Tăng",
      "kind": "buff",
      "desc": "Tăng tất cả sức mạnh tấn công của tướng.",
      "source": "news"
    },
    {
      "id": "tang_uy",
      "wikiBuffId": 95,
      "name": "Tăng Uy",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sau lượt thứ 4 sẽ Thức Tỉnh, mỗi lượt tăng tỉ lệ tấn công nhất định",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/fdeddfa9-2c03-494e-8119-6a30f3ce59eb.0c8e4.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tang_vat_cong",
      "wikiBuffId": 9,
      "name": "Tăng Vật Công",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng tấn công vật lý của tướng",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2e13a71e-bb4b-47ba-98c2-53e47f3cce81.6c78d.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tang_vat_cong_2",
      "wikiBuffId": 151,
      "name": "Tăng Vật Công 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khiến mục tiêu tăng Vật Công.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2e13a71e-bb4b-47ba-98c2-53e47f3cce81.6c78d.png",
      "source": "wiki-html"
    },
    {
      "id": "tang_vat_phong_2",
      "wikiBuffId": 170,
      "name": "Tăng Vật Phòng 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng phòng thủ vật lý, hiệu ứng này không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/a96c6404-5d21-487e-b5e2-09993a5fe2ff.4ec91.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tuoc_doat",
      "wikiBuffId": 286,
      "name": "Tước Đoạt",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi gây sát thương cho mục tiêu mang [Treo Thưởng], giảm sĩ khí mục tiêu, tăng sĩ khí bản thân",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/9ad62db6-53d8-4e15-9ac6-2d8fa1052a06.8bab4.png",
      "source": "wiki-html"
    },
    {
      "id": "tan_cong_manh_me",
      "name": "Tấn công mạnh mẽ",
      "category": "Không thể giải trừ",
      "kind": "unremovable",
      "desc": "Trong thời gian duy trì, đòn đánh thường được tăng thêm một lần đánh bằng chiến pháp, đồng thời không thể hồi lại sĩ khí.",
      "source": "news"
    },
    {
      "id": "tat_hanh_chuyen_dung_bac_7",
      "wikiBuffId": 313,
      "name": "Tật Hành (Chuyên dụng bậc 7)",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sát thương cuối cùng gây ra tăng X%",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "tinh_hoa",
      "wikiBuffId": 46,
      "name": "Tịnh Hóa",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sát thương gây ra = sát thương kỹ năng + (số BUFF có lợi kẻ địch đang chịu × X).",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2622a9b1-4c91-4484-a9b8-99b6795f3c31.2f745.png",
      "source": "news+wiki-html"
    },
    {
      "id": "to_chi",
      "wikiBuffId": 84,
      "name": "Tỏ Chí",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Trước mỗi lượt hành động, giải trừ hiệu quả bất lợi.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2a42c078-213e-4136-bfce-1bd33084a42c.9b4e3.png",
      "source": "news+wiki-html"
    },
    {
      "id": "toa_binh",
      "wikiBuffId": 17,
      "name": "Tỏa Binh",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Không thể tăng binh lực",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/b952b445-412d-40b7-8c63-6cb1d2a0a04d.65f59.png",
      "source": "news+wiki-html"
    },
    {
      "id": "toa_binh_2",
      "wikiBuffId": 197,
      "name": "Tỏa Binh 2",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Không thể tăng binh lực",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/b952b445-412d-40b7-8c63-6cb1d2a0a04d.65f59.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tu_chien",
      "wikiBuffId": 62,
      "name": "Tử Chiến",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Trong thời gian duy trì, tăng sức mạnh đòn đánh thường, đồng thời không thể hồi lại sĩ khí.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/3a5e5943-eca0-4a3c-b3e1-a0730c26a853.ba75d.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tu_than",
      "wikiBuffId": 48,
      "name": "Tử Thần",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Diệt được mục tiêu sẽ hồi sĩ khí, chưa diệt được sẽ hồi 10% sĩ khí, khiến mục tiêu bị Hỗn Loạn 1 lượt.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "tu_than_2",
      "wikiBuffId": 73,
      "name": "Tử Thần 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giải trừ hiệu quả có lợi, nếu diệt được sẽ hồi phục sĩ khí, chưa diệt hồi phục 10% sĩ khí và gây Hỗn Loạn 1 lượt (Chỉ 1 lượt).",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "tu_thu",
      "wikiBuffId": 58,
      "name": "Tử Thủ",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tất cả lực phòng thủ gia tăng [giá trị hiệu quả], binh lực càng ít, lực phòng thủ tăng lên càng cao, tối đa là 80%.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/aa74195f-30b1-49b4-a050-611eb7eceb70.70d8e.png",
      "source": "news+wiki-html"
    },
    {
      "id": "tu_thu_2",
      "wikiBuffId": 138,
      "name": "Tử Thủ 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tỉ lệ lính càng ít, phòng thủ tăng càng nhiều",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/aa74195f-30b1-49b4-a050-611eb7eceb70.70d8e.png",
      "source": "wiki-html"
    },
    {
      "id": "vien_muu",
      "wikiBuffId": 125,
      "name": "Viễn Mưu",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sau khi có được BUFF, 2 lượt đầu tăng [Giá trị], tăng hiệu quả 1 tấn công (có thể cộng dồn).",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/89afcd0b-b8d5-4aaf-b35e-d283068ea961.9c47b.png",
      "source": "news+wiki-html"
    },
    {
      "id": "vong_doan",
      "wikiBuffId": 295,
      "name": "Vong Đoạn",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Hiệu quả bất lợi, khi có BUFF, sát thương phải chịu sẽ không xóa hiệu quả [Ngủ Say] và [Sợ Hãi].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/b504c956-72b0-4d33-a87b-af2522ef50f8.553d5.png",
      "source": "news+wiki-html"
    },
    {
      "id": "vay_khon_2",
      "wikiBuffId": 319,
      "name": "Vây Khốn 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Ngoài lượt của bản thân không thể được trị liệu, lượt của bản thân có thể được trị liệu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/4fba714f-1439-4df2-a5ce-7584fbeaf33a.f621c.png",
      "source": "wiki-html"
    },
    {
      "id": "vo_ngon",
      "wikiBuffId": 184,
      "name": "Vô Ngôn",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Đơn vị bị dín buff này khi sĩ khí từ 100 trở lên ko thể thi triển kỹ năng .",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1750cb64-0121-46ae-829d-800a17706601.5f981.png",
      "source": "news+wiki-html"
    },
    {
      "id": "vo_ngon_2",
      "wikiBuffId": 305,
      "name": "Vô Ngôn 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Không thể thi triển kỹ năng, chỉ có thể đánh thường, hiệu quả không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/1750cb64-0121-46ae-829d-800a17706601.5f981.png",
      "source": "wiki-html"
    },
    {
      "id": "vo_tinh",
      "wikiBuffId": 230,
      "name": "Vô Tình",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi gây sát thương, đi kèm với X% binh lực hiện tại của mình bỏ qua sát thương phòng thủ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/942b1434-54b9-4b5d-80f7-eb113df78975.c3b47.png",
      "source": "news+wiki-html"
    },
    {
      "id": "vo_dung",
      "wikiBuffId": 232,
      "name": "Võ Dũng",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Pháp công gây ra tăng 13% có thể cộng dồn",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/3242a534-478e-409f-aebd-396db2d17549.82b94.png",
      "source": "news+wiki-html"
    },
    {
      "id": "vo_luc",
      "wikiBuffId": 245,
      "name": "Võ Lực",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Mỗi tầng bất lực làm cho sát thương mà đơn vị này gây ra giảm [giá trị hiệu quả].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/8ac3bcb9-e43f-4997-91c0-0d075c632ae0.f2af7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "vo_luc_2",
      "wikiBuffId": 254,
      "name": "Võ Lực 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Bản thân tăng Võ, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/8ac3bcb9-e43f-4997-91c0-0d075c632ae0.f2af7.png",
      "source": "wiki-html"
    },
    {
      "id": "vo_tran",
      "wikiBuffId": 117,
      "name": "Vỡ Trận",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Hiệu quả trị liệu nhận được và sát thương gây ra đều biến thành 1.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/528294ef-71e0-48ae-a530-9b7c4ab9952e.116e7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "vo_tran_2",
      "wikiBuffId": 228,
      "name": "Vỡ Trận 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Sát thương gây ra và mức trị liệu đều là 1 điểm, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/528294ef-71e0-48ae-a530-9b7c4ab9952e.116e7.png",
      "source": "wiki-html"
    },
    {
      "id": "xua_duoi",
      "wikiBuffId": 47,
      "name": "Xua Đuổi",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giải trừ 1 hiệu quả có lợi",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "xuyen_thau",
      "wikiBuffId": 261,
      "name": "Xuyên Thấu",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sát thương của người sở hữu sẽ bỏ qua một phần phòng thủ của mục tiêu",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/82f643b8-54f6-4e1f-ad27-034ad02a0e51.0fb7c.png",
      "source": "wiki-html"
    },
    {
      "id": "xuyen_thau_2",
      "wikiBuffId": 168,
      "name": "Xuyên Thấu 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Sát thương của người sở hữu sẽ bỏ qua một phần phòng thủ của mục tiêu, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/82f643b8-54f6-4e1f-ad27-034ad02a0e51.0fb7c.png",
      "source": "news+wiki-html"
    },
    {
      "id": "xuyen_thau_2_chuyen_dung_bac_7",
      "wikiBuffId": 315,
      "name": "Xuyên Thấu 2 (Chuyên dụng bậc 7)",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Khi tấn công, gây sát thương bỏ qua X% phòng thủ của mục tiêu. Hiệu quả không thể giải trừ.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "xao_bien",
      "wikiBuffId": 136,
      "name": "Xảo Biến",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi binh lực của mình cao hơn bằng 50%, tăng giá trị hiệu quả 1 tấn công, dưới 50% thì tăng hiệu quả giá trị phòng thủ 2.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/3f4de683-2d0f-4583-9915-eeec4cec5abe.8d0a7.png",
      "source": "news+wiki-html"
    },
    {
      "id": "am_te",
      "wikiBuffId": 7,
      "name": "Ám Tế",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Tướng ở trạng thái BUFF, không thể tăng sĩ khí",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/67b9b697-fafc-4e84-9d0b-8d075cc565d5.8d8ed.png",
      "source": "news+wiki-html"
    },
    {
      "id": "am_van",
      "wikiBuffId": 24,
      "name": "Ám Vân",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Trong trạng thái BUFF này sẽ giảm sĩ khí mỗi lượt.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/162bed67-0f11-4b50-bca5-38025c3ea26a.0f881.png",
      "source": "wiki-html"
    },
    {
      "id": "ap_che",
      "wikiBuffId": 63,
      "name": "Áp Chế",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Gây thêm sát thương lên mục tiêu có phần trăm máu thấp hơn bản thân.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/958083df-03fb-40a7-ac45-59b75487b29d.23f08.png",
      "source": "news+wiki-html"
    },
    {
      "id": "ap_che_2",
      "wikiBuffId": 271,
      "name": "Áp Chế 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Gây sát thương cao hơn cho đơn vị có sinh lực thấp hơn bản thân, không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/958083df-03fb-40a7-ac45-59b75487b29d.23f08.png",
      "source": "wiki-html"
    },
    {
      "id": "ap_uc",
      "wikiBuffId": 32,
      "name": "Áp Ức",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Kỹ năng tăng sĩ khí chỉ tăng một nửa",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/ed071c03-5e86-4b4a-9a6b-5762089013c8.526fb.png",
      "source": "news+wiki-html"
    },
    {
      "id": "am_hon",
      "wikiBuffId": 29,
      "name": "Âm Hồn",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Trong trạng thái BUFF này, sát thương đối với mục tiêu sẽ tăng dần.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d9fc589d-4463-4788-a8f7-0a01e3dccd25.dd42c.png",
      "source": "news+wiki-html"
    },
    {
      "id": "am_hon_2",
      "wikiBuffId": 163,
      "name": "Âm Hồn 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Sát thương gây cho mục tiêu sẽ tăng theo số tầng, không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/d9fc589d-4463-4788-a8f7-0a01e3dccd25.dd42c.png",
      "source": "news+wiki-html"
    },
    {
      "id": "y_chi",
      "wikiBuffId": 112,
      "name": "Ý Chí",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Giảm xác suất bị Sợ Hãi",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/8d192cc6-6421-4570-9f8b-4145fc10b50d.e05ff.png",
      "source": "news+wiki-html"
    },
    {
      "id": "dien_cuong",
      "wikiBuffId": 45,
      "name": "Điên Cuồng",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sát thương gây ra = sát thương kỹ năng + (số BUFF bất lợi kẻ địch đang chịu × X).",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/764865bc-e44a-4cd9-8481-34ca611cc1f8.e8e27.png",
      "source": "news+wiki-html"
    },
    {
      "id": "dien_cuong_2",
      "wikiBuffId": 150,
      "name": "Điên Cuồng 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Khi phát động tấn công, cứ mỗi hiệu ứng giảm lợi trên mục tiêu thì sát thương gây ra lên mục tiêu tăng thêm một tỷ lệ phần trăm nhất định; hiệu ứng này không thể bị giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/764865bc-e44a-4cd9-8481-34ca611cc1f8.e8e27.png",
      "source": "wiki-html"
    },
    {
      "id": "dieu_thong",
      "wikiBuffId": 302,
      "name": "Điều Thống",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Điều chỉnh chỉ số C.Huy; có thể cộng dồn, không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/83a3699d-4e62-48e4-b2f8-8b752a919cfd.024eb.png",
      "source": "wiki-html"
    },
    {
      "id": "dieu_tri",
      "wikiBuffId": 250,
      "name": "Điều Trí",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Hiệu quả điều chỉnh trí, hiệu quả có thể cộng dồn. Không thể giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/83a3699d-4e62-48e4-b2f8-8b752a919cfd.024eb.png",
      "source": "news+wiki-html"
    },
    {
      "id": "dieu_vo",
      "wikiBuffId": 303,
      "name": "Điều Võ",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Điều chỉnh chỉ số Võ; có thể cộng dồn, không thể giải trừ.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/83a3699d-4e62-48e4-b2f8-8b752a919cfd.024eb.png",
      "source": "wiki-html"
    },
    {
      "id": "diep_nhan",
      "wikiBuffId": 130,
      "name": "Điệp Nhẫn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Khi bạn có BUFF này, mỗi khi bạn nhấn một đơn vị, thiệt hại phòng thủ bỏ qua của riêng bạn làm tăng giá trị cố định. Lớp phủ được giới hạn ở giá trị [giá trị hiệu ứng].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/6f4dd358-22ea-4623-b397-3ed19e659689.66722.png",
      "source": "news+wiki-html"
    },
    {
      "id": "doat",
      "wikiBuffId": 189,
      "name": "Đoạt",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Đoạt hiệu quả có lợi của địch, hiệu quả bỏ qua Hư Nhược",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/7a2f0425-0124-4b0a-a9c8-95b24084b088.f6d4e.png",
      "source": "wiki-html"
    },
    {
      "id": "doat_2",
      "wikiBuffId": 172,
      "name": "Đoạt 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Trước mỗi lượt hành động, ăn cắp hiệu ứng có lợi của kẻ thù và chuyển sang chính mình.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/7a2f0425-0124-4b0a-a9c8-95b24084b088.f6d4e.png",
      "source": "news+wiki-html"
    },
    {
      "id": "doat_khi",
      "wikiBuffId": 39,
      "name": "Đoạt Khí",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Đoạt sĩ khí đối phương",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "doat_khi_3",
      "wikiBuffId": 209,
      "name": "Đoạt Khí 3",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Mỗi lượt đoạt Y% sĩ khí từ X mục tiêu địch; bản thân hồi tối đa Z sĩ khí. Không thể giải trừ.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "dao_binh",
      "wikiBuffId": 8,
      "name": "Đào Binh",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Tướng mỗi lượt giảm phần trăm lính nhất định",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/bfa8ccc2-b2bc-4673-b644-b410dcafa32b.4ce57.png",
      "source": "news+wiki-html"
    },
    {
      "id": "dong_bang",
      "wikiBuffId": 41,
      "name": "Đóng Băng",
      "category": "Bất lợi",
      "loai": "bat-loi khong-che",
      "kind": "debuff",
      "desc": "Mỗi lần phóng thích lớp phủ 1 tầng, kẻ thù rơi vào [đóng băng] thêm 1 tầng. Khi cộng dồn trên 3 tầng, tỷ lệ thương tổn tỷ lệ phần trăm binh lực hiện tại được tạo ra tùy thuộc vào số lượng lớp và loại bỏ số lượng lớp.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/2b785986-c0f9-4d38-b055-90c68e9ae779.7a48f.png",
      "source": "news+wiki-html"
    },
    {
      "id": "dong_do",
      "wikiBuffId": 143,
      "name": "Đóng Đô",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Với mỗi buff có lợi, tất cả các lực lượng phòng thủ được gia tăng [giá trị hiệu ứng].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/dcc978cb-0974-475f-bf60-87e8e0cad359.9df39.png",
      "source": "news+wiki-html"
    },
    {
      "id": "dong_do_2",
      "wikiBuffId": 144,
      "name": "Đóng Đô 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Với mỗi buff có lợi, tất cả các lực lượng phòng thủ được gia tăng [giá trị hiệu ứng].",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/dcc978cb-0974-475f-bf60-87e8e0cad359.9df39.png",
      "source": "news+wiki-html"
    },
    {
      "id": "dau_tran_tang_si_khi",
      "wikiBuffId": 111,
      "name": "Đầu trận tăng sĩ khí",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Đầu trận tăng cho mục tiêu 50 sĩ khí",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/7ef92aca-d0e5-4937-abdf-efcc04c71802.e82c4.png",
      "source": "wiki-html"
    },
    {
      "id": "day_si_khi",
      "wikiBuffId": 103,
      "name": "Đầy sĩ khí",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/7ef92aca-d0e5-4937-abdf-efcc04c71802.e82c4.png",
      "source": "wiki-html"
    },
    {
      "id": "de_hon",
      "wikiBuffId": 131,
      "name": "Đế Hồn",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Tăng tỷ lệ phần trăm tấn công và phòng thủ khi các đơn vị trong nước được chỉ định có BUFF này.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/66ae7913-54cd-44ff-92cd-807a1d75b677.f39f6.png",
      "source": "news+wiki-html"
    },
    {
      "id": "de_khang",
      "wikiBuffId": 108,
      "name": "Đề Kháng",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Chống đỡ sát thương dựa trên [giá trị hiệu quả] binh lực tối đa, có thể cộng dồn, tối đa [giá trị hiệu quả] lớn nhất.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/e08b0593-37d3-46f3-a372-f736b5e94952.354a8.png",
      "source": "news+wiki-html"
    },
    {
      "id": "de_khang_2",
      "wikiBuffId": 308,
      "name": "Đề Kháng 2",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Nhận 1 Hộ Thuẫn chống đỡ sát thương theo tỉ lệ sinh lực tối đa",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "do_luc",
      "wikiBuffId": 275,
      "name": "Đồ Lục",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Toàn phe ta tăng sát thương kỹ năng, không thể giải trừ.",
      "icon": null,
      "source": "wiki-html"
    },
    {
      "id": "don_dien",
      "wikiBuffId": 159,
      "name": "Đồn Điền",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "BUFF có lợi, không có tác dụng trực tiếp — chờ một buff khác kích hoạt.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/bba947b6-2b81-4ee8-9a05-9260f3366032.b73a4.png",
      "source": "news+wiki-html"
    },
    {
      "id": "do_hiem",
      "wikiBuffId": 158,
      "name": "Độ Hiểm",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Trước khi lượt bắt đầu, nếu bản thân không bị thương, tăng tất cả sức mạnh tấn công của X.",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/0e0c73c6-b0f1-46f6-8529-ce7580cd9c9d.c634a.png",
      "source": "news+wiki-html"
    },
    {
      "id": "do_hiem_2",
      "wikiBuffId": 191,
      "name": "Độ Hiểm 2",
      "category": "Không thể giải trừ",
      "loai": "trung-lap",
      "kind": "unremovable",
      "desc": "Trước khi lượt tiếp theo bắt đầu, nếu bản thân không bị thương tổn, tăng lên tất cả lực tấn công của X, hiệu quả này không thể bị giải trừ",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/0e0c73c6-b0f1-46f6-8529-ce7580cd9c9d.c634a.png",
      "source": "news+wiki-html"
    },
    {
      "id": "doc_ke",
      "wikiBuffId": 164,
      "name": "Độc Kế",
      "category": "Bất lợi",
      "loai": "bat-loi",
      "kind": "debuff",
      "desc": "Khi có BUFF này, sát thương của kẻ thù giảm đi [Giá trị] với mỗi X buff bất lợi trên kể thù",
      "icon": "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/c0bc1eb6-a1b5-475f-847c-456742a1c696.99608.png",
      "source": "news+wiki-html"
    },
    {
      "id": "an_nap_chuyen_dung_bac_7",
      "wikiBuffId": 314,
      "name": "Ẩn Nấp (Chuyên dụng bậc 7)",
      "category": "Có lợi",
      "loai": "co-loi",
      "kind": "buff",
      "desc": "Sát thương cuối cùng phải chịu giảm X% (Xé tránh cuối)",
      "icon": null,
      "source": "wiki-html"
    }
  ],
  "stats": {
    "engineCount": 10,
    "wikiCount": 327,
    "fromNews": 176,
    "fromWikiHtml": 320,
    "fromWikiMd": 0
  }
}};})(window);
