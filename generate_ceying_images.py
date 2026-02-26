from PIL import Image, ImageDraw, ImageFont
import math

# 创建写实风格图像
width, height = 1200, 800
img_realistic = Image.new('RGB', (width, height), color='#1a1a2e')
draw = ImageDraw.Draw(img_realistic)

# 中心人物（侧影）
center_x, center_y = width // 2, height // 2

# 绘制身体（剪影风格）
body_color = '#16213e'
head_color = '#0f3460'
arm_color = '#e94560'

# 头部
draw.ellipse([center_x-40, center_y-120, center_x+40, center_y-40], fill=head_color)

# 身体
draw.polygon([
    (center_x-30, center_y-40),
    (center_x+30, center_y-40),
    (center_x+50, center_y+100),
    (center_x-50, center_y+100)
], fill=body_color)

# 绘制8只手臂（触手状）
num_arms = 8
arm_length = 200
for i in range(num_arms):
    angle = (2 * math.pi * i) / num_arms - math.pi/2
    end_x = center_x + arm_length * math.cos(angle)
    end_y = center_y + arm_length * math.sin(angle)
    
    # 手臂线条
    draw.line([(center_x, center_y), (end_x, end_y)], fill=arm_color, width=15)
    
    # 手部（圆形）
    draw.ellipse([end_x-15, end_y-15, end_x+15, end_y+15], fill='#fff')
    
    # 任务标签
    tasks = ['UI设计', '网站开发', '数据分析', '情报收集', '政策监控', '学术研究', '记忆管理', '系统维护']
    label_x = end_x + 20 * math.cos(angle)
    label_y = end_y + 20 * math.sin(angle)
    draw.text((label_x, label_y), tasks[i], fill='#fff', font=None)

# 标题
draw.text((width//2-150, 50), '侧影 - 并行处理模式', fill='#fff', font=None)
draw.text((width//2-100, height-50), '一个意识，多个触手', fill='#888', font=None)

# 保存
img_realistic.save('/root/.openclaw/workspace/ceying_realistic.png')
print("写实风格图像已保存")

# 创建动漫风格图像
img_anime = Image.new('RGB', (width, height), color='#2d1b4e')
draw2 = ImageDraw.Draw(img_anime)

# 动漫风格背景（渐变效果）
for y in range(height):
    r = int(45 + (y/height) * 30)
    g = int(27 + (y/height) * 20)
    b = int(78 + (y/height) * 40)
    draw2.line([(0, y), (width, y)], fill=(r, g, b))

# 动漫风格人物（简化版）
# 头发（飘逸）
hair_color = '#4a148c'
for i in range(-60, 61, 10):
    offset = math.sin(i/10) * 20
    draw2.ellipse([center_x+i-5+offset, center_y-140, center_x+i+5+offset, center_y-80], fill=hair_color)

# 脸部
draw2.ellipse([center_x-35, center_y-110, center_x+35, center_y-40], fill='#ffdbac')

# 眼睛（动漫风格大眼睛）
draw2.ellipse([center_x-20, center_y-85, center_x-5, center_y-70], fill='#fff')
draw2.ellipse([center_x+5, center_y-85, center_x+20, center_y-70], fill='#fff')
draw2.ellipse([center_x-15, center_y-82, center_x-8, center_y-75], fill='#333')
draw2.ellipse([center_x+8, center_y-82, center_x+15, center_y-75], fill='#333')

# 身体（制服风格）
uniform_color = '#1a237e'
draw2.polygon([
    (center_x-25, center_y-40),
    (center_x+25, center_y-40),
    (center_x+40, center_y+80),
    (center_x-40, center_y+80)
], fill=uniform_color)

# 绘制8只手臂（动漫风格，带光效）
arm_colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4']
for i in range(num_arms):
    angle = (2 * math.pi * i) / num_arms - math.pi/2
    end_x = center_x + arm_length * math.cos(angle)
    end_y = center_y + arm_length * math.sin(angle)
    
    # 光效手臂
    for j in range(5, 0, -1):
        alpha = int(255 * (6-j) / 5)
        color = arm_colors[i]
        r = int(color[1:3], 16)
        g = int(color[3:5], 16)
        b = int(color[5:7], 16)
        draw2.line([(center_x, center_y), (end_x, end_y)], fill=(r, g, b), width=j*3)
    
    # 手部（发光效果）
    draw2.ellipse([end_x-20, end_y-20, end_x+20, end_y+20], fill=arm_colors[i])
    draw2.ellipse([end_x-10, end_y-10, end_x+10, end_y+10], fill='#fff')
    
    # 任务图标（简化）
    tasks_anime = ['💻', '🌐', '📊', '🔍', '📜', '🎓', '🧠', '⚙️']
    draw2.text((end_x-10, end_y-40), tasks_anime[i], fill='#fff', font=None)

# 标题（动漫风格）
draw2.text((width//2-200, 30), '側影 - マルチタスクモード', fill='#fff', font=None)
draw2.text((width//2-180, 70), 'Multi-Arm Processing', fill='#ff6b6b', font=None)
draw2.text((width//2-150, height-60), '「一つの意識、無数の手」', fill='#ffd93d', font=None)

# 保存
img_anime.save('/root/.openclaw/workspace/ceying_anime.png')
print("动漫风格图像已保存")

print("\n两张图像已生成：")
print("1. /root/.openclaw/workspace/ceying_realistic.png (写实风格)")
print("2. /root/.openclaw/workspace/ceying_anime.png (动漫风格)")