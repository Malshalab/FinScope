from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

class Register(BaseModel):
    full_name: str = Field(..., alias="fullName")
    email: EmailStr
    password: str

class Login(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str="bearer"
