.PHONY: db-up db-down api mobile

db-up:
	docker compose up -d

db-down:
	docker compose down

api:
	cd api && go run ./cmd/server

mobile:
	cd mobile && npx expo start

web:
	cd mobile && npm run web
