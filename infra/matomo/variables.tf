variable "aws_region" {
  type    = string
  default = "us-east-1"
}
variable "aws_profile" {
  type    = string
  default = "personal-246labs"
}
variable "instance_type" {
  type    = string
  default = "t4g.small"
}
variable "analytics_hostname" {
  type    = string
  default = "analytics.246labs.cloud"
}
variable "data_volume_gb" {
  type    = number
  default = 20
}
variable "backup_retention_days" {
  type    = number
  default = 30
}
