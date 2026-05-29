package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"kura-safi/models"
)

func GetVoterProfile(c *gin.Context) {
	userId, _ := c.Get("userId")
	var user models.User
	if err := models.DB.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id": user.ID, "fullName": user.FullName,
		"nationalId": user.NationalID, "role": user.Role,
		"walletAddress": user.WalletAddress,
	})
}

func GetElections(c *gin.Context) {
	// Placeholder — actual election data lives on-chain
	c.JSON(http.StatusOK, gin.H{"message": "Fetch elections from smart contract on frontend"})
}

func GetElection(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "Fetch election " + id + " from smart contract on frontend"})
}

func GetAdminStats(c *gin.Context) {
	var voterCount, candidateCount int64
	models.DB.Model(&models.User{}).Where("role = ?", "voter").Count(&voterCount)
	models.DB.Model(&models.User{}).Where("role = ?", "candidate").Count(&candidateCount)
	c.JSON(http.StatusOK, gin.H{
		"voters":     voterCount,
		"candidates": candidateCount,
	})
}

func UploadCandidatePhoto(c *gin.Context) {
	file, err := c.FormFile("photo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "No file uploaded"})
		return
	}

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("candidate_%d%s", time.Now().UnixNano(), ext)
	dst := "./uploads/" + filename

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Upload failed"})
		return
	}

	url := "/uploads/" + filename
	c.JSON(http.StatusOK, gin.H{"url": url, "filename": filename})
}
