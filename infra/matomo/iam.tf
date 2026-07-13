data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}
resource "aws_iam_role" "matomo" {
  name               = "matomo-instance"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}
# SSM Session Manager access (replaces SSH).
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.matomo.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
# Write-only-ish access to the backup bucket + read the SSM params it writes.
data "aws_iam_policy_document" "matomo_inline" {
  statement {
    sid       = "Backups"
    actions   = ["s3:PutObject", "s3:ListBucket"]
    resources = [aws_s3_bucket.backups.arn, "${aws_s3_bucket.backups.arn}/*"]
  }
  statement {
    sid       = "SsmParams"
    actions   = ["ssm:PutParameter", "ssm:GetParameter"]
    resources = ["arn:aws:ssm:${var.aws_region}:*:parameter/matomo/*"]
  }
}
resource "aws_iam_role_policy" "matomo" {
  name   = "matomo-inline"
  role   = aws_iam_role.matomo.id
  policy = data.aws_iam_policy_document.matomo_inline.json
}
resource "aws_iam_instance_profile" "matomo" {
  name = "matomo-instance"
  role = aws_iam_role.matomo.name
}
