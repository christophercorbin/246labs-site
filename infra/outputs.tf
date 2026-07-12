output "deploy_role_arn" {
  value       = aws_iam_role.deploy.arn
  description = "Role ARN for the GitHub Actions AWS_DEPLOY_ROLE_ARN variable"
}

output "amplify_compute_role_arn" {
  value       = aws_iam_role.amplify_compute.arn
  description = "Attach to the console-created Amplify app as its compute/service role (grants SSR runtime ses:SendEmail)"
}

output "amplify_app_arn" {
  value       = local.amplify_app_arn
  description = "ARN the deploy role is scoped to (from var.amplify_app_id)"
}
