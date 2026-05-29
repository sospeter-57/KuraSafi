package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Authorization required"})
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(header, "Bearer ")
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "kura_safi_secret_change_in_prod"
		}

		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid claims"})
			c.Abort()
			return
		}

		c.Set("userId", claims["userId"])
		c.Set("role", claims["role"])
		c.Set("nationalId", claims["nationalId"])
		c.Next()
	}
}

func RoleMiddleware(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, _ := c.Get("role")
		if userRole != role {
			c.JSON(http.StatusForbidden, gin.H{"message": "Access denied"})
			c.Abort()
			return
		}
		c.Next()
	}
}
