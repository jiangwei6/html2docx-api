# 使用官方Node.js镜像
FROM node:18-alpine

# 安装系统依赖，包括Pandoc
RUN apk add --no-cache \
    pandoc \
    texlive \
    texlive-xetex \
    fontconfig \
    ttf-dejavu

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装Node.js依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p uploads output

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["npm", "start"] 