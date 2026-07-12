resource "aws_amplify_app" "site" {
  name                 = "246labs-site"
  repository           = "https://github.com/${var.github_owner}/${var.github_repo}"
  access_token         = var.github_access_token
  platform             = "WEB_COMPUTE"
  iam_service_role_arn = aws_iam_role.amplify_compute.arn
  build_spec           = file("${path.module}/../amplify.yml")

  environment_variables = {
    SES_REGION                = var.ses_region
    SES_SENDER                = var.ses_sender
    SES_RECIPIENT             = var.ses_recipient
    AMPLIFY_MONOREPO_APP_ROOT = "web"
  }
}

resource "aws_amplify_branch" "main" {
  app_id            = aws_amplify_app.site.id
  branch_name       = "main"
  enable_auto_build = false
  stage             = "PRODUCTION"
  framework         = "Next.js - SSR"
}
