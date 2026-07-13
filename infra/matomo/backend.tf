terraform {
  backend "s3" {
    bucket         = "tf-state-246labs-687159379702"
    key            = "matomo/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "tf-locks-246labs"
    encrypt        = true
  }
}
