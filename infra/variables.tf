variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  type    = string
  default = "personal-246labs"
}

variable "github_owner" {
  type        = string
  description = "GitHub account/org that owns the repo (scopes the OIDC deploy-role trust)"
}

variable "github_repo" {
  type        = string
  default     = "246labs-site"
  description = "Repo name; scopes the OIDC deploy-role trust to this repo on refs/heads/main"
}

variable "amplify_app_id" {
  type        = string
  description = "ID of the Amplify app (created + GitHub-App-connected in the console); the deploy role is scoped to this app's ARN"
}

variable "ses_identity_arn" {
  type        = string
  description = "ARN of the verified SES identity the Amplify compute role may send from"
  default     = "arn:aws:ses:us-east-1:687159379702:identity/246labs.cloud"
}
