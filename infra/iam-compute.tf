data "aws_iam_policy_document" "amplify_compute_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["amplify.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "amplify_compute" {
  name               = "amplify-246labs-compute"
  assume_role_policy = data.aws_iam_policy_document.amplify_compute_trust.json
}

data "aws_iam_policy_document" "amplify_ses" {
  statement {
    effect    = "Allow"
    actions   = ["ses:SendEmail", "ses:SendRawEmail"]
    resources = [var.ses_identity_arn]
  }
}

resource "aws_iam_role_policy" "amplify_ses" {
  name   = "ses-send"
  role   = aws_iam_role.amplify_compute.id
  policy = data.aws_iam_policy_document.amplify_ses.json
}
