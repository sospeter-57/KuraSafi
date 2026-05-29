package models

import (
	"log"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

type User struct {
	gorm.Model
	FullName      string `json:"fullName"`
	NationalID    string `json:"nationalId" gorm:"uniqueIndex"`
	WalletAddress string `json:"walletAddress"`
	Role          string `json:"role"` // admin | voter | candidate
	Party         string `json:"party"`
	BiometricHash string `json:"biometricHash"`
	PinHash       string `json:"-"`
	PhotoURL      string `json:"photoUrl"`
}

func InitDB() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./kura_safi.db"
	}

	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	DB.AutoMigrate(&User{})

	// Seed admin if not exists
	var admin User
	if DB.Where("role = ?", "admin").First(&admin).Error != nil {
		hash, _ := HashPin("admin1234")
		DB.Create(&User{
			FullName:   "System Admin",
			NationalID: "ADMIN001",
			Role:       "admin",
			PinHash:    hash,
		})
		log.Println("Default admin created — ID: ADMIN001, PIN: admin1234")
	}

	log.Println("Database initialized")
}
