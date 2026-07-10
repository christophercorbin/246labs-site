output "amplify_app_id" {
  value = aws_amplify_app.site.id
}

output "amplify_default_domain" {
  value = aws_amplify_app.site.default_domain
}

output "deploy_role_arn" {
  value = aws_iam_role.deploy.arn
}

output "amplify_compute_role_arn" {
  value = aws_iam_role.amplify_compute.arn
}
