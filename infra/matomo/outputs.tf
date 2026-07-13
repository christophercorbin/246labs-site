output "elastic_ip" {
  value       = aws_eip.matomo.public_ip
  description = "Add an A record: analytics.246labs.cloud -> this IP (management Route 53 zone)"
}
output "analytics_hostname" { value = var.analytics_hostname }
output "instance_id" { value = aws_instance.matomo.id }
output "backup_bucket" { value = aws_s3_bucket.backups.bucket }
