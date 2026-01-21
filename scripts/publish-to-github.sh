# 一键发布到GitHub脚本

echo "=========================================="
echo "  Football Manager Game 发布工具"
echo "=========================================="
echo ""

# 检查是否是git仓库
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是git仓库"
    echo "   请先运行：git init"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告：存在未提交的更改"
    echo "   请先提交所有更改："
    echo "   git add ."
    echo "   git commit -m 'your message'"
    echo ""
    echo "继续发布？(y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "已取消"
        exit 0
    fi
fi

# 检查远程仓库配置
REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE" ]; then
    echo "❌ 错误：未配置远程仓库"
    echo ""
    echo "请按以下步骤配置："
    echo "=========================================="
    echo ""
    echo "步骤1：创建GitHub仓库"
    echo "   1. 访问 https://github.com/new"
    echo "   2. Repository name: football-manager-game（推荐）"
    echo "   3. Visibility: Public（公开）或 Private（私有）"
    echo "   4. 不要勾选 'Initialize repository'"
    echo "   5. 点击 'Create repository'"
    echo ""
    echo "步骤2：选择认证方式"
    echo ""
    echo "   方式A（HTTPS - 新手推荐）："
    echo "   git remote set-url origin https://github.com/YOUR_USERNAME/football-manager-game.git"
    echo ""
    echo "   方式B（SSH - 推荐，更安全）："
    echo "   a. 生成SSH密钥"
    echo "      ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'"
    echo "   b. 复制公钥：cat ~/.ssh/id_rsa.pub"
    echo "   c. 在GitHub添加：Settings > SSH and GPG keys > New SSH key"
    echo "   d. 配置远程："
    echo "      git remote set-url origin git@github.com:YOUR_USERNAME/football-manager-game.git"
    echo ""
    echo "步骤3：推送代码"
    echo ""
    echo "git push -u origin main"
    echo ""
    echo "=========================================="
    exit 0
fi

echo "✅ Git配置检查通过"
echo "远程仓库：$REMOTE"
echo ""

# 显示当前分支
BRANCH=$(git branch --show-current)
echo "当前分支：$BRANCH"
echo ""

# 推送到GitHub
echo "=========================================="
echo "正在推送到GitHub..."
echo "=========================================="
echo ""

git push -u origin $BRANCH

PUSH_STATUS=$?
if [ $PUSH_STATUS -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ 推送成功！"
    echo "=========================================="
    echo ""
    echo "你的代码已成功推送到GitHub！"
    echo ""
    echo "访问你的仓库："
    echo "https://github.com/YOUR_USERNAME/football-manager-game"
    echo ""
    echo "下一步："
    echo "  1. 在GitHub仓库页面添加项目描述"
    echo "  2. 添加README.md和LICENSE文件"
    echo "  3. 设置GitHub Pages（如果需要）"
    echo "  4. 配置GitHub Actions CI/CD"
    echo ""
    echo "详细发布指南请查看："
    echo "  PUBLISHING_GUIDE.md"
    echo ""
else
    echo ""
    echo "❌ 推送失败"
    echo "=========================================="
    echo "错误代码：$PUSH_STATUS"
    echo ""
    echo "常见问题："
    echo "  1. 认证失败 - 检查SSH密钥或GitHub token"
    echo "  2. 网络问题 - 检查网络连接"
    echo "  3. 权限问题 - 确认你有推送到目标仓库的权限"
    echo ""
    echo "解决方法："
    echo "  git remote -v  # 查看远程仓库详细信息"
    echo "  git config --global user.name 'Your Name'  # 配置用户名"
    echo "  git config --global user.email 'your_email@example.com'  # 配置邮箱"
    echo ""
    exit 1
fi
