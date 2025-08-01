# =============================================
# 1. 빌드 단계 (Builder Stage)
# =============================================
# Node.js 18-alpine 버전을 빌드 환경의 베이스 이미지로 사용
FROM node:18-alpine AS builder

WORKDIR /app

# OpenSSL 레거시 공급자를 활성화하여 Node.js 18의 빌드 오류 해결
ENV NODE_OPTIONS=--openssl-legacy-provider 
# package.json과 yarn.lock 파일을 먼저 복사하여 의존성 변경 시에만 재설치하도록 함
COPY package.json ./
COPY yarn.lock ./

# 의존성 설치
RUN yarn install

# 나머지 소스 코드 전체 복사
COPY . .

# 리액트 앱 프로덕션 빌드 실행
# 기존 코드
# RUN yarn build

# 수정 코드: CI=false 를 앞에 추가
RUN CI=false yarn build

# =============================================
# 2. 최종 실행 단계 (Production Stage)
# =============================================
# 가벼운 웹서버인 Nginx를 실행 환경의 베이스 이미지로 사용
FROM nginx:alpine

# 빌드 단계(builder)의 빌드 결과물(/app/build)을
# Nginx의 기본 HTML 폴더로 복사
COPY --from=builder /app/build /usr/share/nginx/html

# 80번 포트를 외부에 개방
EXPOSE 80

# 컨테이너 실행 시 Nginx 서버를 포어그라운드에서 실행
CMD ["nginx", "-g", "daemon off;"]