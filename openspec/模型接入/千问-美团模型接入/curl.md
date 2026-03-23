
**图片生成**
```
curl --location --request POST 'https://aigc.sankuai.com/v1/openai/native/chat/completions' \
--header 'Authorization: Bearer 21927641732066459710' \
--header 'User-Agent: Apifox/1.0.0 (https://apifox.com)' \
--header 'Content-Type: application/json' \
--data-raw '{
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "2D日式动漫风格，骑士角色的躯干部件（含银色盔甲、红白色披风上半部分），无头部/四肢，纯白背景，透明通道，高细节还原盔甲纹理和金属质感，适配2D骨骼动画拆分，PNG格式，保持原有配色和画风"
                }
            ]
        }
    ],
    "model": "Qwen-Image-Meituan",
    "num_inference_steps": 50,
    "aspect_ratio": "16:9",
    "guidance_scale": 4.0,
    "seed": 42
}'
```

**图片编辑**
```
curl --location 'https://aigc.sankuai.com/v1/openai/native/chat/completions' \
  --header 'Authorization: Bearer 21927641732066459710' \
  --header 'Content-Type: application/json' \
  --data '{
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "把墙的颜色改成紫色，背景加上闪光灯效果"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "http://p1.meituan.net/bizhorus/17f35cc5a1ab81cecd5b5e443624088b416914.png"
            }
          }
        ]
      }
    ],
    "model": "Qwen-Image-Edit-Meituan",
    "num_inference_steps": 50,
    "guidance_scale": 4.0,
    "seed": "42"
  }'

```

**复杂推理**
```
curl --location 'https://aigc.sankuai.com/v1/openai/native/chat/completions' \
--header 'Authorization: Bearer 21927641732066459710' \
--header 'Content-Type: application/json' \
--data '{
"model": "QwQ-32B-Friday",
"max_tokens": 4096,
"stream": false,
"temperature": 0.0,
"messages": [
{
"role": "user",
"content": "hello"
}
]
}'
```