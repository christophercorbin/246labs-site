variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  type    = string
  default = "personal-246labs"
}

variable "github_owner" {
  type = string
}

variable "github_repo" {
  type    = string
  default = "246labs-site"
}

variable "github_access_token" {
  type      = string
  sensitive = true
}

variable "ses_region" {
  type    = string
  default = "us-east-1"
}

variable "ses_sender" {
  type    = string
  default = "no-reply@246labs.cloud"
}

variable "ses_recipient" {
  type    = string
  default = "hello@246labs.cloud"
}

variable "ses_identity_arn" {
  type        = string
  description = "ARN of the verified SES identity the compute role may send from"
  default     = "arn:aws:ses:us-east-1:687159379702:identity/246labs.cloud"
}
