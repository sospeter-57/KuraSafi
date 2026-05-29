package models

import "golang.org/x/crypto/bcrypt"

func HashPin(pin string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(pin), bcrypt.DefaultCost)
	return string(b), err
}

func CheckPin(pin, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(pin)) == nil
}
