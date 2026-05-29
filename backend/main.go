package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"kura-safi/handlers"
	"kura-safi/middleware"
	"kura-safi/models"
)

func main() {
	godotenv.Load()

	models.InitDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Static uploads
	r.Static("/uploads", "./uploads")
	os.MkdirAll("./uploads", 0755)

	api := r.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.RegisterVoter)
			auth.POST("/register/candidate", handlers.RegisterCandidate)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/voter/profile", handlers.GetVoterProfile)
			protected.GET("/elections", handlers.GetElections)
			protected.GET("/elections/:id", handlers.GetElection)

			// Admin only
			admin := protected.Group("/admin")
			admin.Use(middleware.RoleMiddleware("admin"))
			{
				admin.GET("/stats", handlers.GetAdminStats)
				admin.POST("/upload-photo", handlers.UploadCandidatePhoto)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Kura Safi backend running on :%s", port)
	r.Run(":" + port)
}
