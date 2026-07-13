package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/vakarchukiv/grace/api/internal/config"
	"github.com/vakarchukiv/grace/api/internal/db"
	"github.com/vakarchukiv/grace/api/internal/handler"
	"github.com/vakarchukiv/grace/api/internal/middleware"
	"github.com/vakarchukiv/grace/api/internal/repository"
)

func main() {
	loadEnv()
	cfg := config.Load()
	ctx := context.Background()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer pool.Close()

	candidates := []string{
		filepath.Join("..", "..", "db", "migrations"),
		filepath.Join("..", "db", "migrations"),
		filepath.Join("db", "migrations"),
	}
	var migrationsDir string
	for _, dir := range candidates {
		if _, err := os.Stat(dir); err == nil {
			migrationsDir = dir
			break
		}
	}
	if migrationsDir == "" {
		log.Fatal("migrations dir not found")
	}
	if err := db.Migrate(ctx, pool, migrationsDir); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	repo := repository.New(pool)
	h := handler.New(repo, cfg.JWTSecret)

	r := chi.NewRouter()
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/health", h.Health)

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", h.Register)
		r.Post("/auth/login", h.Login)

		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(cfg.JWTSecret))

			r.Get("/me", h.Me)
			r.Get("/reminders/upcoming", h.UpcomingReminders)

			r.Route("/plants", func(r chi.Router) {
				r.Get("/", h.ListPlants)
				r.Post("/", h.CreatePlant)
				r.Get("/{id}", h.GetPlant)
				r.Put("/{id}", h.UpdatePlant)
				r.Delete("/{id}", h.DeletePlant)

				r.Get("/{id}/care-logs", h.ListCareLogs)
				r.Post("/{id}/care-logs", h.CreateCareLog)

				r.Get("/{id}/reminders", h.ListReminders)
				r.Post("/{id}/reminders", h.CreateReminder)
			})
		})
	})

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	go func() {
		log.Printf("server listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("shutdown: %v", err)
	}
}

func loadEnv() {
	candidates := []string{
		".env",
		"../.env",
		"../../.env",
	}
	for _, path := range candidates {
		if err := godotenv.Load(path); err == nil {
			log.Printf("loaded env from %s", path)
			return
		}
	}
}
