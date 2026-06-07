package handlers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"kura-safi/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type LoginInput struct {
	NationalID    string `json:"nationalId"`
	Username      string `json:"username"`
	Password      string `json:"password"`
	Role          string `json:"role"`
	WalletAddress string `json:"walletAddress"`
}

type RegisterInput struct {
	FullName      string `json:"fullName"`
	NationalID    string `json:"nationalId"`
	WalletAddress string `json:"walletAddress"`
	Role          string `json:"role"`
	Party         string `json:"party"`
	BiometricHash string `json:"biometricHash"`
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	// Determine identifier
	id := input.NationalID
	if input.Role == "admin" && input.Username != "" {
		id = input.Username
	}

	var user models.User
	query := models.DB.Where("national_id = ?", id)
	if input.Role == "admin" {
		query = query.Where("role = ?", input.Role)
	} else {
		query = query.Where("role LIKE ?", "%"+input.Role+"%")
	}
	if err := query.First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "User not found"})
		return
	}

	// For voter and candidate logins, verify wallet when provided. Otherwise allow ID-only login.
	if input.Role == "voter" || input.Role == "candidate" {
		if input.WalletAddress != "" && strings.ToLower(user.WalletAddress) != "" {
			if strings.ToLower(input.WalletAddress) != strings.ToLower(user.WalletAddress) {
				c.JSON(http.StatusUnauthorized, gin.H{"message": "Wallet mismatch or not connected"})
				return
			}
		}
	} else {
		if !models.CheckPin(input.Password, user.PinHash) {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
			return
		}
	}

	token, err := generateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Token error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id": user.ID, "fullName": user.FullName,
			"nationalId": user.NationalID, "role": user.Role,
			"walletAddress": user.WalletAddress, "party": user.Party,
		},
	})
}

func RegisterVoter(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	var existing models.User
	if models.DB.Where("national_id = ?", input.NationalID).First(&existing).Error == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "National ID already registered"})
		return
	}

	user := models.User{
		FullName: input.FullName, NationalID: input.NationalID,
		WalletAddress: input.WalletAddress, Role: "voter", BiometricHash: input.BiometricHash,
	}
	if err := models.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Registration failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Voter registered successfully"})
}

func RegisterCandidate(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	var existing models.User
	err := models.DB.Where("national_id = ?", input.NationalID).First(&existing).Error
	if err == nil {
		if strings.Contains(existing.Role, "candidate") {
			c.JSON(http.StatusConflict, gin.H{"message": "National ID already registered as candidate"})
			return
		}
		existing.Role = "candidate,voter"
		existing.Party = input.Party
		existing.WalletAddress = input.WalletAddress
		existing.BiometricHash = input.BiometricHash
		if err := models.DB.Save(&existing).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Candidate promotion failed"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Candidate promoted to candidate and voter successfully"})
		return
	}

	if err != nil && !strings.Contains(err.Error(), "record not found") {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Registration failed"})
		return
	}

	user := models.User{
		FullName: input.FullName, NationalID: input.NationalID,
		WalletAddress: input.WalletAddress, Role: "candidate,voter",
		Party: input.Party, BiometricHash: input.BiometricHash,
	}
	if err := models.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Registration failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Candidate registered successfully"})
}

func generateToken(user models.User) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "kura_safi_secret_change_in_prod"
	}
	claims := jwt.MapClaims{
		"userId": user.ID, "role": user.Role,
		"nationalId": user.NationalID,
		"exp":        time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
