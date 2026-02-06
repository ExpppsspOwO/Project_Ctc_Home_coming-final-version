# ใช้ NodeJS เวอร์ชั่น LTS ที่เป็น Alpine (ขนาดเล็ก)
FROM node:20-alpine

# กำหนด Working directory ภายใน Container
WORKDIR /app

# Copy ไฟล์ package.json และ package-lok.json
COPY package*.json ./

#ติดตั้ง Dependencies
RUN npm install

# Copy โค้ดทั้งหมดในโปรเจกต์เข้ามาใน Container
COPY . .

# บอกให้ Docker รู้ว่า Container จะใช้ Port 5000
EXPOSE 5000

# คำสั่งที่จะรันเมื่อ Container เริ่มทำงาน
CMD [ "npm","run","dev" ]